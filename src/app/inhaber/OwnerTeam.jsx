'use client';
import {useCallback,useEffect,useState} from 'react';
import {UserPlus,Copy,Check,AlertCircle,Sparkles,AlertTriangle,Clock,Gauge,Coins,MessagesSquare,LifeBuoy} from 'lucide-react';

const mins=m=>m>=60?Math.floor(m/60)+' Std. '+(m%60?m%60+' Min.':''):m+' Min.';
const usd=v=>'$'+(v<0.01&&v>0?v.toFixed(4):v.toFixed(2));
const fmt=v=>v?new Intl.DateTimeFormat('de-DE',{dateStyle:'short',timeStyle:'short'}).format(new Date(v)):'–';
const statusTone={aktiv:'ok',eingeladen:'wait','Einladung abgelaufen':'muted',deaktiviert:'muted'};
const kindLabel={aufgabe:'Aufgaben',aufgabe_erledigt:'Erledigt markiert',notiz:'Notizen',antwort:'Antworten an Kunden',rechnung:'Rechnungsentwürfe',ticket:'Kunden-Anfragen'};
const errLabel={AI_RATE_LIMIT:'Anbieter-Limit',AI_PROVIDER_ERROR:'Schlüssel abgelehnt',AI_UNAVAILABLE:'Nicht erreichbar',AI_TIMEOUT:'Zeitüberschreitung',AI_CREDIT_REQUIRED:'Kein Guthaben',ACTION_FAILED:'Vorschlag fehlgeschlagen'};

