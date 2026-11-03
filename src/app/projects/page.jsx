import Projects from '../components/Projects';
import WorkspaceScene from '../components/WorkspaceScene';
import {pageMetadata} from '../../lib/seo';
export const metadata=pageMetadata('Projekte | FUNKNAHT','Pro Manager, Rental und Branding: Einblicke in die bisherigen HEXEL-Projekte, jetzt unter dem Namen FUNKNAHT.','/projects');
export default function Page(){return <><section className="section illustrated-hero"><div><p className="eyebrow">FUNKNAHT / EIGENE ARBEITEN</p><h1>Von der Aufgabe<br/><em>zur Anwendung.</em></h1><p className="intro">Pro Manager organisiert Aufgaben, Termine und Bestände. Rental verbindet Unterkunftssuche und Verwaltung. Beide Anwendungen sind vollständig selbst entwickelt. Hier sehen Sie die Oberflächen, die Funktionen und die Gedanken dahinter.</p><a className="text-link" href="#projektarchiv">Die Arbeiten im Detail ↓</a></div><WorkspaceScene variant="projects"/></section><div id="projektarchiv"><Projects/></div></>}
