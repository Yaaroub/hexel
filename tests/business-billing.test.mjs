import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {verifyStripeEvent,subscriptionHasAccess,subscriptionPlan,isStaleBillingEvent,wasBillingEventProcessed,getBillingConfiguration,assertLocalPreview,appOrigin,assertBillingOwner} from '../src/lib/business-billing.js';
const secret='whsec_example_only';
const timestamp=1780000000;
const payload=JSON.stringify({id:'evt_Valid123',created:timestamp,type:'customer.subscription.updated',livemode:false,data:{object:{id:'sub_Valid123',status:'active'}}});
function signature(body=payload,time=timestamp){return 't='+time+',v1='+createHmac('sha256',secret).update(time+'.'+body).digest('hex')}

test('Stripe signatures authenticate the untouched body and allow rotated signatures',()=>{
 assert.equal(verifyStripeEvent(payload,signature(),secret,{now:timestamp}).id,'evt_Valid123');
 assert.equal(verifyStripeEvent(payload,signature()+',v1='+'0'.repeat(64),secret,{now:timestamp}).id,'evt_Valid123');
 assert.throws(()=>verifyStripeEvent(payload+' ',signature(),secret,{now:timestamp}),/Signatur/);
 assert.throws(()=>verifyStripeEvent(payload,'t='+timestamp+',v1='+'0'.repeat(64),secret,{now:timestamp}),/Signatur/);
 assert.throws(()=>verifyStripeEvent(payload,null,secret,{now:timestamp}),/Webhook/);
});
test('expired, future and ambiguous webhook signatures are rejected',()=>{
 assert.throws(()=>verifyStripeEvent(payload,signature(),secret,{now:timestamp+301}),/abgelaufen/);
 assert.throws(()=>verifyStripeEvent(payload,signature(),secret,{now:timestamp-301}),/abgelaufen/);
 assert.throws(()=>verifyStripeEvent(payload,signature()+',t='+timestamp,secret,{now:timestamp}),/Signatur/);
 assert.throws(()=>verifyStripeEvent(payload,signature(),'',{now:timestamp}),/eingerichtet/);
});
test('valid signatures do not make malformed event bodies acceptable',()=>{
 const body='{"id":"evt_Valid123","created":0}';
 assert.throws(()=>verifyStripeEvent(body,signature(body),secret,{now:timestamp}),/Unvollständiges/);
});
test('only active or trialing unpaused subscriptions can grant paid features',()=>{
 for(const status of ['active','trialing'])assert.equal(subscriptionHasAccess({status}),true);
 for(const status of ['incomplete','past_due','unpaid','canceled','paused','incomplete_expired','none'])assert.equal(subscriptionHasAccess({status}),false);
 assert.equal(subscriptionHasAccess({status:'active',pause_collection:{behavior:'void'}}),false);
 assert.equal(subscriptionHasAccess(null),false);
});
test('plans come from one configured Stripe price, never from metadata',()=>{
 const prices={basic:'price_Basis1',betrieb:'price_Betrieb2'};
 const subscription={status:'active',metadata:{plan:'betrieb'},items:{data:[{quantity:1,price:{id:'price_Basis1'}}]}};
 assert.equal(subscriptionPlan(subscription,prices),'basic');
 assert.equal(subscriptionPlan({...subscription,items:{data:[{quantity:1,price:{id:'price_Unknown'}}]}},prices),null);
 assert.equal(subscriptionPlan({...subscription,items:{data:[{quantity:2,price:{id:'price_Basis1'}}]}},prices),null);
 assert.equal(subscriptionPlan({...subscription,items:{data:[...subscription.items.data,...subscription.items.data]}},prices),null);
});
test('old events cannot overwrite a newer billing update',()=>{
 assert.equal(isStaleBillingEvent(99,100),true);
 assert.equal(isStaleBillingEvent(100,100),false);
 assert.equal(isStaleBillingEvent(101,100),false);
 assert.equal(isStaleBillingEvent(-1,0),true);
});
test('event IDs are durably recognized as replays',()=>{
 const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE billing_events(id TEXT PRIMARY KEY)');
 assert.equal(wasBillingEventProcessed(db,'evt_once'),false);
 db.prepare('INSERT INTO billing_events(id) VALUES(?)').run('evt_once');
 assert.equal(wasBillingEventProcessed(db,'evt_once'),true);
 assert.throws(()=>db.prepare('INSERT INTO billing_events(id) VALUES(?)').run('evt_once'),/UNIQUE/);
 db.close();
});
test('live writes are disabled unless the runtime explicitly allows them',()=>{
 assert.equal(getBillingConfiguration({STRIPE_SECRET_KEY:'sk_live_example'}).enabled,false);
 assert.equal(getBillingConfiguration({STRIPE_SECRET_KEY:'sk_live_example',ALLOW_LIVE_BILLING:'true'}).enabled,true);
 assert.equal(getBillingConfiguration({STRIPE_SECRET_KEY:'sk_test_example'}).enabled,true);
 assert.equal(getBillingConfiguration({}).configured,false);
});
test('local tariff previews cannot be enabled in production or on public hosts',()=>{
 const request=new Request('http://localhost:3000/api/billing/preview',{headers:{host:'127.0.0.1:3000'}});
 assert.doesNotThrow(()=>assertLocalPreview(request,{NODE_ENV:'development'}));
 assert.throws(()=>assertLocalPreview(request,{NODE_ENV:'production'}),/ausschließlich lokal/);
 assert.throws(()=>assertLocalPreview(new Request('https://example.com/api/billing/preview'),{NODE_ENV:'development'}),/ausschließlich lokal/);
 assert.throws(()=>assertBillingOwner({organization:{role:'member'}}),/Kontoinhaber/);
});
test('payment return URLs use configured HTTPS origins, never a public request Host',()=>{
 const request=new Request('http://localhost:3000/api/billing/checkout',{headers:{host:'127.0.0.1:3000'}});
 assert.equal(appOrigin(request,{NODE_ENV:'development'}),'http://127.0.0.1:3000');
 assert.equal(appOrigin(request,{NODE_ENV:'production',APP_URL:'https://funknaht.example'}),'https://funknaht.example');
 assert.throws(()=>appOrigin(request,{NODE_ENV:'production'}),/APP_URL/);
 for(const APP_URL of ['https://funknaht.example/path','http://example.com','https://user:password@example.com','https://example.com?next=external'])assert.throws(()=>appOrigin(request,{NODE_ENV:'production',APP_URL}));
});

