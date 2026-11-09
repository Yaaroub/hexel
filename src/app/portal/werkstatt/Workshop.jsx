'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {Inbox,Plus,Check,RotateCcw,AlertCircle,RefreshCw,Send,Paperclip,FileText,ArrowLeft,ThumbsUp,ThumbsDown,CalendarCheck} from 'lucide-react';
import {categories,getDiagnostic} from '../../../lib/portal-knowledge';
import {describeDiagnostics} from '../../../lib/diagnostics-client';

export const statusLabel={offen:['wait','Eingegangen'],'in-pruefung':['info','In Bearbeitung'],geloest:['ok','Erledigt']};
const fmt=v=>new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));
const title=t=>categories.find(c=>c.id===t.category)?.title||'Vorhaben';

export function Attachment({file}){
 const img=file.mime.startsWith('image/');
 return <a className="file" href={'/api/attachments/'+file.id} target="_blank" rel="noreferrer">{img?<img src={'/api/attachments/'+file.id} alt="" loading="lazy"/>:<span className="file__icon"><FileText size={20}/></span>}<span><strong>{file.filename}</strong><small>{Math.ceil(file.size/1024)} KB</small></span></a>;
}

export default function Workshop({forOrg='',bookingSlug=null}){
 const q=forOrg?'for='+encodeURIComponent(forOrg):'';const withFor=url=>q?url+(url.includes('?')?'&':'?')+q:url;
 const [tickets,setTickets]=useState([]),[selected,setSelected]=useState(null),[detail,setDetail]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[auth,setAuth]=useState(true),[busy,setBusy]=useState(false),[draft,setDraft]=useState('');
 const end=useRef(null);
 const loadList=useCallback(async()=>{setError('');try{const r=await fetch(withFor('/api/portal/tickets'),{cache:'no-store'});const d=await r.json();if(r.status===401){setAuth(false);return}if(!r.ok)throw Error(d.error||'Ihre Anfragen konnten nicht geladen werden.');setTickets(d.tickets);setSelected(o=>d.tickets.some(t=>t.id===o)?o:(typeof window!=='undefined'&&innerWidth>900?d.tickets[0]?.id:null)||null)}catch(e){setError(e.message)}finally{setLoading(false)}},[forOrg]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{setSelected(null);loadList()},[loadList]);
 useEffect(()=>{if(!selected){setDetail(null);return}let live=true;fetch(withFor('/api/portal/tickets/'+selected),{cache:'no-store'}).then(r=>r.json()).then(d=>{if(live)setDetail(d)}).catch(()=>{});return()=>{live=false}},[selected]);
 useEffect(()=>{end.current?.scrollIntoView({block:'nearest'})},[detail?.messages?.length]);
 function apply(d){setDetail(d);setTickets(l=>l.map(t=>t.id===d.ticket.id?{...t,status:d.ticket.status,awaiting:d.ticket.awaiting,lastActivityAt:d.ticket.lastActivityAt}:t))}
 async function send(e){e.preventDefault();if(busy||!draft.trim())return;setBusy(true);setError('');try{const r=await fetch('/api/portal/tickets/'+selected,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({body:draft,for:forOrg||undefined})});const d=await r.json();if(!r.ok)throw Error(d.error||'Die Nachricht wurde nicht gesendet.');apply(d);setDraft('')}catch(err){setError(err.message)}finally{setBusy(false)}}
 async function upload(e){const file=e.target.files?.[0];e.target.value='';if(!file)return;if(file.size>5*1024*1024){setError('Die Datei ist größer als 5 MB.');return}setBusy(true);setError('');try{const form=new FormData();form.append('file',file);const r=await fetch(withFor('/api/portal/tickets/'+selected+'/attachments'),{method:'POST',body:form});const d=await r.json();if(!r.ok)throw Error(d.error||'Die Datei wurde nicht hochgeladen.');apply(d)}catch(err){setError(err.message)}finally{setBusy(false)}}
 async function rate(helpful){const comment=helpful?'':(prompt('Was hätten wir besser machen können? (optional)')||'');setBusy(true);setError('');try{const r=await fetch('/api/portal/tickets/'+selected+'/rating',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({helpful,comment,for:forOrg||undefined})});const d=await r.json();if(!r.ok)throw Error(d.error);apply(d)}catch(err){setError(err.message)}finally{setBusy(false)}}
 async function setStatus(status){setBusy(true);setError('');try{const r=await fetch('/api/portal/tickets',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:selected,status,for:forOrg||undefined})});const d=await r.json();if(!r.ok)throw Error(d.error||'Die Änderung wurde nicht gespeichert.');apply(d)}catch(err){setError(err.message)}finally{setBusy(false)}}

 if(!auth)return <div><div className="empty" style={{maxWidth:560}}><Inbox size={28}/><h3>Bitte melden Sie sich an.</h3><p>Ihre Anfragen sind Ihrem Konto zugeordnet.</p><Link className="btn" href="/konto?next=/portal/werkstatt">Anmelden</Link></div></div>;
 const t=detail?.ticket,files=detail?.attachments||[];
 return <div>
  <div className="app__head app__head--sub"><div><h2 className="h3">Anfragen</h2><p className="app__sub">Schreiben Sie direkt mit uns und reichen Sie Fotos nach.</p></div><div className="actions"><button className="mini-btn" onClick={()=>{loadList();if(selected)setSelected(s=>s)}} disabled={loading}><RefreshCw size={15}/>Aktualisieren</button><Link className="btn btn--small" href="/portal"><Plus size={16}/>Neues Anliegen</Link></div></div>
  {error&&<p className="notice notice--error" role="alert" style={{marginBottom:16}}><AlertCircle size={18}/>{error}</p>}
  {loading?<p role="status" className="muted">Anfragen werden geladen …</p>:!tickets.length?<div className="empty"><Inbox size={28}/><h3>Noch keine Anfragen.</h3><p>Schildern Sie im Hilfe-Portal Ihr Anliegen. Es erscheint danach hier, und Sie können mit uns schreiben.</p><Link className="btn" href="/portal">Anliegen schildern</Link></div>:
  <div className={'split'+(selected?' has-detail':'')}>
   <div className="panel split__list"><div className="rows">{tickets.map(x=>{const [tone,label]=statusLabel[x.status]||['muted',x.status];return <button className="row row--button" key={x.id} aria-pressed={x.id===selected} onClick={()=>setSelected(x.id)}><div><div className="row__title">{title(x)}</div><div className="row__meta">{x.id} · {fmt(x.lastActivityAt||x.createdAt)}</div><div className="row__note clamp-2">{x.description}</div></div><div style={{display:'grid',gap:6,justifyItems:'end'}}><span className={'badge badge--'+tone}>{label}</span>{x.status!=='geloest'&&x.awaiting==='customer'&&<span className="badge badge--info">Neue Antwort</span>}</div></button>})}</div></div>
   {selected&&<article className="panel thread split__detail" aria-live="polite">
    <button className="link split__back" onClick={()=>setSelected(null)}><ArrowLeft size={16}/>Alle Anfragen</button>
    {!t?<p className="muted">Wird geladen …</p>:<>
     <div className="panel__head" style={{margin:0}}><div><h2>{title(t)}</h2><p>{t.id} · eingegangen am {fmt(t.createdAt)}</p></div><span className={'badge badge--'+(statusLabel[t.status]?.[0]||'muted')}>{statusLabel[t.status]?.[1]}</span></div>
     <div className="chat-log">
      <div className="msg msg--customer"><span className="msg__who">Ihre Anfrage · {fmt(t.createdAt)}</span><p>{t.description}</p>{(t.device||t.location)&&<p className="msg__meta">{[t.device&&'Gerät: '+t.device,t.location&&'Ort: '+t.location].filter(Boolean).join(' · ')}</p>}{t.attempts?.length>0&&<p className="msg__meta">Bereits geprüft: {t.attempts.map(a=>getDiagnostic(t.category)?.steps.find(s=>s.id===a.stepId)?.title||a.stepId).join(', ')}</p>}</div>
      {detail.messages.map(m=><div key={m.id} className={'msg msg--'+m.author}><span className="msg__who">{m.author==='owner'?'FUNKNAHT':m.author==='system'?'Automatische Meldung':'Sie'} · {fmt(m.createdAt)}</span><p>{m.body}</p></div>)}
      {t.status!=='geloest'&&t.awaiting==='owner'&&<p className="hint">Wir haben Ihre Nachricht erhalten und melden uns hier.</p>}
      <span ref={end}/>
     </div>
     {files.length>0&&<div><h3 className="h3" style={{fontSize:'1rem',marginBottom:8}}>Dateien</h3><div className="files">{files.map(f=><Attachment key={f.id} file={f}/>)}</div></div>}
     {t.status==='geloest'&&(t.rating==null?<div className="rate"><span>Hat Ihnen unsere Hilfe genützt?</span><div className="actions"><button className="mini-btn" disabled={busy} onClick={()=>rate(true)}><ThumbsUp size={15}/>Ja</button><button className="mini-btn" disabled={busy} onClick={()=>rate(false)}><ThumbsDown size={15}/>Nicht wirklich</button></div></div>:<p className="hint">Danke für Ihre Rückmeldung.</p>)}
     {bookingSlug&&t.status!=='geloest'&&<a className="mini-btn" style={{justifySelf:'start'}} href={'/buchen/'+bookingSlug+'?anfrage='+t.id}><CalendarCheck size={15}/>Termin für einen Einsatz buchen</a>}
     {t.deviceLabel&&<p className="hint">Gerät: {t.deviceLabel}</p>}
     {t.diagnostics&&<details className="diag"><summary>Messwerte zur Anfrage</summary><dl className="kv">{describeDiagnostics(t.diagnostics).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></details>}
     {!t.anonymized&&<form className="form composer" onSubmit={send}>
      <label className="field"><span className="sr-only">Nachricht</span><textarea rows={3} maxLength={4000} value={draft} onChange={e=>setDraft(e.target.value)} placeholder={t.status==='geloest'?'Problem wieder da? Schreiben Sie uns, die Anfrage wird wieder geöffnet.':'Ihre Nachricht an FUNKNAHT'}/></label>
      <div className="actions"><button className="btn btn--small" disabled={busy||!draft.trim()}><Send size={15}/>Senden</button><label className="mini-btn" style={{cursor:'pointer'}}><Paperclip size={15}/>Datei anhängen<input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={upload} disabled={busy}/></label>
       {t.status==='geloest'?<button type="button" className="mini-btn" disabled={busy} onClick={()=>setStatus('offen')}><RotateCcw size={15}/>Wieder öffnen</button>:<button type="button" className="mini-btn" disabled={busy} onClick={()=>setStatus('geloest')}><Check size={15}/>Hat sich erledigt</button>}</div>
     </form>}
    </>}
   </article>}
  </div>}
 </div>;
}
