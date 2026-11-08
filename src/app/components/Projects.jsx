'use client';
import {useRef,useState} from 'react';
import {Maximize2,X,ChevronLeft,ChevronRight} from 'lucide-react';

const projects=[
 {id:'pro-manager',name:'Pro Manager',lead:'Ein gemeinsamer Arbeitsplatz für Aufgaben, Termine, Bestände und Notizen.',text:'Pro Manager führt zusammen, was in vielen Betrieben auf mehrere Programme verteilt ist. Das Dashboard zeigt den Stand aller Bereiche und die letzten Aktivitäten; jede Änderung bleibt nachvollziehbar.',details:[['Aufgaben planen','Board mit Statusspalten, Prioritäten, Fälligkeiten und Bearbeitern. Sprints, Story-Points und eine Grenze für laufende Arbeit bilden auch größere Vorhaben ab.'],['Bestände im Blick','Produkte mit Suche, Filtern und Bestandsangaben. Niedrige Bestände lassen sich gezielt herausfiltern.']],stack:['Next.js','React','Node.js','Prisma'],shots:[['pro-manager/dashboard.png','Übersicht mit Kennzahlen und Aktivitäten'],['pro-manager/tasks.png','Aufgabenboard mit Sprintplanung'],['pro-manager/calendar.png','Kalender'],['pro-manager/products.png','Produkte und Bestände'],['pro-manager/notes.png','Notizen']]},
 {id:'rental',name:'Rental',lead:'Unterkunftssuche für Gäste und Verwaltung für Vermieter in einer Anwendung.',text:'Rental verbindet zwei Perspektiven: Gäste finden eine passende Unterkunft nach Zeitraum, Ort und Ausstattung. Vermieter pflegen Objekte, Preise, Bilder und Verfügbarkeiten in einem eigenen Verwaltungsbereich.',details:[['Für Gäste','Filter für Ausstattung wie WLAN, Sauna oder Hunde, Favoriten, Wetter und regionale Tipps. Die Verfügbarkeit wird für den gewählten Zeitraum geprüft.'],['Für Vermieter','Objekte, Preiszeiten, Nebenkosten und Bilder. Dazu ein Verfügbarkeitskalender mit iCal-Import und -Abgleich sowie Last-Minute-Angebote.']],stack:['Next.js','React','REST-API','iCal'],shots:[['rental/finder.png','Unterkunftssuche mit Filtern'],['rental/admin.png','Verwaltungsbereich'],['rental/image.png','Weitere Ansicht']]},
];

function Gallery({project}){
 const [index,setIndex]=useState(0),dialog=useRef(null);
 const [src,label]=project.shots[index];
 const move=step=>setIndex(i=>(i+step+project.shots.length)%project.shots.length);
 return <div className="gallery">
  <div className="gallery__main frame">
   <div className="frame__bar"><i/><i/><i/><span>{project.name} – {label}</span></div>
   <button type="button" onClick={()=>dialog.current?.showModal()} style={{display:'block',width:'100%',padding:0,border:0,background:'none',cursor:'zoom-in'}} aria-label={'Ansicht vergrößern: '+label}><img src={'/images/'+src} alt={label} width="1336" height="750" loading="lazy"/></button>
  </div>
  <div className="gallery__caption"><span>{index+1} von {project.shots.length} · {label}</span><button className="link" type="button" onClick={()=>dialog.current?.showModal()}><Maximize2 size={15}/>Vergrößern</button></div>
  <div className="gallery__thumbs" role="group" aria-label={'Ansichten von '+project.name}>{project.shots.map(([file,text],i)=><button type="button" key={file} aria-pressed={i===index} aria-label={text} onClick={()=>setIndex(i)}><img src={'/images/'+file} alt="" width="264" height="148" loading="lazy"/></button>)}</div>
  <dialog ref={dialog} className="lightbox" aria-label={label} onKeyDown={e=>{if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1)}} onClick={e=>{if(e.target===dialog.current)dialog.current.close()}}>
   <img src={'/images/'+src} alt={label}/>
   <div className="lightbox__bar"><button className="icon-btn" type="button" onClick={()=>move(-1)} aria-label="Vorherige Ansicht"><ChevronLeft size={20}/></button><span>{label}</span><button className="icon-btn" type="button" onClick={()=>move(1)} aria-label="Nächste Ansicht"><ChevronRight size={20}/></button><button className="icon-btn" type="button" onClick={()=>dialog.current.close()} aria-label="Schließen"><X size={20}/></button></div>
  </dialog>
 </div>;
}

export default function Projects(){
 return projects.map(project=><article className="project" id={project.id} key={project.id}>
  <div>
   <h2 className="h2">{project.name}</h2>
   <p className="lead" style={{marginTop:14}}>{project.lead}</p>
   <p className="prose" style={{marginTop:16}}>{project.text}</p>
   <dl>{project.details.map(([t,d])=><div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}</dl>
   <div className="stack">{project.stack.map(s=><span className="tag" key={s}>{s}</span>)}</div>
  </div>
  <Gallery project={project}/>
 </article>);
}
