export const LESSONS=[{
 id:'simple',title:'简单双手 · 五步跟练',level:'入门 · 主示例',duration:14,aspect:480/854,
 video:'./media/simple-coach-play.mp4',poster:'./media/simple-poster.jpg',audio:'./media/simple-song.m4a',reference:'./simple-reference.json',coachMirror:false,
 music:'原视频配乐 · 14 秒有效舞蹈段',credit:'你提供的真人手势舞 · 本机素材',source:null,profile:'simple',
 // Manually annotated from the supplied video; no guessed BPM or generated choreography.
 judgeTimes:[2.55,3.10,3.65,4.05,4.70,5.25,5.80,6.15,6.85,7.4,7.9,8.25,9.05,9.60,10.15,10.5,11.2,11.75,12.3,12.8,13.4],
 steps:[
  {start:2.2,end:4.4,icon:'🤞 🤞',name:'收手轻摆',cue:'双手收在胸前，手肘随节奏左右轻摆'},
  {start:4.4,end:6.5,icon:'🖐️ 🖐️',name:'双手展掌',cue:'双掌朝前展开，手肘自然弯曲'},
  {start:6.5,end:8.65,icon:'🫶 ☝️',name:'比心指尖',cue:'双手合成爱心，再伸出食指点两拍'},
  {start:8.65,end:10.75,icon:'🤲 🙏',name:'托掌合十',cue:'掌心向上交替托起，再轻轻合十'},
  {start:10.75,end:14,icon:'👊 ✊',name:'双拳换位',cue:'双拳交替上下换位，手肘跟着抬落'}
 ]
},{
 id:'tutting',title:'霓虹手势 · Finger Tutting',level:'进阶 · 原示例',duration:24,aspect:960/506,
 video:'./media/coach.mp4',poster:'./media/poster.jpg',audio:'./media/song.wav',reference:'./reference.json',coachMirror:true,
 music:'原创电子音乐 · 80 BPM · 24 秒',credit:'cottonbro studio · Finger Tutting',source:'https://www.pexels.com/video/man-finger-tutting-10265183/',profile:'tutting',bpm:80,
 steps:[
  {start:0,end:6,icon:'🤲 🤲',name:'准备双手',cue:'准备双手，放在胸前'},
  {start:6,end:12,icon:'🖐️ 🤚',name:'交错换位',cue:'双手交错，留意手腕方向'},
  {start:12,end:18,icon:'☝️ ☝️',name:'连续换位',cue:'连续换位，跟着指尖走'},
  {start:18,end:24,icon:'🫶',name:'收尾组合',cue:'保持节奏，完成最后一组'}
 ]
}];
export function stepAt(lesson,time){return lesson.steps.findIndex(s=>time>=s.start&&time<s.end);}
