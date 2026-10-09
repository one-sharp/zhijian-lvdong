export const TRACKS = [
 {id:'neon',name:'霓虹漫步',en:'NEON WALK',bpm:96,bars:24,color:'#b7f66b',style:'松弛 · 电子律动',description:'温暖和弦与清脆拨弦，适合第一次练习',seed:2},
 {id:'moon',name:'月光来信',en:'MOON LETTER',bpm:108,bars:24,color:'#a99aff',style:'轻盈 · 梦幻器乐',description:'细腻钟琴与流动琶音，感受指尖的起伏',seed:5},
 {id:'citrus',name:'橘子汽水',en:'CITRUS POP',bpm:120,bars:24,color:'#ffb469',style:'明快 · 合成流行',description:'跳跃旋律与鲜明鼓点，挑战你的节奏感',seed:8}
];
export const CLIPS = [
 {id:'warm',name:'暖色和弦',kind:'和声',type:'pad',color:'#a99aff'},
 {id:'glass',name:'玻璃琶音',kind:'和声',type:'bell',color:'#a99aff'},
 {id:'soft',name:'柔软电钢',kind:'和声',type:'piano',color:'#a99aff'},
 {id:'pocket',name:'口袋鼓组',kind:'节奏',type:'drums',color:'#b7f66b'},
 {id:'clap',name:'轻拍节奏',kind:'节奏',type:'clap',color:'#b7f66b'},
 {id:'shaker',name:'沙锤律动',kind:'节奏',type:'shaker',color:'#b7f66b'},
 {id:'round',name:'圆润低音',kind:'低音',type:'bass',color:'#ffb469'},
 {id:'bounce',name:'弹跳低音',kind:'低音',type:'bounce',color:'#ffb469'},
 {id:'spark',name:'星光旋律',kind:'旋律',type:'lead',color:'#75dcff'},
 {id:'drop',name:'水滴旋律',kind:'旋律',type:'drop',color:'#75dcff'},
 {id:'rise',name:'上升气流',kind:'音效',type:'rise',color:'#ff87b1'},
 {id:'chime',name:'风铃点缀',kind:'音效',type:'chime',color:'#ff87b1'}
];
const CHORDS=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]];
const MOTIFS=[[72,76,79,76,74,72,69,71],[76,79,83,79,77,76,74,72],[72,74,76,79,81,79,76,74]];
function addLayer(events,type,bar,gain=1,seed=0,layer='custom'){
 const chord=CHORDS[bar%4],b=bar*4;
 const note=(off,n,d,v,t)=>events.push({b:b+off,n,d,v:v*gain,t,layer});
 if(type==='pad') chord.forEach(n=>note(0,n,3.9,.055,'pad'));
 if(type==='piano') chord.forEach(n=>{note(0,n+12,1.8,.05,'piano');note(2,n+12,1.7,.042,'piano');});
 if(type==='bell') for(let i=0;i<8;i++)note(i*.5,chord[i%3]+12,.65,.075,'bell');
 if(type==='bass'||type==='bounce') for(let i=0;i<(type==='bass'?2:4);i++)note(i*(type==='bass'?2:1),chord[0]-24+(i%3===2?12:0),.65,.15,'bass');
 if(type==='drums'||type==='clap'){
  note(0,36,.45,.38,'kick');note(type==='clap'?2:1.5,36,.4,.3,'kick');
  [1,3].forEach(i=>note(i,0,.16,.16,'snare'));
  if(type==='drums') for(let i=0;i<8;i++)note(i*.5,0,.09,i%2?.033:.05,'hat');
 }
 if(type==='shaker') for(let i=0;i<8;i++)note(i*.5+.25,0,.075,i%2?.028:.05,'hat');
 if(type==='lead'||type==='drop'){
  const motif=MOTIFS[seed%3];for(let i=0;i<4;i++)note(i+(type==='drop'?.25:0),motif[(bar*2+i+seed)%8]+(type==='drop'?12:0),.8,type==='drop'?.075:.12,type==='drop'?'bell':'pluck');
 }
 if(type==='rise'&&bar%4===3)note(2,0,1.9,.11,'rise');
 if(type==='chime'&&bar%2===0)[0,.25,.5].forEach((off,i)=>note(off,chord[i]+24,2,.065,'bell'));
}
export function compose(state){
 const track=TRACKS.find(t=>t.id===state.track),bars=track?.bars??Number(state.bars??16),events=[];
 if(track&&state.baseVolume>0)for(let bar=0;bar<bars;bar++){
  const section=bar<4?'intro':bar<12?'verse':bar<20?'chorus':'outro';
  const gain=Number(state.baseVolume)/100*(section==='outro'?(bars-bar)/4:1);
  addLayer(events,'pad',bar,gain,track.seed,'base');
  if(bar>=2&&bar<22)addLayer(events,track.id==='moon'?'bell':'piano',bar,gain,track.seed,'base');
  if(bar>=4&&bar<22){addLayer(events,'drums',bar,gain*(track.id==='moon'?.6:1),track.seed,'base');addLayer(events,'bass',bar,gain,track.seed,'base');}
  if(bar>=4&&bar<22)addLayer(events,'lead',bar,gain*(section==='chorus'?1.2:.85),track.seed,'melody');
  if(section==='chorus'&&track.id==='citrus')addLayer(events,'shaker',bar,gain,track.seed,'base');
  if(bar%8===7)addLayer(events,'chime',bar,gain,track.seed,'base');
 }
 for(const clip of CLIPS){const val=state.clips?.[clip.id];if(val?.enabled)for(let bar=Number(val.startBar??0);bar<Math.min(bars,Number(val.endBar??bars));bar++)addLayer(events,clip.type,bar,Number(val.volume)/100,3,clip.kind==='旋律'?'melody':clip.id);}
 return {events:events.sort((a,b)=>a.b-b.b),beats:bars*4,bpm:Number(state.bpm??track?.bpm??96),name:track?.name??'我的自由混音'};
}
export function renderPCM(composition,sampleRate=22050){
 const sec=60/composition.bpm,duration=composition.beats*sec,out=new Float32Array(Math.ceil(duration*sampleRate));
 let random=20261007;const noise=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random/2147483648-1;};
 for(const e of composition.events){
  const start=Math.round(e.b*sec*sampleRate),length=Math.min(out.length-start,Math.ceil((e.d*sec+.11)*sampleRate)),f=440*2**((e.n-69)/12);let lastNoise=0;
  for(let i=0;i<length;i++){
   const t=i/sampleRate,hold=e.d*sec,attack=Math.min(1,t/(e.t==='pad'?.14:.008)),release=Math.min(1,Math.max(0,(hold+.11-t)/.11));let v=0;
   if(e.t==='kick')v=Math.sin(2*Math.PI*(46*t+60*.025*(1-Math.exp(-t/.025))))*Math.exp(-t*12);
   else if(e.t==='snare'){const n=noise();v=(.8*(n-lastNoise)+.2*Math.sin(t*2*Math.PI*180))*Math.exp(-t*23);lastNoise=n;}
   else if(e.t==='hat'){const n=noise();v=(n-lastNoise)*.6*Math.exp(-t*48);lastNoise=n;}
   else if(e.t==='rise')v=noise()*.25*Math.min(1,t/hold)*Math.sin(Math.PI*t/(hold+.11));
   else if(e.t==='pad')v=(Math.sin(2*Math.PI*f*t)+.24*Math.sin(2*Math.PI*f*1.003*t)+.12*Math.sin(2*Math.PI*f*2*t))*.7;
   else if(e.t==='bass')v=(Math.sin(2*Math.PI*f*t)+.22*Math.sin(2*Math.PI*f*2*t))*Math.exp(-t*3);
   else if(e.t==='bell')v=(Math.sin(2*Math.PI*f*t)+.35*Math.sin(2*Math.PI*f*2.01*t))*Math.exp(-t*4.6);
   else v=(Math.sin(2*Math.PI*f*t)+.28*Math.sin(2*Math.PI*f*2*t)+.12*Math.sin(2*Math.PI*f*3*t))*Math.exp(-t*(e.t==='piano'?3:5));
   out[start+i]+=v*e.v*attack*release;
  }
 }
 for(let i=0;i<out.length;i++){const t=i/sampleRate;out[i]=Math.tanh(out[i]*1.3)*.85*Math.min(1,t/.02,(duration-t)/.25);}
 return out;
}
export function wavBytes(samples,rate=22050){
 const data=new ArrayBuffer(44+samples.length*2),v=new DataView(data),write=(offset,s)=>[...s].forEach((c,i)=>v.setUint8(offset+i,c.charCodeAt(0)));
 write(0,'RIFF');v.setUint32(4,36+samples.length*2,true);write(8,'WAVE');write(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);write(36,'data');v.setUint32(40,samples.length*2,true);
 samples.forEach((s,i)=>v.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,s))*32767),true));return new Uint8Array(data);
}
