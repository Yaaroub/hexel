import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowRight,AlertTriangle,Check,Info} from 'lucide-react';
import Split from '../../components/Split';
import Threads from '../../components/Threads';
import Plans from '../../components/Plans';
import Faq from '../../components/Faq';
import JsonLd from '../../components/JsonLd';
import {industries,towns,routers} from '../../../lib/profile';
import {businessPlans,businessRates,euro} from '../../../lib/pricing';
import {pageMetadata,serviceSchema,breadcrumbSchema,regionText} from '../../../lib/seo';

export function generateStaticParams(){return industries.map(i=>({id:i.id}))}
export async function generateMetadata({params}){const {id}=await params;const b=industries.find(i=>i.id===id);if(!b)return {};
 return pageMetadata(b.title+' in Kiel, Plön und Ostholstein | FUNKNAHT',b.title+' in Kiel, Plön und Ostholstein: Netzwerk, WLAN und Router einrichten und betreuen. Betreuung ab '+euro(businessPlans[0].price)+' im Monat.','/branchen/'+b.id)}

export default async function Branche({params}){
 const {id}=await params;const b=industries.find(i=>i.id===id);if(!b)notFound();
 const plan=businessPlans.find(p=>p.id===b.plan);
 const faqs=[
  ['Arbeiten Sie mit unserem bestehenden Router?','Ja. Wir arbeiten mit allen gängigen Routern und Firewalls, darunter '+routers.slice(0,6).join(', ')+'. Neue Geräte empfehlen wir nur, wenn es wirklich nötig ist.'],
  ['Was kostet die Betreuung?','Nach Aufwand '+euro(businessRates.hour)+' pro Stunde netto. Mit dem Abo „'+plan.name+'“ für '+euro(plan.price)+' im Monat sind Überwachung, Updates und Fernwartung bereits enthalten.'],
  ['Wo sind Sie vor Ort?','In '+regionText+'. Viele Fragen lösen wir per Fernwartung, ohne Anfahrt.'],
  ['Reparieren Sie auch defekte Geräte?','Nein. Wir kümmern uns um Netzwerk und Software, nicht um Hardware-Reparaturen.'],
 ];
 return <>
  <JsonLd data={[breadcrumbSchema([['Start','/'],['Branchen','/branchen/'+b.id],[b.short,'/branchen/'+b.id]]),serviceSchema({name:b.title,description:b.intro,path:'/branchen/'+b.id,offers:[{name:plan.name,price:plan.price,unit:plan.unit}]})]}/>
  <section className="page-head glow"><Threads className="threads--soft"/>
   <div className="wrap"><p className="intro">Für {b.name}</p><Split as="h1" className="display">{b.title}</Split><p className="lead">{b.intro}</p>
    <div className="actions" style={{marginTop:30}}><Link className="btn btn--light" href={'/contact?thema=IT-Betreuung&branche='+encodeURIComponent(b.short)}>Erstgespräch vereinbaren<ArrowRight size={18}/></Link><Link className="btn btn--ghost" href="/preise#abo-betrieb">Preise ansehen</Link></div></div>
  </section>
  <section className="band"><div className="wrap two-col">
   <div><h2 className="h2">Kennen Sie das?</h2><ul className="checklist checklist--warn">{b.problems.map(p=><li key={p}><AlertTriangle size={18}/>{p}</li>)}</ul></div>
   <div><h2 className="h2">Was wir tun</h2><ul className="checklist">{b.solutions.map(p=><li key={p}><Check size={18}/>{p}</li>)}</ul><p className="notice" style={{marginTop:22}}><Info size={18}/><span>{b.note}</span></p></div>
  </div></section>
  <section className="band band--night"><div className="wrap">
   <div className="section-head"><h2 className="h2">Passende Betreuung</h2><p className="lead">{businessRates.vatNote}</p></div>
   <Plans plans={businessPlans} topic="IT-Betreuung" dark/>
  </div></section>
  <section className="band band--stone"><div className="wrap">
   <h2 className="h2" style={{marginBottom:20}}>Vor Ort in Ihrer Nähe</h2>
   <p className="town-links">{towns.map(t=><Link key={t.id} href={'/einsatzgebiet/'+t.id}>{t.name}</Link>)}</p>
  </div></section>
  <Faq items={faqs} id="branche-fragen"/>
 </>;
}
