import {assertMutationOrigin,readJson,jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,audit} from '../../../../lib/owner.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
import {listDevices,saveDevice,deleteDevice,DEVICE_KINDS,warrantySoon} from '../../../../lib/devices.js';
import {baseUrl} from '../../../../lib/appointments-extra.js';
export async function GET(request){try{requireOwner(request);const org=new URL(request.url).searchParams.get('org');return Response.json(org?{devices:listDevices(org),kinds:DEVICE_KINDS,qrBase:baseUrl()+'/h/'}:{warranty:warrantySoon(),kinds:DEVICE_KINDS},{headers})}catch(e){return jsonError(e)}}
export async function POST(request){try{assertMutationOrigin(request);const a=requireOwner(request);const d=await readJson(request);const id=saveDevice(String(d.organizationId||''),d);audit(a.user.id,'device.save',id);return Response.json({id,devices:listDevices(String(d.organizationId))},{headers})}catch(e){return jsonError(e)}}
export async function DELETE(request){try{assertMutationOrigin(request);const a=requireOwner(request);const d=await readJson(request);deleteDevice(String(d.organizationId||''),d.id);audit(a.user.id,'device.delete',d.id);return Response.json({devices:listDevices(String(d.organizationId))},{headers})}catch(e){return jsonError(e)}}
