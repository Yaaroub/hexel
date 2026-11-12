import {siteUrl} from '../lib/seo';
import {industries,towns} from '../lib/profile';
// Alle öffentlichen Seiten. Wichtige Seiten bekommen eine höhere Priorität.
const main=[['/',1],['/preise',.9],['/netzwerkhilfe',.9],['/senioren',.9],['/betriebsportal',.8],['/einsatzgebiet',.8],['/contact',.7],['/portal',.7],['/projects',.6],['/hilfe',.6]];
export default function sitemap(){
 if(!siteUrl)return [];
 const now=new Date();
 const pages=[...main,...industries.map(i=>['/branchen/'+i.id,.8]),...towns.map(t=>['/einsatzgebiet/'+t.id,.7]),...['betrug','internet-wlan','drucker','computer-software','website'].map(h=>['/hilfe/'+h,.5]),['/impressum',.2],['/datenschutz',.2],['/agb',.2],['/widerruf',.2],['/avv',.2]];
 return pages.map(([path,priority])=>({url:siteUrl+path,lastModified:now,priority}));
}
