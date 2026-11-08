import test from 'node:test';
import assert from 'node:assert/strict';
import {portalAccessError} from '../src/lib/portal-access.js';
function request(host='127.0.0.1:3000',origin='http://127.0.0.1:3000'){
 return new Request('http://localhost:3000/api/portal/tickets',{headers:{host,origin}});
}
test('uses public loopback host when Next internal URL differs',()=>{
 assert.equal(portalAccessError(request(),{mutation:true}),null);
 assert.equal(portalAccessError(request('localhost:3000','http://localhost:3000'),{mutation:true}),null);
});
test('rejects foreign origins, foreign hosts and other local ports',()=>{
 assert.equal(portalAccessError(request('127.0.0.1:3000','https://example.com'),{mutation:true}).status,403);
 assert.equal(portalAccessError(request('example.com','https://example.com'),{mutation:true}).status,403);
 assert.equal(portalAccessError(request('127.0.0.1:3000','http://127.0.0.1:4000'),{mutation:true}).status,403);
});
test('production demo is unavailable by default',()=>{
 assert.equal(portalAccessError(request(),{production:true}).status,503);
 assert.equal(portalAccessError(request(),{production:true,enabled:true,mutation:true}),null);
});
