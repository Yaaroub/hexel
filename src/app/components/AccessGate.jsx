'use client';
import Link from 'next/link';
import {ShieldOff,Download,Mail,LogOut,Hourglass} from 'lucide-react';
// Meldung für Konten, die gesperrt sind, auf Freischaltung warten oder deren Nutzungszeit abgelaufen ist.
// Daten herunterladen bleibt immer möglich (DSGVO).
export default function AccessGate({message,waiting=false}){
 async function logout(){try{await fetch('/api/account/logout',{method:'POST'})}catch{}location.href='/'}
 return <div className="wrap app"><div className="lockout">
  <span className="lockout__icon">{waiting?<Hourglass size={30}/>:<ShieldOff size={30}/>}</span>
  <h1 className="h2">{waiting?'Fast geschafft.':'Ihr Zugang ist gerade nicht aktiv.'}</h1>
  <p className="lead">{message}</p>
  <div className="actions"><Link className="btn" href="/contact"><Mail size={17}/>FUNKNAHT kontaktieren</Link><a className="mini-btn" href="/api/account/export"><Download size={15}/>Meine Daten herunterladen</a><button className="link" onClick={logout}><LogOut size={15}/>Abmelden</button></div>
 </div></div>;
}
export function TrialBanner({access,onPlans}){
 if(!access?.trialActive)return null;
 const soon=access.trialDaysLeft<=3;
 return <p className={'trial-banner'+(soon?' trial-banner--soon':'')} role="status"><strong>Testphase „{access.trialPlanName}“</strong> · noch {access.trialDaysLeft===1?'1 Tag':access.trialDaysLeft+' Tage'} kostenlos{soon?'. Danach gilt der kostenlose Einstieg, Ihre Daten bleiben erhalten.':'.'} {onPlans&&<button className="link" onClick={onPlans}>Tarif wählen</button>}</p>;
}
