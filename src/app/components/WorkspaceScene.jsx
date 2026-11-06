'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Pause,Play,ArrowUpRight,Network,Code2,PanelsTopLeft,Route,Router,Monitor,Wifi,Database,CalendarDays,Search,SlidersHorizontal} from 'lucide-react';
import TechnicalFigure from './TechnicalFigure';

const scenes={
 studio:{
  label:'FUNKNAHT / VERBINDUNGEN',note:'Von der Infrastruktur bis zur Oberfläche.',
  caption:'Technik greift ineinander. Wir betrachten die Verbindung zwischen Geräten, Daten und den Menschen, die damit arbeiten.',
  link:'/projects',action:'Entwicklungsarbeit ansehen',
  nodes:[[Network,'Netzwerk','Geräte verbinden'],[Code2,'Anwendung','Abläufe abbilden'],[Database,'Daten','Informationen ordnen'],[PanelsTopLeft,'Oberfläche','Bedienung gestalten']]
 },
 projects:{
  label:'FUNKNAHT / ENTWICKLUNG',note:'Eine Aufgabe. Mehrere zusammenhängende Teile.',
  caption:'Die Oberfläche ist ein Teil der Anwendung. Daten, Arbeitsschritte und Bedienung müssen zusammenpassen.',
  link:'#projektarchiv',action:'Originalansichten öffnen',
  nodes:[[CalendarDays,'Pro Manager','Aufgaben & Termine'],[Search,'Rental','Suche & Auswahl'],[Database,'Datenmodell','Struktur & Beziehungen'],[SlidersHorizontal,'Verwaltung','Inhalte & Einstellungen']]
 },
 network:{
  label:'FUNKNAHT / NETZWERK',note:'Eine Verbindung endet nicht am Router.',
  caption:'Router, Funkverbindung und Endgerät wirken zusammen. Bei der Fehlersuche betrachten wir den Weg bis zum Arbeitsplatz.',
  link:'/contact?thema=Netzwerkhilfe',action:'Netzwerkhilfe anfragen',
  nodes:[[Router,'Router','Einrichtung'],[Wifi,'WLAN','Verbindung'],[Network,'Netzwerk','Zusammenspiel'],[Monitor,'Arbeitsplatz','Betroffene Geräte']]
 },
 contact:{
  label:'FUNKNAHT / ZUSAMMENARBEIT',note:'Die Aufgabe bestimmt den nächsten Schritt.',
  caption:'Eine erste Beschreibung reicht. Gemeinsam ordnen wir die Ausgangslage und den sinnvollen Umfang.',
  link:'#anfrage',action:'Zum Anfrageformular',
  nodes:[[Route,'Ausgangslage','Was ist vorhanden?'],[Network,'Verbindungen','Was gehört zusammen?'],[Code2,'Umsetzung','Was wird gebraucht?'],[PanelsTopLeft,'Ergebnis','Was soll möglich sein?']]
 }
};

export default function WorkspaceScene({variant='studio'}){
 const [paused,setPaused]=useState(false),[visible,setVisible]=useState(false);
 const root=useRef(null),id=useId().replace(/:/g,'');
 const scene=scenes[variant]||scenes.studio;
 useEffect(()=>{
  let inView=false;
  const update=()=>setVisible(inView&&document.visibilityState==='visible');
  const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;update()});
  if(root.current)observer.observe(root.current);
  document.addEventListener('visibilitychange',update);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update)};
 },[]);
 return <figure ref={root} className={'system-scene'+(paused||!visible?' is-paused':'')} data-variant={variant}>
  <div className="system-scene-head">
   <span>{scene.label}</span>
   <button type="button" onClick={()=>setPaused(!paused)} aria-pressed={paused} aria-label={paused?'Animation fortsetzen':'Animation pausieren'}>{paused?<Play size={13}/>:<Pause size={13}/>}</button>
  </div>
  <div className="system-scene-canvas">
   <svg className="system-lines" viewBox="0 0 640 450" fill="none" aria-hidden="true">
    <defs><pattern id={id+'-grid'} width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" stroke="currentColor" strokeWidth=".5" opacity=".28"/></pattern></defs>
    <rect x="1" y="1" width="638" height="448" fill={'url(#'+id+'-grid)'} opacity=".5"/>
    <g stroke="currentColor" strokeWidth="1" opacity=".45">
     <path d="M150 120H216L273 182M490 120H424L367 182M150 320H216L273 258M490 320H424L367 258"/>
     <rect x="258" y="158" width="124" height="124" rx="28" opacity=".4"/>
    </g>
    <g className="system-packets" stroke="currentColor" strokeWidth="2" strokeDasharray="4 240" opacity=".7"><path d="M150 120H216L273 182M490 120H424L367 182M273 258L216 320H150M367 258L424 320H490"/></g>
    <g stroke="currentColor" opacity=".6"><path d="M16 30V18H28M612 18H624V30M16 420V432H28M612 432H624V420"/></g>
   </svg>
   <div className="system-core"><TechnicalFigure paused={paused||!visible}/></div>
   {scene.nodes.map(([Icon,title,note],index)=><div className={'system-node node-'+index} key={title}><Icon size={21} strokeWidth={1.25}/><strong>{title}</strong><span>{note}</span></div>)}
   <span className="system-axis" aria-hidden="true">F / VERBINDET TECHNIK MIT MENSCHEN</span>
  </div>
  <div className="system-scene-note">{scene.note}</div>
  <figcaption className="system-scene-caption"><p>{scene.caption}</p><a className="text-link" href={scene.link}>{scene.action}<ArrowUpRight size={15}/></a></figcaption>
 </figure>;
}
