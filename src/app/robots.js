import {siteUrl} from '../lib/seo';
export default function robots(){return {rules:{userAgent:'*',...(siteUrl?{allow:'/',disallow:'/api/'}:{disallow:'/'})},...(siteUrl?{sitemap:siteUrl+'/sitemap.xml'}:{})}}
