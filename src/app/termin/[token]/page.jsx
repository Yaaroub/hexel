import ManageAppointment from './ManageAppointment';
export const metadata={title:'Ihr Termin',robots:{index:false,follow:false}};
export default async function Page({params}){const {token}=await params;return <ManageAppointment token={token}/>}
