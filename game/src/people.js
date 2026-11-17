import { blocked } from './city.js';
export function populatePeople(w) {
  w.people=Array.from({length:100},(_,i)=>({x:(i%7)*360+62,y:Math.floor(i/7)*195+60,angle:w.rng()*6.28,color:['#f4d483','#ed937e','#7ac9b3'][i%3],fear:0,hp:50}));
}
export function updatePeople(w,dt) {
  for(const p of w.people) {
    if(p.hp<=0)continue;
    if(w.noise>0 && Math.hypot(p.x-w.player.x,p.y-w.player.y)<400) {p.fear=4;p.angle=Math.atan2(p.y-w.player.y,p.x-w.player.x);}
    p.fear=Math.max(0,p.fear-dt);
    const speed=p.fear?115:25, x=p.x+Math.cos(p.angle)*speed*dt,y=p.y+Math.sin(p.angle)*speed*dt;
    if(blocked(w.city,x,y,8))p.angle+=Math.PI*.7;else {p.x=x;p.y=y;}
  }
  w.noise=Math.max(0,w.noise-dt);
}
