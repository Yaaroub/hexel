import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID,randomBytes} from 'node:crypto';
import {getEffectivePlan,getPlan,hasFeature} from './business-plans.js';

let connection;
export function getDb(){
 if(connection)return connection;
 const file=process.env.NODE_ENV==='test'&&process.env.BUSINESS_DB_PATH?process.env.BUSINESS_DB_PATH:path.join(process.cwd(),'.local','business.sqlite');
 fs.mkdirSync(path.dirname(file),{recursive:true});
 connection=new DatabaseSync(file);
 connection.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
 connection.exec(`
 CREATE TABLE IF NOT EXISTS organizations(
  id TEXT PRIMARY KEY,name TEXT NOT NULL,slug TEXT NOT NULL UNIQUE,account_type TEXT NOT NULL CHECK(account_type IN ('private','business')),
  plan TEXT NOT NULL DEFAULT 'free',billing_customer_id TEXT,billing_subscription_id TEXT,billing_status TEXT NOT NULL DEFAULT 'none',current_period_end INTEGER,billing_updated_at INTEGER NOT NULL DEFAULT 0,
  sandbox_enabled INTEGER NOT NULL DEFAULT 0,sandbox_plan TEXT,settings_json TEXT NOT NULL DEFAULT '{}',created_at INTEGER NOT NULL
 );
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL REFERENCES organizations(id),name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
 CREATE TABLE IF NOT EXISTS clients(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL REFERENCES organizations(id),name TEXT NOT NULL,email TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',notes TEXT NOT NULL DEFAULT '',created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS clients_tenant ON clients(organization_id);
 CREATE TABLE IF NOT EXISTS services(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL REFERENCES organizations(id),name TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',duration_minutes INTEGER NOT NULL,price_cents INTEGER NOT NULL DEFAULT 0,active INTEGER NOT NULL DEFAULT 1,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS services_tenant ON services(organization_id);
 CREATE TABLE IF NOT EXISTS appointments(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL REFERENCES organizations(id),service_id TEXT NOT NULL REFERENCES services(id),client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,customer_name TEXT NOT NULL,customer_email TEXT NOT NULL DEFAULT '',customer_phone TEXT NOT NULL DEFAULT '',notes TEXT NOT NULL DEFAULT '',starts_at INTEGER NOT NULL,ends_at INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled')),created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS appointments_window ON appointments(organization_id,starts_at,ends_at);
 CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL REFERENCES organizations(id),client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','completed','cancelled')),amount_cents INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS orders_tenant ON orders(organization_id);
 CREATE TABLE IF NOT EXISTS billing_events(id TEXT PRIMARY KEY,organization_id TEXT,type TEXT,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS ai_usage(organization_id TEXT NOT NULL REFERENCES organizations(id),period TEXT NOT NULL,count INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(organization_id,period));
 CREATE TABLE IF NOT EXISTS support_tickets(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,payload TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'offen',created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS support_tickets_org ON support_tickets(organization_id);
 CREATE TABLE IF NOT EXISTS ticket_messages(id TEXT PRIMARY KEY,ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,author TEXT NOT NULL CHECK(author IN ('customer','owner','system')),author_user_id TEXT,body TEXT NOT NULL,internal INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS ticket_messages_ticket ON ticket_messages(ticket_id,created_at);
 CREATE TABLE IF NOT EXISTS ticket_attachments(id TEXT PRIMARY KEY,ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,message_id TEXT,author TEXT NOT NULL,filename TEXT NOT NULL,mime TEXT NOT NULL,size INTEGER NOT NULL,internal INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS ticket_attachments_ticket ON ticket_attachments(ticket_id);
 CREATE TABLE IF NOT EXISTS ticket_time(id TEXT PRIMARY KEY,ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,minutes INTEGER NOT NULL,note TEXT NOT NULL DEFAULT '',billable INTEGER NOT NULL DEFAULT 1,work_date TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS ticket_time_ticket ON ticket_time(ticket_id);
 CREATE TABLE IF NOT EXISTS callbacks(id TEXT PRIMARY KEY,name TEXT NOT NULL,phone TEXT NOT NULL,topic TEXT NOT NULL DEFAULT '',time_window TEXT NOT NULL DEFAULT '',note TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'neu',ticket_id TEXT,created_at INTEGER NOT NULL,done_at INTEGER);
 CREATE TABLE IF NOT EXISTS devices(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,kind TEXT NOT NULL,label TEXT NOT NULL,vendor TEXT NOT NULL DEFAULT '',model TEXT NOT NULL DEFAULT '',location TEXT NOT NULL DEFAULT '',serial TEXT NOT NULL DEFAULT '',firmware TEXT NOT NULL DEFAULT '',installed_on TEXT,warranty_until TEXT,notes TEXT NOT NULL DEFAULT '',qr_token TEXT NOT NULL UNIQUE,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS devices_org ON devices(organization_id);
 CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY,number TEXT NOT NULL UNIQUE,type TEXT NOT NULL CHECK(type IN ('angebot','rechnung')),organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,ticket_id TEXT,recipient TEXT NOT NULL,items TEXT NOT NULL DEFAULT '[]',status TEXT NOT NULL DEFAULT 'entwurf',issued_on TEXT,due_on TEXT,intro TEXT NOT NULL DEFAULT '',notes TEXT NOT NULL DEFAULT '',settings TEXT NOT NULL DEFAULT '{}',responded_at INTEGER,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS documents_org ON documents(organization_id);
 CREATE TABLE IF NOT EXISTS owner_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS monitors(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,kind TEXT NOT NULL CHECK(kind IN ('website','heartbeat')),label TEXT NOT NULL,url TEXT NOT NULL DEFAULT '',token TEXT UNIQUE,interval_minutes INTEGER NOT NULL DEFAULT 5,state TEXT NOT NULL DEFAULT 'unbekannt',fail_count INTEGER NOT NULL DEFAULT 0,last_checked_at INTEGER,last_ok_at INTEGER,last_change_at INTEGER,ssl_expires_at INTEGER,last_error TEXT NOT NULL DEFAULT '',ticket_id TEXT,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS notices(id TEXT PRIMARY KEY,title TEXT NOT NULL,body TEXT NOT NULL DEFAULT '',level TEXT NOT NULL DEFAULT 'info',area TEXT NOT NULL DEFAULT '',starts_at INTEGER NOT NULL,ends_at INTEGER,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS account_links(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,token_hash TEXT NOT NULL UNIQUE,label TEXT NOT NULL DEFAULT '',created_at INTEGER NOT NULL,expires_at INTEGER NOT NULL,accepted_at INTEGER);
 CREATE TABLE IF NOT EXISTS team_invites(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,email TEXT NOT NULL,role TEXT NOT NULL,token_hash TEXT NOT NULL UNIQUE,created_at INTEGER NOT NULL,expires_at INTEGER NOT NULL,accepted_at INTEGER);
 CREATE TABLE IF NOT EXISTS owner_audit(id TEXT PRIMARY KEY,actor_user_id TEXT NOT NULL,action TEXT NOT NULL,target TEXT,created_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS owner_audit_time ON owner_audit(created_at);
 `);
 migrate(connection);
 return connection;
}
// Additive migrations for databases created by earlier versions.
function migrate(db){
 const columns=table=>new Set(db.prepare(`PRAGMA table_info(${table})`).all().map(column=>column.name));
 const add=(table,column,definition)=>{if(!columns(table).has(column))db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)};
 add('users','last_login_at','INTEGER');
 add('sessions','elevated_until','INTEGER NOT NULL DEFAULT 0');
 add('support_tickets','reply','TEXT');
 add('support_tickets','replied_at','TEXT');
 add('support_tickets','anonymized_at','TEXT');
 add('support_tickets','priority',"TEXT NOT NULL DEFAULT 'normal'");
 add('support_tickets','awaiting',"TEXT NOT NULL DEFAULT 'owner'");
 add('support_tickets','diagnostics','TEXT');
 add('support_tickets','last_activity_at','TEXT');
 add('users','role',"TEXT NOT NULL DEFAULT 'inhaber'");
 add('organizations','calendar_token','TEXT');
 // Zugang: Freischaltung, Sperre, Testphase und Nutzungsende (siehe lib/access.js)
 add('organizations','access_status',"TEXT NOT NULL DEFAULT 'aktiv'");
 add('organizations','access_reason','TEXT');
 add('organizations','trial_plan','TEXT');
 add('organizations','trial_until','INTEGER');
 add('organizations','access_until','INTEGER');
 add('organizations','trial_notice_at','INTEGER');
 add('organizations','approved_at','INTEGER');
 add('appointments','manage_token','TEXT');
 add('appointments','reminder_sent_at','INTEGER');
 add('support_tickets','source',"TEXT NOT NULL DEFAULT 'portal'");
 add('support_tickets','rating','INTEGER');
 add('support_tickets','rating_comment','TEXT');
 add('support_tickets','rating_public','INTEGER NOT NULL DEFAULT 0');
 add('support_tickets','device_id','TEXT');
 add('ticket_time','document_id','TEXT');
 db.exec('CREATE UNIQUE INDEX IF NOT EXISTS appointments_manage ON appointments(manage_token)');
 // FUNKNAHT AI und Team: Mitarbeiter, Aufgaben, KI-Vorschläge mit Freigabe, KI-Protokoll (nur Metadaten, keine Inhalte).
 add('organizations','internal','INTEGER NOT NULL DEFAULT 0');
 add('ticket_time','user_id','TEXT');
 db.exec(`CREATE TABLE IF NOT EXISTS staff_members(id TEXT PRIMARY KEY,user_id TEXT UNIQUE,email TEXT NOT NULL,name TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('admin','mitarbeiter')),active INTEGER NOT NULL DEFAULT 1,invite_hash TEXT UNIQUE,invite_expires INTEGER,created_at INTEGER NOT NULL,accepted_at INTEGER);
 CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,title TEXT NOT NULL,notes TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'offen' CHECK(status IN ('offen','erledigt')),assignee_user_id TEXT,created_by TEXT NOT NULL,organization_id TEXT,ticket_id TEXT,due_on TEXT,source TEXT NOT NULL DEFAULT 'manuell',created_at INTEGER NOT NULL,done_at INTEGER,done_by TEXT);
 CREATE INDEX IF NOT EXISTS tasks_assignee ON tasks(assignee_user_id,status);
 CREATE TABLE IF NOT EXISTS ai_actions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,organization_id TEXT,surface TEXT NOT NULL,kind TEXT NOT NULL,input TEXT NOT NULL,summary TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'offen',result TEXT,created_at INTEGER NOT NULL,decided_at INTEGER);
 CREATE INDEX IF NOT EXISTS ai_actions_user ON ai_actions(user_id,status);
 CREATE TABLE IF NOT EXISTS ai_log(id TEXT PRIMARY KEY,surface TEXT NOT NULL,user_id TEXT,organization_id TEXT,role TEXT,provider TEXT,model TEXT,input_tokens INTEGER NOT NULL DEFAULT 0,output_tokens INTEGER NOT NULL DEFAULT 0,ms INTEGER NOT NULL DEFAULT 0,steps INTEGER NOT NULL DEFAULT 0,tools TEXT NOT NULL DEFAULT '[]',status TEXT NOT NULL,error_code TEXT,escalated INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS ai_log_time ON ai_log(created_at);`);
 // Version 3: single replies become the first owner message of a conversation.
 if((db.prepare('PRAGMA user_version').get()?.user_version||0)<3){
  for(const row of db.prepare("SELECT id,reply,replied_at,updated_at FROM support_tickets WHERE reply IS NOT NULL AND reply<>''").all()){
   if(!db.prepare('SELECT 1 FROM ticket_messages WHERE ticket_id=?').get(row.id))db.prepare("INSERT INTO ticket_messages(id,ticket_id,author,body,internal,created_at) VALUES(?,?,'owner',?,0,?)").run(randomUUID(),row.id,row.reply,row.replied_at||row.updated_at);
  }
  db.exec("UPDATE support_tickets SET last_activity_at=COALESCE(last_activity_at,updated_at)");
 }
 db.exec('PRAGMA user_version=4');
}
// Gesperrte, abgelaufene oder wartende Konten nehmen keine Online-Buchungen an.
function bookingClosed(org){const st=org.access_status||'aktiv';return st!=='aktiv'||(org.access_until&&org.access_until<=Date.now())}
export function closeDb(){connection?.close();connection=undefined}
export function transaction(fn){const db=getDb();db.exec('BEGIN IMMEDIATE');try{const result=fn(db);db.exec('COMMIT');return result}catch(error){db.exec('ROLLBACK');throw error}}
export function newId(){return randomUUID()}
export const defaultSettings={workingDays:[1,2,3,4,5],openTime:'09:00',closeTime:'17:00',slotMinutes:30,bookingEnabled:true,reminders:true,timezone:'Europe/Berlin'};
export function getSettings(organization){let stored={};try{stored=JSON.parse(organization.settings_json||'{}')}catch{}return {...defaultSettings,...stored,timezone:'Europe/Berlin'}}

