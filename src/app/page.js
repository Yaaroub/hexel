import Link from 'next/link';
import {ArrowRight,LifeBuoy,Code2,CalendarCheck,HeartHandshake,Network,Workflow,Check,Plus,CalendarDays,Users,ClipboardList,Link2} from 'lucide-react';
import Bench from './components/Bench';
import AppMock from './components/AppMock';
import ProcessSteps from './components/ProcessSteps';
import RegionChart from './components/RegionChart';

const paths=[
 {icon:LifeBuoy,title:'Bei mir funktioniert etwas nicht.',text:'Im Hilfe-Portal grenzen Sie das Problem Schritt für Schritt ein. Reicht das nicht, übergeben Sie Ihre Angaben an uns.',go:'Zum Hilfe-Portal',href:'/portal'},
 {icon:Code2,title:'Ich brauche eine Website oder Software.',text:'Beschreiben Sie Ihr Vorhaben. Wir klären gemeinsam, was die erste Version können muss und was sie kostet.',go:'Projekt anfragen',href:'/contact'},
 {icon:CalendarCheck,title:'Mein Betrieb soll Termine online annehmen.',text:'Kunden buchen freie Zeiten selbst, Sie bestätigen mit einem Klick. Dazu Kunden und Aufträge an einem Ort.',go:'Betriebsportal ansehen',href:'#betriebe'},
 {icon:HeartHandshake,title:'Meine Eltern brauchen Hilfe mit Handy und Banking.',text:'Wir erklären Smartphone, Online-Banking und Videoanrufe in Ruhe zu Hause, und schützen vor Betrugsmaschen.',go:'Digitalhilfe für Senioren',href:'/senioren'},
];

const services=[
 {id:'software',icon:Code2,title:'Websites und Webanwendungen',text:'Eine Website, die Ihren Betrieb in zwei Sätzen erklärt. Eine Anwendung, die einen Arbeitsablauf abbildet, statt ihn mit Tabellen und Zetteln zu umgehen. Wir entwickeln selbst, vom Datenmodell bis zur Oberfläche, und übergeben Software, die Sie verstehen und weiter betreiben können.',points:['Websites mit klarer Struktur, schnell und auf dem Smartphone gut bedienbar','Webanwendungen für Buchung, Verwaltung, Kundenportale und interne Abläufe','Bestehende Systeme übernehmen, aufräumen und gezielt erweitern'],tags:['Next.js','React','Node.js','Prisma','SQL']},
 {id:'it',icon:Network,title:'IT und Netzwerke vor Ort',text:'Das WLAN reicht nicht bis ins Büro, nach dem Routerwechsel fehlen Geräte, der Drucker ist plötzlich nicht mehr erreichbar. Im Kreis Plön und in Ostholstein kommen wir vorbei, sehen uns die Einrichtung an und erklären, was wir verändern.',points:['WLAN-Abdeckung prüfen und gezielt verbessern','Router, Zugangspunkte und Geräte einrichten','Kleine Firmennetze strukturiert aufbauen und dokumentieren'],tags:['Kreis Plön','Ostholstein'],link:['Mehr zur Netzwerkhilfe','/netzwerkhilfe']},
 {id:'ki',icon:Workflow,title:'KI und Automatisierung',text:'Daten werden dreimal abgetippt, Anfragen von Hand sortiert, Rechnungen nachgetragen. Wir schauen uns an, welche Schritte sich sinnvoll automatisieren lassen, und wo KI hilft oder nur Kosten verursacht.',points:['Wiederkehrende Abläufe gemeinsam erfassen','Schnittstellen zwischen vorhandenen Programmen bauen','KI dort einsetzen, wo das Ergebnis kontrollierbar bleibt'],tags:['Schnittstellen','Automatisierung','KI-Assistenz']},
];

const steps=[
 ['Sie schildern Ihr Anliegen','Über das Kontaktformular oder das Hilfe-Portal. Ein paar Sätze reichen: Was soll besser funktionieren, und was ist schon vorhanden?'],
 ['Wir klären den Umfang','Im Gespräch trennen wir Notwendiges von Wünschen für später. Sie wissen danach, was die erste Version leisten soll.'],
 ['Sie erhalten ein klares Angebot','Mit Umfang, Zeitrahmen und Preis. Erst wenn alles für Sie stimmt, geht es los.'],
 ['Umsetzung mit Zwischenständen','Sie sehen früh, was entsteht, und können eingreifen. Zum Schluss gibt es eine Übergabe, bei der wir alles erklären.'],
];

