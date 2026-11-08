import {requireAccount,assertMutationOrigin} from '../../../../lib/business-auth';
import {createBillingManagement,billingErrorResponse,billingResponseHeaders} from '../../../../lib/business-billing';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request){try{await assertMutationOrigin(request);const account=await requireAccount(request);return Response.json(await createBillingManagement(request,account),{headers:billingResponseHeaders})}catch(error){return billingErrorResponse(error)}}
