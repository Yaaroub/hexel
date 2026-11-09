import {assertMutationOrigin,readJson,jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,audit} from '../../../../lib/owner.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
import {listDocuments,getDocument,createDocument,updateDraft,setDocumentStatus,deleteDraft,ITEM_KINDS,STATUS} from '../../../../lib/documents.js';
import {getOwnerSettings} from '../../../../lib/settings.js';
import {company} from '../../../../lib/company.js';
import {notify} from '../../../../lib/mailer.js';
import {baseUrl} from '../../../../lib/appointments-extra.js';
export async function GET(request){try{requireOwner(request);const q=new URL(request.url).searchParams;if(q.get('id'))return Response.json({document:getDocument(q.get('id'))},{headers});return Response.json({documents:listDocuments({organizationId:q.get('org')||undefined}),kinds:ITEM_KINDS,status:STATUS,settings:getOwnerSettings(),companyComplete:!!(company.owner&&company.street&&company.city)},{headers})}catch(e){return jsonError(e)}}
export async function POST(request){try{assertMutationOrigin(request);const a=requireOwner(request);const d=await readJson(request);const id=createDocument(d);audit(a.user.id,'document.create',id);return Response.json({document:getDocument(id)},{status:201,headers})}catch(e){return jsonError(e)}}
export async function PATCH(request){try{assertMutationOrigin(request);const a=requireOwner(request);const d=await readJson(request);
 if(d.status){setDocumentStatus(d.id,d.status);audit(a.user.id,'document.'+d.status,d.id);const doc=getDocument(d.id);
  if(d.status==='versendet'&&d.notify===true&&doc.recipient?.email){const offer=doc.type==='angebot';const where=doc.organizationId?'\n\nSie finden '+(offer?'es':'sie')+' in Ihrem Konto unter „Mein Bereich“ → „Belege“:\n'+baseUrl()+'/portal/werkstatt':'';notify({to:doc.recipient.email,subject:(offer?'Ihr Angebot ':'Ihre Rechnung ')+doc.number,text:'Guten Tag '+doc.recipient.name+',\n\n'+(offer?'unser Angebot ':'unsere Rechnung ')+doc.number+' ist fertig.'+where+'\n\nViele Grüße\nFUNKNAHT'})}
  return Response.json({document:doc},{headers})}
 updateDraft(d.id,d);return Response.json({document:getDocument(d.id)},{headers})}catch(e){return jsonError(e)}}
export async function DELETE(request){try{assertMutationOrigin(request);const a=requireOwner(request);const d=await readJson(request);deleteDraft(d.id);audit(a.user.id,'document.delete',d.id);return Response.json({ok:true},{headers})}catch(e){return jsonError(e)}}
