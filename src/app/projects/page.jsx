import Link from 'next/link';
import Projects from '../components/Projects';
import WorkspaceScene from '../components/WorkspaceScene';
import {pageMetadata} from '../../lib/seo';

export const metadata=pageMetadata(
  'Eigene Software & Gestaltungsarbeiten | FUNKNAHT',
  'Pro Manager und Rental: vollständig selbst entwickelte Webanwendungen. Originalansichten, Funktionen und das Gestaltungsarchiv von FUNKNAHT.',
  '/projects'
);

export default function ProjectPage(){
  return <>
    <section className="section page-intro">
      <p className="page-kicker">FUNKNAHT / AUSGEWÄHLTE ARBEITEN</p>
      <div className="page-heading-grid">
        <div>
          <h1>Software lässt sich<br/>am besten zeigen.</h1>
          <p className="page-lead">Pro Manager und Rental sind vollständig selbst entwickelt. Hier geht es um die Aufgaben hinter den Oberflächen: Arbeit organisieren, Informationen pflegen und die passende Unterkunft finden.</p>
          <a className="text-link" href="#projektarchiv">Originalansichten öffnen <span className="action-arrow down" aria-hidden="true">↓</span></a>
        </div>
        <WorkspaceScene variant="projects"/>
      </div>
      <div className="technical-note"><span>ENTWICKLUNG / GESTALTUNG / UMSETZUNG</span><p>Die gezeigten Ansichten stammen aus den eigenen Anwendungen. Das ergänzende Markenarchiv dokumentiert auch Arbeiten aus der Zeit vor dem Namenswechsel von HEXEL zu FUNKNAHT.</p></div>
    </section>
    <div id="projektarchiv"><Projects/></div>
    <section className="section split-section">
      <div><p className="section-label">VON DIESEN ARBEITEN ZU IHREM VORHABEN</p><h2 className="section-title">Welche Aufgabe<br/>soll Ihre Anwendung lösen?</h2></div>
      <div><p>Vielleicht müssen Aufgaben und Zuständigkeiten an einem Ort zusammenkommen. Vielleicht sollen Kundinnen und Kunden Informationen selbst eingeben oder nach bestimmten Kriterien suchen. Der erste Schritt ist, diesen Ablauf in Ihren Worten zu beschreiben.</p><p>Wir klären, welche Daten dazugehören, wer damit arbeitet und was eine erste nutzbare Version können muss. Daraus entsteht ein Umfang, über den sich konkret sprechen lässt.</p><Link className="button" href="/contact?thema=Webanwendung">Eine Anwendung besprechen <span className="action-arrow" aria-hidden="true">↗</span></Link></div>
    </section>
  </>;
}
