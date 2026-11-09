import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

process.env.NODE_ENV='test';
const file=path.join(process.cwd(),'.local','extras-test-'+randomUUID()+'.sqlite');
process.env.BUSINESS_DB_PATH=file;
delete process.env.EMAIL_USER;delete process.env.SMTP_HOST;
const {getDb,closeDb,mutateBusiness,createAppointment,localToEpoch,localParts}=await import('../src/lib/business-db.js');
const auth=await import('../src/lib/business-auth.js');
const callbacks=await import('../src/lib/callbacks.js');
const family=await import('../src/lib/family.js');
const team=await import('../src/lib/team.js');
const devices=await import('../src/lib/devices.js');
const docs=await import('../src/lib/documents.js');
const monitors=await import('../src/lib/monitors.js');
const tickets=await import('../src/lib/tickets.js');
const appts=await import('../src/lib/appointments-extra.js');
const notices=await import('../src/lib/notices.js');
const settings=await import('../src/lib/settings.js');
test.after(()=>{closeDb();for(const s of ['','-wal','-shm'])if(fs.existsSync(file+s))fs.unlinkSync(file+s)});

const password='A genuine test passphrase 2026';
async function account(email,type='private',name='Person'){
 const r=await auth.registerAccount({name,email,password,businessName:name,accountType:type});
 const token=auth.createSession(r.userId);
 return auth.getAccount(new Request('http://127.0.0.1:3000/',{headers:{cookie:auth.sessionCookie(token)}}));
}

test('callbacks need consent and a valid phone number; phone tickets close the callback',async()=>{
 assert.throws(()=>callbacks.createCallback({name:'Erna',phone:'0561 123456',consent:false}),/zurückrufen/);
 assert.throws(()=>callbacks.createCallback({name:'Erna',phone:'abc',consent:true}),/Telefonnummer/);
 const cb=callbacks.createCallback({name:'Erna',phone:'0561 123456',topic:'Online-Banking',timeWindow:'Vormittags',consent:true});
 assert.equal(cb.topic,'Online-Banking');
 assert.equal(callbacks.listCallbacks()[0].status,'neu');
 const owner=await account('owner@example.test','business','Inhaber');
 const id=callbacks.createPhoneTicket(owner,{name:'Erna',phone:'0561 123456',description:'Kann sich nicht beim Banking anmelden',minutes:15,callbackId:cb.id});
 assert.match(id,/^FN-[A-F0-9]{8}$/);
 const done=callbacks.listCallbacks().find(c=>c.id===cb.id);
 assert.equal(done.status,'erledigt');assert.equal(done.ticketId,id);
 assert.equal(getDb().prepare('SELECT source FROM support_tickets WHERE id=?').get(id).source,'telefon');
 assert.equal(getDb().prepare('SELECT minutes FROM ticket_time WHERE ticket_id=?').get(id).minutes,15);
 // Bereinigung: erledigte Rückrufe nach 90 Tagen weg
 assert.equal(callbacks.purgeCallbacks(Date.now()+91*86400000),1);
});

test('family access is invited, scoped and revocable',async()=>{
 const mother=await account('mutter@example.test','private','Mutter');
 const son=await account('sohn@example.test','private','Sohn');
 const stranger=await account('fremd@example.test','private','Fremd');
 const token=family.createFamilyInvite(mother,'Sohn');
 assert.throws(()=>family.acceptFamilyInvite(mother,token),/selbst/);
 family.acceptFamilyInvite(son,token);
 assert.throws(()=>family.acceptFamilyInvite(stranger,token),e=>e.code==='INVITE_USED','an invite works only once');
 assert.equal(family.customerOrg(son,mother.organization.id),mother.organization.id);
 assert.throws(()=>family.customerOrg(stranger,mother.organization.id),e=>e.code==='NO_ACCESS');
 const ticket=tickets.createTicket(son,{kind:'problem',category:'internet-wlan',description:'WLAN bei Mutter fällt aus',name:'Sohn',email:'sohn@example.test',attempts:[]},{orgId:mother.organization.id});
 assert.ok(ticket);
 const link=family.familyMembers(mother)[0];
 assert.equal(link.accepted,true);
 family.removeFamilyLink(mother,link.id);
 assert.throws(()=>family.customerOrg(son,mother.organization.id),e=>e.code==='NO_ACCESS','revoked access is gone');
 assert.equal(getDb().prepare('SELECT token_hash FROM account_links').all().some(r=>r.token_hash===token),false,'only a hash of the invite is stored');
});

