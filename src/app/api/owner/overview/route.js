import {jsonError} from '../../../../lib/business-auth.js';
import {requireStaff,isAdmin,overview,applyRetention,RETENTION,elevationUntil} from '../../../../lib/owner.js';
import {getDb} from '../../../../lib/business-db.js';
import {purgeAi} from '../../../../lib/ai/engine.js';
import {mailConfigured} from '../../../../lib/mailer.js';
import {getBillingConfiguration} from '../../../../lib/business-billing.js';
import {aiConfig} from '../../../../lib/ai/engine.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){try{const account=requireStaff(request);const admin=isAdmin(account);const retention=applyRetention();purgeAi();const billing=getBillingConfiguration(),ai=aiConfig();
 const o=overview(),db=getDb(),today=new Date().toISOString().slice(0,10);
 o.tasks={mine:db.prepare("SELECT COUNT(*) n FROM tasks WHERE assignee_user_id=? AND status='offen'").get(account.user.id).n,mineOverdue:db.prepare("SELECT COUNT(*) n FROM tasks WHERE assignee_user_id=? AND status='offen' AND due_on<?").get(account.user.id,today).n,unassigned:db.prepare("SELECT COUNT(*) n FROM tasks WHERE assignee_user_id IS NULL AND status='offen'").get().n};
 // Mitarbeiter sehen keine Umsätze, Tarife, Belege und Zugangsdaten der Konten.
 if(!admin)for(const k of ['plans','paying','monthlyRevenue','openOffers','unpaidInvoices','overdueInvoices','access','ratings'])delete o[k];
 return Response.json({owner:{...account.user,role:account.staff.role},until:elevationUntil(request),overview:o,retention:{...RETENTION,lastRun:retention},services:{mail:mailConfigured(),billing:billing.configured?(billing.testMode?'test':'live'):'off',ai:ai.configured?ai.name+' · '+ai.model:null,publicSite:!!process.env.SITE_URL,bookingSlug:process.env.FUNKNAHT_BOOKING_SLUG||null,cron:(process.env.CRON_SECRET||'').length>=24}},{headers:{'Cache-Control':'no-store'}})}catch(error){return jsonError(error)}}
