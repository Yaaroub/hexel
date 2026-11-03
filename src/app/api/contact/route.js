import nodemailer from 'nodemailer';
const topics=['Netzwerk & WLAN','Website','Webanwendung','Marke & Design','Noch offen'];
export async function POST(req){
  let data;try{data=await req.json();}catch{return Response.json({message:'Ungültige Anfrage.'},{status:400});}
  if(!data||typeof data!=='object')return Response.json({message:'Ungültige Anfrage.'},{status:400});
  const fields={name:150,email:254,message:5000,company:150,location:150,topic:60};
  for(const [key,max] of Object.entries(fields)){if(data[key]!==undefined&&(typeof data[key]!=='string'||data[key].length>max))return Response.json({message:'Bitte prüfen Sie Ihre Angaben.'},{status:400});}
  const {name='',email='',message='',company='',location='',topic='Noch offen'}=data;
  if(!name.trim()||/[\r\n]/.test(name)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.trim().length<10||!topics.includes(topic)||(topic==='Netzwerk & WLAN'&&!location.trim()))return Response.json({message:'Bitte füllen Sie alle Pflichtfelder korrekt aus.'},{status:400});
  if(!process.env.EMAIL_USER||!process.env.EMAIL_PASS||!process.env.EMAIL_TO)return Response.json({message:'Der Versand ist momentan nicht verfügbar.'},{status:503});
  try{const transporter=nodemailer.createTransport({service:'Gmail',auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASS}});await transporter.sendMail({from:{name:'FUNKNAHT Website',address:process.env.EMAIL_USER},to:process.env.EMAIL_TO,replyTo:email,subject:`FUNKNAHT Anfrage: ${topic}`,text:`Name: ${name}\nE-Mail: ${email}\nUnternehmen: ${company||'–'}\nOrt: ${location||'–'}\nAnliegen: ${topic}\n\n${message}`});return Response.json({message:'Anfrage gesendet.'});}catch{return Response.json({message:'Der Versand ist momentan nicht verfügbar.'},{status:500});}
}
