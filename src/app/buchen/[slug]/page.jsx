import BookingClient from './BookingClient';
export const metadata={title:'Termin anfragen | FUNKNAHT',robots:{index:false,follow:false}};
export default async function BookingPage({params}){const {slug}=await params;return <BookingClient slug={slug}/>;}
