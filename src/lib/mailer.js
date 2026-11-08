import nodemailer from 'nodemailer';

// Optional notification mail. Without configuration nothing is sent and nothing fails.
export function mailConfigured(){return Boolean(process.env.EMAIL_USER&&process.env.EMAIL_PASS)}

let transport;
function transporter(){
 if(!transport){
  transport=process.env.SMTP_HOST
   ?nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE==='true',auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASS}})
   :nodemailer.createTransport({service:'Gmail',auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASS}});
 }
 return transport;
}

const clean=value=>String(value??'').replace(/[\r\n]+/g,' ').slice(0,200);

export async function sendMail({to,subject,text,replyTo}){
 if(!mailConfigured()||!to)return false;
 await transporter().sendMail({from:{name:'FUNKNAHT',address:process.env.EMAIL_USER},to,replyTo,subject:clean(subject),text:String(text||'').slice(0,20000)});
 return true;
}

// Fire-and-forget: a failed notification must never break the user's request.
export function notify(message){sendMail(message).catch(()=>{});}
