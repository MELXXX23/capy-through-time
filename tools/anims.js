// Плавність анімацій: кожен сценарій — свіже завантаження, власний rAF-лічильник; друкує середній кадр, p95, найдовший і кількість ривків > 50 мс
//   env -u ELECTRON_RUN_AS_NODE desktop/node_modules/electron/dist/electron.exe tools/anims.js 1920 1080 [scene,cutscene,warp,...]  (SRC=інший.html)
const { app, BrowserWindow } = require('electron');
const path = require('path');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
const [W, H, ONLY] = process.argv.slice(2);
const SRC = process.env.SRC || path.join(__dirname, '..', 'game.html');
const SC = [
  ['scene', '', 4],
  ['cutscene', 'playCutscene("B", {})', 9],
  ['epochIntro', 'playEpochIntro(state.epoch)', 7],
  ['warp', 'startWarp()', 8],
  ['build', 'startBuild(shop)', 9],
  ['circus', 'openCircus()', 4],
  ['hag', 'hagStart()', 5],
  ['bonus', 'openBonus()', 5],
  ['news', 'openNews()', 3],
  ['tour', 'startMenuTour(null)', 5],
];
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: +W, height: +H, x: -4000, y: 0, show: true, useContentSize: true, webPreferences: { partition: 'anims' + Date.now(), backgroundThrottling: false } });
  win.webContents.setAudioMuted(true);
  const errs = [];
  win.webContents.on('console-message', (e, level, msg) => { if (level >= 3 && !/Failed to load|ResizeObserver|vibrate/.test(msg)) errs.push(msg.slice(0, 140)); });
  win.webContents.on('dom-ready', () => win.webContents.executeJavaScript('try { localStorage.setItem("capyCutSeen", "1"); } catch (e) {}'));
  for (const [name, code, sec] of SC) {
    if (ONLY && !ONLY.split(',').includes(name)) continue;
    errs.length = 0;
    await win.loadFile(SRC);
    await new Promise(r => setTimeout(r, 2500));
    const js = `(async () => { try {
      const b = document.getElementById('boot'); if (b) b.remove();
      state.cutSeen = true; await new Promise(r => setTimeout(r, 600));
      ${code};
      const d = []; let last = 0, run = true, longs = [];
      try { new PerformanceObserver(l => l.getEntries().forEach(e => longs.push(Math.round(e.duration)))).observe({ entryTypes: ['longtask'] }); } catch (e) {}
      const loop = now => { if (last) d.push(now - last); last = now; if (run) requestAnimationFrame(loop); }; requestAnimationFrame(loop);
      await new Promise(r => setTimeout(r, ${sec * 1000})); run = false;
      const s = d.slice().sort((a, b) => a - b), mean = d.reduce((a, b) => a + b, 0) / d.length;
      return [d.length, mean.toFixed(1), s[Math.floor(s.length * 0.95)].toFixed(0), s[s.length - 1].toFixed(0), d.filter(x => x > 50).length, longs.slice(0, 8).join('/')].join(' | ');
    } catch (e) { return 'ПОМИЛКА ' + e.message; } })()`;
    let r; try { r = await win.webContents.executeJavaScript(js); } catch (e) { r = 'ERR ' + e.message; }
    console.log(name.padEnd(11) + ' кадрів | сер. мс | p95 | макс | >50мс | довгі задачі :: ' + r + (errs.length ? '  !! ' + errs.slice(0, 2).join(' ; ') : ''));
  }
  app.exit(0);
});
