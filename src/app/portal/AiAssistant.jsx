'use client';
import {useEffect,useRef,useState} from 'react';
import {Sparkles,Send,UserRound,AlertCircle} from 'lucide-react';
export default function AiAssistant({account,onSignIn,onHandoff,category}){
 const [info,setInfo]=useState(null),[messages,setMessages]=useState([]),[message,setMessage]=useState(''),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const chat=useRef(null);
 useEffect(()=>{if(!account){setInfo(null);return}const c=new AbortController();fetch('/api/portal/ai',{signal:c.signal}).then(r=>r.ok?r.json():null).then(setInfo).catch(()=>{});return()=>c.abort()},[account]);
 useEffect(()=>{chat.current?.scrollTo({top:chat.current.scrollHeight,behavior:'smooth'})},[messages,busy]);
 async function send(e){
  e.preventDefault();if(busy)return;const text=message;setBusy(true);setError('');setMessages(m=>[...m,{role:'user',content:text}]);setMessage('');
  try{const r=await fetch('/api/portal/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,category,consent,history:messages.slice(-8)})});const d=await r.json();if(!r.ok)throw Error(d.error||'Die KI konnte gerade nicht antworten.');setMessages(m=>[...m,{role:'assistant',content:d.reply}]);setInfo(o=>({...o,usage:d.usage}))}
  catch(err){setError(err.message);setMessages(m=>m.slice(0,-1));setMessage(text)}finally{setBusy(false)}
 }
 return <section className="assistant" aria-labelledby="ai-title">
  <div style={{display:'flex',gap:14,alignItems:'flex-start'}}><Sparkles size={22} color="var(--champagne)" style={{flex:'none',marginTop:4}}/><div><h2 id="ai-title">Fragen Sie den KI-Assistenten</h2><p className="hint" style={{marginTop:4}}>Er erklärt Begriffe und schlägt nächste Schritte vor. Er greift nicht auf Ihre Geräte zu und ersetzt keine Prüfung vor Ort.</p></div></div>
  {!account?<div className="notice"><UserRound size={18}/><div>Der Assistent steht mit einem Konto zur Verfügung, kostenlos sind 3 Fragen im Monat. <button className="link" type="button" onClick={onSignIn}>Anmelden oder Konto anlegen</button></div></div>:<>
   <div className="usage"><span>{info?.provider||'KI-Anbieter'}</span><span>{info?.usage?`Noch ${info.usage.remaining} von ${info.usage.limit} Fragen diesen Monat`:'Kontingent wird geladen …'}</span></div>
   {info&&!info.configured&&<div className="notice"><AlertCircle size={18}/>Der Assistent ist gerade nicht verfügbar. Die geführten Prüfschritte funktionieren weiterhin.</div>}
   {(messages.length>0||busy)&&<div className="chat" ref={chat} aria-live="polite">{messages.map((m,i)=><div key={i} className={'bubble bubble--'+(m.role==='user'?'user':'ai')}>{m.content}</div>)}{busy&&<div className="bubble bubble--ai" aria-label="Antwort wird erstellt">…</div>}</div>}
   <form className="form" onSubmit={send}>
    <label className="field">Ihre Frage<textarea required minLength={5} maxLength={3000} rows={3} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Was bedeutet „kein Internet, gesichert“ beim WLAN?"/></label>
    <label className="check"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>Ich bin einverstanden, dass meine Frage und der Verlauf an {info?.provider||'den KI-Anbieter'} übermittelt werden. Ich gebe keine Passwörter oder vertraulichen Daten ein.</span></label>
    {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
    <div className="actions"><button className="btn btn--light" disabled={busy||!info?.configured}>{busy?'Antwort wird erstellt …':'Frage senden'}<Send size={16}/></button><button className="link" type="button" onClick={()=>onHandoff(messages.filter(m=>m.role==='user').map(m=>m.content).join('\n')||message)}><UserRound size={16}/>Lieber an einen Menschen übergeben</button></div>
   </form>
  </>}
 </section>;
}
