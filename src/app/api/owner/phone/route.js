import {assertMutationOrigin,readJson,jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,audit} from '../../../../lib/owner.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
import {createPhoneTicket} from '../../../../lib/callbacks.js';
// Anruf erfassen: aus einem Telefonat wird in Sekunden eine Anfrage mit Zeiterfassung.
export async function POST(request){try{assertMutationOrigin(request);const a=requireOwner(request);const d=await readJson(request);const id=createPhoneTicket(a,d);audit(a.user.id,'ticket.phone',id);return Response.json({id},{status:201,headers})}catch(e){return jsonError(e)}}
