'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Check,AlertCircle,ShieldCheck} from 'lucide-react';
import CallbackForm from '../components/CallbackForm';
import Split from '../components/Split';
import Threads from '../components/Threads';
import ProcessSteps from '../components/ProcessSteps';
import {steps} from '../../lib/process';

const topics=['Netzwerk & WLAN','Abo & Betreuung','Website','Webanwendung','Betriebsportal','KI & Automatisierung','Digitalhilfe für Senioren','Noch offen'];
const placeholders={
 'Netzwerk & WLAN':'Welche Verbindung macht Probleme? Seit wann, und welche Geräte sind betroffen?',
 Website:'Gibt es schon eine Website? Was soll sie für Ihren Betrieb leisten?',
 Webanwendung:'Welcher Ablauf soll mit der Anwendung einfacher werden? Wer arbeitet damit?',
 Betriebsportal:'Wie viele Mitarbeitende, welche Leistungen, wie nehmen Sie Termine heute an?',
 'Digitalhilfe für Senioren':'Wobei wünschen Sie sich Hilfe? Zum Beispiel Smartphone, Online-Banking oder Videoanrufe. Schreiben Sie gern auch, wenn Sie für Ihre Eltern anfragen.',
};

export default function Contact(){
 const [topic,setTopic]=useState(''),[status,setStatus]=useState(null),[busy,setBusy]=useState(false),[prefill,setPrefill]=useState('');
 useEffect(()=>{const q=new URLSearchParams(location.search),v=q.get('thema')||'',abo=(q.get('abo')||'').slice(0,60),branche=(q.get('branche')||'').slice(0,60);
  if(abo||branche)setPrefill([abo&&'Ich interessiere mich für: '+abo+'.',branche&&'Branche: '+branche+'.'].filter(Boolean).join(' ')+' ');
  if(/abo|betreuung/i.test(v))setTopic('Abo & Betreuung');else if(/senior/i.test(v))setTopic('Digitalhilfe für Senioren');else if(/netzwerk/i.test(v))setTopic('Netzwerk & WLAN');else if(/betriebsportal/i.test(v))setTopic('Betriebsportal');else if(/ki|automat/i.test(v))setTopic('KI & Automatisierung');else if(/website/i.test(v))setTopic('Website');else if(/anwendung|software|app/i.test(v))setTopic('Webanwendung')},[]);
 async function submit(e){
  e.preventDefault();if(busy)return;const form=e.currentTarget;setBusy(true);setStatus(null);
  try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Der Versand hat nicht funktioniert.');setStatus({ok:true});form.reset();setTopic('')}
  catch(err){setStatus({ok:false,text:err.message})}finally{setBusy(false)}
 }
 const network=topic==='Netzwerk & WLAN'||topic==='Digitalhilfe für Senioren';
 return <>
  <section className="page-head glow"><Threads className="threads--soft"/>
   <div className="wrap"><p className="intro">Kontakt</p><Split as="h1" className="display" style={{maxWidth:'12em'}}>Erzählen Sie uns, woran Sie arbeiten.</Split><p className="lead">Ein paar Sätze reichen für den Anfang. Wir melden uns per E-Mail mit Rückfragen oder einem Vorschlag für ein kurzes Gespräch.</p></div>
  </section>
  <section className="band">
   <div className="wrap contact">
    <div className="contact__aside">
     <CallbackForm compact collapsible level={2} title="Lieber telefonieren?" intro="Hinterlassen Sie Ihre Nummer, wir rufen zurück."/>
     <p className="contact__hint">Schon ein technisches Problem? Im <Link className="link" href="/portal">Hilfe-Portal</Link> grenzen Sie es Schritt für Schritt ein.</p>
    </div>
    {status?.ok?<div className="panel" role="status" style={{display:'grid',gap:16,justifyItems:'start'}}><span className="success-mark"><Check size={28}/></span><h2 className="h3">Danke, Ihre Anfrage ist angekommen.</h2><p className="prose">Wir antworten an die angegebene E-Mail-Adresse. Falls Sie in den nächsten Tagen nichts hören, sehen Sie bitte im Spam-Ordner nach.</p><button className="link" onClick={()=>setStatus(null)}>Weitere Anfrage schreiben<ArrowRight size={16}/></button></div>:
    <form className="panel form" onSubmit={submit} aria-busy={busy}>
     <fieldset disabled={busy}>
      <div className="field" role="radiogroup" aria-labelledby="topic-label"><span id="topic-label">Worum geht es?</span><div className="choices">{topics.map(t=><label className="choice" key={t}><input type="radio" name="topic" value={t} checked={topic===t} onChange={()=>setTopic(t)} required/><span>{t}</span></label>)}</div></div>
      <div className="form-grid">
       <label className="field">Name<input name="name" autoComplete="name" required maxLength={150}/></label>
       <label className="field">E-Mail<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
      </div>
      <div className="form-grid">
       <label className="field"><span>Unternehmen <span className="field__opt">(optional)</span></span><input name="company" autoComplete="organization" maxLength={150}/></label>
       <label className="field"><span>Ort {network?'':<span className="field__opt">(optional)</span>}</span><input name="location" autoComplete="address-level2" required={network} maxLength={150} placeholder={network?'z. B. Preetz':''}/></label>
      </div>
      <label className="field">Ihr Anliegen<textarea name="message" rows={6} required minLength={10} maxLength={5000} defaultValue={prefill} key={prefill} placeholder={placeholders[topic]||'Was soll entstehen oder besser funktionieren? Was gibt es schon?'} aria-describedby="msg-hint"/></label>
      <p className="hint" id="msg-hint">Bitte keine Passwörter oder Zugangsdaten eintragen.</p>
      <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
      <div className="privacy-note"><ShieldCheck size={18}/><span>Wir nutzen Ihre Angaben nur, um Ihre Anfrage zu beantworten. Mehr dazu in der <Link className="link" href="/datenschutz">Datenschutzerklärung</Link>. Für Aufträge gelten unsere <Link className="link" href="/agb">AGB</Link>.</span></div>
      {status&&!status.ok&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{status.text}</p>}
      <div className="actions"><button className="btn" type="submit">{busy?'Wird gesendet …':'Anfrage senden'}<ArrowRight size={18}/></button></div>
     </fieldset>
    </form>}
   </div>
  </section>
  <section className="band band--stone">
   <div className="wrap process">
    <div><Split as="h2" className="h2">So wird aus einer Idee ein Werkzeug.</Split><p className="prose" style={{marginTop:20}}>Sie müssen keine technischen Begriffe kennen. Wichtig ist, was Ihnen im Alltag Zeit kostet. Den Rest übersetzen wir.</p></div>
    <ProcessSteps steps={steps}/>
   </div>
  </section>
 </>;
}
