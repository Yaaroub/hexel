import {assertMutationOrigin,readJson,jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,audit} from '../../../../lib/owner.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
import {listCallbacks,setCallbackStatus} from '../../../../lib/callbacks.js';
export async function GET(request){try{const a=requireOwner(request);audit(a.user.id,'callbacks.list');return Response.json({callbacks:listCallbacks()},{headers})}catch(e){return jsonError(e)}}
export async function PATCH(request){try{assertMutationOrigin(request);requireOwner(request);const d=await readJson(request);setCallbackStatus(d.id,d.status);return Response.json({callbacks:listCallbacks()},{headers})}catch(e){return jsonError(e)}}
