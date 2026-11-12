import {company} from '../../lib/company';
// Anbieterangabe für Rechtstexte. Fehlende Werte werden sichtbar markiert statt erfunden.
export const gap=t=><mark className="gap">[{t} fehlt]</mark>;
export default function Who(){return <>FUNKNAHT, Inhaber {company.owner||gap('Name')}, {company.street||gap('Straße')}, {company.city||gap('PLZ und Ort')}{company.email?<>, E-Mail {company.email}</>:null}{company.phone?<>, Telefon {company.phone}</>:null}</>}
