import {getDb} from './business-db.js';
import {appError} from './business-auth.js';
import {plans,getPlan} from './business-plans.js';
import {notify} from './mailer.js';
import {baseUrl} from './appointments-extra.js';

// Zugangssteuerung durch den Inhaber:
//   aktiv     – normal nutzbar
//   wartet    – neu registriert, wartet auf Freischaltung
//   gesperrt  – vom Inhaber gesperrt (mit Begründung)
//   abgelaufen – „Nutzung bis“ überschritten (automatisch, keine eigene Spalte)
// Eine Testphase schaltet einen Tarif bis zu einem Datum frei, ohne Zahlung.
const DAY=86400000;
export const ACCESS_LABEL={aktiv:'Aktiv',wartet:'Wartet auf Freischaltung',gesperrt:'Gesperrt',abgelaufen:'Nutzungszeit abgelaufen'};
export const defaultAccessSettings={approvalBusiness:false,approvalPrivate:false,trialDays:14,trialPlan:'betrieb'};

export function accessOf(org,now=Date.now()){
 const status=org.access_status||'aktiv';
 const accessUntil=org.access_until||null,trialUntil=org.trial_until||null,trialPlan=org.trial_plan||null;
 let state=status;
 if(state==='aktiv'&&accessUntil&&accessUntil<=now)state='abgelaufen';
 const trialActive=!!(trialPlan&&trialUntil&&trialUntil>now);
 return {state,label:ACCESS_LABEL[state]||state,blocked:state!=='aktiv',reason:state==='gesperrt'?org.access_reason||'':'',
  accessUntil,trialPlan,trialPlanName:trialPlan?getPlan(trialPlan).name:null,trialUntil,trialActive,
  trialDaysLeft:trialActive?Math.ceil((trialUntil-now)/DAY):0,approvedAt:org.approved_at||null};
}

export function blockedMessage(access){
 if(access.state==='wartet')return 'Ihr Konto ist angelegt und wird gerade geprüft. Sie erhalten eine E-Mail, sobald es freigeschaltet ist.';
 if(access.state==='abgelaufen')return 'Die vereinbarte Nutzungszeit ist abgelaufen. Bitte melden Sie sich bei FUNKNAHT, wenn Sie weitermachen möchten.';
 return 'Dieses Konto ist derzeit gesperrt'+(access.reason?': '+access.reason.replace(/[.!?]*$/,'.'):'.')+' Bitte wenden Sie sich an FUNKNAHT.';
}

// Einstellungen liegen bei den übrigen Inhaber-Einstellungen.
export function getAccessSettings(){
 const row=getDb().prepare("SELECT value FROM owner_settings WHERE key='access'").get();
 let stored={};try{stored=row?JSON.parse(row.value):{}}catch{}
 return {...defaultAccessSettings,...stored};
}
export function saveAccessSettings(input){
 const next={...getAccessSettings()};
 for(const k of ['approvalBusiness','approvalPrivate'])if(input[k]!==undefined)next[k]=input[k]===true;
 if(input.trialDays!==undefined){const d=Number(input.trialDays);if(!Number.isInteger(d)||d<0||d>365)throw appError('Die Testphase muss zwischen 0 und 365 Tagen liegen.');next.trialDays=d}
 if(input.trialPlan!==undefined){if(!plans.some(p=>p.id===input.trialPlan&&p.id!=='free'))throw appError('Bitte wählen Sie einen Tarif für die Testphase.');next.trialPlan=input.trialPlan}
 getDb().prepare("INSERT INTO owner_settings(key,value) VALUES('access',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(next));
 return next;
}

// Bei der Registrierung: ggf. auf Freischaltung warten lassen und Testphase vergeben.
export function applyRegistrationDefaults(orgId,accountType,ownerAccount=false){
 if(ownerAccount)return;
 const s=getAccessSettings(),now=Date.now(),db=getDb();
 const wait=accountType==='business'?s.approvalBusiness:s.approvalPrivate;
 const trial=accountType==='business'&&s.trialDays>0?{plan:s.trialPlan,until:now+s.trialDays*DAY}:null;
 db.prepare('UPDATE organizations SET access_status=?,trial_plan=?,trial_until=? WHERE id=?').run(wait?'wartet':'aktiv',trial?.plan||null,trial?.until||null,orgId);
 if(wait&&process.env.EMAIL_TO)notify({to:process.env.EMAIL_TO,subject:'Neues Konto wartet auf Freischaltung',text:'Ein neues '+(accountType==='business'?'Betriebskonto':'Privatkonto')+' wartet auf Freischaltung.\n\nIm Inhaberbereich unter „Kunden“ prüfen: '+baseUrl()+'/inhaber'});
}

function orgRow(id){const o=getDb().prepare('SELECT * FROM organizations WHERE id=?').get(String(id||''));if(!o)throw appError('Konto nicht gefunden.',404);return o}
function contactOf(orgId){return getDb().prepare("SELECT name,email FROM users WHERE organization_id=? ORDER BY CASE role WHEN 'inhaber' THEN 0 ELSE 1 END,created_at LIMIT 1").get(orgId)}
const day=v=>new Intl.DateTimeFormat('de-DE',{dateStyle:'long',timeZone:'Europe/Berlin'}).format(new Date(v));
function endOfDay(dateStr){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr||'')))throw appError('Bitte ein gültiges Datum wählen.');const t=Date.parse(dateStr+'T23:59:59+01:00');if(!Number.isFinite(t))throw appError('Bitte ein gültiges Datum wählen.');return t}

