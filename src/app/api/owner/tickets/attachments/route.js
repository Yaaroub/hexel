import {assertMutationOrigin,jsonError,appError} from '../../../../../lib/business-auth.js';
import {requireStaff,readTicket,audit} from '../../../../../lib/owner.js';
import {saveAttachment,MAX_ATTACHMENT_BYTES} from '../../../../../lib/tickets.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request){try{assertMutationOrigin(request);const account=requireStaff(request);
 if(Number(request.headers.get('content-length'))>MAX_ATTACHMENT_BYTES+64*1024)throw appError('Die Datei ist größer als 5 MB.',413,'FILE_TOO_LARGE');
 const form=await request.formData().catch(()=>null);if(!form)throw appError('Die Datei konnte nicht gelesen werden.');
 const id=String(form.get('id')||''),internal=form.get('internal')==='true';readTicket(id);
 await saveAttachment(id,{file:form.get('file'),author:'owner',internal});audit(account.user.id,'ticket.attachment',id);
 return Response.json({ticket:readTicket(id)},{status:201,headers:{'Cache-Control':'no-store'}})}catch(error){return jsonError(error)}}
