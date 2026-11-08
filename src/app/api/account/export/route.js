import {requireAccount,jsonError} from '../../../../lib/business-auth.js';
import {exportAccount} from '../../../../lib/account-data.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){try{const account=requireAccount(request);const data=exportAccount(account);return new Response(JSON.stringify(data,null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':`attachment; filename="funknaht-daten-${new Date().toISOString().slice(0,10)}.json"`,'Cache-Control':'no-store'}})}catch(error){return jsonError(error)}}
