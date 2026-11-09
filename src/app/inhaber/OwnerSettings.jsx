'use client';
import {useEffect,useState} from 'react';
import {Check,AlertCircle} from 'lucide-react';
const toCents=v=>Math.round(Number(String(v).replace(',','.'))*100);
const fromCents=c=>((c||0)/100).toFixed(2).replace('.',',');
export default function OwnerSettings({api,handle}){
 const [data,setData]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false),[small,setSmall]=useState(false);
 useEffect(()=>{api('/api/owner/settings').then(d=>{setData(d);setSmall(d.settings.smallBusiness)}).catch(handle)},[api,handle]);
 async function save(e){e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));setBusy(true);setError('');setSaved(false);
  try{const d=await api('/api/owner/settings',{method:'POST',body:JSON.stringify({hourlyRateCents:toCents(f.hourly),travelFlatCents:toCents(f.travel),smallBusiness:small,vatRate:Number(f.vatRate||19),paymentDays:Number(f.paymentDays),offerValidDays:Number(f.offerValidDays),iban:f.iban,bank:f.bank,invoiceFooter:f.invoiceFooter})});setData(d);setSaved(true)}catch(err){if(!handle(err))setError(err.message)}finally{setBusy(false)}}
 if(!data)return <section className="panel"><p className="muted">Wird geladen …</p></section>;
 const s=data.settings,c=data.company;
 return <section className="panel">
  <div className="panel__head"><div><h2>Einstellungen für Belege</h2><p>Gilt für neue Angebote und Rechnungen. Fertiggestellte Belege behalten ihre damaligen Werte.</p></div></div>
  <form className="form" onSubmit={save}><fieldset disabled={busy}>
   <div className="form-grid"><label className="field">Stundensatz netto (€)<input name="hourly" inputMode="decimal" defaultValue={fromCents(s.hourlyRateCents)} required/></label><label className="field">Anfahrtspauschale netto (€)<input name="travel" inputMode="decimal" defaultValue={fromCents(s.travelFlatCents)} required/></label></div>
   <label className="check"><input type="checkbox" checked={small} onChange={e=>setSmall(e.target.checked)}/><span>Kleinunternehmer nach § 19 UStG (keine Umsatzsteuer auf Belegen)</span></label>
   {!small&&<label className="field">Umsatzsteuer<select name="vatRate" defaultValue={String(s.vatRate)}><option value="19">19 %</option><option value="7">7 %</option></select></label>}
   <div className="form-grid"><label className="field">Zahlungsziel (Tage)<input name="paymentDays" type="number" min="0" max="120" defaultValue={s.paymentDays}/></label><label className="field">Angebote gültig (Tage)<input name="offerValidDays" type="number" min="0" max="365" defaultValue={s.offerValidDays}/></label></div>
   <div className="form-grid"><label className="field">IBAN<input name="iban" maxLength={40} defaultValue={s.iban} placeholder="DE00 0000 0000 0000 0000 00"/></label><label className="field">Bank<input name="bank" maxLength={80} defaultValue={s.bank}/></label></div>
   <label className="field">Text unter jeder Rechnung<textarea name="invoiceFooter" rows={2} maxLength={500} defaultValue={s.invoiceFooter}/></label>
   {error&&<p className="notice notice--error" role="alert"><AlertCircle size={18}/>{error}</p>}
   <div className="actions"><button className="btn btn--small">Speichern</button>{saved&&<span className="hint"><Check size={14} style={{verticalAlign:'-2px'}}/> Gespeichert</span>}</div>
  </fieldset></form>
  <div className="panel panel--quiet" style={{marginTop:20}}><h3 className="h3" style={{fontSize:'1rem',marginBottom:8}}>Angaben zum Unternehmen</h3>
   <p className="hint" style={{marginBottom:10}}>Diese Angaben stehen auf jedem Beleg und im Impressum. Sie werden auf dem Server in der Konfiguration gesetzt (COMPANY_OWNER, COMPANY_STREET, COMPANY_CITY, COMPANY_EMAIL, COMPANY_PHONE und COMPANY_VAT_ID für Steuernummer oder USt-IdNr.).</p>
   <dl className="kv">{[['Inhaber',c.owner],['Anschrift',[c.street,c.city].filter(Boolean).join(', ')],['E-Mail',c.email],['Telefon',c.phone],['Steuernummer / USt-IdNr.',c.vatId]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v||<span style={{color:'var(--err)'}}>fehlt</span>}</dd></div>)}</dl>
  </div>
 </section>;
}
