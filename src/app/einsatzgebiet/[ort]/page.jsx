import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowRight,MapPin,Check} from 'lucide-react';
import Split from '../../components/Split';
import Threads from '../../components/Threads';
import Faq from '../../components/Faq';
import JsonLd from '../../components/JsonLd';
import ScopeNote from '../../components/ScopeNote';
import {towns,industries,routers} from '../../../lib/profile';
import {privateRates,businessRates,privatePlans,businessPlans,euro,travelNote} from '../../../lib/pricing';
import {pageMetadata,serviceSchema,breadcrumbSchema} from '../../../lib/seo';

export function generateStaticParams(){return towns.map(t=>({ort:t.id}))}
export async function generateMetadata({params}){const {ort}=await params;const t=towns.find(x=>x.id===ort);if(!t)return {};
 return pageMetadata('IT-Hilfe, WLAN und Router in '+t.name+' | FUNKNAHT','WLAN-, Router- und Software-Hilfe in '+t.name+' für Haushalte, Senioren, Praxen und Betriebe. Vor Ort ab '+euro(privateRates.hour)+' pro Stunde.','/einsatzgebiet/'+t.id)}

export default async function Ort({params}){
 const {ort}=await params;const t=towns.find(x=>x.id===ort);if(!t)notFound();
 const others=towns.filter(x=>x.id!==t.id);
 const faqs=[
  ['Kommen Sie auch nach '+t.name+'?','Ja. '+t.name+' gehört zu unserem Einsatzgebiet ('+t.area+'). '+travelNote],
  ['Was kostet ein Termin in '+t.name+'?','Für Haushalte '+euro(privateRates.hour)+' pro Stunde plus '+euro(privateRates.travel)+' Anfahrt, für Betriebe '+euro(businessRates.hour)+' netto plus '+euro(businessRates.travel)+' Anfahrt. Mit einem Abo wird es günstiger.'],
  ['Welche Router betreuen Sie?','Alle gängigen, unter anderem '+routers.slice(0,8).join(', ')+'.'],
  ['Reparieren Sie Handys oder Laptops?','Nein, wir machen keine Hardware-Reparaturen. Wir richten Netzwerke, Router und Software ein und helfen bei Problemen damit.'],
 ];
 return <>
  <JsonLd data={[breadcrumbSchema([['Start','/'],['Einsatzgebiet','/einsatzgebiet'],[t.name,'/einsatzgebiet/'+t.id]]),serviceSchema({name:'IT- und Netzwerkhilfe in '+t.name,description:t.text,path:'/einsatzgebiet/'+t.id,offers:[{name:'Stundensatz Haushalte',price:privateRates.hour,unit:'pro Stunde, Endpreis'},{name:'Stundensatz Betriebe',price:businessRates.hour,unit:'pro Stunde, netto'}]})]}/>
  <section className="page-head glow"><Threads className="threads--soft"/>
   <div className="wrap"><p className="intro"><MapPin size={15}/> {t.county}</p><Split as="h1" className="display">{'IT-Hilfe in '+t.name}</Split><p className="lead">{t.text}</p>
    <div className="actions" style={{marginTop:30}}><Link className="btn btn--light" href="/portal">Problem schildern<ArrowRight size={18}/></Link><Link className="btn btn--ghost" href="/preise">Preise ansehen</Link></div></div>
  </section>
  <section className="band"><div className="wrap two-col">
   <div><h2 className="h2">In {t.name} häufig gefragt</h2><p className="prose" style={{marginTop:16}}>Einsatzgebiet: {t.area}.</p></div>
   <ul className="checklist">{t.focus.map(f=><li key={f}><Check size={18}/>{f}</li>)}<li><Check size={18}/>Router aller Hersteller: {routers.slice(0,5).join(', ')} und weitere</li><li><Check size={18}/>Fernhilfe ohne Anfahrt, wenn möglich</li></ul>
  </div></section>
  <section className="band band--stone"><div className="wrap">
   <div className="section-head"><h2 className="h2">Preise in {t.name}</h2><p className="lead">{travelNote}</p></div>
   <div className="rates">
    <article className="rate"><h3>Haushalte und Senioren</h3><p className="rate__price">{euro(privateRates.hour)}<small>pro Stunde</small></p><p>Anfahrt {euro(privateRates.travel)}. Abo „{privatePlans[0].name}“ ab {euro(privatePlans[0].price)} im Monat.</p></article>
    <article className="rate"><h3>Betriebe</h3><p className="rate__price">{euro(businessRates.hour)}<small>pro Stunde, netto</small></p><p>Anfahrt {euro(businessRates.travel)} netto. Betreuung ab {euro(businessPlans[0].price)} im Monat.</p></article>
   </div>
  </div></section>
  <section className="band"><div className="wrap"><div className="section-head"><h2 className="h2">Für wen wir in {t.name} arbeiten</h2></div>
   <div className="branch-links">{industries.map(b=><Link key={b.id} href={'/branchen/'+b.id}><strong>{b.short}</strong><span>{b.problems[0]}</span><ArrowRight size={16}/></Link>)}<Link href="/senioren"><strong>Senioren</strong><span>Smartphone, Online-Banking und Videoanrufe in Ruhe erklärt</span><ArrowRight size={16}/></Link></div>
  </div></section>
  <section className="band band--stone"><div className="wrap"><ScopeNote compact/></div></section>
  <Faq items={faqs} id="ort-fragen"/>
  <section className="band band--stone"><div className="wrap"><h2 className="h3" style={{marginBottom:14}}>Auch in der Nähe</h2><p className="town-links">{others.map(o=><Link key={o.id} href={'/einsatzgebiet/'+o.id}>{o.name}</Link>)}</p></div></section>
 </>;
}
