import {randomUUID} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {getDb,transaction} from './business-db.js';
import {appError} from './business-auth.js';

// Support tickets: conversation, attachments, priority, browser diagnostics, time tracking.
export const STATUSES=['offen','in-pruefung','geloest'];
export const PRIORITIES=['normal','hoch','dringend'];
export const MAX_ATTACHMENT_BYTES=5*1024*1024;
const MAX_ATTACHMENTS_PER_TICKET=12;
const ID=/^FN-[A-F0-9]{8}$/;

export function uploadDir(){return process.env.NODE_ENV==='test'&&process.env.UPLOAD_DIR?process.env.UPLOAD_DIR:path.join(process.cwd(),'.local','uploads')}
const now=()=>new Date().toISOString();
function assertId(id){if(typeof id!=='string'||!ID.test(id))throw appError('Ungültige Anfragenummer.')}
function cleanBody(body,max=4000){if(typeof body!=='string'||!body.trim())throw appError('Bitte schreiben Sie eine Nachricht.');if(body.length>max)throw appError(`Die Nachricht darf höchstens ${max.toLocaleString('de-DE')} Zeichen haben.`);return body.trim()}

// Only known, small, non-identifying measurements are accepted from the browser.
export function cleanDiagnostics(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return null;
 const out={};
 const num=(k,max)=>{const v=Number(input[k]);if(Number.isFinite(v)&&v>=0&&v<=max)out[k]=Math.round(v*10)/10};
 const str=(k,max)=>{if(typeof input[k]==='string'&&input[k].trim())out[k]=input[k].trim().slice(0,max)};
 if(typeof input.online==='boolean')out.online=input.online;
 num('serverLatencyMs',60000);num('downloadMbps',10000);num('rttMs',60000);num('downlinkMbps',10000);
 str('effectiveType',10);str('browser',80);str('os',60);str('device',20);str('screen',20);str('language',12);str('timezone',40);str('measuredAt',30);
 return Object.keys(out).length?out:null;
}

export function createTicket(account,value,{priority='normal',diagnostics=null,orgId=account.organization.id,deviceId=null}={}){
 if(!PRIORITIES.includes(priority))throw appError('Ungültige Dringlichkeit.');
 const id='FN-'+randomUUID().slice(0,8).toUpperCase(),ts=now(),diag=cleanDiagnostics(diagnostics);
 transaction(db=>{
  const device=deviceId&&db.prepare('SELECT id FROM devices WHERE id=? AND organization_id=?').get(String(deviceId),orgId);
  db.prepare("INSERT INTO support_tickets(id,organization_id,user_id,payload,status,priority,awaiting,diagnostics,device_id,created_at,updated_at,last_activity_at) VALUES(?,?,?,?,'offen',?,'owner',?,?,?,?,?)").run(id,orgId,account.user.id,JSON.stringify(value),priority,diag?JSON.stringify(diag):null,device?.id||null,ts,ts,ts);
 });
 return {id,status:'offen',priority,createdAt:ts};
}

function parse(json,fallback){try{return json?JSON.parse(json):fallback}catch{return fallback}}
function attachmentView(row){return {id:row.id,filename:row.filename,mime:row.mime,size:row.size,author:row.author,internal:!!row.internal,createdAt:row.created_at,messageId:row.message_id}}
function messageView(row){return {id:row.id,author:row.author,body:row.body,internal:!!row.internal,createdAt:row.created_at}}

export function ticketSummary(row){
 const payload=parse(row.payload,{});
 return {id:row.id,kind:payload.kind,category:payload.category,description:payload.description,status:row.status,priority:row.priority||'normal',awaiting:row.awaiting||'owner',createdAt:row.created_at,updatedAt:row.updated_at,lastActivityAt:row.last_activity_at||row.updated_at,anonymized:!!row.anonymized_at};
}

export function thread(ticketId,{includeInternal=false}={}){
 const db=getDb(),filter=includeInternal?'':' AND internal=0';
 return {
  messages:db.prepare(`SELECT * FROM ticket_messages WHERE ticket_id=?${filter} ORDER BY created_at`).all(ticketId).map(messageView),
  attachments:db.prepare(`SELECT * FROM ticket_attachments WHERE ticket_id=?${filter} ORDER BY created_at`).all(ticketId).map(attachmentView),
 };
}

