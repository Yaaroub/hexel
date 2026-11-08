'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
export default function SiteFooter(){
 const pathname=usePathname();
 if(pathname?.startsWith('/buchen/'))return null;
 return <footer className="site-footer">
  <div className="wrap">
   <div className="footer-grid">
    <div className="footer-about"><Link className="brand" href="/"><img src="/funknaht-mark.png" alt="" width="30" height="30"/>FUNKNAHT</Link><p>Software, Websites und Netzwerke für Betriebe und Haushalte. Entwickelt und betreut aus Schleswig-Holstein.</p></div>
    <div><h2>Angebot</h2><ul><li><Link href="/#leistungen">Leistungen</Link></li><li><Link href="/projects">Arbeiten</Link></li><li><Link href="/netzwerkhilfe">Netzwerkhilfe vor Ort</Link></li><li><Link href="/senioren">Digitalhilfe für Senioren</Link></li><li><Link href="/contact">Projekt anfragen</Link></li></ul></div>
    <div><h2>Portal</h2><ul><li><Link href="/portal">Hilfe-Portal</Link></li><li><Link href="/#betriebe">Für Betriebe</Link></li><li><Link href="/konto">Anmelden</Link></li><li><Link href="/portal/werkstatt">Meine Anfragen</Link></li></ul></div>
    <div><h2>Rechtliches</h2><ul><li><Link href="/impressum">Impressum</Link></li><li><Link href="/datenschutz">Datenschutz</Link></li></ul></div>
   </div>
   <div className="footer-bottom"><span>© {new Date().getFullYear()} FUNKNAHT</span><span>Vor Ort: Kreis Plön und Ostholstein. Digital: deutschlandweit.</span></div>
  </div>
 </footer>;
}
