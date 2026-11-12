// Was FUNKNAHT macht, für wen und wo. Grundlage für Texte, Suchmaschinen-Daten und llms.txt.
export const scope={
 does:['Netzwerke, WLAN und Router einrichten, absichern und betreuen','Router aller gängigen Hersteller, auch Firewalls und Mesh-Systeme','Software einrichten, Probleme mit Programmen, Konten, E-Mail und Druckern im Netzwerk lösen','Websites und Webanwendungen selbst entwickeln','Abläufe automatisieren','Digitalhilfe für Senioren: Smartphone, Online-Banking, Videoanrufe, Schutz vor Betrug'],
 doesNot:['Keine Hardware-Reparaturen: kein Display- oder Akkutausch, kein Löten, keine Wasserschäden','Keine Reparatur von Fernsehern, Haushalts- oder Elektrogeräten','Keine Elektroinstallation: Netzwerkdosen und Kabel in der Wand verlegt Ihr Elektriker, wir richten danach alles ein','Keine Datenrettung von defekten Festplatten'],
};
export const routers=['FRITZ!Box (AVM)','MikroTik','Telekom Speedport','Vodafone Station','o2 HomeBox','LANCOM','Ubiquiti UniFi','TP-Link und Omada','Zyxel','DrayTek','Netgear','Linksys','OPNsense und pfSense'];

export const industries=[
 {id:'praxen',name:'Arztpraxen und Therapiepraxen',short:'Praxen',title:'IT und Netzwerk für Praxen',
  intro:'In einer Praxis muss das Netz einfach laufen: Empfang, Behandlungsräume, Kartenterminal, Drucker. Gleichzeitig gelten strenge Regeln für Datenschutz und IT-Sicherheit.',
  problems:['WLAN reicht nicht bis in alle Behandlungsräume','Gäste-WLAN im Wartezimmer hängt im selben Netz wie die Praxis-PCs','Drucker und Kartenleser fallen nach Router-Wechsel aus','Niemand weiß mehr, welche Geräte wo angeschlossen sind'],
  solutions:['Getrennte Netze für Praxis, Gäste und Medizingeräte','Router und Firewall sauber eingerichtet und dokumentiert','Stabiles WLAN in allen Räumen, gemessen statt geschätzt','Unterstützung bei den Netzwerk-Anforderungen der IT-Sicherheitsrichtlinie nach § 75b SGB V'],
  note:'Ihr Praxisverwaltungssystem und den TI-Konnektor betreut weiterhin Ihr Systemhaus. Wir kümmern uns um Netzwerk, WLAN und Router und stimmen uns mit ihm ab.',
  plan:'netz-betrieb'},
 {id:'handwerk',name:'Handwerksbetriebe',short:'Handwerk',title:'IT und Online-Termine für Handwerksbetriebe',
  intro:'Im Handwerk zählt jede Stunde auf der Baustelle. Die IT soll nicht aufhalten: Termine kommen über Telefon, Mail und WhatsApp, Rechnungen entstehen am Abend.',
  problems:['Terminanfragen gehen zwischen Telefon, Mail und Zettel verloren','Büro und Werkstatt haben schlechtes WLAN','Monteure kommen unterwegs nicht an Auftragsdaten','Die Website ist veraltet und bringt keine Anfragen'],
  solutions:['Online-Terminbuchung und Auftragsliste im Betriebsportal','Stabiles Netz für Büro, Werkstatt und Lager','VPN oder Portal-Zugang für unterwegs','Eine schnelle Website, die bei Google gefunden wird'],
  note:'Monteure sehen im Betriebsportal nur ihre eigenen Termine. Kundendaten bleiben im Betrieb.',
  plan:'netz-basis'},
 {id:'buero',name:'Büros, Kanzleien und Agenturen',short:'Büros und Kanzleien',title:'Netzwerk und Software für Büros und Kanzleien',
  intro:'Ein Büro mit fünf bis zwanzig Arbeitsplätzen ist oft über Jahre gewachsen. Mal hier ein Switch, mal dort ein Repeater, und irgendwann weiß niemand mehr, warum der Drucker nur manchmal geht.',
  problems:['Netzwerk ist gewachsen, aber nie geplant worden','Homeoffice-Zugang ist unsicher oder umständlich','E-Mail, Konten und Freigaben machen regelmäßig Ärger','Keine Dokumentation, wenn etwas ausfällt'],
  solutions:['Netzwerk aufräumen, dokumentieren und absichern','VPN fürs Homeoffice mit FRITZ!Box, MikroTik oder Firewall','Ordnung bei E-Mail, Konten und Druckern','Monatliche Betreuung mit fester Reaktionszeit'],
  note:'Wir arbeiten mit der Technik, die Sie haben. Neue Geräte empfehlen wir nur, wenn sie wirklich nötig sind.',
  plan:'netz-betrieb'},
 {id:'gastgeber',name:'Ferienwohnungen, Gastronomie und Handel',short:'Gastgeber und Handel',title:'WLAN für Ferienwohnungen, Gastronomie und Läden',
  intro:'An der Ostseeküste erwarten Gäste schnelles WLAN. Im Laden muss die Kasse laufen, im Café das Kartenterminal. Fällt das Netz aus, merkt man es sofort.',
  problems:['Gäste beschweren sich über langsames oder abbrechendes WLAN','Gäste-WLAN und Kasse hängen im selben Netz','Mehrere Ferienwohnungen, aber nur ein Anschluss','Ausfälle fallen erst auf, wenn Gäste anrufen'],
  solutions:['Gäste-WLAN getrennt vom eigenen Netz, mit eigenem Zugang je Wohnung','Mesh oder Zugangspunkte für Haus und Garten','Überwachung der Internetleitung mit Meldung bei Ausfall','Einfache Anleitung für Gäste mit QR-Code'],
  note:'Gerade bei Ferienwohnungen lohnt sich die Überwachung: Sie erfahren von einem Ausfall, bevor der Gast anruft.',
  plan:'netz-basis'},
];

