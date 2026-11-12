import {company} from './company';
import {towns,industries,routers,scope} from './profile';
import {privateRates,businessRates} from './pricing';
// Einsatzgebiet: Kiel zuerst, weil dort die meisten Suchanfragen entstehen.
export const regions=['Kiel','Kreis Plön','Ostholstein'];
export const regionText='Kiel, im Kreis Plön und in Ostholstein';
const configuredUrl=process.env.SITE_URL;
export const siteUrl=configuredUrl&&/^https?:\/\//.test(configuredUrl)?configuredUrl.replace(/\/$/,''):undefined;
const abs=p=>siteUrl?siteUrl+p:p;

export function pageMetadata(title,description,path){
 return {title,description,...(siteUrl?{alternates:{canonical:siteUrl+path}}:{}),
  openGraph:{title,description,type:'website',locale:'de_DE',siteName:'FUNKNAHT',images:[{url:'/opengraph-image',width:1200,height:630,alt:'FUNKNAHT – Netzwerk, Software und Digitalhilfe'}],...(siteUrl?{url:siteUrl+path}:{})},
  twitter:{card:'summary_large_image',title,description}};
}

// Firmendaten für Google, Bing und KI-Suchen. Nur echte Angaben: Adresse und Telefon
// erscheinen erst, wenn sie in der Server-Konfiguration gesetzt sind.
const sameAs=(process.env.COMPANY_PROFILES||'').split(',').map(s=>s.trim()).filter(s=>/^https:\/\//.test(s));
export const organization={
 '@type':['ProfessionalService','LocalBusiness'],
 '@id':abs('/#funknaht'),
 name:'FUNKNAHT',
 description:'FUNKNAHT richtet Netzwerke, WLAN und Router aller gängigen Hersteller ein und betreut sie, entwickelt Websites und Software und bietet Digitalhilfe für Senioren. Vor Ort in '+regionText+'. Keine Hardware-Reparaturen.',
 ...(siteUrl?{url:siteUrl,logo:siteUrl+'/funknaht-mark.png',image:siteUrl+'/opengraph-image'}:{}),
 ...(company.phone?{telephone:company.phone}:{}),
 ...(company.email?{email:company.email}:{}),
 ...(company.street&&company.city?{address:{'@type':'PostalAddress',streetAddress:company.street,postalCode:(company.city.match(/\d{5}/)||[''])[0],addressLocality:company.city.replace(/\d{5}\s*/,''),addressRegion:'Schleswig-Holstein',addressCountry:'DE'}}:{}),
 ...(company.owner?{founder:{'@type':'Person',name:company.owner}}:{}),
 priceRange:privateRates.hour+'–'+businessRates.hour+' € pro Stunde',
 currenciesAccepted:'EUR',paymentAccepted:'Rechnung, Überweisung',
 openingHoursSpecification:[{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday'],opens:'08:00',closes:'18:00'}],
 areaServed:[{'@type':'City',name:'Kiel'},{'@type':'AdministrativeArea',name:'Kreis Plön'},{'@type':'AdministrativeArea',name:'Kreis Ostholstein'},...towns.filter(t=>t.id!=='kiel').map(t=>({'@type':'City',name:t.name}))],
 knowsAbout:['WLAN','Netzwerktechnik','Router',...routers,'VPN','Firewall','Webentwicklung','Next.js','Automatisierung','Digitalhilfe für Senioren'],
 ...(sameAs.length?{sameAs}:{}),
};

export function serviceSchema({name,description,path,offers=[]}){
 return {'@context':'https://schema.org','@type':'Service',name,description,provider:{'@id':abs('/#funknaht')},areaServed:organization.areaServed,url:abs(path),
  ...(offers.length?{offers:offers.map(o=>({'@type':'Offer',name:o.name,price:String(o.price),priceCurrency:'EUR',...(o.unit?{description:o.unit}:{})}))}:{})};
}
export function faqSchema(items){return {'@context':'https://schema.org','@type':'FAQPage',mainEntity:items.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}}
export function breadcrumbSchema(items){return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map(([name,path],i)=>({'@type':'ListItem',position:i+1,name,item:abs(path)}))}}
export const scopeSentence='Wir arbeiten an Netzwerken und Software, nicht an Hardware: '+scope.doesNot[0].replace(/^Keine /,'keine ')+'.';
