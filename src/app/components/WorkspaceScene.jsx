'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Pause,Play,ArrowUpRight} from 'lucide-react';
const scenes={studio:{label:'MENSCH. TECHNIK. ZUSAMMENSPIEL.',caption:'Von der Verbindung bis zur eigenen Anwendung.',link:'/projects',action:'Unsere Arbeit ansehen'},projects:{label:'AUS EIGENER ENTWICKLUNG',caption:'Pro Manager & Rental. Echte Oberflächen, eigene Entwicklung.',link:'#projektarchiv',action:'Projekte im Detail'},network:{label:'NETZWERK & WLAN',caption:'Geräte, Arbeitsplätze und Menschen verbinden.',link:'/contact?thema=Netzwerkhilfe',action:'Netzwerkhilfe anfragen'},contact:{label:'DER ANFANG IST EIN GESPRÄCH',caption:'Ihre Aufgabe. Gemeinsam klarer sehen.',link:'#anfrage',action:'Zum Kontaktformular'}};
export default function WorkspaceScene({variant='studio'}){
 const root=useRef(null);const [active,setActive]=useState(false);
 useEffect(()=>{let inView=false;const update=()=>setActive(inView&&document.visibilityState==='visible');const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;update()});if(root.current)observer.observe(root.current);document.addEventListener('visibilitychange',update);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update)}},[]);
 const [paused,setPaused]=useState(false);const id=useId().replace(/:/g,'');const s=scenes[variant]||scenes.studio;
 const paint=name=>`url(#${id}-${name})`;
 return <figure ref={root} className={'workspace-scene scene-'+variant+(paused?' scene-paused':'')+(!active?' scene-idle':'')}>
  <div className="scene-heading"><span>{s.label}</span><button type="button" onClick={()=>setPaused(!paused)} aria-pressed={paused} aria-label={paused?'Illustration abspielen':'Illustration pausieren'}>{paused?<Play size={14}/>:<Pause size={14}/>}</button></div>
  <svg className="workspace-art" viewBox="0 0 900 680" role="img" aria-label={variant==='network'?'Illustration eines Arbeitsplatzes mit verbundenen Netzwerkgeräten':'Illustration einer Person am Arbeitsplatz, umgeben von Ansichten der FUNKNAHT-Projekte'}>
   <defs>
    <linearGradient id={id+'-desk'} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#b8a180"/><stop offset="1" stopColor="#74654f"/></linearGradient>
    <linearGradient id={id+'-screen'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#465047"/><stop offset="1" stopColor="#1e2723"/></linearGradient>
    <linearGradient id={id+'-jacket'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a58c65"/><stop offset=".55" stopColor="#73664f"/><stop offset="1" stopColor="#464b40"/></linearGradient>
    <linearGradient id={id+'-chair'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#596359"/><stop offset="1" stopColor="#252d28"/></linearGradient>
    <radialGradient id={id+'-glow'}><stop stopColor="#b69a6c" stopOpacity=".18"/><stop offset="1" stopColor="#b69a6c" stopOpacity="0"/></radialGradient>
    <filter id={id+'-shadow'} x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="13" stdDeviation="12" floodColor="#101b13" floodOpacity=".16"/></filter>
    <clipPath id={id+'-main'}><rect x="314" y="285" width="284" height="159" rx="3"/></clipPath>
    <clipPath id={id+'-pro'}><rect x="78" y="103" width="268" height="151" rx="5"/></clipPath>
    <clipPath id={id+'-rental'}><rect x="566" y="166" width="252" height="142" rx="5"/></clipPath>
   </defs>
   <ellipse cx="450" cy="310" rx="430" ry="300" fill={paint('glow')}/>
   <g className="scene-connections" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M215 265 C215 315 280 260 338 311 M686 318 C686 375 635 345 570 370 M460 109 V265 M165 382 C210 405 245 415 310 402"/><circle cx="215" cy="265" r="4"/><circle cx="686" cy="318" r="4"/></g>
   <g className="scene-data" fill="none" stroke="#b99b68" strokeWidth="2.5" strokeDasharray="3 140"><path d="M215 265 C215 315 280 260 338 311 M686 318 C686 375 635 345 570 370 M460 109 V265"/></g>
   <g className="scene-panel scene-panel-a">
    <rect x="67" y="75" width="290" height="192" rx="9" fill={paint('screen')} filter={paint('shadow')}/><circle cx="82" cy="89" r="2" fill="#c8ad7f"/><text x="95" y="93" fill="#e8dfcf" fontSize="8" letterSpacing="1.5">{variant==='network'?'VERBINDUNGEN':'PRO MANAGER'}</text>
    {variant==='network'?<g fill="none" stroke="#d3bd96" strokeWidth="2"><path d="M210 132 V170 M125 208 V170 H295 V208 M210 170 V208"/><rect x="190" y="115" width="40" height="25" rx="4"/><rect x="107" y="208" width="36" height="24" rx="3"/><rect x="192" y="208" width="36" height="24" rx="3"/><rect x="277" y="208" width="36" height="24" rx="3"/></g>:<image href="/images/pro-manager/dashboard.png" x="78" y="103" width="268" height="151" preserveAspectRatio="xMidYMin slice" clipPath={paint('pro')}/>}
   </g>
   <g className="scene-panel scene-panel-b">
    <rect x="555" y="137" width="274" height="184" rx="9" fill={paint('screen')} filter={paint('shadow')}/><text x="573" y="155" fill="#e8dfcf" fontSize="8" letterSpacing="1.5">{variant==='network'?'WLAN & GERÄTE':'RENTAL'}</text>
    {variant==='network'?<g fill="none" stroke="#d3bd96" strokeWidth="2"><path d="M648 213 Q692 172 736 213 M662 227 Q692 199 722 227 M679 240 Q692 228 705 240"/><circle cx="692" cy="253" r="3" fill="#d3bd96"/><path d="M602 283 H782" opacity=".3"/></g>:<image href="/images/rental/finder.png" x="566" y="166" width="252" height="142" preserveAspectRatio="xMidYMin slice" clipPath={paint('rental')}/>}
   </g>
   <g className="scene-panel scene-panel-c"><rect x="414" y="39" width="90" height="87" rx="18" fill={paint('screen')} stroke="#b1976c" strokeOpacity=".4"/><image href="/funknaht-mark-gold.png" x="426" y="49" width="66" height="66"/></g>
   <ellipse cx="456" cy="617" rx="265" ry="28" fill="#17231b" opacity=".09"/>
   <path d="M191 478 L218 606 M705 478 L681 606" stroke="#687164" strokeWidth="12"/>
   <path d="M155 464 L676 446 L755 478 L218 504 Z" fill={paint('desk')}/><path d="M218 504 L755 478 V488 L218 514 L155 474 V464 Z" fill="#76654c"/>
   <path d="M437 433 V469 L400 477 H514 L477 467 V432" fill="#72786a"/>
   <rect x="302" y="270" width="308" height="188" rx="10" fill="#28352e" stroke="#687367" strokeWidth="2" filter={paint('shadow')}/>
   <image href={variant==='projects'?'/images/pro-manager/tasks.png':'/images/pro-manager/dashboard.png'} x="314" y="285" width="284" height="159" preserveAspectRatio="xMidYMin slice" clipPath={paint('main')}/>
   <path d="M352 482 L512 478 L530 490 L368 495 Z" fill="#d0c8b4"/><path d="M371 485 L492 482 M379 489 L500 486" stroke="#777c6f" strokeWidth="2"/>
   <ellipse cx="571" cy="485" rx="13" ry="7" fill="#b4b6a6"/>
   <g><path d="M643 449 V416 Q643 410 649 410 H668 Q674 410 674 416 V449 Z" fill="#d4c4a5"/><path d="M674 418 Q695 415 688 433 Q684 440 674 437" fill="none" stroke="#c2b18f" strokeWidth="5"/></g>
   <g className="scene-person">
    <path d="M391 540 L396 608 L430 617 L437 554 M469 550 L486 609 L521 611 L503 534" fill="#303b34"/>
    <path d="M395 607 Q412 602 433 615 L435 623 H390 Z M485 606 Q509 602 529 615 V621 H483 Z" fill="#202b25"/>
    <path d="M397 423 Q364 430 346 478 L380 496 L408 468 M475 426 Q502 430 531 474 L508 489 L476 462" fill={paint('jacket')}/>
    <path d="M350 474 Q363 462 391 477 L409 489 L384 498 L350 488 M511 474 L540 471 Q551 471 552 481 L523 492 L509 487" fill="#c3a57e"/>
    <path d="M413 405 L408 432 L464 437 L459 402" fill="#ae8d66"/>
    <path d="M406 429 Q437 415 473 431 Q491 475 486 542 L382 542 Q380 478 406 429" fill={paint('jacket')}/>
    <path d="M408 380 Q401 347 428 340 Q460 328 475 355 L472 391 Q465 417 443 417 Q419 416 408 393 Z" fill="#455047"/>
    <path d="M408 385 Q390 358 409 339 Q433 320 456 332 Q485 331 481 359 L469 378 L459 358 Q438 369 417 360 L420 388 Z" fill="#354138"/>
    <path d="M386 473 Q433 451 481 477 L490 551 Q441 575 386 551 Z" fill={paint('chair')} stroke="#87907e" strokeWidth="2"/>
    <path d="M435 563 V608 M435 598 L388 618 M435 598 L477 622" stroke="#6e7969" strokeWidth="7"/><circle cx="386" cy="620" r="7" fill="#303b34"/><circle cx="478" cy="622" r="7" fill="#303b34"/>
   </g>
   <g fill="none" stroke="#77856e" strokeWidth="3"><path d="M131 549 V447 M131 500 Q97 469 102 440 Q133 458 131 500 M132 479 Q164 455 163 428 Q139 440 132 479"/></g><path d="M111 529 H151 L144 563 H118 Z" fill="#8c917c"/>
   <g className="scene-small-node"><rect x="126" y="342" width="76" height="51" rx="8" fill={paint('screen')} stroke="#baa580" strokeOpacity=".3"/>{variant==='contact'?<path d="M142 356 H186 V380 H142 Z M142 356 L164 370 L186 356" fill="none" stroke="#d3bd96" strokeWidth="1.5"/>:<g fill="none" stroke="#d3bd96" strokeWidth="1.5"><path d="M149 357 L140 367 L149 377 M179 357 L188 367 L179 377 M168 352 L160 382"/></g>}</g>
  </svg>
  <figcaption><p>{s.caption}</p><a className="text-link" href={s.link}>{s.action}<ArrowUpRight size={15}/></a></figcaption>
 </figure>;
}
