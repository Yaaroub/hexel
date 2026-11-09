import {jsonError,rateLimit,requesterKey,assertMutationOrigin} from '../../../../lib/business-auth';
import {manageView,cancelByCustomer} from '../../../../lib/appointments-extra';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(request,{params}){try{rateLimit('termin:'+requesterKey(request),{limit:300,windowMs:600000});const {token}=await params;return Response.json(manageView(token),{headers})}catch(e){return jsonError(e)}}
export async function POST(request,{params}){try{assertMutationOrigin(request);const {token}=await params;return Response.json(cancelByCustomer(token),{headers})}catch(e){return jsonError(e)}}
