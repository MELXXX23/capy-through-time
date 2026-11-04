//#part 270_loop.js
/* =====================================================================
   ІГРОВИЙ ЦИКЛ
   ===================================================================== */

let lastFrame = performance.now();
let saveTimer = 0;
let uiTimer = 0;
let animClock = 0;

// Помилка в кадрі не зупиняє гру: її записуємо в журнал (Налаштування → Звіт), а наступний кадр усе одно просимо.
let frameErrN = 0;
function frameErr(e) {
  if (frameErrN++ < 3) { logErr('frame', e && e.message, '', 0, 0, e && e.stack); console.error('frame: ' + (e && e.message)); }
  if (frameErrN === 30) { try { showToast(t('errRepeat'), 'bad'); } catch (e2) { /* нічого */ } }   // збій повторюється: один раз кажемо гравцю, що робити
}
function frame(now) {
  try { frameStep(now); } catch (e) { frameErr(e); }
  requestAnimationFrame(frame);
}
function frameStep(now) {
  const raw = Math.max(0, (now - lastFrame) / 1000), dt = Math.min(CONFIG.MAX_DT, raw);
  lastFrame = now;
  perfSample(raw);
  updateCamera(dt);
  animClock += dt;

  // дохід
  if (state.cps > 0) {
    const gain = state.cps * dt;
    state.coins += gain;
    state.totalEarned += gain;
  }
  syncEpochEarned();
  // автотапи з майстерні часу: тапають по магазину самі
  const autoTaps = wsLevel('autoTap');
  if (autoTaps > 0) {
    const gain = tapValue() * autoTaps * dt;
    state.coins += gain;
    state.totalEarned += gain;
    autoTapAcc += dt * autoTaps;
    if (autoTapAcc >= 1) { autoTapAcc = 0; if (animOn()) shopAnim.vel = Math.max(shopAnim.vel, 1.6); }
  }
  state.playTime += dt;
  const prevPhase = state.dayPhase;
  if (dayNightOn()) state.dayPhase = (state.dayPhase + dt / CONFIG.DAY_SECONDS) % 1;
  countNights(dt, prevPhase);
  updateSkyState();

  const underWarp = warp && warp.t >= WARP_COVER && !warp.warm && warp.t / warp.dur < warp.showK - 0.02;      // сцену й панелі закриває вир: не рахуємо те, чого не видно, увесь кадр йому
  if (!underWarp) {
    updateAnimations(dt);
    updateBubbles();
    updateDialog(dt);
    checkStory(dt);
    updateEvents(dt);
  }
  updateWarp(dt);
  if (!underWarp) {
    updateSeasonFx(dt);
    updateSeasonsIntro();
    updateFxPlus(dt);
    updateDailyReminder(dt);
  }
  const hidden = (warp && warp.t >= WARP_COVER && !warp.warm && warp.t / warp.dur < warp.showK) || (epochIntro.active && performance.now() - epochIntro.startedAt > 1400 && performance.now() - epochIntro.startedAt < 5600) || cut.on;     // сцену не малюємо, поки її закриває вир або заставка: два кадри під виром (warp.warm) прогрівають нову епоху, а перед відкриттям вона вже намальована
  if (!hidden) { try { render(animClock); } catch (e) { frameErr(e); } }                       // у вирі подорожі сцену не малюємо: її все одно закриває вир, кадри легші; з 0,7 вир відкриває «дірку» — там уже має бути нова епоха

  uiTimer += dt;
  if (uiTimer >= CONFIG.UI_REFRESH_SECONDS) { uiTimer = 0; if (!warp) updateUI(); }      // під виром панелей не видно

  saveTimer += dt;
  if (saveTimer >= CONFIG.AUTOSAVE_SECONDS) { saveTimer = 0; if (!warp) saveGame(); }
}

