'use client';
import {useRef,useState} from 'react';
import {Maximize2,X,ChevronLeft,ChevronRight,ExternalLink} from 'lucide-react';

// Screenshots zeigen nur erfundene Demo-Daten (Nahtbord) bzw. öffentliche Seiten ohne Hausnummern (Urlaub-GOSCH).
const projects=[
 {id:'nahtbord',name:'Nahtbord',lead:'Eigene Software von FUNKNAHT: Aufträge, Rechnungen, Lager und Aufgaben für kleine Unternehmen.',text:'Nahtbord ist für Betriebe gemacht, die bisher mit Excel, Word und Zettelwirtschaft arbeiten: kleine Online-Shops, Handel mit eigenem Lager, Dienstleister. Vom ersten Anruf über Angebot und Auftrag bis zur Rechnung mit dem eigenen Logo an die eigenen Kunden.',details:[['Aufträge und Rechnungen','Pipeline von Anfrage bis Abrechnung. Rechnungen mit lückenloser Nummer, nach dem Stellen unveränderbar (GoBD), Storno, Teilzahlungen und E-Rechnung im XRechnung-Format.'],['Lager und Team','Bestand mit Mindestmengen, Material wird direkt vom Auftrag gebucht. Aufgaben, Projekte, Kalender und Rollen für das Team. Jede Firma hat eine eigene, getrennte Datenbank.']],stack:['Next.js','React','Node.js','SQLite','XRechnung'],size:[1336,750],shots:[['nahtbord/uebersicht.webp','Übersicht'],['nahtbord/auftraege.webp','Aufträge als Pipeline'],['nahtbord/rechnungen.webp','Rechnungen und Zahlungen'],['nahtbord/rechnung-druck.webp','Rechnung mit eigenem Logo'],['nahtbord/lager.webp','Lager und Bestand'],['nahtbord/aufgaben.webp','Aufgaben']]},
 {id:'urlaub-gosch',name:'Urlaub-GOSCH',lead:'Ferienvermietung an der Ostsee: Unterkunftssuche für Gäste, Verwaltung für den Vermieter.',text:'Für einen Ferienvermieter an der Ostsee entwickelt. Gäste finden ihre Unterkunft nach Zeitraum, Ort und Ausstattung und sehen die Verfügbarkeit direkt im Kalender. Der Vermieter pflegt Objekte, Preise und Belegung in einem eigenen Verwaltungsbereich.',details:[['Für Gäste','Suche mit Filtern wie Hund erlaubt, Sauna oder WLAN, Favoriten, Ostsee-Wetter und Ausflugstipps. Belegung und Preise pro Nacht auf jeder Objektseite.'],['Für den Vermieter','Objekte, Preiszeiten, Nebenkosten und Bilder. Verfügbarkeitskalender mit iCal-Abgleich zu Buchungsportalen, Anfragen direkt per Formular. Cookie-Einwilligung nach DSGVO.']],stack:['Next.js','React','REST-API','iCal'],size:[800,448],url:'https://urlaub-gosch.vercel.app/',shots:[['urlaub-gosch/start.webp','Startseite'],['urlaub-gosch/unterkuenfte.webp','Unterkünfte mit Schnellfiltern'],['urlaub-gosch/suche.webp','Suche nach Zeitraum und Ausstattung'],['urlaub-gosch/objekt.webp','Objektseite'],['urlaub-gosch/verfuegbarkeit.webp','Beschreibung und Verfügbarkeit']]},
];

function Gallery({project}){
 const [index,setIndex]=useState(0),dialog=useRef(null);
 const [src,label]=project.shots[index];
 const move=step=>setIndex(i=>(i+step+project.shots.length)%project.shots.length);
 return <div className="gallery">
  <div className="gallery__main frame">
   <div className="frame__bar"><i/><i/><i/><span>{project.name} – {label}</span></div>
   <button type="button" onClick={()=>dialog.current?.showModal()} style={{display:'block',width:'100%',padding:0,border:0,background:'none',cursor:'zoom-in'}} aria-label={'Ansicht vergrößern: '+label}><img src={'/images/'+src} alt={label} width={project.size[0]} height={project.size[1]} loading="lazy"/></button>
  </div>
  <div className="gallery__caption"><span>{index+1} von {project.shots.length} · {label}</span><button className="link" type="button" onClick={()=>dialog.current?.showModal()}><Maximize2 size={15}/>Vergrößern</button></div>
  <div className="gallery__thumbs" role="group" aria-label={'Ansichten von '+project.name}>{project.shots.map(([file,text],i)=><button type="button" key={file} aria-pressed={i===index} aria-label={text} onClick={()=>setIndex(i)}><img src={'/images/'+file.replace('.webp','-klein.webp')} alt="" width="264" height="148" loading="lazy"/></button>)}</div>
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
   {project.url&&<p style={{marginTop:18}}><a className="link" href={project.url} target="_blank" rel="noopener noreferrer">Live ansehen<ExternalLink size={15}/></a></p>}
  </div>
  <Gallery project={project}/>
 </article>);
}
