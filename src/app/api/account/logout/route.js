import {assertMutationOrigin,destroySession,sessionCookie,jsonError} from '../../../../lib/business-auth.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request){try{assertMutationOrigin(request);destroySession(request);return Response.json({ok:true},{headers:{'Set-Cookie':sessionCookie('',{clear:true}),'Cache-Control':'no-store'}})}catch(error){return jsonError(error)}}
