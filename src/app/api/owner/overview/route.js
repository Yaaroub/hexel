import {jsonError} from '../../../../lib/business-auth.js';
import {requireOwner,overview,applyRetention,RETENTION,elevationUntil} from '../../../../lib/owner.js';
import {mailConfigured} from '../../../../lib/mailer.js';
import {getBillingConfiguration} from '../../../../lib/business-billing.js';
import {aiConfiguration} from '../../../../lib/portal-ai.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){try{const account=requireOwner(request);const retention=applyRetention();const billing=getBillingConfiguration(),ai=aiConfiguration();return Response.json({owner:account.user,until:elevationUntil(request),overview:overview(),retention:{...RETENTION,lastRun:retention},services:{mail:mailConfigured(),billing:billing.configured?(billing.testMode?'test':'live'):'off',ai:ai.key?ai.name:null,publicSite:!!process.env.SITE_URL,bookingSlug:process.env.FUNKNAHT_BOOKING_SLUG||null,cron:(process.env.CRON_SECRET||'').length>=24}},{headers:{'Cache-Control':'no-store'}})}catch(error){return jsonError(error)}}
