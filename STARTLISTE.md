# FUNKNAHT – Startliste

Alles im Code ist erledigt. Diese Punkte kannst nur du selbst machen. Reihenfolge = Wichtigkeit.

## 1. Rechtliches (vor dem Start)

- [ ] **Gewerbe anmelden** beim Gewerbeamt deiner Gemeinde (online möglich). Danach meldet sich das Finanzamt mit dem Fragebogen zur steuerlichen Erfassung.
- [ ] **Kleinunternehmer ja oder nein?** Im Fragebogen entscheiden. Davon hängt ab, ob deine Preise Umsatzsteuer enthalten.
  - Kleinunternehmer: in `src/lib/pricing.js` bei `businessRates.vatNote` den Text ändern (z. B. „Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.“) und im Inhaberbereich unter Einstellungen „Kleinunternehmer“ anhaken.
- [ ] **Berufshaftpflicht / IT-Haftpflicht** abschließen. Wichtig, weil du an Routern und Netzwerken von Kunden arbeitest (Vermögensschäden mitversichern).
- [ ] **AGB, Widerrufsbelehrung und AVV prüfen lassen.** Die Entwürfe liegen unter `/agb`, `/widerruf`, `/avv`. Prüfung z. B. über einen Anwalt für IT-Recht oder einen Rechtstext-Dienst (IT-Recht Kanzlei, Händlerbund, eRecht24). Danach `LEGAL_REVIEWED=true` setzen.
- [ ] **Server-Konfiguration ausfüllen** (`.env.local` auf dem Server): `COMPANY_OWNER`, `COMPANY_STREET`, `COMPANY_CITY`, `COMPANY_PHONE`, `COMPANY_EMAIL`, `COMPANY_VAT_ID`, `HOSTING_PROVIDER`, `MAIL_PROVIDER`, `SITE_URL`.
- [ ] **AVV abschließen** mit Server-Anbieter und E-Mail-Anbieter (meist ein Klick im Kundenbereich).
- [ ] **Alten OpenAI-Schlüssel widerrufen**, falls noch nicht geschehen.
- [ ] **FUNKNAHT AI einschalten:** Groq-Schlüssel in `.env.local` (`GROQ_API_KEY`). Vor echten Kundendaten DPA mit Groq abschließen oder auf Mistral (EU) wechseln (`AI_PROVIDER=mistral`).
- [ ] **Mitarbeiter einladen** (Inhaberbereich → Team & KI). Mitarbeiter sehen keine Umsätze, Belege und Einstellungen.

## 2. Gefunden werden (erste Woche)

- [ ] **Google-Unternehmensprofil** anlegen: business.google.com
  - Kategorie: „Computer-Support und -Dienstleistungen“, dazu „Webdesigner“ und „Netzwerkdienstleister“.
  - Als **Servicegebiet-Unternehmen** anlegen (Adresse ausblenden, wenn du kein Ladenlokal hast). Gebiete: Kiel, Kreis Plön, Kreis Ostholstein.
  - Leistungen mit Preisen eintragen, genau wie auf `/preise`.
  - Fotos hochladen: du bei der Arbeit, ein sauber eingerichteter Netzwerkschrank, ein Screenshot einer Website.
  - Link zum Profil in `COMPANY_PROFILES` eintragen.
- [ ] **Google Search Console**: Domain bestätigen, `https://deine-domain.de/sitemap.xml` einreichen.
- [ ] **Bing Webmaster Tools**: Sitemap einreichen (Bing speist auch ChatGPT-Suche und Copilot).
- [ ] **Bing Places** und **Apple Business Connect** (Apple Karten, Siri).
- [ ] **Verzeichnisse** mit genau gleichem Namen, Adresse, Telefon: Das Örtliche, Gelbe Seiten, 11880, Cylex, Kieler Branchenbuch, ggf. IHK-Firmenverzeichnis.

## 3. Vertrauen (erste Wochen)

- [ ] **Foto von dir** als `public/images/inhaber.jpg` ablegen (hochkant, etwa 960 × 1120 Pixel). Es erscheint automatisch auf der Startseite.
- [ ] **Erste Bewertungen**: Die ersten 5–10 Kunden direkt nach dem Termin um eine Google-Bewertung bitten (Link aus dem Google-Profil per WhatsApp schicken).
- [ ] **Kundenstimmen** nur mit Zustimmung in `src/lib/testimonials.js` eintragen. Die Startseite zeigt sie dann automatisch.
- [ ] **Referenzen**: Erste echte Projekte mit Vorher/Nachher unter „Arbeiten“ ergänzen.

## 4. Kunden ansprechen (laufend)

- [ ] Flyer für Senioren-Treffs, Kirchengemeinden, Seniorenbeiräte in Plön, Preetz, Eutin (Hinweis: Rückruf-Nummer groß drucken).
- [ ] Praxen und Handwerksbetriebe in Kiel und Plön direkt anschreiben, mit konkretem Angebot „Netzwerk-Check für 149 €“ oder Betreuung „Praxis & Betrieb“.
- [ ] Vermieter von Ferienwohnungen an der Ostsee: WLAN-Paket mit Überwachung anbieten.
- [ ] Netzwerk mit Elektrikern in der Region: Die verlegen Kabel, du richtest das Netz ein. Gegenseitig empfehlen.

## 5. Preise ändern

Alle Preise stehen in **`src/lib/pricing.js`**. Dort ändern, neu bauen, fertig. Preisseite, Leistungsseiten, Ortsseiten, Google-Daten und `llms.txt` passen sich automatisch an. Den Stundensatz für Rechnungen stellst du zusätzlich im Inhaberbereich unter Einstellungen ein.
