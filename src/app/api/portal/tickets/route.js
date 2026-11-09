import {requireAccount,assertMutationOrigin,readJson,jsonError,rateLimit} from '../../../../lib/business-auth';
import {validateTicket} from '../../../../lib/portal-validation';
import {getDiagnostic} from '../../../../lib/portal-knowledge';
import {createTicket,customerTickets,setCustomerStatus} from '../../../../lib/tickets';
import {customerOrg} from '../../../../lib/family';
import {notify} from '../../../../lib/mailer';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
const priorityLabel={normal:'Normal',hoch:'Hoch',dringend:'Dringend – nichts geht mehr'};
// „for“: Angehörige handeln mit Erlaubnis für ein verbundenes Konto.
export async function GET(request){try{const account=requireAccount(request);const orgId=customerOrg(account,new URL(request.url).searchParams.get('for'));return Response.json({tickets:customerTickets(orgId)},{headers})}catch(e){return jsonError(e)}}
export async function POST(request){try{assertMutationOrigin(request);const account=requireAccount(request);const data=await readJson(request);const orgId=customerOrg(account,data.for);rateLimit('ticket:'+orgId,{limit:20,windowMs:3600000});const result=validateTicket(data);if(result.error)return Response.json({error:result.error},{status:400,headers});
 const priority=result.value.category==='betrug'&&(data.priority||'normal')==='normal'?'hoch':(data.priority||'normal');
 const ticket=createTicket(account,result.value,{priority,diagnostics:data.diagnostics,orgId,deviceId:data.deviceId});
 notify({to:process.env.EMAIL_TO,subject:(ticket.priority==='dringend'?'DRINGEND: ':'')+(result.value.category==='betrug'?'Betrugs-Prüfung ':'Neue Portal-Anfrage ')+ticket.id,text:`Im Portal ist eine neue Anfrage eingegangen.\n\nNummer: ${ticket.id}\nBereich: ${getDiagnostic(result.value.category)?.title||result.value.category}\nDringlichkeit: ${priorityLabel[ticket.priority]}${orgId!==account.organization.id?'\nGestellt von einer angehörigen Person.':''}\n\nDie Details finden Sie im Inhaberbereich unter „Anfragen“.`});
 return Response.json({ticket},{status:201,headers})}catch(e){return jsonError(e)}}
export async function PATCH(request){try{assertMutationOrigin(request);const account=requireAccount(request),data=await readJson(request);return Response.json(setCustomerStatus(account,data.id,data.status,customerOrg(account,data.for)),{headers})}catch(e){return jsonError(e)}}
