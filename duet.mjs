// Independent, deterministic choreography. A host only needs to supply beat time.
export const EDGES=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]];
export const PHRASES=[
 {id:'cross',name:'交叉开合',description:'从胸前收拢，交叉，再沿弧线打开',left:'左手向右上绕过，随后向左打开',right:'右手向左下绕过，随后向右打开',detail:'交叉时一上一下，手腕保持松弛，不要两只手撞在一起。',start:0,end:8},
 {id:'point',name:'左右点拍',description:'左右交替领拍，另一只手保持呼应',left:'伸出食指，向左点两下，再收回胸前',right:'伸出食指，向右点两下，再收回胸前',detail:'左右交替，跟随重拍轻轻推出；不要同时把两只手都推出去。',start:8,end:16},
 {id:'orbit',name:'对向绕腕',description:'两只手一上一下，反向画圆和翻腕',left:'沿左上到右下的弧线绕腕',right:'沿右下到左上的弧线绕腕',detail:'两只手形成相对的圆弧，保持前后层次；动作连起来，经过中心时不要停。',start:16,end:24},
 {id:'heart',name:'双手合心',description:'从指尖波浪收拢成心，轻推再展开',left:'小指到食指依次舒展，向中间合心',right:'食指到小指依次舒展，向中间合心',detail:'食指与拇指勾出半颗心，两只手合拢；轻推后沿弧线打开。',start:24,end:32}
];
export const ROUTINES=[{id:'full',name:'32 拍双手组合',start:0,end:32},{id:'cross',name:'交叉开合 · 8 拍',start:0,end:8},{id:'orbit',name:'对向绕腕 · 8 拍',start:16,end:24},{id:'heart',name:'双手合心 · 8 拍',start:24,end:32}];
export const POSE={open:[0,0,0,0,0],v:[.78,0,0,1,1],point:[.7,0,1,1,1],fist:[1,1,1,1,1],heart:[.12,.62,.95,.97,1],soft:[.12,.14,.12,.17,.22]};
const hand=(x,y,rz=0,rx=0,ry=0,pose='soft',z=0)=>({x,y,z,rx,ry,rz,curl:[...POSE[pose]],spread:pose==='v'?1.3:.6,heart:pose==='heart'?1:0});
const k=(beat,left,right,cue)=>({beat,left,right,cue});
export const KEYFRAMES=[
 k(0,hand(.35,.59,-.12,0,0,'v'),hand(.65,.59,.12,0,0,'v'),'双 V 准备'),
 k(1,hand(.41,.55,-.2,.08,.1,'v'),hand(.59,.55,.2,.08,-.1,'v'),'向内收'),
 k(2,hand(.53,.49,-.7,.15,.15,'open',-.02),hand(.47,.60,.7,-.1,-.15,'open',.02),'一上一下交叉'),
 k(3,hand(.61,.49,-1,.18,.2,'open'),hand(.39,.57,1,-.1,-.2,'open'),'沿弧线经过'),
 k(4,hand(.28,.47,-.38,.05,.1,'open'),hand(.72,.47,.38,.05,-.1,'open'),'双手打开'),
 k(5,hand(.29,.40,-.25,.3,.65,'open'),hand(.71,.40,.25,.3,-.65,'open'),'上提翻腕'),
 k(6,hand(.33,.51,.25,-.1,-.4,'soft'),hand(.67,.51,-.25,-.1,.4,'soft'),'回落收腕'),
 k(7,hand(.36,.61,-.12,0,0,'fist'),hand(.64,.61,.12,0,0,'fist'),'握拳落拍'),
 k(8,hand(.36,.58,-.25,0,0,'point'),hand(.64,.59,.25,0,0,'fist'),'左手领拍'),
 k(8.5,hand(.28,.52,-.85,0,.12,'point'),hand(.61,.59,.2,0,0,'fist'),'左点'),
 k(9,hand(.35,.57,-.45,0,0,'point'),hand(.63,.60,.2,0,0,'fist'),'左手收回'),
 k(9.5,hand(.27,.49,-.9,0,.1,'point'),hand(.61,.61,.1,0,0,'fist'),'再点一次'),
 k(10,hand(.37,.59,-.2,0,0,'fist'),hand(.64,.58,.25,0,0,'point'),'换右手'),
 k(10.5,hand(.39,.59,-.2,0,0,'fist'),hand(.72,.52,.85,0,-.12,'point'),'右点'),
 k(11,hand(.37,.60,-.2,0,0,'fist'),hand(.65,.57,.45,0,0,'point'),'右手收回'),
 k(11.5,hand(.39,.61,-.1,0,0,'fist'),hand(.73,.49,.9,0,-.1,'point'),'再点一次'),
 k(12,hand(.33,.55,-.45,.1,.1,'v'),hand(.67,.55,.45,.1,-.1,'v'),'双 V 呼应'),
 k(13,hand(.41,.49,-.1,.2,.4,'v'),hand(.65,.59,.6,-.1,-.2,'v'),'左高右低'),
 k(14,hand(.35,.59,-.6,-.1,.2,'v'),hand(.59,.49,.1,.2,-.4,'v'),'右高左低'),
 k(15,hand(.38,.59,-.2,0,0,'open'),hand(.62,.59,.2,0,0,'open'),'回到中心'),
 k(16,hand(.38,.52,-.55,.1,.1,'soft',-.025),hand(.62,.64,.55,.1,-.1,'soft',.025),'上下错开'),
 k(17,hand(.47,.42,-1,.5,.5,'soft',-.04),hand(.53,.72,1,-.3,-.5,'soft',.04),'对向起圆'),
 k(18,hand(.62,.51,-1.4,.8,.8,'soft',-.02),hand(.38,.63,1.4,-.5,-.8,'soft',.02),'外翻经过'),
 k(19,hand(.53,.65,-2,.5,.3,'soft',.015),hand(.47,.49,2,-.3,-.3,'soft',-.015),'上下交换'),
 k(20,hand(.38,.62,-.7,.1,-.3,'open',.025),hand(.62,.50,.7,.1,.3,'open',-.025),'第二个圆'),
 k(21,hand(.32,.50,-.2,.3,-.6,'open',.01),hand(.68,.62,.2,-.2,.6,'open',-.01),'内翻向上'),
 k(22,hand(.45,.43,.25,.65,-.5,'soft',-.035),hand(.55,.69,-.25,-.4,.5,'soft',.035),'收圆'),
 k(23,hand(.37,.57,-.15,.1,0,'open'),hand(.63,.57,.15,.1,0,'open'),'双手展开'),
 k(24,hand(.32,.55,-.2,0,0,'open'),hand(.68,.55,.2,0,0,'open'),'指尖波浪'),
 k(25,hand(.39,.51,-.45,.12,.1,'soft'),hand(.61,.51,.45,.12,-.1,'soft'),'向中间汇合'),
 k(26,hand(.408,.54,.3,.08,0,'heart'),hand(.592,.54,-.3,.08,0,'heart'),'双手合心'),
 k(27,hand(.408,.51,.3,.1,.08,'heart',-.035),hand(.592,.51,-.3,.1,-.08,'heart',-.035),'向镜头轻推'),
 k(28,hand(.33,.50,-.45,.25,.2,'open'),hand(.67,.50,.45,.25,-.2,'open'),'把心打开'),
 k(29,hand(.31,.56,-.2,.08,.12,'soft'),hand(.69,.56,.2,.08,-.12,'soft'),'舒展回落'),
 k(30,hand(.37,.54,.3,.08,.1,'heart'),hand(.63,.54,-.3,.08,-.1,'heart'),'收回半颗心'),
 k(31,hand(.408,.54,.3,.08,0,'heart'),hand(.592,.54,-.3,.08,0,'heart'),'合心定格'),
 k(32,hand(.408,.54,.3,.08,0,'heart'),hand(.592,.54,-.3,.08,0,'heart'),'完成')
];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
function interpolate(a,b,t){const smooth=t*t*(3-2*t),result={};for(const key of ['x','y','z','rx','ry','rz','spread','heart'])result[key]=mix(a[key],b[key],smooth);result.curl=a.curl.map((v,i)=>mix(v,b.curl[i],smooth));return result;}
// Monotone cubic position curves preserve keyframe bounds while carrying
// velocity through a circular path, instead of stopping at every beat.
function tangent(i,side,key){if(i===0||i===KEYFRAMES.length-1)return 0;const a=KEYFRAMES[i-1],b=KEYFRAMES[i],c=KEYFRAMES[i+1],h1=b.beat-a.beat,h2=c.beat-b.beat,d1=(b[side][key]-a[side][key])/h1,d2=(c[side][key]-b[side][key])/h2;if(d1*d2<=0)return 0;const w1=2*h2+h1,w2=h2+2*h1;return (w1+w2)/(w1/d1+w2/d2);}
function curvePosition(pose,i,side,t){const a=KEYFRAMES[i],b=KEYFRAMES[Math.min(i+1,KEYFRAMES.length-1)],h=b.beat-a.beat;for(const key of ['x','y','z'])pose[key]=(2*t**3-3*t*t+1)*a[side][key]+(t**3-2*t*t+t)*h*tangent(i,side,key)+(-2*t**3+3*t*t)*b[side][key]+(t**3-t*t)*h*tangent(Math.min(i+1,KEYFRAMES.length-1),side,key);}
function rotate([x,y,z],rx,ry,rz){let y1=y*Math.cos(rx)-z*Math.sin(rx),z1=y*Math.sin(rx)+z*Math.cos(rx);let x2=x*Math.cos(ry)+z1*Math.sin(ry),z2=-x*Math.sin(ry)+z1*Math.cos(ry);return [x2*Math.cos(rz)-y1*Math.sin(rz),x2*Math.sin(rz)+y1*Math.cos(rz),z2];}
export function handPoints(pose,side){
 const sign=side==='left'?-1:1,p=[[0,.048,0],[-.021,.015,0],[-.043,-.004,0],[-.061,-.018,0],[-.076,-.028,0]];
 // An articulated thumb bends inward; four fingers bend towards the palm in depth.
 const thumb=pose.curl[0];for(let i=2;i<=4;i++){const f=(i-1)/3;p[i][0]=mix(p[i][0],-.023+f*.017,thumb);p[i][1]=mix(p[i][1],.015-f*.01,thumb);p[i][2]=-.027*thumb*f;}
 const roots=[[-.027,-.018],[-.009,-.027],[.012,-.02],[.031,-.003]],lengths=[[.042,.028,.023],[.046,.032,.026],[.041,.029,.024],[.033,.022,.019]];
 for(let f=0;f<4;f++){let [x,y]=roots[f],z=0;p.push([x,y,z]);const curl=pose.curl[f+1],spread=(f-1.5)*pose.spread*.12;for(let j=0;j<3;j++){const angle=curl*(j===0?.9:j===1?2.35:3);x+=Math.sin(spread)*lengths[f][j];y-=Math.cos(angle)*Math.cos(spread)*lengths[f][j];z-=Math.sin(angle)*lengths[f][j];p.push([x,y,z]);}}
 // A heart uses lateral index curvature and a thumb arc, rather than bending
 // every finger into a fist. The two index tips and two thumb tips meet.
 const heartShape={1:[-.021,.015,0],2:[-.05,.016,-.002],3:[-.081,.017,-.004],4:[-.103,.025,-.006],5:[-.027,-.018,0],6:[-.009,-.064,0],7:[-.047,-.097,0],8:[-.075,-.072,0]};
 for(const [i,point]of Object.entries(heartShape))p[i]=p[i].map((v,j)=>mix(v,point[j],pose.heart??0));
 return p.map(point=>{const [x,y,z]=rotate([point[0]*sign,point[1],point[2]],pose.rx,pose.ry,pose.rz);return {x:pose.x+x,y:pose.y+y*1.48,z:pose.z+z};});
}
export function sampleDuet(beat){
 beat=clamp(beat,0,32);const i=Math.max(0,KEYFRAMES.findLastIndex(k=>k.beat<=beat)),a=KEYFRAMES[i],b=KEYFRAMES[Math.min(i+1,KEYFRAMES.length-1)],t=clamp((beat-a.beat)/Math.max(.0001,b.beat-a.beat));
 const left=interpolate(a.left,b.left,t),right=interpolate(a.right,b.right,t);curvePosition(left,i,'left',t);curvePosition(right,i,'right',t);
 if(beat>=24&&beat<25.5){const phase=(beat-24)*Math.PI*2,envelope=Math.sin((beat-24)/1.5*Math.PI)**2;for(let f=1;f<=4;f++){left.curl[f]=mix(left.curl[f],.4+.35*Math.sin(phase-f*.62),envelope);right.curl[f]=mix(right.curl[f],.4+.35*Math.sin(phase-(5-f)*.62),envelope);}}
 const phrase=PHRASES[Math.min(3,Math.floor(beat/8))];return {beat,cue:a.cue,phrase,left,right,points:{left:handPoints(left,'left'),right:handPoints(right,'right')}};
}
export function returnToStart(end,start,t){const a=sampleDuet(end),b=sampleDuet(start),left=interpolate(a.left,b.left,clamp(t)),right=interpolate(a.right,b.right,clamp(t));return {...a,cue:'回到起势',left,right,points:{left:handPoints(left,'left'),right:handPoints(right,'right')}};}
export function center(points){return {x:(points[0].x+points[9].x)/2,y:(points[0].y+points[9].y)/2};}
const distance=(a,b)=>Math.hypot(a.x-b.x,(a.y-b.y)/1.48,(a.z??0)-(b.z??0));
export function fingerFeatures(points){const palm=Math.max(.0001,distance(points[0],points[9]));return [0,1,2,3,4].map(f=>{const root=f===0?1:5+(f-1)*4;const length=distance(points[root],points[root+1])+distance(points[root+1],points[root+2])+distance(points[root+2],points[root+3]);return distance(points[root],points[root+3])/Math.max(.0001,length);}).concat([distance(points[4],points[8])/palm]);}
function bendFeatures(points){const result=[];for(const root of [1,5,9,13,17])for(let j=1;j<=2;j++){const a=points[root+j-1],b=points[root+j],c=points[root+j+1],u={x:b.x-a.x,y:(b.y-a.y)/1.48,z:b.z-a.z},v={x:c.x-b.x,y:(c.y-b.y)/1.48,z:c.z-b.z};result.push((u.x*v.x+u.y*v.y+u.z*v.z)/Math.max(.000001,Math.hypot(u.x,u.y,u.z)*Math.hypot(v.x,v.y,v.z)));}return result;}
export function evaluateHand(actual,expected){if(!actual||actual.length!==21)return {shape:0,position:0,wrist:0,total:0,tracked:false};const f=fingerFeatures(actual),g=fingerFeatures(expected),u=bendFeatures(actual),v=bendFeatures(expected),ratioError=f.slice(0,5).reduce((s,x,i)=>s+Math.abs(x-g[i]),0)/5/.35,bendError=u.reduce((s,x,i)=>s+Math.abs(x-v[i]),0)/10/.8,gapError=Math.abs(f[5]-g[5])/1.3,shape=clamp(1-ratioError*.6-bendError*.3-gapError*.1)*100;const a=center(actual),e=center(expected),position=clamp(1-Math.hypot(a.x-e.x,a.y-e.y)/.23)*100;
 const angle=points=>Math.atan2(points[9].y-points[0].y,points[9].x-points[0].x),delta=angle(actual)-angle(expected),wrist=(1-Math.abs(Math.atan2(Math.sin(delta),Math.cos(delta)))/Math.PI)*100;
 return {shape,position,wrist,total:shape*.45+position*.35+wrist*.2,tracked:true};}
