import {compose,renderPCM,wavBytes} from './music.mjs';
self.onmessage=({data})=>{try{const composition=compose(data.state);if(!composition.events.length)throw Error('至少选择一个声音片段');const pcm=renderPCM(composition),bytes=wavBytes(pcm);self.postMessage({id:data.id,bytes,duration:pcm.length/22050,bpm:composition.bpm},[bytes.buffer]);}catch(e){self.postMessage({id:data.id,error:e.message});}};
