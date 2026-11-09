import {randomUUID} from 'node:crypto';
import {getDb,transaction} from './business-db.js';
import {appError,cleanString} from './business-auth.js';
import {getOwnerSettings} from './settings.js';
import {company} from './company.js';

// Angebote und Rechnungen. Beträge immer in Cent. Ein Beleg ist nur als Entwurf änderbar;
// danach bleibt er unverändert (Storno statt Bearbeiten), wie es für Rechnungen üblich ist.
export const ITEM_KINDS={arbeit:'Arbeitszeit',anfahrt:'Anfahrt',material:'Material',pauschale:'Pauschale'};
export const STATUS={entwurf:'Entwurf',versendet:'Versendet',angenommen:'Angenommen',abgelehnt:'Abgelehnt',bezahlt:'Bezahlt',storniert:'Storniert'};
const TYPE_PREFIX={angebot:'A',rechnung:'R'};

const day=(offset=0)=>new Date(Date.now()+offset*86400000).toISOString().slice(0,10);
const parse=(v,f)=>{try{return JSON.parse(v)}catch{return f}};

function cleanItems(items){
 if(!Array.isArray(items)||items.length>60)throw appError('Bitte prüfen Sie die Positionen.');
 return items.map(i=>{
  const kind=ITEM_KINDS[i.kind]?i.kind:'pauschale';
  const text=cleanString(i.text,{required:true,max:300,label:'Positionstext'});
  const qty=Number(i.qty),price=Number(i.priceCents);
  if(!Number.isFinite(qty)||qty<=0||qty>10000||Math.round(qty*100)!==qty*100)throw appError('Die Menge in „'+text+'“ ist ungültig.');
  if(!Number.isInteger(price)||Math.abs(price)>10000000)throw appError('Der Preis in „'+text+'“ ist ungültig.');
  return {kind,text,qty,unit:cleanString(i.unit,{max:20})||(kind==='arbeit'?'Std.':'Stk.'),priceCents:price};
 });
}

// Netto, Steuer, Brutto und der Anteil für § 35a EStG (Arbeit und Anfahrt, brutto).
export function totals(items,settings){
 const net=items.reduce((s,i)=>s+Math.round(i.qty*i.priceCents),0);
 const rate=settings.smallBusiness?0:settings.vatRate;
 const vat=Math.round(net*rate/100);
 const laborNet=items.filter(i=>i.kind==='arbeit'||i.kind==='anfahrt').reduce((s,i)=>s+Math.round(i.qty*i.priceCents),0);
 return {net,vatRate:rate,vat,gross:net+vat,laborGross:laborNet+Math.round(laborNet*rate/100)};
}

function recipientFor(orgId,input={}){
 const db=getDb();let base={name:'',street:'',city:'',email:''};
 if(orgId){const org=db.prepare('SELECT o.name,o.account_type,u.name AS person,u.email FROM organizations o LEFT JOIN users u ON u.organization_id=o.id WHERE o.id=? ORDER BY u.created_at LIMIT 1').get(orgId);if(!org)throw appError('Konto nicht gefunden.',404);base={name:org.account_type==='business'?org.name:org.person,street:'',city:'',email:org.email||''}}
 const r={};for(const k of ['name','street','city','email'])r[k]=cleanString(input[k]??base[k],{max:k==='email'?254:150,label:'Empfänger'});
 if(!r.name)throw appError('Bitte geben Sie einen Empfänger an.');
 return r;
}

function view(row,{forCustomer=false}={}){
 const settings={...getOwnerSettings(),...parse(row.settings,{})};
 const items=parse(row.items,[]);
 return {id:row.id,number:row.status==='entwurf'?'(Entwurf)':row.number,type:row.type,status:row.status,statusLabel:STATUS[row.status],organizationId:forCustomer?undefined:row.organization_id,ticketId:row.ticket_id,recipient:parse(row.recipient,{}),items,intro:row.intro,notes:row.notes,issuedOn:row.issued_on,dueOn:row.due_on,respondedAt:row.responded_at,createdAt:row.created_at,totals:totals(items,settings),settings:{smallBusiness:settings.smallBusiness,vatRate:settings.vatRate,iban:settings.iban,bank:settings.bank,invoiceFooter:settings.invoiceFooter,paymentDays:settings.paymentDays},company};
}

function nextNumber(db,type){
 const prefix=TYPE_PREFIX[type]+'-'+new Date().getFullYear()+'-';
 const last=db.prepare('SELECT number FROM documents WHERE number LIKE ? ORDER BY number DESC LIMIT 1').get(prefix+'%');
 return prefix+String((last?Number(last.number.slice(prefix.length)):0)+1).padStart(4,'0');
}

