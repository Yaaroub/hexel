import {requireAccount,assertMutationOrigin,readJson,jsonError,rateLimit,sessionCookie} from '../../../../lib/business-auth.js';
import {deleteAccount} from '../../../../lib/account-data.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request){try{assertMutationOrigin(request);const account=requireAccount(request);rateLimit('delete:'+account.user.id,{limit:5});const data=await readJson(request);await deleteAccount(account,data);return Response.json({deleted:true},{headers:{'Set-Cookie':sessionCookie('',{clear:true}),'Cache-Control':'no-store'}})}catch(error){return jsonError(error)}}
