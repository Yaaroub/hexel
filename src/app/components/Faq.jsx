import {Plus} from 'lucide-react';
import JsonLd from './JsonLd';
import {faqSchema} from '../../lib/seo';
// Häufige Fragen samt FAQ-Daten für Google und KI-Suchen.
export default function Faq({items,title='Häufige Fragen',id='fragen',stone=false}){
 return <section className={'band'+(stone?' band--stone':'')} aria-labelledby={id}>
  <JsonLd data={faqSchema(items)}/>
  <div className="wrap faq"><div><h2 id={id} className="h2">{title}</h2></div><div>{items.map(([q,a])=><details key={q}><summary>{q}<Plus size={20}/></summary><p>{a}</p></details>)}</div></div>
 </section>;
}
