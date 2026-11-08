import {siteUrl} from '../lib/seo';
export default function sitemap(){return siteUrl?['/','/netzwerkhilfe','/senioren','/projects','/contact','/portal','/impressum','/datenschutz'].map(path=>({url:siteUrl+path,lastModified:new Date()})):[]}
