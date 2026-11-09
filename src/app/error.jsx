'use client';
import {useEffect} from 'react';
import Link from 'next/link';
import {RotateCcw} from 'lucide-react';
// Fängt unerwartete Fehler einer Seite ab, damit Besucher nie eine leere Seite sehen.
export default function Error({error,reset}){
 useEffect(()=>{console.error(error)},[error]);
 return <section className="band"><div className="wrap lost">
  <p className="lost__code" aria-hidden="true">Hoppla</p>
  <h1 className="h2">Hier ist gerade etwas schiefgelaufen.</h1>
  <p className="prose">Ihre Eingaben auf anderen Seiten sind nicht betroffen. Laden Sie die Seite neu. Hilft das nicht, melden Sie sich bitte bei uns{error?.digest?<> und nennen Sie den Code <code>{error.digest}</code></>:null}.</p>
  <div className="actions"><button className="btn" onClick={()=>reset()}><RotateCcw size={17}/>Noch einmal versuchen</button><Link className="link" href="/contact">Kontakt aufnehmen</Link></div>
 </div></section>;
}
