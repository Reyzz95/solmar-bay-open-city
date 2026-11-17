import { TUNING } from './config.js';
import { blocked } from './city.js';

export function createPlayer() {
  return { x: 1106, y: 1110, angle: 0, health: 100, cash: 0, wanted: 0, ammo: 36, car: null, heat: 0, cooldown: 0 };
}

export function enterCar(w, player) {
  const car = w.cars.find(candidate => Math.hypot(candidate.x - player.x, candidate.y - player.y) < 65);
  if (!car) return;
  player.car = car; player.wanted = Math.min(5, player.wanted + 1); player.heat = 0; w.audio.play('pickup');
}

export function exitCar(w, player) {
  const car = player.car;
  const x = car.x + Math.cos(car.angle + Math.PI / 2) * 40;
  const y = car.y + Math.sin(car.angle + Math.PI / 2) * 40;
  if (!blocked(w.city, x, y)) { player.car = null; player.x = x; player.y = y; car.speed = 0; }
}

export function updateDriving(w, input, dt) {
  const player = w.player, car = player.car, axis = input.axis();
  car.speed += (-axis.y * TUNING.acceleration - car.speed * .65) * dt;
  car.speed = Math.max(-150, Math.min(car.sports ? 550 : TUNING.maxSpeed, car.speed));
  car.angle += axis.x * dt * 2.4 * Math.min(1, Math.abs(car.speed) / 65) * Math.sign(car.speed || 1);
  const x = car.x + Math.cos(car.angle) * car.speed * dt, y = car.y + Math.sin(car.angle) * car.speed * dt;
  if (!blocked(w.city, x, y, 20)) { car.x = x; car.y = y; }
  else { if (Math.abs(car.speed) > 130) { player.health -= Math.abs(car.speed) * .025; w.audio.play('hit'); } car.speed *= -.25; }
  if (Math.abs(axis.x * car.speed) > 180) w.skids.push({ x: car.x, y: car.y, angle: car.angle, life: 8 });
  player.x = car.x; player.y = car.y; player.angle = car.angle;
}

export function updateOnFoot(w, input, dt) {
  const player = w.player, axis = input.axis(), length = Math.hypot(axis.x, axis.y) || 1;
  const x = player.x + axis.x / length * TUNING.walk * dt;
  const y = player.y + axis.y / length * TUNING.walk * dt;
  if (!blocked(w.city, x, player.y)) player.x = x;
  if (!blocked(w.city, player.x, y)) player.y = y;
  player.angle = Math.atan2(input.mouse.y - innerHeight / 2, input.mouse.x - innerWidth / 2);
}

function updateWanted(w, dt) {
  const player = w.player;
  if (!player.wanted) return;
  const nearPolice = w.cars.some(car => car.police && Math.hypot(car.x - player.x, car.y - player.y) < 430);
  player.heat += nearPolice ? -dt * 2 : dt; player.heat = Math.max(0, player.heat);
  if (player.heat > 9) { player.wanted--; player.heat = 0; }
}

export function updatePlayer(w, input, dt) {
  const player = w.player;
  if (input.tap('KeyE')) { if (player.car) exitCar(w, player); else enterCar(w, player); }
  if (player.car) updateDriving(w, input, dt); else updateOnFoot(w, input, dt);
  updateWanted(w, dt);
  player.health = Math.min(100, player.health + dt * .4);
}
