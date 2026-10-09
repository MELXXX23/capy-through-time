// Знімає екран гри в Electron без вікна: node electron shot.js <out.png> <width> <height> <js-file>
const { app, BrowserWindow } = require('electron');
const fs = require('fs'), path = require('path');
const [out, W, H, jsf] = process.argv.slice(2);
app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: +W, height: +H, show: true, x: -4000, y: 0, focusable: false, skipTaskbar: true, useContentSize: true, webPreferences: { backgroundThrottling: false, offscreen: false } });
  win.webContents.setAudioMuted(true);       // звук гри в тестах вимкнено
  await win.loadFile('C:/GAMES/capy-through-time/desktop/app/game.html');
  await new Promise(r => setTimeout(r, 2500));
  const code = jsf ? fs.readFileSync(jsf, 'utf8') : '';
  if (code) { try { const rv = await win.webContents.executeJavaScript(code); console.log('JS result', JSON.stringify(rv)); } catch (e) { console.log('JS error', e.message); } }
  await new Promise(r => setTimeout(r, 1500));
  const img = await win.webContents.capturePage();
  fs.writeFileSync(out, img.toPNG());
  console.log('saved', out, img.getSize());
  app.quit();
});
