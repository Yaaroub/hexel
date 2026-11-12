// FUNKNAHT-Team: Admins und Mitarbeiter, Einladungen und Aufgaben.
// Mitarbeiter-Konten liegen in einer internen Organisation, die nie als Kunde erscheint.
import {randomBytes,createHash,randomUUID} from 'node:crypto';
import {getDb,transaction} from './business-db.js';
import {appError,cleanString,cleanEmail,hashPassword,ownerEmails} from './business-auth.js';

export const STAFF_ROLES={admin:'Admin',mitarbeiter:'Mitarbeiter'};
const hash=t=>createHash('sha256').update(t).digest('hex');
const INVITE_DAYS=7;

function internalOrg(db){
 let org=db.prepare('SELECT id FROM organizations WHERE internal=1 LIMIT 1').get();
 if(!org){org={id:randomUUID()};db.prepare("INSERT INTO organizations(id,name,slug,account_type,created_at,internal) VALUES(?,?,?,'business',?,1)").run(org.id,'FUNKNAHT-Team','funknaht-team-'+randomBytes(3).toString('hex'),Date.now())}
 return org.id;
}

// Alle Menschen, die im Team arbeiten: Inhaber (aus OWNER_EMAILS) und eingetragene Mitarbeiter.
export function teamPeople({includeInactive=false}={}){
 const db=getDb(),owners=ownerEmails();
 const ownerRows=owners.length?db.prepare(`SELECT id,name,email FROM users WHERE lower(email) IN (${owners.map(()=>'?').join(',')})`).all(...owners):[];
 const staff=db.prepare(`SELECT s.*,u.name AS user_name,u.last_login_at FROM staff_members s LEFT JOIN users u ON u.id=s.user_id ${includeInactive?'':'WHERE s.active=1'} ORDER BY s.created_at`).all();
 return [...ownerRows.map(u=>({id:'owner-'+u.id,userId:u.id,name:u.name,email:u.email,role:'admin',roleLabel:'Inhaber',active:true,owner:true,status:'aktiv'})),
  ...staff.map(s=>({id:s.id,userId:s.user_id,name:s.user_name||s.name,email:s.email,role:s.role,roleLabel:STAFF_ROLES[s.role],active:!!s.active,owner:false,status:!s.active?'deaktiviert':s.user_id?'aktiv':s.invite_expires<Date.now()?'Einladung abgelaufen':'eingeladen',lastLoginAt:s.last_login_at||null}))];
}
export function findPerson(name){
 const q=String(name||'').trim().toLowerCase();if(!q)return null;
 const people=teamPeople().filter(p=>p.userId);
 return people.find(p=>p.name.toLowerCase()===q)||people.find(p=>p.name.toLowerCase().split(/\s+/).includes(q))||people.find(p=>p.name.toLowerCase().includes(q))||null;
}

export function inviteStaff({email,name,role},appUrl=process.env.APP_URL||''){
 const mail=cleanEmail(email,{required:true}),cleanName=cleanString(name,{required:true,max:150,label:'Name'});
 if(!STAFF_ROLES[role])throw appError('Bitte eine Rolle wählen.');
 const db=getDb();
 if(db.prepare('SELECT 1 FROM users WHERE lower(email)=?').get(mail))throw appError('Für diese E-Mail-Adresse gibt es schon ein Konto. Bitte eine andere Adresse verwenden (z. B. die dienstliche).',409,'ACCOUNT_EXISTS');
 if(db.prepare('SELECT 1 FROM staff_members WHERE lower(email)=? AND active=1').get(mail))throw appError('Diese Person ist bereits eingeladen.',409);
 const token=randomBytes(24).toString('base64url'),id=randomUUID();
 db.prepare('INSERT INTO staff_members(id,email,name,role,active,invite_hash,invite_expires,created_at) VALUES(?,?,?,?,1,?,?,?)').run(id,mail,cleanName,role,hash(token),Date.now()+INVITE_DAYS*86400000,Date.now());
 return {id,link:appUrl.replace(/\/$/,'')+'/einladung/'+token};
}
export function staffInvite(token){
 const row=getDb().prepare('SELECT * FROM staff_members WHERE invite_hash=?').get(hash(token));
 if(!row)return null;
 return {kind:'staff',id:row.id,organizationName:'das FUNKNAHT-Team',email:row.email,role:row.role,roleLabel:STAFF_ROLES[row.role],expired:row.invite_expires<Date.now()||!row.active,accepted:!!row.user_id};
}
export async function joinStaff(token,{name,password}){
 const info=staffInvite(token);
 if(!info)throw appError('Diese Einladung ist ungültig.',404);
 if(info.expired||info.accepted)throw appError('Diese Einladung ist abgelaufen oder wurde bereits verwendet.',410,'INVITE_USED');
 const cleanName=cleanString(name,{required:true,max:150,label:'Name'});
 if(typeof password!=='string'||password.length<12||password.length>256)throw appError('Das Passwort muss 12 bis 256 Zeichen enthalten.');
 const pw=await hashPassword(password),userId=randomUUID(),now=Date.now();
 try{transaction(db=>{
  db.prepare('INSERT INTO users(id,organization_id,name,email,password_hash,role,created_at) VALUES(?,?,?,?,?,?,?)').run(userId,internalOrg(db),cleanName,info.email,pw,'inhaber',now);
  db.prepare('UPDATE staff_members SET user_id=?,name=?,accepted_at=?,invite_hash=NULL WHERE id=?').run(userId,cleanName,now,info.id);
 })}catch(e){if(String(e.message).includes('users.email'))throw appError('Für diese E-Mail-Adresse gibt es schon ein Konto.',409,'ACCOUNT_EXISTS');throw e}
 return userId;
}
export function updateStaff(id,{role,active}){
 const db=getDb(),row=db.prepare('SELECT * FROM staff_members WHERE id=?').get(String(id||''));
 if(!row)throw appError('Person nicht gefunden.',404);
 if(role!==undefined){if(!STAFF_ROLES[role])throw appError('Ungültige Rolle.');db.prepare('UPDATE staff_members SET role=? WHERE id=?').run(role,row.id)}
 if(active!==undefined){db.prepare('UPDATE staff_members SET active=? WHERE id=?').run(active?1:0,row.id);if(!active&&row.user_id)db.prepare('DELETE FROM sessions WHERE user_id=?').run(row.user_id)}
 return teamPeople({includeInactive:true}).find(p=>p.id===row.id);
}

