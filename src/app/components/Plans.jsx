import Link from 'next/link';
import {Check,ArrowRight} from 'lucide-react';
import {euro} from '../../lib/pricing';
// Abo-Karten. `topic` füllt das Kontaktformular vor, damit die Anfrage beim richtigen Thema landet.
export default function Plans({plans,topic='Abo',dark=false}){
 return <div className={'plans'+(dark?' plans--dark':'')}>{plans.map(p=><article key={p.id} className={'plan'+(p.focus?' plan--focus':'')}>
  {p.focus&&<span className="plan__badge">Meist gewählt</span>}
  <h3>{p.name}</h3>
  <p className="plan__price">{p.price!=null?euro(p.price):p.priceText}<small>{p.unit}</small></p>
  <p className="plan__lead">{p.lead}</p>
  <ul>{p.features.map(f=><li key={f}><Check size={16}/>{f}</li>)}</ul>
  <Link className={p.focus?'btn btn--small':'btn btn--ghost btn--small'} href={'/contact?thema='+encodeURIComponent(topic)+'&abo='+encodeURIComponent(p.name)}>{p.cta}<ArrowRight size={16}/></Link>
 </article>)}</div>;
}
