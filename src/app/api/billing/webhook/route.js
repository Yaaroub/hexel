import {verifyStripeEvent,processBillingEvent,billingErrorResponse,billingResponseHeaders,BillingError} from '../../../../lib/business-billing';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request){
 try{
  if(Number(request.headers.get('content-length'))>262144)throw new BillingError('Webhook ist zu groß.',413);
  // Do not parse or normalize the body before authenticating Stripe's signature.
  const raw=await request.text();
  const event=verifyStripeEvent(raw,request.headers.get('stripe-signature'),process.env.STRIPE_WEBHOOK_SECRET);
  return Response.json(await processBillingEvent(event),{headers:billingResponseHeaders});
 }catch(error){return billingErrorResponse(error)}
}
