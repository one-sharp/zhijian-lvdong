// Fingertip identity comes from the landmark topology, never from screen order.
export const FINGERS=[
 {name:'拇指',short:'拇',number:1,color:'#F6C177',chain:[0,1,2,3,4],tip:4},
 {name:'食指',short:'食',number:2,color:'#A7ECBA',chain:[0,5,6,7,8],tip:8},
 {name:'中指',short:'中',number:3,color:'#67D6E7',chain:[0,9,10,11,12],tip:12},
 {name:'无名指',short:'环',number:4,color:'#BBA4FB',chain:[0,13,14,15,16],tip:16},
 {name:'小指',short:'小',number:5,color:'#FF8F9D',chain:[0,17,18,19,20],tip:20}
];
export function fitCanvas(canvas){const dpr=Math.min(devicePixelRatio||1,2),w=canvas.clientWidth,h=canvas.clientHeight;if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return {ctx,w,h};}
export function demoPoint(p){return {x:.5+(p.x-.5)*1.12,y:.5+(p.y-.53)*1.12,z:p.z};}
function glyph(ctx,x,y,r,side){ctx.beginPath();if(side==='left')ctx.arc(x,y,r,0,Math.PI*2);else{ctx.moveTo(x,y-r*1.12);ctx.lineTo(x+r*1.12,y);ctx.lineTo(x,y+r*1.12);ctx.lineTo(x-r*1.12,y);ctx.closePath();}}
export function drawTrails(ctx,history,side,w,h,{project=p=>p,opacity=.8,now=0,lifetime=900}={}){
 if(history.length<2)return;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 for(const finger of FINGERS){ctx.strokeStyle=finger.color;ctx.shadowBlur=0;for(let i=1;i<history.length;i++){const a=history[i-1].points?.[side],b=history[i].points?.[side];if(!a||!b)continue;const p=project(a[finger.tip]),q=project(b[finger.tip]),age=now-history[i].time,fade=Math.max(0,1-age/lifetime);if(fade===0||Math.hypot((q.x-p.x)*w,(q.y-p.y)*h)<.2)continue;ctx.globalAlpha=opacity*fade*fade;ctx.lineWidth=.5+3*fade;ctx.beginPath();ctx.moveTo(p.x*w,p.y*h);ctx.lineTo(q.x*w,q.y*h);ctx.stroke();}}
 ctx.restore();
}
export function drawWristTrail(ctx,history,side,w,h,{project=p=>p,now=0,lifetime=500,opacity=.55}={}){
 ctx.save();ctx.lineCap='round';ctx.strokeStyle=side==='left'?'#73dfdd':'#ffa39b';
 for(let i=1;i<history.length;i++){const a=history[i-1].points?.[side]?.[0],b=history[i].points?.[side]?.[0];if(!a||!b)continue;const p=project(a),q=project(b),fade=Math.max(0,1-(now-history[i].time)/lifetime);ctx.globalAlpha=opacity*fade*fade;ctx.lineWidth=1+3*fade;ctx.beginPath();ctx.moveTo(p.x*w,p.y*h);ctx.lineTo(q.x*w,q.y*h);ctx.stroke();}ctx.restore();
}
export function drawDotHand(ctx,points,side,w,h,{project=p=>p,ghost=false,connections=true,opacity=1,numbers=true,radius=7.8}={}){
 if(!points)return;const p=points.map(project),scale=Math.max(.8,Math.min(1.35,w/540));ctx.save();
 if(connections){ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash(ghost?[3,5]:[]);for(const finger of FINGERS){ctx.globalAlpha=opacity*(ghost?.16:.28);ctx.strokeStyle=finger.color;ctx.lineWidth=ghost?1:1.2;ctx.beginPath();finger.chain.forEach((i,n)=>n?ctx.lineTo(p[i].x*w,p[i].y*h):ctx.moveTo(p[i].x*w,p[i].y*h));ctx.stroke();if(!ghost){ctx.globalAlpha=opacity*.42;ctx.fillStyle=finger.color;for(const i of finger.chain.slice(1,-1)){ctx.beginPath();ctx.arc(p[i].x*w,p[i].y*h,1.6*scale,0,Math.PI*2);ctx.fill();}}}ctx.setLineDash([]);ctx.strokeStyle='#a0b9b1';ctx.globalAlpha=opacity*(ghost?.08:.14);ctx.beginPath();for(const i of [5,9,13,17])ctx.lineTo(p[i].x*w,p[i].y*h);ctx.stroke();}
 for(const finger of FINGERS){const tip=p[finger.tip],x=tip.x*w,y=tip.y*h,r=(ghost?radius*1.15:radius)*scale;ctx.globalAlpha=opacity*(ghost?.5:1);ctx.strokeStyle=finger.color;ctx.fillStyle=finger.color;ctx.lineWidth=1.2;ctx.shadowColor=finger.color;ctx.shadowBlur=0;if(!ghost){const glow=ctx.createRadialGradient(x,y,r*.3,x,y,r*2.5);glow.addColorStop(0,finger.color+"55");glow.addColorStop(1,finger.color+"00");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,r*2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle=finger.color;}glyph(ctx,x,y,r,side);ghost?ctx.stroke():ctx.fill();ctx.shadowBlur=0;if(!ghost){ctx.globalAlpha=opacity*.38;glyph(ctx,x,y,r+4.5*scale,side);ctx.stroke();ctx.globalAlpha=opacity;if(numbers){ctx.font=`600 ${9.5*scale}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#16231f';ctx.fillText(finger.number,x,y+.3);}}}
 // A quiet wrist marker keeps the two hands readable through a crossing.
 ctx.globalAlpha=opacity*(ghost?.22:.7);ctx.strokeStyle=side==='left'?'#73dfdd':'#ffa39b';ctx.lineWidth=1;const wrist=p[0];glyph(ctx,wrist.x*w,wrist.y*h,4*scale,side);ctx.stroke();ctx.restore();
}
export class DotScene {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');}
 update(target,{history=[],trails=true,connections=true,now=0}={}){const {ctx,w,h}=fitCanvas(this.canvas);ctx.clearRect(0,0,w,h);for(const side of ['left','right']){if(trails)drawTrails(ctx,history,side,w,h,{project:demoPoint,now,lifetime:900});drawDotHand(ctx,target.points[side],side,w,h,{project:demoPoint,connections});}}
}
export class TrailHistory {
 constructor(lifetime=900){this.lifetime=lifetime;this.frames=[];}
 clear(){this.frames=[];}
 push(time,points){this.frames=this.frames.filter(f=>time-f.time<=this.lifetime);for(const side of ['left','right'])if(!points[side])for(const frame of this.frames)frame.points[side]=null;this.frames.push({time,points:{left:points.left,right:points.right}});if(this.frames.length>32)this.frames.shift();}
 recent(now){return this.frames.filter(f=>now-f.time<=this.lifetime);}
}
