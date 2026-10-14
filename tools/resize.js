// Масштаб PNG: env -u ELECTRON_RUN_AS_NODE electron tools/resize.js <in.png> <out.png> <ширина> <висота>  (nearest-neighbor збережено вимкненим згладжуванням)
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const [inp, out, w, h] = process.argv.slice(2);
app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await win.loadURL('about:blank');
  const url = await win.webContents.executeJavaScript(`new Promise(r => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = ${+w}; c.height = ${+h}; const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(i, 0, 0, ${+w}, ${+h}); r(c.toDataURL('image/png')); }; i.src = 'data:image/png;base64,${fs.readFileSync(inp).toString('base64')}'; })`);
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('saved', out); app.exit(0);
});
