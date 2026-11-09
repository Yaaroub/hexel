import {calendarFeed} from '../../../../lib/appointments-extra';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(request,{params}){const {token}=await params;const body=calendarFeed(String(token).replace(/\.ics$/,''));return body?new Response(body,{headers:{'Content-Type':'text/calendar; charset=utf-8','Cache-Control':'private, max-age=300'}}):new Response('Nicht gefunden',{status:404})}
