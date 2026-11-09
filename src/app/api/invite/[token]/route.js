import {getAccount,requireAccount,assertMutationOrigin,readJson,jsonError,rateLimit,requesterKey,createSession,sessionCookie} from '../../../../lib/business-auth';
import {inviteInfo,acceptFamilyInvite} from '../../../../lib/family';
import {joinTeam,ROLES} from '../../../../lib/team';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(request,{params}){try{rateLimit('invite:'+requesterKey(request),{limit:200,windowMs:600000});const {token}=await params;const i=inviteInfo(token);const me=getAccount(request);
 return Response.json({kind:i.kind,inviter:i.inviter,organizationName:i.organizationName,email:i.email,roleLabel:i.role?ROLES[i.role]:undefined,expired:i.expired,accepted:i.accepted,signedIn:!!me,signedInAs:me?.user.email},{headers})}catch(e){return jsonError(e)}}
export async function POST(request,{params}){try{assertMutationOrigin(request);rateLimit('invite-accept:'+requesterKey(request),{limit:20});const {token}=await params;const i=inviteInfo(token);
 if(i.kind==='family'){acceptFamilyInvite(requireAccount(request),token);return Response.json({ok:true,next:'/portal/werkstatt'},{headers})}
 const data=await readJson(request);const userId=await joinTeam(token,data);return Response.json({ok:true,next:'/betrieb'},{headers:{...headers,'Set-Cookie':sessionCookie(createSession(userId))}})}catch(e){return jsonError(e)}}
