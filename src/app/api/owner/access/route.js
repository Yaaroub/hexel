import {assertMutationOrigin,readJson,jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,audit} from '../../../../lib/owner.js';
import {changeAccess,getAccessSettings,saveAccessSettings} from '../../../../lib/access.js';
import {plans} from '../../../../lib/business-plans.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
// Zugang einzelner Konten (freischalten, sperren, Testphase, Nutzung bis) und Voreinstellungen für neue Konten.
export async function GET(request){try{requireOwner(request);return Response.json({settings:getAccessSettings(),plans:plans.filter(p=>p.id!=='free').map(p=>({id:p.id,name:p.name}))},{headers})}catch(e){return jsonError(e)}}
export async function POST(request){try{assertMutationOrigin(request);const a=requireOwner(request);const b=await readJson(request);
 if(b.action==='settings'){const settings=saveAccessSettings(b);audit(a.user.id,'access.settings');return Response.json({settings},{headers})}
 const access=changeAccess(b.organizationId,b);audit(a.user.id,'access.'+String(b.action).slice(0,20),String(b.organizationId||'').slice(0,64));
 return Response.json({access},{headers})}catch(e){return jsonError(e)}}
