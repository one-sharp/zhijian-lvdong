// Keep checkpoint poses from measured, bilateral observations only.
export function practiceReference(reference,lesson,difficulty='easy'){
 const groups=new Map(),events=reference.events.map(event=>{
  const round=lesson.cycle?Math.floor(event.time/lesson.cycle):0,local=lesson.cycle?event.time%lesson.cycle:event.time;
  const stepIndex=lesson.steps.findIndex(s=>local>=s.start&&local<s.end),step=lesson.steps[stepIndex];
  return {...event,round,stepIndex,name:step?.name??'双手动作',icon:step?.icon??'🤲',gold:!!step?.name.includes('心')};
 });
 if(difficulty!=='easy')return {...reference,events,difficulty:'standard'};
 for(const event of events){if(event.stepIndex<0)continue;const key=`${event.round}:${event.stepIndex}`,step=lesson.steps[event.stepIndex];
  const start=event.round*(lesson.cycle??0)+step.start,end=Math.min(lesson.duration,event.round*(lesson.cycle??0)+step.end),target=start+(end-start)*.68,old=groups.get(key);
  if(!old||Math.abs(event.time-target)<Math.abs(old.time-target))groups.set(key,event);
 }
 const checkpoints=[...groups.values()].sort((a,b)=>a.time-b.time);
 return {...reference,events:checkpoints,difficulty:'easy',minimumEvents:Math.min(5,Math.max(1,checkpoints.length)),judgeWindow:.5,judgeDelay:.58};
}
export function checkpointAt(reference,time){return reference?.events.find(e=>e.time+(reference.judgeDelay??.42)>=time)??null;}
export function feedbackFor(event,summary,count){
 const hit=['Perfect','Great','Good'].includes(event.label),combo=summary.combo;
 return {label:event.label==='未评估'?'未识别':event.label,combo,hit,gold:hit&&event.gold,points:Math.round(event.value*10000/Math.max(1,count)),
  milestone:hit&&combo>0&&combo%5===0?'火力全开！':hit&&combo===3?'连击开始！':'',
  note:hit?(event.gold?'重点手势命中！':event.label==='Perfect'?'漂亮！节奏和动作都对上了':'跟上了，继续下一步'):!event.both?'把双手和肩膀放进画面':'别急，跟着下一步继续'};
}
