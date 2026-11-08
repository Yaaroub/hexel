import {requireAccount,assertMutationOrigin} from '../../../../lib/business-auth';
import {createCheckout,readBillingBody,billingErrorResponse,billingResponseHeaders} from '../../../../lib/business-billing';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request){try{await assertMutationOrigin(request);const account=await requireAccount(request),body=await readBillingBody(request);return Response.json(await createCheckout(request,account,body.planId),{headers:billingResponseHeaders})}catch(error){return billingErrorResponse(error)}}
