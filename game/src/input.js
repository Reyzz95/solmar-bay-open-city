import { KEYS } from './config.js';
export function createInput(canvas) {
  const held = new Set(), pressed = new Set();
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, down: false };
  addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (!held.has(e.code)) pressed.add(e.code);
    held.add(e.code);
  });
  addEventListener('keyup', e => held.delete(e.code));
  addEventListener('blur', () => { held.clear(); mouse.down = false; });
  canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  canvas.addEventListener('mousedown', () => { mouse.down = true; });
  addEventListener('mouseup', () => { mouse.down = false; });
  return { mouse, held, tap(code) { const yes = pressed.has(code); pressed.delete(code); return yes; },
    axis() { return { x: +(['KeyD','ArrowRight'].some(k => held.has(k))) - +(['KeyA','ArrowLeft'].some(k => held.has(k))), y: +(['KeyS','ArrowDown'].some(k => held.has(k))) - +(['KeyW','ArrowUp'].some(k => held.has(k))) }; },
    pause() { return KEYS.pause.some(k => this.tap(k)); } };
}
