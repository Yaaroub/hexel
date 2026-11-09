import {getDb,transaction,clientView,serviceView,appointmentView,orderView,getSettings} from './business-db.js';
import {appError,verifyPassword} from './business-auth.js';
import {thread,removeTicketFiles} from './tickets.js';

// DSGVO Art. 15/20: everything stored for this account, in a portable format.
export function exportAccount(account){
 const db=getDb(),orgId=account.organization.id;
 const org=db.prepare('SELECT * FROM organizations WHERE id=?').get(orgId);
 const user=db.prepare('SELECT id,name,email,created_at,last_login_at FROM users WHERE id=?').get(account.user.id);
 const tickets=db.prepare('SELECT * FROM support_tickets WHERE organization_id=? ORDER BY created_at').all(orgId).map(row=>{let payload={};try{payload=JSON.parse(row.payload)}catch{}const t=thread(row.id);return {id:row.id,...payload,status:row.status,priority:row.priority,createdAt:row.created_at,updatedAt:row.updated_at,messages:t.messages.map(({author,body,createdAt})=>({author,body,createdAt})),attachments:t.attachments.map(({filename,size,createdAt})=>({filename,size,createdAt}))}});
 return {
  exportedAt:new Date().toISOString(),
  notice:'Diese Datei enthält alle Daten, die FUNKNAHT zu Ihrem Konto speichert. Passwörter liegen nur als nicht umkehrbarer Hash vor und sind nicht enthalten.',
  user:{name:user.name,email:user.email,createdAt:new Date(user.created_at).toISOString(),lastLoginAt:user.last_login_at?new Date(user.last_login_at).toISOString():null},
  organization:{name:org.name,type:org.account_type,bookingAddress:org.slug,plan:org.plan,billingStatus:org.billing_status,settings:getSettings(org),createdAt:new Date(org.created_at).toISOString()},
  clients:db.prepare('SELECT * FROM clients WHERE organization_id=?').all(orgId).map(clientView),
  services:db.prepare('SELECT * FROM services WHERE organization_id=?').all(orgId).map(serviceView),
  appointments:db.prepare('SELECT * FROM appointments WHERE organization_id=?').all(orgId).map(appointmentView),
  orders:db.prepare('SELECT * FROM orders WHERE organization_id=?').all(orgId).map(orderView),
  supportRequests:tickets,
  devices:db.prepare('SELECT kind,label,vendor,model,location,serial,firmware,installed_on,warranty_until,notes FROM devices WHERE organization_id=?').all(orgId),
  documents:db.prepare("SELECT number,type,status,issued_on,items FROM documents WHERE organization_id=? AND status<>'entwurf'").all(orgId).map(d=>({...d,items:JSON.parse(d.items)})),
  familyAccess:db.prepare('SELECT label,created_at,accepted_at FROM account_links WHERE organization_id=?').all(orgId),
  aiUsage:db.prepare('SELECT period,count FROM ai_usage WHERE organization_id=? ORDER BY period').all(orgId),
 };
}

// DSGVO Art. 17: remove the account and every record that belongs to it.
export async function deleteAccount(account,{password,confirmation}){
 if(confirmation!=='LÖSCHEN')throw appError('Bitte bestätigen Sie die Löschung mit dem Wort LÖSCHEN.');
 const db=getDb(),row=db.prepare('SELECT password_hash FROM users WHERE id=?').get(account.user.id);
 if(typeof password!=='string'||password.length>256||!(await verifyPassword(password,row?.password_hash)))throw appError('Das Passwort stimmt nicht.',401,'INVALID_CREDENTIALS');
 const org=db.prepare('SELECT billing_subscription_id,billing_status FROM organizations WHERE id=?').get(account.organization.id);
 if(org?.billing_subscription_id&&!['canceled','incomplete_expired','none'].includes(org.billing_status))throw appError('Bitte kündigen Sie zuerst Ihr laufendes Abonnement unter „Tarif & Abrechnung“. Danach können Sie das Konto löschen.',409,'SUBSCRIPTION_ACTIVE');
 const orgId=account.organization.id;
 // Anfragen, die diese Person für Angehörige gestellt hat, bleiben bei den Angehörigen.
 const handBack=tx=>{for(const t of tx.prepare('SELECT id,organization_id FROM support_tickets WHERE user_id IN (SELECT id FROM users WHERE organization_id=?) AND organization_id<>?').all(orgId,orgId)){const owner=tx.prepare('SELECT id FROM users WHERE organization_id=? ORDER BY created_at LIMIT 1').get(t.organization_id);if(owner)tx.prepare('UPDATE support_tickets SET user_id=? WHERE id=?').run(owner.id,t.id)}};
 const role=account.user.role||'inhaber';
 const others=db.prepare("SELECT COUNT(*) AS n FROM users WHERE organization_id=? AND id<>? AND role='inhaber'").get(orgId,account.user.id).n;
 if(role!=='inhaber'||others>0){
  // Mitarbeiter (oder ein weiterer Inhaber) löschen nur ihren eigenen Zugang; der Betrieb bleibt bestehen.
  transaction(tx=>{const keep=tx.prepare("SELECT id FROM users WHERE organization_id=? AND id<>? ORDER BY CASE role WHEN 'inhaber' THEN 0 ELSE 1 END,created_at LIMIT 1").get(orgId,account.user.id);tx.prepare('UPDATE support_tickets SET user_id=? WHERE user_id=?').run(keep.id,account.user.id);tx.prepare('DELETE FROM sessions WHERE user_id=?').run(account.user.id);tx.prepare('DELETE FROM account_links WHERE user_id=?').run(account.user.id);tx.prepare('DELETE FROM users WHERE id=?').run(account.user.id)});
  return;
 }
 for(const {id} of db.prepare('SELECT id FROM support_tickets WHERE organization_id=?').all(orgId))removeTicketFiles(id);
 transaction(tx=>{
  handBack(tx);
  tx.prepare('DELETE FROM account_links WHERE user_id IN (SELECT id FROM users WHERE organization_id=?)').run(orgId);
  for(const table of ['support_tickets','ai_usage','appointments','orders','clients','services'])tx.prepare(`DELETE FROM ${table} WHERE organization_id=?`).run(orgId);
  try{tx.prepare('DELETE FROM billing_checkout_sessions WHERE organization_id=?').run(orgId)}catch{}
  tx.prepare('UPDATE billing_events SET organization_id=NULL WHERE organization_id=?').run(orgId);
  tx.prepare('DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE organization_id=?)').run(orgId);
  tx.prepare('DELETE FROM users WHERE organization_id=?').run(orgId);
  tx.prepare('DELETE FROM organizations WHERE id=?').run(orgId);
 });
}
