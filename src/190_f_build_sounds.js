//#part 190_f_build_sounds.js
/* =====================================================================
   ЗВУК БУДУВАННЯ ПО ЕПОХАХ. У кожної епохи свій набір: прибуття команди, робочі удари кількох видів, обвал старого, кінцівка, феєрверк
   і тихий фон. Збігається з тим, що на екрані (278_*): Відродження — киянка по дереву й лютня, Ретро — жерстяні робоботи й клепки,
   Диско — кроки підлоги й гітара, Аркади — падіння фігур, Інтернет — клік і клавіші, Еко — бамбук і краплі, Космос — м'які механізми,
   Неон — лазерний принтер, Японія — теслі, тайко й кото.
   Синтез — власним кодом в окремому потоці (Worker), кадри гри не просідають; самі кліпи грає звуковий потік без участі кадрів.
   Удари стають на долі музики, що зараз грає (будь-який стиль), а настроєні ноти — у її ладі; за одне будування малюнок не повторюється.
   Звук іде повз загальний стискач (audio.warpOut): гучність передбачувана. Виміри й зразки: previews/build_sound.
   ===================================================================== */
// Увесь синтез. Текст цієї функції стає кодом Worker-а, тому вона самодостатня: не бере нічого ззовні
function bsSynthCode() {
  const TAU = Math.PI * 2;
  let seed = 1;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const NI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const nf = s => { const m = /^([A-G])([#b]?)(\d)$/.exec(s); return 440 * Math.pow(2, (NI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (+m[3] + 1) * 12 - 69) / 12); };
  const SIN = new Float32Array(4098); for (let i = 0; i < 4098; i++) SIN[i] = Math.sin(TAU * i / 4096);
  const sinT = x => { const p = (x - Math.floor(x)) * 4096, i = p | 0; return SIN[i] + (SIN[i + 1] - SIN[i]) * (p - i); };
  const blep = (t, dt) => { if (t < dt) { t /= dt; return t + t - t * t - 1; } if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; } return 0; };
  const NOISE = new Float32Array(65536); seed = 12345; for (let i = 0; i < 65536; i++) NOISE[i] = rnd() * 2 - 1;
  const pans = p => (p ? [Math.cos((p + 1) * Math.PI / 4) * Math.SQRT2, Math.sin((p + 1) * Math.PI / 4) * Math.SQRT2] : [1, 1]);
  // Один кліп: стереобуфер і прості інструменти, кожен одразу дописує звук у буфер
  function kit(sr, sec) {
    const n = Math.ceil(sec * sr), L = new Float32Array(n), R = new Float32Array(n), k = { sr, n, L, R };
    // Осцилятор: wave sine/tri/saw/pulse; a — наростання, dec — згасання (стала часу) або dur+r; to/gt — ковзання висоти; lp/lpTo/lpT — фільтр і його рух; vib, trem, det, pan
    k.tone = (wave, f, t, dur, vol, o = {}) => {
      const i0 = Math.round(t * sr); if (i0 >= n) return;
      const aN = Math.max(1, Math.round((o.a == null ? 0.004 : o.a) * sr)), dec = o.dec || 0, rN = dec ? 0 : Math.max(1, Math.round((o.r == null ? 0.03 : o.r) * sr));
      const len = dec ? aN + Math.round(dec * 6.5 * sr) : Math.round(dur * sr), i1 = Math.min(n, i0 + len), rS = i0 + len - rN, dk = dec ? Math.exp(-1 / (dec * sr)) : 1, [gl, gr] = pans(o.pan);
      const kind = wave === 'sine' ? 0 : wave === 'saw' ? 1 : wave === 'tri' ? 3 : 2, duty = o.duty || 0.5, detK = o.det ? Math.pow(2, o.det / 1200) : 1, Rq = 1 / (2 * (o.q || 0.8));
      let ph = 0, env = vol, s1 = 0, s2 = 0, g = 0, h = 0;
      for (let i = i0; i < i1;) {
        const tt = (i - i0) / sr, e = Math.min(i1, i + 24);
        let fr = f; if (o.to) { const u = Math.min(1, tt / (o.gt || dur || 0.1)); fr = f * Math.pow(o.to / f, u); }
        if (o.vib) fr *= Math.pow(2, o.vib[1] * sinT(o.vib[0] * tt) / 1200);
        fr *= detK; const inc = fr / sr, tm = o.trem ? 1 - o.trem[1] * (0.5 + 0.5 * sinT(o.trem[0] * tt)) : 1;
        if (o.lp) { const c = o.lpTo ? o.lpTo + (o.lp - o.lpTo) * Math.exp(-tt / (o.lpT || 0.1)) : o.lp; g = Math.tan(Math.PI * Math.min(c, sr * 0.45) / sr); h = 1 / (1 + 2 * Rq * g + g * g); }
        for (let j = i; j < e; j++) {
          let w;
          if (kind === 0) { const p = ph * 4096, q = p | 0; w = SIN[q] + (SIN[q + 1] - SIN[q]) * (p - q); }
          else if (kind === 1) w = 2 * ph - 1 - blep(ph, inc);
          else if (kind === 3) w = 4 * Math.abs(ph - 0.5) - 1;
          else { const sh = ph + 1 - duty; w = (ph < duty ? 1 : -1) + blep(ph, inc) - blep(sh >= 1 ? sh - 1 : sh, inc) + (1 - 2 * duty); }
          ph += inc; if (ph >= 1) ph -= 1;
          const am = j - i0 < aN ? vol * (j - i0) / aN : dec ? (env *= dk) : j >= rS ? vol * (i0 + len - j) / rN : vol;
          let x = w * am * tm;
          if (o.lp) { const hp = (x - (2 * Rq + g) * s1 - s2) * h, bp = g * hp + s1; s1 = g * hp + bp; const lp = g * bp + s2; s2 = g * bp + lp; x = lp; }
          L[j] += x * gl; R[j] += x * gr;
        }
        i = e;
      }
    };
    // Шум крізь фільтр: type lp/bp/hp, f, to/gt — рух частоти, q; a, dec або dur+r; trem — зубці пилки; pan
    k.noise = (t, dur, vol, o = {}) => {
      const i0 = Math.round(t * sr); if (i0 >= n) return;
      const aN = Math.max(1, Math.round((o.a == null ? 0.002 : o.a) * sr)), dec = o.dec || 0, rN = dec ? 0 : Math.max(1, Math.round((o.r == null ? 0.03 : o.r) * sr));
      const len = dec ? aN + Math.round(dec * 6.5 * sr) : Math.round(dur * sr), i1 = Math.min(n, i0 + len), rS = i0 + len - rN, dk = dec ? Math.exp(-1 / (dec * sr)) : 1, [gl, gr] = pans(o.pan);
      const type = o.type || 'bp', f = o.f || 1000, Rq = 1 / (2 * (o.q || 0.8)), nb = 2 * Rq; let pos = Math.floor(rnd() * 65536), env = vol, s1 = 0, s2 = 0, g = 0, h = 0;
      for (let i = i0; i < i1;) {
        const tt = (i - i0) / sr, e = Math.min(i1, i + 24), u = o.to ? Math.min(1, tt / (o.gt || dur || 0.1)) : 0, c = o.to ? f * Math.pow(o.to / f, u) : f, tm = o.trem ? 1 - o.trem[1] * (0.5 + 0.5 * sinT(o.trem[0] * tt)) : 1;
        g = Math.tan(Math.PI * Math.min(c, sr * 0.45) / sr); h = 1 / (1 + 2 * Rq * g + g * g);
        for (let j = i; j < e; j++) {
          const am = j - i0 < aN ? vol * (j - i0) / aN : dec ? (env *= dk) : j >= rS ? vol * (i0 + len - j) / rN : vol;
          const x = NOISE[pos] * am * tm; pos = (pos + 1) & 65535;
          const hp = (x - (2 * Rq + g) * s1 - s2) * h, bp = g * hp + s1; s1 = g * hp + bp; const lp = g * bp + s2; s2 = g * bp + lp;
          const y = type === 'lp' ? lp : type === 'hp' ? hp : bp * nb;
          L[j] += y * gl; R[j] += y * gr;
        }
        i = e;
      }
    };
    // Коливання тіла (деревина, жерсть): часткові [частота×, гучність, згасання], кожна гасне сама
    k.modal = (f, t, vol, parts, o = {}) => {
      const i0 = Math.round(t * sr); if (i0 >= n) return; const aN = Math.max(1, Math.round((o.a == null ? 0.0015 : o.a) * sr)), [gl, gr] = pans(o.pan);
      parts.forEach(([r, v, d]) => {
        const w = TAU * f * r / sr; if (w >= Math.PI * 0.9) return; const c = Math.cos(w), s = Math.sin(w), dk = Math.exp(-1 / (d * sr)), m = Math.min(n - i0, aN + Math.round(d * 6.5 * sr));
        let re = 0, im = vol * v;
        for (let j = 0; j < m; j++) { const nr = (re * c - im * s) * dk; im = (re * s + im * c) * dk; re = nr; const x = re * (j < aN ? j / aN : 1); L[i0 + j] += x * gl; R[i0 + j] += x * gr; }
      });
    };
    // Щипнута струна (Карплус — Стронг): bright — яскравість, pick — місце щипка, dec — згасання, damp — наскільки глухне (0…0,5)
    k.pluck = (f, t, vol, o = {}) => {
      const i0 = Math.round(t * sr); if (i0 >= n) return;
      const s = o.damp == null ? 0.5 : o.damp, tot = sr / f, P = Math.max(2, Math.floor(tot - s - 0.1)), fr = tot - s - P, C = (1 - fr) / (1 + fr), tc = o.dec || 0.6, loop = Math.exp(-1 / (f * tc)), br = o.bright == null ? 0.4 : o.bright, pk = Math.max(1, Math.round(P * (o.pick || 0.2))), [gl, gr] = pans(o.pan);
      const buf = new Float32Array(P), ex = new Float32Array(P); let lp = 0, top = 0;
      for (let i = 0; i < P; i++) { lp += (rnd() * 2 - 1 - lp) * br; ex[i] = lp; }
      for (let i = 0; i < P; i++) { buf[i] = ex[i] - ex[(i + P - pk) % P]; if (Math.abs(buf[i]) > top) top = Math.abs(buf[i]); }
      for (let i = 0; i < P; i++) buf[i] /= top || 1;
      const m = Math.min(n - i0, Math.round(tc * 6 * sr)), aN = Math.round((o.a == null ? 0.0012 : o.a) * sr), fade = Math.round(0.03 * sr); let pos = 0, prev = 0, x1 = 0, y1 = 0;
      for (let j = 0; j < m; j++) {
        const c = buf[pos], cur = loop * ((1 - s) * c + s * prev); prev = c; const y = C * cur + x1 - C * y1; x1 = cur; y1 = y; buf[pos] = y; if (++pos >= P) pos = 0;
        const x = c * vol * (j < aN ? j / aN : 1) * (j > m - fade ? (m - j) / fade : 1); L[i0 + j] += x * gl; R[i0 + j] += x * gr;
      }
    };
    // Фазова модуляція: калімба, маримба, вібрафон. r — співвідношення, idx — глибина, md — як швидко гасне глибина
    k.fm = (f, t, vol, o = {}) => {
      const i0 = Math.round(t * sr); if (i0 >= n) return; const r = o.r || 2, I = (o.idx == null ? 1.5 : o.idx) / TAU, md = o.md || 0.03, dec = o.dec || 0.3, aN = Math.max(1, Math.round((o.a == null ? 0.002 : o.a) * sr)), m = Math.min(n - i0, aN + Math.round(dec * 6.5 * sr)), dk = Math.exp(-1 / (dec * sr)), ic = f / sr, im = f * r / sr, [gl, gr] = pans(o.pan);
      let pc = 0, pm = 0, env = vol;
      for (let j = 0; j < m; j++) { const a = j < aN ? vol * j / aN : (env *= dk), x = sinT(pc + I * Math.exp(-j / (md * sr)) * sinT(pm)) * a * (o.trem ? 1 - o.trem[1] * (0.5 + 0.5 * sinT(o.trem[0] * j / sr)) : 1); pc += ic; pm += im; if (pc >= 1) pc -= 1; if (pm >= 1) pm -= 1; L[i0 + j] += x * gl; R[i0 + j] += x * gr; }
    };
    // Зведення: тон (lp, hp), луна (echo: час, повтор, зріз, гучність), простір (room: довжина, зріз, гучність); кінець плавно в нуль
    k.finish = (o = {}) => {
      const dry = o.room || o.echo ? [L.slice(), R.slice()] : null;
      if (o.echo) {
        const [tm, fb, cut, wet] = o.echo, D = Math.max(2, Math.round(tm * sr)), cf = 1 - Math.exp(-TAU * cut / sr), d1 = new Float32Array(D), d2 = new Float32Array(D); let p = 0, a = 0, b = 0;
        for (let i = 0; i < n; i++) { const y1 = d1[p], y2 = d2[p]; a += (y1 - a) * cf; b += (y2 - b) * cf; const c = (dry[0][i] + dry[1][i]) * 0.5; d1[p] = c + b * fb; d2[p] = a * fb; L[i] += a * wet; R[i] += b * wet; if (++p === D) p = 0; }
      }
      if (o.room) {
        const [sec2, cut, wet] = o.room, dS = 1 / sr;
        [[0.0297, 0.0371, 0.0411, 0.0437, 0.0053, 0.0017], [0.0303, 0.0383, 0.0419, 0.0449, 0.0049, 0.0019]].forEach((tm, ci) => {
          const out = ci ? R : L, cf = 1 - Math.exp(-TAU * cut * dS), tot = new Float32Array(n);
          for (let q = 0; q < 4; q++) {
            const D = Math.round(tm[q] * sr), g = Math.pow(10, -3 * tm[q] / sec2), nrm = Math.sqrt(1 - g * g) * 0.5 * wet, d = new Float32Array(D); let p = 0, lp = 0;
            for (let i = 0; i < n; i++) { const y = d[p]; lp += (y - lp) * cf; d[p] = (dry[0][i] + dry[1][i]) * 0.5 + lp * g; tot[i] += y * nrm; if (++p === D) p = 0; }
          }
          for (let q = 4; q < 6; q++) { const D = Math.round(tm[q] * sr), d = new Float32Array(D); let p = 0; for (let i = 0; i < n; i++) { const y = d[p], x = tot[i]; d[p] = x + y * 0.5; tot[i] = y - x * 0.5; if (++p === D) p = 0; } }
          for (let i = 0; i < n; i++) out[i] += tot[i];
        });
      }
      const lpc = 1 - Math.exp(-TAU * (o.lp || 6000) / sr), hpc = Math.exp(-TAU * (o.hp || 45) / sr), fade = Math.min(n >> 1, Math.round((o.fade || 0.03) * sr));
      [L, R].forEach(x => { let a = 0, xp = 0, y = 0; for (let i = 0; i < n; i++) { a += (x[i] - a) * lpc; y = hpc * (y + a - xp); xp = a; x[i] = y * (i > n - fade ? (n - i) / fade : 1); } });
      return { L, R };
    };
    return k;
  }
  // Деревина під киянкою: низ тіла, кілька згасаючих мод, ледь чутний дотик
  const WOOD = [[1, 1, 0.055], [1.71, 0.62, 0.036], [2.63, 0.36, 0.022], [3.9, 0.14, 0.012]];
  const knock = (k, t, f, vol, o = {}) => {
    const pan = o.pan || 0;
    k.modal(f, t, vol, o.parts || WOOD, { a: o.a || 0.0018, pan });
    k.tone('sine', f * 0.5, t, 0, vol * (o.body == null ? 0.55 : o.body), { a: 0.002, dec: o.bd || 0.045, to: f * 0.38, gt: 0.06, pan });
    k.noise(t, 0, vol * (o.nz == null ? 0.3 : o.nz), { type: 'bp', f: o.nf || f * 4, q: 0.8, a: 0.001, dec: 0.004, pan });
  };
  // Жерсть: близькі часткові б'ються, тому «ходить», але верхи швидко гаснуть
  const TIN = [[1, 1, 0.075], [1.03, 0.5, 0.06], [1.52, 0.42, 0.045], [2.27, 0.22, 0.028], [3.1, 0.08, 0.014]];
  const CLAMP = [[1, 1, 0.085], [1.62, 0.65, 0.06], [2.41, 0.42, 0.036], [3.3, 0.34, 0.024], [5.3, 0.42, 0.016], [7.1, 0.22, 0.011]];   // магнітний замок: низько, але з серединою, щоб чути на телефоні
  const floor = (k, t, vol) => { k.tone('sine', 98, t, 0, vol, { a: 0.002, dec: 0.085, to: 50, gt: 0.08 }); k.tone('tri', 400, t, 0, vol * 0.42, { a: 0.002, dec: 0.03, to: 190, gt: 0.035 }); k.noise(t, 0, vol * 0.8, { f: 760, q: 0.8, a: 0.001, dec: 0.014 }); };   // крок підлоги: м'який бас-барабан
  const taiko = (k, t, vol) => { k.tone('sine', 150, t, 0, vol, { a: 0.003, dec: 0.17, to: 78, gt: 0.055 }); k.tone('sine', 262, t, 0, vol * 0.3, { a: 0.003, dec: 0.07 }); k.tone('sine', 392, t, 0, vol * 0.14, { a: 0.003, dec: 0.05 }); k.tone('tri', 470, t, 0, vol * 0.2, { a: 0.002, dec: 0.024 }); k.noise(t, 0, vol * 0.7, { f: 760, q: 0.7, a: 0.002, dec: 0.02 }); k.modal(640, t, vol * 0.26, [[1, 1, 0.02], [1.7, 0.42, 0.012]], { a: 0.002 }); };
  const puff = (k, t, vol, o = {}) => k.noise(t, 0, vol, Object.assign({ type: 'lp', f: 900, q: 0.7, a: 0.01, dec: 0.1 }, o));
  const thump = (k, t, f, vol, o = {}) => k.tone('sine', f, t, 0, vol, Object.assign({ a: 0.003, dec: 0.1, to: f * 0.55, gt: 0.09 }, o));
  const strum = (k, t, notes, vol, gap, o = {}) => notes.forEach((nt, i) => k.pluck(nf(nt), t + i * gap, vol, Object.assign({ pan: (i / Math.max(1, notes.length - 1) - 0.5) * 0.5 }, o)));
  const LUTE = { bright: 0.38, pick: 0.2, dec: 0.5 }, HARP = { bright: 0.26, pick: 0.42, dec: 0.75 }, STEEL = { bright: 0.45, pick: 0.15, dec: 0.45 }, UKE = { bright: 0.36, pick: 0.23, dec: 0.32 }, KOTO = { bright: 0.48, pick: 0.13, dec: 0.62 };
  const chip = (k, f, t, dur, vol, o = {}) => k.tone('pulse', f, t, dur, vol, Object.assign({ duty: 0.25, a: 0.003, r: 0.02, lp: 2100, q: 0.7 }, o));
  const marimba = (k, f, t, vol, o = {}) => k.fm(f, t, vol, Object.assign({ r: 4, idx: 1.1, md: 0.012, dec: 0.11, a: 0.002 }, o));
  const padChord = (k, notes, t, dur, vol, o = {}) => notes.forEach((nt, i) => [-7, 7].forEach(dt => k.tone('saw', nf(nt), t, dur, vol, Object.assign({ a: 0.12, r: 0.3, lp: 1100, q: 0.7, det: dt + i, pan: dt > 0 ? 0.3 : -0.3 }, o))));
  const rustle = (k, t, dur, vol, o = {}) => { const c = o.grains || Math.round(dur * 34); for (let i = 0; i < c; i++) { const u = rnd(); k.noise(t + u * dur, 0, vol * (0.45 + rnd() * 0.55) * Math.sin(Math.PI * Math.min(0.99, u + 0.02)), { type: 'bp', f: (o.f || 2100) * (0.8 + rnd() * 0.4), q: 0.9, a: 0.002, dec: o.gd || 0.008, pan: (rnd() - 0.5) * 0.5 }); } };
  // Набори епох. Кожен кліп — [довжина, малюнок, рівень, зведення?]: рівень — на скільки дБ найгучніші 50 мс кліпа вище за музику цієї епохи (BS_MUS); зведення за замовчуванням — fx епохи
  const SETS = [
    /* 0. ВІДРОДЖЕННЯ: кам'яна зала, киянка по дубовій балці, різець по каменю, пилка, лютня й арфа ангелят */
    { fx: { room: [0.6, 2400, 0.3], lp: 5000 }, clips: {
      arr: [1.7, k => { ['D4', 'E4', 'F4', 'A4', 'C5', 'D5', 'F5', 'A5'].forEach((nt, i) => k.pluck(nf(nt), 0.02 + i * 0.085, 0.13 + i * 0.006, Object.assign({}, HARP, { pan: -0.3 + i * 0.09 }))); ['D3', 'A3'].forEach(nt => k.tone('sine', nf(nt), 0, 1.2, 0.03, { a: 0.3, r: 0.5 })); }, 1],
      cr: [0.9, k => { thump(k, 0, 92, 0.42, { dec: 0.14 }); [0.03, 0.09, 0.16, 0.27, 0.36].forEach((t, i) => knock(k, t, 230 + 70 * ((i * 3) % 4), 0.3 - i * 0.04, { pan: (i % 2 ? 0.25 : -0.25), body: 0.3 })); puff(k, 0.02, 0.22, { f: 800, dec: 0.17 }); }, 5],
      w0: [0.5, k => knock(k, 0.003, 262, 0.32, { pan: -0.12 }), 4],
      w1: [0.5, k => knock(k, 0.003, 294, 0.29, { pan: 0.12, parts: [[1, 1, 0.05], [1.64, 0.6, 0.032], [2.71, 0.32, 0.02], [3.7, 0.14, 0.011]] }), 4],
      w2: [0.5, k => knock(k, 0.003, 233, 0.34, { pan: 0.02, parts: [[1, 1, 0.06], [1.8, 0.62, 0.038], [2.5, 0.42, 0.024], [4.1, 0.16, 0.012]] }), 4],
      c0: [0.4, k => { k.modal(1420, 0.002, 0.07, [[1, 1, 0.016], [1.55, 0.36, 0.01]], { pan: 0.28 }); k.noise(0.002, 0, 0.24, { f: 1700, q: 1.1, a: 0.001, dec: 0.012, pan: 0.28 }); knock(k, 0.002, 460, 0.1, { pan: 0.28, body: 0.2 }); }, 1],
      c1: [0.4, k => { k.modal(1260, 0.002, 0.07, [[1, 1, 0.014], [1.62, 0.3, 0.009]], { pan: -0.26 }); k.noise(0.002, 0, 0.22, { f: 1500, q: 1.1, a: 0.001, dec: 0.012, pan: -0.26 }); knock(k, 0.002, 420, 0.1, { pan: -0.26, body: 0.2 }); }, 1],
      s0: [0.7, k => k.noise(0.01, 0.34, 0.16, { f: 1050, to: 1450, gt: 0.34, q: 1.3, a: 0.08, r: 0.1, trem: [68, 0.55], pan: -0.1 }), -3],
      s1: [0.7, k => k.noise(0.01, 0.3, 0.15, { f: 1400, to: 980, gt: 0.3, q: 1.3, a: 0.06, r: 0.1, trem: [74, 0.55], pan: 0.1 }), -3],
      pl: [1.1, k => k.pluck(nf('D4'), 0.002, 0.22, LUTE), 0],
      done: [1.9, k => { knock(k, 0, 233, 0.26); strum(k, 0.05, ['D3', 'A3', 'D4', 'F4', 'A4'], 0.12, 0.028, LUTE); [['A4', 0.14, 0.22], ['D5', 0.36, 0.6]].forEach(([nt, t, d]) => k.tone('saw', nf(nt), t, d, 0.05, { a: 0.03, r: 0.1, lp: 950, q: 0.7, vib: [5, 7] })); }, 5],
      fan: [1.8, k => { strum(k, 0, ['D3', 'A3', 'D4', 'F#4', 'A4', 'D5'], 0.12, 0.04, HARP); k.pluck(nf('F#5'), 0.32, 0.08, HARP); k.pluck(nf('A5'), 0.42, 0.07, HARP); }, 2],
      sp0: [0.7, k => k.pluck(nf('A5'), 0.002, 0.05, HARP), -7],
      sp1: [0.7, k => k.pluck(nf('D5'), 0.002, 0.05, HARP), -7],
    } },
    /* 1. РЕТРО: жерстяні робоботи клепають, дирижабль гуде, комікс-«БАМ!», гітара рок-н-ролу зі слеп-луною */
    { fx: { echo: [0.125, 0.22, 1800, 0.22], room: [0.3, 2200, 0.14], lp: 5000 }, clips: {
      arr: [1.6, k => { k.tone('saw', 62, 0, 1.3, 0.11, { a: 0.3, r: 0.4, lp: 340, trem: [10.5, 0.6] }); k.tone('sine', nf('A4'), 0.15, 0.95, 0.05, { a: 0.14, r: 0.3, to: nf('E5'), gt: 0.75, vib: [5.5, 28] }); }, 0],
      cr: [0.9, k => { thump(k, 0, 105, 0.42, { dec: 0.12 }); [0.02, 0.08, 0.17, 0.3].forEach((t, i) => knock(k, t, 380 + i * 95, 0.28 - i * 0.04, { parts: TIN, pan: i % 2 ? 0.25 : -0.25, body: 0.3 })); puff(k, 0.01, 0.2, { f: 1000, dec: 0.12 }); k.tone('sine', 320, 0.06, 0, 0.045, { dec: 0.13, vib: [21, 110] }); }, 5],
      w0: [0.55, k => knock(k, 0.003, 410, 0.24, { parts: TIN, pan: -0.15, body: 0.5 }), 4],
      w1: [0.55, k => knock(k, 0.003, 470, 0.21, { parts: TIN, pan: 0.15, body: 0.5 }), 4],
      r0: [0.5, k => { for (let i = 0; i < 6; i++) { const t = 0.003 + i * 0.038, v = 1 - i * 0.09; k.noise(t, 0, 0.26 * v, { f: 1350, q: 1.3, a: 0.001, dec: 0.006, pan: 0.2 }); k.tone('sine', 330, t, 0, 0.1 * v, { a: 0.001, dec: 0.008, pan: 0.2 }); } }, -1],
      r1: [0.5, k => { for (let i = 0; i < 5; i++) { const t = 0.003 + i * 0.044, v = 1 - i * 0.1; k.noise(t, 0, 0.26 * v, { f: 1180, q: 1.3, a: 0.001, dec: 0.006, pan: -0.2 }); k.tone('sine', 290, t, 0, 0.1 * v, { a: 0.001, dec: 0.008, pan: -0.2 }); } }, -1],
      b0: [0.7, k => { thump(k, 0.002, 200, 0.3, { dec: 0.09, to: 96 }); k.tone('tri', 480, 0.002, 0, 0.16, { dec: 0.03, to: 300, gt: 0.03 }); k.tone('sine', 300, 0.01, 0, 0.05, { dec: 0.15, vib: [20, 120] }); }, 4],
      pl: [1, k => k.pluck(nf('A3'), 0.002, 0.2, STEEL), 0],
      done: [1.8, k => { [0.03, 0.26].forEach(t => { thump(k, t, 150, 0.2, { dec: 0.05 }); k.noise(t, 0, 0.3, { f: 900, q: 0.8, dec: 0.03 }); }); [['A3', 0.03], ['C#4', 0.15], ['E4', 0.27], ['A4', 0.39]].forEach(([nt, t]) => k.pluck(nf(nt), t, 0.17, STEEL)); strum(k, 0.52, ['A2', 'E3', 'A3', 'C#4'], 0.11, 0.022, STEEL); }, 5],
      fan: [1.7, k => { ['A3', 'C#4', 'E4', 'F#4'].forEach((nt, i) => k.fm(nf(nt), 0.02 + i * 0.05, 0.1, { r: 4, idx: 0.7, md: 0.05, dec: 0.5, a: 0.006, trem: [5.5, 0.3], pan: (i - 1.5) * 0.18 })); [['A2', 0], ['E2', 0.22], ['A2', 0.44]].forEach(([nt, t]) => k.pluck(nf(nt), t, 0.16, { bright: 0.3, pick: 0.25, dec: 0.3 })); }, 2],
      sp0: [0.45, k => { thump(k, 0.002, 240, 0.07, { dec: 0.03 }); k.noise(0.002, 0, 0.2, { f: 900, q: 0.7, dec: 0.02 }); }, -7],
      sp1: [0.45, k => { thump(k, 0.002, 210, 0.07, { dec: 0.03 }); k.noise(0.002, 0, 0.2, { f: 750, q: 0.7, dec: 0.022 }); }, -7],
      bed: [3, k => { k.tone('saw', 58, 0, 3.4, 0.05, { a: 0.001, r: 0.001, lp: 300, trem: [9.5, 0.5] }); k.noise(0, 3.4, 0.03, { type: 'lp', f: 420, a: 0.001, r: 0.001, trem: [9.5, 0.4] }); }, -11, { lp: 2000 }],
    } },
    /* 2. ДИСКО: підлога ступає в ритм, приглушена гітара з «вау», плескання, слеп-бас; скретч платівки, скрипки-синтезатор */
    { fx: { room: [0.28, 2600, 0.14], lp: 6000 }, clips: {
      arr: [1.6, k => { padChord(k, ['C3', 'G3', 'C4'], 0, 1.1, 0.032, { a: 0.5, r: 0.3, lp: 500, lpTo: 1600, lpT: 0.5 }); k.tone('saw', nf('C4'), 0.1, 0.9, 0.05, { a: 0.3, r: 0.2, to: nf('C5'), gt: 0.8, lp: 1500, det: 5 }); floor(k, 0.5, 0.15); floor(k, 0.75, 0.19); }, 0],
      cr: [0.9, k => { thump(k, 0, 88, 0.44, { dec: 0.15 }); k.noise(0.02, 0.1, 0.42, { f: 500, to: 1500, gt: 0.1, q: 1.6, a: 0.008, r: 0.02 }); k.noise(0.12, 0.12, 0.36, { f: 1500, to: 450, gt: 0.12, q: 1.6, a: 0.005, r: 0.04 }); puff(k, 0.02, 0.2, { f: 700, dec: 0.15 }); }, 5],
      k0: [0.42, k => floor(k, 0.002, 0.36), 3],
      g0: [0.35, k => { strum(k, 0.002, ['C4', 'G4'], 0.2, 0.004, { bright: 0.5, pick: 0.15, dec: 0.045, damp: 0.5 }); k.noise(0.002, 0, 0.1, { f: 750, to: 1500, gt: 0.06, q: 2, dec: 0.02 }); }, 0],
      g1: [0.35, k => { strum(k, 0.002, ['Eb4', 'Bb4'], 0.19, 0.004, { bright: 0.5, pick: 0.15, dec: 0.045, damp: 0.5 }); k.noise(0.002, 0, 0.1, { f: 800, to: 1650, gt: 0.06, q: 2, dec: 0.02 }); }, 0],
      g2: [0.35, k => { strum(k, 0.002, ['G3', 'Eb4'], 0.2, 0.004, { bright: 0.5, pick: 0.15, dec: 0.05, damp: 0.5 }); k.noise(0.002, 0, 0.1, { f: 650, to: 1350, gt: 0.06, q: 2, dec: 0.02 }); }, 0],
      c0: [0.4, k => { [0, 0.011, 0.023].forEach(d => k.noise(0.003 + d, 0, 0.2, { f: 1150, q: 0.9, a: 0.001, dec: 0.007 })); k.noise(0.03, 0, 0.22, { f: 1250, q: 0.8, a: 0.001, dec: 0.045 }); }, 1],
      pl: [0.75, k => k.tone('saw', nf('C3'), 0.002, 0, 0.26, { a: 0.003, dec: 0.13, lp: 1100, lpTo: 240, lpT: 0.05, q: 1.1 }), 1],
      done: [1.9, k => { [['C4', 0], ['Eb4', 0.08], ['G4', 0.16], ['Bb4', 0.24], ['C5', 0.32]].forEach(([nt, t]) => k.tone('saw', nf(nt), t, 0.16, 0.035, { a: 0.02, r: 0.06, lp: 1500, det: 6 })); padChord(k, ['C4', 'Eb4', 'G4', 'C5'], 0.4, 0.65, 0.026, { a: 0.03, r: 0.4, lp: 1700 }); floor(k, 0.4, 0.26); [0, 0.011, 0.023].forEach(d => k.noise(0.4 + d, 0, 0.16, { f: 1150, q: 0.9, a: 0.001, dec: 0.007 })); }, 5],
      fan: [1.7, k => { padChord(k, ['Ab3', 'C4', 'Eb4'], 0, 0.3, 0.028, { a: 0.02, r: 0.08, lp: 1500 }); padChord(k, ['Bb3', 'D4', 'F4'], 0.25, 0.3, 0.028, { a: 0.02, r: 0.08, lp: 1500 }); padChord(k, ['C4', 'Eb4', 'G4', 'C5'], 0.5, 0.6, 0.028, { a: 0.02, r: 0.45, lp: 1700 }); ['Ab2', 'Bb2', 'C3'].forEach((nt, i) => k.tone('saw', nf(nt), i * 0.25, 0, 0.18, { dec: 0.1, lp: 900, lpTo: 220, lpT: 0.05 })); }, 2],
      sp0: [0.3, k => k.noise(0.002, 0, 0.3, { f: 1500, q: 0.8, a: 0.001, dec: 0.014 }), -8],
      sp1: [0.3, k => k.noise(0.002, 0, 0.3, { f: 1200, q: 0.8, a: 0.001, dec: 0.018 }), -8],
    } },
    /* 3. АРКАДИ: фігури падають (трикутна хвиля й 1-бітний шум), «вака» Пакмана, пентатоніка, «LEVEL CLEAR!»; усе крізь м'який фільтр */
    { fx: { room: [0.18, 2600, 0.08], lp: 5000 }, clips: {
      arr: [1.3, k => { [['A4', 0], ['C5', 0.07], ['E5', 0.14], ['A5', 0.21], ['E5', 0.28], ['A5', 0.35]].forEach(([nt, t]) => chip(k, nf(nt), t, 0.08, 0.075)); k.tone('tri', nf('A2'), 0, 0.5, 0.16, { a: 0.004, r: 0.1 }); }, 0],
      cr: [1, k => { [['E5', 0], ['C5', 0.06], ['A4', 0.12], ['E4', 0.18], ['C4', 0.24], ['A3', 0.3]].forEach(([nt, t], i) => chip(k, nf(nt), t, 0.08, 0.08 - i * 0.005)); thump(k, 0, 110, 0.36, { dec: 0.1 }); k.noise(0.02, 0, 0.22, { type: 'lp', f: 1500, dec: 0.12, a: 0.002 }); }, 5],
      w0: [0.4, k => { k.tone('tri', 180, 0.002, 0, 0.42, { a: 0.002, dec: 0.055, to: 72, gt: 0.07 }); k.noise(0.002, 0, 0.3, { type: 'lp', f: 1700, dec: 0.022, a: 0.001 }); k.tone('tri', 540, 0.002, 0, 0.1, { a: 0.002, dec: 0.025, to: 270, gt: 0.03 }); }, 4],
      w1: [0.4, k => { k.tone('tri', 150, 0.002, 0, 0.42, { a: 0.002, dec: 0.06, to: 62, gt: 0.07 }); k.noise(0.002, 0, 0.3, { type: 'lp', f: 1500, dec: 0.024, a: 0.001 }); k.tone('tri', 450, 0.002, 0, 0.1, { a: 0.002, dec: 0.025, to: 225, gt: 0.03 }); }, 4],
      a0: [0.3, k => k.tone('tri', 233, 0.002, 0.085, 0.17, { a: 0.006, r: 0.02, to: 466, gt: 0.08, pan: -0.15 }), 0],
      a1: [0.3, k => k.tone('tri', 440, 0.002, 0.085, 0.16, { a: 0.006, r: 0.02, to: 220, gt: 0.08, pan: 0.15 }), 0],
      r0: [0.3, k => { chip(k, nf('E5'), 0.002, 0.035, 0.05); chip(k, nf('A5'), 0.04, 0.04, 0.045); }, -3],
      pl: [0.5, k => chip(k, nf('A4'), 0.002, 0.13, 0.095, { duty: 0.5, a: 0.003, r: 0.07, lp: 1800 }), 0],
      done: [1.5, k => { [['A4', 0], ['C5', 0.09], ['E5', 0.18], ['G5', 0.27], ['A5', 0.36], ['C6', 0.45]].forEach(([nt, t]) => chip(k, nf(nt), t, 0.1, 0.075)); ['A2', 'E3', 'A3', 'C4'].forEach((nt, i) => k.tone('tri', nf(nt), i * 0.14, 0.13, 0.15, { a: 0.003, r: 0.04 })); k.tone('tri', nf('C3'), 0.56, 0.35, 0.17, { a: 0.004, r: 0.15 }); chip(k, nf('E5'), 0.56, 0.35, 0.05, { r: 0.2 }); chip(k, nf('G5'), 0.56, 0.35, 0.05, { r: 0.2 }); }, 4],
      fan: [1.5, k => { [['C5', 0], ['E5', 0.08], ['G5', 0.16], ['C6', 0.24], ['G5', 0.32], ['C6', 0.4]].forEach(([nt, t]) => chip(k, nf(nt), t, 0.09, 0.07, { duty: 0.5 })); [['C3', 0], ['G3', 0.16], ['C3', 0.32]].forEach(([nt, t]) => k.tone('tri', nf(nt), t, 0.15, 0.17, { a: 0.003, r: 0.04 })); ['E5', 'G5', 'C6'].forEach(nt => chip(k, nf(nt), 0.5, 0.42, 0.04, { r: 0.28 })); k.tone('tri', nf('C3'), 0.5, 0.42, 0.17, { a: 0.003, r: 0.28 }); }, 2],
      sp0: [0.25, k => chip(k, nf('E6'), 0.002, 0.04, 0.035, { lp: 2400 }), -8],
      sp1: [0.25, k => chip(k, nf('C6'), 0.002, 0.04, 0.035, { lp: 2400 }), -8],
    } },
    /* 4. ІНТЕРНЕТ: курсор клікає, клавіші, тихий вінчестер, пакети даних (маримба), м'який модем, вентилятор */
    { fx: { room: [0.16, 3000, 0.07], lp: 6000 }, clips: {
      arr: [1.5, k => { k.tone('sine', 350, 0, 0.14, 0.03, { a: 0.01 }); k.tone('sine', 440, 0, 0.14, 0.03, { a: 0.01 }); k.tone('sine', 697, 0.2, 0.08, 0.03, { a: 0.006 }); k.tone('sine', 1209, 0.2, 0.08, 0.018, { a: 0.006 }); k.tone('sine', 770, 0.31, 0.08, 0.03, { a: 0.006 }); k.tone('sine', 1336, 0.31, 0.08, 0.018, { a: 0.006 }); k.tone('tri', 980, 0.46, 0.34, 0.03, { a: 0.03, r: 0.05, lp: 1500, vib: [38, 90] }); k.noise(0.8, 0.45, 0.13, { type: 'lp', f: 1500, a: 0.05, r: 0.25 }); [0.82, 0.97].forEach((t, i) => marimba(k, nf(i ? 'E5' : 'A4'), t, 0.11)); }, -1],
      cr: [0.9, k => { thump(k, 0.02, 100, 0.38, { dec: 0.13 }); rustle(k, 0, 0.28, 0.32, { f: 1500, grains: 13, gd: 0.012 }); [['E5', 0.1], ['C5', 0.2], ['A4', 0.3]].forEach(([nt, t]) => marimba(k, nf(nt), t, 0.1)); }, 5],
      c0: [0.3, k => { k.noise(0.002, 0, 0.34, { f: 2100, q: 1.1, a: 0.001, dec: 0.004 }); k.tone('sine', 620, 0.002, 0, 0.14, { a: 0.001, dec: 0.007 }); k.tone('sine', 230, 0.002, 0, 0.17, { a: 0.001, dec: 0.012 }); k.noise(0.055, 0, 0.18, { f: 2500, q: 1.1, a: 0.001, dec: 0.003 }); k.tone('sine', 720, 0.055, 0, 0.07, { a: 0.001, dec: 0.006 }); }, 3],
      c1: [0.3, k => { k.noise(0.002, 0, 0.34, { f: 1900, q: 1.1, a: 0.001, dec: 0.004 }); k.tone('sine', 580, 0.002, 0, 0.14, { a: 0.001, dec: 0.007 }); k.tone('sine', 210, 0.002, 0, 0.17, { a: 0.001, dec: 0.012 }); k.noise(0.07, 0, 0.18, { f: 2300, q: 1.1, a: 0.001, dec: 0.003 }); k.tone('sine', 680, 0.07, 0, 0.07, { a: 0.001, dec: 0.006 }); }, 3],
      y0: [0.5, k => [0, 0.09, 0.15, 0.26].forEach((t, i) => { const v = 0.8 + 0.2 * ((i * 5) % 3) / 2, f = 1150 + 130 * ((i * 7) % 4); k.noise(t + 0.002, 0, 0.27 * v, { f, q: 0.9, a: 0.001, dec: 0.008, pan: 0.15 }); k.tone('sine', 215 + 18 * i, t + 0.002, 0, 0.16 * v, { a: 0.001, dec: 0.013, pan: 0.15 }); }), 0],
      y1: [0.5, k => [0, 0.07, 0.19, 0.25, 0.32].forEach((t, i) => { const v = 0.8 + 0.2 * ((i * 3) % 3) / 2, f = 1050 + 140 * ((i * 5) % 4); k.noise(t + 0.002, 0, 0.27 * v, { f, q: 0.9, a: 0.001, dec: 0.008, pan: -0.15 }); k.tone('sine', 235 - 14 * i, t + 0.002, 0, 0.16 * v, { a: 0.001, dec: 0.013, pan: -0.15 }); }), 0],
      h0: [0.4, k => [0, 0.03, 0.08, 0.1, 0.17, 0.22].forEach(t => { k.noise(t + 0.002, 0, 0.15, { f: 2500, q: 1.4, a: 0.001, dec: 0.004, pan: -0.2 }); k.tone('sine', 420, t + 0.002, 0, 0.05, { a: 0.001, dec: 0.005, pan: -0.2 }); }), -6],
      pl: [0.6, k => marimba(k, nf('A4'), 0.002, 0.17), 0],
      done: [1.6, k => { [['A4', 0], ['C5', 0.1], ['E5', 0.2]].forEach(([nt, t]) => marimba(k, nf(nt), t, 0.15, { dec: 0.16 })); padChord(k, ['A3', 'E4', 'C5'], 0.3, 0.55, 0.024, { a: 0.09, r: 0.5, lp: 1300 }); marimba(k, nf('A5'), 0.32, 0.1, { dec: 0.2 }); }, 4],
      fan: [1.7, k => { padChord(k, ['C4', 'G4', 'E5'], 0, 0.65, 0.024, { a: 0.12, r: 0.55, lp: 1400 }); [['G4', 0.02], ['C5', 0.14], ['E5', 0.26], ['G5', 0.38]].forEach(([nt, t]) => marimba(k, nf(nt), t, 0.12, { dec: 0.22 })); k.tone('sine', nf('C3'), 0, 0.6, 0.11, { a: 0.03, r: 0.4 }); }, 2],
      sp0: [0.25, k => { k.noise(0.002, 0, 0.3, { f: 2000, q: 1.1, a: 0.001, dec: 0.004 }); k.tone('sine', 300, 0.002, 0, 0.09, { a: 0.001, dec: 0.012 }); }, -7],
      sp1: [0.25, k => marimba(k, nf('E5'), 0.002, 0.05), -7],
      bed: [3, k => { k.noise(0, 3.4, 0.05, { type: 'lp', f: 520, a: 0.001, r: 0.001 }); k.tone('sine', 118, 0, 3.4, 0.016, { a: 0.001, r: 0.001, trem: [1.6, 0.25] }); }, -11, { lp: 2000 }],
    } },
    /* 5. ЕКО: бамбук, краплі, листя, укулеле; жолудь падає й тріскає, дощова хмарка, пташка */
    { fx: { room: [0.22, 3000, 0.1], lp: 5500 }, clips: {
      arr: [1.5, k => { k.tone('sine', 880, 0, 0.56, 0.035, { a: 0.08, r: 0.06, to: 470, gt: 0.56 }); knock(k, 0.58, 620, 0.2, { parts: [[1, 1, 0.024], [2.3, 0.3, 0.012]], body: 0.4 }); knock(k, 0.67, 840, 0.1, { parts: [[1, 1, 0.014], [2.1, 0.3, 0.008]], body: 0.15 }); knock(k, 0.72, 760, 0.08, { parts: [[1, 1, 0.012]], body: 0.1 }); rustle(k, 0.75, 0.42, 0.12, { f: 1900 }); k.tone('sine', 1750, 0.98, 0.06, 0.02, { a: 0.012, r: 0.02, to: 2250, gt: 0.06, pan: 0.3 }); k.tone('sine', 1850, 1.1, 0.07, 0.02, { a: 0.012, r: 0.02, to: 2400, gt: 0.07, pan: 0.3 }); }, 0],
      cr: [0.8, k => { thump(k, 0, 84, 0.42, { dec: 0.13 }); k.noise(0.01, 0, 0.3, { type: 'lp', f: 650, a: 0.004, dec: 0.13 }); [0.05, 0.12, 0.19].forEach((t, i) => knock(k, t, 700 + i * 90, 0.2, { parts: [[1, 1, 0.012], [1.9, 0.3, 0.007]], body: 0.1, pan: i % 2 ? 0.25 : -0.25 })); }, 5],
      w0: [0.4, k => knock(k, 0.003, 352, 0.28, { parts: [[1, 1, 0.046], [2.76, 0.16, 0.018], [4.1, 0.05, 0.008]], pan: -0.12, body: 0.45 }), 4],
      w1: [0.4, k => knock(k, 0.003, 417, 0.25, { parts: [[1, 1, 0.042], [2.68, 0.16, 0.016], [3.9, 0.05, 0.008]], pan: 0.12, body: 0.45 }), 4],
      d0: [0.35, k => { k.tone('sine', 620, 0.002, 0, 0.17, { a: 0.003, dec: 0.03, to: 1240, gt: 0.04, pan: 0.2 }); k.tone('sine', 900, 0.085, 0, 0.05, { a: 0.003, dec: 0.018, to: 1500, gt: 0.03, pan: 0.2 }); }, 1],
      d1: [0.35, k => { k.tone('sine', 520, 0.002, 0, 0.17, { a: 0.003, dec: 0.032, to: 1040, gt: 0.04, pan: -0.2 }); k.tone('sine', 760, 0.1, 0, 0.05, { a: 0.003, dec: 0.018, to: 1300, gt: 0.03, pan: -0.2 }); }, 1],
      d2: [0.35, k => k.tone('sine', 700, 0.002, 0, 0.16, { a: 0.003, dec: 0.028, to: 1400, gt: 0.035, pan: 0.05 }), 1],
      l0: [0.5, k => rustle(k, 0.003, 0.3, 0.17, { f: 1700, grains: 12 }), -4],
      l1: [0.5, k => rustle(k, 0.003, 0.26, 0.17, { f: 2000, grains: 10 }), -4],
      b0: [0.4, k => { k.tone('sine', 1650, 0.002, 0.055, 0.03, { a: 0.012, r: 0.02, to: 2150, gt: 0.055, pan: 0.3 }); k.tone('sine', 1800, 0.09, 0.065, 0.03, { a: 0.012, r: 0.025, to: 2300, gt: 0.065, pan: 0.3 }); }, -6],
      pl: [0.8, k => k.pluck(nf('G4'), 0.002, 0.18, UKE), 0],
      done: [1.6, k => { strum(k, 0, ['G3', 'D4', 'G4', 'B4'], 0.14, 0.03, UKE); [['D5', 0.22], ['G5', 0.34], ['A5', 0.46]].forEach(([nt, t]) => k.fm(nf(nt), t, 0.07, { r: 5.4, idx: 1.2, md: 0.012, dec: 0.2 })); knock(k, 0, 352, 0.18, { parts: [[1, 1, 0.046], [2.76, 0.16, 0.018]], body: 0.45 }); }, 4],
      fan: [1.7, k => { strum(k, 0, ['G3', 'B3', 'D4', 'G4'], 0.13, 0.05, UKE); strum(k, 0.3, ['G3', 'B3', 'D4', 'G4'], 0.13, 0.03, UKE); [['D5', 0.34, 0.16], ['G5', 0.5, 0.42]].forEach(([nt, t, d]) => { k.tone('sine', nf(nt), t, d, 0.05, { a: 0.03, r: 0.12, vib: [5.5, 16] }); k.noise(t, d, 0.012, { f: nf(nt) * 1.5, q: 1, a: 0.03, r: 0.12 }); }); }, 2],
      sp0: [0.28, k => k.tone('sine', 700, 0.002, 0, 0.06, { a: 0.003, dec: 0.025, to: 1300, gt: 0.03 }), -7],
      sp1: [0.28, k => k.tone('sine', 860, 0.002, 0, 0.05, { a: 0.003, dec: 0.022, to: 1500, gt: 0.03 }), -7],
      bed: [3, k => { k.noise(0, 3.4, 0.05, { f: 1500, q: 0.45, a: 0.001, r: 0.001 }); k.noise(0, 3.4, 0.03, { type: 'lp', f: 500, a: 0.001, r: 0.001 }); for (let i = 0; i < 16; i++) k.tone('sine', 500 + rnd() * 500, 0.04 + rnd() * 3.2, 0, 0.01 + rnd() * 0.01, { a: 0.002, dec: 0.012, to: 1500, gt: 0.02, pan: (rnd() - 0.5) * 1.2 }); }, -12, { lp: 2800 }],
    } },
    /* 6. КОСМОС: м'які механізми, магнітні замки, пневматика, сонар, зварювання; відлік 3-2-1 і зліт тарілки; гул променя */
    { fx: { room: [0.75, 1800, 0.26], lp: 4200 }, clips: {
      arr: [1.8, k => { k.tone('sine', 118, 0, 1.25, 0.14, { a: 0.3, r: 0.4, to: 262, gt: 1.1, vib: [4.2, 26] }); k.tone('tri', 236, 0.05, 1.15, 0.07, { a: 0.35, r: 0.4, to: 524, gt: 1.05, vib: [4.2, 26], lp: 1300 }); k.noise(0.1, 1.05, 0.08, { type: 'lp', f: 420, to: 760, gt: 1, a: 0.35, r: 0.4 }); k.tone('sine', nf('A5'), 1.02, 0, 0.04, { a: 0.012, dec: 0.1 }); }, 0],
      cr: [1.1, k => { thump(k, 0, 72, 0.48, { dec: 0.2, to: 44, gt: 0.2 }); knock(k, 0.02, 150, 0.32, { parts: CLAMP, body: 0.2 }); knock(k, 0.2, 190, 0.18, { parts: CLAMP, body: 0.1, pan: 0.3 }); puff(k, 0.01, 0.2, { f: 850, dec: 0.2 }); }, 5],
      w0: [0.7, k => knock(k, 0.003, 146, 0.34, { parts: CLAMP, body: 0.3, nz: 0.34, nf: 720, a: 0.003, pan: -0.1 }), 4],
      w1: [0.7, k => knock(k, 0.003, 165, 0.32, { parts: CLAMP, body: 0.3, nz: 0.34, nf: 780, a: 0.003, pan: 0.1 }), 4],
      s0: [0.85, k => { k.tone('saw', 92, 0.005, 0.46, 0.13, { a: 0.07, r: 0.13, to: 138, gt: 0.42, lp: 620, q: 1.7, trem: [37, 0.25], pan: -0.15 }); k.tone('sine', 276, 0.005, 0.46, 0.022, { a: 0.09, r: 0.13, to: 414, gt: 0.42, pan: -0.15 }); }, 0],
      s1: [0.85, k => { k.tone('saw', 138, 0.005, 0.42, 0.13, { a: 0.07, r: 0.12, to: 98, gt: 0.38, lp: 600, q: 1.7, trem: [33, 0.25], pan: 0.15 }); k.tone('sine', 414, 0.005, 0.42, 0.022, { a: 0.09, r: 0.12, to: 294, gt: 0.38, pan: 0.15 }); }, 0],
      p0: [0.6, k => k.noise(0.005, 0, 0.3, { f: 880, to: 420, gt: 0.16, q: 0.7, a: 0.012, dec: 0.085 }), -3],
      v0: [0.6, k => { for (let i = 0; i < 11; i++) k.noise(0.005 + rnd() * 0.3, 0, 0.1 + rnd() * 0.12, { f: 1300 + rnd() * 900, q: 1, a: 0.001, dec: 0.005, pan: (rnd() - 0.5) * 0.4 }); k.tone('sine', 196, 0.005, 0.32, 0.03, { a: 0.03, r: 0.1, trem: [47, 0.5] }); }, -4],
      pl: [0.9, k => k.tone('sine', nf('D5'), 0.002, 0, 0.09, { a: 0.012, dec: 0.1 }), -2],
      done: [2, k => { [0, 0.22, 0.44].forEach((t, i) => k.tone('sine', nf(i < 2 ? 'A4' : 'D5'), 0.03 + t, 0, 0.16, { a: 0.008, dec: 0.05 })); k.noise(0.66, 1, 0.3, { type: 'lp', f: 300, to: 1500, gt: 0.95, a: 0.16, r: 0.4 }); k.tone('sine', 52, 0.66, 1, 0.22, { a: 0.14, r: 0.4, to: 88, gt: 0.95 }); k.tone('sine', 156, 0.66, 1, 0.09, { a: 0.14, r: 0.4, to: 264, gt: 0.95 }); k.tone('tri', 312, 0.66, 1, 0.035, { a: 0.14, r: 0.4, to: 528, gt: 0.95, lp: 1200 }); }, 5],
      fan: [2, k => { padChord(k, ['D3', 'A3', 'D4', 'F4'], 0, 0.55, 0.02, { a: 0.2, r: 0.6, lp: 900, vib: [4.5, 9] }); [['A4', 0.02], ['D5', 0.26]].forEach(([nt, t]) => k.tone('sine', nf(nt), t, 0.5, 0.06, { a: 0.03, r: 0.4, vib: [5, 8] })); }, 2],
      sp0: [0.8, k => k.tone('sine', nf('A5'), 0.002, 0, 0.03, { a: 0.01, dec: 0.07 }), -8],
      sp1: [0.8, k => k.tone('sine', nf('F5'), 0.002, 0, 0.03, { a: 0.01, dec: 0.07 }), -8],
      bed: [3, k => { k.tone('sine', 73.42, 0, 3.4, 0.05, { a: 0.001, r: 0.001, trem: [1, 0.4] }); k.tone('sine', 110.5, 0, 3.4, 0.024, { a: 0.001, r: 0.001, trem: [0.667, 0.4] }); k.tone('tri', 146.8, 0, 3.4, 0.01, { a: 0.001, r: 0.001, lp: 420 }); k.noise(0, 3.4, 0.03, { type: 'lp', f: 300, a: 0.001, r: 0.001 }); }, -11, { lp: 1500, hp: 40 }],
    } },
    /* 7. НЕОН: лазерний принтер (крокові двигуни співають у ладі), лазер униз, короткий удар, синт із лунами; пробудження «ONLINE» */
    { fx: { echo: [0.402, 0.3, 1400, 0.18], room: [0.22, 2200, 0.12], lp: 5000 }, clips: {
      arr: [1.7, k => { k.tone('saw', 65.4, 0, 1.15, 0.12, { a: 0.25, r: 0.25, to: 131, gt: 1.05, lp: 220, lpTo: 1100, lpT: 0.7, q: 1.1 }); [0.5, 0.68, 0.86].forEach((t, i) => k.tone('pulse', nf(['C5', 'Eb5', 'G5'][i]), t, 0.05, 0.03, { a: 0.004, r: 0.02, lp: 1700 })); }, 0],
      cr: [1.1, k => { thump(k, 0, 86, 0.44, { dec: 0.15 }); for (let i = 0; i < 6; i++) k.tone('pulse', nf(['G4', 'Eb4', 'C4', 'G3', 'Eb3', 'C3'][i]), i * 0.052, 0.04, 0.09, { a: 0.003, r: 0.01, lp: 1500, q: 1.2 }); [0.03, 0.14, 0.25].forEach(t => k.noise(t, 0, 0.26, { f: 900, q: 1, a: 0.001, dec: 0.012 })); }, 5],
      w0: [0.6, k => { thump(k, 0.002, 150, 0.34, { dec: 0.065, to: 84, gt: 0.07 }); k.noise(0.002, 0, 1, { f: 900, q: 0.9, a: 0.001, dec: 0.02 }); k.tone('tri', 560, 0.002, 0, 0.34, { a: 0.002, dec: 0.03, to: 320, gt: 0.03 }); }, 4],
      w1: [0.6, k => { thump(k, 0.002, 130, 0.34, { dec: 0.07, to: 76, gt: 0.07 }); k.noise(0.002, 0, 1, { f: 800, q: 0.9, a: 0.001, dec: 0.022 }); k.tone('tri', 500, 0.002, 0, 0.34, { a: 0.002, dec: 0.03, to: 290, gt: 0.03 }); }, 4],
      s0: [0.8, k => [['C3', 0], ['Eb3', 0.07], ['G3', 0.14], ['Bb3', 0.21]].forEach(([nt, t]) => k.tone('pulse', nf(nt), 0.003 + t, 0.08, 0.1, { a: 0.006, r: 0.015, lp: 1150, q: 2.4, pan: -0.2 })), -1],
      s1: [0.8, k => [['Bb3', 0], ['G3', 0.07], ['F3', 0.14], ['Eb3', 0.21]].forEach(([nt, t]) => k.tone('pulse', nf(nt), 0.003 + t, 0.08, 0.1, { a: 0.006, r: 0.015, lp: 1150, q: 2.4, pan: 0.2 })), -1],
      s2: [0.8, k => [['G3', 0], ['G3', 0.07], ['C4', 0.14], ['G3', 0.21]].forEach(([nt, t]) => k.tone('pulse', nf(nt), 0.003 + t, 0.08, 0.1, { a: 0.006, r: 0.015, lp: 1150, q: 2.4 })), -1],
      z0: [0.7, k => k.tone('saw', 1300, 0.003, 0.14, 0.07, { a: 0.006, r: 0.05, to: 210, gt: 0.13, lp: 1600, lpTo: 380, lpT: 0.06, q: 1.1, pan: 0.2 }), -2],
      z1: [0.7, k => k.tone('saw', 1100, 0.003, 0.14, 0.07, { a: 0.006, r: 0.05, to: 180, gt: 0.13, lp: 1400, lpTo: 340, lpT: 0.06, q: 1.1, pan: -0.2 }), -2],
      pl: [1.4, k => [-7, 7].forEach(d => k.tone('saw', nf('C4'), 0.002, 0, 0.08, { a: 0.003, dec: 0.1, lp: 1900, lpTo: 480, lpT: 0.08, det: d, pan: d > 0 ? 0.2 : -0.2 })), 0],
      done: [2.1, k => { padChord(k, ['C3', 'G3', 'C4'], 0, 0.55, 0.03, { a: 0.3, r: 0.1, lp: 280, lpTo: 1800, lpT: 0.28, q: 1.1 }); thump(k, 0.54, 120, 0.3, { dec: 0.1, to: 58 }); padChord(k, ['C4', 'Eb4', 'G4', 'C5'], 0.54, 0.34, 0.024, { a: 0.012, r: 0.3, lp: 1700 }); k.noise(0.54, 0, 0.14, { f: 1000, q: 0.8, a: 0.002, dec: 0.05 }); }, 5, { echo: [0.402, 0.22, 1300, 0.12], room: [0.22, 2200, 0.12], lp: 5000 }],
      fan: [2, k => { padChord(k, ['Ab3', 'C4', 'Eb4'], 0, 0.24, 0.026, { a: 0.012, r: 0.07, lp: 1500 }); padChord(k, ['Bb3', 'D4', 'F4'], 0.27, 0.24, 0.026, { a: 0.012, r: 0.07, lp: 1500 }); padChord(k, ['C4', 'Eb4', 'G4', 'C5'], 0.54, 0.55, 0.026, { a: 0.012, r: 0.42, lp: 1700 }); ['Ab2', 'Bb2', 'C3'].forEach((nt, i) => k.tone('saw', nf(nt), i * 0.27, 0, 0.17, { dec: 0.1, lp: 800, lpTo: 200, lpT: 0.06 })); }, 2, { room: [0.22, 2200, 0.12], lp: 5000 }],
      sp0: [0.3, k => k.tone('pulse', nf('G5'), 0.002, 0.035, 0.026, { a: 0.003, r: 0.012, lp: 2000 }), -8, { room: [0.22, 2200, 0.12], lp: 5000 }],
      sp1: [0.3, k => k.tone('pulse', nf('Eb5'), 0.002, 0.035, 0.026, { a: 0.003, r: 0.012, lp: 2000 }), -8, { room: [0.22, 2200, 0.12], lp: 5000 }],
      bed: [3, k => { k.tone('saw', 65.4, 0, 3.4, 0.055, { a: 0.001, r: 0.001, lp: 260, q: 1.3, trem: [2, 0.32] }); k.tone('saw', 65.8, 0, 3.4, 0.03, { a: 0.001, r: 0.001, lp: 220, trem: [1, 0.3] }); k.noise(0, 3.4, 0.012, { f: 1500, q: 1.5, a: 0.001, r: 0.001, trem: [4, 0.5] }); }, -12, { lp: 2400 }],
    } },
    /* 8. ЯПОНІЯ: киянка теслі по кипарису, тайко, пилка на себе, клепала, папір журавликів, кото; подих сякухаті, далекі ханабі */
    { fx: { room: [0.45, 2300, 0.2], lp: 4800 }, clips: {
      arr: [1.8, k => { k.tone('sine', nf('D4'), 0.02, 0.95, 0.075, { a: 0.14, r: 0.35, to: nf('A4'), gt: 0.3, vib: [4.6, 14] }); k.noise(0.02, 0.95, 0.05, { f: 1100, to: 1500, gt: 0.3, q: 1.1, a: 0.14, r: 0.35 }); taiko(k, 0.02, 0.2); strum(k, 0.74, ['D4', 'G4', 'A4', 'D5'], 0.09, 0.05, KOTO); }, 0],
      cr: [1, k => { thump(k, 0, 88, 0.46, { dec: 0.18 }); [0.03, 0.1, 0.18, 0.29].forEach((t, i) => knock(k, t, 300 + 80 * ((i * 3) % 4), 0.3 - i * 0.04, { parts: [[1, 1, 0.04], [2.3, 0.35, 0.02]], body: 0.25, pan: i % 2 ? 0.25 : -0.25 })); puff(k, 0.02, 0.18, { f: 700, dec: 0.17 }); }, 5],
      w0: [0.5, k => knock(k, 0.003, 392, 0.27, { parts: [[1, 1, 0.04], [2.3, 0.34, 0.02], [3.6, 0.1, 0.01]], body: 0.5, bd: 0.035, pan: -0.14 }), 4],
      w1: [0.5, k => knock(k, 0.003, 440, 0.25, { parts: [[1, 1, 0.038], [2.2, 0.34, 0.018], [3.4, 0.1, 0.01]], body: 0.5, bd: 0.035, pan: 0.14 }), 4],
      w2: [0.5, k => knock(k, 0.003, 349, 0.28, { parts: [[1, 1, 0.042], [2.4, 0.3, 0.02], [3.7, 0.1, 0.01]], body: 0.5, bd: 0.035, pan: 0 }), 4],
      t0: [0.8, k => taiko(k, 0.003, 0.42), 4],
      s0: [0.6, k => k.noise(0.008, 0.26, 0.14, { f: 1350, to: 1750, gt: 0.26, q: 1.5, a: 0.11, r: 0.05, trem: [88, 0.5], pan: 0.15 }), -4],
      h0: [0.7, k => knock(k, 0.003, 1020, 0.13, { parts: [[1, 1, 0.016], [1.86, 0.3, 0.01]], body: 0.08, nz: 0.1 }), -1],
      f0: [0.5, k => rustle(k, 0.003, 0.25, 0.1, { f: 2300, grains: 9, gd: 0.006 }), -7],
      pl: [1.3, k => k.pluck(nf('D4'), 0.002, 0.2, KOTO), 0],
      done: [2, k => { ['D4', 'E4', 'G4', 'A4', 'B4', 'D5', 'E5', 'G5'].forEach((nt, i) => k.pluck(nf(nt), i * 0.04, 0.095, Object.assign({}, KOTO, { pan: -0.35 + i * 0.1 }))); [0, 0.34].forEach((t, i) => taiko(k, t + 0.003, i ? 0.34 : 0.24)); }, 5],
      fan: [2.1, k => { strum(k, 0.02, ['D3', 'A3', 'D4', 'E4', 'A4'], 0.1, 0.05, KOTO); k.tone('sine', nf('D5'), 0.3, 0.75, 0.05, { a: 0.12, r: 0.4, vib: [4.8, 16] }); k.noise(0.3, 0.75, 0.018, { f: 1700, q: 1.1, a: 0.14, r: 0.4 }); taiko(k, 0.003, 0.26); }, 2],
      sp0: [0.6, k => { k.tone('sine', 210, 0.002, 0, 0.09, { a: 0.003, dec: 0.04, to: 110, gt: 0.05 }); k.noise(0.006, 0, 0.2, { f: 1100, q: 0.7, a: 0.002, dec: 0.04 }); }, -7],
      sp1: [0.6, k => { k.tone('sine', 180, 0.002, 0, 0.08, { a: 0.003, dec: 0.045, to: 96, gt: 0.05 }); k.noise(0.006, 0, 0.18, { f: 950, q: 0.7, a: 0.002, dec: 0.045 }); }, -7],
      bed: [3, k => { k.noise(0, 3.4, 0.05, { f: 560, q: 0.55, a: 0.001, r: 0.001, trem: [0.667, 0.6] }); k.noise(0, 3.4, 0.016, { f: 1500, q: 0.7, a: 0.001, r: 0.001, trem: [1, 0.6] }); }, -13, { lp: 2600 }],
    } },
  ];
  // Рівень кліпа за тим самим мірилом, що й у музики: K-зважування (BS.1770), найгучніші 50 мс; ще межі на 400 мс і на пік. Рахує з типовою гучністю ефектів у грі
  const OUT_G = 0.792, MAX_M = 2, MAX_PK = 0.355;                             // warpOut при sfxVol 0,8; 400 мс не більше ніж на 2 дБ над музикою; пік не вище −9 дБ
  const biq = (x, b0, b1, b2, a1, a2) => { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
  const kWeight = (x, sr) => {
    let K = Math.tan(Math.PI * 1681.974 / sr), Vh = Math.pow(10, 3.99984 / 20), Vb = Math.pow(Vh, 0.4996667), Q = 0.7071752, d = 1 + K / Q + K * K;
    const y = biq(x, (Vh + Vb * K / Q + K * K) / d, 2 * (K * K - Vh) / d, (Vh - Vb * K / Q + K * K) / d, 2 * (K * K - 1) / d, (1 - K / Q + K * K) / d);
    K = Math.tan(Math.PI * 38.13547 / sr); Q = 0.500327; d = 1 + K / Q + K * K;
    return biq(y, 1 / d, -2 / d, 1 / d, 2 * (K * K - 1) / d, (1 - K / Q + K * K) / d);
  };
  const setLevel = (o, sr, base, trim) => {
    const n = o.L.length, kl = kWeight(o.L, sr), kr = kWeight(o.R, sr);
    const top = win => { const W = Math.max(1, Math.round(win * sr)); let e = 0, best = 0; for (let i = 0; i < n; i++) { e += kl[i] * kl[i] + kr[i] * kr[i]; if (i >= W) e -= kl[i - W] * kl[i - W] + kr[i - W] * kr[i - W]; if (e > best) best = e; } return -0.691 + 10 * Math.log10(best / W + 1e-12); };
    let pk = 0; for (let i = 0; i < n; i++) { const v = Math.max(Math.abs(o.L[i]), Math.abs(o.R[i])); if (v > pk) pk = v; }
    const g0 = 20 * Math.log10(OUT_G), g = Math.pow(10, Math.min(base + trim - top(0.05) - g0, base + MAX_M - top(0.4) - g0) / 20), lim = MAX_PK / (OUT_G * pk + 1e-9), a = Math.min(g, lim);
    for (let i = 0; i < n; i++) { o.L[i] *= a; o.R[i] *= a; }
    return o;
  };
  const BS_MUS = [-21.5, -22.4, -23.6, -21, -25.7, -21, -21.6, -24.7, -19.5];   // гучність музики епох у грі, LUFS (виміри: previews/build_sound)
  return {
    names: ep => { const c = SETS[ep].clips, first = ['arr', 'cr', 'pl'], rest = Object.keys(c).filter(s => first.indexOf(s) < 0); return first.concat(rest); },
    clip: (ep, name, sr) => {
      const def = SETS[ep].clips[name], isBed = name === 'bed', XF = 0.4, sec = def[0] + (isBed ? XF : 0);
      seed = 101 + ep * 977 + name.charCodeAt(0) * 31 + (name.charCodeAt(1) || 0) * 7;
      const k = kit(sr, sec); def[1](k);
      const out = k.finish(Object.assign({ fade: isBed ? 0.0001 : 0.06 }, def[3] || SETS[ep].fx));
      if (!isBed) return setLevel(out, sr, BS_MUS[ep], def[2]);
      // фон по колу: кінець плавно переходить у початок, без шва
      const m = Math.round(def[0] * sr), xN = Math.round(XF * sr), L = new Float32Array(m), R = new Float32Array(m);
      for (let i = 0; i < m; i++) {
        if (i < xN) { const u = (i + 0.5) / xN, a = Math.sqrt(u), b = Math.sqrt(1 - u); L[i] = out.L[i] * a + out.L[m + i] * b; R[i] = out.R[i] * a + out.R[m + i] * b; }
        else { L[i] = out.L[i]; R[i] = out.R[i]; }
      }
      return setLevel({ L, R }, sr, BS_MUS[ep], def[2]);
    },
  };
}
/* ---------- Малюнок ударів і гучність ---------- */
// Кожна епоха: bars — малюнок ударів за чвертями будівництва (символ — крок музики; велика літера — наголос, мала — тихіше), g — групи кліпів, n — лад настроєних нот (півтони від ноти кліпа pl), tuned — групи, що вже в ладі (без розкиду висоти)
const BS_EP = [
  { step: 12, bars: ['W.....w...c.', 'W...c.W...c.', 'S.....W...n.', 'W.c.w.W.n.n.'], g: { w: ['w0', 'w1', 'w2'], c: ['c0', 'c1'], s: ['s0', 's1'] }, n: [0, 3, 5, 7, 10, 12, 15] },
  { step: 16, bars: ['W.......w...r...', 'W...r...W...r...', 'W...R.w.B...r...', 'W.n.R.w.B.n.R.n.'], g: { w: ['w0', 'w1'], r: ['r0', 'r1'], b: ['b0'] }, n: [0, 3, 5, 7, 10, 12] },
  { tuned: 'g', step: 16, bars: ['K...K...K...K...', 'K.g.K.g.K.g.K.g.', 'K.g.C.g.K.gnC.g.', 'K.gnC.g.K.gnC.gn'], g: { k: ['k0'], g: ['g0', 'g1', 'g2'], c: ['c0'] }, n: [0, 3, 5, 7, 10, 12] },
  { step: 16, bars: ['W.......W.......', 'W...a.a.W...a.a.', 'W.r.a.a.W.r.a.an', 'W.r.a.anW.r.anan'], g: { w: ['w0', 'w1'], a: ['a0', 'a1'], r: ['r0'] }, n: [0, 3, 5, 7, 10, 12, 15, 17] },
  { step: 16, bars: ['C.......C...y...', 'C...y...C...n...', 'C...y.n.C...h.n.', 'C.n.y.n.C.n.h.nn'], g: { c: ['c0', 'c1'], y: ['y0', 'y1'], h: ['h0'] }, n: [0, 3, 5, 7, 10, 12, 15] },
  { step: 16, bars: ['W...l...d...w...', 'W...l...d...W...', 'W...l.n.D...W.n.', 'W.n.l.n.D.n.W.nb'], g: { w: ['w0', 'w1'], d: ['d0', 'd1', 'd2'], l: ['l0', 'l1'], b: ['b0'] }, n: [0, 2, 4, 7, 9, 12, 14] },
  { step: 16, bars: ['W...p...S.......', 'W...v...S...W...', 'W...p.n.S...W.n.', 'W.n.v.n.S.n.W.n.'], g: { w: ['w0', 'w1'], s: ['s0', 's1'], p: ['p0'], v: ['v0'] }, n: [0, 3, 5, 7, 10, 12] },
  { tuned: 's', step: 16, bars: ['W...s...S...s...', 'W...z...S...z...', 'W...z.n.S...z.n.', 'W.n.z.n.S.n.z.nn'], g: { w: ['w0', 'w1'], s: ['s0', 's1', 's2'], z: ['z0', 'z1'] }, n: [0, 3, 5, 7, 10, 12, 15] },
  { step: 12, bars: ['T...w...w...', 'W...w...S...', 'T...w.n.w.n.', 'W.n.f.n.H.n.'], g: { w: ['w0', 'w1', 'w2'], t: ['t0'], s: ['s0'], h: ['h0'], f: ['f0'] }, n: [0, 2, 5, 7, 9, 12, 14, 17] },
];
const BS_SOFT = 0.62, BS_LOOK = 0.16;                                         // м'який удар відносно наголосу; на скільки наперед ставити удари, с
const BS = { bank: null, run: null, seed: 1 };
const bsRnd = () => { BS.seed = (BS.seed * 1664525 + 1013904223) >>> 0; return BS.seed / 4294967296; };
function bsCan() { const ac = audio.ctx; return !!(ac && ac.state === 'running' && !state.settings.muted && state.settings.sfxVol > 0); }
function bsEpoch() { return ((viewEpoch() | 0) % BS_EP.length + BS_EP.length) % BS_EP.length; }
/* ---------- Синтез у Worker ---------- */
function bsStore(bank, name, L, R, total) {
  const b = audio.ctx.createBuffer(2, L.length, bank.sr);
  b.getChannelData(0).set(L); b.getChannelData(1).set(R);
  bank.clips[name] = b; bank.total = total; bank.got++;
}
function bsSynthHere(bank) {                                                  // Worker недоступний (рідкісний випадок): по одному кліпу в паузах між кадрами
  const R = bsSynthCode(), names = R.names(bank.ep); let i = 0;
  const next = () => { if (BS.bank !== bank || i >= names.length || !audio.ctx) return; const nm = names[i++], o = R.clip(bank.ep, nm, bank.sr); bsStore(bank, nm, o.L, o.R, names.length); setTimeout(next, 40); };
  setTimeout(next, 30);
}
function bsPrepare(ep) {
  if (BS.bank && BS.bank.ep === ep) return BS.bank;
  const top = audio.ctx.sampleRate, sr = ecoOn() ? 22050 : Math.min(top, mobileMQ.matches ? 24000 : 32000);
  const bank = BS.bank = { ep, sr, clips: {}, got: 0, total: 0 };
  const code = 'const R=(' + bsSynthCode.toString() + ')();onmessage=e=>{const m=e.data,names=R.names(m.ep);names.forEach(nm=>{const o=R.clip(m.ep,nm,m.sr);postMessage({name:nm,total:names.length,L:o.L,R:o.R},[o.L.buffer,o.R.buffer])})}';
  try {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })), w = new Worker(url), bye = () => { w.terminate(); URL.revokeObjectURL(url); };
    w.onmessage = e => { const d = e.data; if (BS.bank !== bank || !audio.ctx) { bye(); return; } bsStore(bank, d.name, d.L, d.R, d.total); if (bank.got >= d.total) bye(); };
    w.onerror = () => { bye(); if (BS.bank === bank) bsSynthHere(bank); };
    w.postMessage({ ep, sr });
  } catch (e) { bsSynthHere(bank); }
  return bank;
}
// Заздалегідь: щоб на першому ж будуванні все було готове. Заходить рідко, під час вира й будування не починає
function buildSoundAhead() {
  try {
    if (!bsCan() || build || (typeof warp !== 'undefined' && warp)) return;
    bsPrepare(bsEpoch());
  } catch (e) { /* звук ніколи не має ламати гру */ }
}
function buildSoundReady() { const b = BS.bank; return !!(b && b.total && b.got >= b.total); }
setInterval(buildSoundAhead, 5000);
/* ---------- Програвання ---------- */
function bsPlay(name, at, gain, rate) {
  const B = BS.bank, buf = B && B.clips[name]; if (!buf) return null;
  const ac = audio.ctx, s = ac.createBufferSource(), g = ac.createGain();
  s.buffer = buf; if (rate && rate !== 1) s.playbackRate.value = rate;
  g.gain.value = gain == null ? 1 : gain;
  s.connect(g); g.connect(audio.warpOut); s.start(at || 0);
  return { s, g };
}
function bsBedOff(R, t) {
  const n = R && R.bedNode; if (!n) return;
  R.bedNode = null; const now = audio.ctx.currentTime; n.g.gain.cancelScheduledValues(now); n.g.gain.setTargetAtTime(0, now, t || 0.25); n.s.stop(now + (t || 0.25) * 7);
}
// Сітка музики: той самий час, що й у tickMusic; без музики — темп епохи
function bsGrid(ep) {
  const tr = audio.track, bpm = tr && !tr.stopped && tr.def && tr.def.bpm ? tr.def.bpm : (EPOCH_TUNES[ep] && EPOCH_TUNES[ep].bpm) || 120;
  return { dt: 60 / bpm / 4, t0: tr && !tr.stopped ? tr.start : 0 };
}
function bsWork(R, wp, endAt) {
  const ac = audio.ctx, now = ac.currentTime, E = BS_EP[R.ep], G = bsGrid(R.ep), bl = E.step;
  let k = Math.ceil((Math.max(now + 0.005, R.next || 0) - G.t0) / G.dt - 1e-6);
  for (let guard = 0; guard < 8; guard++, k++) {
    const at = G.t0 + k * G.dt; if (at > now + BS_LOOK) { R.next = at; return; }
    const S = E.bars[Math.min(E.bars.length - 1, Math.floor(wp * E.bars.length))], ch = S[((k % bl) + bl) % bl];
    R.next = at + G.dt * 0.5;
    if (ch === '.' || at > endAt) continue;                                   // перед кінцівкою нічого не ставимо: удари не складаються
    const low = ch.toLowerCase(), acc = ch !== low, vel = (acc ? 1 : BS_SOFT) * (0.9 + bsRnd() * 0.2);
    if (low === 'n') {                                                        // настроєна нота: чим вище будинок, тим вище звучить лад
      const sc = E.n, top = Math.floor(wp * (sc.length - 2)), i = Math.min(sc.length - 1, top + (bsRnd() < 0.5 ? 0 : 1));
      bsPlay('pl', at, vel, Math.pow(2, sc[i] / 12));
    } else {
      const list = E.g[low]; if (!list) continue;
      let c = Math.floor(bsRnd() * list.length); if (list.length > 1 && list[c] === R.last[low]) c = (c + 1) % list.length;
      R.last[low] = list[c];
      bsPlay(list[c], at + (bsRnd() - 0.5) * 0.008, vel, E.tuned && E.tuned.indexOf(low) >= 0 ? 1 : 1 + (bsRnd() - 0.5) * 0.05);
    }
  }
}
/* ---------- Виклики з гри ---------- */
function buildSoundStart() {
  buildSoundStop();
  try {
    if (!audio.ctx) return;
    const ep = bsEpoch();
    BS.seed = 7 + ep * 131 + (state.shopLevel | 0) * 17;
    BS.run = { ep, t0: audio.ctx.currentTime, arr: false, cr: false, done: false, bedNode: null, next: 0, last: {} };   // звук може «прокинутись» уже під час будування: далі все робить buildSoundTick
    if (bsCan()) { bsPrepare(ep); bsArrive(BS.run); }
  } catch (e) { /* звук ніколи не має ламати гру */ }
}
function bsArrive(R) {
  const now = audio.ctx.currentTime;
  if (!R.arr && now - R.t0 < 0.5 && bsPlay('arr', now + 0.01)) R.arr = true;
  if (!R.bedNode && !R.done) {
    const n = bsPlay('bed', now + 0.01, 0);
    if (n) { n.s.loop = true; n.g.gain.setValueAtTime(0, now); n.g.gain.setTargetAtTime(1, now + 0.01, 0.35); n.s.stop(now + 30); R.bedNode = n; }
  }
}
// Щокадру з updateBuild
function buildSoundTick(b, p) {
  const R = BS.run; if (!R) return;
  try {
    if (!bsCan()) return;
    bsPrepare(R.ep);
    if (!R.arr || (!R.bedNode && !R.done)) bsArrive(R);
    if (!R.cr && p > 0.115) { R.cr = true; bsPlay('cr', audio.ctx.currentTime + 0.005); }
    if (p >= BUILD_A && p < BUILD_C) bsWork(R, (p - BUILD_A) / (BUILD_C - BUILD_A), audio.ctx.currentTime + (BUILD_C - p) * b.dur / (1 + (b.boost || 0)) - 0.06);
    if (!R.done && p >= BUILD_C) { R.done = true; bsBedOff(R, 0.3); bsPlay('done', audio.ctx.currentTime + 0.005); }
  } catch (e) { /* звук ніколи не має ламати гру */ }
}
// Феєрверк над дахом: тихе й щоразу трохи інше
function buildSoundSpark() {
  const R = BS.run; if (!R) return;
  try { if (bsCan()) { R.sp = (R.sp | 0) + 1; bsPlay('sp' + (R.sp % 2), audio.ctx.currentTime + 0.003, 0.8 + bsRnd() * 0.3, 0.94 + bsRnd() * 0.12); } } catch (e) { /* нічого */ }
}
function buildSoundEnd() {
  const R = BS.run; BS.run = null;
  try {
    if (R && audio.ctx) bsBedOff(R, 0.2);
    if (R && bsCan() && bsPlay('fan', audio.ctx.currentTime + 0.005)) return;
    playSfx('levelup');                                                       // кліпи ще не готові або будування почалось без звуку
  } catch (e) { /* нічого */ }
}
function buildSoundStop() {                                                   // будування обірвалось (подорож у часі, скидання)
  const R = BS.run; BS.run = null;
  try { if (R && audio.ctx) bsBedOff(R, 0.2); } catch (e) { /* нічого */ }
}
