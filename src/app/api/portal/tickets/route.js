import {requireAccount,assertMutationOrigin,readJson,jsonError,rateLimit} from '../../../../lib/business-auth';
import {validateTicket} from '../../../../lib/portal-validation';
import {getDiagnostic} from '../../../../lib/portal-knowledge';
import {createTicket,customerTickets,setCustomerStatus} from '../../../../lib/tickets';
import {notify} from '../../../../lib/mailer';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
const priorityLabel={normal:'Normal',hoch:'Hoch',dringend:'Dringend – Betrieb steht still'};
export async function GET(request){try{const account=requireAccount(request);return Response.json({tickets:customerTickets(account.organization.id)},{headers})}catch(e){return jsonError(e)}}
export async function POST(request){try{assertMutationOrigin(request);const account=requireAccount(request);rateLimit('ticket:'+account.organization.id,{limit:20,windowMs:3600000});const data=await readJson(request);const result=validateTicket(data);if(result.error)return Response.json({error:result.error},{status:400,headers});
 const ticket=createTicket(account,result.value,{priority:data.priority||'normal',diagnostics:data.diagnostics});
 // The owner only learns that a request exists; details are read in the owner area.
 notify({to:process.env.EMAIL_TO,subject:(ticket.priority==='dringend'?'DRINGEND: ':'')+'Neue Portal-Anfrage '+ticket.id,text:`Im Portal ist eine neue Anfrage eingegangen.\n\nNummer: ${ticket.id}\nBereich: ${getDiagnostic(result.value.category)?.title||result.value.category}\nDringlichkeit: ${priorityLabel[ticket.priority]}\n\nDie Details finden Sie im Inhaberbereich unter „Anfragen“.`});
 return Response.json({ticket},{status:201,headers})}catch(e){return jsonError(e)}}
// Customers can close their own request or reopen it; working states belong to the owner.
export async function PATCH(request){try{assertMutationOrigin(request);const account=requireAccount(request),data=await readJson(request);return Response.json(setCustomerStatus(account,data.id,data.status),{headers})}catch(e){return jsonError(e)}}
