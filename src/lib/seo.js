export const regions=['Kreis Plön','Ostholstein'];
export const regionText=regions.join(' und ');
const configuredUrl=process.env.SITE_URL;
export const siteUrl=configuredUrl&&/^https?:\/\//.test(configuredUrl)?configuredUrl.replace(/\/$/,''):undefined;
export function pageMetadata(title,description,path){
 return {title,description,...(siteUrl?{alternates:{canonical:siteUrl+path}}:{}),openGraph:{title,description,type:'website',locale:'de_DE',siteName:'FUNKNAHT',...(siteUrl?{url:siteUrl+path}:{})},twitter:{card:'summary',title,description}};
}
export const organization={'@type':'Organization',name:'FUNKNAHT',description:'FUNKNAHT entwickelt Websites und Software, hilft bei IT- und Netzwerkfragen und bietet ein Online-Portal für Termine, Kunden und Aufträge kleiner Betriebe.',...(siteUrl?{url:siteUrl,logo:siteUrl+'/funknaht-mark.png'}:{}),areaServed:regions.map(name=>({'@type':'AdministrativeArea',name}))};
