//#part 270_loop.js
/* =====================================================================
   ІГРОВИЙ ЦИКЛ
   ===================================================================== */

let lastFrame = performance.now();
let saveTimer = 0;
let uiTimer = 0;
let animClock = 0;

function frame(now) {
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

  updateAnimations(dt);
  updateBubbles();
  updateDialog(dt);
  checkStory(dt);
  updateEvents(dt);
  updateWarp(dt);
  updateSeasonFx(dt);
  updateSeasonsIntro();
  updateDailyReminder(dt);
  render(animClock);

  uiTimer += dt;
  if (uiTimer >= CONFIG.UI_REFRESH_SECONDS) { uiTimer = 0; updateUI(); }

  saveTimer += dt;
  if (saveTimer >= CONFIG.AUTOSAVE_SECONDS) { saveTimer = 0; saveGame(); }

  requestAnimationFrame(frame);
}

