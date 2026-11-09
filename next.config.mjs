import {PHASE_DEVELOPMENT_SERVER} from 'next/constants.js';

const securityHeaders=[
 {key:'X-Content-Type-Options',value:'nosniff'},
 {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
 {key:'X-Frame-Options',value:'DENY'},
 {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), interest-cohort=()'},
 // Browser beachten HSTS nur über HTTPS; lokal (http) hat der Header keine Wirkung.
 {key:'Strict-Transport-Security',value:'max-age=31536000; includeSubDomains'},
 {key:'Cross-Origin-Opener-Policy',value:'same-origin'},
];

const nextConfig={
 devIndicators:false,
 // Zum Testen vom Handy im Heimnetz (npm run dev)
 allowedDevOrigins:['192.168.178.104'],
 poweredByHeader:false,
 images:{unoptimized:true},
 async headers(){return [{source:'/:path*',headers:securityHeaders}]},
};

// Keep development output separate from production builds.
export default phase=>({...nextConfig,distDir:phase===PHASE_DEVELOPMENT_SERVER?'.next-dev':'.next'});
