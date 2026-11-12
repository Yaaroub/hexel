import {CircleSlash,Check} from 'lucide-react';
import {scope,routers} from '../../lib/profile';
// Klare Abgrenzung: was wir machen und was nicht. Spart beiden Seiten Zeit.
export default function ScopeNote({compact=false}){
 return <div className="scope">
  <div><h3><Check size={18}/>Das machen wir</h3><ul>{scope.does.map(t=><li key={t}>{t}</li>)}</ul>{!compact&&<p className="scope__routers"><strong>Router und Firewalls:</strong> {routers.join(', ')} und weitere.</p>}</div>
  <div className="scope__not"><h3><CircleSlash size={18}/>Das machen wir nicht</h3><ul>{scope.doesNot.map(t=><li key={t}>{t}</li>)}</ul><p className="hint">Für Hardware-Reparaturen empfehlen wir einen Reparaturdienst in Ihrer Nähe. Ist das Gerät wieder heil, richten wir es gern ein.</p></div>
 </div>;
}
