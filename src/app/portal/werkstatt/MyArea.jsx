'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {Inbox,HardDrive,Activity,FileText,HeartHandshake,AlertCircle,Copy,Check,Trash2,UserPlus,ShieldCheck,Plus} from 'lucide-react';
import Workshop from './Workshop';
import NoticeBanner from '../../components/NoticeBanner';
import AccessGate,{TrialBanner} from '../../components/AccessGate';

const fmtDay=v=>v?new Date(v+(String(v).length===10?'T12:00:00':'')).toLocaleDateString('de-DE'):'–';
const fmtTime=v=>v?new Intl.DateTimeFormat('de-DE',{dateStyle:'short',timeStyle:'short'}).format(new Date(v)):'noch nie';
const euro=c=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format((c||0)/100);
const stateLabel={ok:['ok','In Ordnung'],warnung:['wait','Warnung'],gestört:['error','Gestört'],unbekannt:['muted','Noch nicht geprüft']};
const docTone={versendet:'wait',angenommen:'ok',abgelehnt:'muted',bezahlt:'ok',storniert:'muted'};

// „Mein Bereich“: alles, was FUNKNAHT für einen Kunden betreut, an einem Ort.
export default function MyArea(){
 const [tab,setTab]=useState('tickets'),[forOrg,setForOrg]=useState(''),[data,setData]=useState(null),[error,setError]=useState(''),[auth,setAuth]=useState(true);
 const [inviteLink,setInviteLink]=useState(''),[copied,setCopied]=useState(false),[label,setLabel]=useState('');
 const load=useCallback(async()=>{setError('');try{const r=await fetch('/api/me'+(forOrg?'?for='+encodeURIComponent(forOrg):''),{cache:'no-store'});const d=await r.json();if(r.status===401){setAuth(false);return}if(!r.ok)throw Error(d.error);setData(d)}catch(e){setError(e.message||'Konnte nicht geladen werden.')}},[forOrg]);
 useEffect(()=>{load()},[load]);
 useEffect(()=>{const t=new URLSearchParams(location.search).get('tab');if(['tickets','devices','monitors','documents','family'].includes(t))setTab(t)},[]);
 async function invite(e){e.preventDefault();setError('');try{const r=await fetch('/api/family',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({label})});const d=await r.json();if(!r.ok)throw Error(d.error);setInviteLink(d.link);setLabel('');load()}catch(err){setError(err.message)}}
 async function unlink(id){if(!confirm('Verbindung wirklich lösen?'))return;try{const r=await fetch('/api/family',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});if(!r.ok)throw Error((await r.json()).error);if(data.scopes.some(s=>s.linkId===id))setForOrg('');load()}catch(err){setError(err.message)}}
 if(!auth)return <div className="wrap app"><div className="empty" style={{maxWidth:560}}><Inbox size={28}/><h3>Bitte melden Sie sich an.</h3><p>Ihr Bereich gehört zu Ihrem Konto.</p><Link className="btn" href="/konto?next=/portal/werkstatt">Anmelden</Link></div></div>;
 const access=data?.account?.access;
 if(access?.blocked&&!data?.acting)return <AccessGate message={access.message||access.reason} waiting={access.state==='wartet'}/>;
 const tabs=[['tickets','Anfragen',Inbox],['devices','Geräte',HardDrive,data?.devices?.length],['monitors','Überwachung',Activity,data?.monitors?.length],['documents','Belege',FileText,data?.documents?.length],...(forOrg?[]:[['family','Familie',HeartHandshake]])];
 return <div className="wrap app">
  <div className="app__head"><div><h1 className="app__title">Mein Bereich</h1><p className="app__sub">{data?.acting?'Sie handeln für '+data.acting.name+'.':'Anfragen, Geräte und Belege an einem Ort.'}</p></div>
   {data?.scopes?.length>0&&<label className="field" style={{minWidth:240}}><span className="sr-only">Ansicht für</span><select value={forOrg} onChange={e=>{setForOrg(e.target.value);setTab('tickets')}}><option value="">Meine eigenen Anliegen</option>{data.scopes.map(s=><option key={s.organizationId} value={s.organizationId}>Für {s.name}</option>)}</select></label>}
  </div>
  <NoticeBanner/>
  {error&&<p className="notice notice--error" role="alert" style={{marginBottom:16}}><AlertCircle size={18}/>{error}</p>}
  <div className="app__layout">
   <nav className="app-nav" aria-label="Bereiche">{tabs.map(([id,l,Icon,n])=><button key={id} aria-current={tab===id?'page':undefined} onClick={()=>setTab(id)}><Icon size={17}/>{l}{n?<span className="count">{n}</span>:null}</button>)}<hr/><Link href="/portal"><Plus size={17}/>Neues Anliegen</Link><Link href="/konto"><ShieldCheck size={17}/>Konto und Daten</Link></nav>
   <div className="app-main">
    {tab==='tickets'&&<Workshop key={forOrg||'self'} forOrg={forOrg} bookingSlug={data?.bookingSlug}/>}

    {tab==='devices'&&<section className="panel"><div className="panel__head"><div><h2>Geräte</h2><p>Was wir bei Ihnen eingerichtet haben. Passwörter stehen hier bewusst nicht.</p></div></div>
     {!data?.devices?.length?<div className="empty"><HardDrive size={24}/><h3>Noch keine Geräte erfasst.</h3><p>Wenn wir bei Ihnen etwas einrichten, tragen wir es hier ein. Auf dem Gerät klebt dann ein QR-Code: Einfach scannen, wenn es Probleme gibt.</p></div>
     :<div className="device-grid">{data.devices.map(d=><article className="device" key={d.id}><span className="badge badge--muted">{d.kindLabel}</span><h3>{d.label}</h3><dl className="kv">{[['Modell',[d.vendor,d.model].filter(Boolean).join(' ')],['Standort',d.location],['Eingerichtet',d.installedOn&&fmtDay(d.installedOn)],['Garantie bis',d.warrantyUntil&&fmtDay(d.warrantyUntil)],['Software-Stand',d.firmware]].filter(([,v])=>v).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>{d.notes&&<p className="hint">{d.notes}</p>}<Link className="mini-btn" href={'/portal?'+new URLSearchParams({geraetId:d.id,name:d.label+' ('+d.kindLabel+')',kategorie:d.category,...(forOrg?{fuer:forOrg}:{})}).toString()}>Problem mit diesem Gerät melden</Link></article>)}</div>}
    </section>}

    {tab==='monitors'&&<section className="panel"><div className="panel__head"><div><h2>Überwachung</h2><p>Wir prüfen diese Dienste automatisch und melden uns, wenn etwas ausfällt.</p></div></div>
     {!data?.monitors?.length?<div className="empty"><Activity size={24}/><h3>Noch keine Überwachung eingerichtet.</h3><p>Wir können Ihre Website, das SSL-Zertifikat oder die Internetverbindung im Betrieb rund um die Uhr im Blick behalten. Sprechen Sie uns an.</p></div>
     :<div className="rows">{data.monitors.map(m=><div className="row" key={m.id}><div><div className="row__title">{m.label}</div><div className="row__meta">{m.kind==='website'?m.url:'Internetverbindung (Lebenszeichen vom Router)'} · zuletzt geprüft {fmtTime(m.lastCheckedAt||m.lastOkAt)}{m.sslExpiresAt?' · Zertifikat bis '+new Date(m.sslExpiresAt).toLocaleDateString('de-DE'):''}</div>{m.lastError&&m.state!=='ok'&&<div className="row__note">{m.lastError}</div>}</div><span className={'badge badge--'+stateLabel[m.state][0]}>{stateLabel[m.state][1]}</span></div>)}</div>}
    </section>}

    {tab==='documents'&&<section className="panel"><div className="panel__head"><div><h2>Angebote und Rechnungen</h2><p>Angebote nehmen Sie direkt hier an.</p></div></div>
     {!data?.documents?.length?<div className="empty"><FileText size={24}/><h3>Noch keine Belege.</h3><p>Angebote und Rechnungen von FUNKNAHT erscheinen hier, sobald wir sie Ihnen schicken.</p></div>
     :<div className="rows">{data.documents.map(d=><Link className="row row--button" key={d.id} href={'/beleg/'+d.id+(forOrg?'?for='+encodeURIComponent(forOrg):'')} style={{textDecoration:'none',color:'inherit'}}><div><div className="row__title">{d.type==='angebot'?'Angebot':'Rechnung'} {d.number}</div><div className="row__meta">vom {fmtDay(d.issuedOn)}{d.dueOn?(d.type==='angebot'?' · gültig bis ':' · zahlbar bis ')+fmtDay(d.dueOn):''}</div></div><div style={{display:'grid',gap:6,justifyItems:'end'}}><b>{euro(d.gross)}</b><span className={'badge badge--'+(docTone[d.status]||'muted')}>{d.statusLabel}</span></div></Link>)}</div>}
    </section>}

    {tab==='family'&&!forOrg&&<section className="panel"><div className="panel__head"><div><h2>Familie und Vertrauenspersonen</h2><p>Eine Person Ihres Vertrauens darf dann für Sie Anfragen stellen und Antworten lesen. Sie können die Verbindung jederzeit lösen.</p></div></div>
     <form className="form" onSubmit={invite} style={{marginBottom:20}}><div className="actions" style={{alignItems:'flex-end'}}><label className="field" style={{flex:1,minWidth:200}}><span>Für wen ist die Einladung? <span className="field__opt">(z. B. „meine Tochter Anna“)</span></span><input value={label} onChange={e=>setLabel(e.target.value)} maxLength={80}/></label><button className="btn"><UserPlus size={17}/>Einladungslink erstellen</button></div></form>
     {inviteLink&&<div className="share" style={{marginBottom:20}}><span style={{flexBasis:'100%'}}>Schicken Sie diesen Link an die Person, zum Beispiel per WhatsApp oder E-Mail. Er ist 14 Tage gültig.</span><code>{inviteLink}</code><button className="mini-btn" onClick={async()=>{try{await navigator.clipboard.writeText(inviteLink);setCopied(true);setTimeout(()=>setCopied(false),1500)}catch{}}}>{copied?<Check size={14}/>:<Copy size={14}/>}{copied?'Kopiert':'Kopieren'}</button></div>}
     {data?.members?.length>0&&<><h3 className="h3" style={{fontSize:'1rem',margin:'8px 0'}}>Wer darf für mich handeln?</h3><div className="rows">{data.members.map(m=><div className="row" key={m.id}><div><div className="row__title">{m.accepted?m.name:(m.label||'Einladung')}</div><div className="row__meta">{m.accepted?m.email:'Einladung noch nicht angenommen'}{m.label&&m.accepted?' · '+m.label:''}</div></div><button className="mini-btn mini-btn--danger" onClick={()=>unlink(m.id)}><Trash2 size={14}/>{m.accepted?'Verbindung lösen':'Zurückziehen'}</button></div>)}</div></>}
     {data?.scopes?.length>0&&<><h3 className="h3" style={{fontSize:'1rem',margin:'18px 0 8px'}}>Für wen darf ich handeln?</h3><div className="rows">{data.scopes.map(s=><div className="row" key={s.linkId}><div className="row__title">{s.name}</div><button className="mini-btn mini-btn--danger" onClick={()=>unlink(s.linkId)}><Trash2 size={14}/>Verbindung lösen</button></div>)}</div></>}
    </section>}
   </div>
  </div>
 </div>;
}
