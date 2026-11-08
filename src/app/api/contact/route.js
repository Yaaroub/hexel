import {assertMutationOrigin,readJson,rateLimit,requesterKey,jsonError} from '../../../lib/business-auth.js';
import {sendMail,mailConfigured} from '../../../lib/mailer.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const topics=['Netzwerk & WLAN','Website','Webanwendung','KI & Automatisierung','Betriebsportal','Digitalhilfe für Senioren','Noch offen'];
const fields={name:150,email:254,message:5000,company:150,location:150,topic:60,website:200};
export async function POST(request){
 try{
  assertMutationOrigin(request);
  const key=requesterKey(request);
  rateLimit('contact:'+key,{limit:key==='direct'?60:5,windowMs:3600000});
  const data=await readJson(request);
  for(const [name,max] of Object.entries(fields))if(data[name]!==undefined&&(typeof data[name]!=='string'||data[name].length>max))return Response.json({error:'Bitte prüfen Sie Ihre Angaben.'},{status:400});
  // Honeypot field: real visitors never see or fill it.
  if(data.website)return Response.json({message:'Anfrage gesendet.'});
  const {name='',email='',message='',company='',location='',topic='Noch offen'}=data;
  if(!name.trim()||/[\r\n]/.test(name)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.trim().length<10||!topics.includes(topic)||(topic==='Netzwerk & WLAN'&&!location.trim()))return Response.json({error:'Bitte füllen Sie alle Pflichtfelder korrekt aus.'},{status:400});
  if(!mailConfigured()||!process.env.EMAIL_TO)return Response.json({error:'Das Formular ist gerade nicht erreichbar. Bitte schreiben Sie uns direkt per E-Mail.'},{status:503});
  await sendMail({to:process.env.EMAIL_TO,replyTo:email,subject:`Anfrage: ${topic} – ${name}`,text:`Name: ${name}\nE-Mail: ${email}\nUnternehmen: ${company||'–'}\nOrt: ${location||'–'}\nAnliegen: ${topic}\n\n${message}`});
  return Response.json({message:'Anfrage gesendet.'});
 }catch(error){if(error.status)return jsonError(error);return Response.json({error:'Der Versand hat gerade nicht funktioniert. Bitte versuchen Sie es später erneut.'},{status:500})}
}
