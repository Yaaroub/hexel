import {siteUrl} from '../lib/seo';
export default function sitemap(){return siteUrl?['/','/betriebsportal','/netzwerkhilfe','/senioren','/projects','/contact','/portal','/hilfe','/hilfe/betrug','/hilfe/internet-wlan','/hilfe/drucker','/hilfe/computer-software','/hilfe/website','/impressum','/datenschutz'].map(path=>({url:siteUrl+path,lastModified:new Date()})):[]}
