'use client';
import {useState} from 'react';
import {ShieldCheck,ShieldOff,Ban,Unlock,Clock,FlaskConical,CalendarX,AlertCircle,Check} from 'lucide-react';
const day=v=>v?new Intl.DateTimeFormat('de-DE',{dateStyle:'medium'}).format(new Date(v)):'';
const iso=v=>v?new Date(v).toISOString().slice(0,10):'';
export const accessTone={aktiv:'ok',wartet:'wait',gesperrt:'error',abgelaufen:'muted'};
export function AccessBadge({access}){
 if(!access)return null;
 return <span style={{display:'inline-flex',gap:6,flexWrap:'wrap'}}><span className={'badge badge--'+(accessTone[access.state]||'muted')}>{access.label}</span>{access.trialActive&&<span className="badge badge--info">Test bis {day(access.trialUntil)}</span>}</span>;
}

// Zugang eines Kontos steuern: freischalten, sperren, Testphase, Nutzung bis.
export default function OwnerAccess({orgId,access,plans,paidPlan,api,handle,onChange}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState(''),[mode,setMode]=useState(null);
 const today=new Date(Date.now()+86400000).toISOString().slice(0,10);
 async function act(body,msg){setBusy(true);setError('');setDone('');try{const d=await api('/api/owner/access',{method:'POST',body:JSON.stringify({organizationId:orgId,...body})});onChange(d.access);setDone(msg);setMode(null)}catch(e){if(!handle(e))setError(e.message)}finally{setBusy(false)}}
 const form=e=>{e.preventDefault();return Object.fromEntries(new FormData(e.currentTarget))};
 return <section className="akte access">
  <div className="akte__head"><h3><ShieldCheck size={17}/>Zugang</h3><AccessBadge access={access}/></div>
  <dl className="kv">
   <div><dt>Status</dt><dd>{access.label}{access.reason?' – '+access.reason:''}</dd></div>
   <div><dt>Tarif</dt><dd>{paidPlan?'bezahlt: '+(plans.find(p=>p.id===paidPlan)?.name||paidPlan):access.trialActive?'Test: '+access.trialPlanName+' (noch '+access.trialDaysLeft+' Tage)':'Kostenloser Einstieg'}</dd></div>
   <div><dt>Nutzung bis</dt><dd>{access.accessUntil?day(access.accessUntil):'unbegrenzt'}</dd></div>
  </dl>
  {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
  {done&&<p className="notice notice--ok" role="status"><Check size={18}/>{done}</p>}
  <div className="actions">
   {access.state==='wartet'&&<button className="btn btn--small" disabled={busy} onClick={()=>act({action:'approve'},'Konto freigeschaltet. Der Kunde bekommt eine E-Mail.')}><Unlock size={15}/>Freischalten</button>}
   {access.state==='gesperrt'?<button className="btn btn--small" disabled={busy} onClick={()=>act({action:'unblock'},'Sperre aufgehoben.')}><Unlock size={15}/>Konto entsperren</button>:access.state!=='wartet'&&<button className="mini-btn mini-btn--danger" disabled={busy} onClick={()=>setMode(mode==='block'?null:'block')}><Ban size={14}/>Konto sperren</button>}
   <button className="mini-btn" disabled={busy} onClick={()=>setMode(mode==='trial'?null:'trial')}><FlaskConical size={14}/>{access.trialActive?'Testphase ändern':'Testphase geben'}</button>
   {access.trialActive&&<button className="mini-btn" disabled={busy} onClick={()=>{if(confirm('Testphase jetzt beenden? Das Konto fällt auf den kostenlosen Einstieg zurück.'))act({action:'endTrial'},'Testphase beendet.')}}><CalendarX size={14}/>Testphase beenden</button>}
   <button className="mini-btn" disabled={busy} onClick={()=>setMode(mode==='until'?null:'until')}><Clock size={14}/>Nutzungszeit</button>
  </div>
  {mode==='block'&&<form className="form panel panel--quiet" onSubmit={e=>{const f=form(e);act({action:'block',reason:f.reason},'Konto gesperrt. Alle Sitzungen wurden beendet.')}}><fieldset disabled={busy}>
   <label className="field"><span>Grund <span className="field__opt">(sieht der Kunde)</span></span><input name="reason" maxLength={300} placeholder="z. B. Rechnung vom 1. Oktober noch offen"/></label>
   <p className="hint">Der Kunde wird sofort abgemeldet. Er kann sich anmelden, sieht dann aber nur die Sperrmeldung. Seine Daten herunterladen oder löschen kann er weiterhin (DSGVO). Online-Buchungen sind gesperrt.</p>
   <div className="actions"><button className="btn btn--small" style={{background:'var(--err)'}}><ShieldOff size={15}/>Konto jetzt sperren</button><button type="button" className="link" onClick={()=>setMode(null)}>Abbrechen</button></div>
  </fieldset></form>}
  {mode==='trial'&&<form className="form panel panel--quiet" onSubmit={e=>{const f=form(e);act({action:'trial',plan:f.plan,...(f.dauer==='date'?{until:f.until}:{days:Number(f.dauer)}),notify:f.notify==='on'},'Testphase gespeichert.')}}><fieldset disabled={busy}>
   <div className="form-grid"><label className="field">Tarif zum Testen<select name="plan" defaultValue={access.trialPlan||'betrieb'}>{plans.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    <label className="field">Dauer<select name="dauer" defaultValue="14" onChange={e=>{e.currentTarget.form.elements.until.disabled=e.currentTarget.value!=='date'}}><option value="7">7 Tage</option><option value="14">14 Tage</option><option value="30">30 Tage</option><option value="60">60 Tage</option><option value="90">90 Tage</option><option value="date">bis Datum …</option></select></label></div>
   <label className="field">Bis zum<input type="date" name="until" min={today} defaultValue={iso(access.trialUntil)} disabled/></label>
   <label className="check"><input type="checkbox" name="notify" defaultChecked/><span>Kunden per E-Mail informieren</span></label>
   <p className="hint">Während der Testphase gilt der gewählte Tarif ohne Zahlung. Drei Tage vor Ende bekommt der Kunde automatisch eine Erinnerung. Danach gilt wieder der kostenlose Einstieg, Daten bleiben erhalten.</p>
   <div className="actions"><button className="btn btn--small"><FlaskConical size={15}/>Testphase speichern</button><button type="button" className="link" onClick={()=>setMode(null)}>Abbrechen</button></div>
  </fieldset></form>}
  {mode==='until'&&<form className="form panel panel--quiet" onSubmit={e=>{const f=form(e);act({action:'until',until:f.until||''},f.until?'Nutzung begrenzt bis '+new Date(f.until).toLocaleDateString('de-DE')+'.':'Nutzungszeit ist jetzt unbegrenzt.')}}><fieldset disabled={busy}>
   <label className="field"><span>Nutzung erlaubt bis <span className="field__opt">(leer = unbegrenzt)</span></span><input type="date" name="until" min={today} defaultValue={iso(access.accessUntil)}/></label>
   <p className="hint">Nach diesem Tag ist das Konto automatisch gesperrt, bis Sie die Zeit verlängern. Gut für befristete Projekte oder Leihzugänge.</p>
   <div className="actions"><button className="btn btn--small"><Check size={15}/>Speichern</button><button type="button" className="link" onClick={()=>setMode(null)}>Abbrechen</button></div>
  </fieldset></form>}
 </section>;
}
