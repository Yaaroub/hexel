export function portalAccessError(request,{mutation=false,production=false,enabled=false}={}){
  if(production&&!enabled)return {status:503,error:'Die lokale Portal-Testversion ist hier nicht freigeschaltet.'};
  const url=new URL(request.url);
  // Compare the browser's Origin to Host, not Next's internal localhost URL.
  let publicUrl;
  try{publicUrl=new URL(url.protocol+'//'+(request.headers.get('host')||url.host));}
  catch{return {status:403,error:'Ungültiger lokaler Host.'};}
  if(!['localhost','127.0.0.1','[::1]','::1'].includes(publicUrl.hostname))return {status:403,error:'Die Testversion ist nur lokal erreichbar.'};
  const origin=request.headers.get('origin');
  if(mutation&&origin&&origin!==publicUrl.origin)return {status:403,error:'Diese Anfrage ist nicht erlaubt.'};
  return null;
}
