'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {HeartHandshake,Users,Check,AlertCircle,ArrowRight,Eye,EyeOff} from 'lucide-react';
// Eine Seite für zwei Einladungen: Angehörige (Konto verbinden) und Mitarbeiter (Zugang zum Betrieb).
export default function Invite({token}){
 const [info,setInfo]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[show,setShow]=useState(false);
 useEffect(()=>{fetch('/api/invite/'+token,{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setInfo(d)}).catch(e=>setError(e.message||'Diese Einladung ist ungültig.'))},[token]);
 async function accept(e){e?.preventDefault();setBusy(true);setError('');const body=e?Object.fromEntries(new FormData(e.currentTarget)):{};try{const r=await fetch('/api/invite/'+token,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.error);setDone(true);setTimeout(()=>location.assign(d.next),1200)}catch(err){setError(err.message)}finally{setBusy(false)}}
 const back='/konto?next='+encodeURIComponent('/einladung/'+token);
 return <div className="booking" style={{maxWidth:620}}>
  {!info&&!error&&<p className="muted">Einladung wird geprüft …</p>}
  {error&&!info&&<div className="empty"><AlertCircle size={26}/><h3>{error}</h3><p>Bitten Sie die Person, die Sie eingeladen hat, um einen neuen Link.</p></div>}
  {info&&<div className="panel" style={{display:'grid',gap:18}}>
   {info.kind==='family'?<><span className="owner-lock__icon"><HeartHandshake size={24}/></span><h1 className="app__title">{info.inviter} möchte Sie als Vertrauensperson hinzufügen.</h1><p className="prose">Danach können Sie für {info.inviter} Anfragen an FUNKNAHT stellen, Antworten lesen und den Stand verfolgen. {info.inviter} kann die Verbindung jederzeit wieder lösen.</p></>
   :<><span className="owner-lock__icon"><Users size={24}/></span><h1 className="app__title">Zugang für {info.organizationName}</h1><p className="prose">Sie wurden als <strong>{info.roleLabel}</strong> eingeladen. Legen Sie Ihren Namen und ein Passwort fest. Die E-Mail-Adresse ist <strong>{info.email}</strong>.</p></>}
   {info.expired||info.accepted?<p className="notice notice--warn"><AlertCircle size={18}/>Diese Einladung ist abgelaufen oder wurde bereits verwendet.</p>
   :done?<p className="notice notice--ok" role="status"><Check size={18}/>Erledigt. Sie werden weitergeleitet …</p>
   :info.kind==='family'?(info.signedIn?<><p className="hint">Angemeldet als {info.signedInAs}.</p>{error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}<div className="actions"><button className="btn" onClick={()=>accept()} disabled={busy}><Check size={17}/>Einladung annehmen</button></div></>:<><p className="notice"><AlertCircle size={18}/>Melden Sie sich zuerst an oder legen Sie kostenlos ein Konto an. Danach kommen Sie hierher zurück.</p><Link className="btn" href={back}>Anmelden oder Konto anlegen<ArrowRight size={17}/></Link></>)
   :<form className="form" onSubmit={accept}><fieldset disabled={busy}>
    <label className="field">Ihr Name<input name="name" autoComplete="name" required maxLength={150}/></label>
    <label className="field">Passwort<span className="password"><input name="password" type={show?'text':'password'} autoComplete="new-password" minLength={12} required/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Passwort verbergen':'Passwort anzeigen'}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>
    <p className="hint">Mindestens 12 Zeichen.</p>
    {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
    <button className="btn">Zugang einrichten<ArrowRight size={17}/></button>
   </fieldset></form>}
  </div>}
 </div>;
}
