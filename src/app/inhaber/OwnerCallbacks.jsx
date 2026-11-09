'use client';
import {useEffect,useState} from 'react';
import {Phone,Check,PhoneCall,AlertCircle,Clock,RotateCcw} from 'lucide-react';
import {categories} from '../../lib/portal-knowledge';
const fmt=v=>new Intl.DateTimeFormat('de-DE',{dateStyle:'short',timeStyle:'short'}).format(new Date(v));
// Rückruf-Wünsche abarbeiten und Telefonate in Sekunden als Anfrage erfassen.
export default function OwnerCallbacks({api,handle,onTicket}){
 const [list,setList]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[from,setFrom]=useState(null),[done,setDone]=useState('');
 useEffect(()=>{api('/api/owner/callbacks').then(d=>setList(d.callbacks)).catch(handle)},[api,handle]);
 async function status(id,s){try{setList((await api('/api/owner/callbacks',{method:'PATCH',body:JSON.stringify({id,status:s})})).callbacks)}catch(e){if(!handle(e))setError(e.message)}}
 async function capture(e){e.preventDefault();setBusy(true);setError('');setDone('');const f=Object.fromEntries(new FormData(e.currentTarget));try{const d=await api('/api/owner/phone',{method:'POST',body:JSON.stringify({...f,minutes:f.minutes?Number(f.minutes):0,callbackId:from?.id})});setDone(d.id);setFrom(null);e.currentTarget.reset();setList((await api('/api/owner/callbacks')).callbacks)}catch(err){if(!handle(err))setError(err.message)}finally{setBusy(false)}}
 const open=(list||[]).filter(c=>c.status==='neu'),closed=(list||[]).filter(c=>c.status!=='neu');
 return <div className="split" style={{gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)'}}>
  <section className="panel"><div className="panel__head"><div><h2>Rückruf-Wünsche</h2><p>Erledigte werden nach 90 Tagen automatisch gelöscht.</p></div></div>
   {!list?<p className="muted">Wird geladen …</p>:!open.length?<div className="empty"><Phone size={24}/><h3>Niemand wartet auf einen Rückruf.</h3></div>:<div className="rows">{open.map(c=><div className="row" key={c.id}><div><div className="row__title">{c.name}</div><div className="row__meta">{c.topic} · {c.timeWindow} · {fmt(c.createdAt)}</div>{c.note&&<div className="row__note">{c.note}</div>}</div><div className="row__actions"><a className="btn btn--small" href={'tel:'+c.phone.replace(/[^\d+]/g,'')}><PhoneCall size={15}/>{c.phone}</a><button className="mini-btn" onClick={()=>{setFrom(c);setDone('');document.getElementById('capture')?.scrollIntoView({behavior:'smooth'})}}>Als Anfrage anlegen</button><button className="mini-btn" onClick={()=>status(c.id,'erledigt')}><Check size={14}/>Erledigt</button></div></div>)}</div>}
   {closed.length>0&&<details style={{marginTop:16}}><summary className="hint" style={{cursor:'pointer'}}>Erledigt ({closed.length})</summary><div className="rows" style={{marginTop:8}}>{closed.map(c=><div className="row" key={c.id}><div><div className="row__title">{c.name}</div><div className="row__meta">{c.topic} · {fmt(c.createdAt)}{c.ticketId?' · '+c.ticketId:''}</div></div><button className="mini-btn" onClick={()=>status(c.id,'neu')}><RotateCcw size={14}/>Wieder öffnen</button></div>)}</div></details>}
  </section>
  <section className="panel" id="capture"><div className="panel__head"><div><h2>Anruf erfassen</h2><p>{from?'Aus dem Rückruf von '+from.name+'.':'Während oder nach einem Telefonat ausfüllen.'}</p></div></div>
   <form className="form" onSubmit={capture} key={from?.id||'new'}><fieldset disabled={busy}>
    <div className="form-grid"><label className="field">Name<input name="name" required maxLength={120} defaultValue={from?.name||''}/></label><label className="field">Telefon<input name="phone" type="tel" maxLength={40} defaultValue={from?.phone||''}/></label></div>
    <div className="form-grid"><label className="field"><span>E-Mail <span className="field__opt">(optional)</span></span><input name="email" type="email" maxLength={254}/></label><label className="field"><span>Ort <span className="field__opt">(optional)</span></span><input name="location" maxLength={150}/></label></div>
    <label className="field">Worum geht es?<textarea name="description" required rows={4} maxLength={4000} defaultValue={from?.note||''}/></label>
    <div className="form-grid"><label className="field">Bereich<select name="category" defaultValue={from?.topic==='Ist das Betrug?'?'betrug':'computer-software'}>{categories.filter(c=>c.id!=='projekt').map(c=><option key={c.id} value={c.id}>{c.title}</option>)}<option value="projekt">Neues Vorhaben</option></select></label><label className="field">Dringlichkeit<select name="priority" defaultValue="normal"><option value="normal">Normal</option><option value="hoch">Hoch</option><option value="dringend">Dringend</option></select></label></div>
    <label className="field"><span><Clock size={14} style={{display:'inline',verticalAlign:-2}}/> Dauer des Telefonats in Minuten <span className="field__opt">(wird als Arbeitszeit erfasst)</span></span><input name="minutes" type="number" min={0} max={600} placeholder="z. B. 10"/></label>
    {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
    {done&&<p className="notice notice--ok" role="status"><Check size={18}/><span>Anfrage {done} angelegt. <button type="button" className="link" onClick={()=>onTicket(done)}>Öffnen</button></span></p>}
    <div className="actions"><button className="btn btn--small"><Check size={15}/>Anfrage anlegen</button>{from&&<button type="button" className="link" onClick={()=>setFrom(null)}>Ohne Rückruf-Bezug</button>}</div>
   </fieldset></form>
  </section>
 </div>;
}
