import {getAccount,jsonError} from '../../../../lib/business-auth.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){try{return Response.json({account:getAccount(request)},{headers:{'Cache-Control':'no-store'}})}catch(error){return jsonError(error)}}
