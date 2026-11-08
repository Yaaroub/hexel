import {siteUrl} from '../lib/seo';
export default function robots(){return {rules:{userAgent:'*',...(siteUrl?{allow:'/',disallow:['/api/','/inhaber','/betrieb','/konto','/portal/werkstatt','/buchen/']}:{disallow:'/'})},...(siteUrl?{sitemap:siteUrl+'/sitemap.xml'}:{})}}
