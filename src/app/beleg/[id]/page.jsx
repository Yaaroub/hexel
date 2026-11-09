import DocumentView from './DocumentView';
export const metadata={title:'Beleg | FUNKNAHT',robots:{index:false,follow:false}};
export default async function Page({params}){const {id}=await params;return <DocumentView id={id}/>}
