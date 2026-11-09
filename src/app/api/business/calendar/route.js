import {requireAccount,assertMutationOrigin,jsonError} from '../../../../lib/business-auth';
import {requireRole} from '../../../../lib/team';
import {calendarToken,baseUrl} from '../../../../lib/appointments-extra';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
const out=t=>({url:baseUrl()+'/api/kalender/'+t+'.ics',webcal:baseUrl().replace(/^https?:/,'webcal:')+'/api/kalender/'+t+'.ics'});
export async function GET(request){try{const account=requireAccount(request);return Response.json(out(calendarToken(account.organization.id)),{headers})}catch(e){return jsonError(e)}}
export async function POST(request){try{assertMutationOrigin(request);const account=requireAccount(request);requireRole(account,'inhaber','buero');return Response.json(out(calendarToken(account.organization.id,{renew:true})),{headers})}catch(e){return jsonError(e)}}
