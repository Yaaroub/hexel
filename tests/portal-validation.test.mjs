import test from 'node:test';
import assert from 'node:assert/strict';
import {validateTicket} from '../src/lib/portal-validation.js';
const valid={kind:'problem',category:'internet-wlan',description:'Das WLAN fällt im Arbeitszimmer aus.',name:'Test Person',email:'test@example.invalid',device:'Router',attempts:[{stepId:'compare',result:'not-resolved'}]};
test('keeps the handoff and trims input without accepting arbitrary properties',()=>{
 const {value}=validateTicket({...valid,name:'  Test Person  ',status:'geloest',admin:true});
 assert.equal(value.name,'Test Person');assert.equal(value.status,undefined);assert.equal(value.admin,undefined);assert.deepEqual(value.attempts,valid.attempts);
});
test('rejects malformed contact data and unknown categories',()=>{
 for(const change of [{email:'bad'},{name:'A'},{name:'Test\nPerson'},{category:'enterprise'},{kind:'admin'},{description:'kurz'}])assert.ok(validateTicket({...valid,...change}).error);
});
test('bounds payload fields and diagnostic history',()=>{
 assert.ok(validateTicket({...valid,description:'a'.repeat(4001)}).error);
 assert.ok(validateTicket({...valid,attempts:Array(21).fill(valid.attempts[0])}).error);
 assert.ok(validateTicket({...valid,attempts:[{stepId:'a',result:'anything'}]}).error);
 assert.ok(validateTicket(null).error);
});
