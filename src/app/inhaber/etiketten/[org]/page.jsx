import Labels from './Labels';
export const metadata={title:'QR-Aufkleber | FUNKNAHT',robots:{index:false,follow:false}};
export default async function LabelsPage({params}){const {org}=await params;return <Labels org={org}/>}
