'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,MapPin,Code2,CalendarCheck,Check,AlertCircle,ShieldCheck} from 'lucide-react';

const topics=['Website','Webanwendung','Betriebsportal','KI & Automatisierung','Netzwerk & WLAN','Digitalhilfe für Senioren','Noch offen'];
const placeholders={
 'Netzwerk & WLAN':'Welche Verbindung macht Probleme? Seit wann, und welche Geräte sind betroffen?',
 Website:'Gibt es schon eine Website? Was soll sie für Ihren Betrieb leisten?',
 Webanwendung:'Welcher Ablauf soll mit der Anwendung einfacher werden? Wer arbeitet damit?',
 Betriebsportal:'Wie viele Mitarbeitende, welche Leistungen, wie nehmen Sie Termine heute an?',
 'Digitalhilfe für Senioren':'Wobei wünschen Sie sich Hilfe? Zum Beispiel Smartphone, Online-Banking oder Videoanrufe. Schreiben Sie gern auch, wenn Sie für Ihre Eltern anfragen.',
};

export default function Contact(){
 const [topic,setTopic]=useState(''),[status,setStatus]=useState(null),[busy,setBusy]=useState(false);
 useEffect(()=>{const v=new URLSearchParams(location.search).get('thema')||'';
  if(/senior/i.test(v))setTopic('Digitalhilfe für Senioren');else if(/netzwerk/i.test(v))setTopic('Netzwerk & WLAN');else if(/betriebsportal/i.test(v))setTopic('Betriebsportal');else if(/ki|automat/i.test(v))setTopic('KI & Automatisierung');else if(/website/i.test(v))setTopic('Website');else if(/anwendung|software|app/i.test(v))setTopic('Webanwendung')},[]);
 async function submit(e){
  e.preventDefault();if(busy)return;const form=e.currentTarget;setBusy(true);setStatus(null);
  try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Der Versand hat nicht funktioniert.');setStatus({ok:true});form.reset();setTopic('')}
  catch(err){setStatus({ok:false,text:err.message})}finally{setBusy(false)}
 }
 const network=topic==='Netzwerk & WLAN'||topic==='Digitalhilfe für Senioren';
 return <>
  <section className="page-head">
   <div className="wrap"><p className="intro">Kontakt</p><h1 className="display" style={{maxWidth:'12em'}}>Erzählen Sie uns, woran Sie arbeiten.</h1><p className="lead">Ein paar Sätze reichen für den Anfang. Wir melden uns per E-Mail mit Rückfragen oder einem Vorschlag für ein kurzes Gespräch.</p></div>
  </section>
  <section className="band">
   <div className="wrap contact">
    <aside>
     <div><MapPin size={22} color="var(--brass)"/><h2 style={{marginTop:10}}>Netzwerkhilfe vor Ort</h2><p>Im Kreis Plön und in Ostholstein. Nennen Sie Ihren Ort und die betroffenen Geräte.</p></div>
     <div><Code2 size={22} color="var(--brass)"/><h2 style={{marginTop:10}}>Websites und Software</h2><p>Für Betriebe in der Region und deutschlandweit. Auch für bestehende Projekte, die weiterentwickelt werden sollen.</p></div>
     <div><CalendarCheck size={22} color="var(--brass)"/><h2 style={{marginTop:10}}>Schon ein technisches Problem?</h2><p>Im <Link className="link" href="/portal">Hilfe-Portal</Link> grenzen Sie es Schritt für Schritt ein und übergeben alles mit einem Klick.</p></div>
    </aside>
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
      <label className="field">Ihr Anliegen<textarea name="message" rows={6} required minLength={10} maxLength={5000} placeholder={placeholders[topic]||'Was soll entstehen oder besser funktionieren? Was gibt es schon?'} aria-describedby="msg-hint"/></label>
      <p className="hint" id="msg-hint">Bitte keine Passwörter oder Zugangsdaten eintragen.</p>
      <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
      <div className="privacy-note"><ShieldCheck size={18}/><span>Wir nutzen Ihre Angaben nur, um Ihre Anfrage zu beantworten. Mehr dazu in der <Link className="link" href="/datenschutz">Datenschutzerklärung</Link>.</span></div>
      {status&&!status.ok&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{status.text}</p>}
      <div className="actions"><button className="btn" type="submit">{busy?'Wird gesendet …':'Anfrage senden'}<ArrowRight size={18}/></button></div>
     </fieldset>
    </form>}
   </div>
  </section>
 </>;
}
