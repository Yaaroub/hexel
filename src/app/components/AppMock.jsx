'use client';
import {useEffect,useRef,useState} from 'react';
// Illustrative business view. A booking request arrives once the view scrolls into sight.
const base=[
 {time:'08:00',name:'Familie Petersen',service:'Heizungswartung',status:['ok','Bestätigt']},
 {time:'10:30',name:'Kanzlei am Markt',service:'Netzwerkprüfung',status:['ok','Bestätigt']},
 {time:'14:00',name:'Hof Brodersen',service:'Angebotsbesprechung',status:['info','Vor Ort']},
];
const incoming={time:'11:30',name:'Frau Lorenzen',service:'Heizungswartung',status:['wait','Neu angefragt'],fresh:true};
export default function AppMock(){
 const root=useRef(null),[arrived,setArrived]=useState(false);
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){setArrived(true);return}
  const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setTimeout(()=>setArrived(true),900);observer.disconnect()}},{threshold:.5});
  if(root.current)observer.observe(root.current);return()=>observer.disconnect();
 },[]);
 const list=arrived?[...base.slice(0,2),incoming,base[2]]:base;
 return <figure className="app-mock reveal" ref={root} aria-label="Beispielansicht des Arbeitsbereichs für Betriebe mit Terminen des Tages">
  <div className="app-mock__top"><strong>Heizung &amp; Sanitär Beispiel</strong><span>Beispielansicht</span></div>
  <div className="app-mock__grid">
   <div className="app-mock__side" aria-hidden="true"><span>Überblick</span><span aria-current="true">Termine</span><span>Kunden</span><span>Aufträge</span><span>Leistungen</span><span>Buchungsseite</span></div>
   <div className="app-mock__main">
    <div className="app-mock__day">Heute · {list.length} Termine</div>
    {list.map(item=><div className={'appt'+(item.fresh?' is-new':'')} key={item.time}><time>{item.time}</time><span>{item.name}<small>{item.service}</small></span><span className={'badge badge--'+item.status[0]}>{item.status[1]}</span></div>)}
   </div>
  </div>
 </figure>;
}
