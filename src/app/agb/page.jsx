import Link from 'next/link';
import LegalDraft from '../components/LegalDraft';
import Who from '../components/Who';
import {pageMetadata} from '../../lib/seo';
import {privateRates,businessRates} from '../../lib/pricing';
export const metadata=pageMetadata('Allgemeine Geschäftsbedingungen | FUNKNAHT','Allgemeine Geschäftsbedingungen von FUNKNAHT für IT-Hilfe, Netzwerk-Betreuung, Abos, Websites, Software und das Betriebsportal.','/agb');
export default function Agb(){
 return <>
  <section className="page-head"><div className="wrap"><h1 className="display">Allgemeine Geschäfts­bedingungen</h1><p className="lead">Stand: November 2026</p></div></section>
  <section className="band"><div className="wrap legal prose">
   <LegalDraft/>
   <h2>1. Geltungsbereich</h2>
   <p>Diese Bedingungen gelten für alle Verträge zwischen <Who/> (im Folgenden „FUNKNAHT“) und ihren Kundinnen und Kunden. Sie gelten für Verbraucher und Unternehmer, soweit nicht ausdrücklich nur eine Gruppe genannt ist. Abweichende Bedingungen von Kunden gelten nur, wenn FUNKNAHT ihnen schriftlich zustimmt.</p>
   <h2>2. Leistungen</h2>
   <p>FUNKNAHT erbringt Leistungen rund um Netzwerke und Software: Einrichtung, Absicherung und Betreuung von Netzwerken, WLAN, Routern und Firewalls, Hilfe bei Software, Konten, E-Mail und Druckern im Netzwerk, Digitalhilfe und Einweisungen, die Entwicklung von Websites und Webanwendungen, Automatisierungen sowie das Online-Betriebsportal.</p>
   <p>Nicht zum Leistungsumfang gehören Hardware-Reparaturen (etwa Display- oder Akkutausch, Löt- und Platinenarbeiten), die Reparatur von Elektro- und Haushaltsgeräten, Elektroinstallationen sowie Datenrettung von defekten Datenträgern.</p>
   <p>Der genaue Umfang ergibt sich aus der Auftragsbestätigung, dem Angebot oder der gebuchten Abo-Stufe. Bei Einsätzen nach Aufwand schuldet FUNKNAHT die fachgerechte Bemühung um eine Lösung, nicht einen bestimmten Erfolg, soweit nichts anderes vereinbart ist.</p>
   <h2>3. Vertragsschluss</h2>
   <p>Die Darstellung der Leistungen auf der Website ist kein bindendes Angebot. Anfragen über das Hilfe-Portal, das Kontaktformular, Telefon oder E-Mail sind Anfragen des Kunden. Ein Vertrag kommt zustande, wenn FUNKNAHT den Auftrag bestätigt, einen Termin verbindlich zusagt oder mit der Leistung beginnt. Bei Websites und Software kommt der Vertrag mit der Annahme des schriftlichen Angebots zustande.</p>
   <h2>4. Preise und Bezahlung</h2>
   <p>Es gelten die Preise zum Zeitpunkt der Beauftragung, wie sie unter <Link className="link" href="/preise">Preise</Link> veröffentlicht sind. Für Verbraucher sind alle Preise Endpreise. Für Unternehmer verstehen sich die Preise zuzüglich gesetzlicher Umsatzsteuer.</p>
   <p>Arbeitszeit wird im 15-Minuten-Takt abgerechnet, bei Verbrauchern mindestens 30 Minuten (derzeit {privateRates.hour} € je Stunde, Anfahrt {privateRates.travel} €; für Betriebe {businessRates.hour} € netto je Stunde, Anfahrt {businessRates.travel} € netto). Material wird nur nach vorheriger Absprache beschafft und gesondert berechnet.</p>
   <p>Rechnungen sind innerhalb von 14 Tagen nach Zugang ohne Abzug per Überweisung fällig. Barzahlung an der Haustür ist ausgeschlossen.</p>
   <h2>5. Mitwirkung des Kunden</h2>
   <p>Der Kunde sorgt dafür, dass FUNKNAHT zum vereinbarten Termin Zugang zu den betroffenen Geräten und Räumen hat. Passwörter, PINs und TANs gibt der Kunde selbst ein; FUNKNAHT fragt nicht danach und speichert sie nicht. Vor Arbeiten an Geräten sichert der Kunde seine Daten, soweit ihm das möglich ist. Bei Bedarf hilft FUNKNAHT dabei gegen Berechnung.</p>
   <p>FUNKNAHT führt keine Überweisungen, Käufe oder Vertragsabschlüsse im Namen des Kunden aus.</p>
   <h2>6. Fernhilfe</h2>
   <p>Fernhilfe erfolgt nur mit ausdrücklicher Zustimmung des Kunden für die jeweilige Sitzung. Der Kunde kann die Verbindung jederzeit beenden. Dauerhafte Fernzugänge, etwa zur Überwachung von Routern, richtet FUNKNAHT nur im Rahmen eines Betreuungsvertrags und nach Absprache ein.</p>
   <h2>7. Abos und Betreuungsverträge</h2>
   <p>Abos für Haushalte laufen auf unbestimmte Zeit und sind von beiden Seiten mit einer Frist von einem Monat zum Monatsende kündbar. Betreuungsverträge für Betriebe haben eine Mindestlaufzeit von drei Monaten und sind danach mit einer Frist von einem Monat zum Monatsende kündbar. Die Kündigung ist in Textform (z. B. E-Mail) möglich.</p>
   <p>Im Abo enthaltene Zeitkontingente gelten für den jeweiligen Kalendermonat und verfallen am Monatsende. Darüber hinausgehende Leistungen werden zum vereinbarten Satz berechnet. Die Abo-Gebühr wird monatlich im Voraus in Rechnung gestellt.</p>
   <h2>8. Websites und Software</h2>
   <p>Umfang, Preis und Zeitplan ergeben sich aus dem Angebot. Änderungen nach Auftragserteilung werden gesondert vereinbart. Nach Fertigstellung prüft der Kunde das Ergebnis innerhalb von 14 Tagen und erklärt die Abnahme; wesentliche Mängel teilt er in dieser Frist mit. Die Nutzungsrechte an individuell erstellten Inhalten und Programmen gehen mit vollständiger Bezahlung auf den Kunden über, soweit nichts anderes vereinbart ist. Verwendete Bibliotheken unter freien Lizenzen bleiben deren Lizenzbedingungen unterworfen.</p>
   <h2>9. Betriebsportal</h2>
   <p>Das Betriebsportal ist eine Online-Software für Unternehmer. Das Konto ist kostenlos; kostenpflichtige Tarife werden mit Abschluss der Zahlung aktiv und sind monatlich kündbar. FUNKNAHT bemüht sich um eine hohe Verfügbarkeit, schuldet aber keine ununterbrochene Erreichbarkeit; Wartungsarbeiten werden nach Möglichkeit außerhalb der üblichen Geschäftszeiten durchgeführt.</p>
   <p>Soweit der Kunde im Betriebsportal personenbezogene Daten seiner eigenen Kunden verarbeitet, handelt FUNKNAHT als Auftragsverarbeiter. Dafür gilt der <Link className="link" href="/avv">Vertrag zur Auftragsverarbeitung</Link>. Der Kunde kann seine Daten jederzeit exportieren und löschen.</p>
   <h2>10. Haftung</h2>
   <p>FUNKNAHT haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit sowie nach dem Produkthaftungsgesetz. Bei leichter Fahrlässigkeit haftet FUNKNAHT nur bei Verletzung einer wesentlichen Vertragspflicht, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Kunde regelmäßig vertrauen darf; die Haftung ist dann auf den vertragstypischen, vorhersehbaren Schaden begrenzt.</p>
   <p>Für den Verlust von Daten haftet FUNKNAHT nur in Höhe des Aufwands, der bei ordnungsgemäßer und regelmäßiger Datensicherung durch den Kunden zur Wiederherstellung erforderlich gewesen wäre.</p>
   <h2>11. Widerrufsrecht</h2>
   <p>Verbrauchern steht bei Verträgen, die außerhalb von Geschäftsräumen oder über Fernkommunikationsmittel geschlossen werden, ein gesetzliches Widerrufsrecht zu. Einzelheiten stehen in der <Link className="link" href="/widerruf">Widerrufsbelehrung</Link>.</p>
   <h2>12. Verbraucherstreitbeilegung</h2>
   <p>FUNKNAHT ist nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
   <h2>13. Schlussbestimmungen</h2>
   <p>Es gilt das Recht der Bundesrepublik Deutschland. Bei Verbrauchern gilt diese Rechtswahl nur, soweit dadurch nicht der Schutz zwingender Vorschriften des Staates entzogen wird, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat. Ist der Kunde Kaufmann, ist Gerichtsstand der Sitz von FUNKNAHT. Sollten einzelne Bestimmungen unwirksam sein, bleibt der Vertrag im Übrigen wirksam.</p>
  </div></section>
 </>;
}
