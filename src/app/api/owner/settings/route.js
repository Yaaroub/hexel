import {assertMutationOrigin,readJson,jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,audit} from '../../../../lib/owner.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
import {getOwnerSettings,saveOwnerSettings} from '../../../../lib/settings.js';
import {company} from '../../../../lib/company.js';
export async function GET(request){try{requireOwner(request);return Response.json({settings:getOwnerSettings(),company},{headers})}catch(e){return jsonError(e)}}
export async function POST(request){try{assertMutationOrigin(request);const a=requireOwner(request);const d=await readJson(request);const s=saveOwnerSettings(d);audit(a.user.id,'settings.save');return Response.json({settings:s,company},{headers})}catch(e){return jsonError(e)}}
