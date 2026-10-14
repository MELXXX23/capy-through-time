// Контактний лист із PNG: env -u ELECTRON_RUN_AS_NODE electron tools/montage.js <out.png> <колонок> <ширина-клітинки> <файл1.png> <файл2.png> ...
// (дешевий перегляд багатьох знімків одним зображенням)
const { app, BrowserWindow } = require('electron');
const fs = require('fs'), path = require('path');
const [out, cols, cw, ...files] = process.argv.slice(2);
app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await win.loadURL('about:blank');
  const imgs = files.map(f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'));
  const url = await win.webContents.executeJavaScript(`(async () => {
    const imgs = ${JSON.stringify(imgs)}, C = ${+cols}, CW = ${+cw};
    const els = await Promise.all(imgs.map(s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; })));
    const ch = Math.round(CW * els[0].height / els[0].width), rows = Math.ceil(els.length / C), gap = 6;
    const c = document.createElement('canvas'); c.width = C * (CW + gap) + gap; c.height = rows * (ch + gap) + gap;
    const g = c.getContext('2d'); g.fillStyle = '#222'; g.fillRect(0, 0, c.width, c.height);
    els.forEach((e, i) => g.drawImage(e, gap + (i % C) * (CW + gap), gap + Math.floor(i / C) * (ch + gap), CW, ch));
    return c.toDataURL('image/png');
  })()`);
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log('saved', out);
  app.exit(0);
});
