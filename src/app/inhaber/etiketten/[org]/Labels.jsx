'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {Printer,AlertCircle} from 'lucide-react';
export default function Labels({org}){
 const [data,setData]=useState(null),[error,setError]=useState(''),[pick,setPick]=useState({});
 useEffect(()=>{fetch('/api/owner/labels?org='+encodeURIComponent(org),{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.code==='ELEVATION_REQUIRED'?'Bitte öffnen Sie zuerst den Inhaberbereich.':d.error||'Die Aufkleber konnten nicht geladen werden.');setData(d);setPick(Object.fromEntries(d.labels.map(l=>[l.id,1])))}).catch(e=>setError(e.message))},[org]);
 if(error)return <div className="wrap app"><p className="notice notice--error"><AlertCircle size={18}/>{error}</p><Link className="link" href="/inhaber">Zum Inhaberbereich</Link></div>;
 if(!data)return <div className="wrap app"><p className="muted">Wird geladen …</p></div>;
 const sheet=data.labels.flatMap(l=>Array.from({length:pick[l.id]||0},(_,i)=>({...l,key:l.id+i})));
 return <div className="labels-page">
  <div className="wrap app no-print">
   <div className="app__head"><div><h1 className="app__title">QR-Aufkleber</h1><p className="app__sub">{data.customer||'Privatkunde'} · Kunde scannt den Code mit dem Handy und landet direkt im Hilfe-Portal, das Gerät ist schon ausgewählt.</p></div><button className="btn btn--small" onClick={()=>print()}><Printer size={16}/>Drucken</button></div>
   <div className="panel"><div className="rows">{data.labels.map(l=><div className="row" key={l.id}><div><div className="row__title">{l.label}</div><div className="row__meta">{l.kind}{l.location?' · '+l.location:''}</div></div><label className="field" style={{width:110}}><span className="sr-only">Anzahl</span><select value={pick[l.id]||0} onChange={e=>setPick({...pick,[l.id]:Number(e.target.value)})}>{[0,1,2,3,4].map(n=><option key={n} value={n}>{n}×</option>)}</select></label></div>)}</div>
   <p className="hint" style={{marginTop:12}}>Passt auf Etikettenbögen mit 63,5 × 38,1 mm (21 pro A4-Seite). Beim Drucken „Tatsächliche Größe“ bzw. 100 % wählen. Der Code enthält keine Kundendaten, nur einen zufälligen Schlüssel.</p></div>
  </div>
  <div className="label-sheet">{sheet.map(l=><div className="qr-label" key={l.key}><div className="qr-label__code" dangerouslySetInnerHTML={{__html:l.svg}}/><div className="qr-label__text"><strong>Hilfe zu diesem Gerät</strong><span>{l.label}</span><small>Code scannen{data.phone?' oder anrufen: '+data.phone:''}</small><em>FUNKNAHT</em></div></div>)}</div>
 </div>;
}
