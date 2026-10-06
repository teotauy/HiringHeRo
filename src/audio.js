// Tiny WebAudio chiptune engine: NES-style pulse leads, triangle bass, noise drums.
// Browsers only allow sound after a tap or key press, so call unlock() from an input handler.

let ctx = null;
let master = null;
let pulse = null;
let noiseBuf = null;
let muted = false;
let music = null;

try { muted = localStorage.getItem('hh-muted') === '1'; } catch { /* storage blocked */ }

export function unlock() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      pulse = makePulse(0.25);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch { ctx = null; }
}

export const isMuted = () => muted;

export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('hh-muted', m ? '1' : '0'); } catch { /* storage blocked */ }
  if (master) master.gain.value = m ? 0 : 0.5;
}

// 25% duty pulse wave, the classic NES lead sound.
function makePulse(duty) {
  const n = 32;
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let k = 1; k < n; k++) imag[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
  return ctx.createPeriodicWave(real, imag);
}

const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
function freq(name) {
  const m = name.match(/^([A-G]#?)(\d)$/);
  const midi = (Number(m[2]) + 1) * 12 + NOTE[m[1]];
  return 440 * 2 ** ((midi - 69) / 12);
}

function tone(f, t, dur, { wave = 'pulse', vol = 0.12, slideTo = null, dest = master } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  if (wave === 'pulse') o.setPeriodicWave(pulse); else o.type = wave;
  o.frequency.setValueAtTime(f, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.setValueAtTime(vol, t + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(t, dur, vol = 0.08, hp = 6000, dest = master) {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = hp;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(dest);
  s.start(t);
  s.stop(t + dur);
}

export function sfx(name) {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  switch (name) {
    case 'move': tone(freq('E6'), t, 0.05, { vol: 0.08 }); break;
    case 'select': tone(freq('C6'), t, 0.06); tone(freq('G6'), t + 0.06, 0.1); break;
    case 'jump': tone(220, t, 0.16, { slideTo: 660, vol: 0.08 }); break;
    case 'fire': tone(1400, t, 0.06, { slideTo: 700, vol: 0.05 }); break;
    case 'break': noise(t, 0.15, 0.12, 1500); break;
    case 'hurt': tone(300, t, 0.25, { wave: 'sawtooth', slideTo: 70, vol: 0.08 }); break;
    case 'free':
      ['C5', 'E5', 'G5', 'C6', 'E6'].forEach((n, i) => tone(freq(n), t + i * 0.06, 0.12, { vol: 0.09 }));
      break;
    case 'start':
      ['G4', 'C5', 'E5', 'G5', 'E5', 'G5', 'C6'].forEach((n, i) => tone(freq(n), t + i * 0.08, i === 6 ? 0.5 : 0.1));
      break;
    default: break;
  }
}

// Original title theme, A minor. [note, length in eighth notes]; '-' is a rest.
const LEAD = [
  ['A4', 2], ['C5', 1], ['E5', 1], ['A5', 2], ['G5', 1], ['E5', 1],
  ['F5', 2], ['E5', 1], ['C5', 1], ['A4', 2], ['C5', 2],
  ['G4', 1], ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 2], ['C5', 2],
  ['D5', 2], ['B4', 1], ['G4', 1], ['B4', 2], ['D5', 2],
  ['A4', 1], ['A4', 1], ['C5', 1], ['E5', 1], ['A5', 2], ['C6', 2],
  ['B5', 1], ['A5', 1], ['G5', 1], ['F5', 1], ['E5', 2], ['C5', 2],
  ['D5', 2], ['F5', 2], ['E5', 2], ['G#5', 2],
  ['A5', 4], ['-', 4],
];
const BASS = ['A2', 'E3', 'A2', 'E3', 'F2', 'C3', 'F2', 'C3', 'C3', 'G3', 'C3', 'G3', 'G2', 'D3', 'G2', 'D3',
  'A2', 'E3', 'A2', 'E3', 'F2', 'C3', 'F2', 'C3', 'D3', 'A3', 'E2', 'B2', 'A2', 'E3', 'A2', 'A2'];
const EIGHTH = 0.19;

export function playTitleMusic() {
  if (!ctx || music) return;
  const loopLen = 64 * EIGHTH;
  let loopStart = ctx.currentTime + 0.1;
  // Music gets its own gain node so stopping it silences queued notes without muting sound effects.
  const bus = ctx.createGain();
  bus.connect(master);
  const schedule = (t0) => {
    let t = t0;
    for (const [n, len] of LEAD) {
      if (n !== '-') tone(freq(n), t, len * EIGHTH * 0.92, { vol: 0.07, dest: bus });
      t += len * EIGHTH;
    }
    BASS.forEach((n, i) => tone(freq(n), t0 + i * 2 * EIGHTH, 2 * EIGHTH * 0.9, { wave: 'triangle', vol: 0.16, dest: bus }));
    for (let i = 0; i < 64; i++) {
      noise(t0 + i * EIGHTH, 0.03, i % 2 ? 0.02 : 0.035, 6000, bus);
      if (i % 4 === 0) tone(150, t0 + i * EIGHTH, 0.1, { wave: 'sine', slideTo: 45, vol: 0.18, dest: bus });
    }
  };
  schedule(loopStart);
  const timer = setInterval(() => {
    if (ctx.currentTime > loopStart + loopLen - 1) { loopStart += loopLen; schedule(loopStart); }
  }, 250);
  music = { timer, bus };
}

export function stopMusic() {
  if (!music) return;
  clearInterval(music.timer);
  const { bus } = music;
  bus.gain.setValueAtTime(0, ctx.currentTime);
  setTimeout(() => bus.disconnect(), 200);
  music = null;
}
