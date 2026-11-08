// Browser-side measurements for the help portal. Only talks to our own server.
function browserInfo(){
 const ua=navigator.userAgent;
 const browser=/Edg\//.test(ua)?'Edge':/OPR\//.test(ua)?'Opera':/Firefox\//.test(ua)?'Firefox':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'Unbekannt';
 const version=(ua.match(/(?:Edg|OPR|Firefox|Chrome|Version)\/(\d+)/)||[])[1];
 const os=/Windows NT 10/.test(ua)?'Windows 10/11':/Windows/.test(ua)?'Windows':/iPhone|iPad/.test(ua)?'iOS / iPadOS':/Mac OS X/.test(ua)?'macOS':/Android/.test(ua)?'Android':/Linux/.test(ua)?'Linux':'Unbekannt';
 const device=/Mobi|iPhone|Android.+Mobile/.test(ua)?'Smartphone':/iPad|Tablet|Android/.test(ua)?'Tablet':'Computer';
 return {browser:version?browser+' '+version:browser,os,device,screen:screen.width+'×'+screen.height,language:navigator.language,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone};
}
export async function runDiagnostics(onProgress=()=>{}){
 const result={online:navigator.onLine,...browserInfo(),measuredAt:new Date().toISOString()};
 const c=navigator.connection;if(c){if(c.effectiveType)result.effectiveType=c.effectiveType;if(c.downlink)result.downlinkMbps=c.downlink;if(c.rtt)result.rttMs=c.rtt}
 try{onProgress('Antwortzeit wird gemessen …');const times=[];for(let i=0;i<4;i++){const t=performance.now();await fetch('/api/diagnostics/ping?'+i,{cache:'no-store'});times.push(performance.now()-t)}times.sort((a,b)=>a-b);result.serverLatencyMs=Math.round(times[1])}catch{result.online=false}
 try{onProgress('Download wird gemessen …');const t=performance.now();const r=await fetch('/api/diagnostics/download',{cache:'no-store'});const b=await r.arrayBuffer();const s=(performance.now()-t)/1000;if(r.ok&&s>0)result.downloadMbps=Math.round(b.byteLength*8/s/1e5)/10}catch{}
 return result;
}
export function describeDiagnostics(d){
 if(!d)return [];
 return [
  ['Gerät',[d.device,d.os].filter(Boolean).join(', ')],['Browser',d.browser],
  ['Antwortzeit zum Server',d.serverLatencyMs!=null?d.serverLatencyMs+' ms':null],
  ['Download (grob)',d.downloadMbps!=null?d.downloadMbps.toLocaleString('de-DE')+' Mbit/s':null],
  ['Verbindungstyp laut Browser',d.effectiveType?d.effectiveType.toUpperCase()+(d.downlinkMbps?' · ca. '+d.downlinkMbps+' Mbit/s':''):null],
  ['Bildschirm',d.screen],['Sprache / Zeitzone',[d.language,d.timezone].filter(Boolean).join(' · ')],
 ].filter(([,v])=>v);
}
