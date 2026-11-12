'use client';
import {useCallback,useEffect,useState} from 'react';
import {Plus,Check,RotateCcw,Trash2,AlertCircle,ListChecks,Sparkles,CalendarClock} from 'lucide-react';

const day=v=>v?new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'short'}).format(new Date(v+'T12:00:00')):'';
const filters=[['ich','Meine'],['alle','Alle offenen'],['frei','Nicht zugewiesen'],['erledigt','Erledigt']];

export default function OwnerTasks({api,handle,admin,onTicket}){
 const [who,setWho]=useState('ich'),[data,setData]=useState(null),[adding,setAdding]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=useCallback(()=>{const q=who==='erledigt'?'status=erledigt&who=alle':'status=offen&who='+who;api('/api/owner/tasks?'+q).then(setData).catch(e=>handle(e)||setError(e.message))},[api,handle,who]);
 useEffect(()=>{load()},[load]);
 async function add(e){e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));setBusy(true);setError('');
  try{await api('/api/owner/tasks',{method:'POST',body:JSON.stringify({title:f.title,notes:f.notes,assigneeUserId:f.assignee||null,dueOn:f.due||null})});setAdding(false);load()}catch(err){if(!handle(err))setError(err.message)}finally{setBusy(false)}}
 async function toggle(t){try{await api('/api/owner/tasks',{method:'PATCH',body:JSON.stringify({id:t.id,status:t.status==='offen'?'erledigt':'offen'})});load()}catch(err){if(!handle(err))setError(err.message)}}
 async function remove(t){if(!confirm('Aufgabe „'+t.title+'“ löschen?'))return;try{await api('/api/owner/tasks',{method:'DELETE',body:JSON.stringify({id:t.id})});load()}catch(err){if(!handle(err))setError(err.message)}}
 const tasks=data?.tasks||[];
 return <section className="panel">
  <div className="panel__head"><div><h2>Aufgaben</h2><p>Was zu tun ist, wer es macht und bis wann. Die KI kann Aufgaben vorschlagen, angelegt werden sie erst nach deiner Bestätigung.</p></div>
   <button className="btn btn--small" onClick={()=>setAdding(!adding)}><Plus size={16}/>Neue Aufgabe</button></div>
  {adding&&<form className="form panel panel--quiet" onSubmit={add} style={{marginBottom:18}}><fieldset disabled={busy}>
   <label className="field">Was ist zu tun?<input name="title" required maxLength={200} autoFocus/></label>
   <div className="form-grid">
    <label className="field">Zuständig<select name="assignee" defaultValue={data?.me||''}><option value="">Noch niemand</option>{(data?.people||[]).map(p=><option key={p.userId} value={p.userId}>{p.name}</option>)}</select></label>
    <label className="field">Fällig am <span className="field__opt">optional</span><input name="due" type="date"/></label>
   </div>
   <label className="field">Notiz <span className="field__opt">optional</span><textarea name="notes" rows={2} maxLength={2000}/></label>
   <div className="actions"><button className="btn btn--small"><Check size={16}/>Anlegen</button><button type="button" className="link" onClick={()=>setAdding(false)}>Abbrechen</button></div>
  </fieldset></form>}
  <div className="segmented" role="group" aria-label="Filter" style={{marginBottom:14}}>{filters.map(([v,l])=><button key={v} aria-pressed={who===v} onClick={()=>setWho(v)}>{l}</button>)}</div>
  {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
  {!data?<p className="muted">Wird geladen …</p>:tasks.length===0?<div className="empty"><ListChecks size={24}/><h3>{who==='erledigt'?'Noch nichts erledigt.':'Keine offenen Aufgaben.'}</h3><p>{who==='ich'?'Dir ist gerade nichts zugewiesen.':'Neue Aufgaben legst du oben an oder lässt sie von FUNKNAHT AI vorschlagen.'}</p></div>
  :<ul className="tasks">{tasks.map(t=><li key={t.id} className={'task'+(t.status==='erledigt'?' task--done':'')+(t.overdue?' task--late':'')}>
    <button className="task__check" onClick={()=>toggle(t)} aria-label={t.status==='offen'?'Als erledigt markieren':'Wieder öffnen'}>{t.status==='offen'?<span className="task__box"/>:<Check size={16}/>}</button>
    <div className="task__body">
     <p className="task__title">{t.title}{t.source==='ki'&&<span className="badge badge--info" title="Von FUNKNAHT AI vorgeschlagen"><Sparkles size={11}/>KI</span>}</p>
     {t.notes&&<p className="task__notes">{t.notes}</p>}
     <p className="task__meta">
      <span>{t.assignee||'Nicht zugewiesen'}</span>
      {t.dueOn&&<span className={t.overdue?'task__due task__due--late':'task__due'}><CalendarClock size={13}/>{t.overdue?'Überfällig seit ':'bis '}{day(t.dueOn)}</span>}
      {t.customer&&<span>{t.customer}</span>}
      {t.ticketId&&<button className="link" onClick={()=>onTicket?.(t.ticketId)}>{t.ticketId}</button>}
      {t.status==='erledigt'&&<span>erledigt von {t.doneBy}</span>}
     </p>
    </div>
    <div className="task__tools">{t.status==='erledigt'&&<button className="mini-btn" onClick={()=>toggle(t)}><RotateCcw size={14}/>Öffnen</button>}<button className="mini-btn" onClick={()=>remove(t)} aria-label="Löschen" title={admin?undefined:"Nur eigene Aufgaben"}><Trash2 size={14}/></button></div>
   </li>)}</ul>}
 </section>;
}
