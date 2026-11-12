import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

process.env.NODE_ENV='test';
const file=path.join(process.cwd(),'.local','access-test-'+randomUUID()+'.sqlite');
process.env.BUSINESS_DB_PATH=file;process.env.OWNER_EMAILS='chef@example.test';
delete process.env.EMAIL_USER;
const {getDb,closeDb,getAvailability,publicBook}=await import('../src/lib/business-db.js');
const auth=await import('../src/lib/business-auth.js');
const access=await import('../src/lib/access.js');
const {getEffectivePlan}=await import('../src/lib/business-plans.js');
test.after(()=>{closeDb();for(const s of ['','-wal','-shm'])if(fs.existsSync(file+s))fs.unlinkSync(file+s)});
const password='A genuine test passphrase 2026';
const req=t=>new Request('http://127.0.0.1:3000/',{headers:{cookie:auth.sessionCookie(t)}});
async function signup(email,type='business'){const r=await auth.registerAccount({name:'Test',email,password,businessName:'Test '+email,accountType:type});return {...r,token:auth.createSession(r.userId)}}
const org=id=>getDb().prepare('SELECT * FROM organizations WHERE id=?').get(id);

test('new business accounts get the configured trial; private accounts do not',async()=>{
 access.saveAccessSettings({trialDays:10,trialPlan:'basic'});
 const b=await signup('trial@example.test');
 const a=auth.getAccount(req(b.token)).organization.access;
 assert.equal(a.trialActive,true);assert.equal(a.trialPlan,'basic');assert.ok(a.trialDaysLeft>=9&&a.trialDaysLeft<=10);
 assert.equal(getEffectivePlan(org(b.organizationId)),'basic');
 const p=await signup('privat@example.test','private');
 assert.equal(auth.getAccount(req(p.token)).organization.access.trialActive,false);
 // abgelaufene Testphase fällt auf den kostenlosen Einstieg zurück
 getDb().prepare('UPDATE organizations SET trial_until=? WHERE id=?').run(Date.now()-1000,b.organizationId);
 assert.equal(getEffectivePlan(org(b.organizationId)),'free');
 assert.throws(()=>access.changeAccess(b.organizationId,{action:'trial',plan:'free',days:5}),/Tarif/);
 assert.throws(()=>access.changeAccess(b.organizationId,{action:'trial',plan:'betrieb',until:'2000-01-01'}),/Zukunft/);
 const t=access.changeAccess(b.organizationId,{action:'trial',plan:'betrieb',days:30,notify:false});
 assert.equal(t.trialPlan,'betrieb');assert.equal(getEffectivePlan(org(b.organizationId)),'betrieb');
 access.changeAccess(b.organizationId,{action:'endTrial'});
 assert.equal(getEffectivePlan(org(b.organizationId)),'free');
});

test('approval, blocking and usage end gate the account but keep export and deletion',async()=>{
 access.saveAccessSettings({approvalBusiness:true,trialDays:14,trialPlan:'betrieb'});
 const b=await signup('wartet@example.test');
 assert.equal(org(b.organizationId).access_status,'wartet');
 assert.throws(()=>auth.requireAccount(req(b.token)),e=>e.code==='ACCESS_BLOCKED'&&/geprüft/.test(e.message));
 assert.ok(auth.requireAccount(req(b.token),{allowBlocked:true}),'export and deletion stay possible');
 assert.throws(()=>getAvailability({slug:org(b.organizationId).slug,date:'2030-01-02'}),e=>e.status===404,'booking page is closed while waiting');
 access.changeAccess(b.organizationId,{action:'approve',notify:false});
 assert.ok(auth.requireAccount(req(b.token)));
 // Sperren beendet alle Sitzungen sofort
 access.changeAccess(b.organizationId,{action:'block',reason:'Rechnung offen'});
 assert.equal(auth.getAccount(req(b.token)),null);
 const again=auth.createSession(b.userId);
 assert.throws(()=>auth.requireAccount(req(again)),e=>e.code==='ACCESS_BLOCKED'&&/Rechnung offen/.test(e.message));
 assert.throws(()=>publicBook({slug:org(b.organizationId).slug}),e=>e.status===404);
 access.changeAccess(b.organizationId,{action:'unblock'});
 assert.ok(auth.requireAccount(req(again)));
 // Nutzung bis: in der Vergangenheit = abgelaufen
 getDb().prepare('UPDATE organizations SET access_until=? WHERE id=?').run(Date.now()-1000,b.organizationId);
 assert.equal(auth.getAccount(req(again)).organization.access.state,'abgelaufen');
 assert.throws(()=>auth.requireAccount(req(again)),e=>e.code==='ACCESS_BLOCKED');
 access.changeAccess(b.organizationId,{action:'until',until:''});
 assert.ok(auth.requireAccount(req(again)));
 // Inhaber selbst wird nie gesperrt und wartet nie
 const owner=await signup('chef@example.test');
 assert.equal(org(owner.organizationId).access_status,'aktiv');
 access.saveAccessSettings({approvalBusiness:false});
});

test('trial reminder is sent once, three days before the end',async()=>{
 const b=await signup('erinnerung@example.test');
 getDb().prepare('UPDATE organizations SET trial_until=? WHERE id=?').run(Date.now()+2*86400000,b.organizationId);
 const first=access.trialReminders();assert.ok(first>=1);
 assert.equal(access.trialReminders(),0);
 const c=access.accessCounts();assert.ok(c.trials>=1&&c.trialsEnding>=1);
});
