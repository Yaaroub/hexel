import {PHASE_DEVELOPMENT_SERVER} from 'next/constants.js';

const securityHeaders=[
 {key:'X-Content-Type-Options',value:'nosniff'},
 {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
 {key:'X-Frame-Options',value:'DENY'},
 {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), interest-cohort=()'},
];

const nextConfig={
 devIndicators:false,
 poweredByHeader:false,
 images:{unoptimized:true},
 async headers(){return [{source:'/:path*',headers:securityHeaders}]},
};

// Keep development output separate from production builds.
export default phase=>({...nextConfig,distDir:phase===PHASE_DEVELOPMENT_SERVER?'.next-dev':'.next'});
