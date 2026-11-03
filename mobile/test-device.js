// Перевірка на підключеному телефоні чи емуляторі (вікон на столі не відкриває):
//   node test-device.js            налагоджувальна збірка: дивимось усередину гри (збереження, звук, «Назад», обертання, посилання, код збереження)
//   node test-device.js --release <файл.aab>   той самий файл, що піде в магазин: запуск, журнал помилок, знімок
// Знімки: previews/play/device/. Обертання екрана після перевірки повертається як було. Дані тестової гри стираються на початку.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { BUNDLETOOL, TEST_KEY, TEST_PASS, toolEnv, sdkTool, javaTool } = require('./tools-paths');
const PKG = 'com.capy.capytapmarket', ACT = PKG + '/.MainActivity', ADB = sdkTool('platform-tools/adb.exe');
const ROOT = path.resolve(__dirname, '..'), ANDROID = path.join(__dirname, 'android'), OUT = path.join(ROOT, 'previews', 'play', 'device');
const argv = process.argv.slice(2), isRelease = argv.includes('--release'), aabArg = argv[argv.indexOf('--release') + 1];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = toolEnv();
let serial = '', failed = 0;

function run(cmd, args, opts) {
  const r = cp.spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 28, windowsHide: true, env, ...opts });
  if (r.status !== 0 && !(opts && opts.soft)) throw new Error(path.basename(cmd) + ' ' + args.slice(0, 4).join(' ') + ': ' + String(r.stderr || r.stdout || '').slice(-1500));
  return r.stdout;
}
const adb = (...a) => run(ADB, ['-s', serial, ...a]);
const shell = cmd => run(ADB, ['-s', serial, 'shell', cmd], { soft: true });
function ok(name, cond, detail) { if (!cond) failed++; console.log((cond ? 'так  ' : 'НІ   ') + name + (detail !== undefined ? ': ' + detail : '')); }
function shot(name) { fs.mkdirSync(OUT, { recursive: true }); const b = cp.spawnSync(ADB, ['-s', serial, 'exec-out', 'screencap', '-p'], { maxBuffer: 1 << 28, windowsHide: true, env }).stdout; fs.writeFileSync(path.join(OUT, name + '.png'), b); }
const topActivity = () => { const m = shell('dumpsys activity activities').match(/(?:topResumedActivity|mResumedActivity)[^\n]*?(\S+\/\S+)/); return m ? m[1] : ''; };
const inGame = () => topActivity().startsWith(PKG);
const launch = () => adb('shell', 'am', 'start', '-W', '-n', ACT);

function findDevice() {
  const lines = run(ADB, ['devices']).split('\n').slice(1).map(l => l.trim()).filter(Boolean);
  const good = lines.filter(l => /\bdevice$/.test(l));
  if (!good.length) { console.error(lines.some(l => /unauthorized/.test(l)) ? 'На телефоні натисни «Дозволити налагодження USB».' : 'Телефон не видно: перевір кабель і «Налагодження USB».'); process.exit(2); }
  serial = good[0].split(/\s+/)[0];
  console.log('Пристрій: ' + shell('getprop ro.product.manufacturer').trim() + ' ' + shell('getprop ro.product.model').trim() + ', Android ' + shell('getprop ro.build.version.release').trim() + ' (API ' + shell('getprop ro.build.version.sdk').trim() + '), екран ' + shell('wm size').trim().split(': ').pop());
}

