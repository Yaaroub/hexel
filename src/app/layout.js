import './globals.css';
import './app.css';
import './motion.css';
import './blueprint.css';
import SiteNavigation from './components/SiteNavigation';
import SiteFooter from './components/SiteFooter';
import Motion from './components/Motion';
import ServiceWorker from './components/ServiceWorker';
import {siteUrl,organization,pageMetadata} from '../lib/seo';
import JsonLd from './components/JsonLd';
import CallButton from './components/CallButton';
import {company} from '../lib/company';

export const metadata={
 ...pageMetadata('FUNKNAHT – IT, Netzwerk, Router und Websites in Kiel, Plön und Ostholstein','Netzwerk, WLAN und Router aller Hersteller, Websites und Digitalhilfe für Senioren. Vor Ort in Kiel, im Kreis Plön und in Ostholstein, mit klaren Preisen.','/'),
 metadataBase:new URL(siteUrl||'http://localhost:3000'),
 robots:{index:!!siteUrl,follow:!!siteUrl},
 manifest:'/site.webmanifest',
};
export const viewport={width:'device-width',initialScale:1,themeColor:'#0D3539'};

const themeScript=`document.documentElement.classList.add('js');try{var s=localStorage.getItem('funknaht-text');if(s==='115'||s==='130'){document.documentElement.dataset.text=s;document.documentElement.style.fontSize=s+'%'}}catch(e){}try{var t=localStorage.getItem('funknaht-theme');document.documentElement.dataset.theme=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}`;

export default function RootLayout({children}){
 return <html lang="de" suppressHydrationWarning>
  <head><script dangerouslySetInnerHTML={{__html:themeScript}}/></head>
  <body>
   <JsonLd data={{'@context':'https://schema.org',...organization}}/>
   <a className="skip" href="#inhalt">Zum Inhalt springen</a>
   <SiteNavigation/>
   <main id="inhalt">{children}</main>
   <SiteFooter/>
   <CallButton phone={company.phone}/>
   <Motion/>
   <ServiceWorker/>
  </body>
 </html>;
}
