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
const TPAW = (x, y) => {                                     // кругла лапка 4×4 і рука від плеча (плече на тулубі, рука йде за контуром)
  if (TPNOPAW) return;
  const sx = TPX + 7, sy = TPY - 7, ex = x + 1, ey = y + 1, n = Math.max(1, Math.abs(ex - sx), Math.abs(ey - sy)), pts = [];
  for (let k = 0; k <= n; k++) pts.push([Math.round(sx + (ex - sx) * k / n), Math.round(sy + (ey - sy) * k / n)]);
  pts.forEach(p => { TP(p[0] - 1, p[1], 1, 1, TPC[0]); TP(p[0] + 1, p[1], 1, 1, TPC[0]); TP(p[0], p[1] - 1, 1, 1, TPC[0]); TP(p[0], p[1] + 1, 1, 1, TPC[0]); });
  pts.forEach(p => TP(p[0], p[1], 1, 1, TPC[1]));
  TP(x + 1, y, 2, 1, TPC[0]); TP(x + 1, y + 3, 2, 1, TPC[0]); TP(x, y + 1, 1, 2, TPC[0]); TP(x + 3, y + 1, 1, 2, TPC[0]);
  TP(x + 1, y + 1, 2, 2, TPC[1]); TP(x + 1, y + 1, 1, 1, TPC[2]);
};
const TP_PH = [0, 1, 2, 1];                                  // 4 кадри «туди-назад»: 0 → середина → 2 → середина (плавніше за колишні 2 кадри)
const TEAM_PROP_ART = {
  register(x, y, f) {                          // дерев'яний прилавок і каса: екран, клавіші, шухляда; лапка на купці чеків, монета злітає й падає
    const rx = x + 10, s = TP_PH[f & 3];
    TP(rx - 1, y - 11, 29, 3, 'd'); TP(rx, y - 10, 27, 1, 'c'); TP(rx, y - 10, 27, 1, 'y'); TP(rx, y - 9, 27, 1, 'c');          // стільниця
    TPBX(rx, y - 8, 27, 8, 'b', 'l', 'd');
    [rx + 2, rx + 11, rx + 20].forEach(px0 => { TP(px0, y - 6, 6, 4, 'd'); TP(px0 + 1, y - 5, 4, 2, 'l'); TP(px0 + 1, y - 5, 4, 1, 'c'); });   // філянки
    TPART(rx + 12, y - 22, ['.dddddddddddd.', 'dYYYYYYYYYYYYd', 'dYzzzzzzzzzzed', 'dYzgmgggggggzed'.slice(0, 13) + 'd', 'dYzzzzzzzzzzed', 'dEEEEEEEEEEEed', 'dEwrEwEwEwEEed', 'dEwEwEwEwrEEed', 'deeeeeeeeeeeed', 'dEEEEhhhhEEEed', '.dddddddddddd.']);
    TP(rx + 15 + s * 2, y - 19, 2, 1, 'w');                                                                                       // цифри на екрані біжать
    TPART(rx + 2, y - 14, ['.ddddddd.', 'dwwwwwwWd', 'dWeeeeeWd', 'dwwwwwwWd']);                                                  // купка чеків
    TPAW(rx, y - 15);
    const cy = y - 26 - s * 2; TPART(rx + 17, cy, ['.dd.', 'dyhd', 'dhod', '.dd.']);
    if (s === 2) { TP(rx + 22, cy, 1, 1, 'w'); TP(rx + 15, cy + 2, 1, 1, 'y'); }
  },
  hammer(x, y, f) {                            // молоток замахується (угорі → навскоси → удар) і б'є по цвяху; дошка з волокнами, гумова ручка
    const s = TP_PH[f & 3], nail = s === 2 ? 1 : 0;
    TPBX(x + 11, y - 5, 21, 5, 'c', 'y', 'b'); TP(x + 14, y - 3, 4, 1, 'b'); TP(x + 21, y - 3, 6, 1, 'b'); TP(x + 28, y - 2, 2, 1, 'b');   // дошка
    TP(x + 13, y - 6, 3, 1, 'e'); TP(x + 14, y - 7, 1, 1, 'E');                                                                            // забитий цвях
    TP(x + 24, y - 7 + nail, 1, 2, 'Y'); TP(x + 23, y - 8 + nail, 3, 1, 'E'); TP(x + 23, y - 8 + nail, 1, 1, 'w');                          // цвях, по якому б'є
    if (s === 0) {                                  // угорі
      TP(x + 14, y - 23, 4, 17, 'd'); TP(x + 15, y - 22, 2, 15, 'c'); TP(x + 15, y - 22, 1, 15, 'y'); TP(x + 15, y - 12, 2, 5, 'r'); TP(x + 15, y - 12, 1, 5, 'j'); TP(x + 15, y - 10, 2, 1, 'R');
      TPART(x + 10, y - 29, ['...dddddddd.', '.ddwwwwwwwwd', 'dwwYYYYYYYed', 'deYYYYYYYYed', '.ddeeeeeeeed', '...ddddddddd']);
      TPAW(x + 12, y - 12);
    } else if (s === 1) {                           // навскоси
      for (let k = 0; k < 9; k++) { const X = x + 15 + Math.round(k * 0.7), Y = y - 10 - k; TP(X - 1, Y, 4, 1, 'd'); TP(X, Y, 2, 1, k < 4 ? 'r' : 'c'); TP(X, Y, 1, 1, k < 4 ? 'j' : 'y'); }
      TPART(x + 17, y - 26, ['...dd.....', '..dwwd....', '.dwYYwd...', 'dwYYYYwd..', '.dYYYYYwd.', '..deYYYYd.', '...deYYed.', '....deed..', '.....dd...']);
      TPAW(x + 12, y - 11);
    } else {                                        // удар
      TP(x + 14, y - 13, 12, 4, 'd'); TP(x + 15, y - 12, 10, 2, 'c'); TP(x + 15, y - 12, 10, 1, 'y'); TP(x + 15, y - 12, 4, 2, 'r'); TP(x + 15, y - 12, 4, 1, 'j');
      TPART(x + 21, y - 19, ['.ddddd.', 'dwwYYed', 'dwYYYed', 'dwYYYed', 'dYYYYed', 'dYYYYed', 'dYYYYed', 'dYYYeed', 'dYYeeed', '.ddddd.']);
      TP(x + 29, y - 9, 1, 1, 'y'); TP(x + 30, y - 12, 1, 1, 'w'); TP(x + 19, y - 8, 1, 1, 'h'); TP(x + 31, y - 7, 1, 1, 'y'); TP(x + 18, y - 6, 1, 1, 'w');
      TPAW(x + 12, y - 13);
    }
  },
  tray(x, y, f) {                               // таця в лапці збоку: кекс, пончик, макарун; м'яко погойдується
    const b = TP_PH[f & 3], Y = y - 12 - b;
    TPART(x + 12, Y - 8, ['..dddd..', '.dqqwqd.', 'dqppqppd', 'dppppqpd', '.dcccbd.', '.dcbcbd.', '..dddd..'].map(r => r));
    TP(x + 15, Y - 9, 2, 1, 'r');                                                                                                 // вишенька
    TPART(x + 21, Y - 6, ['..ddddd..', '.dhyyhhd.', 'dhfyhfhhd', 'dhhkkhhod', 'dhyhhfhod', '.dhhhood.', '..ddddd..'].map(r => r.slice(0, 9)));
    TPART(x + 31, Y - 5, ['.dddd.', 'dmmmGd', 'dwwwwd', 'dmmmGd', '.dddd.']);
    TP(x + 9, Y, 30, 3, 'd'); TP(x + 10, Y, 28, 1, 'w'); TP(x + 10, Y + 1, 28, 1, 'E'); TP(x + 12, Y + 3, 24, 1, 'd');           // таця
    if (b === 2) { TP(x + 16, Y - 11, 1, 1, 'w'); TP(x + 34, Y - 7, 1, 1, 'w'); }
    TPAW(x + 7, Y);
  },
  baton(x, y, f) {                             // кийок охоронниці: чорний гумовий, срібні кінці, смугаста ручка з ремінцем; відблиск пробігає згори донизу
    const s = TP_PH[f & 3];
    TP(x + 11, y - 25, 6, 21, 'd');  TP(x + 12, y - 26, 4, 1, 'd');  TP(x + 12, y - 4, 4, 1, 'd');
    TP(x + 12, y - 25, 4, 19, 'k');  TP(x + 12, y - 25, 1, 19, 'e'); TP(x + 15, y - 24, 1, 17, 'z');
    TP(x + 12, y - 25, 4, 2, 'Y');   TP(x + 12, y - 25, 2, 1, 'w');  TP(x + 15, y - 24, 1, 1, 'e');
    TP(x + 12, y - 6, 4, 2, 'Y');    TP(x + 12, y - 6, 2, 1, 'w');   TP(x + 15, y - 5, 1, 1, 'e');
    for (let k = 0; k < 3; k++) { TP(x + 12, y - 15 + k * 2, 4, 1, 'h'); TP(x + 12, y - 15 + k * 2, 1, 1, 'y'); TP(x + 15, y - 15 + k * 2, 1, 1, 'o'); }   // смугаста ручка
    TP(x + 9, y - 4, 3, 1, 'r'); TP(x + 8, y - 3, 1, 2, 'r'); TP(x + 9, y - 2, 3, 1, 'R');                                                                // ремінець
    TP(x + 13, y - 23 + s * 3, 1, 4, 'w');
    if (s === 1) { TP(x + 18, y - 21, 1, 1, 'w'); }
    if (s === 2) { TP(x + 18, y - 21, 1, 3, 'w'); TP(x + 17, y - 20, 3, 1, 'w'); }
    TPAW(x + 9, y - 13);
  },
  box(x, y, f) {                               // картонний ящик об'ємом: верх, стрічка, наліпка, стрілка «догори»; підстрибує в такт
    const b = TP_PH[f & 3], Y = y - 12 - b, X = x + 11;
    TP(X + 2, Y - 3, 16, 1, 'd'); TP(X + 1, Y - 2, 18, 1, 'd'); TP(X + 2, Y - 2, 16, 1, 'y'); TP(X, Y - 1, 19, 1, 'd'); TP(X + 1, Y - 1, 16, 1, 'y');   // верх
    TP(X + 7, Y - 2, 4, 2, 'w');
    TPBX(X, Y, 17, 11, 'c', 'y', 'b'); TP(X + 17, Y - 1, 2, 11, 'd'); TP(X + 17, Y, 1, 10, 'b');                                     // перед і бік
    TP(X + 7, Y + 1, 4, 9, 'w'); TP(X + 7, Y + 1, 4, 1, 'W'); TP(X + 6, Y + 1, 1, 9, 'b'); TP(X + 11, Y + 1, 1, 9, 'b');              // стрічка
    TPBX(X + 12, Y + 4, 4, 4, 'w', 'w', 'E'); TP(X + 13, Y + 5, 2, 1, 'r');                                                           // наліпка
    TP(X + 3, Y + 3, 1, 4, 'b'); TP(X + 2, Y + 4, 3, 1, 'b');                                                                         // стрілка
    TPAW(X - 2, Y + 4);
  },
  ledger(x, y, f) {                            // розкрита книга обліку: сторінки вигнуті, стрічка-закладка; перо пише рядок туди-назад
    const s = TP_PH[f & 3], X = x + 11;
    TP(X, y - 21, 20, 14, 'd'); TP(X + 1, y - 20, 18, 12, 'r'); TP(X + 1, y - 9, 18, 1, 'R');                                     // палітурка
    TP(X + 2, y - 21, 7, 12, 'd'); TP(X + 11, y - 21, 7, 12, 'd'); TP(X + 2, y - 20, 7, 10, 'w'); TP(X + 11, y - 20, 7, 10, 'w'); TP(X + 9, y - 20, 2, 11, 'W');
    TP(X + 9, y - 19, 1, 10, 'E'); TP(X + 10, y - 19, 1, 10, 'e'); TP(X + 2, y - 11, 7, 1, 'E'); TP(X + 11, y - 11, 7, 1, 'E');    // згин і нижній край
    [y - 18, y - 16, y - 14].forEach((Y, i) => TP(X + 3, Y, 5 - (i & 1), 1, 'e'));
    TP(X + 12, y - 18, 5, 1, 'e'); TP(X + 12, y - 16, 4, 1, 'e'); TP(X + 12, y - 14, 1 + s * 2, 1, 'n');
    TP(X + 14, y - 8, 1, 3, 'h'); TP(X + 14, y - 5, 1, 1, 'o');                                                                   // закладка
    TPAW(X - 2, y - 13);
    const q = X + 13 + s * 2; TP(q, y - 13, 1, 1, 'k'); TP(q + 1, y - 15, 1, 2, 'd'); TP(q + 2, y - 18, 1, 3, 'w'); TP(q + 3, y - 20, 1, 3, 'w'); TP(q + 1, y - 17, 1, 2, 'S');   // перо
  },
  broom(x, y, f) {                             // віник із в'язаною мітлою змітає пил: ліворуч → посередині → праворуч
    const bx = x + 13, s = TP_PH[f & 3] - 1;
    TP(bx, y - 25, 3, 19, 'd'); TP(bx + 1, y - 24, 1, 17, 'c'); TP(bx, y - 26, 3, 1, 'd'); TP(bx + 1, y - 25, 1, 1, 'r');          // держак
    const X = bx - 5 + s;
    TPART(X, y - 8, ['...ddddddd...', '...drrrJrd...', '..ddddddddd..', '..dhyhyhohd..', '.dhyhohyhood.', '.dyhohyhohod.', 'dhyhohyhohood', 'dododododododd'.slice(0, 13)]);
    if (s < 0) { TP(bx - 9, y - 4, 2, 1, 'E'); TP(bx - 8, y - 6, 1, 1, 'E'); }
    if (s > 0) { TP(bx + 10, y - 4, 2, 1, 'E'); TP(bx + 11, y - 6, 1, 1, 'E'); }
    TPAW(bx - 1, y - 15);
  },
  dress(x, y, f) {                             // святкова сукня на вішаку: бретельки, пасок, спідниця зі складками й мереживом; повільно міняє колір, блиск пробігає
    const alt = f >= 6, c = alt ? 'p' : 'u', l = 'q', s = alt ? 'J' : 'P', X = x + 11, sw = TP_PH[f & 3] - 1, B = alt ? 'r' : 'h', Q = alt ? 'w' : 'y';
    TPART(X + 4, y - 27, ['...YY..', '..Y..Y.', '.....Y.', '....Y..', '..dYd..', '.dYYYd.', 'dYd.dYd']);
    TPART(X, y - 20, [
      '....d' + l + 'd.d' + l + 'd....',
      '....d' + l + 'ddd' + c + 'd....',
      '...d' + l + c + c + Q + c + c + s + 'd...',
      '...d' + l + c + c + c + c + c + s + 'd...',
      '....d' + c + c + c + c + s + 'd....',
      '....d' + B + B + B + B + B + 'd....',
      '...d' + l + c + c + c + c + s + s + 'd...',
      '..d' + l + c + c + s + c + c + c + s + s + 'd..',
      '..d' + l + c + c + s + c + c + c + s + s + 'd..',
      '.d' + l + l + c + c + s + c + c + c + c + s + s + 'd.',
      '.d' + l + c + c + c + s + c + c + c + c + s + s + 'd.',
      'd' + l + l + c + c + c + s + c + c + c + c + s + s + s + 'd',
      'd' + l + c + c + c + c + s + c + c + c + c + c + s + s + 'd',
      'dwdwdwdwdwdwdwd'
    ]);
    const gx = X + 7 + sw * 4; TP(gx, y - 12, 1, 1, 'w'); TP(gx - 1, y - 11, 3, 1, 'w'); TP(gx, y - 10, 1, 1, 'w');
    TPAW(X + 1, y - 15);
  },
  clipboard(x, y, f) {                         // дошка з папером і металевим затиском; олівець виводить рядок і ставить галочки
    const s = TP_PH[f & 3], X = x + 11;
    TPBX(X, y - 21, 14, 17, 'l', 'c', 'b');
    TP(X + 2, y - 18, 10, 12, 'w'); TP(X + 2, y - 7, 10, 1, 'E'); TP(X + 11, y - 18, 1, 12, 'E');
    TP(X + 4, y - 23, 6, 4, 'd'); TP(X + 5, y - 22, 4, 2, 'Y'); TP(X + 5, y - 22, 4, 1, 'w');                                     // затиск
    [[y - 16], [y - 13], [y - 10]].forEach((r, i) => { TP(X + 3, r[0], 1, 1, 'g'); TP(X + 4, r[0] - 1, 1, 1, 'g'); TP(X + 6, r[0], i === 2 ? 1 + s * 2 : 4, 1, i === 2 ? 'n' : 'e'); });
    TPAW(X - 2, y - 13);
    TP(X + 14, y - 13 - s, 2, 8, 'd'); TP(X + 14, y - 12 - s, 1, 6, 'o'); TP(X + 15, y - 12 - s, 1, 6, 'h'); TP(X + 14, y - 14 - s, 2, 1, 'p'); TP(X + 14, y - 5 - s, 1, 1, 'k');   // олівець
  },
  megaphone(x, y, f) {                         // гучномовець збоку: дзвін, біла смуга, ручка; дуги звуку розходяться одна за одною
    TPART(x + 10, y - 25, [
      '.........ddd.',
      '.......ddrrd.',
      '.....ddjrrkd.',
      '...ddjjrrrkd.',
      'dddjjrrrrRkd.',
      'dEwwwwwwwRkd.',
      'dEwwwwwwwRkd.',
      'dddrrrrRRRkd.',
      '...ddrRRRRkd.',
      '.....ddRRRkd.',
      '.......ddRRd.',
      '.........ddd.'
    ]);
    TP(x + 15, y - 14, 4, 6, 'd'); TP(x + 16, y - 14, 2, 5, 'e'); TP(x + 16, y - 14, 1, 5, 'E');
    const w = f % 3, wc = n => (w === n ? 'w' : 'e');
    TP(x + 24, y - 21, 1, 1, wc(0)); TP(x + 25, y - 20, 1, 4, wc(0)); TP(x + 24, y - 16, 1, 1, wc(0));
    TP(x + 26, y - 23, 1, 1, wc(1)); TP(x + 27, y - 22, 1, 1, wc(1)); TP(x + 28, y - 21, 1, 6, wc(1)); TP(x + 27, y - 15, 1, 1, wc(1)); TP(x + 26, y - 14, 1, 1, wc(1));
    TP(x + 29, y - 25, 1, 1, wc(2)); TP(x + 30, y - 24, 1, 2, wc(2)); TP(x + 31, y - 22, 1, 8, wc(2)); TP(x + 30, y - 14, 1, 2, wc(2)); TP(x + 29, y - 12, 1, 1, wc(2));
    TPAW(x + 13, y - 12);
  },
  tablet(x, y, f) {                            // планшет: темна рамка, світлий екран із графіком і лінією зростання, стовпчик росте
    const s = TP_PH[f & 3], X = x + 11;
    TP(X + 1, y - 22, 17, 1, 'd'); TP(X, y - 21, 19, 13, 'd'); TP(X + 1, y - 8, 17, 1, 'd');
    TP(X + 1, y - 21, 17, 13, 'z'); TP(X + 1, y - 21, 17, 1, 'n');
    TP(X + 2, y - 20, 15, 11, f >= 6 ? 's' : 'S'); TP(X + 2, y - 20, 15, 1, 'w');
    TP(X + 3, y - 12, 2, 3, 'g'); TP(X + 3, y - 12, 1, 3, 'm');
    TP(X + 6, y - 14, 2, 5, 'h'); TP(X + 6, y - 14, 1, 5, 'y');
    TP(X + 9, y - 13, 2, 4, 'g'); TP(X + 9, y - 13, 1, 4, 'm');
    TP(X + 12, y - 15 - s, 2, 6 + s, 'r'); TP(X + 12, y - 15 - s, 1, 6 + s, 'j');
    TP(X + 4, y - 16, 1, 1, 'n'); TP(X + 5, y - 17, 2, 1, 'n'); TP(X + 7, y - 16, 2, 1, 'n'); TP(X + 9, y - 17, 2, 1, 'n'); TP(X + 11, y - 18 - (s >> 1), 3, 1, 'n');
    TP(X + 9, y - 8, 2, 1, 'e');                                                                                                  // кнопка
    TPAW(X - 2, y - 13);
  },
  cart(x, y, f) {                              // магазинний візок: дротяний кошик із товаром, ручка до лапки, колеса крутяться
    const s = TP_PH[f & 3], sp = f & 1, B = x + 16, u = s >> 1;
    // товар стоїть у кошику за дротом, підстрибує на кроці
    TPBX(B + 1, y - 19 - u, 6, 13 + u, 'r', 'J', 'R'); TP(B + 2, y - 17 - u, 4, 1, 'w');                                                       // коробка
    TP(B + 8, y - 23 - u, 3, 5, 'd'); TP(B + 9, y - 22 - u, 1, 4, 'g'); TPBX(B + 7, y - 19 - u, 5, 13 + u, 'g', 'm', 'G'); TP(B + 8, y - 16 - u, 3, 2, 'w');  // пляшка
    TPBX(B + 11, y - 17 - u, 5, 11 + u, 'h', 'y', 'o'); TP(B + 12, y - 15 - u, 3, 1, 'o');                                                      // хліб
    // кошик: верхній край, дріт, низ
    for (let j = 0; j < 7; j++) {
      const Y = y - 12 + j, W = 16 - Math.round(j * 0.45);
      TP(B - 1, Y, 1, 1, 'd'); TP(B + W, Y, 1, 1, 'd');
      if (j % 2) TP(B, Y, W, 1, 'Y');
      for (let i = 2; i < W; i += 3) TP(B + i, Y, 1, 1, 'E');
    }
    TP(B - 2, y - 14, 20, 2, 'd'); TP(B - 1, y - 14, 18, 1, 'Y'); TP(B - 1, y - 14, 3, 1, 'w');
    TP(B - 1, y - 5, 16, 1, 'd');
    // ручка
    TP(B - 4, y - 17, 2, 4, 'd'); TP(B - 3, y - 16, 1, 2, 'Y'); TP(B - 6, y - 19, 5, 3, 'd'); TP(B - 5, y - 18, 3, 1, 'r');
    // колеса
    [B + 1, B + 10].forEach(wx => { TP(wx, y - 4, 4, 4, 'd'); TP(wx + 1, y - 3, 2, 2, 'E'); TP(wx + 1 + sp, y - 3 + sp, 1, 1, 'k'); });
    TPAW(B - 6, y - 19);
  },
};
function teamPropArt(g, prop, x, y, f, id, dir, noPaw) {   // x — центр звіра, y — ноги; f — кадр 0..11 (4 кадри руху × 3)
  const fn = TEAM_PROP_ART[prop]; if (!fn) return;
  TPG = g; TPNOPAW = !!noPaw; TPC = PAW_TINT[id] || PAW_COL[TEAM_SPECIES[id]] || PAW_COL.hedgehog; TPX = x; TPY = y;
  if (dir < 0) { g.save(); g.translate(2 * x, 0); g.scale(-1, 1); }
  fn(noPaw ? x : x + 1, y, f | 0);                          // герой у грі ширший за портрет на картці
  if (dir < 0) g.restore();
}
// Портрет героя на картці команди (34×27): справа від нього — його предмет у руках; колір фону портрета й сам звір — як і раніше
function drawTeamPortrait(cv, id) {
  const g = cv.getContext('2d'), m = TEAM.find(t => t.id === id); g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height);
  if (m && m.spot.prop !== 'none') teamPropArt(g, m.spot.prop, 1, 27, 0, id, 1, true);
  g.drawImage(getSpriteCanvas(teamSprite(id)), 0, 0);
}
