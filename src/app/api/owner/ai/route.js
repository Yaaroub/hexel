import {assertMutationOrigin,readJson,jsonError,rateLimit} from '../../../../lib/business-auth.js';
import {requireStaff} from '../../../../lib/owner.js';
import {aiConfig,runAgent,validateConversation} from '../../../../lib/ai/engine.js';
import {workspaceTools,workspaceSystem} from '../../../../lib/ai/workspace.js';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
const headers={'Cache-Control':'no-store'};
// Workspace-Assistent: nur für das Team, mit den Rechten der angemeldeten Person.
export async function GET(request){try{const a=requireStaff(request),c=aiConfig();return Response.json({configured:c.configured&&c.workspace,enabled:c.workspace,provider:c.name,model:c.model,region:c.region,role:a.staff.role,tools:Object.keys(workspaceTools(a))},{headers})}catch(e){return jsonError(e)}}
export async function POST(request){try{assertMutationOrigin(request);const account=requireStaff(request);const config=aiConfig();
 if(!config.workspace)return Response.json({error:'Der Workspace-Assistent ist abgeschaltet (AI_WORKSPACE=off).',code:'AI_DISABLED'},{status:503,headers});
 rateLimit('ai-ws:'+account.user.id,{limit:20,windowMs:60000});
 const input=validateConversation(await readJson(request),{maxHistory:16});
 const result=await runAgent({surface:'workspace',account,role:account.staff.role,system:workspaceSystem(account),history:input.history,message:input.message,tools:workspaceTools(account),maxSteps:8,config});
 return Response.json(result,{headers})}catch(e){return jsonError(e)}}
