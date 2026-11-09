'use client';
import {useEffect,useState} from 'react';
// Schriftgröße für alle, die mehr Kontrast und größere Buchstaben brauchen.
const sizes=[100,115,130];
export default function TextSize(){
 const [i,setI]=useState(0);
 useEffect(()=>{const v=Number(document.documentElement.dataset.text||100);setI(Math.max(0,sizes.indexOf(v)))},[]);
 function next(){const n=(i+1)%sizes.length;setI(n);document.documentElement.dataset.text=String(sizes[n]);document.documentElement.style.fontSize=sizes[n]+'%';try{localStorage.setItem('funknaht-text',String(sizes[n]))}catch{}}
 return <button className="icon-btn text-size" onClick={next} aria-label={'Schriftgröße ändern, aktuell '+sizes[i]+' Prozent'} title="Schrift größer"><span aria-hidden="true">A<small>{i===0?'+':i===1?'++':'−'}</small></span></button>;
}
