import {requireAccount,assertMutationOrigin,readJson,jsonError} from '../../../../../../lib/business-auth';
import {rateTicket} from '../../../../../../lib/tickets';
import {customerOrg} from '../../../../../../lib/family';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request,{params}){try{assertMutationOrigin(request);const account=requireAccount(request);const {id}=await params;const d=await readJson(request);return Response.json(rateTicket(customerOrg(account,d.for),id,{helpful:d.helpful,comment:d.comment||'',publish:d.publish===true}),{headers:{'Cache-Control':'no-store'}})}catch(e){return jsonError(e)}}
