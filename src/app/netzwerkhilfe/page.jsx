import Link from 'next/link';
import WorkspaceScene from '../components/WorkspaceScene';
import {regions,regionText,organization,pageMetadata} from '../../lib/seo';

export const metadata=pageMetadata('Netzwerkhilfe in Plön & Ostholstein | FUNKNAHT','WLAN-Probleme, Router-Einrichtung und Netzwerkhilfe im Kreis Plön und Ostholstein. Ausgangslage, Einsatz und Konditionen gemeinsam klären.','/netzwerkhilfe');
const faqs=[
  ['Wo bietet FUNKNAHT Netzwerkhilfe an?',`Das Vor-Ort-Gebiet umfasst ${regionText}. Nennen Sie Ihren Ort bei der Anfrage. Ob ein Einsatz möglich ist und welcher Termin passt, wird individuell vereinbart.`],
  ['Bei welchen Problemen kann ich mich melden?','Zum Beispiel, wenn das WLAN an bestimmten Stellen ausfällt, Geräte keine Verbindung bekommen oder nach einem Routerwechsel etwas nicht mehr funktioniert. Wichtig sind die betroffenen Geräte und eine Beschreibung, wann der Fehler auftritt.'],
  ['Was kostet die Netzwerkhilfe?','Der Aufwand hängt von der Ausgangslage, dem vereinbarten Umfang und gegebenenfalls der Anfahrt ab. Diese Konditionen werden vor der Beauftragung besprochen. Ein genauer Preis ohne Beschreibung des Problems wäre eine Vermutung.'],
  ['Brauche ich einen neuen Router oder zusätzliche Geräte?','Das lässt sich erst nach einem Blick auf die vorhandene Einrichtung beurteilen. Routerstandort, betroffene Geräte und die Art der Verbindung gehören zur Einordnung. Beschreiben Sie zunächst das Verhalten, bevor Sie neue Hardware kaufen.'],
  ['Was ist für die Anfrage hilfreich?','Ihr Ort, das Routermodell, die betroffenen Geräte und eine kurze Beschreibung. Hilfreich ist auch, ob das Problem nach einer Änderung begonnen hat. Passwörter oder Zugangsdaten gehören nicht in das Kontaktformular.'],
  ['Ist FUNKNAHT das frühere HEXEL?','Ja. Aus HEXEL wurde FUNKNAHT. Die bisherigen Software- und Gestaltungsarbeiten gehören weiterhin zum Portfolio. Netzwerkhilfe ist ein weiterer Bereich des Angebots.']
];
const services=[
  {n:'01',title:'WLAN & Reichweite',lead:'Die Verbindung funktioniert am Router, aber am Arbeitsplatz kaum noch.',text:'Wir betrachten, wo das Problem auftritt und welche Geräte betroffen sind. Das hilft, zwischen einer Frage der Funkverbindung, einer Geräteeinstellung und einem anderen Fehler im Netzwerk zu unterscheiden.',points:['Standort und vorhandene Einrichtung betrachten','Unterschiede zwischen Räumen und Geräten einordnen','Sinnvolle Änderungen an der Ausgangslage besprechen']},
  {n:'02',title:'Router & Einrichtung',lead:'Nach dem Wechsel ist das Internet da. Ein Teil der Geräte aber nicht.',text:'Ein neuer Router verändert die Einrichtung des Netzwerks. Wir unterstützen beim Verbinden der vorhandenen Geräte und bei den relevanten Einstellungen. Auch die Frage, welche Angaben oder Zugänge vor Ort gebraucht werden, klären wir im Gespräch.',points:['Routermodell und bisherige Einrichtung erfassen','Geräte wieder mit dem Netzwerk verbinden','Relevante Einstellungen nachvollziehbar erklären']},
  {n:'03',title:'Geräte & Verbindungen',lead:'Ein Gerät fällt aus, während die anderen weiterarbeiten.',text:'Wir schauen auf die Verbindung zwischen dem betroffenen Gerät und dem lokalen Netzwerk. Seit wann besteht der Fehler? Tritt er ständig oder nur gelegentlich auf? Solche Beobachtungen geben der Fehlersuche eine Richtung.',points:['Betroffene Geräte und Verbindungsart einordnen','Änderungen und sichtbare Fehlermeldungen berücksichtigen','Nächste Schritte anhand der Beobachtungen klären']}
];

