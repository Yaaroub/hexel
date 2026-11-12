import {assertMutationOrigin,readJson,jsonError} from '../../../../../lib/business-auth.js';
import {requireStaff,readTicket,audit} from '../../../../../lib/owner.js';
import {addOwnerMessage} from '../../../../../lib/tickets.js';
import {notify} from '../../../../../lib/mailer.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request){try{assertMutationOrigin(request);const account=requireStaff(request);const data=await readJson(request);const internal=data.internal===true;
 addOwnerMessage(account.user.id,data.id,{body:data.body,internal});audit(account.user.id,internal?'ticket.note':'ticket.reply',data.id);
 const ticket=readTicket(data.id);
 if(!internal&&data.notify===true&&ticket.email)notify({to:ticket.email,subject:'Neue Antwort zu Ihrer Anfrage '+ticket.id,text:`Guten Tag${ticket.name?' '+ticket.name:''},\n\nzu Ihrer Anfrage ${ticket.id} gibt es eine neue Antwort:\n\n${String(data.body).trim()}\n\nSie können im Portal unter „Meine Anfragen“ direkt antworten.\n\nFUNKNAHT`});
 return Response.json({ticket},{headers:{'Cache-Control':'no-store'}})}catch(error){return jsonError(error)}}
