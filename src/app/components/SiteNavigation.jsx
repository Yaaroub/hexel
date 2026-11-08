'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {Menu,X,ArrowRight} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const links=[
 {href:'/#leistungen',label:'Leistungen',note:'Software, IT und Automatisierung'},
 {href:'/#betriebe',label:'Für Betriebe',note:'Termine, Kunden und Aufträge online'},
 {href:'/projects',label:'Arbeiten',note:'Eigene Anwendungen im Detail'},
 {href:'/netzwerkhilfe',label:'Netzwerkhilfe',note:'Vor Ort in Plön und Ostholstein'},
 {href:'/senioren',label:'Für Senioren',note:'Digitalhilfe mit Geduld, zu Hause'},
 {href:'/portal',label:'Hilfe-Portal',note:'Anliegen Schritt für Schritt klären'},
];

export default function SiteNavigation(){
 const pathname=usePathname();
 const [open,setOpen]=useState(false),[hash,setHash]=useState(''),[account,setAccount]=useState(null);
 const toggle=useRef(null);
 useEffect(()=>{setOpen(false);const update=()=>setHash(window.location.hash);update();window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update)},[pathname]);
 useEffect(()=>{fetch('/api/account/me',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>setAccount(d?.account||null)).catch(()=>{})},[pathname]);
 useEffect(()=>{if(!open)return;const key=e=>{if(e.key==='Escape'){setOpen(false);toggle.current?.focus()}};document.addEventListener('keydown',key);document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',key);document.body.style.overflow=''}},[open]);
 if(pathname?.startsWith('/buchen/'))return null;
 const current=href=>href.startsWith('/#')?(pathname==='/'&&hash===href.slice(1)):(pathname===href||pathname.startsWith(href+'/'));
 const home=account?(account.isOwner?'/inhaber':account.organization?.accountType==='business'?'/betrieb':'/portal/werkstatt'):null;
 return <header className="site-header">
  <div className="wrap site-header__inner">
   <Link className="brand" href="/" aria-label="FUNKNAHT – zur Startseite"><img src="/funknaht-mark.png" alt="" width="30" height="30"/>FUNKNAHT</Link>
   <nav className="nav" aria-label="Hauptnavigation">{links.map(item=><Link key={item.href} href={item.href} aria-current={current(item.href)?(item.href.includes('#')?'location':'page'):undefined}>{item.label}</Link>)}</nav>
   <div className="header-tools">
    {home?<Link className="header-login" href={home}>Mein Bereich</Link>:<Link className="header-login" href="/konto">Anmelden</Link>}
    <Link className="btn btn--light btn--small header-cta" href="/contact">Projekt anfragen</Link>
    <ThemeToggle/>
    <button ref={toggle} className="icon-btn menu-btn" aria-expanded={open} aria-controls="mobile-nav" aria-label={open?'Menü schließen':'Menü öffnen'} onClick={()=>setOpen(!open)}>{open?<X size={20}/>:<Menu size={20}/>}</button>
   </div>
  </div>
  <nav id="mobile-nav" className={'mobile-nav'+(open?' is-open':'')} aria-label="Mobile Navigation" inert={!open}>
   {links.map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)}><span>{item.label}<small>{item.note}</small></span><ArrowRight size={20}/></Link>)}
   <Link href={home||'/konto'} onClick={()=>setOpen(false)}><span>{home?'Mein Bereich':'Anmelden'}<small>{home?'Zu Ihrem Konto':'Konto für Portal und Betrieb'}</small></span><ArrowRight size={20}/></Link>
   <Link className="btn btn--light" href="/contact" onClick={()=>setOpen(false)}>Projekt anfragen</Link>
  </nav>
 </header>;
}
