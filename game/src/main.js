import { STEP, BEST_KEY } from './config.js';
import { createRandom } from './random.js';
import { createInput } from './input.js';
import { createCity } from './city.js';
import { populateCars, updateVehicles } from './vehicles.js';
import { populatePeople, updatePeople } from './people.js';
import { createPlayer, updatePlayer } from './player.js';
import { createMission, updateMissions } from './missions.js';
import { updateCombat } from './combat.js';
import { createAudio } from './audio.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') ?? Math.floor(Math.random() * 4294967296));
const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);
const audio = createAudio();
const input = createInput(canvas);
let best = { cash: 0, missions: 0 };

try {
  const data = JSON.parse(localStorage.getItem(BEST_KEY));
  if (data) best = { cash: Number(data.cash) || 0, missions: Number(data.missions) || 0 };
} catch {}

let w;

function reset() {
  const rng = createRandom(seed);
  w = {
    rng, city: createCity(rng), player: createPlayer(), mission: createMission(), cars: [], people: [], bullets: [], skids: [],
    pickups: [{ x: 1120, y: 1050, type: 'ammo' }, { x: 390, y: 2150, type: 'health' }, { x: 1820, y: 2125, type: 'ammo' }, { x: 2490, y: 760, type: 'health' }],
    time: 0, noise: 0, flash: 0, punch: 0, nextCop: 0, bust: 0, audio, screen: 'title', best, muted: false, notice: '',
    save() {
      best.cash = Math.max(best.cash, w.player.cash); best.missions = Math.max(best.missions, w.mission.index);
      try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch {}
    }
  };
  populateCars(w); populatePeople(w);
}

function setScreen(screen) { w.screen = screen; }

function stepWorld() {
  w.time += STEP;
  updateMissions(w, input, STEP);
  if (w.screen !== 'play') return false;
  updatePlayer(w, input, STEP); updateVehicles(w, STEP); updatePeople(w, STEP); updateCombat(w, input, STEP);
  for (const skid of w.skids) skid.life -= STEP;
  w.skids = w.skids.filter(skid => skid.life > 0).slice(-200);
  audio.update(w);
  if (w.player.health <= 0 || w.bust >= 3) { setScreen('over'); w.save(); }
  return true;
}

function handleInput() {
  if (input.tap('KeyM')) { audio.unlock(); w.muted = audio.toggle(); }
  if (input.tap('Enter')) {
    audio.unlock();
    if (w.screen === 'title' || w.screen === 'over') { reset(); setScreen('play'); }
    else if (w.screen === 'paused' || w.screen === 'complete') setScreen('play');
  }
  if (input.pause()) {
    if (w.screen === 'play') setScreen('paused');
    else if (w.screen === 'paused') setScreen('play');
  }
}

function updateStatus(announced) {
  const message = w.screen + ' · ' + (w.mission.legend ? 'Solmar Legend' : w.mission.active ? 'Mission ' + (w.mission.index + 1) : 'Meet Marisol') + ' · Wanted ' + w.player.wanted;
  if (message !== announced) { status.textContent = message; return message; }
  return announced;
}

function boot() {
  reset();
  const shot = params.get('shot');
  if (shot) {
    stageShot(shot, w);
    requestAnimationFrame(() => { renderer.draw(w); requestAnimationFrame(() => { renderer.draw(w); window.__shotReady = true; }); });
    return;
  }
  let last = performance.now(), accumulator = 0, announced = '';
  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min(.25, (now - last) / 1000); last = now;
    handleInput();
    if (w.screen === 'play') {
      while (accumulator >= STEP) {
        if (!stepWorld()) { accumulator = 0; break; }
        accumulator -= STEP;
      }
    } else accumulator = 0;
    announced = updateStatus(announced);
    renderer.draw(w);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden && w.screen === 'play') setScreen('paused'); });
  requestAnimationFrame(frame);
}

boot();
