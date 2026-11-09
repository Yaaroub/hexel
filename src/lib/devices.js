import {randomBytes,randomUUID} from 'node:crypto';
import {getDb} from './business-db.js';
import {appError,cleanString} from './business-auth.js';

// Geräteakte: was FUNKNAHT beim Kunden eingerichtet hat. Bewusst ohne Passwörter.
export const DEVICE_KINDS={router:'Router',zugangspunkt:'WLAN-Zugangspunkt',switch:'Switch',drucker:'Drucker',computer:'Computer',smartphone:'Smartphone/Tablet',nas:'Netzwerkspeicher',kamera:'Kamera',telefon:'Telefon/Anlage',sonstiges:'Sonstiges'};
const kindCategory={router:'internet-wlan',zugangspunkt:'internet-wlan',switch:'internet-wlan',drucker:'drucker',computer:'computer-software',smartphone:'computer-software',nas:'computer-software',kamera:'internet-wlan',telefon:'internet-wlan',sonstiges:'computer-software'};
const date=v=>{if(v===undefined||v===null||v==='')return null;if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))throw appError('Bitte prüfen Sie das Datum.');return v};
const SECRET=/(passwort|password|kennwort|pin\b|psk|wpa-?key|schlüssel:)/i;

export function deviceView(r,{withToken=true}={}){return {id:r.id,kind:r.kind,kindLabel:DEVICE_KINDS[r.kind]||r.kind,label:r.label,vendor:r.vendor,model:r.model,location:r.location,serial:r.serial,firmware:r.firmware,installedOn:r.installed_on,warrantyUntil:r.warranty_until,notes:r.notes,category:kindCategory[r.kind]||'computer-software',...(withToken?{qrToken:r.qr_token}:{}),updatedAt:r.updated_at}}

function clean(input){
 if(!DEVICE_KINDS[input.kind])throw appError('Bitte wählen Sie eine Geräteart.');
 const v={kind:input.kind,label:cleanString(input.label,{required:true,max:80,label:'Bezeichnung'}),vendor:cleanString(input.vendor,{max:60}),model:cleanString(input.model,{max:80}),location:cleanString(input.location,{max:80}),serial:cleanString(input.serial,{max:80}),firmware:cleanString(input.firmware,{max:60}),installedOn:date(input.installedOn),warrantyUntil:date(input.warrantyUntil),notes:cleanString(input.notes,{max:1000})};
 if(SECRET.test(v.notes))throw appError('Bitte keine Passwörter oder Schlüssel in die Geräteakte schreiben. Dafür gibt es einen Passwort-Tresor.');
 return v;
}
export function listDevices(orgId,opts){return getDb().prepare('SELECT * FROM devices WHERE organization_id=? ORDER BY kind,label').all(orgId).map(r=>deviceView(r,opts))}
export function saveDevice(orgId,input){
 const v=clean(input),now=Date.now(),db=getDb();
 if(!db.prepare('SELECT 1 FROM organizations WHERE id=?').get(orgId))throw appError('Konto nicht gefunden.',404);
 if(input.id){
  const r=db.prepare('UPDATE devices SET kind=?,label=?,vendor=?,model=?,location=?,serial=?,firmware=?,installed_on=?,warranty_until=?,notes=?,updated_at=? WHERE id=? AND organization_id=?').run(v.kind,v.label,v.vendor,v.model,v.location,v.serial,v.firmware,v.installedOn,v.warrantyUntil,v.notes,now,String(input.id),orgId);
  if(!r.changes)throw appError('Gerät nicht gefunden.',404);return String(input.id);
 }
 const id=randomUUID();
 db.prepare('INSERT INTO devices(id,organization_id,kind,label,vendor,model,location,serial,firmware,installed_on,warranty_until,notes,qr_token,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,orgId,v.kind,v.label,v.vendor,v.model,v.location,v.serial,v.firmware,v.installedOn,v.warrantyUntil,v.notes,randomBytes(9).toString('base64url'),now,now);
 return id;
}
export function deleteDevice(orgId,id){if(!getDb().prepare('DELETE FROM devices WHERE id=? AND organization_id=?').run(String(id),orgId).changes)throw appError('Gerät nicht gefunden.',404)}
// Öffentlich über den QR-Code: nur Bezeichnung und Art, damit ein verlorener Aufkleber nichts verrät.
export function deviceByToken(token){
 if(typeof token!=='string'||!/^[A-Za-z0-9_-]{8,20}$/.test(token))return null;
 const r=getDb().prepare('SELECT * FROM devices WHERE qr_token=?').get(token);
 return r?{id:r.id,organizationId:r.organization_id,label:r.label,kindLabel:DEVICE_KINDS[r.kind],category:kindCategory[r.kind]||'computer-software'}:null;
}
export function warrantySoon(days=60){
 const until=new Date(Date.now()+days*86400000).toISOString().slice(0,10),today=new Date().toISOString().slice(0,10);
 return getDb().prepare('SELECT d.*,o.name AS org_name,o.account_type FROM devices d JOIN organizations o ON o.id=d.organization_id WHERE warranty_until IS NOT NULL AND warranty_until BETWEEN ? AND ? ORDER BY warranty_until').all(today,until).map(r=>({...deviceView(r,{withToken:false}),organization:r.account_type==='business'?r.org_name:'Privatkunde',organizationId:r.organization_id}));
}
