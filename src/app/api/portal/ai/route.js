import {requireAccount,assertMutationOrigin,readJson,jsonError,rateLimit} from '../../../../lib/business-auth';
import {getDb} from '../../../../lib/business-db';
import {getPlan} from '../../../../lib/business-plans';
import {aiConfiguration,validateAiInput,requestAi} from '../../../../lib/portal-ai';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
function period(){return new Date().toISOString().slice(0,7)}
function usage(account){const limit=getPlan(account.organization.effectivePlan).limits.aiPerMonth;const used=getDb().prepare('SELECT count FROM ai_usage WHERE organization_id=? AND period=?').get(account.organization.id,period())?.count||0;return {limit,used,remaining:Math.max(0,limit-used),period:period()}}
export async function GET(request){try{const account=requireAccount(request),config=aiConfiguration();return Response.json({configured:!!config.key,provider:config.name,model:config.model,usage:usage(account)},{headers});}catch(e){return jsonError(e)}}
export async function POST(request){
 let reservation=null;
 try{
  assertMutationOrigin(request);const account=requireAccount(request);rateLimit('ai:'+account.organization.id,{limit:10,windowMs:60000});
  const input=validateAiInput(await readJson(request)),config=aiConfiguration();
  if(!config.key)throw Object.assign(Error('Der OpenAI-Zugang ist noch nicht eingerichtet. Die geführten Prüfschritte bleiben nutzbar.'),{status:503,code:'AI_NOT_CONFIGURED'});
  const db=getDb(),month=period(),limit=getPlan(account.organization.effectivePlan).limits.aiPerMonth;
  const reserved=db.prepare('INSERT INTO ai_usage(organization_id,period,count) VALUES(?,?,1) ON CONFLICT(organization_id,period) DO UPDATE SET count=count+1 WHERE count<? RETURNING count').get(account.organization.id,month,limit);
  if(!reserved)throw Object.assign(Error('Ihr monatliches KI-Kontingent ist aufgebraucht. Persönliche Anfragen und die Prüfschritte bleiben verfügbar.'),{status:429,code:'AI_LIMIT'});
  reservation={id:account.organization.id,month};
  const result=await requestAi(input,config);
  return Response.json({...result,usage:usage(account)},{headers});
 }catch(e){if(reservation)getDb().prepare('UPDATE ai_usage SET count=MAX(0,count-1) WHERE organization_id=? AND period=?').run(reservation.id,reservation.month);return jsonError(e)}
}
