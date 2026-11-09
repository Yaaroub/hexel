import {randomBytes,randomUUID} from 'node:crypto';
import {getDb,transaction} from './business-db.js';
import {appError,cleanEmail,cleanString,hashPassword} from './business-auth.js';
import {familyHash,inviteInfo} from './family.js';

// Mitarbeiter im Betrieb. Rollen: inhaber (alles), buero (alles außer Tarif und Team), monteur (nur Termine).
export const ROLES={inhaber:'Inhaber',buero:'Büro',monteur:'Monteur'};
const INVITE_DAYS=7;

export function requireRole(account,...roles){if(!roles.includes(account.user.role||'inhaber'))throw appError('Dafür fehlt Ihnen die Berechtigung. Bitte wenden Sie sich an den Inhaber des Betriebs.',403,'ROLE_REQUIRED')}

export function teamMembers(orgId){
 const db=getDb();
 return {
  members:db.prepare('SELECT id,name,email,role,created_at,last_login_at FROM users WHERE organization_id=? ORDER BY created_at').all(orgId).map(u=>({id:u.id,name:u.name,email:u.email,role:u.role||'inhaber',lastLoginAt:u.last_login_at})),
  invites:db.prepare('SELECT id,email,role,created_at,expires_at FROM team_invites WHERE organization_id=? AND accepted_at IS NULL AND expires_at>?').all(orgId,Date.now()).map(i=>({id:i.id,email:i.email,role:i.role,expiresAt:i.expires_at})),
 };
}

export function inviteMember(account,{email,role}){
 requireRole(account,'inhaber');
 if(account.organization.accountType!=='business')throw appError('Mitarbeiter gibt es nur bei Betriebskonten.');
 if(!['buero','monteur','inhaber'].includes(role))throw appError('Bitte wählen Sie eine Rolle.');
 const mail=cleanEmail(email,{required:true});
 const db=getDb();
 if(db.prepare('SELECT 1 FROM users WHERE email=?').get(mail))throw appError('Für diese E-Mail-Adresse gibt es schon ein Konto. Bitte eine andere Adresse verwenden.',409,'ACCOUNT_EXISTS');
 if(db.prepare('SELECT COUNT(*) AS n FROM users WHERE organization_id=?').get(account.organization.id).n>=25)throw appError('Mehr als 25 Zugänge sind nicht möglich.');
 const token=randomBytes(24).toString('base64url'),now=Date.now();
 db.prepare('INSERT INTO team_invites(id,organization_id,email,role,token_hash,created_at,expires_at) VALUES(?,?,?,?,?,?,?)').run(randomUUID(),account.organization.id,mail,role,familyHash(token),now,now+INVITE_DAYS*86400000);
 return token;
}

export async function joinTeam(token,{name,password}){
 const info=inviteInfo(token);
 if(info.kind!=='team')throw appError('Diese Einladung ist ungültig.',404);
 if(info.expired||info.accepted)throw appError('Diese Einladung ist abgelaufen oder wurde bereits verwendet.',410,'INVITE_USED');
 const cleanName=cleanString(name,{required:true,max:150,label:'Name'});
 if(typeof password!=='string'||password.length<12||password.length>256)throw appError('Das Passwort muss 12 bis 256 Zeichen enthalten.');
 const hash=await hashPassword(password),userId=randomUUID(),now=Date.now();
 try{transaction(db=>{
  db.prepare('INSERT INTO users(id,organization_id,name,email,password_hash,role,created_at) VALUES(?,?,?,?,?,?,?)').run(userId,info.organizationId,cleanName,info.email,hash,info.role,now);
  db.prepare('UPDATE team_invites SET accepted_at=? WHERE id=?').run(now,info.id);
 })}catch(e){if(String(e.message).includes('users.email'))throw appError('Für diese E-Mail-Adresse gibt es schon ein Konto.',409,'ACCOUNT_EXISTS');throw e}
 return userId;
}

export function updateMember(account,userId,role){
 requireRole(account,'inhaber');
 if(!ROLES[role])throw appError('Ungültige Rolle.');
 const db=getDb(),target=db.prepare('SELECT * FROM users WHERE id=? AND organization_id=?').get(String(userId),account.organization.id);
 if(!target)throw appError('Mitarbeiter nicht gefunden.',404);
 if(target.role==='inhaber'&&role!=='inhaber'&&db.prepare("SELECT COUNT(*) AS n FROM users WHERE organization_id=? AND role='inhaber'").get(account.organization.id).n<=1)throw appError('Es muss mindestens einen Inhaber geben.');
 db.prepare('UPDATE users SET role=? WHERE id=?').run(role,target.id);
}

export function removeMember(account,userId){
 requireRole(account,'inhaber');
 if(userId===account.user.id)throw appError('Sich selbst entfernen Sie über „Konto löschen“.');
 const db=getDb(),target=db.prepare('SELECT * FROM users WHERE id=? AND organization_id=?').get(String(userId),account.organization.id);
 if(!target)throw appError('Mitarbeiter nicht gefunden.',404);
 transaction(tx=>{
  // Anfragen bleiben beim Betrieb und werden dem Inhaber zugeordnet.
  tx.prepare('UPDATE support_tickets SET user_id=? WHERE user_id=?').run(account.user.id,target.id);
  tx.prepare('DELETE FROM sessions WHERE user_id=?').run(target.id);
  tx.prepare('DELETE FROM account_links WHERE user_id=?').run(target.id);
  tx.prepare('DELETE FROM users WHERE id=?').run(target.id);
 });
}
export function revokeInvite(account,id){requireRole(account,'inhaber');getDb().prepare('DELETE FROM team_invites WHERE id=? AND organization_id=?').run(String(id),account.organization.id)}
