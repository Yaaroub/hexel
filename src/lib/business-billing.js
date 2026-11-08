import {createHmac,timingSafeEqual,randomUUID} from 'node:crypto';

export class BillingError extends Error{
 constructor(message,status=400){super(message);this.name='BillingError';this.status=status;}
}
export const billingPlans=Object.freeze([
 {id:'free',name:'Kostenlos',monthlyAmount:0,currency:'EUR',purchasable:false},
 {id:'basic',name:'Basis',monthlyAmount:79,currency:'EUR',purchasable:true},
 {id:'betrieb',name:'Betrieb',monthlyAmount:229,currency:'EUR',purchasable:true},
 {id:'individuell',name:'Individuell',monthlyAmount:null,currency:'EUR',purchasable:false}
]);
const paidPlans=new Set(['basic','betrieb']);
const supportedSubscriptionStatuses=new Set(['incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid','paused']);
const terminalStatuses=new Set(['canceled','incomplete_expired','none']);
const stripeVersion='2026-10-28.endive';
const responseHeaders={'Cache-Control':'no-store'};
export {responseHeaders as billingResponseHeaders};

export function getBillingConfiguration(env=process.env){
 const secret=env.STRIPE_SECRET_KEY||'';
 const keyMode=/^(?:sk|rk)_test_/.test(secret)?'test':/^(?:sk|rk)_live_/.test(secret)?'live':null;
 const liveAllowed=env.ALLOW_LIVE_BILLING==='true';
 const prices={basic:env.STRIPE_PRICE_BASIC||'',betrieb:env.STRIPE_PRICE_BETRIEB||''};
 const enabled=Boolean(keyMode&&(keyMode==='test'||liveAllowed));
 return {secret,webhookSecret:env.STRIPE_WEBHOOK_SECRET||'',keyMode,testMode:keyMode!=='live',liveAllowed,enabled,prices,configured:Boolean(enabled&&env.STRIPE_WEBHOOK_SECRET&&Object.values(prices).some(Boolean))};
}
function assertStripeReady(){
 const config=getBillingConfiguration();
 if(!config.enabled)throw new BillingError('Die Zahlung ist hier noch nicht eingerichtet. Lokale Tariftests sind ohne Zahlung möglich.',503);
 return config;
}
function validPriceId(value){return typeof value==='string'&&/^price_[A-Za-z0-9]+$/.test(value)}
export function subscriptionHasAccess(subscription){
 return Boolean(subscription&&['active','trialing'].includes(subscription.status)&&!subscription.pause_collection);
}
export function subscriptionPlan(subscription,prices){
 const data=subscription?.items?.data;
 if(!Array.isArray(data)||data.length!==1)return null;
 const item=data[0];
 if(item.quantity!==1)return null;
 const priceId=typeof item.price==='string'?item.price:item.price?.id;
 return Object.keys(prices).find(plan=>paidPlans.has(plan)&&validPriceId(prices[plan])&&prices[plan]===priceId)||null;
}
export function isStaleBillingEvent(eventCreated,lastCreated){
 return !Number.isSafeInteger(eventCreated)||eventCreated<0||eventCreated<Number(lastCreated||0);
}
export function verifyStripeEvent(rawBody,signature,secret,{now=Math.floor(Date.now()/1000),tolerance=300}={}){
 if(typeof secret!=='string'||!secret.startsWith('whsec_'))throw new BillingError('Webhook nicht eingerichtet.',503);
 if(typeof rawBody!=='string'||typeof signature!=='string'||rawBody.length>262144||signature.length>2048)throw new BillingError('Ungültiger Webhook.',400);
 let timestamp=null;const candidates=[];
 for(const item of signature.split(',')){
  const equals=item.indexOf('=');const key=item.slice(0,equals).trim(),value=item.slice(equals+1).trim();
  if(key==='t'&&/^\d+$/.test(value)){if(timestamp!==null)throw new BillingError('Ungültige Signatur.',400);timestamp=Number(value)}
  if(key==='v1'&&/^[a-fA-F0-9]{64}$/.test(value))candidates.push(Buffer.from(value,'hex'));
 }
 if(!Number.isSafeInteger(timestamp)||Math.abs(now-timestamp)>tolerance||!candidates.length)throw new BillingError('Signatur ist ungültig oder abgelaufen.',400);
 const expected=createHmac('sha256',secret).update(timestamp+'.'+rawBody,'utf8').digest();
 let matched=false;for(const candidate of candidates){if(candidate.length===expected.length&&timingSafeEqual(candidate,expected))matched=true}
 if(!matched)throw new BillingError('Ungültige Signatur.',400);
 let event;try{event=JSON.parse(rawBody)}catch{throw new BillingError('Ungültige Webhook-Daten.',400)}
 if(!event||typeof event.id!=='string'||!/^evt_[A-Za-z0-9]+$/.test(event.id)||!Number.isSafeInteger(event.created)||typeof event.type!=='string'||!event.data?.object)throw new BillingError('Unvollständiges Ereignis.',400);
 return event;
}
function stripeId(value,prefix){const id=typeof value==='string'?value:value?.id;const pattern=prefix==='cs'?/^cs_(?:test_|live_)?[A-Za-z0-9]+$/:new RegExp('^'+prefix+'_[A-Za-z0-9]+$');return typeof id==='string'&&pattern.test(id)?id:null}
async function database(){const {getDb}=await import('./business-db.js');return getDb()}
function ensureBillingTables(db){
 db.exec(`CREATE TABLE IF NOT EXISTS billing_checkout_sessions (id TEXT PRIMARY KEY,organization_id TEXT NOT NULL,plan TEXT NOT NULL,created_at INTEGER NOT NULL);CREATE INDEX IF NOT EXISTS billing_checkout_org ON billing_checkout_sessions(organization_id,created_at);`);
}
async function stripeRequest(path,{method='GET',params,idempotencyKey}={}){
 const config=assertStripeReady();
 const headers={Authorization:'Bearer '+config.secret,'Stripe-Version':stripeVersion};
 let body;if(params){headers['Content-Type']='application/x-www-form-urlencoded';body=new URLSearchParams(Object.entries(params).filter(([,value])=>value!==undefined&&value!==null).map(([key,value])=>[key,String(value)]))}
 if(idempotencyKey)headers['Idempotency-Key']=idempotencyKey;
 let result;
 try{result=await fetch('https://api.stripe.com/v1/'+path,{method,headers,body,signal:AbortSignal.timeout(15000),cache:'no-store'})}
 catch{throw new BillingError('Der Zahlungsdienst ist momentan nicht erreichbar. Bitte versuchen Sie es später erneut.',502)}
 let data;try{data=await result.json()}catch{throw new BillingError('Die Antwort des Zahlungsdiensts konnte nicht verarbeitet werden.',502)}
 if(!result.ok)throw new BillingError('Der Zahlungsdienst konnte die Anfrage nicht ausführen. Die Konfiguration muss geprüft werden.',502);
 if(typeof data.livemode==='boolean'&&data.livemode!==(config.keyMode==='live'))throw new BillingError('Die Zahlungsumgebung passt nicht zur Konfiguration.',502);
 return data;
}
export function assertBillingOwner(account){if(account?.organization?.role!=='owner')throw new BillingError('Nur der Kontoinhaber kann den Tarif verwalten.',403)}
function readOrganization(db,account){
 const org=db.prepare('SELECT * FROM organizations WHERE id=?').get(account.organization.id);
 if(!org)throw new BillingError('Das zugehörige Konto wurde nicht gefunden.',404);
 return org;
}
function isLoopback(host){return ['localhost','127.0.0.1','[::1]','::1'].includes(host)}
export function appOrigin(request,env=process.env){
 let result;
 if(env.APP_URL){try{result=new URL(env.APP_URL)}catch{throw new BillingError('Die Rücksprungadresse ist nicht eingerichtet.',503)}}
 else{
  let incoming;try{incoming=new URL(request.url);const host=request.headers.get('host')||incoming.host;result=new URL(incoming.protocol+'//'+host)}catch{throw new BillingError('Ungültige lokale Adresse.',400)}
  if(env.NODE_ENV!=='development'||!isLoopback(result.hostname))throw new BillingError('Für Zahlungen muss APP_URL eingerichtet werden.',503);
 }
 if(!['http:','https:'].includes(result.protocol)||result.username||result.password||result.pathname!=='/'||result.search||result.hash||(!isLoopback(result.hostname)&&result.protocol!=='https:'))throw new BillingError('APP_URL muss eine HTTPS-Adresse ohne Pfad sein.',503);
 return result.origin;
}
export async function getBillingStatus(account){
 const db=await database(),org=readOrganization(db,account),config=getBillingConfiguration();
 const sandbox=process.env.NODE_ENV==='development'&&Boolean(org.sandbox_enabled)&&paidPlans.has(org.sandbox_plan);
 const active=['active','trialing'].includes(org.billing_status)&&paidPlans.has(org.plan);
 const current={planId:sandbox?org.sandbox_plan:active?org.plan:'free',status:sandbox?'test':org.billing_status||'none',actualBillingStatus:org.billing_status||'none',sandbox,currentPeriodEnd:org.current_period_end||null,canManage:Boolean(org.billing_customer_id&&config.enabled),hasSubscription:Boolean(org.billing_subscription_id)};
 return {plans:billingPlans.map(plan=>({...plan,configured:plan.purchasable&&config.configured&&validPriceId(config.prices[plan.id])})),current,configured:config.configured,testMode:config.testMode,previewAvailable:process.env.NODE_ENV==='development',canManage:current.canManage};
}
export async function createCheckout(request,account,planId){
 assertBillingOwner(account);const config=assertStripeReady();
 if(!paidPlans.has(planId)||!validPriceId(config.prices[planId]))throw new BillingError('Dieser Tarif ist noch nicht für die Zahlung eingerichtet.',400);
 if(!config.webhookSecret)throw new BillingError('Die Zahlungsbestätigung ist noch nicht eingerichtet.',503);
 const origin=appOrigin(request);const price=await stripeRequest('prices/'+config.prices[planId]);const expected=billingPlans.find(plan=>plan.id===planId);if(!price.active||price.currency!=='eur'||price.unit_amount!==expected.monthlyAmount*100||price.recurring?.interval!=='month'||(price.recurring?.interval_count??1)!==1)throw new BillingError('Der hinterlegte Stripe-Preis passt nicht zum ausgewählten Monatstarif.',503);const db=await database();ensureBillingTables(db);let org=readOrganization(db,account);
 if(org.billing_subscription_id&&!terminalStatuses.has(org.billing_status))throw new BillingError('Ein Abonnement ist bereits hinterlegt. Bitte nutzen Sie die Tarifverwaltung.',409);
 let customer=stripeId(org.billing_customer_id,'cus');
 if(!customer){
  const data=await stripeRequest('customers',{method:'POST',params:{name:org.name,email:account.user.email,'metadata[organization_id]':org.id},idempotencyKey:'funknaht-customer-'+org.id});
  customer=stripeId(data,'cus');if(!customer)throw new BillingError('Das Zahlungskonto konnte nicht angelegt werden.',502);
  const collision=db.prepare('SELECT id FROM organizations WHERE billing_customer_id=? AND id<>?').get(customer,org.id);if(collision)throw new BillingError('Das Zahlungskonto konnte nicht zugeordnet werden.',409);
  db.prepare('UPDATE organizations SET billing_customer_id=? WHERE id=? AND billing_customer_id IS NULL').run(customer,org.id);
  org=readOrganization(db,account);if(org.billing_customer_id!==customer)throw new BillingError('Das Zahlungskonto wurde zwischenzeitlich geändert. Bitte laden Sie die Seite neu.',409);
 }
 const pending=db.prepare('SELECT * FROM billing_checkout_sessions WHERE organization_id=? AND created_at>? ORDER BY created_at DESC LIMIT 1').get(org.id,Math.floor(Date.now()/1000)-1800);
 if(pending){const session=await stripeRequest('checkout/sessions/'+pending.id);if(session.status==='open'&&pending.plan!==planId)throw new BillingError('Für einen anderen Tarif ist bereits eine Zahlungsseite offen. Bitte schließen Sie diese zuerst ab oder warten Sie auf deren Ablauf.',409);if(session.status==='open'&&session.customer===customer&&session.url)return {url:checkedStripeUrl(session.url,'checkout'),testMode:config.testMode};if(session.status==='complete')throw new BillingError('Die Zahlung wird noch bestätigt. Bitte laden Sie den Tarifstatus erneut.',409)}
 const session=await stripeRequest('checkout/sessions',{method:'POST',params:{mode:'subscription',customer,'line_items[0][price]':config.prices[planId],'line_items[0][quantity]':1,client_reference_id:org.id,success_url:origin+'/betrieb?tab=abo&checkout=success',cancel_url:origin+'/betrieb?tab=abo&checkout=cancelled',locale:'de'},idempotencyKey:'funknaht-checkout-'+org.id+'-'+planId+'-'+Math.floor(Date.now()/1800000)});
 const sessionId=stripeId(session,'cs');if(!sessionId||!session.url)throw new BillingError('Die Zahlungsseite konnte nicht erstellt werden.',502);
 db.prepare('INSERT OR IGNORE INTO billing_checkout_sessions(id,organization_id,plan,created_at) VALUES(?,?,?,?)').run(sessionId,org.id,planId,Math.floor(Date.now()/1000));
 return {url:checkedStripeUrl(session.url,'checkout'),testMode:config.testMode};
}
function checkedStripeUrl(value,type){let url;try{url=new URL(value)}catch{throw new BillingError('Ungültige Zahlungsadresse.',502)}if(url.protocol!=='https:'||url.hostname!==(type==='checkout'?'checkout.stripe.com':'billing.stripe.com'))throw new BillingError('Unerwartete Zahlungsadresse.',502);return url.href}
export async function createBillingManagement(request,account){
 assertBillingOwner(account);const config=assertStripeReady(),db=await database(),org=readOrganization(db,account);if(!stripeId(org.billing_customer_id,'cus'))throw new BillingError('Für dieses Konto ist noch keine Zahlungsverwaltung verfügbar.',409);
 const session=await stripeRequest('billing_portal/sessions',{method:'POST',params:{customer:org.billing_customer_id,return_url:appOrigin(request)+'/betrieb?tab=abo',locale:'de'},idempotencyKey:'funknaht-manage-'+org.id+'-'+randomUUID()});return {url:checkedStripeUrl(session.url,'portal'),testMode:config.testMode};
}
export function assertLocalPreview(request,env=process.env){
 let host;try{const url=new URL(request.url);host=new URL(url.protocol+'//'+(request.headers.get('host')||url.host)).hostname}catch{throw new BillingError('Ungültige Anfrage.',400)}
 if(env.NODE_ENV!=='development'||!isLoopback(host))throw new BillingError('Ein Tarif-Test ohne Zahlung ist ausschließlich lokal im Entwicklungsmodus verfügbar.',403);
}
export async function setLocalBillingPreview(request,account,planId){
 assertBillingOwner(account);assertLocalPreview(request);
 if(!['free','basic','betrieb'].includes(planId))throw new BillingError('Ungültiger Testtarif.',400);
 const db=await database();readOrganization(db,account);db.prepare('UPDATE organizations SET sandbox_enabled=?,sandbox_plan=? WHERE id=?').run(planId==='free'?0:1,planId==='free'?null:planId,account.organization.id);
 return getBillingStatus(account);
}
export function wasBillingEventProcessed(db,id){return Boolean(db.prepare('SELECT id FROM billing_events WHERE id=?').get(id))}
function subscriptionPeriod(subscription){const period=subscription.current_period_end??subscription.items?.data?.[0]?.current_period_end;return Number.isSafeInteger(period)&&period>0?period:null}
export async function processBillingEvent(event){
 const config=assertStripeReady();if(typeof event.livemode!=='boolean'||event.livemode!==(config.keyMode==='live'))throw new BillingError('Falsche Zahlungsumgebung.',400);
 const db=await database();ensureBillingTables(db);if(wasBillingEventProcessed(db,event.id))return {received:true,duplicate:true};
 const object=event.data.object;let subscriptionId=null,customerId=null;
 if(event.type.startsWith('customer.subscription.')){subscriptionId=stripeId(object,'sub');customerId=stripeId(object.customer,'cus')}
 else if(event.type==='checkout.session.completed'||event.type==='checkout.session.async_payment_succeeded'){
  // A redirect or client reference never grants access: retrieve the actual subscription below.
  if(object.mode==='subscription'){subscriptionId=stripeId(object.subscription,'sub');customerId=stripeId(object.customer,'cus')}
 }
 else if(event.type==='invoice.paid'||event.type==='invoice.payment_failed'){subscriptionId=stripeId(object.subscription||object.parent?.subscription_details?.subscription,'sub');customerId=stripeId(object.customer,'cus')}
 let org=null,subscription=null;
 if(subscriptionId&&customerId){
  const matches=db.prepare('SELECT * FROM organizations WHERE billing_customer_id=?').all(customerId);if(matches.length===1)org=matches[0];
  if(org){
   // Retrieve current authoritative state, so delayed events cannot reinstate old access.
   subscription=await stripeRequest('subscriptions/'+subscriptionId);
   if(stripeId(subscription,'sub')!==subscriptionId||stripeId(subscription.customer,'cus')!==customerId)throw new BillingError('Abonnement und Zahlungskonto stimmen nicht überein.',400);
   if(org.billing_subscription_id&&org.billing_subscription_id!==subscriptionId&&!terminalStatuses.has(org.billing_status))org=null;
  }
 }
 db.exec('BEGIN IMMEDIATE');
 try{
  if(wasBillingEventProcessed(db,event.id)){db.exec('COMMIT');return {received:true,duplicate:true}}
  let applied=false;
  if(org&&subscription){
   const latest=db.prepare('SELECT * FROM organizations WHERE id=?').get(org.id),plan=subscriptionPlan(subscription,config.prices),status=supportedSubscriptionStatuses.has(subscription.status)?subscription.status:'none';
   if(latest.billing_customer_id===customerId&&!isStaleBillingEvent(event.created,latest.billing_updated_at)&&(!latest.billing_subscription_id||latest.billing_subscription_id===subscriptionId||terminalStatuses.has(latest.billing_status))){
    const access=Boolean(plan&&subscriptionHasAccess(subscription));
    db.prepare('UPDATE organizations SET plan=?,billing_subscription_id=?,billing_status=?,current_period_end=?,billing_updated_at=?,sandbox_enabled=0,sandbox_plan=NULL WHERE id=?').run(access?plan:'free',subscriptionId,subscription.pause_collection?'paused':status,subscriptionPeriod(subscription),event.created,latest.id);
    applied=true;
   }
  }
  db.prepare('INSERT INTO billing_events(id,organization_id,type,created_at) VALUES(?,?,?,?)').run(event.id,org?.id||null,event.type,event.created);
  db.exec('COMMIT');return {received:true,applied};
 }catch(error){db.exec('ROLLBACK');throw error}
}
export async function readBillingBody(request){
 const raw=await request.text();if(raw.length>4096)throw new BillingError('Die Anfrage ist zu groß.',413);let body;try{body=JSON.parse(raw)}catch{throw new BillingError('Ungültige Anfrage.',400)}if(!body||typeof body!=='object'||Array.isArray(body))throw new BillingError('Ungültige Anfrage.',400);return body;
}
export function billingErrorResponse(error){const status=Number.isInteger(error?.status)?error.status:500;return Response.json({error:status<500||error instanceof BillingError?error.message:'Die Tarifverwaltung ist momentan nicht verfügbar.'},{status,headers:responseHeaders})}
