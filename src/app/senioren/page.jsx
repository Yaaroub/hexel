import Link from 'next/link';
import {ArrowRight,Phone,Smartphone,Landmark,Video,ShieldAlert,HeartPulse,TrainFront,Image as ImageIcon,Tv,Plus,KeyRound,HandCoins,UserRound,Receipt,Home,Headset,Users} from 'lucide-react';
import ProcessSteps from '../components/ProcessSteps';
import {company} from '../../lib/company';
import {organization,pageMetadata} from '../../lib/seo';

export const metadata=pageMetadata('Digitalhilfe für Senioren im Kreis Plön und in Ostholstein | FUNKNAHT','Smartphone, Online-Banking, Videoanrufe und Schutz vor Betrug: FUNKNAHT erklärt es in Ruhe bei Ihnen zu Hause. Auch Angehörige können einen Termin anfragen.','/senioren');

const topics=[
 {icon:Smartphone,title:'Smartphone und Tablet',text:'Einrichten, Schrift vergrößern, wichtige Kontakte anlegen, Notfall-Informationen auf dem Sperrbildschirm.'},
 {icon:Landmark,title:'Online-Banking sicher nutzen',text:'Banking-App Ihrer Bank einrichten, Überweisung gemeinsam üben, Kontoauszüge abrufen. Sie tippen, wir erklären.'},
 {icon:Video,title:'Mit der Familie in Kontakt',text:'WhatsApp, Videoanrufe mit Kindern und Enkeln, Fotos schicken und Gruppen verstehen.'},
 {icon:ShieldAlert,title:'Betrug erkennen',text:'Falsche Bankanrufe, „Hallo Mama“-Nachrichten, gefälschte Paket-SMS. Und was Sie im Ernstfall tun.'},
 {icon:HeartPulse,title:'Gesundheit online',text:'E-Rezept-App, Arzttermine online buchen, die App Ihrer Krankenkasse einrichten.'},
 {icon:TrainFront,title:'Unterwegs und im Alltag',text:'Fahrplan-Apps und Deutschlandticket, Online-Einkauf, Lieferungen verfolgen.'},
 {icon:ImageIcon,title:'Fotos und E-Mail',text:'E-Mail einrichten, Fotos sichern, ordnen und zum Ausdrucken oder als Fotobuch vorbereiten.'},
 {icon:Tv,title:'Fernseher, Internet, Drucker',text:'Sender sortieren, Mediatheken nutzen, WLAN einrichten, den Drucker wieder zum Laufen bringen.'},
];
const promises=[
 [KeyRound,'Ihre Geheimzahlen bleiben Ihre','Wir fragen nie nach PIN, TAN oder Passwörtern und schreiben sie nicht auf. Sie geben sie selbst ein.'],
 [HandCoins,'Sie behalten die Kontrolle','Wir führen keine Überweisungen oder Käufe für Sie aus. Wir zeigen Ihnen, wie es geht.'],
 [UserRound,'Ein fester Ansprechpartner','Sie haben es immer mit derselben Person zu tun. Keine Hotline, keine Warteschleife.'],
 [Receipt,'Ehrlich abgerechnet','Sie wissen vorher, womit Sie rechnen müssen. Bezahlt wird per Rechnung, nicht in bar an der Tür.'],
];
const steps=[
 ['Sie melden sich','Per Telefon, Formular oder über Ihre Kinder. Sagen Sie einfach, womit Sie Hilfe möchten. Fachbegriffe sind nicht nötig.'],
 ['Wir kommen zu Ihnen','Zum vereinbarten Termin bei Ihnen zu Hause oder im Pflegeheim. Wir arbeiten mit Ihren eigenen Geräten und nehmen uns Zeit.'],
 ['Sie behalten eine Hilfe-Mappe','Die wichtigsten Schritte bekommen Sie gedruckt, mit großen Bildern. So können Sie es später allein nachmachen.'],
 ['Nachfragen ist ausdrücklich erwünscht','Wenn später etwas nicht klappt, rufen Sie an. Kleine Fragen klären wir oft schon am Telefon.'],
];
const faqs=[
 ['Was kostet ein Hausbesuch?','Abgerechnet wird nach Zeit und Anfahrt. Wir nennen Ihnen die Kosten vorher am Telefon, damit Sie keine Überraschung erleben. Für wiederkehrende Themen wie die Einrichtung eines neuen Smartphones gibt es auf Wunsch einen Festpreis.'],
 ['Muss ich ein neues Gerät kaufen?','Nein. Wir arbeiten mit dem, was Sie haben. Wenn ein neues Gerät sinnvoll ist, beraten wir Sie unabhängig und ohne Verkaufsinteresse.'],
 ['Ist Online-Banking nicht gefährlich?','Mit den richtigen Einstellungen und ein paar einfachen Regeln ist es gut beherrschbar. Wir richten die App Ihrer Bank ein und üben mit Ihnen. Ihre Geheimzahlen geben Sie dabei immer selbst ein.'],
 ['Was, wenn ich etwas wieder vergesse?','Das ist ganz normal. Dafür gibt es die Hilfe-Mappe, und Sie dürfen jederzeit nachfragen. Viele Kunden buchen lieber zwei kurze Termine als einen langen.'],
 ['Können meine Kinder den Termin für mich anfragen?','Ja, gern. Auf Wunsch geben wir Ihren Angehörigen danach eine kurze Rückmeldung, aber nur, wenn Sie damit einverstanden sind.'],
 ['Kommen Sie auch ins Pflegeheim oder betreute Wohnen?','Ja, nach Absprache mit Ihnen und der Einrichtung. Für Einrichtungen und Seniorentreffs bieten wir auch Gruppenkurse an.'],
];

