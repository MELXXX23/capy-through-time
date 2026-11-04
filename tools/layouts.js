// Перевірка розкладок: кожна мова × кожен розмір екрана (планшети, малі й довгі телефони, горизонталь).
//   env -u ELECTRON_RUN_AS_NODE desktop/node_modules/electron/dist/electron.exe tools/layouts.js [--sizes=768x1024,844x390] [--langs=es,pl] [--shots]
// Перед запуском: CAPY_NOGOD=1 node desktop/prepare.js
// Звіт: tools/layouts_last.txt (що вилазить, що обрізається, замалі кнопки). --shots: знімки в previews/layouts/.
const { app, BrowserWindow } = require('electron');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const arg = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').slice(n.length + 3);
const SHOTS = process.argv.includes('--shots');
const SIZES = (arg('sizes') || '1920x1080,1280x800,1024x768,768x1024,600x960,412x915,390x844,360x640,320x568,844x390,740x360').split(',').map(s => { const [w, h] = s.split('x').map(Number); return { w, h }; });
const LANGS = (arg('langs') || 'uk,en,es,it,pl,pt').split(',');
app.disableHardwareAcceleration();
app.on('window-all-closed', () => {});
const wait = ms => new Promise(r => setTimeout(r, ms));
const page = fs.readFileSync(path.join(__dirname, 'layouts_page.js'), 'utf8');

app.whenReady().then(async () => {
  const out = [], seen = new Map(); let small = new Map();
  for (const s of SIZES) {
    const win = new BrowserWindow({ width: s.w, height: s.h, show: true, x: -4000, y: 0, focusable: false, skipTaskbar: true, useContentSize: true, webPreferences: { backgroundThrottling: false, partition: 'lay' + Date.now() } });
    win.webContents.setAudioMuted(true);
    try {
      await win.loadFile(path.join(ROOT, 'desktop', 'app', 'game.html'));
      if (s.w < 1100) win.webContents.enableDeviceEmulation({ screenPosition: 'mobile', screenSize: { width: s.w, height: s.h }, viewPosition: { x: 0, y: 0 }, deviceScaleFactor: 2, viewSize: { width: s.w, height: s.h }, scale: 1 });
      await wait(1500);
      for (const lang of LANGS) {
        await win.webContents.executeJavaScript('window.__LANG=' + JSON.stringify(lang));
        const r = await win.webContents.executeJavaScript(page);
        for (const p of r.problems) { const k = p.what + ' | ' + p.where; const e = seen.get(k) || { n: 0, at: new Set() }; e.n++; e.at.add(s.w + '×' + s.h + ' ' + lang); seen.set(k, e); }
        for (const b of r.small) small.set(b.id, Math.min(small.get(b.id) || 999, b.size));
        console.log(s.w + 'x' + s.h, lang, r.problems.length);
      }
      if (SHOTS) {
        const dir = path.join(ROOT, 'previews', 'layouts'); fs.mkdirSync(dir, { recursive: true });
        await win.webContents.executeJavaScript('window.__LANG="uk";window.__SHOT=1');
        await win.webContents.executeJavaScript(page);
        await wait(400);
        fs.writeFileSync(path.join(dir, s.w + 'x' + s.h + '_scene.png'), (await win.webContents.capturePage()).toPNG());
        await win.webContents.executeJavaScript('window.__SHOT=2'); await win.webContents.executeJavaScript(page); await wait(400);
        fs.writeFileSync(path.join(dir, s.w + 'x' + s.h + '_menu.png'), (await win.webContents.capturePage()).toPNG());
        for (const [n, name] of [[3, 'hag'], [4, 'news'], [5, 'feedback']]) {
          await win.webContents.executeJavaScript('window.__SHOT=' + n); await win.webContents.executeJavaScript(page); await wait(300);
          fs.writeFileSync(path.join(dir, s.w + 'x' + s.h + '_' + name + '.png'), (await win.webContents.capturePage()).toPNG());
        }
        await win.webContents.executeJavaScript('window.__SHOT=0');
      }
    } catch (e) { out.push('ВПАВ ' + s.w + '×' + s.h + ': ' + e.message); }
    win.destroy(); await wait(600);
  }
  const rows = [...seen.entries()].sort((a, b) => b[1].n - a[1].n);
  out.push('Проблем різних: ' + rows.length);
  for (const [k, e] of rows.slice(0, 200)) { const at = [...e.at]; out.push(k + '  [' + e.n + ' раз: ' + at.slice(0, 5).join(', ') + (at.length > 5 ? ' …' : '') + ']'); }
  out.push('', 'Малі кнопки на сенсорних екранах (менше 32 пікселів):');
  for (const [id, sz] of [...small.entries()].sort((a, b) => a[1] - b[1]).slice(0, 40)) out.push('  ' + sz + ' пікс.  ' + id);
  fs.writeFileSync(path.join(__dirname, 'layouts_last.txt'), out.join('\n') + '\n');
  app.exit(0);
});
