// Автоперевірка гри перед випуском.
//   bash tools/autotest.sh          (повна: ПК + телефони)
//   bash tools/autotest.sh --quick  (швидка: менше комбінацій)
// Запускає справжню гру (без режиму бога, як на сайті) в Electron на кількох розмірах екрана,
// проходить усі епохи, рівні, сезони, вкладки, події й переклади та пише підсумок.
const { app, BrowserWindow } = require('electron');
const fs = require('fs'), path = require('path');
const QUICK = process.argv.includes('--quick');
const ROOT = path.resolve(__dirname, '..');
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);
const PROFILES = [
  { name: 'ПК 1920×1080', w: 1920, h: 1080, dsf: 0 },
  { name: 'Телефон 390×844', w: 390, h: 844, dsf: 2 },
  { name: 'Телефон 360×640', w: 360, h: 640, dsf: 2 }
].slice(0, QUICK ? 2 : 3).filter((p, i) => !ONLY || String(i) === ONLY);
app.disableHardwareAcceleration();
app.on('window-all-closed', () => {});           // не виходити, поки не пройдемо всі розміри екрана
const wait = ms => new Promise(r => setTimeout(r, ms));
const page = fs.readFileSync(path.join(__dirname, 'autotest_page.js'), 'utf8');
const lines = [];
const say = s => { console.log(s); lines.push(s); };

app.whenReady().then(async () => {
  let bad = 0;
  for (const p of PROFILES) {
    say('== ' + p.name);
    const win = new BrowserWindow({ width: p.w, height: p.h, show: true, x: -4000, y: 0, focusable: false, skipTaskbar: true, useContentSize: true, webPreferences: { backgroundThrottling: false, partition: 'at' + Date.now() } });
    win.webContents.setAudioMuted(true);       // звук гри в тестах вимкнено
    const consoleErrs = [];
    win.webContents.on('console-message', (e, level, msg) => { if (level >= 3 && !/Failed to load resource|fonts\.g|ResizeObserver loop|navigator\.vibrate/.test(msg)) consoleErrs.push(msg.slice(0, 160)); });
    let crashed = false;
    win.webContents.on('render-process-gone', (e, d) => { crashed = true; say('  ✗ ПРОЦЕС ГРИ ВПАВ: ' + d.reason); });
    win.webContents.on('unresponsive', () => say('  ! вікно гри не відповідає'));
    for (let k = 0; k < 4; k++) { try { await win.loadFile(path.join(ROOT, 'desktop', 'app', 'game.html')); break; } catch (e) { if (k === 3) throw e; await wait(1500); } }
    if (p.dsf > 0) win.webContents.enableDeviceEmulation({ screenPosition: 'mobile', screenSize: { width: p.w, height: p.h }, viewPosition: { x: 0, y: 0 }, deviceScaleFactor: p.dsf, viewSize: { width: p.w, height: p.h }, scale: 1 });
    await wait(1500);
    const t0 = Date.now();
    try {
      await win.webContents.executeJavaScript('window.__QUICK=' + QUICK);
      const r = await win.webContents.executeJavaScript(page);
      r.notes.forEach(n => say('  · ' + n));
      r.fails.forEach(f => say('  ✗ ' + f));
      bad += r.fails.length;
    } catch (e) { say('  ✗ ТЕСТ ВПАВ: ' + e.message); bad++; }
    consoleErrs.forEach(m => say('  ✗ console.error: ' + m));
    bad += consoleErrs.length + (crashed ? 1 : 0);
    say('  (' + Math.round((Date.now() - t0) / 1000) + ' с)');
    win.destroy(); await wait(1500);
  }
  say(bad ? '\nРЕЗУЛЬТАТ: ЗНАЙДЕНО ПРОБЛЕМ: ' + bad : '\nРЕЗУЛЬТАТ: усе гаразд ✓');
  fs.writeFileSync(path.join(__dirname, 'autotest_last.txt'), lines.join('\n') + '\n');
  app.exit(bad ? 1 : 0);
});
