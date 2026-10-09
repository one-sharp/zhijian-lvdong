// Judgments and progress use the frame the learner actually sees. Audio cannot
// finish a video lesson early when decoding temporarily falls behind.
export function practiceTime(lesson,audio,video){
 return Math.max(0,lesson?.video?(video?.currentTime??0):(audio?.currentTime??0)-(lesson?.offset??0));
}
