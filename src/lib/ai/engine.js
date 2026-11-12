// FUNKNAHT AI: ein KI-Kern für zwei Oberflächen (Kunden-Assistent und Workspace-Assistent).
// Der Anbieter ist austauschbar (Groq, Mistral, OpenAI oder jeder OpenAI-kompatible Dienst, z. B. IONOS AI Model Hub).
// Werkzeuge laufen ausschließlich auf dem Server, mit den Rechten der angemeldeten Person.
// Schreibende Werkzeuge führen nichts aus, sondern legen einen Vorschlag an, den der Mensch bestätigt.
import {randomUUID} from 'node:crypto';
import {generateText,tool,isStepCount} from 'ai';
import {getDb} from '../business-db.js';

const PRESETS={
 groq:{name:'Groq',model:'openai/gpt-oss-120b',keyEnv:'GROQ_API_KEY',region:'USA',price:{'openai/gpt-oss-120b':[.15,.6],'openai/gpt-oss-20b':[.075,.3],'llama-3.3-70b-versatile':[.59,.79],'llama-3.1-8b-instant':[.05,.08]}},
 mistral:{name:'Mistral (EU)',model:'mistral-small-latest',keyEnv:'MISTRAL_API_KEY',region:'EU',price:{'mistral-small-latest':[.1,.3],'mistral-medium-latest':[.4,2]}},
 openai:{name:'OpenAI',model:'gpt-4.1-mini',keyEnv:'OPENAI_API_KEY',region:'USA',baseURL:'https://api.openai.com/v1',price:{'gpt-4.1-mini':[.4,1.6],'gpt-4.1-nano':[.1,.4]}},
 compatible:{name:'OpenAI-kompatibel',model:'',keyEnv:'AI_API_KEY',region:'laut Anbieter',price:{}},
 huggingface:{name:'Hugging Face',model:'meta-llama/Llama-3.1-8B-Instruct',keyEnv:'HF_API_KEY',region:'laut Anbieter',baseURL:'https://router.huggingface.co/v1',price:{}},
 mock:{name:'Testmodus (keine echte KI)',model:'funknaht-test',keyEnv:'',region:'lokal',price:{}},
};

export function aiConfig(env=process.env){
 let provider=(env.AI_PROVIDER||env.PORTAL_AI_PROVIDER||'').toLowerCase();
 if(env.FUNKNAHT_AI_MOCK==='1')provider='mock';
 if(!provider)provider=env.GROQ_API_KEY?'groq':env.MISTRAL_API_KEY?'mistral':env.OPENAI_API_KEY?'openai':'groq';
 const preset=PRESETS[provider]||PRESETS.compatible;
 const key=provider==='mock'?'test':(env.AI_API_KEY||env[preset.keyEnv]||'');
 const model=env.AI_MODEL||env.PORTAL_AI_MODEL||preset.model;
 const known=preset.price[model]||[0,0];
 const price=[Number(env.AI_PRICE_INPUT??known[0])||0,Number(env.AI_PRICE_OUTPUT??known[1])||0];
 return {provider,name:preset.name,model,key,baseURL:env.AI_BASE_URL||preset.baseURL||'',region:env.AI_REGION||preset.region,price,configured:!!key&&!!model&&(provider!=='compatible'||!!env.AI_BASE_URL),workspace:env.AI_WORKSPACE!=='off',customer:env.AI_CUSTOMER!=='off'};
}

let testModel=null;
export function setTestModel(model){testModel=model}

async function languageModel(config){
 if(testModel)return testModel;
 if(config.provider==='mock')return (await import('./mock.js')).mockModel();
 if(config.provider==='groq'){const {createGroq}=await import('@ai-sdk/groq');return createGroq({apiKey:config.key})(config.model)}
 if(config.provider==='mistral'){const {createMistral}=await import('@ai-sdk/mistral');return createMistral({apiKey:config.key})(config.model)}
 const {createOpenAICompatible}=await import('@ai-sdk/openai-compatible');
 return createOpenAICompatible({name:config.provider,baseURL:config.baseURL,apiKey:config.key,includeUsage:true})(config.model);
}

