import {assertMutationOrigin,readJson,jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,audit} from '../../../../lib/owner.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
import {allNotices,createNotice,endNotice} from '../../../../lib/notices.js';
export async function GET(request){try{requireOwner(request);return Response.json({notices:allNotices()},{headers})}catch(e){return jsonError(e)}}
export async function POST(request){try{assertMutationOrigin(request);const a=requireOwner(request);const d=await readJson(request);const id=createNotice(d);audit(a.user.id,'notice.create',id);return Response.json({notices:allNotices()},{status:201,headers})}catch(e){return jsonError(e)}}
export async function DELETE(request){try{assertMutationOrigin(request);const a=requireOwner(request);const d=await readJson(request);endNotice(d.id);audit(a.user.id,'notice.end',d.id);return Response.json({notices:allNotices()},{headers})}catch(e){return jsonError(e)}}
