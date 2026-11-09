'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {Printer,Check,X,AlertCircle,ArrowLeft} from 'lucide-react';
const euro=c=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format((c||0)/100);
const day=v=>v?new Date(v+'T12:00:00').toLocaleDateString('de-DE'):'–';
const qty=v=>Number(v).toLocaleString('de-DE',{maximumFractionDigits:2});
// Druckfertiger Beleg (A4). Kunden sehen versendete Belege, der Inhaber auch Entwürfe.
export default function DocumentView({id}){
 const [doc,setDoc]=useState(null),[owner,setOwner]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false),[forOrg,setForOrg]=useState('');
 useEffect(()=>{const f=new URLSearchParams(location.search).get('for')||'';setForOrg(f);fetch('/api/documents/'+id+(f?'?for='+encodeURIComponent(f):''),{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setDoc(d.document);setOwner(!!d.owner)}).catch(e=>setError(e.message||'Beleg nicht gefunden.'))},[id]);
 async function respond(accept){if(!confirm(accept?'Angebot verbindlich annehmen?':'Angebot ablehnen?'))return;setBusy(true);setError('');try{const r=await fetch('/api/documents/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accept,for:forOrg||undefined})});const d=await r.json();if(!r.ok)throw Error(d.error);setDoc(d.document)}catch(e){setError(e.message)}finally{setBusy(false)}}
 if(error&&!doc)return <div className="wrap app"><div className="empty"><AlertCircle size={26}/><h3>{error}</h3><Link className="link" href="/portal/werkstatt?tab=documents">Zu meinen Belegen</Link></div></div>;
 if(!doc)return <div className="wrap app"><p className="muted">Wird geladen …</p></div>;
 const c=doc.company,t=doc.totals,s=doc.settings,offer=doc.type==='angebot';
 const missing=!c.owner||!c.street||!c.city;
 return <div className="wrap app doc-wrap">
  <div className="doc-tools">
   <Link className="link" href={owner?'/inhaber':'/portal/werkstatt?tab=documents'}><ArrowLeft size={16}/>{owner?'Zum Inhaberbereich':'Zu meinen Belegen'}</Link>
   <div className="actions">{!owner&&offer&&doc.status==='versendet'&&<><button className="btn btn--small" disabled={busy} onClick={()=>respond(true)}><Check size={16}/>Angebot annehmen</button><button className="mini-btn" disabled={busy} onClick={()=>respond(false)}><X size={15}/>Ablehnen</button></>}<button className="mini-btn" onClick={()=>print()}><Printer size={15}/>Drucken oder als PDF speichern</button></div>
  </div>
  {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
  {owner&&missing&&<p className="notice notice--warn"><AlertCircle size={18}/>Für eine gültige Rechnung fehlen Angaben zum Unternehmen (COMPANY_OWNER, COMPANY_STREET, COMPANY_CITY in .env.local).</p>}
  {doc.status==='entwurf'&&<p className="notice notice--warn doc-draft"><AlertCircle size={18}/>Entwurf, noch nicht versendet.</p>}
  <article className="doc">
   <header className="doc__head">
    <div><div className="doc__brand"><img src="/funknaht-mark.png" alt="" width="34" height="34"/>FUNKNAHT</div><p className="doc__sender">{[c.owner,c.street,c.city].filter(Boolean).join(' · ')}</p></div>
    <div className="doc__meta"><h1>{offer?'Angebot':'Rechnung'}</h1><dl><dt>Nummer</dt><dd>{doc.number}</dd><dt>Datum</dt><dd>{day(doc.issuedOn)}</dd>{doc.dueOn&&<><dt>{offer?'Gültig bis':'Zahlbar bis'}</dt><dd>{day(doc.dueOn)}</dd></>}{doc.ticketId&&<><dt>Zu Anfrage</dt><dd>{doc.ticketId}</dd></>}</dl></div>
   </header>
   <address className="doc__to">{doc.recipient.name}{doc.recipient.street&&<><br/>{doc.recipient.street}</>}{doc.recipient.city&&<><br/>{doc.recipient.city}</>}</address>
   {doc.intro&&<p className="doc__intro">{doc.intro}</p>}
   <table className="doc__table"><thead><tr><th>Leistung</th><th className="num">Menge</th><th className="num">Einzelpreis</th><th className="num">Betrag</th></tr></thead>
    <tbody>{doc.items.map((i,n)=><tr key={n}><td>{i.text}</td><td className="num">{qty(i.qty)} {i.unit}</td><td className="num">{euro(i.priceCents)}</td><td className="num">{euro(Math.round(i.qty*i.priceCents))}</td></tr>)}</tbody>
    <tfoot>{s.smallBusiness?<tr className="doc__sum"><td colSpan={3}>Gesamtbetrag</td><td className="num">{euro(t.gross)}</td></tr>:<><tr><td colSpan={3}>Nettobetrag</td><td className="num">{euro(t.net)}</td></tr><tr><td colSpan={3}>Umsatzsteuer {t.vatRate} %</td><td className="num">{euro(t.vat)}</td></tr><tr className="doc__sum"><td colSpan={3}>Gesamtbetrag</td><td className="num">{euro(t.gross)}</td></tr></>}</tfoot>
   </table>
   {s.smallBusiness&&<p className="doc__note">Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.</p>}
   {t.laborGross>0&&<p className="doc__note">Darin enthaltene Arbeits- und Fahrtkosten: {euro(t.laborGross)}. Bei Leistungen in Ihrem Haushalt können diese nach § 35a EStG steuerlich begünstigt sein, wenn Sie per Überweisung zahlen.</p>}
   {doc.notes&&<p className="doc__intro">{doc.notes}</p>}
   {!offer&&<p className="doc__note">Bitte überweisen Sie den Betrag bis {day(doc.dueOn)}{s.iban?<> auf das Konto <strong>{s.iban}</strong>{s.bank?' ('+s.bank+')':''}</>:''} unter Angabe der Rechnungsnummer {doc.number}.</p>}
   {offer&&doc.status==='angenommen'&&<p className="notice notice--ok"><Check size={18}/>Angebot angenommen. Vielen Dank, wir melden uns zur Terminabsprache.</p>}
   <footer className="doc__foot"><p>{s.invoiceFooter}</p><p>{[c.brand,c.owner,c.street,c.city,c.email,c.phone,c.vatId&&'USt-IdNr. '+c.vatId].filter(Boolean).join(' · ')}</p></footer>
  </article>
 </div>;
}
