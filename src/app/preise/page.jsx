import Link from 'next/link';
import {ArrowRight,Clock,Car,Receipt} from 'lucide-react';
import Split from '../components/Split';
import Threads from '../components/Threads';
import Plans from '../components/Plans';
import ScopeNote from '../components/ScopeNote';
import Faq from '../components/Faq';
import JsonLd from '../components/JsonLd';
import {pageMetadata,serviceSchema,breadcrumbSchema} from '../../lib/seo';
import {privateRates,businessRates,travelNote,privatePlans,businessPlans,projectPrices,euro} from '../../lib/pricing';

export const metadata=pageMetadata('Preise: IT-Hilfe, Netzwerk-Betreuung und Websites | FUNKNAHT','Netzwerk- und Software-Hilfe in Kiel, Plön und Ostholstein: '+privateRates.hour+' € pro Stunde für Haushalte, '+businessRates.hour+' € netto für Betriebe, Abos ab '+privatePlans[0].price+' €.','/preise');

const faqs=[
 ['Was kostet ein Hausbesuch?','Für Haushalte '+privateRates.hour+' € pro Stunde plus '+privateRates.travel+' € Anfahrtspauschale. Abgerechnet wird im 15-Minuten-Takt, mindestens 30 Minuten. Ein Termin von einer Stunde kostet also '+(privateRates.hour+privateRates.travel)+' €.'],
 ['Kostet Fernhilfe weniger?','Fernhilfe kostet denselben Stundensatz, aber keine Anfahrt. Viele Router- und Software-Fragen lösen wir so in 15 bis 30 Minuten.'],
 ['Kann ich die Abos kündigen?','Die Abos für Haushalte sind monatlich kündbar. Die Betreuung für Betriebe ist nach drei Monaten monatlich kündbar, weil wir am Anfang Ihr Netz aufnehmen und dokumentieren.'],
 ['Reparieren Sie auch Displays oder defekte Geräte?','Nein. Wir arbeiten an Netzwerken und Software, nicht an Hardware. Ist ein Gerät defekt, empfehlen wir einen Reparaturdienst. Danach richten wir es gern wieder ein.'],
 ['Bekomme ich vorher einen Preis?','Ja. Bei Einsätzen sagen wir Ihnen vorher, mit welchem Aufwand wir rechnen. Websites und Software bieten wir zum Festpreis an, schriftlich und vor Beginn.'],
];

export default function Preise(){
 return <>
  <JsonLd data={[breadcrumbSchema([['Start','/'],['Preise','/preise']]),serviceSchema({name:'IT- und Netzwerkhilfe',description:'Netzwerk-, WLAN-, Router- und Software-Hilfe vor Ort und per Fernhilfe.',path:'/preise',offers:[{name:'Stundensatz Haushalte',price:privateRates.hour,unit:'pro Stunde, Endpreis'},{name:'Stundensatz Betriebe',price:businessRates.hour,unit:'pro Stunde, netto'},...privatePlans.map(p=>({name:p.name,price:p.price,unit:p.unit})),...businessPlans.filter(p=>p.price).map(p=>({name:p.name,price:p.price,unit:p.unit}))]})]}/>
  <section className="page-head glow"><Threads className="threads--soft"/>
   <div className="wrap"><p className="intro">Preise</p><Split as="h1" className="display">Klar, bevor wir anfangen.</Split><p className="lead">Sie wissen vorher, womit Sie rechnen müssen. Keine versteckten Pauschalen, keine Barzahlung an der Tür.</p></div>
  </section>

  <section className="band" aria-labelledby="stunde">
   <div className="wrap">
    <div className="section-head"><h2 id="stunde" className="h2">Nach Aufwand</h2><p className="lead">{travelNote}</p></div>
    <div className="rates">
     <article className="rate"><h3>Haushalte und Senioren</h3><p className="rate__price">{euro(privateRates.hour)}<small>pro Stunde</small></p><ul><li><Clock size={16}/>15-Minuten-Takt, mindestens {privateRates.minimum} Minuten</li><li><Car size={16}/>Anfahrt pauschal {euro(privateRates.travel)}</li><li><Receipt size={16}/>{privateRates.note}</li></ul></article>
     <article className="rate"><h3>Betriebe, Praxen, Büros</h3><p className="rate__price">{euro(businessRates.hour)}<small>pro Stunde, netto</small></p><ul><li><Clock size={16}/>15-Minuten-Takt, vor Ort oder Fernwartung</li><li><Car size={16}/>Anfahrt pauschal {euro(businessRates.travel)} netto</li><li><Receipt size={16}/>Einsatz am selben Tag ohne Abo: +{businessRates.urgent} %. {businessRates.vatNote}</li></ul></article>
    </div>
   </div>
  </section>

  <section className="band band--stone" id="abo-privat" aria-labelledby="abo1">
   <div className="wrap">
    <div className="section-head"><h2 id="abo1" className="h2">Abos für Haushalte</h2><p className="lead">Ein fester Ansprechpartner zum festen Preis. Monatlich kündbar, Endpreise.</p></div>
    <Plans plans={privatePlans} topic="Abo Haushalt"/>
   </div>
  </section>

  <section className="band band--night" id="abo-betrieb" aria-labelledby="abo2">
   <div className="wrap">
    <div className="section-head"><h2 id="abo2" className="h2">IT-Betreuung für Betriebe</h2><p className="lead">Router, Firewall, WLAN und Überwachung zum Monatspreis. Für Praxen, Handwerk, Büros und Gastgeber. {businessRates.vatNote}</p></div>
    <Plans plans={businessPlans} topic="IT-Betreuung" dark/>
   </div>
  </section>

  <section className="band" aria-labelledby="projekte">
   <div className="wrap">
    <div className="section-head"><h2 id="projekte" className="h2">Websites und Software</h2><p className="lead">Einstiegspreise, netto. Nach einem kostenlosen Erstgespräch erhalten Sie ein schriftliches Festpreis-Angebot.</p></div>
    <div className="project-prices">{projectPrices.map(p=><div key={p.name}><h3>{p.name}</h3><p className="rate__price">{p.from?'ab '+euro(p.from):'Festpreis'}<small>{p.monthly?'pro Monat':p.from?'einmalig':'nach Angebot'}</small></p><p>{p.text}</p></div>)}</div>
    <p style={{marginTop:28}}><Link className="link" href="/betriebsportal">Tarife für das Betriebsportal (Online-Termine, Kunden, Aufträge)<ArrowRight size={16}/></Link></p>
   </div>
  </section>

  <section className="band band--stone" aria-labelledby="umfang">
   <div className="wrap"><div className="section-head"><h2 id="umfang" className="h2">Was im Preis steckt und was nicht</h2></div><ScopeNote/></div>
  </section>

  <Faq items={faqs} title="Fragen zu Preisen" id="preis-fragen"/>
 </>;
}
