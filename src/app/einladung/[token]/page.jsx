import Invite from './Invite';
export const metadata={title:'Einladung | FUNKNAHT',robots:{index:false,follow:false}};
export default async function Page({params}){const {token}=await params;return <Invite token={token}/>}
