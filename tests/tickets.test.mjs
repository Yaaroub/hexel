import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

process.env.NODE_ENV='test';
const file=path.join(process.cwd(),'.local','tickets-test-'+randomUUID()+'.sqlite');
process.env.BUSINESS_DB_PATH=file;
process.env.UPLOAD_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fn-up-'));
const db=await import('../src/lib/business-db.js');
const auth=await import('../src/lib/business-auth.js');
const t=await import('../src/lib/tickets.js');
const owner=await import('../src/lib/owner.js');
test.after(()=>{db.closeDb();for(const s of ['','-wal','-shm'])if(fs.existsSync(file+s))fs.unlinkSync(file+s);fs.rmSync(process.env.UPLOAD_DIR,{recursive:true,force:true})});
const req=token=>new Request('http://127.0.0.1:3000/',{headers:{cookie:'funknaht_business_session='+token}});
async function acc(email){const {userId}=await auth.registerAccount({name:'Test',email,password:'passwort-mit-laenge',accountType:'private'});return auth.getAccount(req(auth.createSession(userId)))}
const value={kind:'problem',category:'internet-wlan',description:'WLAN fällt ständig aus',device:'',name:'Kundin',email:'k@example.test',location:'Plön',attempts:[]};
const png=()=>new File([Buffer.concat([Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]),Buffer.alloc(40)])],'foto.png',{type:'image/png'});

test('conversation flow: awaiting, reopen on customer message, internal notes hidden',async()=>{
 const a=await acc('chat@example.test');
 const tk=t.createTicket(a,value,{priority:'dringend',diagnostics:{serverLatencyMs:42,downloadMbps:55.55,browser:'Chrome 130',evil:'<script>'}});
 const view=t.customerThread(a.organization.id,tk.id);
 assert.equal(view.ticket.priority,'dringend');assert.equal(view.ticket.diagnostics.serverLatencyMs,42);assert.equal(view.ticket.diagnostics.evil,undefined);
 t.addOwnerMessage('owner',tk.id,{body:'Bitte Foto schicken'});
 t.addOwnerMessage('owner',tk.id,{body:'Router vermutlich defekt',internal:true});
 let c=t.customerThread(a.organization.id,tk.id);
 assert.equal(c.messages.length,1);assert.equal(c.ticket.awaiting,'customer');assert.equal(c.ticket.status,'in-pruefung');
 assert.equal(t.thread(tk.id,{includeInternal:true}).messages.length,2);
 t.setCustomerStatus(a,tk.id,'geloest');
 c=t.addCustomerMessage(a,tk.id,'Problem ist wieder da');
 assert.equal(c.ticket.status,'offen');assert.equal(c.ticket.awaiting,'owner');
});

test('other accounts cannot read or write a ticket',async()=>{
 const a=await acc('a1@example.test'),b=await acc('b1@example.test');
 const tk=t.createTicket(a,value);
 assert.throws(()=>t.customerThread(b.organization.id,tk.id),/nicht gefunden/);
 assert.throws(()=>t.addCustomerMessage(b,tk.id,'hallo'),/nicht gefunden/);
});

test('attachments: only real images and PDFs, size limit, removed with retention',async()=>{
 const a=await acc('file@example.test'),tk=t.createTicket(a,value);
 const att=await t.saveAttachment(tk.id,{file:png(),author:'customer'});
 assert.equal(att.mime,'image/png');assert.equal(att.filename,'foto.png');
 await assert.rejects(t.saveAttachment(tk.id,{file:new File(['<html><script>alert(1)</script></html>'],'x.png'),author:'customer'}),/Erlaubt sind/);
 await assert.rejects(t.saveAttachment(tk.id,{file:new File([Buffer.alloc(5*1024*1024+1)],'big.pdf'),author:'customer'}),/5 MB/);
 const internal=await t.saveAttachment(tk.id,{file:png(),author:'owner',internal:true});
 assert.equal(t.customerThread(a.organization.id,tk.id).attachments.length,1);
 assert.ok(fs.existsSync(path.join(process.env.UPLOAD_DIR,tk.id,internal.id)));
 const old=new Date(Date.now()-200*86400000).toISOString();
 db.getDb().prepare("UPDATE support_tickets SET status='geloest',updated_at=? WHERE id=?").run(old,tk.id);
 owner.applyRetention();
 assert.ok(!fs.existsSync(path.join(process.env.UPLOAD_DIR,tk.id)));
 assert.equal(t.thread(tk.id,{includeInternal:true}).messages.length,0);
});

test('time tracking and CSV export guards against formula injection',async()=>{
 const a=await acc('time@example.test'),tk=t.createTicket(a,value);
 t.addTime(tk.id,{minutes:45,note:'=HYPERLINK("x")',date:'2026-11-03'});
 t.addTime(tk.id,{minutes:15,billable:false,date:'2026-11-04'});
 assert.throws(()=>t.addTime(tk.id,{minutes:0}),/Minuten/);
 const rows=t.timeReport('2026-11').filter(r=>r.ticket===tk.id);
 assert.equal(rows.reduce((s,r)=>s+r.minutes,0),60);
 const csv=t.toCsv(rows);assert.ok(csv.includes("'=HYPERLINK"));assert.ok(csv.includes('0,75'));
});
