import {getAccount,jsonError,appError} from '../../../../lib/business-auth';
import {elevationUntil,audit} from '../../../../lib/owner';
import {attachmentRow,attachmentBytes} from '../../../../lib/tickets';
export const runtime='nodejs';
export const dynamic='force-dynamic';
// Customers see non-internal files of their own requests; the unlocked owner sees all, recorded in the audit log.
export async function GET(request,{params}){try{const {id}=await params;const account=getAccount(request);if(!account)throw appError('Bitte melden Sie sich an.',401,'AUTH_REQUIRED');const row=attachmentRow(id);
 const isOwner=account.isOwner&&elevationUntil(request)>Date.now();
 const isCustomer=row.organization_id===account.organization.id&&!row.internal;
 if(!isOwner&&!isCustomer)throw appError('Datei nicht gefunden.',404,'NOT_FOUND');
 if(isOwner&&!isCustomer)audit(account.user.id,'attachment.view',row.ticket_id);
 const download=new URL(request.url).searchParams.get('download')==='1'||row.mime==='application/pdf';
 return new Response(attachmentBytes(row),{headers:{'Content-Type':row.mime,'Content-Length':String(row.size),'Content-Disposition':`${download?'attachment':'inline'}; filename="${row.filename}"`,'Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",'X-Content-Type-Options':'nosniff'}})}catch(e){return jsonError(e)}}
