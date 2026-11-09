import {requireAccount,assertMutationOrigin,jsonError,rateLimit,appError} from '../../../../../../lib/business-auth';
import {customerThread,saveAttachment,MAX_ATTACHMENT_BYTES} from '../../../../../../lib/tickets';
import {customerOrg} from '../../../../../../lib/family';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request,{params}){try{assertMutationOrigin(request);const account=requireAccount(request);rateLimit('upload:'+account.user.id,{limit:20,windowMs:3600000});const {id}=await params;
 const orgId=customerOrg(account,new URL(request.url).searchParams.get('for'));customerThread(orgId,id);
 if(Number(request.headers.get('content-length'))>MAX_ATTACHMENT_BYTES+64*1024)throw appError('Die Datei ist größer als 5 MB.',413,'FILE_TOO_LARGE');
 const form=await request.formData().catch(()=>null);if(!form)throw appError('Die Datei konnte nicht gelesen werden.');
 const attachment=await saveAttachment(id,{file:form.get('file'),author:'customer'});
 return Response.json({attachment,...customerThread(orgId,id)},{status:201,headers:{'Cache-Control':'no-store'}})}catch(e){return jsonError(e)}}
