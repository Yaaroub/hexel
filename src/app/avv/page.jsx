import LegalDraft from '../components/LegalDraft';
import Who,{gap} from '../components/Who';
import {pageMetadata} from '../../lib/seo';
export const metadata=pageMetadata('Vertrag zur Auftragsverarbeitung (AVV) | FUNKNAHT','Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO für Betriebe, die das FUNKNAHT-Betriebsportal nutzen.','/avv');
const hosting=process.env.HOSTING_PROVIDER||'';
const mail=process.env.MAIL_PROVIDER||'';
export default function Avv(){
 return <>
  <section className="page-head"><div className="wrap"><h1 className="display">Vertrag zur Auftrags­verarbeitung</h1><p className="lead">Nach Art. 28 DSGVO, für die Nutzung des Betriebsportals. Stand: November 2026</p></div></section>
  <section className="band"><div className="wrap legal prose">
   <LegalDraft/>
   <p>Dieser Vertrag gilt zwischen dem Betrieb, der ein Konto im Betriebsportal führt (Verantwortlicher, „Auftraggeber“), und <Who/> (Auftragsverarbeiter, „FUNKNAHT“). Er wird mit der Nutzung des Betriebsportals Bestandteil des Nutzungsvertrags. Auf Wunsch stellen wir ihn zusätzlich unterschrieben als PDF bereit.</p>
   <h2>1. Gegenstand und Dauer</h2>
   <p>FUNKNAHT stellt das Betriebsportal bereit, in dem der Auftraggeber Termine, Kunden, Leistungen und Aufträge verwaltet und eine Online-Buchungsseite betreibt. Dabei verarbeitet FUNKNAHT personenbezogene Daten im Auftrag. Der Vertrag läuft so lange, wie der Auftraggeber das Betriebsportal nutzt.</p>
   <h2>2. Art der Daten und Betroffene</h2>
   <ul><li><strong>Betroffene:</strong> Kundinnen und Kunden des Auftraggebers, Personen, die über die Buchungsseite Termine anfragen, sowie eingeladene Mitarbeitende des Auftraggebers.</li><li><strong>Daten:</strong> Namen, E-Mail-Adressen, Telefonnummern, Anschriften, Termine, gebuchte Leistungen, Auftragsdaten und Notizen, die der Auftraggeber einträgt.</li><li><strong>Zweck:</strong> Terminverwaltung, Kundenverwaltung, Auftragsverwaltung, Versand von Terminbestätigungen und Erinnerungen.</li></ul>
   <p>Besondere Kategorien personenbezogener Daten (z. B. Gesundheitsdaten) soll der Auftraggeber nicht in Freitextfelder eintragen. Praxen nutzen für Behandlungsdaten ihr Praxisverwaltungssystem.</p>
   <h2>3. Weisungen</h2>
   <p>FUNKNAHT verarbeitet die Daten nur auf dokumentierte Weisung des Auftraggebers. Die Weisungen ergeben sich aus diesem Vertrag und aus der Nutzung der Funktionen des Betriebsportals. Hält FUNKNAHT eine Weisung für rechtswidrig, weist FUNKNAHT den Auftraggeber darauf hin.</p>
   <h2>4. Pflichten von FUNKNAHT</h2>
   <ul>
    <li>Alle Personen, die Zugriff auf die Daten haben, sind zur Vertraulichkeit verpflichtet.</li>
    <li>FUNKNAHT sieht Kundenlisten, Termine und Aufträge des Auftraggebers nicht ein. Im Inhaberbereich erscheinen nur Anzahlen. Jeder Zugriff des Inhabers auf Kontodaten wird protokolliert.</li>
    <li>FUNKNAHT unterstützt den Auftraggeber bei Anfragen Betroffener (Auskunft, Berichtigung, Löschung, Export). Die meisten davon kann der Auftraggeber selbst im Portal erledigen.</li>
    <li>FUNKNAHT meldet Verletzungen des Schutzes personenbezogener Daten unverzüglich, möglichst innerhalb von 24 Stunden nach Kenntnis.</li>
    <li>FUNKNAHT unterstützt den Auftraggeber bei Datenschutz-Folgenabschätzungen, soweit erforderlich.</li>
   </ul>
   <h2>5. Technische und organisatorische Maßnahmen</h2>
   <ul>
    <li>Betrieb auf einem Server in Deutschland{hosting?<> bei {hosting}</>:<> ({gap('Hosting-Anbieter')})</>}, Verbindung ausschließlich verschlüsselt (HTTPS mit HSTS).</li>
    <li>Passwörter werden nur als gesalzener scrypt-Hash gespeichert, Sitzungen nur als Hash des Sitzungsschlüssels.</li>
    <li>Rollen und Rechte: Inhaber, Büro und Monteur sehen nur, was ihre Rolle erlaubt. Daten verschiedener Betriebe sind strikt getrennt.</li>
    <li>Schutz vor Missbrauch durch Begrenzung von Anmeldeversuchen und Prüfung der Herkunft von Anfragen.</li>
    <li>Tägliche Sicherung der Datenbank auf dem Server, Aufbewahrung 14 Tage, zusätzliche Sicherung außer Haus.</li>
    <li>Sicherheitsupdates des Betriebssystems werden automatisch eingespielt.</li>
   </ul>
   <h2>6. Unterauftragsverarbeiter</h2>
   <p>Der Auftraggeber stimmt dem Einsatz folgender Unterauftragsverarbeiter zu:</p>
   <ul>
    <li>Hosting: {hosting||gap('Hosting-Anbieter, Sitz und Serverstandort')}</li>
    <li>E-Mail-Versand für Terminbestätigungen und Erinnerungen: {mail||gap('E-Mail-Anbieter')}</li>
   </ul>
   <p>Über neue oder geänderte Unterauftragsverarbeiter informiert FUNKNAHT vorab per E-Mail. Der Auftraggeber kann aus wichtigem datenschutzrechtlichem Grund widersprechen und den Vertrag dann kündigen. Der Zahlungsdienst für die Tarife (Stripe) verarbeitet nur Daten des Auftraggebers selbst, nicht die Daten seiner Kunden.</p>
   <h2>7. Kontrollrechte</h2>
   <p>Der Auftraggeber kann sich nach rechtzeitiger Anmeldung von der Einhaltung dieses Vertrags überzeugen. FUNKNAHT stellt dafür die erforderlichen Auskünfte bereit.</p>
   <h2>8. Löschung und Rückgabe</h2>
   <p>Der Auftraggeber kann seine Daten jederzeit im Portal exportieren. Löscht er sein Konto, werden die Daten unverzüglich gelöscht. Aus Sicherungskopien verschwinden sie spätestens nach 14 Tagen. Gesetzliche Aufbewahrungspflichten von FUNKNAHT, etwa für Rechnungen an den Auftraggeber, bleiben unberührt.</p>
   <h2>9. Schlussbestimmungen</h2>
   <p>Bei Widersprüchen zwischen diesem Vertrag und anderen Vereinbarungen geht dieser Vertrag für den Datenschutz vor. Es gilt deutsches Recht.</p>
  </div></section>
 </>;
}
