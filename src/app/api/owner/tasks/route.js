import {assertMutationOrigin,readJson,jsonError,appError} from '../../../../lib/business-auth.js';
import {requireStaff,isAdmin,audit} from '../../../../lib/owner.js';
import {listTasks,createTask,setTaskStatus,deleteTask,teamPeople} from '../../../../lib/staff.js';
import {getDb} from '../../../../lib/business-db.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(request){try{const a=requireStaff(request);const q=new URL(request.url).searchParams;const who=q.get('who')||'alle';
 return Response.json({tasks:listTasks({status:q.get('status')||'offen',assigneeUserId:who==='ich'?a.user.id:who==='frei'?'frei':undefined}),people:teamPeople().filter(p=>p.userId).map(p=>({userId:p.userId,name:p.name})),me:a.user.id},{headers})}catch(e){return jsonError(e)}}
export async function POST(request){try{assertMutationOrigin(request);const a=requireStaff(request);const d=await readJson(request);const t=createTask({title:d.title,notes:d.notes,assigneeUserId:d.assigneeUserId||null,dueOn:d.dueOn||null,ticketId:d.ticketId||null},a.user.id);audit(a.user.id,'task.create',t.id);return Response.json({task:t},{status:201,headers})}catch(e){return jsonError(e)}}
export async function PATCH(request){try{assertMutationOrigin(request);const a=requireStaff(request);const d=await readJson(request);const t=setTaskStatus(d.id,d.status,a.user.id);return Response.json({task:t},{headers})}catch(e){return jsonError(e)}}
export async function DELETE(request){try{assertMutationOrigin(request);const a=requireStaff(request);const d=await readJson(request);const row=getDb().prepare('SELECT created_by FROM tasks WHERE id=?').get(String(d.id||''));if(!row)throw appError('Aufgabe nicht gefunden.',404);if(!isAdmin(a)&&row.created_by!==a.user.id)throw appError('Nur wer die Aufgabe angelegt hat, oder ein Admin kann sie löschen.',403);deleteTask(d.id);audit(a.user.id,'task.delete',d.id);return Response.json({ok:true},{headers})}catch(e){return jsonError(e)}}
