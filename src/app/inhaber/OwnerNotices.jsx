'use client';
import {useEffect,useState} from 'react';
import {Megaphone,AlertCircle,Plus,X} from 'lucide-react';
const when=v=>new Intl.DateTimeFormat('de-DE',{dateStyle:'short',timeStyle:'short'}).format(new Date(v));
export default function OwnerNotices({api,handle}){
 const [list,setList]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{api('/api/owner/notices').then(d=>setList(d.notices)).catch(handle)},[api,handle]);
 async function add(e){e.preventDefault();const form=e.currentTarget,f=Object.fromEntries(new FormData(form));setBusy(true);setError('');try{setList((await api('/api/owner/notices',{method:'POST',body:JSON.stringify(f)})).notices);form.reset()}catch(err){if(!handle(err))setError(err.message)}finally{setBusy(false)}}
 async function end(id){try{setList((await api('/api/owner/notices',{method:'DELETE',body:JSON.stringify({id})})).notices)}catch(err){if(!handle(err))setError(err.message)}}
 const now=Date.now(),active=n=>!n.endsAt||n.endsAt>now;
 return <section className="panel">
  <div className="panel__head"><div><h2>Bekannte Störungen</h2><p>Ein kurzer Hinweis oben im Hilfe-Portal, z. B. bei einem Ausfall beim Anbieter. Das spart Ihnen viele gleiche Anrufe.</p></div></div>
  <form className="form panel panel--quiet" onSubmit={add} style={{marginBottom:16}}><fieldset disabled={busy}>
   <div className="form-grid"><label className="field">Überschrift<input name="title" required maxLength={140} placeholder="z. B. Telekom-Störung im Raum Kassel"/></label><label className="field"><span>Gebiet <span className="field__opt">(optional)</span></span><input name="area" maxLength={120} placeholder="z. B. PLZ 34…"/></label></div>
   <label className="field"><span>Text <span className="field__opt">(optional)</span></span><textarea name="body" rows={2} maxLength={800} placeholder="Was Kunden wissen sollten und ob sie selbst etwas tun können."/></label>
   <div className="form-grid"><label className="field">Art<select name="level" defaultValue="warn"><option value="warn">Störung (auffällig)</option><option value="info">Hinweis (dezent)</option></select></label><label className="field">Automatisch ausblenden nach<select name="hours" defaultValue="12"><option value="4">4 Stunden</option><option value="12">12 Stunden</option><option value="24">1 Tag</option><option value="72">3 Tagen</option><option value="0">nie, ich beende selbst</option></select></label></div>
   {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
   <div className="actions"><button className="btn btn--small"><Plus size={15}/>Hinweis veröffentlichen</button></div>
  </fieldset></form>
  {!list?<p className="muted">Wird geladen …</p>:list.length===0?<div className="empty"><Megaphone size={24}/><h3>Keine Hinweise.</h3></div>:<div className="rows">{list.map(n=><div className="row" key={n.id}><div><div className="row__title">{n.title} {active(n)?<span className={'badge badge--'+(n.level==='warn'?'wait':'info')}>Sichtbar</span>:<span className="badge badge--muted">Beendet</span>}</div><div className="row__meta">{n.area?n.area+' · ':''}seit {when(n.startsAt)}{n.endsAt?(active(n)?' · bis ':' · beendet ')+when(n.endsAt):''}</div>{n.body&&<div className="row__note">{n.body}</div>}</div>{active(n)&&<button className="mini-btn" onClick={()=>end(n.id)}><X size={14}/>Beenden</button>}</div>)}</div>}
 </section>;
}
