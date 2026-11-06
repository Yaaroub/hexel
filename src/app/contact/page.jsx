'use client';

import {useEffect, useState} from 'react';
import {ArrowUpRight, MapPin, Code2} from 'lucide-react';

const topics = ['Netzwerk & WLAN', 'Website', 'Webanwendung', 'Marke & Design', 'Noch offen'];

export default function Contact() {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('thema') || '';
    if (/netzwerk/i.test(value)) setTopic('Netzwerk & WLAN');
    else if (/website/i.test(value)) setTopic('Website');
    else if (/app|software|webanwendung/i.test(value)) setTopic('Webanwendung');
    else if (/design|marke/i.test(value)) setTopic('Marke & Design');
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Send failed');
      setStatus({success: true, text: 'Ihre Anfrage ist angekommen. Vielen Dank – wir melden uns über die angegebene E-Mail-Adresse.'});
      form.reset();
      setTopic('');
    } catch {
      setStatus({success: false, text: 'Der Versand hat gerade nicht funktioniert. Ihre Angaben bleiben im Formular. Bitte versuchen Sie es später erneut.'});
    } finally {
      setBusy(false);
    }
  }

  const isNetwork = topic === 'Netzwerk & WLAN';

  return <section className="section contact contact-workspace">
    <div className="contact-intro">
      <p className="page-kicker">KONTAKT / DER ERSTE SCHRITT</p>
      <h1>Erzählen Sie uns,<br/>woran es gerade hakt.</h1>
      <p className="contact-lead">Eine Idee für eine Anwendung. Eine Website, die nicht mehr zum Betrieb passt. Ein Netzwerk, das die Arbeit aufhält. Eine kurze Beschreibung genügt für den Anfang.</p>
      <a className="text-link contact-form-shortcut" href="#anfrage">Zur Anfrage <ArrowUpRight size={16}/></a>

    </div>

    <form id="anfrage" className="inquiry-panel" onSubmit={submit} aria-busy={busy} aria-label="Anfrage an FUNKNAHT">
      <div className="form-heading"><span>IHRE ANFRAGE</span><small>* Pflichtfeld</small></div>
      <fieldset disabled={busy}>
        <legend>Worum geht es? *</legend>
        <div className="topic-options">
          {topics.map(value => <label key={value}><input type="radio" name="topic" value={value} checked={topic === value} onChange={() => setTopic(value)} required/><span>{value}</span></label>)}
        </div>
        <div className="form-row">
          <label>Ihr Name *<input name="name" autoComplete="name" required maxLength={150} placeholder="Vor- und Nachname"/></label>
          <label>E-Mail *<input name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254} placeholder="name@unternehmen.de"/></label>
        </div>
        <div className="form-row">
          <label>Unternehmen <span className="field-optional">(optional)</span><input name="company" autoComplete="organization" maxLength={150}/></label>
          <label>Ort / Postleitzahl {isNetwork ? '*' : <span className="field-optional">(optional)</span>}<input name="location" autoComplete="address-level2" required={isNetwork} maxLength={150} placeholder={isNetwork ? 'Wo wird Hilfe benötigt?' : ''}/></label>
        </div>
        <label>Was möchten Sie angehen? *<textarea name="message" rows={6} required minLength={10} maxLength={5000} aria-describedby="message-help" placeholder={isNetwork ? 'Welche Verbindung macht Schwierigkeiten? Seit wann, und welche Geräte sind betroffen?' : 'Beschreiben Sie Ihre Aufgabe, den aktuellen Stand und das gewünschte Ergebnis.'}/></label>
        <p id="message-help" className="field-help">Mindestens 10 Zeichen. Bitte keine Passwörter oder sensiblen Daten eintragen.</p>
        <div className="form-bottom">
          <p>Ihre Angaben verwenden wir zur Bearbeitung Ihrer Anfrage. Eine Anfrage ist noch keine Beauftragung.</p>
          <button className="button" type="submit" disabled={busy}>{busy ? 'Wird gesendet …' : 'Anfrage senden'}<ArrowUpRight size={17}/></button>
        </div>
      </fieldset>
      {status && <p className={'form-status ' + (status.success ? 'success' : 'error')} role={status.success ? 'status' : 'alert'}>{status.text}</p>}
    </form>

    <div className="contact-notes">
      <div className="contact-facts">
        <div className="contact-fact"><MapPin size={20} strokeWidth={1.4}/><div><h2>Netzwerkhilfe vor Ort</h2><p>Im Kreis Plön und in Ostholstein. Nennen Sie uns Ihren Ort und die betroffenen Geräte; Einsatz und Termin stimmen wir gemeinsam ab.</p></div></div>
        <div className="contact-fact"><Code2 size={20} strokeWidth={1.4}/><div><h2>Websites & Webanwendungen</h2><p>Für Betriebe, Praxen und andere Unternehmen – in der Umgebung und überregional. Auch mit einem bestehenden Projekt können Sie sich melden.</p></div></div>
      </div>

      <details className="inquiry-expectations">
        <summary>Was hilft uns bei einer ersten Einschätzung?</summary>
        <ul>
          <li>Was soll sich für Sie oder Ihre Kunden verbessern?</li>
          <li>Welche Website, Software oder Geräte gibt es bereits?</li>
          <li>Gibt es einen gewünschten Zeitraum oder einen Budgetrahmen?</li>
        </ul>
        <p>Wenn Sie etwas noch nicht wissen, lassen Sie es offen. Umfang, Konditionen und die nächsten Schritte klären wir vor einer Beauftragung.</p>
      </details>
    </div>
  </section>;
}

