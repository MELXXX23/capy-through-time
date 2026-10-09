const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const [out, W, H, DSF, jsf] = process.argv.slice(2);
app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: +W, height: +H, show: true, x: -4000, y: 0, focusable: false, skipTaskbar: true, useContentSize: true, webPreferences: { backgroundThrottling: false } });
  win.webContents.setAudioMuted(true);       // звук гри в тестах вимкнено
  await win.loadFile('C:/GAMES/capy-through-time/desktop/app/game.html');
  win.webContents.enableDeviceEmulation({ screenPosition: 'mobile', screenSize: { width: +W, height: +H }, viewPosition: { x: 0, y: 0 }, deviceScaleFactor: +DSF, viewSize: { width: +W, height: +H }, scale: 1 });
  await new Promise(r => setTimeout(r, 2500));
  const code = jsf ? fs.readFileSync(jsf, 'utf8') : '';
  if (code) { try { const rv = await win.webContents.executeJavaScript(code); console.log('JS result', JSON.stringify(rv)); } catch (e) { console.log('JS error', e.message); } }
  await new Promise(r => setTimeout(r, 1500));
  const img = await win.webContents.capturePage({ x: 0, y: 0, width: +W, height: +H });
  fs.writeFileSync(out, img.toPNG());
  console.log('saved', JSON.stringify(img.getSize()));
  app.quit();
});