export default function OwnerTeam({api,handle,onTicket}){
 const [people,setPeople]=useState(null),[stats,setStats]=useState(null),[link,setLink]=useState(''),[copied,setCopied]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=useCallback(()=>{api('/api/owner/team').then(d=>setPeople(d.people)).catch(e=>handle(e)||setError(e.message));api('/api/owner/ai-stats').then(setStats).catch(e=>handle(e)||setError(e.message))},[api,handle]);
 useEffect(()=>{load()},[load]);
 async function invite(e){e.preventDefault();const form=e.currentTarget,f=Object.fromEntries(new FormData(form));setBusy(true);setError('');setLink('');
  try{const d=await api('/api/owner/team',{method:'POST',body:JSON.stringify(f)});setPeople(d.people);setLink(d.link);form.reset()}catch(err){if(!handle(err))setError(err.message)}finally{setBusy(false)}}
 async function update(id,body){try{const d=await api('/api/owner/team',{method:'PATCH',body:JSON.stringify({id,...body})});setPeople(d.people)}catch(err){if(!handle(err))setError(err.message)}}
 const s=stats,max=s?Math.max(1,...s.series.map(d=>d.kunde+d.workspace)):1;

 return <>
  <section className="panel">
   <div className="panel__head"><div><h2>Team</h2><p>Admins sehen alles. Mitarbeiter arbeiten mit Anfragen, Rückrufen, Aufgaben, Zeiten und FUNKNAHT AI, aber ohne Umsätze, Belege, Zugangssteuerung und Einstellungen.</p></div></div>
   {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
   {!people?<p className="muted">Wird geladen …</p>:<div className="table-wrap"><table className="table"><thead><tr><th scope="col">Name</th><th scope="col">E-Mail</th><th scope="col">Rolle</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Aktionen</span></th></tr></thead><tbody>
    {people.map(p=><tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.email}</td>
     <td>{p.owner?'Inhaber':<select aria-label={'Rolle von '+p.name} value={p.role} onChange={e=>update(p.id,{role:e.target.value})} disabled={!p.active}><option value="mitarbeiter">Mitarbeiter</option><option value="admin">Admin</option></select>}</td>
     <td><span className={'badge badge--'+(statusTone[p.status]||'muted')}>{p.status}</span></td>
     <td>{!p.owner&&(p.active?<button className="mini-btn mini-btn--danger" onClick={()=>confirm(p.name+' deaktivieren? Die Person wird sofort abgemeldet.')&&update(p.id,{active:false})}>Deaktivieren</button>:<button className="mini-btn" onClick={()=>update(p.id,{active:true})}>Aktivieren</button>)}</td></tr>)}
   </tbody></table></div>}
   <form className="form panel panel--quiet" onSubmit={invite} style={{marginTop:18}}><fieldset disabled={busy}>
    <h3 className="h4"><UserPlus size={17}/>Person einladen</h3>
    <div className="form-grid">
     <label className="field">Name<input name="name" required maxLength={150} autoComplete="off"/></label>
     <label className="field">Dienstliche E-Mail<input name="email" type="email" required maxLength={254} autoComplete="off"/></label>
    </div>
    <label className="field">Rolle<select name="role" defaultValue="mitarbeiter"><option value="mitarbeiter">Mitarbeiter</option><option value="admin">Admin</option></select></label>
    <p className="hint">Du bekommst einen Einladungslink (7 Tage gültig). Die Person legt damit Namen und Passwort fest und meldet sich danach normal an.</p>
    <button className="btn btn--small"><UserPlus size={16}/>Einladung erstellen</button>
   </fieldset></form>
   {link&&<div className="notice notice--ok" role="status" style={{marginTop:12}}><Check size={18}/><div style={{minWidth:0}}><strong>Einladung erstellt.</strong> Schick diesen Link persönlich (z. B. per Signal oder E-Mail):<div className="copy-row"><code>{link}</code><button className="mini-btn" onClick={()=>{navigator.clipboard?.writeText(link);setCopied(true);setTimeout(()=>setCopied(false),1500)}}>{copied?<Check size={14}/>:<Copy size={14}/>}{copied?'Kopiert':'Kopieren'}</button></div></div></div>}
  </section>

  {s&&<section className="panel">
   <div className="panel__head"><div><h2>Arbeit des Teams</h2><p>Erfasste Zeiten, Antworten an Kunden und Aufgaben. {s.unassignedTasks>0&&<strong>{s.unassignedTasks} Aufgabe{s.unassignedTasks>1?'n':''} ohne Zuständigkeit.</strong>}</p></div></div>
   <div className="table-wrap"><table className="table"><thead><tr><th scope="col">Person</th><th scope="col" className="num">Heute</th><th scope="col" className="num">7 Tage</th><th scope="col" className="num">30 Tage</th><th scope="col" className="num">Antworten (7 T.)</th><th scope="col" className="num">Erledigt (7 T.)</th><th scope="col" className="num">Offen</th><th scope="col">Zuletzt angemeldet</th></tr></thead><tbody>
    {s.team.map(p=><tr key={p.name}><td><strong>{p.name}</strong><br/><small className="muted">{p.role}</small></td><td className="num">{mins(p.minutesToday)}</td><td className="num">{mins(p.minutesWeek)}</td><td className="num">{mins(p.minutesMonth)}</td><td className="num">{p.repliesWeek}</td><td className="num">{p.tasksDoneWeek}</td><td className="num">{p.tasksOpen}{p.tasksOverdue>0&&<span className="badge badge--error" style={{marginLeft:6}}>{p.tasksOverdue} überfällig</span>}</td><td>{fmt(p.lastLoginAt)}</td></tr>)}
   </tbody></table></div>
  </section>}

  {s&&<section className="panel">
   <div className="panel__head"><div><h2>FUNKNAHT AI · letzte {s.days} Tage</h2><p>{s.config.configured?<>{s.config.provider} · {s.config.model} · Datenverarbeitung: <strong>{s.config.region}</strong></>:'Noch kein KI-Anbieter eingerichtet.'}</p></div></div>
   {s.config.configured&&s.config.region==='USA'&&<p className="notice"><AlertTriangle size={18}/><span>Der Anbieter verarbeitet in den USA. Für echte Kundendaten brauchst du einen Auftragsverarbeitungsvertrag (DPA) mit Standardvertragsklauseln und einen Hinweis in der Datenschutzerklärung. Alternative in der EU: <code>AI_PROVIDER=mistral</code>.</span></p>}
   <div className="stats">
    <div className="stat"><span className="stat__label"><MessagesSquare size={15}/>Anfragen an die KI</span><span className="stat__value">{s.total.requests}</span><span className="stat__note">{s.customer.requests} Kunden · {s.workspace.requests} Team</span></div>
    <div className="stat"><span className="stat__label"><Gauge size={15}/>Erfolgsquote</span><span className="stat__value">{s.total.requests?Math.round(s.total.ok/s.total.requests*100)+' %':'–'}</span><span className="stat__note">{s.total.errors} Fehler{Object.keys(s.errors).length?': '+Object.entries(s.errors).map(([k,v])=>(errLabel[k]||k)+' '+v).join(', '):''}</span></div>
    <div className="stat"><span className="stat__label"><LifeBuoy size={15}/>Übergaben vorgeschlagen</span><span className="stat__value">{s.customer.escalations}</span><span className="stat__note">aus {s.customer.requests} Kunden-Gesprächen</span></div>
    <div className="stat"><span className="stat__label"><Clock size={15}/>Antwortzeit</span><span className="stat__value">{s.total.avgMs?(s.total.avgMs/1000).toFixed(1)+' s':'–'}</span><span className="stat__note">Durchschnitt</span></div>
    <div className="stat"><span className="stat__label"><Coins size={15}/>Kosten (geschätzt)</span><span className="stat__value">{usd(s.total.costUsd)}</span><span className="stat__note">{(s.total.tokens.input+s.total.tokens.output).toLocaleString('de-DE')} Tokens{s.config.price[0]===0&&s.config.price[1]===0?' · Preis nicht hinterlegt':''}</span></div>
   </div>
   <figure className="ai-chart" aria-label="KI-Anfragen pro Tag">
    <div className="ai-chart__bars">{s.series.map(d=><span key={d.day} title={d.day+': '+d.kunde+' Kunden, '+d.workspace+' Team'} style={{'--k':d.kunde/max,'--w':d.workspace/max}}><i className="ai-chart__k"/><i className="ai-chart__w"/></span>)}</div>
    <figcaption><span className="ai-chart__key ai-chart__key--k"/>Kunden <span className="ai-chart__key ai-chart__key--w"/>Team · ein Balken pro Tag</figcaption>
   </figure>
   <div className="split-2">
    <div><h3 className="h4">Meistgenutzte Abfragen</h3>{s.tools.length?<ul className="kv-list">{s.tools.map(([t,n])=><li key={t}><span>{t.replace(/_/g,' ')}</span><strong>{n}</strong></li>)}</ul>:<p className="muted">Noch keine.</p>}</div>
    <div><h3 className="h4">Vorschläge</h3>{s.actions.length?<ul className="kv-list">{Object.entries(s.actions.reduce((m,a)=>{const k=kindLabel[a.kind]||a.kind;m[k]=m[k]||{};m[k][a.status]=(m[k][a.status]||0)+a.n;return m},{})).map(([k,v])=><li key={k}><span>{k}</span><strong>{v.ausgefuehrt||0} bestätigt · {v.verworfen||0} verworfen{v.offen?' · '+v.offen+' offen':''}</strong></li>)}</ul>:<p className="muted">Noch keine.</p>}</div>
   </div>
   <h3 className="h4" style={{marginTop:18}}><Sparkles size={16}/>Anfragen, die über die KI kamen</h3>
   {s.escalated.length?<ul className="kv-list">{s.escalated.map(t=><li key={t.id}><button className="link" onClick={()=>onTicket?.(t.id)}>{t.id}</button><span>{fmt(t.createdAt)} · {t.status==='geloest'?'erledigt':t.status==='offen'?'neu':'in Bearbeitung'}{t.priority!=='normal'?' · '+t.priority:''}</span></li>)}</ul>:<p className="muted">Noch keine.</p>}
   <p className="hint" style={{marginTop:14}}>Gespeichert werden nur Metadaten (Zeitpunkt, Dauer, Tokens, genutzte Abfragen), keine Gesprächsinhalte. Das KI-Protokoll wird nach 400 Tagen gelöscht, offene Vorschläge nach 90 Tagen.</p>
  </section>}
 </>;
}
