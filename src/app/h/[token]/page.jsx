import {redirect} from 'next/navigation';
// Kurzer Link hinter dem QR-Aufkleber am Gerät.
export const dynamic='force-dynamic';
export default async function QrRedirect({params}){const {token}=await params;redirect('/portal?geraet='+encodeURIComponent(String(token).slice(0,24)))}
