// Перевірка стану гри БЕЗ скриншотів: відкриває game.html у прихованому Electron, виконує вираз і друкує JSON.
//   env -u ELECTRON_RUN_AS_NODE desktop/node_modules/electron/dist/electron.exe tools/probe.js "<js-вираз або файл.js>" [--w 1280] [--h 720] [--wait 1500] [--src desktop/app/game.html]
// Вираз бачить глобальні const гри (state, curEpoch(), CONFIG …); може бути async (await дозволено), результат — через JSON.
// Звук вимкнено, сесія в пам'яті (збереження справжньої гри не чіпається). Вивід обрізається до 4000 символів.
const { app, BrowserWindow } = require('electron');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf(k); if (i < 0) return d; const v = a[i + 1]; a.splice(i, 2); return v; };
const W = +opt('--w', 1280), H = +opt('--h', 720), WAIT = +opt('--wait', 1500), SRC = opt('--src', 'game.html');
let code = a[0] || 'state.epoch';
if (/\.js$/.test(code) && fs.existsSync(code)) code = fs.readFileSync(code, 'utf8');
app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: W, height: H, show: false, webPreferences: { partition: 'probe', backgroundThrottling: false } });
  win.webContents.setAudioMuted(true);
  const errs = [];
  win.webContents.on('console-message', (e, level, msg) => { if (level >= 3 && !/Failed to load resource|ResizeObserver/.test(msg)) errs.push(msg.slice(0, 200)); });
  try {
    await win.loadFile(path.join(ROOT, SRC));
    await new Promise(r => setTimeout(r, WAIT));
    const r = await win.webContents.executeJavaScript('(async()=>{try{const __r=await (async()=>{ return (' + code + '\n); })();return JSON.stringify(__r===undefined?null:__r)}catch(e){return JSON.stringify({error:String(e&&e.stack||e).slice(0,500)})}})()');
    console.log(String(r).slice(0, 4000));
    if (errs.length) console.log('console.error: ' + errs.slice(0, 5).join(' | '));
  } catch (e) { console.log('ПОМИЛКА: ' + e.message); }
  app.exit(0);
});
