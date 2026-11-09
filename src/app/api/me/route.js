import {requireAccount,jsonError} from '../../../lib/business-auth';
import {customerOrg,familyScopes,familyMembers} from '../../../lib/family';
import {listDevices} from '../../../lib/devices';
import {listMonitors} from '../../../lib/monitors';
import {listDocuments} from '../../../lib/documents';
export const runtime='nodejs';
export const dynamic='force-dynamic';
// Alles für „Mein Bereich“: Geräte, Überwachung, Belege und Angehörige.
export async function GET(request){try{const account=requireAccount(request);const forOrg=new URL(request.url).searchParams.get('for');const orgId=customerOrg(account,forOrg);const own=orgId===account.organization.id;
 const monitors=listMonitors(orgId).map(({token,url,...m})=>({...m,url:m.kind==='website'?url:''}));
 return Response.json({account:{name:account.user.name,role:account.user.role,accountType:account.organization.accountType},acting:own?null:familyScopes(account).find(s=>s.organizationId===orgId),scopes:familyScopes(account),members:own?familyMembers(account):[],devices:listDevices(orgId,{withToken:false}),monitors,documents:listDocuments({organizationId:orgId,forCustomer:true}).map(d=>({id:d.id,number:d.number,type:d.type,status:d.status,statusLabel:d.statusLabel,issuedOn:d.issuedOn,dueOn:d.dueOn,gross:d.totals.gross})),bookingSlug:process.env.FUNKNAHT_BOOKING_SLUG||null},{headers:{'Cache-Control':'no-store'}})}catch(e){return jsonError(e)}}
