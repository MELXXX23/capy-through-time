//#part 180_b_actor_draw_lines.js
// Випадкова точка, куди піти: недалеко від свого місця, але подалі від інших звіряток
function pickWanderTarget(a) {
  const home = actorHome(TEAM[a.i]);
  let best = null, bestD = -Infinity;
  // звірята розходяться по всій видимій вулиці, а не купчаться біля магазину
  const L = worldL() + 14, R = worldR() - 14;
  for (let k = 0; k < 8; k++) {
    const tx = Math.max(L, Math.min(R, Math.random() < 0.2 ? rand(L, R) : home + rand(-160, 160)));
    const ty = rand(LAYOUT.streetTop + 8, roadFloor());
    let md = 1e9;
    actors.forEach(o => {
      if (o === a) return;
      const walking = o.mode === 'walk' || o.mode === 'toBench';
      md = Math.min(md, Math.hypot(tx - (walking ? o.tx : o.x), (ty - (walking ? o.ty : o.y)) * 1.6));
    });
    md += Math.min(60, Math.abs(tx - LAYOUT.centerX)) * 0.3;               // трохи подалі від входу в магазин
    if (capyZone(tx, ty) || capyPathBlocked(a.x, a.y, tx, ty)) md -= 1e6;       // не лізти на Капі, не заходити за неї й не ходити крізь неї
    if (md > bestD) { bestD = md; best = [tx, ty]; }
  }
  a.tx = best[0]; a.ty = best[1];
}

// Предмет у лапках звірятка (малюється поверх спрайта). t — час, dir — куди йде
function drawTeamProp(prop, x, y, t, dir) {
  const ph = Math.floor(t * 3) % 2;
  switch (prop) {
    case 'register': {   // прилавок з касою стоїть збоку (ліворуч від їжака), щоб Голка було повністю видно, а не лише голову
      const rx = x - 11;                                  // прилавок по центру, перед їжаком: закриває лише живіт, не лице
      R(ctx, rx, y - 6, 22, 6, 'b'); R(ctx, rx, y - 6, 22, 1, 'l'); R(ctx, rx, y - 1, 22, 1, 'd'); R(ctx, rx + 7, y - 5, 1, 4, 'd'); R(ctx, rx + 14, y - 5, 1, 4, 'd');
      R(ctx, rx + 15, y - 9, 6, 3, 'e'); R(ctx, rx + 16, y - 8, 4, 1, 'g'); R(ctx, rx + 1, y - 8, 4, 2, 'h');                       // каса справа, зошит зліва
      if (Math.floor(t * 1.2) % 3 === 0) R(ctx, rx + 18, y - 11 - ph, 2, 2, 'y');
      break;
    }
    case 'hammer': {     // молоток і дошка
      const up = Math.floor(t * 3) % 2 === 0;
      R(ctx, x + 7, y - 2, 13, 2, 'l'); R(ctx, x + 7, y - 1, 13, 1, 'd');
      if (up) { R(ctx, x + 11, y - 15, 1, 8, 'd'); R(ctx, x + 9, y - 17, 5, 3, 'e'); }
      else { R(ctx, x + 11, y - 9, 1, 7, 'd'); R(ctx, x + 9, y - 4, 5, 3, 'e'); R(ctx, x + 15, y - 4, 1, 1, 'y'); }
      break;
    }
    case 'tray':         // таця з цукерками
      R(ctx, x - 9, y - 8, 18, 2, 'b'); R(ctx, x - 9, y - 8, 18, 1, 'l');
      ['p', 'h', 'm', 'q'].forEach((c, k) => R(ctx, x - 7 + k * 4, y - 11 - ((k + ph) % 2), 3, 3, c));
      break;
    case 'baton':        // кийок охоронниці
      R(ctx, x + 9, y - 10, 2, 10, 'd'); R(ctx, x + 9, y - 10, 2, 2, 'h');
      break;
    case 'box':          // ящик
      R(ctx, x - 7, y - 6, 14, 6, 'c'); R(ctx, x - 7, y - 6, 14, 1, 'l'); R(ctx, x - 7, y - 1, 14, 1, 'd');
      R(ctx, x - 7, y - 6, 1, 6, 'd'); R(ctx, x + 6, y - 6, 1, 6, 'd'); R(ctx, x - 1, y - 6, 2, 6, 'b');
      break;
    case 'ledger':       // бухгалтерська книга
      R(ctx, x - 6, y - 8, 12, 6, 'w'); R(ctx, x - 6, y - 8, 12, 1, 'd'); R(ctx, x - 6, y - 3, 12, 1, 'd'); R(ctx, x, y - 8, 1, 6, 'd');
      R(ctx, x - 5, y - 6, 4, 1, 'e'); R(ctx, x + 2, y - 6 + ph, 3, 1, 'e');
      break;
    case 'broom': {      // віник
      const bx = x + 9 * dir;
      R(ctx, bx, y - 13, 1, 12, 'b'); R(ctx, bx - 2 + ph, y - 3, 5, 3, 'h'); R(ctx, bx - 2 + ph, y - 1, 5, 1, 'o');
      break;
    }
    case 'dress':        // сукня на вішаку
      R(ctx, x + 8, y - 14, 1, 3, 'd'); R(ctx, x + 6, y - 11, 5, 6, ph ? 'p' : 'u'); R(ctx, x + 5, y - 5, 7, 2, ph ? 'p' : 'u');
      break;
    case 'clipboard':    // планшет з папером
      R(ctx, x + 6, y - 12, 7, 9, 'l'); R(ctx, x + 7, y - 11, 5, 7, 'w');
      R(ctx, x + 8, y - 10 + ph, 3, 1, 'e'); R(ctx, x + 8, y - 8, 3, 1, 'e'); R(ctx, x + 8, y - 6, 2, 1, 'e');
      break;
    case 'megaphone':    // гучномовець
      R(ctx, x + 7, y - 12, 3, 4, 'p'); R(ctx, x + 10, y - 14, 3, 8, 'p'); R(ctx, x + 10, y - 14, 1, 8, 'q');
      if (ph) { R(ctx, x + 14, y - 12, 1, 1, 'w'); R(ctx, x + 16, y - 10, 1, 1, 'w'); R(ctx, x + 14, y - 8, 1, 1, 'w'); }
      else { R(ctx, x + 15, y - 11, 1, 1, 'w'); R(ctx, x + 17, y - 9, 1, 1, 'w'); }
      break;
    case 'tablet':       // планшет
      R(ctx, x - 5, y - 9, 10, 7, 'd'); R(ctx, x - 4, y - 8, 8, 5, ph ? 's' : 'S'); R(ctx, x - 2, y - 6, 1, 1, 'n');
      break;
    case 'cart': {       // візок
      const cx = x + 11 * dir;
      R(ctx, cx - 5, y - 8, 10, 5, 'e'); R(ctx, cx - 5, y - 8, 10, 1, 'E');
      R(ctx, cx - 4, y - 11, 3, 3, 'r'); R(ctx, cx, y - 11, 3, 3, 'g');
      R(ctx, cx - 4, y - 2, 2, 2, 'd'); R(ctx, cx + 2, y - 2, 2, 2, 'd');
      break;
    }
  }
}