const questions=[
 ['Muss ich das Portal nutzen, um Sie zu beauftragen?','Nein. Websites, Software und Netzwerkhilfe können Sie direkt über das Kontaktformular anfragen. Das Portal ist ein zusätzlicher Weg, technische Probleme selbst einzugrenzen oder mit allen Angaben an uns zu übergeben.'],
 ['Was kostet eine Website oder Anwendung?','Das hängt vom Umfang ab: Inhalte, Funktionen, Anbindungen und spätere Pflege. Nach einem ersten Gespräch erhalten Sie ein Angebot mit festem Umfang. Eine Pauschale ohne Kenntnis der Aufgabe wäre geraten.'],
 ['Wo bieten Sie Hilfe vor Ort an?','Im Kreis Plön und in Ostholstein, etwa in Plön, Preetz, Lütjenburg, Eutin, Neustadt oder auf Fehmarn. Digitale Projekte setzen wir deutschlandweit um.'],
 ['Wie gehen Sie mit meinen Daten um?','Wir speichern nur, was für Ihr Anliegen nötig ist. Die Kundendaten im Betriebsportal gehören Ihrem Betrieb; wir sehen sie nicht ein. Sie können Ihre Daten jederzeit herunterladen oder Ihr Konto löschen.'],
 ['Kann ich das Betriebsportal kündigen?','Das Abonnement läuft monatlich. Sie verwalten und kündigen es selbst unter „Tarif & Abrechnung“ in Ihrem Arbeitsbereich.'],
];

