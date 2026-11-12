import {ImageResponse} from 'next/og';
// Vorschaubild, wenn ein Link auf WhatsApp, LinkedIn oder Facebook geteilt wird.
export const alt='FUNKNAHT – Netzwerk, Software und Digitalhilfe in Kiel, im Kreis Plön und in Ostholstein';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){
 const grid='linear-gradient(#1C4B50 2px, transparent 2px), linear-gradient(90deg, #1C4B50 2px, transparent 2px)';
 return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'64px 72px',background:'#0D3539',backgroundImage:grid,backgroundSize:'48px 48px',color:'#EEF5F4',fontFamily:'sans-serif'}}>
  <div style={{display:'flex',alignItems:'center',gap:16,fontSize:30,letterSpacing:8,fontWeight:700}}>FUNKNAHT<span style={{marginLeft:'auto',fontSize:18,letterSpacing:3,color:'#D8BD8A'}}>BLATT 01 · KIEL · PLÖN · OSTHOLSTEIN</span></div>
  <div style={{display:'flex',flexDirection:'column',gap:18}}>
   <div style={{fontSize:80,fontWeight:800,lineHeight:1,letterSpacing:-2,display:'flex',flexWrap:'wrap'}}>Software, die Ihren Arbeitstag&nbsp;<span style={{color:'#D8BD8A'}}>leichter</span>&nbsp;macht.</div>
   <div style={{width:420,height:6,backgroundImage:'repeating-linear-gradient(90deg,#D8BD8A 0 16px,transparent 16px 26px)'}}/>
  </div>
  <div style={{display:'flex',gap:28,fontSize:26,color:'#A9C6C4'}}><span>Netzwerk und Router</span><span>·</span><span>Websites und Software</span><span>·</span><span>Digitalhilfe</span></div>
 </div>,size);
}
