'use client';
import {useEffect,useRef,useState} from 'react';
import {SlidersHorizontal,Sun,Moon,Check} from 'lucide-react';
// Eine Taste für Darstellung statt zwei: Schriftgröße und hell/dunkel an einem Ort.
const sizes=[[100,'Normal'],[115,'Größer'],[130,'Sehr groß']];
export default function ViewMenu(){
 const [open,setOpen]=useState(false),[size,setSize]=useState(100),[dark,setDark]=useState(false),root=useRef(null);
 useEffect(()=>{setSize(Number(document.documentElement.dataset.text||100));setDark(document.documentElement.dataset.theme==='dark')},[]);
 useEffect(()=>{if(!open)return;const close=e=>{if(!root.current?.contains(e.target))setOpen(false)};const key=e=>{if(e.key==='Escape')setOpen(false)};document.addEventListener('pointerdown',close);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key)}},[open]);
 function pickSize(v){setSize(v);document.documentElement.dataset.text=String(v);document.documentElement.style.fontSize=v+'%';try{localStorage.setItem('funknaht-text',String(v))}catch{}}
 function pickTheme(d){setDark(d);document.documentElement.dataset.theme=d?'dark':'light';try{localStorage.setItem('funknaht-theme',d?'dark':'light')}catch{}}
 return <div className="viewmenu" ref={root}>
  <button className="icon-btn" aria-expanded={open} aria-haspopup="true" aria-label="Darstellung: Schriftgröße und hell oder dunkel" title="Darstellung" onClick={()=>setOpen(o=>!o)}><SlidersHorizontal size={18}/></button>
  {open&&<div className="viewmenu__pop" role="group" aria-label="Darstellung">
   <p>Schriftgröße</p>
   <div className="viewmenu__row">{sizes.map(([v,l],i)=><button key={v} aria-pressed={size===v} onClick={()=>pickSize(v)} style={{fontSize:(.9+i*.14)+'rem'}}>A<span className="sr-only"> {l}</span></button>)}</div>
   <p>Darstellung</p>
   <div className="viewmenu__row"><button aria-pressed={!dark} onClick={()=>pickTheme(false)}><Sun size={16}/>Hell</button><button aria-pressed={dark} onClick={()=>pickTheme(true)}><Moon size={16}/>Dunkel</button></div>
  </div>}
 </div>;
}
