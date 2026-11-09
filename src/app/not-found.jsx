import Link from 'next/link';
import {ArrowRight,LifeBuoy,Home,Mail} from 'lucide-react';
export const metadata={title:'Seite nicht gefunden | FUNKNAHT',robots:{index:false}};
export default function NotFound(){
 return <section className="band"><div className="wrap lost">
  <p className="lost__code" aria-hidden="true">404</p>
  <h1 className="h2">Diese Seite gibt es nicht.</h1>
  <p className="prose">Vielleicht hat sich die Adresse geändert, oder der Link war unvollständig. Von hier aus kommen Sie weiter:</p>
  <hr className="seam"/>
  <nav className="lost__ways" aria-label="Weiter zu">
   <Link href="/portal"><LifeBuoy size={20}/><span><strong>Hilfe-Portal</strong>Ein technisches Problem schildern</span><ArrowRight size={18}/></Link>
   <Link href="/"><Home size={20}/><span><strong>Startseite</strong>Was FUNKNAHT macht</span><ArrowRight size={18}/></Link>
   <Link href="/contact"><Mail size={20}/><span><strong>Kontakt</strong>Schreiben Sie uns direkt</span><ArrowRight size={18}/></Link>
  </nav>
 </div></section>;
}
