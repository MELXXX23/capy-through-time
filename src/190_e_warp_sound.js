//#part 190_e_warp_sound.js
/* =====================================================================
   ЗВУК ПОДОРОЖІ В ЧАСІ. У кожної епохи свій перехід: її інструменти, її тональність і уривок її мелодії (190_d_epoch_tunes),
   а події збігаються з малюнком вира (200_a, 200_b, 275_japan).
   Звук синтезується власним кодом в окремому потоці (Worker): кадри гри не просідають, а зайнятий основний потік не гальмує синтез
   (вбудований OfflineAudioContext при завантаженому потоці сповільнюється в рази). Той самий код рендерить зразки: previews/warp_sound.
   Грає двома буферами: «розгін» стартує разом із виром, а «прибуття» запускає сам вир у мить, коли відкривається нова епоха
   (warpSoundHit в updateWarp), тож удар збігається з картинкою і на повільному телефоні: поки вир запізнюється, розгін тримає напругу.
   Поки триває розгін, музика гри притишена (audio.musicDuck).
   ===================================================================== */
const WARP_HIT = [0.74, 0.74, 0.74, 0.74, 0.74, 0.74, 0.74, 0.76, 0.74];      // коли відкривається нова епоха (частка warp.dur)
const WARP_PIX = [0, 0, 0, 0, 0, 0, 0, 0, 0];                                 // 1 — «піксельний» варіант епохи: прості хвилі й коротка луна, як у музиці гри
const WARP_KEY = ['D4', 'A3', 'C4', 'A3', 'A3', 'G3', 'D4', 'C4', 'D4'];      // основний тон епохи: удар годинника вже в її тональності
// Увесь синтез. Текст цієї функції стає кодом Worker-а, тому вона самодостатня: не бере нічого ззовні
function wsSynthCode() {
  const TAU = Math.PI * 2, CTRL = 32;                                         // CTRL — раз на стільки семплів міняються висота й фільтри
  let WARP_HOLD = 2;                                                          // запас розгону після розрахункової миті удару, с: поки вир запізнюється, розгін тримає напругу
  const WS_TAIL = [3.6, 3.2, 3, 2.4, 3, 3.2, 3.8, 3.4, 3.8];                  // довжина «прибуття» по епохах, с
  const WARP_LEVEL = [[1, 1.25], [1, 1.3], [1, 1], [1, 0.6], [1, 1], [1, 1], [1, 1.05], [1, 1], [1, 1]];   // вирівнювання гучності: [звичайний, піксельний]
  let wsSeed = 1;
  const wsRnd = () => { wsSeed = (wsSeed * 1664525 + 1013904223) >>> 0; return wsSeed / 4294967296; };   // свій генератор: той самий звук щоразу
  const NI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const noteFreq = s => { const m = /^([A-G])([#b]?)(\d)$/.exec(s); return m ? 440 * Math.pow(2, (NI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (+m[3] + 1) * 12 - 69) / 12) : 0; };
  const wsChord = s => s.split(' ').map(noteFreq);
  const wsMidi = n => 440 * Math.pow(2, (n - 69) / 12);
  // Рядок нот у форматі мелодій епох «D5:4 E5:2 .:2» у легато-лінію [[час, частота, тривалість]…]; more подовжує останню ноту
  const wsLine = (t0, step, str, more) => {
    let t = t0; const out = [];
    str.split(' ').forEach(tok => { const [n, st] = tok.split(':'), d = st * step; if (n !== '.') out.push([t, noteFreq(n), d]); t += d; });
    if (more) out[out.length - 1][2] += more;
    return out;
  };
  const SIN = new Float32Array(4098); for (let i = 0; i < 4098; i++) SIN[i] = Math.sin(TAU * i / 4096);
  const sinT = x => { const p = (x - Math.floor(x)) * 4096, i = p | 0; return SIN[i] + (SIN[i + 1] - SIN[i]) * (p - i); };
  const blep = (t, dt) => { if (t < dt) { t /= dt; return t + t - t * t - 1; } if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; } return 0; };   // згладжує стрибок хвилі, щоб не було брудних призвуків
  // Коефіцієнти фільтра: q у lowpass/highpass — у дБ, у bandpass/peaking — добротність (як у Web Audio)
  const coef = (type, f, q, gn, sr) => {
    const w = TAU * Math.min(f, sr * 0.49) / sr, c = Math.cos(w), s = Math.sin(w); let b0, b1, b2, a0, a1, a2;
    if (type === 'lowpass' || type === 'highpass') { const al = s / (2 * Math.pow(10, q / 20)); a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; if (type === 'lowpass') { b1 = 1 - c; b0 = b1 / 2; b2 = b0; } else { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; } }
    else if (type === 'bandpass') { const al = s / (2 * q); a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; b0 = al; b1 = 0; b2 = -al; }
    else if (type === 'peaking') { const A = Math.pow(10, gn / 40), al = s / (2 * q); a0 = 1 + al / A; a1 = -2 * c; a2 = 1 - al / A; b0 = 1 + al * A; b1 = -2 * c; b2 = 1 - al * A; }
    else { const A = Math.pow(10, gn / 40), sa = s * Math.SQRT2 * Math.sqrt(A); b0 = A * (A + 1 - (A - 1) * c + sa); b1 = 2 * A * (A - 1 - (A + 1) * c); b2 = A * (A + 1 - (A - 1) * c - sa); a0 = A + 1 + (A - 1) * c + sa; a1 = -2 * (A - 1 + (A + 1) * c); a2 = A + 1 + (A - 1) * c - sa; }   // lowshelf
    return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
  };
  const TW = {};
  const fft = (re, im, inv) => {                                              // швидке перетворення Фур'є: для простору (згортка з імпульсом)
    const N = re.length;
    for (let i = 1, j = 0; i < N; i++) { let b = N >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { const a = re[i]; re[i] = re[j]; re[j] = a; const c = im[i]; im[i] = im[j]; im[j] = c; } }
    if (!TW[N]) { const tc = new Float64Array(N >> 1), ts = new Float64Array(N >> 1); for (let i = 0; i < N >> 1; i++) { tc[i] = Math.cos(TAU * i / N); ts[i] = Math.sin(TAU * i / N); } TW[N] = { tc, ts }; }
    const { tc, ts } = TW[N], sg = inv ? 1 : -1;
    for (let L = 2; L <= N; L <<= 1) { const h = L >> 1, st = N / L; for (let i = 0; i < N; i += L) for (let j = i, m = 0; j < i + h; j++, m += st) { const u = j + h, wr = tc[m], wi = sg * ts[m], xr = re[u] * wr - im[u] * wi, xi = re[u] * wi + im[u] * wr; re[u] = re[j] - xr; im[u] = im[j] - xi; re[j] += xr; im[j] += xi; } }
    if (inv) for (let i = 0; i < N; i++) { re[i] /= N; im[i] /= N; }
  };
  // Простір: згортка посилу зі стереоімпульсом (шум, що згасає й темнішає). Рахується на ~11 кГц: відлунню верхи не потрібні, а часу йде вп'ятеро менше
  const convolve = (x, n, sr, sec, bright, pre, level, outL, outR) => {
    const D = Math.max(1, Math.round(sr / 11025)), sr2 = sr / D, m = Math.floor(n / D), irN = Math.ceil(sec * sr2); let N = 2; while (N < m + irN) N <<= 1;
    const re = new Float64Array(N), im = new Float64Array(N), hr = new Float64Array(N), hi = new Float64Array(N), p0 = Math.round((pre || 0) * sr2), dA = Math.exp(-6.9 / (sec * sr2)), dC = Math.exp(-3 / (sec * sr2));
    for (let i = 0; i < m; i++) { let v = 0; for (let j = 0; j < D; j++) v += x[i * D + j]; re[i] = v / D; }
    let en = 0;
    [hr, hi].forEach(h => { let lp = 0, a = 1, e = 1; for (let i = p0; i < irN; i++) { lp += (wsRnd() * 2 - 1 - lp) * Math.min(1, (0.05 + bright * e) * 2); const v = lp * a; h[i] = v; en += v * v; a *= dA; e *= dC; } for (let i = 0, fd = Math.floor(sr2 * 0.01); i < fd; i++) h[irN - 1 - i] *= i / fd; });
    const sc = Math.sqrt(1.5876e-6 * sec * 44100 / (en * 0.5 + 1e-12)) * level;   // стала енергія відгуку: рівень простору не залежить від його довжини
    for (let i = 0; i < irN; i++) { hr[i] *= sc; hi[i] *= sc; }
    fft(re, im, false); fft(hr, hi, false);
    for (let i = 0; i < N; i++) { const v = re[i] * hr[i] - im[i] * hi[i]; im[i] = re[i] * hi[i] + im[i] * hr[i]; re[i] = v; }
    fft(re, im, true);
    for (let i = 0; i < n; i++) { const p = Math.floor(i / D), f = (i - p * D) / D, nx = p + 1 < N ? p + 1 : p; outL[i] += re[p] + (re[nx] - re[p]) * f; outR[i] += im[p] + (im[nx] - im[p]) * f; }
  };
  const WS_STR = { nylon: [0.5, 0.2, 0.997], harp: [0.32, 0.42, 0.999], koto: [0.85, 0.11, 0.995], uke: [0.55, 0.23, 0.992], steel: [0.8, 0.13, 0.998] };   // струни: яскравість, точка щипка, втрати
  // Набір інструментів. Кожен виклик одразу дописує звук у буфер свого інструмента (групи); k.finish зводить групи, луну й простір. pix — «піксельна» заміна: ті самі ноти простими хвилями
  function wsKit(sr, len, pix) {
    const n = Math.ceil(len * sr), k = { sr, pix: !!pix }, groups = [], echoes = [], sumL = new Float32Array(n), sumR = new Float32Array(n);
    let rev = null, room = null, roomEcho = null;
    const NOISE = new Float32Array(131072); for (let i = 0; i < 131072; i++) NOISE[i] = wsRnd() * 2 - 1;
    const pans = p => (p ? [Math.cos((p + 1) * Math.PI / 4) * Math.SQRT2, Math.sin((p + 1) * Math.PI / 4) * Math.SQRT2] : [1, 1]);
    k.group = (o = {}) => { const g = { L: null, R: null, o, a: n, b: 0 }; groups.push(g); return g; };
    const bus = k.group({});
    const take = (g, a, b) => { if (!g.L) { g.L = new Float32Array(n); g.R = new Float32Array(n); } if (a < g.a) g.a = a; if (b > g.b) g.b = b; };
    k.pulse = d => ({ t: 'pulse', d });
    k.tri8 = () => ({ t: 'tri8' });                                           // трикутник приставки: 16 сходинок, характерне легке дзижчання
    const tabs = {};
    k.pw = harm => { const id = harm.join(); if (tabs[id]) return tabs[id]; const tab = new Float32Array(2049); let top = 0; for (let i = 0; i < 2048; i++) { let v = 0; harm.forEach((h, j) => { v += h * Math.sin(TAU * (j + 1) * i / 2048); }); tab[i] = v; if (Math.abs(v) > top) top = Math.abs(v); } for (let i = 0; i < 2048; i++) tab[i] /= top; tab[2048] = tab[0]; return (tabs[id] = { t: 'tab', tab }); };
    k.room = (sec, bright, pre, level) => { if (pix) { sec = Math.min(sec, 0.8); level *= 0.85; roomEcho = k.echo(0.17, 0.34, 2600, 0.42); } room = { sec, bright, pre, level }; };
    k.echo = (time, fb, lp, vol, pingPong) => { const e = { inp: new Float32Array(n), time, fb, lp, vol, pingPong, used: false }; echoes.push(e); return e; };
    k.osc = (wave, f, t, dur, vol, o = {}) => {
      const g = o.to || bus, i0 = Math.round(t * sr); if (i0 >= n) return;
      const kind = typeof wave === 'string' ? ({ sine: 0, sawtooth: 1, square: 2, triangle: 3 })[wave] : wave.t === 'pulse' ? 4 : wave.t === 'tri8' ? 5 : 6, duty = wave.d, tab = wave.tab, nrm = kind === 4 ? 1 / (2 - 2 * duty) : 1, dcp = kind === 4 ? 1 - 2 * duty : 0;
      const aN = Math.max(1, Math.round((o.a == null ? 0.004 : o.a) * sr)), dec = o.dec || 0, rN = dec ? 0 : Math.max(1, Math.round((o.r == null ? 0.03 : o.r) * sr)), full = dec ? aN + Math.round(dec * 7 * sr) : Math.round(dur * sr), i1 = Math.min(n, i0 + full), rS = i0 + full - rN, aE = i0 + aN, dk = dec ? Math.exp(-1 / (dec * sr)) : 1;
      if (i1 <= i0) return; take(g, i0, i1);
      const L = g.L, R = g.R, [gl, gr] = pans(o.pan), seg = o.glide, st = o.steps, detK = o.det ? Math.pow(2, o.det / 1200) : 1, vb = o.vib, tr = o.trem, trTo = o.tremTo;
      let ph = kind === 1 || kind === 4 ? wsRnd() : 0, env = vol, sI = 0, sF = f, sT = 0, stI = 0, stF = f, trPh = 0;
      const lp = o.lp; let fc = lp ? coef('lowpass', lp[0], o.q == null ? 0.8 : o.q, 0, sr) : null, z1 = 0, z2 = 0;
      for (let i = i0; i < i1;) {
        const tt = (i - i0) / sr, e = Math.min(i1, i + CTRL); let fr = f;
        if (seg) { while (sI < seg.length && tt >= seg[sI][1]) { sF = Math.max(20, seg[sI][0]); sT = seg[sI][1]; sI++; } fr = sI >= seg.length ? sF : sF * Math.pow(Math.max(20, seg[sI][0]) / sF, (tt - sT) / (seg[sI][1] - sT)); }
        else if (st) { while (stI < st.length && tt >= st[stI][0]) stF = st[stI++][1]; fr = stF; }
        fr *= detK;
        if (vb) fr *= Math.pow(2, vb[1] * (vb[2] ? Math.min(1, tt / vb[2]) : 1) * sinT(vb[0] * tt) / 1200);
        const inc = fr / sr; let tm = 1;
        if (tr) { tm = 1 - tr[1] + tr[1] * sinT(trPh); trPh += (trTo ? tr[0] * Math.pow(trTo[0] / tr[0], Math.min(1, tt / trTo[1])) : tr[0]) * (e - i) / sr; }
        if (lp && lp[1]) fc = coef('lowpass', lp[1] + (lp[0] - lp[1]) * Math.exp(-tt / (lp[2] || 0.1)), o.q == null ? 0.8 : o.q, 0, sr);
        for (let j = i; j < e; j++) {
          let w;
          switch (kind) {
            case 0: { const p = ph * 4096, q = p | 0; w = SIN[q] + (SIN[q + 1] - SIN[q]) * (p - q); break; }
            case 1: w = 2 * ph - 1 - blep(ph, inc); break;
            case 2: w = (ph < 0.5 ? 1 : -1) + blep(ph, inc) - blep(ph < 0.5 ? ph + 0.5 : ph - 0.5, inc); break;
            case 3: w = 4 * Math.abs(ph - 0.5) - 1; break;
            case 4: { const sh = ph + 1 - duty; w = ((ph < duty ? 1 : -1) + blep(ph, inc) - blep(sh >= 1 ? sh - 1 : sh, inc) + dcp) * nrm; break; }
            case 5: w = (Math.abs(ph * 2 - 1) * 16 | 0) / 8 - 1; break;
            default: { const p = ph * 2048, q = p | 0; w = tab[q] + (tab[q + 1] - tab[q]) * (p - q); }
          }
          ph += inc; if (ph >= 1) ph -= 1;
          let a;
          if (j < aE) a = vol * (j - i0) / aN; else if (dec) { env *= dk; a = env; } else if (j >= rS) a = vol * (i0 + full - j) / rN; else a = vol;
          let x = w * a * tm;
          if (fc) { const y = fc[0] * x + z1; z1 = fc[1] * x - fc[3] * y + z2; z2 = fc[2] * x - fc[4] * y; x = y; }
          L[j] += x * gl; R[j] += x * gr;
        }
        i = e;
      }
    };
    k.saws = (f, t, dur, vol, o = {}) => {                                    // кілька розстроєних пилок на ноту
      const v = o.n || 3, sp = o.spread || 10;
      if (pix) { [-sp * 0.6, sp * 0.6].forEach(d => k.osc(k.pulse(0.25), f, t, dur, vol * v * 0.3, Object.assign({}, o, { det: d }))); return; }
      for (let i = 0; i < v; i++) k.osc('sawtooth', f, t, dur, vol, Object.assign({}, o, { det: v > 1 ? -sp + 2 * sp * i / (v - 1) : 0 }));
    };
    k.hiss = (t, dur, vol, o = {}) => {                                       // шум крізь фільтр: sweep — куди рухається частота, move — панорама з краю в край
      const g = o.to || bus, i0 = Math.round(t * sr); if (i0 >= n) return;
      const aN = Math.max(1, Math.round((o.a == null ? 0.002 : o.a) * sr)), dec = o.dec || 0, rN = dec ? 0 : Math.max(1, Math.round((o.r == null ? 0.03 : o.r) * sr)), full = dec ? aN + Math.round(dec * 7 * sr) : Math.round(dur * sr), i1 = Math.min(n, i0 + full), rS = i0 + full - rN, aE = i0 + aN, dk = dec ? Math.exp(-1 / (dec * sr)) : 1;
      if (i1 <= i0) return; take(g, i0, i1);
      const L = g.L, R = g.R, type = o.type || 'bandpass', q = o.q == null ? 0.8 : o.q, seg = o.sweep, mv = o.move, mvT = dec ? dec * 3 : dur; let [gl, gr] = pans(o.pan), sI = 0, sF = o.f || 1000, sT = 0, env = vol, z1 = 0, z2 = 0, np = (wsRnd() * 131072) | 0, fc = coef(type, sF, q, 0, sr);
      for (let i = i0; i < i1;) {
        const tt = (i - i0) / sr, e = Math.min(i1, i + CTRL);
        if (seg) { while (sI < seg.length && tt >= seg[sI][1]) { sF = seg[sI][0]; sT = seg[sI][1]; sI++; } fc = coef(type, sI >= seg.length ? sF : sF * Math.pow(seg[sI][0] / sF, (tt - sT) / (seg[sI][1] - sT)), q, 0, sr); }
        if (mv) [gl, gr] = pans(mv[0] + (mv[1] - mv[0]) * Math.min(1, tt / mvT) || 0.001);
        for (let j = i; j < e; j++) {
          const x0 = NOISE[np]; np = (np + 1) & 131071;
          let a; if (j < aE) a = vol * (j - i0) / aN; else if (dec) { env *= dk; a = env; } else if (j >= rS) a = vol * (i0 + full - j) / rN; else a = vol;
          const x = x0 * a, y = fc[0] * x + z1; z1 = fc[1] * x - fc[3] * y + z2; z2 = fc[2] * x - fc[4] * y;
          L[j] += y * gl; R[j] += y * gr;
        }
        i = e;
      }
    };
    const strs = {};
    const stringBuf = (kind, oct) => {                                        // щипнута струна (Карплус — Стронг): шум у лінії затримки, що гасне по колу
      const id = kind + oct; if (strs[id]) return strs[id];
      const [br, pick, loss] = WS_STR[kind], P = Math.max(4, Math.round(sr / (110 * Math.pow(2, oct)))), s = Math.min(0.5, Math.max(0.05, P / 300)), m = Math.ceil(sr * (oct >= 2 ? 1.3 : 2.1)), d = new Float32Array(m + 1), ex = new Float32Array(P), line = new Float32Array(P);
      let lp = 0; for (let i = 0; i < P; i++) { lp += (wsRnd() * 2 - 1 - lp) * br; ex[i] = lp; }
      const pk = Math.max(1, Math.round(P * pick)); for (let i = 0; i < P; i++) line[i] = ex[i] - ex[(i + P - pk) % P];   // щипок не посередині струни дає тембр саме цього інструмента
      let p = 0, prev = 0, top = 0;
      for (let i = 0; i < m; i++) { const c = line[p]; line[p] = loss * ((1 - s) * c + s * prev); prev = c; d[i] = c; if (Math.abs(c) > top) top = Math.abs(c); if (++p === P) p = 0; }
      const fade = Math.floor(sr * 0.2); for (let i = 0; i < m; i++) d[i] = d[i] / top * (i > m - fade ? (m - i) / fade : 1);
      return (strs[id] = { d, f0: sr / (P + s), m });
    };
    k.pluck = (f, t, vol, o = {}) => {
      if (pix) { k.osc(o.wave || k.pulse(0.25), f, t, 0, vol * 0.5, { dec: o.pdec || 0.17, lp: [Math.min(sr * 0.4, f * 7), f * 2.2, 0.07], to: o.to, pan: o.pan }); return; }
      const g = o.to || bus, i0 = Math.round(t * sr); if (i0 >= n) return;
      const b = stringBuf(o.kind || 'nylon', Math.round(Math.log2(f / 110))), rate = f / b.f0, len = o.len || 1.8, full = Math.round(len * sr), i1 = Math.min(n, i0 + full), rS = i0 + Math.round(full * 0.72), rN = Math.max(1, i0 + full - rS), aN = Math.max(1, Math.round(0.0015 * sr)), bd = o.bend, d = b.d;
      take(g, i0, i1); const L = g.L, R = g.R, [gl, gr] = pans(o.pan); let pos = 0;
      for (let i = i0; i < i1;) {
        const tt = (i - i0) / sr, e = Math.min(i1, i + CTRL); let rt = rate;
        if (bd && tt > bd[0]) { const up = (tt - bd[0]) / bd[2]; rt = rate * (up < 1 ? 1 + (bd[1] - 1) * up : up < 2.4 ? 1 + (bd[1] - 1) * (2.4 - up) / 1.4 : 1); }
        for (let j = i; j < e; j++) {
          const q = pos | 0; if (q >= b.m) { i = i1; break; }
          let x = d[q] + (d[q + 1] - d[q]) * (pos - q); pos += rt;
          x *= (j - i0 < aN ? (j - i0) / aN : 1) * (j >= rS ? (i0 + full - j) / rN : 1) * vol;
          L[j] += x * gl; R[j] += x * gr;
        }
        if (i !== i1) i = e;
      }
    };
    k.fm = (f, t, vol, o = {}) => {                                           // фазова модуляція: скляні дзвіночки, калімба, бас і мідь 16-бітних приставок
      const g = o.to || bus, i0 = Math.round(t * sr); if (i0 >= n) return;
      const r = o.ratio || 2, idx = o.index == null ? 2 : o.index, keep = o.keep || 0, sus = o.dur || 0, dec = sus ? 0 : (o.dec || 0.3), md = o.mdec || (dec || 0.3) * 0.4, aN = Math.max(1, Math.round((o.a == null ? 0.002 : o.a) * sr)), rN = sus ? Math.max(1, Math.round((o.r == null ? 0.03 : o.r) * sr)) : 0, full = sus ? Math.round(sus * sr) : aN + Math.round(dec * 7 * sr), i1 = Math.min(n, i0 + full), rS = i0 + full - rN, aE = i0 + aN, dk = dec ? Math.exp(-1 / (dec * sr)) : 1, seg = o.glide;
      if (i1 <= i0) return; take(g, i0, i1);
      const L = g.L, R = g.R, [gl, gr] = pans(o.pan); let pc = 0, pm = 0, env = vol, sI = 0, sF = f, sT = 0;
      for (let i = i0; i < i1;) {
        const tt = (i - i0) / sr, e = Math.min(i1, i + CTRL); let fr = f;
        if (seg) { while (sI < seg.length && tt >= seg[sI][1]) { sF = Math.max(20, seg[sI][0]); sT = seg[sI][1]; sI++; } fr = sI >= seg.length ? sF : sF * Math.pow(Math.max(20, seg[sI][0]) / sF, (tt - sT) / (seg[sI][1] - sT)); }
        const I = idx * (keep + (1 - keep) * Math.exp(-tt / md)) / TAU, ic = fr / sr, im = fr * r / sr;
        for (let j = i; j < e; j++) {
          let a; if (j < aE) a = vol * (j - i0) / aN; else if (dec) { env *= dk; a = env; } else if (j >= rS) a = vol * (i0 + full - j) / rN; else a = vol;
          const x = sinT(pc + I * sinT(pm)) * a; pc += ic; pm += im; if (pc >= 1) pc -= 1; if (pm >= 1) pm -= 1;
          L[j] += x * gl; R[j] += x * gr;
        }
        i = e;
      }
    };
    k.bell = (f, t, vol, o = {}) => {                                         // дзвін: окремі часткові, верхні згасають швидше
      const dec = o.dec || 1.6, ps = pix ? [[1, 1, 1], [2, 0.3, 0.45], [3.01, 0.1, 0.25]] : (o.parts || [[0.5, 0.3, 1.3], [1, 1, 1], [1.25, 0.3, 0.75], [1.5, 0.28, 0.6], [2, 0.5, 0.5], [2.52, 0.16, 0.32], [3.01, 0.14, 0.24], [4.2, 0.06, 0.14]]);
      ps.forEach(([r, g, d]) => k.osc('sine', f * r, t, 0, vol * g, { a: 0.003, dec: dec * d, to: o.to, pan: o.pan, det: o.det }));
    };
    k.choir = (notes, t, dur, vol, o = {}) => {                               // хор «а-а»: пилки крізь три форманти голосу
      const g = o.to || bus, i0 = Math.round(t * sr); if (i0 >= n) return;
      const m = Math.min(n - i0, Math.round(dur * sr)), a = o.a || 0.3, r = o.r || 0.4; take(g, i0, i0 + m);
      const v = new Float32Array(m), vibD = pix ? 6 : 9;
      notes.forEach(fq => (pix ? [[k.tri8(), 0, 1.9], [k.pulse(0.125), 5, 0.5]] : [['sawtooth', -7, 1], ['sawtooth', 6, 1]]).forEach(([w, det, mix]) => {
        const kind = typeof w === 'string' ? 1 : w.t === 'pulse' ? 4 : 5, duty = w.d, nrm = kind === 4 ? 1 / (2 - 2 * duty) : 1, dcp = kind === 4 ? 1 - 2 * duty : 0, base = fq * Math.pow(2, det / 1200) / sr, amp = vol * mix; let ph = wsRnd();
        for (let i = 0; i < m;) { const e = Math.min(m, i + CTRL), inc = base * Math.pow(2, vibD * sinT(4.9 * i / sr) / 1200); for (let j = i; j < e; j++) { let x; if (kind === 1) x = 2 * ph - 1 - blep(ph, inc); else if (kind === 4) { const sh = ph + 1 - duty; x = ((ph < duty ? 1 : -1) + blep(ph, inc) - blep(sh >= 1 ? sh - 1 : sh, inc) + dcp) * nrm; } else x = (Math.abs(ph * 2 - 1) * 16 | 0) / 8 - 1; v[j] += x * amp; ph += inc; if (ph >= 1) ph -= 1; } i = e; }
      }));
      const out = pix ? v : new Float32Array(m);
      if (!pix) [[750, 8, 2.4], [1180, 10, 1.3], [2700, 11, 0.55], [420, 4, 0.5]].forEach(([fq, q, gn]) => { const c = coef('bandpass', fq, q, 0, sr); let z1 = 0, z2 = 0; for (let j = 0; j < m; j++) { const x = v[j], y = c[0] * x + z1; z1 = c[1] * x - c[3] * y + z2; z2 = c[2] * x - c[4] * y; out[j] += y * gn; } });
      const aN = Math.max(1, Math.round(a * sr)), rN = Math.max(1, Math.round(r * sr)), rS = Math.round(dur * sr) - rN, L = g.L, R = g.R, last = Math.round(dur * sr);
      for (let j = 0; j < m; j++) { const x = out[j] * (j < aN ? j / aN : 1) * (j >= rS ? (last - j) / rN : 1); L[i0 + j] += x; R[i0 + j] += x; }
    };
    k.flute = (line, vol, o = {}) => {                                        // одна легато-лінія з вібрато й подихом: флейта, свист, сякухаті
      const g = o.to || bus, t0 = line[0][0], last = line[line.length - 1], end = last[0] + last[2], a = o.a || 0.06, r = o.r || 0.15, sc = o.scoop || 1, gl = o.glideT || 0.045, i0 = Math.round(t0 * sr), i1 = Math.min(n, Math.round(end * sr)), [pl, pr] = pans(o.pan), v = o.vib || [5, 12, 0.35], swell = o.swell || 1, vl = vol * (pix ? 0.85 : 1), wave = pix ? null : (o.harm ? k.pw(o.harm).tab : null), br = pix ? 0 : (o.breath || 0) * 3;
      if (i1 <= i0) return; take(g, i0, i1);
      const L = g.L, R = g.R, ampAt = t => (t < t0 + a ? (t - t0) / a : t > end - r ? swell * Math.max(0, (end - t) / r) : 1 + (swell - 1) * (t - t0 - a) / Math.max(0.001, end - r - t0 - a));
      let ph = 0, nI = 0, z1 = 0, z2 = 0, np = (wsRnd() * 131072) | 0;
      for (let i = i0; i < i1;) {
        const t = i / sr, e = Math.min(i1, i + CTRL);
        while (nI + 1 < line.length && t >= line[nI + 1][0]) nI++;
        const nt = line[nI], f = nt[1] * (t - nt[0] < gl ? Math.pow(sc, 1 - (t - nt[0]) / gl) : 1), fr = f * Math.pow(2, v[1] * Math.min(1, (t - t0) / (v[2] || 0.3)) * sinT(v[0] * (t - t0)) / 1200), inc = fr / sr, A0 = ampAt(t), A1 = ampAt(e / sr), bc = br ? coef('bandpass', f, 12, 0, sr) : null;
        for (let j = i; j < e; j++) {
          const am = (A0 + (A1 - A0) * (j - i) / (e - i)) * vl; let x;
          if (pix) x = (Math.abs(ph * 2 - 1) * 16 | 0) / 8 - 1; else if (wave) { const p = ph * 2048, q = p | 0; x = wave[q] + (wave[q + 1] - wave[q]) * (p - q); } else { const p = ph * 4096, q = p | 0; x = SIN[q] + (SIN[q + 1] - SIN[q]) * (p - q); }
          ph += inc; if (ph >= 1) ph -= 1; x *= am;
          if (bc) { const xn = NOISE[np] * am * br; np = (np + 1) & 131071; const y = bc[0] * xn + z1; z1 = bc[1] * xn - bc[3] * y + z2; z2 = bc[2] * xn - bc[4] * y; x += y; }
          L[j] += x * pl; R[j] += x * pr;
        }
        i = e;
      }
    };
    let lf = null;
    k.crunch = (t, vol, rate, o = {}) => {                                    // 1-бітний шум приставки: rate — висота, dec — довжина
      if (!lf) { lf = new Float32Array(32768); let r = 1, v = 1; const hold = Math.max(1, Math.round(sr / 14700)); for (let i = 0; i < 32768; i++) { if (i % hold === 0) { const b = (r ^ (r >> 1)) & 1; r = (r >> 1) | (b << 14); v = r & 1 ? 1 : -1; } lf[i] = v; } }
      const g = o.to || bus, i0 = Math.round(t * sr); if (i0 >= n) return;
      const dec = o.dec || 0.05, full = Math.round(dec * 7 * sr), i1 = Math.min(n, i0 + full), dk = Math.exp(-1 / (dec * sr)); take(g, i0, i1);
      const L = g.L, R = g.R, [gl, gr] = pans(o.pan); let pos = wsRnd() * 32768, env = vol;
      for (let j = i0; j < i1; j++) { const x = lf[(pos | 0) & 32767] * env * (j - i0 < 32 ? (j - i0) / 32 : 1); pos += rate; env *= dk; L[j] += x * gl; R[j] += x * gr; }
    };
    k.kick = (t, v, o = {}) => { k.osc('sine', o.f || 135, t, 0, v, { a: 0.002, dec: o.dec || 0.1, glide: [[o.f1 || 47, 0.07]], to: o.to }); k.hiss(t, 0, v * 0.2, { type: 'lowpass', f: 1500, dec: 0.01, to: o.to }); };
    k.hat = (t, v, o = {}) => k.hiss(t, 0, v, { type: 'highpass', f: o.f || 8000, q: 0.7, dec: o.open ? 0.07 : 0.016, to: o.to, pan: o.pan });
    k.clap = (t, v, o = {}) => { [0, 0.011, 0.023].forEach(d => k.hiss(t + d, 0, v * 0.65, { type: 'bandpass', f: 1500, q: 1.1, dec: 0.007, to: o.to })); k.hiss(t + 0.03, 0, v, { type: 'bandpass', f: 1300, q: 0.9, dec: o.dec || 0.055, to: o.to }); };
    k.snare = (t, v, o = {}) => { k.osc('triangle', 215, t, 0, v * 0.55, { dec: 0.04, glide: [[150, 0.05]], to: o.to }); k.hiss(t, 0, v, { type: 'bandpass', f: o.f || 2600, q: 0.6, dec: o.dec || 0.07, to: o.to }); };
    k.taiko = (t, v, o = {}) => { const f = o.f || 78; k.osc('sine', f * 1.7, t, 0, v, { a: 0.003, dec: o.dec || 0.27, glide: [[f, 0.05]], to: o.to }); k.osc('sine', f * 2.6, t, 0, v * 0.3, { dec: 0.07, to: o.to }); k.hiss(t, 0, v * 0.35, { type: 'lowpass', f: 950, dec: 0.022, to: o.to }); };
    const runF = (x, a, b, type, f, q, gn, sweep) => {                        // фільтр по шматку буфера; sweep — точки [час, частота] для руху
      let c = coef(type, f, q, gn, sr), z1 = 0, z2 = 0, sI = 0;
      for (let i = a; i < b;) {
        const e = Math.min(b, i + 64);
        if (sweep) { const t = i / sr; while (sI + 1 < sweep.length && t >= sweep[sI + 1][0]) sI++; const P = sweep[sI], Q = sweep[sI + 1]; c = coef(type, !Q || t < P[0] ? P[1] : P[1] * Math.pow(Q[1] / P[1], (t - P[0]) / (Q[0] - P[0])), q, gn, sr); }
        for (let j = i; j < e; j++) { const v = x[j], y = c[0] * v + z1; z1 = c[1] * v - c[3] * y + z2; z2 = c[2] * v - c[4] * y; x[j] = y; }
        i = e;
      }
    };
    k.finish = (level, drive, fadeIn) => {                                           // зведення: групи (адресати створені раніше за джерела, тож зворотний порядок), луна, простір, майстер
      const curveAt = pts => { let sI = 0; return t => { while (sI + 1 < pts.length && t >= pts[sI + 1][0]) sI++; const P = pts[sI], Q = pts[sI + 1]; return !Q || t < P[0] ? P[1] : P[1] + (Q[1] - P[1]) * (t - P[0]) / (Q[0] - P[0]); }; };
      for (let gi = groups.length - 1; gi >= 0; gi--) {
        const g = groups[gi], o = g.o; if (!g.L) continue;
        const a = g.a, b = Math.min(n, g.b + Math.round(0.08 * sr)), L = g.L, R = g.R;
        [L, R].forEach(x => { if (o.hp) runF(x, a, b, 'highpass', o.hp, 0.7, 0); if (o.lp) runF(x, a, b, 'lowpass', o.lp, o.lq == null ? 0.7 : o.lq, 0, o.sweep); (o.peak || []).forEach(([fq, gn, q]) => runF(x, a, b, 'peaking', fq, q || 1, gn)); });
        const gain = o.gain == null ? 1 : o.gain, auto = o.auto ? curveAt(o.auto) : null, [gl, gr] = pans(o.pan), dest = o.to || (g === bus ? null : bus), dL = dest ? (take(dest, a, b), dest.L) : sumL, dR = dest ? dest.R : sumR, wet = o.wet || 0, ec = o.echo, ea = o.send == null ? 0.5 : o.send;
        if (wet && !rev) rev = new Float32Array(n);
        let cg = gain;
        for (let i = a; i < b; i++) {
          if (auto && i % 32 === 0) cg = gain * auto(i / sr);
          const l = L[i] * cg, r = R[i] * cg; dL[i] += l * gl; dR[i] += r * gr;
          if (wet || ec) { const mid = (l + r) * 0.5; if (wet) rev[i] += mid * wet; if (ec) ec.inp[i] += mid * ea; }
        }
        g.L = g.R = null;
      }
      if (roomEcho && rev) for (let i = 0; i < n; i++) roomEcho.inp[i] = rev[i];
      echoes.forEach(e => {
        const D = Math.max(2, Math.round(e.time * sr)), d1 = new Float32Array(D), d2 = e.pingPong ? new Float32Array(D) : null, cf = 1 - Math.exp(-TAU * e.lp / sr), [al, ar] = pans(e.pingPong ? -0.75 : 0), [bl, br] = pans(0.75), x = e.inp, fb = e.fb, vol = e.vol;
        let p = 0, s = 0;
        for (let i = 0; i < n; i++) {
          const y = d1[p]; s += (y - s) * cf; const o1 = s * vol; sumL[i] += o1 * al; sumR[i] += o1 * ar;
          if (d2) { const y2 = d2[p]; d1[p] = x[i] + y2 * fb; d2[p] = s * fb; const o2 = y2 * vol; sumL[i] += o2 * bl; sumR[i] += o2 * br; }
          else d1[p] = x[i] + s * fb;
          if (++p === D) p = 0;
        }
      });
      if (room && rev) convolve(rev, n, sr, room.sec, room.bright, room.pre, room.level, sumL, sumR);
      const fN = Math.max(1, Math.round(fadeIn * sr)), tN = Math.round(0.5 * sr), L = sumL, R = sumR, dr = 0.85 * 1.6 * drive;
      [L, R].forEach(x => {
        runF(x, 0, n, 'highpass', 42, 0.7, 0); runF(x, 0, n, 'lowshelf', 130, 0, -5); runF(x, 0, n, 'peaking', 1900, 0.8, 2);
        for (let i = 0; i < n; i++) { let v = x[i] * dr; v = v > 3 ? 3 : v < -3 ? -3 : v; x[i] = v * (27 + v * v) / (27 + 9 * v * v) * level * (i < fN ? i / fN : 1) * (i > n - tN ? (n - i) / tN : 1); }   // м'яке вкорочення піків додає обертони, тож бас читається і на телефоні
      });
      return { L, R };
    };
    return k;
  }
  const WARP_SOUNDS = [
    { /* 0. ВІДРОДЖЕННЯ, ре дорійський: лютня-перебір, флейта веде «Гальярду», арфа злітає вгору; прибуття — хор і дзвін у ясному ре мажорі, як закінчували каденції тієї доби */
      room: [3.2, 0.42, 0.03, 0.62], trim: [0.82, 1.4],
      build(k, tb) {
        const s = tb / 20, end = tb + WARP_HOLD;
        const lute = k.group({ wet: 0.3, hp: 90, peak: [[1400, 3, 1]] }), harp = k.group({ wet: 0.75, hp: 160 }), fl = k.group({ wet: 0.6, pan: -0.12 }), ch = k.group({ wet: 0.9, auto: [[0, 0.5], [tb, 1.2]] }), sky = k.group({ wet: 1.2, hp: 1200 });
        'D3 A3 D4 F4 D4 A3 A2 E3 A3 C#4'.split(' ').forEach((n, i) => k.pluck(noteFreq(n), 0.04 + i * 2 * s, 0.24, { kind: 'nylon', to: lute, pan: i % 2 ? 0.2 : -0.2, len: 1.4 }));
        for (let t = tb + 0.05, i = 0; t < end - 0.4; t += 2 * s, i++) k.pluck(noteFreq(['A3', 'C#4', 'E4', 'C#4'][i % 4]), t, 0.22, { kind: 'nylon', to: lute, pan: i % 2 ? 0.2 : -0.2, len: 1.2 });
        k.choir(wsChord('D3 A3 D4 F4'), 0.1, 12 * s + 0.5, 0.03, { a: 0.9, r: 0.6, to: ch });
        k.choir(wsChord('A2 E3 A3 C#4 E4'), 12 * s, end - 12 * s, 0.03, { a: 0.5, r: 0.4, to: ch });
        k.flute(wsLine(0.04, s, 'D5:4 E5:2 F5:4 G5:2 A5:8', WARP_HOLD), 0.075, { a: 0.07, r: 0.3, to: fl, harm: [1, 0.2, 0.07], breath: 0.35, swell: 1.5 });
        const up = 'A3 C#4 E4 G4 A4 C#5 E5 G5 A5 C#6 E6 G6'.split(' ');
        up.forEach((n, i) => k.pluck(noteFreq(n), 12 * s + 8 * s * Math.pow(i / up.length, 0.8), 0.13 + i * 0.006, { kind: 'harp', to: harp, pan: -0.6 + i * 0.1, len: 1.8 }));
        [[0.22, 'A6'], [0.36, 'D7'], [0.48, 'F6'], [0.6, 'A6'], [0.7, 'E7']].forEach(([p, n], i) => k.fm(noteFreq(n), tb * p, 0.03, { ratio: 3.01, index: 0.5, dec: 0.4, to: sky, pan: i % 2 ? 0.5 : -0.5 }));
        k.hiss(0, end, 0.012, { f: 900, q: 0.5, a: 1.2, r: 0.4, sweep: [[2200, tb]], to: sky });
      },
      arrive(k) {
        const harp = k.group({ wet: 0.75, hp: 130 }), ch = k.group({ wet: 0.95, gain: 1.15 }), bell = k.group({ wet: 0.8, hp: 200 });
        k.choir(wsChord('D3 A3 D4 F#4 A4 D5'), 0, 3.3, 0.03, { a: 0.09, r: 2.1, to: ch });
        wsChord('D4 F#4 A4 D5 F#5 A5 D6 F#6').forEach((f, i) => k.pluck(f, i * 0.05, 0.17, { kind: 'harp', to: harp, pan: -0.55 + i * 0.16, len: 2 }));
        k.bell(noteFreq('D5'), 0.015, 0.1, { dec: 2.2, to: bell, parts: [[1, 1, 1], [1.25, 0.3, 0.7], [1.5, 0.3, 0.6], [2, 0.42, 0.45], [3, 0.14, 0.25], [4.2, 0.05, 0.14]] });
        k.bell(noteFreq('A5'), 0.32, 0.045, { dec: 1.5, to: bell, pan: 0.3, parts: [[1, 1, 1], [2, 0.4, 0.45], [3, 0.12, 0.25]] });
        k.taiko(0, 0.32, { f: 73, dec: 0.32, to: k.group({ wet: 0.5 }) });
      }
    },
    { /* 1. РЕТРО, ля: стрічка мотається назад і зупиняється, радіо ловить хвилю, крізь шум проступає бугі; прибуття — клац механізму й кінцівка рок-н-ролу зі «шльопаючою» луною тих студій */
      room: [1.1, 0.6, 0.012, 0.3], trim: [0.8, 1.1],
      build(k, tb) {
        const T1 = tb * 0.6, T2 = tb * 0.68, end = tb + WARP_HOLD, lofi = k.group({ hp: 280, lp: 2700, wet: 0.08 }), radio = k.group({ hp: 420, lp: 2900, wet: 0.12, peak: [[1300, 5, 1]] }), bass = k.group({ wet: 0.08, hp: 50 });
        [[1, 0.065], [2.01, 0.036], [3.03, 0.02]].forEach(([h, v]) => k.osc('sawtooth', 120 * h, 0.05, T1 + 0.3, v, { a: 0.5, r: 0.14, glide: [[900 * h, T1], [130 * h, T1 + 0.26]], lp: [2000], vib: [7, 22], to: lofi }));
        const riff = 'E5 C#5 A4 E5 G5 A5 E5 C#5'.split(' ');
        for (let t = 0.12, st = 0.17, i = 0; t < T1; i++) { const sp = 1 + 1.7 * Math.pow(t / T1, 1.6); k.osc('sawtooth', noteFreq(riff[i % 8]) * sp, t, st * 0.9, 0.085, { a: st * 0.72, r: 0.012, lp: [2100], to: lofi, pan: i % 2 ? 0.14 : -0.14 }); st = Math.max(0.05, st * 0.94); t += st; }   // мелодія задом наперед: повільний наступ і різкий кінець
        for (let t = 0.2, st = 0.09; t < T1; t += st, st = Math.max(0.03, st * 0.975)) k.hiss(t, 0, 0.06, { f: 2100, q: 2, dec: 0.006, to: lofi });
        k.hiss(T1 - 0.12, 0.42, 0.075, { type: 'highpass', f: 1700, a: 0.09, r: 0.16, to: lofi });
        k.osc('sine', 2900, T2, end - T2, 0.014, { a: 0.05, r: 0.2, glide: [[620, (tb - T2) * 0.9]], vib: [6, 30], to: radio });
        k.hiss(T2, end - T2, 0.05, { f: 1900, q: 0.7, a: 0.03, r: 0.3, sweep: [[1100, tb - T2]], to: radio });
        const e = (tb - T2) / 5;
        'A3 C#4 E4 F#4 A4'.split(' ').forEach((n, i) => { k.pluck(noteFreq(n), T2 + i * e, 0.14 + i * 0.05, { kind: 'steel', to: radio, len: 0.5, pdec: 0.09 }); k.pluck(noteFreq(n) / 2, T2 + i * e, 0.09 + i * 0.03, { kind: 'steel', to: radio, len: 0.5, pdec: 0.09 }); k.hiss(T2 + i * e, 0, 0.02 + i * 0.012, { type: 'highpass', f: 5000, dec: 0.012, to: radio }); });
        [2 / 3, 1 / 3].forEach(p => k.snare(tb - e * p, 0.09, { to: radio }));
        let i = 0; for (let t = tb + 0.05; t < end - 0.4; t += e, i++) { const n = 'E3 G#3 B3 C#4 D4 C#4 B3 G#3'.split(' ')[i % 8]; k.pluck(noteFreq(n) * 2, t, 0.2, { kind: 'steel', to: radio, len: 0.5, pdec: 0.09 }); k.pluck(noteFreq(n), t, 0.2, { kind: 'nylon', to: bass, len: 0.5, pdec: 0.1 }); if (i % 2) k.snare(t, 0.09, { to: radio }); else k.hat(t, 0.03, { to: radio, f: 5000 }); }
      },
      arrive(k) {
        const slap = k.echo(0.125, 0.2, 2500, 0.55), gtr = k.group({ wet: 0.28, echo: slap, send: 0.65, hp: 90, peak: [[2400, 3, 1]] }), horn = k.group({ wet: 0.45, echo: slap, send: 0.4, lp: 2500 }), vib = k.group({ wet: 0.5, pan: 0.2 }), kit = k.group({ wet: 0.3 });
        k.hiss(0, 0, 0.3, { type: 'lowpass', f: 1000, dec: 0.014, to: kit }); k.hiss(0.05, 0, 0.1, { type: 'bandpass', f: 1600, dec: 0.01, to: kit });
        k.kick(0, 0.42, { to: kit }); k.snare(0.012, 0.26, { to: kit, dec: 0.1 }); k.hiss(0.015, 0, 0.1, { type: 'highpass', f: 5200, dec: 0.33, to: kit });
        wsChord('A2 E3 A3 C#4 F#4 A4').forEach((f, i) => k.pluck(f, 0.012 + i * 0.011, 0.25, { kind: 'steel', to: gtr, len: 1.9, pdec: 0.45 }));
        k.pluck(noteFreq('A1'), 0.012, 0.42, { kind: 'nylon', to: k.group({ hp: 40, wet: 0.08 }), len: 1.2, pdec: 0.4 });
        wsChord('A3 C#4 E4 F#4').forEach((f, i) => { k.saws(f, 0.015, 0.13, 0.03, { n: 2, spread: 7, a: 0.008, r: 0.04, to: horn, pan: -0.25 + i * 0.16 }); k.saws(f, 0.22, 0.95, 0.034, { n: 2, spread: 7, a: 0.012, r: 0.5, vib: [5.6, 14, 0.25], to: horn, pan: -0.25 + i * 0.16 }); });
        wsChord('A5 C#6 E6').forEach((f, i) => k.osc('sine', f, 0.22 + i * 0.05, 0, 0.055, { dec: 0.48, trem: [5.5, 0.35], to: vib }));
        for (let i = 0; i < 26; i++) k.hiss(0.1 + wsRnd() * 2.4, 0, 0.006 + wsRnd() * 0.022, { type: 'highpass', f: 2800, dec: 0.0018, pan: wsRnd() - 0.5 });   // тріск платівки
      }
    },
    { /* 2. ДИСКО, до мінор: «чотири чверті» в такт миготінню вира, секвенсорний бас із фільтром, що розкривається, струнні, синдруми; прибуття — удар струнних і дзеркальні іскри */
      room: [1.5, 0.55, 0.018, 0.34], trim: [1.15, 1.4],
      build(k, tb) {
        const n = tb > 2.6 ? 6 : 4, bt = tb / n, end = tb + WARP_HOLD, beats = Math.floor(end / bt), echo = k.echo(bt * 0.75, 0.3, 2200, 0.32, true);
        const bass = k.group({ hp: 40, echo, send: 0.12 }), kit = k.group({ wet: 0.08 }), hh = k.group({ pan: 0.1 }), syn = k.group({ wet: 0.5, echo, send: 0.5 });
        const sL = k.group({ lp: 3600, wet: 0.5, pan: -0.55, auto: [[0, 0.35], [tb, 1.1]] }), sR = k.group({ lp: 3600, wet: 0.5, pan: 0.55, auto: [[0, 0.35], [tb, 1.1]] });
        const PAT = [[36, 48, 43, 46], [32, 44, 39, 42], [31, 43, 38, 41]], CH = ['C4 Eb4 G4 C5', 'C4 Eb4 Ab4 C5', 'B3 D4 G4 B4'], chordAt = b => (b >= n - 2 ? 2 : b >= n - 4 ? 1 : 0);
        for (let b = 0; b < beats; b++) {
          const t = b * bt + (b >= n ? 0.05 : 0), c = chordAt(b), up = Math.min(1, t / tb);
          k.kick(t, 0.3 + up * 0.1, { to: kit }); k.hat(t + bt / 2, 0.07 + up * 0.04, { open: 1, to: hh });
          if (b % 2) k.clap(t, 0.16 + up * 0.07, { to: kit });
          if (b >= 2) [0.25, 0.75].forEach(p => k.hat(t + bt * p, 0.034, { to: hh }));
          for (let j = 0; j < 4; j++) { const cut = 320 + 2100 * Math.pow(Math.min(1, (t + j * bt / 4) / tb), 1.6); k.osc('sawtooth', wsMidi(PAT[c][j]), t + j * bt / 4, 0, 0.15, { a: 0.003, dec: 0.08, lp: [cut * 1.8, cut * 0.6, 0.05], q: 4, to: bass, pan: j % 2 ? 0.12 : -0.12 }); }
        }
        [0, n >= 6 ? 2 : 1, n - 2].forEach((b, i, arr) => { const t = b * bt, e = i < 2 ? arr[i + 1] * bt : end; wsChord(CH[i]).forEach(f => { k.saws(f, t, e - t + 0.05, 0.03, { n: 2, spread: 9, a: 0.16, r: 0.14, vib: [5.2, 7, 0.4], to: sL }); k.saws(f, t, e - t + 0.05, 0.03, { n: 2, spread: 13, a: 0.16, r: 0.14, vib: [4.7, 7, 0.4], to: sR }); }); });
        for (let i = 0; i < 4; i++) k.osc('sine', 1150 - i * 170, tb - bt + i * bt / 4, 0, 0.1, { a: 0.002, dec: 0.06, glide: [[170, 0.17]], to: syn, pan: i % 2 ? 0.45 : -0.45 });
        'C5 D5 Eb5 F5 G5 Ab5 B5 C6'.split(' ').forEach((nn, i) => k.saws(noteFreq(nn), tb - bt * 1.5 + i * bt * 1.5 / 8, bt * 0.2, 0.03, { n: 2, spread: 8, a: 0.012, r: 0.04, to: sR }));
      },
      arrive(k) {
        const str = k.group({ lp: 1200, wet: 0.7, sweep: [[0, 1200], [0.16, 5200], [1.9, 1900]] }), kit = k.group({ wet: 0.28 }), brass = k.group({ lp: 3000, wet: 0.45 }), glit = k.group({ wet: 0.8, hp: 900 });
        k.kick(0, 0.42, { to: kit, dec: 0.14 }); k.clap(0, 0.3, { to: kit, dec: 0.1 }); k.hiss(0, 0, 0.12, { type: 'highpass', f: 5000, dec: 0.5, to: kit });
        wsChord('C3 G3 Bb3 Eb4 G4 D5').forEach((f, i) => k.saws(f, 0, 0, 0.042, { n: 3, spread: 12, a: 0.008, dec: 0.75, to: str, pan: -0.5 + i * 0.2 }));
        wsChord('C4 Eb4 G4 Bb4').forEach(f => k.saws(f, 0, 0.26, 0.036, { n: 2, spread: 6, a: 0.006, r: 0.09, to: brass }));
        k.osc('sawtooth', noteFreq('C3'), 0, 0, 0.15, { dec: 0.3, glide: [[noteFreq('C2'), 0.22]], lp: [1700, 280, 0.2], q: 3, to: k.group({ hp: 40 }) });
        'C6 Eb6 G6 Bb6 C7 Eb7 G7'.split(' ').forEach((n, i) => k.fm(noteFreq(n), 0.06 + i * 0.07, 0.065, { ratio: 3.5, index: 0.9, dec: 0.32, mdec: 0.08, to: glit, pan: i % 2 ? 0.6 : -0.6 }));
      }
    },
    { /* 3. АРКАДИ, ля мінор: чесні голоси приставки. Марш прибульців прискорюється, постріли, вибухи, монетка падає в приймач, далі LEVEL UP; прибуття — злет акорду й дощик пікселів */
      room: null, trim: [0.85, 1.25],
      build(k, tb) {
        const s = tb / 32, end = tb + WARP_HOLD, chipBus = k.group({ lp: k.pix ? 6000 : 7500, hp: 60 }), echo = k.echo(s * 1.5, 0.22, 3200, 0.22), lead = k.group({ to: chipBus, echo, send: 0.5, pan: -0.1 }), side = k.group({ to: chipBus, pan: 0.14 }), low = k.group({ to: chipBus }), fx = k.group({ to: chipBus });
        const chip = (d, f, t, dur, v, o = {}) => (k.pix ? k.fm(f, t, v * 1.5, { ratio: d > 0.3 ? 1 : 2, index: d * 5, dur: Math.max(dur, 0.02), mdec: 0.09, keep: 0.25, r: 0.02, a: 0.003, to: o.to, pan: o.pan }) : k.osc(k.pulse(d), f, t, dur, v, Object.assign({ a: 0.002, r: 0.012 }, o)));
        const tri = (f, t, dur, v) => (k.pix ? k.fm(f, t, v * 1.1, { ratio: 1, index: 1.1, dur, mdec: 0.05, keep: 0.1, r: 0.02, to: low }) : k.osc(k.tri8(), f, t, dur, v, { a: 0.002, r: 0.012, to: low }));
        [[0, 'A2'], [4, 'G2'], [8, 'F2'], [12, 'E2'], [15, 'A2'], [18, 'G2'], [20, 'F2']].forEach(([st, n]) => { tri(noteFreq(n), st * s, s * 1.5, 0.13); chip(0.5, noteFreq(n), st * s, s * 1.2, 0.055, { to: low }); });   // четвірка нот маршу, щоразу швидше
        for (let st = 2; st < 21; st += 3) k.osc(k.pix ? k.pulse(0.25) : k.pulse(0.125), 1760, st * s, 0.13, 0.065, { a: 0.001, r: 0.02, glide: [[230, 0.12]], to: fx, pan: st % 2 ? 0.2 : -0.2 });
        [12.6, 14.7, 16.8, 18.9].forEach((st, i) => k.crunch(st * s, 0.05, 0.35 - i * 0.05, { dec: 0.055, to: fx, pan: i % 2 ? -0.25 : 0.25 }));
        chip(0.25, noteFreq('B5'), 20 * s, 0.075, 0.12, { to: lead }); chip(0.25, noteFreq('E6'), 20 * s + 0.075, 0.33, 0.12, { to: lead });
        const up = [['A4', 'C5', 'E5', 'A5'], ['F4', 'A4', 'C5', 'F5'], ['G4', 'B4', 'D5', 'G5']], lens = [[22, 26], [26, 29], [29, 32]];
        lens.forEach(([a, b], c) => { tri(noteFreq(['A2', 'F2', 'G2'][c]), a * s, (b - a) * s * 0.95, 0.13); for (let st = a, i = 0; st < b; st += 0.5, i++) { const f = noteFreq(up[c][i % 4]) * (i >= 4 ? 2 : 1); chip(0.25, f, st * s, s * 0.46, 0.13, { to: lead }); chip(0.125, f * 0.5, (st + 0.5) * s, s * 0.46, 0.07, { to: side }); } });
        [22, 26, 29].forEach(st => k.crunch(st * s, 0.09, 0.2, { dec: 0.035, to: fx })); [24, 28, 30, 31, 31.5].forEach(st => k.crunch(st * s, 0.06, 0.75, { dec: 0.045, to: fx }));
        let i = 0; for (let t = tb + 0.05; t < end - 0.3; t += s / 2, i++) { const f = noteFreq(['E5', 'G#5', 'B5', 'E6'][i % 4]); chip(0.25, f, t, s * 0.46, 0.11, { to: lead }); if (i % 4 === 0) tri(noteFreq('E2'), t, s * 1.8, 0.12); if (i % 2 === 0) k.crunch(t, 0.05, 0.75, { dec: 0.03, to: fx }); }
      },
      arrive(k) {
        const chipBus = k.group({ lp: k.pix ? 6000 : 7500, hp: 60 }), echo = k.echo(0.15, 0.24, 3000, 0.24), lead = k.group({ to: chipBus, echo, send: 0.55, pan: -0.08 }), low = k.group({ to: chipBus }), fx = k.group({ to: chipBus }), sp = k.group({ to: chipBus, echo, send: 0.4 });
        const chip = (d, f, t, dur, v, o = {}) => (k.pix ? k.fm(f, t, v * 1.5, { ratio: d > 0.3 ? 1 : 2, index: d * 5, dur: Math.max(dur, 0.02), mdec: 0.09, keep: 0.25, r: o.r || 0.02, a: 0.003, to: o.to, pan: o.pan }) : k.osc(k.pulse(d), f, t, dur, v, Object.assign({ a: 0.002, r: 0.012 }, o)));
        'A5 C6 E6 A6'.split(' ').forEach((n, i) => { chip(0.25, noteFreq(n), i * 0.05, 0.05, 0.12, { to: lead }); chip(0.5, noteFreq(n) / 2, i * 0.05, 0.05, 0.07, { to: lead }); });
        chip(0.25, noteFreq('C7'), 0.2, 0.62, 0.1, { to: lead, r: 0.3, vib: [6.5, 14, 0.2] }); chip(0.5, noteFreq('A5'), 0.2, 0.62, 0.075, { to: lead, r: 0.3 }); chip(0.125, noteFreq('E6'), 0.2, 0.62, 0.06, { to: lead, r: 0.3 });
        [['A3', 0, 0.1], ['A2', 0.1, 0.1], ['A3', 0.2, 0.1], ['A2', 0.3, 0.5]].forEach(([n, t, d]) => (k.pix ? k.fm(noteFreq(n), t, 0.16, { ratio: 1, index: 1.1, dur: d, mdec: 0.05, keep: 0.1, r: 0.04, to: low }) : k.osc(k.tri8(), noteFreq(n), t, d, 0.14, { r: 0.04, to: low })));
        k.crunch(0, 0.14, 0.95, { dec: 0.2, to: fx }); k.crunch(0, 0.14, 0.16, { dec: 0.05, to: fx });
        const pent = 'E7 C7 A6 G6 E6 C6 A5 G5 E5 C5'.split(' ');                // пікселі сиплються згори вниз
        pent.forEach((n, i) => { const t = 0.34 + i * 0.075 + wsRnd() * 0.02; k.osc(k.pulse(0.125), noteFreq(n), t, 0.045, 0.055 * (1 - i * 0.05), { a: 0.001, r: 0.012, to: sp, pan: wsRnd() * 1.2 - 0.6 }); });
      }
    },
    { /* 4. ІНТЕРНЕТ, ля мінор: модем набирає номер і пищить (приглушено, як із телефонної лінії), вікна-реклами вискакують нота за нотою, євроденс-пили й хлопки розганяються; прибуття — «з'єднано» і сторінка вантажиться зліва направо */
      room: [1.3, 0.6, 0.015, 0.36], trim: [0.85, 1.4],
      build(k, tb) {
        const u = tb / 3.256, s = tb / 30, end = tb + WARP_HOLD, tel = k.group({ hp: 330, lp: 3100, wet: 0.05, auto: [[1.55 * u, 1], [tb, 0.35]] }), pop = k.group({ wet: 0.22, hp: 200 }), sw = k.group({ lp: 450, lq: 1.6, wet: 0.25, sweep: [[13 * s, 450], [tb, 6200]] }), kit = k.group({ wet: 0.12 }), rise = k.group({ wet: 0.15 });
        [[941, 1336], [697, 1209], [770, 1336], [852, 1477], [697, 1336], [770, 1477], [941, 1209]].forEach(([a, b], i) => { const t = 0.05 + i * 0.09 * u; k.osc('sine', a, t, 0.062 * u, 0.042, { a: 0.007, r: 0.007, to: tel }); k.osc('sine', b, t, 0.062 * u, 0.042, { a: 0.007, r: 0.007, to: tel }); });
        k.osc('sine', 2100, 0.74 * u, 0.42 * u, 0.03, { a: 0.012, r: 0.02, to: tel });
        const warble = (t0, len, fs, step, v) => { const steps = []; for (let t = 0, i = 0; t < len; t += step, i++) steps.push([t, fs[(i * 7 + (wsRnd() * 3 | 0)) % fs.length]]); k.osc('sine', fs[0], t0, len, v, { a: 0.01, r: 0.02, steps, to: tel }); };
        warble(1.18 * u, 0.4 * u, [1270, 1070, 2225, 2025], 0.03, 0.036);
        k.hiss(1.58 * u, tb - 1.58 * u + 0.1, 0.075, { f: 1750, q: 0.9, a: 0.02, r: 0.08, to: tel });
        'A4 C5 D5 E5 G5 A5 C6'.split(' ').forEach((n, i) => k.fm(noteFreq(n), (0.14 + i * 0.065) * tb / 0.74, 0.13, { ratio: 2, index: 1.5, dec: 0.1, mdec: 0.03, to: pop, pan: i % 2 ? 0.42 : -0.42 }));
        const CH = [[14, 22, 'A3 C4 E4'], [22, 26, 'A3 C4 F4'], [26, 30, 'B3 D4 G4']];
        CH.forEach(([a, b, c]) => { for (let st = a; st < b; st++) wsChord(c).forEach(f => k.saws(f, st * s, s * 0.82, 0.03 + st * 0.0013, { n: 3, spread: 14, a: 0.004, r: 0.03, to: sw })); });
        for (let st = 14; st < 30; st += 4) k.kick(st * s, 0.3, { to: kit });
        for (let st = 14; st < 30; st += st < 22 ? 2 : st < 26 ? 1 : 0.5) k.clap(st * s, 0.05 + st * 0.0042, { to: kit, dec: 0.03 });
        k.hiss(1.4 * u, tb - 1.4 * u + 0.04, 0.05, { f: 500, q: 0.9, a: (tb - 1.4 * u) * 0.8, r: 0.03, sweep: [[7000, tb - 1.4 * u]], to: rise });
        let i = 0; for (let t = tb + 0.05; t < end - 0.3; t += s, i++) { wsChord('B3 D4 G4').forEach(f => k.saws(f, t, s * 0.8, 0.05, { n: 2, spread: 14, a: 0.004, r: 0.03, to: sw })); if (i % 4 === 0) k.kick(t, 0.3, { to: kit }); k.clap(t, 0.13, { to: kit, dec: 0.025 }); }
      },
      arrive(k) {
        const sw = k.group({ lp: 6500, wet: 0.6 }), kit = k.group({ wet: 0.25 }), glass = k.group({ wet: 0.55, hp: 500 }), echo = k.echo(0.165, 0.28, 3600, 0.3, true), page = k.group({ wet: 0.3, echo, send: 0.35, hp: 300 });
        k.kick(0, 0.4, { to: kit, dec: 0.13 }); k.clap(0, 0.32, { to: kit, dec: 0.1 }); k.hiss(0, 0, 0.07, { type: 'highpass', f: 6000, dec: 0.3, to: kit });
        wsChord('A3 C4 E4 A4 C5 E5').forEach((f, i) => k.saws(f, 0, 0, 0.034, { n: 5, spread: 22, a: 0.006, dec: 0.32, to: sw, pan: -0.4 + i * 0.16 }));
        k.osc('triangle', noteFreq('A2'), 0, 0, 0.17, { dec: 0.2, to: k.group({ hp: 45 }) });
        k.fm(noteFreq('E6'), 0.02, 0.12, { ratio: 3.5, index: 1.1, dec: 0.28, mdec: 0.07, to: glass, pan: -0.15 }); k.fm(noteFreq('A6'), 0.17, 0.125, { ratio: 3.5, index: 1.1, dec: 0.5, mdec: 0.07, to: glass, pan: 0.15 });
        'A4 C5 E5 G5 A5 C6 E6 G6 A6'.split(' ').forEach((n, i) => k.fm(noteFreq(n), 0.12 + i * 0.075, 0.08, { ratio: 2, index: 1.1, dec: 0.15, mdec: 0.04, to: page, pan: -0.85 + i * 0.21 }));
      }
    },
    { /* 5. ЕКО, соль мажор: вітер у листі, пташки, краплі, укулеле і свист ведуть мелодію епохи, тупіт і плескання; прибуття — розквіт: мажорний перебір, калімба, листя пролітає над головою */
      room: [1.7, 0.55, 0.022, 0.42], trim: [1.1, 1.35],
      build(k, tb) {
        const e = tb / 12, end = tb + WARP_HOLD, uke = k.group({ wet: 0.2, hp: 170, peak: [[2100, 2, 1]] }), wh = k.group({ wet: 0.55, pan: 0.14 }), birds = k.group({ wet: 0.75, hp: 1400 }), kit = k.group({ wet: 0.22 }), air = k.group({ wet: 0.2 }), drop = k.group({ wet: 0.7 });
        k.hiss(0, end, 0.075, { f: 430, q: 1.2, a: tb * 0.5, r: 0.4, sweep: [[1250, tb * 0.72], [820, tb], [1050, end - 0.05]], to: air, pan: -0.32 });
        k.hiss(0, end, 0.036, { f: 1500, q: 1, a: tb * 0.7, r: 0.4, sweep: [[3300, tb], [2300, end - 0.05]], to: air, pan: 0.32 });
        for (let i = 0; i < 16; i++) k.hiss(0.15 + wsRnd() * (end - 0.6), 0, 0.01 + wsRnd() * 0.016, { type: 'highpass', f: 3200 + wsRnd() * 2400, dec: 0.02 + wsRnd() * 0.03, pan: wsRnd() * 1.6 - 0.8, to: air });
        const strum = (c, t, v, up) => { const ns = wsChord(c); (up ? ns.slice().reverse() : ns).forEach((f, i) => k.pluck(f, t + i * 0.014, v * (up ? 0.72 : 1), { kind: 'uke', to: uke, len: 0.85, pdec: 0.14 })); };
        const G = 'G4 D4 G4 B4', DD = 'A4 D4 F#4 A4';
        [[0, G, 0], [2, G, 0], [3, G, 1], [5, G, 1], [6, G, 0], [7, G, 1], [8, DD, 0], [10, DD, 0], [11, DD, 1]].forEach(([p, c, up]) => strum(c, p * e, 0.11 + p * 0.009, up));
        k.flute(wsLine(0, e / 2, 'D5:2 G5:2 B5:4 A5:2 G5:2 D5:4 F#5:2 A5:2 D6:4', WARP_HOLD), 0.08, { a: 0.05, r: 0.2, to: wh, breath: 0.2, vib: [5.6, 16, 0.25], swell: 1.7, glideT: 0.03 });
        const chirp = (t, pan, kind) => {
          const go = (f0, f1, d, tt, v) => k.osc('sine', f0, t + tt, d, v, { a: 0.008, r: 0.014, glide: [[f1, d]], to: birds, pan });
          if (kind === 0) [0, 0.11, 0.22].forEach(tt => go(2900, 3900, 0.07, tt, 0.05));
          else if (kind === 1) { go(3500, 2700, 0.06, 0, 0.05); go(2700, 4200, 0.11, 0.08, 0.055); }
          else for (let j = 0; j < 5; j++) go(j % 2 ? 3700 : 4300, j % 2 ? 4300 : 3700, 0.035, j * 0.042, 0.035);
        };
        [[0.1, -0.6, 0], [0.26, 0.5, 2], [0.42, -0.3, 1], [0.56, 0.65, 0], [0.7, -0.55, 2], [0.82, 0.3, 1], [1.12, -0.5, 0], [1.3, 0.55, 2]].forEach(([p, pan, kd]) => chirp(tb * p, pan, kd));
        [0.18, 0.47, 0.65].forEach((p, i) => k.osc('sine', 620 + i * 170, tb * p, 0, 0.055, { a: 0.002, dec: 0.028, glide: [[1450 + i * 240, 0.05]], to: drop, pan: i % 2 ? 0.3 : -0.3 }));
        [4, 8].forEach(p => k.kick(p * e, 0.26, { f: 100, f1: 52, dec: 0.12, to: kit })); [6, 10].forEach(p => k.clap(p * e, 0.12, { to: kit, dec: 0.08 }));
        for (let t = tb + 0.05, i = 0; t < end - 0.3; t += e, i++) { strum(DD, t, 0.16, i % 2); if (i % 4 === 0) k.kick(t, 0.25, { f: 100, f1: 52, dec: 0.12, to: kit }); if (i % 4 === 2) k.clap(t, 0.12, { to: kit, dec: 0.08 }); }
      },
      arrive(k) {
        const uke = k.group({ wet: 0.35, hp: 110, peak: [[2100, 2, 1]] }), kal = k.group({ wet: 0.55, hp: 240 }), kit = k.group({ wet: 0.28 }), pad = k.group({ wet: 0.7, lp: 1600 }), wh = k.group({ wet: 0.6, pan: 0.14 }), birds = k.group({ wet: 0.75, hp: 1400 });
        k.kick(0, 0.32, { f: 100, f1: 52, dec: 0.16, to: kit }); k.clap(0, 0.2, { to: kit, dec: 0.1 });
        wsChord('G3 D4 G4 B4 D5 G5').forEach((f, i) => k.pluck(f, i * 0.022, 0.23, { kind: 'nylon', to: uke, len: 1.7, pan: -0.3 + i * 0.12, pdec: 0.4 }));
        wsChord('G5 B5 D6 G6 B6').forEach((f, i) => k.fm(f, 0.14 + i * 0.085, 0.12 - i * 0.008, { ratio: 5.04, index: 0.7, dec: 0.36, mdec: 0.025, to: kal, pan: i % 2 ? 0.4 : -0.4 }));
        wsChord('G2 D3 G3 B3').forEach(f => k.osc('triangle', f, 0, 2.2, 0.075, { a: 0.1, r: 1.4, to: pad }));
        k.hiss(0, 1.15, 0.13, { f: 500, q: 1, a: 0.25, r: 0.7, sweep: [[3400, 0.5], [800, 1.15]], move: [-0.7, 0.7], to: k.group({ wet: 0.3 }) });
        for (let i = 0; i < 12; i++) k.hiss(0.05 + wsRnd() * 0.95, 0, 0.012 + wsRnd() * 0.02, { type: 'highpass', f: 3600 + wsRnd() * 2000, dec: 0.02 + wsRnd() * 0.04, pan: -0.8 + i * 0.14 });
        k.flute(wsLine(0.12, 0.21, 'G5:1 B5:1 D6:6'), 0.085, { a: 0.03, r: 0.75, to: wh, breath: 0.2, vib: [5.6, 20, 0.2], glideT: 0.03 });
        [[1.5, 2900, 3900], [1.61, 2900, 4100], [1.74, 3000, 4400]].forEach(([t, a, b]) => k.osc('sine', a, t, 0.08, 0.04, { a: 0.008, r: 0.016, glide: [[b, 0.08]], to: birds, pan: 0.5 }));
      }
    },
    { /* 6. КОСМОС, ре мінор: гул двигуна, м'які синт-струнні, сонар, планети пролітають із боку в бік, тема епохи звучить над усім, накопичувач стрибка наростає; прибуття — гіперстрибок і широкий акорд */
      room: [3.6, 0.38, 0.04, 0.68], trim: [0.92, 1.45],
      build(k, tb) {
        const end = tb + WARP_HOLD, drone = k.group({ lp: 120, lq: 1.2, sweep: [[0, 120], [tb, 800]] }), padG = k.group({ lp: 800, wet: 0.85, sweep: [[0, 800], [tb, 2600]] }), lead = k.group({ lp: 3000, wet: 0.8, pan: -0.08 }), ping = k.echo(0.28, 0.42, 2600, 0.34, true), sonar = k.group({ wet: 0.5, echo: ping, send: 0.7 }), pass = k.group({ wet: 0.4 }), coil = k.group({ wet: 0.35, hp: 150 });
        [[73.42, 0.05, -6], [73.42, 0.05, 6], [146.83, 0.04, 3]].forEach(([f, v, det]) => k.osc('sawtooth', f, 0, end, v, { a: 0.8, r: 0.4, det, to: drone }));
        k.osc('sine', 73.42, 0, end, 0.07, { a: 0.8, r: 0.4 });
        [[0.02, 0.35, 'D3 A3 D4 F4'], [0.3, 0.6, 'Bb2 F3 Bb3 D4'], [0.55, 0.8, 'G2 D3 G3 Bb3'], [0.76, 2, 'A2 E3 A3 C#4']].forEach(([a, b, c]) => { const t = a * tb, d = Math.min(b * tb, end) - t + 0.25; wsChord(c).forEach(f => k.saws(f, t, d, 0.048, { n: 2, spread: 8, a: 0.34, r: 0.25, vib: [4.8, 9, 0.5], to: padG })); });
        k.flute(wsLine(0.5, tb / 20, 'A5:6 D6:2 F6:4 E6:2 D6:2'), 0.075, { a: 0.07, r: 0.18, to: lead, harm: [1, 0.45, 0.28, 0.16, 0.09], vib: [4.8, 14, 0.4], glideT: 0.07, swell: 1.3 });
        [0.14, 0.38, 0.62].forEach(p => k.osc('sine', 1175, tb * p, 0, 0.075, { a: 0.003, dec: 0.1, to: sonar }));
        for (let i = 0; i < 9; i++) k.osc(k.pulse(0.25), 1800 + (wsRnd() * 5 | 0) * 300, 0.12 + i * tb * 0.06, 0.03, 0.009, { a: 0.002, r: 0.008, to: sonar, pan: wsRnd() - 0.5 });
        [[0.34, -0.85, 0.85], [0.56, 0.85, -0.85], [0.78, -0.85, 0.85]].forEach(([p, a, b]) => { const t = tb * p - 0.32; k.hiss(t, 0.82, 0.13, { f: 280, q: 1.4, a: 0.32, r: 0.46, sweep: [[1900, 0.36], [240, 0.82]], move: [a, b], to: pass }); k.osc('sine', 210, t + 0.14, 0.62, 0.05, { a: 0.18, r: 0.3, glide: [[92, 0.62]], to: pass }); });
        const t1 = tb * 0.42, len = tb - t1, tq = { trem: [5, 0.45], tremTo: [30, len], to: coil };      // накопичувач: тон і биття наростають
        k.osc('sine', 170, t1, end - t1, 0.05, Object.assign({ a: len * 0.8, r: 0.3, glide: [[2200, len], [2300, end - t1]] }, tq));
        k.osc('triangle', 85, t1, end - t1, 0.05, Object.assign({ a: len * 0.8, r: 0.3, glide: [[1100, len], [1150, end - t1]] }, tq));
        k.hiss(t1, end - t1, 0.05, { f: 420, q: 1.1, a: len * 0.9, r: 0.3, sweep: [[6000, len]], to: coil });
      },
      arrive(k) {
        const hit = k.group({ wet: 0.6 }), brass = k.group({ lp: 500, lq: 1.1, wet: 0.9, sweep: [[0, 500], [0.2, 3400], [2.2, 1100]] }), glass = k.group({ wet: 0.95, hp: 700 }), cr = k.group({ wet: 0.75 });
        k.osc('sine', 96, 0, 0, 0.34, { a: 0.003, dec: 0.5, glide: [[38, 0.5]], to: hit }); k.osc('sine', 196, 0, 0, 0.24, { a: 0.003, dec: 0.14, glide: [[70, 0.2]], to: hit });
        k.hiss(0, 0, 0.24, { type: 'lowpass', f: 2000, dec: 0.2, to: hit }); k.hiss(0, 0, 0.09, { type: 'highpass', f: 3200, dec: 0.75, to: cr });
        wsChord('D2 A2 D3 A3 D4 F4 A4').forEach((f, i) => k.saws(f, 0, 0, 0.05, { n: 2, spread: 9, a: 0.02, dec: 0.85, vib: [4.6, 8, 0.6], to: brass, pan: -0.45 + i * 0.15 }));
        'D6 F6 A6 D7 F7'.split(' ').forEach((n, i) => k.fm(noteFreq(n), 0.28 + i * 0.1, 0.085, { ratio: 3.5, index: 0.8, dec: 0.42, mdec: 0.06, to: glass, pan: i % 2 ? 0.65 : -0.65 }));
      }
    },
    { /* 7. НЕОН, до мінор: арпеджіо шістнадцятими з луною, октавний бас, що «дихає» від бочки, лазери на кожне кільце тунелю, малий із обрізаним відлунням вісімдесятих; прибуття — важкий спуск і широка стіна пил, неон ще гуде */
      room: [1.6, 0.6, 0.02, 0.36], trim: [1.15, 1.45],
      build(k, tb) {
        const s = tb / 24, end = tb + WARP_HOLD, echo = k.echo(s * 3, 0.36, 3000, 0.3, true);
        const PUMP = []; const arp = k.group({ lp: 800, lq: 2.4, wet: 0.12, echo, send: 0.45, sweep: [[0, 800], [tb, 5400]] }), pump = k.group({ wet: 0.25, auto: PUMP }), pad = k.group({ lp: 700, lq: 0.9, to: pump, sweep: [[0, 700], [tb, 4300]] }), bass = k.group({ lp: 460, lq: 2, to: pump }), kit = k.group({}), zap = k.group({ wet: 0.2, echo, send: 0.5, hp: 180 }), sn = (t, v, dec) => { k.snare(t, v, { f: 2000, dec }); k.hiss(t + 0.006, 0.2, v * 0.3, { f: 1800, q: 0.5, a: 0.006, r: 0.012 }); };
        const PLAN = [[0, 8, 'C4 Eb4 G4 Bb4 C5', 'C2', 'C3 Eb3 G3 C4'], [8, 16, 'Ab3 C4 Eb4 G4 Ab4', 'Ab1', 'Ab2 C3 Eb3 Ab3'], [16, 20, 'F3 Ab3 C4 Eb4 F4', 'F1', 'F2 Ab2 C3 F3'], [20, 24, 'G3 B3 D4 F4 G4', 'G1', 'G2 B2 D3 G3']];
        const ARP = [0, 1, 2, 3, 4, 3, 2, 1];
        const bar = (st0, st1, ar, b, ch, vUp) => {
          wsChord(ch).forEach(f => k.saws(f, st0 * s, (st1 - st0) * s + 0.02, 0.02, { n: 3, spread: 16, a: 0.03, r: 0.03, to: pad }));
          const ns = wsChord(ar), bf = noteFreq(b);
          for (let st = st0; st < st1; st++) { k.osc('sawtooth', ns[ARP[Math.floor(st) % 8]], st * s, 0, 0.11 + vUp * 0.04, { a: 0.002, dec: 0.075, to: arp, pan: st % 2 ? 0.18 : -0.18 }); if (Math.floor(st) % 2 === 1) k.saws(Math.floor(st) % 4 === 1 ? bf * 2 : bf * 4, st * s, s * 0.9, 0.05, { n: 2, spread: 6, a: 0.003, r: 0.02, to: bass }); }
        };
        PLAN.forEach(([a, b, ar, bs, ch]) => bar(a, b, ar, bs, ch, a / 24));
        const HOLD_ST = Math.floor(WARP_HOLD / s);
        bar(24.4, 24.4 + HOLD_ST, 'G3 B3 D4 F4 G4', 'G1', 'G2 B2 D3 G3', 1);
        for (let st = 0; st < 24 + HOLD_ST; st += 4) { const t = st * s; if (st >= 8) k.kick(t, 0.3, { to: kit, f: 150, dec: 0.1 }); PUMP.push([Math.max(0, t - 0.005), 1], [t, 0.32], [t + s * 2.4, 1]); }
        [12, 20].forEach(st => sn(st * s, 0.26, 0.05));
        for (let st = 24 - 4, i = 0; st < 24 + HOLD_ST; st += st < 24 ? 1 : 0.5, i++) sn(st * s, Math.min(0.15, 0.07 + i * 0.012), 0.03);
        [6, 10, 14, 17, 19, 21, 22, 23].forEach((st, i) => k.osc('square', 2300, st * s, 0.15, 0.024, { a: 0.001, r: 0.03, glide: [[190, 0.14]], lp: [4200], to: zap, pan: i % 2 ? 0.55 : -0.55 }));
        k.hiss(0, end, 0.055, { f: 300, q: 1, a: tb * 0.85, r: 0.3, sweep: [[7500, tb]], to: k.group({ wet: 0.12 }) });
        k.osc('sawtooth', noteFreq('C3'), tb * 0.4, end - tb * 0.4, 0.028, { a: tb * 0.5, r: 0.3, glide: [[noteFreq('C6'), tb * 0.6], [noteFreq('D6'), end - tb * 0.4]], lp: [3400], to: k.group({ wet: 0.2 }) });
      },
      arrive(k) {
        const wall = k.group({ lp: 600, wet: 0.65, sweep: [[0, 600], [0.2, 7000], [2, 1700]] }), hit = k.group({}), echo = k.echo(0.21, 0.42, 3200, 0.34, true), arp = k.group({ lp: 4400, wet: 0.2, echo, send: 0.55 }), buzz = k.group({ hp: 700, lp: 3800, wet: 0.12 });
        k.osc('sine', 118, 0, 0, 0.26, { a: 0.003, dec: 0.42, glide: [[40, 0.4]], to: hit }); k.kick(0, 0.24, { to: hit, f: 165, dec: 0.1 });
        k.snare(0, 0.5, { f: 1900, dec: 0.08 }); k.hiss(0.006, 0.3, 0.16, { f: 1700, q: 0.5, a: 0.006, r: 0.014 });
        wsChord('C3 C4 G4 C5 Eb5 G5 Bb5').forEach((f, i) => k.saws(f, 0, 0, 0.034, { n: 7, spread: 24, a: 0.006, dec: 0.7, to: wall, pan: -0.55 + i * 0.18 }));
        'C5 G5 Eb5 C6 G5 Eb6 C6 G6'.split(' ').forEach((n, i) => k.osc('sawtooth', noteFreq(n), 0.04 + i * 0.105, 0, 0.1 - i * 0.005, { a: 0.002, dec: 0.08, to: arp, pan: i % 2 ? 0.3 : -0.3 }));
        k.osc('sawtooth', 120, 0.1, 0.95, 0.024, { a: 0.03, r: 0.5, trem: [37, 0.6], to: buzz });   // гудіння неонової трубки
      }
    },
    { /* 8. ЯПОНІЯ, ре (гама йо): вітер, сякухаті з ковзанням на звук, кото з відтягуванням струни, тайко прискорюється, сухі клацання дерев'яних хьосіґі; прибуття — храмовий дзвін, удар одайко, «розсип» кото й м'який акорд сьо */
      room: [2.6, 0.38, 0.03, 0.56], trim: [0.72, 1.3],
      build(k, tb) {
        const b = tb / 5.2, end = tb + WARP_HOLD, koto = k.group({ wet: 0.34, hp: 120, peak: [[2800, 3, 1.2]] }), sh = k.group({ wet: 0.7, pan: 0.12 }), tk = k.group({ wet: 0.4 }), wood = k.group({ wet: 0.5, hp: 700 }), air = k.group({ wet: 0.15 }), chime = k.group({ wet: 0.8, hp: 1800 });
        k.hiss(0, end, 0.03, { f: 620, q: 0.9, a: tb * 0.6, r: 0.4, sweep: [[1500, tb]], to: air, pan: -0.25 });
        k.flute(wsLine(0.12, b / 4, 'D5:3 E5:3 G5:4 A5:6', tb - 0.12 - 4 * b + WARP_HOLD), 0.11, { a: 0.14, r: 0.3, to: sh, harm: [1, 0.32, 0.14, 0.05], scoop: 0.945, glideT: 0.11, vib: [4.4, 16, 0.5], breath: 0.75, swell: 1.25 });
        [['D4', 0.05], ['A4', 0.5], ['G4', 1], ['D4', 1.5], ['E4', 2], ['B4', 2.5], ['A4', 3]].forEach(([n, p], i) => k.pluck(noteFreq(n), p * b, 0.33, { kind: 'koto', to: koto, pan: i % 2 ? 0.25 : -0.25, len: 1.5, bend: i % 3 === 1 ? [0.12, 1.055, 0.09] : null, pdec: 0.3 }));
        const up = 'D4 E4 G4 A4 B4 D5 E5 G5 A5 B5 D6'.split(' ');
        up.forEach((n, i) => k.pluck(noteFreq(n), tb - b * 1.4 + b * 1.4 * Math.pow(i / up.length, 0.75), 0.22 + i * 0.01, { kind: 'koto', to: koto, pan: -0.5 + i * 0.1, len: 1.3, pdec: 0.25 }));
        [0.05, 0.34, 0.56, 0.71, 0.81, 0.88, 0.93, 0.97].forEach((p, i) => k.taiko(tb * p, 0.14 + i * 0.03, { f: 92, to: tk, dec: 0.22 }));
        [0.71, 0.81, 0.88, 0.93, 0.96, 0.98].forEach((p, i) => k.taiko(tb * p + b * 0.25, 0.08 + i * 0.01, { f: 130, dec: 0.1, to: tk }));
        [0.68, 0.79, 0.87, 0.92, 0.955, 0.98].forEach((p, i) => { const t = tb * p, v = 0.05 + i * 0.014; k.osc('triangle', 1900, t, 0, v, { dec: 0.009, to: wood, pan: 0.1 }); k.osc('sine', 3100, t, 0, v * 0.5, { dec: 0.006, to: wood, pan: 0.1 }); k.hiss(t, 0, v * 0.7, { f: 2700, q: 1.6, dec: 0.006, to: wood, pan: 0.1 }); });
        for (let t = tb + 0.05, i = 0; t < end - 0.3; t += b / 4, i++) { k.taiko(t, i % 4 === 0 ? 0.24 : 0.14, { f: i % 4 === 0 ? 92 : 130, dec: 0.13, to: tk }); if (i % 4 === 2) k.pluck(noteFreq('A4'), t, 0.2, { kind: 'koto', to: koto, len: 1, pdec: 0.25 }); }
        for (let i = 0; i < 7; i++) k.fm(3200 + wsRnd() * 3000, tb * (0.2 + i * 0.11), 0.018, { ratio: 2.76, index: 0.5, dec: 0.3, mdec: 0.05, to: chime, pan: wsRnd() * 1.4 - 0.7 });
      },
      arrive(k) {
        const tk = k.group({ wet: 0.55 }), koto = k.group({ wet: 0.42, hp: 110, peak: [[2800, 3, 1.2]] }), bell = k.group({ wet: 0.7 }), sho = k.group({ wet: 0.85, lp: 2400 }), chime = k.group({ wet: 0.8, hp: 1800 });
        k.taiko(0, 0.46, { f: 72, dec: 0.42, to: tk }); k.hiss(0, 0, 0.16, { type: 'lowpass', f: 1800, dec: 0.1, to: tk });
        const f = noteFreq('D3'); k.bell(f, 0.012, 0.15, { dec: 3.2, to: bell, det: 0, parts: [[1, 1, 1], [1.005, 0.7, 0.9], [2.01, 0.42, 0.62], [2.75, 0.3, 0.42], [3.76, 0.18, 0.3], [5.4, 0.09, 0.18]] });
        'D6 B5 A5 G5 E5 D5 B4 A4 G4 E4'.split(' ').forEach((n, i) => k.pluck(noteFreq(n), 0.03 + i * 0.045, 0.25, { kind: 'koto', to: koto, pan: 0.5 - i * 0.1, len: 1.4, pdec: 0.28 }));
        wsChord('D4 A4 D5').forEach((fq, i) => k.pluck(fq, 0.62 + i * 0.03, 0.3, { kind: 'koto', to: koto, len: 1.7, pdec: 0.4, bend: i === 2 ? [0.1, 1.05, 0.08] : null }));
        wsChord('D5 E5 A5 B5 D6').forEach(fq => k.osc(k.pix ? k.pulse(0.25) : k.pw([1, 0.55, 0.42, 0.28, 0.2, 0.12, 0.08]), fq, 0.08, 2.5, 0.024, { a: 0.28, r: 1.5, vib: [3.2, 4, 0.5], to: sho }));
        for (let i = 0; i < 6; i++) k.fm(3000 + wsRnd() * 3400, 0.55 + i * 0.2 + wsRnd() * 0.1, 0.032, { ratio: 2.76, index: 0.55, dec: 0.34, mdec: 0.05, to: chime, pan: wsRnd() * 1.4 - 0.7 });
      }
    }
  ];
  // Один буфер: ep — епоха, tb — розрахункова мить удару, part — 'build' чи 'arrive', pix — варіант, sr — частота дискретизації, hold — запас розгону
  return (ep, tb, part, pix, sr, hold) => {
    WARP_HOLD = hold || 2;
    const def = WARP_SOUNDS[ep], len = part === 'build' ? tb + WARP_HOLD : WS_TAIL[ep], tr = def.trim || [1, 1];
    wsSeed = 7 + ep * 31 + (part === 'build' ? 0 : 500);
    const k = wsKit(sr, len, pix); if (def.room) k.room(...def.room);
    def[part](k, tb);
    return k.finish(1, WARP_LEVEL[ep][pix ? 1 : 0] * (part === 'build' ? tr[0] : tr[1]), part === 'build' ? 0.03 : 0.002);
  };
}
let wsCache = null, WS = null;
// Worker із тексту функції вище; якщо він недоступний, той самий код рахує основний потік (рідкісний випадок, разова пауза)
function wsSynth(ep, tb, pix, sr, hold, got) {
  const code = 'const R=(' + wsSynthCode.toString() + ')();onmessage=e=>{const m=e.data;["arrive","build"].forEach(p=>{const o=R(m.ep,m.tb,p,m.pix,m.sr,m.hold);postMessage({part:p,L:o.L,R:o.R},[o.L.buffer,o.R.buffer])})}';
  try {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })), w = new Worker(url);
    let left = 2;
    w.onmessage = e => { got(e.data.part, e.data.L, e.data.R); if (--left === 0) { w.terminate(); URL.revokeObjectURL(url); } };
    w.onerror = () => { w.terminate(); URL.revokeObjectURL(url); wsSynthHere(ep, tb, pix, sr, hold, got); };
    w.postMessage({ ep, tb, pix, sr, hold });
  } catch (e) { wsSynthHere(ep, tb, pix, sr, hold, got); }
}
function wsSynthHere(ep, tb, pix, sr, hold, got) {
  const R = wsSynthCode();
  setTimeout(() => { let o = R(ep, tb, 'arrive', pix, sr, hold); got('arrive', o.L, o.R); setTimeout(() => { o = R(ep, tb, 'build', pix, sr, hold); got('build', o.L, o.R); }, 30); }, 30);
}
function wsBuffer(L, R, sr) {
  const b = audio.ctx.createBuffer(2, L.length, sr);
  b.getChannelData(0).set(L); b.getChannelData(1).set(R);
  return b;
}
// Готує обидва буфери заздалегідь: подорож запитує підтвердження, а за цей час звук уже синтезований
function warpSoundPrepare(ep, dur) {
  const pix = WARP_PIX[ep], id = ep + '/' + dur + '/' + pix + '/' + (ecoOn() ? 1 : 0);
  if (wsCache && wsCache.id === id) return wsCache;
  const c = wsCache = { id, build: null, arrive: null, wait: [] }, top = audio.ctx.sampleRate, sr = pix || ecoOn() ? 22050 : Math.min(top, mobileMQ.matches ? 32000 : 48000);
  wsSynth(ep, dur * WARP_HIT[ep], pix, sr, ecoOn() ? 4 : 2, (part, L, R) => { c[part] = wsBuffer(L, R, sr); c.wait.forEach(fn => fn(part)); });
  return c;
}
function warpSoundAhead(ep, dur) {                                            // заздалегідь: лише якщо звук узагалі гратиме
  if (!audio.ctx || audio.ctx.state !== 'running' || state.settings.muted || state.settings.sfxVol <= 0) return;
  try { warpSoundPrepare(ep, dur); } catch (e) { /* звук ніколи не має ламати гру */ }
}
function warpDuck(on, at) {                                                // музика гри відступає на другий план і плавно повертається
  const d = audio.musicDuck; if (!d) return;
  const t = at || audio.ctx.currentTime; d.gain.cancelScheduledValues(t); d.gain.setTargetAtTime(on ? 0.2 : 1, t, on ? 0.2 : 0.75);
}
function wsPlay(buf, at, offset, fadeIn) {
  const ac = audio.ctx, s = ac.createBufferSource(), g = ac.createGain();
  s.buffer = buf; g.gain.value = 1; if (fadeIn) { g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(1, at + 0.05); }
  s.connect(g); g.connect(audio.warpOut); s.start(at, offset || 0);           // повз загальний стискач: удар лишається ударом, а гучність і так передбачувана
  return { s, g };
}
function warpSoundStart(dur, ep) {
  const ac = audio.ctx, E = ((ep | 0) % WARP_HIT.length + WARP_HIT.length) % WARP_HIT.length;
  if (WS && WS.arr) { WS.arr.g.gain.setTargetAtTime(0, ac.currentTime, 0.05); WS.arr.s.stop(ac.currentTime + 0.4); }     // наступна подорож одразу після попередньої
  const c = warpSoundPrepare(E, dur), W = WS = { c, t0: ac.currentTime + 0.012, buildNode: null, arr: null, hit: false, hitAt: 0 };
  warpDuck(true);
  const go = part => {
    if (WS !== W) return;
    const now = ac.currentTime + 0.003;
    if (part === 'build' && !W.hit && !W.buildNode) { const off = Math.max(0, now - W.t0); W.buildNode = wsPlay(c.build, Math.max(now, W.t0), off, off > 0.02); }
    if (part === 'arrive' && W.hit && !W.arr && now - W.hitAt < 1.2) W.arr = wsPlay(c.arrive, now, now - W.hitAt, now - W.hitAt > 0.02);   // синтез устиг лише після удару (дуже повільний пристрій)
  };
  if (c.build) go('build'); else c.wait.push(go);
  if (!c.arrive) c.wait.push(go);
}
// Вир дійшов до миті, коли відкривається нова епоха (викликається кожен кадр, діє один раз)
function warpSoundHit() {
  const W = WS; if (!W || W.hit) return;
  const ac = audio.ctx, now = ac.currentTime + 0.003; W.hit = true; W.hitAt = now;
  if (W.buildNode) { W.buildNode.g.gain.setTargetAtTime(0, now, 0.014); W.buildNode.s.stop(now + 0.25); }
  if (W.c.arrive) W.arr = wsPlay(W.c.arrive, now + 0.012);                   // розгін уже майже згас: піки не складаються
  wsCache = null; warpDuck(false, now + 0.45);
}
// Чи щойно прозвучало прибуття: тоді заставка епохи не грає поверх нього свою фанфару
function warpSoundFresh() { return !!(WS && WS.hit && audio.ctx && audio.ctx.currentTime - WS.hitAt < 4); }
SFX.warp = warpSoundStart;
// Удар годинника на старті: дзвін зі справжнім згасанням. Грає наживо, тож лунає в ту ж мить, навіть якщо синтез ще не завершився
SFX.warpChime = ep => {
  const ac = audio.ctx, t = ac.currentTime + 0.01, f = noteFreq(WARP_KEY[((ep | 0) % WARP_KEY.length + WARP_KEY.length) % WARP_KEY.length]), dest = audio.warpOut;
  [[0.5, 0.05, 1.7], [1, 0.12, 1.2], [1.2, 0.04, 0.8], [1.5, 0.03, 0.6], [2, 0.055, 0.45], [2.51, 0.016, 0.3], [3.01, 0.014, 0.2]].forEach(([r, v, d]) => {
    const s = ac.createOscillator(), g = ac.createGain(), tc = d * 0.55; s.frequency.value = f * r;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.004); g.gain.setTargetAtTime(0, t + 0.004, tc);
    s.connect(g); g.connect(dest); s.start(t); s.stop(t + tc * 8 + 0.02);
  });
  noiseHit(dest, t, 0.02, 0.05, 'bandpass', 2400);
};
