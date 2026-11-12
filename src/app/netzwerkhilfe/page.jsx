import Link from 'next/link';
import {ArrowRight,Plus,Wifi,Router,MonitorSmartphone,Check} from 'lucide-react';
import RegionChart from '../components/RegionChart';
import ProcessSteps from '../components/ProcessSteps';
import NoticeBanner from '../components/NoticeBanner';
import {organization,pageMetadata,breadcrumbSchema} from '../../lib/seo';
import {routers} from '../../lib/profile';
import {privateRates,businessRates,businessPlans,euro} from '../../lib/pricing';
import ScopeNote from '../components/ScopeNote';
import JsonLd from '../components/JsonLd';
import Split from '../components/Split';
import Threads from '../components/Threads';
import WifiPlan from '../components/WifiPlan';

export const metadata=pageMetadata('Netzwerk, WLAN und Router-Hilfe in Kiel, Plön und Ostholstein | FUNKNAHT','WLAN-Probleme, FRITZ!Box, MikroTik, Speedport und UniFi einrichten, VPN und Netzwerk-Betreuung. Vor Ort in Kiel, im Kreis Plön und in Ostholstein.','/netzwerkhilfe');

const cases=[
 {icon:Wifi,title:'WLAN und Reichweite',text:'Am Router ist das Netz stark, im Büro oder Obergeschoss kaum noch. Wir messen, wo es abbricht, und schlagen eine Lösung vor, die zu Ihrem Gebäude passt.'},
 {icon:Router,title:'Router und Einrichtung',text:'Neuer Anschluss, neuer Router, und plötzlich fehlen Drucker, Kamera oder Kasse. Wir verbinden die Geräte wieder und erklären die wichtigen Einstellungen.'},
 {icon:MonitorSmartphone,title:'Geräte und kleine Firmennetze',text:'Ein Gerät fällt immer wieder aus, oder das Netz ist über die Jahre gewachsen. Wir bringen Ordnung hinein und dokumentieren, was wo hängt.'},
];
const steps=[
 ['Sie beschreiben das Problem','Was funktioniert nicht, seit wann, und welche Geräte sind betroffen? Am einfachsten über das Hilfe-Portal, dort führen Fragen durch die ersten Prüfschritte.'],
 ['Wir schätzen den Aufwand ein','Sie erfahren vorab, ob ein Einsatz vor Ort sinnvoll ist und mit welchem Aufwand und welchen Kosten Sie rechnen können.'],
 ['Termin vor Ort','Wir sehen uns die Einrichtung an, finden die Ursache und beheben sie, wenn möglich, direkt.'],
 ['Sie wissen, was geändert wurde','Zum Schluss erklären wir, was wir verändert haben. Auf Wunsch schriftlich, damit es beim nächsten Mal schneller geht.'],
];
const faqs=[
 ['Wo bieten Sie Netzwerkhilfe an?','In Kiel, im Kreis Plön und in Ostholstein, zum Beispiel in Kiel, Plön, Schwentinental, Preetz, Lütjenburg, Schönberg, Eutin, Malente, Neustadt, Oldenburg, Heiligenhafen und auf Fehmarn. Nennen Sie bei der Anfrage Ihren Ort.'],
 ['Was kostet ein Einsatz?','Für Haushalte '+privateRates.hour+' € pro Stunde plus '+privateRates.travel+' € Anfahrt, für Betriebe '+businessRates.hour+' € netto plus '+businessRates.travel+' € Anfahrt. Abgerechnet wird im 15-Minuten-Takt. Sie erhalten vorab eine Einschätzung.'],
 ['Welche Router richten Sie ein?','Alle gängigen Router und Firewalls: '+routers.join(', ')+'.'],
 ['Reparieren Sie auch defekte Geräte?','Nein. Wir arbeiten an Netzwerk und Software. Defekte Hardware wie gebrochene Displays oder Akkus tauschen wir nicht.'],
 ['Brauche ich neue Hardware?','Oft nicht. Häufig liegt es am Standort, an Einstellungen oder an einem einzelnen Gerät. Kaufen Sie bitte nichts Neues, bevor wir uns die Einrichtung angesehen haben.'],
 ['Was sollte ich für die Anfrage bereithalten?','Ihren Ort, das Routermodell, die betroffenen Geräte und eine kurze Beschreibung, wann der Fehler auftritt. Passwörter gehören nicht in das Formular; die klären wir vor Ort.'],
];

