import {jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,auditLog} from '../../../../lib/owner.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){try{requireOwner(request);return Response.json({entries:auditLog()},{headers:{'Cache-Control':'no-store'}})}catch(error){return jsonError(error)}}
