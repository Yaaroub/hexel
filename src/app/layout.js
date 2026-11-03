import './globals.css';
import Link from 'next/link';
import MotionDetails from './components/MotionDetails';
import SiteNavigation from './components/SiteNavigation';
import {siteUrl,organization,pageMetadata} from '../lib/seo';
export const metadata = {...pageMetadata('FUNKNAHT | Netzwerkhilfe, Websites & Web-Apps', 'Netzwerkhilfe in Kreis Plön und Ostholstein. Dazu Websites, Web-Apps und Branding – FUNKNAHT verbindet Technik mit Menschen.', '/'), ...(siteUrl ? {metadataBase:new URL(siteUrl)} : {}), robots:{index:!!siteUrl,follow:!!siteUrl},manifest:'/site.webmanifest'};
export const viewport = {width:'device-width',initialScale:1,themeColor:[{media:'(prefers-color-scheme: light)',color:'#f2efe8'},{media:'(prefers-color-scheme: dark)',color:'#171a18'}]};
export default function Layout({children}) {return <html lang="de" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`try{var t=localStorage.getItem('funknaht-theme');document.documentElement.dataset.theme=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch(e){document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}`}}/></head><body><MotionDetails/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org",...organization}).replace(/</g,"\\u003c")}}/><a className="skip" href="#inhalt">Zum Inhalt</a><SiteNavigation/><main id="inhalt">{children}</main><footer><Link className="wordmark" href="/"><span className="logo-mark" aria-hidden="true"/>FUNKNAHT</Link><p>Verbindet Technik mit Menschen.</p><Link href="/netzwerkhilfe">Netzwerkhilfe in Ihrer Region</Link><a href="/contact">Kontakt ↗</a><small>© {new Date().getFullYear()} FUNKNAHT</small></footer></body></html>}








