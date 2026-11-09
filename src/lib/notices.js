import {randomUUID} from 'node:crypto';
import {getDb} from './business-db.js';
import {appError,cleanString} from './business-auth.js';

// Bekannte Störungen: kurze Hinweise, die oben im Portal erscheinen.
const view=r=>({id:r.id,title:r.title,body:r.body,level:r.level,area:r.area,startsAt:r.starts_at,endsAt:r.ends_at});
export function activeNotices(now=Date.now()){return getDb().prepare('SELECT * FROM notices WHERE starts_at<=? AND (ends_at IS NULL OR ends_at>?) ORDER BY starts_at DESC LIMIT 5').all(now,now).map(view)}
export function allNotices(){return getDb().prepare('SELECT * FROM notices ORDER BY starts_at DESC LIMIT 50').all().map(view)}
export function createNotice(input){
 const title=cleanString(input.title,{required:true,max:140,label:'Titel'});
 const body=cleanString(input.body,{max:800,label:'Text'});
 const area=cleanString(input.area,{max:120,label:'Gebiet'});
 const level=['info','warn'].includes(input.level)?input.level:'info';
 const hours=Number(input.hours||0);
 if(!Number.isFinite(hours)||hours<0||hours>24*30)throw appError('Bitte prüfen Sie die Dauer.');
 const now=Date.now(),id=randomUUID();
 getDb().prepare('INSERT INTO notices(id,title,body,level,area,starts_at,ends_at,created_at) VALUES(?,?,?,?,?,?,?,?)').run(id,title,body,level,area,now,hours?now+hours*3600000:null,now);
 return id;
}
export function endNotice(id){if(!getDb().prepare('UPDATE notices SET ends_at=? WHERE id=?').run(Date.now(),String(id)).changes)throw appError('Hinweis nicht gefunden.',404)}
