import Link from 'next/link';
import {ArrowRight,LifeBuoy,Code2,CalendarCheck,HeartHandshake,Network,Workflow,Check,Plus,CalendarDays,Users,ClipboardList,Link2} from 'lucide-react';
import Bench from './components/Bench';
import AppMock from './components/AppMock';
import Split from './components/Split';
import Threads from './components/Threads';
import Tape from './components/Tape';
import Workbench from './components/Workbench';

const paths=[
 {icon:LifeBuoy,title:'Bei mir funktioniert etwas nicht.',text:'Im Hilfe-Portal grenzen Sie das Problem Schritt für Schritt ein. Reicht das nicht, übernehmen wir.',go:'Zum Hilfe-Portal',href:'/portal'},
 {icon:Code2,title:'Ich brauche eine Website oder Software.',text:'Wir klären gemeinsam, was die erste Version können muss und was sie kostet.',go:'Projekt anfragen',href:'/contact'},
 {icon:CalendarCheck,title:'Mein Betrieb soll Termine online annehmen.',text:'Kunden buchen selbst, Sie bestätigen mit einem Klick.',go:'Betriebsportal ansehen',href:'/betriebsportal'},
 {icon:HeartHandshake,title:'Meine Eltern brauchen Hilfe mit Handy und Banking.',text:'Smartphone, Banking und Videoanrufe, in Ruhe zu Hause erklärt.',go:'Digitalhilfe für Senioren',href:'/senioren'},
];

const services=[
 {id:'software',icon:Code2,title:'Websites und Webanwendungen',short:'Selbst entwickelt, vom Datenmodell bis zur Oberfläche',text:'Eine Website, die Ihren Betrieb in zwei Sätzen erklärt. Eine Anwendung, die einen Arbeitsablauf abbildet, statt ihn mit Tabellen und Zetteln zu umgehen. Wir entwickeln selbst, vom Datenmodell bis zur Oberfläche, und übergeben Software, die Sie verstehen und weiter betreiben können.',points:['Websites mit klarer Struktur, schnell und auf dem Smartphone gut bedienbar','Webanwendungen für Buchung, Verwaltung, Kundenportale und interne Abläufe','Bestehende Systeme übernehmen, aufräumen und gezielt erweitern'],tags:['Next.js','React','Node.js','Prisma','SQL']},
 {id:'it',icon:Network,title:'IT und Netzwerke vor Ort',short:'WLAN, Router und Geräte in Plön und Ostholstein',text:'Das WLAN reicht nicht bis ins Büro, nach dem Routerwechsel fehlen Geräte, der Drucker ist plötzlich nicht mehr erreichbar. Im Kreis Plön und in Ostholstein kommen wir vorbei, sehen uns die Einrichtung an und erklären, was wir verändern.',points:['WLAN-Abdeckung prüfen und gezielt verbessern','Router, Zugangspunkte und Geräte einrichten','Kleine Firmennetze strukturiert aufbauen und dokumentieren'],tags:['Kreis Plön','Ostholstein'],link:['Mehr zur Netzwerkhilfe','/netzwerkhilfe']},
 {id:'ki',icon:Workflow,title:'KI und Automatisierung',short:'Abläufe, die sich selbst erledigen',text:'Daten werden dreimal abgetippt, Anfragen von Hand sortiert, Rechnungen nachgetragen. Wir schauen uns an, welche Schritte sich sinnvoll automatisieren lassen, und wo KI hilft oder nur Kosten verursacht.',points:['Wiederkehrende Abläufe gemeinsam erfassen','Schnittstellen zwischen vorhandenen Programmen bauen','KI dort einsetzen, wo das Ergebnis kontrollierbar bleibt'],tags:['Schnittstellen','Automatisierung','KI-Assistenz']},
];


const questions=[
 ['Muss ich das Portal nutzen, um Sie zu beauftragen?','Nein. Websites, Software und Netzwerkhilfe können Sie direkt über das Kontaktformular anfragen. Das Portal ist ein zusätzlicher Weg, technische Probleme selbst einzugrenzen oder mit allen Angaben an uns zu übergeben.'],
 ['Was kostet eine Website oder Anwendung?','Das hängt vom Umfang ab: Inhalte, Funktionen, Anbindungen und spätere Pflege. Nach einem ersten Gespräch erhalten Sie ein Angebot mit festem Umfang. Eine Pauschale ohne Kenntnis der Aufgabe wäre geraten.'],
 ['Wie gehen Sie mit meinen Daten um?','Wir speichern nur, was für Ihr Anliegen nötig ist. Die Kundendaten im Betriebsportal gehören Ihrem Betrieb; wir sehen sie nicht ein. Sie können Ihre Daten jederzeit herunterladen oder Ihr Konto löschen.'],
];

