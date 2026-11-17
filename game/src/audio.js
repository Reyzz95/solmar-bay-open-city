export function createAudio() {
  let ctx, muted = false, engine;
  function tone(freq, duration, type = 'sine', volume = .07, end = freq) {
    if (muted || !ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(Math.max(20,end), ctx.currentTime+duration);
    g.gain.setValueAtTime(volume, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+duration);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+duration);
  }
  return { unlock() { ctx ??= new AudioContext(); ctx.resume(); }, toggle() { muted = !muted; return muted; },
    play(name) { if (name === 'shot') tone(160,.13,'sawtooth',.08,30); else if (name === 'hit') tone(85,.12,'square'); else { tone(440,.15); setTimeout(() => tone(name === 'mission' ? 880 : 660,.3),120); } },
    update(w) { if (!ctx || muted) return; if (w.time > (engine || 0)) { engine=w.time+.25; if(w.player.car) tone(45+Math.abs(w.player.car.speed)*.25,.27,'sawtooth',.015); if(w.player.wanted && w.cars.some(c=>c.police)) tone(550+Math.sin(w.time*5)*220,.28,'sine',.022); } } };
}
