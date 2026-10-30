//#part 180_a9_team_props.js
/* Предмети в руках героїв команди (р. 73): намальовані в стилі нових героїв (контур, світло зліва зверху, тінь знизу праворуч), на 20% більші.
   Усі стоять збоку від звіра (x+9 і далі) і не перекривають його: героя видно на повен зріст. Лапка героя тримає предмет (колір лапки — за видом).
   teamPropArt(g, …) малює на будь-якому полотні: у грі (drawTeamProp) і на портреті картки команди (drawTeamPortrait). dir < 0 — дзеркально (звір іде вліво). */
const PAW_COL = {   // [контур, шерсть, відблиск] лапки за видом звіра (як PAL у 100_b)
  bunny: ['#8a7560', '#fff4dc', '#ffffff'], mouse: ['#4f4a48', '#aaa6a2', '#c9c5c0'], duck: ['#8a5a2a', '#ffe08a', '#fff0b5'], dog: ['#4a2d18', '#b57a45', '#d49a62'],
  cat: ['#6e3a14', '#e8863c', '#f6a860'], pig: ['#8a4258', '#f4a8b8', '#ffc8d4'], sheep: ['#6a5a52', '#fdf6ea', '#ffffff'], cow: ['#4a3a34', '#fff4dc', '#ffffff'],
  squirrel: ['#5e2e12', '#c9743a', '#e09258'], deer: ['#5a3a1c', '#c9955a', '#e0b078'], raccoon: ['#3a3a40', '#9a9a9e', '#b8b8bc'], hedgehog: ['#4a3020', '#a07850', '#b89068'],
  penguin: ['#171822', '#3a3d4a', '#55596a'], koala: ['#3e4248', '#9aa0a8', '#b8bec6'], tiger: ['#6a3a10', '#f09a38', '#f8b862'], monkey: ['#4a2c14', '#9c6a3c', '#b88456'],
  hamster: ['#7a5a30', '#f2d4a0', '#fae8c4'], chick: ['#8a6a1a', '#ffe566', '#fff2a0'], frog: ['#2a5a24', '#6dbb5a', '#8ad278'], foxcub: ['#5e2a10', '#e8742c', '#f4985a']
};
const PAW_TINT = { tonya: ['#3f4a1e', '#8aa44a', '#a4bc66'], sonia: ['#5a3a1a', '#a07a3a', '#c09a58'] };   // черепаха й сова мають свій відтінок (TEAM_TINT)
let TPG = null, TPC = PAW_COL.hedgehog, TPNOPAW = false;     // полотно, кольори лапки, без лапки (тло картки)
const TP = (x, y, w, h, ch) => R(TPG, x, y, w, h, ch);
const TPBX = (x, y, w, h, f, l, s) => { TP(x, y, w, h, 'd'); TP(x + 1, y + 1, w - 2, h - 2, f); TP(x + 1, y + 1, w - 2, 1, l); TP(x + 1, y + 1, 1, h - 2, l); TP(x + 1, y + h - 2, w - 2, 1, s); TP(x + w - 2, y + 1, 1, h - 2, s); };
const TPART = (x, y, rows) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') TP(x + i, y + j, 1, 1, r[i]); });
let TPX = 0, TPY = 0;                                        // центр і ноги героя — звідси росте рука до лапки
const TPAW = (x, y) => {                                     // лапка 3×3 і рука від плеча до неї (р. 73е: предмет тримається за тіло, а не висить поруч)
  if (TPNOPAW) return;
  const sx = TPX + 4, sy = TPY - 11, ex = x, ey = y + 1, n = Math.max(Math.abs(ex - sx), Math.abs(ey - sy));
  for (let k = 0; k <= n; k++) { const ax = Math.round(sx + (ex - sx) * k / Math.max(1, n)), ay = Math.round(sy + (ey - sy) * k / Math.max(1, n)); TP(ax, ay - 1, 1, 1, TPC[0]); TP(ax, ay, 1, 1, TPC[1]); TP(ax, ay + 1, 1, 1, TPC[0]); }
  TP(x, y, 3, 3, TPC[0]); TP(x + 1, y + 1, 1, 1, TPC[1]); TP(x + 1, y, 1, 1, TPC[2]); TP(x, y + 1, 1, 1, TPC[1]);
};
const TP_PH = [0, 1, 2, 1];                                  // 4 кадри «туди-назад»: 0 → середина → 2 → середина (плавніше за колишні 2 кадри)
const TEAM_PROP_ART = {
  register(x, y, f) {                          // прилавок із касою праворуч від їжака; лапка лежить на касі, монета злітає й падає
    const rx = x + 9, s = TP_PH[f & 3];
    TPBX(rx, y - 9, 25, 9, 'b', 'l', 'd'); TP(rx + 8, y - 7, 1, 6, 'd'); TP(rx + 17, y - 7, 1, 6, 'd'); TP(rx + 3, y - 4, 3, 1, 'h'); TP(rx + 11, y - 4, 4, 1, 'h'); TP(rx + 1, y - 8, 23, 1, 'h');
    TPBX(rx + 12, y - 16, 10, 7, 'e', 'E', 'k'); TP(rx + 14, y - 15, 6, 3, 'g'); TP(rx + 14, y - 15, 6, 1, 'm'); TP(rx + 15 + s, y - 14, 1, 1, 'w'); TP(rx + 14, y - 11, 1, 1, 'y'); TP(rx + 16, y - 11, 1, 1, 'y'); TP(rx + 18, y - 11, 1, 1, 'r');
    TPBX(rx + 1, y - 12, 9, 3, 'w', 'W', 'e'); TP(rx + 3, y - 11, 5, 1, 'e');
    TPAW(rx - 1, y - 12);
    const cy = y - 19 - s * 2; TP(rx + 15, cy, 3, 3, 'd'); TP(rx + 16, cy + 1, 1, 1, s === 2 ? 'w' : 'y'); TP(rx + 15, cy + 1, 1, 1, 'h');
    if (s === 2) { TP(rx + 19, cy - 1, 1, 1, 'w'); TP(rx + 13, cy, 1, 1, 'y'); }
  },
  hammer(x, y, f) {                            // молоток замахується (угорі → навскоси → удар) і б'є по цвяху
    const s = TP_PH[f & 3];
    TPBX(x + 10, y - 4, 20, 4, 'c', 'y', 'b'); TP(x + 18, y - 3, 1, 1, 'b'); TP(x + 25, y - 3, 1, 1, 'b');
    TP(x + 19, y - 6 + (s === 2 ? 1 : 0), 1, 2, 'Y'); TP(x + 19, y - 7 + (s === 2 ? 1 : 0), 1, 1, 'E');
    if (s === 0) {
      TP(x + 12, y - 22, 3, 11, 'd'); TP(x + 13, y - 21, 1, 9, 'l'); TPAW(x + 11, y - 12);
      TPBX(x + 10, y - 28, 9, 6, 'Y', 'w', 'e'); TP(x + 10, y - 28, 1, 6, 'd'); TP(x + 18, y - 27, 1, 4, 'e');
    } else if (s === 1) {                       // рукоять навскоси, головка на півдорозі
      for (let k = 0; k < 8; k++) { TP(x + 12 + Math.round(k * 0.7), y - 13 - k, 2, 1, 'd'); TP(x + 13 + Math.round(k * 0.7), y - 13 - k, 1, 1, 'l'); }
      TPAW(x + 11, y - 13);
      TPBX(x + 16, y - 25, 8, 6, 'Y', 'w', 'e'); TP(x + 23, y - 24, 1, 4, 'd');
    } else {
      TP(x + 12, y - 14, 3, 9, 'd'); TP(x + 13, y - 13, 1, 7, 'l'); TPAW(x + 11, y - 13);
      TPBX(x + 15, y - 10, 9, 5, 'Y', 'w', 'e');
      TP(x + 25, y - 9, 1, 1, 'y'); TP(x + 26, y - 11, 1, 1, 'w'); TP(x + 24, y - 12, 1, 1, 'h'); TP(x + 27, y - 8, 1, 1, 'y');
    }
  },
  tray(x, y, f) {                               // таця з цукерками в лапці збоку, м'яко погойдується
    const b = TP_PH[f & 3];
    TP(x + 9, y - 12 - b, 24, 4, 'd'); TP(x + 10, y - 11 - b, 22, 2, 'Y'); TP(x + 10, y - 11 - b, 22, 1, 'w'); TP(x + 10, y - 10 - b, 22, 1, 'e'); TP(x + 12, y - 8 - b, 18, 1, 'd'); TPAW(x + 7, y - 11 - b);
    TPART(x + 11, y - 18 - b, ['..dd...', '.dpqd..', 'dpqppd.', 'drrrrd.', '.dddd..']);
    TPART(x + 18, y - 17 - b, ['.d.dd.d', 'dhhhhhd', 'dhyhhhd', 'd.hhh.d', '..d.d..']);
    TPART(x + 26, y - 16 - b, ['.ddd..', 'dfffd.', 'dqffdd', 'dfffd.', '.ddd..']);
    if (b === 2) TP(x + 14, y - 20 - b, 1, 1, 'w');
  },
  baton(x, y, f) {                             // кийок охоронниці, відблиск пробігає згори донизу
    const s = TP_PH[f & 3];
    TP(x + 10, y - 17, 4, 16, 'd'); TP(x + 11, y - 16, 2, 14, 'k'); TP(x + 11, y - 16, 1, 14, 'e');
    TP(x + 11, y - 16, 2, 2, 'h'); TP(x + 11, y - 9, 2, 1, 'w'); TP(x + 11, y - 12, 2, 1, 'w'); TPAW(x + 9, y - 9);
    TP(x + 14, y - 11, 1, 3, 'd'); TP(x + 15, y - 12, 1, 1, 'd');
    TP(x + 12, y - 15 + s * 2, 1, 2, 'w');
    if (s === 1) TP(x + 15, y - 15, 1, 1, 'w');
    if (s === 2) { TP(x + 15, y - 16, 1, 3, 'w'); TP(x + 14, y - 15, 3, 1, 'w'); }
  },
  box(x, y, f) {                               // ящик у лапці збоку, підстрибує в такт
    const b = TP_PH[f & 3];
    TPBX(x + 10, y - 12 - b, 16, 10, 'c', 'y', 'b'); TP(x + 16, y - 11 - b, 4, 8, 'w'); TP(x + 16, y - 11 - b, 4, 1, 'W'); TP(x + 15, y - 11 - b, 1, 8, 'b'); TP(x + 20, y - 11 - b, 1, 8, 'b');
    TPBX(x + 21, y - 9 - b, 4, 4, 'w', 'W', 'e'); TP(x + 22, y - 8 - b, 2, 1, 'r'); TP(x + 12, y - 8 - b, 3, 1, 'b'); TPAW(x + 8, y - 8 - b);
  },
  ledger(x, y, f) {                            // розкрита книга обліку; перо пише рядок туди-назад
    const s = TP_PH[f & 3];
    TPBX(x + 10, y - 20, 16, 12, 'r', 'J', 'R'); TP(x + 11, y - 19, 14, 10, 'd'); TP(x + 12, y - 18, 6, 8, 'w'); TP(x + 19, y - 18, 5, 8, 'w'); TP(x + 18, y - 19, 1, 10, 'd');
    TP(x + 13, y - 16, 4, 1, 'e'); TP(x + 13, y - 14, 3, 1, 'e'); TP(x + 20, y - 16, 3, 1, 'e'); TP(x + 20, y - 14, 1 + s, 1, 'n'); TP(x + 13, y - 12, 4, 1, 'e');
    TPAW(x + 8, y - 12); TP(x + 22 + s, y - 20, 1, 6, 'd'); TP(x + 23 + s, y - 21, 1, 2, 'w'); TP(x + 21 + s, y - 22, 3, 1, 'w'); TP(x + 22 + s, y - 14, 1, 1, 'k');
  },
  broom(x, y, f) {                             // віник змітає пил: ліворуч → посередині → праворуч
    const bx = x + 11, s = TP_PH[f & 3] - 1;
    TP(bx, y - 22, 3, 18, 'd'); TP(bx + 1, y - 21, 1, 16, 'l'); TPAW(bx - 1, y - 14);
    TP(bx - 4 + s, y - 6, 11, 6, 'd'); TP(bx - 3 + s, y - 5, 9, 4, 'h'); TP(bx - 3 + s, y - 5, 9, 1, 'y'); TP(bx - 3 + s, y - 2, 9, 1, 'o'); TP(bx - 1 + s, y - 5, 1, 4, 'o'); TP(bx + 2 + s, y - 5, 1, 4, 'o');
    if (s < 0) TP(bx - 6, y - 7, 1, 1, 'c');
    if (s > 0) { TP(bx + 9, y - 5, 1, 1, 'c'); TP(bx + 10, y - 7, 1, 1, 'c'); }
    TP(bx - 1, y - 8, 5, 2, 'r'); TP(bx - 1, y - 8, 5, 1, 'J');
  },
  dress(x, y, f) {                             // сукня на вішаку повільно міняє колір, блиск пробігає по ній
    const alt = f >= 6, c = alt ? 'p' : 'u', l = alt ? 'q' : 'v', s = alt ? 'J' : 'P', X = x + 11, sw = TP_PH[f & 3] - 1;
    TP(X + 5, y - 28, 1, 2, 'd'); TP(X + 4, y - 29, 3, 1, 'Y'); TP(X + 3, y - 26, 5, 1, 'd'); TP(X + 2, y - 25, 1, 1, 'd'); TP(X + 8, y - 25, 1, 1, 'd');
    TPART(X, y - 24, ['..dd...dd..', '..d' + c + 'd.d' + c + 'd..', '..d' + l + c + c + c + c + 'd..', '...d' + c + c + c + 'd...', '..drrrrrd..', '..d' + l + c + c + c + s + 'd..', '.d' + l + c + c + c + c + s + 'd.', 'd' + l + c + c + c + c + c + s + 'd', 'd' + l + c + c + c + c + c + s + 'd', 'd' + c + l + c + c + c + c + s + 'd', 'dwdwdwdwdwd']);
    const gx = X + 5 + sw * 2; TP(gx, y - 17, 1, 1, 'w'); TP(gx - 1, y - 16, 3, 1, 'w'); TP(gx, y - 15, 1, 1, 'w');
    TPAW(X - 2, y - 14);
  },
  clipboard(x, y, f) {                         // планшет із папером, олівець виводить рядок
    const s = TP_PH[f & 3];
    TPBX(x + 10, y - 20, 12, 15, 'l', 'c', 'b'); TP(x + 13, y - 21, 6, 3, 'd'); TP(x + 14, y - 20, 4, 1, 'Y'); TP(x + 14, y - 21, 4, 1, 'w');
    TP(x + 12, y - 17, 8, 10, 'w'); TP(x + 12, y - 17, 8, 1, 'W'); TP(x + 19, y - 16, 1, 9, 'E');
    TP(x + 13, y - 15, 6, 1, 'e'); TP(x + 13, y - 13, 2 + s * 2, 1, 'n'); TP(x + 13, y - 11, 5, 1, 'e'); TP(x + 13, y - 9, 3, 1, 'e'); TPAW(x + 8, y - 13);
    TP(x + 23, y - 11 - s, 1, 7, 'o'); TP(x + 23, y - 12 - s, 1, 1, 'd'); TP(x + 23, y - 4 - s, 1, 1, 'k');
  },
  megaphone(x, y, f) {                         // гучномовець; хвилі звуку розходяться одна за одною
    TPART(x + 10, y - 22, ['.dd.....', 'dppd....', 'dqppdd..', 'dqpppdd.', 'dwwwppdd', 'dqpppdd.', 'dqppdd..', 'dppd....', '.dd.....']);
    TP(x + 15, y - 22, 3, 1, 'd'); TP(x + 16, y - 14, 2, 1, 'd');
    TP(x + 17, y - 21, 1, 9, 'd'); TP(x + 18, y - 20, 1, 7, 'r'); TP(x + 18, y - 20, 1, 2, 'p');
    TP(x + 11, y - 14, 2, 6, 'd'); TP(x + 12, y - 13, 1, 4, 'k'); TPAW(x + 9, y - 11);
    const w = f % 3;                            // три хвилі по черзі: ближня, середня, дальня
    TP(x + 20, y - 18, 1, 3, w === 0 ? 'w' : 'e'); TP(x + 22, y - 19, 1, 5, w === 1 ? 'w' : 'e'); TP(x + 24, y - 20, 1, 7, w === 2 ? 'w' : 'e');
  },
  tablet(x, y, f) {                            // планшет із графіком, стовпчик росте
    const s = TP_PH[f & 3];
    TPBX(x + 10, y - 19, 16, 12, 'k', 'e', 'k'); TP(x + 11, y - 18, 14, 10, 'z'); TP(x + 12, y - 17, 12, 8, f >= 6 ? 's' : 'S');
    TP(x + 13, y - 11, 2, 2, 'g'); TP(x + 16, y - 13, 2, 4, 'g'); TP(x + 19, y - 13 - s, 2, 4 + s, 'r'); TP(x + 12, y - 17, 12, 1, 'w'); TPAW(x + 8, y - 11);
    TP(x + 13, y - 16, 1, 1, 'w'); TP(x + 14, y - 15, 1, 1, 'w');
  },
  cart(x, y, f) {                              // візок із товаром, колеса крутяться
    const cx = x + 20, s = TP_PH[f & 3], sp = f & 1;
    TPBX(cx - 7, y - 11, 15, 7, 'e', 'E', 'k'); TP(cx - 7, y - 12, 15, 1, 'd'); TP(cx + 8, y - 18, 2, 14, 'd'); TP(cx + 8, y - 18, 1, 13, 'b'); TP(cx + 5, y - 18, 5, 1, 'd');
    TPBX(cx - 6, y - 16, 5, 5, 'r', 'J', 'R'); TPBX(cx - 1, y - 15 - (s >> 1), 5, 4, 'g', 'm', 'G'); TP(cx - 5, y - 14, 3, 1, 'w');
    [cx - 6, cx + 2].forEach(wx => { TP(wx, y - 4, 4, 4, 'd'); TP(wx + 1, y - 3, 2, 2, 'e'); TP(wx + 1 + sp, y - 3 + sp, 1, 1, 'k'); });
    TPAW(x + 8, y - 12);
  }
};
function teamPropArt(g, prop, x, y, f, id, dir, noPaw) {   // x — центр звіра, y — ноги; f — кадр 0..11 (4 кадри руху × 3)
  const fn = TEAM_PROP_ART[prop]; if (!fn) return;
  TPG = g; TPNOPAW = !!noPaw; TPC = PAW_TINT[id] || PAW_COL[TEAM_SPECIES[id]] || PAW_COL.hedgehog; TPX = x; TPY = y;
  if (dir < 0) { g.save(); g.translate(2 * x, 0); g.scale(-1, 1); }
  fn(noPaw ? x : x - 2, y, f | 0);                          // у грі предмет на 2 px ближче: лапка торкається тіла
  if (dir < 0) g.restore();
}
// Портрет героя на картці команди (34×27): справа від нього — його предмет у руках; колір фону портрета й сам звір — як і раніше
function drawTeamPortrait(cv, id) {
  const g = cv.getContext('2d'), m = TEAM.find(t => t.id === id); g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height);
  if (m && m.spot.prop !== 'none') teamPropArt(g, m.spot.prop, 1, 27, 0, id, 1, true);
  g.drawImage(getSpriteCanvas(teamSprite(id)), 0, 0);
}
