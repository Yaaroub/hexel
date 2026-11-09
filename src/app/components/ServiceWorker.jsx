'use client';
import {useEffect} from 'react';
// Macht die Seite auf dem Handy installierbar und zeigt ohne Netz eine freundliche Hinweisseite.
export default function ServiceWorker(){useEffect(()=>{if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('/sw.js').catch(()=>{})},[]);return null}
