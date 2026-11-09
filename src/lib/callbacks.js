import {randomUUID} from 'node:crypto';
import {getDb,transaction} from './business-db.js';
import {appError,cleanString} from './business-auth.js';
import {PRIORITIES} from './tickets.js';
import {categories} from './portal-knowledge.js';

// Rückruf-Wünsche: ohne Konto, nur das Nötigste. Erledigte werden nach 90 Tagen gelöscht.
export const callbackTopics=['Internet & WLAN','Smartphone oder Tablet','Online-Banking','Ist das Betrug?','Computer oder Drucker','Website oder Software','Termin vereinbaren','Etwas anderes'];
export const timeWindows=['Egal','Vormittags','Mittags','Nachmittags','Abends'];

export function cleanPhone(value){
 const phone=cleanString(value,{required:true,max:40,label:'Telefonnummer'});
 const digits=phone.replace(/\D/g,'');
 if(!/^[+\d][\d\s/()\-]*$/.test(phone)||digits.length<6||digits.length>16)throw appError('Bitte geben Sie eine gültige Telefonnummer an.');
 return phone;
}

export function createCallback(input){
 const name=cleanString(input.name,{required:true,max:120,label:'Name'});
 if(/[\r\n]/.test(name))throw appError('Bitte prüfen Sie den Namen.');
 const phone=cleanPhone(input.phone);
 const topic=callbackTopics.includes(input.topic)?input.topic:'Etwas anderes';
 const window=timeWindows.includes(input.timeWindow)?input.timeWindow:'Egal';
 const note=cleanString(input.note,{max:600,label:'Hinweis'});
 if(input.consent!==true)throw appError('Bitte bestätigen Sie, dass wir Sie zurückrufen dürfen.');
 const id=randomUUID();
 getDb().prepare('INSERT INTO callbacks(id,name,phone,topic,time_window,note,created_at) VALUES(?,?,?,?,?,?,?)').run(id,name,phone,topic,window,note,Date.now());
 return {id,name,topic,timeWindow:window};
}

export function listCallbacks(){
 return getDb().prepare("SELECT * FROM callbacks ORDER BY CASE status WHEN 'neu' THEN 0 ELSE 1 END,created_at DESC LIMIT 300").all().map(r=>({id:r.id,name:r.name,phone:r.phone,topic:r.topic,timeWindow:r.time_window,note:r.note,status:r.status,ticketId:r.ticket_id,createdAt:r.created_at,doneAt:r.done_at}));
}

export function setCallbackStatus(id,status){
 if(!['neu','erledigt'].includes(status))throw appError('Ungültiger Stand.');
 const r=getDb().prepare('UPDATE callbacks SET status=?,done_at=? WHERE id=?').run(status,status==='erledigt'?Date.now():null,String(id));
 if(!r.changes)throw appError('Rückruf nicht gefunden.',404,'NOT_FOUND');
}

// Telefon-Anfragen hängen am Konto des Inhabers, weil der Anrufer oft kein eigenes Konto hat.
export function createPhoneTicket(ownerAccount,input){
 const name=cleanString(input.name,{required:true,max:120,label:'Name'});
 const phone=input.phone?cleanPhone(input.phone):'';
 const email=cleanString(input.email,{max:254,label:'E-Mail'}).toLowerCase();
 if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw appError('Bitte prüfen Sie die E-Mail-Adresse.');
 const description=cleanString(input.description,{required:true,max:4000,label:'Beschreibung'});
 if(description.length<5)throw appError('Bitte beschreiben Sie das Anliegen kurz.');
 const category=categories.some(c=>c.id===input.category)?input.category:'computer-software';
 const priority=PRIORITIES.includes(input.priority)?input.priority:'normal';
 const location=cleanString(input.location,{max:150,label:'Ort'});
 const minutes=input.minutes===undefined||input.minutes===''?0:Number(input.minutes);
 if(!Number.isInteger(minutes)||minutes<0||minutes>600)throw appError('Bitte prüfen Sie die Minuten.');
 const id='FN-'+randomUUID().slice(0,8).toUpperCase(),ts=new Date().toISOString();
 transaction(db=>{
  db.prepare("INSERT INTO support_tickets(id,organization_id,user_id,payload,status,priority,awaiting,source,created_at,updated_at,last_activity_at) VALUES(?,?,?,?,'in-pruefung',?,'owner','telefon',?,?,?)").run(id,ownerAccount.organization.id,ownerAccount.user.id,JSON.stringify({kind:'problem',category,description,device:cleanString(input.device,{max:180}),name,email,phone,location,attempts:[]}),priority,ts,ts,ts);
  if(minutes>0)db.prepare('INSERT INTO ticket_time(id,ticket_id,minutes,note,billable,work_date,created_at) VALUES(?,?,?,?,1,?,?)').run(randomUUID(),id,minutes,'Telefonat',ts.slice(0,10),ts);
  if(input.callbackId)db.prepare("UPDATE callbacks SET status='erledigt',ticket_id=?,done_at=? WHERE id=?").run(id,Date.now(),String(input.callbackId));
 });
 return id;
}

export function purgeCallbacks(now=Date.now()){
 return getDb().prepare("DELETE FROM callbacks WHERE (status='erledigt' AND done_at<?) OR created_at<?").run(now-90*86400000,now-180*86400000).changes;
}
