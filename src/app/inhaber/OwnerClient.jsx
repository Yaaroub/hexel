'use client';
import {Fragment,useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {LayoutDashboard,Inbox,Building2,ScrollText,ShieldCheck,Lock,Unlock,AlertCircle,Check,RefreshCw,Users,CreditCard,Sparkles,CalendarDays,Mail,Globe,Clock,BookOpen,AlertTriangle,PhoneIncoming,FileText,Activity,Megaphone,Settings,ThumbsUp,HardDrive} from 'lucide-react';
import OwnerTickets from './OwnerTickets';
import OwnerTime from './OwnerTime';
import Guides from './Guides';
import OwnerCallbacks from './OwnerCallbacks';
import OwnerCustomers from './OwnerCustomers';
import OwnerDocuments from './OwnerDocuments';
import OwnerMonitors from './OwnerMonitors';
import OwnerNotices from './OwnerNotices';
import OwnerSettings from './OwnerSettings';

// Gruppen machen die zwölf Bereiche überschaubar: erst das Tagesgeschäft, dann Kunden, dann Werkzeuge und Verwaltung.
const groupStart={overview:'Tagesgeschäft',customers:'Kunden und Abrechnung',notices:'Werkzeuge',settings:'Verwaltung'};
const tabs=[['overview','Überblick',LayoutDashboard],['tickets','Anfragen',Inbox],['callbacks','Rückrufe',PhoneIncoming],['customers','Kunden',Building2],['documents','Belege',FileText],['time','Zeiten',Clock],['monitors','Überwachung',Activity],['notices','Störungen',Megaphone],['guides','Leitfäden',BookOpen],['settings','Einstellungen',Settings],['audit','Protokoll',ScrollText],['privacy','Datenschutz',ShieldCheck]];
const ticketState={offen:['wait','Neu'],'in-pruefung':['info','In Bearbeitung'],geloest:['ok','Erledigt']};
const planName={free:'Kostenlos',basic:'Basis',betrieb:'Betrieb',individuell:'Individuell'};
const actionLabel=a=>({'owner.unlock':'Inhaberbereich geöffnet','owner.lock':'Inhaberbereich gesperrt','ticket.view':'Anfrage mit Kontaktdaten geöffnet','ticket.reply':'Antwort gesendet','ticket.note':'Interne Notiz','ticket.attachment':'Datei angehängt','attachment.view':'Interne Datei geöffnet','accounts.list':'Kontenliste aufgerufen','time.export':'Zeiten exportiert','customer.view':'Kundenakte geöffnet','labels.print':'QR-Aufkleber gedruckt','device.save':'Gerät gespeichert','device.delete':'Gerät gelöscht','monitor.save':'Überwachung angelegt','monitor.delete':'Überwachung entfernt','document.create':'Beleg angelegt','document.versendet':'Beleg fertiggestellt','document.bezahlt':'Rechnung bezahlt','document.storniert':'Beleg storniert','document.angenommen':'Angebot angenommen','document.abgelehnt':'Angebot abgelehnt','document.delete':'Entwurf gelöscht','settings.save':'Einstellungen gespeichert','notice.create':'Störungshinweis veröffentlicht','notice.end':'Störungshinweis beendet','callbacks.list':'Rückrufwünsche aufgerufen','ticket.phone':'Anruf erfasst'}[a]||(a.startsWith('ticket.status:')?'Stand geändert: '+(ticketState[a.split(':')[1]]?.[1]||a.split(':')[1]):a.startsWith('ticket.priority:')?'Dringlichkeit: '+a.split(':')[1]:a));
const fmt=v=>new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));
const day=v=>v?new Intl.DateTimeFormat('de-DE',{dateStyle:'medium'}).format(new Date(v)):'–';
const euro=v=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v);

async function api(path,options){const r=await fetch(path,{cache:'no-store',...options,headers:{'Content-Type':'application/json',...options?.headers}});const d=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(Error(d.error||'Die Anfrage ist fehlgeschlagen.'),{status:r.status,code:d.code});return d}

