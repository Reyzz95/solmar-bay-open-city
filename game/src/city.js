import { SIZE, GRID } from './config.js';
export function createCity(rng) {
  const buildings = [], parks = [], palms = [], spawns = [];
  for (let x = 0; x < 7; x++) for (let y = 0; y < 8; y++) {
    const bx = x * GRID + 80, by = y * GRID + 80;
    if ((x + y) % 7 === 2) parks.push({ x: bx, y: by, w: 220, h: 220 });
    else for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) buildings.push({ x: bx + i * 112, y: by + j * 112, w: 82 + rng() * 15, h: 80 + rng() * 16, color: ['#e5b99c','#e9d7a9','#a4bfba','#c49691'][Math.floor(rng()*4)], tall: rng() > .5 });
    spawns.push({ x: x * GRID + 26, y: y * GRID + 160, angle: Math.PI / 2 });
  }
  for (let i = 0; i < 120; i++) palms.push({ x: 2530 + rng()*140, y: rng()*SIZE, size: 16+rng()*10 });
  const locations = { marina: { x: 2540, y: 730 }, safehouse: { x: 390, y: 2190 }, garage: { x: 1820, y: 2180 }, docks: { x: 2550, y: 2530 }, van: { x: 1470, y: 390 }, contact: { x: 1090, y: 1110 } };
  return { buildings, parks, palms, spawns, locations };
}
export function blocked(city, x, y, radius = 10) {
  return x < radius || y < radius || x > 2690 || y > SIZE-radius || city.buildings.some(b => x > b.x-radius && x < b.x+b.w+radius && y > b.y-radius && y < b.y+b.h+radius);
}
