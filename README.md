# FUNKNAHT

Website, Hilfe-Portal, Betriebsportal und Inhaberbereich. Next.js 15 mit React 19, SQLite über das in Node eingebaute `node:sqlite`.

## Starten

```powershell
npm install          # entfernt dabei auch alte, nicht mehr benötigte Pakete
npm run dev          # http://127.0.0.1:3000
npm test             # Tests: Konten, Buchung, Abrechnung, Portal, Inhaber, Belege, Überwachung, Datenschutz
npm run build; npm start
```

Node.js 22.13 oder neuer (empfohlen: 24). Konfiguration: `.env.example` nach `.env.local` kopieren und ausfüllen.

## Bereiche

| Pfad | Für wen | Inhalt |
|---|---|---|
| `/` | Besucher | Startseite mit Code-Animation, Leistungen, Betriebsportal, Arbeiten, Ablauf, Einsatzgebiet |
| `/netzwerkhilfe`, `/projects`, `/contact` | Besucher | Unterseiten |
| `/impressum`, `/datenschutz` | Besucher | Rechtstexte; fehlende Angaben sind gelb markiert (`COMPANY_*` setzen) |
| `/portal` | Alle | Geführte Prüfschritte, „Ist das Betrug?“-Check, KI-Assistent, Rückrufwunsch, Übergabe an FUNKNAHT |
| `/hilfe` | Alle | Wissensdatenbank mit Schritt-für-Schritt-Hilfen |
| `/senioren` | Besucher | Digitalhilfe für Ältere mit Rückrufwunsch |
| `/portal/werkstatt` | Kunden | Anfragen, Geräte, Belege, Überwachung, Familie, Team |
| `/termin/[schlüssel]` | Endkunden | Termin ansehen, absagen, in den Kalender übernehmen |
| `/einladung/[schlüssel]` | Eingeladene | Familien- oder Team-Einladung annehmen |
| `/h/[schlüssel]` | Kunden | Ziel des QR-Aufklebers am Gerät |
| `/beleg/[id]` | Kunde, Inhaber | Angebot oder Rechnung, druckfertig |
| `/konto` | Alle | Anmelden, registrieren, **Daten herunterladen**, **Konto löschen** |
| `/betrieb` | Betriebe | Termine, Kunden, Aufträge, Leistungen, Buchungsseite, Tarif |
| `/buchen/[adresse]` | Endkunden | Öffentliche Terminbuchung eines Betriebs |
| `/inhaber` | Inhaber | Anfragen, Rückrufe, Kundenakten (Geräte, QR, Überwachung), Belege, Zeiten, Störungshinweise, Einstellungen, Protokoll |

## Inhaberbereich und Datenschutz

- Zugang nur für Konten, deren E-Mail in `OWNER_EMAILS` steht, plus erneute Passworteingabe. Nach 30 Minuten wird automatisch gesperrt.
- Kundenlisten, Termine und Aufträge der Betriebe sind für den Inhaber **nicht** einsehbar, nur ihre Anzahl (Auftragsverarbeitung nach Art. 28 DSGVO).
- Private Konten erscheinen pseudonymisiert, E-Mail-Adressen maskiert.
- Kontaktdaten in Anfragen werden erst beim Öffnen angezeigt. Öffnen, Statusänderung und Antwort werden protokolliert (`owner_audit`).
- Aufbewahrung: Erledigte Anfragen werden nach 180 Tagen anonymisiert, das Protokoll nach 365 Tagen gelöscht, abgelaufene Sitzungen entfernt.
- Nutzer exportieren ihre Daten (Art. 15/20) und löschen ihr Konto vollständig (Art. 17) unter `/konto`.
- Schriften werden selbst gehostet, es gibt keine Tracking- oder Werbe-Cookies.

## Zeitplan

`POST /api/cron` mit `Authorization: Bearer $CRON_SECRET` alle 5 Minuten aufrufen. Dann laufen Terminerinnerungen (Vortag), Website- und SSL-Prüfung, Lebenszeichen der Router und die Datenbereinigung. Auf dem Server erledigt das `deploy/funknaht-cron.timer`.

## Benachrichtigungen

Mit `EMAIL_USER`/`EMAIL_PASS` (Gmail-App-Passwort oder `SMTP_HOST`) werden versendet: Kontaktanfragen an `EMAIL_TO`, neue Portal-Anfragen an `EMAIL_TO` (ohne Details), neue Buchungen an den Betrieb und eine Eingangsbestätigung an den Endkunden, optional Antworten aus dem Inhaberbereich. Ohne Konfiguration läuft alles weiter, nur ohne E-Mails.

## Sicherheit

Passwörter mit scrypt; Sitzungs-Cookie HttpOnly, SameSite=Lax, in Produktion Secure; serverseitig wird nur ein Hash des Tokens gespeichert. Herkunftsprüfung bei allen schreibenden Anfragen, Begrenzung der Anfragen pro Zeit, Honeypot im Kontaktformular, Sicherheits-Header. IDs neuer Datensätze erzeugt nur der Server. Hinter einem Proxy `TRUST_PROXY=true` setzen, damit die Begrenzung pro IP greift.

## Vor der Veröffentlichung

1. `COMPANY_*` ausfüllen und Datenschutzerklärung rechtlich prüfen lassen (Hosting- und E-Mail-Anbieter ergänzen).
2. `SITE_URL` und `APP_URL` auf die HTTPS-Domain setzen.
3. `OWNER_EMAILS` setzen und das Inhaberkonto registrieren.
4. Auf einem eigenen Server betreiben, nicht auf Vercel (dort ist das Dateisystem schreibgeschützt). Schritt-für-Schritt: **`deploy/ANLEITUNG.md`**.
5. Stripe zuerst im Testmodus einrichten. Preise: Basis 79 €/Monat, Betrieb 229 €/Monat.
