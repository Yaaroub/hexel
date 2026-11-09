import {getAccount,assertMutationOrigin,readJson,jsonError,appError} from '../../../../lib/business-auth';
import {getDocument,respondToOffer} from '../../../../lib/documents';
import {customerOrg} from '../../../../lib/family';
import {elevationUntil} from '../../../../lib/owner';
import {notify} from '../../../../lib/mailer';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
// Kunden sehen ihre versendeten Belege, der entsperrte Inhaber alle.
export async function GET(request,{params}){try{const account=getAccount(request);if(!account)throw appError('Bitte melden Sie sich an.',401,'AUTH_REQUIRED');const {id}=await params;const q=new URL(request.url).searchParams;
 if(account.isOwner&&elevationUntil(request)>Date.now()&&q.get('as')!=='customer'){return Response.json({document:getDocument(id),owner:true},{headers})}
 return Response.json({document:getDocument(id,{organizationId:customerOrg(account,q.get('for')),forCustomer:true})},{headers})}catch(e){return jsonError(e)}}
export async function POST(request,{params}){try{assertMutationOrigin(request);const account=getAccount(request);if(!account)throw appError('Bitte melden Sie sich an.',401,'AUTH_REQUIRED');const {id}=await params;const d=await readJson(request);const doc=respondToOffer(customerOrg(account,d.for),id,d.accept===true);
 notify({to:process.env.EMAIL_TO,subject:`Angebot ${doc.number} ${d.accept===true?'angenommen':'abgelehnt'}`,text:`${doc.recipient?.name||'Der Kunde'} hat das Angebot ${doc.number} ${d.accept===true?'angenommen':'abgelehnt'}.`});
 return Response.json({document:doc},{headers})}catch(e){return jsonError(e)}}
