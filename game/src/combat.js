export function updateCombat(w,input,dt) {
  const p=w.player;p.cooldown=Math.max(0,p.cooldown-dt);
  if(!p.car && input.mouse.down && p.cooldown===0 && p.ammo>0) {
    p.ammo--;p.cooldown=.23;w.noise=1;p.wanted=Math.min(5,Math.max(1,p.wanted));p.heat=0;
    w.bullets.push({x:p.x+Math.cos(p.angle)*19,y:p.y+Math.sin(p.angle)*19,angle:p.angle,life:.8});w.flash=.07;w.audio.play('shot');
  }
  if(input.tap('Space')&&!p.car&&p.cooldown===0){p.cooldown=.4;w.punch=.2;w.audio.play('hit');for(const n of [...w.people,...w.mission.debtors])if(Math.hypot(n.x-p.x,n.y-p.y)<65){n.hp-=30;n.fear=4;}}
  for(const b of w.bullets){b.x+=Math.cos(b.angle)*760*dt;b.y+=Math.sin(b.angle)*760*dt;b.life-=dt;for(const n of [...w.people,...w.mission.debtors])if(n.hp>0&&Math.hypot(n.x-b.x,n.y-b.y)<15){n.hp-=35;b.life=0;}}
  w.bullets=w.bullets.filter(b=>b.life>0);w.flash=Math.max(0,w.flash-dt);w.punch=Math.max(0,w.punch-dt);
  for(const pick of w.pickups) if(Math.hypot(p.x-pick.x,p.y-pick.y)<35){if(pick.type==='ammo')p.ammo+=24;else p.health=100;pick.x=-999;w.audio.play('pickup');}
}
