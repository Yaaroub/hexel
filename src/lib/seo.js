export const regions = ['Kreis Plön', 'Ostholstein'];
export const regionText = regions.join(', ');
const configuredUrl = process.env.SITE_URL;
export const siteUrl = configuredUrl && /^https?:\/\//.test(configuredUrl) ? configuredUrl.replace(/\/$/, '') : undefined;
export function pageMetadata(title, description, path) {
  return { title, description, ...(siteUrl ? {alternates:{canonical:siteUrl+path}} : {}), openGraph:{title,description,type:'website',locale:'de_DE',siteName:'FUNKNAHT',...(siteUrl?{url:siteUrl+path}:{})},twitter:{card:'summary',title,description} };
}
export const organization = {'@type':'Organization',name:'FUNKNAHT',description:'FUNKNAHT verbindet Netzwerkhilfe, Webentwicklung und Markendesign. Die Marke hieß zuvor HEXEL.',...(siteUrl?{url:siteUrl}:{}),areaServed:regions.map(name=>({'@type':'AdministrativeArea',name}))};