// Einsatzgebiet. Texte bewusst ortsbezogen, damit jede Seite eigenständig ist.
export const towns=[
 {id:'kiel',name:'Kiel',county:'Landeshauptstadt',area:'Kiel und Umgebung, etwa Kronshagen, Altenholz und Heikendorf',text:'In Kiel betreuen wir Büros, Praxen und Haushalte zwischen Innenstadt, Gaarden, Wik und dem Ostufer. Viele Altbauten mit dicken Wänden machen das WLAN schwierig: Hier hilft meist ein zweiter Zugangspunkt oder ein Mesh-System an der richtigen Stelle.',focus:['Praxen und Kanzleien','Büros mit Homeoffice','Altbau-WLAN']},
 {id:'ploen',name:'Plön',county:'Kreis Plön',area:'Plön, Ascheberg, Bösdorf und die Holsteinische Schweiz',text:'In und um Plön sind wir schnell vor Ort. Typisch sind Häuser mit mehreren Etagen, Ferienwohnungen an den Seen und kleine Betriebe, deren Netz über die Jahre gewachsen ist.',focus:['Haushalte und Senioren','Ferienwohnungen','Handwerk']},
 {id:'preetz',name:'Preetz',county:'Kreis Plön',area:'Preetz, Schellhorn, Pohnsdorf und Umgebung',text:'Zwischen Preetz und Kiel arbeiten viele Betriebe für Kunden in der Stadt. Wir richten Netzwerke, Online-Terminbuchung und Websites ein, die zu einem regionalen Betrieb passen.',focus:['Handwerk','Praxen','Senioren']},
 {id:'schwentinental',name:'Schwentinental',county:'Kreis Plön',area:'Raisdorf, Klausdorf und das Gewerbegebiet am Ostseepark',text:'Schwentinental verbindet Gewerbe und Wohnen direkt an der Kieler Stadtgrenze. Für Büros und Läden im Gewerbegebiet richten wir stabile Netze und getrennte Gäste-WLANs ein.',focus:['Büros und Handel','Gäste-WLAN','Netzwerk-Betreuung']},
 {id:'luetjenburg',name:'Lütjenburg',county:'Kreis Plön',area:'Lütjenburg, Hohwacht und die Hohwachter Bucht',text:'Rund um Lütjenburg und an der Hohwachter Bucht sind Ferienwohnungen und kleine Betriebe unsere häufigsten Kunden. Gäste erwarten WLAN bis auf die Terrasse.',focus:['Ferienwohnungen','Gastronomie','Haushalte']},
 {id:'eutin',name:'Eutin',county:'Kreis Ostholstein',area:'Eutin, Malente und die Holsteinische Schweiz',text:'In Eutin und Malente helfen wir Haushalten, Praxen und Betrieben. Ob Router-Wechsel nach einem neuen Glasfaseranschluss oder ein Netz für die Praxis: Wir richten es ein und erklären es.',focus:['Glasfaser-Umstieg','Praxen','Senioren']},
 {id:'neustadt',name:'Neustadt in Holstein',county:'Kreis Ostholstein',area:'Neustadt, Grömitz, Sierksdorf und die Lübecker Bucht',text:'An der Lübecker Bucht zählen im Sommer stabile Gäste-WLANs. Wir richten Netze für Ferienwohnungen, Hotels und Läden ein und überwachen sie, damit Ausfälle schnell auffallen.',focus:['Ferienwohnungen und Hotels','Handel','Netz-Überwachung']},
 {id:'oldenburg',name:'Oldenburg in Holstein',county:'Kreis Ostholstein',area:'Oldenburg, Heiligenhafen und der Weg nach Fehmarn',text:'In Oldenburg und Heiligenhafen betreuen wir Betriebe und Haushalte im Norden Ostholsteins. Für Fehmarn nennen wir die Anfahrt vorab, viele Fragen lösen wir per Fernhilfe ohne Anfahrt.',focus:['Handwerk','Ferienwohnungen','Fernhilfe']},
];
