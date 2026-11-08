'use client';
import {useEffect,useState} from 'react';
import {Sun,Moon} from 'lucide-react';
export default function ThemeToggle(){
 const [dark,setDark]=useState(false);
 useEffect(()=>{setDark(document.documentElement.dataset.theme==='dark')},[]);
 function toggle(){const next=!dark;setDark(next);document.documentElement.dataset.theme=next?'dark':'light';try{localStorage.setItem('funknaht-theme',next?'dark':'light')}catch{}}
 return <button className="icon-btn" onClick={toggle} aria-label={dark?'Helle Darstellung':'Dunkle Darstellung'} title={dark?'Helle Darstellung':'Dunkle Darstellung'}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>;
}