export default function NetworkHelp(){
 const schema={'@context':'https://schema.org','@type':'Service',name:'Netzwerk-, WLAN- und Router-Hilfe',serviceType:'Netzwerkhilfe, WLAN-Fehlersuche, Router-Einrichtung, Netzwerk-Betreuung',provider:{'@id':organization['@id']},offers:[{'@type':'Offer',name:'Stundensatz Haushalte',price:String(privateRates.hour),priceCurrency:'EUR'},{'@type':'Offer',name:'Stundensatz Betriebe (netto)',price:String(businessRates.hour),priceCurrency:'EUR'}],areaServed:organization.areaServed,description:metadata.description};
 const faqSchema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))};
 return <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema).replace(/</g,'\\u003c')}}/>
  <JsonLd data={breadcrumbSchema([['Start','/'],['Netzwerk und Router','/netzwerkhilfe']])}/>
  <section className="page-head glow"><Threads className="threads--soft"/>
   <div className="wrap page-head__grid">
    <div>
     <p className="intro">Netzwerkhilfe vor Ort</p>
     <Split as="h1" className="display">Wenn das WLAN streikt, kommen wir vorbei.</Split>
     <p className="lead">Für Haushalte, Büros, Praxen und Werkstätten im Kreis Plön und in Ostholstein. Wir suchen die Ursache, beheben sie und erklären, was wir getan haben.</p>
     <div className="actions"><Link className="btn btn--light" href="/portal">Problem schildern<ArrowRight size={18}/></Link><Link className="btn btn--ghost" href="/contact?thema=Netzwerk">Direkt anfragen</Link></div>
    </div>
    <div className="slip" aria-label="Beispiel eines Einsatzes">
     <div className="slip__head"><span>Einsatzbericht</span><img src="/funknaht-mark.png" alt="" width="22" height="22"/></div>
     <dl>
      <div><dt>Anliegen</dt><dd>WLAN im Büro bricht nachmittags ab</dd></div>
      <div><dt>Ort</dt><dd>Werkstatt mit Büro, Kreis Plön</dd></div>
      <div><dt>Was wir gefunden haben</dt><dd><ol>
       <li><Check size={16}/>Nur das Büro betroffen, Werkstatt stabil</li>
       <li><Check size={16}/>Router steht hinter einem Metallschrank</li>
       <li><Check size={16}/>Zugangspunkt ergänzt, Empfang geprüft</li>
      </ol></dd></div>
     </dl>
     <p className="slip__note">Beispielhafter Ablauf eines Einsatzes</p>
     <span className="stamp" aria-hidden="true">ERLEDIGT</span>
    </div>
   </div>
  </section>

  <section className="band">
   <div className="wrap">
    <NoticeBanner/>
    <div className="section-head"><Split as="h2" className="h2">Typische Anliegen</Split><p className="lead reveal reveal-delay-1">Ihr Problem ist nicht dabei? Beschreiben Sie es trotzdem. Meist lässt sich schnell sagen, ob wir helfen können.</p></div>
    <div className="cases">{cases.map(({icon:Icon,...c},i)=><article className={'case reveal reveal-delay-'+(i+1)} key={c.title}><Icon size={26} strokeWidth={1.6}/><h3 className="h3">{c.title}</h3><p>{c.text}</p></article>)}</div>
   </div>
  </section>

  <section className="band band--night" aria-labelledby="router-titel">
   <div className="wrap two-col">
    <div><h2 id="router-titel" className="h2">Alle Router. Nicht nur FRITZ!Box.</h2><p className="lead" style={{marginTop:18}}>Ob Router vom Anbieter, MikroTik im Betrieb oder UniFi im Ferienhaus: Wir richten ein, was Sie haben, und empfehlen neue Geräte nur, wenn es wirklich nötig ist.</p><p style={{marginTop:24}}><Link className="btn btn--light" href="/preise">Preise: ab {euro(privateRates.hour)} pro Stunde<ArrowRight size={18}/></Link></p></div>
    <ul className="router-list">{routers.map(r=><li key={r}>{r}</li>)}<li>VPN, Gäste-WLAN, Mesh, VLANs</li></ul>
   </div>
  </section>

  <section className="band band--stone">
   <div className="wrap two-col wifi-section">
    <div><p className="intro">Funklöcher finden</p><Split as="h2" className="h2">Oft fehlt nur ein Zugangspunkt an der richtigen Stelle.</Split><p className="prose" style={{marginTop:20}}>Wände, Fußbodenheizung oder ein Metallschrank schlucken Funk. Wir messen vor Ort, wo der Empfang abreißt, und setzen einen Zugangspunkt oder ein Mesh-Gerät genau dorthin. Danach messen wir noch einmal, damit Sie sehen, was sich verändert hat.</p></div>
    <WifiPlan/>
   </div>
  </section>

  <section className="band">
   <div className="wrap process">
    <div><p className="intro">Ablauf</p><Split as="h2" className="h2">Von der Anfrage bis zur Übergabe.</Split><p className="prose" style={{marginTop:20}}>Bevor wir losfahren, wissen Sie, womit Sie rechnen können. Das spart Ihnen Geld und uns einen umsonst gefahrenen Weg.</p></div>
    <ProcessSteps steps={steps}/>
   </div>
  </section>

  <section className="band band--stone">
   <div className="wrap region">
    <div><p className="intro">Einsatzgebiet</p><Split as="h2" className="h2">Kreis Plön und Ostholstein.</Split><p className="prose" style={{marginTop:20}}>Von Heikendorf bis Fehmarn, von Preetz bis Bad Schwartau. Liegt Ihr Ort knapp außerhalb, fragen Sie gern nach.</p></div>
    <RegionChart/>
   </div>
  </section>

  <section className="band">
   <div className="wrap faq">
    <div><Split as="h2" className="h2">Fragen zur Netzwerkhilfe</Split></div>
    <div>{faqs.map(([q,a])=><details key={q}><summary>{q}<Plus size={20}/></summary><p>{a}</p></details>)}</div>
   </div>
  </section>

  <section className="band band--stone"><div className="wrap"><div className="section-head"><h2 className="h2">Was wir machen und was nicht</h2><p className="lead">Für Betriebe gibt es feste Betreuung ab {euro(businessPlans[0].price)} netto im Monat.</p></div><ScopeNote/></div></section>

  <section className="band band--night">
   <div className="wrap closing">
    <div><Split as="h2" className="display">Erst eingrenzen, dann losfahren.</Split><p className="lead">Im Hilfe-Portal beantworten Sie ein paar Fragen. Oft löst sich das Problem schon dabei, sonst haben wir alle Angaben für den Einsatz.</p></div>
    <Link className="btn btn--light" href="/portal">Zum Hilfe-Portal<ArrowRight size={18}/></Link>
   </div>
  </section>
 </>;
}