// Kontaktdaten gehen nicht an den KI-Anbieter: E-Mail-Adressen und Telefonnummern werden gekürzt.
export function maskEmail(v){const [u,d]=String(v).split('@');return d?(u[0]||'')+'•••@'+d:v}
export function scrub(value){
 if(typeof value==='string')return value.replace(/\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}(?: ?[A-Z0-9]{1,3})?\b/g,'[IBAN entfernt]').replace(/[^\s@<>()]+@[^\s@<>()]+\.[a-z]{2,}/gi,maskEmail).replace(/(?<![\w.-])(?:\+|0)[\d ()/-]{6,}\d/g,m=>{const d=m.replace(/\D/g,'');return d.length>=7&&!/^\d{4}-\d{2}-\d{2}/.test(m)?'•••'+d.slice(-3):m});
 if(Array.isArray(value))return value.map(scrub);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,/phone|telefon/i.test(k)&&v?'•••'+String(v).replace(/\D/g,'').slice(-3):scrub(v)]));
 return value;
}

const err=(message,status,code)=>Object.assign(new Error(message),{status,code});

// Ein Werkzeug, wie es die Oberflächen definieren:
// {description, input: zod-Schema, run(input,ctx)} für Lesen, oder zusätzlich action:{kind,summary(input)} für Vorschläge.
function wrapTools(defs,ctx){
 const out={};
 for(const [name,def] of Object.entries(defs)){
  out[name]=tool({description:def.description,inputSchema:def.input,execute:async input=>{
   ctx.used.push(name);
   try{
    if(def.action){
     const prepared=def.prepare?await def.prepare(input,ctx):input;
     const summary=def.action.summary(prepared,ctx);
     const id=randomUUID();
     getDb().prepare("INSERT INTO ai_actions(id,user_id,organization_id,surface,kind,input,summary,status,created_at) VALUES(?,?,?,?,?,?,?,'offen',?)").run(id,ctx.account.user.id,ctx.account.organization.id,ctx.surface,def.action.kind,JSON.stringify(prepared),summary,Date.now());
     ctx.actions.push({id,kind:def.action.kind,summary,label:def.action.label||'Ausführen'});
     if(def.action.escalation)ctx.escalated=true;
     return {status:'wartet_auf_bestaetigung',vorschlag:summary,hinweis:'Unter deiner Antwort erscheint ein Knopf zum Bestätigen. Es ist noch NICHTS passiert. Schreibe nicht, dass es erledigt ist.'};
    }
    const result=await def.run(input,ctx);
    if(def.sources)for(const s of result||[])ctx.sources.push({titel:s.titel,quelle:s.quelle});
    return scrub(result);
   }catch(e){return {fehler:e.status&&e.status<500?e.message:'Das Werkzeug ist gerade fehlgeschlagen.'}}
  }});
 }
 return out;
}

