'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Eye,EyeOff,LogOut,Download,Trash2,CalendarCheck,LifeBuoy,ShieldCheck,AlertCircle,X,KeyRound} from 'lucide-react';

const allowedNext=['/portal','/portal/werkstatt','/betrieb','/inhaber'];
const okNext=v=>allowedNext.includes(v)||/^\/einladung\/[A-Za-z0-9_-]{20,80}$/.test(v||'');

export default function AccountClient(){
 const [tab,setTab]=useState('login'),[type,setType]=useState('business'),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[session,setSession]=useState(null),[checking,setChecking]=useState(true),[next,setNext]=useState('');
 const del=useRef(null),[delError,setDelError]=useState('');
 useEffect(()=>{const q=new URLSearchParams(location.search);if(okNext(q.get('next')))setNext(q.get('next'));if(q.get('typ')==='betrieb'){setTab('register');setType('business')}
  fetch('/api/account/me',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>setSession(d?.account||null)).catch(()=>{}).finally(()=>setChecking(false))},[]);
 const home=a=>next||(a?.isOwner?'/inhaber':a?.organization?.accountType==='business'?'/betrieb':'/portal/werkstatt');
 async function submit(e){
  e.preventDefault();if(busy)return;setBusy(true);setError('');const f=Object.fromEntries(new FormData(e.currentTarget));
  try{const r=await fetch('/api/account/'+(tab==='login'?'login':'register'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(tab==='login'?{email:f.email,password:f.password}:{name:f.name,email:f.email,password:f.password,businessName:type==='business'?f.businessName:'',accountType:type})});const d=await r.json();if(!r.ok)throw Error(d.error||'Das hat nicht geklappt. Bitte versuchen Sie es erneut.');location.assign(home(d.account))}
  catch(err){setError(err.message);setBusy(false)}
 }
 async function logout(){setBusy(true);try{await fetch('/api/account/logout',{method:'POST'});setSession(null)}finally{setBusy(false)}}
 async function remove(e){
  e.preventDefault();setDelError('');const f=Object.fromEntries(new FormData(e.currentTarget));setBusy(true);
  try{const r=await fetch('/api/account/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:f.password,confirmation:f.confirmation})});const d=await r.json();if(!r.ok)throw Error(d.error||'Das Konto konnte nicht gelöscht werden.');location.assign('/?konto=geloescht')}
  catch(err){setDelError(err.message);setBusy(false)}
 }

 return <div className="auth">
  <div className="auth__intro">
   <p className="intro" style={{color:'var(--champagne)',margin:0}}>Ihr FUNKNAHT-Konto</p>
   <h1 className="display">Ein Zugang für Hilfe und Ihren Betrieb.</h1>
   <ul>
    <li><LifeBuoy size={18}/><span>Anliegen im Hilfe-Portal speichern und Antworten an einem Ort sehen.</span></li>
    <li><CalendarCheck size={18}/><span>Als Betrieb: Buchungsseite, Termine, Kunden und Aufträge verwalten.</span></li>
    <li><ShieldCheck size={18}/><span>Ihre Daten gehören Ihnen. Export und Löschung jederzeit mit einem Klick.</span></li>
   </ul>
  </div>
  <div className="auth__panel"><div className="auth__box">
   {checking?<p role="status" className="muted">Einen Moment …</p>:session?<>
    <div><p className="muted">Angemeldet als</p><h2>{session.user.name}</h2><p className="muted" style={{marginTop:4}}>{session.user.email}{session.organization?.accountType==='business'?' · '+session.organization.name:''}</p></div>
    <div className="actions"><a className="btn" href={home(session)}>{session.isOwner&&!next?'Zum Inhaberbereich':'Weiter'}<ArrowRight size={17}/></a><button className="link" onClick={logout} disabled={busy}><LogOut size={16}/>Abmelden</button></div>
    <div className="panel" style={{display:'grid',gap:14}}>
     <div className="panel__head" style={{margin:0}}><div><h3>Ihre Daten</h3><p>Nach DSGVO können Sie Ihre Daten jederzeit abrufen oder löschen.</p></div></div>
     <a className="mini-btn" href="/api/account/export" download><Download size={15}/>Alle Daten herunterladen (JSON)</a>
     <button className="mini-btn mini-btn--danger" type="button" onClick={()=>{setDelError('');del.current?.showModal()}}><Trash2 size={15}/>Konto löschen</button>
    </div>
    <dialog className="sheet" ref={del} aria-labelledby="del-title">
     <div className="sheet__head"><h2 id="del-title">Konto endgültig löschen</h2><button className="icon-btn" onClick={()=>del.current.close()} aria-label="Schließen"><X size={18}/></button></div>
     <form className="sheet__body form" onSubmit={remove}>
      <p className="notice notice--warn"><AlertCircle size={18}/><span>Gelöscht werden Ihr Zugang, alle Kunden, Termine, Aufträge, Leistungen und Anfragen. Das lässt sich nicht rückgängig machen. Laden Sie Ihre Daten vorher herunter, wenn Sie sie behalten möchten.</span></p>
      <label className="field">Ihr Passwort<input name="password" type="password" autoComplete="current-password" required/></label>
      <label className="field">Zur Bestätigung LÖSCHEN eingeben<input name="confirmation" required pattern="LÖSCHEN" autoComplete="off"/></label>
      {delError&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{delError}</p>}
      <div className="actions"><button className="btn" style={{background:'var(--err)'}} disabled={busy}>Konto löschen</button><button type="button" className="link" onClick={()=>del.current.close()}>Abbrechen</button></div>
     </form>
    </dialog>
   </>:<>
    <div className="segmented" role="tablist" aria-label="Anmelden oder registrieren"><button role="tab" aria-selected={tab==='login'} onClick={()=>{setTab('login');setError('')}}>Anmelden</button><button role="tab" aria-selected={tab==='register'} onClick={()=>{setTab('register');setError('')}}>Konto anlegen</button></div>
    <h2>{tab==='login'?'Willkommen zurück.':'Kostenlos registrieren.'}</h2>
    <form className="form" onSubmit={submit}><fieldset disabled={busy}>
     {tab==='register'&&<>
      <div className="choices" role="radiogroup" aria-label="Kontotyp"><label className="choice"><input type="radio" name="t" checked={type==='business'} onChange={()=>setType('business')}/><span>Für meinen Betrieb</span></label><label className="choice"><input type="radio" name="t" checked={type==='private'} onChange={()=>setType('private')}/><span>Privat</span></label></div>
      <label className="field">Ihr Name<input name="name" autoComplete="name" maxLength={150} required/></label>
      {type==='business'&&<label className="field">Name des Betriebs<input name="businessName" autoComplete="organization" maxLength={150} required/></label>}
     </>}
     <label className="field">E-Mail<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
     <label className="field">Passwort<span className="password"><input name="password" type={show?'text':'password'} autoComplete={tab==='login'?'current-password':'new-password'} minLength={tab==='register'?12:undefined} maxLength={256} required aria-describedby={tab==='register'?'pw-hint':undefined}/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Passwort verbergen':'Passwort anzeigen'}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>
     {tab==='register'&&<p className="hint" id="pw-hint"><KeyRound size={14} style={{verticalAlign:'-2px'}}/> Mindestens 12 Zeichen. Ein Satz aus mehreren Wörtern ist leicht zu merken und sicher.</p>}
     {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
     <button className="btn" type="submit" style={{width:'100%'}}>{busy?'Einen Moment …':tab==='login'?'Anmelden':'Konto anlegen'}<ArrowRight size={17}/></button>
     {tab==='register'&&<p className="hint">Mit der Registrierung gilt unsere <Link className="link" href="/datenschutz">Datenschutzerklärung</Link>. Das Konto ist kostenlos; ein Tarif wird erst mit Zahlung aktiv.</p>}
    </fieldset></form>
   </>}
  </div></div>
 </div>;
}
