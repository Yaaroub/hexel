// app/api/contact/route.js
import nodemailer from 'nodemailer';

export async function POST(req) {
  const { name, email, message } = await req.json();

  // Debug-Logging der Umgebungsvariablen (nur für Entwicklung)
  if (process.env.NODE_ENV === 'development') {
    console.log('Env Variables:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO
    });
  }

  // Konfiguration für IONOS
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ionos.de', // IONOS Standard-SMTP
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true für Port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      ciphers: 'SSLv3', // Manchmal benötigt für IONOS
      rejectUnauthorized: false // Bei Zertifikatsproblemen
    }
  });

  const mailOptions = {
    from: `"Kontaktformular" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    replyTo: email, // Damit Antworten an Absender gehen
    subject: `Neue Nachricht von ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nNachricht:\n${message}`,
    html: `
      <h2>Neue Kontaktanfrage</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Nachricht:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ 
      message: 'Nachricht erfolgreich gesendet! Wir melden uns bald.' 
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Mail send error:', error);
    return new Response(JSON.stringify({ 
      message: `Fehler beim Senden: ${error.message}` 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}