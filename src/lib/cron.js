import {sendReminders} from './appointments-extra.js';
import {runMonitors} from './monitors.js';
import {purgeCallbacks} from './callbacks.js';
import {applyRetention} from './owner.js';
import {trialReminders} from './access.js';

// Wird alle 5 Minuten vom Server-Zeitplan aufgerufen (siehe deploy/ANLEITUNG.md).
let running=false;
export async function runScheduledTasks(){
 if(running)return {skipped:true};
 running=true;
 try{
  const result={reminders:sendReminders(),monitorsChecked:await runMonitors(),callbacksPurged:purgeCallbacks(),retention:applyRetention(),trialReminders:trialReminders()};
  return result;
 }finally{running=false}
}
