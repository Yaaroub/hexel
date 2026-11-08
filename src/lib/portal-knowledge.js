// Redaktionell gepflegte Orientierung. Diese Schritte führen keine Änderungen aus
// und ersetzen keine Prüfung des konkreten Geräts oder Systems.
export const categories = [
  {
    id: 'internet-wlan',
    title: 'Internet & WLAN',
    description: 'Eingrenzen, ob die Verbindung, ein bestimmtes Gerät oder ein einzelner Dienst betroffen ist.',
    icon: 'network',
    steps: [
      {
        id: 'umfang',
        title: 'Den Umfang vergleichen',
        instruction: 'Prüfen Sie auf einem zweiten, bereits verbundenen Gerät dieselbe gewöhnlich genutzte Website. Vergleichen Sie anschließend eine andere bekannte Website. Ändern Sie dabei keine Einstellungen.',
        verify: 'Notieren Sie, welche Geräte und welche Websites betroffen sind. Funktioniert nur ein Dienst nicht oder fehlt die Verbindung überall?',
        escalateWhen: 'Wenn alle Geräte betroffen sind oder ein geschäftskritischer Dienst ausfällt, geben Sie diese Beobachtung direkt weiter.',
      },
      {
        id: 'verbindung',
        title: 'Die angezeigte Verbindung ansehen',
        instruction: 'Lesen Sie den Verbindungsstatus des betroffenen Geräts ab. Bei WLAN genügt der Hinweis, ob das Gerät verbunden ist; bei einer Kabelverbindung, ob das Betriebssystem eine Verbindung erkennt. Teilen Sie keine Kennwörter oder vollständigen Netzwerknamen.',
        verify: 'Steht dort „verbunden“, „kein Internet“ oder „nicht verbunden“? Übernehmen Sie den genauen Wortlaut.',
        escalateWhen: 'Bei unbekannten Sicherheitsmeldungen oder Aufforderungen zur Eingabe von Zugangsdaten nicht fortfahren; die Meldung zunächst prüfen lassen.',
      },
      {
        id: 'standort',
        title: 'Standort und Zeitpunkt festhalten',
        instruction: 'Wenn Sie ein mobiles Gerät verwenden, vergleichen Sie den Empfang am bisherigen Arbeitsplatz mit einem Platz näher am Router. Lassen Sie Router, Kabel und Zugangspunkte unverändert.',
        verify: 'Tritt das Problem nur in einem Raum, auf einem Gerät oder zu bestimmten Zeiten auf?',
        escalateWhen: 'Wenn eine Bewegung des Geräts nicht möglich ist, überspringen Sie den Vergleich. Für Vor-Ort-Hilfe nennen Sie den Ort und die betroffenen Räume.',
      },
      {
        id: 'beobachtung',
        title: 'Eine nachvollziehbare Fehlerbeschreibung erstellen',
        instruction: 'Notieren Sie den Beginn des Problems, betroffene Geräte und kürzlich erfolgte Änderungen, etwa einen Routerwechsel. Lesen Sie vorhandene Statusanzeigen ab, ohne etwas umzustellen.',
        verify: 'Eine brauchbare Beschreibung nennt Gerät, Ort, Zeitpunkt und das Ergebnis der Vergleiche.',
        escalateWhen: 'Wenn das Problem bestehen bleibt, übergeben Sie diese Angaben. Ein Reset oder eine Änderung der Netzwerkkonfiguration gehört nicht zu diesen Prüfschritten.',
      },
    ],
  },
  {
    id: 'drucker',
    title: 'Drucker & Scannen',
    description: 'Status, ausgewähltes Gerät und Umfang eines Druck- oder Scanproblems nachvollziehen.',
    icon: 'printer',
    steps: [
      {
        id: 'anzeige',
        title: 'Meldung am Gerät ablesen',
        instruction: 'Sehen Sie auf Display oder Statusanzeige des Druckers nach. Notieren Sie den genauen Hinweis und das Gerätemodell. Öffnen Sie keine Abdeckungen und ziehen Sie kein feststeckendes Papier mit Gewalt heraus.',
        verify: 'Wird Papier, Verbrauchsmaterial, eine Verbindung oder ein Fehlercode genannt?',
        escalateWhen: 'Bei ungewöhnlichem Geruch, Geräuschen oder einer Meldung zur Wartung keine weiteren Versuche unternehmen und die zuständige Betreuung kontaktieren.',
      },
      {
        id: 'auswahl',
        title: 'Ausgewählten Drucker kontrollieren',
        instruction: 'Öffnen Sie die Druckvorschau des betreffenden Programms, ohne den Auftrag abzusenden. Lesen Sie den ausgewählten Druckernamen und den angezeigten Status ab.',
        verify: 'Ist das erwartete Gerät ausgewählt oder eine andere Ausgabe, etwa eine PDF-Datei? Wird das Gerät als offline angezeigt?',
        escalateWhen: 'Wenn das erwartete Gerät nicht angeboten wird, halten Sie dies fest. Installieren Sie keine Treiber aus unbekannten Quellen.',
      },
      {
        id: 'warteschlange',
        title: 'Vorhandene Aufträge ansehen',
        instruction: 'Sehen Sie sich, sofern zugänglich, die bestehende Druckwarteschlange an. Lesen Sie nur Status und Zeitpunkt ab; löschen, wiederholen oder verändern Sie keine Aufträge.',
        verify: 'Warten mehrere Aufträge, ist ein Auftrag angehalten oder erscheint eine Fehlermeldung?',
        escalateWhen: 'Bei einer gemeinsam genutzten Warteschlange die zuständige Person hinzuziehen. Übermitteln Sie keine vertraulichen Dokumentnamen.',
      },
      {
        id: 'vergleich',
        title: 'Den betroffenen Ablauf beschreiben',
        instruction: 'Klären Sie anhand bereits bekannter Beobachtungen, ob andere Personen oder Programme denselben Fehler haben und ob Drucken, Scannen oder beides betroffen ist. Senden Sie keine zusätzlichen Testaufträge mit vertraulichen Inhalten.',
        verify: 'Notieren Sie Programm, Druckermodell, Verbindungsart und die letzte erfolgreiche Nutzung, soweit bekannt.',
        escalateWhen: 'Wenn das Problem nicht eindeutig einzugrenzen ist, übergeben Sie die Beobachtungen, bevor Einstellungen am gemeinsam genutzten Gerät geändert werden.',
      },
    ],
  },
  {
    id: 'computer-software',
    title: 'Computer & Programme',
    description: 'Fehlermeldungen und betroffene Arbeitsschritte sammeln, ohne Daten oder Einstellungen zu verändern.',
    icon: 'monitor',
    steps: [
      {
        id: 'fehlermeldung',
        title: 'Den Fehler genau festhalten',
        instruction: 'Notieren Sie den Programmnamen, den Wortlaut der Meldung und den Arbeitsschritt unmittelbar davor. Lassen Sie ungespeicherte Arbeit geöffnet. Ein Screenshot sollte nur die Meldung und keine Kundendaten zeigen.',
        verify: 'Lässt sich benennen, bei welcher Handlung der Fehler auftritt, etwa beim Öffnen, Speichern oder Anmelden?',
        escalateWhen: 'Bei Verdacht auf Datenverlust, verschlüsselte Dateien oder unerwartete Zahlungsforderungen keine weiteren Versuche unternehmen und die zuständige IT kontaktieren.',
      },
      {
        id: 'umfang',
        title: 'Ein Programm oder mehrere?',
        instruction: 'Prüfen Sie anhand offener Programme, ob nur eine Anwendung betroffen ist oder das gesamte Gerät langsam beziehungsweise nicht bedienbar ist. Erzwingen Sie kein Beenden und keinen Neustart.',
        verify: 'Reagieren andere geöffnete Programme? Ist der Fehler auf eine Datei, ein Benutzerkonto oder eine bestimmte Funktion begrenzt?',
        escalateWhen: 'Wenn ungespeicherte Daten betroffen sein könnten oder das Gerät nicht reagiert, den Zustand zunächst unverändert lassen und Hilfe hinzuziehen.',
      },
      {
        id: 'aenderungen',
        title: 'Den zeitlichen Zusammenhang klären',
        instruction: 'Notieren Sie, wann die Arbeit zuletzt funktioniert hat und welche Änderungen bekannt sind, etwa ein Update oder eine neue Datei. Lesen Sie die Programmversion nur ab, wenn sie ohne zusätzliche Anmeldung erreichbar ist.',
        verify: 'Begann der Fehler nach einer konkreten Änderung oder tritt er nur gelegentlich auf?',
        escalateWhen: 'Wenn eine Änderung zurückgenommen werden müsste, lassen Sie den nächsten Schritt vorher prüfen. Diese Orientierung enthält keine Deinstallation oder Wiederherstellung.',
      },
      {
        id: 'uebergabe',
        title: 'Die Beschreibung vervollständigen',
        instruction: 'Ergänzen Sie Gerätetyp, Betriebssystem, Programm und betroffenen Ablauf. Beschreiben Sie die Auswirkung auf Ihre Arbeit. Kennwörter, Lizenzschlüssel und vertrauliche Dateiinhalte werden dafür nicht benötigt.',
        verify: 'Kann eine andere Person anhand Ihrer Angaben erkennen, was Sie tun wollten und was stattdessen passiert ist?',
        escalateWhen: 'Wenn die Ursache unklar bleibt, nutzen Sie diese Angaben für eine Anfrage, statt weitere Änderungen auf Verdacht vorzunehmen.',
      },
    ],
  },
  {
    id: 'website',
    title: 'Problem mit einer Website',
    description: 'Eine bestehende Website oder Webanwendung prüfen und den Fehler reproduzierbar beschreiben.',
    icon: 'globe',
    steps: [
      {
        id: 'adresse',
        title: 'Seite und Fehlermeldung festhalten',
        instruction: 'Notieren Sie die betroffene öffentliche Seitenadresse und den sichtbaren Hinweis. Entfernen Sie persönliche Angaben, Sitzungsschlüssel und andere vertrauliche Werte aus der Adresse, bevor Sie sie weitergeben.',
        verify: 'Ist die ganze Website betroffen oder eine konkrete Unterseite beziehungsweise Funktion? Gibt es einen sichtbaren Fehlercode?',
        escalateWhen: 'Bei einer Zertifikats- oder Sicherheitswarnung nicht auf „trotzdem öffnen“ klicken. Die Warnung zunächst von der zuständigen Betreuung prüfen lassen.',
      },
      {
        id: 'vergleich',
        title: 'Die Darstellung vergleichen',
        instruction: 'Öffnen Sie eine öffentlich erreichbare, unkritische Seite bei Bedarf in einem bereits installierten zweiten Browser oder auf einem zweiten Gerät. Übermitteln Sie dabei keine Formulare und keine echten Buchungen.',
        verify: 'Tritt derselbe Fehler in beiden Ansichten auf? Notieren Sie Browser, Gerät und ungefähre Uhrzeit.',
        escalateWhen: 'Wenn ein Login oder sensible Inhalte erforderlich sind, überspringen Sie den Vergleich. Zugangsdaten werden für die erste Beschreibung nicht benötigt.',
      },
      {
        id: 'ablauf',
        title: 'Den Weg zum Fehler beschreiben',
        instruction: 'Schreiben Sie die Schritte bis zur betroffenen Stelle auf: Startseite, gewählter Bereich, erwartete Funktion. Führen Sie keine Zahlung, Bestellung, Löschung oder weitere Übermittlung aus, um den Fehler nachzustellen.',
        verify: 'Welche Handlung führt zum Fehler und welches Ergebnis wäre richtig? Falls möglich, nennen Sie die letzte funktionierende Nutzung.',
        escalateWhen: 'Wenn personenbezogene Daten falsch sichtbar werden oder Buchungen beziehungsweise Zahlungen betroffen sind, die verantwortliche Stelle direkt informieren.',
      },
      {
        id: 'zustaendigkeit',
        title: 'Den nächsten Kontakt vorbereiten',
        instruction: 'Halten Sie fest, ob Sie die Website selbst betreiben oder als Besucher nutzen. Als Betreiber ergänzen Sie bekannte Änderungen und die zuständige Betreuung, soweit bekannt.',
        verify: 'Die Übergabe enthält Adresse, Browser, Zeitpunkt, genaue Schritte und das erwartete Ergebnis.',
        escalateWhen: 'Änderungen an Hosting, Datenbank, Erweiterungen oder Zugangseinstellungen sollten erst nach Prüfung des konkreten Systems erfolgen.',
      },
    ],
  },
  {
    id: 'projekt',
    title: 'Website oder Anwendung planen',
    description: 'Aus einer ersten Idee einen verständlichen Umfang für ein Entwicklungsgespräch machen.',
    icon: 'code',
    steps: [
      {
        id: 'aufgabe',
        title: 'Die Aufgabe in Alltagssprache beschreiben',
        instruction: 'Beschreiben Sie einen typischen Arbeitsschritt oder eine Frage Ihrer Besucher. Nennen Sie, was heute aufwendig ist und was nach dem Projekt einfacher möglich sein soll.',
        verify: 'Lässt sich das Ziel an einem konkreten Beispiel erklären, ohne bereits eine technische Lösung festzulegen?',
        escalateWhen: 'Wenn Ziele noch widersprüchlich sind, sammeln Sie die offenen Punkte für das Erstgespräch. Eine fertige Leistungsbeschreibung ist nicht erforderlich.',
      },
      {
        id: 'nutzer',
        title: 'Menschen und vorhandene Systeme benennen',
        instruction: 'Notieren Sie, wer die Website oder Anwendung nutzen soll und welche Inhalte, Dateien oder Programme bereits vorhanden sind. Beschreiben Sie Beispiele mit erfundenen Namen statt echten Kunden- oder Patientendaten.',
        verify: 'Sind Nutzergruppen, benötigte Informationen und die bisherige Arbeitsweise erkennbar?',
        escalateWhen: 'Wenn sensible Daten oder ein geschützter Fachprozess betroffen sind, muss dies vor der Umsetzung gemeinsam eingeordnet werden.',
      },
      {
        id: 'umfang',
        title: 'Den ersten sinnvollen Umfang abgrenzen',
        instruction: 'Teilen Sie Ihre Wünsche in „zum Start nötig“ und „später denkbar“. Für eine Website können das Leistungen und Kontakt sein; für eine Anwendung ein einzelner vollständiger Arbeitsablauf.',
        verify: 'Welche Aufgabe muss die erste Version zuverlässig ermöglichen, damit sie bereits nützlich ist?',
        escalateWhen: 'Wenn Abhängigkeiten zu anderen Anbietern oder Systemen unklar sind, kennzeichnen Sie diese als offene Fragen statt Annahmen zu treffen.',
      },
      {
        id: 'rahmen',
        title: 'Rahmen und Pflege klären',
        instruction: 'Ergänzen Sie einen gewünschten Zeitraum, einen möglichen Budgetrahmen und wer Inhalte später pflegen soll. Kennzeichnen Sie feste Vorgaben und flexible Wünsche getrennt.',
        verify: 'Sind Ziel, erster Umfang, offene Fragen und der spätere Betrieb nachvollziehbar beschrieben?',
        escalateWhen: 'Ein verbindlicher Preis oder eine Terminzusage lässt sich erst nach Prüfung des Umfangs vereinbaren.',
      },
    ],
  },
  {
    id: 'automatisierung',
    title: 'Abläufe automatisieren',
    description: 'Wiederkehrende Arbeitsschritte aufzeichnen und Voraussetzungen für eine Automatisierung prüfen.',
    icon: 'workflow',
    steps: [
      {
        id: 'ablauf',
        title: 'Einen wiederkehrenden Vorgang auswählen',
        instruction: 'Wählen Sie einen konkreten Ablauf, beispielsweise das Übertragen von Angaben zwischen zwei Listen. Schreiben Sie Auslöser, Eingaben, einzelne Schritte und das gewünschte Ergebnis auf.',
        verify: 'Läuft der Vorgang regelmäßig nach denselben Regeln ab oder entscheidet eine Person jedes Mal unterschiedlich?',
        escalateWhen: 'Wenn Entscheidungen über Menschen oder sensible Sachverhalte betroffen sind, muss zuerst geklärt werden, welche Schritte überhaupt automatisiert werden dürfen.',
      },
      {
        id: 'schnittstellen',
        title: 'Quellen und Ziele erfassen',
        instruction: 'Notieren Sie beteiligte Programme und Dateiformate. Halten Sie fest, ob ein dokumentierter Export oder eine bekannte Schnittstelle existiert. Laden Sie keine Erweiterungen herunter und geben Sie keine Zugangsdaten weiter.',
        verify: 'Woher kommen die Informationen und an welcher Stelle werden sie anschließend gebraucht?',
        escalateWhen: 'Wenn fremde Systeme oder fehlende Zugriffsrechte betroffen sind, muss deren Nutzung zunächst mit den Verantwortlichen geklärt werden.',
      },
      {
        id: 'ausnahmen',
        title: 'Ausnahmen und Kontrolle mitdenken',
        instruction: 'Beschreiben Sie typische Ausnahmen: fehlende Angaben, doppelte Einträge oder abweichende Formate. Legen Sie als offene Planungsfrage fest, wer ein Ergebnis kontrolliert, bevor es weiterverwendet wird.',
        verify: 'Wie würde ein Fehler auffallen und wer könnte ihn beurteilen? Welche Aktionen müssen ausdrücklich von einer Person bestätigt werden?',
        escalateWhen: 'Zahlungen, Versand, Löschungen oder Änderungen an Produktivdaten dürfen nicht allein zum Ausprobieren eines Ablaufs ausgelöst werden.',
      },
      {
        id: 'beispiel',
        title: 'Ein unverfängliches Beispiel vorbereiten',
        instruction: 'Beschreiben Sie einen Testfall mit erfundenen Angaben oder leeren Vorlagen. Ergänzen Sie die ungefähre Häufigkeit und den bisherigen manuellen Aufwand, soweit bekannt.',
        verify: 'Lässt sich anhand des Beispiels erklären, welches Ergebnis korrekt wäre und woran man es erkennt?',
        escalateWhen: 'Vor einer Umsetzung müssen Aufwand, Zugriff, Fehlerbehandlung und Freigabe am konkreten Ablauf geprüft werden.',
      },
    ],
  },
];

