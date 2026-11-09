'use client';
import {useEffect,useState} from 'react';
import {Building2,ArrowLeft,HardDrive,Activity,FileText,Inbox,Plus,Trash2,Printer,Pencil,Copy,Check,AlertCircle,Eye} from 'lucide-react';
const planName={free:'Kostenlos',basic:'Basis',betrieb:'Betrieb',individuell:'Individuell'};
const day=v=>v?new Intl.DateTimeFormat('de-DE',{dateStyle:'medium'}).format(new Date(typeof v==='string'&&v.length===10?v+'T12:00:00':v)):'–';
const euro=c=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format((c||0)/100);
const stateTone={ok:'ok',warnung:'wait','gestört':'error',unbekannt:'muted'};
const emptyDevice={kind:'router',label:'',vendor:'',model:'',location:'',serial:'',firmware:'',installedOn:'',warrantyUntil:'',notes:''};

// Konten und Kundenakte. Betriebsdaten der Kunden (deren Kunden, Termine, Aufträge) bleiben verborgen.
export default function OwnerCustomers({api,handle,onTicket,onNewDocument,initialOrg=null}){
 const [accounts,setAccounts]=useState(null),[org,setOrg]=useState(null),[file,setFile]=useState(null),[device,setDevice]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[copied,setCopied]=useState('');
 useEffect(()=>{api('/api/owner/accounts').then(d=>setAccounts(d.accounts)).catch(handle)},[api,handle]);
 useEffect(()=>{if(initialOrg)openFile(initialOrg)},[initialOrg]);// eslint-disable-line react-hooks/exhaustive-deps
 async function openFile(id){setOrg(id);setFile(null);setDevice(null);setError('');try{setFile(await api('/api/owner/customer?org='+id))}catch(e){handle(e)}}
 async function call(fn){setBusy(true);setError('');try{await fn();setFile(await api('/api/owner/customer?org='+org))}catch(e){if(!handle(e))setError(e.message)}finally{setBusy(false)}}
 const saveDevice=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));call(async()=>{await api('/api/owner/devices',{method:'POST',body:JSON.stringify({...f,id:device.id,organizationId:org})});setDevice(null)})};
 const delDevice=id=>{if(confirm('Gerät aus der Akte löschen? Der QR-Aufkleber funktioniert danach nicht mehr.'))call(()=>api('/api/owner/devices',{method:'DELETE',body:JSON.stringify({id,organizationId:org})}))};
 const addMonitor=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));call(()=>api('/api/owner/monitors',{method:'POST',body:JSON.stringify({...f,organizationId:org})}));e.currentTarget.reset()};
 const delMonitor=id=>{if(confirm('Überwachung entfernen?'))call(()=>api('/api/owner/monitors',{method:'DELETE',body:JSON.stringify({id})}))};
 async function copy(text,key){try{await navigator.clipboard.writeText(text);setCopied(key);setTimeout(()=>setCopied(''),1500)}catch{}}

 if(org)return <article className="panel thread">
  <button className="link" style={{justifySelf:'start'}} onClick={()=>{setOrg(null);setFile(null)}}><ArrowLeft size={16}/>Alle Konten</button>
  {!file?<p className="muted">Wird geladen …</p>:<>
   <div className="panel__head" style={{margin:0}}><div><h2>{file.customer.name}</h2><p>{file.customer.accountType==='business'?'Betrieb':'Privatkunde'}{file.customer.contact?' · '+file.customer.contact.name+' · '+file.customer.contact.email:''}</p></div><div className="actions"><button className="mini-btn" onClick={()=>onNewDocument(org,'angebot')}><Plus size={14}/>Angebot</button><button className="mini-btn" onClick={()=>onNewDocument(org,'rechnung')}><Plus size={14}/>Rechnung</button></div></div>
   <div className="privacy-note"><Eye size={18}/><span>Das Öffnen der Kundenakte wurde protokolliert. Kunden, Termine und Aufträge des Betriebs sind hier bewusst nicht sichtbar.</span></div>
   {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}

   <section className="akte"><div className="akte__head"><h3><HardDrive size={17}/>Geräte ({file.devices.length})</h3><div className="actions">{file.devices.length>0&&<a className="mini-btn" href={'/inhaber/etiketten/'+org} target="_blank" rel="noreferrer"><Printer size={14}/>QR-Aufkleber drucken</a>}<button className="mini-btn" onClick={()=>setDevice({...emptyDevice})}><Plus size={14}/>Gerät</button></div></div>
    {device&&<form className="form panel panel--quiet" onSubmit={saveDevice} key={device.id||'new'}><fieldset disabled={busy}>
     <div className="form-grid"><label className="field">Art<select name="kind" defaultValue={device.kind}>{Object.entries(file.kinds).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label className="field">Bezeichnung<input name="label" required maxLength={80} defaultValue={device.label} placeholder="z. B. Router Büro"/></label></div>
     <div className="form-grid"><label className="field">Hersteller<input name="vendor" maxLength={60} defaultValue={device.vendor} placeholder="AVM, MikroTik …"/></label><label className="field">Modell<input name="model" maxLength={80} defaultValue={device.model}/></label></div>
     <div className="form-grid"><label className="field">Standort<input name="location" maxLength={80} defaultValue={device.location} placeholder="z. B. Flur, Technikschrank"/></label><label className="field">Seriennummer<input name="serial" maxLength={80} defaultValue={device.serial}/></label></div>
     <div className="form-grid"><label className="field">Eingerichtet am<input name="installedOn" type="date" defaultValue={device.installedOn||''}/></label><label className="field">Garantie bis<input name="warrantyUntil" type="date" defaultValue={device.warrantyUntil||''}/></label></div>
     <label className="field">Software-Stand<input name="firmware" maxLength={60} defaultValue={device.firmware} placeholder="z. B. FRITZ!OS 8.02 oder RouterOS 7.16"/></label>
     <label className="field"><span>Notizen <span className="field__opt">(keine Passwörter)</span></span><textarea name="notes" rows={2} maxLength={1000} defaultValue={device.notes}/></label>
     <div className="actions"><button className="btn btn--small"><Check size={15}/>Speichern</button><button type="button" className="link" onClick={()=>setDevice(null)}>Abbrechen</button></div>
    </fieldset></form>}
    {file.devices.length>0&&<div className="rows">{file.devices.map(d=><div className="row" key={d.id}><div><div className="row__title">{d.label} <span className="hint">· {d.kindLabel}</span></div><div className="row__meta">{[d.vendor,d.model].filter(Boolean).join(' ')}{d.location?' · '+d.location:''}{d.warrantyUntil?' · Garantie bis '+day(d.warrantyUntil):''}</div></div><div className="row__actions"><button className="mini-btn" aria-label="Bearbeiten" onClick={()=>setDevice({...emptyDevice,...d,installedOn:d.installedOn||'',warrantyUntil:d.warrantyUntil||''})}><Pencil size={14}/></button><button className="mini-btn mini-btn--danger" aria-label="Löschen" onClick={()=>delDevice(d.id)}><Trash2 size={14}/></button></div></div>)}</div>}
   </section>

   <section className="akte"><div className="akte__head"><h3><Activity size={17}/>Überwachung ({file.monitors.length})</h3></div>
    {file.monitors.length>0&&<div className="rows">{file.monitors.map(m=><div className="row" key={m.id}><div><div className="row__title">{m.label} <span className={'badge badge--'+stateTone[m.state]}>{m.state}</span></div><div className="row__meta">{m.kind==='website'?m.url+(m.sslExpiresAt?' · SSL bis '+day(m.sslExpiresAt):''):'Lebenszeichen alle '+m.intervalMinutes+' Min.'}</div>
     {m.scripts&&<details className="diag" style={{marginTop:6}}><summary>Einrichtung am Router</summary><p className="hint" style={{margin:'6px 0'}}>MikroTik (Terminal):</p><div className="codeblock"><button className="mini-btn" onClick={()=>copy(m.scripts.mikrotik,m.id+'mt')}>{copied===m.id+'mt'?<Check size={14}/>:<Copy size={14}/>}Kopieren</button><pre>{m.scripts.mikrotik}</pre></div><p className="hint" style={{margin:'6px 0'}}>Linux, Raspberry Pi oder NAS (crontab):</p><div className="codeblock"><button className="mini-btn" onClick={()=>copy(m.scripts.linux,m.id+'lx')}>{copied===m.id+'lx'?<Check size={14}/>:<Copy size={14}/>}Kopieren</button><pre>{m.scripts.linux}</pre></div><p className="hint">FRITZ!Box kann das nicht selbst. Dafür ein kleines Gerät im Netz (Raspberry Pi, NAS) nutzen.</p></details>}
    </div><button className="mini-btn mini-btn--danger" aria-label="Entfernen" onClick={()=>delMonitor(m.id)}><Trash2 size={14}/></button></div>)}</div>}
    <form className="form" onSubmit={addMonitor} style={{marginTop:10}}><fieldset disabled={busy}><div className="form-grid"><label className="field">Art<select name="kind" defaultValue="website" onChange={e=>{const i=e.currentTarget.form.elements.intervalMinutes;i.value=e.currentTarget.value==="heartbeat"?"5":"15"}}><option value="website">Website und SSL-Zertifikat</option><option value="heartbeat">Internetleitung (Lebenszeichen vom Router)</option></select></label><label className="field">Bezeichnung<input name="label" required maxLength={80} placeholder="z. B. Website Praxis"/></label></div><div className="form-grid"><label className="field"><span>Adresse <span className="field__opt">(nur bei Website)</span></span><input name="url" maxLength={300} placeholder="https://beispiel.de"/></label><label className="field">Prüfen alle<select name="intervalMinutes" defaultValue="15"><option value="5">5 Minuten</option><option value="15">15 Minuten</option><option value="60">60 Minuten</option></select></label></div><div className="actions"><button className="mini-btn"><Plus size={14}/>Überwachung hinzufügen</button></div></fieldset></form>
   </section>

   <section className="akte"><div className="akte__head"><h3><FileText size={17}/>Belege ({file.documents.length})</h3></div>
    {file.documents.length>0&&<div className="rows">{file.documents.map(d=><div className="row" key={d.id}><div><div className="row__title">{d.type==='angebot'?'Angebot':'Rechnung'} {d.number}</div><div className="row__meta">{d.statusLabel} · {euro(d.totals.gross)}</div></div><a className="mini-btn" href={'/beleg/'+d.id} target="_blank" rel="noreferrer">Ansehen</a></div>)}</div>}
   </section>

   <section className="akte"><div className="akte__head"><h3><Inbox size={17}/>Anfragen ({file.tickets.length})</h3></div>
    {file.tickets.length>0&&<div className="rows">{file.tickets.map(t=><button className="row row--button" key={t.id} onClick={()=>onTicket(t.id)}><div><div className="row__title">{t.id}</div><div className="row__meta">{day(t.createdAt)} · {t.status}</div><div className="row__note clamp-2">{t.summary}</div></div></button>)}</div>}
   </section>
  </>}
 </article>;

 return <section className="panel"><div className="panel__head"><div><h2>Konten und Kundenakten</h2><p>Kundenlisten, Termine und Aufträge der Betriebe sind nicht einsehbar, nur ihre Anzahl. Private Konten erscheinen bis zum Öffnen der Akte pseudonymisiert.</p></div></div>
  {!accounts?<p className="muted">Wird geladen …</p>:accounts.length===0?<div className="empty"><Building2 size={24}/><h3>Noch keine Konten.</h3></div>:<div className="table-wrap"><table className="table"><thead><tr><th>Konto</th><th>E-Mail</th><th>Tarif</th><th className="num">Kunden</th><th className="num">Termine</th><th>Zuletzt aktiv</th><th></th></tr></thead><tbody>{accounts.map(a=><tr key={a.id}><td><strong>{a.name}</strong><br/><span className="hint">{a.accountType==='business'?'Betrieb':'Privat'}</span></td><td>{a.email}</td><td>{planName[a.plan]}</td><td className="num">{a.usage.clients}</td><td className="num">{a.usage.appointments}</td><td>{day(a.lastLoginDay)}</td><td><button className="mini-btn" onClick={()=>openFile(a.id)}>Akte öffnen</button></td></tr>)}</tbody></table></div>}
 </section>;
}
