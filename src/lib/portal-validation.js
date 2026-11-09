export const ticketStatuses=['offen','in-pruefung','geloest'];
const categoryIds=['internet-wlan','drucker','computer-software','website','projekt','automatisierung','betrug'];
const limits={description:4000,device:180,name:120,email:254,location:150};
export function validateTicket(input){
  if(!input||typeof input!=='object'||Array.isArray(input))return {error:'Bitte prüfen Sie die Angaben.'};
  const value={};
  for(const [field,max] of Object.entries(limits)){
    const raw=input[field]??'';
    if(typeof raw!=='string'||raw.length>max)return {error:'Bitte prüfen Sie die Länge Ihrer Angaben.'};
    value[field]=raw.trim();
  }
  if(!['problem','project','check'].includes(input.kind)||!categoryIds.includes(input.category))return {error:'Bitte wählen Sie ein Anliegen und einen Bereich.'};
  if(value.description.length<10||value.name.length<2||/[\r\n]/.test(value.name)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))return {error:'Name, gültige E-Mail und eine Beschreibung mit mindestens 10 Zeichen fehlen.'};
  const attempts=input.attempts??[];
  if(!Array.isArray(attempts)||attempts.length>20||attempts.some(item=>!item||typeof item.stepId!=='string'||item.stepId.length>100||!['not-resolved','resolved'].includes(item.result)))return {error:'Die Prüfschritte konnten nicht übernommen werden.'};
  return {value:{...value,kind:input.kind,category:input.category,attempts:attempts.map(({stepId,result})=>({stepId,result}))}};
}
