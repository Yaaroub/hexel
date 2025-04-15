import nodemailer from 'nodemailer';

export async function POST(req) {
  // Validierung der Content-Type
  if (req.headers.get('content-type') !== 'application/json') {
    return new Response(
      JSON.stringify({ message: 'Nur JSON-Inhalt erlaubt' }),
      { status: 415 }
    );
  }

  try {
    const { name, email, message } = await req.json();

    // Erweiterte Validierung
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ message: 'Alle Felder sind erforderlich' }),
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ message: 'Ungültige E-Mail-Adresse' }),
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ionos.de',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        ciphers: 'SSLv3', // Manchmal benötigt für IONOS
        rejectUnauthorized: false // Nur im Test verwenden!
      }
    });
console.log(process.env.EMAIL_USER);

    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_TO,
      subject: `Neue Nachricht von ${name} (HEXEL-Kunde)`,
      text: `Kontaktanfrage:\n\nName: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #2563eb;">Neue Kontaktanfrage</h2>
          <p><strong>Von:</strong> ${name} (${email})</p>
          <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="margin-top: 1rem; font-size: 0.875rem; color: #6b7280;">
            Gesendet über das HEXEL-Kontaktformular
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    return new Response(
      JSON.stringify({ message: 'Nachricht erfolgreich gesendet!' }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Fehler:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Serverfehler beim Senden',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}