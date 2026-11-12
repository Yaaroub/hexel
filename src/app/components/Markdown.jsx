// Kleine, sichere Markdown-Darstellung für KI-Antworten: Absätze, Listen, Tabellen, fett, Code, Links.
// Kein HTML aus der Antwort wird übernommen; Links nur mit https oder auf die eigene Seite.
import {Fragment} from 'react';

function inline(text,key=''){
 const out=[];let rest=String(text),i=0;
 const re=/(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(((?:https:\/\/|\/)[^)\s]+)\)|(https:\/\/[^\s)]+))/;
 while(rest){
  const m=rest.match(re);
  if(!m){out.push(rest);break}
  if(m.index)out.push(rest.slice(0,m.index));
  const k=key+'-'+i++;
  if(m[2])out.push(<strong key={k}>{m[2]}</strong>);
  else if(m[3])out.push(<code key={k}>{m[3]}</code>);
  else if(m[4])out.push(<a key={k} href={m[5]} target={m[5].startsWith('/')?undefined:'_blank'} rel="noopener noreferrer">{m[4]}</a>);
  else out.push(<a key={k} href={m[6]} target="_blank" rel="noopener noreferrer">{m[6].replace(/^https:\/\//,'').slice(0,48)}</a>);
  rest=rest.slice(m.index+m[0].length);
 }
 return out;
}
const cells=l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());

export default function Markdown({text}){
 const lines=String(text||'').replace(/\r/g,'').split('\n'),blocks=[];
 for(let i=0;i<lines.length;){
  const l=lines[i];
  if(!l.trim()){i++;continue}
  if(/^```/.test(l)){const code=[];i++;while(i<lines.length&&!/^```/.test(lines[i]))code.push(lines[i++]);i++;blocks.push(<pre key={blocks.length} tabIndex={0}><code>{code.join('\n')}</code></pre>);continue}
  if(/^\s*\|.*\|\s*$/.test(l)&&/^\s*\|?\s*:?-{2,}/.test(lines[i+1]||'')){
   const head=cells(l),rows=[];i+=2;while(i<lines.length&&/^\s*\|.*\|\s*$/.test(lines[i]))rows.push(cells(lines[i++]));
   blocks.push(<div className="md-table" key={blocks.length} tabIndex={0} role="region" aria-label="Tabelle"><table><thead><tr>{head.map((h,j)=><th key={j} scope="col">{inline(h,'h'+j)}</th>)}</tr></thead><tbody>{rows.map((r,k)=><tr key={k}>{r.map((c,j)=><td key={j}>{inline(c,k+'c'+j)}</td>)}</tr>)}</tbody></table></div>);continue}
  const h=l.match(/^#{1,4}\s+(.*)/);if(h){blocks.push(<p key={blocks.length} className="md-h"><strong>{inline(h[1])}</strong></p>);i++;continue}
  if(/^\s*([-*•]|\d+[.)])\s+/.test(l)){
   const ordered=/^\s*\d/.test(l),items=[];
   while(i<lines.length&&/^\s*([-*•]|\d+[.)])\s+/.test(lines[i]))items.push(lines[i++].replace(/^\s*([-*•]|\d+[.)])\s+/,''));
   const List=ordered?'ol':'ul';blocks.push(<List key={blocks.length}>{items.map((t,j)=><li key={j}>{inline(t,'l'+j)}</li>)}</List>);continue}
  const para=[];while(i<lines.length&&lines[i].trim()&&!/^```|^\s*([-*•]|\d+[.)])\s+|^#{1,4}\s/.test(lines[i])&&!/^\s*\|.*\|\s*$/.test(lines[i]))para.push(lines[i++]);
  if(!para.length)para.push(lines[i++]);
  blocks.push(<p key={blocks.length}>{para.map((p,j)=><Fragment key={j}>{j>0&&<br/>}{inline(p,'p'+j)}</Fragment>)}</p>);
 }
 return <div className="md">{blocks}</div>;
}
