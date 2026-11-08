import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

process.env.NODE_ENV='test';
const file=path.join(process.cwd(),'.local','owner-test-'+randomUUID()+'.sqlite');
process.env.BUSINESS_DB_PATH=file;
process.env.OWNER_EMAILS='chef@example.test';
const db=await import('../src/lib/business-db.js');
const auth=await import('../src/lib/business-auth.js');
const owner=await import('../src/lib/owner.js');
const data=await import('../src/lib/account-data.js');
test.after(()=>{db.closeDb();for(const s of ['','-wal','-shm'])if(fs.existsSync(file+s))fs.unlinkSync(file+s)});

const req=token=>new Request('http://127.0.0.1:3000/inhaber',{headers:{cookie:'funknaht_business_session='+token,host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'}});
async function account(email,type='private'){const {userId}=await auth.registerAccount({name:'Test',email,password:'passwort-mit-laenge',accountType:type,businessName:'Betrieb '+email});return {userId,token:auth.createSession(userId)}}

test('only configured owner emails can enter, and only after password confirmation',async()=>{
 const boss=await account('chef@example.test'),other=await account('kunde@example.test');
 assert.throws(()=>owner.requireOwner(req(other.token)),/Inhaber vorbehalten/);
 assert.throws(()=>owner.requireOwner(req(boss.token)),/bestätigen Sie Ihr Passwort/);
 await assert.rejects(owner.elevate(req(boss.token),'falsch'),/Passwort stimmt nicht/);
 await owner.elevate(req(boss.token),'passwort-mit-laenge');
 assert.equal(owner.requireOwner(req(boss.token)).user.id,boss.userId);
 owner.lock(req(boss.token));
 assert.throws(()=>owner.requireOwner(req(boss.token)),/bestätigen/);
});

test('account list exposes counts but no customer content, private accounts are pseudonymous',async()=>{
 const biz=await account('betrieb@example.test','business');
 const orgId=auth.getAccount(req(biz.token)).organization.id;
 db.getDb().prepare("INSERT INTO clients(id,organization_id,name,email,created_at,updated_at) VALUES(?,?,?,?,?,?)").run(randomUUID(),orgId,'Geheime Kundin','geheim@example.test',Date.now(),Date.now());
 const list=owner.listAccounts(),json=JSON.stringify(list);
 assert.ok(!json.includes('Geheime Kundin')&&!json.includes('geheim@example.test'));
 assert.equal(list.find(a=>a.id===orgId).usage.clients,1);
 assert.ok(list.filter(a=>a.accountType==='private').every(a=>a.name.startsWith('Privatkonto')&&a.email.includes('•••')));
});

test('ticket list hides contact data, opening is audited, retention anonymises old resolved tickets',async()=>{
 const c=await account('fragt@example.test'),acc=auth.getAccount(req(c.token));
 const old=new Date(Date.now()-200*86400000).toISOString();
 db.getDb().prepare('INSERT INTO support_tickets(id,organization_id,user_id,payload,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run('FN-AAAA0001',acc.organization.id,acc.user.id,JSON.stringify({kind:'problem',category:'drucker',description:'Drucker druckt nicht',name:'Frau Muster',email:'muster@example.test',location:'Plön',device:'',attempts:[]}),'geloest',old,old);
 assert.ok(!JSON.stringify(owner.listTickets()).includes('muster@example.test'));
 const boss=db.getDb().prepare("SELECT id FROM users WHERE email='chef@example.test'").get().id;
 assert.equal(owner.openTicket(boss,'FN-AAAA0001').email,'muster@example.test');
 assert.ok(owner.auditLog().some(e=>e.action==='ticket.view'&&e.target==='FN-AAAA0001'));
 assert.equal(owner.applyRetention().anonymizedTickets,1);
 const after=owner.openTicket(boss,'FN-AAAA0001');
 assert.equal(after.email,'');assert.equal(after.anonymized,true);
});

test('export contains own data only and deletion removes everything',async()=>{
 const a=await account('weg@example.test','business'),acc=auth.getAccount(req(a.token));
 db.getDb().prepare("INSERT INTO clients(id,organization_id,name,created_at,updated_at) VALUES(?,?,?,?,?)").run(randomUUID(),acc.organization.id,'Eigener Kunde',Date.now(),Date.now());
 const exp=data.exportAccount(acc);
 assert.equal(exp.clients.length,1);assert.ok(!JSON.stringify(exp).includes('Geheime Kundin'));assert.ok(!JSON.stringify(exp).includes('password_hash'));
 await assert.rejects(data.deleteAccount(acc,{password:'passwort-mit-laenge',confirmation:'ja'}),/LÖSCHEN/);
 await data.deleteAccount(acc,{password:'passwort-mit-laenge',confirmation:'LÖSCHEN'});
 assert.equal(db.getDb().prepare('SELECT COUNT(*) AS n FROM organizations WHERE id=?').get(acc.organization.id).n,0);
 assert.equal(db.getDb().prepare('SELECT COUNT(*) AS n FROM clients WHERE organization_id=?').get(acc.organization.id).n,0);
 assert.equal(auth.getAccount(req(a.token)),null);
});

test('create actions ignore client-supplied ids',async()=>{
 const b=await account('ids@example.test','business'),acc=auth.getAccount(req(b.token));
 db.getDb().prepare("UPDATE organizations SET plan='betrieb',billing_status='active' WHERE id=?").run(acc.organization.id);
 const r=db.mutateBusiness(acc.organization.id,{action:'client.create',id:'fremde-id',name:'Neu'});
 assert.notEqual(r.id,'fremde-id');
});
