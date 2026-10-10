//#part 190_sound.js
/* =====================================================================
   ЗВУК: 8-бітна музика та ефекти через Web Audio API (без аудіофайлів)
   ===================================================================== */

const audio = {
  ctx: null, master: null, musicGain: null, sfxGain: null, noiseBuf: null,
  track: null, timer: null, lastTick: 0, lastTyping: 0
};
const MUSIC_PARSED = {};      // розібрані мелодії: канали з подіями { step, len, tok }
const NOTE_INDEX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// «C#5» → частота в герцах
function noteFreq(name) {
  const m = /^([A-G])([#b]?)(\d)$/.exec(name);
  if (!m) return 0;
  let n = NOTE_INDEX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  n += (Number(m[3]) + 1) * 12;               // номер MIDI
  return 440 * Math.pow(2, (n - 69) / 12);
}

// Розбирає мелодії з масивів нот у списки подій
function parseMusic() {
  Object.keys(MUSIC).forEach(id => {
    const def = MUSIC[id];
    const channels = def.channels.map(ch => {
      const text = Array.isArray(ch.pattern) ? ch.pattern.join(' ') : ch.pattern;
      let step = 0;
      const events = text.trim().split(/\s+/).map(tok => {
        const [name, len] = tok.split(':');
        const e = { step, len: parseInt(len, 10) || 1, tok: name };
        step += e.len;
        return e;
      });
      return { wave: ch.wave, vol: ch.vol, events, total: step };
    });
    const total = channels[0].total;
    channels.forEach(c => { if (c.total !== total) console.warn('Музика «' + id + '»: канал має ' + c.total + ' кроків замість ' + total); });
    MUSIC_PARSED[id] = { bpm: def.bpm, channels, total };
  });
}

/* ---------- Запуск і гучність ---------- */
// Браузери дозволяють звук лише після першого дотику — тому створюємо контекст у відповідь на жест
function initAudio() {
  if (audio.ctx) { resumeAudio(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try {
    const ac = new AC();
    audio.ctx = ac;
    const comp = ac.createDynamicsCompressor();
    audio.master = ac.createGain();
    audio.musicGain = ac.createGain();
    audio.sfxGain = ac.createGain();
    audio.musicGain.connect(audio.master);
    audio.sfxGain.connect(audio.master);
    audio.master.connect(comp);
    comp.connect(ac.destination);
    // білий шум для ударних (1 секунда, перевикористовується)
    const buf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    audio.noiseBuf = buf;
    applyVolumes(true);
    audio.timer = setInterval(tickMusic, 40);
    resumeAudio();
    updateMusic();
  } catch (e) {
    audio.ctx = null;
  }
}
// «Будить» звук на телефонах: iPhone і Android засинають, поки не було дотику; resume() треба викликати прямо в обробнику дотику.
// Тихий порожній звук допомагає iOS остаточно «розблокувати» аудіо.
function unlockSilent() {
  try {
    const ac = audio.ctx, src = ac.createBufferSource();
    src.buffer = ac.createBuffer(1, 1, 22050);
    src.connect(ac.destination);
    src.start(0);
  } catch (e) { /* нічого */ }
}
function resumeAudio() {
  const ac = audio.ctx;
  if (!ac || document.hidden) return;
  if (ac.state !== 'running') {
    const p = ac.resume();
    if (p && p.then) p.then(unlockSilent, () => {});
  }
  unlockSilent();
}
function applyVolumes(instant) {
  if (!audio.ctx) return;
  const s = state.settings;
  const m = s.muted ? 0 : s.musicVol * 0.55, f = s.muted ? 0 : s.sfxVol * 0.9;
  const now = audio.ctx.currentTime;
  if (instant) { audio.musicGain.gain.value = m; audio.sfxGain.gain.value = f; return; }
  audio.musicGain.gain.setTargetAtTime(m, now, 0.05);
  audio.sfxGain.gain.setTargetAtTime(f, now, 0.05);
}

/* ---------- Інструменти ---------- */
// Одна нота з простою обвідною (щоб не клацало)
function tone(dest, wave, f0, t0, dur, vol, f1) {
  const ac = audio.ctx;
  const osc = ac.createOscillator(), g = ac.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(f0, t0);
  if (f1) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.006);
  g.gain.setValueAtTime(vol, t0 + Math.max(0.007, dur * 0.65));
  g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g); g.connect(dest);
  osc.start(t0); osc.stop(t0 + dur + 0.03);
}
// Сплеск шуму крізь фільтр — ударні, плюскіт, цокіт молотка
function noiseHit(dest, t0, dur, vol, filterType, freq) {
  const ac = audio.ctx;
  const src = ac.createBufferSource(), flt = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = audio.noiseBuf;
  flt.type = filterType; flt.frequency.value = freq;
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(flt); flt.connect(g); g.connect(dest);
  src.start(t0, Math.random() * 0.5); src.stop(t0 + dur + 0.02);
}
function drum(dest, kind, t0, vol) {
  if (kind === 'k') tone(dest, 'triangle', 150, t0, 0.13, vol * 1.6, 45);
  else if (kind === 's') noiseHit(dest, t0, 0.12, vol, 'bandpass', 1800);
  else if (kind === 'h') noiseHit(dest, t0, 0.05, vol * 0.7, 'highpass', 7000);
}

/* ---------- Музика ---------- */
function desiredTrack() {
  if (theme.holiday && theme.holiday.music && MUSIC[theme.holiday.music]) return theme.holiday.music;
  if (theme.season === 'halloween' && MUSIC.halloween) return 'halloween';
  const st = MUSIC_STYLES[state.settings.musicStyle] || MUSIC_STYLES[0];
  return st.levels[Math.min(st.levels.length, state.shopLevel) - 1] + '#' + (viewEpoch() % EPOCH_MUSIC.length);
}
// Перемикає мелодію плавно: стара стихає, нова наростає
function updateMusic() {
  if (!audio.ctx) return;
  const id = desiredTrack();
  if (audio.track && audio.track.id === id) return;
  const ac = audio.ctx, now = ac.currentTime;
  if (audio.track) {
    const old = audio.track;
    old.stopped = true;
    old.gain.gain.cancelScheduledValues(now);
    old.gain.gain.setTargetAtTime(0, now, 0.15);
    setTimeout(() => { try { old.gain.disconnect(); } catch (e) { /* нічого */ } }, 1600);
  }
  const gain = ac.createGain();
  gain.gain.value = 0;
  gain.gain.setTargetAtTime(1, now + 0.1, 0.25);
  gain.connect(audio.musicGain);
  const def = trackDef(id);
  audio.track = { id, def, gain, start: now + 0.15, pos: def.channels.map(() => ({ idx: 0, loop: 0 })), stopped: false };
}
// Планувальник: заздалегідь ставить у чергу ноти, що зазвучать найближчими 0,25 с
function tickMusic() {
  const ac = audio.ctx, tr = audio.track;
  if (!ac || !tr || tr.stopped || ac.state !== 'running') return;
  const stepDur = 60 / tr.def.bpm / 4;
  const horizon = ac.currentTime + 0.25;
  tr.def.channels.forEach((ch, c) => {
    const p = tr.pos[c];
    for (let guard = 0; guard < 64; guard++) {
      const ev = ch.events[p.idx];
      const t = tr.start + (p.loop * ch.total + ev.step) * stepDur;
      if (t > horizon) break;
      if (t > ac.currentTime - 0.05 && ev.tok !== '.') {
        if (ch.wave === 'noise') drum(tr.gain, ev.tok, t, ch.vol);
        else tone(tr.gain, ch.wave, noteFreq(ev.tok), t, ev.len * stepDur * 0.92, ch.vol);
      }
      p.idx++;
      if (p.idx >= ch.events.length) { p.idx = 0; p.loop++; }
    }
  });
}

/* ---------- Звукові ефекти ---------- */
// мелодія з пар [нота, тривалість]
function melody(wave, notes, vol, gap = 0) {
  const ac = audio.ctx;
  let t = ac.currentTime + 0.01;
  notes.forEach(([n, d]) => {
    if (n !== '.') tone(audio.sfxGain, wave, typeof n === 'number' ? n : noteFreq(n), t, d * 0.95, vol);
    t += d + gap;
  });
}
const SFX_TAP_VARIANTS = [['E5', 'B5'], ['G5', 'C6'], ['D5', 'A5'], ['F#5', 'C#6'], ['A4', 'E5']];       // нижче й м'якше, ніж було (високі квадрати «дзвеніли»)
const SFX = {
  tap() {   // кілька варіантів, щоб не набридало; тріщить усе рідше й тихіше при довгому тапанні
    const ac = audio.ctx, now = ac.currentTime;
    if (now - (SFX._tapLast || 0) < 0.05) return;                                    // не частіше 20 разів на секунду
    SFX._tapRun = now - (SFX._tapAt || 0) < 0.5 ? (SFX._tapRun || 0) + 1 : 0; SFX._tapAt = now; SFX._tapLast = now;
    if (!audio.tapLP) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400; f.Q.value = 0.3; f.connect(audio.sfxGain); audio.tapLP = f; }       // зрізає різкі верхи
    const v = SFX_TAP_VARIANTS[Math.floor(Math.random() * SFX_TAP_VARIANTS.length)], k = Math.max(0.4, 1 - SFX._tapRun * 0.04), t = now + 0.004;
    tone(audio.tapLP, 'triangle', noteFreq(v[0]), t, 0.06, 0.2 * k);
    tone(audio.tapLP, 'sine', noteFreq(v[1]), t + 0.04, 0.1, 0.13 * k);
  },
  buy()       { melody('square', [['C5', 0.05], ['E5', 0.05], ['G5', 0.05], ['C6', 0.12]], 0.22); },
  hire()      { melody('square', [['E5', 0.07], ['G5', 0.07], ['C6', 0.07], ['E6', 0.07], ['G6', 0.2]], 0.22); },
  upgrade()   { melody('square', [['G5', 0.06], ['B5', 0.06], ['D6', 0.14]], 0.22); },
  milestone() { melody('triangle', [['G5', 0.07], ['C6', 0.07], ['E6', 0.07], ['G6', 0.25]], 0.4); },
  circusMarch() {   // восьмитактний цирковий марш: мелодія на квадраті, бас «ум-па»
    const ac = audio.ctx, beat = 60 / 150, t0 = ac.currentTime + 0.05;
    const MEL = [[['C5', .5], ['E5', .5], ['G5', 1], ['E5', .5], ['C5', .5], ['G4', 1]], [['F5', .5], ['A5', .5], ['C6', 1], ['A5', .5], ['F5', .5], ['C5', 1]], [['G5', .5], ['B5', .5], ['D6', 1], ['B5', .5], ['G5', .5], ['D5', 1]], [['E5', 1], ['C5', 1], ['G4', 1], ['C5', 1]], [['C5', .5], ['E5', .5], ['G5', 1], ['C6', 1], ['G5', 1]], [['A5', .5], ['G5', .5], ['F5', 1], ['A5', .5], ['C6', .5], ['A5', 1]], [['B5', .5], ['A5', .5], ['G5', 1], ['F5', .5], ['D5', .5], ['G5', 1]], [['E5', .5], ['D5', .5], ['C5', 1], ['C5', 2]]];
    const BASS = [['C3', 'G3', 'E3'], ['F2', 'C3', 'A2'], ['G2', 'D3', 'B2'], ['C3', 'G3', 'E3'], ['C3', 'G3', 'E3'], ['F2', 'C3', 'A2'], ['G2', 'D3', 'B2'], ['C3', 'G3', 'E3']];
    MEL.forEach((bar, bi) => {
      const t = t0 + bi * 4 * beat; let b = 0;
      bar.forEach(([n, len]) => { tone(audio.sfxGain, 'square', noteFreq(n), t + b * beat, len * beat * 0.9, 0.16); b += len; });
      const [root, fifth, third] = BASS[bi];
      for (let k = 0; k < 4; k++) { if (k % 2 === 0) tone(audio.sfxGain, 'triangle', noteFreq(root), t + k * beat, beat * 0.8, 0.3); else { tone(audio.sfxGain, 'square', noteFreq(third) * 2, t + k * beat, beat * 0.4, 0.08); tone(audio.sfxGain, 'square', noteFreq(fifth) * 2, t + k * beat, beat * 0.4, 0.08); } }
    });
  },
  hagCackle() { melody('sawtooth', [['E6', .07], ['C6', .07], ['E6', .07], ['C6', .07], ['E6', .07], ['A5', .07], ['E6', .07], ['A5', .22]], 0.1); },
  hagTheme() {     // моторошний менует: мелодія в мінорі, бас-піцикато
    const ac = audio.ctx, beat = 60 / 112, t0 = ac.currentTime + 0.05;
    const MEL = [[['A4', .5], ['C5', .5], ['E5', 1], ['D#5', .5], ['E5', .5], ['C5', 1]], [['B4', .5], ['D5', .5], ['F5', 1], ['E5', .5], ['D5', .5], ['B4', 1]], [['A4', .5], ['C5', .5], ['E5', 1], ['A5', 1], ['G#5', 1]], [['A5', .5], ['E5', .5], ['C5', .5], ['A4', .5], ['E4', 2]]];
    const ROOTS = ['A2', 'G2', 'A2', 'E2'];
    MEL.forEach((bar, bi) => {
      const t = t0 + bi * 4 * beat; let b = 0;
      bar.forEach(([n, len]) => { tone(audio.sfxGain, 'square', noteFreq(n), t + b * beat, len * beat * 0.8, 0.12); b += len; });
      for (let k = 0; k < 4; k++) { if (k % 2 === 0) tone(audio.sfxGain, 'triangle', noteFreq(ROOTS[bi]), t + k * beat, beat * 0.7, 0.3); else tone(audio.sfxGain, 'square', noteFreq(ROOTS[bi]) * 3, t + k * beat, beat * 0.25, 0.07); }
    });
  },
  clockBong() {    // глибокий удар дзвону: основний тон і обертони з довгим згасанням
    const ac = audio.ctx, t0 = ac.currentTime + 0.01;
    [[110, 0.5], [220, 0.28], [330, 0.17], [440, 0.09]].forEach(([f, v]) => tone(audio.sfxGain, 'sine', f, t0, 1.8, v));
    tone(audio.sfxGain, 'triangle', 165, t0, 1.2, 0.12); noiseHit(audio.sfxGain, t0, 0.05, 0.3, 'bandpass', 1800);
  },
  paper() { const ac = audio.ctx, t0 = ac.currentTime + 0.01; noiseHit(audio.sfxGain, t0, 0.14, 0.32, 'bandpass', 3200); noiseHit(audio.sfxGain, t0 + 0.08, 0.1, 0.22, 'highpass', 5200); },
  buildTheme() {   // бадьорий будівельний марш (≈8 с): мелодія на квадраті, бас і стукіт молотків
    const ac = audio.ctx, beat = 0.5, t0 = ac.currentTime + 0.05;
    const MEL = [[['G4', .5], ['C5', .5], ['E5', .5], ['C5', .5], ['G4', .5], ['E5', .5], ['G5', 1]], [['F4', .5], ['A4', .5], ['C5', .5], ['A4', .5], ['F5', .5], ['E5', .5], ['D5', 1]], [['E5', .5], ['G5', .5], ['E5', .5], ['C5', .5], ['D5', .5], ['E5', .5], ['G5', 1]], [['G5', .5], ['E5', .5], ['D5', .5], ['B4', .5], ['C5', 2]]];
    const ROOTS = ['C3', 'F2', 'C3', 'G2'];
    MEL.forEach((bar, bi) => {
      const t = t0 + bi * 4 * beat; let b = 0;
      bar.forEach(([n, len]) => { tone(audio.sfxGain, 'square', noteFreq(n), t + b * beat, len * beat * 0.85, 0.13); b += len; });
      for (let k = 0; k < 4; k++) {
        tone(audio.sfxGain, 'triangle', noteFreq(ROOTS[bi]) * (k % 2 ? 2 : 1), t + k * beat, beat * 0.8, 0.28);
        if (k % 2) noiseHit(audio.sfxGain, t + k * beat, 0.05, 0.35, 'bandpass', 2400);          // «тук» молотка на другій і четвертій долі
        else noiseHit(audio.sfxGain, t + k * beat + beat * 0.5, 0.03, 0.18, 'highpass', 5000);
      }
    });
  },
  buildDone() {    // урочиста фанфара, коли магазин добудовано
    melody('square', [['C5', .09], ['E5', .09], ['G5', .09], ['C6', .22], ['G5', .09], ['C6', .09], ['E6', .5]], 0.22);
    const ac = audio.ctx, t = ac.currentTime + 0.05;
    ['C4', 'E4', 'G4'].forEach(n => tone(audio.sfxGain, 'triangle', noteFreq(n), t + 0.5, 1.2, 0.16));
  },
  sale()      { melody('square', [['G5', 0.07], ['C6', 0.07], ['E6', 0.07], ['G6', 0.07], ['E6', 0.07], ['G6', 0.25]], 0.2); },
  hammer() {  // один стукіт молотка по цеглі
    const ac = audio.ctx, t = ac.currentTime + 0.02;
    noiseHit(audio.sfxGain, t, 0.06, 0.55, 'bandpass', 1900);
    tone(audio.sfxGain, 'square', 190, t, 0.07, 0.3, 80);
    tone(audio.sfxGain, 'triangle', 1100, t + 0.015, 0.04, 0.12, 700);
  },
  truckDrive(dur) {   // гуркіт дизельного двигуна вантажівки: низький гул, що тремтить, і шум шин
    const ac = audio.ctx, t = ac.currentTime + 0.02, d = Math.max(0.8, dur || 1.5);
    for (let i = 0; i < Math.ceil(d / 0.09); i++) tone(audio.sfxGain, 'sawtooth', 52 + (i % 3) * 4, t + i * 0.09, 0.1, 0.17, 44);
    tone(audio.sfxGain, 'triangle', 36, t, d, 0.2, 30);
    noiseHit(audio.sfxGain, t, d, 0.1, 'lowpass', 420);
    tone(audio.sfxGain, 'square', 700, t + d - 0.25, 0.12, 0.08, 700);
  },
  truckBrake() {      // пшик пневматичних гальм і стукіт кузова
    const ac = audio.ctx, t = ac.currentTime + 0.02;
    noiseHit(audio.sfxGain, t, 0.55, 0.3, 'highpass', 3500);
    tone(audio.sfxGain, 'sine', 70, t + 0.05, 0.22, 0.3, 40);
    tone(audio.sfxGain, 'square', 330, t + 0.62, 0.08, 0.14, 330); tone(audio.sfxGain, 'square', 440, t + 0.72, 0.1, 0.14, 440);
  },
  concrete() {        // бетон шумить із жолоба й барабан гуркоче
    const ac = audio.ctx, t = ac.currentTime + 0.02;
    noiseHit(audio.sfxGain, t, 1.7, 0.28, 'bandpass', 700);
    noiseHit(audio.sfxGain, t + 0.2, 1.2, 0.12, 'lowpass', 300);
    for (let i = 0; i < 10; i++) tone(audio.sfxGain, 'sawtooth', 70 + (i % 2) * 14, t + i * 0.16, 0.14, 0.12, 55);
  },
  build() {   // стукіт молотків під час будівництва
    const ac = audio.ctx, t0 = ac.currentTime + 0.05;
    for (let i = 0; i < 9; i++) {
      const t = t0 + i * 0.27;
      noiseHit(audio.sfxGain, t, 0.07, 0.5, 'bandpass', 1500);
      tone(audio.sfxGain, 'square', 150, t, 0.06, 0.25, 70);
    }
    noiseHit(audio.sfxGain, t0, 2.4, 0.12, 'lowpass', 600);
  },
  levelup() {
    melody('square', [['C5', 0.1], ['E5', 0.1], ['G5', 0.1], ['C6', 0.22], ['G5', 0.1], ['C6', 0.1], ['E6', 0.1], ['G6', 0.55]], 0.22);
    melody('triangle', [['C4', 0.1], ['E4', 0.1], ['G4', 0.1], ['C5', 0.22], ['G4', 0.1], ['C5', 0.1], ['E5', 0.1], ['G5', 0.55]], 0.35);
  },
  achievement() {
    melody('square', [['E6', 0.07], ['G6', 0.07], ['B6', 0.07], ['E7', 0.28]], 0.2);
    melody('triangle', [['E5', 0.07], ['G5', 0.07], ['B5', 0.07], ['E6', 0.28]], 0.35);
  },
  raccoon()   { melody('triangle', [['E5', 0.12], ['D#5', 0.12], ['D5', 0.12], ['C#5', 0.12], ['C5', 0.25]], 0.5); },
  hit() {
    tone(audio.sfxGain, 'square', 760, audio.ctx.currentTime, 0.14, 0.25, 280);
    noiseHit(audio.sfxGain, audio.ctx.currentTime, 0.06, 0.3, 'bandpass', 2500);
  },
  caught() {
    melody('square', [['C5', 0.08], ['E5', 0.08], ['G5', 0.08], ['C6', 0.08], ['E6', 0.08], ['G6', 0.3]], 0.22);
    for (let i = 0; i < 6; i++) tone(audio.sfxGain, 'square', 1500 + i * 130, audio.ctx.currentTime + 0.5 + i * 0.05, 0.04, 0.12);
  },
  lose()      { melody('triangle', [['G4', 0.15], ['F4', 0.15], ['D#4', 0.15], ['C4', 0.45]], 0.5); },
  leak() {    // кап-кап
    const t = audio.ctx.currentTime;
    tone(audio.sfxGain, 'triangle', 1000, t, 0.1, 0.5, 320);
    tone(audio.sfxGain, 'triangle', 800, t + 0.28, 0.1, 0.5, 260);
    tone(audio.sfxGain, 'triangle', 1100, t + 0.52, 0.1, 0.5, 340);
  },
  splash() {
    const t = audio.ctx.currentTime;
    noiseHit(audio.sfxGain, t, 0.18, 0.45, 'bandpass', 1200);
    tone(audio.sfxGain, 'triangle', 700, t, 0.12, 0.35, 250);
  },
  wheelTick() { tone(audio.sfxGain, 'square', 1200 + Math.random() * 200, audio.ctx.currentTime, 0.02, 0.18); },
  wheelWin()  { melody('square', [['C6', 0.07], ['E6', 0.07], ['G6', 0.07], ['C7', 0.3]], 0.2); },
  jackpot() {
    melody('square', [['C5', 0.08], ['E5', 0.08], ['G5', 0.08], ['C6', 0.08], ['E6', 0.08], ['G6', 0.08], ['C7', 0.12], ['.', 0.05], ['C7', 0.12], ['.', 0.05], ['C7', 0.5]], 0.22);
    melody('triangle', [['C4', 0.08], ['E4', 0.08], ['G4', 0.08], ['C5', 0.08], ['E5', 0.08], ['G5', 0.08], ['C6', 0.9]], 0.4);
  },
  coins() {
    for (let i = 0; i < 7; i++) tone(audio.sfxGain, 'square', 1200 + i * 110, audio.ctx.currentTime + i * 0.05, 0.05, 0.2);
  },
  typing(pitch) { tone(audio.sfxGain, 'square', pitch || 500, audio.ctx.currentTime, 0.03, 0.1); },
  pip()       { tone(audio.sfxGain, 'square', 880, audio.ctx.currentTime, 0.07, 0.15, 1320); },
  click()     { tone(audio.sfxGain, 'square', 660, audio.ctx.currentTime, 0.03, 0.14); },
  warp(dur, ep) {   // подорож: у кожної епохи свій звук (Греція — арфа й дзвіночки, Ретро — перемотка, Диско — ритм, Аркади — чіп-мелодія, Інтернет — модем, Еко — вітер і птахи, Космос — свист і сонар, Неон — синті)
    const D = dur || 4.4, E = ((ep | 0) % 8 + 8) % 8, t0 = audio.ctx.currentTime + 0.02, tb = t0 + D * 0.74, A = audio.sfxGain;
    const arp = (notes, start, step, wave, len, vol) => notes.forEach((nt, i) => tone(A, wave, noteFreq(nt), start + i * step, len, vol));
    const wind = (start, len, vol) => { for (let j = 0; j < 7; j++) noiseHit(A, start + len * j / 7, len / 3, vol, 'bandpass', 350 + 260 * j); };
    const boom = (vol) => { tone(A, 'sine', 110, tb, 0.8, vol, 38); noiseHit(A, tb, 0.35, vol * 0.8, 'lowpass', 900); };
    if (E === 0) {                                                                         // Греція: арфа, хорове «ааа», світлий дзвінок
      arp(['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'], t0, D * 0.065, 'sine', 1.0, 0.16);
      arp(['G3', 'C4', 'E4', 'G4', 'C5', 'E5', 'G5'], t0 + D * 0.1, D * 0.075, 'triangle', 0.8, 0.07);
      [262, 330, 392, 523].forEach(fq => { tone(A, 'sine', fq, t0 + D * 0.12, D * 0.6, 0.05); tone(A, 'sine', fq * 1.005, t0 + D * 0.12, D * 0.6, 0.04); });
      wind(t0, D * 0.5, 0.04); boom(0.3);
      [523, 659, 784, 1047, 1319].forEach((fq, k) => tone(A, 'sine', fq, tb + 0.04 + k * 0.07, 1.8, 0.14)); tone(A, 'triangle', 2093, tb + 0.4, 1.0, 0.07);
    } else if (E === 1) {                                                                  // Ретро: цокання, що прискорюється, перемотка стрічки, клац
      let t = t0, gap = 0.3, i = 0;
      while (t < t0 + D * 0.5) { const hi = i % 2 === 0, fq = hi ? 1900 : 1250; tone(A, 'triangle', fq, t, 0.035, 0.22, fq * 0.45); noiseHit(A, t, 0.025, 0.28, 'bandpass', hi ? 3200 : 2200); tone(A, 'sine', hi ? 140 : 110, t, 0.09, 0.2, 60); gap = Math.max(0.055, gap * 0.9); t += gap; i++; }
      tone(A, 'sawtooth', 90, t0, D * 0.55, 0.05, 1400);
      for (let j = 0; j < 9; j++) noiseHit(A, t0 + D * (0.1 + j * 0.05), 0.16, 0.12, 'highpass', 3000 + j * 400);
      noiseHit(A, tb - 0.05, 0.12, 0.35, 'bandpass', 600); boom(0.35); arp(['E5', 'A5', 'E6'], tb + 0.1, 0.08, 'square', 0.4, 0.1);
    } else if (E === 2) {                                                                  // Диско: бас-барабан, хет, фанкова партія, сирена
      for (let b = 0; b < 12; b++) { const tt = t0 + b * D * 0.0625; if (tt >= tb) break; drum(A, 'k', tt, 0.34); drum(A, 'h', tt + D * 0.03, 0.25); if (b % 2) drum(A, 's', tt, 0.18); }
      arp(['A2', 'A2', 'C3', 'D3', 'E3', 'E3', 'G3', 'A3'], t0 + D * 0.02, D * 0.07, 'square', 0.18, 0.08);
      tone(A, 'sawtooth', 300, t0 + D * 0.15, D * 0.5, 0.05, 1500);
      boom(0.35); [440, 554, 659, 880].forEach((fq, k) => tone(A, 'sawtooth', fq, tb + k * 0.012, 0.7, 0.08, fq * 1.12));
      arp(['A5', 'C6', 'E6', 'A6'], tb + 0.25, 0.07, 'square', 0.3, 0.09);
    } else if (E === 3) {                                                                  // Аркади: чіп-арпеджіо, вибухи, монетка, LEVEL UP
      arp(['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6'], t0, D * 0.04, 'square', 0.05, 0.12);
      [0.2, 0.28, 0.4].forEach(p => { tone(A, 'square', 400, t0 + D * p, 0.1, 0.12, 80); noiseHit(A, t0 + D * p, 0.1, 0.15, 'lowpass', 1500); });
      tone(A, 'square', noteFreq('B5'), t0 + D * 0.34, 0.07, 0.13); tone(A, 'square', noteFreq('E6'), t0 + D * 0.34 + 0.08, 0.3, 0.13);
      arp(['C5', 'E5', 'G5', 'C6', 'E6', 'G6'], tb - 0.05, 0.06, 'square', 0.1, 0.12); arp(['C6', 'G6', 'C7'], tb + 0.4, 0.09, 'square', 0.35, 0.1);
    } else if (E === 4) {                                                                  // Інтернет: модемне «з'єднання», біп-біп, дзвінок сповіщення
      for (let b = 0; b < 22; b++) { const tt = t0 + b * D * 0.025, fq = [1200, 2100, 2400, 980, 1700][b % 5]; tone(A, 'square', fq, tt, 0.045, 0.08); }
      for (let j = 0; j < 10; j++) noiseHit(A, t0 + D * (0.1 + j * 0.04), 0.12, 0.1, 'bandpass', 1800 + (j % 3) * 700);
      tone(A, 'sawtooth', 250, t0 + D * 0.3, D * 0.28, 0.04, 1800);
      for (let p = 0; p < 4; p++) tone(A, 'sine', 1400 + p * 150, t0 + D * (0.3 + p * 0.07), 0.06, 0.12);
      boom(0.25); tone(A, 'sine', 1319, tb + 0.05, 0.5, 0.18); tone(A, 'sine', 1760, tb + 0.2, 0.9, 0.18); tone(A, 'triangle', 2637, tb + 0.2, 0.6, 0.06);
    } else if (E === 5) {                                                                  // Еко: вітер, цвірінькання, маримба
      wind(t0, D * 0.62, 0.07);
      [0.1, 0.18, 0.3, 0.38, 0.5].forEach((p, k) => { tone(A, 'sine', 2200 + k * 150, t0 + D * p, 0.09, 0.09, 3400); tone(A, 'sine', 3100, t0 + D * p + 0.1, 0.07, 0.07, 2300); });
      arp(['D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6'], t0 + D * 0.1, D * 0.07, 'triangle', 0.5, 0.16);
      tone(A, 'sine', 220, t0, D * 0.6, 0.04, 300);
      boom(0.22); arp(['D5', 'F#5', 'A5', 'D6'], tb + 0.05, 0.1, 'sine', 1.6, 0.13); tone(A, 'triangle', 1760, tb + 0.4, 1.0, 0.06);
    } else if (E === 6) {                                                                  // Космос: свист двигуна, сонар, гіперстрибок
      tone(A, 'sawtooth', 50, t0, D * 0.74, 0.07, 900); tone(A, 'sine', 100, t0, D * 0.74, 0.06, 2400);
      for (let j = 0; j < 10; j++) noiseHit(A, t0 + D * (0.05 + j * 0.06), 0.3, 0.1, 'bandpass', 400 + j * 450);
      [0.18, 0.34, 0.5].forEach(p => { tone(A, 'sine', 1200, t0 + D * p, 0.6, 0.1); tone(A, 'sine', 1200, t0 + D * p + 0.22, 0.5, 0.05); });
      tone(A, 'triangle', 3000, tb - 0.25, 0.25, 0.09, 200);
      noiseHit(A, tb - 0.1, 0.5, 0.45, 'highpass', 600); boom(0.5); [392, 523, 784].forEach((fq, k) => tone(A, 'sine', fq, tb + 0.05 + k * 0.07, 1.5, 0.14));
    } else {                                                                               // Неон: синтові пилки, лазерні «пью», бас-дроп
      arp(['E3', 'B3', 'E4', 'G4', 'B4', 'E5', 'G5', 'B5', 'E6'], t0, D * 0.055, 'sawtooth', 0.14, 0.09);
      [0.15, 0.25, 0.37, 0.47, 0.57].forEach(p => tone(A, 'square', 2400, t0 + D * p, 0.16, 0.08, 260));
      tone(A, 'sawtooth', 80, t0 + D * 0.1, D * 0.62, 0.05, 1200);
      boom(0.5); tone(A, 'sawtooth', 55, tb, 0.7, 0.2, 40);
      [330, 415, 494, 659].forEach((fq, k) => tone(A, 'sawtooth', fq, tb + 0.02 + k * 0.01, 1.0, 0.07, fq * 1.02)); arp(['E6', 'B6', 'E7'], tb + 0.3, 0.07, 'square', 0.3, 0.07);
    }
  }
};
/* ====================== ПОЧАТКОВА КАТ-СЦЕНА (v2) ======================
   Малюнок удвічі дрібніший за гру (CUT_Q = 2 пікселі полотна на «піксель гри»): герої збільшені з плавним згладжуванням (EPX ×4),
   будинки, дерева, ліхтарі й бруківка беруться з самої гри. Час T — «сюжетні секунди» (1 с сюжету = CUT_SLOW справжніх).
   Кадр — функція T, тому знімки: ?cut=A&seek=14. Варіанти: A весняний ранок, B осінній вечір, C зимова ніч. */
const CUT_Q = 2, CUT_SLOW = 1.5;
const CUT_STYLES = {
  A: { season: 'spring', sky: ['#4f9fe6', '#7cc0f0', '#b5defa', '#ffe6b4', '#ffc994'], tint: [255, 196, 140, 0.08], stars: 0, sun: 'sun', win: 0.0, lamp: 0, cloud: '#ffffff', fall: 'petal', glow: 0 },
  B: { season: 'autumn', sky: ['#35295f', '#6b3a82', '#c0507a', '#f07f55', '#ffbd6e'], tint: [150, 80, 110, 0.20], stars: 0.3, sun: 'low', win: 0.75, lamp: 1, cloud: '#ffb08a', fall: 'leaf', glow: 0.6 },
  C: { season: 'winter', sky: ['#04061a', '#0a1032', '#131c4c', '#1f2e66', '#33477f'], tint: [20, 34, 100, 0.48], stars: 1, sun: 'moon', win: 0.65, lamp: 1, cloud: '#2a3a74', fall: 'snow', glow: 1 }
};
const CUT_TXT = {
  uk: { hi: 'Привіт!', intro: ['Жив собі Капі', 'у своєму піксельному світі…'], introN: ['Жив собі', 'Капі у своєму', 'піксельному', 'світі…'], p1: 'Ого… у мене є монетка!', b1: 'Перша монетка? Тоді тобі потрібен магазин!', c2: 'Магазин?', b2: 'Навіть з однієї монетки виросте бізнес!', b3: 'Дивись уважно!', b4: 'Тепер твоя черга.', c5: 'А що робити?', b5: 'Спробуй тапнути!', hint: 'ТАПНИ НА МАГАЗИН', click: 'КЛІК!',
    b6: 'Чим більше заробляєш, тим більше можеш розвивати магазин!', b7: 'Розвивай магазин, заробляй монети й відкривай нові епохи!', w1: 'ПОКРАЩУЙ.', w2: 'ТАПАЙ.', w3: 'РОЗВИВАЙ.', i1: 'ТАП', i2: 'МОНЕТИ', i3: 'ПОКРАЩЕННЯ', i4: 'РІВЕНЬ', skip: 'Пропустити',
    m1: 'Привіт! Я Мел,', n1: 'а я Ніка. Ми розробники цієї гри!', m2: 'Зараз покажемо, як усе працює. Ну що, починаємо?', go: 'ПОЧИНАЄМО!', tuk: 'ТУК!' },
  en: { hi: 'Hi!', intro: ['Once upon a time,', 'Capy lived in a pixel world…'], introN: ['Once upon', 'a time, Capy', 'lived in a', 'pixel world…'], p1: 'Wow... I have a coin!', b1: 'A first coin? Then you need a shop!', c2: 'A shop?', b2: 'Even one coin can grow into a business!', b3: 'Watch closely!', b4: 'Now it is your turn.', c5: 'What do I do?', b5: 'Try tapping!', hint: 'TAP THE SHOP', click: 'CLICK!',
    b6: 'The more you earn, the more you can grow your shop!', b7: 'Grow the shop, earn coins and unlock new epochs!', w1: 'UPGRADE.', w2: 'TAP.', w3: 'GROW.', i1: 'TAP', i2: 'COINS', i3: 'UPGRADE', i4: 'LEVEL', skip: 'Skip',
    m1: 'Hi! I am Mel,', n1: 'and I am Nika. We are the developers!', m2: 'We will show how it all works. Shall we start?', go: "LET'S GO!", tuk: 'TOCK!' }
};
// Часова шкала (сюжетні секунди)
const CUT_PRE = 2.6;
const CT = { walk: 4.2, ting1: 4.3, ting2: 5.2, pick: 6.2, bIn0: 6.6, bIn1: 7.8, fly0: 12.2, fly1: 13.0, charge: 13.9, big1: 14.7, flash: 14.9, asm0: 15.1, asm1: 19.0, sign0: 19.3, sign1: 21.0, flank0: 19.3, flank1: 20.7, TW: 23.5 };
CT.u0 = CT.TW + 1.4; CT.fin = CT.u0 + 7.9; CT.finBtn = CT.fin + 7.6; CT.END = CT.finBtn + 1.0;
const CUT_SAY = [[6.3, 7.5, 'c', 'p1'], [7.7, 8.5, 'b', 'hi'], [8.6, 10.4, 'b', 'b1'], [10.5, 11.3, 'c', 'c2'], [11.4, 13.0, 'b', 'b2'], [20.4, 21.5, 'b', 'b4'], [21.6, 22.5, 'c', 'c5'], [22.5, CT.TW, 'b', 'b5']];
const cut = { on: false, bagStyle: 0, style: 'A', raf: 0, t0: 0, amb: 0, tapAmb: -1, goAmb: -1, T: 0, W: 384, H: 216, S: 1, fired: {}, cb: null, cache: {}, shopPx: null, thumbs: null, rect: null, btn: null, seek: -1, hit: null };
const cutHash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const cutSm = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
const cutLerp = (a, b, u) => a + (b - a) * u;
function cutKf(T, keys) {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) if (T < keys[i + 1][0]) return cutLerp(keys[i][1], keys[i + 1][1], cutSm((T - keys[i][0]) / (keys[i + 1][0] - keys[i][0])));
  return keys[keys.length - 1][1];
}
const cutRc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const cutTf = (g, tx, ty) => g.setTransform(CUT_Q, 0, 0, CUT_Q, Math.round(tx * CUT_Q), Math.round(ty * CUT_Q));
// Підготовка гри до малювання її ж будинків: перша епоха й потрібна пора року; після — усе повертається
function cutWithGame(fn) {
  const oe = state.epoch, ob = buildSeason, oh = LAYOUT.horizonY, od = houseDoors, og = houseGlass;
  state.epoch = 0; buildSeason = CUT_STYLES[cut.style].season; houseDoors = []; houseGlass = [];
  try { return fn(); } finally { state.epoch = oe; buildSeason = ob; LAYOUT.horizonY = oh; houseDoors = od; houseGlass = og; }
}
function cutTintCv(c) { const st = CUT_STYLES[cut.style], g = c.getContext('2d'); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(' + st.tint[0] + ',' + st.tint[1] + ',' + st.tint[2] + ',' + (st.tint[3] * 0.85) + ')'; g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'source-over'; }
const CUT_HW = [52, 46, 44, 62, 48, 46], CUT_HH = [66, 54, 70, 62, 60, 72];
function cutHouseCv(i) {
  const k = ((i % 6) + 6) % 6, key = 'h' + cut.style + (((i % 30) + 30) % 30); if (cut.cache[key]) return cut.cache[key];
  const w = CUT_HW[k] + (((i * 7) % 3) - 1) * 2, h = Math.round(CUT_HH[k] * 1.4), pad = 36, cw = w + 16, ch = h + pad, c = document.createElement('canvas'); c.width = cw; c.height = ch;
  let glass = [];
  cutWithGame(() => { LAYOUT.horizonY = ch - 1; const g = c.getContext('2d'); drawHouse(g, Object.assign({ x: 8, w, h }, houseColors(i)), []); glass = houseGlass.slice(); });
  cutTintCv(c);
  const st = CUT_STYLES[cut.style], g = c.getContext('2d');
  glass.forEach((r, n) => { if (cutHash(i * 31 + n * 7) < st.win) { g.fillStyle = '#fff0b0'; g.fillRect(r[0], r[1], r[2], 3); g.fillStyle = '#ffd36b'; g.fillRect(r[0], r[1] + 3, r[2], 4); g.fillStyle = '#f0a840'; g.fillRect(r[0], r[1] + 7, r[2], 2); } });
  return (cut.cache[key] = { c, w: cw, h: ch, ox: 8, hw: w });
}
function cutTreeCv(v) {
  const key = 't' + cut.style + v; if (cut.cache[key]) return cut.cache[key];
  const c = document.createElement('canvas'); c.width = 110; c.height = 128;
  cutWithGame(() => { LAYOUT.horizonY = 112; drawStreetTree(c.getContext('2d'), 55, v, buildSeason); });
  cutTintCv(c); return (cut.cache[key] = { c, w: 110, h: 128, base: 120 });
}
function cutLampCv() {
  const key = 'l' + cut.style; if (cut.cache[key]) return cut.cache[key];
  const c = document.createElement('canvas'); c.width = 20; c.height = 56; const g = c.getContext('2d'); g.translate(10, -80); drawLamp(g, 0);
  const st = CUT_STYLES[cut.style]; cutTintCv(c); if (st.lamp) { g.fillStyle = '#fff3b0'; g.fillRect(8, 8, 6, 5); g.fillStyle = '#ffffff'; g.fillRect(9, 9, 2, 2); }
  return (cut.cache[key] = { c, w: 20, h: 56 });
}
function cutCobbleCv() {
  const key = 'cb' + cut.style; if (cut.cache[key]) return cut.cache[key];
  const c = document.createElement('canvas'); c.width = 512; c.height = 44;
  cutWithGame(() => paintCobble(c.getContext('2d'), 0, 0, 512, 44, buildSeason === 'winter' ? 'snow' : buildSeason === 'autumn' ? 'leaves' : 'stone'));
  cutTintCv(c); return (cut.cache[key] = c);
}
// EPX-згладжування: кожен піксель спрайта дробиться на 2×2 з акуратними діагоналями (двічі = ×4)
function cutEpx(src) {
  const w = src.width, h = src.height, d = src.getContext('2d').getImageData(0, 0, w, h).data, out = document.createElement('canvas'); out.width = w * 2; out.height = h * 2;
  const og = out.getContext('2d'), od = og.createImageData(w * 2, h * 2), o = od.data;
  const px = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return 0; const i = (y * w + x) * 4; return d[i + 3] < 8 ? 0 : (((d[i] << 24) | (d[i + 1] << 16) | (d[i + 2] << 8) | d[i + 3]) >>> 0) || 1; };
  const put = (x, y, v) => { const i = (y * w * 2 + x) * 4; if (!v) { o[i + 3] = 0; return; } o[i] = (v >>> 24) & 255; o[i + 1] = (v >>> 16) & 255; o[i + 2] = (v >>> 8) & 255; o[i + 3] = v & 255; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = px(x, y), a = px(x, y - 1), b = px(x + 1, y), c = px(x - 1, y), e = px(x, y + 1);
    put(x * 2, y * 2, (c === a && c !== e && a !== b) ? a : p); put(x * 2 + 1, y * 2, (a === b && a !== c && b !== e) ? b : p);
    put(x * 2, y * 2 + 1, (e === c && e !== b && c !== a) ? c : p); put(x * 2 + 1, y * 2 + 1, (b === e && b !== a && e !== c) ? e : p);
  }
  og.putImageData(od, 0, 0); return out;
}
function cutHi(name, canvas) { const key = 'hi' + name; if (cut.cache[key]) return cut.cache[key]; const src = canvas || getSpriteCanvas(name); return (cut.cache[key] = cutEpx(cutEpx(src))); }
// Капі без сукні/футболки: шерсть, голова з квіточкою (дівчинка) або листочком (хлопчик), очей немає — їх малюють емоції
function cutCapyHi() {
  const boy = state.settings.gender === 'm', key = 'capy' + (boy ? 'm' : 'f'); if (cut.cache[key]) return cut.cache[key];
  const rows = makeCapyRows('plain').map(r => r.replace(/K/g, 'B').split('')), W = rows[0].length;
  const put = (x, y, c) => { const xi = 27 - x; if (rows[y] && xi >= 0 && xi < W) rows[y][xi] = c; };
  const acc = [];                                                  // у заставці Капі без квіточки (дівчинка) і листочка (хлопчик)
  acc.forEach(([x, y, c]) => put(x, y, c));
  acc.forEach(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const xi = 27 - (x + dx), yy = y + dy; if (rows[yy] && rows[yy][xi] === '.') rows[yy][xi] = 'O'; }));
  SPRITES['cut_' + key] = { rows: rows.map(r => r.join('')) };
  return cutHi('cut_' + key);
}
// Лице на спрайті ×4 (око ≈ (80,36), мордочка праворуч); координати в пікселях ×4
function cutFace(g, e) {
  const ex = 80, ey = 36, dk = '#2a1a14', R_ = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const ell = (cx, cy, rx, ry, c) => { g.fillStyle = c; for (let dy = -ry; dy <= ry; dy++) { const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.5)))); g.fillRect(cx - half, cy + dy, half * 2 + 1, 1); } };
  if (e.blush) { g.globalAlpha = 0.55; ell(ex + 9, ey + 11, 6, 3, '#ff8fa8'); g.globalAlpha = 1; }
  switch (e.eye) {
    case 'wide': ell(ex, ey, 7, 8, dk); ell(ex, ey, 6, 7, '#ffffff'); ell(ex + 1, ey + 1, 3, 4, dk); R_(ex - 1, ey - 2, 2, 2, '#ffffff'); break;
    case 'happy': for (let dx = -6; dx <= 6; dx++) { const y = ey - Math.round(Math.sqrt(Math.max(0, 1 - (dx / 6.5) * (dx / 6.5))) * 5); R_(ex + dx, y + 1, 1, 3, dk); } break;
    case 'sparkle': ell(ex, ey, 5, 6, dk); R_(ex - 3, ey - 4, 3, 3, '#ffffff'); R_(ex + 1, ey + 1, 2, 2, '#ffffff'); R_(ex + 3, ey - 5, 1, 3, '#ffffff'); R_(ex + 2, ey - 4, 3, 1, '#ffffff'); break;
    case 'half': ell(ex, ey, 5, 6, dk); R_(ex - 6, ey - 7, 13, 7, '#b57a3e'); R_(ex - 6, ey - 1, 13, 2, dk); R_(ex - 2, ey + 1, 2, 2, '#ffffff'); break;
    case 'blink': R_(ex - 5, ey, 11, 3, dk); break;
    default: ell(ex, ey, 4, 5, dk); R_(ex - 2, ey - 3, 2, 3, '#ffffff'); R_(ex + 1, ey + 1, 1, 1, '#ffffff');
  }
  const brow = (x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) R_(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 3, 3, dk); };
  if (e.brow === 'up') brow(ex - 6, ey - 12, ex + 6, ey - 14); else if (e.brow === 'worry') brow(ex - 6, ey - 9, ex + 6, ey - 15); else if (e.brow === 'think') brow(ex - 6, ey - 11, ex + 6, ey - 9); else if (e.brow === 'cross') brow(ex - 6, ey - 15, ex + 6, ey - 9);
  const mx = 97, my = 49;
  if (e.mouth === 'smile') { for (let dx = -6; dx <= 6; dx++) R_(mx + dx, my + Math.round(3 * (1 - (dx / 6.5) * (dx / 6.5))), 1, 2, dk); }
  else if (e.mouth === 'big') { for (let dy = 0; dy <= 6; dy++) { const half = Math.round(7 * Math.sqrt(1 - (dy / 7) * (dy / 7))); R_(mx - half, my + dy, half * 2 + 1, 1, dk); } R_(mx - 3, my + 4, 7, 2, '#ff7a90'); }
  else if (e.mouth === 'o') { ell(mx, my + 3, 3, 4, dk); R_(mx - 1, my + 4, 3, 2, '#ff7a90'); }
  else if (e.mouth === 'frown') { for (let dx = -5; dx <= 5; dx++) R_(mx + dx, my + 3 - Math.round(2 * (1 - (dx / 5.5) * (dx / 5.5))), 1, 2, dk); }
  else R_(mx - 5, my + 2, 11, 2, dk);
}
// Значки над головою: ! ? серце іскри краплина
function cutMark(g, kind, x, y, T) {
  const b = Math.sin(T * 9) * 1.2;
  if (kind === '!') { cutPopText(g, '!', x, y + b, 4, '#ff5a5a', '#ffffff'); }
  else if (kind === '?') { cutPopText(g, '?', x, y + b, 4, '#ffe36a', '#7a3a10'); }
  else if (kind === 'heart') { const h = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...']; h.forEach((r, j) => r.split('').forEach((c, i) => { if (c === 'X') { g.fillStyle = j < 1 ? '#ff9fb4' : '#ff4f78'; g.fillRect(x - 3.5 + i, y - 3 + j + b, 1, 1); } })); }
  else if (kind === 'spark') { for (let k = 0; k < 3; k++) { const ph = (T * 2 + k * 0.33) % 1; if (ph < 0.6) cutSpark(g, x + (k - 1) * 9, y + 4 - ph * 10, ph < 0.3 ? 1 : 2, '#fff7c0'); } }
}
function cutEmo(T, amb) {
  const TW = CT.TW, u = cut.tapAmb >= 0 ? T - TW : -1;
  let e;
  if (u >= 0) e = u < 1.4 ? { eye: 'happy', mouth: 'big', blush: 1, mark: 'heart' } : T < CT.fin ? { eye: 'sparkle', brow: 'up', mouth: 'smile', blush: 1 } : { eye: 'happy', mouth: 'big', blush: 1, mark: 'heart' };
  else if (T < CT.ting1) e = { eye: 'half', brow: 'think', mouth: 'frown' };
  else if (T < CT.ting2) e = { eye: 'wide', brow: 'up', mouth: 'o', mark: '!' };
  else if (T < CT.pick) e = { eye: 'wide', brow: 'up', mouth: 'o' };
  else if (T < 7.9) e = { eye: 'happy', mouth: 'big', blush: 1, mark: 'spark' };
  else if (T < 10.5) e = { eye: 'open', brow: 'up', mouth: 'smile' };
  else if (T < 11.4) e = { eye: 'open', brow: 'worry', mouth: 'o', mark: '?' };
  else if (T < 13.0) e = { eye: 'sparkle', brow: 'up', mouth: 'smile', blush: 1 };
  else if (T < CT.asm0) e = { eye: 'wide', brow: 'up', mouth: 'o', mark: 'spark' };
  else if (T < CT.asm1 + 0.4) e = { eye: 'wide', brow: 'up', mouth: 'big', blush: 1, mark: 'spark' };
  else if (T < 21.6) e = { eye: 'happy', mouth: 'big', blush: 1, mark: 'heart' };
  else if (T < 22.5) e = { eye: 'open', brow: 'worry', mouth: 'o', mark: '?' };
  else e = { eye: 'sparkle', brow: 'up', mouth: 'smile', blush: 1 };
  if ((e.eye === 'open' || e.eye === 'half' || e.eye === 'sparkle') && (amb * 10) % 31 < 1.1) e = Object.assign({}, e, { eye: 'blink' });
  return e;
}
// Текст: шрифт 8 px малюється у проміжне полотно й масштабується без згладжування (k — пікселів полотна на піксель шрифту)
function cutTextPx(g, str, x, y, k, fill, edge, align, alpha) {
  if (!str) return; k = Math.max(1, Math.round(k));
  const key = str + '|' + fill + '|' + (edge || ''), cache = cutCache('txtmap', () => new Map());
  let c = cache.get(key);
  if (!c) {
    const w = str.length * 8, pad = edge ? 1 : 0, base = document.createElement('canvas'); base.width = w + 2; base.height = 10;
    const bg = base.getContext('2d'); bg.font = '8px "Press Start 2P", monospace'; bg.textBaseline = 'top'; bg.fillStyle = '#000'; bg.fillText(str, 1, 1);
    const id = bg.getImageData(0, 0, w + 2, 10), d = id.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0;       // чіткі пікселі
    bg.putImageData(id, 0, 0);
    c = document.createElement('canvas'); c.width = w + 2 + pad * 2; c.height = 10 + pad * 2; const cg = c.getContext('2d');
    const tinted = col => { const t = document.createElement('canvas'); t.width = w + 2; t.height = 10; const tg = t.getContext('2d'); tg.drawImage(base, 0, 0); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = col; tg.fillRect(0, 0, w + 2, 10); return t; };
    if (edge) { const e = tinted(edge); [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]].forEach(([dx, dy]) => cg.drawImage(e, pad + dx, pad + dy)); }
    cg.drawImage(tinted(fill), pad, pad);
    if (cache.size > 400) cache.clear(); cache.set(key, c);
  }
  const dw = c.width * k / CUT_Q, dh = c.height * k / CUT_Q, ox = align === 'center' ? -dw / 2 : align === 'right' ? -dw : 0;
  g.save(); g.imageSmoothingEnabled = false; if (alpha !== undefined) g.globalAlpha = alpha; g.drawImage(c, Math.round((x + ox) * CUT_Q) / CUT_Q, Math.round((y - dh / 2) * CUT_Q) / CUT_Q, dw, dh); g.restore();
}
function cutPopText(g, str, x, y, k, fill, edge, age) { const a = age === undefined ? 1 : age, s = a < 0.12 ? a / 0.12 * 1.3 : a < 0.26 ? 1.3 - (a - 0.12) / 0.14 * 0.3 : 1; cutTextPx(g, str, x, y, Math.max(0.5, k * s), fill, edge, 'center'); }
function cutSpark(g, x, y, s, col) { g.fillStyle = col || '#fff'; g.fillRect(Math.round(x - s), Math.round(y), s * 2 + 1, 1); g.fillRect(Math.round(x), Math.round(y - s), 1, s * 2 + 1); g.fillRect(Math.round(x - 1), Math.round(y - 1), 3, 3); }
function cutBubble(g, text, sx, sy, who, prog, W) {
  const k = 2, cw = 8 * k / CUT_Q, maxChars = Math.max(10, Math.floor((Math.min(W - 24, W >= 300 ? 214 : 160)) / cw)), words = text.split(' '), lines = []; let cur = '';
  words.forEach(w => { const t2 = cur ? cur + ' ' + w : w; if (t2.length > maxChars && cur) { lines.push(cur); cur = w; } else cur = t2; });
  if (cur) lines.push(cur);
  const wmax = Math.max(...lines.map(l => l.length)) * cw, lh = 8 * k / CUT_Q * 1.4, bw = Math.ceil(wmax) + 9, bh = Math.ceil(lines.length * lh + 5);
  const bx = Math.round(Math.max(4, Math.min(W - 4 - bw, sx - bw / 2))), by = Math.round(sy - bh - 8);
  const edge = { c: state.settings.gender === 'm' ? '#3f6fc4' : '#c04f7a', b: '#8a5a2a', m: '#d9822b', n: '#9b7fd0' }[who] || '#8a5a2a', fill = who === 'b' ? '#fff6dc' : '#fff3f8';
  g.fillStyle = edge; g.fillRect(bx, by - 1, bw, bh + 2); g.fillRect(bx - 1, by, bw + 2, bh); g.fillStyle = fill; g.fillRect(bx, by, bw, bh);
  const tx = Math.round(Math.max(bx + 4, Math.min(bx + bw - 5, sx)));
  g.fillStyle = edge; g.fillRect(tx - 3, by + bh, 7, 1); g.fillRect(tx - 2, by + bh + 1, 5, 1); g.fillRect(tx - 1, by + bh + 2, 3, 1); g.fillRect(tx, by + bh + 3, 1, 1);
  g.fillStyle = fill; g.fillRect(tx - 2, by + bh, 5, 1); g.fillRect(tx - 1, by + bh + 1, 3, 1); g.fillRect(tx, by + bh + 2, 1, 1);
  let left = Math.floor(prog);
  lines.forEach((l, i) => { if (left > 0) { cutTextPx(g, l.slice(0, left), bx + 4.5, by + 2.5 + lh * (i + 0.5), k, '#3a2a22', null, 'left'); left -= l.length + 1; } });
}
function cutSayState(T, txt) {
  for (const s of CUT_SAY) if (T >= s[0] && T < s[1]) return { who: s[2], text: txt[s[3]], prog: (T - s[0]) * 26 };
  if (cut.tapAmb >= 0) {
    const u = T - CT.u0; if (u >= 0 && u < 3) return { who: 'b', text: txt.b6, prog: u * 26 }; if (u >= 3 && u < 5.4) return { who: 'b', text: txt.b7, prog: (u - 3) * 26 };
    const f = T - CT.fin; if (f >= 2.2 && f < 3.4) return { who: 'm', text: txt.m1, prog: (f - 2.2) * 26 }; if (f >= 3.4 && f < 5.3) return { who: 'n', text: txt.n1, prog: (f - 3.4) * 26 }; if (f >= 5.3) return { who: 'm', text: txt.m2, prog: (f - 5.3) * 26 };
  }
  return null;
}
// розкладка залежить від ширини екрана: на вузькому телефоні актори стоять ближче
function cutFinale(T, L, w2s) {
  const fT = T - CT.fin; if (fT <= 0) return null; const W = cut.W, H = cut.H, melC = cutHi('foxcub_0', SPRITES.capy_mel.canvas), nikC = cutHi('bunny_0', SPRITES.capy_nika.canvas), h0 = melC.height / CUT_Q, w0 = melC.width / CUT_Q;
  const wk = cutSm((fT - 0.5) / 2.2), ph = mobileMQ.matches || landscapePhoneMQ.matches, scF = Math.min(ph ? 2.0 : 2.6, H * (ph ? 0.3 : 0.4) / h0, W * (ph ? 0.33 : 0.42) / w0), sc = cutLerp(0.5, scF, wk), door = w2s(L.shopCX, 158);
  const fx = cutLerp(door[0], W / 2, wk), foot = cutLerp(door[1], H - (W < 300 ? 76 : 66), wk), gx = w0 * sc * 0.52;
  return { fT, wk, sc, melC, nikC, mx: fx - gx, nx: fx + gx, foot, h: h0 * sc, fx };
}
function cutLay() {
  const nar = cut.W < 300, L = { nar, shopCX: 385, lotL: 305, lotR: 465 };
  L.capyStop = nar ? 265 : 205; L.coinX = L.capyStop + 28; L.bodyStop = L.capyStop + (nar ? 58 : 72); L.bodyStart = 560;
  L.flankC = L.shopCX - 78; L.flankB = L.shopCX + 78; L.capyStart = L.capyStop - CT.walk * 34;
  return L;
}
function cutCapyX(T, L) { if (T < CT.walk) return L.capyStart + T * 34; if (T < CT.flank0) return L.capyStop; return cutLerp(L.capyStop, L.flankC, cutSm((T - CT.flank0) / (CT.flank1 - CT.flank0))); }
function cutBodyX(T, L) {
  if (T < CT.bIn0) return L.bodyStart; if (T < CT.bIn1) return cutLerp(L.bodyStart, L.bodyStop, cutSm((T - CT.bIn0) / (CT.bIn1 - CT.bIn0)));
  if (T < CT.asm0 - 0.4) return L.bodyStop; if (T < CT.asm0 + 0.6) return cutLerp(L.bodyStop, L.shopCX - 100, cutSm((T - CT.asm0 + 0.4) / 1.0));
  if (T < CT.sign1 + 0.3) return L.shopCX - 100; return cutLerp(L.shopCX - 100, L.flankB, cutSm((T - CT.sign1 - 0.3) / 1.4));
}
function cutCamCx(T, L) {
  const W = cut.W;
  if (T < CT.walk) return cutCapyX(T, L) + W * 0.14;
  return cutKf(T, [[CT.walk, L.capyStop + W * 0.14], [6.6, L.capyStop + W * 0.14], [8.0, (L.capyStop + L.bodyStop) / 2], [12.2, (L.capyStop + L.bodyStop) / 2], [13.2, L.shopCX]]);
}
function cutZoom(T) { return cutKf(T, [[5.35, 1], [5.9, 2.4], [6.3, 2.4], [6.9, 1], [12.95, 1], [13.9, 2.1], [14.6, 2.1], [14.62, 1], [CT.sign0, 1], [CT.sign0 + 0.7, 2.5], [CT.sign1 - 0.5, 2.5], [CT.sign1 + 0.3, 1]]); }
function cutPrep() {
  if (cut.shopPx) return;
  const oe = state.epoch; let geo = [];
  state.epoch = 0;
  try { [1, 3, 5].forEach(lv => geo.push(buildShopCanvas(lv, state.depts.map(tierOf)))); } finally { state.epoch = oe; }
  try { if (typeof shop !== 'undefined' && shop) rebuildShop(true); } catch (e) { /* не страшно */ }
  cut.thumbs = geo.map(o => ({ c: o.canvas, w: o.w, h: o.h })); cut.door = geo[0].door || null;
  const g0 = geo[0], d = g0.canvas.getContext('2d').getImageData(0, 0, g0.w, g0.h).data, px = [];
  for (let y = 0; y < g0.h; y++) for (let x = 0; x < g0.w; x++) { const i = (y * g0.w + x) * 4; if (d[i + 3] > 200) px.push({ x, y, c: 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')', o: (1 - y / g0.h) * 0.8 + cutHash(x * 13 + y * 7) * 0.2, a: cutHash(x * 3 + y * 17 + 1) * 6.283, r: cutHash(x * 5 + y * 11 + 2), w: cutHash(x + y * 31) * 6 }); }
  px.sort((p, q) => p.o - q.o); px.forEach((p, i) => { p.o = i / px.length; });
  cut.shopPx = px; cut.shopW = g0.w; cut.shopH = g0.h;
}
function cutSky(W, H, shift) {
  const key = 'sky' + cut.style + W + 'x' + H + 's' + shift; if (cut.cache[key]) return cut.cache[key];
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), st = CUT_STYLES[cut.style];
  const hexc = v => v.length === 1 ? PALETTE[v] : v, hx = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const A = hx(hexc(st.sky[0])), B = hx(hexc(st.sky[1])), C = hx(hexc(st.sky[2])), mix = (p, q, t) => p.map((v, i) => Math.round(v + (q[i] - v) * t));
  const col = u => { const lvl = Math.floor(u * 5) / 5; return u < 1 ? mix(A, B, lvl) : mix(B, C, Math.floor((u - 1) * 5) / 5); };
  const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], hor = 156 + shift;
  for (let y = 0; y < hor; y++) {
    const f = y / hor, u = f < 0.45 ? f / 0.45 : 1 + Math.pow((f - 0.45) / 0.55, 0.9), step = 1 / 5, fr = ((u < 1 ? u : u - 1) / step) % 1, c0 = col(u), c1b = col(Math.min(2, u + step));
    for (let x = 0; x < W; x++) { const th = bayer[y & 3][x & 3] / 16, cc = fr > th ? c1b : c0; g.fillStyle = 'rgb(' + cc[0] + ',' + cc[1] + ',' + cc[2] + ')'; g.fillRect(x, y, 1, 1); }
  }
  g.fillStyle = 'rgb(' + C.join(',') + ')'; g.fillRect(0, hor, W, H - hor);
  for (let k = 0; k < 14; k++) { g.globalAlpha = 0.012 * (14 - k) * 2; g.fillStyle = '#ffffff'; g.fillRect(0, hor - 28 + k * 2, W, 2); }          // тепле сяйво біля обрію
  g.globalAlpha = 1; return (cut.cache[key] = c);
}
function cutCoin(g, cx, cy, r, ang, glow) {
  const f = Math.max(0.16, Math.abs(Math.cos(ang))), rx = Math.max(1, r * f), ry = r;
  if (glow) { const gr = g.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * (2.2 + glow)); gr.addColorStop(0, 'rgba(255,230,120,' + (0.55 * Math.min(1, glow + 0.2)) + ')'); gr.addColorStop(1, 'rgba(255,230,120,0)'); g.fillStyle = gr; g.fillRect(cx - r * 4, cy - r * 4, r * 8, r * 8); }
  const S = 1 / CUT_Q, ell = (k, col) => { g.fillStyle = col; const n = Math.round(ry * k * CUT_Q); for (let i = -n; i <= n; i++) { const dy = i / CUT_Q, half = rx * k * Math.sqrt(Math.max(0, 1 - (i * i) / Math.max(1, n * n))); g.fillRect(Math.round((cx - half) * CUT_Q) / CUT_Q, cy + dy, Math.round(half * 2 * CUT_Q + 1) / CUT_Q, S); } };
  ell(1, '#9a5e12'); ell(0.94, '#c98a1c'); ell(0.88, '#e8a92a'); ell(0.8, '#f8cf4a'); ell(0.66, '#e8a92a'); ell(0.6, '#f8d85c');
  // проста монетка: без хреста й значка всередині (за проханням гравчині), лише ободок, диск і відблиск
  g.fillStyle = '#fff7c0'; for (let i = Math.round(-ry * 0.78 * CUT_Q); i < Math.round(-ry * 0.2 * CUT_Q); i++) g.fillRect(cx - rx * 0.62 + (i + ry * 0.78 * CUT_Q) * 0.25 / CUT_Q, cy + i / CUT_Q, Math.max(0.5, r * 0.07), S);
}
function cutDrawChar(g, cv, x, foot, flip, opts) {
  opts = opts || {}; const w = cv.width / CUT_Q, h = cv.height / CUT_Q, sx = opts.sx || 1, sy = opts.sy || 1;
  g.save(); g.translate(x, foot); if (opts.rot) g.rotate(opts.rot); g.scale(flip ? -sx : sx, sy);
  g.globalAlpha = 0.28; g.fillStyle = '#000'; g.beginPath(); g.ellipse(0, 0.5, w * 0.42, 2.2, 0, 0, 7); g.fill(); g.globalAlpha = opts.alpha === undefined ? 1 : opts.alpha;
  g.imageSmoothingEnabled = false; g.drawImage(cv, -w / 2, -h, w, h);
  if (opts.after) { g.save(); g.translate(-w / 2, -h); g.scale(1 / CUT_Q, 1 / CUT_Q); opts.after(g); g.restore(); }
  g.restore();
}
const CUT_BAG_NAMES = ['Плюшевий рюкзачок', 'Ведмедик', 'Курчатко', 'Мішок на шнурку', 'Сонечко', 'Хмаринка'];
function cutBagDraw(gg, style, boy) {                       // м'які рюкзаки: круглі, плюшеві; одна лямка охоплює «руку» спереду. Координати ×4 спрайта Капі
  const dk = '#2a1a14', R_ = (x, y, w, h, c) => { gg.fillStyle = c; gg.fillRect(x, y, w, h); };
  const B = (cx, cy, rx, ry, c) => { gg.fillStyle = c; for (let dy = -ry; dy <= ry; dy++) { const h = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.5)))); gg.fillRect(cx - h, cy + dy, h * 2, 1); } };
  const soft = (cx, cy, rx, ry, c0, c1, c2) => { B(cx, cy, rx + 1, ry + 1, dk); B(cx, cy + 1, rx, ry, c2); B(cx - 1, cy - 1, rx - 1, ry - 1, c0); B(cx - 5, cy - 6, Math.round(rx * 0.45), Math.round(ry * 0.3), c1); };
  const SEG = [[40, 20, 4, 3], [42, 23, 4, 4], [43, 27, 4, 5], [44, 32, 4, 6], [44, 38, 4, 6], [43, 44, 4, 5]];
  const strap = (c, c2) => { SEG.forEach(r => R_(r[0] - 1, r[1] - 1, r[2] + 2, r[3] + 2, dk)); SEG.forEach(r => { R_(r[0], r[1], r[2], r[3], c); R_(r[0], r[1], 1, r[3], c2); }); };
  gg.save(); gg.translate(0, 9);
  if (style === 0) {                                        // плюшевий рюкзачок: рожевий (хлопчик — синій), кругла кишенька, петелька
    const c = boy ? ['#4a82da', '#8abaff', '#2f5aa8', '#2a4a94'] : ['#ee7aa6', '#ffb8d2', '#c24f80', '#a8406a'];
    R_(25, 2, 10, 3, dk); R_(26, 3, 8, 1, c[2]);
    soft(28, 21, 17, 14, c[0], c[1], c[2]);
    B(34, 27, 8, 6, dk); B(34, 27, 7, 5, c[2]); B(34, 26, 6, 4, c[0]); R_(29, 26, 11, 1, c[2]); R_(33, 24, 1, 3, '#f6c744'); R_(33, 24, 2, 1, '#f6c744');
    strap(c[0], c[1]);
  } else if (style === 1) {                                 // ведмедик: круглі вушка, мордочка
    B(17, 7, 6, 5, dk); B(41, 7, 6, 5, dk); B(17, 7, 5, 4, '#a8703a'); B(41, 7, 5, 4, '#a8703a'); B(17, 8, 3, 2, '#e8b87a'); B(41, 8, 3, 2, '#e8b87a');
    soft(29, 21, 17, 14, '#c98a4a', '#e8b06a', '#8a5a2a');
    B(29, 26, 8, 6, dk); B(29, 26, 7, 5, '#f0d29a'); B(29, 25, 6, 4, '#f6e4b8'); R_(27, 23, 5, 3, dk); R_(28, 22, 3, 1, '#7a4a20'); R_(29, 27, 1, 3, dk); R_(25, 14, 3, 4, dk); R_(33, 14, 3, 4, dk);
    strap('#c98a4a', '#e8b06a');
  } else if (style === 2) {                                 // курчатко: жовтий, дзьобик, очка, крильця
    soft(29, 21, 17, 14, '#ffd84a', '#fff09a', '#d9a21a');
    B(14, 24, 4, 6, dk); B(14, 24, 3, 5, '#f0b82a'); B(44, 24, 3, 6, dk); B(44, 24, 2, 5, '#f0b82a');
    R_(22, 15, 4, 5, dk); R_(32, 15, 4, 5, dk); R_(23, 16, 2, 2, '#fff'); R_(33, 16, 2, 2, '#fff'); R_(24, 18, 1, 1, '#fff');
    B(29, 24, 5, 3, dk); B(29, 24, 4, 2, '#ff9a3a'); R_(26, 24, 6, 1, '#d96a1a'); R_(26, 10, 2, 3, dk); R_(29, 8, 2, 4, dk); R_(32, 10, 2, 3, dk);
    strap('#ffd84a', '#fff09a');
  } else if (style === 3) {                                 // мішок на шнурку: стягнутий зверху, шнурок із бантиком
    B(29, 22, 15, 14, dk); B(29, 23, 14, 12, '#b88a52'); B(28, 22, 13, 11, '#d9ae72'); B(24, 15, 6, 4, '#ecc990');
    R_(22, 6, 14, 5, dk); R_(23, 7, 12, 3, '#d9ae72'); R_(25, 4, 3, 4, dk); R_(31, 4, 3, 4, dk); R_(26, 3, 1, 4, '#d9ae72'); R_(32, 3, 1, 4, '#d9ae72');
    R_(21, 10, 16, 3, dk); R_(22, 10, 14, 2, '#e84a4a'); R_(26, 12, 3, 8, dk); R_(27, 12, 1, 7, '#e84a4a'); R_(31, 12, 3, 6, dk); R_(32, 12, 1, 5, '#e84a4a');
    R_(16, 20, 1, 12, '#b88a52'); R_(24, 18, 1, 14, '#b88a52'); R_(32, 18, 1, 14, '#b88a52');
    strap('#e84a4a', '#ff8a8a');
  } else if (style === 4) {                                 // сонечко (божа корівка): червоне з чорними цятками
    B(29, 22, 17, 14, dk); B(29, 23, 16, 13, '#b82a2a'); B(28, 21, 15, 12, '#ee4a4a'); B(22, 14, 6, 3, '#ff8a8a');
    R_(28, 8, 3, 28, dk); B(18, 24, 3, 3, dk); B(40, 24, 3, 3, dk); B(20, 14, 2, 2, dk); B(38, 14, 2, 2, dk); B(24, 30, 2, 2, dk); B(34, 30, 2, 2, dk);
    R_(24, 3, 2, 5, dk); R_(33, 3, 2, 5, dk); R_(22, 2, 3, 2, dk); R_(34, 2, 3, 2, dk);
    strap('#ee4a4a', '#ff8a8a');
  } else {                                                  // хмаринка: ліловий з пухнастим краєм і сердечком
    B(17, 12, 7, 6, dk); B(29, 7, 8, 6, dk); B(41, 12, 7, 6, dk);
    B(17, 12, 6, 5, '#c9b0f0'); B(29, 7, 7, 5, '#c9b0f0'); B(41, 12, 6, 5, '#c9b0f0');
    soft(29, 21, 17, 13, '#c9b0f0', '#eadcff', '#9a7ac8');
    R_(24, 19, 4, 3, '#ff9ac0'); R_(30, 19, 4, 3, '#ff9ac0'); R_(23, 20, 12, 3, '#ff9ac0'); R_(25, 23, 8, 2, '#ff9ac0'); R_(27, 25, 4, 1, '#ff9ac0'); R_(25, 19, 2, 1, '#ffd0e4');
    strap('#c9b0f0', '#eadcff');
  }
  gg.restore();
}
// Рюкзак у заставці: чорний, лежить уздовж спини Капі, два ремені навколо тулуба
function cutBagDrawBlack(gg, style, boy) {                      // справжні рюкзаки збоку: корпус, передня кишеня, ручка, блискавки, пляшечка, ремінь через плече. Координати ×4 спрайта Капі
  const dk = '#2a1a14', R_ = (x, y, w, h, c) => { gg.fillStyle = c; gg.fillRect(x, y, w, h); };
  const B = (cx, cy, rx, ry, c) => { gg.fillStyle = c; for (let dy = -ry; dy <= ry; dy++) { const h = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.5)))); gg.fillRect(cx - h, cy + dy, h * 2, 1); } };
  // заокруглений прямокутник із контуром, світлою кромкою зверху-ліворуч і тінню знизу-праворуч
  const RR = (x, y, w, h, r, c, hi, sh) => { for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) { const cx = i < r ? r - i : i >= w - r ? i - (w - 1 - r) : 0, cy = j < r ? r - j : j >= h - r ? j - (h - 1 - r) : 0; const inside = (cx * cx + cy * cy) <= r * r + 0.5 && i >= 0 && j >= 0 && i < w && j < h; const edge = (cx * cx + cy * cy) <= (r + 1) * (r + 1) + 0.5 && i >= -1 && j >= -1 && i <= w && j <= h; if (inside) { R_(x + i, y + j, 1, 1, c); } else if (edge) { R_(x + i, y + j, 1, 1, dk); } } if (hi) { R_(x + r, y, w - r * 2, 2, hi); R_(x, y + r, 2, h - r * 2, hi); } if (sh) { R_(x + r, y + h - 2, w - r * 2, 2, sh); R_(x + w - 2, y + r, 2, h - r * 2, sh); } };
  const SEG = [[40, 20, 4, 3], [42, 23, 4, 4], [43, 27, 4, 5], [44, 32, 4, 6], [44, 38, 4, 6], [43, 44, 4, 5]];
  const strap = (c, c2) => { SEG.forEach(r => R_(r[0] - 1, r[1] - 1, r[2] + 2, r[3] + 2, dk)); SEG.forEach(r => { R_(r[0], r[1], r[2], r[3], c); R_(r[0], r[1], 1, r[3], c2); }); R_(34, 18, 8, 4, dk); R_(35, 19, 6, 2, c); R_(36, 19, 3, 1, c2); };      // ремінь над спиною й під лапою
  const zip = (x, y, w) => { R_(x, y, w, 1, dk); R_(x + w - 3, y - 1, 3, 3, '#d0d6e0'); R_(x + w - 2, y, 1, 1, dk); };
  gg.save(); gg.translate(0, 9);
  const c = ['#3a3f4c', '#6a7284', '#1e222c'];
  const vs = (x, y0, y1, dx) => { for (let y = y0; y <= y1; y++) { const o = Math.round(Math.sin((y - y0) / (y1 - y0) * 1.6) * dx); R_(x + o - 1, y, 6, 1, dk); } for (let y = y0; y <= y1; y++) { const o = Math.round(Math.sin((y - y0) / (y1 - y0) * 1.6) * dx); R_(x + o, y, 4, 1, c[0]); R_(x + o, y, 1, 1, c[1]); } };   // ремінь навколо тулуба
  {                                        // лежачий чорний рюкзак: корпус уздовж спини, ручка зверху, оранжева смуга, передня кишеня до голови, два ремені навколо тулуба
    vs(21, 24, 44, -2); vs(45, 24, 46, 2);
    RR(14, 5, 36, 21, 8, c[0], c[1], c[2]);                                              // корпус
    R_(26, 2, 14, 4, dk); R_(27, 3, 12, 2, c[2]);                                         // ручка
    R_(21, 5, 3, 21, '#ff8a2a'); R_(21, 5, 1, 21, '#ffc080');                              // помаранчева смуга
    RR(36, 9, 13, 15, 4, '#555c6e', '#8a92a6', c[2]); zip(37, 14, 11); R_(39, 18, 7, 2, '#ff8a2a');   // передня кишеня
    R_(14, 14, 4, 8, dk); R_(15, 15, 2, 6, '#8a92a6');                                    // бічна пряжка
  }
  gg.restore();
}
function cutDrawCapy(g, x, T, L, hop, flip, squash, emo) {
  const cv = cutCapyHi(), moving = (T < CT.walk) || (T > CT.flank0 && T < CT.flank1), bob = moving ? Math.abs(Math.sin(T * 8)) * -1.4 : 0, boy = state.settings.gender === 'm';
  const bag = boy ? ['#3f6fc4', '#6fa0f0', '#2a4a94'] : ['#e0709a', '#ff9fc0', '#a8406a'];
  cutDrawChar(g, cv, x, 166 - hop + bob, flip, { sy: squash || 1, rot: moving ? Math.sin(T * 8) * 0.03 : 0, after: gg => {
    cutFace(gg, emo);
    cutBagDrawBlack(gg, 0, boy);
  } });
  if (emo.mark) { const hx = (flip ? -1 : 1) * 8; cutMark(g, emo.mark, x + hx, 166 - hop - 56, T); }
}
function cutDrawBodya(g, x, T, point, faceLeft, hammer) {
  const cv = cutHi('team_bodya_e0'), walking = (T > CT.bIn0 && T < CT.bIn1) || (T > CT.sign1 + 0.3 && T < CT.sign1 + 1.7) || (T > CT.asm0 - 0.4 && T < CT.asm0 + 0.6), bob = walking ? Math.abs(Math.sin(T * 9)) * -1.2 : 0;
  cutDrawChar(g, cv, x, 166 + bob, !faceLeft, { after: gg => {
    gg.fillStyle = '#f5c518'; gg.fillRect(8, -6, 48, 14); gg.fillRect(16, -14, 32, 10); gg.fillStyle = '#e8a010'; gg.fillRect(8, 6, 48, 3); gg.fillStyle = '#fff3a0'; gg.fillRect(20, -10, 8, 3);       // каска
  } });
  const dir = faceLeft ? -1 : 1, wave = T >= 7.7 && T < 8.6;
  if (wave) { const wy = Math.sin(T * 14) * 2; g.fillStyle = '#7a5230'; g.fillRect(dir > 0 ? x + 8 : x - 11, 166 - 30 + wy, 3, 13); g.fillStyle = '#c99a62'; g.fillRect(dir > 0 ? x + 7 : x - 12, 166 - 34 + wy, 5, 5); }
  if (hammer) { const a = Math.sin(T * 13) * 0.7 - 0.2; g.save(); g.translate(x - dir * 7, 166 - 15); g.scale(-dir, 1); g.rotate(-1.0 + a); g.fillStyle = '#7a5230'; g.fillRect(0, -1, 14, 2); g.fillStyle = '#8f98a8'; g.fillRect(11, -4, 6, 7); g.fillStyle = '#c9d1de'; g.fillRect(11, -4, 6, 2); g.restore(); }
  else if (point) { g.fillStyle = '#7a5230'; g.fillRect(dir > 0 ? x + 6 : x - 20, 166 - 15, 14, 3); g.fillStyle = '#c99a62'; g.fillRect(dir > 0 ? x + 19 : x - 23, 166 - 16, 4, 5); }
}
function cutRenderWorld(T) {
  const g = cut.wg, W = cut.W, H = cut.H, Q = CUT_Q, st = CUT_STYLES[cut.style], L = cutLay(), shift = Math.round((H - 216) * 0.9), amb = cut.amb;      // зайву висоту (телефон) заповнюють небо зверху й трохи бруківки знизу
  const camX = Math.round(cutCamCx(T, L) * Q - W * Q / 2) / Q; cut.camX = camX;
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(cutSky(W, H, shift), 0, 0, W * Q, H * Q);
  cutTf(g, 0, 0);
  const hz = 156 + shift;
  if (st.stars) for (let i = 0; i < 90; i++) { const x = Math.floor(cutHash(i) * W), y = Math.floor(cutHash(i + 99) * (hz * 0.72)), tw = 0.55 + 0.45 * Math.sin(amb * (1.2 + cutHash(i + 5)) + i * 7); if (cutHash(i + 40) < st.stars) { g.globalAlpha = 0.5 * tw + 0.3; cutRc(g, x, y, 1, 1, '#ffffff'); if (i % 9 === 0) { g.globalAlpha = 0.5 * tw; cutRc(g, x - 1, y, 3, 1, '#cfe0ff'); cutRc(g, x, y - 1, 1, 3, '#cfe0ff'); } } }
  g.globalAlpha = 1;
  if (st.sun === 'sun' || st.sun === 'low') {                                   // сонце з гри (низьке — помаранчеве)
    const low = st.sun === 'low', x = Math.round(low ? W * 0.3 : W * 0.78), y = Math.round(low ? hz - 14 : hz - 36);
    g.globalAlpha = 0.45; disc(g, x, y, 13, low ? 'o' : 'w'); g.globalAlpha = 1; disc(g, x, y, 9, low ? 'o' : 'y'); disc(g, x, y, 6, low ? 'h' : 'w');
  } else {                                                                       // місяць з гри: ореол, кратери, моря
    const x = Math.round(W * 0.76), y = 44; g.globalAlpha = 0.09; disc(g, x, y, 20, 'w'); g.globalAlpha = 0.14; disc(g, x, y, 16, 'w'); g.globalAlpha = 0.24; disc(g, x, y, 13, 'w'); g.globalAlpha = 1;
    disc(g, x, y, 10, 'e'); disc(g, x, y, 9, 'W'); disc(g, x - 1, y - 1, 8, 'w');
    g.globalAlpha = 0.55; R(g, x - 6, y - 4, 4, 3, 'e'); R(g, x + 1, y - 6, 5, 3, 'e'); R(g, x + 2, y + 1, 4, 4, 'e'); R(g, x - 5, y + 2, 3, 3, 'e'); R(g, x - 1, y + 5, 3, 2, 'e'); g.globalAlpha = 0.8;
    R(g, x - 6, y - 5, 2, 1, 'w'); R(g, x + 1, y - 7, 3, 1, 'w'); R(g, x + 2, y, 2, 1, 'w'); R(g, x - 5, y + 1, 2, 1, 'w'); R(g, x - 1, y + 4, 2, 1, 'w'); g.globalAlpha = 1;
  }
  const nCl = 4 + Math.floor((H - 216) / 34), tint = { A: '', B: 'grey', C: 'dark' }[cut.style];                                     // хмари — ті самі, що в грі
  for (let i = 0; i < nCl; i++) { const cw = W + 120, x = Math.round((((i * 170 - amb * (2 + (i % 3)) - camX * 0.06) % cw) + cw) % cw - 60), y = Math.round(4 + (i * 37) % Math.max(50, hz - 110)); g.globalAlpha = cut.style === 'C' ? 0.5 : 0.95; g.drawImage(cloudCanvas(i % 3, tint), x, y); }
  g.globalAlpha = 1;
  if (cut.style !== 'C') { const bx = ((amb * 7 + W * 0.3) % (W + 120)) - 60, by = 36 + Math.sin(amb * 0.7) * 2, bc = cut.style === 'B' ? '#d96a6a' : '#e8e4d8'; g.globalAlpha = 0.95; cutRc(g, bx + 1, by, 28, 11, bc); cutRc(g, bx + 3, by - 1.5, 24, 14, bc); cutRc(g, bx + 5, by + 2, 20, 2, '#ffffff'); cutRc(g, bx - 5, by + 1, 6, 3, '#b04a4a'); cutRc(g, bx - 5, by + 6, 6, 3, '#b04a4a'); cutRc(g, bx + 10, by + 13, 10, 4, '#6b4a2a'); cutRc(g, bx + 11, by + 14, 3, 2, '#bfe3f2'); g.globalAlpha = 1; }
  // світ
  cutTf(g, -camX, shift);
  const layer = (p, fn) => { g.save(); g.translate(camX * (1 - p), 0); fn(camX * p, camX * p + W); g.restore(); };
  layer(0.25, (a, b) => { for (let i = Math.floor(a / 46) - 1; i < Math.ceil(b / 46) + 1; i++) { const x = i * 46 + cutHash(i) * 10, w = 28 + cutHash(i + 5) * 18, h = 40 + cutHash(i + 9) * 52; cutRc(g, x, 138 - h, w, h, cut.style === 'A' ? '#a9bfdc' : cut.style === 'B' ? '#6a4a86' : '#1c2a5a'); for (let k = 0; k < h / 12; k++) if (cutHash(i * 7 + k) < st.win) cutRc(g, x + 4 + (k % 2) * 10, 138 - h + 6 + k * 10, 3, 3, 'rgba(255,214,120,.8)'); } });
  layer(0.55, (a, b) => { for (let i = Math.floor(a / 62) - 1; i < Math.ceil(b / 62) + 1; i++) { const hc = cutHouseCv(i + 3); g.globalAlpha = 0.55; g.drawImage(hc.c, i * 62 + cutHash(i + 21) * 14, 146 - hc.h * 0.5, hc.w * 0.5, hc.h * 0.5); g.globalAlpha = 1; } });
  const lotBuilt = T >= CT.asm1 - 0.1;
  { let rx = L.lotL; for (let j = 0; j < 14; j++) { const hc = cutHouseCv(-1 - j); rx -= hc.hw; if (rx + hc.hw > camX - 30 && rx < camX + W + 30) g.drawImage(hc.c, rx - hc.ox, 148 - hc.h + 1); }
    rx = L.lotR; for (let j = 0; j < 14; j++) { const hc = cutHouseCv(j); if (rx > camX - 120 && rx < camX + W + 30) g.drawImage(hc.c, rx - hc.ox, 148 - hc.h + 1); rx += hc.hw; } }
  // тротуар
  g.fillStyle = PALETTE.E; g.fillRect(camX, 148, W, 24); g.fillStyle = PALETTE.e; g.fillRect(camX, 148, W, 1);
  for (let x = Math.floor(camX / 20) * 20 + 6; x < camX + W; x += 20) g.fillRect(x, 149, 1, 9);
  const st4 = CUT_STYLES[cut.style].tint; g.fillStyle = 'rgba(' + st4[0] + ',' + st4[1] + ',' + st4[2] + ',' + st4[3] * 0.85 + ')'; g.fillRect(camX, 148, W, 24);
  if (cut.style === 'C') { g.fillStyle = 'rgba(240,248,255,.7)'; g.fillRect(camX, 148, W, 3); for (let x = Math.floor(camX / 7) * 7; x < camX + W; x += 7) g.fillRect(x, 151, 3 + (x % 5), 1 + (x % 3)); }
  g.fillStyle = PALETTE.e; g.fillRect(camX, 172, W, 2); g.fillStyle = PALETTE.w; g.fillRect(camX, 172, W, 1);
  const cb = cutCobbleCv(); for (let yy = 174, r = 0; yy < H - shift + 44; yy += 44, r++) for (let x = Math.floor(camX / 512) * 512 - 200; x < camX + W; x += 512) g.drawImage(cb, x + (r % 2) * 190, yy); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(camX, 208, W, 10);
  // ділянка: паркан і земля
  if (!lotBuilt) {
    cutRc(g, L.lotL, 150, L.lotR - L.lotL, 22, '#a88c5e'); for (let k = 0; k < 18; k++) { const x = L.lotL + 6 + cutHash(k + 61) * (L.lotR - L.lotL - 14); cutRc(g, x, 152 + cutHash(k + 9) * 16, 3, 1.5, cutHash(k) < 0.5 ? '#8a6c40' : '#c0a374'); }
    for (let k = 0; k < 8; k++) { const x = L.lotL + 4 + k * 22; cutRc(g, x, 120, 4, 28, '#8a5a30'); cutRc(g, x, 120, 4, 2, '#b88450'); cutRc(g, x, 122, 1, 26, '#a06a38'); } cutRc(g, L.lotL, 128, L.lotR - L.lotL, 3, '#a06a38'); cutRc(g, L.lotL, 138, L.lotR - L.lotL, 3, '#a06a38');
    for (let k = 0; k < 11; k++) { const x = L.lotL + 8 + cutHash(k + 71) * (L.lotR - L.lotL - 16); cutRc(g, x, 164, 1, 5, '#5f9a48'); cutRc(g, x + 2, 166, 1, 3, '#4f8a3a'); cutRc(g, x - 2, 167, 1, 2, '#6fb058'); }
    cutRc(g, L.lotL + 6, 100, 3, 50, '#6b4a2a'); cutRc(g, L.lotL - 6, 96, 22, 14, '#d8c08a'); cutRc(g, L.lotL - 6, 96, 22, 2, '#a88c5e');
    if (cut.style === 'C') { g.fillStyle = 'rgba(240,248,255,.75)'; g.fillRect(L.lotL, 150, L.lotR - L.lotL, 3); g.fillRect(L.lotL - 6, 94, 22, 2); }
  }
  const lamp = cutLampCv();
  for (let k = Math.floor(camX / 110) - 1; k < Math.ceil((camX + W) / 110) + 1; k++) { const x = 40 + k * 110; if (x > L.lotL - 12 && x < L.lotR + 12 && !lotBuilt) continue; g.drawImage(lamp.c, x - 10, 158 - lamp.h + 2); }
  for (let k = Math.floor(camX / 160) - 1; k < Math.ceil((camX + W) / 160) + 1; k++) { const x = 90 + k * 160; if (x > L.lotL - 30 && x < L.lotR + 30) continue; const tc = cutTreeCv(((k % 3) + 3) % 3); g.drawImage(tc.c, x - 55, 156 - tc.base); }
  // монета: на землі, у руках, летить
  const coinOn = T >= 3.9 && T < CT.pick, put = T >= CT.pick && T < CT.pick + 0.8, fly = T >= CT.fly0 && T < CT.flash;
  const capyXn = cutCapyX(T, L), spin = T * 5, bagX = capyXn - 13, bagY = 124; let coinPos = null, coinR = 5;
  if (coinOn) coinPos = [L.coinX, 163 - Math.max(0, Math.sin((T - 3.9) * 6) * Math.max(0, 1 - (T - 3.9) * 2) * 6)];
  else if (put) { const u = cutSm((T - CT.pick) / 0.8); coinPos = [cutLerp(L.coinX, bagX, u), cutLerp(163, bagY - 4, u) - Math.sin(Math.PI * u) * 20]; coinR = u > 0.7 ? 5 - (u - 0.7) / 0.3 * 3.5 : 5; }
  else if (fly) { const u = cutSm((T - CT.fly0) / 0.8), a = T < CT.fly1 ? u : 1; coinPos = [cutLerp(bagX, L.shopCX, a), cutLerp(bagY - 4, 96, a) - Math.sin(Math.PI * Math.min(1, u)) * 26 + (T > CT.fly1 ? Math.sin(T * 4) * 2 : 0)]; coinR = (T < CT.fly0 + 0.25 ? 1.5 + (T - CT.fly0) / 0.25 * 3.5 : 5) + Math.max(0, T - CT.fly1) * 1.2; }
  cut.coinPos = coinPos;
  // магазин: збирається з пікселів монети; риштування й Бодя-будівельник
  const sx0 = L.shopCX - cut.shopW / 2, sy0 = 170 - cut.shopH;
  if (T >= CT.asm0 - 0.4 && T < CT.asm1 + 0.6) {
    const a = Math.min(1, (T - CT.asm0 + 0.4) / 0.8) * (T > CT.asm1 ? Math.max(0, 1 - (T - CT.asm1) / 0.6) : 1), pl = [sx0 - 8, sx0 + cut.shopW + 4];
    g.globalAlpha = a; pl.forEach(px => { cutRc(g, px, 170 - cut.shopH - 12, 3, cut.shopH + 12, '#8a5a30'); cutRc(g, px, 170 - cut.shopH - 12, 1, cut.shopH + 12, '#b88450'); });
    for (let lv = 0; lv < 5; lv++) { const y = 168 - lv * (cut.shopH + 10) / 5; cutRc(g, pl[0] - 2, y, pl[1] - pl[0] + 7, 2, '#a06a38'); cutRc(g, pl[0] - 2, y, pl[1] - pl[0] + 7, 0.5, '#d9a46a'); }
    cutRc(g, pl[0] + 2, 170 - cut.shopH + 4, 2, cut.shopH, '#7a4a28'); g.globalAlpha = 1;
  }
  if (T >= CT.asm0) {
    if (T >= CT.asm1) {
      const k = Math.max(0, 1 - (T - CT.asm1) / 0.45), tap = cut.tapAmb >= 0 ? Math.max(0, 1 - (cut.amb - cut.tapAmb) / 0.18) : 0;
      g.save(); g.translate(L.shopCX, 170); g.scale(1 + 0.03 * tap + 0.03 * k, 1 - 0.05 * tap + 0.03 * k); g.drawImage(cut.thumbs[0].c, -cut.shopW / 2, -cut.shopH); g.restore();
      if (k > 0) { g.globalAlpha = k * 0.7; cutRc(g, sx0, sy0, cut.shopW, cut.shopH, '#fff6c8'); g.globalAlpha = 1; }
    } else {
      const px = cut.shopPx, cxp = L.shopCX, cyp = 96, spread = L.nar ? 70 : 110, span = CT.asm1 - CT.asm0 - 0.8, ex = cutSm((T - CT.asm0) / 0.5);
      let front = 0;
      for (let i = 0; i < px.length; i++) {
        const p = px[i], tx = sx0 + p.x, ty = sy0 + p.y, scx = cxp + Math.cos(p.a) * (28 + p.r * spread), scy = cyp + Math.sin(p.a) * (20 + p.r * spread * 0.62), tl = CT.asm0 + 0.2 + p.o * span;
        let x, y;
        if (T < tl) { if (p.r > 0.4) continue; x = cutLerp(cxp, scx, ex) + Math.sin(T * 3 + p.w) * 1.5; y = cutLerp(cyp, scy, ex) + Math.cos(T * 2.6 + p.w) * 1.5; g.fillStyle = ['#ffe36a', '#f8cf4a', '#fff6c8', '#e8a92a'][Math.floor(p.w) % 4]; g.fillRect(Math.round(x), Math.round(y), 1.2, 1.2); continue; }
        const u = Math.min(1, (T - tl) / 0.9), e = cutSm(u);
        if (u >= 1) { front = Math.max(front, p.y); g.fillStyle = (T - tl - 0.9) < 0.14 ? '#fff6c8' : p.c; g.fillRect(tx, ty, 1, 1); continue; }
        x = cutLerp(scx, tx, e); y = cutLerp(scy, ty, e) - Math.sin(Math.PI * u) * 12;
        g.fillStyle = u < 0.45 ? ['#ffe36a', '#f8cf4a', '#fff6c8'][Math.floor(p.w) % 3] : p.c; g.fillRect(Math.round(x), Math.round(y), 1.5, 1.5);
      }
      const prog = Math.max(0, Math.min(1, (T - CT.asm0 - 0.2 - 0.9) / span)), ly = sy0 + cut.shopH * (1 - prog);       // яскрава лінія зведення рухається вгору
      if (prog > 0.02 && prog < 0.98) { g.globalAlpha = 0.85; cutRc(g, sx0 - 2, ly, cut.shopW + 4, 1, '#fff6c8'); g.globalAlpha = 0.25; cutRc(g, sx0 - 2, ly - 3, cut.shopW + 4, 3, '#ffe36a'); g.globalAlpha = 1; }
    }
  }
  if (coinPos && T < CT.flash) { cutCoin(g, coinPos[0], coinPos[1], coinR, spin, (T > CT.fly0 ? 0.9 + Math.sin(T * 6) * 0.2 : 0.5)); if (coinOn) { for (let k = 0; k < 3; k++) { const ph = (T * 1.6 + k * 0.33) % 1; if (ph < 0.5) cutSpark(g, coinPos[0] + (k - 1) * 9, coinPos[1] - 6 - ph * 8, ph < 0.25 ? 1 : 2, '#fff7c0'); } } }
  // пил за Капі
  if (T < CT.walk) for (let n = 0; n < 12; n++) { const tn = T - n * 0.22; if (tn < 0) break; const age = n * 0.22, x = cutCapyX(tn, L) - 16; g.globalAlpha = Math.max(0, 0.5 - age * 0.18); cutRc(g, x - age * 5, 164 - age * 6, 3 + age * 3, 3 + age * 2, '#e8dcc0'); }
  g.globalAlpha = 1;
  // актори на окремому шарі, трохи затонованому
  const ag = cut.ag; ag.setTransform(1, 0, 0, 1, 0, 0); ag.clearRect(0, 0, W * Q, H * Q); cutTf(ag, -camX, shift); ag.imageSmoothingEnabled = false;
  const u2 = cut.tapAmb >= 0 ? T - CT.TW : -1, hop = (u2 >= 0.1 && u2 < 0.9) ? Math.abs(Math.sin((u2 - 0.1) / 0.8 * Math.PI)) * 12 : (T >= 6.0 && T < 6.45 ? Math.abs(Math.sin((T - 6.0) / 0.45 * Math.PI)) * 6 : (T > CT.flank0 && T < CT.flank1 ? Math.abs(Math.sin((T - CT.flank0) * 9)) * 3 : 0));
  const emo = cutEmo(T, cut.amb), look = (T >= 4.55 && T < 5.05) ? 1 : 0, down = (T >= 5.5 && T < 6.2) ? 0.94 : 1;
  cutDrawCapy(ag, capyXn, T, L, hop, look, down, emo);
  const hammering = T >= CT.asm0 + 0.6 && T < CT.asm1 + 0.2;
  if (T >= CT.bIn0) cutDrawBodya(ag, cutBodyX(T, L), T, T >= 11.7 && T < 13.4, T < 11.7 || T >= CT.asm1 + 0.4, hammering);
  if (hammering) { const sw = Math.sin(T * 13); if (sw > 0.9) for (let k = 0; k < 3; k++) cutSpark(ag, L.shopCX - 80 + k * 4, 150 - k * 3, 1, '#ffe36a'); }
  cutTf(ag, 0, 0); ag.setTransform(1, 0, 0, 1, 0, 0); ag.globalCompositeOperation = 'source-atop'; ag.fillStyle = 'rgba(' + st.tint[0] + ',' + st.tint[1] + ',' + st.tint[2] + ',' + (st.tint[3] * 0.55) + ')'; ag.fillRect(0, 0, W * Q, H * Q); ag.globalCompositeOperation = 'source-over';
  // світло ліхтарів, вікон і монети
  if (st.glow) {
    g.globalCompositeOperation = 'lighter';
    for (let k = Math.floor(camX / 110) - 1; k < Math.ceil((camX + W) / 110) + 1; k++) { const x = 40 + k * 110; if (x > L.lotL - 12 && x < L.lotR + 12 && !lotBuilt) continue; const gr = g.createRadialGradient(x, 124, 2, x, 134, 52); gr.addColorStop(0, 'rgba(255,214,120,' + 0.42 * st.glow + ')'); gr.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = gr; g.fillRect(x - 56, 74, 112, 110); g.fillStyle = 'rgba(255,200,110,' + 0.10 * st.glow + ')'; g.beginPath(); g.ellipse(x, 168, 44, 6, 0, 0, 7); g.fill(); }
    g.globalCompositeOperation = 'source-over';
  }
  if (coinPos && T < CT.flash && st.glow) { g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(coinPos[0], coinPos[1], 2, coinPos[0], coinPos[1], 46); gr.addColorStop(0, 'rgba(255,220,110,.45)'); gr.addColorStop(1, 'rgba(255,220,110,0)'); g.fillStyle = gr; g.fillRect(coinPos[0] - 50, coinPos[1] - 50, 100, 100); g.globalCompositeOperation = 'source-over'; }
  if (lotBuilt && st.glow) { g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(L.shopCX, 150, 4, L.shopCX, 150, 96); gr.addColorStop(0, 'rgba(255,214,120,' + 0.30 * st.glow + ')'); gr.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = gr; g.fillRect(L.shopCX - 100, 80, 200, 110); g.globalCompositeOperation = 'source-over'; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(cut.al, 0, 0); cutTf(g, -camX, shift);
  if ((T > CT.pick + 0.6 && T < CT.pick + 1.2) || (T > CT.fly0 - 0.15 && T < CT.fly0 + 0.4)) for (let k = 0; k < 3; k++) { const ph = (T * 3 + k * 0.33) % 1; cutSpark(g, bagX + (k - 1) * 6, bagY - 4 - ph * 9, ph < 0.4 ? 1 : 2, '#fff7c0'); }
  // листя, пелюстки або сніг, що падають
  { cutTf(g, 0, 0); const n = st.fall === 'snow' ? 90 : 36; for (let i = 0; i < n; i++) { const sp = 12 + cutHash(i + 3) * 24, x = (((cutHash(i) * (W + 80) + Math.sin(amb * 0.9 + i) * 8 - amb * 4 * (st.fall === 'snow' ? 0.3 : 1)) % (W + 80)) + W + 80) % (W + 80) - 40, y = ((cutHash(i + 50) * (H + 40) + amb * sp) % (H + 40)) - 20;
      if (st.fall === 'snow') { g.globalAlpha = 0.85; cutRc(g, x, y, 1.5, 1.5, '#ffffff'); } else { g.globalAlpha = 0.9; cutRc(g, x, y, 3, 1.5, st.fall === 'petal' ? ['#ffc9d4', '#ef8fa3', '#fff0f4'][i % 3] : ['#c4553d', '#e8863c', '#f2b84b', '#a8703f'][i % 4]); } } g.globalAlpha = 1; cutTf(g, -camX, shift); }
  // передній план: кут сусіднього будинку, з-за якого виходить Боді
  g.setTransform(1, 0, 0, 1, 0, 0);
  cut.shopRectW = [sx0, sy0, cut.shopW, cut.shopH]; cut.L = L; cut.shift = shift;
}
function cutCache(k, fn) { return cut.cache[k] || (cut.cache[k] = fn()); }
function cutW2S(wx, wy, z, f) { const sx = wx - cut.camX, sy = wy + cut.shift; return [(sx - f[0]) * z + f[0], (sy - f[1]) * z + f[1]]; }
function cutDrawFrame(T) {
  const Tn = T; T = Math.max(0, T);
  const g = cut.g, W = cut.W, H = cut.H, Q = CUT_Q, txt = CUT_TXT[state.lang] || CUT_TXT.uk, amb = cut.amb;
  cutRenderWorld(T); const L = cut.L;
  let z = cutZoom(T), f = [W / 2, H / 2];
  if (z > 1.001) {
    const sh = cut.shift; let target;
    if (T < 7.2 && cut.coinPos) target = [cut.coinPos[0] - cut.camX, cut.coinPos[1] + sh];
    else if (T < 15) target = [L.shopCX - cut.camX, 96 + sh];
    else target = [L.shopCX - cut.camX, 170 - cut.shopH + 22 + sh];
    f = [Math.max(10, Math.min(W - 10, target[0])), Math.max(10, Math.min(H - 10, target[1]))];
  }
  let shk = 0; [[CT.flash, 4], [16.2, 1.6], [17.0, 1.6], [17.8, 1.8], [18.6, 2.2]].forEach(([te, a]) => { const d = T - te; if (d >= 0 && d < 0.3) shk = Math.max(shk, a * (1 - d / 0.3)); });
  if (cut.tapAmb >= 0) { const d = amb - cut.tapAmb; if (d >= 0 && d < 0.25) shk = Math.max(shk, 1.5 * (1 - d / 0.25)); }
  const ox = shk ? Math.round(Math.sin(T * 91) * shk * Q) : 0, oy = shk ? Math.round(Math.cos(T * 77) * shk * Q) : 0;
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.fillStyle = '#000'; g.fillRect(0, 0, W * Q, H * Q);
  g.drawImage(cut.wc, f[0] * (1 - 1 / z) * Q, f[1] * (1 - 1 / z) * Q, W * Q / z, H * Q / z, ox, oy, W * Q, H * Q);
  cutTf(g, 0, 0); g.imageSmoothingEnabled = false;
  const w2s = (wx, wy) => cutW2S(wx, wy, z, f);
  const u7 = cut.tapAmb >= 0 ? T - CT.u0 : -99;
  let dim = cutKf(T, [[13.8, 0], [14.5, 0.5], [14.7, 0.5], [CT.flash + 0.05, 0]]); if (u7 > -0.4 && u7 < 7.9) dim = Math.max(dim, 0.45 * cutSm((u7 + 0.4) / 0.5) * (u7 > 7.2 ? Math.max(0, 1 - (u7 - 7.2) / 0.7) : 1));
  if (dim > 0.01) { g.fillStyle = 'rgba(8,6,20,' + dim + ')'; g.fillRect(0, 0, W, H); }
  if (T >= CT.charge + 0.05 && T < CT.flash + 0.1) {
    const u = cutSm((T - CT.charge - 0.05) / 0.75), r = cutLerp(14, Math.max(W, H) * 0.62, u * u), cpos = T < CT.big1 ? w2s(L.shopCX, 96 + Math.sin(T * 4) * 2) : [W / 2, H / 2], cx = cutLerp(cpos[0], W / 2, u), cy = cutLerp(cpos[1], H / 2, u);
    cutCoin(g, cx, cy, r, T * (5 + u * 14), 0.8);
  }
  const fl = cutKf(T, [[14.55, 0], [CT.flash, 1], [CT.flash + 0.06, 1], [15.9, 0]]); if (fl > 0.01) { g.fillStyle = 'rgba(255,248,205,' + fl + ')'; g.fillRect(0, 0, W, H); }
  const F = cutFinale(T, L, w2s);
  if (F) {
    g.fillStyle = 'rgba(8,6,22,' + (0.68 * cutSm(F.fT / 0.9)) + ')'; g.fillRect(0, 0, W, H);
    const al = Math.min(1, F.fT / 0.4), step = F.fT < 2.8 ? Math.abs(Math.sin(F.fT * 8)) * -2 * F.sc : 0;
    cutDrawChar(g, F.melC, F.mx, F.foot + step, false, { sx: F.sc, sy: F.sc, alpha: al }); cutDrawChar(g, F.nikC, F.nx, F.foot + step, false, { sx: F.sc, sy: F.sc, alpha: al });
    if (F.wk > 0.25) cutMark(g, 'heart', F.fx, F.foot - F.h - 8, T);
  }
  const say = cutSayState(T, txt);
  if (say && z < 1.2) {
    let pos;
    if (say.who === 'c') pos = w2s(cutCapyX(T, L), 166 - 50); else if (say.who === 'b') pos = w2s(cutBodyX(T, L), 166 - 36); else if (F) pos = [say.who === 'm' ? F.mx : F.nx, F.foot - F.h + 6]; else pos = [W / 2, H / 2];
    cutBubble(g, say.text, pos[0], pos[1] - 4, say.who, say.prog, W);
  }
  [[CT.ting1, 'TING!', 0], [CT.ting2, 'TING!', 1]].forEach(([te, s, k]) => { const a = T - te; if (a >= 0 && a < 0.9) { const p = w2s(cutCapyX(T, L) + (k ? -36 : 36), 166 - 84); cutPopText(g, s, Math.max(40, Math.min(W - 40, p[0])), Math.max(14, p[1] - a * 8), 3, '#ffe36a', '#7a3a10', a); } });
  if (T >= CT.asm0 + 0.5 && T < CT.asm1) { const per = 0.7, a = (T - CT.asm0 - 0.5) % per, n = Math.floor((T - CT.asm0 - 0.5) / per); if (a < 0.5 && n % 2 === 0) { const p = w2s(L.shopCX - 88, 120); cutPopText(g, txt.tuk, Math.max(30, p[0]), p[1] - n % 3 * 8, 2, '#fff6c8', '#6b3a10', a); } }
  { const n = (cut.tapAmb >= 0 && T >= CT.TW + 0.75) ? 2 : 1, el = cut.hudEl; if (el) { const show = T >= CT.bIn0 ? '' : 'none'; if (el.style.display !== show) el.style.display = show; if (cut.hudN !== n) { cut.hudN = n; const cc = el.querySelector('#coinCount'); if (cc) cc.textContent = String(n); } } }
  const sr = cut.shopRectW, sS = w2s(sr[0], sr[1]); cut.rect = [sS[0], sS[1], sr[2] * z, sr[3] * z];
  if (T >= CT.TW - 0.01 && cut.tapAmb < 0) {
    const b = Math.abs(Math.sin(amb * 5)) * 4, pulse = 0.5 + 0.5 * Math.sin(amb * 6), top = sS[1];
    g.globalAlpha = 0.5 + 0.5 * pulse; g.fillStyle = '#fff6c8'; g.fillRect(sS[0] - 2, sS[1] - 2, sr[2] + 4, 1.5); g.fillRect(sS[0] - 2, sS[1] + sr[3], sr[2] + 4, 1.5); g.fillRect(sS[0] - 2, sS[1] - 2, 1.5, sr[3] + 4); g.fillRect(sS[0] + sr[2], sS[1] - 2, 1.5, sr[3] + 4); g.globalAlpha = 1;
    const ax = sS[0] + sr[2] / 2, ay = Math.max(30, top - 12) + b; g.fillStyle = '#3a2a22'; g.fillRect(ax - 7, ay - 1, 15, 3); g.fillRect(ax - 5, ay + 2, 11, 3); g.fillRect(ax - 3, ay + 5, 7, 3); g.fillRect(ax - 1, ay + 8, 3, 3); g.fillStyle = '#ffe36a'; g.fillRect(ax - 6, ay - 1, 13, 2); g.fillRect(ax - 4, ay + 1, 9, 2); g.fillRect(ax - 2, ay + 3, 5, 2); g.fillRect(ax, ay + 5, 1, 2);
    cutTextPx(g, txt.hint, W / 2, Math.max(14, Math.min(ay - 18, 28)), W < 300 ? 2 : 3, '#fff6c8', '#3a2a22', 'center');
  }
  if (cut.tapAmb >= 0) {
    const u = T - CT.TW, hp = cut.hit || [sS[0] + sr[2] / 2, sS[1] + sr[3] / 2];
    if (u >= 0 && u < 0.9) cutPopText(g, txt.click, hp[0], hp[1] - 6 - u * 14, 4, '#ffffff', '#c0392b', u);
    if (u >= 0.05 && u < 0.75) { const k = cutSm((u - 0.05) / 0.7), p0 = [sS[0] + sr[2] / 2, sS[1] + sr[3] * 0.7], p1 = [16, 14]; cutCoin(g, cutLerp(p0[0], p1[0], k), cutLerp(p0[1], p1[1], k) - Math.sin(Math.PI * k) * 26, 5, T * 12, 0.2); }
    for (let i = 0; i < 9; i++) { if (u < 0.2 || u > 1.3) break; const a = i / 9 * 6.283 + 0.4, d = (u - 0.2) * 60 * (0.6 + cutHash(i + 3)); cutSpark(g, hp[0] + Math.cos(a) * d, hp[1] + Math.sin(a) * d * 0.8, 1, ['#ffe36a', '#ff9fc0', '#9fd4ff'][i % 3]); }
  }
  if (u7 > -0.4 && u7 < 7.9) cutS7(g, u7, W, H, txt);
  cut.btn = null;
  if (T >= CT.fin + 7.2) {                                                       // кнопка «ПОЧИНАЄМО!»
    const a = cutSm((T - CT.fin - 7.2) / 0.4), bw = W < 300 ? 140 : 168, bh = 26, bx = Math.round((W - bw) / 2), by = Math.round(H - 40 + (1 - a) * 30 - (W < 300 ? 0 : 6)), pul = 0.5 + 0.5 * Math.sin(amb * 6);
    cutRc(g, bx - 2, by - 2, bw + 4, bh + 4, '#fff6c8'); cutRc(g, bx, by, bw, bh, '#2a7a3a'); cutRc(g, bx, by, bw, 3, '#7aff7a'); cutRc(g, bx, by + bh - 3, bw, 3, '#1d5a2a'); g.globalAlpha = 0.25 * pul; cutRc(g, bx, by, bw, bh, '#ffffff'); g.globalAlpha = 1;
    cutTextPx(g, txt.go, W / 2, by + bh / 2 + 0.5, 3, '#ffffff', '#1d5a2a', 'center'); cut.btn = [bx, by, bw, bh];
  }
  if (Tn < 0) {                                                                  // вступний текст на чорному
    const nar = W < 300, lines = nar ? txt.introN : txt.intro, k = nar ? 2 : 3, cw = 8 * k / CUT_Q; let left = Math.floor((Tn + CUT_PRE) * 20);
    g.fillStyle = '#05060f'; g.fillRect(0, 0, W, H);
    lines.forEach((l, i) => { if (left > 0) { cutTextPx(g, l.slice(0, left), Math.round((W - l.length * cw) / 2), H / 2 - (lines.length - 1) * 9 + i * (nar ? 16 : 20), k, '#fff6c8', '#6b3a10', 'left'); left -= l.length; } });
  }
  const goT = cut.goAmb >= 0 ? cut.amb - cut.goAmb : -1, fade = Math.max(Tn < 0 ? 0 : cutKf(T, [[0, 1], [0.9, 0]]), goT >= 0 ? cutSm(goT / 0.7) : 0);
  if (fade > 0.01) { g.fillStyle = goT >= 0 ? 'rgba(255,248,205,' + fade + ')' : 'rgba(0,0,0,' + fade + ')'; g.fillRect(0, 0, W, H); }
  g.drawImage(cutCache('vig' + W + 'x' + H, () => { const c = document.createElement('canvas'); c.width = W * Q; c.height = H * Q; const v = c.getContext('2d'), gr = v.createRadialGradient(W * Q / 2, H * Q / 2, H * Q * 0.45, W * Q / 2, H * Q / 2, Math.max(W, H) * Q * 0.75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.42)'); v.fillStyle = gr; v.fillRect(0, 0, W * Q, H * Q); return c; }), 0, 0, W, H);
}
// пояснення гри: ланцюжок ТАП → МОНЕТИ → ПОКРАЩЕННЯ → РІВЕНЬ, ріст магазину й гасло
function cutPanel(g, x, y, w, h) { g.fillStyle = '#3a2a22'; g.fillRect(x - 2, y - 2, w + 4, h + 4); g.fillStyle = '#c98a3c'; g.fillRect(x - 1, y - 1, w + 2, h + 2); g.fillStyle = '#fff3d6'; g.fillRect(x, y, w, h); g.fillStyle = '#fffaf0'; g.fillRect(x, y, w, 2); g.fillStyle = '#ecd9ae'; g.fillRect(x, y + h - 2, w, 2); }
function cutPix(g, map, pal, x, y, s) { map.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const col = pal[row[i]]; if (col) { g.fillStyle = col; g.fillRect(x + i * s, y + j * s, s, s); } } }); }
const CUT_ARROW = ['X..........', 'XX.........', 'XOX........', 'XOOX.......', 'XOOOX......', 'XOOOOX.....', 'XOOOOOX....', 'XOOOOOOX...', 'XOOOOOOOX..', 'XOOOOXXXXX.', 'XOXOOX.....', 'XX.XOOX....', 'X..XOOX....', '....XOOX...', '....XOOX...', '.....XX....'];
const CUT_UP = ['.....XX.....', '....XOOX....', '...XOOOOX...', '..XOOOOOOX..', '.XOOOOOOOOX.', 'XOOOOOOOOOOX', 'XXXXOOOOXXXX', '...XOOOOX...', '...XOOOOX...', '...XOOOOX...', '...XXXXXX...'];
function cutArrowR(g, x, y) { g.fillStyle = '#3a2a22'; g.fillRect(x - 5, y - 3, 7, 6); g.fillRect(x, y - 7, 3, 14); g.fillRect(x + 3, y - 5, 2, 10); g.fillRect(x + 5, y - 3, 2, 6); g.fillRect(x + 7, y - 1, 1, 2); g.fillStyle = '#e8a92a'; g.fillRect(x - 4, y - 2, 6, 4); g.fillRect(x + 1, y - 6, 2, 12); g.fillRect(x + 3, y - 4, 2, 8); g.fillRect(x + 5, y - 2, 2, 4); }
function cutIcon(g, i, u) {                      // значки 28×28
  if (i === 0) { g.fillStyle = '#7fb6e8'; for (let r = 0; r < 2; r++) for (let a = 0; a < 6.283; a += 0.22) g.fillRect(Math.round(Math.cos(a) * (10 + r * 4 + (Math.floor(u * 4) % 2))), Math.round(Math.sin(a) * (10 + r * 4 + (Math.floor(u * 4) % 2))) + 3, 1.5, 1.5); cutPix(g, CUT_ARROW, { X: '#2a1a14', O: '#ffffff' }, -6, -9, 1.5); }
  else if (i === 1) { cutCoin(g, -5, 6, 7, 0, 0); cutCoin(g, 6, 7, 7, 0, 0); cutCoin(g, 0, -2, 10, u * 3, 0); }
  else if (i === 2) cutPix(g, CUT_UP, { X: '#1d5a2a', O: '#7aff7a' }, -12, -11, 2);
  else { const t = cut.thumbs[1], s = Math.min(38 / t.w, 28 / t.h); g.drawImage(t.c, -t.w * s / 2, -t.h * s / 2 + 2, t.w * s, t.h * s); }
}
function cutS7(g, u, W, H, txt) {
  const nar = W < 300, pw = Math.min(W - 12, 350), px = Math.round((W - pw) / 2);
  if (u >= 0 && u < 3.3) {
    const row = W >= 392, grid = !row, cardW = row ? 86 : 84, gap = row ? 14 : 8, labels = [txt.i1, txt.i2, txt.i3, txt.i4], top = Math.max(12, Math.round((cut.hudBu || 0) + 3));
    const pw = row ? 4 * cardW + 3 * gap + 16 : 2 * cardW + gap + 12, ph = row ? 60 : 2 * 50 + 6 + 10, px = Math.round((W - pw) / 2), py = top;
    g.globalAlpha = cutSm((u + 0.4) / 0.4); cutPanel(g, px, py, pw, ph); g.globalAlpha = 1;
    for (let i = 0; i < 4; i++) {
      const a = cutSm((u - (0.2 + 0.6 * i)) / 0.3); if (a <= 0) continue;
      const col = row ? i : i % 2, rw = row ? 0 : (i >> 1);
      const cx = px + (row ? 8 : 6) + cardW / 2 + col * (cardW + gap), cy = py + (row ? 22 : 18 + rw * 56), sc = 0.7 + 0.3 * a;
      g.save(); g.globalAlpha = a; g.translate(cx, cy); g.scale(sc, sc); cutIcon(g, i, u); g.restore(); g.globalAlpha = 1;
      cutTextPx(g, labels[i], cx, cy + (row ? 28 : 24), 2, '#3a2a22', null, 'center');
      if (a > 0.9) { if (row && i < 3) cutArrowR(g, cx + cardW / 2 + gap / 2, cy); else if (!row && i === 0) cutArrowR(g, cx + cardW / 2 + gap / 2, cy); else if (!row && i === 2) cutArrowR(g, cx + cardW / 2 + gap / 2, cy); else if (!row && i === 1) { g.save(); g.translate(px + pw / 2, py + 52); g.rotate(Math.PI / 2); cutArrowR(g, 0, 0); g.restore(); } }
    }
  } else if (u >= 3.3 && u < 5.5) {
    const k = u - 3.3, bw = nar ? 52 : 70, bh = nar ? 46 : 54, gap = nar ? 14 : 24, tw = bw * 3 + gap * 2, x0 = Math.round((W - tw) / 2), y0 = nar ? 40 : 22;
    for (let i = 0; i < 3; i++) {
      const a = cutSm((k - i * 0.5) / 0.3); if (a <= 0) continue; const t = cut.thumbs[i], s = Math.min(bw / t.w, bh / t.h), dw = Math.round(t.w * s), dh = Math.round(t.h * s), bx = x0 + i * (bw + gap) + (bw - dw) / 2, by = y0 + bh - dh;
      g.save(); g.globalAlpha = a; g.translate(bx + dw / 2, by + dh); g.scale(0.7 + 0.3 * a, 0.7 + 0.3 * a); g.drawImage(t.c, -dw / 2, -dh, dw, dh); g.restore(); g.globalAlpha = 1;
      if (i < 2 && a > 0.9) cutTextPx(g, '▶', x0 + (i + 1) * (bw + gap) - gap / 2, y0 + bh / 2, 2, '#f6c744', null, 'center');
      if (i === 2 && a > 0.9) for (let q = 0; q < 4; q++) cutSpark(g, bx + dw * (0.1 + 0.27 * q), by + 6 + Math.sin(u * 8 + q) * 3, 1 + (Math.floor(u * 6 + q) % 2), '#fff6c8');
    }
  } else if (u >= 5.5) {
    const k = u - 5.5, y0 = nar ? 44 : 34, wds = [txt.w1, txt.w2, txt.w3];
    wds.forEach((w, i) => { const a = k - i * 0.6; if (a >= 0) cutPopText(g, w, W / 2, y0 + i * (nar ? 22 : 17), nar ? 2.5 : 3, ['#ffe36a', '#9fd4ff', '#7aff7a'][i], '#2a1a3a', a); });
  }
}
// звуки заставки
Object.assign(SFX, {
  cutTing() { const t = audio.ctx.currentTime + 0.01; tone(audio.sfxGain, 'sine', 2637, t, 0.35, 0.32, 2600); tone(audio.sfxGain, 'sine', 3951, t + 0.05, 0.4, 0.2, 3900); tone(audio.sfxGain, 'triangle', 1318, t, 0.2, 0.12); },
  cutPick() { melody('square', [['C6', 0.05], ['E6', 0.05], ['G6', 0.05], ['C7', 0.16]], 0.2); },
  cutBlipC() { tone(audio.sfxGain, 'square', 560 + Math.random() * 60, audio.ctx.currentTime + 0.01, 0.05, 0.1); },
  cutBlipB() { tone(audio.sfxGain, 'square', 260 + Math.random() * 40, audio.ctx.currentTime + 0.01, 0.06, 0.12); },
  cutWhoosh() { const t = audio.ctx.currentTime + 0.01; noiseHit(audio.sfxGain, t, 0.5, 0.2, 'bandpass', 1400); tone(audio.sfxGain, 'sawtooth', 280, t, 0.5, 0.1, 900); },
  cutCharge() { const t = audio.ctx.currentTime + 0.01; for (let i = 0; i < 18; i++) tone(audio.sfxGain, 'sawtooth', 180 * Math.pow(1.1, i), t + i * 0.045, 0.09, 0.11); tone(audio.sfxGain, 'sine', 120, t, 0.9, 0.2, 880); noiseHit(audio.sfxGain, t, 1.0, 0.1, 'highpass', 2500); },
  cutBoom() { const t = audio.ctx.currentTime + 0.01; noiseHit(audio.sfxGain, t, 0.9, 0.55, 'lowpass', 1100); tone(audio.sfxGain, 'sine', 90, t, 0.8, 0.5, 28); tone(audio.sfxGain, 'triangle', 1568, t + 0.05, 0.9, 0.2, 1500); tone(audio.sfxGain, 'triangle', 2093, t + 0.1, 0.9, 0.16, 2000); },
  cutThud() { const t = audio.ctx.currentTime + 0.01; tone(audio.sfxGain, 'triangle', 130, t, 0.14, 0.3, 60); noiseHit(audio.sfxGain, t, 0.08, 0.3, 'bandpass', 900); tone(audio.sfxGain, 'sine', 1800 + Math.random() * 600, t + 0.03, 0.12, 0.1); },
  cutDone() { melody('triangle', [['C5', 0.09], ['E5', 0.09], ['G5', 0.09], ['C6', 0.09], ['E6', 0.3]], 0.35); melody('square', [['C5', 0.09], ['E5', 0.09], ['G5', 0.09], ['C6', 0.09], ['E6', 0.3]], 0.1); },
  cutClick() { const t = audio.ctx.currentTime + 0.01; noiseHit(audio.sfxGain, t, 0.06, 0.4, 'bandpass', 2400); tone(audio.sfxGain, 'square', 900, t, 0.08, 0.2, 380); },
  cutChain(i) { tone(audio.sfxGain, 'triangle', noteFreq(['C5', 'E5', 'G5', 'C6'][i % 4]), audio.ctx.currentTime + 0.01, 0.2, 0.3); },
  cutWord(i) { melody('square', [[['G5', 'B5', 'D6'][i % 3], 0.07], [['C6', 'E6', 'G6'][i % 3], 0.14]], 0.2); },
  cutTock() { const t = audio.ctx.currentTime + 0.01; tone(audio.sfxGain, 'square', 190, t, 0.06, 0.2, 80); noiseHit(audio.sfxGain, t, 0.05, 0.25, 'bandpass', 1900); },
  cutDoor() { const t = audio.ctx.currentTime + 0.01; tone(audio.sfxGain, 'sine', 880, t, 0.25, 0.2, 880); tone(audio.sfxGain, 'sine', 1175, t + 0.18, 0.4, 0.18, 1175); }
});
const CUT_EV = [[CT.ting1, 'cutTing'], [CT.ting2, 'cutTing'], [CT.pick, 'cutPick'], [CT.fly0, 'cutWhoosh'], [CT.charge, 'cutCharge'], [CT.flash, 'cutBoom'], [16.2, 'cutThud'], [17.0, 'cutThud'], [17.8, 'cutThud'], [18.6, 'cutThud'], [CT.asm1, 'cutDone'], [CT.fin + 0.4, 'cutDoor'],
  ...CUT_SAY.map(s => [s[0], s[2] === 'c' ? 'cutBlipC' : 'cutBlipB'])];
function cutFire(T) {
  const fire = (key, name, arg) => { if (!cut.fired[key] && T >= key) { cut.fired[key] = 1; playSfx(name, arg); } };
  CUT_EV.forEach(([te, n]) => fire(te + n, n));
  for (let k = 0; k < 14; k++) { const te = CT.asm0 + 0.6 + k * 0.5; if (te < CT.asm1) { if (!cut.fired['tk' + k] && T >= te) { cut.fired['tk' + k] = 1; playSfx('cutTock'); } } }
  if (cut.tapAmb >= 0) {
    [[0, 'cutClick'], [0.05, 'cutWhoosh'], [0.75, 'cutPick']].forEach(([d, n]) => fire(CT.TW + d + n, n));
    for (let i = 0; i < 4; i++) { const te = CT.u0 + 0.2 + 0.6 * i; if (!cut.fired['ch' + i] && T >= te) { cut.fired['ch' + i] = 1; playSfx('cutChain', i); } }
    for (let i = 0; i < 3; i++) { const te = CT.u0 + 3.3 + 0.5 * i; if (!cut.fired['gr' + i] && T >= te) { cut.fired['gr' + i] = 1; playSfx('cutChain', i + 1); } }
    for (let i = 0; i < 3; i++) { const te = CT.u0 + 5.5 + 0.6 * i; if (!cut.fired['wd' + i] && T >= te) { cut.fired['wd' + i] = 1; playSfx('cutWord', i); } }
    if (!cut.fired.fan && T >= CT.u0 + 7.3) { cut.fired.fan = 1; playSfx('levelup'); }
    [[CT.fin + 2.2, 'cutBlipC'], [CT.fin + 3.4, 'cutBlipC'], [CT.fin + 5.3, 'cutBlipC']].forEach(([te, n]) => fire(te + n, n));
  }
}
function cutLayout() {
  const dpr = window.devicePixelRatio || 1, vwD = innerWidth * dpr, vhD = (innerHeight + (window.__gap || 0)) * dpr, Q = CUT_Q;
  let m = Math.min(vwD / (192 * Q), vhD / (216 * Q)); m = m >= 1 ? Math.floor(m) : m;      // низький екран (телефон горизонтально): дробовий масштаб, щоб усе влізло          // фізичних пікселів на піксель полотна: ціле число, тож картинка й текст чіткі
  let W = Math.ceil(vwD / (m * Q)), H = Math.ceil(vhD / (m * Q));      // з запасом, щоб картинка заповнювала весь екран (зайве обрізається по краях)
  W = Math.max(192, Math.min(W, 760)); H = Math.max(216, Math.min(H, 480));
  cut.W = W; cut.H = H; cut.S = m * Q / dpr;
  const cv = cut.cv; cv.width = W * Q; cv.height = H * Q; cv.style.width = (W * m * Q / dpr) + 'px'; cv.style.height = (H * m * Q / dpr) + 'px';
  ['wc', 'al'].forEach(k => { const c = cut[k] || (cut[k] = document.createElement('canvas')); c.width = W * Q; c.height = H * Q; });
  cut.wg = cut.wc.getContext('2d'); cut.ag = cut.al.getContext('2d'); cut.g = cv.getContext('2d');
  const hud = document.getElementById('hud'), cr = cv.getBoundingClientRect();
  cut.hudBu = hud && hud.getBoundingClientRect().height > 0 ? (hud.getBoundingClientRect().bottom - cr.top) / cut.S : 0;
}
function cutTick(now) {
  if (!cut.on) return;
  const dt = Math.min(0.1, (now - cut.t0) / 1000); cut.t0 = now; cut.amb += dt;
  if (cut.seek >= 0) cut.T = cut.seek;
  else {
    let lim = CT.END;
    if (cut.tapAmb < 0) lim = Math.min(lim, CT.TW);
    if (cut.goAmb < 0) lim = Math.min(lim, CT.finBtn);
    cut.T = Math.min(lim, cut.T + dt / CUT_SLOW);
  }
  cutFire(cut.T);
  try { cutDrawFrame(cut.T); } catch (e) { console.error('cutscene', e); }
  if (cut.goAmb >= 0 && cut.amb - cut.goAmb > 0.75 && cut.seek < 0) { cutStop(true); return; }
  cut.raf = requestAnimationFrame(cutTick);
}
function playCutscene(style, opts) {
  opts = opts || {}; cut.cb = null; cutStop(false);
  const box = document.getElementById('cutscene'); box.hidden = false; box.classList.remove('picking');
  cut.cv = document.getElementById('cutCv'); cut.style = CUT_STYLES[style] ? style : 'A'; cut.cb = opts.done || null;
  cut.fired = {}; cut.tapAmb = -1; cut.goAmb = -1; cut.T = (opts.seek !== undefined) ? 0 : -CUT_PRE; cut.amb = 0; cut.hit = null; cut.seek = opts.seek !== undefined ? opts.seek : -1;
  if (opts.tapped) cut.tapAmb = 0;
  if (opts.go) cut.goAmb = 0;
  document.getElementById('cutSkip').textContent = (CUT_TXT[state.lang] || CUT_TXT.uk).skip + ' ▶▶';
  try { if (typeof initAudio === 'function') initAudio(); } catch (e) { /* без звуку */ }
  cutLayout(); cutPrep(); cutHudMake();
  const go = () => { cut.on = true; cut.t0 = performance.now(); cut.raf = requestAnimationFrame(cutTick); };
  if (document.fonts && document.fonts.load) document.fonts.load('8px "Press Start 2P"').then(go, go); else go();
}
function cutHudMake() {
  cutHudKill(); const src = document.getElementById('hud'); if (!src) return; const r = src.getBoundingClientRect(); if (r.width < 4) return;
  const cl = src.cloneNode(true); cl.classList.add('cut-hud'); cl.style.cssText = 'position:fixed;z-index:4;margin:0;display:none;left:' + r.left + 'px;top:' + r.top + 'px;';
  const gm = cl.querySelector('#gems'); if (gm) gm.style.display = 'none'; const cp = cl.querySelector('#cps'); if (cp) cp.textContent = '0/' + (state.lang === 'en' ? 's' : 'с');
  const ic = cl.querySelector('#coinIcon'), oi = src.querySelector('#coinIcon'); if (ic && oi) ic.getContext('2d').drawImage(oi, 0, 0);
  document.getElementById('cutscene').appendChild(cl); cut.hudEl = cl; cut.hudN = -1;
}
function cutHudKill() { if (cut.hudEl) cut.hudEl.remove(); cut.hudEl = null; }
function cutStop(finished) {
  cutHudKill();
  cut.on = false; if (cut.raf) cancelAnimationFrame(cut.raf); cut.raf = 0;
  const box = document.getElementById('cutscene'); if (!box) return; box.hidden = true;
  const cb = cut.cb; cut.cb = null; if (cb && finished !== undefined) cb(!!finished);
}
function cutPicker() {
  const box = document.getElementById('cutscene'); box.hidden = false; box.classList.add('picking'); cut.on = false;
  document.getElementById('cutPick').hidden = false;
}
function cutAfter(ok) { if (ok) startMenuTour(() => cutPicker()); else cutPicker(); }
function cutSeenDevice(set) { try { if (set) localStorage.setItem('capyCutSeen', '1'); return localStorage.getItem('capyCutSeen') === '1'; } catch (e) { return false; } }
function startIntroCutscene(replay) {                             // нова гра: заставка, потім екскурсія по меню; з «Щоденника» — лише заставка (її можна пропустити)
  state.cutSeen = true; saveGame(); if (!replay) cutSeenDevice(true);
  playCutscene('B', { done: ok => { if (ok && !replay) startMenuTour(null); } });
}
function initCutscene() {
  const box = document.getElementById('cutscene'); if (!box) return;
  document.getElementById('cutSkip').addEventListener('click', e => { e.stopPropagation(); cutStop(true); });
  document.getElementById('cutClose').addEventListener('click', () => { document.getElementById('cutscene').hidden = true; });
  document.getElementById('cutPick').querySelectorAll('button[data-s]').forEach(b => b.addEventListener('click', () => { document.getElementById('cutPick').hidden = true; playCutscene(b.dataset.s, { done: ok => cutAfter(ok) }); }));
  box.addEventListener('pointerdown', e => {
    if (!cut.on) return;
    const r = cut.cv.getBoundingClientRect(), x = (e.clientX - r.left) / cut.S, y = (e.clientY - r.top) / cut.S;
    if (cut.tapAmb < 0 && cut.T >= CT.TW - 0.01 && cut.rect) { const q = cut.rect, pad = 14; if (x >= q[0] - pad && x <= q[0] + q[2] + pad && y >= q[1] - pad && y <= q[1] + q[3] + pad) { cut.tapAmb = cut.amb; cut.hit = [x, y]; } }
    else if (cut.goAmb < 0 && cut.btn) { const q = cut.btn; if (x >= q[0] - 6 && x <= q[0] + q[2] + 6 && y >= q[1] - 6 && y <= q[1] + q[3] + 6) cut.goAmb = cut.amb; }
  });
  addEventListener('keydown', e => { if (cut.on && e.key === 'Escape') cutStop(true); });
  addEventListener('resize', () => { if (cut.on) cutLayout(); });
  const q = new URLSearchParams(location.search);
  if (q.has('cutpick')) setTimeout(cutPicker, 900);
  else if (q.has('cut')) setTimeout(() => playCutscene(q.get('cut').toUpperCase(), { seek: q.has('seek') ? parseFloat(q.get('seek')) : undefined, tapped: q.has('tapped'), done: ok => cutAfter(ok) }), 900);
}

/* ====================== ЕКСКУРСІЯ ПО МЕНЮ ======================
   Після заставки: стрілка веде до кожної вкладки меню по черзі, гравець натискає на неї, а в куті стоять Мел і Ніка й пояснюють. */
const TOUR_IDS = ['shop', 'departments', 'team', 'story', 'skins', 'seasons', 'achievements', 'settings', 'news'];
const TOUR_TXT = {
  uk: { shop: ['m', 'Це «Магазин». Тут ти тапаєш, прокачуєш тап і розширюєш магазин. Натисни сюди!'], departments: ['n', '«Відділи» самі приносять монети, навіть коли ти не граєш. Тисни!'], team: ['m', 'У «Команді» наймаєш звірят-помічників. Кожен допомагає по-своєму.'],
    story: ['n', '«Щоденник»: глави історії та історії епох. Їх можна перечитати.'], skins: ['m', '«Скіни»: змінюй вигляд Капі, магазину й героїв за кристали.'], seasons: ['n', '«Пори року» і час доби. Замок відкриється після 2-ї епохи.'],
    achievements: ['m', '«Нагороди»: тут чекають призи за досягнення.'], settings: ['n', '«Налаштування»: мова, звук, перегляд епох та анімації.'], news: ['m', 'А це скринька розробників! Там новини про оновлення, а ще можна написати нам. Відкрий її!'], end: ['m', 'От і все! Тапай по магазину й розвивай його. Ми завжди поруч!'], endBtn: 'ГРАТИ!', skip: 'Пропустити тур' },
  en: { shop: ['m', 'This is the Shop. Tap, boost your tap and expand the shop here. Press it!'], departments: ['n', 'Departments earn coins by themselves, even when you are away. Press!'], team: ['m', 'In Team you hire animal helpers. Each one helps in their own way.'],
    story: ['n', 'Diary: story chapters and epoch stories. You can reread them.'], skins: ['m', 'Skins: change the look of Capy, the shop and heroes for crystals.'], seasons: ['n', 'Seasons and time of day. The lock opens after the 2nd epoch.'],
    achievements: ['m', 'Awards: prizes wait here for your achievements.'], settings: ['n', 'Settings: language, sound, epoch viewing and animations.'], news: ['m', 'And this is the developers mailbox! News about updates are there, and you can write to us. Open it!'], end: ['m', 'That is all! Tap the shop and grow it. We are always nearby!'], endBtn: 'PLAY!', skip: 'Skip tour' }
};
const tour = { on: false, i: 0, cb: null, timer: 0, btn: null, handler: null, talk: 0, news: false, wrapped: false };
function tourVisible(el) { return !!el && el.offsetParent !== null && el.getBoundingClientRect().width > 0; }
function startMenuTour(cb) {
  const box = document.getElementById('tour'); if (!box) { if (cb) cb(); return; }
  tourStop(false); tour.on = true; tour.i = 0; tour.cb = cb || null; tour.news = false;
  if (!tour.wrapped && typeof openNews === 'function') { tour.wrapped = true; const orig = openNews; openNews = function () { const r = orig.apply(this, arguments); if (tour.on && tour.news) { tour.news = false; setTimeout(() => { if (tour.on) { tour.i++; tourStep(); } }, 400); } return r; }; }
  ['tourMel', 'tourNika'].forEach((id, k) => { const cv = document.getElementById(id), hi = k ? cutHi('bunny_0', SPRITES.capy_nika.canvas) : cutHi('foxcub_0', SPRITES.capy_mel.canvas); cv.width = hi.width; cv.height = hi.height; cv.getContext('2d').drawImage(hi, 0, 0); });
  if (!(typeof mobileMQ !== 'undefined' && mobileMQ.matches) && !state.settings.panelOpen) { state.settings.panelOpen = true; try { applyPanel(); } catch (e) { /* не страшно */ } }
  box.hidden = false; document.getElementById('tourSkip').textContent = (TOUR_TXT[state.lang] || TOUR_TXT.uk).skip;
  tourStep(); tour.timer = setInterval(tourPlace, 120);
}
function tourStep() {
  const T = TOUR_TXT[state.lang] || TOUR_TXT.uk, id = TOUR_IDS[tour.i], bub = document.getElementById('tourBubble'), btnEnd = document.getElementById('tourGo');
  if (tour.btn && tour.handler) tour.btn.removeEventListener('click', tour.handler); tour.btn = null; tour.handler = null;
  if (!id) { const e = T.end; tourSay(e[0], e[1]); btnEnd.hidden = false; btnEnd.textContent = T.endBtn; document.getElementById('tourArrow').style.display = 'none'; document.getElementById('tourRing').style.display = 'none'; tourPlace(); return; }
  btnEnd.hidden = true; tour.news = false;
  if (id === 'news') { tour.news = true; try { panBy(newsBoxX() - (visL() + (visR() - visL()) * 0.3)); } catch (e) { /* на ПК видно все */ } tourSay(T.news[0], T.news[1]); document.getElementById('tourArrow').style.display = ''; document.getElementById('tourRing').style.display = ''; tourPlace(); return; }
  const b = ui.tabs.querySelector('.tab[data-tab="' + id + '"]');
  if (!b || b.hidden) { tour.i++; tourStep(); return; }
  tour.btn = b; tour.handler = () => { setTimeout(() => { if (tour.on && tour.btn === b) { tour.i++; tourStep(); } }, 350); }; b.addEventListener('click', tour.handler, { once: true });
  tourSay(T[id][0], T[id][1]); document.getElementById('tourArrow').style.display = ''; document.getElementById('tourRing').style.display = ''; tourPlace();
}
function tourSay(who, text) {
  const bub = document.getElementById('tourBubble'); document.getElementById('tourText').textContent = text; bub.dataset.who = who;
  document.getElementById('tourMel').classList.toggle('talk', who === 'm'); document.getElementById('tourNika').classList.toggle('talk', who === 'n'); playSfx('cutBlipC');
}
function tourPlace() {
  if (!tour.on) return;
  const sc = document.getElementById('scene').getBoundingClientRect(), chars = document.getElementById('tourChars'), bub = document.getElementById('tourBubble'), arrow = document.getElementById('tourArrow'), ring = document.getElementById('tourRing');
  const phone = typeof mobileMQ !== 'undefined' && mobileMQ.matches;
  let side = 'left', nr = null;
  if (tour.news) {                                                                                  // скринька розробників: герої стають з іншого боку, а репліка — над стрілкою, щоб нічого її не закривало
    const wr0 = ui.world.getBoundingClientRect(), sx = u => wr0.left + (u + view.offX) / view.w * wr0.width, sy = u => wr0.top + (u + view.offY) / view.h * wr0.height, x = newsBoxX(), y = mailRoadY();
    nr = { left: sx(x - 14), top: sy(y - 38), width: sx(x + 14) - sx(x - 14), height: sy(y + 3) - sy(y - 38) };
    side = nr.left + nr.width / 2 < sc.left + sc.width * 0.5 ? 'right' : 'left';
  }
  const edge = side === 'left' ? Math.round(sc.left + 8) + 'px' : Math.round(innerWidth - sc.right + 8) + 'px';
  chars.style.left = side === 'left' ? edge : 'auto'; chars.style.right = side === 'right' ? edge : 'auto'; chars.style.bottom = Math.max(8, Math.round(innerHeight - sc.bottom + 8)) + 'px';
  const ch = chars.getBoundingClientRect(), skp = document.getElementById('tourSkip'); bub.style.left = side === 'left' ? edge : 'auto'; bub.style.right = side === 'right' ? edge : 'auto'; bub.style.bottom = (nr ? Math.max(Math.round(innerHeight - nr.top + 56), Math.round(innerHeight - ch.top + 8)) : Math.round(innerHeight - ch.top + 8)) + 'px'; bub.style.maxWidth = Math.min(320, Math.round(innerWidth * (phone ? 0.84 : 0.4))) + 'px'; const br = bub.getBoundingClientRect(); skp.style.left = Math.round(br.left) + 'px'; skp.style.bottom = Math.round(innerHeight - br.top + 6) + 'px';
  if (arrow.style.display === 'none') return;
  let r;
  if (tour.news) r = nr;
  else { let target = tour.btn; if (!tourVisible(target)) target = (typeof ui !== 'undefined' && ui.tabMore && tourVisible(ui.tabMore)) ? ui.tabMore : target; if (!tourVisible(target)) return; r = target.getBoundingClientRect(); } ring.style.left = (r.left - 4) + 'px'; ring.style.top = (r.top - 4) + 'px'; ring.style.width = (r.width + 8) + 'px'; ring.style.height = (r.height + 8) + 'px';
  if (phone || tour.news) { arrow.style.setProperty('--rot', '90deg'); arrow.style.left = Math.round(r.left + r.width / 2 - 20) + 'px'; arrow.style.top = Math.round(r.top - 46) + 'px'; arrow.dataset.dir = 'down'; }
  else { arrow.style.setProperty('--rot', '0deg'); arrow.style.left = Math.round(r.left - 52) + 'px'; arrow.style.top = Math.round(r.top + r.height / 2 - 14) + 'px'; arrow.dataset.dir = 'right'; }
}
function tourStop(finished) {
  if (tour.timer) clearInterval(tour.timer); tour.timer = 0;
  if (tour.btn && tour.handler) tour.btn.removeEventListener('click', tour.handler); tour.btn = null; tour.handler = null;
  const was = tour.on; tour.on = false; const box = document.getElementById('tour'); if (box) box.hidden = true;
  const cb = tour.cb; tour.cb = null; if (was && cb && finished !== false) cb();
}
function initTour() {
  const go = document.getElementById('tourGo'), sk = document.getElementById('tourSkip'); if (!go) return;
  go.addEventListener('click', () => tourStop(true)); sk.addEventListener('click', () => tourStop(true));
  if (new URLSearchParams(location.search).has('tour')) setTimeout(() => startMenuTour(null), 1500);
}
/* PWA: службовий файл лише на сайті (https), щоб гру можна було поставити на екран і щоб вона запускалась без інтернету */
/* Діагностика екрана для телефона: 5 швидких дотиків по лічильнику монет показують розміри екрана й відступи (ще раз тицьни по тексту — зникне) */
window.addEventListener('load', () => {
  const hud = document.getElementById('hud'); if (!hud) return; let cnt = 0, last = 0;
  hud.addEventListener('click', () => { const now = Date.now(); cnt = now - last < 700 ? cnt + 1 : 1; last = now; if (cnt >= 5) { cnt = 0; capyDiag(); } });
});
function capyDiag() {
  let d = document.getElementById('capyDiag'); if (d) { d.remove(); return; }
  d = document.createElement('div'); d.id = 'capyDiag'; d.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483000;pointer-events:none';
  const pr = document.createElement('div'); pr.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'; document.body.appendChild(pr);
  const cs = getComputedStyle(pr), ins = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' / '); pr.remove();
  const vv = window.visualViewport, mm = q => matchMedia(q).matches ? 'так' : 'ні';
  const txt = ['inner ' + innerWidth + 'x' + innerHeight, 'outer ' + outerWidth + 'x' + outerHeight, 'screen ' + screen.width + 'x' + screen.height, 'visual ' + (vv ? Math.round(vv.width) + 'x' + Math.round(vv.height) : '-'), 'insets ' + ins, 'dpr ' + devicePixelRatio, 'gap ' + window.__gap, 'standalone ' + navigator.standalone, 'display standalone ' + mm('(display-mode: standalone)'), 'fullscreen ' + mm('(display-mode: fullscreen)'), 'browser ' + mm('(display-mode: browser)')].join('\n');
  d.innerHTML = '<div style="position:absolute;left:0;right:0;top:0;height:8px;background:#f00"></div><div style="position:absolute;left:0;right:0;bottom:0;height:8px;background:#00f"></div><div style="position:absolute;left:0;top:0;bottom:0;width:8px;background:#0a0"></div><div style="position:absolute;right:0;top:0;bottom:0;width:8px;background:#fa0"></div><pre style="position:absolute;left:14px;top:90px;margin:0;padding:8px;background:rgba(0,0,0,.85);color:#fff;font:12px/1.5 monospace;pointer-events:auto"></pre>';
  d.querySelector('pre').textContent = txt; d.querySelector('pre').addEventListener('click', () => d.remove()); document.body.appendChild(d);
}
if ('serviceWorker' in navigator && location.protocol === 'https:') window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
window.addEventListener('load', initCutscene); window.addEventListener('load', initTour);
function playSfx(name, ...args) {
  const ac = audio.ctx;
  if (!ac || ac.state !== 'running' || state.settings.muted || state.settings.sfxVol <= 0) return;
  try { SFX[name](...args); } catch (e) { /* звук ніколи не має ламати гру */ }
}
// Висота «друкування» залежить від того, хто говорить
function speakerPitch(sp) {
  let h = 0;
  for (let i = 0; i < sp.length; i++) h += sp.charCodeAt(i);
  return sp === 'narr' ? 330 : 360 + (h % 7) * 55;
}

