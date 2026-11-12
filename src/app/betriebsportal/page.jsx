import Link from 'next/link';
import {ArrowRight,Check,Plus,CalendarDays,Users,ClipboardList,Link2} from 'lucide-react';
import AppMock from '../components/AppMock';
import Split from '../components/Split';
import Threads from '../components/Threads';
import {pageMetadata,faqSchema,breadcrumbSchema} from '../../lib/seo';
import JsonLd from '../components/JsonLd';
export const metadata=pageMetadata('Betriebsportal: Termine, Kunden und Aufträge online | FUNKNAHT','Online-Terminbuchung, Kundenkartei und Auftragsverwaltung für Handwerk, Praxen und Dienstleister. Konto kostenlos, Tarife monatlich kündbar.','/betriebsportal');
const questions=[
 ['Brauche ich technische Kenntnisse?','Nein. Sie tragen Leistungen und Öffnungszeiten ein und teilen den Link Ihrer Buchungsseite. Beim Einrichten helfen wir gern.'],
 ['Wem gehören die Kundendaten?','Ihrem Betrieb. FUNKNAHT sieht Ihre Kunden, Termine und Aufträge nicht ein. Sie können alles jederzeit herunterladen oder löschen.'],
 ['Kann ich das Betriebsportal kündigen?','Das Abonnement läuft monatlich. Sie verwalten und kündigen es selbst unter „Tarif & Abrechnung“ in Ihrem Arbeitsbereich.'],
 ['Können Mitarbeitende mitarbeiten?','Ja. Sie laden Büro und Monteure mit eigenen Rechten ein. Monteure sehen nur ihre Termine.'],
];
export default function Betriebsportal(){
 return <>
  <JsonLd data={[faqSchema(questions),breadcrumbSchema([['Start','/'],['Betriebsportal','/betriebsportal']])]}/>
  <section className="page-head glow"><Threads className="threads--soft"/>
   <div className="wrap product">
    <div>
     <p className="intro">Betriebsportal</p>
     <Split as="h1" className="display">Termine, Kunden und Aufträge an einem Ort.</Split>
     <p className="lead" style={{marginTop:22}}>Für Handwerk, Praxen und Dienstleister, die Anfragen nicht mehr auf Zetteln und in drei Postfächern verwalten wollen.</p>
     <div className="actions" style={{marginTop:30}}><Link className="btn btn--light" href="/konto?typ=betrieb">Kostenloses Konto anlegen<ArrowRight size={18}/></Link><Link className="btn btn--ghost" href="#preise">Tarife ansehen</Link></div>
    </div>
    <AppMock/>
   </div>
  </section>
  <section className="band" aria-labelledby="funktionen">
   <div className="wrap two-col">
    <div><Split as="h2" id="funktionen" className="h2">Was das Portal für Sie erledigt.</Split></div>
    <div className="bp-features">
      <ul className="feature-list feature-list--light">
       <li><Link2 size={20}/><div><strong>Eigene Buchungsseite</strong><span>Kunden wählen Leistung und freie Zeit. Doppelbuchungen sind ausgeschlossen.</span></div></li>
       <li><CalendarDays size={20}/><div><strong>Termine bestätigen</strong><span>Neue Anfragen erscheinen sofort, Sie werden per E-Mail benachrichtigt.</span></div></li>
       <li><Users size={20}/><div><strong>Kundenkartei</strong><span>Kontakte und Notizen, nur für Ihren Betrieb sichtbar.</span></div></li>
       <li><ClipboardList size={20}/><div><strong>Aufträge</strong><span>Vom Angebot bis zur Erledigung, mit Wert und Bearbeitungsstand.</span></div></li>
      </ul>
    </div>
   </div>
  </section>
  <section className="band band--night" id="preise" aria-labelledby="preise-titel">
   <div className="wrap">
    <div className="section-head"><Split as="h2" id="preise-titel" className="h2">Tarife</Split><p className="lead">Das Konto ist kostenlos. Ein Tarif wird erst mit der Zahlung aktiv und ist monatlich kündbar.</p></div>
    <div className="pricing reveal">
     <div className="price"><h3>Basis</h3><p className="price__amount">79 €<small>pro Monat</small></p><ul><li><Check size={16}/>Buchungsseite und Terminkalender</li><li><Check size={16}/>Bis zu 10 Kunden und 20 Termine im Monat</li><li><Check size={16}/>Bis zu 10 Leistungen</li><li><Check size={16}/>KI-Assistent im Hilfe-Portal</li></ul><Link className="btn btn--light" href="/konto?typ=betrieb">Konto anlegen</Link></div>
     <div className="price price--focus"><h3>Betrieb</h3><p className="price__amount">229 €<small>pro Monat</small></p><ul><li><Check size={16}/>Alles aus Basis</li><li><Check size={16}/>Auftragsverwaltung</li><li><Check size={16}/>Bis zu 500 Kunden und Termine im Monat</li><li><Check size={16}/>Bis zu 100 Leistungen</li></ul><Link className="btn btn--light" href="/konto?typ=betrieb">Konto anlegen</Link></div>
     <div className="price"><h3>Individuell</h3><p className="price__amount">Nach Absprache</p><ul><li><Plus size={16}/>Eigene Abläufe und Felder</li><li><Plus size={16}/>Anbindung an vorhandene Software</li><li><Plus size={16}/>Mehrere Standorte</li></ul><Link className="link" href="/contact?thema=Betriebsportal">Umfang besprechen<ArrowRight size={16}/></Link></div>
    </div>

   </div>
  </section>
  <section className="band band--stone" aria-labelledby="bp-fragen">
   <div className="wrap faq">
    <div><Split as="h2" id="bp-fragen" className="h2">Fragen zum Betriebsportal</Split></div>
    <div>{questions.map(([q,a])=><details key={q}><summary>{q}<Plus size={20}/></summary><p>{a}</p></details>)}</div>
   </div>
  </section>
 </>;
}
