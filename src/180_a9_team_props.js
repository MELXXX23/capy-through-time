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
const TPAW = (x, y) => { if (TPNOPAW) return; TP(x, y, 3, 3, TPC[0]); TP(x + 1, y + 1, 1, 1, TPC[1]); TP(x + 1, y, 1, 1, TPC[2]); };
const TEAM_PROP_ART = {
  register(x, y, ph) {                          // прилавок із касою праворуч від їжака; лапка лежить на касі, монета підстрибує
    const rx = x + 9;
    TPBX(rx, y - 9, 25, 9, 'b', 'l', 'd'); TP(rx + 8, y - 7, 1, 6, 'd'); TP(rx + 17, y - 7, 1, 6, 'd'); TP(rx + 3, y - 4, 3, 1, 'h'); TP(rx + 11, y - 4, 4, 1, 'h');
    TPBX(rx + 12, y - 16, 10, 7, 'e', 'E', 'k'); TP(rx + 14, y - 15, 6, 3, 'g'); TP(rx + 14, y - 15, 6, 1, 'm'); TP(rx + 14, y - 11, 1, 1, 'y'); TP(rx + 16, y - 11, 1, 1, 'y'); TP(rx + 18, y - 11, 1, 1, 'r');
    TPBX(rx + 1, y - 12, 9, 3, 'w', 'W', 'e'); TP(rx + 3, y - 11, 5, 1, 'e');
    if (!TPNOPAW) { TP(rx - 1, y - 12, 3, 3, TPC[0]); TP(rx, y - 11, 1, 1, TPC[1]); }
    if (ph) { TP(rx + 15, y - 21, 3, 3, 'd'); TP(rx + 16, y - 20, 1, 1, 'y'); TP(rx + 15, y - 20, 1, 1, 'h'); } else { TP(rx + 16, y - 19, 2, 2, 'd'); TP(rx + 16, y - 19, 1, 1, 'h'); }
  },
  hammer(x, y, ph) {                            // молоток б'є по цвяху в дошці
    TPBX(x + 10, y - 4, 20, 4, 'c', 'y', 'b'); TP(x + 18, y - 3, 1, 1, 'b'); TP(x + 25, y - 3, 1, 1, 'b');
    TP(x + 19, y - 6, 1, 2, 'Y'); TP(x + 19, y - 7, 1, 1, 'E');
    if (!ph) {
      TP(x + 12, y - 22, 3, 13, 'd'); TP(x + 13, y - 21, 1, 11, 'l'); TPAW(x + 11, y - 12);
      TPBX(x + 10, y - 28, 9, 6, 'Y', 'w', 'e'); TP(x + 10, y - 28, 1, 6, 'd'); TP(x + 18, y - 27, 1, 4, 'e');
    } else {
      TP(x + 12, y - 14, 3, 9, 'd'); TP(x + 13, y - 13, 1, 7, 'l'); TPAW(x + 11, y - 13);
      TPBX(x + 15, y - 10, 9, 5, 'Y', 'w', 'e');
      TP(x + 25, y - 9, 1, 1, 'y'); TP(x + 26, y - 11, 1, 1, 'w'); TP(x + 24, y - 12, 1, 1, 'h'); TP(x + 27, y - 8, 1, 1, 'y');
    }
  },
  tray(x, y, ph) {                              // таця з цукерками в лапці збоку
    const b = ph ? 1 : 0;
    TP(x + 9, y - 12 - b, 24, 4, 'd'); TP(x + 10, y - 11 - b, 22, 2, 'Y'); TP(x + 10, y - 11 - b, 22, 1, 'w'); TP(x + 10, y - 10 - b, 22, 1, 'e'); TP(x + 12, y - 8 - b, 18, 1, 'd'); TPAW(x + 7, y - 11 - b);
    TPART(x + 11, y - 18 - b, ['..dd...', '.dpqd..', 'dpqppd.', 'drrrrd.', '.dddd..']);
    TPART(x + 18, y - 17 - b, ['.d.dd.d', 'dhhhhhd', 'dhyhhhd', 'd.hhh.d', '..d.d..']);
    TPART(x + 26, y - 16 - b, ['.ddd..', 'dfffd.', 'dqffdd', 'dfffd.', '.ddd..']);
  },
  baton(x, y, ph) {                             // кийок охоронниці з відблиском
    TP(x + 10, y - 17, 4, 16, 'd'); TP(x + 11, y - 16, 2, 14, 'k'); TP(x + 11, y - 16, 1, 14, 'e');
    TP(x + 11, y - 16, 2, 2, 'h'); TP(x + 11, y - 9, 2, 1, 'w'); TP(x + 11, y - 12, 2, 1, 'w'); TPAW(x + 9, y - 9);
    TP(x + 14, y - 11, 1, 3, 'd'); TP(x + 15, y - 12, 1, 1, 'd');
    if (ph) { TP(x + 11, y - 15, 1, 1, 'w'); TP(x + 15, y - 16, 1, 3, 'w'); TP(x + 14, y - 15, 3, 1, 'w'); }
  },
  box(x, y, ph) {                               // ящик у лапці збоку
    const b = ph ? 1 : 0;
    TPBX(x + 10, y - 12 - b, 16, 10, 'c', 'y', 'b'); TP(x + 16, y - 11 - b, 4, 8, 'w'); TP(x + 16, y - 11 - b, 4, 1, 'W'); TP(x + 15, y - 11 - b, 1, 8, 'b'); TP(x + 20, y - 11 - b, 1, 8, 'b');
    TPBX(x + 21, y - 9 - b, 4, 4, 'w', 'W', 'e'); TP(x + 22, y - 8 - b, 2, 1, 'r'); TP(x + 12, y - 8 - b, 3, 1, 'b'); TPAW(x + 8, y - 8 - b);
  },
  ledger(x, y, ph) {                            // розкрита книга обліку й перо
    TPBX(x + 10, y - 20, 16, 12, 'r', 'J', 'R'); TP(x + 11, y - 19, 14, 10, 'd'); TP(x + 12, y - 18, 6, 8, 'w'); TP(x + 19, y - 18, 5, 8, 'w'); TP(x + 18, y - 19, 1, 10, 'd');
    TP(x + 13, y - 16, 4, 1, 'e'); TP(x + 13, y - 14, 3, 1, 'e'); TP(x + 20, y - 16, 3, 1, 'e'); TP(x + 20, y - 14 + ph, 3, 1, 'n'); TP(x + 13, y - 12, 4, 1, 'e');
    TPAW(x + 8, y - 12); TP(x + 24 + ph, y - 25, 1, 6, 'd'); TP(x + 25 + ph, y - 26, 1, 2, 'w'); TP(x + 23 + ph, y - 27, 3, 1, 'w');
  },
  broom(x, y, ph) {                             // віник змітає пил
    const bx = x + 11, s = ph ? 1 : -1;
    TP(bx, y - 22, 3, 18, 'd'); TP(bx + 1, y - 21, 1, 16, 'l'); TPAW(bx - 1, y - 14);
    TP(bx - 4 + s, y - 6, 11, 6, 'd'); TP(bx - 3 + s, y - 5, 9, 4, 'h'); TP(bx - 3 + s, y - 5, 9, 1, 'y'); TP(bx - 3 + s, y - 2, 9, 1, 'o'); TP(bx - 1 + s, y - 5, 1, 4, 'o'); TP(bx + 2 + s, y - 5, 1, 4, 'o');
    TP(bx - 5 + s, y - 7, 1, 1, 'c'); TP(bx + 8 + s, y - 4 - ph, 1, 1, 'c');
    TP(bx - 1, y - 8, 5, 2, 'r'); TP(bx - 1, y - 8, 5, 1, 'J');
  },
  dress(x, y, ph) {                             // сукня на вішаку міняє колір і блищить
    const c = ph ? 'p' : 'u', l = ph ? 'q' : 'v', s = ph ? 'J' : 'P', X = x + 11;
    TP(X + 5, y - 28, 1, 2, 'd'); TP(X + 4, y - 29, 3, 1, 'Y'); TP(X + 3, y - 26, 5, 1, 'd'); TP(X + 2, y - 25, 1, 1, 'd'); TP(X + 8, y - 25, 1, 1, 'd');
    TPART(X, y - 24, ['..dd...dd..', '..d' + c + 'd.d' + c + 'd..', '..d' + l + c + c + c + c + 'd..', '...d' + c + c + c + 'd...', '..drrrrrd..', '..d' + l + c + c + c + s + 'd..', '.d' + l + c + c + c + c + s + 'd.', 'd' + l + c + c + c + c + c + s + 'd', 'd' + l + c + c + c + c + c + s + 'd', 'd' + c + l + c + c + c + c + s + 'd', 'dwdwdwdwdwd']);
    const gx = ph ? X + 8 : X + 1; TP(gx, y - 17, 1, 1, 'w'); TP(gx - 1, y - 16, 3, 1, 'w'); TP(gx, y - 15, 1, 1, 'w');
  },
  clipboard(x, y, ph) {                         // планшет із папером і олівцем
    TPBX(x + 10, y - 20, 12, 15, 'l', 'c', 'b'); TP(x + 13, y - 21, 6, 3, 'd'); TP(x + 14, y - 20, 4, 1, 'Y'); TP(x + 14, y - 21, 4, 1, 'w');
    TP(x + 12, y - 17, 8, 10, 'w'); TP(x + 12, y - 17, 8, 1, 'W'); TP(x + 19, y - 16, 1, 9, 'E');
    TP(x + 13, y - 15, 6, 1, 'e'); TP(x + 13, y - 13 + ph, 6, 1, 'n'); TP(x + 13, y - 11, 5, 1, 'e'); TP(x + 13, y - 9, 3, 1, 'e'); TPAW(x + 8, y - 13);
    TP(x + 23, y - 11 - ph, 1, 7, 'o'); TP(x + 23, y - 12 - ph, 1, 1, 'd'); TP(x + 23, y - 4 - ph, 1, 1, 'k');
  },
  megaphone(x, y, ph) {                         // гучномовець
    TPART(x + 10, y - 22, ['.dd.....', 'dppd....', 'dqppdd..', 'dqpppdd.', 'dwwwppdd', 'dqpppdd.', 'dqppdd..', 'dppd....', '.dd.....']);
    TP(x + 15, y - 22, 3, 1, 'd'); TP(x + 16, y - 14, 2, 1, 'd');
    TP(x + 17, y - 21, 1, 9, 'd'); TP(x + 18, y - 20, 1, 7, 'r'); TP(x + 18, y - 20, 1, 2, 'p');
    TP(x + 11, y - 14, 2, 6, 'd'); TP(x + 12, y - 13, 1, 4, 'k'); TPAW(x + 9, y - 11);
    if (ph) { TP(x + 21, y - 20, 1, 3, 'w'); TP(x + 23, y - 18, 1, 5, 'w'); TP(x + 25, y - 16, 1, 1, 'w'); } else { TP(x + 20, y - 18, 1, 1, 'w'); TP(x + 22, y - 17, 1, 3, 'w'); TP(x + 24, y - 16, 1, 5, 'w'); }
  },
  tablet(x, y, ph) {                            // планшет із графіком
    TPBX(x + 10, y - 19, 16, 12, 'k', 'e', 'k'); TP(x + 11, y - 18, 14, 10, 'z'); TP(x + 12, y - 17, 12, 8, ph ? 's' : 'S');
    TP(x + 13, y - 11, 2, 2, 'g'); TP(x + 16, y - 13, 2, 4, 'g'); TP(x + 19, y - 15 + ph, 2, 6 - ph, 'r'); TP(x + 12, y - 17, 12, 1, 'w'); TPAW(x + 8, y - 11);
    TP(x + 13, y - 16, 1, 1, 'w'); TP(x + 14, y - 15, 1, 1, 'w');
  },
  cart(x, y, ph) {                              // візок із товаром
    const cx = x + 20;
    TPBX(cx - 7, y - 11, 15, 7, 'e', 'E', 'k'); TP(cx - 7, y - 12, 15, 1, 'd'); TP(cx + 8, y - 18, 2, 14, 'd'); TP(cx + 8, y - 18, 1, 13, 'b'); TP(cx + 5, y - 18, 5, 1, 'd');
    TPBX(cx - 6, y - 16, 5, 5, 'r', 'J', 'R'); TPBX(cx - 1, y - 15 - ph, 5, 4, 'g', 'm', 'G'); TP(cx - 5, y - 14, 3, 1, 'w');
    TP(cx - 6, y - 4, 4, 4, 'd'); TP(cx - 5, y - 3, 2, 2, 'e'); TP(cx + 2, y - 4, 4, 4, 'd'); TP(cx + 3, y - 3, 2, 2, 'e'); TPAW(x + 9, y - 10);
  }
};
function teamPropArt(g, prop, x, y, ph, id, dir, noPaw) {   // x — центр звіра, y — ноги; ph — кадр 0/1
  const fn = TEAM_PROP_ART[prop]; if (!fn) return;
  TPG = g; TPNOPAW = !!noPaw; TPC = PAW_TINT[id] || PAW_COL[TEAM_SPECIES[id]] || PAW_COL.hedgehog;
  if (dir < 0) { g.save(); g.translate(2 * x, 0); g.scale(-1, 1); }
  fn(x, y, ph);
  if (dir < 0) g.restore();
}
// Портрет героя на картці команди (34×27): справа від нього — його предмет у руках; колір фону портрета й сам звір — як і раніше
function drawTeamPortrait(cv, id) {
  const g = cv.getContext('2d'), m = TEAM.find(t => t.id === id); g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height);
  if (m && m.spot.prop !== 'none') teamPropArt(g, m.spot.prop, 1, 27, 0, id, 1, true);
  g.drawImage(getSpriteCanvas(teamSprite(id)), 0, 0);
}
