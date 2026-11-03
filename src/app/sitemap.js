import {siteUrl} from '../lib/seo';
export default function sitemap(){return siteUrl?['/','/netzwerkhilfe','/projects','/contact'].map(path=>({url:siteUrl+path})):[]}
