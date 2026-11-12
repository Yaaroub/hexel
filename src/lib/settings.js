import {getDb} from './business-db.js';
import {appError} from './business-auth.js';

// Einstellungen des Inhabers für Belege. Beträge in Cent.
export const defaultOwnerSettings={hourlyRateCents:8500,travelFlatCents:2900,smallBusiness:false,vatRate:19,paymentDays:14,offerValidDays:30,iban:'',bank:'',invoiceFooter:'Vielen Dank für Ihren Auftrag.'};

export function getOwnerSettings(){
 const rows=getDb().prepare('SELECT key,value FROM owner_settings').all();
 const stored=Object.fromEntries(rows.map(r=>{try{return [r.key,JSON.parse(r.value)]}catch{return [r.key,null]}}));
 return {...defaultOwnerSettings,...Object.fromEntries(Object.entries(stored).filter(([k,v])=>k in defaultOwnerSettings&&v!==null))};
}

export function saveOwnerSettings(input){
 const next={...getOwnerSettings()};
 const cents=(k,max)=>{if(input[k]!==undefined){const v=Number(input[k]);if(!Number.isInteger(v)||v<0||v>max)throw appError('Bitte prüfen Sie die Beträge.');next[k]=v}};
 cents('hourlyRateCents',100000);cents('travelFlatCents',100000);
 if(input.smallBusiness!==undefined)next.smallBusiness=input.smallBusiness===true;
 if(input.vatRate!==undefined){if(![0,7,19].includes(Number(input.vatRate)))throw appError('Der Steuersatz muss 0, 7 oder 19 Prozent sein.');next.vatRate=Number(input.vatRate)}
 for(const [k,max] of [['paymentDays',120],['offerValidDays',365]])if(input[k]!==undefined){const v=Number(input[k]);if(!Number.isInteger(v)||v<0||v>max)throw appError('Bitte prüfen Sie die Fristen.');next[k]=v}
 for(const [k,max] of [['iban',40],['bank',80],['invoiceFooter',500]])if(input[k]!==undefined){if(typeof input[k]!=='string'||input[k].length>max)throw appError('Ein Text ist zu lang.');next[k]=input[k].trim()}
 if(next.iban&&!/^[A-Z]{2}\d{2}[A-Z0-9 ]{10,32}$/i.test(next.iban))throw appError('Die IBAN sieht nicht gültig aus.');
 const put=getDb().prepare('INSERT INTO owner_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
 for(const [k,v] of Object.entries(next))put.run(k,JSON.stringify(v));
 return next;
}
