import {scope,routers,industries,towns} from '../../lib/profile';
import {privateRates,businessRates,privatePlans,businessPlans,projectPrices,travelNote} from '../../lib/pricing';
import {company} from '../../lib/company';
import {siteUrl} from '../../lib/seo';
// Kurzprofil für KI-Assistenten und KI-Suchen (llms.txt-Vorschlag). Wird aus denselben Daten erzeugt wie die Website.
export const dynamic='force-static';
export function GET(){
 const u=p=>(siteUrl||'')+p;
 const lines=[
  '# FUNKNAHT','',
  '> IT-Dienstleister für Netzwerk und Software in Kiel, im Kreis Plön und in Ostholstein (Schleswig-Holstein). Richtet Netzwerke, WLAN, Router und Firewalls ein und betreut sie, entwickelt Websites und Webanwendungen und bietet Digitalhilfe für Senioren. Keine Hardware-Reparaturen.','',
  company.owner?'Inhaber: '+company.owner:'',company.phone?'Telefon: '+company.phone:'',company.email?'E-Mail: '+company.email:'',
  '','## Leistungen',...scope.does.map(s=>'- '+s),
  '','## Nicht im Angebot',...scope.doesNot.map(s=>'- '+s),
  '','## Router und Firewalls','- '+routers.join(', '),
  '','## Preise',
  '- Haushalte und Senioren: '+privateRates.hour+' € pro Stunde (Endpreis), Anfahrt '+privateRates.travel+' €, 15-Minuten-Takt',
  '- Betriebe: '+businessRates.hour+' € pro Stunde netto, Anfahrt '+businessRates.travel+' € netto',
  ...privatePlans.map(p=>'- Abo '+p.name+': '+p.price+' € '+p.unit),
  ...businessPlans.map(p=>'- Betreuung '+p.name+': '+(p.price?p.price+' €':p.priceText)+' '+p.unit),
  ...projectPrices.map(p=>'- '+p.name+': '+(p.from?'ab '+p.from+' € netto'+(p.monthly?' pro Monat':''):'Festpreis nach Angebot')),
  '- '+travelNote,
  '','## Zielgruppen',...industries.map(i=>'- '+i.name+': '+u('/branchen/'+i.id)),'- Senioren und Haushalte: '+u('/senioren'),
  '','## Einsatzgebiet',...towns.map(t=>'- '+t.name+' ('+t.area+'): '+u('/einsatzgebiet/'+t.id)),
  '','## Wichtige Seiten','- Preise: '+u('/preise'),'- Hilfe-Portal (Problem schildern): '+u('/portal'),'- Netzwerkhilfe: '+u('/netzwerkhilfe'),'- Betriebsportal (Online-Termine für Betriebe): '+u('/betriebsportal'),'- Kontakt: '+u('/contact'),
 ].filter((l,i,a)=>l!==''||a[i-1]!=='');
 return new Response(lines.join('\n')+'\n',{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
