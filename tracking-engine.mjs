import {FilesetResolver,HandLandmarker,PoseLandmarker} from './vendor/vision_bundle.mjs';
export async function createTracker(preferred='GPU'){
 const files=await FilesetResolver.forVisionTasks(new URL('./vendor/wasm/',import.meta.url).href);
 let hands,pose,delegate=preferred;
 const handCanvas=typeof OffscreenCanvas==='function'?new OffscreenCanvas(1,1):null,handContext=handCanvas?.getContext('2d');
 async function load(kind){
  hands=await HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:new URL('./models/hand_landmarker.task',import.meta.url).href,delegate:kind},runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:.4,minHandPresenceConfidence:.4,minTrackingConfidence:.4});
  try{pose=await PoseLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:new URL('./models/pose_landmarker_lite.task',import.meta.url).href,delegate:kind},runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.4,minPosePresenceConfidence:.4,minTrackingConfidence:.4,outputSegmentationMasks:false});}
  catch(e){hands.close();throw e;}
 }
 try{await load(delegate);}catch(e){if(delegate==='CPU')throw e;delegate='CPU';await load(delegate);}
 return {delegate,detect(image,timestamp){
  const start=performance.now(),p=pose.detectForVideo(image,timestamp),body=p.landmarks[0]??null;
  const width=image.videoWidth||image.width,height=image.videoHeight||image.height;
  let source=image,region=null;
  // The original portrait clip leaves considerable room above the dancer.
  // Pose guides a padded crop so fists occupy enough pixels for palm detection.
  // The pose model and all returned coordinates remain in the full camera frame.
  const anchors=body?.slice(11,17).filter(q=>(q.visibility??0)>.5&&q.x>=0&&q.x<=1&&q.y>=0&&q.y<=1)??[];
  if(handContext&&height>width&&anchors.length>=4){
   const shoulder=Math.hypot((body[11].x-body[12].x)*width,(body[11].y-body[12].y)*height),padding=Math.max(shoulder*.65,width*.08);
   const top=Math.max(0,Math.floor(Math.min(height*.35,...anchors.map(q=>q.y*height-padding))));
   if(top>height*.12){
    // Retain the entire width and bottom. A stable crop avoids introducing
    // apparent movement into VIDEO mode when forearms swing left and right.
    region={x:0,y:top,width,height:height-top};handCanvas.width=region.width;handCanvas.height=region.height;
    handContext.drawImage(image,0,top,width,region.height,0,0,width,region.height);source=handCanvas;
   }
  }
  const h=hands.detectForVideo(source,timestamp),landmarks=region?h.landmarks.map(hand=>hand.map(q=>({...q,x:(region.x+q.x*region.width)/width,y:(region.y+q.y*region.height)/height,z:q.z*region.width/width}))):h.landmarks;
  return {landmarks,handedness:h.handedness,pose:body,handRegion:region,inferenceMs:performance.now()-start};
 },close(){hands.close();pose.close();}};
}
