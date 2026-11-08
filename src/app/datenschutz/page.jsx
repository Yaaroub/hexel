import {company} from '../../lib/company';
export const metadata={title:'Datenschutz | FUNKNAHT',robots:{index:true,follow:true}};
const Gap=({children})=><span className="gap">{children}</span>;
export default function Datenschutz(){
 const who=<>{company.brand}, {company.owner||<Gap>Inhaber</Gap>}, {company.street||<Gap>Straße</Gap>}, {company.city||<Gap>PLZ Ort</Gap>}, E-Mail: {company.email||<Gap>E-Mail</Gap>}</>;
 return <>
  <section className="page-head"><div className="wrap"><h1 className="display">Datenschutz</h1><p className="lead">Kurz gesagt: Wir erheben nur, was für Ihr Anliegen nötig ist, setzen keine Analyse- oder Werbe-Cookies ein und geben nichts zu Werbezwecken weiter.</p></div></section>
  <section className="band"><div className="wrap legal">
   <h2>1. Verantwortlicher</h2>
   <p>{who}</p>

   <h2>2. Aufruf der Website</h2>
   <p>Beim Aufruf verarbeitet der Server technisch notwendige Daten wie IP-Adresse, Zeitpunkt und angefragte Seite, um die Website auszuliefern und vor Missbrauch zu schützen (Art. 6 Abs. 1 lit. f DSGVO). Schriften werden von unserem eigenen Server geladen; es werden keine Inhalte von Google oder anderen Drittanbietern eingebunden. Hosting-Anbieter: <Gap>Anbieter und Standort des Servers</Gap>.</p>

   <h2>3. Cookies und lokaler Speicher</h2>
   <p>Wir setzen ausschließlich ein technisch notwendiges Sitzungs-Cookie, wenn Sie sich anmelden. Es enthält eine zufällige Kennung und läuft nach sieben Tagen oder beim Abmelden ab. Ihre Wahl zwischen heller und dunkler Darstellung wird im lokalen Speicher Ihres Browsers abgelegt und nicht an uns übertragen. Eine Einwilligung ist dafür nicht erforderlich (§ 25 Abs. 2 TDDDG).</p>

   <h2>4. Kontaktformular</h2>
   <p>Ihre Angaben (Name, E-Mail, optional Unternehmen und Ort, Ihre Nachricht) verwenden wir zur Beantwortung Ihrer Anfrage und zur Anbahnung eines Auftrags (Art. 6 Abs. 1 lit. b DSGVO). Die Nachricht wird per E-Mail an uns übermittelt. E-Mail-Anbieter: <Gap>Anbieter des Postfachs</Gap>.</p>

   <h2>5. Konto, Hilfe-Portal und Betriebsportal</h2>
   <p>Für ein Konto speichern wir Name, E-Mail-Adresse und Ihr Passwort ausschließlich als nicht umkehrbaren Hash. Anfragen im Hilfe-Portal speichern wir mit Ihrer Beschreibung, den durchgeführten Prüfschritten und Ihren Kontaktdaten, um Ihnen zu helfen (Art. 6 Abs. 1 lit. b DSGVO).</p>
   <p>Kunden, Termine und Aufträge, die ein Betrieb im Betriebsportal verwaltet, verarbeiten wir im Auftrag dieses Betriebs (Art. 28 DSGVO). Wir sehen diese Inhalte nicht ein; in unserer Verwaltung erscheinen nur Anzahlen.</p>
   <h3>Aufbewahrung</h3>
   <ul><li>Erledigte Portal-Anfragen werden nach 180 Tagen anonymisiert.</li><li>Abgelaufene Sitzungen werden automatisch gelöscht.</li><li>Unser internes Zugriffsprotokoll wird nach 365 Tagen gelöscht.</li><li>Kontodaten bleiben bis zur Löschung des Kontos bestehen. Gesetzliche Aufbewahrungspflichten für Rechnungen bleiben unberührt.</li></ul>
   <h3>Export und Löschung</h3>
   <p>Unter „Konto“ können Sie alle gespeicherten Daten als Datei herunterladen und Ihr Konto mit allen zugehörigen Daten löschen.</p>

   <h2>6. Terminbuchung über Buchungsseiten</h2>
   <p>Buchen Sie einen Termin über die Buchungsseite eines Betriebs, werden Ihre Angaben an diesen Betrieb übermittelt; Verantwortlicher ist der jeweilige Betrieb. Sie erhalten eine automatische Eingangsbestätigung per E-Mail.</p>

   <h2>7. KI-Assistent</h2>
   <p>Nutzen Sie den KI-Assistenten, übermitteln wir Ihre Frage und den bisherigen Gesprächsverlauf an OpenAI (OpenAI Ireland Ltd.) zur Erzeugung einer Antwort. Das geschieht nur nach Ihrer ausdrücklichen Bestätigung (Art. 6 Abs. 1 lit. a DSGVO). Die Anfragen werden mit der Option ohne Speicherung zu Trainingszwecken gesendet. Bitte geben Sie keine Passwörter oder vertraulichen Daten ein.</p>

   <h2>8. Zahlungen</h2>
   <p>Abonnements werden über Stripe (Stripe Payments Europe Ltd., Irland) abgewickelt. Zahlungsdaten geben Sie direkt bei Stripe ein; wir erhalten nur den Status des Abonnements (Art. 6 Abs. 1 lit. b DSGVO).</p>

   <h2>9. Ihre Rechte</h2>
   <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie auf Widerruf erteilter Einwilligungen. Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren, in Schleswig-Holstein beim Unabhängigen Landeszentrum für Datenschutz (ULD).</p>
   <p style={{marginTop:32}} className="hint">Stand: November 2026. Bitte lassen Sie diese Erklärung vor der Veröffentlichung rechtlich prüfen.</p>
  </div></section>
 </>;
}
