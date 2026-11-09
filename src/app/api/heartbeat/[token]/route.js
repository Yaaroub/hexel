import {heartbeat} from '../../../../lib/monitors';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
// Lebenszeichen von Kunden-Routern (z. B. MikroTik-Scheduler alle 5 Minuten).
async function handle(request,{params}){const {token}=await params;return heartbeat(token)?new Response('ok',{headers}):new Response('unbekannt',{status:404,headers})}
export const GET=handle;export const POST=handle;