// Aktionen des Inhabers. Gibt den neuen Zugang zurück.
export function changeAccess(orgId,input){
 const o=orgRow(orgId),db=getDb(),now=Date.now(),c=contactOf(o.id),notifyCustomer=input.notify!==false;
 const mail=(subject,text)=>{if(notifyCustomer&&c?.email)notify({to:c.email,subject,text:'Guten Tag '+(c.name||'')+',\n\n'+text+'\n\nViele Grüße\nFUNKNAHT'})};
 switch(input.action){
  case 'approve':
   db.prepare("UPDATE organizations SET access_status='aktiv',access_reason=NULL,approved_at=? WHERE id=?").run(now,o.id);
   if(o.access_status==='wartet')mail('Ihr FUNKNAHT-Konto ist freigeschaltet','Ihr Konto ist jetzt freigeschaltet. Sie können sich anmelden: '+baseUrl()+'/konto'+(o.trial_until&&o.trial_until>now?'\n\nIhre Testphase läuft bis zum '+day(o.trial_until)+'.':''));
   break;
  case 'block':{
   const reason=String(input.reason||'').trim().slice(0,300);
   db.prepare("UPDATE organizations SET access_status='gesperrt',access_reason=? WHERE id=?").run(reason||null,o.id);
   // Laufende Sitzungen beenden, damit die Sperre sofort greift.
   db.prepare('DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE organization_id=?)').run(o.id);
   break}
  case 'unblock':
   db.prepare("UPDATE organizations SET access_status='aktiv',access_reason=NULL WHERE id=?").run(o.id);
   break;
  case 'trial':{
   const plan=String(input.plan||'');if(!plans.some(p=>p.id===plan&&p.id!=='free'))throw appError('Bitte einen Tarif für die Testphase wählen.');
   let until;if(input.until)until=endOfDay(input.until);else{const d=Number(input.days);if(!Number.isInteger(d)||d<1||d>365)throw appError('Bitte 1 bis 365 Tage angeben.');until=now+d*DAY}
   if(until<=now)throw appError('Das Ende der Testphase muss in der Zukunft liegen.');
   db.prepare('UPDATE organizations SET trial_plan=?,trial_until=?,trial_notice_at=NULL WHERE id=?').run(plan,until,o.id);
   mail('Ihre Testphase bei FUNKNAHT','Für Ihr Konto ist der Tarif „'+getPlan(plan).name+'“ zum Testen freigeschaltet, bis zum '+day(until)+'. Es entstehen dafür keine Kosten.\n\nZum Betriebsportal: '+baseUrl()+'/betrieb');
   break}
  case 'endTrial':
   db.prepare('UPDATE organizations SET trial_plan=NULL,trial_until=NULL,trial_notice_at=NULL WHERE id=?').run(o.id);
   break;
  case 'until':{
   const until=input.until?endOfDay(input.until):null;
   db.prepare('UPDATE organizations SET access_until=? WHERE id=?').run(until,o.id);
   break}
  default:throw appError('Unbekannte Aktion.');
 }
 return accessOf(orgRow(o.id));
}

// Zeitplan: drei Tage vor Ende der Testphase einmal erinnern.
export function trialReminders(now=Date.now()){
 const db=getDb();let sent=0;
 for(const o of db.prepare("SELECT * FROM organizations WHERE trial_until IS NOT NULL AND trial_until>? AND trial_until<=? AND trial_notice_at IS NULL AND access_status='aktiv'").all(now,now+3*DAY)){
  if(['active','trialing'].includes(o.billing_status))continue;
  const c=contactOf(o.id);
  if(c?.email)notify({to:c.email,subject:'Ihre Testphase endet bald',text:'Guten Tag '+(c.name||'')+',\n\nIhre Testphase für den Tarif „'+getPlan(o.trial_plan).name+'“ endet am '+day(o.trial_until)+'. Danach gilt wieder der kostenlose Einstieg, Ihre Daten bleiben erhalten.\n\nWenn Sie weitermachen möchten, wählen Sie im Betriebsportal unter „Tarif“ einen Tarif: '+baseUrl()+'/betrieb\n\nViele Grüße\nFUNKNAHT'});
  db.prepare('UPDATE organizations SET trial_notice_at=? WHERE id=?').run(now,o.id);sent++;
 }
 return sent;
}

// Kennzahlen für den Überblick des Inhabers.
export function accessCounts(now=Date.now()){
 const db=getDb();
 return {waiting:db.prepare("SELECT COUNT(*) n FROM organizations WHERE access_status='wartet'").get().n,
  blocked:db.prepare("SELECT COUNT(*) n FROM organizations WHERE access_status='gesperrt'").get().n,
  trials:db.prepare('SELECT COUNT(*) n FROM organizations WHERE trial_until>?').get(now).n,
  trialsEnding:db.prepare('SELECT COUNT(*) n FROM organizations WHERE trial_until>? AND trial_until<=?').get(now,now+3*DAY).n,
  expiringSoon:db.prepare("SELECT COUNT(*) n FROM organizations WHERE access_status='aktiv' AND access_until>? AND access_until<=?").get(now,now+7*DAY).n};
}
