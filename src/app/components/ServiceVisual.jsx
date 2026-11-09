// Kleine, laufende Erklärgrafiken zu den drei Leistungen. Reines SVG mit CSS-Animation.
function Software(){
 return <svg viewBox="0 0 360 200" className="sv sv--software" aria-hidden="true">
  <rect className="sv-frame" x="20" y="16" width="320" height="168" rx="12"/>
  <rect className="sv-bar" x="20" y="16" width="320" height="26" rx="12"/>
  <circle className="sv-dot" cx="38" cy="29" r="4"/><circle className="sv-dot" cx="52" cy="29" r="4"/><circle className="sv-dot" cx="66" cy="29" r="4"/>
  <rect className="sv-block b1" x="38" y="58" width="86" height="108" rx="8"/>
  <rect className="sv-block b2" x="138" y="58" width="184" height="30" rx="7"/>
  <rect className="sv-block b3" x="138" y="98" width="88" height="68" rx="7"/>
  <rect className="sv-block b4" x="234" y="98" width="88" height="68" rx="7"/>
  <rect className="sv-line l1" x="50" y="74" width="54" height="6" rx="3"/><rect className="sv-line l2" x="50" y="90" width="40" height="6" rx="3"/><rect className="sv-line l3" x="50" y="106" width="48" height="6" rx="3"/>
  <path className="sv-cursor" d="M0 0 L0 17 L5 12 L9 20 L12 19 L8 11 L15 11 Z"/>
 </svg>;
}
function Network(){
 const devices=[[60,50],[300,46],[46,160],[312,154],[180,182]];
 return <svg viewBox="0 0 360 210" className="sv sv--network" aria-hidden="true">
  <circle className="sv-wave w1" cx="180" cy="104" r="30"/><circle className="sv-wave w2" cx="180" cy="104" r="30"/><circle className="sv-wave w3" cx="180" cy="104" r="30"/>
  {devices.map(([x,y],i)=><path key={'l'+i} className="sv-link" d={`M180 104 L${x} ${y}`}/>)}
  {devices.map(([x,y],i)=><circle key={'p'+i} className="sv-packet" r="3.5" style={{'--x':x-180+'px','--y':y-104+'px','--i':i}} cx="180" cy="104"/>)}
  <rect className="sv-router" x="154" y="88" width="52" height="32" rx="8"/>
  <path className="sv-antenna" d="M166 88 L160 72 M194 88 L200 72"/>
  {devices.map(([x,y],i)=><rect key={'d'+i} className="sv-device" x={x-14} y={y-10} width="28" height="20" rx="5" style={{'--i':i}}/>)}
 </svg>;
}
function Automation(){
 return <svg viewBox="0 0 360 200" className="sv sv--auto" aria-hidden="true">
  <path className="sv-flow" d="M70 100 H150 M210 100 H290"/>
  <path className="sv-flow-run" d="M70 100 H290" pathLength="100"/>
  <g className="sv-node n1"><rect x="20" y="70" width="60" height="60" rx="14"/><path d="M34 88 h32 v24 h-32 z M34 88 l16 12 l16 -12"/></g>
  <g className="sv-node n2"><rect x="150" y="70" width="60" height="60" rx="30"/><path d="M168 100 l8 8 l16 -16"/></g>
  <g className="sv-node n3"><rect x="280" y="70" width="60" height="60" rx="14"/><path d="M296 86 h28 M296 98 h28 M296 110 h18"/></g>
  <text x="50" y="156" className="sv-label">Anfrage</text><text x="180" y="156" className="sv-label">geprüft</text><text x="310" y="156" className="sv-label">Rechnung</text>
  <circle className="sv-token" r="6" cx="70" cy="100"/>
 </svg>;
}
const map={software:Software,it:Network,ki:Automation};
const sheets={software:'ABB. 1 · OBERFLÄCHE',it:'ABB. 2 · NETZWERK',ki:'ABB. 3 · ABLAUF'};
export default function ServiceVisual({kind}){const C=map[kind];return C?<div className="sv-wrap" data-play="" data-sheet={sheets[kind]}><C/></div>:null}
