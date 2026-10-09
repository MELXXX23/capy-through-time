// Робить набір іконок для магазинів із docs/icons/icon-512.png (звичайна) і icon-maskable-512.png (з полями для круглої обрізки).
// Запуск: env -u ELECTRON_RUN_AS_NODE desktop/node_modules/electron/dist/electron.exe tools/mkstoreicons.js
// Результат: store/icons/android, store/icons/ios, store/icons/web. Збільшення — без згладжування (чіткі пікселі), зменшення — плавне.
const { app, BrowserWindow } = require('electron');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'store', 'icons');
const SRC = { any: path.join(ROOT, 'docs', 'icons', 'icon-512.png'), mask: path.join(ROOT, 'docs', 'icons', 'icon-maskable-512.png') };
const SETS = {
  android: [['mipmap-mdpi/ic_launcher.png', 48, 'any'], ['mipmap-hdpi/ic_launcher.png', 72, 'any'], ['mipmap-xhdpi/ic_launcher.png', 96, 'any'], ['mipmap-xxhdpi/ic_launcher.png', 144, 'any'], ['mipmap-xxxhdpi/ic_launcher.png', 192, 'any'],
    ['mipmap-mdpi/ic_launcher_foreground.png', 108, 'mask'], ['mipmap-hdpi/ic_launcher_foreground.png', 162, 'mask'], ['mipmap-xhdpi/ic_launcher_foreground.png', 216, 'mask'], ['mipmap-xxhdpi/ic_launcher_foreground.png', 324, 'mask'], ['mipmap-xxxhdpi/ic_launcher_foreground.png', 432, 'mask'],
    ['play-store-icon-512.png', 512, 'any']],
  ios: [1024, 180, 167, 152, 120, 87, 80, 76, 60, 58, 40, 29, 20].map(s => ['AppIcon-' + s + '.png', s, 'any']),
  web: [['icon-192.png', 192, 'any'], ['icon-512.png', 512, 'any'], ['favicon-32.png', 32, 'any'], ['favicon-16.png', 16, 'any']]
};
app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: false } });
  await win.loadURL('data:text/html,<canvas id=c></canvas>');
  const data = k => 'data:image/png;base64,' + fs.readFileSync(SRC[k]).toString('base64');
  let n = 0;
  for (const [group, list] of Object.entries(SETS)) for (const [rel, size, kind] of list) {
    const png = await win.webContents.executeJavaScript(`new Promise(res => { const im = new Image(); im.onload = () => {
      const c = document.getElementById('c'); c.width = c.height = ${size}; const g = c.getContext('2d');
      g.imageSmoothingEnabled = ${size < 512}; g.imageSmoothingQuality = 'high'; g.drawImage(im, 0, 0, ${size}, ${size});
      res(c.toDataURL('image/png').split(',')[1]); }; im.src = ${JSON.stringify(data(kind))}; })`);
    const f = path.join(OUT, group, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, Buffer.from(png, 'base64')); n++;
  }
  console.log('іконок записано:', n, '→', OUT);
  app.exit(0);
});
