//#part 230_d_circus_themes.js
/* =====================================================================
   ЦИРК ПО ЕПОХАХ: у кожної з 9 епох (0 Відродження … 8 Японія) цирк має свої кольори й тематичні деталі.
   Колесо фортуни лишається (змінено лише лампочки по ободу, втулку й стрілку).
   Тема: c1/c2 смуги шатра, cap верхівка, shade тінь фестонів, trim оздоба входу, door вхід, out контур, flag [тло, літери, край],
   plat платформа (d, m, hi, lo, dash, hitch, lt лампочки), tyre колеса, rim/hub/ptr колесо, cl костюм клоуна, win вікно колеса,
   gl гірлянда між шатрами, paint(g, kind, h) — малюнок на шатрі (один раз), post(g, t, x0) — «стовпчик» біля входу (5 px),
   top(g, t, s, u) — рухомі деталі (у групі шатра), back(g, t, s, u) — позаду шатра. Малює CIRCUS_ART (230_a_skins_circus_hag.js).
   ===================================================================== */
const CIRCUS_THEMES = (function () {
  const D = '#4a3228', CR = '#fff4dc', YEL = '#ffe08a', GLD = '#f2b84b';
  const rr = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const px = (g, x, y, c) => rr(g, x, y, 1, 1, c);
  const dsc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.4) rr(g, cx + x, cy + y, 1, 1, c); };
  const stamp = (g, x0, y0, rows, pal) => rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const c = pal[row[i]]; if (c) rr(g, x0 + i, y0 + j, 1, 1, c); } });
  const cross = (g, x, y, c) => { px(g, x, y - 1, c); rr(g, x - 1, y, 3, 1, c); px(g, x, y + 1, c); };
  const HEART = ['.#.#.', '#####', '.###.', '..#..'];
  const heart = (g, x, y, c) => stamp(g, Math.round(x), Math.round(y), HEART, { '#': c });
  const T = [];

  /* 0. ВІДРОДЖЕННЯ: ярмарок — винний і пергаментний, герби, смолоскипи, прапорці */
  T.push({
    id: 'renaissance',
    c1: '#9b2f3a', c2: '#f4e4b8', cap: '#b8862f', shade: '#cdbb94', trim: '#e8c860', door: '#24140f', out: '#3a1f1a',
    flag: ['#7a1f2e', '#f2d27a', '#e8c860'],
    plat: { d: '#3a2a1c', m: '#7a5230', hi: '#a8703f', lo: '#4a2f1a', dash: '#e8c860', hitch: GLD, lt: ['#f2b84b', '#9b2f3a'] },
    tyre: ['#2a1d1a', '#5a4636', '#f2b84b', CR], rim: ['#f2d27a', CR], hub: '#c99a3c', ptr: '#9b2f3a',
    cl: { kind: 'jester', suit: '#9b2f3a', legA: '#2f6a4a', legB: '#e8c860', shoe: '#7a4f35', wig: '#c99a3c', star: '#e8c860', ruff: CR, ruff2: '#e8c860', hat: '#9b2f3a', tip: '#e8c860' },
    win: { sky: '#d6e6ee', beam: '#ffffff', floor: '#7a1f2e', line: '#e8c860', dot: ['#e8c860', '#f4e4b8'], conf: ['#9b2f3a', '#e8c860', '#2f6a4a', '#f4e4b8'],
      extra(g) { for (let x = 0; x < 72; x += 4) { const y = 3 + Math.round(2 * Math.sin(x / 72 * Math.PI * 3)), c = ['#9b2f3a', '#e8c860', '#2f6a4a'][(x / 4) % 3]; px(g, x, y, '#3a2a1c'); rr(g, x - 1, y + 1, 3, 1, c); px(g, x, y + 2, c); } } },
    gl: { kind: 'flag', cols: ['#9b2f3a', '#e8c860', '#f4e4b8'], str: '#3a2a1c' },
    paint(g, kind) {
      if (kind !== 'main') return;
      stamp(g, 76, 28, ['DDDDDDDDD', 'DgggRgggD', 'DgggRgggD', 'DRRRRRRRD', 'DgggRgggD', 'DgggRgggD', '.DggRggD.', '..DgRgD..', '...DRD...', '....D....'], { D: '#3a1f1a', g: '#e8c860', R: '#9b2f3a' });
    },
    post(g, t, x0) {                                                       // смолоскип
      const f = Math.floor(t * 8) % 3;
      g.globalAlpha = 0.25; dsc(g, x0 + 2, 53, 4, '#ffb347'); g.globalAlpha = 1;
      rr(g, x0 + 2, 56, 1, 6, '#4a2f1a'); rr(g, x0 + 1, 55, 3, 1, '#2a1d1a');
      rr(g, x0 + 1, 53, 3, 2, '#ff8a3d'); rr(g, x0 + 2, 51 - (f === 0 ? 1 : 0), 1, 3, '#ffb347'); px(g, x0 + 2, 53, '#ffe08a');
    },
    top(g) { rr(g, 79, 0, 3, 3, '#e8c860'); px(g, 79, 0, CR); }
  });

  /* 1. РЕТРО (50-ті): бірюза й корал, атомні зірки, шахова смуга, платівка */
  T.push({
    id: 'retro',
    c1: '#2fb5ab', c2: '#fff4dc', cap: '#e5546b', shade: '#bfe0dc', trim: '#e5546b', door: '#1d2a30', out: '#1d3a40',
    flag: ['#e5546b', '#fff4dc', '#fff4dc'],
    plat: { d: '#1d2a30', m: '#e9e4d6', hi: '#ffffff', lo: '#8fa3a8', dash: '#e5546b', hitch: '#c0c8cc', lt: ['#e5546b', '#2fb5ab'] },
    tyre: ['#1d2a30', '#fff4dc', '#c0c8cc', '#8fa3a8'], rim: ['#e5546b', CR], hub: '#e5546b', ptr: '#2fb5ab',
    cl: { kind: 'cap', suit: '#e5546b', legA: '#2fb5ab', legB: '#fff4dc', shoe: '#1d2a30', wig: '#2fb5ab', star: '#fff4dc', ruff: '#fff4dc', ruff2: '#2fb5ab', hat: '#e5546b', tip: '#2fb5ab' },
    win: { sky: '#bfe8e3', beam: '#ffffff', floor: '#1d2a30', line: '#e5546b', dot: ['#e5546b', '#fff4dc'], conf: ['#e5546b', '#ffe08a', '#2fb5ab', '#fff4dc'],
      extra(g, t) {
        for (let i = 0; i < 18; i++) for (let r = 0; r < 2; r++) rr(g, i * 4, 34 + r * 3, 4, 3, (i + r) % 2 ? '#1d2a30' : '#fff4dc');
        [[8, 8], [62, 9], [50, 22], [16, 24]].forEach((p, i) => { const c = (Math.floor(t * 2) + i) % 2 ? '#e5546b' : '#ffffff'; cross(g, p[0], p[1], c); px(g, p[0] - 2, p[1] - 2, c); px(g, p[0] + 2, p[1] - 2, c); px(g, p[0] - 2, p[1] + 2, c); px(g, p[0] + 2, p[1] + 2, c); });
      } },
    gl: { kind: 'bulb', cols: ['#e5546b', '#ffe08a', '#2fb5ab', '#fff4dc'], str: '#1d3a40' },
    paint(g, kind, h) {
      if (kind === 'main') {
        const cx = 80, cy = 33, C = '#e5546b';
        for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; for (let r = 3; r <= 6; r++) px(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, C); }
        dsc(g, cx, cy, 2, '#3a1f2a'); dsc(g, cx, cy, 1, C);
        const hw = h.hwAt(58);                                              // шахова смуга внизу стін
        for (let x = 80 - hw + 1; x < 80 + hw; x += 2) { if (x > 68 && x < 92) continue; for (let r = 0; r < 2; r++) rr(g, x, 58 + r * 2, 2, 2, (((x / 2) | 0) + r) % 2 ? '#1d2a30' : '#fff4dc'); }
      } else { cross(g, 24, 14, '#e5546b'); px(g, 22, 12, '#e5546b'); px(g, 26, 12, '#e5546b'); px(g, 22, 16, '#e5546b'); px(g, 26, 16, '#e5546b'); }
    },
    post(g, t, x0) {                                                       // атомний ліхтар
      const c = Math.floor(t * 3) % 2 ? '#e5546b' : '#ffe08a';
      rr(g, x0 + 2, 52, 1, 10, '#8fa3a8'); rr(g, x0 + 1, 61, 3, 1, '#1d2a30');
      rr(g, x0, 50, 5, 1, c); rr(g, x0 + 2, 48, 1, 5, c); px(g, x0 + 1, 49, c); px(g, x0 + 3, 49, c); px(g, x0 + 1, 51, c); px(g, x0 + 3, 51, c); px(g, x0 + 2, 50, '#fff4dc');
    },
    top(g, t) {                                                            // платівка, що крутиться
      const vx = 60, vy = 17, a = t * 3;
      dsc(g, vx, vy, 5, '#1d2a30'); dsc(g, vx, vy, 4, '#2b3b44'); dsc(g, vx, vy, 1, '#e5546b');
      for (let k = 0; k < 2; k++) px(g, vx + Math.cos(a + k * Math.PI) * 3, vy + Math.sin(a + k * Math.PI) * 3, '#8fa3a8');
      px(g, vx, vy, '#ffffff');
    }
  });

  /* 2. ДИСКО: фіолетовий і рожевий, дзеркальна куля, танцпідлога, колонки, промені */
  T.push({
    id: 'disco',
    c1: '#7a2fb0', c2: '#ff7ac0', cap: '#ffd34d', shade: '#d3b0e6', trim: '#ffd34d', door: '#150a24', out: '#2a1048',
    flag: ['#7a2fb0', '#ffe08a', '#ffd34d'],
    plat: { d: '#241036', m: '#3a1f5c', hi: '#b86bff', lo: '#150a24', dash: '#ff7ac0', hitch: '#ffd34d', lt: ['#ff7ac0', '#7ad8ff'] },
    tyre: ['#150a24', '#5a3d78', '#ffd34d', '#ff7ac0'], rim: ['#ff7ac0', '#7ad8ff'], hub: '#ffd34d', ptr: '#7a2fb0',
    cl: { kind: 'afro', suit: '#ff7ac0', legA: '#7a2fb0', legB: '#7ad8ff', shoe: '#ffd34d', wig: '#ffd34d', star: '#ffffff', ruff: '#ffd34d', ruff2: '#7a2fb0', hat: '#6a3a1a', tip: '#ffd34d', shades: true },
    win: { sky: '#2a1248', beam: '#b86bff', floor: '#150a24', line: '#ffd34d', dot: ['#ff7ac0', '#7ad8ff'], conf: ['#ff7ac0', '#7ad8ff', '#ffd34d', '#b86bff'],
      extra(g, t) {
        for (let i = 0; i < 12; i++) for (let r = 0; r < 2; r++) rr(g, i * 6, 34 + r * 3, 6, 3, ['#ff7ac0', '#7ad8ff', '#ffd34d', '#b86bff'][(i + r * 2 + Math.floor(t * 3)) % 4]);
        rr(g, 59, 0, 1, 5, '#cfd8e3'); dsc(g, 59, 9, 4, '#aab4c8');
        for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) if (x * x + y * y <= 17 && (x + y + 8) % 2 === 0) px(g, 59 + x, 9 + y, '#e8eefc');
        const k = Math.floor(t * 5); px(g, 57 + (k % 3), 7 + (k % 2), '#ffffff');
        [[-7, -3], [7, -4], [-6, 5], [8, 4]].forEach((p, i) => { if ((k + i) % 3 === 0) cross(g, 59 + p[0], 9 + p[1], '#ffd34d'); });
      } },
    gl: { kind: 'bulb', cols: ['#ff7ac0', '#7ad8ff', '#ffd34d', '#b86bff'], str: '#2a1048' },
    paint(g, kind) {
      const pts = kind === 'main' ? [[71, 30], [89, 31], [75, 38], [86, 40]] : [[24, 14]];
      pts.forEach(p => { cross(g, p[0], p[1], '#ffd34d'); px(g, p[0], p[1], '#ffffff'); });
    },
    post(g, t, x0) {                                                       // колонка
      const beat = Math.floor(t * 6) % 2;
      rr(g, x0, 50, 5, 12, '#241036'); rr(g, x0, 50, 5, 1, '#ff7ac0'); rr(g, x0, 61, 5, 1, '#150a24');
      dsc(g, x0 + 2, 53, 1, beat ? '#ffffff' : '#7ad8ff'); dsc(g, x0 + 2, 58, beat ? 2 : 1, '#5a3d78'); px(g, x0 + 2, 58, '#150a24');
    },
    back(g, t, s, u) {                                                     // промені з верхівки
      const ax = 80, ay = 8 + u.sink + u.bob;
      g.globalAlpha = 0.3;
      [['#ff7ac0', 0], ['#7ad8ff', 2.1], ['#ffd34d', 4.2]].forEach(([c, ph]) => {
        const a = -Math.PI / 2 + Math.sin(t * 1.4 + ph) * 1.2;
        for (let r = 4; r < 46; r++) { const w = 1 + Math.floor(r / 14); rr(g, ax + Math.cos(a) * r - (w >> 1), ay + Math.sin(a) * r - (w >> 1), w, w, c); }
      });
      g.globalAlpha = 1;
    },
    top(g, t) {                                                            // дзеркальна куля в дверях
      const bx = 80, by = 56, k = Math.floor(t * 5);
      rr(g, bx, 48, 1, 4, '#cfd8e3'); dsc(g, bx, by, 4, '#aab4c8');
      for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) if (x * x + y * y <= 17 && (x + y + 8) % 2 === 0) px(g, bx + x, by + y, '#e8eefc');
      px(g, bx - 2 + (k % 3), by - 2 + (k % 2), '#ffffff');
      [[-8, -3], [8, -4], [-7, 5], [7, 6]].forEach((p, i) => { if ((k + i) % 3 === 0) cross(g, bx + p[0], by + p[1], '#ffd34d'); });
    }
  });

  /* 3. АРКАДИ: пікселі — малиновий і фіолетовий, інопланетянин, пакмен, автомат, життя-серця */
  T.push({
    id: 'arcade',
    c1: '#e63a9a', c2: '#2c2468', cap: '#3be0e8', shade: '#8a7fc8', trim: '#3be0e8', door: '#0e0a24', out: '#0a0618',
    flag: ['#2c2468', '#ffe14a', '#3be0e8'],
    plat: { d: '#0a0618', m: '#2c2468', hi: '#3be0e8', lo: '#0a0618', dash: '#e63a9a', hitch: '#ffe14a', lt: ['#3be0e8', '#e63a9a'] },
    tyre: ['#0a0618', '#3a3a6a', '#ffe14a', '#3be0e8'], rim: ['#ffe14a', '#3be0e8'], hub: '#e63a9a', ptr: '#ffe14a',
    cl: { kind: 'visor', suit: '#3be0e8', legA: '#e63a9a', legB: '#ffe14a', shoe: '#2c2468', wig: '#3be0e8', star: '#ffe14a', ruff: '#ffe14a', ruff2: '#e63a9a', hat: '#e63a9a', tip: '#ffe14a' },
    win: { sky: '#0e0a24', beam: '#2c2468', floor: '#2c2468', line: '#3be0e8', dot: ['#e63a9a', '#ffe14a'], conf: ['#e63a9a', '#ffe14a', '#3be0e8', '#7aff7a'],
      extra(g, t) {
        for (let dy = 0; dy <= 12; dy++) { const hw = Math.round(Math.sqrt(144 - dy * dy)); if (dy % 4 === 3) continue; rr(g, 56 - hw, 26 - dy, hw * 2, 1, dy < 6 ? '#e63a9a' : '#ffe14a'); }
        rr(g, 0, 26, 72, 1, '#3be0e8');
        for (let i = 0; i < 4; i++) rr(g, 0, 27 + Math.round(Math.pow(((i + (t * 0.8) % 1) / 4), 2) * 7), 72, 1, '#2c8aa8');
        for (let k = -6; k <= 6; k++) for (let y = 27; y < 34; y++) px(g, 56 + k * (1 + (y - 26) * 0.7), y, '#2c8aa8');
        for (let i = 0; i < 9; i++) if ((Math.floor(t * 3) + i) % 3) px(g, (i * 29) % 72, (i * 11) % 20, '#ffffff');
      } },
    gl: { kind: 'pixel', cols: ['#ffe14a', '#3be0e8', '#e63a9a', '#7aff7a'], str: '#0a0618' },
    paint(g, kind) {
      if (kind === 'main') {
        const inv = ['..#.....#..', '...#...#...', '..#######..', '.##.###.##.', '###########', '#.#######.#', '#.#.....#.#', '...##.##...'];
        stamp(g, 76, 29, inv, { '#': '#0a0618' }); stamp(g, 75, 28, inv, { '#': '#ffe14a' });
      } else {
        dsc(g, 24, 15, 3, '#ffe14a'); rr(g, 25, 15, 3, 1, '#0a0618'); rr(g, 26, 14, 2, 1, '#0a0618'); rr(g, 26, 16, 2, 1, '#0a0618'); px(g, 24, 13, '#0a0618');
      }
    },
    post(g, t, x0) {                                                       // міні-автомат
      rr(g, x0, 50, 5, 12, '#0a0618'); rr(g, x0 + 1, 51, 3, 2, '#e63a9a'); rr(g, x0 + 1, 54, 3, 3, '#3be0e8');
      px(g, x0 + 1 + Math.floor(t * 4) % 3, 55, '#0a0618'); rr(g, x0 + 1, 58, 3, 1, '#ffe14a'); px(g, x0 + 1, 59, '#e63a9a'); px(g, x0 + 3, 59, '#7aff7a'); rr(g, x0 + 1, 60, 3, 1, '#2c2468');
    },
    top(g, t) {                                                            // життя: три серця
      [0, 1, 2].forEach(i => { if (i === 2 && Math.floor(t * 2) % 2) return; heart(g, 52 + i * 6, 6, '#ff3b5c'); });
    }
  });

  /* 4. ІНТЕРНЕТ: блакитний і білий, вікно браузера, вай-фай, сердечка-лайки */
  T.push({
    id: 'internet',
    c1: '#2f7fd6', c2: '#ffffff', cap: '#1d4f9a', shade: '#bcd4f0', trim: '#ffffff', door: '#0f2540', out: '#173a6a',
    flag: ['#2f7fd6', '#ffffff', '#ffffff'],
    plat: { d: '#1d2f4a', m: '#cfd8e3', hi: '#ffffff', lo: '#7a8aa0', dash: '#2f7fd6', hitch: '#ff8a3d', lt: ['#4cd964', '#2f7fd6'] },
    tyre: ['#1d2f4a', '#8a96a8', '#ffffff', '#cfd8e3'], rim: ['#ffffff', '#2f7fd6'], hub: '#ff8a3d', ptr: '#2f7fd6',
    cl: { kind: 'phones', suit: '#2f7fd6', legA: '#4cd964', legB: '#ffffff', shoe: '#1d4f9a', wig: '#4cd964', star: '#ffffff', ruff: '#ffffff', ruff2: '#ff8a3d', hat: '#1d4f9a', tip: '#4cd964' },
    win: { sky: '#bfe0ff', beam: '#ffffff', floor: '#2f7fd6', line: '#ffffff', dot: ['#ffffff', '#cfe0f5'], conf: ['#2f7fd6', '#ea4335', '#fbbc05', '#34a853'],
      extra(g, t) {
        [[(t * 4) % 90 - 14, 6], [(t * 3 + 40) % 90 - 14, 16]].forEach(p => { rr(g, p[0], p[1] + 2, 12, 3, '#ffffff'); rr(g, p[0] + 2, p[1], 7, 3, '#ffffff'); });
        [0, 1].forEach(k => { const ph = (t * 0.6 + k * 0.5) % 1; g.globalAlpha = 1 - ph * 0.6; heart(g, 8 + k * 50 + Math.sin(ph * 6) * 3, 31 - ph * 26, '#ff4d6d'); g.globalAlpha = 1; });
      } },
    gl: { kind: 'pixel', cols: ['#2f7fd6', '#ea4335', '#fbbc05', '#34a853'], str: '#173a6a' },
    paint(g, kind) {
      if (kind === 'main') {
        rr(g, 70, 31, 21, 11, '#173a6a'); rr(g, 71, 32, 19, 2, '#2f7fd6'); px(g, 72, 32, '#ff5f57'); px(g, 74, 32, '#ffbd2e'); px(g, 76, 32, '#28c940');
        rr(g, 71, 34, 19, 7, '#ffffff'); rr(g, 72, 35, 17, 2, '#cfe0f5'); rr(g, 72, 38, 9, 1, '#9bb7dc'); rr(g, 72, 40, 6, 1, '#9bb7dc');
        stamp(g, 83, 37, ['D....', 'DD...', 'DwD..', 'DwwD.', 'DDDD.'], { D: '#173a6a', w: '#ffffff' });
      } else {
        dsc(g, 24, 14, 4, '#173a6a');
        stamp(g, 21, 11, ['.#####.', '#.....#', '..###..', '.#...#.', '...#...'], { '#': '#ffffff' });
      }
    },
    post(g, t, x0) {                                                       // серверна шафа з лампочками
      rr(g, x0, 50, 5, 12, '#173a6a'); rr(g, x0 + 1, 51, 3, 10, '#2a4468');
      for (let i = 0; i < 4; i++) { px(g, x0 + 1, 52 + i * 2, (Math.floor(t * 3) + i) % 2 ? '#4cd964' : '#ff8a3d'); px(g, x0 + 2, 52 + i * 2, '#8fb0d8'); px(g, x0 + 3, 52 + i * 2, '#8fb0d8'); }
      px(g, x0 + 2, 49, '#8fb0d8');
    },
    top(g, t, s, u) {                                                      // вай-фай і сердечка-лайки
      const lv = Math.floor(t * 3) % 4;
      px(g, 64, 14, '#2f7fd6');
      [3, 6, 9].forEach((r, i) => { if (lv > i) for (let a = 225; a <= 315; a += 6) px(g, 64 + Math.cos(a * Math.PI / 180) * r, 14 + Math.sin(a * Math.PI / 180) * r, '#2f7fd6'); });
      if (s > 0.6) [0, 1].forEach(k => { const ph = (t * 0.55 + k * 0.5) % 1; g.globalAlpha = 1 - ph; heart(g, 99 + Math.sin(ph * 6 + k) * 4, 42 - ph * 22, '#ff4d6d'); g.globalAlpha = 1; });
    }
  });

  /* 5. ЕКО: зелене й крем, листок, вази з рослинами, вітряк, метелики */
  T.push({
    id: 'eco',
    c1: '#3f9a4d', c2: '#f4efd2', cap: '#2f6a3a', shade: '#c8dcb4', trim: '#e8d27a', door: '#1a2a18', out: '#1f3a22',
    flag: ['#3f9a4d', '#fff4dc', '#e8d27a'],
    plat: { d: '#4a3a22', m: '#8a6a3a', hi: '#c8a35a', lo: '#5a4426', dash: '#8ed46a', hitch: '#c8a35a', lt: ['#8ed46a', '#ffe08a'] },
    tyre: ['#4a3a22', '#a8803f', '#c8a35a', '#6a4a2a'], rim: ['#8ed46a', CR], hub: '#8a6a3a', ptr: '#3f9a4d',
    cl: { kind: 'leaf', suit: '#7ac26a', legA: '#8a6a3a', legB: '#3f9a4d', shoe: '#5a4426', wig: '#ef8fa3', star: '#fff4dc', ruff: '#f4efd2', ruff2: '#8ed46a', hat: '#4f9a3a', tip: '#ef8fa3' },
    win: { sky: '#cdeeb8', beam: '#ffffff', floor: '#5fae4f', line: '#8ed46a', dot: ['#ef8fa3', '#ffe08a'], conf: ['#8ed46a', '#ef8fa3', '#ffe08a', '#ffffff'],
      extra(g, t) {
        dsc(g, 62, 8, 5, '#ffe08a');
        [[0, 0, '#ffb347'], [1, 2.4, '#ef8fa3']].forEach(([i, ph, c]) => { const x = 14 + i * 40 + Math.sin(t * 0.9 + ph) * 8, y = 14 + Math.sin(t * 1.7 + ph) * 5, w = Math.floor(t * 8) % 2; rr(g, x - 2, y - w, 2, 2, c); rr(g, x + 1, y - w, 2, 2, c); px(g, x, y + 1, '#2f6a3a'); });
      } },
    gl: { kind: 'leaf', cols: ['#8ed46a', '#3f9a4d', '#ef8fa3'], str: '#2f6a3a' },
    paint(g, kind, h) {
      if (kind === 'main') {
        stamp(g, 77, 28, ['...D...', '..DgD..', '.DgvgD.', 'DggvggD', 'DggvggD', '.DgvgD.', '..DvD..', '...v...'], { D: '#1f3a22', g: '#8ed46a', v: '#2f6a3a' });
        for (let x = 49; x <= 111; x += 5) { if (x > 68 && x < 93) continue; const y = h.edge(x) + 1; rr(g, x, y, 1, 3, '#2f6a3a'); px(g, x + 1, y + 2, '#8ed46a'); }
      } else { px(g, 24, 14, '#ffe08a'); px(g, 24, 12, '#ffffff'); px(g, 24, 16, '#ffffff'); px(g, 22, 14, '#ffffff'); px(g, 26, 14, '#ffffff'); }
    },
    post(g, t, x0) {                                                       // ваза з рослиною
      const sw = Math.round(Math.sin(t * 2));
      rr(g, x0, 57, 5, 1, '#7a4f35'); rr(g, x0 + 1, 58, 3, 4, '#a8703f');
      rr(g, x0 + 2, 50, 1, 7, '#2f6a3a'); rr(g, x0, 52, 2, 2, '#8ed46a'); rr(g, x0 + 3, 50, 2, 2, '#8ed46a'); rr(g, x0 + 1 + sw, 47, 2, 2, '#8ed46a'); px(g, x0 + 2 + sw, 46, '#ef8fa3');
    },
    top(g, t) {                                                            // вітряк і метелики
      rr(g, 58, 25, 1, 13, '#e8ecf4'); px(g, 58, 37, '#8a96a8');
      const a = t * 3;
      for (let k = 0; k < 3; k++) { const aa = a + k * Math.PI * 2 / 3; for (let r = 1; r <= 6; r++) { px(g, 58 + Math.cos(aa) * r + 1, 24 + Math.sin(aa) * r + 1, '#8a96a8'); px(g, 58 + Math.cos(aa) * r, 24 + Math.sin(aa) * r, '#f4f4f4'); } }
      dsc(g, 58, 24, 1, '#c9d6e8');
      [[0, '#ffb347'], [2.4, '#ef8fa3']].forEach(([ph, c], i) => { const x = 112 + i * 14 + Math.sin(t * 0.9 + ph) * 9, y = 30 + i * 8 + Math.sin(t * 1.7 + ph) * 5, w = Math.floor(t * 8) % 2; rr(g, x - 2, y - w, 2, 2, c); rr(g, x + 1, y - w, 2, 2, c); px(g, x, y + 1, '#2f6a3a'); });
    }
  });

  /* 6. КОСМОС: індиго й срібло, планета з кільцем, зорі, НЛО, антена; платформа ширяє на двигунах */
  T.push({
    id: 'space',
    c1: '#3d4a9c', c2: '#c9d6e8', cap: '#8a96a8', shade: '#6a78a0', trim: '#7ad8ff', door: '#070d1c', out: '#0f1838',
    flag: ['#1d2a5c', '#7ad8ff', '#7ad8ff'], hover: true,
    plat: { d: '#10182c', m: '#5a6a8a', hi: '#a8b8d0', lo: '#2a3450', dash: '#7ad8ff', hitch: '#e8863c', lt: ['#7ad8ff', '#ffffff'] },
    tyre: ['#10182c', '#5a6a8a', '#7ad8ff', '#ffffff'], rim: ['#7ad8ff', '#ffffff'], hub: '#e8863c', ptr: '#7ad8ff',
    cl: { kind: 'helmet', suit: '#e8ecf4', legA: '#c9d6e8', legB: '#e8ecf4', shoe: '#e8863c', wig: '#7ad8ff', star: '#7ad8ff', ruff: '#c9d6e8', ruff2: '#e8863c', hat: '#bfe8ff', tip: '#ffffff' },
    win: { sky: '#0a1230', beam: '#16215a', floor: '#6a78a0', line: '#a8b8d0', dot: ['#4a5878', '#8a96a8'], conf: ['#7ad8ff', '#ffe08a', '#ffffff', '#ef8fa3'],
      extra(g, t) {
        for (let i = 0; i < 14; i++) if ((Math.floor(t * 2) + i) % 4) px(g, (i * 23) % 72, (i * 13) % 30, i % 3 ? '#ffffff' : '#7ad8ff');
        for (let a = 0; a < 6.28; a += 0.2) if (Math.sin(a) < 0) px(g, 60 + Math.cos(a) * 9, 10 + Math.sin(a) * 2.5, '#ffe08a');
        dsc(g, 60, 10, 5, '#e8863c'); px(g, 58, 8, '#ffc27a'); rr(g, 61, 12, 3, 2, '#b8581c');
        for (let a = 0; a < 6.28; a += 0.2) if (Math.sin(a) >= 0) px(g, 60 + Math.cos(a) * 9, 10 + Math.sin(a) * 2.5, '#ffe08a');
        [[10, 37, 4], [44, 38, 3], [64, 36, 3]].forEach(c => rr(g, c[0], c[1], c[2], 1, '#4a5878'));
      } },
    gl: { kind: 'star', cols: ['#ffe08a', '#ffffff', '#7ad8ff'], str: '#6a78a0' },
    paint(g, kind) {
      if (kind === 'main') {
        [[72, 30], [89, 29], [75, 41], [86, 42], [82, 26], [69, 37], [92, 37]].forEach((p, i) => px(g, p[0], p[1], i % 2 ? '#ffffff' : '#7ad8ff'));
        for (let a = 0; a < 6.28; a += 0.15) if (Math.sin(a) < 0) px(g, 80 + Math.cos(a) * 7, 34 + Math.sin(a) * 2, '#ffe08a');
        dsc(g, 80, 34, 4, '#e8863c'); px(g, 78, 32, '#ffc27a'); rr(g, 81, 36, 3, 1, '#b8581c');
        for (let a = 0; a < 6.28; a += 0.15) if (Math.sin(a) >= 0) px(g, 80 + Math.cos(a) * 7, 34 + Math.sin(a) * 2, '#ffe08a');
      } else { px(g, 20, 14, '#ffffff'); px(g, 28, 12, '#7ad8ff'); px(g, 25, 17, '#ffffff'); dsc(g, 24, 14, 1, '#ffe08a'); }
    },
    post(g, t, x0) {                                                       // антена-маяк
      rr(g, x0 + 2, 52, 1, 10, '#a8b8d0'); rr(g, x0 + 1, 61, 3, 1, '#5a6a8a');
      rr(g, x0, 51, 5, 1, '#e8ecf4'); px(g, x0, 50, '#e8ecf4'); px(g, x0 + 4, 50, '#e8ecf4');
      px(g, x0 + 2, 50, Math.floor(t * 2) % 2 ? '#ff4d4d' : '#7ad8ff');
    },
    top(g, t) {                                                            // тарілка і маячок
      const x = 34, y = 12 + Math.round(Math.sin(t * 2) * 2);
      rr(g, x + 3, y + 3, 11, 1, '#7ad8ff'); rr(g, x, y + 1, 17, 2, '#a8b8d0'); rr(g, x + 3, y, 11, 1, '#c9d6e8'); rr(g, x + 6, y - 2, 5, 2, '#7ad8ff'); px(g, x + 7, y - 2, '#ffffff');
      for (let i = 0; i < 4; i++) px(g, x + 3 + i * 4, y + 2, (Math.floor(t * 4) + i) % 2 ? '#ffe08a' : '#e8863c');
      px(g, 80, 2, Math.floor(t * 2) % 2 ? '#ff4d4d' : '#7a1f2e');
    }
  });

  /* 7. НЕОН: чорно-фіолетове шатро з неоновим контуром, ринг-вивіска, неонові стовпчики й стрілки */
  T.push({
    id: 'neon',
    c1: '#2b0f55', c2: '#10143a', cap: '#ff3fd0', shade: '#4a2a7a', trim: '#35f0ff', door: '#05020f', out: '#35f0ff',
    flag: ['#10143a', '#35f0ff', '#ff3fd0'],
    plat: { d: '#05020f', m: '#1b1033', hi: '#ff3fd0', lo: '#05020f', dash: '#35f0ff', hitch: '#ffe14a', lt: ['#35f0ff', '#ff3fd0'] },
    tyre: ['#35f0ff', '#1b1033', '#ff3fd0', '#35f0ff'], rim: ['#35f0ff', '#ff3fd0'], hub: '#ffe14a', ptr: '#35f0ff',
    cl: { kind: 'top', suit: '#2b0f55', legA: '#ff3fd0', legB: '#35f0ff', shoe: '#ffe14a', wig: '#7aff7a', star: '#35f0ff', ruff: '#35f0ff', ruff2: '#ff3fd0', hat: '#35f0ff', tip: '#ff3fd0' },
    win: { sky: '#10062a', beam: '#1b1033', floor: '#05020f', line: '#ff3fd0', dot: ['#35f0ff', '#ff3fd0'], conf: ['#35f0ff', '#ff3fd0', '#ffe14a', '#7aff7a'],
      extra(g, t) {
        [[3, 12, 10], [15, 7, 15], [32, 14, 8], [42, 5, 17], [56, 11, 11], [66, 8, 14]].forEach((b, i) => { const y = 34 - b[2]; rr(g, b[0], y, b[1], b[2], '#1b1033'); for (let k = 0; k < 4; k++) if ((Math.floor(t * 2) + i + k) % 3) px(g, b[0] + 1 + (k % 2) * 3, y + 2 + ((k / 2) | 0) * 4, k % 2 ? '#35f0ff' : '#ff3fd0'); });
        for (let i = 0; i < 6; i++) if ((Math.floor(t * 3) + i) % 3) px(g, (i * 31) % 72, (i * 7) % 12, '#ffffff');
      } },
    gl: { kind: 'bulb', cols: ['#35f0ff', '#ff3fd0'], str: '#7a5cff' },
    paint(g, kind, h) {
      const NC = ['#35f0ff', '#ff3fd0'], cx = h.cx;
      if (kind === 'main') {
        for (let k = -4; k <= 4; k++) for (let y = h.ay + h.capH; y <= h.roofB + 1; y++) { const x = Math.round(cx + k * (y - h.ay + 2) / h.fan); if (y < h.edge(x)) px(g, x, y, NC[Math.abs(k) % 2]); }
        for (let x = cx - 34; x <= cx + 34; x++) {
          const edgeY = h.edge(x);
          if (Math.floor((x - cx + 200) / h.stripe) !== Math.floor((x - 1 - cx + 200) / h.stripe)) for (let y = edgeY + 1; y <= h.floor; y++) { if (Math.abs(x - cx) >= h.hwAt(y) - 1) break; if (y >= 48 && x > 68 && x < 92) continue; px(g, x, y, NC[Math.floor((x - cx + 200) / h.stripe) % 2]); }
          if (Math.abs(x - cx) < h.hwAt(edgeY) - 1) px(g, x, edgeY, NC[Math.floor((x - cx + 600) / h.scallop) % 2]);
        }
        dsc(g, 80, 32, 5, '#ff3fd0'); dsc(g, 80, 32, 4, '#10143a'); cross(g, 80, 32, '#35f0ff'); px(g, 78, 30, '#35f0ff'); px(g, 82, 30, '#35f0ff'); px(g, 78, 34, '#35f0ff'); px(g, 82, 34, '#35f0ff');
      } else { cross(g, 24, 14, '#35f0ff'); px(g, 22, 12, '#ff3fd0'); px(g, 26, 12, '#ff3fd0'); px(g, 22, 16, '#ff3fd0'); px(g, 26, 16, '#ff3fd0'); }
    },
    post(g, t, x0) {                                                       // неонові трубки
      const off = Math.floor(t * 7) % 9 === 0;
      g.globalAlpha = 0.3; rr(g, x0, 49, 5, 13, '#ff3fd0'); g.globalAlpha = 1;
      rr(g, x0 + 1, 50, 1, 11, off ? '#7a1f6a' : '#ff3fd0'); rr(g, x0 + 3, 50, 1, 11, '#35f0ff'); rr(g, x0, 61, 5, 1, '#05020f');
    },
    top(g, t) {                                                            // стрілки до входу й зірка на щоглі
      [0, 1, 2].forEach(i => {
        const x = 80, y = 38 + i * 4, on = Math.floor(t * 4) % 3 === i, c = on ? '#ffe14a' : (i % 2 ? '#ff3fd0' : '#35f0ff');
        for (let k = 0; k <= 3; k++) { px(g, x - 3 + k, y + k, c); px(g, x + 3 - k, y + k, c); }
      });
      cross(g, 80, 1, Math.floor(t * 5) % 2 ? '#ffe14a' : '#ff3fd0');
    }
  });

  /* 8. ЯПОНІЯ: червоно-біле шатро-«мааку», торії, норен у дверях, кам'яні ліхтарі, пелюстки сакури */
  T.push({
    id: 'japan',
    c1: '#c8322f', c2: '#fff4dc', cap: '#2f3a6a', shade: '#e6c9c0', trim: '#e8c860', door: '#2a1410', out: '#3a1f1a',
    flag: ['#c8322f', '#fff4dc', '#fff4dc'],
    plat: { d: '#2a1d1a', m: '#c9a86a', hi: '#e2c98a', lo: '#7a5a30', dash: '#c8322f', hitch: '#e8c860', lt: ['#c8322f', '#fff4dc'] },
    tyre: ['#2a1d1a', '#7a4f35', '#c8322f', '#e8c860'], rim: ['#c8322f', '#fff4dc'], hub: '#e8c860', ptr: '#c8322f',
    cl: { kind: 'kasa', suit: '#3d5a8c', legA: '#2a2a2a', legB: '#2a2a2a', shoe: '#c8322f', wig: '#ef8fa3', star: '#fff4dc', ruff: '#e8c860', ruff2: '#c8322f', hat: '#e8d49a', tip: '#c8322f' },
    win: { sky: '#ffe4ec', beam: '#ffffff', floor: '#a8703f', line: '#7a4f35', dot: ['#c8322f', '#fff4dc'], conf: ['#ef8fa3', '#ffffff', '#c8322f', '#e8c860'],
      extra(g, t) {
        dsc(g, 12, 9, 6, '#c8322f');
        for (let y = 0; y < 14; y++) { const hw = Math.round(2 + y * 0.9); rr(g, 54 - hw, 20 + y, hw * 2, 1, y < 4 ? '#ffffff' : '#7a8fb8'); }
        for (let i = 0; i < 6; i++) { const ph = (t * 0.35 + i / 6) % 1; px(g, (i * 13 + Math.sin(ph * 9 + i) * 5 + 72) % 72, ph * 36, i % 2 ? '#ef8fa3' : '#ffffff'); }
      } },
    gl: { kind: 'lantern', cols: ['#c8322f', '#fff4dc', '#e8c860'], str: '#2a1d1a' },
    paint(g, kind) {
      if (kind === 'main') {
        const K = '#2a1d1a', R = '#e0452f';
        rr(g, 59, 37, 43, 1, K); rr(g, 59, 36, 1, 1, K); rr(g, 101, 36, 1, 1, K); rr(g, 60, 38, 41, 1, R); rr(g, 60, 39, 41, 1, K);
        rr(g, 65, 43, 31, 1, K); rr(g, 65, 44, 31, 1, R); rr(g, 65, 45, 31, 1, K);
        [66, 92].forEach(x => { rr(g, x, 40, 1, 22, K); rr(g, x + 1, 40, 1, 22, R); rr(g, x + 2, 40, 1, 22, K); });
        rr(g, 73, 50, 15, 1, K); rr(g, 73, 51, 15, 7, '#2f4a8c'); rr(g, 77, 52, 1, 6, '#14224a'); rr(g, 83, 52, 1, 6, '#14224a'); dsc(g, 80, 54, 1, '#ffffff'); rr(g, 73, 57, 15, 1, '#14224a');
      } else { dsc(g, 24, 15, 1, '#ffe08a'); [[24, 12], [27, 14], [26, 17], [22, 17], [21, 14]].forEach(p => px(g, p[0], p[1], '#ef8fa3')); }
    },
    post(g, t, x0) {                                                       // кам'яний ліхтар
      rr(g, x0 + 1, 49, 3, 1, '#9a9a9a'); rr(g, x0, 50, 5, 1, '#8a8a8a'); rr(g, x0 + 1, 51, 3, 3, '#3a3a3a');
      px(g, x0 + 2, 52, Math.floor(t * 6) % 3 ? '#ffb347' : '#ffe08a'); g.globalAlpha = 0.25; dsc(g, x0 + 2, 52, 3, '#ffb347'); g.globalAlpha = 1;
      rr(g, x0, 54, 5, 1, '#8a8a8a'); rr(g, x0 + 2, 55, 1, 4, '#9a9a9a'); rr(g, x0, 59, 5, 2, '#6a6a6a'); px(g, x0 + 2, 48, '#9a9a9a');
    },
    top(g, t, s) {                                                         // пелюстки сакури
      rr(g, 79, 0, 3, 2, '#e8c860');
      if (s > 0.5) for (let i = 0; i < 7; i++) { const ph = (t * 0.28 + i / 7) % 1, x = 22 + i * 19 + Math.sin(ph * 10 + i) * 5, y = 8 + ph * 66; px(g, x, y, i % 2 ? '#ef8fa3' : '#ffffff'); px(g, x + 1, y + 1, '#ef8fa3'); }
    }
  });

  return T;
})();

