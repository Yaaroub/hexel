'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
export default function SiteFooter(){
 const pathname=usePathname();
 if(pathname?.startsWith('/buchen/'))return null;
 if(['/inhaber','/betrieb','/portal/werkstatt'].some(p=>pathname===p||pathname?.startsWith(p+'/')))return <footer className="app-footer"><div className="wrap"><span>© {new Date().getFullYear()} FUNKNAHT</span><span><Link href="/datenschutz">Datenschutz</Link> · <Link href="/impressum">Impressum</Link></span></div></footer>;
 return <footer className="site-footer">
  <div className="wrap">
   <div className="footer-grid">
    <div className="footer-about"><Link className="brand" href="/"><img src="/funknaht-mark.png" alt="" width="30" height="30"/>FUNKNAHT</Link><p>Software, Websites und Netzwerke für Betriebe und Haushalte. Entwickelt und betreut aus Schleswig-Holstein.</p></div>
    <div><h2>Angebot</h2><ul><li><Link href="/#leistungen">Leistungen</Link></li><li><Link href="/preise">Preise und Abos</Link></li><li><Link href="/netzwerkhilfe">Netzwerk und Router</Link></li><li><Link href="/senioren">Digitalhilfe für Senioren</Link></li><li><Link href="/betriebsportal">Betriebsportal</Link></li><li><Link href="/projects">Arbeiten</Link></li></ul></div>
    <div><h2>Branchen</h2><ul><li><Link href="/branchen/praxen">Praxen</Link></li><li><Link href="/branchen/handwerk">Handwerk</Link></li><li><Link href="/branchen/buero">Büros und Kanzleien</Link></li><li><Link href="/branchen/gastgeber">Ferienwohnungen und Handel</Link></li></ul></div>
    <div><h2>Vor Ort</h2><ul><li><Link href="/einsatzgebiet/kiel">Kiel</Link></li><li><Link href="/einsatzgebiet/ploen">Plön</Link></li><li><Link href="/einsatzgebiet/preetz">Preetz</Link></li><li><Link href="/einsatzgebiet/eutin">Eutin</Link></li><li><Link href="/einsatzgebiet/neustadt">Neustadt in Holstein</Link></li><li><Link href="/einsatzgebiet">Alle Orte</Link></li></ul></div>
    <div><h2>Portal und Recht</h2><ul><li><Link href="/portal">Hilfe-Portal</Link></li><li><Link href="/hilfe">Anleitungen</Link></li><li><Link href="/konto">Anmelden</Link></li><li><Link href="/impressum">Impressum</Link></li><li><Link href="/datenschutz">Datenschutz</Link></li><li><Link href="/agb">AGB</Link></li><li><Link href="/widerruf">Widerruf</Link></li><li><Link href="/avv">AVV für Betriebe</Link></li></ul></div>
   </div>
   <div className="footer-bottom"><span>© {new Date().getFullYear()} FUNKNAHT</span><span>Vor Ort: Kiel, Kreis Plön und Ostholstein. Digital: deutschlandweit.</span></div>
  </div>
 </footer>;
}
