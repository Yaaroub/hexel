'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {Menu,X,ArrowRight} from 'lucide-react';
import ViewMenu from './ViewMenu';

// Oben nur vier Wege; Netzwerkhilfe und Hilfe-Portal stehen als eigene Einträge im mobilen Menü.
const links=[
 {href:'/#leistungen',label:'Leistungen',note:'Software, IT und Automatisierung'},
 {href:'/betriebsportal',label:'Für Betriebe',note:'Termine, Kunden und Aufträge online'},
 {href:'/senioren',label:'Für Senioren',note:'Digitalhilfe mit Geduld, zu Hause'},
 {href:'/projects',label:'Arbeiten',note:'Eigene Anwendungen im Detail'},
];
const more=[
 {href:'/netzwerkhilfe',label:'Netzwerkhilfe',note:'Vor Ort in Plön und Ostholstein'},
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
 // In den Arbeitsbereichen eine schlanke App-Leiste statt des Website-Menüs.
 const app=['/inhaber','/betrieb','/portal/werkstatt'].find(p=>pathname===p||pathname?.startsWith(p+'/'));
 if(app){const label={'/inhaber':'Inhaberbereich','/betrieb':'Betrieb','/portal/werkstatt':'Mein Bereich'}[app];
  return <header className="site-header site-header--app">
   <div className="wrap site-header__inner">
    <Link className="brand" href="/" aria-label="FUNKNAHT – zur Startseite"><img src="/funknaht-mark.png" alt="" width="30" height="30"/><span className="brand__word" aria-hidden="true">{'FUNKNAHT'.split('').map((c,i)=><span key={i} style={{'--i':i}}>{c}</span>)}</span></Link>
    <span className="app-badge">{label}</span>
    <div className="header-tools" style={{marginLeft:'auto'}}>
     <Link className="header-login header-login--app" href="/portal">Hilfe-Portal</Link>
     <Link className="header-login header-login--app" href="/">Zur Website</Link>
     <ViewMenu/>
    </div>
   </div>
  </header>}
 const current=href=>href.startsWith('/#')?(pathname==='/'&&hash===href.slice(1)):(pathname===href||pathname.startsWith(href+'/'));
 const home=account?(account.isOwner?'/inhaber':account.organization?.accountType==='business'?'/betrieb':'/portal/werkstatt'):null;
 return <header className="site-header">
  <div className="wrap site-header__inner">
   <Link className="brand" href="/" aria-label="FUNKNAHT – zur Startseite"><img src="/funknaht-mark.png" alt="" width="30" height="30"/><span className="brand__word" aria-hidden="true">{'FUNKNAHT'.split('').map((c,i)=><span key={i} style={{'--i':i}}>{c}</span>)}</span></Link>
   <nav className="nav" aria-label="Hauptnavigation">{links.map(item=><Link key={item.href} href={item.href} aria-current={current(item.href)?(item.href.includes('#')?'location':'page'):undefined}>{item.label}</Link>)}</nav>
   <div className="header-tools">
    <Link className="header-portal" href="/portal" aria-current={pathname==='/portal'?'page':undefined}>Hilfe-Portal</Link>
    {home?<Link className="header-login" href={home}>Mein Bereich</Link>:<Link className="header-login" href="/konto">Anmelden</Link>}
    <Link className="btn btn--light btn--small header-cta" href="/contact">Projekt anfragen</Link>
    <ViewMenu/>
    <button ref={toggle} className="icon-btn menu-btn" aria-expanded={open} aria-controls="mobile-nav" aria-label={open?'Menü schließen':'Menü öffnen'} onClick={()=>setOpen(!open)}>{open?<X size={20}/>:<Menu size={20}/>}</button>
   </div>
  </div>
  <nav id="mobile-nav" className={'mobile-nav'+(open?' is-open':'')} aria-label="Mobile Navigation" inert={!open}>
   {[...links,...more].map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)}><span>{item.label}<small>{item.note}</small></span><ArrowRight size={20}/></Link>)}
   <Link href={home||'/konto'} onClick={()=>setOpen(false)}><span>{home?'Mein Bereich':'Anmelden'}<small>{home?'Zu Ihrem Konto':'Konto für Portal und Betrieb'}</small></span><ArrowRight size={20}/></Link>
   <Link className="btn btn--light" href="/contact" onClick={()=>setOpen(false)}>Projekt anfragen</Link>
  </nav>
 </header>;
}
