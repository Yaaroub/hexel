// Alle Preise an einer Stelle. Hier ändern, dann stimmen Preisseite, Leistungsseiten,
// Suchmaschinen-Daten und llms.txt automatisch überein.
// Privatkunden: Endpreise (so verlangt es die Preisangabenverordnung).
// Betriebe: Nettopreise zuzüglich Umsatzsteuer.
// Hinweis: Bist du Kleinunternehmer (§ 19 UStG), fällt keine Umsatzsteuer an.
// Dann bei `business.vatNote` den Text anpassen.

export const privateRates={
 hour:59,            // € je Stunde, vor Ort oder per Fernhilfe
 step:15,            // abgerechnet im 15-Minuten-Takt
 minimum:30,         // Mindestdauer in Minuten
 travel:19,          // Anfahrtspauschale im Kerngebiet
 note:'Endpreise. Abgerechnet im 15-Minuten-Takt, mindestens 30 Minuten. Bezahlung per Rechnung.',
};
export const businessRates={
 hour:85,            // € netto je Stunde, vor Ort oder Fernwartung
 step:15,
 travel:29,          // € netto Anfahrtspauschale im Kerngebiet
 urgent:25,          // % Aufschlag für Einsätze am selben Tag außerhalb eines Abos
 vatNote:'Alle Preise für Betriebe zuzüglich gesetzlicher Umsatzsteuer.',
};
// Kerngebiet: Anfahrt pauschal. Außerhalb (z. B. Fehmarn, Heiligenhafen) nach Absprache.
export const travelNote='Anfahrt pauschal in Kiel, im Kreis Plön und in Ostholstein. Für Fehmarn und weiter entfernte Orte nennen wir den Preis vorab.';

// Abos für Haushalte und Senioren (Endpreise, monatlich kündbar)
export const privatePlans=[
 {id:'sorglos',name:'Digital-Sorglos',price:19,unit:'pro Monat',lead:'Für Haushalte und Senioren, die einen festen Ansprechpartner möchten.',features:['Betrugs-Check: verdächtige Nachrichten und Anrufe jederzeit prüfen lassen','30 Minuten Telefon- oder Fernhilfe jeden Monat inklusive','Rückruf noch am selben Werktag','Router-Überwachung: Wir sehen, wenn das Internet ausfällt','10 % weniger auf Hausbesuche'],cta:'Digital-Sorglos anfragen'},
 {id:'familie',name:'Familie',price:29,unit:'pro Monat',lead:'Wie Digital-Sorglos, für bis zu zwei Haushalte, z. B. Eltern und Kinder.',features:['Alles aus Digital-Sorglos für zwei Haushalte','60 Minuten Telefon- oder Fernhilfe im Monat, frei aufteilbar','Angehörigen-Zugang im Portal: Kinder sehen, was erledigt ist','Jährlicher Sicherheits-Check aller Geräte vor Ort (ohne Anfahrtspauschale)'],cta:'Familien-Abo anfragen',focus:true},
];

// IT- und Netzwerk-Betreuung für Betriebe (netto, monatlich kündbar nach 3 Monaten)
export const businessPlans=[
 {id:'netz-basis',name:'Netz Basis',price:49,unit:'pro Monat, netto',lead:'Für kleine Büros und Handwerksbetriebe mit einem Standort.',features:['Überwachung von Internetleitung, Website und SSL-Zertifikat','Router-Updates und Sicherung der Router-Konfiguration','Störungsmeldung per E-Mail, bevor Kunden anrufen','30 Minuten Fernwartung im Monat inklusive','Arbeitszeit darüber hinaus 10 % günstiger'],cta:'Netz Basis anfragen'},
 {id:'netz-betrieb',name:'Praxis & Betrieb',price:149,unit:'pro Monat, netto',lead:'Für Praxen, Kanzleien und Betriebe, die sich auf ihr Netz verlassen müssen.',features:['Alles aus Netz Basis','Betreuung von Router, Firewall, WLAN und Switches eines Standorts','Getrennte Netze für Praxis/Büro, Gäste und Geräte','VPN für Homeoffice oder Außendienst','2 Stunden Fernwartung im Monat inklusive','Reaktion werktags innerhalb von 4 Stunden, Anfahrt im Kerngebiet inklusive','Jährlicher Netzwerk-Check mit schriftlichem Bericht'],cta:'Praxis & Betrieb anfragen',focus:true},
 {id:'netz-individuell',name:'Individuell',price:null,priceText:'ab 299 €',unit:'pro Monat, netto',lead:'Für mehrere Standorte, Server oder besondere Anforderungen.',features:['Mehrere Standorte und Standortvernetzung','Netzwerk-Dokumentation und Notfallplan','Feste Wartungsfenster','Abstimmung mit Ihren Software- und Telefonanbietern'],cta:'Angebot anfordern'},
];

// Websites und Software: Einstiegspreise, das Angebot folgt nach dem Erstgespräch
export const projectPrices=[
 {name:'Website für Betriebe',from:1490,text:'Bis zu fünf Seiten, für Handy optimiert, mit Kontaktformular, Impressum und Datenschutz, schnell und ohne Baukasten.'},
 {name:'Website mit Online-Terminbuchung',from:1990,text:'Website plus eingebundene Buchungsseite aus dem Betriebsportal. Kunden buchen freie Zeiten selbst.'},
 {name:'Webanwendung oder Automatisierung',from:null,text:'Nach Aufwand zum Festpreis. Nach einem kostenlosen Erstgespräch erhalten Sie ein schriftliches Angebot mit klarem Umfang.'},
 {name:'Website-Pflege',from:39,monthly:true,text:'Updates, Sicherung, Überwachung und kleine Textänderungen. Pro Monat, netto.'},
];

export const euro=v=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:0}).format(v);
