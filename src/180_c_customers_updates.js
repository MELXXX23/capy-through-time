//#part 180_c_customers_updates.js
const skinLineLast = {};
function skinLine(id) {
  const arr = (SKIN_LINES[state.lang] || SKIN_LINES.en)[id]; if (!arr || !arr.length) return null;
  let i = Math.floor(Math.random() * arr.length); if (arr.length > 1 && i === skinLineLast[id]) i = (i + 1 + Math.floor(Math.random() * (arr.length - 1))) % arr.length;
  skinLineLast[id] = i; return arr[i];
}
function capySay(forceId) {
  const c = LAYOUT.capy, worn = wornSkinIds();
  let id = forceId || null;
  if (!id && worn.length && Math.random() < 0.65) { const cs = worn.find(w => w.startsWith('capy_')); id = (cs && Math.random() < 0.6) ? cs : worn[Math.floor(Math.random() * worn.length)]; }
  const key = id ? 'skinSay_' + id : '';
  let pi = Math.floor(Math.random() * CAPY_PHRASES); if (skinOn('capy')) { const ok = [...Array(CAPY_PHRASES).keys()].filter(n => n !== 1 && n !== 4); pi = ok[Math.floor(Math.random() * ok.length)]; }       // у скіні Капі не жартує про квіточку на голові
  const txt = (id && skinLine(id)) || (key && t(key) !== key ? t(key) : pickLine('capy', () => 'capy_say_' + pi, 'capy_cold_', 3));
  showBubble('capy', txt, c.x + 14, c.footY - 32 * CAPY_K);
}

// Прокачування звірятка після 10-го рівня: кожні 10 дають зірку (бонус доходить до ×1,25 / ×1,5 / ×2)
function buyStar(i) {
  const plus = teamPlusOf(i);
  if (plus >= PLUS_MAX) return;
  const cost = plusCost(i, plus + 1);
  if (!(state.coins >= cost)) return;
  state.coins -= cost; state.stats.teamUps = (state.stats.teamUps || 0) + 1;
  state.teamPlus[i] = plus + 1;
  recalcIncome();
  const a = actors.find(x => x.i === i), name = t('team_' + TEAM[i].id), n = (plus + 1) / STAR_STEP;
  if (n === Math.floor(n)) {
    if (a) { a.hop = 1; spawnDust(a.x, a.y - 2, 8); }
    showToast(t('teamStarred', name, n), 'big');
  } else showToast(t('teamPlus', name, (plus + 1) % STAR_STEP, STAR_STEP, Math.floor(n) + 1), 'good');
  playSfx('upgrade');
  updateUI(); saveGame();
}
// Найняти або прокачати звірятко
function hireOrUpgrade(i) {
  const lvl = state.team[i];
  if (isTeamUnlocked(i) && lvl >= CONFIG.TEAM_MAX_LEVEL) { buyStar(i); return; }
  if (!isTeamUnlocked(i) || lvl >= CONFIG.TEAM_MAX_LEVEL) return;
  const cost = teamCost(i, lvl + 1);
  if (!(state.coins >= cost)) return;
  state.coins -= cost; state.stats.teamUps = (state.stats.teamUps || 0) + 1;
  state.team[i] = lvl + 1;
  state.teamKnown[i] = 1;
  state.stats.teamMaxLevel = Math.max(state.stats.teamMaxLevel, lvl + 1);
  recalcIncome();
  const name = t('team_' + TEAM[i].id);
  if (lvl === 0) {
    syncActors();
    const a = actors.find(x => x.i === i);
    a.hop = 1;
    spawnDust(a.x, a.y - 2, 6);
    showToast(t('teamHired', name), 'big');
    playSfx('hire');
  } else {
    showToast(t('teamUpgraded', name, lvl + 1), 'good');
    playSfx('upgrade');
  }
  updateUI();
}