// гірлянда від щогли до верхівок малих шатер; u — допоміжні значення з CIRCUS_ART.draw
function circusGarland(g, th, t, u) {
  const a = u.e(0.78, 0.98); if (a <= 0.02) return;
  const G = th.gl, y0 = 15 + u.sink, rr = u.rr;
  g.globalAlpha = a;
  [[80, 30], [80, 130]].forEach(([xa, xb], side) => {
    const n = Math.abs(xb - xa), dir = xb > xa ? 1 : -1, yb = 41;
    for (let i = 0; i <= n; i++) {
      const k = i / n, x = xa + dir * i, y = Math.round(y0 + (yb - y0) * k + 6 * Math.sin(Math.PI * k));
      rr(g, x, y, 1, 1, G.str);
      if (i % 6 === 3 && i > 3 && i < n - 2) {
        const j = Math.floor(i / 6) + side, c = G.cols[j % G.cols.length], on = (Math.floor(t * 3) + j) % 3;
        switch (G.kind) {
          case 'flag': rr(g, x - 1, y + 1, 3, 1, c); rr(g, x, y + 2, 1, 1, c); break;
          case 'bulb': g.globalAlpha = a * (on ? 0.5 : 0.2); rr(g, x - 1, y, 4, 4, c); g.globalAlpha = a; rr(g, x, y + 1, 2, 2, G.cols[(j + Math.floor(t * 2)) % G.cols.length]); break;
          case 'lantern': rr(g, x - 1, y + 1, 3, 1, G.str); rr(g, x - 1, y + 2, 3, 2, c); rr(g, x, y + 2, 1, 1, '#fff4dc'); rr(g, x, y + 4, 1, 1, G.str); break;
          case 'leaf': rr(g, x, y + 1, 2, 1, c); rr(g, x - 1, y + 2, 2, 1, c); rr(g, x - 1, y + 1, 1, 1, '#2f6a3a'); break;
          case 'star': rr(g, x, y + 1, 1, 1, c); rr(g, x - 1, y + 2, 3, 1, c); rr(g, x, y + 3, 1, 1, c); break;
          default: rr(g, x, y + 1, 2, 2, c);
        }
      }
    }
  });
  g.globalAlpha = 1;
}
