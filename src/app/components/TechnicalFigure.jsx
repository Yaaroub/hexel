'use client';
import {useEffect,useRef,useState} from 'react';

export default function TechnicalFigure({paused=false}){
 const host=useRef(null),controller=useRef(null),pauseRef=useRef(paused);
 const [ready,setReady]=useState(false);
 useEffect(()=>{pauseRef.current=paused;controller.current?.()},[paused]);
 useEffect(()=>{
  let disposed=false,cleanup=()=>{};
  async function setup(){
   try{
    const T=await import('three');
    const {RoomEnvironment}=await import('three/addons/environments/RoomEnvironment.js');
    if(disposed||!host.current)return;
    const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
    renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    host.current.appendChild(renderer.domElement);
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,30);
    camera.position.set(0,0,6.5);
    const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();
    const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;
    room.dispose();pmrem.dispose();
    const key=new T.DirectionalLight('#fff6e5',2.2);key.position.set(-3,4,5);scene.add(key);
    const rim=new T.DirectionalLight('#ccb28a',1.4);rim.position.set(4,0,-2);scene.add(rim);
    scene.add(new T.AmbientLight('#ffffff',.6));
    // Three clean curved bands traced from the supplied FUNKNAHT mark.
    const top=new T.Shape();top.moveTo(365,558);top.bezierCurveTo(470,392,565,238,755,238);top.lineTo(1220,238);top.lineTo(1110,352);top.bezierCurveTo(1065,402,1010,420,935,420);top.lineTo(650,420);top.bezierCurveTo(515,420,440,480,365,558);
    const seam=new T.Shape();seam.moveTo(23,1053);seam.lineTo(75,1053);seam.lineTo(319,676);seam.bezierCurveTo(380,583,465,549,572,549);seam.lineTo(974,549);seam.lineTo(1014,494);seam.lineTo(584,494);seam.bezierCurveTo(447,494,336,550,267,660);seam.closePath();
    const lower=new T.Shape();lower.moveTo(143,1053);lower.lineTo(251,1053);lower.bezierCurveTo(311,1053,354,1025,387,976);lower.lineTo(478,837);lower.bezierCurveTo(507,796,538,778,582,778);lower.lineTo(675,778);lower.bezierCurveTo(744,778,793,747,835,687);lower.lineTo(891,611);lower.lineTo(564,611);lower.bezierCurveTo(464,611,388,657,337,736);lower.closePath();
    const geometry=new T.ExtrudeGeometry([top,seam,lower],{depth:28,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:3,bevelThickness:3,curveSegments:32});
    geometry.center();geometry.scale(.0021,-.0021,.0021);geometry.computeVertexNormals();
    const gold=new T.MeshStandardMaterial({color:'#c6a777',metalness:.68,roughness:.4});
    const edge=new T.MeshStandardMaterial({color:'#a7793e',metalness:.85,roughness:.26});
    const sculpture=new T.Group();sculpture.add(new T.Mesh(geometry,[gold,edge]));scene.add(sculpture);
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,time=0,last=0,visible=false;
    function draw(){
     sculpture.rotation.set(-.09+Math.sin(time*.7)*.055,Math.sin(time)*.19,-.025);

     renderer.render(scene,camera);
    }
    function tick(now){if(last&&now-last<32){frame=requestAnimationFrame(tick);return;}time+=last?Math.min(now-last,70)*.00023:0;last=now;draw();frame=requestAnimationFrame(tick)}
    function sync(){cancelAnimationFrame(frame);last=0;draw();if(visible&&!pauseRef.current&&!preference.matches&&document.visibilityState==='visible')frame=requestAnimationFrame(tick)}
    controller.current=sync;
    function resize(){if(!host.current)return;const {width,height}=host.current.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();draw()}
    const size=new ResizeObserver(resize);size.observe(host.current);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});observer.observe(host.current);
    preference.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
    function contextLost(event){event.preventDefault();cancelAnimationFrame(frame);setReady(false)}
    renderer.domElement.addEventListener('webglcontextlost',contextLost);
    cleanup=()=>{cancelAnimationFrame(frame);size.disconnect();observer.disconnect();preference.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);renderer.domElement.removeEventListener('webglcontextlost',contextLost);geometry.dispose();gold.dispose();edge.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();controller.current=null};
    resize();setReady(true);
   }catch{if(!disposed)setReady(false)}
  }
  setup();return()=>{disposed=true;cleanup()};
 },[]);
 return <div className={'logo-sculpture '+(ready?'is-ready':'')} aria-hidden="true"><img src="/funknaht-mark-gold.png" alt="" width="160" height="160"/><div ref={host} className="logo-sculpture-stage"/></div>;
}
