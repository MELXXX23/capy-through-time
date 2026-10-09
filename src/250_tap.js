//#part 250_tap.js
/* =====================================================================
   ТАП ПО МАГАЗИНУ
   ===================================================================== */

let hapticSwitch = null;
// Вібрація: Android — стандартна navigator.vibrate; iPhone її не має, тому там легкий «клік» через прихований перемикач <input switch> (Safari 17.4+)
function buzz(ms) {
  if (!state.settings.vibrate) return;
  try {
    const H = nativePlugin('Haptics');
    if (H) { H.vibrate({ duration: ms || 12 }); return; }
    if (navigator.vibrate) { navigator.vibrate(ms || 12); return; }
    if (!hapticSwitch) {
      const l = document.createElement('label'); l.setAttribute('aria-hidden', 'true');
      l.style.cssText = 'position:fixed;left:-80px;top:-80px;width:44px;height:24px;opacity:.01;pointer-events:none';
      const i = document.createElement('input'); i.type = 'checkbox'; i.setAttribute('switch', ''); i.tabIndex = -1;
      l.appendChild(i); document.body.appendChild(l); hapticSwitch = i;
    }
    hapticSwitch.click();
    if ((ms || 12) >= 25) setTimeout(() => { try { hapticSwitch.click(); } catch (e) {} }, 70);
  } catch (e) {}
}
function evMult() { return 1.4; }       // наскільки рідше йдуть події (цирк, герої, привиди, розпродажі, неприємності)
function doTap(x, y) {
  buzz(8);
  const gain = tapValue();
  state.coins += gain;
  state.totalEarned += gain;
  state.taps += 1;
  if (animOn()) shopAnim.vel = 4.2;      // м'який поштовх: магазин легко присідає й пружно вертається
  playSfx('tap');
  spawnTapEffects(x, y);
  spawnFloater(x + rand(-8, 8), y - 6, '+' + fmt(gain, 1));
  updateUI();
}

// Координати події → координати сцени («ядро» 320×180; ліворуч від нього x < 0, над ним y < 0)
function toScenePoint(clientX, clientY) {
  const r = ui.world.getBoundingClientRect();
  return { x: (clientX - r.left) / r.width * view.w - view.offX, y: (clientY - r.top) / r.height * view.h - view.offY };
}

function hitShop(p) {
  const pad = 4;
  return p.x >= shop.x - pad && p.x <= shop.x + shop.w + pad && p.y >= shop.y - pad && p.y <= shop.y + shop.h + pad;
}

function setupInput() {
  const sceneTap = e => {
    if (ui.app.classList.contains('sheet-open')) setSheet(false);          // телефон: дотик до гри ховає меню
    const p = toScenePoint(e.clientX, e.clientY);
    if (handleEventTap(p)) return;              // калюжа або єнот
    if (hitGhost(p)) return;                    // привид (Хелловін)
    if (hitClock(p)) return;                    // годинникова вежа торгового центру
    if (hitCircus(p)) return;                   // червоний «!» або цирк Фортуни
    if (hitMail(p)) return;                     // конверт біля поштової скриньки
    if (hitNews(p)) return;                     // червона скринька з новинами
    if (hitVip(p)) return;                      // золотий покупець
    if (hitRainToggle(p)) return;               // крапелька біля магазину: дощ увімк./вимк.
    const actor = hitActor(p);                  // звірятко підстрибує й каже фразу, а магазин усе одно дає монетку
    if (actor) { actor.hop = 1; actorSay(actor); }
    else { const guest = hitGuest(p) || hitStandGuest(p); if (guest) guestSay(guest); else if (hitCapy(p)) { capyAnim.hopAt = animClock; capySay(); } }
    doTap(p.x, p.y);                            // тапати можна в будь-яку точку екрана
  };
  // На телефоні вулицю можна гортати пальцем: тап рахується при відпусканні, якщо палець не рушав
  const drags = new Map();
  ui.scene.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!ui.scene.classList.contains('pannable')) { sceneTap(e); return; }
    drags.set(e.pointerId, { x: e.clientX, pan: cam.pan, moved: false }); camDragging = true;
    try { ui.scene.setPointerCapture(e.pointerId); } catch (err) { /* нічого */ }
  });
  ui.scene.addEventListener('pointermove', e => {
    const d = drags.get(e.pointerId);
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 9) d.moved = true;
    if (d.moved) { cam.pan = d.pan - dx / sceneUnit; applyCamera(); cam.goal = cam.pan; }
  });
  const endDrag = (e, cancelled) => {
    const d = drags.get(e.pointerId);
    if (!d) return;
    drags.delete(e.pointerId); camDragging = drags.size > 0; cam.goal = cam.pan;
    if (!d.moved && !cancelled) sceneTap(e);
  };
  ui.scene.addEventListener('pointerup', e => endDrag(e, false));
  ui.scene.addEventListener('pointercancel', e => endDrag(e, true));
  ui.panL.addEventListener('pointerdown', e => e.stopPropagation()); ui.panR.addEventListener('pointerdown', e => e.stopPropagation());
  ui.panL.addEventListener('click', e => { e.stopPropagation(); panBy(-viewCrop.w * 0.6); });
  ui.panR.addEventListener('click', e => { e.stopPropagation(); panBy(viewCrop.w * 0.6); });
  document.addEventListener('keydown', e => { if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.target.closest('input,textarea') && ui.modal.hidden && ui.wheelModal.hidden && ui.circusModal.hidden && ui.letterModal.hidden) panBy((e.key === 'ArrowLeft' ? -1 : 1) * viewCrop.w * 0.3); });
  ui.panelToggle.addEventListener('click', () => { state.settings.panelOpen = !state.settings.panelOpen; applyPanel(); saveGame(); });
  // з клавіатури: Enter або пробіл тапають по магазину
  ui.scene.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
      e.preventDefault();
      doTap(shop.x + shop.w / 2 + rand(-12, 12), shop.y + shop.h * 0.55);
    }
  });
  ui.scene.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('gesturestart', e => e.preventDefault());   // без pinch-зуму в Safari
  // діалог: клік/тап — далі; Enter, пробіл, → теж; кнопка «Пропустити главу»
  ui.dialog.addEventListener('click', advanceDialog);
  ui.dlgSkip.addEventListener('click', e => { e.stopPropagation(); endDialogue(); });
  ui.epochIntro.addEventListener('click', () => { if (epochIntro.active && performance.now() - epochIntro.startedAt > 1500) { epochIntro.timers.forEach(clearTimeout); epochIntro.timers = []; ui.epochIntro.classList.add('out'); epochIntro.timers.push(setTimeout(finishEpochIntro, 600)); } });
  document.addEventListener('keydown', e => {
    if (!dialog.active || e.target === ui.dlgSkip) return;
    if (dialog.choosing && (e.key === '1' || e.key === '2')) { chooseOption(+e.key); return; }
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); advanceDialog(); }
  });
  ui.expandBtn.addEventListener('click', expandShop);
  ui.modalBtn.addEventListener('click', claimOffline);
}