const ACTOR_K = 1.4;                                   // звірята-працівники й гості: 16 px × 1,4 ≈ 22 px (було 1,56; −10%), Капі 24 px × 1,3 ≈ 31 px
function actorK(a) { return ACTOR_K; }
// Чітка «фігурка»: спрайт спершу масштабується (nearest) і лише потім обводиться — контур завжди рівно 1 px,
// без світного німба й без розмитих країв, які давав масштаб 1,56 прямо на сцені.
// Рівне масштабування спрайта в k разів (k ≥ 1). Звичайне «nearest» дає то 1, то 2 пікселі на кожен піксель оригіналу,
// тому два однакових ока виходили різного розміру. Тут зайві колонки дублюються ЛИШЕ симетричними парами (ліве й праве око завжди однакові),
// а дублюються колонки/рядки з найменшою кількістю деталей (очі, ніс, рот лишаються по 1 пікселю на піксель оригіналу).
const evenScaleCache = new WeakMap();
function evenScaled(src, k) {
  let memo = evenScaleCache.get(src); if (!memo) { memo = {}; evenScaleCache.set(src, memo); }
  if (memo[k]) return memo[k];
  const W = src.width, H = src.height, d = src.getContext('2d').getImageData(0, 0, W, H).data;
  const same = (a, b) => { const i = a * 4, j = b * 4; if (d[i + 3] < 8 && d[j + 3] < 8) return true; return d[i] === d[j] && d[i + 1] === d[j + 1] && d[i + 2] === d[j + 2] && d[i + 3] === d[j + 3]; };
  const cs = new Array(W).fill(0), rs = new Array(H).fill(0);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (x + 1 < W && !same(i, i + 1)) { cs[x]++; cs[x + 1]++; rs[y]++; }
    if (y + 1 < H && !same(i, i + W)) { rs[y]++; rs[y + 1]++; cs[x]++; }
  }
  const extraX = Math.max(0, Math.round(W * k) - W), extraY = Math.max(0, Math.round(H * k) - H);
  const dc = new Array(W).fill(0), dr = new Array(H).fill(0);
  let pairs = Math.floor(extraX / 2);
  if (W % 2 === 1 && extraX % 2 === 1) dc[(W - 1) >> 1] = 1;                                   // непарна ширина: центральна колонка симетрична сама собі
  for (let n = 0; n < pairs; n++) {
    let best = -1, bc = 1e9;
    for (let i = 0; i < (W >> 1); i++) {
      if (dc[i]) continue;
      const c = cs[i] + cs[W - 1 - i] + ((i > 0 && dc[i - 1]) || (dc[i + 1]) ? 4 : 0) + (i === 0 ? 3 : 0);          // подвійні колонки поруч — погано; крайню (контур) краще лишити
      if (c < bc) { bc = c; best = i; }
    }
    if (best < 0) break;
    dc[best] = 1; dc[W - 1 - best] = 1;
  }
  for (let n = 0; n < extraY; n++) {
    let best = -1, bc = 1e9;
    for (let y = 0; y < H; y++) {
      if (dr[y]) continue;
      const c = rs[y] + ((y > 0 && dr[y - 1]) || (y + 1 < H && dr[y + 1]) ? 4 : 0) + (y === 0 || y === H - 1 ? 3 : 0);
      if (c < bc) { bc = c; best = y; }
    }
    if (best < 0) break;
    dr[best] = 1;
  }
  const Wt = W + dc.reduce((a, b) => a + b, 0), Ht = H + dr.reduce((a, b) => a + b, 0);
  const out = document.createElement('canvas'); out.width = Wt; out.height = Ht;
  const og = out.getContext('2d'), od = og.createImageData(Wt, Ht), o = od.data;
  let oy = 0;
  for (let y = 0; y < H; y++) {
    const ry = 1 + dr[y]; let ox = 0;
    for (let x = 0; x < W; x++) {
      const rx = 1 + dc[x], s = (y * W + x) * 4;
      for (let yy = 0; yy < ry; yy++) for (let xx = 0; xx < rx; xx++) { const t = ((oy + yy) * Wt + ox + xx) * 4; o[t] = d[s]; o[t + 1] = d[s + 1]; o[t + 2] = d[s + 2]; o[t + 3] = d[s + 3]; }
      ox += rx;
    }
    oy += ry;
  }
  og.putImageData(od, 0, 0);
  return (memo[k] = out);
}
const crispFigCache = new Map();
function crispFigure(name, flip) {
  const key = name + '|' + (flip ? 1 : 0) + '|' + ACTOR_K;
  let c = crispFigCache.get(key); if (c) return c;
  const src = evenScaled(getSpriteCanvas(name), ACTOR_K), w = src.width, h = src.height;
  const body = document.createElement('canvas'); body.width = w; body.height = h;
  const bg = body.getContext('2d'); bg.imageSmoothingEnabled = false;
  if (flip) { bg.translate(w, 0); bg.scale(-1, 1); }
  bg.drawImage(src, 0, 0);
  const sil = document.createElement('canvas'); sil.width = w; sil.height = h;
  const sg = sil.getContext('2d'); sg.drawImage(body, 0, 0); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = PALETTE.k; sg.fillRect(0, 0, w, h);
  c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2;
  const g = c.getContext('2d'); [[0, 1], [2, 1], [1, 0], [1, 2]].forEach(o => g.drawImage(sil, o[0], o[1])); g.drawImage(body, 1, 1);
  crispFigCache.set(key, c);
  return c;
}
function drawCrispFigure(name, x0, y0, bob, flip) {      // x0, y0 — ноги по центру; bob — підстрибування в «малих» пікселях
  ctx.drawImage(crispFigure(name, flip), Math.round(x0 - 8 * ACTOR_K) - 1, Math.round(y0 - (16 + bob) * ACTOR_K) - 1);
}
function actorPose(a) {
  const m = TEAM[a.i];
  const sitting = a.mode === 'sit';
  const waddle = a.moving ? Math.floor(a.t * 5) % 2 : 0;
  const idleBob = !a.moving && !sitting && Math.sin(a.t * 2.4 + a.i) > 0.7 ? 1 : 0;
  const hopY = Math.round(Math.sin(Math.min(1, a.hop) * Math.PI) * 4);
  let flip = a.moving && a.dir < 0;                 // дзеркалення лише за напрямком руху (раніше блимало з кожним кроком і розмивало очі); крок — підстрибування на 1 px
  if (m.id === 'tonya') flip = Math.floor(a.t / 3) % 2 === 1;   // охоронниця виглядає то вліво, то вправо
  return { m, x: Math.round(a.x), y: a.y, sitting, waddle, idleBob, hopY, flip, bob: waddle + idleBob + hopY };
}
function drawActor(a) {
  const x0 = Math.round(a.x), y0 = a.y, k = actorK(a), p = actorPose(a);
  const scaled = fn => { ctx.save(); ctx.translate(x0, y0); ctx.scale(k, k); ctx.translate(-x0, -y0); fn(); ctx.restore(); };
  scaled(() => { ctx.globalAlpha = 0.3; R(ctx, p.x - 8, p.y, 16, 2, 'd'); ctx.globalAlpha = 0.18; R(ctx, p.x - 5, p.y + 2, 10, 1, 'd'); ctx.globalAlpha = 1; });
  const behindProp = false;          // каса малюється ПІСЛЯ фігури: їжак стоїть за нею, але вона низька й лице не закриває
  if (behindProp && !p.sitting) scaled(() => drawTeamProp('register', p.x, p.y - p.waddle - p.idleBob - p.hopY, a.t, a.dir));
  drawCrispFigure(teamSprite(p.m.id), p.x, p.y, p.bob, p.flip);
  scaled(() => {
    const { m, x, y, sitting, waddle, idleBob, hopY } = p;
    if (hasHats()) drawHat(x, y - 13 - waddle - idleBob - hopY, a.i);
    if (!sitting && !behindProp) drawTeamProp(m.spot.prop, x, y - waddle - idleBob - hopY, a.t, a.dir);
    if (a.rest > 0) drawDrink(x, y - hopY, a.t);
    if (hasScarves()) drawScarf(x, y - 16 - waddle - idleBob - hopY, a.i);
  });
}
// Склянка води в лапках і краплі поту (літній перепочинок)
function drawDrink(x, y, t) {
  const sip = Math.floor(t * 2.5) % 3 === 0;           // час від часу склянка піднімається до рота
  const cy = sip ? y - 13 : y - 9;
  R(ctx, x + 4, cy - 1, 5, 6, 'd'); R(ctx, x + 5, cy, 3, 4, 'S'); R(ctx, x + 5, cy, 3, 1, 'w'); R(ctx, x + 5, cy + 2, 3, 2, 's');
  const ph = Math.floor((t * 3) % 3);
  R(ctx, x - 7, y - 17 + ph, 1, 2, 's'); R(ctx, x + 8, y - 18 + ph, 1, 1, 'S');
}
// Зимою на звірятках шарфики: шия + хвіст шарфа
const SCARF_COLORS = ['r', 'n', 'g', 'u', 'o', 'p'];
function hasScarves() { return theme.season === 'winter'; }
function drawScarf(cx, top, i) {          // top — верх спрайта 16×16
  const c = SCARF_COLORS[i % SCARF_COLORS.length];
  R(ctx, cx - 5, top + 9, 10, 2, c);
  for (let k = -4; k <= 4; k += 3) R(ctx, cx + k, top + 9, 1, 2, 'w');
  R(ctx, cx + 2, top + 11, 3, 4, c); R(ctx, cx + 2, top + 12, 3, 1, 'w'); R(ctx, cx + 2, top + 14, 3, 1, 'w');
}

