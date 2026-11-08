'use client';
import {useEffect,useRef,useState} from 'react';
// The brass thread stitches down the timeline as the reader scrolls through it.
export default function ProcessSteps({steps}){
 const root=useRef(null),[progress,setProgress]=useState(1),[reached,setReached]=useState(steps.length);
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let frame=0;
  function update(){frame=0;const el=root.current;if(!el)return;const box=el.getBoundingClientRect(),focus=innerHeight*.62;const p=Math.min(1,Math.max(0,(focus-box.top)/box.height));setProgress(p);
   const items=[...el.querySelectorAll('.step')];setReached(items.filter(item=>item.getBoundingClientRect().top<focus).length)}
  const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update)};
  update();addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
  return()=>{removeEventListener('scroll',onScroll);removeEventListener('resize',onScroll);cancelAnimationFrame(frame)};
 },[]);
 return <ol className="steps" ref={root} style={{'--progress':progress}}>
  <span className="steps__thread" aria-hidden="true"/>
  {steps.map(([title,text],i)=><li className={'step'+(i<reached?' is-reached':'')} key={title}><span className="step__num" aria-hidden="true">{i+1}</span><h3>{title}</h3><p className="prose">{text}</p></li>)}
 </ol>;
}
