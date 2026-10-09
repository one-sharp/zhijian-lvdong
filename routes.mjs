import {LESSONS} from './lessons.mjs';
import {mapHands,prepareReference} from './scoring.mjs';
import {fitCanvas,drawDotHand,drawTrails,drawWristTrail} from './dots.mjs';
export const ROUTE_SOURCES=[
 {title:'你提供的简单双手舞蹈',type:'运动轨迹来源',detail:'采用原片 2.2–13.875 秒的双手、肩膀、手肘记录；保留五组动作顺序。'},
 {title:'《孤单的人》慢动作分解',type:'手型说明参考',url:'https://jingyan.baidu.com/article/414eccf6316ee02a431f0adc.html',detail:'核对双手比心、指向等常见手势的分步表达；没有使用此教程的完整舞序。'},
 {title:'《爱我就跟我走》分解',type:'手型说明参考',url:'https://jingyan.baidu.com/article/c275f6ba19078be33c756777.html',detail:'核对指向、比心、收拳等双手动作；没有使用此教程的完整舞序。'}
];
export const SOURCE_STEPS=LESSONS[0].steps.map((s,i)=>({...s,id:i,end:Math.min(s.end,13.875),beats:4}));
export function buildRoute(source,{bpm=96,duration=25,id='neon',title='霓虹漫步',audio='',offset=0}={}){
 if(!Number.isFinite(bpm)||bpm<60||bpm>180||!Number.isFinite(duration)||duration<6)throw Error('音乐需要至少 6 秒，节奏应在 60–180 BPM');
 const beat=60/bpm,cycle=20*beat,frames=[];
 const steps=SOURCE_STEPS.map((s,i)=>({...s,start:i*4*beat,end:(i+1)*4*beat}));
 for(let start=0;start<duration;start+=cycle)for(let i=0;i<5;i++){
  const s=SOURCE_STEPS[i],scale=4*beat/(s.end-s.start);
  for(const f of source.frames){if(f.time<s.start||f.time>=s.end)continue;const time=start+i*4*beat+(f.time-s.start)*scale;if(time<duration)frames.push({...f,time,sourceTime:f.time,sourceStep:i});}
 }
 // Event times are measured bilateral observations, retimed to this song.
 // Missing hands remain missing; rendered interpolation is never scored.
 const original=prepareReference(source),judgeTimes=[];
 for(let start=0;start<duration;start+=cycle)for(const event of original.events){const i=SOURCE_STEPS.findIndex(s=>event.time>=s.start&&event.time<s.end);if(i<0)continue;const s=SOURCE_STEPS[i],time=start+i*4*beat+(event.time-s.start)/(s.end-s.start)*4*beat;if(time<duration-.2)judgeTimes.push(time);}
 const lesson={id,title,duration,bpm,cycle,beat,steps,audio,offset,profile:'simple',coachMirror:false,music:`${bpm} BPM · ${Math.round(duration)} 秒 · 双手五步`,credit:'真实舞蹈轨迹 · 随音乐节拍跟练'};
 const reference=prepareReference({...source,id,duration,bpm,frames,judgeTimes,profile:'simple',mirrorForFollow:false,routeVersion:1,provenance:'user-provided-local-video / retimed measured frames'});
 const visualRecords=Object.fromEntries(['left','right'].map(side=>[side,source.frames.map(f=>({time:f.time,p:mapHands(f)[side]})).filter(f=>f.p)]));
 return {lesson,reference,source,sourceValid:original.valid,visualRecords};
}
export function sourceTimeAt(route,time){const t=Math.min(Math.max(0,time),Math.max(0,route.lesson.duration-.001))%route.lesson.cycle,i=Math.min(4,Math.floor(t/(route.lesson.beat*4))),s=SOURCE_STEPS[i];return s.start+(s.end-s.start)*(t/(route.lesson.beat*4)-i);}
function lerpPoints(a,b,f){return a.map((p,i)=>({...p,x:p.x+(b[i].x-p.x)*f,y:p.y+(b[i].y-p.y)*f,z:(p.z??0)+((b[i].z??0)-(p.z??0))*f}));}
export function visualAt(route,time,connect=true){
 const at=sourceTimeAt(route,time),list=route.source.frames;let before=list[0],after=list.at(-1);for(const frame of list){if(frame.time<=at)before=frame;if(frame.time>=at){after=frame;break;}}
 const t=after.time===before.time?0:(at-before.time)/(after.time-before.time),pose=before.pose&&after.pose?lerpPoints(before.pose,after.pose,t):(before.pose??after.pose),hands={},approx={};
 for(const side of ['left','right']){
  const records=route.visualRecords[side];let a=records.filter(f=>f.time<=at).at(-1),b=records.find(f=>f.time>=at);a??=b;b??=a;if(!a)continue;
  const gap=b.time-a.time;hands[side]=gap<=.65?lerpPoints(a.p,b.p,gap?Math.max(0,Math.min(1,(at-a.time)/gap)):0):(Math.abs(a.time-at)<Math.abs(b.time-at)?a.p:b.p);
  approx[side]=gap>.65||Math.abs(a.time-at)>.4||Math.abs(b.time-at)>.4;
  if(approx[side]&&pose){const wrist=pose[side==='left'?15:16];if(wrist&&(wrist.visibility??0)>.4){const dx=wrist.x-hands[side][0].x,dy=wrist.y-hands[side][0].y;hands[side]=hands[side].map(p=>({...p,x:p.x+dx,y:p.y+dy}));}}
 }
 const cycle=route.lesson.cycle,local=Math.max(0,time)%cycle,blend=route.lesson.beat*.5;
 if(connect&&local>cycle-blend&&Math.floor(time/cycle+1)*cycle<route.lesson.duration){
  const next=visualAt(route,Math.floor(time/cycle+1)*cycle,false),f=(local-cycle+blend)/blend;
  for(const side of ['left','right'])if(hands[side]&&next.hands[side]){hands[side]=lerpPoints(hands[side],next.hands[side],f);approx[side]=true;}
  return {pose:pose&&next.pose?lerpPoints(pose,next.pose,f):pose,hands,approx,sourceTime:at};
 }
 return {pose,hands,approx,sourceTime:at};
}
function arrow(ctx,a,b,color,w,h){const dx=(b.x-a.x)*w,dy=(b.y-a.y)*h,d=Math.hypot(dx,dy);if(d<5)return;ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.globalAlpha=.7;ctx.lineWidth=1.6;ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(a.x*w,a.y*h);ctx.lineTo(b.x*w,b.y*h);ctx.stroke();ctx.setLineDash([]);const ang=Math.atan2(dy,dx);ctx.beginPath();ctx.moveTo(b.x*w,b.y*h);ctx.lineTo(b.x*w-8*Math.cos(ang-.5),b.y*h-8*Math.sin(ang-.5));ctx.lineTo(b.x*w-8*Math.cos(ang+.5),b.y*h-8*Math.sin(ang+.5));ctx.closePath();ctx.fill();ctx.restore();}
export function drawRoute(canvas,route,time,{trails=true,lines=false}={}){
 if(!canvas||!route)return;const {ctx,w,h}=fitCanvas(canvas);ctx.clearRect(0,0,w,h);if(!w||!h)return;
 const v=visualAt(route,time),later=visualAt(route,Math.min(route.lesson.duration-.001,time+route.lesson.beat*.6)),pose=v.pose;if(!pose)return;
 const aspect=route.source.aspect,center={x:(pose[11].x+pose[12].x)/2,y:(pose[11].y+pose[12].y)/2},scale=Math.hypot((pose[11].x-pose[12].x)*aspect,pose[11].y-pose[12].y),unit=Math.min(w/3.6,h/3.4);
 // Screen-space mirror matches the mirrored user camera. One isotropic scale
 // preserves the measured elbow angles and avoids stretching finger routes.
 const project=p=>({x:.5-(p.x-center.x)*aspect/scale*unit/w,y:.45+(p.y-center.y)/scale*unit/h});
 ctx.strokeStyle='#527065';ctx.globalAlpha=.09;ctx.lineWidth=1;for(let x=20;x<w;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let y=20;y<h;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}ctx.globalAlpha=1;
 // A quiet head outline gives the routes a readable bodily frame of reference.
 const head=project({x:center.x,y:center.y-scale*.38});ctx.strokeStyle='#6e9488';ctx.globalAlpha=.18;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(head.x*w,head.y*h,unit*.22,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
 for(const [a,b] of [[11,12],[11,13],[13,15],[12,14],[14,16]]){const p=project(pose[a]),q=project(pose[b]);ctx.strokeStyle='#a4c4b5';ctx.globalAlpha=lines?.42:.15;ctx.lineWidth=lines?2:1.5;ctx.beginPath();ctx.moveTo(p.x*w,p.y*h);ctx.lineTo(q.x*w,q.y*h);ctx.stroke();}ctx.globalAlpha=1;
 for(const i of [13,14]){const p=project(pose[i]);ctx.fillStyle='#f6c177';ctx.beginPath();ctx.arc(p.x*w,p.y*h,3,0,Math.PI*2);ctx.fill();if(lines){ctx.font='10px "Microsoft YaHei",sans-serif';ctx.fillText('肘',p.x*w+8,p.y*h+4);}}
 const history=[];if(trails)for(let t=Math.max(Math.floor(time/route.lesson.cycle)*route.lesson.cycle,time-.7);t<time;t+=.06)history.push({time:t*1000,points:visualAt(route,t).hands});
 for(const side of ['left','right']){const hand=v.hands[side],future=later.hands[side];if(!hand)continue;if(trails)(lines?drawTrails:drawWristTrail)(ctx,history,side,w,h,{project,now:time*1000,lifetime:lines?700:450,opacity:.6});
  if(future){const q=project(future[0]);arrow(ctx,project(hand[0]),q,side==='left'?'#73dfdd':'#ffa39b',w,h);if(lines)drawDotHand(ctx,future,side,w,h,{project,ghost:true,connections:false,opacity:.38,numbers:false,radius:4.2});else{ctx.strokeStyle=side==='left'?'#73dfdd':'#ffa39b';ctx.globalAlpha=.5;ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x*w,q.y*h,16,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}}
  drawDotHand(ctx,hand,side,w,h,{project,connections:lines,ghost:v.approx[side],numbers:false,radius:lines?4.2:3});const p=project(hand[0]);ctx.fillStyle=side==='left'?'#73dfdd':'#ffa39b';ctx.font='11px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.fillText(side==='left'?'● 你的左手':'◆ 你的右手',p.x*w,p.y*h+25);
 }
 ctx.textAlign='left';if(Object.values(v.approx).some(Boolean)){ctx.fillStyle='#8aa99a';ctx.font='10px "Microsoft YaHei",sans-serif';ctx.fillText('虚线手型参考 · 合手与衔接看手腕路线',14,h-74);}
 const beat=Math.floor(time/route.lesson.beat)%4;for(let i=0;i<4;i++){ctx.fillStyle=i===beat?'#c6f595':'#365044';ctx.beginPath();ctx.arc(w/2+(i-1.5)*22,h-26,i===beat?5:3,0,Math.PI*2);ctx.fill();}
}