/* ---------- Покупці ---------- */
function customerTarget() {
  if (state.cps <= 0) return 2;
  const base = Math.min(CONFIG.MAX_CUSTOMERS + 4, 4 + Math.floor(Math.log10(state.cps + 1) * 2));      // трохи більше покупців, ніж раніше
  const wide = (worldR() - worldL()) / Math.max(320, visR() - visL());                                  // вулиця широка: покупців більше, щоб їх було видно скрізь
  return Math.round(base * Math.max(1, Math.min(2.2, wide)));
}
// Куди йде звіреня, що покидає сцену: трохи за краєм того, що видно (світ широкий, тож до його краю йти надто довго)
function passEdge(dir) { return dir > 0 ? worldR() + 16 : worldL() - 16; }                       // ідуть до самого краю вулиці, а не зникають одразу за краєм екрана
// Де з'являється покупець: частина — на краях вулиці, решта — у випадкових місцях по всій вулиці поза межами видимого
function spawnX(fromLeft) {
  const W0 = worldL(), W1 = worldR();
  if (Math.random() < 0.35) return fromLeft ? W0 - 14 : W1 + 14;
  for (let k = 0; k < 8; k++) { const x = rand(W0 + 10, W1 - 10); if (x < visL() - 24 || x > visR() + 24) return x; }
  return fromLeft ? W0 - 14 : W1 + 14;
}
function spawnCustomer() {
  const fromLeft = Math.random() < 0.5;
  const lane = rand(LAYOUT.lane.min, Math.max(LAYOUT.lane.min + 4, roadFloor()));
  const goesShopping = Math.random() < 0.55;
  const c = {
    type: CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)],
    x: spawnX(fromLeft),
    y: lane, lane,
    dir: fromLeft ? 1 : -1,
    speed: rand(16, 26),
    anim: rand(0, 2),
    mode: goesShopping ? 'toDoor' : 'pass',
    doorX: shop.x + shop.door.x + shop.door.w / 2 + rand(-4, 4),
    passTo: fromLeft ? worldR() + 16 : worldL() - 16,
    alpha: 1, t: 0, stay: 0,
    bag: null
  };
  customers.push(c);
}
// Золотий покупець: проходить вулицею з побажанням; тап по ньому дає монети (іноді кристал)
let vipTimer = 70;
const goldCache = {};
function goldCanvas(type, frame) {
  const key = type + frame;
  if (goldCache[key]) return goldCache[key];
  const src = getSpriteCanvas(type + '_' + frame), c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255, 196, 48, 0.66)'; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = 'rgba(255, 255, 255, 0.22)'; g.fillRect(0, 0, c.width, c.height >> 1);
  return (goldCache[key] = c);
}
function spawnVip() {
  const fromLeft = Math.random() < 0.5, lane = rand(LAYOUT.lane.min, Math.max(LAYOUT.lane.min + 4, roadFloor()));
  const open = DEPARTMENTS.map((d, i) => i).filter(isDeptUnlocked);
  customers.push({ type: CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)], x: fromLeft ? visL() - 12 : visR() + 12, y: lane, lane, dir: fromLeft ? 1 : -1, speed: 25, anim: 0, mode: 'pass', passTo: fromLeft ? visR() + 18 : visL() - 18, alpha: 1, t: 0, stay: 0, bag: null, vip: true, wish: open[Math.floor(Math.random() * open.length)] });
  showToast(t('vipToast'), 'good'); playSfx('pip');
}
function hitVip(p) {
  for (const c of customers) {
    if (!c.vip || c.vipDone) continue;
    if (Math.abs(p.x - c.x) <= 20 && p.y >= c.y - 44 && p.y <= c.y + 5) {
      c.vipDone = true; c.speed = 62; state.stats.vipTaps = (state.stats.vipTaps || 0) + 1;
      const crystal = Math.random() < 0.2;                                  // нагорода одна з двох: кристал або ×5 золота
      const gain = crystal ? 0 : Math.floor((state.cps * 40 + 200 * levelMult()) * 5);
      if (crystal) { state.crystals += 1; state.crystalsTotal += 1; } else { state.coins += gain; state.totalEarned += gain; }
      for (let i = 0; i < 14; i++) { const a = rand(0, Math.PI * 2), sp = rand(30, 80); fx.sparks.push({ x: c.x, y: c.y - 12, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 24, age: 0, life: rand(0.4, 0.7), col: i % 2 ? 'y' : 'h' }); }
      spawnFloater(c.x, c.y - 24, crystal ? '+1 ' + GEM_CH : '×5 +' + fmt(gain)); playSfx(crystal ? 'wheelWin' : 'upgrade'); buzz(30);
      showBubble('vip', t(crystal ? 'vipSayCrystal' : 'vipSayGold'), c.x, c.y - 34, () => ({ x: c.x, y: c.y - 34 }));
      showToast(crystal ? t('vipCrystal') : t('vipGold', fmt(gain)), 'big');                // спливає, що саме він дав
      updateUI();
      return true;
    }
  }
  return false;
}
// Транспорт, що їде дорогою (поштова машина, цирк): звірята на дорозі лякаються, підскакують, тікають на бруківку й трусяться, поки він проїде
function roadHazards() {
  const hz = [];
  if (mail.state === 'arriving' || mail.state === 'leaving') hz.push({ x: mail.x, hw: 22 });
  if (state.circus.phase === 2.5 || state.circus.phase === 4) hz.push({ x: circus.x, hw: 84 });
  return hz;
}
function hazardNearX(c, hz) { return hz.find(h => { const dx = c.x - h.x; return dx > -(h.hw + 40) && dx < h.hw + 12; }); }
function roadDanger(c) {
  if (c.y < mailRoadY() - 24) return null;
  return hazardNearX(c, roadHazards()) || null;
}
const FEAR_LINES = 6;
let lastFearSay = 0;
function startFear(c, hz) {
  c.fear = { t: 0, stage: 0, ty: mailRoadY() - 27 - rand(0, 6), fy: 0, sx: 0, origDir: c.dir, away: c.x < hz.x ? -1 : 1, said: false, wait: 0 };
  playSfx('pip'); buzz(10);
}
function scareNear(gx, gy) {
  let n = 0;
  customers.forEach(c => {
    if (n >= 2 || c.fear || c.inside || c.alpha < 0.9 || !animOn() || !(c.mode === 'pass' || c.mode === 'toDoor' || c.mode === 'toHome')) return;
    if (Math.abs(c.x - gx) > 56 || c.x < visL() + 4 || c.x > visR() - 4) return;
    n++; c.fear = { ghost: true, t: 0, stage: 0, ty: c.y, fy: 0, sx: 0, origDir: c.dir, away: c.x < gx ? -1 : 1, said: false, wait: 0, run: 0 }; playSfx('pip'); buzz(10);
  });
}
function updateFear(c, dt) {
  const f = c.fear; f.t += dt;
  if (f.ghost) {                                                             // привид! підскочив, закричав і втік убік
    if (f.stage === 0) {
      f.fy = -Math.abs(Math.sin(Math.min(1, f.t / 0.5) * Math.PI)) * 7; f.sx = Math.round(Math.sin(f.t * 55));
      if (!f.said) { f.said = true; fearSay(c, true); }
      if (f.t >= 0.5) { f.stage = 1; f.fy = 0; f.sx = 0; c.dir = f.away; }
    } else {
      f.run += dt; c.x += f.away * 78 * dt; f.fy = -(Math.floor(c.anim * 14) % 2);
      if (Math.random() < dt * 22) spawnDust(c.x, c.y + 1, 1);
      if (f.run >= 1.1) { c.dir = f.origDir; c.fear = null; }
    }
    return;
  }
  if (f.stage === 0) {                                                       // завмер, підскочив і витріщився: «!» над головою
    f.fy = -Math.abs(Math.sin(Math.min(1, f.t / 0.5) * Math.PI)) * 7; f.sx = Math.round(Math.sin(f.t * 55));
    if (!f.said) { f.said = true; fearSay(c); }
    if (f.t >= 0.5) { f.stage = 1; f.fy = 0; f.sx = 0; c.dir = f.away; }
  } else if (f.stage === 1) {                                                // тікає вгору на бруківку, здіймаючи пил
    c.y -= 80 * dt; c.x += f.away * 6 * dt; f.fy = -(Math.floor(c.anim * 14) % 2);
    if (Math.random() < dt * 22) spawnDust(c.x, c.y + 1, 1);
    if (c.y <= f.ty) { c.y = f.ty; f.stage = 2; f.wait = 0; f.fy = 0; }
  } else {                                                                   // тремтить і витирає піт, поки машина проїде
    f.wait += dt; f.sx = Math.round(Math.sin(f.wait * 48));
    if (f.wait > 0.9 && (!hazardNearX(c, roadHazards()) || f.wait > 5)) { if (c.lane > c.y) c.lane = c.y; c.dir = f.origDir; c.fear = null; }
  }
}
function fearSay(c, ghost) {
  const now = performance.now(); if (now - lastFearSay < 1800) return; lastFearSay = now;
  showBubble('fear', t((ghost ? 'gfear' : 'fear') + Math.floor(Math.random() * FEAR_LINES)), c.x, c.y - 26, () => ({ x: c.x, y: c.y - 26 + (c.fear ? c.fear.fy : 0) }));
}
// Бордюр біля магазину: звірятко легко переступає його невеликою дугою, а не ковзає крізь нього
function curbLift(y) { const a = LAYOUT.curbY - 5, b = LAYOUT.curbY + 9; return y > a && y < b ? Math.sin((y - a) / (b - a) * Math.PI) * 3.4 : 0; }
function updateCustomers(dt) {
  vipTimer -= dt;
  if (vipTimer <= 0) { vipTimer = rand(100, 160) * evMult() * (shnyrPerk() ? 0.75 : 1) / (1 + 0.15 * wsLevel('goldenFreq')); if (!customers.some(c => c.vip) && state.story.done >= 2 && animOn() && !dialog.active) spawnVip(); }
  if (shnyrPerk()) customers.forEach(c => { if (c.vip && !c.vipDone && c.x > visL() + 6 && c.x < visR() - 6) { c.auto = (c.auto || 0) + dt; if (c.auto > 1.6) { hitVip({ x: c.x, y: c.y - 10 }); showToast(t('shnyrCatch'), 'good'); } } });       // Шнирь сам ловить золотого
  customers.forEach(c => { if (c.vip && !c.said && !c.vipDone && c.x > visL() + 10 && c.x < visR() - 10) { c.said = true; showBubble('vip', t('vipWish', deptName(c.wish)), c.x, c.y - 34, () => ({ x: c.x, y: c.y - 34 })); } });
  customerTimer -= dt;
  if (customerTimer <= 0) {
    customerTimer = rand(0.9, 2.4);
    if (customers.length < customerTarget()) spawnCustomer();
  }
  for (let i = customers.length - 1; i >= 0; i--) {
    const c = customers[i];
    c.anim += dt;
    const step = c.speed * dt;
    if (c.fear) { updateFear(c, dt); continue; }
    if (c.mode === 'pass' || c.mode === 'toDoor' || c.mode === 'toHome' || c.mode === 'homeDown') capyAvoid(c, dt);
    if ((c.mode === 'pass' || c.mode === 'toDoor' || c.mode === 'toHome') && animOn()) { const hz = roadDanger(c); if (hz) { startFear(c, hz); continue; } }
    switch (c.mode) {
      case 'pass':
        c.x += c.dir * step;
        if ((c.dir > 0 && c.x >= c.passTo) || (c.dir < 0 && c.x <= c.passTo)) customers.splice(i, 1);
        break;
      case 'toDoor': {
        const dx = c.doorX - c.x;
        if (Math.abs(dx) <= step) { c.x = c.doorX; c.mode = 'toEntrance'; }
        else { c.dir = Math.sign(dx); c.x += c.dir * step; }
        break;
      }
      case 'toEntrance':
        c.y -= step * 0.8 * (curbLift(c.y) > 0 ? 0.65 : 1);                      // біля бордюру крок повільніший: переступає
        if (c.y <= LAYOUT.curbY + 10) { c.y = LAYOUT.curbY + 10; c.mode = 'doorWait'; c.t = 0; c.dir = c.x < shop.x + shop.w / 2 ? 1 : -1; }
        break;
      case 'doorWait':                                    // біля порога: дивиться на двері, що розсуваються, і заходить
        c.t += dt;
        c.x += (doorWorld().cx - c.x) * Math.min(1, dt * 3);
        if (c.t > 0.12 && !c.dinged) { c.dinged = true; for (let i = 0; i < 3; i++) fx.sparks.push({ x: doorWorld().cx + rand(-8, 8), y: shop.y + shop.door.y - 4, vx: rand(-14, 14), vy: rand(-26, -10), age: 0, life: 0.5, col: i % 2 ? 'y' : 'w' }); }
        if (c.t >= 0.34) { c.mode = 'entering'; c.t = 0; c.dinged = false; }
        break;
      case 'entering': {                                  // заходить у відчинені розсувні двері
        const dr = doorWorld();
        c.x += (dr.cx - c.x) * Math.min(1, dt * 4);
        c.y -= step * 0.8 * (curbLift(c.y) > 0 ? 0.65 : 1);
        if (c.y <= LAYOUT.curbY - 1) c.inside = true;
        if (c.y <= dr.baseY) { c.y = dr.baseY; c.mode = 'inside'; c.f = 0; c.esc = null; c.plan = planVisit(); c.dwell = 0; }
        break;
      }
      case 'inside': updateInside(c, dt); break;
      case 'exiting':
        c.t += dt;
        if (c.t < 0.38) { if (!c.exitSp) { c.exitSp = true; for (let i = 0; i < 4; i++) fx.sparks.push({ x: c.x + rand(-6, 6), y: c.y - 20, vx: rand(-18, 18), vy: rand(-30, -12), age: 0, life: 0.5, col: ['y', 'h', 'f', 'w'][i] }); } break; }       // радісно підстрибує з покупками біля дверей
        c.y += step * 0.8 * (curbLift(c.y) > 0 ? 0.65 : 1);                      // біля бордюру крок повільніший: переступає
        if (c.y >= LAYOUT.curbY + 1) c.inside = false;
        if (c.y >= c.lane) { c.y = c.lane; c.mode = c.homeDoor ? 'toHome' : 'pass'; c.alpha = 1; c.inside = false; }
        break;
      case 'toHome': {                                    // несе покупки додому: йде до дверей будиночка
        const dx = c.homeDoor.x - c.x;
        if (Math.abs(dx) <= step) { c.x = c.homeDoor.x; c.mode = 'homeUp'; }
        else { c.dir = Math.sign(dx); c.x += c.dir * step; }
        break;
      }
      case 'homeUp':
        c.y -= step * 0.8;
        if (c.y <= c.homeDoor.y + 1) { c.y = c.homeDoor.y + 1; c.mode = 'homeKnock'; c.t = 0; }
        break;
      case 'homeKnock':                                   // стукає в двері й чекає
        c.t += dt;
        if (c.t >= 0.7) { c.mode = 'homeIn'; c.t = 0; c.said2 = false; }
        break;
      case 'homeIn': {                                    // двері відчиняються, тепле світло; звірятко заходить усередину (меншає й тане), двері зачиняються
        c.t += dt;
        const u = Math.max(0, Math.min(1, (c.t - 0.3) / 0.45));
        c.alpha = 1 - u * u; c.scale = 1 - 0.45 * u; c.y = c.homeDoor.y + 1 - u * 2;
        if (u > 0.35) c.bag = null;
        if (u > 0.5 && !c.said2) { c.said2 = true; homeSparks(c.homeDoor, 4); }
        if (c.t >= 0.95) { c.mode = 'homeStay'; c.t = 0; c.stay = rand(7, 16); c.inside = true; c.bag = null; c.alpha = 0; c.scale = 1; c.y = c.homeDoor.y + 1; }
        break;
      }
      case 'homeStay':
        c.t += dt;
        if (c.t >= c.stay) { c.mode = 'homeOut'; c.t = 0; c.inside = false; c.alpha = 0; c.scale = 0.55; c.said2 = false; }
        break;
      case 'homeOut': {                                   // двері відчиняються, звірятко виходить на світло (росте й проявляється), двері зачиняються за ним
        c.t += dt;
        const u = Math.max(0, Math.min(1, (c.t - 0.3) / 0.5));
        c.alpha = u; c.scale = 0.55 + 0.45 * u; c.y = c.homeDoor.y + 1 - (1 - u) * 2;
        if (u > 0.5 && !c.said2) { c.said2 = true; homeSparks(c.homeDoor, 3); }
        if (c.t >= 1.1) { c.mode = 'homeDown'; c.alpha = 1; c.scale = 1; c.y = c.homeDoor.y + 1; c.said2 = false; }
        break;
      }
      case 'homeDown':
        c.y += step * 0.8;
        if (c.y >= c.lane) {
          c.y = c.lane; c.homeDoor = null; c.dir = c.x < shop.x + shop.w / 2 ? 1 : -1;
          if (Math.random() < 0.5) { c.mode = 'toDoor'; c.doorX = shop.x + shop.door.x + shop.door.w / 2 + rand(-4, 4); }
          else { c.mode = 'pass'; c.passTo = passEdge(c.dir); }
        }
        break;
    }
  }
  // автоматичні двері роз'їжджаються, коли хтось підходить або виходить
  if (shop && shop.door) {
    const dr = doorWorld();
    const want = customers.some(c => (c.mode === 'toEntrance' || c.mode === 'doorWait' || c.mode === 'entering' || c.mode === 'exiting' || (c.mode === 'inside' && c.f === 0 && !c.esc)) &&
      Math.abs(c.x - dr.cx) < 34 && c.y > dr.baseY - 6 && c.y < LAYOUT.curbY + 14);
    shop.doorOpen = (shop.doorOpen || 0) + ((want ? 1 : 0) - (shop.doorOpen || 0)) * Math.min(1, dt * 7);
  }
}
// Де в світі двері магазину (центр) і підлога першого поверху
function doorWorld() { return { cx: shop.x + shop.door.x + shop.door.w / 2, baseY: shop.y + shop.floors[0].fy }; }
// План візиту: 1–3 зупинки біля стелажів (часто на верхніх поверхах), наприкінці — вихід через двері
function planVisit() {
  const F = shop.floors.length, stops = [], dr = doorWorld();
  const n = 1 + Math.floor(Math.random() * Math.min(3, F + 1));
  for (let i = 0; i < n; i++) {
    let f = Math.random() < 0.35 ? 0 : Math.floor(Math.random() * F);
    if (F > 1 && i === 0 && Math.random() < 0.6) f = 1 + Math.floor(Math.random() * (F - 1));
    const sh = shop.floors[f].shelves;
    stops.push({ f, x: shop.x + sh[Math.floor(Math.random() * sh.length)] + rand(-8, 8), t: rand(1.2, 3) });
  }
  stops.push({ f: 0, x: dr.cx + rand(-5, 5), exit: true });
  return stops;
}
// Рух усередині: до стелажа, на інший поверх ескалатором, до виходу
function updateInside(c, dt) {
  const step = c.speed * dt;
  if (c.esc) {                                                  // їде ескалатором
    const e = shop.escalators[c.esc.k], len = Math.hypot(e.run, e.rise);
    c.esc.u += c.esc.dir * (c.speed * 0.9 * dt) / len;
    c.moving = false;
    c.dir = c.esc.dir * (e.xHigh > e.xLow ? 1 : -1);
    if (c.esc.u >= 1) { c.f = e.hi; c.esc = null; c.x = shop.x + e.xHigh; c.y = shop.y + e.yHigh; return; }
    if (c.esc.u <= 0) { c.f = e.lo; c.esc = null; c.x = shop.x + e.xLow; c.y = shop.y + e.yLow; return; }
    c.x = shop.x + e.xLow + (e.xHigh - e.xLow) * c.esc.u;
    c.y = shop.y + e.yLow - e.rise * c.esc.u;
    return;
  }
  const stop = c.plan[0];
  c.y = shop.y + shop.floors[c.f].fy;
  if (!stop) { c.mode = 'exiting'; return; }
  if (c.f !== stop.f) {                                         // треба на інший поверх — іде до ескалатора
    const upDir = stop.f > c.f ? 1 : -1, e = shop.escalators[upDir > 0 ? c.f : c.f - 1];
    const ex = shop.x + (upDir > 0 ? e.xLow : e.xHigh), dx = ex - c.x;
    if (Math.abs(dx) <= step) { c.x = ex; c.esc = { k: e.k, dir: upDir, u: upDir > 0 ? 0 : 1 }; }
    else { c.x += Math.sign(dx) * step; c.dir = Math.sign(dx); c.moving = true; }
    return;
  }
  const dx = stop.x - c.x;
  if (Math.abs(dx) > step) { c.x += Math.sign(dx) * step; c.dir = Math.sign(dx); c.moving = true; return; }
  c.x = stop.x; c.moving = false;
  if (stop.exit) {                                              // виходить із покупками
    c.mode = 'exiting'; c.t = 0;
    c.bag = BAG_COLORS[Math.floor(Math.random() * BAG_COLORS.length)]; c.bagKind = Math.floor(Math.random() * 3);
    c.dir = Math.random() < 0.5 ? 1 : -1;
    c.passTo = passEdge(c.dir);
    c.homeDoor = pickHome(c);                                   // частина покупців іде зі своїми пакетами додому
    return;
  }
  c.dwell += dt;
  if (c.dwell >= stop.t) { c.plan.shift(); c.dwell = 0; }
}
// Чи піде покупець додому: обираємо двері будиночка недалеко від магазину (не за самим магазином)
function pickHome(c) {
  if (!houseDoors.length || Math.random() > 0.7) return null;
  const cx = shop.x + shop.w / 2;
  const lamps = lampPositions();
  const cand = houseDoors.filter(d => Math.abs(d.x - cx) > shop.w / 2 + 8 &&                      // усі двері вздовж вулиці, не лише найближчі
    !benches.some(b => Math.abs(b.x - d.x) < 26 || (b.binX != null && Math.abs(b.binX - d.x) < 15)) && !lamps.some(lx => Math.abs(lx - d.x) < 9));      // шлях до дверей не йде крізь лавку, урну чи ліхтар
  return cand.length ? cand[Math.floor(Math.random() * cand.length)] : null;
}
// Коли магазин перебудовується, усі, хто всередині, виходять надвір
function ejectInside() {
  if (!shop || !shop.door) return;
  const dr = doorWorld();
  customers.forEach(c => {
    if (!(c.inside || c.mode === 'inside' || c.mode === 'entering')) return;
    c.inside = false; c.mode = 'exiting'; c.x = dr.cx; c.y = LAYOUT.curbY + 2; c.alpha = 1; c.esc = null;
    c.bag = BAG_COLORS[Math.floor(Math.random() * BAG_COLORS.length)]; c.bagKind = Math.floor(Math.random() * 3);
    c.dir = Math.random() < 0.5 ? 1 : -1;
    c.passTo = passEdge(c.dir);
  });
}
// Скін героїв надягається й на звірят-покупців: головний убір + деталь на тулубі (кожен скін той самий, що на героях)
function drawSkinGear(sx, sy, kind, head) {
  const cx = sx + 9, ht = sy + 8;
  if (kind === 'party') {
    if (head) { R(ctx, cx - 3, ht - 1, 7, 2, 'f'); R(ctx, cx - 2, ht - 3, 5, 2, 'T'); R(ctx, cx - 1, ht - 5, 3, 2, 'f'); R(ctx, cx, ht - 7, 2, 2, 'y'); }
    [[sx + 5, sy + 17, 'y'], [sx + 8, sy + 19, 'T'], [sx + 11, sy + 17, 'w'], [sx + 12, sy + 20, 'y'], [sx + 6, sy + 21, 'f']].forEach(q => R(ctx, q[0], q[1], 1, 1, q[2]));
  } else if (kind === 'chef') {
    if (head) { R(ctx, cx - 4, ht - 5, 9, 5, 'w'); R(ctx, cx - 3, ht - 7, 7, 2, 'w'); R(ctx, cx - 4, ht - 1, 9, 2, 'E'); R(ctx, cx - 4, ht - 5, 1, 4, 'E'); }
    R(ctx, cx - 3, sy + 17, 7, 5, 'w'); R(ctx, cx - 3, sy + 17, 7, 1, 'E'); R(ctx, cx, sy + 18, 1, 1, 'r'); R(ctx, cx, sy + 20, 1, 1, 'r');
  } else if (kind === 'wizard') {
    if (head) { R(ctx, cx - 5, ht - 1, 11, 2, 'u'); R(ctx, cx - 3, ht - 4, 7, 3, 'u'); R(ctx, cx - 3, ht - 2, 7, 1, 'h'); R(ctx, cx - 2, ht - 7, 5, 3, 'u'); R(ctx, cx - 1, ht - 10, 3, 3, 'u'); R(ctx, cx, ht - 5, 1, 1, 'y'); }
    R(ctx, cx - 4, sy + 17, 9, 5, 'v'); R(ctx, cx - 4, sy + 17, 9, 1, 'h'); R(ctx, cx - 2, sy + 19, 1, 1, 'y'); R(ctx, cx + 2, sy + 20, 1, 1, 'y');
  } else if (kind === 'royal') {
    if (head) { R(ctx, cx - 4, ht - 3, 9, 3, 'h'); R(ctx, cx - 4, ht - 5, 2, 2, 'h'); R(ctx, cx - 1, ht - 6, 3, 3, 'h'); R(ctx, cx + 3, ht - 5, 2, 2, 'h'); R(ctx, cx, ht - 2, 1, 1, 'r'); R(ctx, cx - 4, ht - 3, 9, 1, 'y'); }
    R(ctx, cx - 5, sy + 16, 11, 3, 'r'); R(ctx, cx - 4, sy + 16, 9, 1, 'w'); R(ctx, cx - 5, sy + 19, 2, 3, 'r'); R(ctx, cx + 4, sy + 19, 2, 3, 'r');
  } else if (kind === 'santa') {
    if (head) { R(ctx, cx - 4, ht - 1, 9, 2, 'w'); R(ctx, cx - 3, ht - 3, 7, 2, 'r'); R(ctx, cx - 2, ht - 5, 5, 2, 'r'); R(ctx, cx - 1, ht - 7, 3, 2, 'r'); R(ctx, cx, ht - 8, 2, 2, 'w'); }
    R(ctx, cx - 4, sy + 17, 9, 5, 'r'); R(ctx, cx - 4, sy + 17, 9, 1, 'w'); R(ctx, cx - 4, sy + 20, 9, 1, 'k'); R(ctx, cx - 1, sy + 20, 2, 1, 'h');
  } else if (kind === 'witch') {
    if (head) { R(ctx, cx - 5, ht - 1, 11, 2, 'V'); R(ctx, cx - 3, ht - 4, 7, 3, 'V'); R(ctx, cx - 3, ht - 3, 7, 1, 'o'); R(ctx, cx - 2, ht - 6, 5, 2, 'V'); R(ctx, cx - 1, ht - 9, 3, 3, 'V'); }
    R(ctx, cx - 4, sy + 17, 9, 5, 'V'); R(ctx, cx - 4, sy + 17, 9, 1, 'o'); R(ctx, cx - 2, sy + 19, 1, 1, 'y'); R(ctx, cx + 2, sy + 20, 1, 1, 'y');
  } else if (kind === 'ninja') {
    if (head) { R(ctx, cx - 4, ht - 2, 9, 4, 'z'); R(ctx, cx - 4, ht, 9, 1, 'r'); R(ctx, cx + 4, ht + 1, 2, 2, 'r'); }
    R(ctx, cx - 4, sy + 19, 9, 1, 'r'); R(ctx, cx - 4, sy + 17, 9, 2, 'z');
  }
}
// Двері будиночка: відчиненість 0…1 залежить від етапу (стук → відчиняються → зачиняються)
function homeDoorOpen(c) {
  const t = c.t;
  if (c.mode === 'homeIn') return t < 0.3 ? t / 0.3 : t < 0.75 ? 1 : Math.max(0, 1 - (t - 0.75) / 0.2);
  if (c.mode === 'homeOut') return t < 0.3 ? t / 0.3 : t < 0.85 ? 1 : Math.max(0, 1 - (t - 0.85) / 0.25);
  return 0;
}
function drawHomeDoor(c) {
  const d = c.homeDoor, o = homeDoorOpen(c);
  if (c.mode === 'homeKnock') {                                      // «тук-тук»: маленькі риски біля дверей
    const k = Math.floor(c.t * 8) % 2;
    if (c.t > 0.1 && c.t < 0.55 && k) { R(ctx, d.x + 6, d.y - 10, 1, 2, 'w'); R(ctx, d.x + 8, d.y - 9, 1, 2, 'w'); R(ctx, d.x - 7, d.y - 10, 1, 2, 'w'); }
    return;
  }
  if (!(o > 0.02)) return;
  const x0 = d.x - 4, w = 8, leaf = Math.max(1, Math.round(w * (1 - o)));          // полотно складається до лівого краю
  R(ctx, d.x - 5, d.y - 15, 10, 15, 'd');
  R(ctx, x0, d.y - 14, w, 14, 'h'); R(ctx, x0, d.y - 14, w, 2, 'y'); R(ctx, x0 + 5, d.y - 8, 2, 4, 'w'); R(ctx, x0, d.y - 3, w, 3, 'o');   // тепла кімната: світло, лампа, підлога
  R(ctx, x0, d.y - 14, leaf, 14, 'b'); R(ctx, x0, d.y - 14, leaf, 1, 'l');
  ctx.globalAlpha = 0.3 * o; R(ctx, d.x - 5, d.y, 10, 2, 'y'); R(ctx, d.x - 4, d.y + 2, 8, 2, 'y'); R(ctx, d.x - 2, d.y + 4, 4, 1, 'y'); ctx.globalAlpha = 1;      // світло падає на ґанок
}
function homeSparks(d, n) { for (let i = 0; i < n; i++) fx.sparks.push({ x: d.x + rand(-4, 4), y: d.y - 12, vx: rand(-12, 12), vy: rand(-34, -16), age: 0, life: rand(0.5, 0.9), col: i % 2 ? 'f' : 'y' }); }
let spaceHelmetCv = null;
function spaceHelmet() {                                                       // скляна куля навколо голови покупця (малюється один раз)
  if (spaceHelmetCv) return spaceHelmetCv;
  const W = 19, H = 17, cx = 9.5, cy = 8.5, rx = 8.2, ry = 6.7, c = document.createElement('canvas'), g = c.getContext('2d');
  c.width = W; c.height = H;
  const inE = (x, y, k) => Math.pow((x + .5 - cx) / (rx - k), 2) + Math.pow((y + .5 - cy) / (ry - k), 2) <= 1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!inE(x, y, 0)) continue;
    if (inE(x, y, 1)) { g.fillStyle = 'rgba(184,227,255,0.16)'; g.fillRect(x, y, 1, 1); continue; }
    g.fillStyle = (x - cx < -2 && y - cy < -2) ? PALETTE.w : PALETTE.a; g.fillRect(x, y, 1, 1);
  }
  g.fillStyle = PALETTE.e; for (let x = 4; x <= 14; x++) if (inE(x, H - 3, 0) && !inE(x, H - 3, 1)) g.fillRect(x, H - 3, 1, 1);      // нижній обідок шолома
  return (spaceHelmetCv = c);
}
function drawCustomer(c) {
  const exitPause = c.mode === 'exiting' && c.t < 0.38;
  const moving = (c.fear && c.fear.stage !== 1) ? false : (c.mode === 'homeKnock' || c.mode === 'doorWait' || exitPause) ? false : c.mode === 'inside' ? !!c.moving : true;
  const frame = moving ? Math.floor(c.anim * 6) % 2 : 0;
  const bob = frame ? -1 : 0;
  const sx = Math.round(c.x - 9) + (c.fear ? c.fear.sx : 0), sy = Math.round(c.y - 23) + bob + (c.fear ? Math.round(c.fear.fy) : 0) - ((c.mode === 'exiting' || c.mode === 'toEntrance' || c.mode === 'entering' || c.mode === 'doorWait') ? Math.round(curbLift(c.y)) : 0) - (exitPause ? Math.round(Math.abs(Math.sin(c.t / 0.38 * Math.PI * 2)) * 3) : 0);            // спрайт 18×23: ноги внизу, центр по x
  if ((c.mode === 'homeKnock' || c.mode === 'homeIn' || c.mode === 'homeOut') && c.homeDoor) drawHomeDoor(c);
  ctx.globalAlpha = 0.2 * c.alpha; R(ctx, sx + 3, Math.round(c.y), 12, 1, 'd'); ctx.globalAlpha = 1;
  if (c.vip) {
    const pulse = animOn() ? Math.sin(animClock * 5) : 0;
    ctx.globalAlpha = (0.2 + 0.08 * pulse) * c.alpha; disc(ctx, sx + 9, sy + 8, 21, 'y'); ctx.globalAlpha = 1;
    drawCanvasSprite(ctx, evenScaled(goldCanvas(c.type, frame), 1.56), sx, sy, { flip: c.dir < 0, alpha: c.alpha });
    for (let k = 0; k < 3; k++) { const a = animClock * 2.2 + k * 2.1, px = Math.round(sx + 9 + Math.cos(a) * 13), py = Math.round(sy + 7 + Math.sin(a * 1.3) * 12); if (Math.floor(animClock * 6 + k) % 2) { R(ctx, px, py - 1, 1, 3, 'y'); R(ctx, px - 1, py, 3, 1, 'y'); } }
    if (!c.vipDone) { const by = sy - 13 + (animOn() ? Math.round(Math.sin(animClock * 4)) : 0); R(ctx, sx + 7, by + 2, 5, 3, 'd'); R(ctx, sx + 8, by + 1, 3, 1, 'd'); R(ctx, sx + 8, by + 2, 3, 2, 'h'); R(ctx, sx + 9, by, 1, 1, 'y'); }
  } else { const sc = c.scale || 1; drawSprite(ctx, c.type + '_' + frame, sx, sy, { flip: c.dir < 0, alpha: c.alpha, sx: sc, sy: sc }); }
  if (c.fear) {                                                               // жартівливий переляк
    const f = c.fear;
    if (f.stage === 0) {                                                      // великий «!» і волоски дибки
      const hx = sx + 9, hy = sy - 11;
      R(ctx, hx - 2, hy - 1, 5, 10, 'd'); R(ctx, hx - 1, hy, 3, 5, 'r'); R(ctx, hx - 1, hy + 6, 3, 2, 'r'); R(ctx, hx - 1, hy, 1, 5, 'p');
      R(ctx, sx + 4, sy - 2, 1, 3, 'd'); R(ctx, sx + 9, sy - 3, 1, 3, 'd'); R(ctx, sx + 13, sy - 2, 1, 3, 'd');
    } else if (f.stage === 1) {                                               // швидкісні смужки позаду
      const bx = f.away > 0 ? sx - 6 : sx + 20;
      R(ctx, bx, sy + 8, 5, 1, 'w'); R(ctx, bx + 1, sy + 12, 6, 1, 'w'); R(ctx, bx, sy + 16, 4, 1, 'w');
    } else {                                                                  // піт градом і тремтіння
      const k = Math.floor(f.wait * 6) % 3;
      R(ctx, sx + 1, sy + 1 + k, 1, 2, 'S'); R(ctx, sx + 16, sy + 3 + ((k + 1) % 3), 1, 2, 'S'); R(ctx, sx + 2, sy + 6 - k, 1, 1, 'a');
      if (Math.floor(f.wait * 4) % 2) { R(ctx, sx + 7, sy - 4, 1, 3, 'd'); R(ctx, sx + 11, sy - 4, 1, 3, 'd'); }
    }
  }
  const gx = sx + (c.dir < 0 ? -1 : 0);                                       // у дзеркальному вигляді тіло зсунуте на піксель, одяг іде слідом
  const hs = skinOn('hero');
  if (c.vip) return;                                                           // золотий покупець: без скінів, капелюхів і шарфів
  if (hs && c.alpha > 0.9) drawSkinGear(gx, sy, hs, !hasHats());
  const suited = viewEpoch() % EPOCHS.length === 6;                            // Космос: усі покупці в скляних шоломах (шапочки свят під ними не потрібні)
  if (suited && c.alpha > 0.9) drawCanvasSprite(ctx, spaceHelmet(), gx, sy + 4, {});
  if (hasHats() && !suited && c.alpha > 0.9) { if (c.hat === undefined) c.hat = Math.floor(Math.random() * 42); drawHat(gx + 9, sy + 8, c.hat); }
  if (hasScarves() && c.alpha > 0.9) {       // шарфик на шиї покупця
    const sc = SCARF_COLORS[CUSTOMER_TYPES.indexOf(c.type) % SCARF_COLORS.length], nx = c.dir > 0 ? gx + 10 : gx + 5;
    R(ctx, gx + 4, sy + 16, 10, 2, sc); R(ctx, gx + 4, sy + 17, 10, 1, 'w'); R(ctx, nx, sy + 18, 3, 4, sc);
  }
  if (c.bag && !(c.scale && c.scale < 0.9)) {   // пакет з покупками в лапці, злегка гойдається
    const bc = CHIBI.bag(c.bagKind || 0, c.bag), bx = c.dir > 0 ? sx + 14 : sx - 6;
    drawCanvasSprite(ctx, bc, bx, sy + 11 + (frame ? 1 : 0), { alpha: c.alpha });
  }
}