export function createDocument({type,organizationId=null,ticketId=null,recipient,items=[],intro='',notes='',fromTime=false}){
 if(!TYPE_PREFIX[type])throw appError('Ungültige Belegart.');
 const settings=getOwnerSettings();
 let lines=cleanItems(items);
 return transaction(db=>{
  let orgId=organizationId,ticket=null;
  if(ticketId){ticket=db.prepare('SELECT * FROM support_tickets WHERE id=?').get(String(ticketId));if(!ticket)throw appError('Anfrage nicht gefunden.',404);orgId=orgId||ticket.organization_id}
  // Abrechenbare, noch nicht berechnete Zeiten aus der Anfrage übernehmen.
  let timeIds=[];
  if(fromTime&&ticket){
   const rows=db.prepare('SELECT * FROM ticket_time WHERE ticket_id=? AND billable=1 AND document_id IS NULL ORDER BY work_date').all(ticket.id);
   const minutes=rows.reduce((s,r)=>s+r.minutes,0);
   if(minutes){lines=[{kind:'arbeit',text:'Arbeitszeit zu Anfrage '+ticket.id+(rows.length>1?' ('+rows.length+' Einsätze)':''),qty:Math.round(minutes/60*100)/100,unit:'Std.',priceCents:settings.hourlyRateCents},...lines];timeIds=rows.map(r=>r.id)}
  }
  let rec=recipientFor(orgId,recipient||{});
  if(ticket&&!recipient&&ticket.source==='telefon'){const p=parse(ticket.payload,{});rec={name:p.name||rec.name,street:'',city:p.location||'',email:p.email||''}}
  const id=randomUUID(),now=Date.now();
  db.prepare('INSERT INTO documents(id,number,type,organization_id,ticket_id,recipient,items,intro,notes,settings,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(id,'E-'+id,type,ticket?.source==='telefon'?null:orgId,ticket?.id||null,JSON.stringify(rec),JSON.stringify(lines),cleanString(intro,{max:1000}),cleanString(notes,{max:1000}),'{}',now,now);
  for(const t of timeIds)db.prepare('UPDATE ticket_time SET document_id=? WHERE id=?').run(id,t);
  return id;
 });
}

export function updateDraft(id,input){
 const db=getDb(),row=db.prepare('SELECT * FROM documents WHERE id=?').get(String(id));
 if(!row)throw appError('Beleg nicht gefunden.',404);
 if(row.status!=='entwurf')throw appError('Versendete Belege können nicht mehr geändert werden. Erstellen Sie bei Bedarf einen neuen Beleg.',409,'LOCKED');
 const items=input.items?cleanItems(input.items):parse(row.items,[]);
 const recipient=input.recipient?recipientFor(null,input.recipient):parse(row.recipient,{});
 db.prepare('UPDATE documents SET items=?,recipient=?,intro=?,notes=?,updated_at=? WHERE id=?').run(JSON.stringify(items),JSON.stringify(recipient),input.intro!==undefined?cleanString(input.intro,{max:1000}):row.intro,input.notes!==undefined?cleanString(input.notes,{max:1000}):row.notes,Date.now(),row.id);
}

const transitions={entwurf:['versendet'],versendet:['angenommen','abgelehnt','bezahlt','storniert'],angenommen:['storniert','bezahlt'],abgelehnt:[],bezahlt:['storniert'],storniert:[]};
export function setDocumentStatus(id,status){
 const db=getDb(),row=db.prepare('SELECT * FROM documents WHERE id=?').get(String(id));
 if(!row)throw appError('Beleg nicht gefunden.',404);
 if(!transitions[row.status]?.includes(status))throw appError('Dieser Schritt ist nicht möglich.',409);
 if(status==='versendet'){
  if(!parse(row.items,[]).length)throw appError('Der Beleg hat noch keine Positionen.');
  const s=getOwnerSettings();
  // Beim Versenden werden Einstellungen und Datum eingefroren.
  // Die fortlaufende Nummer wird erst jetzt vergeben, damit gelöschte Entwürfe keine Lücken erzeugen.
  db.prepare('UPDATE documents SET status=?,number=?,issued_on=?,due_on=?,settings=?,updated_at=? WHERE id=?').run(status,nextNumber(db,row.type),day(),day(row.type==='rechnung'?s.paymentDays:s.offerValidDays),JSON.stringify(s),Date.now(),row.id);
 }else{
  db.prepare('UPDATE documents SET status=?,responded_at=?,updated_at=? WHERE id=?').run(status,['angenommen','abgelehnt'].includes(status)?Date.now():row.responded_at,Date.now(),row.id);
  if(status==='storniert')db.prepare('UPDATE ticket_time SET document_id=NULL WHERE document_id=?').run(row.id);
 }
}
export function deleteDraft(id){
 const db=getDb(),row=db.prepare('SELECT status FROM documents WHERE id=?').get(String(id));
 if(!row)throw appError('Beleg nicht gefunden.',404);
 if(row.status!=='entwurf')throw appError('Nur Entwürfe können gelöscht werden.',409);
 transaction(tx=>{tx.prepare('UPDATE ticket_time SET document_id=NULL WHERE document_id=?').run(String(id));tx.prepare('DELETE FROM documents WHERE id=?').run(String(id))});
}

export function listDocuments({organizationId,forCustomer=false}={}){
 const db=getDb();
 const rows=organizationId?db.prepare(`SELECT * FROM documents WHERE organization_id=?${forCustomer?" AND status<>'entwurf'":''} ORDER BY created_at DESC`).all(organizationId):db.prepare('SELECT * FROM documents ORDER BY created_at DESC LIMIT 500').all();
 return rows.map(r=>view(r,{forCustomer}));
}
export function getDocument(id,{organizationId,forCustomer=false}={}){
 const row=getDb().prepare('SELECT * FROM documents WHERE id=?').get(String(id));
 if(!row||(forCustomer&&(row.organization_id!==organizationId||row.status==='entwurf')))throw appError('Beleg nicht gefunden.',404,'NOT_FOUND');
 return view(row,{forCustomer});
}
// Kunden nehmen Angebote selbst an oder lehnen ab.
export function respondToOffer(orgId,id,accept){
 const doc=getDocument(id,{organizationId:orgId,forCustomer:true});
 if(doc.type!=='angebot'||doc.status!=='versendet')throw appError('Dieses Angebot kann nicht mehr beantwortet werden.',409);
 if(doc.dueOn&&doc.dueOn<day())throw appError('Dieses Angebot ist abgelaufen. Bitte fragen Sie ein neues an.',409,'EXPIRED');
 setDocumentStatus(id,accept?'angenommen':'abgelehnt');
 return getDocument(id,{organizationId:orgId,forCustomer:true});
}