// ---------- Customer side ----------
export function customerTickets(orgId){
 const db=getDb();
 return db.prepare('SELECT * FROM support_tickets WHERE organization_id=? ORDER BY COALESCE(last_activity_at,updated_at) DESC').all(orgId).map(row=>({...ticketSummary(row),...parse(row.payload,{}),id:row.id,status:row.status,messageCount:db.prepare('SELECT COUNT(*) AS n FROM ticket_messages WHERE ticket_id=? AND internal=0').get(row.id).n}));
}
function customerRow(orgId,id){assertId(id);const row=getDb().prepare('SELECT * FROM support_tickets WHERE id=? AND organization_id=?').get(id,orgId);if(!row)throw appError('Anfrage nicht gefunden.',404,'NOT_FOUND');return row}
export function customerThread(orgId,id){const row=customerRow(orgId,id);const device=row.device_id?getDb().prepare('SELECT label FROM devices WHERE id=?').get(row.device_id):null;return {ticket:{...ticketSummary(row),...parse(row.payload,{}),id:row.id,status:row.status,diagnostics:parse(row.diagnostics,null),deviceLabel:device?.label||null,rating:row.rating,ratingComment:row.rating_comment},...thread(id)}}
// Kurze Rückmeldung nach Abschluss: hat es geholfen? Veröffentlichung nur mit ausdrücklicher Zustimmung.
export function rateTicket(orgId,id,{helpful,comment='',publish=false}){
 const row=customerRow(orgId,id);
 if(row.status!=='geloest')throw appError('Bewerten können Sie, sobald die Anfrage erledigt ist.',409);
 if(typeof helpful!=='boolean')throw appError('Bitte wählen Sie eine Antwort.');
 if(typeof comment!=='string'||comment.length>600)throw appError('Der Kommentar darf höchstens 600 Zeichen haben.');
 getDb().prepare('UPDATE support_tickets SET rating=?,rating_comment=?,rating_public=? WHERE id=?').run(helpful?1:0,comment.trim()||null,publish===true&&helpful?1:0,id);
 return customerThread(orgId,id);
}
export function addCustomerMessage(account,id,body,orgId=account.organization.id){
 const row=customerRow(orgId,id),text=cleanBody(body),ts=now(),msgId=randomUUID();
 if(row.anonymized_at)throw appError('Diese Anfrage ist abgeschlossen und archiviert.',409,'ANONYMIZED');
 transaction(db=>{
  db.prepare("INSERT INTO ticket_messages(id,ticket_id,author,author_user_id,body,internal,created_at) VALUES(?,?,'customer',?,?,0,?)").run(msgId,id,account.user.id,text,ts);
  // A new message on a closed request reopens it.
  db.prepare("UPDATE support_tickets SET awaiting='owner',status=CASE WHEN status='geloest' THEN 'offen' ELSE status END,updated_at=?,last_activity_at=? WHERE id=?").run(ts,ts,id);
 });
 return customerThread(orgId,id);
}
export function setCustomerStatus(account,id,status,orgId=account.organization.id){
 if(!['offen','geloest'].includes(status))throw appError('Diese Änderung ist nicht möglich.');
 customerRow(orgId,id);const ts=now();
 getDb().prepare('UPDATE support_tickets SET status=?,updated_at=?,last_activity_at=? WHERE id=?').run(status,ts,ts,id);
 return customerThread(orgId,id);
}

