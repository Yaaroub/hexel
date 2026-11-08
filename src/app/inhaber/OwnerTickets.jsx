'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Inbox,Eye,EyeOff,Send,Paperclip,FileText,Clock,Trash2,AlertTriangle,Search,ArrowLeft,StickyNote,Mail,Check} from 'lucide-react';
import {categories,getDiagnostic} from '../../lib/portal-knowledge';
import {describeDiagnostics} from '../../lib/diagnostics-client';

const stateLabel={offen:['wait','Neu'],'in-pruefung':['info','In Bearbeitung'],geloest:['ok','Erledigt']};
const prioLabel={normal:'Normal',hoch:'Hoch',dringend:'Dringend'};
const fmt=v=>new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));
const dur=m=>m>=60?Math.floor(m/60)+' h '+(m%60?m%60+' min':''):m+' min';
const title=t=>categories.find(c=>c.id===t.category)?.title||'Vorhaben';
const snippets=[
 ['Rückfrage','Danke für Ihre Nachricht. Damit ich das Problem eingrenzen kann: Seit wann tritt es auf, und hat sich vorher etwas geändert (neues Gerät, Update, Routertausch)? Ein Foto der Fehlermeldung oder der Router-Lämpchen hilft mir sehr.'],
 ['Termin vor Ort','Das schaue ich mir am besten vor Ort an. Passt Ihnen einer dieser Termine: … ? Die Anfahrt und den voraussichtlichen Aufwand nenne ich Ihnen vorab.'],
 ['Fernhilfe','Das können wir wahrscheinlich per Fernhilfe lösen. Ich melde mich telefonisch und führe Sie durch die Freigabe. Sie sehen dabei jederzeit, was ich tue, und können die Verbindung beenden.'],
 ['Erledigt','Das Problem ist behoben. Was ich geändert habe: … Falls es wieder auftritt, schreiben Sie einfach hier, die Anfrage öffnet sich dann automatisch wieder.'],
];

