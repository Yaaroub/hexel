'use client';
import {useEffect,useState} from 'react';
import {Activity,RefreshCw,AlertCircle,Globe,Router} from 'lucide-react';
const when=v=>v?new Intl.DateTimeFormat('de-DE',{dateStyle:'short',timeStyle:'short'}).format(new Date(v)):'noch nie';
const day=v=>v?new Intl.DateTimeFormat('de-DE',{dateStyle:'medium'}).format(new Date(v)):'';
const tone={ok:'ok',warnung:'wait','gestört':'error',unbekannt:'muted'};
const label={ok:'In Ordnung',warnung:'Warnung','gestört':'Gestört',unbekannt:'Noch nicht geprüft'};
export default function OwnerMonitors({api,handle,onCustomer}){
 const [data,setData]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{api('/api/owner/monitors').then(setData).catch(handle)},[api,handle]);
 async function check(){setBusy(true);setError('');try{const d=await api('/api/owner/monitors',{method:'POST',body:JSON.stringify({action:'check'})});setData(x=>({...x,monitors:d.monitors}))}catch(e){if(!handle(e))setError(e.message)}finally{setBusy(false)}}
 return <section className="panel">
  <div className="panel__head"><div><h2>Überwachung</h2><p>Websites, SSL-Zertifikate und Internetleitungen Ihrer Kunden. Fällt etwas zweimal hintereinander aus, entsteht automatisch eine dringende Anfrage und Sie bekommen eine E-Mail.</p></div><button className="mini-btn" onClick={check} disabled={busy}><RefreshCw size={15}/>{busy?'Wird geprüft …':'Jetzt prüfen'}</button></div>
  {data&&!data.cronConfigured&&<p className="notice"><AlertCircle size={18}/>Die automatische Prüfung ist noch nicht eingerichtet. Setzen Sie CRON_SECRET auf dem Server und richten Sie den Zeitplan ein (siehe deploy/ANLEITUNG.md). Bis dahin prüft nur der Knopf „Jetzt prüfen“.</p>}
  {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
  {!data?<p className="muted">Wird geladen …</p>:data.monitors.length===0?<div className="empty"><Activity size={24}/><h3>Noch nichts überwacht.</h3><p>Öffnen Sie unter „Kunden“ eine Kundenakte und fügen Sie eine Website oder ein Lebenszeichen vom Router hinzu.</p></div>:
  <div className="rows">{data.monitors.map(m=><button className="row row--button" key={m.id} onClick={()=>onCustomer(m.organizationId)}><div><div className="row__title">{m.kind==='website'?<Globe size={15} style={{verticalAlign:'-2px'}}/>:<Router size={15} style={{verticalAlign:'-2px'}}/>} {m.label} <span className="hint">· {m.organization}</span></div><div className="row__meta">{m.kind==='website'?m.url:'Lebenszeichen alle '+m.intervalMinutes+' Min.'} · zuletzt {m.kind==='website'?'geprüft '+when(m.lastCheckedAt):'gemeldet '+when(m.lastOkAt)}{m.sslExpiresAt?' · SSL bis '+day(m.sslExpiresAt):''}</div>{m.lastError&&<div className="row__note" style={{color:'var(--err)'}}>{m.lastError}</div>}</div><span className={'badge badge--'+tone[m.state]}>{label[m.state]||m.state}</span></button>)}</div>}
 </section>;
}
