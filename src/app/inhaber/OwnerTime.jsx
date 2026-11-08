'use client';
import {useEffect,useState} from 'react';
import {Download,Clock} from 'lucide-react';
const dur=m=>(m/60).toLocaleString('de-DE',{maximumFractionDigits:2})+' h';
export default function OwnerTime({api,handle,onOpen}){
 const [month,setMonth]=useState(()=>new Date().toISOString().slice(0,7)),[data,setData]=useState(null);
 useEffect(()=>{let live=true;setData(null);api('/api/owner/time?month='+month).then(d=>{if(live)setData(d)}).catch(handle);return()=>{live=false}},[month,api,handle]);
 return <section className="panel">
  <div className="panel__head"><div><h2>Zeiten</h2><p>Erfasste Arbeitszeit aus allen Anfragen. Grundlage für Rechnungen.</p></div><div className="actions"><input className="input" type="month" value={month} onChange={e=>e.target.value&&setMonth(e.target.value)} style={{width:'auto',minHeight:38}} aria-label="Monat"/><a className="mini-btn" href={'/api/owner/time?format=csv&month='+month}><Download size={15}/>CSV für Excel</a></div></div>
  {!data?<p className="muted">Wird geladen …</p>:<>
   <div className="stats" style={{marginBottom:18}}><div className="stat"><span className="stat__label"><Clock size={15}/>Gesamt</span><span className="stat__value">{dur(data.total)}</span></div><div className="stat"><span className="stat__label">Abrechenbar</span><span className="stat__value">{dur(data.billable)}</span></div><div className="stat"><span className="stat__label">Einträge</span><span className="stat__value">{data.rows.length}</span></div></div>
   {data.rows.length===0?<div className="empty"><Clock size={24}/><h3>Keine Zeiten in diesem Monat.</h3><p>Zeiten erfasst du direkt in einer Anfrage.</p></div>:<div className="table-wrap"><table className="table"><thead><tr><th>Datum</th><th>Anfrage</th><th>Kunde</th><th>Notiz</th><th className="num">Minuten</th></tr></thead><tbody>{data.rows.map((r,i)=><tr key={i}><td>{new Date(r.date+'T12:00:00').toLocaleDateString('de-DE')}</td><td><button className="link" onClick={()=>onOpen(r.ticket)}>{r.ticket}</button></td><td>{r.organization}</td><td>{r.note||'–'}{!r.billable&&<span className="hint"> · nicht abrechenbar</span>}</td><td className="num">{r.minutes}</td></tr>)}</tbody></table></div>}
  </>}
 </section>;
}
