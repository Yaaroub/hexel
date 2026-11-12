import {AlertTriangle} from 'lucide-react';
// Solange LEGAL_REVIEWED nicht gesetzt ist, steht über den Rechtstexten ein deutlicher Hinweis.
export default function LegalDraft(){
 if(process.env.LEGAL_REVIEWED==='true')return null;
 return <p className="notice notice--error" role="note"><AlertTriangle size={18}/><span><strong>Entwurf.</strong> Dieser Text ist noch nicht rechtlich geprüft. Nach der Prüfung LEGAL_REVIEWED=true in der Server-Konfiguration setzen, dann verschwindet dieser Hinweis.</span></p>;
}
