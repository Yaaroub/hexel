import Link from 'next/link';
import {ArrowRight,Wifi,Printer,Monitor,Globe,ShieldAlert} from 'lucide-react';
import {categories} from '../../lib/portal-knowledge';
import {pageMetadata} from '../../lib/seo';
import CallbackForm from '../components/CallbackForm';
import Split from '../components/Split';
import Threads from '../components/Threads';
export const metadata=pageMetadata('Hilfe und Anleitungen bei Technikproblemen | FUNKNAHT','Schritt-für-Schritt-Hilfe bei WLAN-Problemen, Druckern, Computern, Websites und verdächtigen Nachrichten. Verständlich erklärt, ohne Risiko für Ihre Geräte.','/hilfe');
const icons={'internet-wlan':Wifi,drucker:Printer,'computer-software':Monitor,website:Globe,betrug:ShieldAlert};
const helpTopics=['betrug','internet-wlan','drucker','computer-software','website'];
export default function HelpIndex(){
 const list=helpTopics.map(id=>categories.find(c=>c.id===id)).filter(Boolean);
 return <>
  <section className="page-head glow"><Threads className="threads--soft"/><div className="wrap"><p className="intro">Hilfe und Anleitungen</p><Split as="h1" className="display" style={{maxWidth:'12em'}}>Erst selbst prüfen, dann gezielt Hilfe holen.</Split><p className="lead">Diese Anleitungen ändern nichts an Ihren Geräten. Sie helfen Ihnen, das Problem einzugrenzen, damit die Hilfe danach schneller geht.</p></div></section>
  <section className="band"><div className="wrap">
   <div className="topic-grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))'}}>{list.map(c=>{const Icon=icons[c.id]||Monitor;return <Link key={c.id} href={'/hilfe/'+c.id} className="topic topic--link"><span className="topic__icon"><Icon size={26} strokeWidth={1.7}/></span><h2 className="h3">{c.title}</h2><p>{c.description}</p><span className="link" style={{marginTop:'auto'}}>{c.steps.length} Schritte ansehen<ArrowRight size={16}/></span></Link>})}</div>
  </div></section>
  <section className="band band--stone"><div className="wrap two-col"><div><Split as="h2" className="h2">Lieber persönlich?</Split><p className="prose" style={{marginTop:16}}>Hinterlassen Sie Ihre Nummer. Wir rufen zurück und hören uns das Problem an.</p></div><CallbackForm/></div></section>
 </>;
}
