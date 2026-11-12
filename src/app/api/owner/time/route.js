import {assertMutationOrigin,readJson,jsonError,appError} from '../../../../lib/business-auth.js';
import {requireStaff,isAdmin,readTicket,audit} from '../../../../lib/owner.js';
import {addTime,removeTime,timeReport,toCsv} from '../../../../lib/tickets.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(request){try{const account=requireStaff(request);const q=new URL(request.url).searchParams,month=q.get('month')||new Date().toISOString().slice(0,7);const rows=timeReport(month,{userId:isAdmin(account)?null:account.user.id});
 if(q.get('format')==='csv'){audit(account.user.id,'time.export',month);return new Response(toCsv(rows),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="zeiten-${month}.csv"`,...headers}})}
 return Response.json({month,rows,total:rows.reduce((s,r)=>s+r.minutes,0),billable:rows.filter(r=>r.billable).reduce((s,r)=>s+r.minutes,0)},{headers})}catch(error){return jsonError(error)}}
export async function POST(request){try{assertMutationOrigin(request);const account=requireStaff(request);const d=await readJson(request);addTime(d.ticketId,{minutes:Number(d.minutes),note:d.note||'',billable:d.billable!==false,date:d.date,userId:account.user.id});return Response.json({ticket:readTicket(d.ticketId)},{status:201,headers})}catch(error){return jsonError(error)}}
export async function DELETE(request){try{assertMutationOrigin(request);requireOwner(request);const d=await readJson(request);if(typeof d.ticketId!=='string')throw appError('Anfrage fehlt.');removeTime(d.id);return Response.json({ticket:readTicket(d.ticketId)},{headers})}catch(error){return jsonError(error)}}
