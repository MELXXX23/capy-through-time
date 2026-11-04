//#part 100_b3_chibi_models.js
/* Моделі звірят-покупців (р. 78). Полотно 16×21 до контуру, 18×23 після (ці розміри тримає одяг героїв, не міняти). Голова 14×12 (рядки 5…16), у грі малюються 1:1.
   Правила: тіло й обличчя строго симетричні відносно середини полотна (між x=7 і x=8), тож у дзеркалі нічого не їде; світло зліва згори;
   хвіст завжди ліворуч — коли звір іде праворуч (спрайт без дзеркала), хвіст позаду, а предмет у лапах попереду.
   Кадри: 0 — стоїть, 1 — крок лівою, 2 — крок правою (цикл ходьби 0,1,0,2). Лапки: 2×2 при боках, рядки ARM_Y[кадр]. */
const CHIBI_ARM_Y = [[16, 16], [17, 15], [15, 17]];
const CHIBI_MODELS = (function () {
  const E = '#2a1d1a', WH = '#ffffff', PK = '#ef8fa3', HY = 11;
  let G = null;
  const rect = (x, y, w, h, col) => { G.fillStyle = col; G.fillRect(x, y, w, h); };
  const px = (x, y, col) => rect(x, y, 1, 1, col);
  const mr = (x, y, w, h, col) => { rect(x, y, w, h, col); rect(16 - x - w, y, w, h, col); };     // прямокутник і його дзеркало
  const mp = (x, y, col) => { px(x, y, col); px(15 - x, y, col); };                                 // піксель і його дзеркало
  const rows = (x0, y0, list, col) => list.forEach((r, j) => { if (r) rect(x0 + r[0], y0 + j, r[1], 1, col); });   // [зсув, ширина] на кожен рядок
  const mrows = (x0, y0, list, col) => list.forEach((r, j) => { if (r) mr(x0 + r[0], y0 + j, r[1], 1, col); });
  const ell = (cx, cy, rx, ry, col) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry; if (dx * dx + dy * dy <= 1) px(x, y, col);
    }
  };
  const mell = (cx, cy, rx, ry, col) => { ell(cx, cy, rx, ry, col); ell(15 - cx, cy, rx, ry, col); };
  // Об'ємна куля: основа, серпик тіні знизу справа, блік зліва згори
  const ball = (cx, cy, rx, ry, b, s, h) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x - cx) / rx, ny = (y - cy) / ry; if (nx * nx + ny * ny > 1) continue;
      const lx = nx + 0.17, ly = ny + 0.22; let c = b;
      if (lx * lx + ly * ly > 0.96) c = s;
      else if (h) { const hx = nx + 0.42, hy = ny + 0.56; if (hx * hx + hy * hy * 2 < 0.075) c = h; }
      px(x, y, c);
    }
  };
  const head = (p, b) => ball(7.5, HY - 0.5, 6.7, 5.7, b || p.b, p.s, p.h);
  const legs = (f, fc, fh, fs) => {
    [[3, f === 1 ? 18 : 19], [9, f === 2 ? 18 : 19]].forEach(q => { const x = q[0], y = q[1]; rect(x, y, 4, 2, fc); rect(x, y, 2, 1, fh || fc); px(x + 3, y + 1, fs || fc); });
  };
  const torso = (p, belly, bs) => {
    rect(4, 15, 8, 1, p.b); rect(3, 16, 10, 3, p.b); rect(4, 19, 8, 1, p.s);
    rect(12, 16, 1, 3, p.s); rect(11, 18, 1, 1, p.s); rect(3, 18, 1, 1, p.s); rect(4, 16, 8, 1, p.s);          // тінь від голови, край, низ
    if (belly) { rect(6, 16, 4, 1, belly); rect(5, 17, 6, 2, belly); rect(6, 19, 4, 1, bs || belly); }
  };
  const arms = (p, f, c, cs, ch) => {
    const A = CHIBI_ARM_Y[f], col = c || p.b, sh = cs || p.s, hi = ch || p.h;
    rect(2, A[0], 2, 2, col); px(2, A[0], hi); px(3, A[0] + 1, sh);
    rect(12, A[1], 2, 2, col); px(12, A[1], hi); px(13, A[1] + 1, sh);
  };
  const eye = (x, y) => { rect(x, y, 2, 3, E); px(x, y, WH); px(x + 1, y + 2, '#54423c'); };
  const eyes = () => { eye(4, HY - 2); eye(10, HY - 2); };
  const M = {
    dog(p, f) {
      const EAR = '#6f4526', EARS = '#57351c', MZ = '#e8c08a', MZS = '#d0a266', w = f === 1 ? -1 : f === 2 ? 1 : 0;
      rect(1 + w, 12, 2, 2, p.b); px(1 + w, 12, p.h); rect(1 + (w > 0 ? 1 : 0), 14, 2, 2, p.b); px(2, 16, p.s); px(1 + (w > 0 ? 1 : 0), 15, p.s);   // хвіст виляє
      torso(p, MZ, MZS); legs(f, p.s, p.b, EARS); arms(p, f);
      head(p);
      ell(4.5, 9.4, 2.1, 2.3, '#9c6636'); px(3, 8, p.b);                                                         // темніша пляма навколо лівого ока
      ell(7.5, 13.3, 3.5, 2.3, MZ); rect(8, 15, 3, 1, MZS); px(11, 14, MZS);
      eyes();
      rect(6, 12, 4, 1, E); rect(7, 13, 2, 1, E); px(6, 12, '#6a544c');                                          // великий ніс із відблиском
      px(6, 14, '#8a5a38'); px(9, 14, '#8a5a38'); rect(7, 15, 2, 1, PK);                                          // усмішка і язик
      mp(3, 13, '#d9895f');
      mrows(0, 6, [[3, 2], [2, 3], [1, 3], [0, 3], [0, 3], [0, 3], [0, 3], [1, 2]], EAR);                         // висячі вуха спереду голови
      mp(1, 12, EARS); mp(2, 12, EARS); mp(1, 13, EARS); mp(2, 13, EARS); px(3, 7, '#8a5a34'); px(2, 8, '#8a5a34'); px(1, 9, '#8a5a34');
      rect(4, 16, 8, 1, '#d23a3a'); rect(4, 16, 1, 1, '#e8665a'); rect(7, 17, 2, 1, '#f2c94c'); px(8, 17, '#c98a1e');   // нашийник із жетоном
    },
    hedgehog(p, f) {
      const Q = '#5a4030', Q2 = '#7a5a3c', QT = '#d8bc90', F = '#f0d8b0', FS = '#d9bd92';
      // голки: темний капюшон і зубчастий край, кінчики світлі
      ell(7.5, 10, 6.9, 5.8, Q2);
      [[7, 3], [5, 3], [3, 4], [1, 6], [0, 9], [0, 12]].forEach(q => {
        const x = q[0], y = q[1], s = x === 0 ? 1 : 0;
        mp(x, y, QT); mp(x, y + 1, Q); if (!s) { mp(x - 1, y + 1, Q); mp(x + 1, y + 1, Q); mp(x, y + 2, Q2); } else { mp(x, y - 1, Q); mp(x + 1, y, Q); mp(x + 1, y + 1, Q); }
      });
      torso(p, F, FS); legs(f, p.s, p.b, Q); arms(p, f);
      mp(2, 15, Q); mp(1, 16, QT); mp(2, 16, Q);                                                                  // голки на боках тулуба
      ball(7.5, 12.2, 5.7, 4.4, F, FS, null);                                                                     // світла мордочка-серце
      rect(7, 8, 2, 1, Q2); rect(7, 9, 2, 1, FS);
      [[3, 6], [6, 5], [9, 5], [12, 6], [2, 8], [13, 8], [5, 7], [10, 7]].forEach(q => { px(q[0], q[1], QT); px(q[0], q[1] + 1, Q); });     // штрихи голок на лобі
      eyes();
      rect(7, 13, 2, 1, E); px(7, 13, '#6a544c'); px(7, 14, '#8a6a50'); px(8, 14, '#8a6a50');                      // носик і рот
      mp(3, 13, '#ee9a8c'); mp(4, 13, '#f4b8a0');
    },
    mouse(p, f) {
      const MZ = '#d9d5d0', W2 = '#5f5a58', w = f === 1 ? -1 : f === 2 ? 1 : 0;
      // довгий рожевий хвіст позаду
      [[2, 19], [1, 19], [0, 18], [0, 17], [0, 16 + w], [1, 15 + w]].forEach(q => px(q[0], q[1], PK));
      mell(2.5, 6, 2.9, 2.9, p.b); mp(1, 4, p.h); mp(2, 4, p.h); mell(2.5, 6.3, 1.6, 1.6, PK); mp(2, 7, '#d4708a'); mp(3, 7, '#d4708a');   // великі круглі вуха
      torso(p, MZ, p.h); legs(f, PK, '#f6b4c2', '#d4708a'); arms(p, f);
      head(p);
      ell(7.5, 13.4, 3.4, 2.1, MZ);
      eyes();
      rect(7, 12, 2, 1, PK); rect(7, 13, 2, 1, '#d4708a');                                                         // рожевий ніс
      rect(7, 14, 2, 1, WH);                                                                                        // зубки
      mp(2, 12, W2); mp(3, 13, W2); mp(2, 14, W2);                                                                  // вуса
    },
    hamster(p, f) {
      const TOP = '#e0a860', TOPS = '#c98e48', CR = '#fff4dc', CRS = '#ecdcb4';
      mell(3.5, 5.6, 1.9, 1.9, TOP); mp(3, 5, PK); mp(4, 5, '#f6b4c2'); mp(3, 6, '#d4708a');                        // маленькі круглі вушка
      torso({ b: CR, s: CRS }, CR, CRS); legs(f, '#f4a8b8', '#ffc8d4', '#d98aa0'); arms(p, f, '#f4a8b8', '#d98aa0', '#ffc8d4');
      ball(7.5, HY + 0.3, 6.9, 5, p.b, p.s, null);
      // рудий верх голови, світла смужка посередині
      for (let y = 6; y <= 11; y++) for (let x = 1; x <= 14; x++) {
        const nx = (x - 7.5) / 6.9, ny = (y - 11.3) / 5; if (nx * nx + ny * ny > 1) continue;
        if (y <= 8 || Math.abs(x - 7.5) > 5.4 - (y - 8) * 0.2) px(x, y, (x > 10 && y > 7) ? TOPS : TOP);
      }
      rect(7, 6, 2, 4, p.h); mp(4, 7, '#ecc07e');
      mell(2.8, 13.2, 2.6, 2.3, CR); mp(2, 14, CRS); mp(3, 15, CRS);                                                 // пухкі щічки
      ell(7.5, 13.6, 2.6, 1.8, CR);
      eyes();
      rect(7, 12, 2, 1, PK); px(6, 13, '#a07850'); px(9, 13, '#a07850'); rect(7, 13, 2, 1, '#a07850');               // ніс і ротик
      rect(7, 14, 2, 1, WH);
      mp(2, 13, '#ffb0a0'); mp(3, 13, '#ffb0a0');
    },
    duck(p, f) {
      const B = '#e8863c', BL = '#f6a24a', BD = '#c96d28', w = f === 1 ? -1 : f === 2 ? 1 : 0;
      rows(0, 14, [[0, 2], [0, 3], [1, 3]], p.b); px(0, 14 + 0, p.h);                                               // загострений хвостик позаду
      if (w) px(w < 0 ? 0 : 1, 13, p.h);
      torso(p, p.h, p.b);
      [[2, f === 1 ? 18 : 19], [9, f === 2 ? 18 : 19]].forEach(q => { const x = q[0], y = q[1]; rect(x + 1, y, 3, 1, B); rect(x, y + 1, 5, 1, B); px(x + 1, y, BL); px(x + 1, y + 1, BD); px(x + 3, y + 1, BD); });   // широкі лапи-перетинки
      rect(1, CHIBI_ARM_Y[f][0], 3, 3, p.b); px(1, CHIBI_ARM_Y[f][0], p.h); px(2, CHIBI_ARM_Y[f][0], p.h); rect(1, CHIBI_ARM_Y[f][0] + 2, 2, 1, p.s);    // крила
      rect(12, CHIBI_ARM_Y[f][1], 3, 3, p.b); px(12, CHIBI_ARM_Y[f][1], p.h); rect(13, CHIBI_ARM_Y[f][1] + 2, 2, 1, p.s);
      head(p);
      rows(7, 4, [[1, 2], [0, 2]], p.s); px(8, 4, p.h); px(7, 5, p.b);                                               // чубчик-завиток
      eyes();
      // широкий плаский дзьоб
      rect(5, 12, 6, 1, BL); rect(4, 13, 8, 1, B); rect(5, 14, 6, 1, BD); px(4, 13, BL);
      px(6, 12, BD); px(9, 12, BD);
      mp(2, 12, '#ffb0a0'); mp(3, 12, '#ffb0a0');
    }
  };
  function build(a, f, p, mk, outline) {
    const S = mk(16, 21); G = S.g; G.imageSmoothingEnabled = false;
    M[a](p, f);
    return outline(S, p.o);
  }
  return { has: a => !!M[a], build };
})();
