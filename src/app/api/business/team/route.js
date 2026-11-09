import {requireAccount,assertMutationOrigin,readJson,jsonError,rateLimit} from '../../../../lib/business-auth';
import {teamMembers,inviteMember,updateMember,removeMember,revokeInvite,requireRole,ROLES} from '../../../../lib/team';
import {baseUrl} from '../../../../lib/appointments-extra';
import {notify} from '../../../../lib/mailer';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(request){try{const account=requireAccount(request);requireRole(account,'inhaber','buero');return Response.json({...teamMembers(account.organization.id),roles:ROLES,me:account.user.id},{headers})}catch(e){return jsonError(e)}}
export async function POST(request){try{assertMutationOrigin(request);const account=requireAccount(request);rateLimit('team:'+account.user.id,{limit:20,windowMs:3600000});const d=await readJson(request);const token=inviteMember(account,d);const link=baseUrl()+'/einladung/'+token;
 notify({to:String(d.email).trim().toLowerCase(),subject:'Einladung zu '+account.organization.name,text:`${account.user.name} lädt Sie ein, im Arbeitsbereich von ${account.organization.name} mitzuarbeiten (Rolle: ${ROLES[d.role]}).\n\nZugang einrichten:\n${link}\n\nDer Link ist 7 Tage gültig.`});
 return Response.json({link,...teamMembers(account.organization.id)},{status:201,headers})}catch(e){return jsonError(e)}}
export async function PATCH(request){try{assertMutationOrigin(request);const account=requireAccount(request);const d=await readJson(request);updateMember(account,d.userId,d.role);return Response.json(teamMembers(account.organization.id),{headers})}catch(e){return jsonError(e)}}
export async function DELETE(request){try{assertMutationOrigin(request);const account=requireAccount(request);const d=await readJson(request);if(d.inviteId)revokeInvite(account,d.inviteId);else removeMember(account,d.userId);return Response.json(teamMembers(account.organization.id),{headers})}catch(e){return jsonError(e)}}
