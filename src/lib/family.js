import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {getDb} from './business-db.js';
import {appError,cleanString} from './business-auth.js';

// Angehörigen-Zugang: Eine Person (z. B. die Mutter) lädt eine andere ein (z. B. die Tochter).
// Erst wenn die eingeladene Person den Link annimmt, darf sie Anfragen stellen und den Stand sehen.
// Die einladende Person kann den Zugang jederzeit beenden.
const hash=t=>createHash('sha256').update(t).digest('hex');
const INVITE_DAYS=14;

export function createFamilyInvite(account,label){
 const token=randomBytes(24).toString('base64url'),now=Date.now();
 getDb().prepare('INSERT INTO account_links(id,organization_id,token_hash,label,created_at,expires_at) VALUES(?,?,?,?,?,?)').run(randomUUID(),account.organization.id,hash(token),cleanString(label,{max:80,label:'Bezeichnung'}),now,now+INVITE_DAYS*86400000);
 return token;
}

export function inviteInfo(token){
 if(typeof token!=='string'||token.length<20||token.length>80)throw appError('Diese Einladung ist ungültig.',404,'NOT_FOUND');
 const db=getDb();
 const family=db.prepare('SELECT l.*,o.name AS org_name,(SELECT name FROM users WHERE organization_id=o.id ORDER BY created_at LIMIT 1) AS inviter FROM account_links l JOIN organizations o ON o.id=l.organization_id WHERE l.token_hash=?').get(hash(token));
 if(family)return {kind:'family',id:family.id,organizationId:family.organization_id,inviter:family.inviter,expired:family.expires_at<Date.now(),accepted:!!family.accepted_at};
 const team=db.prepare('SELECT i.*,o.name AS org_name FROM team_invites i JOIN organizations o ON o.id=i.organization_id WHERE i.token_hash=?').get(hash(token));
 if(team)return {kind:'team',id:team.id,organizationId:team.organization_id,organizationName:team.org_name,email:team.email,role:team.role,expired:team.expires_at<Date.now(),accepted:!!team.accepted_at};
 throw appError('Diese Einladung ist ungültig.',404,'NOT_FOUND');
}

export function acceptFamilyInvite(account,token){
 const info=inviteInfo(token);
 if(info.kind!=='family')throw appError('Diese Einladung gehört zu einem Betrieb.');
 if(info.expired||info.accepted)throw appError('Diese Einladung ist abgelaufen oder wurde bereits verwendet.',410,'INVITE_USED');
 if(info.organizationId===account.organization.id)throw appError('Sie können sich nicht selbst einladen.');
 const db=getDb();
 if(db.prepare('SELECT 1 FROM account_links WHERE organization_id=? AND user_id=? AND accepted_at IS NOT NULL').get(info.organizationId,account.user.id))throw appError('Sie sind bereits verbunden.',409);
 db.prepare('UPDATE account_links SET user_id=?,accepted_at=? WHERE id=?').run(account.user.id,Date.now(),info.id);
 return info;
}

// Wen darf dieses Konto vertreten?
export function familyScopes(account){
 return getDb().prepare('SELECT l.id,l.organization_id,(SELECT name FROM users WHERE organization_id=l.organization_id ORDER BY created_at LIMIT 1) AS name FROM account_links l WHERE l.user_id=? AND l.accepted_at IS NOT NULL').all(account.user.id).map(r=>({linkId:r.id,organizationId:r.organization_id,name:r.name||'Angehörige Person'}));
}
// Wer darf dieses Konto vertreten?
export function familyMembers(account){
 return getDb().prepare('SELECT l.id,l.label,l.accepted_at,l.expires_at,l.created_at,u.name,u.email FROM account_links l LEFT JOIN users u ON u.id=l.user_id WHERE l.organization_id=? ORDER BY l.created_at DESC').all(account.organization.id).filter(r=>r.accepted_at||r.expires_at>Date.now()).map(r=>({id:r.id,label:r.label,name:r.name,email:r.email,accepted:!!r.accepted_at,createdAt:r.created_at}));
}
export function removeFamilyLink(account,id){
 // Beide Seiten dürfen die Verbindung lösen.
 const r=getDb().prepare('DELETE FROM account_links WHERE id=? AND (organization_id=? OR user_id=?)').run(String(id),account.organization.id,account.user.id);
 if(!r.changes)throw appError('Verbindung nicht gefunden.',404);
}

// Liefert die Organisation, für die gehandelt wird: die eigene oder eine verbundene.
export function customerOrg(account,forOrg){
 if(!forOrg||forOrg===account.organization.id)return account.organization.id;
 if(typeof forOrg!=='string'||!familyScopes(account).some(s=>s.organizationId===forOrg))throw appError('Für dieses Konto haben Sie keinen Zugang.',403,'NO_ACCESS');
 return forOrg;
}
export const familyHash=hash;
