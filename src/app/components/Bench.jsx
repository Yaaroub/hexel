'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Pause,Play,RotateCcw,Check} from 'lucide-react';

// Real logic, shown as it is written: the preview on the right is computed from it.
const source=`// Freie Termine eines Tages
function freieZeiten(tag, dauer) {
  const frei = [];
  for (let t = tag.von;
       t + dauer <= tag.bis;
       t += 30) {
    const belegt = tag.termine.some(
      b => b.von < t + dauer && b.bis > t
    );
    if (!belegt) frei.push(uhrzeit(t));
  }
  return frei;
}`;

const keywords=/\b(function|const|let|for|if|return)\b/;
function tokenize(line){
 if(line.trim().startsWith('//'))return [['tok-c',line]];
 const parts=[];const re=/(\b(?:function|const|let|for|if|return)\b)|(\b(?:freieZeiten|some|push|uhrzeit)\b)|(\b\d+\b)/g;let last=0,m;
 while((m=re.exec(line))){if(m.index>last)parts.push(['',line.slice(last,m.index)]);parts.push([m[1]&&keywords.test(m[1])?'tok-k':m[2]?'tok-f':'tok-n',m[0]]);last=m.index+m[0].length}
 if(last<line.length)parts.push(['',line.slice(last)]);
 return parts;
}

// Same rule as the code: a 60-minute service collides with the 09:00–10:00 appointment.
const DAY={von:8*60,bis:12*60+30,termine:[{von:9*60,bis:10*60}]},DURATION=60;
const slots=[];for(let t=DAY.von;t+DURATION<=DAY.bis;t+=30){slots.push({t,label:String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0'),busy:DAY.termine.some(b=>b.von<t+DURATION&&b.bis>t)})}
const PICK=slots.findIndex(s=>!s.busy&&s.t>=10*60+30);

export default function Bench(){
 const lines=useMemo(()=>source.split('\n').map(tokenize),[]);
 const total=source.length;
 const [typed,setTyped]=useState(0),[shown,setShown]=useState(0),[picked,setPicked]=useState(false),[sent,setSent]=useState(false),[paused,setPaused]=useState(false),[run,setRun]=useState(0);
 const root=useRef(null),started=useRef(false);
 const done=typed>=total;

 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){setTyped(total);setShown(slots.length);setPicked(true);setSent(true);return}
  const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting&&!started.current){started.current=true;setRun(r=>r+1)}},{threshold:.3});
  if(root.current)observer.observe(root.current);
  return()=>observer.disconnect();
 },[total]);

 useEffect(()=>{
  if(!run||paused)return;
  let timer;
  if(typed<total){timer=setTimeout(()=>setTyped(v=>Math.min(total,v+(source[v]===' '?4:2))),26)}
  else if(shown<slots.length){timer=setTimeout(()=>setShown(v=>v+1),shown===0?380:95)}
  else if(!picked){timer=setTimeout(()=>setPicked(true),650)}
  else if(!sent){timer=setTimeout(()=>setSent(true),800)}
  return()=>clearTimeout(timer);
 },[run,paused,typed,shown,picked,sent,total]);

 function replay(){setTyped(0);setShown(0);setPicked(false);setSent(false);setPaused(false);setRun(r=>r+1)}

 // Render tokens up to the number of typed characters.
 let budget=typed;
 const rendered=lines.map((tokens,i)=>{
  const out=[];
  for(const [cls,text] of tokens){if(budget<=0)break;const part=text.slice(0,budget);budget-=part.length;out.push(<span key={out.length} className={cls||undefined}>{part}</span>)}
  budget-=1;
  return out;
 });
 const caretLine=(()=>{let b=typed;for(let i=0;i<lines.length;i++){const len=source.split('\n')[i].length;if(b<=len)return i;b-=len+1}return lines.length-1})();
 const free=slots.filter(s=>!s.busy).length;

 return <figure className="bench" ref={root} aria-label="Animation: Programmcode für freie Termine wird geschrieben, daneben entsteht die passende Buchungsansicht.">
  <div className="bench__bar">
   <span className="bench__dots" aria-hidden="true"><i/><i/><i/></span>
   <span className="bench__tabs" aria-hidden="true"><span aria-current="true">termine.js</span><span>Vorschau</span></span>
   {sent&&run>0?<button className="bench__pause" type="button" onClick={replay} aria-label="Animation erneut abspielen"><RotateCcw size={13}/></button>
   :<button className="bench__pause" type="button" onClick={()=>setPaused(!paused)} aria-label={paused?'Animation fortsetzen':'Animation anhalten'}>{paused?<Play size={13}/>:<Pause size={13}/>}</button>}
  </div>
  <div className="bench__body">
   <pre className="bench__code" aria-hidden="true">{rendered.map((line,i)=><span className="ln" key={i}>{line}{i===caretLine&&<span className="caret"/>}</span>)}</pre>
   <div className="bench__preview" aria-hidden="true">
    <div className="pv-head"><strong>Termin buchen</strong><span>Dienstag</span></div>
    <div className="pv-service"><b>Heizungswartung</b><span className="pv-label">60 Min.</span></div>
    <div className="pv-label">Bereits gebucht: 09:00–10:00</div>
    <div className="pv-label">Freie Startzeiten</div>
    <div className="pv-slots">{slots.map((s,i)=><span key={s.t} className={'pv-slot'+(i<shown?' is-in':'')+(s.busy&&i<shown?' is-busy':'')+(picked&&i===PICK?' is-picked':'')}>{s.label}</span>)}</div>
    <div className={'pv-send'+(sent?' is-done':'')}>{sent?<><Check size={15}/>Anfrage gespeichert</>:'Termin anfragen'}</div>
   </div>
  </div>
  <figcaption className="bench__status"><span>{done?'termine.js · gespeichert':'termine.js · wird geschrieben'}</span><span>{shown>=slots.length?<><b>{free} frei</b> · {slots.length-free} belegt</>:'—'}</span></figcaption>
 </figure>;
}
