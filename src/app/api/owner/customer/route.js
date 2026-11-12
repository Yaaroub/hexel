import {assertMutationOrigin,readJson,jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,audit} from '../../../../lib/owner.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
import {getDb} from '../../../../lib/business-db.js';
import {listDevices,DEVICE_KINDS} from '../../../../lib/devices.js';
import {listMonitors,heartbeatScript} from '../../../../lib/monitors.js';
import {listDocuments} from '../../../../lib/documents.js';
import {maskEmail} from '../../../../lib/owner.js';
import {baseUrl} from '../../../../lib/appointments-extra.js';
import {accessOf} from '../../../../lib/access.js';
import {plans} from '../../../../lib/business-plans.js';
// Kundenakte: was FUNKNAHT für diesen Kunden betreut. Betriebsdaten (Kunden, Termine, Aufträge) bleiben verborgen.
export async function GET(request){try{const a=requireOwner(request);const org=String(new URL(request.url).searchParams.get('org')||'');const db=getDb();const o=db.prepare('SELECT * FROM organizations WHERE id=?').get(org);if(!o)return Response.json({error:'Konto nicht gefunden.'},{status:404,headers});
 audit(a.user.id,'customer.view',org);
 const person=db.prepare('SELECT name,email FROM users WHERE organization_id=? ORDER BY created_at LIMIT 1').get(org);
 const tickets=db.prepare('SELECT id,status,priority,created_at,payload FROM support_tickets WHERE organization_id=? ORDER BY created_at DESC LIMIT 50').all(org).map(t=>{let p={};try{p=JSON.parse(t.payload)}catch{}return {id:t.id,status:t.status,priority:t.priority,createdAt:t.created_at,category:p.category,summary:String(p.description||'').slice(0,100)}});
 return Response.json({customer:{id:o.id,name:o.account_type==='business'?o.name:person?.name||'Privatkunde',accountType:o.account_type,contact:person?{name:person.name,email:person.email,masked:maskEmail(person.email)}:null,createdAt:o.created_at,paidPlan:['active','trialing'].includes(o.billing_status)?o.plan:null},access:accessOf(o),plans:plans.filter(p=>p.id!=='free').map(p=>({id:p.id,name:p.name})),devices:listDevices(org),kinds:DEVICE_KINDS,qrBase:baseUrl()+'/h/',monitors:listMonitors(org).map(m=>m.kind==='heartbeat'?{...m,scripts:heartbeatScript(m.token,baseUrl())}:m),documents:listDocuments({organizationId:org}),tickets},{headers})}catch(e){return jsonError(e)}}
