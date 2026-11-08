import {requireAccount} from '../../../../lib/business-auth';
import {getBillingStatus,billingErrorResponse,billingResponseHeaders} from '../../../../lib/business-billing';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request){try{const account=await requireAccount(request);return Response.json(await getBillingStatus(account),{headers:billingResponseHeaders})}catch(error){return billingErrorResponse(error)}}
