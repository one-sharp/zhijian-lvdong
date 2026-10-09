let tracker;
self.onmessage=async({data})=>{try{
 if(data.type==='init'){const {createTracker}=await import('./tracking-engine.mjs');tracker=await createTracker(data.delegate??'GPU');self.postMessage({type:'ready',delegate:tracker.delegate});}
 if(data.type==='frame'&&tracker){try{const result=tracker.detect(data.bitmap,data.timestamp);self.postMessage({type:'result',id:data.id,time:data.time,...result});}finally{data.bitmap.close();}}
}catch(e){self.postMessage({type:'error',message:e?.message??String(e)});}};
