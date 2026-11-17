import { COLORS as C, SIZE, GRID } from './config.js';
import { objective, STORIES } from './missions.js';

export function createRenderer(canvas) {
  const c = canvas.getContext('2d');
  let width, height, cam;

  function rect(x, y, w, h, color) { c.fillStyle = color; c.fillRect(x, y, w, h); }
  function text(str, x, y, size = 14, color = '#edf5df', font = 'sans-serif') { c.fillStyle = color; c.font = `${size}px ${font}`; c.fillText(str, x, y); }
  function line(x, y, x2, y2, color, width = 1) { c.strokeStyle = color; c.lineWidth = width; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke(); }
  function circle(x, y, r, color) { c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }

  function drawCar(v, time) {
    c.save(); c.translate(v.x, v.y); c.rotate(v.angle);
    rect(-24, -13, 48, 26, '#172f36'); rect(-23, -17, 14, 5, '#25383c'); rect(10, -17, 12, 5, '#25383c');
    rect(-23, 12, 14, 5, '#25383c'); rect(10, 12, 12, 5, '#25383c'); rect(-26, -12, 51, 24, v.color);
    rect(-7, -10, 19, 20, '#1b4857'); rect(-5, -8, 5, 16, '#5d999f'); rect(-20, -10, 9, 20, v.color);
    rect(22, -10, 3, 6, '#fff3ae'); rect(22, 5, 3, 6, '#fff3ae'); rect(-26, -11, 3, 5, '#ef715b'); rect(-26, 6, 3, 5, '#ef715b');
    if (v.police) { rect(-4, -13, 9, 26, '#294554'); rect(0, -10, 5, 9, Math.sin(time * 12) > 0 ? '#ff685e' : '#8fd5f7'); rect(0, 2, 5, 9, Math.sin(time * 12) < 0 ? '#ff685e' : '#8fd5f7'); }
    c.restore();
  }

  function drawPerson(p, player = false) {
    if (p.hp <= 0) { circle(p.x, p.y, 10, '#876e60'); return; }
    c.save(); c.translate(p.x, p.y); c.rotate(p.angle || 0);
    circle(2, 3, 11, '#152f3655'); rect(-7, -8, 13, 16, player ? '#f1ece0' : p.color || '#f97b62'); circle(2, 0, 6, '#b97c58');
    if (player) { rect(5, 6, 15, 4, '#223a40'); rect(-8, -7, 4, 14, '#e57360'); }
    c.restore();
  }

  function drawPalm(p) {
    line(p.x + 8, p.y + 12, p.x, p.y, '#8b8461', 5);
    for (let i = 0; i < 7; i++) { const a = i * Math.PI * 2 / 7; line(p.x, p.y, p.x + Math.cos(a) * p.size, p.y + Math.sin(a) * p.size, '#397c66', 6); }
    circle(p.x, p.y, 4, '#d6bb73');
  }

  function drawCity(w) {
    rect(0, 0, SIZE, SIZE, C.pavement); rect(2500, 0, 220, SIZE, C.sand); rect(2720, 0, 280, SIZE, C.water);
    for (let y = 0; y < SIZE; y += 32) line(2740 + Math.sin(y * .05 + w.time) * 10, y, 2995, y, '#6db9b0', 1);
    for (let n = 0; n <= 8; n++) { const a = n * GRID; rect(a - 50, 0, 100, SIZE, C.road); if (a < 2500) rect(0, a - 50, 2500, 100, C.road); for (let d = 0; d < SIZE; d += 45) { rect(a - 1, d, 2, 20, '#d6cb9770'); if (d < 2500) rect(d, a - 1, 20, 2, '#d6cb9770'); } }
    for (let x = 0; x < 7; x++) for (let y = 0; y < 8; y++) { const a = x * GRID, b = y * GRID; for (let j = -3; j <= 3; j++) { rect(a + 57, b + j * 9 - 3, 22, 4, '#e8dfbc'); rect(a + j * 9 - 3, b + 57, 4, 22, '#e8dfbc'); } }
    for (const p of w.city.parks) { rect(p.x, p.y, p.w, p.h, C.grass); line(p.x + 10, p.y + 110, p.x + 210, p.y + 110, '#d8c9a0', 14); circle(p.x + 110, p.y + 110, 30, '#b7c6a1'); circle(p.x + 110, p.y + 110, 23, '#69aaa3'); for (let j = 0; j < 4; j++) drawPalm({ x: p.x + 30 + (j % 2) * 155, y: p.y + 30 + Math.floor(j / 2) * 155, size: 23 }); }
    for (const b of w.city.buildings) { rect(b.x + 10, b.y + 12, b.w, b.h, '#233d3c35'); rect(b.x, b.y, b.w, b.h, '#7c8780'); rect(b.x, b.y - 5, b.w, b.h, b.color); rect(b.x + 5, b.y, b.w - 10, b.h - 10, '#ffffff15'); rect(b.x + 10, b.y + 12, 22, 17, '#687f7c'); rect(b.x + 13, b.y + 15, 16, 3, '#c5ccc0'); if (b.tall) rect(b.x + b.w - 29, b.y + 30, 21, 32, '#d5d6be'); for (let k = 8; k < b.w - 8; k += 18) rect(b.x + k, b.y + b.h - 8, 10, 4, '#566e70'); }
    for (const p of w.city.palms) drawPalm(p);
    for (let y = 650; y < 2800; y += 900) { rect(2630, y, 260, 48, '#9d8866'); for (let x = 2640; x < 2890; x += 15) line(x, y, x, y + 48, '#baa27b', 2); rect(2830, y + 60, 63, 25, '#f4e6c4'); rect(2845, y + 64, 32, 17, '#567b80'); }
    c.save(); c.globalAlpha = .24; text('SOLMAR', 2770, 420, 34, '#eef3cc'); text('BAY', 2800, 460, 34, '#eef3cc'); c.restore();
    text('PALM QUARTER', 810, 1015, 14, '#4c6a66'); text('MARINA / 02', 2370, 620, 16, '#596d65'); text('VEGA AUTO', 1840, 2240, 14, '#3b5555');
  }

  function drawVehicles(w) { for (const v of w.cars) drawCar(v, w.time); if (w.mission.index === 4 && !w.mission.phase) drawCar({ ...w.city.locations.van, angle: 0, color: '#e7d7a9' }, w.time); }
  function drawPeople(w) { for (const p of w.people) drawPerson(p); for (const d of w.mission.debtors) { drawPerson(d); if (d.hp > 0) text('$', d.x - 6, d.y - 20, 20, C.coral); } }
  function drawPlayer(w) { if (!w.player.car) drawPerson(w.player, true); }

  function drawSkids(w) { for (const s of w.skids) { c.save(); c.translate(s.x, s.y); c.rotate(s.angle); rect(-8, -13, 17, 3, '#182d3444'); rect(-8, 10, 17, 3, '#182d3444'); c.restore(); } }
  function drawPickups(w) { for (const p of w.pickups) { if (p.x < 0) continue; circle(p.x, p.y, 15, p.type === 'ammo' ? '#e8b774' : '#b8f6c5'); text(p.type === 'ammo' ? '•••' : '+', p.x - 9, p.y + 5, 18, C.ink); } }
  function drawCombat(w) { for (const b of w.bullets) line(b.x, b.y, b.x - Math.cos(b.angle) * 14, b.y - Math.sin(b.angle) * 14, '#fff3b8', 3); if (w.flash) circle(w.player.x + Math.cos(w.player.angle) * 27, w.player.y + Math.sin(w.player.angle) * 27, 12, '#ffe3a1'); if (w.punch) { c.strokeStyle = C.coral; c.lineWidth = 4; c.beginPath(); c.arc(w.player.x, w.player.y, 35, w.player.angle - .7, w.player.angle + .7); c.stroke(); } }

  function drawMarker(w, target) { if (!target) return; const pulse = 1 + Math.sin(w.time * 3) * .07; circle(target.x, target.y, 42 * pulse, '#b8f6c522'); c.strokeStyle = C.mint; c.lineWidth = 3; c.beginPath(); c.arc(target.x, target.y, 30 * pulse, 0, Math.PI * 2); c.stroke(); line(target.x - 12, target.y, target.x + 12, target.y, C.mint, 3); line(target.x, target.y - 12, target.x, target.y + 12, C.mint, 3); text('▼', target.x - 8, target.y - 45, 22, C.mint); }

  function drawMinimap(w) {
    const x = width - 211, y = 30, s = 180 / 3000;
    rect(x - 10, y - 10, 200, 216, '#102e36ef'); c.save(); c.translate(x, y); rect(0, 0, 180, 180, '#a7b49a'); rect(151, 0, 12, 180, C.sand); rect(163, 0, 17, 180, C.water);
    for (let i = 0; i <= 8; i++) { rect(i * 360 * s - 2, 0, 4, 180, C.road); rect(0, i * 360 * s - 2, 151, 4, C.road); }
    for (const cop of w.cars.filter(v => v.police)) circle(cop.x * s, cop.y * s, 2.8, C.coral);
    const target = objective(w).target; if (target) circle(target.x * s, target.y * s, 4, C.mint); circle(w.player.x * s, w.player.y * s, 4, '#fff6da'); c.restore();
    text('SOLMAR BAY', x, y + 199, 11, C.mint); text('N ↑', x + 145, y + 199, 11);
  }

  function drawMissionPanel(w) {
    rect(28, height - 118, Math.min(width - 56, 760), 90, '#102e36ef'); rect(28, height - 118, 4, 90, C.mint);
    text(w.mission.legend ? 'SOLMAR LEGEND' : w.mission.active ? String(w.mission.index + 1).padStart(2, '0') + ' / ' + STORIES[w.mission.index].name.toUpperCase() : 'MARISOL VEGA / NEW CONTRACT', 48, height - 92, 13, C.mint);
    text(objective(w).text, 48, height - 65, 16); text(w.mission.active ? 'TIME ' + Math.ceil(w.mission.timer) + 's  •  REWARD $' + STORIES[w.mission.index].reward : 'A courier. A city. A way out.', 48, height - 44, 11, '#b5c6bd');
  }

  function drawHud(w) {
    const p = w.player; rect(28, 28, 290, 132, '#102e36ef'); text('DANA CRUZ', 46, 53, 12, C.mint); text('$' + p.cash.toLocaleString(), 46, 84, 28);
    text('★'.repeat(p.wanted) + '☆'.repeat(5 - p.wanted), 172, 54, 20, p.wanted ? C.coral : '#809b95'); rect(46, 104, 160, 7, '#49605d'); rect(46, 104, 160 * p.health / 100, 7, p.health > 30 ? C.mint : C.coral);
    text(Math.ceil(p.health) + ' HP', 222, 113, 12); text('PISTOL ' + p.ammo + '  /  ' + (w.muted ? 'MUTED' : 'M · SOUND'), 46, 130, 10, '#b5c6bd');
    const clock = String(Math.floor(10 + w.time / 60) % 24).padStart(2, '0') + ':' + String(Math.floor(w.time) % 60).padStart(2, '0');
    text(clock + '  /  ' + (p.car ? Math.round(Math.abs(p.car.speed) * .22) + ' KM/H' : 'ON FOOT'), 46, 151, 12, '#e5e8cd');
    drawMinimap(w); drawMissionPanel(w);
    const target = objective(w).target;
    if (target) { const dx = target.x - p.x, dy = target.y - p.y, dist = Math.hypot(dx, dy); if (dist > 250) { const a = Math.atan2(dy, dx), x = width / 2 + Math.cos(a) * Math.min(width * .32, 330), y = height / 2 + Math.sin(a) * Math.min(height * .28, 170); circle(x, y, 19, '#173f42'); text('◆', x - 7, y + 5, 18, C.mint); text(Math.round(dist) + ' m', x - 22, y + 37, 12, C.mint); } }
    if (w.mission.active && w.mission.banner > 0) { rect(width / 2 - 310, 148, 620, 60, '#102e36ef'); text(STORIES[w.mission.index].brief, width / 2 - 294, 183, 13, '#f6e3bd'); }
    const hint = 'WASD MOVE  •  E ENTER CAR  •  SPACE PUNCH  •  CLICK FIRE  •  P PAUSE';
    c.font = '12px sans-serif'; const hintWidth = c.measureText(hint).width; const hintX = Math.max(12, (width - hintWidth) / 2);
    rect(0, height - 32, width, 32, '#102e36dd'); text(hint, hintX, height - 11, 12, '#e5e8cd');
  }

  function drawTitle(w) {
    rect(0, 0, width, height, '#082c3e60'); rect(0, 0, width * .56, height, '#102e36e8');
    text('AN ORIGINAL COASTAL CRIME STORY', 64, 110, 13, C.mint); text('SOLMAR', 58, 219, 88, '#f4e9c9', 'Georgia'); text('BAY', 58, 306, 106, '#f4e9c9', 'Georgia');
    rect(64, 339, 65, 5, C.coral); text('Salt air. Fast money. Long shadows.', 64, 389, 22, '#e1d5b5', 'Georgia'); text('You are Dana Cruz. A courier with one last delivery.', 64, 429, 14); text('Marisol Vega has other plans.', 64, 454, 14);
    rect(64, 493, 282, 53, C.mint); text('ENTER  /  HIT THE STREETS', 84, 526, 15, C.ink); text('WASD / ARROWS • DRIVE & WALK', 64, 587, 12, '#b1c3b8'); text('E • ENTER / EXIT     SPACE • PUNCH     MOUSE • AIM & FIRE', 64, 612, 11, '#b1c3b8'); text('BEST $' + w.best.cash + '  /  ' + w.best.missions + ' CONTRACTS', 64, 653, 11, C.mint);
  }

  function drawScreens(w) {
    if (w.screen === 'title') { drawTitle(w); return; }
    if (w.screen === 'play') return;
    rect(0, 0, width, height, '#0b2838bb');
    const label = w.screen === 'paused' ? 'CITY ON HOLD' : w.screen === 'complete' ? w.notice : w.bust >= 3 ? 'BUSTED' : 'WASTED';
    text(label, width / 2 - c.measureText(label).width / 2 - 80, height / 2 - 30, 46, w.screen === 'over' ? C.coral : C.mint, 'Georgia');
    text(w.screen === 'complete' ? 'Cash secured. Marisol is waiting.' : w.screen === 'paused' ? 'Take a breath. The bay can wait.' : 'Every city gives you another chance.', width / 2 - 170, height / 2 + 20, 17);
    text('ENTER TO ' + (w.screen === 'over' ? 'RESTART' : 'CONTINUE'), width / 2 - 85, height / 2 + 70, 14, C.mint);
  }

  function drawWorld(w) {
    c.save(); c.translate(-cam.x, -cam.y); drawCity(w); drawSkids(w); drawPickups(w); drawPeople(w); drawVehicles(w); drawPlayer(w); drawCombat(w); drawMarker(w, objective(w).target); c.restore();
  }

  function draw(w) {
    width = canvas.width = innerWidth; height = canvas.height = innerHeight; cam = { x: w.player.x - width / 2, y: w.player.y - height / 2 };
    rect(0, 0, width, height, C.water); drawWorld(w);
    const shade = c.createLinearGradient(0, 0, 0, height); shade.addColorStop(0, '#f9c78012'); shade.addColorStop(1, '#123c3b20'); c.fillStyle = shade; c.fillRect(0, 0, width, height);
    if (w.screen === 'title') { drawTitle(w); return; }
    drawHud(w); drawScreens(w);
  }

  return { draw };
}
