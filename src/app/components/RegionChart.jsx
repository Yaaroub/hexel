'use client';
import {useEffect,useRef,useState} from 'react';
// Positions are projected from real coordinates (WGS84) of each town.
const towns=[
 ['Plön',215,269,'hub'],['Preetz',152,217],['Heikendorf',122,120],['Schönberg',194,106],['Lütjenburg',289,175],
 ['Oldenburg i. H.',418,177],['Heiligenhafen',471,120],['Fehmarn',554,74],['Grömitz',450,277],['Neustadt i. H.',388,307],
 ['Scharbeutz',358,367],['Bad Schwartau',336,440],['Eutin',302,286],['Malente',276,262],
 ['Kiel',85,155,'ref'],['Lübeck',331,478,'ref'],
];
const [HX,HY]=[215,269];
const dist=(x,y)=>Math.hypot(x-HX,y-HY);
// Label placement per town: [dx, dy, anchor]
const place={Plön:[-12,22,'end'],Malente:[12,-6,'start'],Kiel:[-10,4.5,'end'],Heikendorf:[-11,4.5,'end'],Preetz:[-11,4.5,'end'],'Bad Schwartau':[-11,4.5,'end']};
export default function RegionChart(){
 const root=useRef(null),[drawn,setDrawn]=useState(false);
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){setDrawn(true);return}
  const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setDrawn(true);observer.disconnect()}},{threshold:.35});
  if(root.current)observer.observe(root.current);return()=>observer.disconnect();
 },[]);
 return <figure className={'chart'+(drawn?' is-drawn':'')} ref={root}>
  <svg viewBox="0 0 640 540" role="img" aria-labelledby="chart-title">
   <title id="chart-title">Einsatzgebiet der Netzwerkhilfe: Orte im Kreis Plön und in Ostholstein, von Heikendorf bis Fehmarn und Bad Schwartau.</title>
   <g className="grid" aria-hidden="true">{[80,160,240,320,400,480].map(y=><line key={'y'+y} x1="0" x2="640" y1={y} y2={y}/>)}{[100,220,340,460,580].map(x=><line key={'x'+x} y1="0" y2="540" x1={x} x2={x}/>)}</g>
   <text className="sea" x="530" y="215" aria-hidden="true">Ostsee</text>
   <text className="sea" x="420" y="420" style={{fontSize:15}} aria-hidden="true">Lübecker Bucht</text>
   <g className="waves" aria-hidden="true">{[90,180,270,360].map((r,i)=><circle key={r} cx={HX} cy={HY} r={r} style={{transitionDelay:drawn?i*.35+'s':'0s'}}/>)}</g>
   {towns.map(([name,x,y,kind])=>{const [dx,dy,anchor]=place[name]||[11,4.5,'start'];return <g key={name} className={'town'+(kind?' is-'+kind:'')} style={{transitionDelay:drawn?(kind==='hub'?0:.2+dist(x,y)/360*1.4)+'s':'0s'}}>
    <circle cx={x} cy={y} r={kind==='hub'?7:kind==='ref'?3.5:5}/>
    <text x={x+dx} y={y+dy} textAnchor={anchor} style={kind==='hub'?{fontWeight:700}:undefined}>{name}</text>
   </g>})}
  </svg>
 </figure>;
}
