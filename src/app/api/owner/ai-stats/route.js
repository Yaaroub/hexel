import {jsonError} from '../../../../lib/business-auth.js';
import {requireOwner} from '../../../../lib/owner.js';
import {aiStats} from '../../../../lib/ai/stats.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){try{requireOwner(request);const d=Number(new URL(request.url).searchParams.get('days'))||30;return Response.json(aiStats({days:Math.min(Math.max(d,7),90)}),{headers:{'Cache-Control':'no-store'}})}catch(e){return jsonError(e)}}
