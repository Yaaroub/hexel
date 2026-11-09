import QRCode from 'qrcode';
import {jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,audit} from '../../../../lib/owner.js';
import {getDb} from '../../../../lib/business-db.js';
import {listDevices} from '../../../../lib/devices.js';
import {baseUrl} from '../../../../lib/appointments-extra.js';
import {company} from '../../../../lib/company.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
// QR-Aufkleber für die Geräte eines Kunden. Der Code enthält nur einen zufälligen Schlüssel, keine Kundendaten.
export async function GET(request){try{const a=requireOwner(request);const org=String(new URL(request.url).searchParams.get('org')||'');
 const o=getDb().prepare('SELECT name,account_type FROM organizations WHERE id=?').get(org);if(!o)return Response.json({error:'Konto nicht gefunden.'},{status:404});
 audit(a.user.id,'labels.print',org);
 const base=baseUrl()+'/h/';
 const labels=await Promise.all(listDevices(org).map(async d=>({id:d.id,label:d.label,kind:d.kindLabel,location:d.location,url:base+d.qrToken,svg:await QRCode.toString(base+d.qrToken,{type:'svg',margin:0,errorCorrectionLevel:'M',color:{dark:'#20242A',light:'#FFFFFF'}})})));
 return Response.json({customer:o.account_type==='business'?o.name:'',phone:company.phone,labels},{headers:{'Cache-Control':'no-store'}})}catch(e){return jsonError(e)}}
