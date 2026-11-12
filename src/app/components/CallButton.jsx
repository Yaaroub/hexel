'use client';
import {usePathname} from 'next/navigation';
import {Phone} from 'lucide-react';
// Anruf-Knopf am Handy auf den öffentlichen Seiten. Erscheint nur, wenn eine Telefonnummer hinterlegt ist.
export default function CallButton({phone}){
 const path=usePathname()||'';
 if(!phone||['/inhaber','/betrieb','/portal','/buchen','/konto','/termin','/beleg','/einladung'].some(p=>path.startsWith(p)))return null;
 return <a className="callfab" href={'tel:'+phone.replace(/[^+\d]/g,'')} aria-label={'Anrufen: '+phone}><Phone size={20}/><span>Anrufen</span></a>;
}
