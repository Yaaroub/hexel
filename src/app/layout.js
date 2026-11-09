import './globals.css';
import './app.css';
import './motion.css';
import './blueprint.css';
import SiteNavigation from './components/SiteNavigation';
import SiteFooter from './components/SiteFooter';
import Motion from './components/Motion';
import ServiceWorker from './components/ServiceWorker';
import {siteUrl,organization,pageMetadata} from '../lib/seo';

export const metadata={
 ...pageMetadata('FUNKNAHT – Software, Websites und IT aus Schleswig-Holstein','FUNKNAHT entwickelt Websites und Webanwendungen, hilft bei IT- und Netzwerkproblemen im Kreis Plön und in Ostholstein und bietet ein Online-Portal für Termine, Kunden und Aufträge.','/'),
 ...(siteUrl?{metadataBase:new URL(siteUrl)}:{}),
 robots:{index:!!siteUrl,follow:!!siteUrl},
 manifest:'/site.webmanifest',
};
export const viewport={width:'device-width',initialScale:1,themeColor:'#20242A'};

const themeScript=`document.documentElement.classList.add('js');try{var s=localStorage.getItem('funknaht-text');if(s==='115'||s==='130'){document.documentElement.dataset.text=s;document.documentElement.style.fontSize=s+'%'}}catch(e){}try{var t=localStorage.getItem('funknaht-theme');document.documentElement.dataset.theme=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}`;

export default function RootLayout({children}){
 return <html lang="de" suppressHydrationWarning>
  <head><script dangerouslySetInnerHTML={{__html:themeScript}}/></head>
  <body>
   <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org',...organization}).replace(/</g,'\\u003c')}}/>
   <a className="skip" href="#inhalt">Zum Inhalt springen</a>
   <SiteNavigation/>
   <main id="inhalt">{children}</main>
   <SiteFooter/>
   <Motion/>
   <ServiceWorker/>
  </body>
 </html>;
}