// ---------- Owner side ----------
export function ownerRow(id){assertId(id);const row=getDb().prepare('SELECT t.*,o.account_type,o.name AS organization_name FROM support_tickets t JOIN organizations o ON o.id=t.organization_id WHERE t.id=?').get(id);if(!row)throw appError('Anfrage nicht gefunden.',404,'NOT_FOUND');return row}
export function addOwnerMessage(actorUserId,id,{body,internal=false}){
 const row=ownerRow(id),text=cleanBody(body),ts=now(),msgId=randomUUID();
 if(row.anonymized_at)throw appError('Diese Anfrage wurde anonymisiert.',409,'ANONYMIZED');
 transaction(db=>{
  db.prepare("INSERT INTO ticket_messages(id,ticket_id,author,author_user_id,body,internal,created_at) VALUES(?,?,'owner',?,?,?,?)").run(msgId,id,actorUserId,text,internal?1:0,ts);
  if(internal)db.prepare('UPDATE support_tickets SET updated_at=? WHERE id=?').run(ts,id);
  else db.prepare("UPDATE support_tickets SET awaiting='customer',status=CASE WHEN status='offen' THEN 'in-pruefung' ELSE status END,updated_at=?,last_activity_at=? WHERE id=?").run(ts,ts,id);
 });
 return msgId;
}
export function updateTicketMeta(id,{status,priority}){
 const row=ownerRow(id);
 if(status!==undefined&&!STATUSES.includes(status))throw appError('Ungültiger Bearbeitungsstand.');
 if(priority!==undefined&&!PRIORITIES.includes(priority))throw appError('Ungültige Dringlichkeit.');
 const ts=now();
 getDb().prepare('UPDATE support_tickets SET status=?,priority=?,updated_at=?,last_activity_at=? WHERE id=?').run(status??row.status,priority??row.priority,ts,ts,id);
 return {changedStatus:status!==undefined&&status!==row.status,changedPriority:priority!==undefined&&priority!==row.priority};
}

// ---------- Attachments ----------
const signatures=[
 ['image/png',b=>b[0]===0x89&&b[1]===0x50&&b[2]===0x4E&&b[3]===0x47],
 ['image/jpeg',b=>b[0]===0xFF&&b[1]===0xD8&&b[2]===0xFF],
 ['image/webp',b=>b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'],
 ['application/pdf',b=>b.toString('ascii',0,5)==='%PDF-'],
];
export function detectMime(buffer){return signatures.find(([,test])=>buffer.length>12&&test(buffer))?.[0]||null}
function safeName(name,mime){const ext={'image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp','application/pdf':'.pdf'}[mime];const base=String(name||'datei').replace(/\.[^.]*$/,'').normalize('NFKD').replace(/[^\w\- ]+/g,'').trim().slice(0,60)||'datei';return base+ext}

export async function saveAttachment(ticketId,{file,author,internal=false}){
 assertId(ticketId);
 if(!file||typeof file.arrayBuffer!=='function')throw appError('Bitte wählen Sie eine Datei aus.');
 if(file.size>MAX_ATTACHMENT_BYTES)throw appError('Die Datei ist größer als 5 MB.',413,'FILE_TOO_LARGE');
 const db=getDb();
 if(db.prepare('SELECT COUNT(*) AS n FROM ticket_attachments WHERE ticket_id=?').get(ticketId).n>=MAX_ATTACHMENTS_PER_TICKET)throw appError('Zu dieser Anfrage gibt es bereits die maximale Anzahl an Dateien.',409,'TOO_MANY_FILES');
 const buffer=Buffer.from(await file.arrayBuffer());
 const mime=detectMime(buffer);
 if(!mime)throw appError('Erlaubt sind Bilder (PNG, JPG, WebP) und PDF-Dateien.',415,'FILE_TYPE');
 const id=randomUUID(),dir=path.join(uploadDir(),ticketId);
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,id),buffer,{mode:0o600});
 const ts=now();
 db.prepare('INSERT INTO ticket_attachments(id,ticket_id,author,filename,mime,size,internal,created_at) VALUES(?,?,?,?,?,?,?,?)').run(id,ticketId,author,safeName(file.name,mime),mime,buffer.length,internal?1:0,ts);
 db.prepare('UPDATE support_tickets SET updated_at=?,last_activity_at=? WHERE id=?').run(ts,ts,ticketId);
 return attachmentView(db.prepare('SELECT * FROM ticket_attachments WHERE id=?').get(id));
}
export function attachmentRow(id){if(typeof id!=='string'||!/^[0-9a-f-]{36}$/.test(id))throw appError('Datei nicht gefunden.',404,'NOT_FOUND');const row=getDb().prepare('SELECT a.*,t.organization_id FROM ticket_attachments a JOIN support_tickets t ON t.id=a.ticket_id WHERE a.id=?').get(id);if(!row)throw appError('Datei nicht gefunden.',404,'NOT_FOUND');return row}
export function attachmentBytes(row){const file=path.join(uploadDir(),row.ticket_id,row.id);if(!fs.existsSync(file))throw appError('Datei nicht gefunden.',404,'NOT_FOUND');return fs.readFileSync(file)}
export function removeTicketFiles(ticketId){fs.rmSync(path.join(uploadDir(),ticketId),{recursive:true,force:true});getDb().prepare('DELETE FROM ticket_attachments WHERE ticket_id=?').run(ticketId)}

