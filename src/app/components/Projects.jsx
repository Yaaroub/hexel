'use client';
import {useId,useRef,useState} from 'react';
const projects=[{name:'Pro Manager',type:'01 / ORGANISATION & ARBEITSABLÄUFE',heading:'Ein Arbeitsplatz für Aufgaben, Termine und Bestände.',description:'Pro Manager führt Aufgabenverwaltung, Produkte, Notizen und Kalender in einer Webanwendung zusammen. Das Dashboard zeigt die Bereiche im Überblick und macht letzte Aktivitäten sichtbar. Statt nur einzelne Daten anzuzeigen, ordnet die Anwendung sie in einen gemeinsamen Arbeitskontext ein.',details:[['Aufgaben planen','Das Aufgabenboard bietet Statusspalten, Prioritäten, Fälligkeiten und Bearbeiter. Sprint-Zeiträume, Story-Points und ein Limit für laufende Aufgaben bilden auch umfangreichere Arbeitsabläufe ab.'],['Bestände überblicken','Die Produktansicht verbindet Suche und Filter mit Bestandsangaben. Produkte lassen sich bearbeiten; niedrige Bestände können gezielt gefiltert werden. Ein Export ist in der Oberfläche vorgesehen.']],images:['pro-manager/dashboard.png','pro-manager/tasks.png','pro-manager/calendar.png','pro-manager/products.png','pro-manager/notes.png'],labels:['Übersicht & Aktivitäten','Aufgabenboard & Sprintplanung','Kalender','Produkte & Bestände','Notizen']},{name:'Rental',type:'02 / UNTERKUNFTSSUCHE & VERWALTUNG',heading:'Zwei Perspektiven. Eine Anwendung für die Vermietung.',description:'Rental verbindet die Suche nach einer passenden Unterkunft mit einem eigenen Verwaltungsbereich. Gäste können nach Reisezeitraum, Ort, Personenzahl und Ausstattung suchen. Auf der anderen Seite stehen die Pflege der Objekte, Preise, Bilder und Verfügbarkeiten.',details:[['Für die Unterkunftssuche','Filter für WLAN, Sauna, Parkplatz oder die Mitnahme von Hunden helfen bei der Auswahl. Favoriten, Wetterinformationen und regionale Beiträge ergänzen die Suchoberfläche. Die Verfügbarkeitsprüfung berücksichtigt An- und Abreisedatum.'],['Für die Verwaltung','Der Administrationsbereich gliedert die Arbeit in Objekte, Preiszeiten, Nebenkosten und Bilder. Hinzu kommen ein Verfügbarkeitskalender, iCal-Import und Synchronisation sowie die Verwaltung von Last-Minute-Angeboten.']],images:['rental/finder.png','rental/admin.png','rental/findern.png','rental/finder2.png','rental/image.png'],labels:['Suche & Reiseplanung','Verwaltungsbereiche','Weitere Suchansicht','Unterkunftssuche im Detail','Weitere Projektansicht']},{name:'Markenauftritt & Print',type:'03 / GESTALTUNGSARCHIV',heading:'Eine Identität über verschiedene Formate hinweg.',description:'Briefbogen, Visitenkarten, Postkarten und digitale Motive aus dem bisherigen HEXEL-Portfolio. Die Originalarbeiten bleiben unverändert sichtbar: Sie zeigen die Gestaltung vor dem Namenswechsel zu FUNKNAHT.',details:[],images:['Bogen.jpg','Briefbogen.jpg','Insta.jpg','Postkarte-01.jpg','Postkarte-02.jpg','Visitkarte-01.jpg','Visitkarte-02.jpg','iphon.jpg'],labels:['Bogen','Briefbogen','Social-Media-Motiv','Postkarte 01','Postkarte 02','Visitenkarte 01','Visitenkarte 02','Mobile Ansicht']}];
function Project({project}){
 const [index,setIndex]=useState(0);
 const dialog=useRef(null);
 const titleId=useId();
 const anchor={'Pro Manager':'pro-manager','Rental':'rental','Markenauftritt & Print':'marke'}[project.name];
 const move=step=>setIndex(current=>(current+step+project.images.length)%project.images.length);
 function enlarge(event){
  if(typeof dialog.current?.showModal!=='function')return;
  event.preventDefault();
  dialog.current.showModal();
 }
 function keyboard(event){
  if(event.key==='ArrowLeft'){event.preventDefault();move(-1)}
  if(event.key==='ArrowRight'){event.preventDefault();move(1)}
 }
 return <article className="case-study" id={anchor}>
  <div className="case-intro"><div><p className="eyebrow">{project.type}</p><h3>{project.name}</h3>{project.details.length>0&&<span className="authorship">Vollständig selbst entwickelt</span>}</div><div><h4>{project.heading}</h4><p>{project.description}</p></div></div>
  <div className="case-gallery">
   <div className="case-tabs" aria-label={'Ansichten von '+project.name}>{project.labels.map((label,i)=><button type="button" key={label} aria-pressed={index===i} onClick={()=>setIndex(i)}>{label}</button>)}</div>
   <a href={'/images/'+project.images[index]} target="_blank" rel="noreferrer" onClick={enlarge} aria-label={project.name+' – Bild vergrößern'}><img src={'/images/'+project.images[index]} alt={project.name+': '+project.labels[index]} loading="lazy"/></a>
   <div className="case-caption"><span aria-live="polite">{project.labels[index]}</span><span>Originalansicht · Zum Vergrößern öffnen ↗</span><div className="gallery-controls"><button type="button" onClick={()=>move(-1)} aria-label={'Vorheriges Bild: '+project.name}>←</button><span>{index+1} / {project.images.length}</span><button type="button" onClick={()=>move(1)} aria-label={'Nächstes Bild: '+project.name}>→</button></div></div>
  </div>
  {project.details.length>0&&<div className="case-details">{project.details.map(([heading,text])=><div key={heading}><h5>{heading}</h5><p>{text}</p></div>)}<a className="text-link" href="/contact">Eine eigene Anwendung besprechen <span className="action-arrow" aria-hidden="true">↗</span></a></div>}
  <dialog ref={dialog} className="project-lightbox" aria-labelledby={titleId} onKeyDown={keyboard} onClick={event=>{if(event.target===event.currentTarget)dialog.current.close()}}>
   <div className="lightbox-toolbar"><div id={titleId}><strong>{project.name}</strong><span aria-live="polite">{project.labels[index]} · {index+1} / {project.images.length}</span></div><button type="button" className="lightbox-close" onClick={()=>dialog.current.close()} aria-label="Bildansicht schließen" autoFocus>Schließen <span aria-hidden="true">×</span></button></div>
   <img className="lightbox-image" src={'/images/'+project.images[index]} alt={project.name+': '+project.labels[index]}/>
   <div className="lightbox-controls"><button type="button" onClick={()=>move(-1)} aria-label={'Vorherige vergrößerte Ansicht: '+project.name}>← Zurück</button><a href={'/images/'+project.images[index]} target="_blank" rel="noreferrer">Originaldatei öffnen ↗</a><button type="button" onClick={()=>move(1)} aria-label={'Nächste vergrößerte Ansicht: '+project.name}>Weiter →</button></div>
  </dialog>
 </article>;
}
export default function Projects(){return <section className="section projects" id="projekte"><div className="section-head"><p className="eyebrow">ENTWICKLUNG / IM DETAIL</p><h2>Was Software<br/><em>konkret leisten kann.</em></h2><p>Zwei vollständig selbst entwickelte Anwendungen. Hier sehen Sie ihre Funktionen und die Oberflächen, in denen sie zusammenkommen.</p></div>{projects.map(p=><Project key={p.name} project={p}/>)}</section>}

