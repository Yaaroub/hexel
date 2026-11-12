import {assertMutationOrigin,readJson,jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,audit} from '../../../../lib/owner.js';
import {teamPeople,inviteStaff,updateStaff} from '../../../../lib/staff.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(request){try{requireOwner(request);return Response.json({people:teamPeople({includeInactive:true})},{headers})}catch(e){return jsonError(e)}}
export async function POST(request){try{assertMutationOrigin(request);const a=requireOwner(request);const d=await readJson(request);const r=inviteStaff(d,process.env.APP_URL||new URL(request.url).origin);audit(a.user.id,'team.invite',d.role);return Response.json({...r,people:teamPeople({includeInactive:true})},{status:201,headers})}catch(e){return jsonError(e)}}
export async function PATCH(request){try{assertMutationOrigin(request);const a=requireOwner(request);const d=await readJson(request);updateStaff(d.id,{role:d.role,active:d.active});audit(a.user.id,'team.update',String(d.id||'').slice(0,64));return Response.json({people:teamPeople({includeInactive:true})},{headers})}catch(e){return jsonError(e)}}