export function getDiagnostic(id) {
  return categories.find((category) => category.id === id) || null;
}

function normalize(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
}

// This intentionally small rule set is a suggestion, not a diagnosis. A tie or
// unrelated description stays unassigned so the visitor can choose explicitly.
export function classifyIssue(description) {
  let text = normalize(description).trim();
  if (!text) return null;
  // Explicit exclusions should not select the very category being ruled out.
  text = text.replace(/\bkein(?:e|en|em|er)?\s+(?:problem\s+(?:mit\s+)?)?(?:drucker(?:problem)?|wlan(?:problem)?|internet(?:problem)?|website(?:problem)?|webseiten?(?:problem)?)\b/g, ' ');
  const has = (pattern) => pattern.test(text);
  const candidates = [];
  const printer = has(/\b(drucker\w*|drucken|druckt|druckauftrag\w*|scanner\w*|scannen|scannt|papierstau)\b/);
  const internet = has(/\b(wlan\w*|wi[ -]?fi|internet\w*|router\w*|netzwerk\w*|verbindung\w*)\b/);
  const website = has(/\b(webseite\w*|website\w*|homepage\w*|webapp\w*|webanwendung\w*|browser\w*|hosting|domain\w*|http\w*|ssl|zertifikat\w*)\b/);
  const computer = has(/\b(computer\w*|laptop\w*|notebook\w*|pc|windows\w*|macos|programm\w*|software\w*|absturz\w*|absturzt|startet|datei\w*)\b/);
  const automation = has(/\b(automatisier\w*|automatisch\w*|automation\w*|workflow\w*)\b/);
  const project = has(/\b(projekt\w*|neue[nmrs]?\s+(?:webseite|website|homepage|webanwendung|anwendung|software)|(?:webseite|website|homepage|webanwendung|anwendung|software)\s+(?:neu\s+)?(?:erstellen|entwickeln|bauen|planen)|(?:brauchen|benotigen|wunschen|mochten)\b.{0,45}\b(?:webseite|website|homepage|webanwendung|anwendung|software))\b/);
  if (automation) candidates.push('automatisierung');
  if (project && !automation) candidates.push('projekt');
  if (printer) candidates.push('drucker');
  // WLAN is commonly mentioned as the printer's connection, rather than a
  // separate network incident. An explicit second fault remains ambiguous.
  const separateNetworkFault = has(/\b(?:internet|wlan|netzwerk)\b\s+und\s+(?:drucker|scanner)\b|\b(?:drucker|scanner)\b\s+und\s+(?:internet|wlan|netzwerk)\b|\b(?:internet|wlan|netzwerk)\b.{0,20}\b(?:auch|ebenfalls)\b.{0,20}\b(?:nicht|ausfall|defekt|weg)\b|\b(?:auch|ebenfalls)\b.{0,20}\b(?:internet|wlan|netzwerk)\b.{0,20}\b(?:nicht|ausfall|defekt|weg)\b/);
  if (internet && (!printer || separateNetworkFault)) candidates.push('internet-wlan');
  if (website && !project && !automation) candidates.push('website');
  if (computer && !website && !printer && !project && !automation && !internet) candidates.push('computer-software');
  return candidates.length === 1 ? candidates[0] : null;
}

function cleanLine(value, maxLength = 1500) {
  return String(value || '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, maxLength);
}

export function buildHandoff({category,description,device,attempts} = {}) {
  const diagnostic = getDiagnostic(typeof category === 'string' ? category : category?.id);
  const lines = ['Anliegen an FUNKNAHT'];
  if (diagnostic) lines.push('Bereich: ' + diagnostic.title);
  const issue = cleanLine(description);
  const equipment = cleanLine(device, 300);
  const observations = Array.isArray(attempts) ? attempts.map((entry) => cleanLine(entry, 500)).filter(Boolean).join('\n') : cleanLine(attempts);
  if (issue) lines.push('\nBeschreibung:\n' + issue);
  if (equipment) lines.push('\nGerät / System:\n' + equipment);
  if (observations) lines.push('\nBisherige Beobachtungen / Versuche:\n' + observations);
  lines.push('\nBitte keine Kennwörter, Zugangsschlüssel oder vertraulichen Inhalte ergänzen.');
  return lines.join('\n');
}


