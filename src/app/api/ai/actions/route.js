import {assertMutationOrigin,readJson,jsonError,requireAccount,rateLimit,appError} from '../../../../lib/business-auth.js';
import {requireStaff,audit} from '../../../../lib/owner.js';
import {pendingAction,finishAction,logAi} from '../../../../lib/ai/engine.js';
import {executeWorkspaceAction} from '../../../../lib/ai/workspace.js';
import {executeCustomerAction} from '../../../../lib/ai/customer.js';
import {getDb} from '../../../../lib/business-db.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
// Vorschläge der KI bestätigen oder verwerfen. Nur die Person, für die der Vorschlag erstellt wurde, kann entscheiden.
export async function POST(request){try{assertMutationOrigin(request);
 const data=await readJson(request);if(!['ausfuehren','verwerfen'].includes(data.decision))throw appError('Ungültige Entscheidung.');
 const peek=getDb().prepare('SELECT surface FROM ai_actions WHERE id=?').get(String(data.id||''));
 const account=peek?.surface==='workspace'?requireStaff(request):requireAccount(request);
 rateLimit('ai-action:'+account.user.id,{limit:30,windowMs:60000});
 const row=pendingAction(data.id,account.user.id);
 if(data.decision==='verwerfen'){finishAction(row.id,'verworfen');if(row.surface==='workspace')audit(account.user.id,'ai.action.reject',row.kind);return Response.json({status:'verworfen'},{headers})}
 try{
  const result=row.surface==='workspace'?executeWorkspaceAction(row,account):executeCustomerAction(row,account);
  finishAction(row.id,'ausgefuehrt',result);
  if(row.surface==='workspace')audit(account.user.id,'ai.action.run',row.kind);
  return Response.json({status:'ausgefuehrt',...result},{headers});
 }catch(e){finishAction(row.id,'fehler',{error:e.message});logAi({surface:row.surface,userId:account.user.id,orgId:account.organization.id,status:'fehler',errorCode:'ACTION_FAILED'});throw e}
}catch(e){return jsonError(e)}}