export default function OwnerTickets({tickets,setTickets,api,handle,mailReady,initialId}){
 const [filter,setFilter]=useState('mine'),[q,setQ]=useState(''),[ticket,setTicket]=useState(null),[busy,setBusy]=useState(false),[saved,setSaved]=useState(''),[error,setError]=useState('');
 const [draft,setDraft]=useState(''),[internal,setInternal]=useState(false),[notify,setNotify]=useState(true);
 const [mins,setMins]=useState(30),[note,setNote]=useState(''),[billable,setBillable]=useState(true),[day,setDay]=useState(()=>new Date().toISOString().slice(0,10));
 const end=useRef(null);
 useEffect(()=>{end.current?.scrollIntoView({block:'nearest'})},[ticket?.messages?.length]);
 useEffect(()=>{if(initialId)open(initialId)},[initialId]);// eslint-disable-line react-hooks/exhaustive-deps
 const shown=useMemo(()=>tickets.filter(t=>filter==='all'||(filter==='mine'?t.status!=='geloest'&&t.awaiting==='owner':filter==='open'?t.status!=='geloest':t.status==='geloest')).filter(t=>!q||(t.id+' '+t.summary+' '+title(t)).toLowerCase().includes(q.toLowerCase())),[tickets,filter,q]);
 const counts={mine:tickets.filter(t=>t.status!=='geloest'&&t.awaiting==='owner').length,open:tickets.filter(t=>t.status!=='geloest').length};

 function apply(t){setTicket(t);setTickets(l=>l.map(x=>x.id===t.id?{...x,status:t.status,priority:t.priority,awaiting:t.awaiting,lastActivityAt:t.lastActivityAt,minutes:(t.time||[]).reduce((s,e)=>s+e.minutes,0)}:x))}
 async function run(fn,ok){setBusy(true);setError('');setSaved('');try{const d=await fn();if(d?.ticket)apply(d.ticket);if(ok)setSaved(ok);return d}catch(e){if(!handle(e))setError(e.message)}finally{setBusy(false)}}
 async function open(id){setError('');setSaved('');setDraft('');setInternal(false);try{setTicket((await api('/api/owner/tickets?id='+id)).ticket)}catch(e){handle(e)}}
 const meta=patch=>run(()=>api('/api/owner/tickets',{method:'PATCH',body:JSON.stringify({id:ticket.id,...patch})}),'Gespeichert.');
 async function send(e){e.preventDefault();if(!draft.trim())return;const d=await run(()=>api('/api/owner/tickets/message',{method:'POST',body:JSON.stringify({id:ticket.id,body:draft,internal,notify:!internal&&notify})}),internal?'Interne Notiz gespeichert.':notify&&mailReady?'Antwort gesendet, der Kunde wird per E-Mail informiert.':'Antwort gespeichert, der Kunde sieht sie im Portal.');if(d)setDraft('')}
 async function upload(e){const file=e.target.files?.[0];e.target.value='';if(!file)return;const form=new FormData();form.append('file',file);form.append('id',ticket.id);form.append('internal',String(internal));await run(async()=>{const r=await fetch('/api/owner/tickets/attachments',{method:'POST',body:form});const d=await r.json();if(!r.ok)throw Object.assign(Error(d.error||'Hochladen fehlgeschlagen.'),{status:r.status,code:d.code});return d},'Datei angehängt.')}
 async function addTime(e){e.preventDefault();const d=await run(()=>api('/api/owner/time',{method:'POST',body:JSON.stringify({ticketId:ticket.id,minutes:Number(mins),note,billable,date:day})}),'Zeit erfasst.');if(d)setNote('')}
 const delTime=id=>run(()=>api('/api/owner/time',{method:'DELETE',body:JSON.stringify({ticketId:ticket.id,id})}),'Eintrag entfernt.');

 const t=ticket,total=(t?.time||[]).reduce((s,e)=>s+e.minutes,0);
 return <div className={'split'+(t?' has-detail':'')}>
  <section className="panel split__list">
   <div className="panel__head"><h2>Anfragen</h2></div>
   <div className="segmented" style={{marginBottom:12,flexWrap:'wrap'}}>{[['mine','Bei mir',counts.mine],['open','Offen',counts.open],['done','Erledigt'],['all','Alle']].map(([id,l,n])=><button key={id} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{l}{n?' ('+n+')':''}</button>)}</div>
   <label className="field" style={{marginBottom:8}}><span className="sr-only">Suchen</span><span style={{position:'relative'}}><Search size={16} style={{position:'absolute',left:12,top:16,color:'var(--ink-3)'}}/><input className="input" style={{paddingLeft:36}} value={q} onChange={e=>setQ(e.target.value)} placeholder="Nummer oder Stichwort"/></span></label>
   {shown.length===0?<div className="empty"><Inbox size={24}/><h3>{filter==='mine'?'Nichts wartet auf dich.':'Keine Anfragen in dieser Ansicht.'}</h3></div>:<div className="rows">{shown.map(x=><button className="row row--button" key={x.id} aria-pressed={t?.id===x.id} onClick={()=>open(x.id)}>
    <div><div className="row__title">{x.priority!=='normal'&&<span className={'prio prio--'+x.priority}><AlertTriangle size={13}/>{prioLabel[x.priority]} · </span>}{title(x)}</div><div className="row__meta">{x.id} · {fmt(x.lastActivityAt)} · {x.accountType==='business'?'Betrieb':'Privat'}{x.minutes?' · '+dur(x.minutes):''}</div><div className="row__note clamp-2">{x.anonymized?'Anonymisiert':x.summary}</div></div>
    <div style={{display:'grid',gap:6,justifyItems:'end'}}><span className={'badge badge--'+stateLabel[x.status][0]}>{stateLabel[x.status][1]}</span>{x.status!=='geloest'&&<span className="badge badge--muted">{x.awaiting==='owner'?'Wartet auf dich':'Wartet auf Kunde'}</span>}</div>
   </button>)}</div>}
  </section>

  {t?<article className="panel thread split__detail">
   <button className="link split__back" onClick={()=>setTicket(null)}><ArrowLeft size={16}/>Alle Anfragen</button>
   <div className="panel__head" style={{margin:0}}><div><h2>{title(t)}</h2><p>{t.id} · {fmt(t.createdAt)}{t.organizationName?' · '+t.organizationName:t.accountType==='private'?' · Privatkunde':''}</p></div>
    <div className="actions"><label className="sr-only" htmlFor="st">Stand</label><select id="st" className="input" style={{width:'auto',minHeight:38}} value={t.status} disabled={busy||t.anonymized} onChange={e=>meta({status:e.target.value})}>{Object.entries(stateLabel).map(([v,[,l]])=><option key={v} value={v}>{l}</option>)}</select><label className="sr-only" htmlFor="pr">Dringlichkeit</label><select id="pr" className="input" style={{width:'auto',minHeight:38}} value={t.priority} disabled={busy||t.anonymized} onChange={e=>meta({priority:e.target.value})}>{Object.entries(prioLabel).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
   </div>
   <div className="privacy-note"><Eye size={18}/><span>Das Öffnen dieser Anfrage wurde protokolliert. Interne Notizen und markierte Dateien sieht der Kunde nicht.</span></div>
   <dl className="kv"><div><dt>Name</dt><dd>{t.name||'–'}</dd></div><div><dt>E-Mail</dt><dd>{t.email?<a className="link" href={'mailto:'+t.email+'?subject='+encodeURIComponent('Ihre Anfrage '+t.id)}><Mail size={14}/>{t.email}</a>:'–'}</dd></div><div><dt>Ort</dt><dd>{t.location||'–'}</dd></div><div><dt>Gerät</dt><dd>{t.device||'–'}</dd></div></dl>
   {t.diagnostics&&<details className="diag" open><summary>Messwerte vom Gerät des Kunden</summary><dl className="kv">{describeDiagnostics(t.diagnostics).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>{t.diagnostics.serverLatencyMs>300&&<p className="hint" style={{marginTop:8}}>Hohe Antwortzeit: Verbindung oder WLAN des Kunden wahrscheinlich schwach.</p>}</details>}
   <div className="chat-log">
    <div className="msg msg--customer"><span className="msg__who">Anfrage · {fmt(t.createdAt)}</span><p>{t.description}</p>{t.attempts?.length>0&&<p className="msg__meta">Bereits geprüft: {t.attempts.map(a=>getDiagnostic(t.category)?.steps.find(s=>s.id===a.stepId)?.title||a.stepId).join(', ')}</p>}</div>
    {(t.messages||[]).map(m=><div key={m.id} className={'msg msg--'+(m.internal?'internal':m.author)}><span className="msg__who">{m.internal?'Interne Notiz':m.author==='owner'?'Du':'Kunde'} · {fmt(m.createdAt)}</span><p>{m.body}</p></div>)}
    <span ref={end}/>
   </div>
   {t.attachments?.length>0&&<div className="files">{t.attachments.map(f=><a key={f.id} className={'file'+(f.internal?' is-internal':'')} href={'/api/attachments/'+f.id} target="_blank" rel="noreferrer">{f.mime.startsWith('image/')?<img src={'/api/attachments/'+f.id} alt="" loading="lazy"/>:<span className="file__icon"><FileText size={20}/></span>}<span><strong>{f.filename}</strong><small>{f.author==='owner'?'Von dir':'Vom Kunden'}{f.internal?' · intern':''}</small></span></a>)}</div>}
   {t.anonymized?<p className="notice"><EyeOff size={18}/>Diese Anfrage wurde nach Ablauf der Frist anonymisiert.</p>:<form className="form composer" onSubmit={send}>
    <div className="actions" style={{gap:8}}>{snippets.map(([l,text])=><button type="button" key={l} className="mini-btn" onClick={()=>setDraft(d=>d?d+'\n\n'+text:text)}>{l}</button>)}</div>
    <label className="field"><span className="sr-only">Nachricht</span><textarea rows={4} maxLength={4000} value={draft} onChange={e=>setDraft(e.target.value)} placeholder={internal?'Nur für dich: Beobachtungen, Zugangswege, To-dos':'Antwort an den Kunden'} style={internal?{background:'var(--warn-soft)'}:undefined}/></label>
    <div className="actions" style={{gap:'10px 20px'}}>
     <label className="check toggle-note"><input type="checkbox" checked={internal} onChange={e=>setInternal(e.target.checked)}/><span><StickyNote size={14} style={{display:'inline',verticalAlign:-2}}/> Interne Notiz</span></label>
     {!internal&&<label className="check toggle-note"><input type="checkbox" checked={notify} onChange={e=>setNotify(e.target.checked)}/><span>Per E-Mail benachrichtigen{!mailReady?' (Versand nicht eingerichtet)':''}</span></label>}
    </div>
    <div className="actions"><button className="btn btn--small" disabled={busy||!draft.trim()}><Send size={15}/>{internal?'Notiz speichern':'Antwort senden'}</button><label className="mini-btn" style={{cursor:'pointer'}}><Paperclip size={15}/>{internal?'Interne Datei':'Datei an Kunden'}<input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={upload} disabled={busy}/></label></div>
    {saved&&<p className="notice notice--ok" role="status"><Check size={18}/>{saved}</p>}
    {error&&<p className="notice notice--error" role="alert"><AlertTriangle size={18}/>{error}</p>}
   </form>}

   <section style={{borderTop:'1px solid var(--line)',paddingTop:16,display:'grid',gap:12}}>
    <div className="time-total"><h3 className="h3" style={{fontSize:'1.05rem'}}><Clock size={16} style={{display:'inline',verticalAlign:-2}}/> Arbeitszeit</h3><b>{dur(total)}</b></div>
    {(t.time||[]).length>0&&<div className="rows">{t.time.map(e=><div className="row" key={e.id}><div><div className="row__title">{dur(e.minutes)}{!e.billable&&<span className="hint"> · nicht abrechenbar</span>}</div><div className="row__meta">{new Date(e.date+'T12:00:00').toLocaleDateString('de-DE')}{e.note?' · '+e.note:''}</div></div><button className="mini-btn mini-btn--danger" aria-label="Eintrag entfernen" disabled={busy} onClick={()=>delTime(e.id)}><Trash2 size={14}/></button></div>)}</div>}
    {!t.anonymized&&<form className="form" onSubmit={addTime} style={{gap:10}}>
     <div className="actions" style={{gap:8}}>{[15,30,45,60,90].map(m=><button type="button" key={m} className="mini-btn" aria-pressed={Number(mins)===m} style={Number(mins)===m?{borderColor:'var(--fjord)',color:'var(--fjord)'}:undefined} onClick={()=>setMins(m)}>{dur(m)}</button>)}<input className="input" type="number" min={1} max={1440} value={mins} onChange={e=>setMins(e.target.value)} style={{width:90,minHeight:36}} aria-label="Minuten"/></div>
     <div className="form-grid"><input className="input" value={note} onChange={e=>setNote(e.target.value)} maxLength={300} placeholder="Was wurde gemacht? (optional)" aria-label="Notiz"/><input className="input" type="date" value={day} onChange={e=>setDay(e.target.value)} aria-label="Datum"/></div>
     <div className="actions"><label className="check toggle-note"><input type="checkbox" checked={billable} onChange={e=>setBillable(e.target.checked)}/><span>Abrechenbar</span></label><button className="mini-btn" disabled={busy}><Clock size={14}/>Zeit erfassen</button></div>
    </form>}
   </section>
  </article>:<div className="empty split__detail"><Inbox size={26}/><h3>Wähle eine Anfrage.</h3><p>Kontaktdaten sind in der Liste verborgen und erscheinen erst beim Öffnen. Das Öffnen wird protokolliert.</p></div>}
 </div>;
}