function hitActor(p) {
  let best = null;
  actors.forEach(a => {
    if (Math.abs(p.x - a.x) <= 10 * actorK(a) && p.y >= a.y - 19 * actorK(a) && p.y <= a.y + 3 && (!best || a.y > best.y)) best = a;
  });
  return best;
}
function hitCapy(p) {
  const c = LAYOUT.capy;
  return p.x >= c.x + 14 - 17 * CAPY_K && p.x <= c.x + 14 + 17 * CAPY_K && p.y >= c.footY - 30 * CAPY_K && p.y <= c.footY;
}

// Межі видимої частини сцени для бульбашок (у координатах сцени)
function bubbleBounds() {
  const sceneH = parseFloat(ui.scene.style.height) || (view.h * sceneUnit);
  const top = -view.offY + (view.h * sceneUnit - sceneH) / sceneUnit;
  const tb = document.getElementById("topbar"), tbh = tb ? tb.getBoundingClientRect().bottom : 0;                        // верхню панель з рахунком бульбашки не перекривають
  return { l: visL(), r: visR(), t: top + 2, b: top + sceneH / sceneUnit, il: visL() + 38 / sceneUnit, ir: visR() - 40 / sceneUnit, it: top + (tbh + 6) / sceneUnit };
}
// Ставить бульбашку так, щоб вона повністю лишалась у кадрі
function placeBubble(el, x, y, bb0) {
  const bb = bb0 || bubbleBounds(), hw = (el._w || (el._w = el.offsetWidth)) / 2 / sceneUnit + 2, hh = (el._h || (el._h = el.offsetHeight)) / sceneUnit + 6;
  const cx = Math.max(bb.il + hw, Math.min(bb.ir - hw, x)), cy = Math.max(bb.it + hh, Math.min(bb.b - 4, y));
  el._cx = cx;
  el.style.left = Math.round((cx + view.offX) * sceneUnit) + 'px'; el.style.top = Math.round((cy + view.offY) * sceneUnit) + 'px';
  const lim = Math.max(0, el.offsetWidth / 2 - 9);
  el.style.setProperty('--tail', Math.max(-lim, Math.min(lim, Math.round((x - cx) * sceneUnit))) + 'px');   // хвостик показує на звірятко, навіть коли бульбашка підсунута від краю кадру
}
function dropBubble(key) { const el = bubbleEls[key]; if (el) { clearTimeout(el._timer); el.remove(); delete bubbleEls[key]; } }
// Бульбашка з фразою над головою (key — щоб у одного персонажа була лише одна). Якщо той, хто говорить, поза видимою частиною вулиці — фраза не з'являється
function showBubble(key, text, x, y, follow) {
  const bb = bubbleBounds();
  if (x < bb.l + 3 || x > bb.r - 3) { dropBubble(key); return; }
  let el = bubbleEls[key];
  if (!el) {
    el = document.createElement('div');
    el.className = 'bubble';
    ui.bubbles.appendChild(el);
    bubbleEls[key] = el;
  }
  el.textContent = text; el._w = 0; el._h = 0;
  playSfx('pip');
  el._follow = follow || null;                  // follow — функція, що дає поточне місце того, хто говорить
  el._x = x; el._y = Math.max(24, y);
  placeBubble(el, x, el._y);
  Object.keys(bubbleEls).forEach(k => {                  // нова бульбашка прибирає старі поруч, щоб репліки не налазили одна на одну
    const o = bubbleEls[k];
    if (k !== key && Math.abs(o._cx - el._cx) < 58) dropBubble(k);
  });
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.remove(); delete bubbleEls[key]; }, Math.max(CONFIG.BUBBLE_SECONDS, 1.8 + text.length * 0.055) * 1000);
}
// Бульбашки йдуть слідом за звірятком, яке говорить
let bubLastCamX = null, bubScrollUntil = 0;       // поки камеру гортають, репліки миттєво ховаються (не тягнуться від краю), а потім повертаються на місце
function updateBubbles() {
  const bb = bubbleBounds(), now = performance.now();
  if (bubLastCamX !== null && Math.abs(viewCrop.x - bubLastCamX) > 0.01) bubScrollUntil = now + 160;
  bubLastCamX = viewCrop.x;
  const scrolling = now < bubScrollUntil;
  Object.keys(bubbleEls).forEach(k => {
    const el = bubbleEls[k];
    if (scrolling) { el.style.visibility = 'hidden'; return; }
    if (el.style.visibility) el.style.visibility = '';
    if (!el._follow) { if (el._x < bb.l + 3 || el._x > bb.r - 3) { dropBubble(k); return; } placeBubble(el, el._x, el._y, bb); return; }
    const p = el._follow();
    if (!p) { dropBubble(k); return; }
    if (p.x < bb.l + 3 || p.x > bb.r - 3) { dropBubble(k); return; }        // звірятко пішло за межі кадру (або камеру посунули) — репліка зникає
    placeBubble(el, p.x, Math.max(24, p.y), bb);
  });
}
// Репліку обирає ситуація: взимку часто «холодні» фрази, часом — загальна репліка епохи, інакше — власна фраза звірятка; та сама фраза підряд не повторюється
function pickLine(id, own, cold, nCold) {
  const winter = theme.season === 'winter', ep = viewEpoch() % EPOCHS.length;
  for (let k = 0; k < 4; k++) {
    const r = Math.random();
    let key;
    if (winter && r < 0.4) key = cold + Math.floor(Math.random() * nCold);
    else if (r < (winter ? 0.62 : 0.3)) key = 'epoch_say_' + ep + '_' + Math.floor(Math.random() * 6);
    else key = own();
    if (key !== lastLine[id] || k === 3) { lastLine[id] = key; return t(key); }
  }
}
function actorSay(a) {
  const m = TEAM[a.i], up = () => ({ x: a.x, y: a.y - 19 * actorK(a) - 1 });
  const p = up();
  showBubble('t' + a.i, pickLine(m.id, () => 'team_' + m.id + '_say_' + Math.floor(Math.random() * TEAM_PHRASES), 'team_' + m.id + '_cold_', 3), p.x, p.y, up);
}
function wornSkinIds() {                                                       // ідентифікатори скінів, які зараз вдягнено (для реплік)
  const ids = [];
  SKIN_TYPES.forEach(ty => { const sk = skinOn(ty); if (sk) ids.push(ty + '_' + sk); });
  return ids;
}
// Живі репліки скінів: по 3–8 на скін, вибираються навмання без повтору поспіль (старі skinSay_* лишились запасним варіантом)
const SKIN_LINES = {"uk":{"capy_pirate":["Папуга знову вкрав моє печиво. Зрадник!","Де скарб? А, ось він. Це каса.","Йо-хо-хо... ой, доброго дня, шановні покупці!","Пов’язка на оці. Тепер бачу лише знижки."],"capy_astro":["Х’юстоне, чуєш? Тут пахне булочками!","У шоломі так тихо... Тільки я і мої думки. О, покупець!","Невагомість — це коли ніхто не просить “ще знижку”.","Один маленький тап для Капі, один гігантський прибуток для магазину."],"capy_wizard":["Абра-кадабра... ні, це не те. Зараз згадаю.","Борода сама росте. Я тут ні до чого. Ну, майже.","Чарівна паличка загубилась. Зате лишились нерви.","Зірки на мантії підморгують. Або мені здається."],"capy_chef":["Щось пахне смачно. То не я, то сусіди!","Ковпак великий, а ложка ще більша. Бачите?","Шеф радить: не їжте товар. Вибір уже зроблений.","Сіль, перець і трохи терпіння. Це весь секрет."],"capy_explorer":["За цим рогом точно щось цікаве. Або кіт.","Бінокль дивиться вгору, а я шукаю печиво.","Рюкзак важкий, зате там три бутерброди!","Мапа показує на північ. А ми на південь. Вибачте."],"capy_santa":["Хо-хо-хо! Хтось тут був чемний. Не будемо називати імен.","Мішок порожній. Усе роздано... мені.","Борода лоскочеться. Це так і має бути?","Кожен день трохи Різдво, коли вдягнеш червоне!"],"capy_witch":["Метла в ремонті. Тепер літаю на надії.","Гарбуз на спині дивиться на мене. Я теж на нього.","Зілля готове! Правда, нічого не пам’ятаю, що там було.","Брррр! Це хтось прошепотів “знижка”?"],"capy_flower":["Метелик сів мені на спину. Тс-с, не рухайтеся.","Квіти пахнуть весною. А я пахну квітами. Гарно!","Вінок трохи з’їхав. Але мені навіть подобається.","Бджоли вже питали, чи можна в нас пожити."],"capy_beach":["Хочу в море. Але тут хоч тінь від магазину.","М’яч на спині не втече. А от я втечу на пляж!","Окуляри темні, настрій світлий.","Лимонад, будь ласка. З льодом. І парасольку!"],"capy_autumn":["Шарф такий довгий, що я за нього чіпляюсь.","Листя шарудить, а в мене кава. Ідеальний ранок.","Осінь пахне корицею. Чи то від мене?","Теплий светр — це як обійми. Тільки трохи кусається."],"capy_ep0":["Береток набік, перо вгору. Ось тепер я митець.","Ця лілія на мантії не проста. Вона дорога!","Лютня десь грає. Хто там, виходьте!","Я весь у ренесансі. А ви?"],"capy_ep1":["Радіо ловить лише одну хвилю. Ну й нехай!","Літера C означає «Супер Капі». Секретна розшифровка.","Бульбашка жуйки... Ой, вона лопнула.","Куртка стара, а настрій новий."],"capy_ep2":["Диско-куля сяє! Я теж трохи сяю.","Окуляри великі, а бачу все. Навіть хто не платить.","Ноги самі просяться в танець!","Блиск, блиск, іще раз блиск!"],"capy_ep3":["Рівень пройдено! Наступний: порожня каса.","Геймпад на грудях. Для швидких рішень.","Один круг монет — і тут уже +1 життя.","Навушники грають восьмибітну музику. Класика!"],"capy_ep4":["Мій телефон на 1%. А настрій на сто!","Wi-Fi знайшов! Тепер можна жити.","Рюкзак повний стікерів. Сорок шість разів “лайк”.","Мене ніхто не підписав. Але я не ображаюсь."],"capy_ep5":["Паросток на рюкзаку підріс на сантиметр. Я пишаюсь!","Дерева ростуть, а ми їм допомагаємо.","Куртка зі старих пляшок. Нова, але з історією!","Дихайте глибоко. Тут майже ліс."],"capy_ep6":["Тиша... Тільки я і зорі. О, це касир кличе.","Шолом запотів, бо я радий!","Невагомість мені подобається. Бо печиво не падає.","Ракета чекає. А я чекаю покупців."],"capy_ep7":["Неон миготить, а я нервово усміхаюсь.","Візор світиться, але бачу гірше. Ох, стиль!","Місто ввечері — це як світломузика.","Кросівки теж світяться. Ходжу, як ліхтарик."],"capy_knight":["Мій меч гострий, а ціни чесні. Принаймні сьогодні.","Шолом великий, а видно тільки носа. Зручно!","Поки я у броні, нікому до мене діла. Мрія.","Хто тут ображає покупців? Назад, лицар уже в дорозі!"],"capy_hero":["Плащ розвівається, а я ні. Контролюю ситуацію.","Моя суперсила: знаходити печиво за три метри.","Маска трохи тисне, але героям так і треба.","Хтось тут кричав? Спокійно, я вже їду!"],"capy_cowboy":["У цьому місті діє закон. І закон каже: купуйте.","Капелюх з’їжджає на очі. Тримаю рівновагу.","Шериф вийшов на вулицю. Тихо!","Хустка пахне пилом і пригодами."],"capy_fairy":["Крильця щекочуть, коли сміюсь. Хі-хі.","Дрібка чарів, і день стає світлішим.","Корона ледь тримається на вухах. Це нормально?","Усі побажання виконую. Окрім “знижка ще більша”."],"capy_viking":["Рогатий шолом зачіпається за двері. Знову.","Щит міцний, а я м’який. Баланс!","На абордаж... тобто на кухню. Там вечеря.","Бородатий вікінг хоче обійми. Хто за?"],"capy_pilot":["Окуляри запотіли. Лечу наосліп, але з любов’ю.","Шарф довгий, а крила короткі. Вирішую по ходу.","Пристебніться! Зараз буде невеличка турбулентність.","Приземлення м’яке, як булочка."],"capy_mel":["Я Мел. Лис. Так, капібарою не стану, питали вже.","Ніка каже, що в мене забагато ідей. Це вона ще не бачила нотатки.","Ця гра почалась з одного пікселя й однієї безсонної ночі. Піксель досі тут.","Коли щось блимає не так, я кажу «це задум». Ніка робить вигляд, що вірить.","Кава від Ніки — найкращий баг-фікс. Не пояснюється, але працює.","Іноді заходжу в гру й бачу те, чого не писав. Це ви чи Ніка?","Хвіст пухнастий, а дедлайни ще пухнастіші.","Дякую, що граєте. Це правда найкращий момент мого робочого дня."],"capy_nika":["Я Ніка. Стрибаю, коли хвилююсь. А хвилююсь досить часто.","Мел знову плутає тап і клік. Не поправляю. Це наша традиція.","Морквину нікому не віддам. Навіть Мелу. Особливо Мелу.","Іноді малюю, іноді пишу код, іноді просто ляскаю вухами. Усе це робота.","Ця гра — про місто, у якому хочеться жити. І трохи про капібар.","Бантик на місці, вуха на місці, ідея теж. Лише кава закінчилась.","Бачу, ви тут уже давно. Це скільки днів? Дякую вам за них.","Мел називає мене перфекціоністкою. Я його — «потім виправимо». Разом ми студія."],"shop_candy":["Тут усе липке. Але приємно.","Лоліпоп вищий за мене. Мрія збулась.","Не облизуйте стіни. Я це кажу і собі."],"shop_gold":["Сяє так, що я бачу зайчики.","Золото холодне, а настрій теплий.","Касир носить окуляри від блиску. Правда!"],"shop_ice":["Бр-р-р! Але гарно, як у казці.","Сосулька впала. Не на мене, слава небу.","Знижки тут не тануть. Бо морозні!"],"shop_wood":["Пахне смолою й теплом. Як у лісі.","Дерев’яна хатина тримається міцно. Як я.","Скрип-скрип. Це добре. Це затишок!"],"shop_garden":["Квіти ростуть на даху. Хтось їх поливає?","Тут живе бджола. Ми вже подружились.","Магазин-сад: гуляєш і купуєш. Зручно."],"shop_xmas":["Вогники миготять. Мені теж хочеться.","Під ялинкою точно щось є. Я не дивлюсь... дивлюсь.","У магазині пахне мандаринами. Мрія!"],"shop_halloween":["Хтось ходить на горищі. Не я, чесно.","Гарбуз усміхається ширше за мене.","Цукерки чи жарт? Я вибираю цукерки."],"shop_spring":["Весна прийшла! Навіть у каси.","Пелюстки на даху. Дуже мило.","Птахи співають, а покупці усміхаються."],"shop_autumn":["Листя на даху шарудить, як мишка.","Тепло, затишно, і пахне яблуками.","Осінь у магазині — це як обійми."],"weather_rainbow":["Веселка! Дивіться, дивіться! Ой, зникла.","Кольорів так багато, що я їх не рахую.","Десь під нею точно ховається горщик із печивом."],"weather_lightning":["Бах! Це було гучно, але красиво.","Блискавка фіолетова. Мені подобається.","Тримаю вуха під кепкою. На всяк випадок."],"weather_lightninggreen":["Зелена блискавка! Точно чарівна.","Бах-бах! А чому не червона?","Хтось там у небі грається в неон."],"weather_lightningred":["Червона блискавка! Аж серце тьохнуло.","Вона така яскрава, що я мружусь.","Небо сердиться, але гарно сердиться."],"weather_cottoncloud":["Хмара з цукрової вати. Хто надкусив?","Хочу залізти й поспати. Вона ж солодка!","Дощику з карамелі ще не чекаємо?"],"weather_goldcloud":["Золота хмара! Іноді з неї падають монети.","Небо теж вирішило заробляти. Молодець.","Дивіться вгору. Може, пощастить!"],"weather_starcloud":["Зірки у хмарах мерехтять. Загадаю бажання.","Хмара переливається. Хочу таку шапку.","Тихо, тихо... Чуєте, як вона співає?"],"hero_party":["Свято щодня! Конфеті в кожній кишені.","Помічники в капелюшках. Просто мрія.","Ну що, потанцюємо? Каса почекає."],"hero_ninja":["Хтось пробіг? Ні? Ну, тоді то були ніндзя.","Тихо як тінь. Кажуть, це наші.","Я їх не бачу. І не побачу. Вони молодці."],"hero_chef":["Пахне булочками. Хто там готує?","Помічники-кухарі нагодують і покупців, і мене.","Тільки не їжте товар. Це я собі кажу."],"hero_wizard":["Помічники чаклують! Черга зменшується сама.","Мантії блимають, а я усміхаюсь.","Чарівна паличка в кишені? Мене теж навчіть!"],"hero_royal":["Помічники в коронах. Ваша величносте, каса там!","Король із ковбасою? Це вже вищий рівень.","Королівська команда працює без вихідних."],"hero_santa":["Пакують подарунки так швидко, що я не встигаю.","Червоні шапки скрізь. Свята прийшли!","Хо-хо, це вже не жарт, це команда!"],"hero_witch":["Відьмочки літають між полицями. Тільки б не збили.","Капелюхи гострі. Не підходьте надто близько.","Зілля для швидкого обслуговування. Корисно!"],"street_brick":["Цегляна дорога. Куди вона веде? До каси!","Ходити приємно. Кожна цеглина рівна.","Дорога червона. Як мої щоки зараз."],"street_wood":["Дошки скрипять під лапами. Затишно!","Дерев’яна доріжка пахне лісом.","Скрип-скрип. Наче хтось іде. Ой, це я."],"street_leaves":["Хрум-хрум! Мій улюблений звук осені.","Листя під лапами: як килим із чорного золота.","Хтось розсипав листя. Дякую, добра людино!"],"street_snow":["Сніг! Ні, не їсти. Обійдусь без снігу.","Лапи холодні, а серце тепле.","Скрип-скрип. Сніг — теж музика."],"street_moss":["Мох м’який, як килим. Піду полежу.","Замшіла бруківка пам’ятає багато історій.","У шві росте квіточка. Не наступіть!"],"street_gold":["Золота дорога! Хоч і не з рубінів.","Іду, а під лапами сяє. Приємно.","Цеглина з монети. Не чіпати, не мою."]},"en":{"capy_pirate":["The parrot stole my cookie again. Traitor!","Where's the treasure? Oh, that's the till.","Yo-ho-ho... oh, hello, dear customers!","Eye patch on. Now I only see discounts."],"capy_astro":["Houston, do you smell buns?","So quiet in the helmet... just me and my thoughts. Oh, a customer!","Zero gravity is when nobody asks for 'one more discount'.","One small tap for Capy, one giant profit for the shop."],"capy_wizard":["Abra-ca-dabra... no, wrong one. I'll remember in a sec.","The beard grows on its own. I did nothing. Almost.","I lost my wand. At least my nerves are still here.","The stars on my robe are winking. Or I'm imagining."],"capy_chef":["Something smells great. Not me, it's the neighbours!","Big hat, bigger spoon. See?","The chef advises: don't eat the goods. The choice is made.","Salt, pepper and a little patience. That's the whole secret."],"capy_explorer":["Something interesting is round that corner. Or a cat.","The binoculars look up, I look for cookies.","The backpack is heavy, but it has three sandwiches!","The map says north. We go south. Sorry."],"capy_santa":["Ho-ho-ho! Someone here was good. No names.","The sack is empty. I gave it all... to myself.","The beard tickles. Is it supposed to?","Every day is a bit of Christmas when you wear red!"],"capy_witch":["The broom is being repaired. I fly on hope now.","The pumpkin on my back stares at me. I stare back.","The potion is ready! I just forgot what's in it.","Brrr! Did someone whisper 'discount'?"],"capy_flower":["A butterfly landed on my back. Shh, nobody move.","Flowers smell like spring. And I smell like flowers. Nice!","The wreath slipped a bit. I kind of like it.","The bees already asked if they can live here."],"capy_beach":["I want the sea. But at least here's the shop's shade.","The ball on my back won't run away. I will, to the beach!","Dark glasses, bright mood.","Lemonade, please. With ice. And an umbrella!"],"capy_autumn":["The scarf is so long that I trip on it.","Leaves rustle, I have coffee. Perfect morning.","Autumn smells like cinnamon. Or is it me?","A warm sweater is like a hug. Slightly scratchy."],"capy_ep0":["Beret aside, feather up. Now I'm an artist.","This lily on my cloak isn't plain. It's expensive!","A lute is playing somewhere. Come out, whoever you are!","I'm all Renaissance. And you?"],"capy_ep1":["The radio catches one wave only. Fine!","The C stands for 'Super Capy'. I made it up.","A bubblegum bubble... oh, it popped.","The jacket is old, the mood is new."],"capy_ep2":["The disco ball is shining! I shine a little too.","Big glasses, and I see everything. Even who doesn't pay.","My feet are asking for a dance!","Sparkle, sparkle, one more sparkle!"],"capy_ep3":["Level cleared! Next: an empty till.","A gamepad on my chest. For quick decisions.","One coin lap and that's +1 life.","My headphones play 8-bit music. A classic!"],"capy_ep4":["My phone is at 1%. My mood is at 100!","Found Wi-Fi! Now life can go on.","The backpack is full of stickers. Forty-six likes.","Nobody followed me. But I'm not offended."],"capy_ep5":["The sprout on my backpack grew a centimetre. So proud!","Trees grow, and we help them.","A jacket from old bottles. New, but with a story!","Breathe deeply. It's almost a forest here."],"capy_ep6":["Silence... just me and the stars. Oh, the cashier is calling.","The helmet fogged up because I'm happy!","I like zero gravity. The cookies don't fall.","The rocket is waiting. I'm waiting for customers."],"capy_ep7":["The neon blinks and I smile nervously.","My visor glows, but I see worse. Oh, style!","The city at night is like a light show.","My sneakers glow too. I walk like a lantern."],"capy_knight":["My sword is sharp, my prices are honest. At least today.","Big helmet, only my nose is visible. Handy!","While I'm in armour, nobody bothers me. A dream.","Who's bothering the customers? Step back, I'm ready!"],"capy_hero":["The cape flutters, I don't. Situation under control.","My superpower: finding cookies from three metres away.","The mask is a bit tight, but that's how heroes are.","Did someone shout? Calm down, I'm already coming!"],"capy_cowboy":["There's law in this town. And the law says: buy.","My hat slides over my eyes. Keeping my balance.","The sheriff is on the street. Quiet!","The bandana smells of dust and adventure."],"capy_fairy":["My wings tickle when I laugh. Hee-hee.","A pinch of magic, and the day gets brighter.","The crown barely stays on my ears. Is that normal?","I grant every wish. Except 'an even bigger discount'."],"capy_viking":["The horned helmet snags on the door. Again.","The shield is strong, I'm soft. Balance!","To the boarding... I mean to the kitchen. Dinner's there.","A bearded Viking wants a hug. Who's in?"],"capy_pilot":["My goggles fogged up. Flying blind, but with love.","Long scarf, short wings. I'll figure it out.","Buckle up! A bit of turbulence ahead.","The landing is soft as a bun."],"capy_mel":["I'm Mel. A fox. And no, I won't become a capybara, people asked.","Nika says I have too many ideas. She hasn't seen my notes yet.","This game began with one pixel and one sleepless night. The pixel is still here.","When something blinks wrong I say \"it's by design\". Nika pretends to believe me.","Coffee from Nika is the best bug fix. Can't explain it, but it works.","Sometimes I open the game and see things I never wrote. Was it you or Nika?","The tail is fluffy, and the deadlines are even fluffier.","Thank you for playing. Honestly the best moment of my working day."],"capy_nika":["I'm Nika. I jump when I'm nervous. And I'm nervous quite often.","Mel mixes up tap and click again. I don't correct him. It's our tradition.","I won't give my carrot to anyone. Not even Mel. Especially Mel.","Sometimes I draw, sometimes I code, sometimes I just flap my ears. All of it is work.","This game is about a town you'd want to live in. And a little about capybaras.","Bow in place, ears in place, idea in place. Only the coffee ran out.","I see you've been here a while. How many days is that? Thank you for them.","Mel calls me a perfectionist. I call him \"we'll fix it later\". Together we're a studio."],"shop_candy":["Everything is sticky here. But nice.","The lollipop is taller than me. Dream come true.","Don't lick the walls. I'm telling myself too."],"shop_gold":["It shines so much I see sparkles.","Gold is cold, but the mood is warm.","The cashier wears sunglasses against the glare. True!"],"shop_ice":["Brr! But so pretty, like a fairy tale.","An icicle fell. Not on me, thank goodness.","Discounts don't melt here. They're frozen!"],"shop_wood":["Smells of resin and warmth. Like a forest.","The wooden cabin stands firm. Like me.","Creak-creak. That's good. That's cosy!"],"shop_garden":["Flowers grow on the roof. Who waters them?","A bee lives here. We're already friends.","A shop-garden: stroll and shop. Handy."],"shop_xmas":["The lights blink. I want to blink too.","There's definitely something under the tree. I'm not looking... I'm looking.","The shop smells of tangerines. A dream!"],"shop_halloween":["Someone's walking in the attic. Not me, honest.","The pumpkin smiles wider than me.","Trick or treat? I choose the treat."],"shop_spring":["Spring is here! Even at the till.","Petals on the roof. So sweet.","Birds sing and customers smile."],"shop_autumn":["Leaves on the roof rustle like a mouse.","Warm, cosy, smells of apples.","Autumn in a shop is like a hug."],"weather_rainbow":["A rainbow! Look, look! Oh, gone.","So many colours I stopped counting.","Somewhere under it hides a pot of cookies."],"weather_lightning":["Boom! That was loud, but pretty.","The lightning is purple. I like it.","Keeping my ears under my cap. Just in case."],"weather_lightninggreen":["Green lightning! Definitely magic.","Boom-boom! Why not red?","Someone up there is playing with neon."],"weather_lightningred":["Red lightning! My heart skipped.","It's so bright I squint.","The sky is angry, but in a pretty way."],"weather_cottoncloud":["A cotton candy cloud. Who took a bite?","I want to climb in and nap. It's sweet!","Caramel rain, anyone?"],"weather_goldcloud":["A gold cloud! Sometimes coins fall from it.","The sky decided to earn too. Good job.","Look up. Maybe you'll be lucky!"],"weather_starcloud":["Stars in the clouds are twinkling. Making a wish.","The cloud shimmers. I want that hat.","Hush, hush... Can you hear it singing?"],"hero_party":["A party every day! Confetti in every pocket.","Helpers in party hats. Just a dream.","Shall we dance? The till can wait."],"hero_ninja":["Did someone run by? No? Then it was ninjas.","Quiet as a shadow. They say that's ours.","I didn't see them. And I won't. Good work."],"hero_chef":["Smells like buns. Who's cooking?","Chef helpers will feed the customers and me.","Just don't eat the goods. I'm telling myself."],"hero_wizard":["Helpers are casting spells! The queue shrinks by itself.","Robes blink, and I smile.","A magic wand in your pocket? Teach me too!"],"hero_royal":["Helpers in crowns. Your Majesty, the till is that way!","A king with a sausage? That's the next level.","The royal team works without days off."],"hero_santa":["They wrap gifts so fast I can't keep up.","Red hats everywhere. The holidays are here!","Ho-ho, that's not a joke, that's a team!"],"hero_witch":["Little witches fly between the shelves. Hope nobody gets hit.","The hats are pointy. Don't get too close.","A potion for fast service. Useful!"],"street_brick":["A brick road. Where does it lead? To the till!","Nice to walk on. Every brick is straight.","The road is red. Like my cheeks right now."],"street_wood":["Boards creak under my paws. Cosy!","A wooden path smells of the forest.","Creak-creak. Like someone's coming. Oh, it's me."],"street_leaves":["Crunch-crunch! My favourite autumn sound.","Leaves under paws: a carpet of dark gold.","Someone scattered leaves. Thanks, kind soul!"],"street_snow":["Snow! No, don't eat it. I'm stopping myself too.","My paws are cold, my heart is warm.","Crunch-crunch. Snow is music too."],"street_moss":["Moss is soft like a carpet. Going to lie down.","Mossy cobbles remember many stories.","A little flower grows in the crack. Don't step on it!"],"street_gold":["A golden road! Not made of rubies though.","I walk and it sparkles under my paws. Nice.","A brick made from coins. Not touching, not mine."]}};
