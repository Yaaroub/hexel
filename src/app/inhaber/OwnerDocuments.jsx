'use client';
import {useEffect,useState} from 'react';
import {FileText,Plus,Trash2,Send,Check,X,AlertCircle,ExternalLink,ArrowLeft,Ban,Euro} from 'lucide-react';
const euro=c=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format((c||0)/100);
const day=v=>v?new Intl.DateTimeFormat('de-DE',{dateStyle:'medium'}).format(new Date(v+'T12:00:00')):'–';
const tone={entwurf:'muted',versendet:'info',angenommen:'ok',abgelehnt:'error',bezahlt:'ok',storniert:'muted'};
const toCents=v=>Math.round(Number(String(v).replace(/\./g,'').replace(',','.'))*100);
const fromCents=c=>((c||0)/100).toFixed(2).replace('.',',');
// Schritte, die nach dem jeweiligen Stand möglich sind (gleiche Regeln wie auf dem Server).
const next={entwurf:[['versendet','Fertigstellen und versenden',Send]],versendet:[['angenommen','Angenommen',Check,'angebot'],['abgelehnt','Abgelehnt',X,'angebot'],['bezahlt','Bezahlt',Euro,'rechnung'],['storniert','Stornieren',Ban]],angenommen:[['storniert','Stornieren',Ban]],bezahlt:[['storniert','Stornieren',Ban]]};

