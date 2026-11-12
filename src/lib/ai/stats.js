// Zahlen für die Admin-Ansicht „Team & KI“: Arbeit des Teams, Leistung und Kosten von FUNKNAHT AI.
import {getDb} from '../business-db.js';
import {teamPeople} from '../staff.js';
import {aiConfig,cost} from './engine.js';
const DAY=86400000;
export function aiStats({days=30}={},now=Date.now()){
 const db=getDb(),since=now-days*DAY,config=aiConfig();
 const rows=db.prepare('SELECT surface,status,error_code,escalated,input_tokens,output_tokens,ms,tools,created_at FROM ai_log WHERE created_at>=?').all(since);
 const by=s=>rows.filter(r=>r.surface===s);
 const summary=list=>{const ok=list.filter(r=>r.status==='ok');const tokens={input:list.reduce((s,r)=>s+r.input_tokens,0),output:list.reduce((s,r)=>s+r.output_tokens,0)};return {requests:list.length,ok:ok.length,errors:list.length-ok.length,escalations:list.filter(r=>r.escalated).length,avgMs:ok.length?Math.round(ok.reduce((s,r)=>s+r.ms,0)/ok.length):0,tokens,costUsd:Math.round(cost(tokens,config)*10000)/10000}};
 const tools={};for(const r of rows)for(const t of JSON.parse(r.tools||'[]'))tools[t]=(tools[t]||0)+1;
 const errors={};for(const r of rows.filter(r=>r.status!=='ok'))errors[r.error_code||'unbekannt']=(errors[r.error_code||'unbekannt']||0)+1;
 const series=[];for(let i=days-1;i>=0;i--){const start=new Date(now-i*DAY);start.setUTCHours(0,0,0,0);const s=start.getTime(),e=s+DAY;series.push({day:start.toISOString().slice(0,10),kunde:rows.filter(r=>r.surface==='kunde'&&r.created_at>=s&&r.created_at<e).length,workspace:rows.filter(r=>r.surface==='workspace'&&r.created_at>=s&&r.created_at<e).length})}
 const actions=db.prepare('SELECT kind,status,COUNT(*) n FROM ai_actions WHERE created_at>=? GROUP BY kind,status').all(since);
 const escalated=db.prepare("SELECT id,status,priority,created_at FROM support_tickets WHERE source='ki' ORDER BY created_at DESC LIMIT 15").all().map(t=>({id:t.id,status:t.status,priority:t.priority,createdAt:t.created_at}));
 const weekStart=new Date(now-6*DAY).toISOString().slice(0,10),monthStart=new Date(now-29*DAY).toISOString().slice(0,10),today=new Date(now).toISOString().slice(0,10);
 const team=teamPeople().filter(p=>p.userId).map(p=>({name:p.name,role:p.roleLabel,
  minutesToday:db.prepare('SELECT COALESCE(SUM(minutes),0) m FROM ticket_time WHERE user_id=? AND work_date=?').get(p.userId,today).m,
  minutesWeek:db.prepare('SELECT COALESCE(SUM(minutes),0) m FROM ticket_time WHERE user_id=? AND work_date>=?').get(p.userId,weekStart).m,
  minutesMonth:db.prepare('SELECT COALESCE(SUM(minutes),0) m FROM ticket_time WHERE user_id=? AND work_date>=?').get(p.userId,monthStart).m,
  repliesWeek:db.prepare("SELECT COUNT(*) n FROM ticket_messages WHERE author='owner' AND internal=0 AND author_user_id=? AND created_at>=?").get(p.userId,new Date(now-7*DAY).toISOString()).n,
  tasksDoneWeek:db.prepare('SELECT COUNT(*) n FROM tasks WHERE done_by=? AND done_at>=?').get(p.userId,now-7*DAY).n,
  tasksOpen:db.prepare("SELECT COUNT(*) n FROM tasks WHERE assignee_user_id=? AND status='offen'").get(p.userId).n,
  tasksOverdue:db.prepare("SELECT COUNT(*) n FROM tasks WHERE assignee_user_id=? AND status='offen' AND due_on<?").get(p.userId,today).n,
  lastLoginAt:p.lastLoginAt||null}));
 return {days,config:{configured:config.configured,provider:config.name,model:config.model,region:config.region,price:config.price,workspace:config.workspace,customer:config.customer},
  total:summary(rows),customer:summary(by('kunde')),workspace:summary(by('workspace')),tools:Object.entries(tools).sort((a,b)=>b[1]-a[1]).slice(0,10),errors,series,actions,escalated,team,
  unassignedTasks:db.prepare("SELECT COUNT(*) n FROM tasks WHERE assignee_user_id IS NULL AND status='offen'").get().n};
}
