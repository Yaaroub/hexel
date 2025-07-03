// app/api/contact/route.js
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { name, email, message } = await req.json();

    // Debug-Logging der Umgebungsvariablen (nur in Entwicklung)
    if (process.env.NODE_ENV === 'development') {
      console.log('Mailer-ENV:', {
        user: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
      });
    }

    // Gmail Transporter konfigurieren
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: `"Website-Kontakt" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `Neue Nachricht von ${name}`,
      text: `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`,
      html: `
        <h2>Neue Kontaktanfrage</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>E-Mail:</strong> ${email}</p>
        <p><strong>Nachricht:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({
      message: 'Nachricht erfolgreich gesendet! Wir melden uns bald.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('E-Mail-Versandfehler:', error);
    return new Response(JSON.stringify({
      message: `Fehler beim Senden: ${error.message}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