function Editor({doc,kinds,settings,api,handle,onSaved,onBack}){
 const [items,setItems]=useState(doc.items.map(i=>({...i,price:fromCents(i.priceCents)}))),[rec,setRec]=useState(doc.recipient),[intro,setIntro]=useState(doc.intro||''),[notes,setNotes]=useState(doc.notes||''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notify,setNotify]=useState(!!doc.recipient?.email),[saved,setSaved]=useState(false);
 const draft=doc.status==='entwurf';
 const set=(i,k,v)=>setItems(l=>l.map((x,j)=>j===i?{...x,[k]:v}:x));
 const add=kind=>setItems(l=>[...l,kind==='arbeit'?{kind,text:'Arbeitszeit',qty:1,unit:'Std.',price:fromCents(settings.hourlyRateCents)}:kind==='anfahrt'?{kind,text:'Anfahrtspauschale',qty:1,unit:'Stk.',price:fromCents(settings.travelFlatCents)}:{kind,text:'',qty:1,unit:'Stk.',price:'0,00'}]);
 const lineNet=i=>Math.round(Number(i.qty||0)*toCents(i.price||0));
 const net=items.reduce((s,i)=>s+(Number.isFinite(lineNet(i))?lineNet(i):0),0),rate=settings.smallBusiness?0:settings.vatRate,vat=Math.round(net*rate/100);
 const body=()=>({id:doc.id,recipient:rec,intro,notes,items:items.map(i=>({kind:i.kind,text:i.text,qty:Number(String(i.qty).replace(',','.')),unit:i.unit,priceCents:toCents(i.price)}))});
 async function save(){setBusy(true);setError('');try{const d=await api('/api/owner/documents',{method:'PATCH',body:JSON.stringify(body())});onSaved(d.document);setSaved(true);setTimeout(()=>setSaved(false),1500);return d.document}catch(e){if(!handle(e))setError(e.message);throw e}finally{setBusy(false)}}
 async function status(s){
  if(s==='versendet'&&!confirm('Beleg fertigstellen? Danach lässt er sich nicht mehr ändern, nur noch stornieren.'))return;
  if(s==='storniert'&&!confirm('Beleg stornieren?'))return;
  try{if(draft)await save();setBusy(true);setError('');const d=await api('/api/owner/documents',{method:'PATCH',body:JSON.stringify({id:doc.id,status:s,notify:s==='versendet'&&notify})});onSaved(d.document)}catch(e){if(e.status!==undefined&&!handle(e))setError(e.message)}finally{setBusy(false)}}
 async function remove(){if(!confirm('Entwurf löschen?'))return;try{await api('/api/owner/documents',{method:'DELETE',body:JSON.stringify({id:doc.id})});onBack(true)}catch(e){if(!handle(e))setError(e.message)}}

 return <article className="panel thread">
  <button className="link" style={{justifySelf:'start'}} onClick={()=>onBack(false)}><ArrowLeft size={16}/>Alle Belege</button>
  <div className="panel__head" style={{margin:0}}><div><h2>{doc.type==='angebot'?'Angebot':'Rechnung'} {doc.number}</h2><p>{doc.issuedOn?'Ausgestellt am '+day(doc.issuedOn)+(doc.dueOn?(doc.type==='angebot'?' · gültig bis ':' · fällig am ')+day(doc.dueOn):''):'Entwurf, noch nicht ausgestellt'}{doc.ticketId?' · zu Anfrage '+doc.ticketId:''}</p></div><span className={'badge badge--'+tone[doc.status]}>{doc.statusLabel}</span></div>
  {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
  <fieldset disabled={!draft||busy} className="form" style={{border:0,padding:0,margin:0}}>
   <div className="form-grid"><label className="field">Empfänger<input value={rec.name||''} onChange={e=>setRec({...rec,name:e.target.value})} maxLength={150}/></label><label className="field"><span>E-Mail <span className="field__opt">(für den Versand)</span></span><input type="email" value={rec.email||''} onChange={e=>setRec({...rec,email:e.target.value})} maxLength={254}/></label></div>
   <div className="form-grid"><label className="field">Straße und Hausnummer<input value={rec.street||''} onChange={e=>setRec({...rec,street:e.target.value})} maxLength={150}/></label><label className="field">PLZ und Ort<input value={rec.city||''} onChange={e=>setRec({...rec,city:e.target.value})} maxLength={150}/></label></div>
   <label className="field"><span>Einleitung <span className="field__opt">(optional)</span></span><textarea rows={2} maxLength={1000} value={intro} onChange={e=>setIntro(e.target.value)} placeholder={doc.type==='angebot'?'Gerne bieten wir Ihnen folgende Leistungen an:':'Für unsere Leistungen berechnen wir:'}/></label>
   <div className="table-wrap"><table className="table items"><thead><tr><th>Art</th><th>Beschreibung</th><th className="num">Menge</th><th>Einheit</th><th className="num">Preis netto</th><th className="num">Summe</th><th></th></tr></thead><tbody>
    {items.map((i,n)=><tr key={n}><td><select value={i.kind} onChange={e=>set(n,'kind',e.target.value)} aria-label="Art">{Object.entries(kinds).map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></td><td><input value={i.text} onChange={e=>set(n,'text',e.target.value)} maxLength={300} aria-label="Beschreibung" required/></td><td className="num"><input value={i.qty} onChange={e=>set(n,'qty',e.target.value)} inputMode="decimal" aria-label="Menge" style={{width:70,textAlign:'right'}}/></td><td><input value={i.unit} onChange={e=>set(n,'unit',e.target.value)} maxLength={20} aria-label="Einheit" style={{width:70}}/></td><td className="num"><input value={i.price} onChange={e=>set(n,'price',e.target.value)} inputMode="decimal" aria-label="Preis in Euro" style={{width:100,textAlign:'right'}}/></td><td className="num">{euro(lineNet(i))}</td><td>{draft&&<button type="button" className="mini-btn mini-btn--danger" aria-label="Position entfernen" onClick={()=>setItems(l=>l.filter((_,j)=>j!==n))}><Trash2 size={14}/></button>}</td></tr>)}
   </tbody></table></div>
   {draft&&<div className="actions"><span className="hint">Position hinzufügen:</span><button type="button" className="mini-btn" onClick={()=>add('arbeit')}><Plus size={14}/>Arbeitszeit</button><button type="button" className="mini-btn" onClick={()=>add('anfahrt')}><Plus size={14}/>Anfahrt</button><button type="button" className="mini-btn" onClick={()=>add('material')}><Plus size={14}/>Material</button><button type="button" className="mini-btn" onClick={()=>add('pauschale')}><Plus size={14}/>Pauschale</button></div>}
   <dl className="sum"><dt>Netto</dt><dd>{euro(net)}</dd>{settings.smallBusiness?<><dt>Umsatzsteuer</dt><dd>entfällt (§ 19 UStG)</dd></>:<><dt>Umsatzsteuer {rate} %</dt><dd>{euro(vat)}</dd></>}<dt className="sum__total">Gesamt</dt><dd className="sum__total">{euro(net+vat)}</dd></dl>
   <label className="field"><span>Hinweis unten <span className="field__opt">(optional)</span></span><textarea rows={2} maxLength={1000} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
  </fieldset>
  <div className="actions">
   {draft&&<button className="btn btn--small" disabled={busy} onClick={()=>save().catch(()=>{})}>{saved?<><Check size={15}/>Gespeichert</>:'Entwurf speichern'}</button>}
   {(next[doc.status]||[]).filter(([,, ,only])=>!only||only===doc.type).map(([s,label,Icon])=><button key={s} className={s==='storniert'?'mini-btn mini-btn--danger':'mini-btn'} disabled={busy} onClick={()=>status(s)}><Icon size={14}/>{label}</button>)}
   <a className="mini-btn" href={'/beleg/'+doc.id} target="_blank" rel="noreferrer"><ExternalLink size={14}/>Ansehen und drucken</a>
   {draft&&<button className="link" onClick={remove}><Trash2 size={14}/>Entwurf löschen</button>}
  </div>
  {draft&&<label className="check"><input type="checkbox" checked={notify} onChange={e=>setNotify(e.target.checked)} disabled={!rec.email}/><span>Beim Fertigstellen eine E-Mail an {rec.email||'den Empfänger'} senden{doc.organizationId?' (mit Link zum Kundenkonto)':''}</span></label>}
  {draft&&<p className="hint">Beträge mit Komma eingeben, z. B. 65,00. Ein fertiggestellter Beleg ist nicht mehr änderbar. Die Rechnungsnummer wird fortlaufend vergeben.</p>}
 </article>;
}

export default function OwnerDocuments({api,handle,start,onStarted}){
 const [data,setData]=useState(null),[open,setOpen]=useState(null),[filter,setFilter]=useState('alle'),[error,setError]=useState(''),[newForm,setNewForm]=useState(false);
 const load=()=>api('/api/owner/documents').then(setData).catch(handle);
 useEffect(()=>{load()},[]);// eslint-disable-line react-hooks/exhaustive-deps
 // Aus Kundenakte oder Anfrage angestoßen: Entwurf anlegen und direkt öffnen.
 useEffect(()=>{if(!start)return;onStarted?.();create(start)},[start]);// eslint-disable-line react-hooks/exhaustive-deps
 async function create(body){setError('');try{const d=await api('/api/owner/documents',{method:'POST',body:JSON.stringify(body)});setOpen(d.document);setNewForm(false);load()}catch(e){if(!handle(e))setError(e.message)}}
 const createFree=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));create({type:f.type,recipient:{name:f.name,email:f.email,street:f.street,city:f.city},items:[]})};
 if(open&&data)return <Editor key={open.id+open.status} doc={open} kinds={data.kinds} settings={data.settings} api={api} handle={handle} onSaved={d=>{setOpen(d);load()}} onBack={()=>{setOpen(null);load()}}/>;
 const list=(data?.documents||[]).filter(d=>filter==='alle'||(filter==='offen'?d.status==='entwurf'||d.status==='versendet':d.type===filter));
 return <section className="panel">
  <div className="panel__head"><div><h2>Angebote und Rechnungen</h2><p>Aus erfassten Zeiten oder frei erstellt. Kunden mit Konto sehen fertige Belege in ihrem Bereich und nehmen Angebote dort an.</p></div><button className="btn btn--small" onClick={()=>setNewForm(v=>!v)}><Plus size={15}/>Neuer Beleg</button></div>
  {data&&!data.companyComplete&&<p className="notice"><AlertCircle size={18}/>Für gültige Rechnungen fehlen Angaben zum Unternehmen (Inhaber, Anschrift). Sie werden in der Server-Konfiguration als COMPANY_* gesetzt.</p>}
  {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
  {newForm&&<form className="form panel panel--quiet" onSubmit={createFree} style={{marginBottom:16}}><div className="form-grid"><label className="field">Art<select name="type"><option value="angebot">Angebot</option><option value="rechnung">Rechnung</option></select></label><label className="field">Empfänger<input name="name" required maxLength={150}/></label></div><div className="form-grid"><label className="field">Straße<input name="street" maxLength={150}/></label><label className="field">PLZ und Ort<input name="city" maxLength={150}/></label></div><label className="field"><span>E-Mail <span className="field__opt">(optional)</span></span><input name="email" type="email" maxLength={254}/></label><p className="hint">Für Kunden mit Konto legen Sie Belege besser in der Kundenakte an, für Arbeitszeiten direkt in der Anfrage.</p><div className="actions"><button className="btn btn--small">Entwurf anlegen</button></div></form>}
  <div className="segmented" role="group" aria-label="Filter" style={{marginBottom:14}}>{[['alle','Alle'],['offen','Offen'],['angebot','Angebote'],['rechnung','Rechnungen']].map(([v,l])=><button key={v} aria-pressed={filter===v} onClick={()=>setFilter(v)}>{l}</button>)}</div>
  {!data?<p className="muted">Wird geladen …</p>:list.length===0?<div className="empty"><FileText size={24}/><h3>Keine Belege.</h3><p>Öffnen Sie eine Anfrage mit erfasster Arbeitszeit und wählen Sie „Rechnung aus Zeiten“.</p></div>:
  <div className="table-wrap"><table className="table"><thead><tr><th>Nummer</th><th>Empfänger</th><th>Stand</th><th>Datum</th><th className="num">Betrag</th></tr></thead><tbody>{list.map(d=><tr key={d.id} className="clickable" onClick={()=>setOpen(d)} tabIndex={0} onKeyDown={e=>e.key==='Enter'&&setOpen(d)}><td><strong>{d.number}</strong><br/><span className="hint">{d.type==='angebot'?'Angebot':'Rechnung'}</span></td><td>{d.recipient?.name}</td><td><span className={'badge badge--'+tone[d.status]}>{d.statusLabel}</span>{d.status==='versendet'&&d.dueOn&&d.dueOn<new Date().toISOString().slice(0,10)&&<><br/><span className="hint" style={{color:'var(--err)'}}>{d.type==='rechnung'?'überfällig':'abgelaufen'}</span></>}</td><td>{day(d.issuedOn||new Date(d.createdAt).toISOString().slice(0,10))}</td><td className="num">{euro(d.totals.gross)}</td></tr>)}</tbody></table></div>}
 </section>;
}