// ---------- Aufgaben ----------
const day=v=>v==null||v===''?null:/^\d{4}-\d{2}-\d{2}$/.test(String(v))?String(v):(()=>{throw appError('Datum bitte als JJJJ-MM-TT.')})();
export function createTask({title,notes='',assigneeUserId=null,organizationId=null,ticketId=null,dueOn=null,source='manuell'},createdBy){
 const t=cleanString(title,{required:true,max:200,label:'Titel'}),n=cleanString(notes||'',{max:2000});
 const db=getDb();
 if(assigneeUserId&&!teamPeople().some(p=>p.userId===assigneeUserId))throw appError('Diese Person gehört nicht zum Team.');
 if(organizationId&&!db.prepare('SELECT 1 FROM organizations WHERE id=? AND internal=0').get(organizationId))throw appError('Kunde nicht gefunden.',404);
 if(ticketId&&!db.prepare('SELECT 1 FROM support_tickets WHERE id=?').get(ticketId))throw appError('Anfrage nicht gefunden.',404);
 const id=randomUUID();
 db.prepare('INSERT INTO tasks(id,title,notes,assignee_user_id,created_by,organization_id,ticket_id,due_on,source,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,t,n,assigneeUserId,createdBy,organizationId,ticketId,day(dueOn),source,Date.now());
 return taskView(db.prepare('SELECT * FROM tasks WHERE id=?').get(id));
}
export function setTaskStatus(id,status,userId){
 if(!['offen','erledigt'].includes(status))throw appError('Ungültiger Status.');
 const db=getDb();
 if(!db.prepare('UPDATE tasks SET status=?,done_at=?,done_by=? WHERE id=?').run(status,status==='erledigt'?Date.now():null,status==='erledigt'?userId:null,String(id||'')).changes)throw appError('Aufgabe nicht gefunden.',404);
 return taskView(db.prepare('SELECT * FROM tasks WHERE id=?').get(id));
}
export function deleteTask(id){if(!getDb().prepare('DELETE FROM tasks WHERE id=?').run(String(id||'')).changes)throw appError('Aufgabe nicht gefunden.',404)}
function taskView(r){
 if(!r)return null;const db=getDb();
 const person=id=>id?db.prepare('SELECT name FROM users WHERE id=?').get(id)?.name||'–':null;
 const org=r.organization_id?db.prepare('SELECT name,account_type FROM organizations WHERE id=?').get(r.organization_id):null;
 return {id:r.id,title:r.title,notes:r.notes,status:r.status,assigneeUserId:r.assignee_user_id,assignee:person(r.assignee_user_id),createdBy:person(r.created_by),customerId:r.organization_id,customer:org?(org.account_type==='business'?org.name:'Privatkunde '+r.organization_id.slice(0,6)):null,ticketId:r.ticket_id,dueOn:r.due_on,source:r.source,createdAt:r.created_at,doneAt:r.done_at,doneBy:person(r.done_by),overdue:r.status==='offen'&&!!r.due_on&&r.due_on<new Date().toISOString().slice(0,10)};
}
export function listTasks({status='offen',assigneeUserId}={}){
 const where=[],args=[];
 if(status&&status!=='alle'){where.push('status=?');args.push(status)}
 if(assigneeUserId==='frei')where.push('assignee_user_id IS NULL');else if(assigneeUserId){where.push('assignee_user_id=?');args.push(assigneeUserId)}
 return getDb().prepare(`SELECT * FROM tasks ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY status='erledigt',COALESCE(due_on,'9999'),created_at DESC LIMIT 300`).all(...args).map(taskView);
}