async function attach() {
  let pid = '';
  for (let i = 0; i < 40 && !pid; i++) { pid = shell('pidof ' + PKG).trim(); if (!pid) await sleep(250); }
  run(ADB, ['-s', serial, 'forward', 'tcp:9333', 'localabstract:webview_devtools_remote_' + pid]);
  let page = null;
  for (let i = 0; i < 60 && !page; i++) { try { page = (await (await fetch('http://127.0.0.1:9333/json')).json()).find(p => p.type === 'page'); } catch (e) { /* ще не готове */ } if (!page) await sleep(500); }
  if (!page) throw new Error('не можу під\'єднатись до гри');
  const ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise((a, b) => { ws.onopen = a; ws.onerror = b; });
  let id = 0; const wait = new Map(), errors = [];
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && wait.has(d.id)) { wait.get(d.id)(d); wait.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.text + ' ' + ((d.params.exceptionDetails.exception || {}).description || '').slice(0, 200));
    if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error') errors.push(d.params.entry.text + ' ' + (d.params.entry.url || '')); };
  const send = (method, params) => new Promise(r => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Runtime.enable'); await send('Log.enable');
  const ev = async expr => { const r = await send('Runtime.evaluate', { expression: '(async()=>{ return (' + expr + '\n); })()', awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(expr.slice(0, 60) + ': ' + (r.result.exceptionDetails.exception || {}).description); return r.result.result.value; };
  return { ev, errors, close: () => { try { ws.close(); } catch (e) { /* нічого */ } run(ADB, ['-s', serial, 'forward', '--remove', 'tcp:9333'], { soft: true }); } };
}
const waitBoot = async c => { for (let i = 0; i < 120; i++) { try { if (await c.ev("typeof state === 'object' && (!document.getElementById('boot') || document.getElementById('boot').hidden || getComputedStyle(document.getElementById('boot')).display === 'none')")) return true; } catch (e) { /* ще вантажиться */ } await sleep(500); } return false; };
const SAFE = "(() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'; document.body.appendChild(d); const s = getComputedStyle(d), r = [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].map(parseFloat); d.remove(); return r; })()";
const LAYOUT = "(() => { const de = document.documentElement, bad = []; if (de.scrollWidth > innerWidth + 1) bad.push('ширина ' + de.scrollWidth); if (de.scrollHeight > innerHeight + 1) bad.push('висота ' + de.scrollHeight); const t = document.getElementById('topbar'); const r = t && t.getBoundingClientRect(); return { w: innerWidth, h: innerHeight, bad, top: r ? [Math.round(r.top), Math.round(r.left), Math.round(r.right)] : null, mobile: mobileMQ.matches }; })()";

async function deep() {
  console.log('\n== Налагоджувальна збірка ==');
  run('cmd', ['/c', path.join(ANDROID, 'gradlew.bat'), 'assembleDebug', '--console=plain', '--no-daemon'], { cwd: ANDROID });
  const apk = path.join(ANDROID, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  run(ADB, ['-s', serial, 'uninstall', PKG], { soft: true });
  adb('install', '-r', apk);
  const rot0 = shell('settings get system accelerometer_rotation').trim(), rot1 = shell('settings get system user_rotation').trim();
  let c;
  try {
    const started = launch();
    console.log('Холодний старт: ' + ((started.match(/TotalTime: (\d+)/) || [])[1] || '?') + ' мс');
    await sleep(1500); shot('01_start');
    c = await attach();
    ok('гра завантажилась', await waitBoot(c));
    await c.ev('(state.settings.muted = true, applyVolumes(true), 1)');                       // звук вимкнений на час перевірки
    await sleep(2500); shot('02_first_run');
    ok('це застосунок, а не сайт', await c.ev('nativeApp()'), await c.ev('location.origin'));
    console.log('     WebView: ' + (await c.ev('navigator.userAgent')).match(/Chrome\/[\d.]+/));
    console.log('     Плагіни: ' + (await c.ev('Object.keys(Capacitor.Plugins).join(", ")')));
    ok('режим бога вимкнений', await c.ev("!DEV_OPEN_BUILD && !SKINS_FREE_BUILD && GOD_HASH === '' && !GOD_OWNER && !window.__debug"));
    ok('реклами нема', await c.ev('window.__ADS === undefined && !Ads.available()'));
    ok('форма відгуку не йде в інтернет', await c.ev("FEEDBACK.url === '' && FEEDBACK.key === ''"));
    ok('посилання на itch приховане', await c.ev('!onItchBuild()'));
    ok('шрифт локальний', await c.ev("document.fonts.load('16px \"Press Start 2P\"').then(f => f.length > 0)"));
    const net = await c.ev("fetch('https://www.google.com/generate_204', { mode: 'no-cors' }).then(() => 'пройшов', () => 'заблокований')");
    ok('запит в інтернет заблокований', net === 'заблокований', net);
    ok('дозволу на інтернет нема', !/android\.permission\.INTERNET/.test(shell('dumpsys package ' + PKG)));
    const size = await c.ev(LAYOUT), safe = await c.ev(SAFE);
    ok('вертикаль: нічого не вилазить', !size.bad.length, JSON.stringify(size));
    console.log('     Безпечні відступи (верх, право, низ, ліво): ' + safe.join(', '));
    ok('верхня панель не під вирізом камери', size.top && size.top[0] >= safe[0], size.top && size.top[0] + ' >= ' + safe[0]);

    // Збереження: той самий ключ, переживає повне закриття
    await c.ev('(state.coins = 777777, saveGame(), 1)');
    ok('ключ збереження незмінний', await c.ev("!!localStorage.getItem('capyThroughTime_save')"));
    c.close(); adb('shell', 'am', 'force-stop', PKG); await sleep(800); launch();
    c = await attach(); await waitBoot(c); await c.ev('(state.settings.muted = true, applyVolumes(true), 1)');
    const coins = await c.ev('state.coins');
    ok('прогрес пережив закриття гри', coins >= 777777, coins);
    await sleep(16000); await c.ev('saveGame()'); await sleep(800);
    const mirror = await c.ev("Capacitor.Plugins.Preferences.get({ key: 'capyThroughTime_save' }).then(r => !!(r && r.value && r.value.length > 50))");
    ok('запасна копія збереження в застосунку', mirror);

    // Звук: розблоковується тапом, засинає у фоні, прокидається при поверненні
    const size2 = await c.ev('[innerWidth, innerHeight, devicePixelRatio]');
    const px = (x, y) => [Math.round(x * size2[2]), Math.round(y * size2[2])];
    await c.ev("(() => { document.querySelectorAll('button').forEach(b => { if (/Пропустити|Skip/.test(b.textContent)) b.click(); }); return 1; })()"); await sleep(1500);
    adb('shell', 'input', 'tap', ...px(size2[0] / 2, size2[1] * 0.45).map(String)); await sleep(1200);
    ok('звук запущений після дотику', await c.ev("audio.ctx && audio.ctx.state === 'running'"), await c.ev('audio.ctx && audio.ctx.state'));
    adb('shell', 'input', 'keyevent', 'KEYCODE_HOME'); await sleep(1500);
    ok('у фоні звук заснув', await c.ev("audio.ctx.state === 'suspended' || audio.ctx.state === 'interrupted'"), await c.ev('audio.ctx.state'));
    launch(); await sleep(1500);
    ok('після повернення звук знову грає', await c.ev("audio.ctx.state === 'running'"), await c.ev('audio.ctx.state'));
    shot('03_after_resume');

    // Кнопка «Назад»
    const back = async () => { adb('shell', 'input', 'keyevent', 'KEYCODE_BACK'); await sleep(700); };
    for (const [name, open, closed] of [
      ['відгук', 'openFeedback()', 'ui.fbModal.hidden'],
      ['звук', 'ui.soundModal.hidden = false', 'ui.soundModal.hidden'],
      ['підтвердження', "askConfirm('t', 't', 'ok', () => {})", 'ui.confirmModal.hidden'],
    ]) { await c.ev('(' + open + ', 1)'); await sleep(300); await back(); ok('«Назад» закриває вікно «' + name + '»', await c.ev(closed) === true && inGame()); }
    await c.ev("(onTabClick('shop'), 1)"); await sleep(700); shot('04_shop');
    const sheet = await c.ev("ui.app.classList.contains('sheet-open')");
    await back();
    ok('«Назад» закриває меню знизу, гра не згортається', !sheet || (await c.ev("!ui.app.classList.contains('sheet-open')") && inGame()), 'меню було: ' + sheet);
    if (!inGame()) { launch(); await sleep(1200); }
    await back(); await sleep(600);
    ok('«Назад» на чистому екрані згортає гру', !inGame(), topActivity());
    launch(); await sleep(1500);
    ok('гра повернулась і живе', await c.ev('state.coins >= 777777'));

    // Обертання
    shell('settings put system accelerometer_rotation 0'); shell('settings put system user_rotation 1'); await sleep(2500);
    const land = await c.ev(LAYOUT), safeL = await c.ev(SAFE);
    ok('горизонталь: екран повернувся', land.w > land.h, land.w + '×' + land.h);
    ok('горизонталь: нічого не вилазить', !land.bad.length, JSON.stringify(land.bad));
    console.log('     Безпечні відступи в горизонталі: ' + safeL.join(', '));
    shot('05_landscape');
    await c.ev("(onTabClick('shop'), 1)"); await sleep(700); shot('06_landscape_shop');
    shell('settings put system user_rotation 0'); await sleep(2000);
    const port = await c.ev(LAYOUT);
    ok('вертикаль після обертання', port.h > port.w && !port.bad.length, port.w + '×' + port.h);
    if (await c.ev("ui.app.classList.contains('sheet-open')")) { await back(); }
    shot('07_portrait_again');

    // Перенесення прогресу з сайту: код зроблено справжньою грою на ПК (Electron)
    const probe = cp.spawnSync(path.join(ROOT, 'desktop', 'node_modules', 'electron', 'dist', 'electron.exe'), [path.join(ROOT, 'tools', 'probe.js'), '(state.coins = 424242, state.shopLevel = 2, makeExportCode())'], { encoding: 'utf8', windowsHide: true, maxBuffer: 1 << 26, env: { ...process.env, ELECTRON_RUN_AS_NODE: undefined } });
    const code = String(probe.stdout || '').trim().split('\n').pop().replace(/^"|"$/g, '');
    ok('код збереження з ПК отримано', code.length > 50, code.length + ' символів');
    await c.ev('(ui.importBox.value = ' + JSON.stringify(code) + ', importSave(), 1)'); await sleep(500);
    ok('гра питає підтвердження перед заміною прогресу', await c.ev('!ui.confirmModal.hidden'));
    await c.ev('(ui.confirmYes.click(), 1)').catch(() => {}); c.close(); await sleep(3500);
    c = await attach(); await waitBoot(c); await c.ev('(state.settings.muted = true, applyVolumes(true), 1)');
    const after = await c.ev('[state.coins, state.shopLevel]');
    ok('прогрес із ПК перенісся', after[0] >= 424242 && after[1] === 2, after.join(', '));

    // Зовнішні програми
    await c.ev('(ui.privacyBtn.click(), 1)'); await sleep(3500);
    const browser = topActivity();
    ok('політика конфіденційності відкрилась у браузері', browser && !browser.startsWith(PKG), browser);
    shot('08_privacy');
    launch(); await sleep(1500);
    ok('повернення з браузера в гру', inGame() && await c.ev('typeof state === "object"'));
    if (argv.includes('--mail')) {
      await c.ev("(openFeedback(), ui.fbText.value = 'Перевірка', sendFeedback(), 1)"); await sleep(3000);
      const mail = topActivity(); ok('відгук відкрив поштову програму', mail && !mail.startsWith(PKG), mail); shot('09_mail');
      launch(); await sleep(1000);
    }
    console.log('Помилки в грі: ' + (c.errors.length ? c.errors.slice(0, 8).join('\n  ') : 'немає'));
    if (c.errors.length) failed++;
  } finally {
    if (c) c.close();
    shell('settings put system user_rotation ' + rot1); shell('settings put system accelerometer_rotation ' + rot0);
  }
}

async function release() {
  console.log('\n== Файл для магазину: ' + path.basename(aabArg) + ' ==');
  const java = javaTool('java'), bt = ['-jar', BUNDLETOOL];
  run(java, [...bt, 'validate', '--bundle=' + aabArg]);
  ok('файл AAB правильний (bundletool validate)', true);
  const man = run(java, [...bt, 'dump', 'manifest', '--bundle=' + aabArg]);
  console.log('     ' + ['package', 'android:versionCode', 'android:versionName', 'android:targetSdkVersion', 'android:minSdkVersion'].map(k => k.replace('android:', '') + '=' + ((man.match(new RegExp(k + '="([^"]+)"')) || [])[1])).join(', '));
  ok('цільова версія Android 36', /android:targetSdkVersion="36"/.test(man));
  ok('немає дозволу на інтернет', !/android\.permission\.INTERNET/.test(man));
  ok('немає рекламного ідентифікатора', !/permission\.AD_ID"(?![^>]*tools:node)/.test(man));
  ok('застосунок не налагоджувальний', !/android:debuggable="true"/.test(man));
  console.log('     Дозволи: ' + ([...man.matchAll(/uses-permission[^>]*android:name="([^"]+)"/g)].map(m => m[1].split('.').pop()).join(', ') || 'немає'));
  const list = run(ADB, ['-s', serial, 'shell', 'getprop ro.product.cpu.abi']).trim();
  const apks = path.join(path.dirname(aabArg), '_device.apks');
  const sign = ['--ks=' + TEST_KEY, '--ks-pass=pass:' + TEST_PASS, '--ks-key-alias=upload', '--key-pass=pass:' + TEST_PASS];
  run(java, [...bt, 'build-apks', '--bundle=' + aabArg, '--output=' + apks, '--overwrite', ...sign]);
  console.log('     Розмір завантаження з Play (мін, макс у байтах): ' + run(java, [...bt, 'get-size', 'total', '--apks=' + apks]).trim().split('\n').pop());
  run(ADB, ['-s', serial, 'uninstall', PKG], { soft: true });
  run(java, [...bt, 'install-apks', '--apks=' + apks, '--device-id=' + serial, '--adb=' + ADB]);
  fs.rmSync(apks, { force: true });
  adb('logcat', '-c');
  const started = launch();
  console.log('Холодний старт: ' + ((started.match(/TotalTime: (\d+)/) || [])[1] || '?') + ' мс, процесор ' + list);
  await sleep(1500); shot('r1_start');
  await sleep(12000); shot('r2_game');
  ok('гра працює', inGame(), topActivity());
  const log = run(ADB, ['-s', serial, 'logcat', '-d', '-s', 'AndroidRuntime:E', 'chromium:E', 'Capacitor:E', 'Capacitor/Console:E'], { soft: true });
  const bad = log.split('\n').filter(l => /FATAL|Uncaught|TypeError|ReferenceError|SyntaxError/.test(l));
  ok('у журналі нема збоїв', !bad.length, bad.slice(0, 5).join(' | ').slice(0, 500));
  adb('shell', 'input', 'keyevent', 'KEYCODE_BACK'); await sleep(1200);
  ok('«Назад» згортає гру без збою', !inGame() && !/FATAL/.test(run(ADB, ['-s', serial, 'logcat', '-d', '-s', 'AndroidRuntime:E'], { soft: true })), topActivity());
  launch(); await sleep(1500); ok('гра повернулась', inGame());
}

(async () => {
  findDevice();
  if (isRelease) await release(); else await deep();
  console.log('\n' + (failed ? 'НЕ ПРОЙДЕНО ПУНКТІВ: ' + failed : 'УСЕ ПРОЙДЕНО'));
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('ПОМИЛКА: ' + e.message); process.exit(1); });
