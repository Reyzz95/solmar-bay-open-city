import { blocked } from './city.js';
import { SIZE } from './config.js';
export function makeCar(x,y,angle=0,police=false,sports=false) { return { x,y,angle,speed:0,police,sports,hp:100,turn:0,color: police?'#ecf3e9':sports?'#ff795d':['#d9b95e','#8bbab9','#be7e86','#d3d8c1'][Math.floor((x+y)%4)] }; }
export function populateCars(w) {
  w.cars = w.city.spawns.filter((_,i)=>i%2===0).map(s=>makeCar(s.x,s.y,s.angle));
  w.cars.push(makeCar(1110,1200,-Math.PI/2,false,true));
}
export function updateVehicles(w,dt) {
  const p=w.player;
  const cops=w.cars.filter(c=>c.police);
  if(p.wanted && cops.length<Math.min(5,p.wanted+1) && w.time>w.nextCop) {
    w.nextCop=w.time+5;
    const s=w.city.spawns.reduce((a,b)=>Math.abs(Math.hypot(a.x-p.x,a.y-p.y)-650)<Math.abs(Math.hypot(b.x-p.x,b.y-p.y)-650)?a:b);
    w.cars.push(makeCar(s.x,s.y,s.angle,true));
  }
  for(const c of w.cars) {
    if(c===p.car) continue;
    if(c.police && p.wanted) {
      const goal=Math.atan2(p.y-c.y,p.x-c.x); const delta=Math.atan2(Math.sin(goal-c.angle),Math.cos(goal-c.angle));
      c.angle+=Math.max(-2.5*dt,Math.min(2.5*dt,delta)); c.speed=190+p.wanted*23;
      if(Math.hypot(p.x-c.x,p.y-c.y)<40) { p.health-=dt*9; w.bust+=dt; }
    } else { c.speed=75; if(c.y>SIZE-60)c.angle=-Math.PI/2; if(c.y<40)c.angle=Math.PI/2; }
    const x=c.x+Math.cos(c.angle)*c.speed*dt,y=c.y+Math.sin(c.angle)*c.speed*dt;
    if(!blocked(w.city,x,y,17)){c.x=x;c.y=y;}else c.angle+=Math.PI/2;
  }
  if(!p.wanted || !w.cars.some(c=>c.police&&Math.hypot(c.x-p.x,c.y-p.y)<40)) w.bust=Math.max(0,w.bust-dt*2);
}