test('verified subscription updates are tenant-bound, idempotent and ordered',async()=>{
 const fs=await import('node:fs/promises'),os=await import('node:os'),path=await import('node:path');
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'funknaht-billing-'));
 const previous={NODE_ENV:process.env.NODE_ENV,BUSINESS_DB_PATH:process.env.BUSINESS_DB_PATH,STRIPE_SECRET_KEY:process.env.STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET:process.env.STRIPE_WEBHOOK_SECRET,STRIPE_PRICE_BASIC:process.env.STRIPE_PRICE_BASIC,STRIPE_PRICE_BETRIEB:process.env.STRIPE_PRICE_BETRIEB};
 Object.assign(process.env,{NODE_ENV:'test',BUSINESS_DB_PATH:path.join(folder,'billing.sqlite'),STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:secret,STRIPE_PRICE_BASIC:'price_Basis1',STRIPE_PRICE_BETRIEB:'price_Betrieb2'});
 const originalFetch=globalThis.fetch;
 const {getDb,closeDb}=await import('../src/lib/business-db.js');
 const {processBillingEvent}=await import('../src/lib/business-billing.js');
 try{
  const db=getDb();db.prepare("INSERT INTO organizations(id,name,slug,account_type,billing_customer_id,created_at) VALUES(?,?,?,?,?,?)").run('org-one','One','one','business','cus_One',Date.now());
  db.prepare("INSERT INTO organizations(id,name,slug,account_type,billing_customer_id,created_at) VALUES(?,?,?,?,?,?)").run('org-two','Two','two','business','cus_Two',Date.now());
  let calls=0,current={id:'sub_One',object:'subscription',customer:'cus_One',status:'active',livemode:false,current_period_end:Math.floor(Date.now()/1000)+3600,items:{data:[{quantity:1,price:{id:'price_Basis1'}}]}};
  globalThis.fetch=async url=>{calls++;assert.equal(url,'https://api.stripe.com/v1/subscriptions/sub_One');return Response.json(current)};
  const event=(id,created,type='customer.subscription.updated',object={id:'sub_One',customer:'cus_One'})=>({id,created,type,livemode:false,data:{object}});
  assert.equal((await processBillingEvent(event('evt_first',100))).applied,true);
  assert.equal(db.prepare('SELECT plan FROM organizations WHERE id=?').get('org-one').plan,'basic');
  assert.equal(db.prepare('SELECT plan FROM organizations WHERE id=?').get('org-two').plan,'free');
  assert.equal((await processBillingEvent(event('evt_first',100))).duplicate,true);assert.equal(calls,1);
  current={...current,status:'past_due'};
  await processBillingEvent(event('evt_failed',120));assert.equal(db.prepare('SELECT plan FROM organizations WHERE id=?').get('org-one').plan,'free');
  current={...current,status:'active'};
  assert.equal((await processBillingEvent(event('evt_old',110))).applied,false);assert.equal(db.prepare('SELECT plan FROM organizations WHERE id=?').get('org-one').plan,'free');
  const unrelated=event('evt_wrongtenant',130,'checkout.session.completed',{mode:'subscription',customer:'cus_Unmapped',subscription:'sub_One',client_reference_id:'org-two',metadata:{organization_id:'org-two',plan:'betrieb'}});
  assert.equal((await processBillingEvent(unrelated)).applied,false);assert.equal(db.prepare('SELECT plan FROM organizations WHERE id=?').get('org-two').plan,'free');
  current={...current,items:{data:[{quantity:1,price:{id:'price_Unknown'}}]}};
  await processBillingEvent(event('evt_unknownprice',140));assert.equal(db.prepare('SELECT plan FROM organizations WHERE id=?').get('org-one').plan,'free');
  current={...current,status:'active',items:{data:[{quantity:1,price:{id:'price_Betrieb2'}}]}};
  await processBillingEvent(event('evt_upgrade',150));assert.equal(db.prepare('SELECT plan FROM organizations WHERE id=?').get('org-one').plan,'betrieb');
  current={...current,status:'canceled'};await processBillingEvent(event('evt_cancel',160,'customer.subscription.deleted'));assert.equal(db.prepare('SELECT plan FROM organizations WHERE id=?').get('org-one').plan,'free');
 }finally{globalThis.fetch=originalFetch;closeDb();for(const [key,value]of Object.entries(previous)){if(value===undefined)delete process.env[key];else process.env[key]=value}await fs.rm(folder,{recursive:true,force:true})}
});
