// FUNKNAHT AI: Kern, Wissensbasis, Rechte, Vorschläge mit Freigabe, Team und Aufgaben.
// Läuft ohne Netz: Ein Testmodell ruft Werkzeuge auf wie ein echtes Modell.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {MockLanguageModelV4} from 'ai/test';

process.env.NODE_ENV='test';
const file=path.join(process.cwd(),'.local','ai-test-'+randomUUID()+'.sqlite');
process.env.BUSINESS_DB_PATH=file;process.env.OWNER_EMAILS='chef@example.test';process.env.GROQ_API_KEY='test-key';
delete process.env.EMAIL_USER;delete process.env.AI_PROVIDER;delete process.env.FUNKNAHT_AI_MOCK;
const {getDb,closeDb}=await import('../src/lib/business-db.js');
const auth=await import('../src/lib/business-auth.js');
const engine=await import('../src/lib/ai/engine.js');
const ws=await import('../src/lib/ai/workspace.js');
const cust=await import('../src/lib/ai/customer.js');
const {searchKnowledge}=await import('../src/lib/ai/knowledge.js');
const staff=await import('../src/lib/staff.js');
const {createTicket,addTime,addOwnerMessage}=await import('../src/lib/tickets.js');
test.after(()=>{closeDb();for(const s of ['','-wal','-shm'])if(fs.existsSync(file+s))fs.unlinkSync(file+s)});
const password='A genuine test passphrase 2026';
const req=t=>new Request('http://127.0.0.1:3000/',{headers:{cookie:auth.sessionCookie(t)}});
async function signup(email,type='business',name='Test'){const r=await auth.registerAccount({name,email,password,businessName:name+' GmbH',accountType:type});return {...r,token:auth.createSession(r.userId)}}
const usage={inputTokens:{total:100,noCache:100},outputTokens:{total:20,text:20}};
// Testmodell: erst die angegebenen Werkzeugaufrufe, danach eine Antwort mit dem letzten Werkzeugergebnis.
function scripted(calls){let n=0;const seen=[];return {seen,model:new MockLanguageModelV4({doGenerate:async({prompt,tools})=>{seen.push(tools.map(t=>t.name));const c=calls[n++];
 if(c)return {content:[{type:'tool-call',toolCallId:'c'+n,toolName:c[0],input:JSON.stringify(c[1])}],finishReason:{unified:'tool-calls',raw:undefined},usage,warnings:[]};
 const last=prompt.at(-1);return {content:[{type:'text',text:'Antwort: '+JSON.stringify(last.content?.[0]?.output?.value??null)}],finishReason:{unified:'stop',raw:undefined},usage,warnings:[]}}})}}

test('config picks Groq by default and knows its price; mock and EU options exist',()=>{
 const c=engine.aiConfig({GROQ_API_KEY:'x'});
 assert.equal(c.provider,'groq');assert.equal(c.model,'openai/gpt-oss-120b');assert.equal(c.configured,true);assert.deepEqual(c.price,[.15,.6]);
 assert.equal(engine.aiConfig({}).configured,false);
 assert.equal(engine.aiConfig({AI_PROVIDER:'mistral',MISTRAL_API_KEY:'m'}).region,'EU');
 assert.equal(engine.aiConfig({AI_PROVIDER:'compatible',AI_API_KEY:'k',AI_MODEL:'m'}).configured,false,'compatible needs a base URL');
 assert.equal(engine.aiConfig({FUNKNAHT_AI_MOCK:'1'}).provider,'mock');
 assert.ok(Math.abs(engine.cost({input:1e6,output:1e6},c)-.75)<1e-9);
});

test('contact data is shortened before it reaches the provider',()=>{
 const s=engine.scrub({t:'max@firma.de ruft an: 0431 123456, Termin 2026-11-12 09:00, FN-ABCD1234',phone:'+49 171 2345678'});
 assert.match(s.t,/m•••@firma\.de/);assert.match(s.t,/•••456/);assert.match(s.t,/2026-11-12 09:00/);assert.match(s.t,/FN-ABCD1234/);assert.equal(s.phone,'•••678');
});

test('knowledge search finds the right steps and hides internal guides from customers',()=>{
 const hits=searchKnowledge('Drucker druckt nicht mehr im WLAN',{audience:'kunde'});
 assert.ok(hits.length>0);assert.ok(hits.some(h=>/drucker/i.test(h.titel+h.quelle+h.text)));
 assert.ok(searchKnowledge('MikroTik Backup Export',{audience:'kunde'}).every(h=>!h.quelle.startsWith('Leitfaden')));
 assert.ok(searchKnowledge('MikroTik Backup Export',{audience:'team'}).some(h=>h.quelle.startsWith('Leitfaden')));
 assert.ok(searchKnowledge('Was kostet eine Stunde für Betriebe',{audience:'kunde'}).some(h=>h.id==='preise-betrieb'));
});

