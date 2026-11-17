import { makeCar } from './vehicles.js';
import { beginMission } from './missions.js';
export function stageShot(name,w) {
  w.screen=name==='start'?'title':'play';w.time=32;
  if(name==='start'){w.player.x=2250;w.player.y=870;}
  else {const c=makeCar(2186,1090,-.12,false,true);c.speed=230;w.cars.push(c);w.player.car=c;w.player.x=c.x;w.player.y=c.y;w.player.cash=1850;}
  if(name==='chase'){w.player.wanted=3;w.cars.push(makeCar(2000,1070,0,true),makeCar(2090,1170,-.5,true));w.skids.push({x:2140,y:1090,angle:0,life:8});}
  if(name==='mission'){beginMission(w);w.player.x=2385;w.player.y=730;w.player.car.x=2385;w.player.car.y=730;w.mission.banner=0;}
  return w;
}
