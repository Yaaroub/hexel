import {jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,listAccounts,audit} from '../../../../lib/owner.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){try{const account=requireOwner(request);audit(account.user.id,'accounts.list');return Response.json({accounts:listAccounts()},{headers:{'Cache-Control':'no-store'}})}catch(error){return jsonError(error)}}
