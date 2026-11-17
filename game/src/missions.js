export const STORIES = [
  {name:'First Delivery',reward:600,time:150,brief:'Marisol Vega: Dana, take the coupe to the marina. Keep the parcel dry.'},
  {name:'Getaway Driver',reward:1100,time:200,brief:'Marisol: A runner is waiting at the old market. Pick them up. Lose the patrols.'},
  {name:'Debt Collection',reward:1500,time:240,brief:'Marisol: Three debtors owe us. Go on foot. A firm hand will do.'},
  {name:'Bay Heist Prep',reward:2200,time:220,brief:'Marisol: Bring a sports coupe to my garage. The city will notice.'},
  {name:'The Big Score',reward:5000,time:260,brief:'Marisol: Intercept the bank van. Break the lock on foot, then escape to the docks.'}
];
export function createMission() {return {index:0,active:false,phase:0,timer:0,debtors:[],banner:0,legend:false};}
export function beginMission(w) {
  const m=w.mission;if(m.index>=5)return;
  m.active=true;m.phase=0;m.timer=STORIES[m.index].time;m.banner=5;
  if(m.index===2)m.debtors=[{x:780,y:760,hp:60},{x:1500,y:1130,hp:60},{x:1850,y:1490,hp:60}];
}
export function objective(w) {
  const m=w.mission,p=w.player,l=w.city.locations;
  if(m.legend)return {text:'Solmar Legend • The bay is yours. Free roam.',target:null};
  if(!m.active)return {text:'Meet Marisol Vega • E at the mint marker',target:l.contact};
  if(m.index===0)return {text:p.car?'Deliver the parcel to the marina':'Enter a car with E. Deliver the parcel.',target:l.marina};
  if(m.index===1)return {text:m.phase?'Lose all wanted stars • reach the safehouse':'Pick up the runner in a car',target:m.phase?l.safehouse:{x:750,y:1100}};
  if(m.index===2)return {text:'On foot: Space to confront 3 debtors • '+m.debtors.filter(d=>d.hp<=0).length+'/3',target:m.debtors.find(d=>d.hp>0)};
  if(m.index===3)return {text:m.phase?'Deliver the sports coupe to the garage':'Steal a sports coupe • E to enter',target:m.phase?l.garage:w.cars.find(c=>c.sports)};
  return {text:m.phase?'Lose the patrols • escape to the docks':'On foot: Space to break the bank van lock',target:m.phase?l.docks:l.van};
}
function updateFirstDelivery(w, near) { return near && !!w.player.car; }
function updateGetawayDriver(w, near) {
  const m = w.mission, p = w.player;
  if (!m.phase && near && p.car) { m.phase = 1; p.wanted = 2; p.heat = 0; }
  else if (m.phase && near && !p.wanted) return true;
  return false;
}
function updateDebtCollection(w) {
  const m = w.mission, p = w.player;
  for (const debtor of m.debtors) if (debtor.hp <= 0 && !debtor.paid) { debtor.paid = true; p.cash += 100; w.audio.play('pickup'); }
  return m.debtors.every(debtor => debtor.paid);
}
function updateBayHeistPrep(w, near) {
  const m = w.mission, p = w.player;
  if (!m.phase && p.car?.sports) { m.phase = 1; p.wanted = 3; p.heat = 0; }
  return m.phase && near && p.car?.sports;
}
function updateBigScore(w, near) {
  const m = w.mission, p = w.player;
  if (!m.phase && near && !p.car && w.punch > 0) { m.phase = 1; p.wanted = 4; p.heat = 0; p.cash += 2000; w.audio.play('pickup'); }
  else if (m.phase && near && !p.wanted) return true;
  return false;
}
const missionUpdates = [updateFirstDelivery, updateGetawayDriver, updateDebtCollection, updateBayHeistPrep, updateBigScore];

function completeMission(w) {
  const m = w.mission, p = w.player;
  p.cash += STORIES[m.index].reward; m.index++; m.active = false; m.banner = 4; w.screen = 'complete'; w.audio.play('mission');
  w.notice = m.index === 5 ? 'SOLMAR LEGEND' : 'CONTRACT COMPLETE';
  if (m.index === 5) m.legend = true;
  w.save();
}

export function updateMissions(w, input, dt) {
  const m = w.mission, p = w.player;
  m.banner = Math.max(0, m.banner - dt);
  if (!m.active) {
    if (!m.legend && Math.hypot(p.x - w.city.locations.contact.x, p.y - w.city.locations.contact.y) < 95 && (input.held.has('KeyE') || input.tap('Enter'))) beginMission(w);
    return;
  }
  m.timer -= dt;
  if (m.timer <= 0) { m.active = false; m.banner = 4; w.notice = 'Time ran out. Return to Marisol to retry.'; return; }
  const target = objective(w).target, near = target && Math.hypot(p.x - target.x, p.y - target.y) < 85;
  if (missionUpdates[m.index](w, near)) completeMission(w);
}
