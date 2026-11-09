import {assertMutationOrigin,readJson,jsonError,rateLimit,requesterKey} from '../../../lib/business-auth';
import {createCallback} from '../../../lib/callbacks';
import {notify} from '../../../lib/mailer';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
// Öffentlich: Rückruf-Wunsch ohne Konto. Honeypot-Feld „website“ fängt Bots ab.
export async function POST(request){try{assertMutationOrigin(request);const key=requesterKey(request);rateLimit('callback:'+key,{limit:key==='direct'?60:5,windowMs:3600000});const data=await readJson(request);
 if(data.website)return Response.json({ok:true},{headers});
 const c=createCallback(data);
 notify({to:process.env.EMAIL_TO,subject:'Rückruf-Wunsch: '+c.topic,text:`Neuer Rückruf-Wunsch über die Website.\n\nThema: ${c.topic}\nZeitfenster: ${c.timeWindow}\n\nName und Telefonnummer finden Sie im Inhaberbereich unter „Rückrufe“.`});
 return Response.json({ok:true},{status:201,headers})}catch(e){return jsonError(e)}}
