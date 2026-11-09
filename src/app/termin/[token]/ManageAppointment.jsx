'use client';
import {useEffect,useState} from 'react';
import {CalendarDays,Clock3,X,Check,AlertCircle,ArrowRight} from 'lucide-react';
const fmt=v=>new Intl.DateTimeFormat('de-DE',{dateStyle:'full',timeStyle:'short',timeZone:'Europe/Berlin'}).format(new Date(v));
const label={pending:['wait','Angefragt'],confirmed:['ok','Bestätigt'],cancelled:['muted','Abgesagt'],completed:['info','Erledigt']};
// Endkunden verwalten ihren Termin über den Link aus der Bestätigungs- oder Erinnerungs-E-Mail.
export default function ManageAppointment({token}){
 const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[confirm,setConfirm]=useState(false);
 useEffect(()=>{fetch('/api/termin/'+token,{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setData(d)}).catch(e=>setError(e.message||'Dieser Link ist ungültig.'))},[token]);
 async function cancel(){setBusy(true);setError('');try{const r=await fetch('/api/termin/'+token,{method:'POST'});const d=await r.json();if(!r.ok)throw Error(d.error);setData(d);setConfirm(false)}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <div className="booking" style={{maxWidth:640}}>
  <header className="booking__head"><p className="intro" style={{margin:0}}>Ihr Termin</p><h1>{data?data.organization:'Termin'}</h1></header>
  {error&&!data?<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>:!data?<p className="muted">Wird geladen …</p>:<div className="panel" style={{display:'grid',gap:18}}>
   <div className="panel__head" style={{margin:0}}><h2>{data.service}</h2><span className={'badge badge--'+label[data.status][0]}>{label[data.status][1]}</span></div>
   <dl className="summary"><dt>Wann</dt><dd><CalendarDays size={15} style={{display:'inline',verticalAlign:-2}}/> {fmt(data.startsAt)} Uhr</dd><dt>Dauer</dt><dd><Clock3 size={15} style={{display:'inline',verticalAlign:-2}}/> {data.durationMinutes} Minuten</dd><dt>Für</dt><dd>{data.customerName}</dd></dl>
   {data.status==='cancelled'&&<p className="notice"><Check size={18}/>Der Termin ist abgesagt. {data.organization} wurde informiert.</p>}
   {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
   {data.canCancel&&(confirm?<div className="notice notice--warn" style={{display:'grid',gap:12}}><span>Möchten Sie den Termin wirklich absagen?</span><div className="actions"><button className="btn btn--small" style={{background:'var(--err)'}} disabled={busy} onClick={cancel}><X size={16}/>Ja, absagen</button><button className="link" onClick={()=>setConfirm(false)}>Nein, Termin behalten</button></div></div>:<div className="actions"><button className="btn btn--ghost" style={{color:'var(--ink)'}} onClick={()=>setConfirm(true)}><X size={17}/>Termin absagen</button><a className="link" href={'/buchen/'+data.slug}>Anderen Termin wählen<ArrowRight size={16}/></a></div>)}
   {data.status==='cancelled'&&<a className="btn" href={'/buchen/'+data.slug}>Neuen Termin buchen<ArrowRight size={17}/></a>}
  </div>}
 </div>;
}
