// Feedback goes to speakers only, never to the clean video recording mix.
export function comboCue(combo){
 if(combo<2)return null;
 const milestone=combo===3||combo%5===0;
 return {combo,milestone,notes:combo%5===0?[659.25,987.77]:combo===3?[659.25,783.99]:[587.33+Math.min(combo,12)*13],gain:milestone ? .032 : .024,spacing:.075,duration:.13};
}
export function scheduleComboCue(context,cue){
 const voices=[],start=context.currentTime+.01;
 cue.notes.forEach((frequency,index)=>{
  const oscillator=context.createOscillator(),gain=context.createGain(),at=start+index*cue.spacing;
  oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,at);
  gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(cue.gain,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+cue.duration);
  oscillator.connect(gain);gain.connect(context.destination);oscillator.start(at);oscillator.stop(at+cue.duration+.015);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};voices.push(oscillator);
 });return voices;
}
export class ComboAudio{
 constructor(){this.context=null;this.voices=[];this.lastAt=-Infinity;}
 unlock(){
  try{const Audio=globalThis.AudioContext??globalThis.webkitAudioContext;if(!Audio)return;
   this.context??=new Audio({latencyHint:'interactive'});this.context.resume().catch(()=>{});
  }catch{/* Audio feedback must not interrupt scoring. */}
 }
 play(combo){
  const cue=comboCue(combo),context=this.context;
  if(!cue||context?.state!=='running'||context.currentTime-this.lastAt<.12)return;
  this.stop();this.lastAt=context.currentTime;this.voices=scheduleComboCue(context,cue);
  const qa=document.querySelector('#qa-combo-audio');if(qa){const events=JSON.parse(qa.textContent||'[]');events.push({...cue,state:context.state,output:'speakers-only'});qa.textContent=JSON.stringify(events);}
 }
 stop(){for(const voice of this.voices)try{voice.stop();}catch{}this.voices=[];}
 close(){this.stop();this.context?.close().catch(()=>{});}
}