function updateAnimations(dt) {
  // пружина: стискання → повернення з легким відскоком
  const steps = Math.max(1, Math.ceil(dt / 0.01));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    shopAnim.vel += (-300 * shopAnim.squash - 17 * shopAnim.vel) * h;
    shopAnim.squash += shopAnim.vel * h;
  }
  if (Math.abs(shopAnim.squash) < 0.001 && Math.abs(shopAnim.vel) < 0.01) { shopAnim.squash = 0; shopAnim.vel = 0; }

  // Капі кліпає
  if (capyAnim.blinkLeft > 0) {
    capyAnim.blinkLeft -= dt;
  } else {
    capyAnim.blinkIn -= dt;
    if (capyAnim.blinkIn <= 0) { capyAnim.blinkLeft = 0.14; capyAnim.blinkIn = rand(2.5, 5.5); }
  }

  // хмаринки пливуть
  clouds.forEach(c => {
    c.x += c.speed * dt;
    if (c.x > worldR() + 4) c.x = worldL() - 28;
  });

  if (build) updateBuild(dt);
  updateClockFx(dt);
  updateCustomers(dt);
  updateActors(dt);
  updateCameos(dt);
  updateGuests(dt);

  // монетки: політ, гравітація, зникання
  for (let i = fx.coins.length - 1; i >= 0; i--) {
    const p = fx.coins[i];
    p.age += dt;
    p.vy += 320 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.age >= p.life) fx.coins.splice(i, 1);
  }
  for (let i = fx.sparks.length - 1; i >= 0; i--) {
    const p = fx.sparks[i];
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.age >= p.life) fx.sparks.splice(i, 1);
  }
  for (let i = fx.dust.length - 1; i >= 0; i--) {
    const p = fx.dust[i];
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.age >= p.life) fx.dust.splice(i, 1);
  }
}

