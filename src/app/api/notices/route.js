import {activeNotices} from '../../../lib/notices';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export function GET(){try{return Response.json({notices:activeNotices()},{headers:{'Cache-Control':'public, max-age=60'}})}catch{return Response.json({notices:[]})}}