let owner,admin,worker,customer,ticketId;
test('staff invites, roles and the internal team org',async()=>{
 owner=await signup('chef@example.test','business','Yaaroub');
 assert.equal(auth.getAccount(req(owner.token)).staff.role,'admin');
 const inv=staff.inviteStaff({email:'ahmed@funknaht.test',name:'Ahmed',role:'mitarbeiter'},'https://x.test');
 const token=inv.link.split('/').pop();
 const uid=await staff.joinStaff(token,{name:'Ahmed',password});
 worker={userId:uid,token:auth.createSession(uid)};
 const acc=auth.getAccount(req(worker.token));
 assert.equal(acc.staff.role,'mitarbeiter');assert.equal(acc.isOwner,false);
 await assert.rejects(()=>staff.joinStaff(token,{name:'X',password}),/abgelaufen|verwendet|ungültig/);
 const inv2=staff.inviteStaff({email:'lea@funknaht.test',name:'Lea',role:'admin'},'https://x.test');
 const uid2=await staff.joinStaff(inv2.link.split('/').pop(),{name:'Lea',password});admin={userId:uid2,token:auth.createSession(uid2)};
 assert.equal(auth.getAccount(req(admin.token)).staff.role,'admin');
 // interne Organisation erscheint nicht als Kunde
 assert.ok(!ws.customersQuery({}).kunden.some(k=>/FUNKNAHT-Team/.test(k.name)));
 // Deaktivieren meldet ab und nimmt die Rolle
 const id=staff.teamPeople({includeInactive:true}).find(p=>p.name==='Lea').id;
 staff.updateStaff(id,{active:false});assert.equal(auth.getAccount(req(admin.token)),null);
 staff.updateStaff(id,{active:true});admin.token=auth.createSession(uid2);
});

test('workspace tools follow the role: no money for Mitarbeiter',()=>{
 const w=ws.workspaceTools(auth.getAccount(req(worker.token))),a=ws.workspaceTools(auth.getAccount(req(owner.token)));
 for(const t of ['belege_liste','monatsbericht','abrechenbare_leistungen','rechnungsentwurf_vorschlagen'])assert.ok(!(t in w),t+' must be admin only');
 for(const t of ['kunden_suchen','anfrage_lesen','aufgabe_vorschlagen','antwort_vorschlagen','freie_termine'])assert.ok(t in w);
 assert.ok('monatsbericht' in a&&'rechnungsentwurf_vorschlagen' in a);
});

test('customers without contact, ticket summary and own work',async()=>{
 customer=await signup('praxis@example.test','business','Praxis Nord');
 const quiet=await signup('ruhig@example.test','business','Ruhig');
 const acc=auth.getAccount(req(customer.token));
 ticketId=createTicket(acc,{kind:'problem',category:'drucker',description:'Der Drucker im Empfang druckt seit gestern nicht mehr.',device:'Brother',name:'Dr. Nord',email:'nord@praxis.test',location:'Plön',attempts:[]}).id;
 addOwnerMessage(worker.userId,ticketId,{body:'Wir schauen uns das an.'});
 addTime(ticketId,{minutes:45,note:'Treiber neu',userId:worker.userId});
 getDb().prepare('UPDATE organizations SET created_at=? WHERE id=?').run(Date.now()-90*86400000,quiet.organizationId);
 const r=ws.customersQuery({ohneKontaktSeitTagen:30});
 assert.ok(r.kunden.some(k=>k.name==='Ruhig GmbH'));assert.ok(!r.kunden.some(k=>k.name==='Praxis Nord GmbH'),'contacted today');
 const d=ws.ticketDetails(ticketId.slice(3));assert.equal(d.anfrageId,ticketId);assert.equal(d.zeiten[0].minuten,45);
 const mine=ws.teamActivity({},{userId:worker.userId,admin:false});
 assert.equal(mine.personen.length,1);assert.equal(mine.personen[0].minutenGesamt,45);assert.equal(mine.personen[0].antwortenAnKunden,1);
 assert.throws(()=>ws.teamActivity({mitarbeiter:'Yaaroub'},{userId:worker.userId,admin:false}),/eigene Arbeit/);
 const all=ws.teamActivity({mitarbeiter:'Ahmed'},{userId:owner.userId,admin:true});assert.equal(all.personen[0].name,'Ahmed');
 const rep=ws.monthlyReport({});assert.equal(rep.anfragen.neu,1);assert.ok(rep.team.find(p=>p.name==='Ahmed').minuten===45);
 assert.equal(ws.billableWork({}).offen[0].minuten,45);
});

