'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
// One observer for every element marked with .reveal. Content stays visible without JS.
export default function Motion(){
 const pathname=usePathname();
 useEffect(()=>{
  const items=[...document.querySelectorAll('.reveal:not(.is-visible)')];
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){items.forEach(el=>el.classList.add('is-visible'));return}
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}},{rootMargin:'0px 0px -8% 0px',threshold:.12});
  items.forEach(el=>observer.observe(el));
  return()=>observer.disconnect();
 },[pathname]);
 return null;
}
