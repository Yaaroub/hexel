'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,ArrowLeft,Check,LifeBuoy,FileText,ThumbsUp,UserRound,AlertCircle,ShieldCheck,Inbox,Gauge,Paperclip,ShieldAlert,Tag} from 'lucide-react';
import NoticeBanner from '../components/NoticeBanner';
import CallbackForm from '../components/CallbackForm';
import {runDiagnostics,describeDiagnostics} from '../../lib/diagnostics-client';
import AiAssistant from './AiAssistant';
import {categories,classifyIssue} from '../../lib/portal-knowledge';

const stages=['Anliegen beschreiben','Selbst prüfen','An uns übergeben'];
const blankContact={name:'',email:'',location:''};

export default function PortalClient(){
 const [account,setAccount]=useState(null);
 const [mode,setMode]=useState('problem'),[stage,setStage]=useState('intake');
 const [description,setDescription]=useState(''),[device,setDevice]=useState(''),[categoryId,setCategoryId]=useState('');
 const [stepIndex,setStepIndex]=useState(0),[attempts,setAttempts]=useState([]);
 const [contact,setContact]=useState(blankContact),[error,setError]=useState(''),[busy,setBusy]=useState(false),[ticket,setTicket]=useState(null);
 const [priority,setPriority]=useState('normal'),[measure,setMeasure]=useState(true),[diag,setDiag]=useState(null),[diagState,setDiagState]=useState(''),[files,setFiles]=useState([]);
 const [scopes,setScopes]=useState([]),[forOrg,setForOrg]=useState(''),[deviceInfo,setDeviceInfo]=useState(null);
 const heading=useRef(null);

 useEffect(()=>{
  fetch('/api/account/me',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{const a=d?.account||null;setAccount(a);if(a?.user){setContact(c=>({...c,name:c.name||a.user.name,email:c.email||a.user.email}));fetch('/api/me',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(m=>setScopes(m?.scopes||[])).catch(()=>{})}}).catch(()=>{});
  const q=new URLSearchParams(location.search);
  if(q.get('modus')==='betrug'){setMode('check');setCategoryId('betrug')}
  // Aus „Mein Bereich“: Gerät schon bekannt.
  if(q.get('geraetId')&&q.get('name')){setDeviceInfo({id:q.get('geraetId').slice(0,40),label:q.get('name').slice(0,120),kindLabel:'aus Ihrer Geräteliste'});setDevice(q.get('name').slice(0,150));if(q.get('kategorie'))setCategoryId(q.get('kategorie'));if(q.get('fuer'))setForOrg(q.get('fuer'))}
  // QR-Aufkleber am Gerät: Gerät und Bereich sind schon ausgewählt.
  const qr=q.get('geraet');if(qr)fetch('/api/devices/by-token?t='+encodeURIComponent(qr)).then(r=>r.ok?r.json():null).then(d=>{if(!d?.device)return;setDeviceInfo(d.device);setDevice(d.device.label+' ('+d.device.kindLabel+')');setCategoryId(d.device.category);if(d.device.forOrg)setForOrg(d.device.forOrg)}).catch(()=>{});
  // Restore a draft after signing in, so nothing has to be typed twice.
  try{const saved=sessionStorage.getItem('funknaht-portal-draft');if(saved){const d=JSON.parse(saved);sessionStorage.removeItem('funknaht-portal-draft');setDescription(d.description||'');setDevice(d.device||'');setCategoryId(d.categoryId||'');setMode(d.mode||'problem');setAttempts(d.attempts||[]);setStage(d.stage||'intake')}}catch{}
 },[]);

 const category=categories.find(c=>c.id===categoryId),steps=category?.steps||[],step=steps[stepIndex];
 const stageNumber=stage==='intake'?0:stage==='guide'||stage==='resolved'?1:2;
 const selectable=categories.filter(c=>c.id!=='projekt'&&c.id!=='betrug');
 const fraudTips=categories.find(c=>c.id==='betrug')?.steps||[];

 function go(next){setStage(next);setError('');requestAnimationFrame(()=>{heading.current?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'smooth'})})}
 function signIn(){try{sessionStorage.setItem('funknaht-portal-draft',JSON.stringify({description,device,categoryId,mode,attempts,stage}))}catch{}location.href='/konto?next=/portal'}
 function validDescription(){if(description.trim().length<10){setError('Beschreiben Sie Ihr Anliegen bitte mit mindestens 10 Zeichen.');return false}return true}
 function begin(e){
  e.preventDefault();if(!validDescription())return;setStepIndex(0);setAttempts([]);
  if(mode==='project'){setCategoryId('projekt');go('handoff');return}
  if(mode==='check'){setCategoryId('betrug');setPriority('hoch');go('handoff');return}
  const chosen=categoryId||classifyIssue(description);
  if(!chosen){setError('Wählen Sie bitte den Bereich, der am besten passt. Wenn keiner passt, übergeben Sie das Anliegen direkt an uns.');return}
  setCategoryId(chosen);go(categories.find(c=>c.id===chosen)?.steps?.length?'guide':'handoff');
 }
 function direct(){if(!validDescription())return;const chosen=mode==='project'?'projekt':categoryId||classifyIssue(description)||'computer-software';setCategoryId(chosen);setAttempts([]);go('handoff')}
 function nextStep(){if(!step)return;setAttempts(p=>p.some(a=>a.stepId===step.id)?p:[...p,{stepId:step.id,result:'not-resolved'}]);if(stepIndex+1<steps.length)setStepIndex(i=>i+1);else go('handoff')}
 function aiHandoff(text){const issue=description||text||'';if(issue.trim().length<10){go('intake');setError('Beschreiben Sie bitte zuerst Ihr Anliegen.');return}if(!description)setDescription(issue.slice(0,4000));if(!categoryId)setCategoryId(classifyIssue(issue)||'computer-software');go('handoff')}
 async function measureNow(){setDiagState('läuft');try{const d=await runDiagnostics(t=>setDiagState(t));setDiag(d);setDiagState('fertig');return d}catch{setDiagState('');return null}}
 function pickFiles(e){const chosen=[...e.target.files].slice(0,3);const tooBig=chosen.find(f=>f.size>5*1024*1024);if(tooBig){setError('„'+tooBig.name+'“ ist größer als 5 MB.');e.target.value='';return}setError('');setFiles(chosen)}
 async function save(e){
  e.preventDefault();if(busy)return;
  if(mode==='check'&&!files.length){setError('Bitte hängen Sie ein Bildschirmfoto der Nachricht an. Nur so können wir sie beurteilen.');return}
  setBusy(true);setError('');
  try{let diagnostics=diag;if(measure&&mode==='problem'&&!diagnostics)diagnostics=await measureNow();
   const r=await fetch('/api/portal/tickets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({for:forOrg||undefined,deviceId:deviceInfo?.id,kind:mode,category:categoryId,description:description.trim(),device:device.trim(),name:contact.name.trim(),email:contact.email.trim(),location:contact.location.trim(),attempts,priority,diagnostics:measure?diagnostics:null})});
   const d=await r.json().catch(()=>null);if(r.status===401){setError('Bitte melden Sie sich an, um die Anfrage zu senden.');return}if(!r.ok||!d?.ticket?.id)throw Error(d?.error||'');
   const failed=[];for(const file of files){const form=new FormData();form.append('file',file);const u=await fetch('/api/portal/tickets/'+d.ticket.id+'/attachments'+(forOrg?'?for='+encodeURIComponent(forOrg):''),{method:'POST',body:form});if(!u.ok)failed.push(file.name)}
   setTicket({...d.ticket,failedFiles:failed});setFiles([]);go('success')}
  catch(err){setError(err.message||'Die Anfrage konnte nicht gespeichert werden. Ihre Angaben bleiben erhalten, bitte versuchen Sie es noch einmal.')}finally{setBusy(false)}
 }
 function restart(){setDiag(null);setDiagState('');setPriority('normal');setMode('problem');setDescription('');setDevice('');setCategoryId('');setAttempts([]);setStepIndex(0);setTicket(null);go('intake')}

 const modes=[['problem',LifeBuoy,'Etwas funktioniert nicht','Wir führen Sie durch kurze Prüfschritte.'],['check',ShieldAlert,'Ist das Betrug?','Verdächtige SMS, Mail oder Anruf prüfen lassen.'],['project',FileText,'Neues Vorhaben','Website, Software oder Termine online.']];
 const pickMode=m=>{setMode(m);setCategoryId(m==='check'?'betrug':m==='project'?'projekt':'');setError('')};
 return <div className="pflow-page">
  <div className="wrap pflow">
   <header className="pflow__head">
    <div><p className="pflow__kicker">Hilfe-Portal</p><h1 className="pflow__title">Schritt für Schritt zur Lösung.</h1></div>
    {account&&<Link className="mini-btn" href="/portal/werkstatt"><Inbox size={15}/>Mein Bereich</Link>}
   </header>
   <ol className="pflow__steps" aria-label="Fortschritt">{stages.map((label,i)=>{const done=stageNumber>i||stage==='success';return <li key={label} aria-current={stageNumber===i&&stage!=='success'?'step':undefined} className={done?'is-done':''}><span className="pflow__bar"/><span className="pflow__label">{done?<Check size={14}/>:<b>{i+1}</b>}{label}</span></li>})}</ol>
   <NoticeBanner/>
   <div className="pflow__card" data-sheet={stage==='success'?'ERLEDIGT':'FORMULAR · '+(stageNumber+1)+' VON 3'}>
    {stage==='intake'&&<section className="stage" aria-labelledby="stage-title">
     <h2 id="stage-title" ref={heading} tabIndex={-1}>Worum geht es?</h2>
     <div className="modes" role="radiogroup" aria-label="Art des Anliegens">{modes.map(([id,Icon,title,hint])=><button type="button" role="radio" aria-checked={mode===id} key={id} className={'mode'+(mode===id?' is-on':'')} onClick={()=>pickMode(id)}><Icon size={22} strokeWidth={1.7}/><strong>{title}</strong><small>{hint}</small></button>)}</div>
     {deviceInfo&&<p className="notice"><Tag size={18}/><span>Gerät: <strong>{deviceInfo.label}</strong> ({deviceInfo.kindLabel})</span></p>}
     {mode==='check'&&<div className="fraud-tips"><h3><ShieldAlert size={20}/>Bis wir antworten: drei Regeln</h3><ol>{fraudTips.map(t=><li key={t.id}><strong>{t.title}.</strong> {t.instruction}</li>)}</ol><p className="hint">Haben Sie schon Bankdaten eingegeben oder Geld überwiesen? Rufen Sie zuerst Ihre Bank an oder den Sperr-Notruf <a className="link" href="tel:116116">116 116</a>.</p></div>}
     <form className="form" onSubmit={begin}>
      <label className="field">{mode==='project'?'Was soll entstehen oder besser funktionieren?':mode==='check'?'Was ist passiert? Woher kam die Nachricht oder der Anruf?':'Beschreiben Sie das Problem in Ihren Worten'}<textarea value={description} onChange={e=>setDescription(e.target.value)} minLength={10} maxLength={4000} required rows={5} placeholder={mode==='check'?'Zum Beispiel: SMS von angeblich meiner Bank, ich soll über einen Link mein Konto bestätigen.':mode==='project'?'Zum Beispiel: Wir möchten Terminanfragen für unseren Betrieb online annehmen.':'Zum Beispiel: Der Laptop ist mit dem WLAN verbunden, aber Webseiten laden nicht.'}/></label>
      {mode==='problem'&&<details className="more-fields" open={!!(deviceInfo||categoryId)}>
       <summary>Gerät und Bereich angeben <span className="field__opt">(optional)</span></summary>
       <label className="field"><span>Betroffenes Gerät</span><input value={device} onChange={e=>setDevice(e.target.value)} maxLength={150} placeholder="z. B. Windows-Laptop, Drucker im Büro, Fritzbox"/></label>
       <fieldset className="field" style={{border:0,padding:0,margin:0}}><legend style={{marginBottom:8}}>Bereich <span className="field__opt">(sonst schlagen wir einen vor)</span></legend>
        <div className="category-grid">{selectable.map(c=><button className="category" type="button" key={c.id} aria-pressed={categoryId===c.id} onClick={()=>setCategoryId(categoryId===c.id?'':c.id)}><strong>{c.title}</strong></button>)}</div>
       </fieldset>
      </details>}
      {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
      <div className="actions"><button className="btn" type="submit">{mode==='project'?'Weiter zur Anfrage':mode==='check'?'Nachricht prüfen lassen':'Prüfung starten'}<ArrowRight size={18}/></button>{mode==='problem'&&<button className="link" type="button" onClick={direct}><UserRound size={16}/>Lieber direkt an einen Menschen</button>}</div>
      <p className="pflow__privacy"><ShieldCheck size={16}/>Bitte keine Passwörter eintragen. Ihre Anfrage sehen nur Sie und das FUNKNAHT-Team.</p>
     </form>
    </section>}
    {stage==='guide'&&step&&<section className="stage" aria-labelledby="stage-title">
     <h2 id="stage-title" ref={heading} tabIndex={-1}>{category.title}</h2>
     <div className="progressbar" aria-hidden="true"><span style={{width:((stepIndex+1)/steps.length*100)+'%'}}/></div>
     <article className="check-card" aria-live="polite">
      <span className="check-card__count">Prüfschritt {stepIndex+1} von {steps.length}</span>
      <h3>{step.title}</h3>
      <p>{step.instruction}</p>
      <div className="notice"><Check size={18}/><div><strong>Danach prüfen</strong>{step.verify}</div></div>
      {step.escalateWhen&&<div className="notice notice--warn"><AlertCircle size={18}/><div>{step.escalateWhen}</div></div>}
     </article>
     <div className="actions"><button className="btn" type="button" onClick={()=>go('resolved')}><ThumbsUp size={17}/>Das hat geholfen</button><button className="btn btn--ghost" type="button" onClick={nextStep} style={{color:'var(--ink)'}}>{stepIndex+1<steps.length?'Problem besteht noch':'Weiterhin ungelöst'}<ArrowRight size={17}/></button></div>
     <div className="actions"><button className="link" type="button" onClick={()=>go('handoff')}><UserRound size={16}/>Direkt an uns übergeben</button><button className="link" type="button" onClick={()=>go('intake')}><ArrowLeft size={16}/>Beschreibung ändern</button></div>
    </section>}

    {stage==='resolved'&&<section className="stage" aria-labelledby="stage-title">
     <span className="success-mark"><Check size={28}/></span>
     <h2 id="stage-title" ref={heading} tabIndex={-1}>Schön, dass es wieder läuft.</h2>
     <p>„{step?.title}“ hat geholfen. Es wurde nichts gespeichert oder gesendet. Tritt das Problem wieder auf, finden Sie die Schritte hier jederzeit.</p>
     <div className="actions"><button className="btn" type="button" onClick={restart}>Neues Anliegen<ArrowRight size={17}/></button><Link className="link" href="/">Zur Startseite</Link></div>
    </section>}

    {stage==='handoff'&&<section className="stage" aria-labelledby="stage-title">
     <h2 id="stage-title" ref={heading} tabIndex={-1}>{mode==='project'?'Ihr Vorhaben an uns senden':mode==='check'?'Nachricht prüfen lassen':'An uns übergeben'}</h2>
     <p>{mode==='project'?'Ergänzen Sie Ihre Kontaktdaten. Wir melden uns mit Rückfragen oder einem Terminvorschlag.':'Sie müssen nichts noch einmal erklären: Beschreibung und Prüfschritte gehen mit Ihrer Anfrage an uns.'}</p>
     <dl className="summary">
      <dt>Bereich</dt><dd>{category?.title||'Neues Vorhaben'}</dd>
      <dt>Beschreibung</dt><dd>{description}</dd>
      {device&&<><dt>Gerät</dt><dd>{device}</dd></>}
      {mode==='problem'&&<><dt>Bereits geprüft</dt><dd>{attempts.length?<ul>{attempts.map(a=><li key={a.stepId}>{steps.find(s=>s.id===a.stepId)?.title||a.stepId}</li>)}</ul>:'Noch keine Prüfschritte'}</dd></>}
     </dl>
     {!account&&<div className="notice notice--warn"><UserRound size={18}/><div><strong>Melden Sie sich kurz an.</strong>Damit wir Ihnen antworten können und Sie den Stand Ihrer Anfrage sehen. Ihre Angaben bleiben erhalten. <button className="link" type="button" onClick={signIn}>Anmelden oder Konto anlegen</button></div></div>}
     <form className="form" onSubmit={save}>
      <fieldset disabled={busy||!account}>
       {scopes.length>0&&<label className="field">Für wen ist die Anfrage?<select value={forOrg} onChange={e=>setForOrg(e.target.value)}><option value="">Für mich selbst</option>{scopes.map(s=><option key={s.organizationId} value={s.organizationId}>Für {s.name}</option>)}</select></label>}
       <div className="form-grid">
        <label className="field">Name<input value={contact.name} onChange={e=>setContact({...contact,name:e.target.value})} autoComplete="name" required minLength={2} maxLength={120}/></label>
        <label className="field">E-Mail<input type="email" value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})} autoComplete="email" required maxLength={254}/></label>
       </div>
       <label className="field"><span>Ort {categoryId==='internet-wlan'?'':<span className="field__opt">(optional)</span>}</span><input value={contact.location} onChange={e=>setContact({...contact,location:e.target.value})} autoComplete="address-level2" maxLength={150} required={categoryId==='internet-wlan'} placeholder={categoryId==='internet-wlan'?'Für einen Einsatz vor Ort':''}/></label>
       <fieldset className="field" style={{border:0,padding:0,margin:0}}><legend style={{marginBottom:8}}>Wie dringend ist es?</legend><div className="choices">{[['normal','Hat Zeit'],['hoch','Bald, es stört die Arbeit'],['dringend','Dringend, nichts geht mehr']].map(([v,l])=><label className="choice" key={v}><input type="radio" name="priority" checked={priority===v} onChange={()=>setPriority(v)}/><span>{l}</span></label>)}</div></fieldset>
       {mode==='problem'&&<div className="panel panel--quiet" style={{display:'grid',gap:10}}>
        <label className="check"><input type="checkbox" checked={measure} onChange={e=>setMeasure(e.target.checked)}/><span><strong>Technische Messwerte anhängen</strong> (empfohlen). Wir messen Antwortzeit und Download zu unserem Server und lesen Gerät und Browser aus. Keine persönlichen Daten, keine Drittanbieter.</span></label>
        {measure&&(diag?<dl className="kv">{describeDiagnostics(diag).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>:<div><button className="mini-btn" type="button" onClick={measureNow} disabled={diagState&&diagState!=='fertig'}><Gauge size={15}/>{diagState&&diagState!=='fertig'?diagState:'Jetzt messen'}</button><span className="hint" style={{marginLeft:10}}>Sonst messen wir beim Senden.</span></div>)}
       </div>}
       <div className="field"><span>{mode==='check'?'Bildschirmfoto der Nachricht':'Fotos oder Screenshots'} <span className="field__opt">{mode==='check'?'(erforderlich, bis zu 3 Bilder)':'(optional, bis zu 3 Dateien, je max. 5 MB)'}</span></span>
        <label className="mini-btn" style={{justifySelf:'start',cursor:'pointer'}}><Paperclip size={15}/>Dateien auswählen<input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" multiple onChange={pickFiles} className="sr-only"/></label>
        {files.length>0&&<ul className="hint" style={{margin:0,paddingLeft:18}}>{files.map(f=><li key={f.name}>{f.name} ({Math.ceil(f.size/1024)} KB)</li>)}</ul>}
        <span className="hint">Ein Foto der Fehlermeldung oder der Router-Lämpchen hilft oft mehr als jede Beschreibung.</span>
       </div>
       {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
       <div className="actions"><button className="btn" type="submit">{busy?'Wird gesendet …':'Anfrage senden'}<ArrowRight size={17}/></button><button className="link" type="button" onClick={()=>go('intake')}><ArrowLeft size={16}/>Beschreibung ändern</button></div>
      </fieldset>
     </form>
    </section>}

    {stage==='success'&&ticket&&<section className="stage" aria-labelledby="stage-title">
     <span className="success-mark"><Check size={28}/></span>
     <h2 id="stage-title" ref={heading} tabIndex={-1}>Ihre Anfrage ist bei uns.</h2>
     <p>Wir sehen sie uns an und antworten in Ihrem Konto unter „Meine Anfragen“. Dort können Sie auch weitere Fotos nachreichen und direkt mit uns schreiben.</p>
     {ticket.failedFiles?.length>0&&<p className="notice notice--warn"><AlertCircle size={18}/><span>Nicht hochgeladen: {ticket.failedFiles.join(', ')}. Sie können die Dateien unter „Meine Anfragen“ erneut anhängen.</span></p>}
     <dl className="summary"><dt>Anfragenummer</dt><dd><strong>{ticket.id}</strong></dd><dt>Eingegangen</dt><dd>{new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(ticket.createdAt))} Uhr</dd></dl>
     <div className="actions"><Link className="btn" href="/portal/werkstatt">Meine Anfragen<ArrowRight size={17}/></Link><button className="link" type="button" onClick={restart}>Neues Anliegen</button></div>
    </section>}

   </div>
   <div className="pflow__more">
    <CallbackForm compact collapsible level={2} title="Lieber telefonieren?" intro="Nummer da lassen, wir rufen zurück."/>
    <details className="ai-more"><summary><span className="ai-more__icon">✦</span><span><strong>KI-Assistent fragen</strong><small>Erklärt Begriffe und schlägt nächste Schritte vor.</small></span></summary>
     <AiAssistant account={account} onSignIn={signIn} onHandoff={aiHandoff} category={categoryId}/>
    </details>
   </div>
  </div>
 </div>;
}
