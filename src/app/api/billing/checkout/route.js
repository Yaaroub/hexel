import {requireAccount,assertMutationOrigin} from '../../../../lib/business-auth';
import {requireRole} from '../../../../lib/team';
import {createCheckout,readBillingBody,billingErrorResponse,billingResponseHeaders,BillingError} from '../../../../lib/business-billing';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request){try{await assertMutationOrigin(request);const account=await requireAccount(request,{allowBlocked:true});requireRole(account,'inhaber');const body=await readBillingBody(request);
 // Ohne Zustimmung zu AGB und AVV kein kostenpflichtiger Tarif.
 if(body.acceptTerms!==true)throw new BillingError('Bitte bestätigen Sie die AGB und den Vertrag zur Auftragsverarbeitung.',400);
 return Response.json(await createCheckout(request,account,body.planId),{headers:billingResponseHeaders})}catch(error){return billingErrorResponse(error)}}
