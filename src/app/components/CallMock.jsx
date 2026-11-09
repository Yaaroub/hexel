// Handy mit Videoanruf: es klingelt, Oma nimmt ab, das Gespräch läuft.
export default function CallMock(){
 return <figure className="callmock" data-play="" aria-label="Beispiel: Ein Videoanruf mit der Enkelin auf dem Smartphone">
  <div className="callmock__phone">
   <div className="callmock__screen">
    <div className="callmock__ring"><span className="callmock__avatar">L</span><strong>Lena</strong><small>Videoanruf …</small>
     <div className="callmock__btns"><span className="no">✕</span><span className="yes">✓</span></div></div>
    <div className="callmock__live"><div className="callmock__face"><span>L</span></div><div className="callmock__self"/><small className="callmock__time">00:12</small><span className="callmock__heart">♥</span></div>
   </div>
  </div>
  <figcaption>Einmal gezeigt, sicher geübt: Videoanrufe mit der Familie.</figcaption>
 </figure>;
}
