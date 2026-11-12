// Wissensbasis für FUNKNAHT AI (Retrieval, das „R“ in RAG).
// Bewusst ohne externen Embedding-Dienst: Die Suche läuft lokal (BM25 mit deutscher Normalisierung),
// es verlassen also keine Inhalte den Server, nur die gefundenen Abschnitte gehen an das Sprachmodell.
import {categories} from '../portal-knowledge.js';
import {guides} from '../guides.js';
import {scope,routers} from '../profile.js';
import {privateRates,businessRates,privatePlans,businessPlans,projectPrices,travelNote} from '../pricing.js';

const STOP=new Set('der die das und oder ein eine einer eines einem einen ist sind war wie was wer wo wann warum ich du sie er es wir ihr mein meine mich mir dich dir sich nicht kein keine mit von zu zum zur im in am an auf aus bei für fur über uber unter nach vor bis den dem des auch noch nur schon sehr mal dann wenn dass da hier dort habe hat haben kann können konnen muss soll will wird werden wurde bitte danke hallo geht gibt mehr man so ja nein'.split(' '));
const norm=t=>String(t||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[̀-ͯ]/g,'');
// Grobe Stammformen, damit „Drucker“, „Druckers“ und „drucken“ zusammenfinden.
const stem=w=>w.length>5?w.replace(/(ungen|ung|en|er|es|e|n|s)$/,''):w;
export function tokens(text){return norm(text).split(/[^a-z0-9!]+/).filter(w=>w.length>1&&!STOP.has(w)).map(stem)}

function buildDocs(){
 const docs=[];
 for(const c of categories){
  docs.push({id:'hilfe:'+c.id,source:'Hilfe-Portal',audience:'alle',title:c.title,text:[c.description,...c.steps.map(s=>s.title+': '+s.instruction)].join('\n')});
  for(const s of c.steps)docs.push({id:'hilfe:'+c.id+':'+s.id,source:'Hilfe-Portal · '+c.title,audience:'alle',title:s.title,text:[s.instruction,s.verify&&'Prüfen: '+s.verify,s.escalateWhen&&'Übergeben, wenn: '+s.escalateWhen].filter(Boolean).join('\n')});
 }
 docs.push({id:'leistungen',source:'Leistungsumfang',audience:'alle',title:'Was FUNKNAHT macht und was nicht',text:['Wir machen: '+scope.does.join('; '),'Wir machen nicht: '+scope.doesNot.join('; '),'Router: '+routers.join(', ')].join('\n')});
 docs.push({id:'preise-privat',source:'Preise',audience:'alle',title:'Preise für Privatkunden',text:`Stundensatz ${privateRates.hour} € (Endpreis), Takt ${privateRates.step} Minuten, mindestens ${privateRates.minimum} Minuten, Anfahrt ${privateRates.travel} €. ${privateRates.note} ${travelNote}\nAbos: `+privatePlans.map(p=>`${p.name} ${p.price} € ${p.unit}: ${p.features.join('; ')}`).join('\n')});
 docs.push({id:'preise-betrieb',source:'Preise',audience:'alle',title:'Preise für Betriebe',text:`Stundensatz ${businessRates.hour} € netto, Anfahrt ${businessRates.travel} € netto, Aufschlag ${businessRates.urgent} % für Einsätze am selben Tag ohne Abo. ${businessRates.vatNote}\nBetreuung: `+businessPlans.map(p=>`${p.name} ${p.price?p.price+' €':p.priceText} ${p.unit}: ${p.features.join('; ')}`).join('\n')+'\nProjekte: '+projectPrices.map(p=>`${p.name} ${p.from?'ab '+p.from+' €':'nach Angebot'}: ${p.text}`).join('\n')});
 for(const g of guides)for(const s of g.sections)docs.push({id:'leitfaden:'+g.id+':'+norm(s.title).replace(/[^a-z0-9]+/g,'-'),source:'Leitfaden · '+g.title,audience:'team',title:g.title+' · '+s.title,text:[g.intro,...(s.items||[])].join('\n')});
 return docs.map(d=>({...d,terms:tokens(d.title+' '+d.title+' '+d.text)}));
}

let index;
function getIndex(){
 if(index)return index;
 const docs=buildDocs(),df=new Map();
 for(const d of docs)for(const t of new Set(d.terms))df.set(t,(df.get(t)||0)+1);
 const avg=docs.reduce((s,d)=>s+d.terms.length,0)/docs.length;
 return index={docs,df,avg,n:docs.length};
}

// BM25: bewährtes Relevanzmaß. audience 'kunde' sieht keine internen Leitfäden.
export function searchKnowledge(query,{audience='kunde',limit=4}={}){
 const {docs,df,avg,n}=getIndex(),q=[...new Set(tokens(query))];
 if(!q.length)return [];
 const k1=1.4,b=.75;
 return docs.filter(d=>audience==='team'||d.audience==='alle').map(d=>{
  let score=0;const tf=new Map();for(const t of d.terms)tf.set(t,(tf.get(t)||0)+1);
  for(const t of q){const f=tf.get(t)||0;if(!f)continue;const idf=Math.log(1+(n-(df.get(t)||0)+.5)/((df.get(t)||0)+.5));score+=idf*(f*(k1+1))/(f+k1*(1-b+b*d.terms.length/avg))}
  return {d,score};
 }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(({d,score})=>({id:d.id,quelle:d.source,titel:d.title,text:d.text.slice(0,1400),relevanz:Math.round(score*10)/10}));
}
