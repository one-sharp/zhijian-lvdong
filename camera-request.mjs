// A permission prompt can remain unanswered indefinitely. Release any late stream.
export function requestCamera(mediaDevices,constraints,timeout=20000){
 return new Promise((resolve,reject)=>{
  let expired=false;
  const timer=setTimeout(()=>{expired=true;const error=new Error('摄像头授权或设备没有响应');error.name='CameraTimeoutError';reject(error);},timeout);
  Promise.resolve().then(()=>mediaDevices.getUserMedia(constraints)).then(stream=>{
   clearTimeout(timer);if(expired){stream.getTracks().forEach(track=>track.stop());return;}resolve(stream);
  },error=>{clearTimeout(timer);if(!expired)reject(error);});
 });
}