test('team members get roles; only the owner may manage them',async()=>{
 const boss=await account('chef@example.test','business','Elektro Muster');
 const token=team.inviteMember(boss,{email:'monteur@example.test',role:'monteur'});
 const userId=await team.joinTeam(token,{name:'Max Monteur',password});
 await assert.rejects(team.joinTeam(token,{name:'Noch mal',password}),e=>e.code==='INVITE_USED');
 const worker=auth.getAccount(new Request('http://127.0.0.1:3000/',{headers:{cookie:auth.sessionCookie(auth.createSession(userId))}}));
 assert.equal(worker.organization.id,boss.organization.id);
 assert.equal(worker.user.role,'monteur');
 assert.throws(()=>team.inviteMember(worker,{email:'x@example.test',role:'buero'}),e=>e.code==='ROLE_REQUIRED');
 assert.throws(()=>team.requireRole(worker,'inhaber','buero'),e=>e.status===403);
 const priv=await account('privat@example.test','private');
 assert.throws(()=>team.inviteMember(priv,{email:'y@example.test',role:'buero'}),/Betriebskonten/);
});

test('devices: QR token reveals only label and kind',async()=>{
 const c=await account('kunde-geraet@example.test','private','Kunde');
 const id=devices.saveDevice(c.organization.id,{kind:'router',label:'Router Flur',vendor:'AVM',model:'FRITZ!Box 7590',serial:'SECRET-123',notes:'nichts'});
 const d=devices.listDevices(c.organization.id)[0];
 assert.equal(d.id,id);assert.ok(d.qrToken.length>=10);
 const pub=devices.deviceByToken(d.qrToken);
 assert.deepEqual(Object.keys(pub).sort(),['category','id','kindLabel','label','organizationId']);
 assert.equal(JSON.stringify(pub).includes('SECRET'),false);
 assert.equal(devices.deviceByToken('../etc/passwd'),null);
 const other=await account('kunde-zwei@example.test','private');
 assert.throws(()=>devices.deleteDevice(other.organization.id,id),e=>e.status===404,'devices are tenant-scoped');
});

test('documents: totals, numbering, billing time once, frozen after sending',async()=>{
 settings.saveOwnerSettings({...settings.defaultOwnerSettings,hourlyRateCents:6000,vatRate:19,smallBusiness:false});
 assert.deepEqual(docs.totals([{kind:'arbeit',qty:1.5,priceCents:6000},{kind:'material',qty:2,priceCents:999}],{smallBusiness:false,vatRate:19}),{net:10998,vatRate:19,vat:2090,gross:13088,laborGross:10710});
 assert.equal(docs.totals([{kind:'arbeit',qty:1,priceCents:5000}],{smallBusiness:true,vatRate:19}).vat,0);
 const c=await account('kunde-beleg@example.test','private','Beleg Kunde');
 const t=tickets.createTicket(c,{kind:'problem',category:'drucker',description:'Drucker druckt nicht mehr',name:'Beleg Kunde',email:'kunde-beleg@example.test',attempts:[]});
 const tid=typeof t==='string'?t:t.id;
 const db=getDb(),now=new Date().toISOString();
 db.prepare('INSERT INTO ticket_time(id,ticket_id,minutes,note,billable,work_date,created_at) VALUES(?,?,?,?,1,?,?)').run(randomUUID(),tid,90,'Vor Ort',now.slice(0,10),now);
 db.prepare('INSERT INTO ticket_time(id,ticket_id,minutes,note,billable,work_date,created_at) VALUES(?,?,?,?,0,?,?)').run(randomUUID(),tid,30,'Kulanz',now.slice(0,10),now);
 const first=docs.createDocument({type:'rechnung',ticketId:tid,fromTime:true});
 const d=docs.getDocument(first);
 assert.equal(d.items[0].qty,1.5);assert.equal(d.totals.net,9000);assert.equal(d.organizationId,c.organization.id);
 const second=docs.createDocument({type:'rechnung',ticketId:tid,fromTime:true});
 assert.equal(docs.getDocument(second).items.length,0,'time is billed only once');
 assert.throws(()=>docs.setDocumentStatus(second,'versendet'),/Positionen/);
 docs.deleteDraft(second);
 assert.throws(()=>docs.getDocument(first,{organizationId:c.organization.id,forCustomer:true}),e=>e.status===404,'customers never see drafts');
 docs.setDocumentStatus(first,'versendet');
 assert.match(docs.getDocument(first).number,/^R-\d{4}-0001$/,'numbers are assigned on sending, without gaps');
 assert.throws(()=>docs.updateDraft(first,{items:[]}),e=>e.code==='LOCKED');
 settings.saveOwnerSettings({...settings.defaultOwnerSettings,hourlyRateCents:9900,smallBusiness:true});
 assert.equal(docs.getDocument(first).totals.vat,1710,'sent documents keep the settings of their day');
 assert.throws(()=>docs.setDocumentStatus(first,'angenommen')===undefined&&docs.setDocumentStatus(first,'entwurf'),e=>e.status===409);
 // Storno gibt die Zeiten wieder frei
 docs.setDocumentStatus(first,'storniert');
 assert.equal(db.prepare('SELECT COUNT(*) n FROM ticket_time WHERE ticket_id=? AND document_id IS NULL').get(tid).n,2);
 // Angebot: Kunde nimmt selbst an
 const offer=docs.createDocument({type:'angebot',organizationId:c.organization.id,items:[{kind:'pauschale',text:'WLAN-Ausleuchtung',qty:1,unit:'Stk.',priceCents:14900}]});
 docs.setDocumentStatus(offer,'versendet');
 assert.equal(docs.respondToOffer(c.organization.id,offer,true).status,'angenommen');
 assert.throws(()=>docs.respondToOffer(c.organization.id,offer,false),e=>e.status===409);
 const other=await account('fremd-beleg@example.test','private');
 assert.throws(()=>docs.getDocument(offer,{organizationId:other.organization.id,forCustomer:true}),e=>e.status===404);
});