export default function Home(){
 return <>
  <section className="hero glow">
   <Threads/>
   <span className="dims" aria-hidden="true">BLATT 01 · M 1:1 · KREIS PLÖN</span>
   <div className="wrap">
    <div className="hero__grid">
     <div className="hero-in">
      <Split as="h1" className="display" accent="leichter">Software, die Ihren Arbeitstag leichter macht.</Split>
      <p className="lead">FUNKNAHT entwickelt Websites und Webanwendungen, richtet Netzwerke ein und bringt Abläufe in Ordnung. Für Betriebe und Haushalte im Kreis Plön, in Ostholstein und überall dort, wo Software gebraucht wird.</p>
      <div className="actions"><Link className="btn btn--light" href="/contact">Projekt anfragen<ArrowRight size={18}/></Link><Link className="btn btn--ghost" href="/portal">Technisches Problem schildern</Link></div>
     </div>
     <Bench/>
    </div>
   </div>
  </section>
  <Tape/>

  <section className="band" aria-labelledby="wege">
   <div className="wrap">
    <div className="section-head"><Split id="wege" className="h2">Womit können wir helfen?</Split><p className="lead reveal reveal-delay-1">Wählen Sie den Weg, der zu Ihrem Anliegen passt. Wenn Sie unsicher sind, schreiben Sie uns einfach.</p></div>
    <ul className="doors">{paths.map(({icon:Icon,...p},i)=><li className={'door door--'+i+' reveal reveal-delay-'+Math.min(i+1,3)} key={p.title}><Link href={p.href}><span className="door__icon"><Icon size={i===0?34:26} strokeWidth={1.6}/></span><h3>{p.title}</h3><p>{p.text}</p><span className="door__go">{p.go}<ArrowRight size={18}/></span></Link></li>)}</ul>
   </div>
  </section>

  <section className="band band--stone" id="leistungen" aria-labelledby="leistungen-titel">
   <div className="wrap">
    <div className="section-head"><Split id="leistungen-titel" className="h2">Entwicklung und Technik aus einer Hand.</Split><div className="reveal reveal-delay-1"><p className="lead">Software endet nicht am Bildschirm. Sie läuft auf Geräten, in Netzwerken und in den Abläufen eines Betriebs. Deshalb betrachten wir beides.</p><p style={{marginTop:22}}><Link className="btn" href="/contact">Vorhaben besprechen<ArrowRight size={18}/></Link></p></div></div>
    <Workbench services={services.map(({icon,...x})=>x)}/>
   </div>
  </section>

  <section className="band band--night" id="betriebe" aria-labelledby="betriebe-titel">
   <div className="wrap">
    <div className="product">
     <div>
      <p className="intro">Betriebsportal</p>
      <Split id="betriebe-titel" className="display">Termine, Kunden und Aufträge an einem Ort.</Split>
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
    <div className="product__cta reveal"><Link className="btn btn--light" href="/betriebsportal">Betriebsportal ansehen<ArrowRight size={18}/></Link><span>Konto kostenlos, Tarife ab 79 € im Monat, monatlich kündbar.</span></div>
   </div>
  </section>

  <section className="band" id="arbeiten" aria-labelledby="arbeiten-titel">
   <div className="wrap">
    <div className="section-head"><div><Split id="arbeiten-titel" className="h2">Software zeigt man am besten.</Split></div><p className="lead reveal reveal-delay-1">Zwei Anwendungen, vollständig selbst entwickelt. Unterschiedliche Aufgaben, jeweils mit eigener Oberfläche für die Menschen, die damit arbeiten.</p></div>
    <article className="work">
     <div className="work__visual reveal">
      <div className="frame frame--front"><div className="frame__bar"><i/><i/><i/><span>Pro Manager – Aufgaben</span></div><img src="/images/pro-manager/tasks.png" width="1336" height="649" alt="Aufgabenboard von Pro Manager mit Spalten für Bearbeitungsstände" loading="lazy"/></div>
      <div className="frame frame--back" data-parallax="0.07"><div className="frame__bar"><i/><i/><i/></div><img src="/images/pro-manager/dashboard.png" width="1336" height="649" alt="" loading="lazy"/></div>
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
      <div className="frame frame--back" data-parallax="0.07"><div className="frame__bar"><i/><i/><i/></div><img src="/images/rental/admin.png" width="1336" height="750" alt="" loading="lazy"/></div>
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

  <span id="ablauf" aria-hidden="true"/><span id="haltung" aria-hidden="true"/>
  <section className="band band--stone" id="fragen" aria-labelledby="fragen-titel">
   <div className="wrap faq">
    <div><Split id="fragen-titel" className="h2">Häufige Fragen</Split><p className="prose" style={{marginTop:16}}>Ihre Frage ist nicht dabei? <Link className="link" href="/contact">Schreiben Sie uns.</Link></p></div>
    <div>{questions.map(([q,a])=><details key={q}><summary>{q}<Plus size={20}/></summary><p>{a}</p></details>)}</div>
   </div>
  </section>

  <section className="band band--night closing-band glow">
   <Threads className="threads--soft"/>
   <div className="wrap closing">
    <div><Split className="display">Was soll bei Ihnen besser laufen?</Split><p className="lead">Eine Website, die nicht mehr passt. Ein Ablauf, der Zeit frisst. Ein Netzwerk, das streikt. Erzählen Sie uns davon.</p></div>
    <Link className="btn btn--light" href="/contact">Projekt anfragen<ArrowRight size={18}/></Link>
   </div>
   <div className="wrap"><svg className="bigword" viewBox="0 0 1000 150" data-play="" aria-hidden="true"><text x="0" y="128" textLength="1000" lengthAdjust="spacingAndGlyphs" fontSize="150">FUNKNAHT</text></svg></div>
  </section>
 </>;
}
