import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

/* ---------- 1. PRE‑FLIGHT für CORS ---------- */
export function OPTIONS () {
  return NextResponse.json({}, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin' : process.env.CORS_ORIGIN || '*', // z. B. 'https://hexel-tech.de'
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age'      : '86400', // 1 Tag cachebar
    },
  })
}

/* ---------- 2. POST‑Handler ---------- */
export async function POST (req) {
  try {
    const { name, email, message } = await req.json()

    /* ----------- Nodemailer ----------- */
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from    : `"Website-Kontakt" <${process.env.EMAIL_USER}>`,
      to      : process.env.EMAIL_TO,
      replyTo : email,
      subject : `Neue Nachricht von ${name}`,
      text    : `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`,
      html    : `
        <h2>Neue Kontaktanfrage</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>E-Mail:</strong> ${email}</p>
        <p><strong>Nachricht:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>`,
    })

    return NextResponse.json(
      { message: 'Nachricht erfolgreich gesendet! Wir melden uns bald.' },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
          'Content-Type'               : 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('E-Mail-Versandfehler:', error)
    return NextResponse.json(
      { message: `Fehler beim Senden: ${error.message}` },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
          'Content-Type'               : 'application/json',
        },
      },
    )
  }
}
