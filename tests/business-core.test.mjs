import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

process.env.NODE_ENV='test';
const file=path.join(process.cwd(),'.local','business-test-'+randomUUID()+'.sqlite');
process.env.BUSINESS_DB_PATH=file;
const database=await import('../src/lib/business-db.js');
const auth=await import('../src/lib/business-auth.js');
const plan=await import('../src/lib/business-plans.js');
const businessRoute=await import('../src/app/api/business/route.js');
const {getDb,closeDb,mutateBusiness,createAppointment,getAvailability,localToEpoch,localParts}=database;
test.after(()=>{closeDb();for(const suffix of ['','-wal','-shm'])if(fs.existsSync(file+suffix))fs.unlinkSync(file+suffix)});

test('accounts, session isolation, plan gates and appointment conflicts work together',async()=>{
 const password='A genuine test passphrase 2026';
 const first=await auth.registerAccount({name:'Test Alpha',email:'alpha@example.test',password,businessName:'Alpha',accountType:'business',role:'admin',plan:'betrieb'});
 const second=await auth.registerAccount({name:'Test Beta',email:'beta@example.test',password,businessName:'Beta',accountType:'business'});
 const db=getDb(),token=auth.createSession(first.userId),secondToken=auth.createSession(second.userId);
 const req=(token)=>new Request('http://localhost:3000/api/business',{headers:{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000',cookie:auth.sessionCookie(token)}});
 assert.equal(auth.getAccount(req(token)).organization.id,first.organizationId);
 assert.equal(auth.getAccount(req(token)).organization.plan,'free','public privilege fields are ignored');
 assert.equal(auth.getAccount(req(token)).organization.role,'inhaber');
 assert.notEqual(db.prepare('SELECT id FROM sessions WHERE user_id=?').get(first.userId).id,token,'opaque sessions are stored hashed');
 const stored=db.prepare('SELECT password_hash FROM users WHERE id=?').get(first.userId).password_hash;
 assert.ok(!stored.includes(password));assert.equal(await auth.verifyPassword(password,stored),true);assert.equal(await auth.verifyPassword('incorrect',stored),false);
 assert.equal(await auth.authenticateAccount({email:'ALPHA@example.test',password}),first.userId);
 await assert.rejects(auth.authenticateAccount({email:'alpha@example.test',password:'incorrect'}),error=>error.status===401);
 const orgsBefore=db.prepare('SELECT COUNT(*) AS count FROM organizations').get().count;
 await assert.rejects(auth.registerAccount({name:'Duplicate',email:'alpha@example.test',password,accountType:'private'}),error=>error.status===409);
 assert.equal(db.prepare('SELECT COUNT(*) AS count FROM organizations').get().count,orgsBefore,'failed registration rolls back tenant creation');
 assert.equal(auth.getAccount(req(token)).organization.effectivePlan,'betrieb','new business accounts start with the default trial');
 db.prepare('UPDATE organizations SET trial_plan=NULL,trial_until=NULL WHERE id IN (?,?)').run(first.organizationId,second.organizationId);
 assert.throws(()=>mutateBusiness(first.organizationId,{action:'client.create',name:'Blocked'}),error=>error.code==='PLAN_REQUIRED');
 db.prepare("UPDATE organizations SET plan='basic' WHERE id=?").run(first.organizationId);
 assert.equal(plan.getEffectivePlan(db.prepare('SELECT * FROM organizations WHERE id=?').get(first.organizationId)),'free','plan string alone does not grant paid access');
 db.prepare("UPDATE organizations SET billing_status='active' WHERE id=?").run(first.organizationId);
 db.prepare("UPDATE organizations SET plan='betrieb',billing_status='active' WHERE id=?").run(second.organizationId);
 const alphaClient=mutateBusiness(first.organizationId,{action:'client.create',name:'Alpha Client',email:'client-alpha@example.test'}).id;
 const betaClient=mutateBusiness(second.organizationId,{action:'client.create',name:'Beta Client'}).id;
 assert.throws(()=>mutateBusiness(first.organizationId,{action:'client.update',id:betaClient,name:'Stolen'}),error=>error.status===404);
 assert.throws(()=>mutateBusiness(first.organizationId,{action:'client.delete',id:betaClient}),error=>error.status===404);
 const response=await businessRoute.GET(req(token)),dashboard=await response.json();
 assert.deepEqual(dashboard.clients.map(client=>client.id),[alphaClient]);
 assert.equal(JSON.stringify(dashboard).includes('Beta Client'),false,'dashboard never lists another tenant');
 const secondDashboard=await (await businessRoute.GET(req(secondToken))).json();assert.deepEqual(secondDashboard.clients.map(client=>client.id),[betaClient]);
 assert.throws(()=>mutateBusiness(first.organizationId,{action:'order.create',title:'Blocked order'}),error=>error.code==='PLAN_REQUIRED');
 assert.ok(mutateBusiness(second.organizationId,{action:'order.create',title:'Allowed order',clientId:betaClient}).id);
 assert.throws(()=>mutateBusiness(second.organizationId,{action:'order.create',title:'Cross tenant',clientId:alphaClient}),error=>error.code==='CLIENT_NOT_FOUND');
 const serviceId=mutateBusiness(first.organizationId,{action:'service.create',name:'Test service',durationMinutes:60,priceCents:1000}).id;
 let date=localParts(Date.now()+86400000).date;while([0,6].includes(new Date(date+'T12:00:00Z').getUTCDay()))date=new Date(Date.parse(date+'T12:00:00Z')+86400000).toISOString().slice(0,10);
 const start=new Date(localToEpoch(date,'09:00')).toISOString(),overlap=new Date(localToEpoch(date,'09:30')).toISOString();
 const booked=createAppointment(first.organizationId,{serviceId,clientId:alphaClient,startsAt:start});
 assert.equal(booked.appointment.status,'pending');
 assert.throws(()=>createAppointment(first.organizationId,{serviceId,clientId:alphaClient,startsAt:start}),error=>error.code==='BOOKING_CONFLICT');
 assert.throws(()=>createAppointment(first.organizationId,{serviceId,clientId:alphaClient,startsAt:overlap}),error=>error.code==='BOOKING_CONFLICT');
 assert.throws(()=>createAppointment(second.organizationId,{serviceId,clientId:betaClient,startsAt:start}),error=>error.code==='SERVICE_NOT_FOUND');
 const slug=db.prepare('SELECT slug FROM organizations WHERE id=?').get(first.organizationId).slug;
 const publicView=getAvailability({slug,date,serviceId});
 assert.ok(!publicView.slots.some(slot=>slot.startsAt===start||slot.startsAt===overlap));
 assert.equal(JSON.stringify(publicView).includes('client-alpha'),false,'public slots do not reveal customer data');
 mutateBusiness(first.organizationId,{action:'appointment.update',id:booked.id,status:'cancelled'});
 assert.ok(getAvailability({slug,date,serviceId}).slots.some(slot=>slot.startsAt===start),'cancelled appointment releases the slot');
 for(let index=0;index<9;index++)mutateBusiness(first.organizationId,{action:'client.create',name:'Client '+index});
 assert.throws(()=>mutateBusiness(first.organizationId,{action:'client.create',name:'Beyond cap'}),error=>error.code==='PLAN_LIMIT');
 const future=new Date();future.setUTCMonth(future.getUTCMonth()+2,1);let capDate=future.toISOString().slice(0,10),made=0,overCap;
 while(made<21){
  if(![0,6].includes(new Date(capDate+'T12:00:00Z').getUTCDay()))for(let hour=9;hour<17&&made<21;hour++){
   const startsAt=new Date(localToEpoch(capDate,String(hour).padStart(2,'0')+':00')).toISOString();
   if(made===20){overCap={serviceId,clientId:alphaClient,startsAt};made++;break}
   createAppointment(first.organizationId,{serviceId,clientId:alphaClient,startsAt});made++;
  }
  capDate=new Date(Date.parse(capDate+'T12:00:00Z')+86400000).toISOString().slice(0,10);
 }
 assert.throws(()=>createAppointment(first.organizationId,overCap),error=>error.code==='PLAN_LIMIT','monthly limit is enforced before writing');
 db.prepare('UPDATE sessions SET expires_at=? WHERE user_id=?').run(Date.now()-1,first.userId);
 assert.equal(auth.getAccount(req(token)),null);assert.ok(auth.getAccount(req(secondToken)),'expiry remains tenant-local');
});

test('Origin guard handles internal localhost URL while rejecting unrelated origins',()=>{
 assert.doesNotThrow(()=>auth.assertMutationOrigin(new Request('http://localhost:3000/api/account/login',{headers:{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'}})));
 assert.throws(()=>auth.assertMutationOrigin(new Request('http://localhost:3000/api/account/login',{headers:{host:'127.0.0.1:3000',origin:'https://evil.example'}})),error=>error.status===403);
 assert.throws(()=>auth.assertMutationOrigin(new Request('http://localhost:3000/api/account/login')),error=>error.status===403);
});

test('Berlin conversions retain correct offsets and reject DST gaps or ambiguous local times',()=>{
 assert.equal(new Date(localToEpoch('2027-01-15','09:00')).toISOString(),'2027-01-15T08:00:00.000Z');
 assert.equal(new Date(localToEpoch('2027-07-15','09:00')).toISOString(),'2027-07-15T07:00:00.000Z');
 assert.throws(()=>localToEpoch('2027-03-28','02:30'));
 assert.throws(()=>localToEpoch('2027-10-31','02:30'));
 assert.throws(()=>localToEpoch('2027-02-30','09:00'));
});
