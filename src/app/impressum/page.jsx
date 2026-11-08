import {company} from '../../lib/company';
export const metadata={title:'Impressum | FUNKNAHT',robots:{index:true,follow:true}};
const Gap=({children})=><span className="gap">{children}</span>;
export default function Impressum(){
 return <>
  <section className="page-head"><div className="wrap"><h1 className="display">Impressum</h1></div></section>
  <section className="band"><div className="wrap legal">
   <h2>Angaben gemäß § 5 DDG</h2>
   <p>{company.brand}<br/>{company.owner||<Gap>Vor- und Nachname des Inhabers</Gap>}<br/>{company.street||<Gap>Straße und Hausnummer</Gap>}<br/>{company.city||<Gap>PLZ und Ort</Gap>}</p>
   <h2>Kontakt</h2>
   <p>E-Mail: {company.email||<Gap>E-Mail-Adresse</Gap>}{company.phone&&<><br/>Telefon: {company.phone}</>}</p>
   {company.vatId?<><h2>Umsatzsteuer-ID</h2><p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {company.vatId}</p></>:null}
   <h2>Verantwortlich für den Inhalt</h2>
   <p>{company.owner||<Gap>Name</Gap>}, Anschrift wie oben.</p>
   <h2>Verbraucherstreitbeilegung</h2>
   <p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
  </div></section>
 </>;
}