function spawnTapEffects(x, y) {
  if (!animOn()) return;
  const n = Math.floor(rand(CONFIG.TAP_COINS_MIN, CONFIG.TAP_COINS_MAX + 1));
  for (let i = 0; i < n; i++) {
    fx.coins.push({ x: x + rand(-6, 6), y: y - 4, vx: rand(-45, 45), vy: rand(-125, -70), age: 0, life: rand(0.7, 1.0), spin: rand(0, 4) });
  }
  for (let i = 0; i < 5; i++) {
    const a = rand(0, Math.PI * 2), sp = rand(30, 70);
    fx.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, age: 0, life: rand(0.25, 0.4), col: i % 2 ? 'y' : 'w' });
  }
  while (fx.coins.length > CONFIG.MAX_COIN_PARTICLES) fx.coins.shift();
  while (fx.sparks.length > (ecoOn() ? CONFIG.MAX_SPARKS >> 1 : CONFIG.MAX_SPARKS)) fx.sparks.shift();
}

// Текст «+1», що піднімається і зникає (HTML-елемент — чіткий піксельний шрифт)
function spawnFloater(x, y, text) {
  if (!animOn()) return;
  const el = document.createElement('div');
  el.className = 'floater';
  el.textContent = text;
  el.style.left = pctX(x) + '%';
  el.style.top = pctY(y) + '%';
  el.addEventListener('animationend', () => el.remove());
  ui.floaters.appendChild(el);
  while (ui.floaters.childElementCount > CONFIG.MAX_FLOATERS) ui.floaters.firstChild.remove();
}

