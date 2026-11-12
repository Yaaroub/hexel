// Testmodus (FUNKNAHT_AI_MOCK=1): ein lokales Ersatzmodell ohne echte KI.
// Es wählt anhand von Stichworten ein Werkzeug und fasst das Ergebnis zusammen.
// Nur zum Ausprobieren der Oberfläche und für automatische Tests, nie für echte Kunden.
import {MockLanguageModelV4} from 'ai/test';

const usage=(i,o)=>({inputTokens:{total:i,noCache:i},outputTokens:{total:o,text:o}});
const rules=[
 [/kontakt|gemeldet|lange nicht/i,'kunden_suchen',()=>({ohneKontaktSeitTagen:30})],
 [/aufgabe.*(anlegen|erstell)|erinner/i,'aufgabe_vorschlagen',t=>({titel:t.replace(/^.*?(anlegen|erstellen|erinnere)[:\s]*/i,'').slice(0,120)||'Neue Aufgabe'})],
 [/gemacht|heute|arbeit/i,'team_aktivitaet',()=>({})],
 [/aufgabe/i,'aufgaben_liste',()=>({status:'offen'})],
 [/rechnung/i,'abrechenbare_leistungen',()=>({})],
 [/termin/i,'freie_termine',()=>({tage:7})],
 [/bericht|umsatz/i,'monatsbericht',()=>({})],
 [/mensch|übergeb|uebergeb|anrufen/i,'an_mensch_uebergeben',t=>({zusammenfassung:'Kunde bittet um persönliche Hilfe: '+t.slice(0,300)})],
 [/meine anfrage|status/i,'meine_anfragen',()=>({})],
 [/anfrage|ticket/i,'anfragen_liste',()=>({status:'offen'})],
 [/.+/,'wissen_suchen',t=>({frage:t.slice(0,200)})],
];
function lastText(prompt){const m=[...prompt].reverse().find(x=>x.role==='user');return (m?.content||[]).map(c=>c.text||'').join(' ')}
export function mockModel(){
 return new MockLanguageModelV4({provider:'funknaht',modelId:'funknaht-test',doGenerate:async({prompt,tools=[]})=>{
  const last=prompt.at(-1),names=new Set(tools.map(t=>t.name));
  if(last.role==='tool'){
   const out=last.content.map(c=>c.output?.value??c.output).map(v=>JSON.stringify(v)).join('\n');
   const pending=/wartet_auf_bestaetigung/.test(out);
   return {content:[{type:'text',text:pending?'Ich habe einen Vorschlag vorbereitet. Bitte prüfen und mit dem Knopf bestätigen.':'**Testmodus** – Ergebnis des Werkzeugs `'+last.content[0]?.toolName+'`:\n\n```\n'+out.slice(0,1500)+'\n```'}],finishReason:{unified:'stop',raw:undefined},usage:usage(400,80),warnings:[]};
  }
  const text=lastText(prompt);
  const rule=rules.find(([re,name])=>names.has(name)&&re.test(text));
  if(!rule)return {content:[{type:'text',text:'Testmodus: keine passende Funktion gefunden.'}],finishReason:{unified:'stop',raw:undefined},usage:usage(200,20),warnings:[]};
  return {content:[{type:'tool-call',toolCallId:'t'+Date.now(),toolName:rule[1],input:JSON.stringify(rule[2](text))}],finishReason:{unified:'tool-calls',raw:undefined},usage:usage(300,30),warnings:[]};
 }});
}