test('monitors: heartbeat flips state, website validation, router scripts',async()=>{
 const c=await account('kunde-ueberwachung@example.test','business','Praxis');
 assert.throws(()=>monitors.saveMonitor(c.organization.id,{kind:'website',label:'X',url:'javascript:alert(1)'}),/gültige/);
 const id=monitors.saveMonitor(c.organization.id,{kind:'heartbeat',label:'Leitung Praxis'});
 const m=getDb().prepare('SELECT * FROM monitors WHERE id=?').get(id);
 assert.equal(monitors.heartbeat('falsch'),false);
 assert.equal(monitors.heartbeat(m.token),true);
 assert.equal(getDb().prepare('SELECT state FROM monitors WHERE id=?').get(id).state,'ok');
 const s=monitors.heartbeatScript(m.token,'https://funknaht.de');
 assert.match(s.mikrotik,/^\/system scheduler add .*\/tool fetch url=\\"https:\/\/funknaht\.de\/api\/heartbeat\//);
 assert.match(s.linux,/^\*\/5 \* \* \* \* curl/);
 // Ausfall: nach zwei verpassten Intervallen entsteht eine dringende Anfrage
 getDb().prepare('UPDATE monitors SET last_ok_at=? WHERE id=?').run(Date.now()-3*3600000,id);
 await monitors.runMonitors(Date.now());await monitors.runMonitors(Date.now()+60000);
 const after=getDb().prepare('SELECT state FROM monitors WHERE id=?').get(id).state;
 assert.equal(after,'gestört');
 assert.equal(getDb().prepare("SELECT priority FROM support_tickets WHERE source='ueberwachung' AND organization_id=?").get(c.organization.id)?.priority,'dringend');
 monitors.heartbeat(m.token);
 assert.equal(getDb().prepare('SELECT state FROM monitors WHERE id=?').get(id).state,'ok');
});

test('appointments: customer manage link, cancellation, reminder once, iCal feed',async()=>{
 const shop=await account('termine@example.test','business','Elektro Termin');
 const org=shop.organization.id;
 getDb().prepare("UPDATE organizations SET plan='betrieb',billing_status='active' WHERE id=?").run(org);
 const serviceId=mutateBusiness(org,{action:'service.create',name:'Einsatz vor Ort',durationMinutes:60,priceCents:0}).id;
 const clientId=mutateBusiness(org,{action:'client.create',name:'Frau Test',email:'frau@example.test'}).id;
 let date=localParts(Date.now()+86400000).date;while([0,6].includes(new Date(date+'T12:00:00Z').getUTCDay()))date=new Date(Date.parse(date+'T12:00:00Z')+86400000).toISOString().slice(0,10);
 const startsAt=new Date(localToEpoch(date,'10:00')).toISOString();
 const booked=createAppointment(org,{serviceId,clientId,startsAt});
 const id=booked.appointment.id;
 getDb().prepare("UPDATE appointments SET customer_email='frau@example.test',customer_name='Frau Test',created_at=? WHERE id=?").run(Date.now()-86400000*3,id);
 const link=appts.manageLink(id);
 const token=link.split('/termin/')[1];
 assert.equal(appts.manageView(token).canCancel,true);
 const startMs=Date.parse(startsAt);
 assert.equal(appts.sendReminders(startMs-20*3600000),1);
 assert.equal(appts.sendReminders(startMs-19*3600000),0,'reminder is sent only once');
 const cal=appts.calendarToken(org);
 const feed=appts.calendarFeed(cal);
 assert.match(feed,/^BEGIN:VCALENDAR\r\n/);assert.match(feed,/SUMMARY:Einsatz vor Ort – Frau Test/);
 assert.equal(appts.calendarFeed('x'.repeat(32)),null);
 const renewed=appts.calendarToken(org,{renew:true});
 assert.notEqual(renewed,cal);assert.equal(appts.calendarFeed(cal),null,'old calendar link stops working');
 assert.equal(appts.cancelByCustomer(token).status,'cancelled');
 assert.throws(()=>appts.cancelByCustomer(token),e=>e.status===409);
 assert.throws(()=>appts.manageView('kurz'),e=>e.status===404);
});

test('notices end automatically and on request',()=>{
 const n=notices.createNotice({title:'Störung im Kabelnetz',body:'Der Anbieter arbeitet daran.',level:'warn',hours:'4'});
 const id=n?.id||notices.allNotices()[0].id;
 assert.equal(notices.activeNotices().length,1);
 assert.equal(notices.activeNotices(Date.now()+5*3600000).length,0);
 notices.endNotice(id);
 assert.equal(notices.activeNotices().length,0);
});
