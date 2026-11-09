import {randomUUID} from 'node:crypto';
import {getDb} from './business-db.js';
import {appError,getAccount,sessionId,verifyPassword} from './business-auth.js';
import {getPlan,getEffectivePlan} from './business-plans.js';
import {thread,timeFor,ownerRow,removeTicketFiles} from './tickets.js';

// Owner area: the operator of FUNKNAHT sees what is needed to run the service,
// not the business data of the accounts (clients, appointments, orders stay private).
export const ELEVATION_MS=30*60*1000;
export const RETENTION={resolvedTicketsDays:180,auditDays:365};

export function ownerAccount(request){
 const account=getAccount(request);
 if(!account)throw appError('Bitte melden Sie sich an.',401,'AUTH_REQUIRED');
 if(!account.isOwner)throw appError('Dieser Bereich ist dem Inhaber vorbehalten.',403,'OWNER_ONLY');
 return account;
}

export function elevationUntil(request){
 const id=sessionId(request);if(!id)return 0;
 return getDb().prepare('SELECT elevated_until FROM sessions WHERE id=?').get(id)?.elevated_until||0;
}

export function requireOwner(request){
 const account=ownerAccount(request);
 if(elevationUntil(request)<=Date.now())throw appError('Bitte bestätigen Sie Ihr Passwort, um den Inhaberbereich zu öffnen.',403,'ELEVATION_REQUIRED');
 return account;
}

export async function elevate(request,password){
 const account=ownerAccount(request);
 const row=getDb().prepare('SELECT password_hash FROM users WHERE id=?').get(account.user.id);
 if(typeof password!=='string'||password.length>256||!(await verifyPassword(password,row?.password_hash)))throw appError('Das Passwort stimmt nicht.',401,'INVALID_CREDENTIALS');
 const until=Date.now()+ELEVATION_MS;
 getDb().prepare('UPDATE sessions SET elevated_until=? WHERE id=?').run(until,sessionId(request));
 audit(account.user.id,'owner.unlock');
 return until;
}

export function lock(request){const id=sessionId(request);if(id)getDb().prepare('UPDATE sessions SET elevated_until=0 WHERE id=?').run(id)}

export function audit(actorUserId,action,target=null){
 getDb().prepare('INSERT INTO owner_audit(id,actor_user_id,action,target,created_at) VALUES(?,?,?,?,?)').run(randomUUID(),actorUserId,action,target,Date.now());
}

// Data minimisation over time. Runs cheaply whenever the owner area is used.
export function applyRetention(now=Date.now()){
 const db=getDb();
 const ticketCutoff=new Date(now-RETENTION.resolvedTicketsDays*86400000).toISOString();
 const stale=db.prepare("SELECT id,payload FROM support_tickets WHERE status='geloest' AND updated_at<? AND anonymized_at IS NULL").all(ticketCutoff);
 const scrub=db.prepare('UPDATE support_tickets SET payload=?,reply=NULL,diagnostics=NULL,anonymized_at=? WHERE id=?');
 for(const row of stale){
  let payload={};try{payload=JSON.parse(row.payload)}catch{}
  scrub.run(JSON.stringify({kind:payload.kind,category:payload.category,attempts:[],description:'Nach Ablauf der Aufbewahrungsfrist entfernt.',device:'',name:'',email:'',location:''}),new Date(now).toISOString(),row.id);
  db.prepare('DELETE FROM ticket_messages WHERE ticket_id=?').run(row.id);
  removeTicketFiles(row.id);
 }
 const audits=db.prepare('DELETE FROM owner_audit WHERE created_at<?').run(now-RETENTION.auditDays*86400000).changes;
 const sessions=db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(now).changes;
 return {anonymizedTickets:stale.length,removedAuditEntries:audits,removedSessions:sessions};
}

export function maskEmail(email){
 const [name,domain]=String(email||'').split('@');
 if(!domain)return '';
 return (name.slice(0,1)||'*')+'•••@'+domain;
}

