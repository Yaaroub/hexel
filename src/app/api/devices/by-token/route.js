import {getAccount,jsonError,rateLimit,requesterKey} from '../../../../lib/business-auth';
import {deviceByToken} from '../../../../lib/devices';
import {customerOrg} from '../../../../lib/family';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
// Öffentlich über den QR-Aufkleber: nur Bezeichnung und Art. Die Kontozuordnung erfährt nur, wer dafür berechtigt ist.
export function GET(request){try{rateLimit('qr:'+requesterKey(request),{limit:300,windowMs:600000});const d=deviceByToken(new URL(request.url).searchParams.get('t'));if(!d)return Response.json({error:'Unbekannter Code.'},{status:404,headers});
 const me=getAccount(request);let forOrg=null;if(me){try{forOrg=customerOrg(me,d.organizationId)}catch{}}
 return Response.json({device:{label:d.label,kindLabel:d.kindLabel,category:d.category,...(forOrg?{id:d.id,forOrg:forOrg===me.organization.id?null:forOrg}:{})}},{headers})}catch(e){return jsonError(e)}}
