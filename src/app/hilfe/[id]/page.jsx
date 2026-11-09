import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowRight,ArrowLeft,AlertTriangle,CheckCircle2} from 'lucide-react';
import {getDiagnostic} from '../../../lib/portal-knowledge';
import {organization,pageMetadata} from '../../../lib/seo';
import CallbackForm from '../../components/CallbackForm';
import Split from '../../components/Split';
import Threads from '../../components/Threads';
const topics=['betrug','internet-wlan','drucker','computer-software','website'];
export function generateStaticParams(){return topics.map(id=>({id}))}
export async function generateMetadata({params}){const {id}=await params;const c=getDiagnostic(id);return c?pageMetadata(c.title+': Schritt für Schritt | FUNKNAHT',c.description,'/hilfe/'+id):{}}
export default async function HelpArticle({params}){
 const {id}=await params;const c=getDiagnostic(id);if(!c||!topics.includes(id))notFound();
 const howTo={'@context':'https://schema.org','@type':'HowTo',name:c.title,description:c.description,publisher:organization,step:c.steps.map((s,i)=>({'@type':'HowToStep',position:i+1,name:s.title,text:s.instruction}))};
 return <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(howTo).replace(/</g,'\\u003c')}}/>
  <section className="page-head glow"><Threads className="threads--soft"/><div className="wrap"><Link className="link" href="/hilfe"><ArrowLeft size={16}/>Alle Anleitungen</Link><h1 className="display" style={{marginTop:18}}>{c.title}</h1><p className="lead">{c.description}</p></div></section>
  <section className="band"><div className="wrap two-col">
   <div><p className="prose">Arbeiten Sie die Schritte der Reihe nach ab. Wenn ein Schritt das Problem löst, sind Sie fertig. Wenn nicht, haben Sie danach alle Angaben, die wir für schnelle Hilfe brauchen.</p><div className="actions" style={{marginTop:24}}><Link className="btn" href={'/portal'}>Im Hilfe-Portal durchgehen<ArrowRight size={17}/></Link></div></div>
   <ol className="article-steps">{c.steps.map((s,i)=><li key={s.id}><span className="article-steps__num">{i+1}</span><div><h2 className="h3">{s.title}</h2><p className="prose" style={{marginTop:8}}>{s.instruction}</p><p className="article-steps__check"><CheckCircle2 size={17}/><span>{s.verify}</span></p><p className="article-steps__warn"><AlertTriangle size={17}/><span>{s.escalateWhen}</span></p></div></li>)}</ol>
  </div></section>
  <section className="band band--stone"><div className="wrap two-col"><div><Split as="h2" className="h2">Hat nicht geholfen?</Split><p className="prose" style={{marginTop:16}}>Schildern Sie das Problem im Hilfe-Portal, oder lassen Sie sich zurückrufen.</p><p style={{marginTop:20}}><Link className="link" href="/portal">Anliegen im Portal schildern<ArrowRight size={16}/></Link></p></div><CallbackForm topic={id==='betrug'?'Ist das Betrug?':id==='internet-wlan'?'Internet & WLAN':id==='drucker'||id==='computer-software'?'Computer oder Drucker':'Etwas anderes'}/></div></section>
 </>;
}
