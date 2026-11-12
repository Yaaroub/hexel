import LegalDraft from '../components/LegalDraft';
import Who from '../components/Who';
import {pageMetadata} from '../../lib/seo';
export const metadata=pageMetadata('Widerrufsbelehrung | FUNKNAHT','Widerrufsbelehrung und Muster-Widerrufsformular für Verbraucher bei FUNKNAHT.','/widerruf');
export default function Widerruf(){
 return <>
  <section className="page-head"><div className="wrap"><h1 className="display">Widerrufs­belehrung</h1><p className="lead">Für Verbraucherinnen und Verbraucher</p></div></section>
  <section className="band"><div className="wrap legal prose">
   <LegalDraft/>
   <h2>Widerrufsrecht</h2>
   <p>Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.</p>
   <p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (<Who/>) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das unten stehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.</p>
   <p>Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.</p>
   <h2>Folgen des Widerrufs</h2>
   <p>Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.</p>
   <p>Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.</p>
   <h2>Hinweis zum Erlöschen</h2>
   <p>Das Widerrufsrecht erlischt bei einem Vertrag über Dienstleistungen, wenn wir die Dienstleistung vollständig erbracht haben und mit der Ausführung erst begonnen haben, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung verlieren. Haben Sie uns ausdrücklich aufgefordert, Sie zu Hause aufzusuchen, um dringende Arbeiten vorzunehmen, besteht insoweit kein Widerrufsrecht.</p>
   <h2>Muster-Widerrufsformular</h2>
   <div className="form-sample">
    <p>(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)</p>
    <p>An <Who/>:</p>
    <p>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung (*)</p>
    <p>Bestellt am (*) / erhalten am (*): ____________________</p>
    <p>Name des/der Verbraucher(s): ____________________</p>
    <p>Anschrift des/der Verbraucher(s): ____________________</p>
    <p>Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ____________________</p>
    <p>Datum: ____________________</p>
    <p>(*) Unzutreffendes streichen.</p>
   </div>
  </div></section>
 </>;
}
