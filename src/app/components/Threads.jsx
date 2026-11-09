// Hintergrund für dunkle Bühnen: drei Messingnähte, auf denen je ein Lichtpunkt entlangläuft.
const paths=[
 'M-40 620 C 220 520, 380 700, 640 600 S 1060 380, 1480 470',
 'M-40 180 C 260 260, 420 80, 720 170 S 1180 330, 1480 210',
 'M200 860 C 360 640, 620 760, 860 560 S 1240 300, 1480 120',
];
export default function Threads({className=''}){
 return <svg className={'threads '+className} viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-play="">
  {paths.map((d,i)=><path key={'t'+i} className="t-draw" d={d} vectorEffect="non-scaling-stroke"/>)}
  {paths.map((d,i)=><path key={'c'+i} className="comet" d={d} pathLength="1000" style={{'--delay':i*-4.5+'s','--dur':12+i*4+'s'}}/>)}
 </svg>;
}
