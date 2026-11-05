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
    },
    bunny(p, f) {
      const IN = '#f6b4c2';
      rect(0, 18, 3, 2, WH); px(2, 19, p.s); px(0, 19, p.s);                                                         // хвостик-помпон
      mell(4.5, 3, 1.9, 3.4, p.b); mr(4, 2, 2, 4, PK); mr(4, 1, 2, 1, IN); mr(3, 3, 1, 3, p.s);                       // довгі вуха
      if (f === 1) { px(3, 0, p.b); px(3, 1, p.b); } if (f === 2) { px(12, 0, p.b); px(12, 1, p.b); }                 // на кроці кінчик вуха гойдається
      torso(p, WH, p.h); legs(f, p.s, p.b, '#c9b89a'); arms(p, f);
      head(p);
      eyes();
      rect(7, 12, 2, 1, PK); rect(7, 13, 2, 1, '#b89a80'); px(6, 14, '#b89a80'); px(9, 14, '#b89a80');                // носик і ротик
      mp(2, 13, IN); mp(3, 13, IN);
    },
    cat(p, f) {
      const CR = '#fff4dc', CRS = '#ecdcb4', w = f === 1 ? -1 : f === 2 ? 1 : 0;
      rect(1, 14, 2, 5, p.b); px(2, 18, p.s); rect(1 + (w > 0 ? 1 : 0), 12, 2, 2, p.b); rect(Math.max(0, 1 + w), 10, 2, 2, CR); px(Math.max(0, 1 + w), 12, p.s);   // хвіст угору, білий кінчик
      mrows(2, 2, [[0, 1], [0, 2], [0, 3], [0, 4], [1, 4]], p.b); mp(3, 4, PK); mp(3, 5, PK); mp(4, 5, PK);          // гострі вуха
      torso(p, CR, CRS); legs(f, p.s, p.b, p.o); arms(p, f);
      head(p);
      rect(7, 6, 2, 3, p.s); mr(5, 6, 1, 2, p.s); mp(1, 10, p.s); mp(2, 10, p.s);                                     // смужки на лобі й щоках
      ell(7.5, 13.5, 3, 1.9, CR); mr(1, 12, 2, 1, CR);                                                                // мордочка, вуса
      eyes();
      rect(7, 12, 2, 1, PK); rect(7, 13, 2, 1, p.o); px(6, 14, p.o); px(9, 14, p.o);
      mp(3, 13, '#f6a0a0');
    },
    pig(p, f) {
      const SN = '#e888a0', D = '#8a4258';
      [[1, 14], [0, 15], [1, 16], [2, 15], [2, 17]].forEach(q => px(q[0], q[1], p.s));                                // хвіст-завиток
      mrows(1, 3, [[1, 2], [0, 4], [0, 4], [1, 3]], p.b); mp(3, 4, SN); mp(2, 4, SN); mp(2, 5, SN); mp(3, 5, '#c97890');   // вуха
      torso(p, p.h, p.b); legs(f, p.s, p.b, D); arms(p, f);
      head(p);
      eyes();
      ell(7.5, 13.2, 3.5, 2.2, SN); rect(6, 12, 4, 1, p.h); rect(6, 13, 1, 1, D); rect(9, 13, 1, 1, D); rect(7, 15, 2, 1, D);   // п'ятачок
      mp(2, 13, '#ff9ab0'); mp(3, 13, '#ff9ab0');
    },
    sheep(p, f) {
      const F = '#6a5a52', FD = '#4a3e38';
      // кудлата вовна: горбики по краю голови
      [[3, 6.4, 2.4, 2], [5.4, 5, 2.2, 1.7], [1.8, 9.2, 1.7, 1.9], [2, 13, 1.8, 1.8]].forEach(q => mell(q[0], q[1], q[2], q[3], p.b));
      torso(p, p.h, p.b); [[5, 17], [9, 16], [7, 18], [10, 18]].forEach(q => px(q[0], q[1], p.s));
      legs(f, FD, F, E); arms(p, f);
      ball(7.5, 10.5, 6.5, 5.6, p.b, p.s, p.h);
      [[2, 7], [13, 8], [1, 11], [3, 15], [12, 15], [14, 12]].forEach(q => px(q[0], q[1], p.s));
      ell(7.5, 11.5, 4.4, 4.1, F); rect(5, 15, 6, 1, FD);                                                             // темне личко
      mell(5.4, 7.4, 1.8, 1.4, p.b); ell(7.5, 7, 2, 1.4, p.b); px(5, 7, WH); px(7, 6, WH); mp(6, 8, p.s);             // чубчик
      mell(0.9, 10.4, 1.5, 1.1, FD); mp(1, 10, F);                                                                    // вушка
      mr(5, 10, 2, 2, WH); mp(5, 11, E); mp(5, 10, E);                                                                // очі на темному
      rect(7, 13, 2, 1, '#2f2522'); px(7, 14, '#2f2522'); px(8, 14, '#2f2522');
    },
    cow(p, f) {
      const D = '#3a2a24', SN = '#f4a8b8', SD = '#a8586c';
      px(2, 16, D); rect(1, 16, 1, 3, p.s); rect(0, 19, 2, 1, D);                                                     // хвіст із китицею
      mr(3, 3, 2, 3, '#e8d8a8'); mp(3, 3, '#fff4dc'); mp(4, 5, '#c9b888');                                            // ріжки
      mell(1, 8.4, 1.8, 1.2, p.b); mp(1, 9, SN);                                                                      // вуха
      torso(p, p.h, p.b); rect(10, 17, 3, 2, D); rect(3, 16, 2, 2, D); legs(f, D, '#5a4a44', E); arms(p, f);
      head(p);
      ell(4.4, 7.4, 2.6, 2, D); px(3, 6, '#5a4a44'); rect(11, 13, 3, 2, D); px(12, 12, D);                            // плями
      eyes();
      ell(7.5, 13.4, 3.9, 2.2, SN); rect(6, 12, 4, 1, '#ffc8d4'); px(6, 13, SD); px(9, 13, SD); rect(7, 15, 2, 1, SD);
      rect(5, 16, 6, 1, '#c4553d'); rect(7, 17, 2, 2, '#f2c94c'); px(8, 18, '#c98a1e'); px(7, 17, '#fff0a0');         // дзвіночок
    },
    squirrel(p, f) {
      const CR = '#fff0d0', w = f === 1 ? -1 : f === 2 ? 1 : 0;
      // пишний хвіст позаду, світліший за тіло, зі смугою; кінчик гойдається
      ell(1.4, 15, 1.9, 4.8, p.h); rect(0, 10, 3, 2, p.h); px(Math.max(0, w), 9, p.h); px(1 + w, 9, p.h);
      rect(1, 12, 1, 7, p.b); px(0, 13, p.b); px(0, 15, p.b); px(2, 18, p.s); px(1, 19, p.s);
      mr(3, 3, 2, 3, p.b); mp(3, 2, E); px(4, 2, E); px(11, 2, E); mp(4, 4, PK);                                       // вуха з китичками
      torso(p, CR, '#e8d8b0'); legs(f, p.s, p.b, p.o); arms(p, f);
      head(p);
      ell(7.5, 13.4, 3.3, 2.1, CR);
      eyes();
      rect(7, 12, 2, 1, E); px(7, 12, '#6a544c'); rect(7, 14, 2, 1, WH);                                               // ніс, зубки
      mp(3, 13, '#ff9a7a'); mp(2, 13, '#ff9a7a');
    },
    deer(p, f) {
      const A = '#7a5030', AL = '#a0764a', CR = '#fff4dc', MZ = '#e8c898';
      rect(0, 18, 3, 2, CR); px(2, 19, p.s);                                                                           // світлий хвостик
      mr(4, 1, 1, 5, A); mp(3, 2, A); mp(2, 1, A); mp(5, 3, A); mp(6, 2, A); mp(4, 1, AL); mp(2, 1, AL);               // роги
      mell(1.2, 8, 2, 1.3, p.b); mp(1, 8, PK); mp(2, 8, PK);
      torso(p, '#fff0d0', '#e8d8b0'); px(4, 16, CR); px(11, 17, CR); legs(f, A, p.s, '#4a2d18'); arms(p, f);
      head(p);
      [[5, 6], [10, 6], [7, 7], [3, 8], [12, 8]].forEach(q => px(q[0], q[1], CR));                                     // цяточки
      ell(7.5, 13.4, 3.1, 2.1, MZ);
      eyes(); mp(3, 9, '#5a3a1c');                                                                                     // вії
      rect(7, 12, 2, 1, E); px(7, 12, '#6a544c'); rect(7, 14, 2, 1, p.o);
      mp(3, 13, '#e89a7a');
    },
    raccoon(p, f) {
      const D = '#3a3a40', L = '#d8d8dc';
      rect(0, 13, 3, 6, p.b); rect(0, 14, 3, 1, D); rect(0, 16, 3, 1, D); rect(0, 18, 3, 1, D); rect(1, 12, 2, 1, D);  // смугастий хвіст
      mell(3, 5.4, 2.5, 2.4, p.b); mell(3, 5.6, 1.2, 1.2, D);                                                          // вуха
      torso(p, '#cfcfd2', p.h); legs(f, D, '#55555c', E); arms(p, f, D, E, '#55555c');
      head(p);
      rect(3, 7, 10, 1, L); rect(7, 6, 2, 3, D);                                                                       // світлі брови, смужка на лобі
      mr(1, 9, 6, 3, D); rect(7, 9, 2, 3, p.b); mp(1, 12, D); mp(2, 12, D);                                            // чорна маска
      mr(4, 9, 2, 3, WH); rect(5, 10, 1, 2, E); rect(10, 10, 1, 2, E);                                                 // очі
      ell(7.5, 13.6, 3, 1.9, L); rect(7, 12, 2, 1, E); px(7, 12, '#6a6a70'); px(7, 14, '#7c7c82'); px(8, 14, '#7c7c82');
    },
    penguin(p, f) {
      const BL = '#fff', A = CHIBI_ARM_Y[f];
      torso(p, WH, '#e4e4ee'); rect(5, 16, 6, 1, WH);
      legs(f, '#f08a2e', '#f6a24a', '#d4701c');
      rect(1, A[0], 3, 3, p.b); px(1, A[0], p.h); rect(1, A[0] + 2, 2, 1, p.s);                                         // крильця
      rect(12, A[1], 3, 3, p.b); px(12, A[1], p.h); rect(13, A[1] + 2, 2, 1, p.s);
      head(p); rect(7, 4, 2, 1, p.b);                                                                                   // чубчик
      ell(7.5, 12, 5.2, 3.8, WH); mell(5, 8.8, 2.4, 1.7, WH); rect(7, 8, 2, 2, p.b);                                     // біле личко-серце
      eyes();
      rect(6, 12, 4, 1, '#f6a24a'); rect(6, 13, 4, 1, '#f08a2e'); rect(7, 14, 2, 1, '#d4701c');
      mp(3, 13, '#ffb4c0'); mp(2, 13, '#ffd0d8');
    },
    koala(p, f) {
      const IN = '#f4eee6', N = '#3a3438';
      mell(2.4, 5.8, 3.3, 3.2, p.b); mp(1, 3, p.h); mp(0, 5, p.h); mell(2.4, 6.2, 1.8, 1.8, IN); mp(2, 7, '#d8d4cc');     // величезні пухнасті вуха
      torso(p, '#e6e8ea', p.h); legs(f, p.s, p.b, p.o); arms(p, f);
      head(p);
      eyes();
      rect(6, 11, 4, 3, N); rect(7, 14, 2, 1, N); rect(7, 10, 2, 1, N); px(6, 11, p.b); px(9, 11, p.b); px(7, 11, '#6a646c');   // великий темний ніс
      px(7, 15, p.o); px(8, 15, p.o);
      mp(3, 13, p.h); mp(2, 13, p.h);
    },
    tiger(p, f) {
      const CR = '#fff4dc', w = f === 1 ? -1 : f === 2 ? 1 : 0;
      rect(1, 15, 2, 4, p.b); rect(1, 16, 2, 1, E); rect(1, 18, 2, 1, E); rect(1 + (w > 0 ? 1 : 0), 13, 2, 2, p.b); rect(1 + (w > 0 ? 1 : 0), 12, 2, 1, E);   // смугастий хвіст
      mell(3, 5.4, 2.3, 2.3, p.b); mell(3, 5.6, 1.2, 1.2, CR); mp(2, 3, E); mp(3, 3, E);                                // вуха
      torso(p, CR, '#ecdcb4'); mr(4, 16, 1, 2, E); mr(3, 18, 2, 1, E); legs(f, p.s, p.b, p.o); arms(p, f);
      head(p);
      rect(7, 5, 2, 3, E); mr(5, 6, 1, 2, E); mr(1, 10, 2, 1, E); mr(1, 12, 2, 1, E); mr(3, 7, 1, 2, E);               // смуги
      ell(7.5, 13.5, 3.5, 2.2, CR);
      eyes();
      rect(7, 12, 2, 1, '#e0707a'); rect(7, 13, 2, 1, E); px(6, 14, E); px(9, 14, E);
    },
    monkey(p, f) {
      const F = '#f0c898', w = f === 1 ? -1 : f === 2 ? 1 : 0;
      [[2, 18], [1, 18], [0, 17], [0, 16], [0, 15], [1, 14 + w], [2, 14 + w], [2, 13 + w]].forEach(q => px(q[0], q[1], p.s));   // хвіст гачком
      torso(p, F, '#dcb07c'); legs(f, p.s, p.b, p.o); arms(p, f);
      head(p);
      mell(0.9, 10.2, 1.9, 2.2, p.b); mell(0.9, 10.2, 1, 1.2, F);                                                      // вуха при боках
      mell(5.2, 9.8, 2.6, 2.3, F); ell(7.5, 12.8, 4.8, 3.2, F); rect(7, 7, 2, 2, p.b);                                 // обличчя-серце
      eyes();
      px(7, 12, '#7a4a30'); px(8, 12, '#7a4a30'); rect(6, 14, 4, 1, '#7a4a30'); px(5, 13, '#7a4a30'); px(10, 13, '#7a4a30');
      mp(3, 13, '#f4a890');
    },
    chick(p, f) {
      rect(7, 2, 1, 3, p.s); px(8, 3, p.s); px(6, 3, p.s); px(8, 4, p.b); px(7, 2, p.h);                               // чубчик
      torso(p, p.h, p.b); legs(f, '#f08a2e', '#f6a24a', '#d4701c'); arms(p, f, p.s, '#d8a828', p.b);
      head(p);
      eyes();
      rect(6, 12, 4, 1, '#f6a24a'); rect(7, 13, 2, 1, '#d4701c');                                                       // маленький дзьобик
      mp(2, 13, '#ffb0a0'); mp(3, 13, '#ffb0a0');
    },
    frog(p, f) {
      const D = '#2a5a24';
      torso(p, '#d8f0b0', '#b8dc90'); legs(f, p.s, p.b, D); arms(p, f);
      head(p);
      mell(4.2, 5.4, 2.5, 2.5, p.b); mp(2, 4, p.h); mp(3, 3, p.h);                                                      // очі нагорі
      mr(3, 4, 3, 3, WH); rect(4, 5, 2, 2, E); rect(10, 5, 2, 2, E); px(4, 5, '#5a544c'); px(10, 5, '#5a544c');
      mp(6, 10, D); rect(3, 12, 10, 1, D); mp(2, 11, D);                                                                // ніздрі, широка усмішка
      mp(4, 8, p.h); mp(2, 13, '#ff9ab0'); mp(3, 13, '#ff9ab0'); mp(11, 9, p.s);
    },
    foxcub(p, f) {
      const CR = '#fff4dc', CRS = '#ecdcb4', D = '#5e2a10', w = f === 1 ? -1 : f === 2 ? 1 : 0;
      ell(1.4, 16, 1.9, 3.6, p.b); rect(0, 12, 2, 4, p.b); rect(Math.max(0, w), 10, 3, 3, CR); px(Math.max(0, w), 10, WH); px(1, 19, p.s);   // пишний хвіст із білим кінчиком
      mrows(2, 1, [[0, 2], [0, 3], [0, 4], [0, 4], [0, 5], [1, 4]], p.b); mr(2, 1, 2, 1, D); mp(2, 2, D); mp(3, 4, PK); mp(3, 5, PK); mp(4, 5, PK);   // великі вуха з темними кінчиками
      torso(p, CR, CRS); legs(f, D, '#7a3a18', E); arms(p, f, D, E, '#7a3a18');
      head(p);
      mell(3.6, 13, 2.9, 2.3, CR); ell(7.5, 14, 3.8, 2.2, CR); mp(2, 14, CRS); mp(3, 15, CRS);                           // білі щоки
      eyes();
      rect(7, 12, 2, 2, E); px(7, 12, '#6a544c'); px(7, 14, D); px(8, 14, D);
    }
  };
  function build(a, f, p, mk, outline) {
    const S = mk(16, 21); G = S.g; G.imageSmoothingEnabled = false;
    M[a](p, f);
    return outline(S, p.o);
  }
  return { build };
})();