function vectorScore(actual,expected){const a=Math.hypot(actual.x,actual.y),b=Math.hypot(expected.x,expected.y);if(b<.008)return clamp(1-a/.09)*100;if(a<.002)return 0;const cosine=(actual.x*expected.x+actual.y*expected.y)/(a*b);return clamp((cosine+1)/2)*clamp(1-Math.abs(a-b)/Math.max(.06,b*2))*100;}
export function evaluateDuet(observed,target,previous=null,deltaSeconds=.1){
 const left=evaluateHand(observed.left,target.points.left),right=evaluateHand(observed.right,target.points.right),both=left.tracked&&right.tracked;let coordination=0,motion=0;
 if(both){const l=center(observed.left),r=center(observed.right),tl=center(target.points.left),tr=center(target.points.right);coordination=clamp(1-Math.hypot((r.x-l.x)-(tr.x-tl.x),(r.y-l.y)-(tr.y-tl.y))/.28)*100;
  if(previous&&previous.observed.left&&previous.observed.right){let sum=0;for(const side of ['left','right'])for(const index of [0,4,8,12,16,20]){const p=previous.observed[side][index],q=previous.target.points[side][index],a=observed[side][index],t=target.points[side][index];sum+=vectorScore({x:(a.x-p.x)/Math.max(.03,deltaSeconds),y:(a.y-p.y)/Math.max(.03,deltaSeconds)},{x:(t.x-q.x)/Math.max(.03,deltaSeconds),y:(t.y-q.y)/Math.max(.03,deltaSeconds)});}motion=sum/12;}else motion=0;
 }
 // Both identities are mandatory; one tracked hand can contribute at most 40 points.
 const total=(left.total+right.total)*.4+coordination*.12+motion*.08;
 return {left,right,coordination,motion,total,both,trackedCount:Number(left.tracked)+Number(right.tracked)};
}
export function summarizeSession(samples,expectedCount){
 if(!samples.some(s=>s.trackedCount))return null;const n=Math.max(1,expectedCount,samples.length),avg=fn=>Math.round(samples.reduce((sum,s)=>sum+fn(s),0)/n);
 return {total:avg(s=>s.total),left:avg(s=>s.left.total),right:avg(s=>s.right.total),coordination:avg(s=>s.coordination),motion:avg(s=>s.motion),coverage:Math.round(samples.filter(s=>s.both).length/n*100),samples:samples.length,expectedCount:n};
}
// Distinguish missing hands in observed frames from frames the device never sampled.
export function sessionQuality(samples,expectedCount){const received=samples.filter(s=>s.received),n=Math.max(1,expectedCount,samples.length);return {sampling:Math.round(received.length/n*100),coverage:received.length?Math.round(received.filter(s=>s.both).length/received.length*100):0,enough:received.length/n>=.6};}
// Keep handedness identities through crossings. Never assign by left/right x position.
export function identifyHands(raw,{mirror=true,swap=false}={}){
 const map={left:null,right:null};(raw.landmarks??[]).forEach((points,i)=>{const category=raw.handedness?.[i]?.[0];if(!category||category.score<.55)return;let side=category.categoryName.toLowerCase();if(swap)side=side==='left'?'right':'left';if(!['left','right'].includes(side)||map[side])return;map[side]=points.map(p=>({...p,x:mirror?1-p.x:p.x}));});return map;
}
// Map a contained camera image to the same normalized viewport as the guide.
// Preserve aspect ratio and use the same horizontal scale for landmark depth.
export function projectHands(hands,imageAspect,stageAspect=1.48){const sx=imageAspect<stageAspect?imageAspect/stageAspect:1,sy=imageAspect>stageAspect?stageAspect/imageAspect:1;return Object.fromEntries(['left','right'].map(side=>[side,hands[side]?.map(p=>({...p,x:(1-sx)/2+p.x*sx,y:(1-sy)/2+p.y*sy,z:p.z*sx}))??null]));}