export default function NetworkHelp(){
 const serviceSchema={'@context':'https://schema.org','@type':'Service',name:'Netzwerk- und WLAN-Hilfe',serviceType:'Netzwerkhilfe, WLAN-Fehlersuche und Router-Einrichtung',provider:organization,areaServed:organization.areaServed,description:metadata.description};
 const faqSchema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))};
 return <>
   <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(serviceSchema).replace(/</g,'\\u003c')}}/>
   <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema).replace(/</g,'\\u003c')}}/>
   <section className="section page-intro">
     <p className="page-kicker">FUNKNAHT / NETZWERK & WLAN</p>
     <div className="page-heading-grid">
       <div><h1>Verbindungen verstehen.<br/>Probleme eingrenzen.</h1><p className="page-lead">Das WLAN bricht ab. Ein Gerät kommt nicht ins Netz. Nach dem Routerwechsel funktioniert der Arbeitsplatz anders als vorher. FUNKNAHT unterstützt bei Netzwerkfragen vor Ort im Kreis Plön und in Ostholstein.</p><div className="region-tags">{regions.map(r=><span key={r}>{r}</span>)}</div><Link className="button" href="/contact?thema=Netzwerkhilfe">Netzwerkhilfe anfragen <span className="action-arrow" aria-hidden="true">↗</span></Link></div>
       <WorkspaceScene variant="network"/>
     </div>
     <div className="technical-note"><span>VOR DEM TERMIN</span><p>Nennen Sie uns Ihren Ort, das betroffene Gerät und was Sie beobachten. Einsatz, Umfang und Konditionen werden vor der Beauftragung abgestimmt.</p></div>
   </section>
   <section className="section">
     <div className="split-section"><div><p className="section-label">WOBEI WIR UNTERSTÜTZEN</p><h2 className="section-title">Erst beobachten.<br/>Dann etwas ändern.</h2></div><p>Ein Verbindungsfehler hat nicht immer dieselbe Ursache. Wir beginnen mit Ihrer vorhandenen Einrichtung und den Unterschieden zwischen funktionierenden und betroffenen Geräten. Drei typische Ausgangspunkte:</p></div>
     <div className="service-rows">{services.map(s=><article className="service-row" key={s.n}><span className="section-label">{s.n}</span><div><h3>{s.title}</h3><p>{s.lead}</p></div><div><p>{s.text}</p><ul className="fact-list">{s.points.map(p=><li key={p}>{p}</li>)}</ul></div></article>)}</div>
   </section>
   <section className="section split-section">
     <div><p className="section-label">REGIONAL VOR ORT</p><h2 className="section-title">Kreis Plön.<br/>Ostholstein.</h2></div>
     <div><p>Für die Vor-Ort-Hilfe zählt der konkrete Standort. Schreiben Sie Ihren Ort bereits in die Anfrage, damit Einsatzmöglichkeit und Anfahrt gemeinsam geklärt werden können. Einen Termin vereinbaren wir passend zum Anliegen.</p><p>Wenn sich vor Ort eine andere Ausgangslage zeigt, wird auch der weitere Schritt besprochen. So bleibt nachvollziehbar, was geprüft wird und welche Änderung sinnvoll ist.</p><Link className="text-link" href="/contact?thema=Netzwerkhilfe">Anfrage mit Standort senden <span className="action-arrow" aria-hidden="true">↗</span></Link></div>
   </section>
   <section className="section faq"><p className="section-label">VOR DER ANFRAGE</p><h2 className="section-title">Was Sie wissen möchten.</h2>{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
   <section className="closing"><div className="section split-section"><div><p className="section-label">DER NÄCHSTE SCHRITT</p><h2 className="section-title">Was funktioniert<br/>bei Ihnen gerade nicht?</h2></div><div><p>Ein kurzer Überblick reicht für den Anfang: Ihr Ort, das betroffene Gerät und der Moment, in dem die Verbindung fehlt.</p><Link className="button" href="/contact?thema=Netzwerkhilfe">Problem beschreiben <span className="action-arrow" aria-hidden="true">↗</span></Link></div></div></section>
 </>;
}
