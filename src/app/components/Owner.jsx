import fs from 'node:fs';
import path from 'node:path';
import {Quote} from 'lucide-react';
import {company} from '../../lib/company';
import {testimonials} from '../../lib/testimonials';
// „Wer dahinter steht“: Foto erscheint, sobald public/images/inhaber.jpg vorhanden ist.
export default function Owner(){
 const hasPhoto=fs.existsSync(path.join(process.cwd(),'public','images','inhaber.jpg'));
 const name=company.owner||'Ihr Ansprechpartner';
 const initials=(company.owner||'F').split(/\s+/).map(w=>w[0]).slice(0,2).join('');
 return <section className="band band--stone" aria-labelledby="wer">
  <div className="wrap owner-intro">
   <figure className="owner-photo" data-sheet="PORTRÄT">{hasPhoto?<img src="/images/inhaber.jpg" alt={'Foto von '+name} width="480" height="560" loading="lazy"/>:<span className="owner-photo__mono" aria-hidden="true">{initials}</span>}</figure>
   <div>
    <h2 id="wer" className="h2">Wer dahinter steht</h2>
    <p className="lead" style={{marginTop:18}}>{company.owner?<>Ich bin {company.owner}.</>:null} Ich verbinde Netzwerktechnik aus dem IT-Betrieb mit Softwareentwicklung. Deshalb verstehe ich beides: warum das WLAN im Büro abbricht und wie eine Anwendung gebaut sein muss, damit sie im Alltag hilft.</p>
    <p className="prose" style={{marginTop:14}}>Bei FUNKNAHT haben Sie einen festen Ansprechpartner statt einer Hotline. Ich sage vorher, was es kostet, erkläre, was ich verändere, und lasse Sie mit der Technik nicht allein.</p>
    {testimonials.length>0&&<div className="quotes">{testimonials.map(t=><blockquote key={t.name}><Quote size={18}/><p>{t.text}</p><footer>{t.name}{t.role?', '+t.role:''}</footer></blockquote>)}</div>}
   </div>
  </div>
 </section>;
}
