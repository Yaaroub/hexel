'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Phone,Check,AlertCircle} from 'lucide-react';
const topics=['Internet & WLAN','Smartphone oder Tablet','Online-Banking','Ist das Betrug?','Computer oder Drucker','Website oder Software','Termin vereinbaren','Etwas anderes'];
const windows=['Egal','Vormittags','Mittags','Nachmittags','Abends'];
// Rückruf-Wunsch: das Einfachste für alle, die lieber telefonieren als Formulare ausfüllen.
export default function CallbackForm({topic='',title='Wir rufen Sie zurück',intro='Name und Telefonnummer genügen. Wir melden uns so bald wie möglich im gewünschten Zeitraum.',compact=false,collapsible=false,level=3}){
 const Heading='h'+level;
 const [open,setOpen]=useState(!collapsible);
 const [state,setState]=useState('idle'),[error,setError]=useState('');
 async function submit(e){e.preventDefault();setState('busy');setError('');const f=Object.fromEntries(new FormData(e.currentTarget));
  try{const r=await fetch('/api/callback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...f,consent:f.consent==='on'})});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Das hat nicht geklappt. Bitte versuchen Sie es noch einmal.');setState('done')}
  catch(err){setError(err.message);setState('idle')}}
 if(state==='done')return <div className="callback callback--done" role="status"><span className="success-mark"><Check size={26}/></span><Heading>Danke, wir rufen Sie zurück.</Heading><p>Halten Sie Ihr Telefon bereit. Wir melden uns im gewünschten Zeitraum.</p></div>;
 if(!open)return <div className={'callback callback--closed'+(compact?' callback--compact':'')}><div className="callback__head"><span className="callback__icon"><Phone size={22}/></span><div><Heading id="cb-title">{title}</Heading><p>{intro}</p></div></div><button type="button" className="btn btn--small" style={{width:'100%'}} onClick={()=>setOpen(true)} aria-expanded="false"><Phone size={16}/>Rückruf anfordern</button></div>;
 return <form className={'callback'+(compact?' callback--compact':'')} onSubmit={submit} aria-labelledby="cb-title">
  <div className="callback__head"><span className="callback__icon"><Phone size={22}/></span><div><Heading id="cb-title">{title}</Heading><p>{intro}</p></div></div>
  <fieldset disabled={state==='busy'}>
   <div className="form-grid">
    <label className="field">Ihr Name<input name="name" autoComplete="name" required maxLength={120}/></label>
    <label className="field">Telefonnummer<input name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={40} placeholder="z. B. 04522 123456"/></label>
   </div>
   <div className="form-grid">
    <label className="field">Worum geht es?<select name="topic" defaultValue={topic||'Etwas anderes'}>{topics.map(t=><option key={t}>{t}</option>)}</select></label>
    <label className="field">Wann passt es?<select name="timeWindow" defaultValue="Egal">{windows.map(t=><option key={t}>{t}</option>)}</select></label>
   </div>
   {!compact&&<label className="field"><span>Kurzer Hinweis <span className="field__opt">(optional)</span></span><input name="note" maxLength={600} placeholder="z. B. Das Handy zeigt eine Warnung"/></label>}
   <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
   <label className="check"><input type="checkbox" name="consent" required/><span>Ja, FUNKNAHT darf mich unter dieser Nummer zurückrufen. Die Angaben werden nach Erledigung gelöscht (<Link className="link" href="/datenschutz">Datenschutz</Link>).</span></label>
   {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
   <button className="btn btn--big" style={{width:'100%'}}><Phone size={19}/>{state==='busy'?'Wird gesendet …':'Rückruf anfordern'}</button>
  </fieldset>
 </form>;
}