export function logAi(entry){
 try{getDb().prepare('INSERT INTO ai_log(id,surface,user_id,organization_id,role,provider,model,input_tokens,output_tokens,ms,steps,tools,status,error_code,escalated,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(randomUUID(),entry.surface,entry.userId||null,entry.orgId||null,entry.role||null,entry.provider||null,entry.model||null,entry.inputTokens||0,entry.outputTokens||0,entry.ms||0,entry.steps||0,JSON.stringify(entry.tools||[]),entry.status,entry.errorCode||null,entry.escalated?1:0,Date.now())}catch{}
}

export function validateConversation(data,{maxHistory=12}={}){
 if(!data||typeof data.message!=='string'||data.message.trim().length<2||data.message.length>3000)throw err('Bitte schreiben Sie eine Frage mit 2 bis 3.000 Zeichen.',400,'INVALID_REQUEST');
 const history=Array.isArray(data.history)?data.history.slice(-maxHistory):[];
 if(history.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>6000))throw err('Der Gesprächsverlauf ist ungültig.',400,'INVALID_REQUEST');
 return {message:data.message.trim(),history:history.map(({role,content})=>({role,content}))};
}

export async function runAgent({surface,account,role,system,history=[],message,tools,maxSteps=6,config=aiConfig(),extra={}}){
 if(!config.configured)throw err('FUNKNAHT AI ist noch nicht eingerichtet. Trage in der Server-Konfiguration einen Schlüssel ein (z. B. GROQ_API_KEY).',503,'AI_NOT_CONFIGURED');
 const ctx={account,role,surface,used:[],actions:[],sources:[],escalated:false,...extra};
 const started=Date.now(),base={surface,userId:account.user.id,orgId:account.organization.id,role,provider:config.provider,model:config.model};
 try{
  const result=await generateText({model:await languageModel(config),system,messages:[...history,{role:'user',content:message}],tools:wrapTools(tools,ctx),stopWhen:isStepCount(maxSteps),maxOutputTokens:1200,temperature:.2,maxRetries:1,abortSignal:AbortSignal.timeout(60000)});
  const usage={input:result.usage?.inputTokens||0,output:result.usage?.outputTokens||0};
  let text=(result.text||'').trim();
  if(!text&&ctx.actions.length)text='Ich habe einen Vorschlag vorbereitet. Bitte prüfen und bestätigen.';
  if(!text)text='Dazu habe ich gerade keine Antwort gefunden. Formulieren Sie die Frage bitte etwas anders.';
  logAi({...base,inputTokens:usage.input,outputTokens:usage.output,ms:Date.now()-started,steps:result.steps?.length||1,tools:ctx.used,status:'ok',escalated:ctx.escalated});
  const seen=new Set();
  return {reply:text.slice(0,12000),actions:ctx.actions,sources:ctx.sources.filter(s=>!seen.has(s.titel)&&seen.add(s.titel)).slice(0,5),tools:[...new Set(ctx.used)],usage,costUsd:cost(usage,config),provider:config.name,model:config.model};
 }catch(e){
  const status=e.statusCode||e.status||e.cause?.statusCode;
  let mapped;
  if(status===429)mapped=err('Der KI-Anbieter bremst gerade (Limit der kostenlosen Stufe erreicht). Bitte in einer Minute noch einmal versuchen.',429,'AI_RATE_LIMIT');
  else if(status===401||status===403)mapped=err('Der KI-Schlüssel wird vom Anbieter abgelehnt. Bitte in der Server-Konfiguration prüfen.',503,'AI_PROVIDER_ERROR');
  else if(status===404)mapped=err(`Das Modell „${config.model}“ gibt es bei ${config.name} nicht (mehr). Bitte AI_MODEL in .env.local anpassen oder die Zeile löschen, dann gilt der Standard.`,503,'AI_MODEL_NOT_FOUND');
  else if(status===402)mapped=err('Beim KI-Anbieter fehlt Guthaben.',503,'AI_CREDIT_REQUIRED');
  else if(e.name==='TimeoutError'||e.name==='AbortError')mapped=err('Die KI hat zu lange gebraucht. Bitte noch einmal versuchen.',504,'AI_TIMEOUT');
  else mapped=err('Der KI-Anbieter ist gerade nicht erreichbar. Bitte später noch einmal versuchen.',502,'AI_UNAVAILABLE');
  logAi({...base,ms:Date.now()-started,tools:ctx.used,status:'fehler',errorCode:mapped.code,escalated:ctx.escalated});
  if(process.env.NODE_ENV!=='test')console.error('[FUNKNAHT AI]',status||'',e.message);
  throw mapped;
 }
}

export function cost({input,output},config=aiConfig()){return (input*config.price[0]+output*config.price[1])/1e6}

// Ausführen oder verwerfen eines Vorschlags. Die Ausführung prüft die Rechte erneut.
export function pendingAction(id,userId){
 const row=getDb().prepare('SELECT * FROM ai_actions WHERE id=? AND user_id=?').get(String(id||''),userId);
 if(!row)throw err('Vorschlag nicht gefunden.',404,'NOT_FOUND');
 if(row.status!=='offen')throw err('Dieser Vorschlag wurde bereits bearbeitet.',409,'ALREADY_DONE');
 if(row.created_at<Date.now()-24*3600000)throw err('Dieser Vorschlag ist älter als 24 Stunden. Bitte neu anfragen.',410,'EXPIRED');
 return {...row,input:JSON.parse(row.input)};
}
export function finishAction(id,status,result=null){getDb().prepare('UPDATE ai_actions SET status=?,result=?,decided_at=? WHERE id=?').run(status,result==null?null:JSON.stringify(result),Date.now(),id)}

export function purgeAi(now=Date.now()){
 const db=getDb();
 return {log:db.prepare('DELETE FROM ai_log WHERE created_at<?').run(now-400*86400000).changes,actions:db.prepare('DELETE FROM ai_actions WHERE created_at<?').run(now-90*86400000).changes};
}