// ---------- Time tracking ----------
export function addTime(ticketId,{minutes,note='',billable=true,date}){
 ownerRow(ticketId);
 if(!Number.isInteger(minutes)||minutes<1||minutes>1440)throw appError('Bitte geben Sie zwischen 1 und 1.440 Minuten an.');
 if(typeof note!=='string'||note.length>300)throw appError('Die Notiz darf höchstens 300 Zeichen haben.');
 const day=typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)?date:new Date().toISOString().slice(0,10);
 const id=randomUUID();
 getDb().prepare('INSERT INTO ticket_time(id,ticket_id,minutes,note,billable,work_date,created_at) VALUES(?,?,?,?,?,?,?)').run(id,ticketId,minutes,note.trim(),billable?1:0,day,now());
 return id;
}
export function removeTime(id){if(typeof id!=='string'||!/^[0-9a-f-]{36}$/.test(id))throw appError('Eintrag nicht gefunden.',404);if(getDb().prepare('SELECT document_id FROM ticket_time WHERE id=?').get(id)?.document_id)throw appError('Diese Zeit ist bereits in einem Beleg berechnet. Stornieren Sie zuerst den Beleg.',409);if(!getDb().prepare('DELETE FROM ticket_time WHERE id=?').run(id).changes)throw appError('Eintrag nicht gefunden.',404)}
export function timeFor(ticketId){return getDb().prepare('SELECT tt.id,tt.minutes,tt.note,tt.billable,tt.work_date AS date,CASE WHEN d.status=\'entwurf\' THEN \'Entwurf\' ELSE d.number END AS billedIn FROM ticket_time tt LEFT JOIN documents d ON d.id=tt.document_id WHERE tt.ticket_id=? ORDER BY tt.work_date,tt.created_at').all(ticketId).map(r=>({...r,billable:!!r.billable}))}
export function timeReport(month){
 if(typeof month!=='string'||!/^\d{4}-\d{2}$/.test(month))throw appError('Ungültiger Monat.');
 return getDb().prepare("SELECT tt.work_date AS date,tt.minutes,tt.note,tt.billable,t.id AS ticket,o.name AS organization,o.account_type FROM ticket_time tt JOIN support_tickets t ON t.id=tt.ticket_id JOIN organizations o ON o.id=t.organization_id WHERE substr(tt.work_date,1,7)=? ORDER BY tt.work_date").all(month).map(r=>({...r,billable:!!r.billable,organization:r.account_type==='business'?r.organization:'Privatkunde'}));
}
export function toCsv(rows){
 const esc=v=>{const s=String(v??'');return /[";\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
 // Prevent formula injection when opened in Excel.
 const safe=v=>{const s=String(v??'');return /^[=+\-@]/.test(s)?"'"+s:s};
 const head=['Datum','Anfrage','Kunde','Minuten','Stunden','Abrechenbar','Notiz'];
 return '﻿'+[head.join(';'),...rows.map(r=>[r.date,r.ticket,safe(r.organization),r.minutes,(r.minutes/60).toFixed(2).replace('.',','),r.billable?'ja':'nein',safe(r.note)].map(esc).join(';'))].join('\r\n');
}
