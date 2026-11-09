import tls from 'node:tls';
import {randomBytes,randomUUID} from 'node:crypto';
import {getDb,transaction} from './business-db.js';
import {appError,cleanString} from './business-auth.js';
import {notify} from './mailer.js';

// Überwachung: Websites (Erreichbarkeit und SSL-Zertifikat) und „Lebenszeichen“ von Kunden-Routern.
// Fällt etwas aus, entsteht automatisch eine Anfrage beim Kunden und eine E-Mail an den Inhaber.
const view=r=>({id:r.id,organizationId:r.organization_id,kind:r.kind,label:r.label,url:r.url,token:r.token,intervalMinutes:r.interval_minutes,state:r.state,lastCheckedAt:r.last_checked_at,lastOkAt:r.last_ok_at,lastChangeAt:r.last_change_at,sslExpiresAt:r.ssl_expires_at,lastError:r.last_error,ticketId:r.ticket_id});
export function listMonitors(orgId){return (orgId?getDb().prepare('SELECT * FROM monitors WHERE organization_id=? ORDER BY label').all(orgId):getDb().prepare("SELECT m.*,o.name AS org_name,o.account_type FROM monitors m JOIN organizations o ON o.id=m.organization_id ORDER BY CASE m.state WHEN 'gestört' THEN 0 WHEN 'warnung' THEN 1 ELSE 2 END,m.label").all()).map(r=>({...view(r),organization:r.org_name?(r.account_type==='business'?r.org_name:'Privatkunde'):undefined}))}

export function saveMonitor(orgId,input){
 const kind=['website','heartbeat'].includes(input.kind)?input.kind:null;if(!kind)throw appError('Bitte wählen Sie eine Art.');
 const label=cleanString(input.label,{required:true,max:80,label:'Bezeichnung'});
 let url='';
 if(kind==='website'){url=cleanString(input.url,{required:true,max:300,label:'Adresse'});if(!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url))url='https://'+url.replace(/^\/+/,'');try{const u=new URL(url);if(!['http:','https:'].includes(u.protocol))throw 0;url=u.toString()}catch{throw appError('Bitte geben Sie eine gültige Web-Adresse an.')}}
 const interval=[5,15,60].includes(Number(input.intervalMinutes))?Number(input.intervalMinutes):kind==='heartbeat'?5:15;
 const db=getDb();if(!db.prepare('SELECT 1 FROM organizations WHERE id=?').get(orgId))throw appError('Konto nicht gefunden.',404);
 const id=randomUUID();
 db.prepare('INSERT INTO monitors(id,organization_id,kind,label,url,token,interval_minutes,created_at) VALUES(?,?,?,?,?,?,?,?)').run(id,orgId,kind,label,url,kind==='heartbeat'?randomBytes(18).toString('base64url'):null,interval,Date.now());
 return id;
}
export function deleteMonitor(id){if(!getDb().prepare('DELETE FROM monitors WHERE id=?').run(String(id)).changes)throw appError('Überwachung nicht gefunden.',404)}

export function heartbeat(token){
 if(typeof token!=='string'||!/^[A-Za-z0-9_-]{20,40}$/.test(token))return false;
 const db=getDb(),m=db.prepare("SELECT * FROM monitors WHERE token=? AND kind='heartbeat'").get(token);if(!m)return false;
 const now=Date.now();db.prepare('UPDATE monitors SET last_ok_at=?,last_checked_at=? WHERE id=?').run(now,now,m.id);
 if(m.state!=='ok')transition(m,'ok','');
 return true;
}

function certificateExpiry(url){
 return new Promise(resolve=>{
  let u;try{u=new URL(url)}catch{return resolve(null)}
  if(u.protocol!=='https:')return resolve(null);
  const socket=tls.connect({host:u.hostname,port:Number(u.port)||443,servername:u.hostname,timeout:8000},()=>{const c=socket.getPeerCertificate();socket.end();resolve(c?.valid_to?Date.parse(c.valid_to):null)});
  socket.on('error',()=>resolve(null));socket.on('timeout',()=>{socket.destroy();resolve(null)});
 });
}

async function checkWebsite(m){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 try{
  const r=await fetch(m.url,{redirect:'follow',signal:controller.signal,headers:{'User-Agent':'FUNKNAHT-Ueberwachung/1.0'}});
  clearTimeout(timer);
  const ssl=await certificateExpiry(m.url);
  if(r.status>=400)return {ok:false,error:'Antwort '+r.status,ssl};
  if(ssl&&ssl-Date.now()<14*86400000)return {ok:true,warn:'SSL-Zertifikat läuft am '+new Date(ssl).toLocaleDateString('de-DE')+' ab',ssl};
  return {ok:true,ssl};
 }catch(e){clearTimeout(timer);return {ok:false,error:e.name==='AbortError'?'Keine Antwort innerhalb von 10 Sekunden':'Nicht erreichbar'}}
}

