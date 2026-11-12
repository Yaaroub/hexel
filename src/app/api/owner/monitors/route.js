import {assertMutationOrigin,readJson,jsonError} from '../../../../lib/business-auth.js';
import {requireStaff,audit} from '../../../../lib/owner.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
import {listMonitors,saveMonitor,deleteMonitor,heartbeatScript,runMonitors} from '../../../../lib/monitors.js';
import {baseUrl} from '../../../../lib/appointments-extra.js';
const withScripts=list=>list.map(m=>m.kind==='heartbeat'?{...m,scripts:heartbeatScript(m.token,baseUrl())}:m);
export async function GET(request){try{requireStaff(request);const org=new URL(request.url).searchParams.get('org');return Response.json({monitors:withScripts(listMonitors(org||undefined)),cronConfigured:(process.env.CRON_SECRET||'').length>=24},{headers})}catch(e){return jsonError(e)}}
export async function POST(request){try{assertMutationOrigin(request);const a=requireStaff(request);const d=await readJson(request);if(d.action==='check'){await runMonitors();return Response.json({monitors:withScripts(listMonitors())},{headers})}const id=saveMonitor(String(d.organizationId||''),d);audit(a.user.id,'monitor.save',id);return Response.json({id,monitors:withScripts(listMonitors(String(d.organizationId)))},{headers})}catch(e){return jsonError(e)}}
export async function DELETE(request){try{assertMutationOrigin(request);const a=requireStaff(request);const d=await readJson(request);deleteMonitor(d.id);audit(a.user.id,'monitor.delete',d.id);return Response.json({ok:true},{headers})}catch(e){return jsonError(e)}}
