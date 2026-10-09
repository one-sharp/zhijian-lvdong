import {TRACKS,CLIPS} from './music.mjs';
export {TRACKS,CLIPS};
export const MUSIC=TRACKS.map(t=>({...t,audio:`./audio/${t.id}.wav`,duration:t.bars*4*60/t.bpm,kind:'完整音乐',offset:0}));
export const MIX_PRESETS=[
 {name:'松弛律动',bpm:96,ids:['warm','pocket','round','spark']},
 {name:'月光叮咚',bpm:108,ids:['glass','shaker','round','drop','chime']},
 {name:'汽水派对',bpm:120,ids:['soft','clap','bounce','spark','rise']}
];
export function mixState(preset=MIX_PRESETS[0]){return {track:null,baseVolume:70,bpm:preset.bpm,bars:8,clips:Object.fromEntries(CLIPS.map(c=>[c.id,{enabled:preset.ids.includes(c.id),volume:65,startBar:0,endBar:8}]))};}
export function practiceDuration(music,length='short'){const available=Math.max(0,music.duration-(music.offset??0));return length==='full'?available:Math.min(available,40*60/music.bpm);}
// Energy onsets, rather than pitch, provide a rough pulse estimate. The UI
// always keeps tempo and first-beat alignment editable for imported music.
export function estimateBpm(samples,rate){
 const hop=Math.max(1,Math.round(rate*.02)),energy=[];
 for(let i=0;i<Math.min(samples.length,rate*60);i+=hop){let sum=0;for(let j=i;j<Math.min(i+hop,samples.length);j++)sum+=samples[j]*samples[j];energy.push(Math.sqrt(sum/hop));}
 const onsets=energy.map((v,i)=>Math.max(0,v-(energy[i-1]??v))),power=onsets.reduce((s,v)=>s+v*v,0);
 if(power<1e-7)return {bpm:96,confidence:0};
 let best={bpm:96,score:0};
 for(let bpm=72;bpm<=132;bpm++){const lag=60/bpm/.02;let sum=0;for(let i=Math.ceil(lag);i<onsets.length;i++){const p=i-lag,a=Math.floor(p),f=p-a;sum+=onsets[i]*((onsets[a]??0)*(1-f)+(onsets[a+1]??0)*f);}const score=sum/power;if(score>best.score)best={bpm,score};}
 return {bpm:best.bpm,confidence:Math.min(1,best.score)};
}
