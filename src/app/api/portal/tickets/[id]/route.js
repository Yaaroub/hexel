import {requireAccount,assertMutationOrigin,readJson,jsonError,rateLimit} from '../../../../../lib/business-auth';
import {customerThread,addCustomerMessage} from '../../../../../lib/tickets';
import {notify} from '../../../../../lib/mailer';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(request,{params}){try{const account=requireAccount(request);const {id}=await params;return Response.json(customerThread(account.organization.id,id),{headers})}catch(e){return jsonError(e)}}
export async function POST(request,{params}){try{assertMutationOrigin(request);const account=requireAccount(request);rateLimit('msg:'+account.user.id,{limit:30,windowMs:600000});const {id}=await params;const data=await readJson(request);const result=addCustomerMessage(account,id,data.body);
 notify({to:process.env.EMAIL_TO,subject:'Neue Nachricht zu '+id,text:`Zur Anfrage ${id} hat der Kunde eine neue Nachricht geschrieben.\n\nLesen und antworten im Inhaberbereich unter „Anfragen“.`});
 return Response.json(result,{headers})}catch(e){return jsonError(e)}}
