// Виконується всередині гри (запускає tools/layouts.js). Повертає { problems, small }.
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const problems = [], small = new Map();
  const add = (what, where) => { if (problems.length < 400) problems.push({ what, where }); };
  const closeAll = () => {
    document.querySelectorAll('[id$="Modal"]').forEach(m => { m.hidden = true; });
    try { if (epochIntro.active) finishEpochIntro(); } catch (e) { /* нічого */ }
    try { ui.dialog.hidden = true; dialog.active = false; } catch (e) { /* нічого */ }
  };
  if (!window.__prepared) {
    await sleep(3000);
    try { cutStop(false); } catch (e) { /* нічого */ }
    try { tourStop(false); } catch (e) { /* нічого */ }
    closeAll();
    state.cutSeen = true; state.tutorialDone = true; state.story.finale = true; state.story.done = 8; state.epochIntroSeen = 99; storyTimer = 1e9;
    state.settings.dayNight = false; state.settings.panelOpen = false; state.coins = 1e30; state.totalEarned = 1e30; state.shards = 123456; state.crystals = 789;
    state.epoch = 3; state.eid = 3; state.activeEpoch = -1; state.shopLevel = 4; state.dayPhase = 0.5;
    state.team = TEAM.map((m, i) => (m.level <= 4 && !m.needs ? 3 : 0)); state.depts = DEPARTMENTS.map(d => (d.level <= 4 ? 3 : 0));
    updateTheme(); recalcIncome(); rebuildShop(true); syncActors(); syncGuests();
    window.__prepared = 1; await sleep(400);
  }
  try { setLanguage(window.__LANG || 'uk'); } catch (e) { add('мова впала: ' + e.message, 'setLanguage'); }
  await sleep(120);
  if (window.__SHOT === 1) { closeAll(); try { setSheet(false); } catch (e) { /* ПК */ } return { problems, small: [] }; }
  if (window.__SHOT === 3) { closeAll(); state.circus.phase = 3; state.circus.hag = 1; state.circus.noodle = 0; state.circus.spun = 0; openCircus(); hagStart(); await sleep(500); return { problems, small: [] }; }
  if (window.__SHOT === 4) { closeAll(); state.circus.hag = 0; hagFly.on = false; state.circus.phase = 0; state.circus.next = Date.now() + 1e9; openNews(); await sleep(700); return { problems, small: [] }; }
  if (window.__SHOT === 5) { closeAll(); openFeedback(); await sleep(300); return { problems, small: [] }; }
  if (window.__SHOT === 2) { closeAll(); showTab('departments'); try { setSheet(true); ui.app.classList.add('more-open'); } catch (e) { /* ПК */ } return { problems, small: [] }; }

  const W = innerWidth, H = innerHeight, touch = W < 1100;
  const label = el => { const c = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''; return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (c ? '.' + c : ''); };
  const visible = el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return null; const r = el.getBoundingClientRect(); return r.width && r.height ? { cs, r } : null; };
  const own = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
  // прокручувані контейнери: те, що всередині них, не вважаємо «вилізлим за екран»
  const inScroller = el => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p); if (/(auto|scroll)/.test(o.overflowY + o.overflowX) && (p.scrollHeight > p.clientHeight + 1 || p.scrollWidth > p.clientWidth + 1)) return true; } return false; };
  const clippedByParent = (el, r) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p); if (o.overflowX === 'hidden' || o.overflowY === 'hidden' || o.overflow === 'clip') { const q = p.getBoundingClientRect(); if (r.right > q.right + 1 || r.left < q.left - 1 || r.bottom > q.bottom + 1 || r.top < q.top - 1) return p; } } return null; };
  const scan = (root, tag) => {
    root.querySelectorAll('*').forEach(el => {
      const v = visible(el); if (!v) return;
      const { cs, r } = v;
      if (/^(BUTTON|A|SELECT)$/.test(el.tagName) && touch) { const m = Math.min(el.offsetWidth, el.offsetHeight); if (m < 32 && !inScroller(el)) { const k = label(el); if (!small.has(k) || small.get(k) > m) small.set(k, Math.round(m)); } }
      const txt = own(el); if (!txt) return;
      const short = txt.slice(0, 26);
      if (!inScroller(el) && (r.right > W + 1 || r.left < -1 || r.bottom > H + 1 || r.top < -1)) add('за екраном', tag + ' ' + label(el) + ' "' + short + '"');
      if (el.scrollWidth > el.clientWidth + 1 && !/(auto|scroll)/.test(cs.overflowX) && cs.display !== 'inline') add(cs.overflowX === 'hidden' ? 'текст обрізано' : 'текст вилазить', tag + ' ' + label(el) + ' "' + short + '"');
      else if (!inScroller(el)) { const p = clippedByParent(el, r); if (p) add('обрізано батьком', tag + ' ' + label(el) + ' "' + short + '" у ' + label(p)); }
    });
  };

  // ---------- верхня панель і сцена ----------
  closeAll(); try { setSheet(false); } catch (e) { /* ПК */ }
  await sleep(120);
  const top = document.querySelector('#topbar'); if (top) scan(top, 'верх');
  const stage = document.querySelector('#stage'); if (stage) { const sv = stage.getBoundingClientRect(); if (sv.right > W + 1 || sv.left < -1) add('сцена ширша за екран', sv.width + '×' + sv.height); }
  if (document.documentElement.scrollWidth > W + 1) add('сторінка гортається вбік', document.documentElement.scrollWidth + '>' + W);

  // ---------- вкладки ----------
  for (const x of TABS) {
    try { showTab(x.id); try { setSheet(true); ui.app.classList.add('more-open'); } catch (e) { /* ПК */ } } catch (e) { add('вкладка впала: ' + e.message, x.id); continue; }
    await sleep(170);
    const panel = document.querySelector('#panel');
    if (panel) {
      const pr = panel.getBoundingClientRect();
      if (pr.right > W + 1 || pr.left < -1) add('панель за екраном', x.id);
      scan(panel, 'вкладка ' + x.id);
    }
  }
  try { setSheet(false); } catch (e) { /* нічого */ }
  showTab('shop');

  // ---------- вікна ----------
  const modal = async (name, fn, sel) => {
    closeAll();
    try { await fn(); } catch (e) { add('вікно впало: ' + e.message, name); return; }
    await sleep(260);
    const m = document.querySelector(sel); if (!m || m.hidden) return;
    scan(m, name);
    const box = m.firstElementChild; const bv = box && visible(box);
    if (bv && bv.r.width < W * 1.5 && (bv.r.right > W + 1 || bv.r.left < -1 || bv.r.bottom > H + 1 || bv.r.top < -1) && !/(auto|scroll)/.test(getComputedStyle(m).overflowY)) add('вікно більше за екран', name + ' ' + Math.round(bv.r.width) + '×' + Math.round(bv.r.height));
  };
  const mod = { };
  await modal('підтвердження', () => askConfirm(t('skinBuyTitle'), t('skinBuyText', t('skin_capy_pirate'), 50, 789), t('skinBuyYes'), () => {}), '#confirmModal');
  await modal('цирк', () => { state.circus.phase = 3; state.circus.hag = 0; state.circus.noodle = 0; state.circus.spun = 0; openCircus(); }, '#circusModal');
  await modal('приз-скін', () => openLoot(0), '#lootModal');
  await modal('хатка відьми', () => { state.circus.phase = 3; state.circus.hag = 1; state.circus.noodle = 0; state.circus.spun = 0; openCircus(); hagStart(); }, '#circusModal');
  state.circus.hag = 0; hagFly.on = false;
  for (const n of [0, 3, 6]) await modal('бонус-гра ' + n, () => { state.wheel.mg.fill(0); openBonus(MG_DEFS[n]); }, '#circusModal');
  state.circus.phase = 0; state.circus.next = Date.now() + 1e9;
  await modal('газета', () => openNews(), '#newsModal');
  await modal('відгук', () => openFeedback(), '#feedbackModal');
  closeAll();
  return { problems, small: [...small.entries()].map(([id, size]) => ({ id, size })) };
})()
