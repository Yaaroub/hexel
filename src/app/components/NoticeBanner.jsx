'use client';
import {useEffect,useState} from 'react';
import {AlertTriangle,Info} from 'lucide-react';
// Bekannte Störungen, gepflegt im Inhaberbereich.
export default function NoticeBanner(){
 const [notices,setNotices]=useState([]);
 useEffect(()=>{fetch('/api/notices').then(r=>r.ok?r.json():{notices:[]}).then(d=>setNotices(d.notices||[])).catch(()=>{})},[]);
 if(!notices.length)return null;
 return <div className="notices" role="region" aria-label="Aktuelle Hinweise">{notices.map(n=><div key={n.id} className={'notice-banner notice-banner--'+n.level}>{n.level==='warn'?<AlertTriangle size={20}/>:<Info size={20}/>}<div><strong>{n.title}</strong>{n.area&&<span className="notice-banner__area"> · {n.area}</span>}{n.body&&<p>{n.body}</p>}</div></div>)}</div>;
}
