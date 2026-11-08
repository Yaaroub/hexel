import {assertMutationOrigin,readJson,jsonError,rateLimit} from '../../../../lib/business-auth.js';
import {ownerAccount,elevate,elevationUntil,lock,audit} from '../../../../lib/owner.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(request){try{ownerAccount(request);const until=elevationUntil(request);return Response.json({unlocked:until>Date.now(),until},{headers})}catch(error){return jsonError(error)}}
export async function POST(request){try{assertMutationOrigin(request);const account=ownerAccount(request);rateLimit('owner-unlock:'+account.user.id,{limit:5});const data=await readJson(request);const until=await elevate(request,data.password);return Response.json({unlocked:true,until},{headers})}catch(error){return jsonError(error)}}
export async function DELETE(request){try{assertMutationOrigin(request);const account=ownerAccount(request);lock(request);audit(account.user.id,'owner.lock');return Response.json({unlocked:false},{headers})}catch(error){return jsonError(error)}}
