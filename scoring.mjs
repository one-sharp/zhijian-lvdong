const clamp=x=>Math.max(0,Math.min(1,x));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const bodyIndices=[11,12,13,14,15,16];
function visible(p){return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1&&(p.visibility??1)>.4;}
export function mapHands(raw){
 const hands=raw.landmarks??[],pose=raw.pose,out={left:null,right:null};
 // The hand model assumes a mirrored selfie input. Our inference input is raw,
 // so its Right label belongs to the person's anatomical left hand. Prefer
 // these labels: pose wrist proximity becomes ambiguous when wrists cross.
 const labels=hands.map((_,i)=>raw.handedness?.[i]?.[0]);
 if(labels.every(h=>h?.score>=.6)&&new Set(labels.map(h=>h.categoryName)).size===hands.length){
  hands.forEach((h,i)=>{const name=labels[i].categoryName;if(name==='Right')out.left=h;else if(name==='Left')out.right=h;});return out;
 }
 if(hands.length===2&&visible(pose?.[15])&&visible(pose?.[16])){
  const direct=dist(hands[0][0],pose[15])+dist(hands[1][0],pose[16]);
  const crossed=dist(hands[1][0],pose[15])+dist(hands[0][0],pose[16]);
  out.left=hands[direct<=crossed?0:1];out.right=hands[direct<=crossed?1:0];
 }else for(let i=0;i<hands.length;i++){
  let side;if(visible(pose?.[15])&&visible(pose?.[16]))side=dist(hands[i][0],pose[15])<=dist(hands[i][0],pose[16])?'left':'right';
  else side=(raw.handedness?.[i]?.[0]?.categoryName??'').toLowerCase();
  if(side==='left'||side==='right')out[side]=hands[i];
 }return out;
}
export function features(raw,aspect=16/9){
 const pose=raw.pose;
 if(!visible(pose?.[11])||!visible(pose?.[12]))return null;
 const iso=p=>({x:p.x*aspect,y:p.y}),a=iso(pose[11]),b=iso(pose[12]),scale=dist(a,b);
 if(scale<.025)return null;
 const center={x:(a.x+b.x)/2,y:(a.y+b.y)/2},norm=p=>({x:(p.x*aspect-center.x)/scale,y:(p.y-center.y)/scale});
 const mapped=mapHands(raw),hands={};
 for(const side of ['left','right']){const p=mapped[side];if(!p)continue;
  const wrist=iso(p[0]),size=Math.max(dist(iso(p[5]),iso(p[17])),dist(wrist,iso(p[9])));if(size<.007)continue;
  const curl=[1,5,9,13,17].map(start=>{const q=[start,start+1,start+2,start+3].map(i=>iso(p[i]));const length=dist(q[0],q[1])+dist(q[1],q[2])+dist(q[2],q[3]);return clamp(dist(q[0],q[3])/Math.max(.0001,length));});
  hands[side]={shape:p.slice(1).map(q=>({x:(q.x*aspect-wrist.x)/size,y:(q.y-wrist.y)/size})),curl,position:norm(p[0]),motion:[0,4,8,12,16,20].map(i=>norm(p[i]))};
 }
 const body=bodyIndices.map(i=>visible(pose[i])?norm(pose[i]):null);
 const angle=(a,b,c)=>{if(!a||!b||!c)return null;const u={x:a.x-b.x,y:a.y-b.y},v={x:c.x-b.x,y:c.y-b.y};const length=Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y);return length>.0001?Math.acos(Math.max(-1,Math.min(1,(u.x*v.x+u.y*v.y)/length))):null;};
 return {hands,body,elbows:[angle(body[0],body[2],body[4]),angle(body[1],body[3],body[5])]};
}
function similarity(a,b,tolerance){return Math.exp(-dist(a,b)/tolerance);}
export function compare(expected,actual,profile='tutting'){
 if(!expected||!actual)return 0;
 const sides=Object.keys(expected.hands);if(sides.length!==2)return 0;
 let handScore=0,shapeScore=0,positionScore=0;for(const side of sides){const e=expected.hands[side],a=actual.hands[side];if(!a)continue;
  const shape=e.shape.reduce((sum,p,i)=>sum+similarity(p,a.shape[i],profile==='easy'?1.3:.9),0)/e.shape.length;
  const curl=e.curl.reduce((sum,v,i)=>sum+Math.exp(-Math.abs(v-a.curl[i])/(profile==='easy'?.4:.25)),0)/e.curl.length;
  shapeScore+=(shape*.6+curl*.4)/2;positionScore+=similarity(e.position,a.position,profile==='easy'?1.3:.55)/2;
  handScore+=(shape*.75+similarity(e.position,a.position,.55)*.25)/2;
 }
 const required=expected.body.filter(Boolean).length;
 const bodyScore=required?expected.body.reduce((s,p,i)=>s+(p&&actual.body[i]?similarity(p,actual.body[i],.6):0),0)/required:0;
 // Both hands are mandatory: a missing side limits a match to below Good.
 if(!actual.hands.left||!actual.hands.right)return Math.min(.35,handScore*.8+bodyScore*.2);
 if(profile==='easy')return clamp(shapeScore*.3+positionScore*.5+bodyScore*.1+elbowSimilarity(expected,actual)*.1);
 if(profile==='simple')return clamp(shapeScore*.35+positionScore*.25+bodyScore*.2+elbowSimilarity(expected,actual)*.2);
 return clamp(handScore*.8+bodyScore*.2);
}
export function elbowSimilarity(expected,actual){if(!expected||!actual)return 0;return expected.elbows.reduce((sum,v,i)=>sum+(v!==null&&actual.elbows[i]!==null?Math.exp(-Math.abs(v-actual.elbows[i])/.6):0),0)/2;}
export function mirrorRaw(raw){
 const flip=p=>({...p,x:1-p.x}),pose=raw.pose?.map(flip)??null;
 if(pose)for(const [a,b] of [[1,4],[2,5],[3,6],...Array.from({length:13},(_,i)=>[7+i*2,8+i*2])])[pose[a],pose[b]]=[pose[b],pose[a]];
 return {...raw,pose,landmarks:(raw.landmarks??[]).map(h=>h.map(flip)),handedness:(raw.handedness??[]).map(labels=>labels.map(h=>({...h,categoryName:h.categoryName==='Left'?'Right':'Left'})))};
}
export function prepareReference(reference){
 const frames=reference.frames.map(original=>{const f=reference.mirrorForFollow?mirrorRaw(original):original;return {...f,features:features(f,reference.aspect)};});
 const valid=frames.filter(f=>f.features?.hands.left&&f.features?.hands.right&&f.landmarks.every(hand=>[0,4,8,12,16,20].every(i=>visible({...hand[i],visibility:1}))));
 const period=reference.bpm?60/reference.bpm:.55,events=[];
 const centers=reference.judgeTimes??Array.from({length:Math.round(reference.duration/period)},(_,i)=>(i+.5)*period);
 for(let i=0;i<centers.length;i++){const center=centers[i],candidates=valid.filter(f=>Math.abs(f.time-center)<=(reference.judgeTimes?.length ? .2 : period*.36));
  if(candidates.length)events.push({beat:i,time:candidates.reduce((a,b)=>Math.abs(a.time-center)<Math.abs(b.time-center)?a:b).time});
 }
 return {...reference,frames,valid,events,period};
}
export function referenceAt(reference,time){let best=null,d=Infinity;for(const f of reference.valid){const next=Math.abs(f.time-time);if(next<d){best=f;d=next;}}return d<=.22?best:null;}
function motionReferenceAt(reference,time){let best=null,d=Infinity;for(const f of reference.frames){const next=Math.abs(f.time-time);if(f.features&&next<d){best=f;d=next;}}return d<=.15?best:null;}
export function judge(value){return value>=.88?'Perfect':value>=.72?'Great':value>=.52?'Good':'Miss';}
export class ScoreSession{
 constructor(reference){this.reference=reference;this.samples=[];this.next=0;this.results=[];this.combo=0;this.maxCombo=0;this.closed=false;}
 add(time,raw,aspect){if(this.closed||time<0||time>this.reference.duration)return;const actual=features(raw,aspect);
  const easy=this.reference.difficulty==='easy',profile=easy?'easy':this.reference.profile;
  const target=referenceAt(this.reference,time);let match=target?compare(target.features,actual,profile):0,offset=0;
  for(const frame of this.reference.valid){if(Math.abs(frame.time-time)>(easy?.48:.3))continue;const candidate=compare(frame.features,actual,profile);if(candidate>match+.015){match=candidate;offset=time-frame.time;}}
  let motion=1;
  const previous=this.previous,forMotion=this.reference.profile==='simple'?motionReferenceAt:referenceAt,expectedNow=forMotion(this.reference,time-offset),expectedBefore=previous?forMotion(this.reference,previous.time-offset):null;
  if(previous&&time-previous.time>.04&&time-previous.time<.8&&actual&&expectedNow&&expectedBefore){
   const values=[];for(const side of ['left','right']){const a=actual.hands[side],b=previous.actual?.hands[side],e=expectedNow.features.hands[side],f=expectedBefore.features.hands[side];if(!a||!b||!e||!f)continue;
    for(let i=0;i<a.motion.length;i++){const av={x:a.motion[i].x-b.motion[i].x,y:a.motion[i].y-b.motion[i].y},ev={x:e.motion[i].x-f.motion[i].x,y:e.motion[i].y-f.motion[i].y},al=Math.hypot(av.x,av.y),el=Math.hypot(ev.x,ev.y);
     if(el/(time-previous.time)<.15)continue;
     const direction=al>.0001?clamp((1+(av.x*ev.x+av.y*ev.y)/(al*el))/2):0;
     values.push(al<el*.15?0:direction*Math.min(al,el)/Math.max(al,el));
    }
   }
   // Simple choreography moves forearms as well as fingers. Use both elbows
   // in the motion check, without requiring another model or inference pass.
   if(this.reference.profile==='simple')for(const i of [2,3]){const a=actual.body[i],b=previous.actual?.body[i],e=expectedNow.features.body[i],f=expectedBefore.features.body[i];if(!a||!b||!e||!f)continue;const av={x:a.x-b.x,y:a.y-b.y},ev={x:e.x-f.x,y:e.y-f.y},al=Math.hypot(av.x,av.y),el=Math.hypot(ev.x,ev.y);if(el/(time-previous.time)>.15)values.push(al<el*.15?0:clamp((1+(av.x*ev.x+av.y*ev.y)/Math.max(.0001,al*el))/2)*Math.min(al,el)/Math.max(al,el));}
   if(values.length)motion=values.reduce((sum,v)=>sum+v,0)/values.length;
  }
  this.previous={time,actual};
  const motionWeight=easy?.35:this.reference.profile==='simple' ? .55 : .3;
  const rhythm=match>=.52&&(this.reference.profile!=='simple'||motion>=.25)?clamp(1-Math.abs(offset)/(easy?.55:.35)):0;
  let value=match*(.85+.15*rhythm)*(1-motionWeight+motionWeight*motion);
  if(easy&&motion<.15)value=Math.min(value,.45);
  this.samples.push({time,match,rhythm,motion,value,elbows:elbowSimilarity(expectedNow?.features,actual),both:!!actual?.hands.left&&!!actual?.hands.right,pose:!!actual});
 }
 advance(time,final=false){const changed=[];
  while(this.next<this.reference.events.length&&(final||time>=this.reference.events[this.next].time+(this.reference.judgeDelay??.42))){
   const event=this.reference.events[this.next++],window=this.samples.filter(s=>Math.abs(s.time-event.time)<=(this.reference.judgeWindow??.32));
   const best=window.reduce((a,b)=>!a||b.value>a.value?b:a,null),label=best?judge(best.value):'未评估';
   const result={...event,label,value:best?.value??0,match:best?.match??0,rhythm:best?.rhythm??0,elbows:best?.elbows??0,evaluated:!!best,both:best?.both??false};
   this.results.push(result);if(['Perfect','Great','Good'].includes(label))this.combo++;else this.combo=0;
   this.maxCombo=Math.max(this.maxCombo,this.combo);changed.push(result);
  }if(final)this.closed=true;return changed;
 }
 summary(){const r=this.results,n=this.reference.events.length,evaluated=r.filter(x=>x.evaluated),hits=r.filter(x=>['Perfect','Great','Good'].includes(x.label)),mean=k=>n?r.reduce((s,x)=>s+x[k],0)/n:0;
  const coverage=n?evaluated.length/n:0,valid=coverage>=.65&&n>=(this.reference.minimumEvents??8);
  const earned=Math.round(mean('value')*10000);
  return {valid,total:valid?earned:null,earned,accuracy:Math.round(mean('match')*100),rhythm:Math.round(mean('rhythm')*100),elbows:Math.round(mean('elbows')*100),completion:n?Math.round(hits.length/n*100):0,coverage:Math.round(coverage*100),maxCombo:this.maxCombo,combo:this.combo,events:n,judged:r.length,counts:Object.fromEntries(['Perfect','Great','Good','Miss','未评估'].map(label=>[label,r.filter(x=>x.label===label).length]))};
 }
}
