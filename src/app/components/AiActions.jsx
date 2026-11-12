'use client';
import {useState} from 'react';
import {Check,X,AlertCircle,Loader2} from 'lucide-react';
// Vorschläge der KI: erst nach ausdrücklicher Bestätigung wird etwas angelegt oder gesendet.
export default function AiActions({actions,onDone}){
 const [state,setState]=useState({});
 if(!actions?.length)return null;
 async function decide(a,decision){
  setState(s=>({...s,[a.id]:{busy:true}}));
  try{const r=await fetch('/api/ai/actions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:a.id,decision})});const d=await r.json();if(!r.ok)throw Error(d.error||'Das hat nicht geklappt.');setState(s=>({...s,[a.id]:{done:decision,text:decision==='verwerfen'?'Verworfen.':d.text}}));onDone?.(a,d)}
  catch(e){setState(s=>({...s,[a.id]:{error:e.message}}))}
 }
 return <div className="ai-actions">{actions.map(a=>{const st=state[a.id]||{};return <div key={a.id} className={'ai-action'+(st.done?' ai-action--'+st.done:'')}>
  <p className="ai-action__label">Vorschlag · wartet auf Bestätigung</p>
  <p className="ai-action__text">{a.summary}</p>
  {st.done?<p className="ai-action__result" role="status">{st.done==='ausfuehren'?<Check size={16}/>:<X size={16}/>}{st.text}</p>
  :<div className="ai-action__buttons">
   <button className="btn btn--small" disabled={st.busy} onClick={()=>decide(a,'ausfuehren')}>{st.busy?<Loader2 size={15} className="spin"/>:<Check size={15}/>}{a.label||'Ausführen'}</button>
   <button className="mini-btn" disabled={st.busy} onClick={()=>decide(a,'verwerfen')}><X size={15}/>Verwerfen</button>
  </div>}
  {st.error&&<p className="notice notice--error" role="alert"><AlertCircle size={16}/>{st.error}</p>}
 </div>})}</div>;
}