export function overview(){
 const db=getDb(),month=new Date().toISOString().slice(0,7);
 const orgs=db.prepare('SELECT * FROM organizations').all();
 const plans={free:0,basic:0,betrieb:0,individuell:0};
 let paying=0,monthlyRevenue=0;
 for(const org of orgs){
  const real=['active','trialing'].includes(org.billing_status)?getPlan(org.plan).id:'free';
  plans[real]=(plans[real]||0)+1;
  if(real!=='free'){paying++;monthlyRevenue+=getPlan(real).priceMonthly||0}
 }
 const tickets=Object.fromEntries(db.prepare('SELECT status,COUNT(*) AS count FROM support_tickets GROUP BY status').all().map(row=>[row.status,row.count]));
 const since=Date.now()-30*86400000;
 return {
  accounts:{total:orgs.length,business:orgs.filter(org=>org.account_type==='business').length,private:orgs.filter(org=>org.account_type==='private').length,newLast30Days:orgs.filter(org=>org.created_at>=since).length,activeLast30Days:db.prepare('SELECT COUNT(DISTINCT organization_id) AS count FROM users WHERE last_login_at>=?').get(since).count},
  plans,paying,monthlyRevenue,
  tickets:{open:tickets.offen||0,inProgress:tickets['in-pruefung']||0,resolved:tickets.geloest||0,awaitingOwner:db.prepare("SELECT COUNT(*) AS n FROM support_tickets WHERE status<>'geloest' AND awaiting='owner'").get().n,urgent:db.prepare("SELECT COUNT(*) AS n FROM support_tickets WHERE status<>'geloest' AND priority='dringend'").get().n},
  minutesThisMonth:db.prepare('SELECT COALESCE(SUM(minutes),0) AS m FROM ticket_time WHERE substr(work_date,1,7)=?').get(month).m,
  ai:{period:month,requests:db.prepare('SELECT COALESCE(SUM(count),0) AS count FROM ai_usage WHERE period=?').get(month).count},
  callbacksOpen:db.prepare("SELECT COUNT(*) AS n FROM callbacks WHERE status='neu'").get().n,
  monitors:Object.fromEntries(db.prepare('SELECT state,COUNT(*) AS n FROM monitors GROUP BY state').all().map(r=>[r.state,r.n])),
  warrantySoon:db.prepare('SELECT COUNT(*) AS n FROM devices WHERE warranty_until BETWEEN ? AND ?').get(new Date().toISOString().slice(0,10),new Date(Date.now()+60*86400000).toISOString().slice(0,10)).n,
  ratings:db.prepare('SELECT COUNT(*) AS total,COALESCE(SUM(rating),0) AS helpful FROM support_tickets WHERE rating IS NOT NULL').get(),
  openOffers:db.prepare("SELECT COUNT(*) AS n FROM documents WHERE type='angebot' AND status='versendet'").get().n,
  unpaidInvoices:db.prepare("SELECT COUNT(*) AS n FROM documents WHERE type='rechnung' AND status='versendet'").get().n,
  overdueInvoices:db.prepare("SELECT COUNT(*) AS n FROM documents WHERE type='rechnung' AND status='versendet' AND due_on<?").get(new Date().toISOString().slice(0,10)).n,
  bookingsLast30Days:db.prepare('SELECT COUNT(*) AS count FROM appointments WHERE created_at>=?').get(since).count,
 };
}

export function listAccounts(){
 const db=getDb();
 const counts=table=>Object.fromEntries(db.prepare(`SELECT organization_id AS id,COUNT(*) AS count FROM ${table} GROUP BY organization_id`).all().map(row=>[row.id,row.count]));
 const clients=counts('clients'),appointments=counts('appointments'),orders=counts('orders');
 return db.prepare('SELECT o.*,u.email,u.last_login_at FROM organizations o LEFT JOIN users u ON u.organization_id=o.id ORDER BY o.created_at DESC').all().map(org=>({
  id:org.id,
  // Private persons are shown pseudonymously; a business name is business information.
  name:org.account_type==='business'?org.name:'Privatkonto '+org.id.slice(0,6),
  accountType:org.account_type,
  email:maskEmail(org.email),
  plan:getEffectivePlan({...org,sandbox_enabled:0}),
  billingStatus:org.billing_status,
  createdAt:org.created_at,
  lastLoginDay:org.last_login_at?new Date(org.last_login_at).toISOString().slice(0,10):null,
  usage:{clients:clients[org.id]||0,appointments:appointments[org.id]||0,orders:orders[org.id]||0},
 }));
}

function ticketView(row,{reveal=false}={}){
 let payload={};try{payload=JSON.parse(row.payload)}catch{}
 const base={source:row.source||'portal',id:row.id,kind:payload.kind,category:payload.category,status:row.status,priority:row.priority||'normal',awaiting:row.awaiting||'owner',createdAt:row.created_at,updatedAt:row.updated_at,lastActivityAt:row.last_activity_at||row.updated_at,anonymized:!!row.anonymized_at,summary:String(payload.description||'').slice(0,140),accountType:row.account_type};
 if(!reveal)return {...base,contact:payload.email?maskEmail(payload.email):''};
 let diagnostics=null;try{diagnostics=row.diagnostics?JSON.parse(row.diagnostics):null}catch{}
 const device=row.device_id?getDb().prepare('SELECT label FROM devices WHERE id=?').get(row.device_id):null;
 return {...base,source:row.source||'portal',phone:payload.phone||'',deviceLabel:device?.label||null,rating:row.rating,ratingComment:row.rating_comment,organizationId:row.organization_id,description:payload.description,device:payload.device,attempts:payload.attempts||[],name:payload.name,email:payload.email,location:payload.location,diagnostics,organizationName:row.account_type==='business'?row.organization_name:null,...thread(row.id,{includeInternal:true}),time:timeFor(row.id)};
}

export function listTickets(){
 const db=getDb();
 return db.prepare("SELECT t.*,o.account_type FROM support_tickets t JOIN organizations o ON o.id=t.organization_id ORDER BY CASE WHEN t.status<>'geloest' AND t.awaiting='owner' THEN 0 WHEN t.status<>'geloest' THEN 1 ELSE 2 END,CASE t.priority WHEN 'dringend' THEN 0 WHEN 'hoch' THEN 1 ELSE 2 END,COALESCE(t.last_activity_at,t.updated_at) DESC LIMIT 500").all().map(row=>({...ticketView(row),minutes:db.prepare('SELECT COALESCE(SUM(minutes),0) AS m FROM ticket_time WHERE ticket_id=?').get(row.id).m}));
}

// Reading a ticket for the owner area. Opening reveals contact details, so it is recorded.
export function readTicket(id){return ticketView(ownerRow(id),{reveal:true})}
export function openTicket(actorUserId,id){const ticket=readTicket(id);audit(actorUserId,'ticket.view',id);return ticket}

export function auditLog(limit=200){
 return getDb().prepare('SELECT a.action,a.target,a.created_at,u.name FROM owner_audit a LEFT JOIN users u ON u.id=a.actor_user_id ORDER BY a.created_at DESC LIMIT ?').all(limit).map(row=>({action:row.action,target:row.target,createdAt:row.created_at,actor:row.name||'Gelöschter Zugang'}));
}
