//#part 190_g_circus_sounds.js
/* =====================================================================
   ЗВУК ЦИРКУ. Три миті: візок їде (тап по «!»), шатро розкладається, шатро згортається. Кінець кожної — м'який акорд або приземлення.
   Цирк: дерев'яні колеса, ріжок, «ум-па», парова дудка, складки полотна. Японія: лапшична (тайко, дерев'яні стукалки, кото).
   Хатка відьми: скрип дерева, глухі кроки, низька порожниста дудка.
   Синтез, рівень і сітка музики — ті самі, що в будуванні (190_f): окремий потік, удари на долях музики, ноти в її ладі, гучність за BS_MUS.
   Фону немає навмисно: між ударами тихо. Виміри: previews/circus_sound.
   ===================================================================== */
// Текст стає кодом Worker-а разом із bsSynthCode: нічого ззовні, крім B.tools
function csSynthCode(B) {
  const { kit, nf, knock, thump, setLevel, mus, setSeed, rnd } = B.tools;
  const KEY = [['D', 0], ['A', 0], ['C', 0], ['A', 0], ['A', 0], ['G', 1], ['D', 0], ['C', 0], ['D', 1]];   // тоніка й лад музики епох (1 — мажорна терція), як ноти в BS_EP
  const WOODFX = { lp: 3000, hp: 60, room: [0.5, 1800, 0.1] }, TENTFX = { lp: 2600, hp: 60, room: [0.8, 1500, 0.14] }, HUTFX = { lp: 1800, hp: 50, room: [1.1, 1000, 0.2] };
  // Парова дудка без різкості: основний тон і м'яка октава, легке тремтіння, швидко не обривається
  const pipe = (k, f, t, dec, vol, o = {}) => { const vib = o.vib || [5.4, 9], a = o.a || 0.018; k.tone('sine', f, t, 0, vol, { a, dec, vib, pan: o.pan }); k.tone('sine', f * 2, t, 0, vol * 0.26, { a, dec: dec * 0.8, vib, pan: o.pan }); k.tone('tri', f, t, 0, vol * 0.3, { a, dec: dec * 0.7, lp: 1300, vib, pan: o.pan }); };
  const cloth = (k, t, vol, f, pan) => { k.noise(t, 0, vol, { type: 'lp', f, q: 0.6, a: 0.022, dec: 0.085, to: f * 0.45, gt: 0.14, pan }); k.tone('sine', 104, t + 0.012, 0, vol * 0.5, { a: 0.012, dec: 0.075, to: 72, gt: 0.09, pan }); };
  const creak = (k, t, f, dur, vol, pan) => { for (let i = 0, n = Math.round(dur * 26); i < n; i++) { const u = i / n; knock(k, t + u * dur + (rnd() - 0.5) * 0.008, f * (1 + 0.22 * Math.sin(u * 3.1)), vol * (0.45 + 0.55 * Math.sin(u * 3.1)) * (0.7 + rnd() * 0.3), { body: 0.1, nz: 0.1, nf: 700, pan, parts: [[1, 1, 0.012], [1.8, 0.4, 0.008]] }); } };
  const softTaiko = (k, t, vol) => { k.tone('sine', 128, t, 0, vol, { a: 0.006, dec: 0.15, to: 74, gt: 0.07 }); k.tone('sine', 240, t, 0, vol * 0.2, { a: 0.006, dec: 0.05 }); k.noise(t, 0, vol * 0.28, { type: 'lp', f: 620, q: 0.6, a: 0.004, dec: 0.022 }); };
  const KOTO = { bright: 0.34, pick: 0.2, dec: 0.55 };
  const def = (ep, kind) => {
    const [nm, maj] = KEY[ep], R = nf(nm + '3'), r2 = R * 0.5 >= 62 ? R * 0.5 : R, up = s => R * Math.pow(2, s / 12), th = maj ? 4 : 3, top = nf(nm + '4');
    if (kind === 'hag') return {
      ca: [0.9, k => pipe(k, top * 0.5, 0.002, 0.2, 0.11, { vib: [3.6, 16], a: 0.04 }), -2, HUTFX],
      oo: [0.6, k => { thump(k, 0.002, Math.max(58, r2 * 0.75), 0.22, { a: 0.008, dec: 0.11 }); k.noise(0.004, 0, 0.05, { type: 'lp', f: 260, q: 0.6, a: 0.008, dec: 0.05 }); }, 3.5, HUTFX],
      cr: [0.9, k => creak(k, 0.01, 235, 0.62, 0.05, 0.15), -1, HUTFX],
      c2: [0.9, k => creak(k, 0.01, 182, 0.72, 0.05, -0.15), -2, HUTFX],
      up: [1.8, k => { thump(k, 0.003, Math.max(58, r2 * 0.75), 0.2, { a: 0.008, dec: 0.13 }); [0, th, 7].forEach((s, i) => pipe(k, up(s) * 0.5 * 2, 0.04 + i * 0.09, 0.42, 0.075, { vib: [3.6, 14], a: 0.04, pan: (i - 1) * 0.2 })); }, 5, HUTFX],
      dn: [1.2, k => { [7, th, 0].forEach((s, i) => pipe(k, up(s), 0.01 + i * 0.1, 0.22, 0.07, { vib: [3.6, 14], a: 0.03 })); thump(k, 0.3, Math.max(58, r2 * 0.75), 0.17, { a: 0.008, dec: 0.1 }); }, 3.5, HUTFX],
    };
    if (kind === 'noodle') return {
      wh: [0.5, k => knock(k, 0.002, 250, 0.16, { body: 0.4, nz: 0.14, nf: 900 }), 0, WOODFX],
      hn: [1.1, k => { knock(k, 0.002, 760, 0.1, { body: 0.12, nz: 0.1, nf: 1400 }); knock(k, 0.11, 700, 0.11, { body: 0.12, nz: 0.1, nf: 1400 }); k.pluck(top, 0.2, 0.15, KOTO); k.pluck(top * Math.pow(2, 7 / 12), 0.28, 0.12, KOTO); }, 4, WOODFX],
      oo: [0.7, k => softTaiko(k, 0.002, 0.24), 4, WOODFX],
      pa: [0.4, k => knock(k, 0.002, 640, 0.09, { body: 0.14, nz: 0.1, nf: 1100 }), -1, WOODFX],
      ca: [1.2, k => k.pluck(top, 0.002, 0.17, KOTO), 0, TENTFX],
      fl: [0.6, k => cloth(k, 0.003, 0.2, 650, 0.2), 0, TENTFX],
      rl: [1, k => { for (let i = 0; i < 9; i++) knock(k, 0.5 * (1 - Math.pow(1 - i / 9, 1.6)) * 1.6, 620, 0.04 + i * 0.011, { body: 0.12, nz: 0.1, nf: 1000 }); }, 1, WOODFX],
      up: [2, k => { softTaiko(k, 0.002, 0.2); [0, 7, 12, 14, 19].forEach((s, i) => k.pluck(top * Math.pow(2, s / 12) * 0.5, 0.03 + i * 0.05, 0.13, KOTO)); }, 5, TENTFX],
      dn: [1.3, k => { [12, 7, 0].forEach((s, i) => k.pluck(top * Math.pow(2, s / 12) * 0.5, 0.01 + i * 0.1, 0.13, KOTO)); softTaiko(k, 0.3, 0.15); }, 3.5, TENTFX],
    };
    return {
      wh: [0.5, k => knock(k, 0.002, 205, 0.17, { body: 0.5, nz: 0.14, nf: 750 }), 0, WOODFX],
      hn: [0.9, k => { [0, 1].forEach(i => [-6, 6].forEach(d => k.tone('saw', i ? up(7) : R, i ? 0.13 : 0.002, i ? 0.3 : 0.1, 0.075, { a: 0.018, r: 0.08, lp: 760, q: 0.7, det: d, pan: d > 0 ? 0.15 : -0.15 }))); }, 4, TENTFX],
      oo: [0.6, k => { k.tone('sine', r2, 0.002, 0, 0.25, { a: 0.012, dec: 0.13 }); k.tone('tri', r2, 0.002, 0, 0.1, { a: 0.012, dec: 0.08, lp: 420 }); }, 4, TENTFX],
      pa: [0.5, k => { [0, th, 7].forEach((s, i) => k.tone('tri', up(s), 0.002 + i * 0.003, 0, 0.055, { a: 0.012, dec: 0.075, lp: 950, pan: (i - 1) * 0.25 })); }, 0.5, TENTFX],
      ca: [0.9, k => pipe(k, top, 0.002, 0.14, 0.1), 0.5, TENTFX],
      fl: [0.6, k => cloth(k, 0.003, 0.22, 780, 0.2), 0.5, TENTFX],
      f2: [0.6, k => cloth(k, 0.003, 0.2, 620, -0.25), -0.5, TENTFX],
      rl: [1, k => { for (let i = 0; i < 14; i++) { const u = i / 14, t = 0.8 * (1 - Math.pow(1 - u, 1.7)); k.tone('sine', 148, t, 0, 0.05 + u * 0.1, { a: 0.006, dec: 0.05, to: 112, gt: 0.05 }); k.noise(t, 0, 0.02 + u * 0.05, { type: 'lp', f: 900, q: 0.6, a: 0.003, dec: 0.018 }); } }, 2.5, TENTFX],
      up: [2, k => { k.tone('sine', r2, 0.003, 0, 0.2, { a: 0.012, dec: 0.2 }); [0, th, 7, 12].forEach((s, i) => pipe(k, up(s) * 2, 0.02 + i * 0.07, 0.42, 0.07, { pan: (i - 1.5) * 0.2 })); }, 5, TENTFX],
      dn: [1.3, k => { [7, th, 0].forEach((s, i) => pipe(k, up(s) * 2, 0.01 + i * 0.1, 0.16, 0.07)); k.tone('sine', r2, 0.3, 0, 0.17, { a: 0.012, dec: 0.13 }); }, 3.5, TENTFX],
    };
  };
  return {
    names: (ep, kind) => Object.keys(def(ep, kind)),
    clip: (ep, kind, name, sr) => {
      const d = def(ep, kind)[name];
      setSeed(301 + ep * 613 + kind.length * 97 + name.charCodeAt(0) * 31 + name.charCodeAt(1) * 7);
      const k = kit(sr, d[0]); d[1](k);
      return setLevel(k.finish(Object.assign({ fade: 0.06 }, d[3])), sr, mus[ep], d[2]);
    },
  };
}
/* ---------- Малюнок ударів ---------- */
// Символ — крок музики (16 або 12 у такті, за BS_EP). Рядок — чверть ходу. w колесо, O «ум», p «па», n нота, f полотно, c скрип
const CS_BARS = {
  drive: { 16: ['w...............', 'w.......w.......', 'w...w...w...w...', 'w...w...w...w...'], 12: ['w...........', 'w.....w.....', 'w..w..w..w..', 'w..w..w..w..'] },
  setup: { 16: ['O.......f.......', 'O...p...O...f...', 'O...p.n.O...p.n.', 'O.n.p.n.O.n.p.n.'], 12: ['O.....f.....', 'O..p..O..f..', 'O..p.nO..p.n', 'O.np.nO.np.n'] },
  pack: { 16: ['O...p.n.O...p.n.', 'O...p...O...f...', 'O.......f.......', 'f...............'], 12: ['O..p.nO..p.n', 'O..p..O..f..', 'O.....f.....', 'f...........'] },
  hagUp: { 16: ['................', 'c.......O.......', 'O...c...n.......', 'O.......n...c...'], 12: ['............', 'c.....O.....', 'O..c..n.....', 'O.....n..c..'] },   // спершу чути сміх відьми, удар на нього не лягає
  hagPack: { 16: ['O.......n...c...', 'O...c...n.......', 'c.......O.......', 'c...............'], 12: ['O.....n..c..', 'O..c..n.....', 'c.....O.....', 'c...........'] },
};
const CS_LEN = { drive: 5, setup: 5, pack: 5 };
const CS = { bank: null, run: null, seed: 1 };
const csRnd = () => { CS.seed = (CS.seed * 1664525 + 1013904223) >>> 0; return CS.seed / 4294967296; };
function csKind() { const c = state.circus; return c.hag ? 'hag' : c.noodle ? 'noodle' : 'circus'; }
function csPrepare(ep, kind) {
  if (CS.bank && CS.bank.ep === ep && CS.bank.kind === kind) return CS.bank;
  const top = audio.ctx.sampleRate, sr = ecoOn() ? 22050 : Math.min(top, mobileMQ.matches ? 24000 : 32000);
  const bank = CS.bank = { ep, kind, sr, clips: {}, got: 0, total: 0 };
  const local = () => { const R = csSynthCode(bsSynthCode()), names = R.names(ep, kind); let i = 0; const next = () => { if (CS.bank !== bank || i >= names.length || !audio.ctx) return; const nm = names[i++], o = R.clip(ep, kind, nm, sr); bsStore(bank, nm, o.L, o.R, names.length); setTimeout(next, 40); }; setTimeout(next, 30); };
  const code = 'const R=(' + csSynthCode.toString() + ')((' + bsSynthCode.toString() + ')());onmessage=e=>{const m=e.data,names=R.names(m.ep,m.kind);names.forEach(nm=>{const o=R.clip(m.ep,m.kind,nm,m.sr);postMessage({name:nm,total:names.length,L:o.L,R:o.R},[o.L.buffer,o.R.buffer])})}';
  try {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })), w = new Worker(url), bye = () => { w.terminate(); URL.revokeObjectURL(url); };
    w.onmessage = e => { const d = e.data; if (CS.bank !== bank || !audio.ctx) { bye(); return; } bsStore(bank, d.name, d.L, d.R, d.total); if (bank.got >= d.total) bye(); };
    w.onerror = () => { bye(); if (CS.bank === bank) local(); };
    w.postMessage({ ep, kind, sr });
  } catch (e) { local(); }
  return bank;
}
// Заздалегідь: щойно з'явився «!» або стоїть шатро; кліпи живуть, поки цирк тут
function circusSoundAhead() {
  try {
    const c = state.circus;
    if (!c) return;
    if (!c.phase) { CS.bank = null; return; }                                  // цирк поїхав: пам'ять вільна
    if (c.phase === 4 || !bsCan() || build || (typeof warp !== 'undefined' && warp)) return;
    csPrepare(bsEpoch(), csKind());
  } catch (e) { /* звук ніколи не має ламати гру */ }
}
function circusSoundReady() { const b = CS.bank; return !!(b && b.total && b.got >= b.total); }
setInterval(circusSoundAhead, 5000);
function csPlay(name, at, gain, rate) { const b = CS.bank, buf = b && b.clips[name]; return buf ? bsSource(buf, at, gain, rate) : null; }
/* ---------- Виклики з гри ---------- */
// what: drive — їде, setup — розкладається, pack — згортається
function circusSoundStart(what) {
  CS.run = null;
  try {
    if (!audio.ctx) return;
    const ep = bsEpoch(), kind = csKind(), hag = kind === 'hag';
    CS.seed = 11 + ep * 53 + what.length * 19;
    CS.run = { what, ep, kind, bars: hag ? (what === 'pack' ? CS_BARS.hagPack : CS_BARS.hagUp) : CS_BARS[what], next: 0, t0: audio.ctx.currentTime, rl: false, hn: false, last: 'f2' };
    if (bsCan()) csPrepare(ep, kind);
  } catch (e) { /* звук ніколи не має ламати гру */ }
}
function csWork(R, p) {
  const ac = audio.ctx, now = ac.currentTime, E = BS_EP[R.ep], G = bsGrid(R.ep), step = E.step, S = R.bars[step] || R.bars[16], left = (1 - p) * CS_LEN[R.what], endAt = now + left - 0.1, n = E.n;
  let k = Math.ceil((Math.max(now + 0.005, R.next || 0) - G.t0) / G.dt - 1e-6);
  for (let guard = 0; guard < 8; guard++, k++) {
    const at = G.t0 + k * G.dt; if (at > now + BS_LOOK) { R.next = at; return; }
    R.next = at + G.dt * 0.5;
    const ch = S[Math.min(S.length - 1, Math.floor(p * S.length))][((k % step) + step) % step];
    if (ch === '.' || at > endAt) continue;
    const vel = 0.92 + csRnd() * 0.16;
    if (ch === 'w') csPlay('wh', at + (csRnd() - 0.5) * 0.01, vel * (0.7 + 0.3 * Math.min(1, p * 1.6)), 1 + (csRnd() - 0.5) * 0.06);
    else if (ch === 'O') csPlay('oo', at, vel, R.kind === 'circus' && Math.floor(k / step * 2) % 2 ? 1.4983 : 1);   // «ум»: тоніка й квінта по черзі
    else if (ch === 'p') csPlay('pa', at, vel);
    else if (ch === 'f') { R.last = R.last === 'fl' && R.kind === 'circus' ? 'f2' : 'fl'; csPlay(R.last, at, vel, 1 + (csRnd() - 0.5) * 0.08); }
    else if (ch === 'c') { R.last = R.last === 'cr' ? 'c2' : 'cr'; csPlay(R.last, at, vel); }
    else if (ch === 'n') {                                                     // шатро росте — лад вгору, згортається — вниз
      const u = R.what === 'pack' ? 1 - p : p, top = Math.floor(u * (n.length - 2)), i = Math.min(n.length - 1, top + (csRnd() < 0.5 ? 0 : 1));
      csPlay('ca', at, vel, Math.pow(2, n[i] / 12));
    }
  }
}
// Щокадру з updateCircus: p — хід поточної миті, 0…1
function circusSoundTick(p) {
  const R = CS.run; if (!R) return;
  try {
    if (!bsCan()) return;
    csPrepare(R.ep, R.kind);
    if (R.what === 'drive' && R.kind !== 'hag' && !R.hn && p < 0.15) R.hn = !!csPlay('hn', audio.ctx.currentTime + 0.01);
    if (R.what === 'drive' && R.kind === 'hag') return;                        // відьма сама сміється, поки летить
    if (R.what === 'setup' && !R.rl && p > 0.8 && R.kind !== 'hag') R.rl = !!csPlay('rl', audio.ctx.currentTime + 0.01);
    csWork(R, p);
  } catch (e) { /* звук ніколи не має ламати гру */ }
}
// Кінець миті: своя кінцівка; якщо кліпи не встигли — старий короткий сигнал
function circusSoundDone(name, fallback) {
  CS.run = null;
  try { if (bsCan() && csPlay(name, audio.ctx.currentTime + 0.005)) return; } catch (e) { /* нічого */ }
  playSfx(fallback);
}
