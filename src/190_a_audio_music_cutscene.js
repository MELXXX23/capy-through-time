//#part 190_a_audio_music_cutscene.js
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
// Одна нота з простою обвідною (щоб не клацало). env: 'pluck' — щипок із довгим згасанням (кото, лютня, гітара), 'soft' — м'який вступ; vib — вібрато (флейта, сякухачі)
function tone(dest, wave, f0, t0, dur, vol, f1, env, vib) {
  const ac = audio.ctx;
  const osc = ac.createOscillator(), g = ac.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(f0, t0);
  if (f1) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
  let end = dur;
  g.gain.setValueAtTime(0.0001, t0);
  if (env === 'pluck') {
    end = Math.min(1.4, Math.max(dur * 1.8, 0.28));
    g.gain.linearRampToValueAtTime(vol, t0 + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + end);
  } else if (env === 'soft') {
    end = dur + 0.05;
    g.gain.linearRampToValueAtTime(vol, t0 + Math.min(0.05, dur * 0.3));
    g.gain.setValueAtTime(vol, t0 + Math.max(0.06, dur * 0.6));
    g.gain.linearRampToValueAtTime(0.0001, t0 + end);
  } else {
    g.gain.linearRampToValueAtTime(vol, t0 + 0.006);
    g.gain.setValueAtTime(vol, t0 + Math.max(0.007, dur * 0.65));
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  }
  if (vib) {
    const lfo = ac.createOscillator(), lg = ac.createGain();
    lfo.frequency.value = 5.2; lg.gain.value = 14;
    lfo.connect(lg); lg.connect(osc.detune); lfo.start(t0); lfo.stop(t0 + end + 0.03);
  }
  osc.connect(g); g.connect(dest);
  osc.start(t0); osc.stop(t0 + end + 0.03);
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
  if (kind === 'k') { tone(dest, 'sine', 118, t0, 0.11, vol * 0.85, 48); noiseHit(dest, t0, 0.025, vol * 0.18, 'lowpass', 900); }   // бас-барабан: м'який, без гострої «ноти» (було triangle 150 Гц ×1,6)
  else if (kind === 's') noiseHit(dest, t0, 0.12, vol, 'bandpass', 1800);
  else if (kind === 'h') noiseHit(dest, t0, 0.05, vol * 0.7, 'highpass', 7000);
  else if (kind === 'o') noiseHit(dest, t0, 0.16, vol * 0.55, 'highpass', 6500);                                                  // відкритий хет
  else if (kind === 'c') { noiseHit(dest, t0, 0.04, vol * 0.9, 'bandpass', 1500); noiseHit(dest, t0 + 0.015, 0.09, vol * 0.8, 'bandpass', 1500); }   // хлопок
  else if (kind === 'T') { tone(dest, 'sine', 120, t0, 0.45, vol * 1.1, 48); noiseHit(dest, t0, 0.08, vol * 0.35, 'lowpass', 400); }   // тайко
  else if (kind === 'w') { tone(dest, 'triangle', 1100, t0, 0.05, vol * 1.1, 700); noiseHit(dest, t0, 0.02, vol * 0.5, 'bandpass', 2800); }   // дерев'яний блок
  else if (kind === 'g') { tone(dest, 'sine', 1568, t0, 0.5, vol * 0.8, null, 'pluck'); tone(dest, 'sine', 2349, t0, 0.4, vol * 0.4, null, 'pluck'); }   // дзвіночок
}

