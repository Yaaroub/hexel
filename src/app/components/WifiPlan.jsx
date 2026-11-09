// Grundriss mit WLAN-Ausleuchtung: erst ein Router mit Funkloch im Büro,
// dann kommt ein zweiter Zugangspunkt dazu und das ganze Haus ist versorgt.
export default function WifiPlan(){
 return <figure className="wifi" data-play="" data-sheet="GRUNDRISS · WLAN-AUSLEUCHTUNG">
  <svg viewBox="0 0 420 300" aria-hidden="true">
   <defs>
    <radialGradient id="wg" r="0.5"><stop offset="0" stopColor="var(--fjord)" stopOpacity=".55"/><stop offset=".6" stopColor="var(--fjord)" stopOpacity=".18"/><stop offset="1" stopColor="var(--fjord)" stopOpacity="0"/></radialGradient>
    <clipPath id="house"><rect x="20" y="20" width="380" height="260" rx="6"/></clipPath>
   </defs>
   <g clipPath="url(#house)">
    <circle className="wifi__cov c1" cx="110" cy="210" r="150" fill="url(#wg)"/>
    <circle className="wifi__cov c2" cx="320" cy="90" r="150" fill="url(#wg)"/>
   </g>
   <g className="wifi__walls">
    <rect x="20" y="20" width="380" height="260" rx="6"/>
    <path d="M220 20 V120 M220 160 V280 M20 150 H120 M160 150 H220 M220 140 H400"/>
   </g>
   <text className="wifi__room" x="70" y="60">Küche</text><text className="wifi__room" x="70" y="250">Wohnzimmer</text><text className="wifi__room" x="300" y="60">Büro</text><text className="wifi__room" x="300" y="250">Flur</text>
   <g className="wifi__hole"><circle cx="330" cy="70" r="16"/><path d="M322 62 l16 16 M338 62 l-16 16"/></g>
   <g className="wifi__ap a1"><rect x="96" y="200" width="28" height="18" rx="4"/><circle cx="110" cy="209" r="2.5"/></g>
   <g className="wifi__ap a2"><rect x="306" y="80" width="28" height="18" rx="4"/><circle cx="320" cy="89" r="2.5"/></g>
  </svg>
  <figcaption><span className="wifi__state s1">Vorher: Router im Wohnzimmer, im Büro kein Empfang.</span><span className="wifi__state s2">Nachher: zweiter Zugangspunkt, überall stabil.</span></figcaption>
 </figure>;
}
