'use client';
import {useEffect,useMemo,useState} from 'react';
import {Search,Printer,RotateCcw,Clock,Copy,Check,ArrowLeft} from 'lucide-react';
import {guides,guideGroups} from '../../lib/guides';
const KEY='funknaht-guides';
// Checkbox state lives only in this browser; it is a personal working aid.
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
function store(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch{}}
export default function Guides(){
 const [active,setActive]=useState(null),[q,setQ]=useState(''),[done,setDone]=useState({}),[copied,setCopied]=useState('');
 useEffect(()=>{setDone(load())},[]);
 const list=useMemo(()=>{const s=q.trim().toLowerCase();return s?guides.filter(g=>(g.title+' '+g.intro+' '+g.sections.flatMap(x=>[x.title,...x.items]).join(' ')).toLowerCase().includes(s)):guides},[q]);
 const g=guides.find(x=>x.id===active);
 function toggle(k){const next={...done,[k]:!done[k]};if(!next[k])delete next[k];setDone(next);store(next)}
 function reset(){const next=Object.fromEntries(Object.entries(done).filter(([k])=>!k.startsWith(g.id+':')));setDone(next);store(next)}
 async function copy(text,key){try{await navigator.clipboard.writeText(text.split('\n').filter(l=>!l.startsWith('#')).join('\n'));setCopied(key);setTimeout(()=>setCopied(''),1500)}catch{}}
 const progress=x=>{const keys=x.sections.flatMap((s,i)=>s.type==='check'?s.items.map((_,j)=>x.id+':'+i+':'+j):[]);return [keys.filter(k=>done[k]).length,keys.length]};
 if(g){const [d,n]=progress(g);return <article className="panel guide">
  <button className="link" onClick={()=>setActive(null)}><ArrowLeft size={16}/>Alle Leitfäden</button>
  <div className="panel__head" style={{margin:'12px 0 6px'}}><div><p className="intro" style={{margin:0}}>{g.group}</p><h2 style={{fontSize:'1.5rem'}}>{g.title}</h2></div><div className="actions">{n>0&&<span className="hint">{d} von {n} erledigt</span>}{d>0&&<button className="mini-btn" onClick={reset}><RotateCcw size={14}/>Zurücksetzen</button>}<button className="mini-btn" onClick={()=>print()}><Printer size={14}/>Drucken</button></div></div>
  <p className="prose">{g.intro}</p>
  {g.sections.map((s,i)=><section key={i} className="guide__section"><h3>{s.title}</h3>
   {s.type==='check'&&<ul className="checklist">{s.items.map((item,j)=>{const k=g.id+':'+i+':'+j;return <li key={j}><label className="check"><input type="checkbox" checked={!!done[k]} onChange={()=>toggle(k)}/><span className={done[k]?'is-done':''}>{item}</span></label></li>})}</ul>}
   {s.type==='list'&&<ul className="guide__list">{s.items.map((item,j)=><li key={j}>{item}</li>)}</ul>}
   {s.type==='code'&&<div className="codeblock"><button className="mini-btn" onClick={()=>copy(s.items.join('\n'),g.id+i)}>{copied===g.id+i?<Check size={14}/>:<Copy size={14}/>}{copied===g.id+i?'Kopiert':'Befehle kopieren'}</button><pre>{s.items.map((l,j)=><span key={j} className={l.startsWith('#')?'tok-c':''}>{l}{'\n'}</span>)}</pre></div>}
  </section>)}
 </article>}
 return <section className="panel">
  <div className="panel__head"><div><h2>Leitfäden</h2><p>Checklisten für Gespräch, Einsatz und Einrichtung. Abgehakte Punkte merkt sich nur dieser Browser.</p></div></div>
  <label className="field" style={{marginBottom:16}}><span className="sr-only">Suchen</span><span style={{position:'relative'}}><Search size={16} style={{position:'absolute',left:12,top:16,color:'var(--ink-3)'}}/><input className="input" style={{paddingLeft:36}} value={q} onChange={e=>setQ(e.target.value)} placeholder="z. B. Drucker, WPA3, Doppel-NAT, TAN"/></span></label>
  {guideGroups.map(group=>{const items=list.filter(x=>x.group===group);if(!items.length)return null;return <div key={group} style={{marginBottom:18}}><h3 className="hint" style={{marginBottom:8,fontWeight:600}}>{group}</h3><div className="guide-grid">{items.map(x=>{const [d,n]=progress(x);return <button key={x.id} className="category" onClick={()=>setActive(x.id)}><strong>{x.title}</strong><span>{x.intro}</span><span className="hint" style={{display:'flex',gap:10,marginTop:6}}><span><Clock size={12} style={{display:'inline',verticalAlign:-1}}/> {x.minutes} Min.</span>{n>0&&<span>{d}/{n} erledigt</span>}</span></button>})}</div></div>})}
  {!list.length&&<p className="muted">Nichts gefunden.</p>}
 </section>;
}