export default function SeniorPage(){
 const phone=company.phone,tel=phone?'tel:'+phone.replace(/[^\d+]/g,''):null;
 const schema={'@context':'https://schema.org','@type':'Service',name:'Digitalhilfe für Senioren',serviceType:'Technikhilfe und Schulung zu Hause',provider:organization,areaServed:organization.areaServed,description:metadata.description};
 return <div className="senior">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <section className="page-head">
   <div className="wrap page-head__grid">
    <div>
     <p className="intro">Digitalhilfe für Senioren</p>
     <h1 className="display">Technik in Ruhe erklärt. Bei Ihnen zu Hause.</h1>
     <p className="lead">Smartphone, Online-Banking, Videoanrufe mit den Enkeln: Wir zeigen es Ihnen geduldig, so oft Sie möchten. Im Kreis Plön und in Ostholstein.</p>
     <div className="actions">{tel&&<a className="btn btn--light btn--big" href={tel}><Phone size={20}/>{phone}</a>}<Link className={tel?'btn btn--ghost btn--big':'btn btn--light btn--big'} href="/contact?thema=senioren">Hausbesuch anfragen<ArrowRight size={20}/></Link></div>
    </div>
    <figure className="slip slip--guide" aria-label="Beispielseite aus einer Hilfe-Mappe">
     <div className="slip__head"><span>Ihre Hilfe-Mappe · Seite 3</span><img src="/funknaht-mark.png" alt="" width="22" height="22"/></div>
     <h2 className="slip__title">So rufen Sie Ihre Enkelin per Video an</h2>
     <ol className="big-steps">
      <li><span className="num">1</span><p>Tippen Sie auf das grüne Symbol <b>WhatsApp</b>.</p></li>
      <li><span className="num">2</span><p>Tippen Sie unten auf <b>Anrufe</b>.</p></li>
      <li><span className="num">3</span><p>Wählen Sie den Namen aus.</p></li>
      <li><span className="num">4</span><p>Tippen Sie auf die <b>Kamera</b>. Fertig.</p></li>
     </ol>
     <p className="slip__note">Beispiel aus einer Hilfe-Mappe</p>
    </figure>
   </div>
  </section>

  <section className="band">
   <div className="wrap">
    <div className="section-head"><h2 className="h2 reveal">Dabei helfen wir</h2><p className="lead reveal reveal-delay-1">Sie suchen sich aus, was Ihnen wichtig ist. Wir fangen dort an, wo Sie gerade stehen.</p></div>
    <div className="topic-grid">{topics.map(({icon:Icon,title,text},i)=><article className={'topic reveal reveal-delay-'+((i%3)+1)} key={title}><span className="topic__icon"><Icon size={26} strokeWidth={1.7}/></span><h3>{title}</h3><p>{text}</p></article>)}</div>
   </div>
  </section>

  <section className="band band--night">
   <div className="wrap">
    <div className="section-head"><div><p className="intro">Unser Versprechen</p><h2 className="h2">Vertrauen ist hier das Wichtigste.</h2></div><p className="lead">Gerade beim Thema Geld und Sicherheit sollen Sie sich auf klare Regeln verlassen können.</p></div>
    <div className="promise-grid">{promises.map(([Icon,title,text])=><div className="promise" key={title}><Icon size={26} color="var(--champagne)"/><h3>{title}</h3><p>{text}</p></div>)}</div>
   </div>
  </section>

  <section className="band band--stone">
   <div className="wrap process">
    <div><p className="intro">So läuft es ab</p><h2 className="h2">Ohne Eile, ohne Fachchinesisch.</h2><p className="prose" style={{marginTop:20}}>Sie bestimmen das Tempo. Wenn Sie etwas zweimal hören möchten, erklären wir es zweimal.</p></div>
    <ProcessSteps steps={steps}/>
   </div>
  </section>

  <section className="band">
   <div className="wrap two-col">
    <div><p className="intro">Für Angehörige</p><h2 className="h2">Sie wohnen weiter weg und machen sich Sorgen?</h2></div>
    <div className="prose">
     <p>Oft machen Töchter, Söhne oder Enkel den ersten Schritt. Sie können den Termin für Ihre Eltern anfragen. Wir besprechen alles direkt mit ihnen, vor Ort und in ihrem Tempo.</p>
     <p>Auf Wunsch geben wir Ihnen danach eine kurze Rückmeldung, was eingerichtet wurde, aber nur mit dem Einverständnis Ihrer Eltern.</p>
     <div className="format-list">
      <div><Home size={22}/><span><strong>Hausbesuch</strong>Für Einrichtung und Üben mit den eigenen Geräten.</span></div>
      <div><Headset size={22}/><span><strong>Fernhilfe</strong>Für kleine Fragen zwischendurch, am Telefon oder mit Bildschirmfreigabe.</span></div>
      <div><Users size={22}/><span><strong>Gruppenkurs</strong>Für Seniorentreffs, Kirchengemeinden, Vereine und Pflegeeinrichtungen.</span></div>
     </div>
     <p style={{marginTop:22}}><Link className="link" href="/contact?thema=senioren">Termin für Eltern oder Großeltern anfragen<ArrowRight size={16}/></Link></p>
    </div>
   </div>
  </section>

  <section className="band band--stone">
   <div className="wrap two-col">
    <div><h2 className="h2">Gut zu wissen: Steuern sparen</h2></div>
    <div className="prose">
     <p>Arbeitskosten für die Reparatur und Wartung von Geräten <strong>in Ihrem Haushalt</strong>, etwa Computer oder Fernseher, können als Handwerkerleistung steuerlich begünstigt sein: 20 Prozent der Arbeits- und Fahrtkosten, höchstens 1.200 Euro im Jahr (§ 35a EStG). Voraussetzung sind eine Rechnung und die Zahlung per Überweisung.</p>
     <p>Auf unseren Rechnungen weisen wir Arbeitszeit, Anfahrt und Material deshalb getrennt aus. Ob ein Termin im Einzelfall begünstigt ist, etwa eine reine Einweisung, klärt Ihr Steuerberater oder Lohnsteuerhilfeverein.</p>
    </div>
   </div>
  </section>

  <section className="band">
   <div className="wrap faq">
    <div><h2 className="h2">Häufige Fragen</h2></div>
    <div>{faqs.map(([q,a])=><details key={q}><summary>{q}<Plus size={22}/></summary><p>{a}</p></details>)}</div>
   </div>
  </section>

  <section className="band band--night">
   <div className="wrap closing">
    <div><h2 className="display">Einfach melden.</h2><p className="lead">Erzählen Sie, womit Sie Hilfe möchten. Wir rufen zurück und vereinbaren einen Termin, der Ihnen passt.</p></div>
    <div className="actions">{tel&&<a className="btn btn--light btn--big" href={tel}><Phone size={20}/>{phone}</a>}<Link className={tel?'btn btn--ghost btn--big':'btn btn--light btn--big'} href="/contact?thema=senioren">Anfrage schreiben<ArrowRight size={20}/></Link></div>
   </div>
  </section>
 </div>;
}
