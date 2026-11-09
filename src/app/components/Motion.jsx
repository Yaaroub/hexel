'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
// Ein gemeinsamer Taktgeber für alle Bewegungen der Seite:
// - .reveal und .words erscheinen, sobald sie ins Bild kommen (auch nachträglich geladene Elemente)
// - --scroll (0–1) auf <html> treibt die Naht unter der Kopfzeile
// - [data-parallax] verschiebt Bilder leicht gegen die Scrollrichtung
// - .glow folgt dem Mauszeiger (nur Desktop)
// Bei „Bewegung reduzieren“ wird alles sofort sichtbar und steht still.
export default function Motion(){
 const pathname=usePathname();
 useEffect(()=>{
  const root=document.documentElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pick=()=>[...document.querySelectorAll('.reveal:not(.is-visible),.words:not(.is-visible),[data-play]:not(.is-visible)')];
  if(reduce||!('IntersectionObserver' in window)){pick().forEach(el=>el.classList.add('is-visible'));root.style.setProperty('--scroll','0');return}
  const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}},{rootMargin:'0px 0px -8% 0px',threshold:.12});
  const observe=()=>pick().forEach(el=>io.observe(el));observe();
  // Inhalte, die erst nach dem Laden erscheinen (Portal, Verwaltung), ebenfalls erfassen.
  let pending=0;const mo=new MutationObserver(()=>{if(!pending)pending=requestAnimationFrame(()=>{pending=0;observe()})});
  mo.observe(document.body,{childList:true,subtree:true});
  let frame=0;const para=()=>[...document.querySelectorAll('[data-parallax]')];
  function tick(){frame=0;const max=root.scrollHeight-innerHeight;root.style.setProperty('--scroll',max>0?(scrollY/max).toFixed(4):'0');
   for(const el of para()){const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)continue;const k=Number(el.dataset.parallax)||.08;const off=(r.top+r.height/2-innerHeight/2)*-k;el.style.setProperty('--py',off.toFixed(1)+'px')}}
  const onScroll=()=>{if(!frame)frame=requestAnimationFrame(tick)};tick();
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
  const fine=matchMedia('(pointer:fine)').matches;
  const onMove=e=>{const g=e.target.closest?.('.glow');if(!g)return;const r=g.getBoundingClientRect();g.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');g.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')};
  if(fine)addEventListener('pointermove',onMove,{passive:true});
  return()=>{io.disconnect();mo.disconnect();removeEventListener('scroll',onScroll);removeEventListener('resize',onScroll);removeEventListener('pointermove',onMove);cancelAnimationFrame(frame);cancelAnimationFrame(pending)};
 },[pathname]);
 return null;
}
