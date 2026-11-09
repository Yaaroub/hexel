import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import Projects from '../components/Projects';
import {pageMetadata} from '../../lib/seo';
import Split from '../components/Split';
import Threads from '../components/Threads';
export const metadata=pageMetadata('Arbeiten: Pro Manager und Rental | FUNKNAHT','Zwei vollständig selbst entwickelte Webanwendungen: Pro Manager für Aufgaben, Termine und Bestände, Rental für Unterkunftssuche und Vermieterverwaltung.','/projects');
export default function ProjectPage(){
 return <>
  <section className="page-head glow"><Threads className="threads--soft"/>
   <div className="wrap page-head__grid">
    <div><p className="intro">Arbeiten</p><Split as="h1" className="display">Selbst entwickelt, bis ins Detail.</Split><p className="lead">Hier sehen Sie Originalansichten aus zwei eigenen Anwendungen und die Aufgaben dahinter: Arbeit organisieren, Bestände pflegen, Unterkünfte finden und verwalten.</p></div>
    <div className="prose" style={{color:'var(--on-night-2)'}}><p>Jede Anwendung beginnt mit einer Frage: Wer arbeitet damit, und was soll danach schneller gehen? Daraus entstehen Datenmodell, Abläufe und erst dann die Oberfläche.</p><p style={{marginTop:16}}><Link className="link" href="/contact?thema=Webanwendung">Eigene Anwendung besprechen<ArrowRight size={16}/></Link></p></div>
   </div>
  </section>
  <section className="band"><div className="wrap"><Projects/></div></section>
  <section className="band band--night">
   <div className="wrap closing">
    <div><Split as="h2" className="display">Welche Aufgabe soll Ihre Software lösen?</Split><p className="lead">Beschreiben Sie den Ablauf in Ihren Worten. Wir klären, welche Daten dazugehören, wer damit arbeitet und was die erste Version können muss.</p></div>
    <Link className="btn btn--light" href="/contact?thema=Webanwendung">Projekt anfragen<ArrowRight size={18}/></Link>
   </div>
  </section>
 </>;
}
