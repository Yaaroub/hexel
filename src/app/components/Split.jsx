import {Fragment} from 'react';
// Überschrift, deren Wörter beim Erscheinen nacheinander aus einer Maske gleiten.
// Rein serverseitig gerendert: ohne JavaScript bleibt der Text normal sichtbar.
export default function Split({as:Tag='h2',children,className='',delay=0,accent='',...props}){
 const marked=new Set(accent.split(/\s+/).filter(Boolean));
 const text=typeof children==='string'?children:String(children??'');
 const words=text.split(/\s+/).filter(Boolean);
 return <Tag className={(className+' words').trim()} style={{'--d':delay+'ms'}} {...props}>{words.map((w,i)=><Fragment key={i}><span className={marked.has(w.replace(/[.,!?]/g,''))?'w w--accent':'w'}><span style={{'--i':i}}>{w}</span></span>{i<words.length-1?' ':null}</Fragment>)}</Tag>;
}
