import Link from 'next/link';
import {ArrowRight,MapPin} from 'lucide-react';
import Split from '../components/Split';
import Threads from '../components/Threads';
import RegionChart from '../components/RegionChart';
import JsonLd from '../components/JsonLd';
import {towns} from '../../lib/profile';
import {travelNote} from '../../lib/pricing';
import {pageMetadata,breadcrumbSchema} from '../../lib/seo';
export const metadata=pageMetadata('Einsatzgebiet: Kiel, Kreis Plön und Ostholstein | FUNKNAHT','FUNKNAHT ist vor Ort in Kiel, Plön, Preetz, Schwentinental, Lütjenburg, Eutin, Neustadt und Oldenburg in Holstein. Websites und Software deutschlandweit.','/einsatzgebiet');
export default function Einsatzgebiet(){
 return <>
  <JsonLd data={breadcrumbSchema([['Start','/'],['Einsatzgebiet','/einsatzgebiet']])}/>
  <section className="page-head glow"><Threads className="threads--soft"/><div className="wrap"><p className="intro">Einsatzgebiet</p><Split as="h1" className="display">Vor Ort zwischen Kiel und der Lübecker Bucht.</Split><p className="lead">{travelNote} Websites und Software entwickeln wir für Kunden in ganz Deutschland.</p></div></section>
  <section className="band"><div className="wrap two-col">
   <div className="branch-links">{towns.map(t=><Link key={t.id} href={'/einsatzgebiet/'+t.id}><strong><MapPin size={15}/> {t.name}</strong><span>{t.area}</span><ArrowRight size={16}/></Link>)}</div>
   <RegionChart/>
  </div></section>
 </>;
}
