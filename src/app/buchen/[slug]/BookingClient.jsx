'use client';
import {useEffect,useState} from 'react';
import {ArrowRight,ChevronLeft,ChevronRight,Clock3,Check,AlertCircle,CalendarDays} from 'lucide-react';
const today=()=>{const n=new Date();return new Date(n.getTime()-n.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const time=v=>new Intl.DateTimeFormat('de-DE',{timeStyle:'short',timeZone:'Europe/Berlin'}).format(new Date(v));
const longDate=v=>new Intl.DateTimeFormat('de-DE',{dateStyle:'full',timeZone:'Europe/Berlin'}).format(new Date(v));
const dayLabel=d=>new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
const money=v=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(v/100);

export default function BookingClient({slug}){
 const [refNote,setRefNote]=useState('');
 useEffect(()=>{const a=new URLSearchParams(location.search).get('anfrage')||'';if(/^FN-[A-F0-9]{8}$/.test(a))setRefNote('Zu Anfrage '+a)},[]);
 const [data,setData]=useState(null),[serviceId,setServiceId]=useState(''),[day,setDay]=useState(today),[slot,setSlot]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState(null),[rev,setRev]=useState(0);
 useEffect(()=>{let live=true;const c=new AbortController();setLoading(true);setError('');setSlot('');
  fetch('/api/business/booking?'+new URLSearchParams({slug,date:day,...(serviceId?{serviceId}:{})}),{signal:c.signal,cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||'Diese Buchungsseite ist gerade nicht erreichbar.');if(!live)return;setData(d);if(!serviceId&&d.services?.length)setServiceId(d.services.find(s=>s.active!==false)?.id||'')}).catch(e=>{if(live&&e.name!=='AbortError')setError(e.message)}).finally(()=>{if(live)setLoading(false)});
  return()=>{live=false;c.abort()}},[slug,day,serviceId,rev]);
 const services=data?.services?.filter(s=>s.active!==false)||[],service=services.find(s=>s.id===serviceId);
 const shift=n=>setDay(d=>{const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)});
 async function submit(e){e.preventDefault();if(busy||!slot)return;setBusy(true);setError('');const f=Object.fromEntries(new FormData(e.currentTarget));
  try{const r=await fetch('/api/business/booking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug,serviceId,startsAt:slot,name:f.name,email:f.email,phone:f.phone,notes:f.notes})});const d=await r.json();if(!r.ok)throw Error(d.error||'Diese Zeit ist leider nicht mehr frei. Bitte wählen Sie eine andere.');setDone({name:f.name,startsAt:slot,service:service?.name})}
  catch(err){setError(err.message);setRev(v=>v+1)}finally{setBusy(false)}}
 const name=data?.organization?.name;
 return <div className="booking">
  <header className="booking__head"><p className="intro" style={{margin:0}}>Online-Terminbuchung</p><h1>{done?'Ihre Anfrage ist eingegangen.':name?`Termin bei ${name}`:'Termin anfragen'}</h1>{!done&&<p className="lead" style={{fontSize:'1.08rem'}}>Wählen Sie eine Leistung und eine freie Zeit. {name||'Der Betrieb'} bestätigt Ihren Termin anschließend.</p>}</header>
  {done?<div className="panel" style={{display:'grid',gap:16,justifyItems:'start',maxWidth:620}}><span className="success-mark"><Check size={28}/></span><h2 className="h3">Danke, {done.name}.</h2><dl className="summary" style={{width:'100%'}}><dt>Leistung</dt><dd>{done.service}</dd><dt>Wunschtermin</dt><dd>{longDate(done.startsAt)}, {time(done.startsAt)} Uhr</dd></dl><p className="prose">Der Termin ist angefragt, aber noch nicht bestätigt. Sie erhalten eine Eingangsbestätigung per E-Mail, und {name} meldet sich bei Ihnen.</p><button className="link" onClick={()=>{setDone(null);setDay(today());setRev(v=>v+1)}}>Weiteren Termin anfragen<ArrowRight size={16}/></button></div>:
  !data&&!loading?<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error||'Diese Buchungsseite ist nicht verfügbar.'}</p>:
  <div className="booking__grid">
   <section className="panel form" aria-labelledby="pick">
    <h2 id="pick" className="h3">Leistung und Zeit</h2>
    {services.length===0&&!loading?<p className="notice"><AlertCircle size={18}/>Derzeit werden keine Termine online angeboten.</p>:<>
     <label className="field">Leistung<select value={serviceId} onChange={e=>setServiceId(e.target.value)} disabled={busy}>{services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
     {service&&<div className="share" style={{background:'var(--stone)'}}><Clock3 size={17}/><span>{service.durationMinutes} Minuten · {service.priceCents?money(service.priceCents):'Preis nach Absprache'}</span>{service.description&&<span className="hint" style={{flexBasis:'100%'}}>{service.description}</span>}</div>}
     <div className="day-nav"><button type="button" className="icon-btn" style={{color:'var(--ink)',borderColor:'var(--line)'}} disabled={busy||day<=today()} onClick={()=>shift(-1)} aria-label="Vorheriger Tag"><ChevronLeft size={18}/></button><label className="field" style={{flex:1}}><span className="sr-only">Datum</span><input type="date" min={today()} value={day} onChange={e=>e.target.value&&setDay(e.target.value)} disabled={busy}/></label><button type="button" className="icon-btn" style={{color:'var(--ink)',borderColor:'var(--line)'}} disabled={busy} onClick={()=>shift(1)} aria-label="Nächster Tag"><ChevronRight size={18}/></button></div>
     <fieldset disabled={busy||loading} style={{border:0,padding:0,margin:0}}><legend className="field" style={{marginBottom:10}}>Freie Zeiten am {dayLabel(day)}</legend>
      {loading?<p className="muted" role="status">Zeiten werden geladen …</p>:data?.slots?.length?<div className="slots">{data.slots.map(s=><label className="slot" key={s.startsAt}><input type="radio" name="slot" checked={slot===s.startsAt} onChange={()=>setSlot(s.startsAt)}/><span>{time(s.startsAt)}</span></label>)}</div>:<p className="empty" style={{padding:18}}><CalendarDays size={22}/>An diesem Tag ist nichts mehr frei. Versuchen Sie einen der nächsten Tage.</p>}
     </fieldset>
    </>}
   </section>
   <form className="panel form" onSubmit={submit} aria-labelledby="you">
    <h2 id="you" className="h3">Ihre Angaben</h2>
    <fieldset disabled={!slot||busy||loading}>
     {slot?<div className="share"><CalendarDays size={17}/><span><strong>{service?.name}</strong><br/>{longDate(slot)}, {time(slot)} Uhr</span></div>:<p className="hint">Wählen Sie zuerst eine freie Zeit.</p>}
     <label className="field">Name<input name="name" autoComplete="name" required maxLength={150}/></label>
     <label className="field">E-Mail<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
     <label className="field"><span>Telefon <span className="field__opt">(optional)</span></span><input name="phone" type="tel" autoComplete="tel" maxLength={80}/></label>
     <label className="field"><span>Hinweis an den Betrieb <span className="field__opt">(optional)</span></span><textarea name="notes" rows={3} maxLength={2000} defaultValue={refNote} key={refNote} placeholder="z. B. Anfahrt, Zugang, worum es geht"/></label>
     {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
     <p className="hint">Ihre Angaben gehen an {name||'den Betrieb'} und werden nur für diesen Termin verwendet.</p>
     <button className="btn" style={{width:'100%'}}>{busy?'Wird gesendet …':'Termin anfragen'}<ArrowRight size={17}/></button>
    </fieldset>
   </form>
  </div>}
  <footer className="booking__foot"><span>{name?`Terminbuchung für ${name}`:''}</span><a href="/" target="_blank" rel="noreferrer"><img src="/funknaht-mark.png" alt="" width="18" height="18"/>Bereitgestellt mit FUNKNAHT</a></footer>
 </div>;
}
