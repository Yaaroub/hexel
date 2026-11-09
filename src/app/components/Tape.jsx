// Genähtes Laufband mit allem, was FUNKNAHT macht. Zweimal derselbe Satz, damit die Schleife nahtlos ist.
const words=['Websites','Webanwendungen','WLAN und Netzwerke','Online-Terminbuchung','Digitalhilfe für Senioren','Automatisierung','Hilfe-Portal','Kreis Plön und Ostholstein'];
export default function Tape(){
 const set=k=><div className="tape__set" key={k}>{words.map(w=><span key={w} style={{display:'contents'}}><span>{w}</span><i/></span>)}</div>;
 return <div className="tape" aria-hidden="true"><div className="tape__track" data-play="">{set(0)}{set(1)}</div></div>;
}
