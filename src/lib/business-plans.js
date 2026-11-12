export const plans = [
 {id:'free',name:'Kostenloser Einstieg',priceMonthly:0,limits:{clients:0,appointmentsPerMonth:0,services:0,aiPerMonth:30},features:{clients:false,services:false,appointments:false,booking:false,orders:false,ai:true}},
 {id:'basic',name:'Basis',priceMonthly:79,limits:{clients:10,appointmentsPerMonth:20,services:10,aiPerMonth:100},features:{clients:true,services:true,appointments:true,booking:true,orders:false,ai:true}},
 {id:'betrieb',name:'Betrieb',priceMonthly:229,limits:{clients:500,appointmentsPerMonth:500,services:100,aiPerMonth:100},features:{clients:true,services:true,appointments:true,booking:true,orders:true,ai:true}},
 {id:'individuell',name:'Individuell',priceMonthly:null,limits:{clients:5000,appointmentsPerMonth:5000,services:500,aiPerMonth:100},features:{clients:true,services:true,appointments:true,booking:true,orders:true,ai:true}},
];
export function getPlan(id){return plans.find(plan=>plan.id===id)||plans[0]}
export function hasFeature(planId,feature){return getPlan(planId).features[feature]===true}
export function getEffectivePlan(organization){
 if(!organization)return 'free';
 const sandboxEnabled=organization.sandbox_enabled??organization.sandboxEnabled;
 const sandboxPlan=organization.sandbox_plan??organization.sandboxPlan;
 if(process.env.NODE_ENV==='development'&&sandboxEnabled&&plans.some(plan=>plan.id===sandboxPlan))return sandboxPlan;
 const status=organization.billing_status??organization.billingStatus;
 if(['active','trialing'].includes(status))return getPlan(organization.plan).id;
 // Vom Inhaber vergebene Testphase: gilt bis zum eingestellten Datum.
 const trialPlan=organization.trial_plan??organization.trialPlan,trialUntil=organization.trial_until??organization.trialUntil;
 if(trialPlan&&trialUntil&&trialUntil>Date.now()&&plans.some(p=>p.id===trialPlan))return trialPlan;
 return 'free';
}