export default function OwnerClient(){
 const [state,setState]=useState('loading'),[until,setUntil]=useState(0),[now,setNow]=useState(Date.now()),[tab,setTab]=useState('overview'),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [data,setData]=useState(null),[tickets,setTickets]=useState([]),[audit,setAudit]=useState(null),[openId,setOpenId]=useState(null),[docStart,setDocStart]=useState(null),[customerOrg,setCustomerOrg]=useState(null);

 const handle=useCallback(e=>{if(e.code==='ELEVATION_REQUIRED'){setState('locked');return true}if(e.status===401){setState('login');return true}if(e.code==='OWNER_ONLY'){setState('denied');return true}setError(e.message);return false},[]);
 const loadOverview=useCallback(async()=>{try{const [o,t]=await Promise.all([api('/api/owner/overview'),api('/api/owner/tickets')]);setData(o);setUntil(o.until);setTickets(t.tickets);setState('open')}catch(e){handle(e)}},[handle]);
 useEffect(()=>{api('/api/owner/unlock').then(d=>{if(d.unlocked){setUntil(d.until);loadOverview()}else setState('locked')}).catch(handle)},[handle,loadOverview]);
 useEffect(()=>{if(state!=='open')return;const t=setInterval(()=>{setNow(Date.now())},1000);return()=>clearInterval(t)},[state]);
 useEffect(()=>{if(state==='open'&&until&&now>until){setState('locked');setData(null);setAudit(null)}},[now,until,state]);

 async function unlock(e){e.preventDefault();setBusy(true);setError('');try{const d=await api('/api/owner/unlock',{method:'POST',body:JSON.stringify({password:new FormData(e.currentTarget).get('password')})});setUntil(d.until);await loadOverview()}catch(err){if(!handle(err)||err.status===401)setError(err.message)}finally{setBusy(false)}}
 async function lock(){await api('/api/owner/unlock',{method:'DELETE'}).catch(()=>{});setState('locked');setData(null);setAudit(null)}
 async function show(next){setTab(next);setError('');if(next!=='customers')setCustomerOrg(null);try{if(next==='tickets')setTickets((await api('/api/owner/tickets')).tickets);if(next==='audit')setAudit((await api('/api/owner/audit')).entries)}catch(e){handle(e)}}

 if(state==='loading')return <div className="wrap app"><p className="muted" role="status">Einen Moment …</p></div>;
 if(state==='login')return <div className="wrap app"><div className="owner-lock"><span className="owner-lock__icon"><Lock size={24}/></span><h1 className="app__title">Inhaberbereich</h1><p className="prose">Bitte melde dich zuerst mit deinem Inhaberkonto an.</p><Link className="btn" href="/konto?next=/inhaber">Anmelden</Link></div></div>;
 if(state==='denied')return <div className="wrap app"><div className="owner-lock"><span className="owner-lock__icon"><Lock size={24}/></span><h1 className="app__title">Kein Zugang</h1><p className="prose">Dieser Bereich ist dem Inhaber von FUNKNAHT vorbehalten.</p><Link className="link" href="/">Zur Startseite</Link></div></div>;
 if(state==='locked')return <div className="wrap app"><form className="owner-lock" onSubmit={unlock}><span className="owner-lock__icon"><ShieldCheck size={24}/></span><h1 className="app__title">Inhaberbereich öffnen</h1><p className="prose">Hier siehst du Anfragen mit Kontaktdaten. Bestätige deshalb dein Passwort. Der Zugang schließt sich nach 30 Minuten automatisch, jeder Zugriff wird protokolliert.</p><label className="field">Passwort<input name="password" type="password" autoComplete="current-password" required autoFocus/></label>{error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}<button className="btn" disabled={busy}><Unlock size={17}/>{busy?'Wird geprüft …':'Entsperren'}</button></form></div>;

 const o=data?.overview,left=Math.max(0,until-now),mm=String(Math.floor(left/60000)).padStart(2,'0'),ss=String(Math.floor(left/1000)%60).padStart(2,'0');
 const newCount=tickets.filter(t=>t.status!=='geloest'&&t.awaiting==='owner').length;
 const openTicket=id=>{setOpenId(id);show('tickets')};
 const newDocument=body=>{setDocStart(body);setTab('documents')};
 const monitorAlerts=(o?.monitors?.['gestört']||0)+(o?.monitors?.warnung||0);

 return <div className="wrap app">
  <div className="app__head"><div><h1 className="app__title">Inhaberbereich</h1><p className="app__sub">Angemeldet als {data?.owner?.name} · <span className="timer">schließt in {mm}:{ss}</span></p></div><div className="actions"><button className="mini-btn" onClick={loadOverview}><RefreshCw size={15}/>Aktualisieren</button><button className="mini-btn" onClick={lock}><Lock size={15}/>Jetzt sperren</button></div></div>
  <div className="app__layout">
   <nav className="app-nav" aria-label="Bereiche">{tabs.map(([id,label,Icon])=><Fragment key={id}>{groupStart[id]&&<span className="app-nav__group">{groupStart[id]}</span>}<button aria-current={tab===id?'page':undefined} onClick={()=>show(id)}><Icon size={17}/>{label}{id==='tickets'&&newCount>0&&<span className="count">{newCount}</span>}{id==='callbacks'&&o?.callbacksOpen>0&&<span className="count">{o.callbacksOpen}</span>}{id==='monitors'&&monitorAlerts>0&&<span className="count">{monitorAlerts}</span>}</button></Fragment>)}</nav>
   <div className="app-main">
    {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}

    {tab==='overview'&&o&&<>
     <section className="panel today" aria-labelledby="today-h">
      <div className="panel__head" style={{marginBottom:8}}><div><h2 id="today-h">Heute zu tun</h2><p>{new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long'}).format(new Date())}</p></div></div>
      {(()=>{const todo=[
        o.tickets.urgent>0&&['tickets',AlertTriangle,'error',o.tickets.urgent===1?'1 dringende Anfrage':o.tickets.urgent+' dringende Anfragen','Zuerst beantworten'],
        monitorAlerts>0&&['monitors',Activity,'error',monitorAlerts===1?'1 Überwachung schlägt an':monitorAlerts+' Überwachungen schlagen an','Kunde ist womöglich offline'],
        o.tickets.awaitingOwner-(o.tickets.urgent||0)>0&&['tickets',Inbox,'info',(n=>n===1?'1 Anfrage wartet':n+' Anfragen warten')(o.tickets.awaitingOwner-(o.tickets.urgent||0)),'auf deine Antwort'],
        o.callbacksOpen>0&&['callbacks',PhoneIncoming,'info',o.callbacksOpen===1?'1 Rückrufwunsch':o.callbacksOpen+' Rückrufwünsche','Kunden warten auf deinen Anruf'],
        o.overdueInvoices>0&&['documents',FileText,'wait',o.overdueInvoices===1?'1 Rechnung überfällig':o.overdueInvoices+' Rechnungen überfällig','Zahlung nachhaken'],
        o.openOffers>0&&['documents',FileText,'muted',o.openOffers===1?'1 Angebot offen':o.openOffers+' Angebote offen','Noch keine Antwort vom Kunden'],
        o.warrantySoon>0&&['customers',HardDrive,'muted',o.warrantySoon===1?'1 Garantie läuft bald ab':o.warrantySoon+' Garantien laufen bald ab','Kunden rechtzeitig informieren'],
       ].filter(Boolean);
       return todo.length?<ul className="todo">{todo.map(([go,Icon,tone,title,note],i)=><li key={i} style={{'--n':i}}><button onClick={()=>show(go)}><span className={'todo__icon todo__icon--'+tone}><Icon size={17}/></span><span><strong>{title}</strong><small>{note}</small></span></button></li>)}</ul>:<p className="todo__empty"><Check size={18}/>Alles erledigt. Nichts wartet auf dich.</p>})()}
     </section>
     <div className="stats">
      <div className="stat"><span className="stat__label"><Users size={15}/>Konten</span><span className="stat__value">{o.accounts.total}</span><span className="stat__note">{o.accounts.business} Betriebe · {o.accounts.private} privat</span></div>
      <div className="stat"><span className="stat__label"><CreditCard size={15}/>Monatlicher Umsatz</span><span className="stat__value">{euro(o.monthlyRevenue)}</span><span className="stat__note">{o.paying} zahlende Betriebe</span></div>
      <button className="stat" style={{textAlign:'left',cursor:'pointer',font:'inherit',color:'inherit'}} onClick={()=>show('tickets')}><span className="stat__label"><Inbox size={15}/>Warten auf dich</span><span className="stat__value">{o.tickets.awaitingOwner}</span><span className="stat__note">{o.tickets.urgent?<span className="prio prio--dringend"><AlertTriangle size={12}/>{o.tickets.urgent} dringend</span>:(o.tickets.open+o.tickets.inProgress)+' offen insgesamt'}</span></button>
      <div className="stat"><span className="stat__label"><CalendarDays size={15}/>Buchungen, 30 Tage</span><span className="stat__value">{o.bookingsLast30Days}</span><span className="stat__note">über alle Betriebe</span></div>
     </div>
     <details className="more-stats"><summary>Weitere Zahlen und eingerichtete Dienste</summary>
     <div className="stats">
      <button className="stat stat--btn" onClick={()=>show('callbacks')}><span className="stat__label"><PhoneIncoming size={15}/>Rückrufwünsche</span><span className="stat__value">{o.callbacksOpen}</span><span className="stat__note">noch nicht erledigt</span></button>
      <button className="stat stat--btn" onClick={()=>show('monitors')}><span className="stat__label"><Activity size={15}/>Überwachung</span><span className="stat__value">{monitorAlerts}</span><span className="stat__note">{monitorAlerts?'Auffälligkeiten':(n=>n===0?'noch nichts eingerichtet':n===1?'1 Prüfung, alles ruhig':n+' Prüfungen, alles ruhig')(Object.values(o.monitors||{}).reduce((a,b)=>a+b,0))}</span></button>
      <button className="stat stat--btn" onClick={()=>show('documents')}><span className="stat__label"><FileText size={15}/>Offene Belege</span><span className="stat__value">{o.unpaidInvoices+o.openOffers}</span><span className="stat__note">{o.unpaidInvoices===1?'1 Rechnung':o.unpaidInvoices+' Rechnungen'} unbezahlt · {o.openOffers===1?'1 Angebot':o.openOffers+' Angebote'} offen</span></button>
      <div className="stat"><span className="stat__label"><ThumbsUp size={15}/>Zufriedenheit</span><span className="stat__value">{o.ratings.total?Math.round(o.ratings.helpful/o.ratings.total*100)+' %':'–'}</span><span className="stat__note">{o.ratings.total?o.ratings.total+' Bewertungen':'noch keine Bewertungen'}{o.warrantySoon?' · '+o.warrantySoon+' Garantien laufen ab':''}</span></div>
     </div>
     <div className="split" style={{gridTemplateColumns:'1fr 1fr'}}>
      <section className="panel"><div className="panel__head"><div><h2>Tarife</h2><p>Nur bestätigte Abonnements, ohne lokale Tests.</p></div></div><div className="bar-list">{Object.entries(o.plans).map(([id,n])=><div className="bar-item" key={id}><span>{planName[id]}</span><span className="track"><span style={{width:(o.accounts.total?n/o.accounts.total*100:0)+'%'}}/></span><b>{n}</b></div>)}</div></section>
      <section className="panel"><div className="panel__head"><div><h2>Aktivität</h2></div></div><div className="service-state">
       <div><span>Neue Konten, 30 Tage</span><b>{o.accounts.newLast30Days}</b></div>
       <div><span>Aktive Konten, 30 Tage</span><b>{o.accounts.activeLast30Days}</b></div>
       <div><span>KI-Fragen im {o.ai.period.split('-').reverse().join('.')}</span><b>{o.ai.requests}</b></div>
       <div><span>Erledigte Anfragen</span><b>{o.tickets.resolved}</b></div>
       <div><span>Arbeitszeit diesen Monat</span><b>{(o.minutesThisMonth/60).toLocaleString('de-DE',{maximumFractionDigits:1})} h</b></div>
      </div></section>
     </div>
     <section className="panel"><div className="panel__head"><div><h2>Dienste</h2><p>Was für den Betrieb eingerichtet ist.</p></div></div><div className="service-state">
      <div><span><Mail size={15} style={{verticalAlign:'-2px'}}/> E-Mail-Versand</span>{data.services.mail?<span className="badge badge--ok">Eingerichtet</span>:<span className="badge badge--wait">Fehlt</span>}</div>
      <div><span><CreditCard size={15} style={{verticalAlign:'-2px'}}/> Zahlungen (Stripe)</span>{data.services.billing==='live'?<span className="badge badge--ok">Live</span>:data.services.billing==='test'?<span className="badge badge--info">Testbetrieb</span>:<span className="badge badge--wait">Nicht eingerichtet</span>}</div>
      <div><span><Sparkles size={15} style={{verticalAlign:'-2px'}}/> KI-Assistent</span>{data.services.ai?<span className="badge badge--ok">{data.services.ai}</span>:<span className="badge badge--wait">Schlüssel fehlt</span>}</div>
      <div><span><Globe size={15} style={{verticalAlign:'-2px'}}/> Öffentliche Domain</span>{data.services.publicSite?<span className="badge badge--ok">Gesetzt</span>:<span className="badge badge--muted">Nur Vorschau</span>}</div>
      <div><span><Clock size={15} style={{verticalAlign:'-2px'}}/> Zeitplan (Erinnerungen, Überwachung)</span>{data.services.cron?<span className="badge badge--ok">Eingerichtet</span>:<span className="badge badge--wait">CRON_SECRET fehlt</span>}</div>
      <div><span><CalendarDays size={15} style={{verticalAlign:'-2px'}}/> Eigene Buchungsseite</span>{data.services.bookingSlug?<a className="link" href={'/buchen/'+data.services.bookingSlug} target="_blank" rel="noreferrer">/buchen/{data.services.bookingSlug}</a>:<span className="badge badge--muted">FUNKNAHT_BOOKING_SLUG fehlt</span>}</div>
     </div></section>
     </details>
    </>}

    {tab==='tickets'&&<OwnerTickets tickets={tickets} setTickets={setTickets} api={api} handle={handle} mailReady={!!data?.services?.mail} initialId={openId} bookingSlug={data?.services?.bookingSlug} onDocument={newDocument}/>}
    {tab==='callbacks'&&<OwnerCallbacks api={api} handle={handle} onTicket={openTicket}/>}
    {tab==='customers'&&<OwnerCustomers key={customerOrg||'list'} api={api} handle={handle} initialOrg={customerOrg} onTicket={openTicket} onNewDocument={(org,type)=>newDocument({type,organizationId:org})}/>}
    {tab==='documents'&&<OwnerDocuments api={api} handle={handle} start={docStart} onStarted={()=>setDocStart(null)}/>}
    {tab==='monitors'&&<OwnerMonitors api={api} handle={handle} onCustomer={org=>{setCustomerOrg(org);setTab('customers')}}/>}
    {tab==='notices'&&<OwnerNotices api={api} handle={handle}/>}
    {tab==='settings'&&<OwnerSettings api={api} handle={handle}/>}
    {tab==='time'&&<OwnerTime api={api} handle={handle} onOpen={openTicket}/>}
    {tab==='guides'&&<Guides/>}

    {tab==='audit'&&<section className="panel"><div className="panel__head"><div><h2>Protokoll</h2><p>Jeder Zugriff auf personenbezogene Daten im Inhaberbereich. Einträge lassen sich nicht bearbeiten und werden nach 365 Tagen gelöscht.</p></div></div>
     {!audit?<p className="muted">Wird geladen …</p>:<div className="table-wrap"><table className="table"><thead><tr><th>Zeitpunkt</th><th>Wer</th><th>Was</th><th>Betrifft</th></tr></thead><tbody>{audit.map((e,i)=><tr key={i}><td style={{whiteSpace:'nowrap'}}>{fmt(e.createdAt)}</td><td>{e.actor}</td><td>{actionLabel(e.action)}</td><td>{e.target||'–'}</td></tr>)}</tbody></table></div>}
    </section>}

    {tab==='privacy'&&data&&<>
     <section className="panel"><div className="panel__head"><div><h2>So schützt dieser Bereich Daten</h2></div></div><div className="rows">
      {[['Datensparsamkeit','Von Betrieben siehst du nur Anzahlen. Kundenlisten, Termine und Aufträge bleiben Sache des Betriebs (Auftragsverarbeitung).'],['Zweckbindung','Kontaktdaten aus Anfragen erscheinen erst beim Öffnen einer Anfrage, die du bearbeitest.'],['Nachvollziehbarkeit','Öffnen, Statusänderungen, Antworten, interne Dateien und Exporte werden mit Zeitpunkt protokolliert.'],['Zugriffsschutz','Zugang nur für Adressen in OWNER_EMAILS, zusätzlich Passwortbestätigung. Nach 30 Minuten wird gesperrt.'],['Speicherbegrenzung',`Erledigte Anfragen werden nach ${data.retention.resolvedTicketsDays} Tagen anonymisiert, das Protokoll nach ${data.retention.auditDays} Tagen gelöscht.`],['Betroffenenrechte','Nutzer laden ihre Daten unter „Konto“ selbst herunter und können ihr Konto vollständig löschen.']].map(([t,d])=><div className="row" key={t}><div><div className="row__title">{t}</div><div className="row__note">{d}</div></div><Check size={18} color="var(--ok)"/></div>)}
     </div></section>
     <section className="panel"><div className="panel__head"><div><h2>Letzter Bereinigungslauf</h2><p>Läuft automatisch, wenn du diesen Bereich öffnest.</p></div></div><div className="service-state">
      <div><span>Anonymisierte Anfragen</span><b>{data.retention.lastRun.anonymizedTickets}</b></div>
      <div><span>Gelöschte Protokolleinträge</span><b>{data.retention.lastRun.removedAuditEntries}</b></div>
      <div><span>Entfernte abgelaufene Sitzungen</span><b>{data.retention.lastRun.removedSessions}</b></div>
     </div></section>
    </>}
   </div>
  </div>
 </div>;
}
