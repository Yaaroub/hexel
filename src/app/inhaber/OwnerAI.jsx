'use client';
import {useEffect,useRef,useState} from 'react';
import {Sparkles,Send,RotateCcw,AlertCircle,Users,ListChecks,FileText,CalendarDays,Inbox,BarChart3,BookOpen,ShieldCheck} from 'lucide-react';
import Markdown from '../components/Markdown';
import AiActions from '../components/AiActions';

const toolLabel={kunden_suchen:'Kunden',kunde_details:'Kundenakte',anfragen_liste:'Anfragen',anfrage_lesen:'Anfrage gelesen',wissen_suchen:'Wissensbasis',rueckrufe_liste:'Rückrufe',aufgaben_liste:'Aufgaben',team_aktivitaet:'Team-Arbeit',freie_termine:'Freie Termine',gebuchte_termine:'Termine',team_liste:'Team',belege_liste:'Belege',abrechenbare_leistungen:'Offene Leistungen',monatsbericht:'Monatsbericht',aufgabe_vorschlagen:'Aufgabe',aufgabe_erledigen:'Aufgabe',notiz_vorschlagen:'Notiz',antwort_vorschlagen:'Antwort',rechnungsentwurf_vorschlagen:'Rechnungsentwurf'};
const ideas=admin=>[
 [Users,'Kunden','Zeig mir alle Kunden, mit denen wir seit über einem Monat keinen Kontakt hatten.'],
 [ListChecks,'Team',admin?'Was hat das Team heute gemacht, und welche Aufgaben sind noch offen?':'Was habe ich heute gemacht, und welche Aufgaben sind noch offen?'],
 admin&&[FileText,'Rechnungen','Welche erledigten Leistungen sind noch nicht abgerechnet? Bereite für die größte einen Rechnungsentwurf vor.'],
 [CalendarDays,'Termine','Welche Termine sind diese Woche noch frei?'],
 [Inbox,'Anfragen','Fasse die dringendste offene Anfrage zusammen und schlag eine technische Lösung vor.'],
 admin&&[BarChart3,'Bericht','Erstelle den Monatsbericht: Umsatz, Anfragen und Arbeit des Teams.'],
].filter(Boolean);

export default function OwnerAI({role}){
 const [info,setInfo]=useState(null),[messages,setMessages]=useState([]),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const list=useRef(null),input=useRef(null);
 const admin=role==='admin';
 useEffect(()=>{fetch('/api/owner/ai',{cache:'no-store'}).then(r=>r.json()).then(setInfo).catch(()=>{})},[]);
 useEffect(()=>{list.current?.scrollTo({top:list.current.scrollHeight,behavior:'smooth'})},[messages,busy]);
 async function ask(q){
  const message=(q??text).trim();if(!message||busy)return;
  setBusy(true);setError('');setText('');
  const history=messages.map(m=>({role:m.role,content:m.content})).slice(-14);
  setMessages(m=>[...m,{role:'user',content:message}]);
  try{const r=await fetch('/api/owner/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,history})});const d=await r.json();if(!r.ok)throw Object.assign(Error(d.error||'Die KI konnte gerade nicht antworten.'),{code:d.code});
   setMessages(m=>[...m,{role:'assistant',content:d.reply,actions:d.actions,tools:d.tools,sources:d.sources}])}
  catch(e){setError(e.message);setMessages(m=>m.slice(0,-1));setText(message)}
  finally{setBusy(false);input.current?.focus()}
 }
 function key(e){if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();ask()}}
 const ready=info?.configured;

 return <section className="panel ai-ws" aria-labelledby="ai-ws-h">
  <div className="ai-ws__head">
   <span className="ai-ws__mark" aria-hidden="true"><Sparkles size={20}/></span>
   <div><h2 id="ai-ws-h">FUNKNAHT AI</h2><p>Workspace · {admin?'Admin':'Mitarbeiter'} · fragt echte Daten ab und schlägt Schritte vor, die du bestätigst.</p></div>
   {messages.length>0&&<button className="mini-btn" onClick={()=>{setMessages([]);setError('')}}><RotateCcw size={15}/>Neues Gespräch</button>}
  </div>

  {info&&!ready&&<div className="notice"><AlertCircle size={18}/><div><strong>Noch nicht eingerichtet.</strong> Trage in der Server-Konfiguration einen KI-Schlüssel ein, z. B. <code>GROQ_API_KEY=…</code>, und starte neu. Für Datenverarbeitung in der EU: <code>AI_PROVIDER=mistral</code> mit <code>MISTRAL_API_KEY</code>.</div></div>}

  <div className="ai-ws__log" ref={list} aria-live="polite">
   {messages.length===0&&<div className="ai-ws__ideas">
    <p className="hint">Frag in eigenen Worten, auf Deutsch oder Arabisch. Zum Beispiel:</p>
    <ul>{ideas(admin).map(([Icon,label,q])=><li key={label}><button disabled={!ready||busy} onClick={()=>ask(q)}><Icon size={17}/><span><strong>{label}</strong><small>{q}</small></span></button></li>)}</ul>
   </div>}
   {messages.map((m,i)=>m.role==='user'?<div key={i} className="ai-msg ai-msg--user" dir="auto">{m.content}</div>
    :<div key={i} className="ai-msg ai-msg--ai" dir="auto">
      <Markdown text={m.content}/>
      {m.tools?.length>0&&<p className="ai-msg__meta">Abgefragt: {[...new Set(m.tools.map(t=>toolLabel[t]||t))].join(' · ')}</p>}
      {m.sources?.length>0&&<p className="ai-msg__meta"><BookOpen size={13}/>Quellen: {m.sources.map(s=>s.titel).join(' · ')}</p>}
      <AiActions actions={m.actions}/>
     </div>)}
   {busy&&<div className="ai-msg ai-msg--ai ai-msg--busy" role="status"><span className="dots" aria-hidden="true"><i/><i/><i/></span>Daten werden abgefragt …</div>}
  </div>

  {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
  <form className="ai-ws__composer" onSubmit={e=>{e.preventDefault();ask()}}>
   <label className="sr-only" htmlFor="ai-ws-input">Frage an FUNKNAHT AI</label>
   <textarea id="ai-ws-input" ref={input} dir="auto" rows={2} maxLength={3000} value={text} onChange={e=>setText(e.target.value)} onKeyDown={key} placeholder={ready?'Frage stellen … (Enter sendet, Umschalt+Enter für neue Zeile)':'Erst nach der Einrichtung verfügbar'} disabled={!ready}/>
   <button className="btn" disabled={!ready||busy||!text.trim()} aria-label="Senden"><Send size={17}/></button>
  </form>
  <p className="ai-ws__foot"><ShieldCheck size={14}/>{info?`${info.provider} · ${info.model} · Datenverarbeitung: ${info.region}`:'…'}. Gespräche werden nicht gespeichert, E-Mail-Adressen und Telefonnummern werden vor der Übermittlung gekürzt. Jede Abfrage steht im Protokoll.</p>
 </section>;
}
