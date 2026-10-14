// Обрізка PNG: env -u ELECTRON_RUN_AS_NODE electron tools/crop.js <in.png> <out.png> <x> <y> <w> <h>
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const [inp, out, x, y, w, h] = process.argv.slice(2);
app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await win.loadURL('about:blank');
  const url = await win.webContents.executeJavaScript(`new Promise(r => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = ${+w}; c.height = ${+h}; c.getContext('2d').drawImage(i, ${+x}, ${+y}, ${+w}, ${+h}, 0, 0, ${+w}, ${+h}); r(c.toDataURL('image/png')); }; i.src = 'data:image/png;base64,${fs.readFileSync(inp).toString('base64')}'; })`);
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('saved', out); app.exit(0);
});
