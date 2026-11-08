import {randomBytes} from 'node:crypto';
import {rateLimit,requesterKey,jsonError} from '../../../../lib/business-auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
// 1 MB of random data for a rough download measurement in the help portal.
const payload=randomBytes(1024*1024);
export function GET(request){try{const key=requesterKey(request);rateLimit('speed:'+key,{limit:key==='direct'?400:20,windowMs:600000});return new Response(payload,{headers:{'Content-Type':'application/octet-stream','Cache-Control':'no-store','Content-Length':String(payload.length)}})}catch(e){return jsonError(e)}}
