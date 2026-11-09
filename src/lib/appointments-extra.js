import {randomBytes} from 'node:crypto';
import {getDb,getSettings} from './business-db.js';
import {appError} from './business-auth.js';
import {notify} from './mailer.js';

// Terminverwaltung für Endkunden (Link aus der E-Mail), Erinnerungen und Kalender-Abo.
const fmt=v=>new Intl.DateTimeFormat('de-DE',{dateStyle:'full',timeStyle:'short',timeZone:'Europe/Berlin'}).format(new Date(v));
export function baseUrl(){return (process.env.APP_URL||process.env.SITE_URL||'http://127.0.0.1:3000').replace(/\/$/,'')}

function byToken(token){
 if(typeof token!=='string'||!/^[A-Za-z0-9_-]{30,40}$/.test(token))throw appError('Dieser Link ist ungültig.',404,'NOT_FOUND');
 const r=getDb().prepare('SELECT a.*,s.name AS service_name,s.duration_minutes,o.name AS org_name,o.slug,(SELECT email FROM users WHERE organization_id=o.id ORDER BY created_at LIMIT 1) AS org_email FROM appointments a JOIN services s ON s.id=a.service_id JOIN organizations o ON o.id=a.organization_id WHERE a.manage_token=?').get(token);
 if(!r)throw appError('Dieser Termin wurde nicht gefunden.',404,'NOT_FOUND');
 return r;
}
export function manageView(token){
 const r=byToken(token);
 return {organization:r.org_name,slug:r.slug,service:r.service_name,durationMinutes:r.duration_minutes,startsAt:new Date(r.starts_at).toISOString(),status:r.status,customerName:r.customer_name,canCancel:['pending','confirmed'].includes(r.status)&&r.starts_at>Date.now()};
}
export function cancelByCustomer(token){
 const r=byToken(token);
 if(!['pending','confirmed'].includes(r.status)||r.starts_at<=Date.now())throw appError('Dieser Termin kann nicht mehr abgesagt werden.',409);
 getDb().prepare("UPDATE appointments SET status='cancelled',updated_at=? WHERE id=?").run(Date.now(),r.id);
 notify({to:r.org_email,subject:'Termin abgesagt: '+r.service_name,text:`${r.customer_name} hat den Termin abgesagt.\n\n${r.service_name}\n${fmt(r.starts_at)} Uhr\n\nDie Zeit ist wieder frei buchbar.`});
 return manageView(token);
}
export function manageLink(id){
 const db=getDb();let row=db.prepare('SELECT manage_token FROM appointments WHERE id=?').get(id);
 if(row&&!row.manage_token){const t=randomBytes(24).toString('base64url');db.prepare('UPDATE appointments SET manage_token=? WHERE id=?').run(t,id);row={manage_token:t}}
 return row?baseUrl()+'/termin/'+row.manage_token:null;
}

// Erinnerung am Vortag: für bestätigte und angefragte Termine in den nächsten 24 Stunden.
export function sendReminders(now=Date.now()){
 const db=getDb();
 const rows=db.prepare("SELECT a.*,s.name AS service_name,o.name AS org_name,o.settings_json FROM appointments a JOIN services s ON s.id=a.service_id JOIN organizations o ON o.id=a.organization_id WHERE a.status IN ('pending','confirmed') AND a.reminder_sent_at IS NULL AND a.customer_email<>'' AND a.starts_at>? AND a.starts_at<=? AND a.created_at<a.starts_at-6*3600000").all(now+2*3600000,now+26*3600000);
 let sent=0;
 for(const r of rows){
  if(getSettings({settings_json:r.settings_json}).reminders===false)continue;
  const link=manageLink(r.id);
  notify({to:r.customer_email,subject:'Erinnerung: Ihr Termin bei '+r.org_name,text:`Guten Tag ${r.customer_name},\n\nwir erinnern Sie an Ihren Termin:\n\n${r.service_name}\n${fmt(r.starts_at)} Uhr\n${r.org_name}\n\nSie können nicht? Dann sagen Sie bitte hier ab, damit jemand anderes die Zeit nutzen kann:\n${link}\n\nDiese Nachricht wurde automatisch versendet.`});
  db.prepare('UPDATE appointments SET reminder_sent_at=? WHERE id=?').run(now,r.id);sent++;
 }
 return sent;
}

// Kalender-Abo (iCal) für das Handy des Betriebs. Der Link ist geheim und kann neu erzeugt werden.
export function calendarToken(orgId,{renew=false}={}){
 const db=getDb(),org=db.prepare('SELECT calendar_token FROM organizations WHERE id=?').get(orgId);
 if(org?.calendar_token&&!renew)return org.calendar_token;
 const t=randomBytes(24).toString('base64url');db.prepare('UPDATE organizations SET calendar_token=? WHERE id=?').run(t,orgId);return t;
}
const icsDate=v=>new Date(v).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
const esc=v=>String(v||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,m=>'\\'+m);
export function calendarFeed(token){
 if(typeof token!=='string'||!/^[A-Za-z0-9_-]{30,40}$/.test(token))return null;
 const db=getDb(),org=db.prepare('SELECT * FROM organizations WHERE calendar_token=?').get(token);if(!org)return null;
 const rows=db.prepare("SELECT a.*,s.name AS service_name FROM appointments a JOIN services s ON s.id=a.service_id WHERE a.organization_id=? AND a.status<>'cancelled' AND a.starts_at>?").all(org.id,Date.now()-60*86400000);
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//FUNKNAHT//Betriebsportal//DE','CALSCALE:GREGORIAN','X-WR-CALNAME:'+esc(org.name),'X-WR-TIMEZONE:Europe/Berlin',
  ...rows.flatMap(r=>['BEGIN:VEVENT','UID:'+r.id+'@funknaht','DTSTAMP:'+icsDate(r.updated_at),'DTSTART:'+icsDate(r.starts_at),'DTEND:'+icsDate(r.ends_at),'SUMMARY:'+esc(r.service_name+' – '+r.customer_name+(r.status==='pending'?' (angefragt)':'')),'DESCRIPTION:'+esc([r.customer_phone&&'Tel. '+r.customer_phone,r.customer_email,r.notes].filter(Boolean).join('\n')),'STATUS:'+(r.status==='pending'?'TENTATIVE':'CONFIRMED'),'END:VEVENT']),'END:VCALENDAR'];
 return lines.map(l=>l.length>74?l.match(/.{1,74}/g).join('\r\n '):l).join('\r\n')+'\r\n';
}
