import {requireAccount,assertMutationOrigin,readJson,jsonError,rateLimit,appError} from '../../../../lib/business-auth';
import {getDb} from '../../../../lib/business-db';
import {getPlan} from '../../../../lib/business-plans';
import {customerOrg} from '../../../../lib/family';
import {aiConfig,runAgent,validateConversation} from '../../../../lib/ai/engine';
import {customerTools,customerSystem} from '../../../../lib/ai/customer';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
const headers={'Cache-Control':'no-store'};
function period(){return new Date().toISOString().slice(0,7)}
function usage(account){const limit=getPlan(account.organization.effectivePlan).limits.aiPerMonth;const used=getDb().prepare('SELECT count FROM ai_usage WHERE organization_id=? AND period=?').get(account.organization.id,period())?.count||0;return {limit,used,remaining:Math.max(0,limit-used),period:period()}}
export async function GET(request){try{const account=requireAccount(request),config=aiConfig();return Response.json({configured:config.configured&&config.customer,provider:config.name,model:config.model,region:config.region,usage:usage(account)},{headers});}catch(e){return jsonError(e)}}
export async function POST(request){
 let reservation=null;
 try{
  assertMutationOrigin(request);const account=requireAccount(request);rateLimit('ai:'+account.organization.id,{limit:10,windowMs:60000});
  const data=await readJson(request),config=aiConfig();
  if(data.consent!==true)throw appError('Bitte bestätigen Sie die Übermittlung an den KI-Anbieter.');
  if(!config.customer)throw Object.assign(Error('Der KI-Assistent ist gerade abgeschaltet. Die geführten Prüfschritte und persönliche Anfragen bleiben nutzbar.'),{status:503,code:'AI_DISABLED'});
  if(!config.configured)throw Object.assign(Error('Der KI-Assistent ist noch nicht eingerichtet. Die geführten Prüfschritte bleiben nutzbar.'),{status:503,code:'AI_NOT_CONFIGURED'});
  const input=validateConversation(data,{maxHistory:10});
  const orgId=customerOrg(account,data.for),acting=orgId!==account.organization.id?getDb().prepare('SELECT name FROM organizations WHERE id=?').get(orgId)?.name:null;
  const db=getDb(),month=period(),limit=getPlan(account.organization.effectivePlan).limits.aiPerMonth;
  const reserved=db.prepare('INSERT INTO ai_usage(organization_id,period,count) VALUES(?,?,1) ON CONFLICT(organization_id,period) DO UPDATE SET count=count+1 WHERE count<? RETURNING count').get(account.organization.id,month,limit);
  if(!reserved)throw Object.assign(Error('Ihr monatliches KI-Kontingent ist aufgebraucht. Persönliche Anfragen und die Prüfschritte bleiben verfügbar.'),{status:429,code:'AI_LIMIT'});
  reservation={id:account.organization.id,month};
  const category=typeof data.category==='string'?data.category.slice(0,40):'';
  const result=await runAgent({surface:'kunde',account,role:'kunde',system:customerSystem(account,{acting})+(category?`\nDer Kunde hat im Portal den Bereich „${category}“ gewählt.`:''),history:input.history,message:input.message,tools:customerTools(account,orgId),maxSteps:5,config});
  return Response.json({reply:result.reply,actions:result.actions,sources:result.sources,provider:result.provider,model:result.model,usage:usage(account)},{headers});
 }catch(e){if(reservation)getDb().prepare('UPDATE ai_usage SET count=MAX(0,count-1) WHERE organization_id=? AND period=?').run(reservation.id,reservation.month);return jsonError(e)}
}