function ticketUser(orgId){return getDb().prepare('SELECT id FROM users WHERE organization_id=? ORDER BY created_at LIMIT 1').get(orgId)?.id}
function transition(m,state,error){
 const db=getDb(),now=Date.now(),ts=new Date().toISOString();
 transaction(tx=>{
  tx.prepare('UPDATE monitors SET state=?,last_change_at=?,last_error=? WHERE id=?').run(state,now,error,m.id);
  if(state==='gestört'){
   const user=ticketUser(m.organization_id);if(!user)return;
   const id='FN-'+randomUUID().slice(0,8).toUpperCase();
   tx.prepare("INSERT INTO support_tickets(id,organization_id,user_id,payload,status,priority,awaiting,source,created_at,updated_at,last_activity_at) VALUES(?,?,?,?,'offen','dringend','owner','ueberwachung',?,?,?)").run(id,m.organization_id,user,JSON.stringify({kind:'problem',category:m.kind==='website'?'website':'internet-wlan',description:`Automatische Meldung: „${m.label}“ ist gestört. ${error}`.trim(),device:m.url||'',name:'Überwachung',email:'',location:'',attempts:[]}),ts,ts,ts);
   tx.prepare("INSERT INTO ticket_messages(id,ticket_id,author,body,internal,created_at) VALUES(?,?,'system',?,0,?)").run(randomUUID(),id,'Wir haben die Störung automatisch bemerkt und kümmern uns darum.',ts);
   tx.prepare('UPDATE monitors SET ticket_id=? WHERE id=?').run(id,m.id);
  }else if(state==='ok'&&m.ticket_id){
   tx.prepare("INSERT INTO ticket_messages(id,ticket_id,author,body,internal,created_at) VALUES(?,?,'system',?,0,?)").run(randomUUID(),m.ticket_id,`„${m.label}“ ist wieder erreichbar.`,ts);
   tx.prepare('UPDATE support_tickets SET updated_at=?,last_activity_at=? WHERE id=?').run(ts,ts,m.ticket_id);
   tx.prepare('UPDATE monitors SET ticket_id=NULL WHERE id=?').run(m.id);
  }
 });
 if(state!=='warnung')notify({to:process.env.EMAIL_TO,subject:(state==='gestört'?'Störung: ':'Wieder in Ordnung: ')+m.label,text:`${m.label}${m.url?' ('+m.url+')':''}\nZustand: ${state}${error?'\n'+error:''}\n\nDetails im Inhaberbereich unter „Überwachung“.`});
}

export async function runMonitors(now=Date.now()){
 const db=getDb(),due=db.prepare('SELECT * FROM monitors').all().filter(m=>!m.last_checked_at||now-m.last_checked_at>=m.interval_minutes*60000-30000||m.kind==='heartbeat');
 let checked=0;
 for(const m of due){
  if(m.kind==='heartbeat'){
   // Gestört, wenn drei Lebenszeichen in Folge fehlen.
   const silentFor=now-(m.last_ok_at||m.created_at);
   if(silentFor>m.interval_minutes*3*60000+60000&&m.state!=='gestört')transition(m,'gestört','Seit '+Math.round(silentFor/60000)+' Minuten kein Lebenszeichen vom Gerät.');
   continue;
  }
  const r=await checkWebsite(m);checked++;
  const fails=r.ok?0:m.fail_count+1;
  db.prepare('UPDATE monitors SET last_checked_at=?,fail_count=?,ssl_expires_at=COALESCE(?,ssl_expires_at),last_ok_at=CASE WHEN ? THEN ? ELSE last_ok_at END WHERE id=?').run(now,fails,r.ssl||null,r.ok?1:0,now,m.id);
  // Erst nach zwei Fehlschlägen in Folge melden, damit kurze Aussetzer keinen Alarm auslösen.
  const next=!r.ok?(fails>=2?'gestört':m.state):r.warn?'warnung':'ok';
  if(next!==m.state)transition({...m,fail_count:fails},next,r.error||r.warn||'');
 }
 return checked;
}

export function heartbeatScript(token,base){
 const url=`${base}/api/heartbeat/${token}`;
 return {
  mikrotik:`/system scheduler add name=funknaht-lebenszeichen interval=5m start-time=startup on-event="/tool fetch url=\\"${url}\\" keep-result=no"`,
  linux:`*/5 * * * * curl -fsS -m 10 ${url} >/dev/null`,
 };
}
