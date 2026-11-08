import {assertMutationOrigin,readJson,jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,listTickets,openTicket,readTicket,audit} from '../../../../lib/owner.js';
import {updateTicketMeta} from '../../../../lib/tickets.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(request){try{const account=requireOwner(request);const id=new URL(request.url).searchParams.get('id');return Response.json(id?{ticket:openTicket(account.user.id,id)}:{tickets:listTickets()},{headers})}catch(error){return jsonError(error)}}
export async function PATCH(request){try{assertMutationOrigin(request);const account=requireOwner(request);const data=await readJson(request);const changed=updateTicketMeta(data.id,{status:data.status,priority:data.priority});
 if(changed.changedStatus)audit(account.user.id,'ticket.status:'+data.status,data.id);if(changed.changedPriority)audit(account.user.id,'ticket.priority:'+data.priority,data.id);
 return Response.json({ticket:readTicket(data.id)},{headers})}catch(error){return jsonError(error)}}