/* ---------- Налаштування звуку (кнопка 🔊) ---------- */
function updateSoundUI() {
  const s = state.settings;
  ui.musicVol.value = Math.round(s.musicVol * 100);
  ui.sfxVol.value = Math.round(s.sfxVol * 100);
  ui.muteBtn.textContent = t(s.muted ? 'soundMuteOff' : 'soundMuteOn');
  if (!ui.musicStyleRow.children.length) {
    MUSIC_STYLES.forEach((st, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn'; b.dataset.style = i;
      b.addEventListener('click', () => { state.settings.musicStyle = i; updateMusic(); updateSoundUI(); saveGame(); });
      ui.musicStyleRow.appendChild(b);
    });
  }
  ui.musicStyleRow.querySelectorAll('button').forEach(b => { b.textContent = t('musicStyle_' + MUSIC_STYLES[b.dataset.style].id); b.setAttribute('aria-pressed', String(Number(b.dataset.style) === (s.musicStyle | 0))); });
}
function setupSound() {
  parseMusic();
  // перший дотик/натискання вмикає звук (вимога браузерів); далі будить його, якщо він заснув
  ['pointerdown', 'pointerup', 'keydown', 'touchstart', 'touchend', 'click'].forEach(ev => document.addEventListener(ev, initAudio, { passive: true }));
  ui.soundClose.addEventListener('click', () => { ui.soundModal.hidden = true; saveGame(); });
  ui.soundModal.addEventListener('click', e => { if (e.target === ui.soundModal) { ui.soundModal.hidden = true; saveGame(); } });
  ui.musicVol.addEventListener('input', () => { state.settings.musicVol = ui.musicVol.value / 100; applyVolumes(); });
  ui.sfxVol.addEventListener('input', () => { state.settings.sfxVol = ui.sfxVol.value / 100; applyVolumes(); });
  ui.sfxVol.addEventListener('change', () => playSfx('tap'));
  ui.muteBtn.addEventListener('click', () => { state.settings.muted = !state.settings.muted; applyVolumes(); updateSoundUI(); saveGame(); });
  // неактивна вкладка — музика (і весь звук) завмирає, активна — продовжується
  document.addEventListener('visibilitychange', () => {
    if (!audio.ctx) return;
    if (document.hidden) audio.ctx.suspend(); else resumeAudio();
  });
  updateSoundUI();
}

