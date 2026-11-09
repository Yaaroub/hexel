import {requireAccount,assertMutationOrigin,readJson,jsonError,rateLimit} from '../../../lib/business-auth';
import {createFamilyInvite,removeFamilyLink} from '../../../lib/family';
import {baseUrl} from '../../../lib/appointments-extra';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function POST(request){try{assertMutationOrigin(request);const account=requireAccount(request);rateLimit('family:'+account.user.id,{limit:10,windowMs:3600000});const d=await readJson(request);const token=createFamilyInvite(account,d.label||'');return Response.json({link:baseUrl()+'/einladung/'+token},{status:201,headers})}catch(e){return jsonError(e)}}
export async function DELETE(request){try{assertMutationOrigin(request);const account=requireAccount(request);const d=await readJson(request);removeFamilyLink(account,d.id);return Response.json({ok:true},{headers})}catch(e){return jsonError(e)}}