export default function Home(){
 return <>
  <section className="hero">
   <div className="wrap">
    <div className="hero__grid">
     <div>
      <h1 className="display">Software, die Ihren Arbeitstag leichter macht.</h1>
      <p className="lead">FUNKNAHT entwickelt Websites und Webanwendungen, richtet Netzwerke ein und bringt Abläufe in Ordnung. Für Betriebe und Haushalte im Kreis Plön, in Ostholstein und überall dort, wo Software gebraucht wird.</p>
      <div className="actions"><Link className="btn btn--light" href="/contact">Projekt anfragen<ArrowRight size={18}/></Link><Link className="btn btn--ghost" href="/portal">Technisches Problem schildern</Link></div>
     </div>
     <Bench/>
    </div>
    <dl className="hero__facts">
     <div><dt>Selbst entwickelt</dt><dd>Vom Datenmodell bis zur Oberfläche, ohne Baukasten.</dd></div>
     <div><dt>Vor Ort</dt><dd>Netzwerkhilfe im Kreis Plön und in Ostholstein.</dd></div>
     <div><dt>Hilfe-Portal</dt><dd>Anliegen jederzeit erfassen und Schritt für Schritt eingrenzen.</dd></div>
    </dl>
   </div>
  </section>

  <section className="band" aria-labelledby="wege">
   <div className="wrap">
    <div className="section-head"><h2 id="wege" className="h2 reveal">Womit können wir helfen?</h2><p className="lead reveal reveal-delay-1">Wählen Sie den Weg, der zu Ihrem Anliegen passt. Wenn Sie unsicher sind, schreiben Sie uns einfach.</p></div>
    <ul className="paths">{paths.map(({icon:Icon,...p},i)=><li className={'path reveal reveal-delay-'+Math.min(i+1,3)} key={p.title}><Link href={p.href}><span className="path__icon"><Icon size={22}/></span><h3>{p.title}</h3><p>{p.text}</p><span className="path__go">{p.go}<ArrowRight size={17}/></span></Link></li>)}</ul>
   </div>
  </section>

  <section className="band band--stone" id="leistungen" aria-labelledby="leistungen-titel">
   <div className="wrap services">
    <div className="services__aside">
     <p className="intro">Leistungen</p>
     <h2 id="leistungen-titel" className="h2">Entwicklung und Technik aus einer Hand.</h2>
     <div className="prose"><p>Software endet nicht am Bildschirm. Sie läuft auf Geräten, in Netzwerken und in den Abläufen eines Betriebs. Deshalb betrachten wir beides: den Code und die Umgebung, in der er arbeitet.</p></div>
     <div className="actions" style={{marginTop:28}}><Link className="btn" href="/contact">Vorhaben besprechen<ArrowRight size={18}/></Link></div>
    </div>
    <div>{services.map(({icon:Icon,...s})=><article className="service reveal" id={s.id} key={s.id}>
     <div className="service__title"><Icon size={26} strokeWidth={1.6}/><h3 className="h3">{s.title}</h3></div>
     <p className="prose">{s.text}</p>
     <ul>{s.points.map(p=><li key={p}>{p}</li>)}</ul>
     <div className="service__tags">{s.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div>
     {s.link&&<p style={{marginTop:18}}><Link className="link" href={s.link[1]}>{s.link[0]}<ArrowRight size={16}/></Link></p>}
    </article>)}</div>
   </div>
  </section>

  <section className="band band--night" id="betriebe" aria-labelledby="betriebe-titel">
   <div className="wrap">
    <div className="product">
     <div>
      <p className="intro">Betriebsportal</p>
      <h2 id="betriebe-titel" className="display">Termine, Kunden und Aufträge an einem Ort.</h2>
      <p className="lead" style={{marginTop:22}}>Für Handwerk, Praxen und Dienstleister, die Anfragen nicht mehr auf Zetteln und in drei Postfächern verwalten wollen.</p>
      <ul className="feature-list">
       <li><Link2 size={20}/><div><strong>Eigene Buchungsseite</strong><span>Kunden wählen Leistung und freie Zeit. Doppelbuchungen sind ausgeschlossen.</span></div></li>
       <li><CalendarDays size={20}/><div><strong>Termine bestätigen</strong><span>Neue Anfragen erscheinen sofort, Sie werden per E-Mail benachrichtigt.</span></div></li>
       <li><Users size={20}/><div><strong>Kundenkartei</strong><span>Kontakte und Notizen, nur für Ihren Betrieb sichtbar.</span></div></li>
       <li><ClipboardList size={20}/><div><strong>Aufträge</strong><span>Vom Angebot bis zur Erledigung, mit Wert und Bearbeitungsstand.</span></div></li>
      </ul>
     </div>
     <AppMock/>
    </div>
    <div className="pricing reveal">
     <div className="price"><h3>Basis</h3><p className="price__amount">79 €<small>pro Monat</small></p><ul><li><Check size={16}/>Buchungsseite und Terminkalender</li><li><Check size={16}/>Bis zu 10 Kunden und 20 Termine im Monat</li><li><Check size={16}/>Bis zu 10 Leistungen</li><li><Check size={16}/>KI-Assistent im Hilfe-Portal</li></ul><Link className="btn btn--light" href="/konto?typ=betrieb">Konto anlegen</Link></div>
     <div className="price price--focus"><h3>Betrieb</h3><p className="price__amount">229 €<small>pro Monat</small></p><ul><li><Check size={16}/>Alles aus Basis</li><li><Check size={16}/>Auftragsverwaltung</li><li><Check size={16}/>Bis zu 500 Kunden und Termine im Monat</li><li><Check size={16}/>Bis zu 100 Leistungen</li></ul><Link className="btn btn--light" href="/konto?typ=betrieb">Konto anlegen</Link></div>
     <div className="price"><h3>Individuell</h3><p className="price__amount">Nach Absprache</p><ul><li><Plus size={16}/>Eigene Abläufe und Felder</li><li><Plus size={16}/>Anbindung an vorhandene Software</li><li><Plus size={16}/>Mehrere Standorte</li></ul><Link className="link" href="/contact?thema=Betriebsportal">Umfang besprechen<ArrowRight size={16}/></Link></div>
    </div>
    <p className="small" style={{marginTop:18,color:'var(--on-night-2)'}}>Das Konto ist kostenlos. Ein Tarif wird erst mit Abschluss der Zahlung aktiv und lässt sich monatlich selbst verwalten.</p>
   </div>
  </section>

  <section className="band" id="arbeiten" aria-labelledby="arbeiten-titel">
   <div className="wrap">
    <div className="section-head"><div><p className="intro reveal">Eigene Arbeiten</p><h2 id="arbeiten-titel" className="h2 reveal">Software zeigt man am besten.</h2></div><p className="lead reveal reveal-delay-1">Zwei Anwendungen, vollständig selbst entwickelt. Unterschiedliche Aufgaben, jeweils mit eigener Oberfläche für die Menschen, die damit arbeiten.</p></div>
    <article className="work">
     <div className="work__visual reveal">
      <div className="frame frame--front"><div className="frame__bar"><i/><i/><i/><span>Pro Manager – Aufgaben</span></div><img src="/images/pro-manager/tasks.png" width="1336" height="649" alt="Aufgabenboard von Pro Manager mit Spalten für Bearbeitungsstände" loading="lazy"/></div>
      <div className="frame frame--back"><div className="frame__bar"><i/><i/><i/></div><img src="/images/pro-manager/dashboard.png" width="1336" height="649" alt="" loading="lazy"/></div>
     </div>
     <div className="reveal reveal-delay-1">
      <h3 className="h2" style={{fontSize:'clamp(1.6rem,2.6vw,2.1rem)'}}>Pro Manager</h3>
      <p className="prose">Aufgaben, Termine, Produktbestände und Notizen in einer Anwendung. Das Board zeigt Zuständigkeiten, Prioritäten und Fälligkeiten; Sprints und Grenzen für laufende Arbeit bilden auch größere Vorhaben ab.</p>
      <div className="work__meta"><span className="tag">Organisation</span><span className="tag">Kanban und Sprints</span><span className="tag">Bestandsführung</span></div>
      <Link className="link" href="/projects#pro-manager">Alle Ansichten<ArrowRight size={16}/></Link>
     </div>
    </article>
    <article className="work work--flip">
     <div className="work__visual reveal">
      <div className="frame frame--front"><div className="frame__bar"><i/><i/><i/><span>Rental – Unterkunftssuche</span></div><img src="/images/rental/finder.png" width="1336" height="750" alt="Suchoberfläche von Rental mit Filtern für Zeitraum, Ort und Ausstattung" loading="lazy"/></div>
      <div className="frame frame--back"><div className="frame__bar"><i/><i/><i/></div><img src="/images/rental/admin.png" width="1336" height="750" alt="" loading="lazy"/></div>
     </div>
     <div className="reveal reveal-delay-1">
      <h3 className="h2" style={{fontSize:'clamp(1.6rem,2.6vw,2.1rem)'}}>Rental</h3>
      <p className="prose">Gäste suchen nach Zeitraum, Ort und Ausstattung. Vermieter pflegen Objekte, Preiszeiten, Nebenkosten und Verfügbarkeiten, inklusive Kalenderabgleich per iCal.</p>
      <div className="work__meta"><span className="tag">Ferienvermietung</span><span className="tag">Verfügbarkeiten</span><span className="tag">Verwaltungsbereich</span></div>
      <Link className="link" href="/projects#rental">Suche und Verwaltung ansehen<ArrowRight size={16}/></Link>
     </div>
    </article>
   </div>
  </section>

  <section className="band band--stone" id="ablauf" aria-labelledby="ablauf-titel">
   <span id="haltung" aria-hidden="true"/>
   <div className="wrap process">
    <div><p className="intro">Zusammenarbeit</p><h2 id="ablauf-titel" className="h2">So wird aus einer Idee ein Werkzeug.</h2><p className="prose" style={{marginTop:20}}>Sie müssen keine technischen Begriffe kennen. Wichtig ist, was Ihnen im Alltag Zeit kostet. Den Rest übersetzen wir.</p></div>
    <ProcessSteps steps={steps}/>
   </div>
  </section>

  <section className="band" aria-labelledby="region-titel">
   <div className="wrap region">
    <div>
     <p className="intro">Einsatzgebiet</p>
     <h2 id="region-titel" className="h2">Vor Ort zwischen Kieler Förde und Fehmarn.</h2>
     <p className="prose" style={{marginTop:20}}>Für Netzwerkhilfe kommen wir zu Ihnen, ins Büro, in die Werkstatt oder nach Hause. Termin, Anfahrt und Umfang stimmen wir vorher ab. Software und Websites entwickeln wir für Kunden in ganz Deutschland.</p>
     <div className="region__list"><span className="tag">Kreis Plön</span><span className="tag">Ostholstein</span><span className="tag">Digital: deutschlandweit</span></div>
     <p style={{marginTop:26}}><Link className="link" href="/netzwerkhilfe">So läuft ein Einsatz ab<ArrowRight size={16}/></Link></p>
    </div>
    <RegionChart/>
   </div>
  </section>

  <section className="band band--stone" id="fragen" aria-labelledby="fragen-titel">
   <div className="wrap faq">
    <div><h2 id="fragen-titel" className="h2">Häufige Fragen</h2><p className="prose" style={{marginTop:16}}>Ihre Frage ist nicht dabei? <Link className="link" href="/contact">Schreiben Sie uns.</Link></p></div>
    <div>{questions.map(([q,a])=><details key={q}><summary>{q}<Plus size={20}/></summary><p>{a}</p></details>)}</div>
   </div>
  </section>

  <section className="band band--night">
   <div className="wrap closing">
    <div><h2 className="display">Was soll bei Ihnen besser laufen?</h2><p className="lead">Eine Website, die nicht mehr passt. Ein Ablauf, der Zeit frisst. Ein Netzwerk, das streikt. Erzählen Sie uns davon.</p></div>
    <Link className="btn btn--light" href="/contact">Projekt anfragen<ArrowRight size={18}/></Link>
   </div>
  </section>
 </>;
}
