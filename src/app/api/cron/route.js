import {timingSafeEqual} from 'node:crypto';
import {runScheduledTasks} from '../../../lib/cron';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
// Aufruf durch den Server-Zeitplan: curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/api/cron
function authorized(request){const secret=process.env.CRON_SECRET||'';const given=(request.headers.get('authorization')||'').replace(/^Bearer /,'');if(secret.length<24||given.length!==secret.length)return false;return timingSafeEqual(Buffer.from(given),Buffer.from(secret))}
export async function POST(request){if(!authorized(request))return Response.json({error:'Nicht berechtigt.'},{status:401,headers});try{return Response.json(await runScheduledTasks(),{headers})}catch(e){console.error('cron',e);return Response.json({error:'Fehler im Zeitplan.'},{status:500,headers})}}
