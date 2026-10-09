export class CameraTracker{
 async init(){
  try{await this.initWorker();this.mode='worker';}
  catch(e){this.worker?.terminate();this.worker=null;this.workerError=e.message;await this.initMain();}
  return this;
 }
 async initWorker(){
  this.worker=new Worker(new URL('./duet-tracker-worker.mjs',import.meta.url));
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('后台识别加载超时')),20000);
   this.worker.onmessage=({data})=>{if(data.type==='ready'){clearTimeout(timer);this.delegate=data.delegate;resolve();}if(data.type==='error'){clearTimeout(timer);reject(new Error(data.message));}};
   this.worker.onerror=e=>{clearTimeout(timer);reject(new Error(e.message||'浏览器无法启动后台识别'));};this.worker.postMessage({type:'init'});
  });
 }
 async initMain(){const {createTracker}=await import('./tracking-engine.mjs');this.main=await createTracker();this.mode='main';this.delegate=this.main.delegate;}
 async detect(video,time){const timestamp=performance.now();
  if(this.main)return {...this.main.detect(video,timestamp),time};
  const bitmap=await createImageBitmap(video);
  try{return await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('识别响应超时')),7000);
   this.worker.onmessage=({data})=>{clearTimeout(timer);data.type==='result'?resolve(data):reject(new Error(data.message||'识别失败'));};
   this.worker.onerror=e=>{clearTimeout(timer);reject(new Error(e.message||'后台识别中断'));};
   this.worker.postMessage({type:'frame',bitmap,timestamp,time},[bitmap]);
  });}catch(e){this.worker?.terminate();this.worker=null;this.workerError=e.message;await this.initMain();return {...this.main.detect(video,performance.now()),time};}
 }
 close(){this.worker?.terminate();this.main?.close();}
}