function fail(message,status=400,code='INVALID_REQUEST'){throw Object.assign(new Error(message),{status,code})}
export function assertFeature(org,feature){if(!hasFeature(getEffectivePlan(org),feature))fail('Diese Funktion ist in Ihrem aktuellen Tarif nicht enthalten.',403,'PLAN_REQUIRED')}
const berlin=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
export function localParts(instant){const parts=Object.fromEntries(berlin.formatToParts(new Date(instant)).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));return {date:`${parts.year}-${parts.month}-${parts.day}`,time:`${parts.hour}:${parts.minute}`,year:Number(parts.year),month:Number(parts.month),day:Number(parts.day),hour:Number(parts.hour),minute:Number(parts.minute)}}
export function validDate(date){return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date+'T12:00:00Z'))&&new Date(date+'T12:00:00Z').toISOString().slice(0,10)===date}
function minutes(value){if(typeof value!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))fail('Die Uhrzeit ist ungültig.');const [hour,minute]=value.split(':').map(Number);return hour*60+minute}
export function localToEpoch(date,time){if(!validDate(date))fail('Das Datum ist ungültig.');minutes(time);const target=Date.parse(date+'T'+time+':00Z');let value=target;for(let i=0;i<3;i++){const parts=localParts(value);const rendered=Date.parse(parts.date+'T'+parts.time+':00Z');value+=target-rendered}const check=localParts(value);if(check.date!==date||check.time!==time||[value-3600000,value+3600000].some(alternative=>{const candidate=localParts(alternative);return candidate.date===date&&candidate.time===time}))fail('Diese lokale Uhrzeit ist nicht eindeutig verfügbar.');return value}
export function monthWindow(month){if(!/^\d{4}-\d{2}$/.test(month)||!validDate(month+'-01'))fail('Der Monat ist ungültig.');const [year,number]=month.split('-').map(Number),next=new Date(Date.UTC(year,number,1)).toISOString().slice(0,7);return [localToEpoch(month+'-01','00:00'),localToEpoch(next+'-01','00:00')]}
export function serviceView(row){return {id:row.id,name:row.name,description:row.description,durationMinutes:row.duration_minutes,priceCents:row.price_cents,active:!!row.active}}
export function appointmentView(row){return {id:row.id,serviceId:row.service_id,clientId:row.client_id,customerName:row.customer_name,customerEmail:row.customer_email,customerPhone:row.customer_phone,notes:row.notes,startsAt:new Date(row.starts_at).toISOString(),endsAt:new Date(row.ends_at).toISOString(),status:row.status}}
export function clientView(row){return {id:row.id,name:row.name,email:row.email,phone:row.phone,notes:row.notes}}
export function orderView(row){return {id:row.id,clientId:row.client_id,title:row.title,description:row.description,status:row.status,amountCents:row.amount_cents}}
export function appointmentCount(orgId,month){const [start,end]=monthWindow(month);return getDb().prepare('SELECT COUNT(*) AS count FROM appointments WHERE organization_id=? AND starts_at>=? AND starts_at<?').get(orgId,start,end).count}
export function getAvailability({slug,date,serviceId}){
 const db=getDb(),org=db.prepare('SELECT * FROM organizations WHERE slug=?').get(slug);
 if(org&&bookingClosed(org))fail('Diese Buchungsseite ist gerade nicht verfügbar.',404,'NOT_FOUND');
 if(!org)fail('Diese Buchungsseite wurde nicht gefunden.',404,'NOT_FOUND');
 assertFeature(org,'booking');const settings=getSettings(org);if(!settings.bookingEnabled)fail('Für diesen Betrieb ist die Online-Buchung derzeit nicht geöffnet.',403,'BOOKING_DISABLED');
 if(!validDate(date))fail('Bitte wählen Sie ein gültiges Datum.');const today=localParts(Date.now()).date;if(date<today||Date.parse(date)-Date.parse(today)>366*86400000)fail('Buchungen sind innerhalb der nächsten 366 Tage möglich.');
 const services=db.prepare('SELECT * FROM services WHERE organization_id=? AND active=1 ORDER BY created_at').all(org.id),selected=serviceId?services.filter(service=>service.id===serviceId):services;
 if(serviceId&&!selected.length)fail('Diese Leistung ist nicht verfügbar.',404,'SERVICE_NOT_FOUND');
 const weekday=new Date(date+'T12:00:00Z').getUTCDay(),open=minutes(settings.openTime),close=minutes(settings.closeTime),slots=[];
 const atCapacity=appointmentCount(org.id,date.slice(0,7))>=getPlan(getEffectivePlan(org)).limits.appointmentsPerMonth;
 if(settings.workingDays.includes(weekday)&&!atCapacity){const dayStart=localToEpoch(date,'00:00'),dayEnd=dayStart+27*3600000;const busy=db.prepare("SELECT starts_at,ends_at FROM appointments WHERE organization_id=? AND status!='cancelled' AND starts_at<? AND ends_at>?").all(org.id,dayEnd,dayStart);for(const service of selected)for(let minute=open;minute+service.duration_minutes<=close;minute+=settings.slotMinutes){const time=String(Math.floor(minute/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0');let start;try{start=localToEpoch(date,time)}catch{continue}const end=start+service.duration_minutes*60000;if(start>Date.now()&&!busy.some(item=>item.starts_at<end&&item.ends_at>start))slots.push({startsAt:new Date(start).toISOString(),serviceId:service.id})}}
 return {organization:{name:org.name,slug:org.slug,timezone:'Europe/Berlin'},services:services.map(serviceView),slots,date};
}
function text(value,{required=false,max=500}={}){if(value==null&&!required)return '';if(typeof value!=='string'||value.trim().length>max||required&&!value.trim())fail('Eine erforderliche Angabe fehlt oder ist zu lang.');return value.trim()}
function email(value,required=false){const result=text(value,{required,max:254}).toLowerCase();if(result&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result))fail('Bitte geben Sie eine gültige E-Mail-Adresse an.');return result}
function integer(value,min,max,label){if(!Number.isInteger(value)||value<min||value>max)fail(label+' ist ungültig.');return value}
export function createAppointment(orgId,data,{publicBooking=false}={}){
 return transaction(db=>{
  const org=db.prepare('SELECT * FROM organizations WHERE id=?').get(orgId);if(!org)fail('Betrieb nicht gefunden.',404,'NOT_FOUND');assertFeature(org,publicBooking?'booking':'appointments');
  const settings=getSettings(org);if(publicBooking&&!settings.bookingEnabled)fail('Online-Buchung ist nicht geöffnet.',403,'BOOKING_DISABLED');
  const service=db.prepare('SELECT * FROM services WHERE id=? AND organization_id=? AND active=1').get(data.serviceId,orgId);if(!service)fail('Diese Leistung ist nicht verfügbar.',404,'SERVICE_NOT_FOUND');
  if(typeof data.startsAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::00(?:\.000)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(data.startsAt))fail('Ein eindeutiger Termin mit Zeitzone ist erforderlich.');
  const start=Date.parse(data.startsAt);if(!Number.isFinite(start)||start<=Date.now()||start>Date.now()+367*86400000)fail('Bitte wählen Sie einen zukünftigen Termin innerhalb eines Jahres.');
  const local=localParts(start),weekday=new Date(local.date+'T12:00:00Z').getUTCDay(),minute=local.hour*60+local.minute,open=minutes(settings.openTime),close=minutes(settings.closeTime),end=start+service.duration_minutes*60000;
  if(!settings.workingDays.includes(weekday)||minute<open||minute+service.duration_minutes>close||(minute-open)%settings.slotMinutes!==0||localParts(end).date!==local.date)fail('Dieser Termin liegt außerhalb der verfügbaren Zeiten.',409,'SLOT_UNAVAILABLE');
  if(appointmentCount(orgId,local.date.slice(0,7))>=getPlan(getEffectivePlan(org)).limits.appointmentsPerMonth)fail('Das monatliche Terminlimit dieses Tarifs ist erreicht.',403,'PLAN_LIMIT');
  if(db.prepare("SELECT id FROM appointments WHERE organization_id=? AND status!='cancelled' AND starts_at<? AND ends_at>? LIMIT 1").get(orgId,end,start))fail('Dieser Termin wurde inzwischen belegt. Bitte wählen Sie eine andere Zeit.',409,'BOOKING_CONFLICT');
  let client=null;if(data.clientId){client=db.prepare('SELECT * FROM clients WHERE id=? AND organization_id=?').get(data.clientId,orgId);if(!client)fail('Kunde nicht gefunden.',404,'CLIENT_NOT_FOUND')}
  const name=text(data.customerName??data.name??client?.name,{required:true,max:150}),mail=email(data.customerEmail??data.email??client?.email,publicBooking),phone=text(data.customerPhone??data.phone??client?.phone,{max:80}),notes=text(data.notes,{max:2000}),id=newId(),now=Date.now();
  db.prepare('INSERT INTO appointments(id,organization_id,service_id,client_id,customer_name,customer_email,customer_phone,notes,starts_at,ends_at,status,manage_token,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,orgId,service.id,client?.id||null,name,mail,phone,notes,start,end,'pending',randomBytes(24).toString('base64url'),now,now);
  return {ok:true,id,appointment:{id,startsAt:new Date(start).toISOString(),endsAt:new Date(end).toISOString(),status:'pending'}};
 });
}
export function publicBook(data){const org=getDb().prepare('SELECT * FROM organizations WHERE slug=?').get(text(data.slug,{required:true,max:80}));if(!org||bookingClosed(org))fail('Buchungsseite nicht gefunden.',404,'NOT_FOUND');return createAppointment(org.id,data,{publicBooking:true})}
export function mutateBusiness(orgId,data){
 if(data.action==='appointment.create')return createAppointment(orgId,data);
 return transaction(db=>{
  const org=db.prepare('SELECT * FROM organizations WHERE id=?').get(orgId);if(!org)fail('Betrieb nicht gefunden.',404,'NOT_FOUND');const plan=getPlan(getEffectivePlan(org)),now=Date.now(),creating=String(data.action||'').endsWith('.create'),id=creating?newId():data.id;
  if(typeof id!=='string'||id.length>80)fail('Ungültige Kennung.');
  if(data.action==='client.create'||data.action==='client.update'){
   assertFeature(org,'clients');const existing=db.prepare('SELECT id FROM clients WHERE id=? AND organization_id=?').get(id,orgId);if(data.action==='client.update'&&!existing)fail('Kunde nicht gefunden.',404,'NOT_FOUND');
   if(!existing&&db.prepare('SELECT COUNT(*) AS count FROM clients WHERE organization_id=?').get(orgId).count>=plan.limits.clients)fail('Das Kundenlimit dieses Tarifs ist erreicht.',403,'PLAN_LIMIT');
   const values=[text(data.name,{required:true,max:150}),email(data.email),text(data.phone,{max:80}),text(data.notes,{max:3000})];
   if(existing)db.prepare('UPDATE clients SET name=?,email=?,phone=?,notes=?,updated_at=? WHERE id=? AND organization_id=?').run(...values,now,id,orgId);else db.prepare('INSERT INTO clients(name,email,phone,notes,updated_at,id,organization_id,created_at) VALUES(?,?,?,?,?,?,?,?)').run(...values,now,id,orgId,now);return {ok:true,id};
  }
  if(data.action==='client.delete'){assertFeature(org,'clients');const result=db.prepare('DELETE FROM clients WHERE id=? AND organization_id=?').run(id,orgId);if(!result.changes)fail('Kunde nicht gefunden.',404,'NOT_FOUND');return {ok:true}}
  if(data.action==='service.create'||data.action==='service.update'){
   assertFeature(org,'services');const existing=db.prepare('SELECT * FROM services WHERE id=? AND organization_id=?').get(id,orgId);if(data.action==='service.update'&&!existing)fail('Leistung nicht gefunden.',404,'NOT_FOUND');
   if(!existing&&db.prepare('SELECT COUNT(*) AS count FROM services WHERE organization_id=?').get(orgId).count>=plan.limits.services)fail('Das Leistungslimit dieses Tarifs ist erreicht.',403,'PLAN_LIMIT');
   const duration=integer(data.durationMinutes??existing?.duration_minutes,15,480,'Dauer');if(duration%5!==0)fail('Die Dauer muss in Schritten von fünf Minuten angegeben werden.');
   const values=[text(data.name??existing?.name,{required:true,max:150}),text(data.description??existing?.description,{max:2000}),duration,integer(data.priceCents??existing?.price_cents??0,0,100000000,'Preis'),data.active===undefined?(existing?.active??1):data.active===true?1:data.active===false?0:fail('Der Leistungsstatus ist ungültig.')];
   if(existing)db.prepare('UPDATE services SET name=?,description=?,duration_minutes=?,price_cents=?,active=?,updated_at=? WHERE id=? AND organization_id=?').run(...values,now,id,orgId);else db.prepare('INSERT INTO services(name,description,duration_minutes,price_cents,active,updated_at,id,organization_id,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run(...values,now,id,orgId,now);return {ok:true,id};
  }
  if(data.action==='appointment.update'){
   assertFeature(org,'appointments');const existing=db.prepare('SELECT * FROM appointments WHERE id=? AND organization_id=?').get(id,orgId);if(!existing)fail('Termin nicht gefunden.',404,'NOT_FOUND');if(!['pending','confirmed','completed','cancelled'].includes(data.status))fail('Der Terminstatus ist ungültig.');
   if(existing.status==='cancelled'&&data.status!=='cancelled'&&db.prepare("SELECT id FROM appointments WHERE organization_id=? AND id!=? AND status!='cancelled' AND starts_at<? AND ends_at>? LIMIT 1").get(orgId,id,existing.ends_at,existing.starts_at))fail('Die Zeit ist inzwischen anderweitig belegt.',409,'BOOKING_CONFLICT');
   db.prepare('UPDATE appointments SET status=?,updated_at=? WHERE id=? AND organization_id=?').run(data.status,now,id,orgId);return {ok:true,id};
  }
  if(data.action==='order.create'||data.action==='order.update'){
   assertFeature(org,'orders');const existing=db.prepare('SELECT * FROM orders WHERE id=? AND organization_id=?').get(id,orgId);if(data.action==='order.update'&&!existing)fail('Auftrag nicht gefunden.',404,'NOT_FOUND');
   const clientId=data.clientId??existing?.client_id??null;if(clientId&&!db.prepare('SELECT id FROM clients WHERE id=? AND organization_id=?').get(clientId,orgId))fail('Kunde nicht gefunden.',404,'CLIENT_NOT_FOUND');const status=data.status??existing?.status??'open';if(!['open','in_progress','completed','cancelled'].includes(status))fail('Der Auftragsstatus ist ungültig.');
   const values=[clientId||null,text(data.title??existing?.title,{required:true,max:200}),text(data.description??existing?.description,{max:5000}),status,integer(data.amountCents??existing?.amount_cents??0,0,100000000,'Betrag')];
   if(existing)db.prepare('UPDATE orders SET client_id=?,title=?,description=?,status=?,amount_cents=?,updated_at=? WHERE id=? AND organization_id=?').run(...values,now,id,orgId);else db.prepare('INSERT INTO orders(client_id,title,description,status,amount_cents,updated_at,id,organization_id,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run(...values,now,id,orgId,now);return {ok:true,id};
  }
  if(data.action==='settings.update'){
   const settings=getSettings(org);if(data.workingDays!==undefined){if(!Array.isArray(data.workingDays)||data.workingDays.length>7||!data.workingDays.every(day=>Number.isInteger(day)&&day>=0&&day<=6))fail('Die Arbeitstage sind ungültig.');settings.workingDays=[...new Set(data.workingDays)].sort()}
   if(data.openTime!==undefined){minutes(data.openTime);settings.openTime=data.openTime}if(data.closeTime!==undefined){minutes(data.closeTime);settings.closeTime=data.closeTime}if(minutes(settings.openTime)>=minutes(settings.closeTime))fail('Das Ende muss nach dem Beginn liegen.');
   if(data.slotMinutes!==undefined)settings.slotMinutes=integer(data.slotMinutes,5,120,'Zeitraster');if(settings.slotMinutes%5!==0)fail('Das Zeitraster muss in Schritten von fünf Minuten angegeben werden.');
   if(data.bookingEnabled!==undefined){if(typeof data.bookingEnabled!=='boolean')fail('Der Buchungsstatus ist ungültig.');settings.bookingEnabled=data.bookingEnabled}
   if(data.reminders!==undefined){if(typeof data.reminders!=='boolean')fail('Die Einstellung für Erinnerungen ist ungültig.');settings.reminders=data.reminders}
   const name=data.name===undefined?org.name:text(data.name,{required:true,max:150}),slug=data.slug===undefined?org.slug:text(data.slug,{required:true,max:64});if(!/^[a-z0-9](?:[a-z0-9-]{1,62}[a-z0-9])$/.test(slug))fail('Die Buchungsadresse benötigt 3 bis 64 kleine Buchstaben, Ziffern oder Bindestriche.');
   if(db.prepare('SELECT id FROM organizations WHERE slug=? AND id!=?').get(slug,orgId))fail('Diese Buchungsadresse wird bereits verwendet.',409,'SLUG_EXISTS');db.prepare('UPDATE organizations SET name=?,slug=?,settings_json=? WHERE id=?').run(name,slug,JSON.stringify(settings),orgId);return {ok:true};
  }
  fail('Diese Aktion wird nicht unterstützt.',400,'UNKNOWN_ACTION');
 });
}