test('the agent runs real tools, logs metadata only, and proposals wait for approval',async()=>{
 const acc=auth.getAccount(req(worker.token));
 const s=scripted([['kunden_suchen',{ohneKontaktSeitTagen:30}],['aufgabe_vorschlagen',{titel:'Ruhig GmbH anrufen',mitarbeiter:'Ahmed',faellig:'2030-01-15',kunde:'Ruhig'}]]);
 engine.setTestModel(s.model);
 const r=await engine.runAgent({surface:'workspace',account:acc,role:'mitarbeiter',system:ws.workspaceSystem(acc),message:'Wen sollten wir anrufen?',tools:ws.workspaceTools(acc)});
 assert.deepEqual(r.tools,['kunden_suchen','aufgabe_vorschlagen']);
 assert.equal(r.actions.length,1);assert.match(r.actions[0].summary,/Ruhig GmbH anrufen.*Ahmed/);
 assert.match(r.reply,/wartet_auf_bestaetigung/);
 assert.ok(!s.seen[0].includes('monatsbericht'));
 assert.equal(getDb().prepare("SELECT COUNT(*) n FROM tasks").get().n,0,'nothing created before approval');
 const log=getDb().prepare("SELECT * FROM ai_log WHERE surface='workspace'").get();
 assert.equal(log.status,'ok');assert.equal(log.input_tokens,300);assert.ok(!('message' in log));
 // Ein anderer Nutzer kann den Vorschlag nicht ausführen
 assert.throws(()=>engine.pendingAction(r.actions[0].id,owner.userId),/nicht gefunden/);
 const row=engine.pendingAction(r.actions[0].id,worker.userId);
 const res=ws.executeWorkspaceAction(row,acc);engine.finishAction(row.id,'ausgefuehrt',res);
 assert.match(res.text,/angelegt für Ahmed/);
 assert.throws(()=>engine.pendingAction(row.id,worker.userId),/bereits bearbeitet/);
 const tasks=staff.listTasks({assigneeUserId:worker.userId});assert.equal(tasks[0].source,'ki');assert.equal(tasks[0].customer,'Ruhig GmbH');
 // Rechnungsentwurf nur mit Admin-Recht, auch wenn jemand den Vorschlag anders einschleust
 assert.throws(()=>ws.executeWorkspaceAction({kind:'rechnung',input:{ticketId}},acc),/Rechte/);
 engine.setTestModel(null);
});

test('provider errors are mapped and logged; tool errors stay inside the conversation',async()=>{
 const acc=auth.getAccount(req(owner.token));
 engine.setTestModel(new MockLanguageModelV4({doGenerate:async()=>{throw Object.assign(new Error('rate'),{statusCode:429})}}));
 await assert.rejects(()=>engine.runAgent({surface:'workspace',account:acc,role:'admin',system:'s',message:'Hallo',tools:{}}),e=>e.code==='AI_RATE_LIMIT');
 assert.equal(getDb().prepare("SELECT error_code FROM ai_log WHERE status='fehler'").get().error_code,'AI_RATE_LIMIT');
 const s=scripted([['kunde_details',{kunde:'gibt es nicht'}]]);engine.setTestModel(s.model);
 const r=await engine.runAgent({surface:'workspace',account:acc,role:'admin',system:'s',message:'x',tools:ws.workspaceTools(acc)});
 assert.match(r.reply,/Kunde nicht gefunden/);
 engine.setTestModel(null);
 await assert.rejects(()=>engine.runAgent({surface:'kunde',account:acc,role:'kunde',system:'s',message:'x',tools:{},config:engine.aiConfig({})}),e=>e.code==='AI_NOT_CONFIGURED');
});

test('customer assistant: own tickets only, handover creates a ticket after consent',async()=>{
 const other=await signup('fremd@example.test','private','Fremd');
 const oacc=auth.getAccount(req(other.token));
 const tools=cust.customerTools(oacc,oacc.organization.id);
 assert.deepEqual(Object.keys(tools).sort(),['an_mensch_uebergeben','anfrage_vorschlagen','freie_termine','meine_anfragen','wissen_suchen']);
 assert.equal(tools.meine_anfragen.run({}).length,0,'never sees other customers');
 const s=scripted([['an_mensch_uebergeben',{zusammenfassung:'Ich habe auf einen Link geklickt und meine Bankdaten eingegeben.',bereich:'betrug'}]]);engine.setTestModel(s.model);
 const r=await engine.runAgent({surface:'kunde',account:oacc,role:'kunde',system:cust.customerSystem(oacc),message:'Hilfe',tools:tools});
 assert.equal(r.actions.length,1);
 assert.equal(getDb().prepare("SELECT COUNT(*) n FROM support_tickets WHERE organization_id=?").get(oacc.organization.id).n,0);
 const row=engine.pendingAction(r.actions[0].id,oacc.user.id);
 const res=cust.executeCustomerAction(row,oacc);
 const t=getDb().prepare('SELECT * FROM support_tickets WHERE id=?').get(res.ticketId);
 assert.equal(t.organization_id,oacc.organization.id);assert.equal(t.priority,'hoch');assert.equal(t.source,'ki');
 assert.equal(getDb().prepare("SELECT escalated FROM ai_log WHERE surface='kunde' ORDER BY created_at DESC").get().escalated,1);
 engine.setTestModel(null);
});

test('tasks: create, assign, complete, list',()=>{
 const t=staff.createTask({title:'Router-Backup prüfen',assigneeUserId:owner.userId,dueOn:'2020-01-01'},worker.userId);
 assert.equal(t.overdue,true);assert.equal(t.assignee,'Yaaroub');
 assert.throws(()=>staff.createTask({title:'x y z',assigneeUserId:customer.userId},owner.userId),/nicht zum Team/);
 staff.setTaskStatus(t.id,'erledigt',owner.userId);
 assert.equal(staff.listTasks({status:'erledigt'}).find(x=>x.id===t.id).doneBy,'Yaaroub');
});