/* ---------- Музика ---------- */
// Музика Хелловіну — лише коли гравець сам обрав цю пору року (або ?holiday=halloween). На «Авто» в останні дні жовтня лишаються прикраси, а музика — епохи.
function halloweenMusicOn() { return (state.settings.season === 'halloween' && !seasonPickLocked('halloween')) || forcedHoliday() === 'halloween'; }
function desiredTrack() {
  if (theme.holiday && theme.holiday.music && MUSIC[theme.holiday.music] && (theme.holiday.music !== 'halloween' || halloweenMusicOn())) return theme.holiday.music;
  if (theme.season === 'halloween' && MUSIC.halloween && halloweenMusicOn()) return 'halloween';
  const st = MUSIC_STYLES[state.settings.musicStyle] || MUSIC_STYLES[0];
  const ep = viewEpoch() % EPOCH_MUSIC.length;
  if ((ep > 0 || st.id !== 'classic') && typeof epochTrackKey === 'function') return epochTrackKey(ep, state.shopLevel, st.id);       // власні мелодії епох (190_d_epoch_tunes.js)
  return st.levels[Math.min(st.levels.length, state.shopLevel) - 1] + '#' + ep;
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
        else tone(tr.gain, ch.wave, noteFreq(ev.tok), t, ev.len * stepDur * 0.92, ch.vol, null, ch.env, ch.vib);
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
// Звук тапа: однаково м'який (фільтр зрізає верхи), але в кожної епохи свій інструмент. lp — зріз верхів, n — варіанти пар нот,
// w1/w2 — тембри, e1/e2 — обвідна (pluck — щипок), d1/d2 — тривалість, v1/v2 — гучність, s1 — на скільки множиться висота першої ноти
// (ковзання), tick — короткий шумовий «клац» [фільтр, частота, гучність]. Індекс — номер епохи (state.eid).
const SFX_TAP_PROFILES = [
  { lp: 1500, n: [['D5', 'A5'], ['E5', 'B5'], ['G5', 'D6'], ['A4', 'E5']], w1: 'triangle', w2: 'sine', e1: 'pluck', e2: 'pluck', d1: 0.07, d2: 0.1, v1: 0.2, v2: 0.12 },                              // Відродження: лютня
  { lp: 1800, n: [['C5', 'G5'], ['E5', 'A5'], ['G5', 'C6'], ['A4', 'E5']], w1: 'sine', w2: 'triangle', e1: 'pluck', e2: 'pluck', d1: 0.09, d2: 0.12, v1: 0.22, v2: 0.1 },                          // Ретро: електропіаніно
  { lp: 1300, n: [['A4', 'E5'], ['C5', 'G5'], ['E5', 'A5'], ['D5', 'A5']], w1: 'triangle', w2: 'sine', s1: 1.18, d1: 0.06, d2: 0.08, v1: 0.2, v2: 0.1, tick: ['bandpass', 2400, 0.05] },        // Диско: фанк-«пью» і хет
  { lp: 1700, n: [['B5', 'E6'], ['G5', 'D6'], ['A5', 'E6'], ['E5', 'B5']], w1: 'square', w2: 'square', d1: 0.04, d2: 0.07, v1: 0.085, v2: 0.06 },                                              // Аркади: м'яка монетка
  { lp: 1500, n: [['E5', 'B5'], ['G5', 'D6'], ['D5', 'A5'], ['A5', 'E6']], w1: 'sine', w2: 'sine', e1: 'pluck', d1: 0.05, d2: 0.07, v1: 0.2, v2: 0.1, tick: ['highpass', 3200, 0.06] },        // Інтернет: клавіша й пінг
  { lp: 1300, n: [['D5', 'G5'], ['E5', 'A5'], ['C5', 'G5'], ['G4', 'D5']], w1: 'sine', w2: 'triangle', e1: 'pluck', e2: 'pluck', s1: 1.4, d1: 0.08, d2: 0.1, v1: 0.22, v2: 0.1 },             // Еко: крапля води
  { lp: 1800, n: [['F5', 'C6'], ['G5', 'D6'], ['A5', 'E6'], ['D5', 'A5']], w1: 'sine', w2: 'sine', e1: 'pluck', e2: 'pluck', d1: 0.14, d2: 0.22, v1: 0.15, v2: 0.1 },                           // Космос: скляний передзвін
  { lp: 1100, n: [['E5', 'B5'], ['G5', 'D6'], ['D5', 'A5'], ['B4', 'F#5']], w1: 'sawtooth', w2: 'sine', d1: 0.07, d2: 0.1, v1: 0.07, v2: 0.14 },                                              // Неон: синтвейв
  { lp: 1600, n: [['A4', 'E5'], ['C5', 'E5'], ['B4', 'F5'], ['E5', 'A5'], ['F5', 'C6']], w1: 'triangle', w2: 'sine', e1: 'pluck', e2: 'pluck', d1: 0.1, d2: 0.12, v1: 0.2, v2: 0.1, tick: ['bandpass', 2800, 0.04] }   // Японія: кото
];
const SFX = {
  tap() {   // кілька варіантів, щоб не набридало; тріщить усе рідше й тихіше при довгому тапанні
    const ac = audio.ctx, now = ac.currentTime;
    if (now - (SFX._tapLast || 0) < 0.05) return;                                    // не частіше 20 разів на секунду
    SFX._tapRun = now - (SFX._tapAt || 0) < 0.5 ? (SFX._tapRun || 0) + 1 : 0; SFX._tapAt = now; SFX._tapLast = now;
    if (!audio.tapLP) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400; f.Q.value = 0.3; f.connect(audio.sfxGain); audio.tapLP = f; }       // зрізає різкі верхи
    const P = SFX_TAP_PROFILES[(viewEpoch() | 0) % SFX_TAP_PROFILES.length] || SFX_TAP_PROFILES[0];
    audio.tapLP.frequency.value = P.lp;
    const v = P.n[Math.floor(Math.random() * P.n.length)], k = Math.max(0.4, 1 - SFX._tapRun * 0.04), t = now + 0.004, f1 = noteFreq(v[0]);
    tone(audio.tapLP, P.w1, f1, t, P.d1, P.v1 * k, P.s1 ? f1 * P.s1 : null, P.e1);
    tone(audio.tapLP, P.w2, noteFreq(v[1]), t + 0.04, P.d2, P.v2 * k, null, P.e2);
    if (P.tick) noiseHit(audio.tapLP, t, 0.02, P.tick[2] * k, P.tick[0], P.tick[1]);
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
  noodleTheme() {  // короткий мотив кото: пентатоніка, щипки з довгим згасанням
    const t0 = audio.ctx.currentTime + 0.05;
    [['D5', 0], ['E5', .16], ['G5', .32], ['A5', .52], ['G5', .72], ['E5', .88], ['D5', 1.04], ['A4', 1.3]].forEach(([n, dt]) => tone(audio.sfxGain, 'triangle', noteFreq(n), t0 + dt, 0.5, 0.22, null, 'pluck'));
  },
  clockBong() {    // глибокий удар дзвону: основний тон і обертони з довгим згасанням
    const ac = audio.ctx, t0 = ac.currentTime + 0.01;
    [[110, 0.5], [220, 0.28], [330, 0.17], [440, 0.09]].forEach(([f, v]) => tone(audio.sfxGain, 'sine', f, t0, 1.8, v));
    tone(audio.sfxGain, 'triangle', 165, t0, 1.2, 0.12); noiseHit(audio.sfxGain, t0, 0.05, 0.3, 'bandpass', 1800);
  },
  clockTap() {     // тап по годиннику: клац шестерні й світлий дзвін «дін-дон» (чутний і на телефоні, де низькі тони зникають)
    const ac = audio.ctx, t0 = ac.currentTime + 0.01;
    if (t0 - (SFX._clockLast || 0) < 0.3) return;                                  // не частіше ~3 разів на секунду
    SFX._clockLast = t0;
    const bell = (f, t, vol, dur) => [[1, 1], [2.01, 0.55], [2.76, 0.4], [4.07, 0.22], [5.43, 0.12]].forEach(([r, a], k) => {
      const osc = ac.createOscillator(), g = ac.createGain(), d = dur / (1 + k * 0.7);
      osc.type = 'sine'; osc.frequency.value = f * r;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * a, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      osc.connect(g); g.connect(audio.sfxGain); osc.start(t); osc.stop(t + d + 0.05);
    });
    noiseHit(audio.sfxGain, t0, 0.02, 0.22, 'highpass', 3500); noiseHit(audio.sfxGain, t0 + 0.05, 0.02, 0.16, 'highpass', 2800);
    bell(988, t0 + 0.07, 0.16, 1.1);       // дін
    bell(659, t0 + 0.42, 0.2, 1.7);        // дон
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
  themeArrive(ep) {   // прильот команди тематичного будівництва: коротка «візитка» епохи
    const ac = audio.ctx, t = ac.currentTime + 0.02, g = audio.sfxGain;
    switch (ep % 9) {
      case 0: melody('triangle', [['C5', 0.12], ['E5', 0.12], ['G5', 0.12], ['C6', 0.45]], 0.22); melody('sine', [['G6', 0.1], ['C7', 0.4]], 0.08); break;       // ангельський передзвін
      case 1: noiseHit(g, t, 0.6, 0.18, 'bandpass', 900); melody('sawtooth', [['G3', 0.2], ['C4', 0.4]], 0.12); break;                                          // дирижабль
      case 2: for (let i = 0; i < 4; i++) { tone(g, 'sine', 125, t + i * 0.25, 0.2, 0.26, 45); noiseHit(g, t + i * 0.25 + 0.125, 0.04, 0.12, 'highpass', 6000); } break;   // бочка й хет
      case 3: melody('square', [['C5', 0.06], ['E5', 0.06], ['G5', 0.06], ['C6', 0.06], ['E6', 0.14]], 0.16); break;                                            // чіптюн
      case 4: for (let i = 0; i < 6; i++) tone(g, 'square', i % 2 ? 2100 : 1300, t + i * 0.06, 0.05, 0.07); noiseHit(g, t + 0.4, 0.5, 0.06, 'bandpass', 3000); break;   // модем
      case 5: for (let i = 0; i < 4; i++) tone(g, 'sine', 2100 + i * 250, t + i * 0.12, 0.09, 0.1, 3000 + i * 150); break;                                      // пташки
      case 6: noiseHit(g, t, 0.8, 0.14, 'bandpass', 500); tone(g, 'sine', 120, t, 0.8, 0.2, 520); tone(g, 'sine', 880, t + 0.7, 0.12, 0.1); break;              // тарілка
      case 7: tone(g, 'sawtooth', 70, t, 0.6, 0.14, 700); tone(g, 'square', 1500, t + 0.55, 0.1, 0.08, 400); break;                                              // синті-гул
      default: tone(g, 'sine', 95, t, 0.35, 0.3, 50); tone(g, 'sine', 95, t + 0.4, 0.35, 0.3, 50); melody('triangle', [['D5', 0.1], ['A5', 0.1], ['D6', 0.3]], 0.14);   // тайко й кото
    }
  },
  themeHit(ep) {      // один «стук» команди епохи (грає ритмічно, поки будується)
    const ac = audio.ctx, t = ac.currentTime + 0.01, g = audio.sfxGain;
    switch (ep % 9) {
      case 0: tone(g, 'sine', 1568, t, 0.14, 0.1); tone(g, 'sine', 2093, t + 0.02, 0.1, 0.06); break;
      case 1: noiseHit(g, t, 0.05, 0.3, 'bandpass', 2600); tone(g, 'square', 220, t, 0.06, 0.12, 110); break;
      case 2: tone(g, 'sine', 115, t, 0.14, 0.24, 48); break;
      case 3: tone(g, 'square', 988, t, 0.05, 0.1); tone(g, 'square', 1319, t + 0.05, 0.1, 0.1); break;
      case 4: noiseHit(g, t, 0.02, 0.3, 'highpass', 4000); tone(g, 'square', 1500, t, 0.03, 0.08); break;
      case 5: tone(g, 'triangle', 620, t, 0.14, 0.16, 420); break;
      case 6: tone(g, 'sawtooth', 300, t, 0.08, 0.09, 1200); noiseHit(g, t, 0.05, 0.1, 'highpass', 5000); break;
      case 7: tone(g, 'sawtooth', 1500, t, 0.08, 0.09, 300); break;
      default: noiseHit(g, t, 0.04, 0.3, 'bandpass', 1200); tone(g, 'triangle', 520, t, 0.1, 0.16, 300);
    }
  },
  click()     { tone(audio.sfxGain, 'square', 660, audio.ctx.currentTime, 0.03, 0.14); },
  warp(dur, ep) {   // подорож: у кожної епохи свій звук (Греція — арфа й дзвіночки, Ретро — перемотка, Диско — ритм, Аркади — чіп-мелодія, Інтернет — модем, Еко — вітер і птахи, Космос — свист і сонар, Неон — синті)
    const D = dur || 4.4, E = ((ep | 0) % EPOCHS.length + EPOCHS.length) % EPOCHS.length, t0 = audio.ctx.currentTime + 0.02, tb = t0 + D * 0.74, A = audio.sfxGain;
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
    } else if (E === 8) {                                                                  // Японія: кото-пентатоніка, барабани тайко, вітряні дзвіночки
      arp(['D4', 'E4', 'G4', 'A4', 'B4', 'D5', 'E5', 'G5', 'A5', 'B5', 'D6'], t0, D * 0.06, 'triangle', 0.5, 0.14);
      arp(['D3', 'A3', 'D4', 'A3'], t0 + D * 0.05, D * 0.16, 'sine', 0.7, 0.1);
      [0.18, 0.3, 0.42, 0.52, 0.6].forEach(p => { tone(A, 'sine', 70, t0 + D * p, 0.25, 0.3, 40); noiseHit(A, t0 + D * p, 0.12, 0.2, 'lowpass', 700); });
      wind(t0 + D * 0.1, D * 0.5, 0.03);
      boom(0.35); [587, 740, 880, 1175].forEach((fq, k) => tone(A, 'triangle', fq, tb + 0.02 + k * 0.06, 1.6, 0.12)); tone(A, 'sine', 2349, tb + 0.4, 1.2, 0.06);
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
