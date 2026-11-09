'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Code2,Network,Workflow} from 'lucide-react';
import ServiceVisual from './ServiceVisual';
const icons={software:Code2,it:Network,ki:Workflow};
// Leistungen als Werkbank: links wählen, rechts läuft die passende Grafik.
// Wechselt von selbst weiter, bis jemand selbst wählt; steht bei „Bewegung reduzieren“ still.
export default function Workbench({services}){
 const [active,setActive]=useState(0),[auto,setAuto]=useState(true),root=useRef(null),[seen,setSeen]=useState(false);
 useEffect(()=>{const el=root.current;if(!el)return;const io=new IntersectionObserver(([e])=>setSeen(e.isIntersecting),{threshold:.35});io.observe(el);return()=>io.disconnect()},[]);
 useEffect(()=>{if(!auto||!seen||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const t=setTimeout(()=>setActive(a=>(a+1)%services.length),8000);return()=>clearTimeout(t)},[active,auto,seen,services.length]);
 const pick=i=>{setActive(i);setAuto(false)};
 const key=e=>{if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();pick((active+1)%services.length)}if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();pick((active-1+services.length)%services.length)}};
 const s=services[active];
 return <div className="bench2" ref={root} onMouseEnter={()=>setAuto(false)}>
  <div className="bench2__tabs" role="tablist" aria-label="Leistungen" onKeyDown={key}>
   {services.map((x,i)=>{const Icon=icons[x.id];return <button key={x.id} role="tab" id={'tab-'+x.id} aria-selected={i===active} aria-controls="bench2-panel" tabIndex={i===active?0:-1} onClick={()=>pick(i)} className={'bench2__tab'+(i===active?' is-active':'')}>
    <Icon size={22} strokeWidth={1.7}/><span><strong>{x.title}</strong><small>{x.short}</small></span>
    {i===active&&auto&&seen&&<i className="bench2__timer" aria-hidden="true"/>}
   </button>})}
  </div>
  <div className="bench2__panel" role="tabpanel" id="bench2-panel" aria-labelledby={'tab-'+s.id} key={s.id}>
   <ServiceVisual kind={s.id}/>
   <p className="prose">{s.text}</p>
   <ul className="bench2__points">{s.points.map(p=><li key={p}>{p}</li>)}</ul>
   <div className="bench2__foot"><div className="service__tags">{s.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div>{s.link&&<Link className="link" href={s.link[1]}>{s.link[0]}<ArrowRight size={16}/></Link>}</div>
  </div>
 </div>;
}
