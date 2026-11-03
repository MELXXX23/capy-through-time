// Ставить інструменти для Android в окрему папку (нічого в систему, змінні середовища не міняє): node setup-tools.js [--emulator]
// Усе лише з офіційних адрес, контрольні суми перевіряються. Видалити все = видалити папку D:\AndroidTools.
// Прийнявши цей крок, користувач приймає ліцензію Android SDK: https://developer.android.com/studio/terms
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const { TOOLS, JDK, SDK, GRADLE_HOME, AVD_HOME, BUNDLETOOL, toolEnv, sdkTool } = require('./tools-paths');
const withEmulator = process.argv.includes('--emulator');
const IMAGE = 'system-images;android-36;google_apis;x86_64';
const dl = path.join(TOOLS, 'downloads');

const hide = { windowsHide: true };
async function fetchJson(u) { const r = await fetch(u, { headers: { 'User-Agent': 'capy-setup' } }); if (!r.ok) throw new Error(u + ': ' + r.status); return r.json(); }
async function download(url, file, algo, sum) {
  if (fs.existsSync(file) && hash(file, algo) === sum) { console.log('вже є: ' + path.basename(file)); return; }
  console.log('качаю: ' + path.basename(file));
  const r = await fetch(url, { redirect: 'follow' }); if (!r.ok) throw new Error(url + ': ' + r.status);
  const tmp = file + '.part', out = fs.createWriteStream(tmp);
  for await (const chunk of r.body) if (!out.write(chunk)) await new Promise(ok => out.once('drain', ok));
  await new Promise(ok => out.end(ok));
  if (sum && hash(tmp, algo) !== sum) { fs.unlinkSync(tmp); throw new Error('контрольна сума не збіглась: ' + path.basename(file)); }
  fs.renameSync(tmp, file);
}
function hash(file, algo) { const h = crypto.createHash(algo); const fd = fs.openSync(file, 'r'), buf = Buffer.alloc(1 << 20); let n; while ((n = fs.readSync(fd, buf)) > 0) h.update(buf.subarray(0, n)); fs.closeSync(fd); return h.digest('hex'); }
function unzip(zip, dir) { fs.mkdirSync(dir, { recursive: true }); cp.execFileSync(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe'), ['-xf', zip, '-C', dir], hide); }   // tar із Windows: він, на відміну від Git-овського, вміє zip
function sdkmanager(args, input) {
  // Лапки навколо кожного аргументу обов'язкові: інакше cmd ріже «platforms;android-36» на крапці з комою і мовчки ставить не все
  const line = '"' + [sdkTool('cmdline-tools/latest/bin/sdkmanager.bat'), ...args].map(a => '"' + a + '"').join(' ') + '"';
  const r = cp.spawnSync('cmd', ['/d', '/s', '/c', line], { env: toolEnv(), input, encoding: 'utf8', maxBuffer: 1 << 28, windowsVerbatimArguments: true, ...hide });
  if (r.status !== 0) throw new Error('sdkmanager ' + args.join(' ') + ': ' + (r.stderr || r.stdout || '').slice(-500));
  return r.stdout;
}

(async () => {
  [TOOLS, dl, GRADLE_HOME, AVD_HOME].forEach(d => fs.mkdirSync(d, { recursive: true }));

  if (!fs.existsSync(path.join(JDK, 'bin', 'java.exe'))) {
    const pkg = (await fetchJson('https://api.adoptium.net/v3/assets/latest/21/hotspot?architecture=x64&image_type=jdk&os=windows&vendor=eclipse'))[0].binary.package;
    const zip = path.join(dl, pkg.name);
    await download(pkg.link, zip, 'sha256', pkg.checksum);
    const tmp = path.join(TOOLS, '_jdk'); fs.rmSync(tmp, { recursive: true, force: true }); unzip(zip, tmp);
    fs.renameSync(path.join(tmp, fs.readdirSync(tmp)[0]), JDK); fs.rmSync(tmp, { recursive: true, force: true });
  }

  if (!fs.existsSync(sdkTool('cmdline-tools/latest/bin/sdkmanager.bat'))) {
    const xml = await (await fetch('https://dl.google.com/android/repository/repository2-3.xml')).text();
    const m = xml.match(/<remotePackage path="cmdline-tools;latest">[\s\S]*?<\/remotePackage>/)[0];
    const a = [...m.matchAll(/<archive>([\s\S]*?)<\/archive>/g)].map(x => x[1]).find(x => /<host-os>windows<\/host-os>/.test(x));
    const name = a.match(/<url>([^<]+)/)[1], sha = a.match(/<checksum[^>]*>([0-9a-f]+)/)[1], zip = path.join(dl, name);
    await download('https://dl.google.com/android/repository/' + name, zip, 'sha1', sha);
    const tmp = path.join(TOOLS, '_cmd'); fs.rmSync(tmp, { recursive: true, force: true }); unzip(zip, tmp);
    fs.mkdirSync(path.join(SDK, 'cmdline-tools'), { recursive: true });
    fs.renameSync(path.join(tmp, 'cmdline-tools'), path.join(SDK, 'cmdline-tools', 'latest')); fs.rmSync(tmp, { recursive: true, force: true });
  }

  sdkmanager(['--licenses'], 'y\n'.repeat(30));
  const pkgs = ['platform-tools', 'platforms;android-36', 'build-tools;36.0.0'].concat(withEmulator ? ['emulator', IMAGE] : []);
  console.log('ставлю: ' + pkgs.join(', '));
  sdkmanager(pkgs);

  if (!fs.existsSync(BUNDLETOOL)) {
    const rel = await fetchJson('https://api.github.com/repos/google/bundletool/releases/latest');
    const asset = rel.assets.find(a => /^bundletool-all-.*\.jar$/.test(a.name));
    const digest = asset.digest && asset.digest.startsWith('sha256:') ? asset.digest.slice(7) : null;
    await download(asset.browser_download_url, BUNDLETOOL, 'sha256', digest);
  }

  if (withEmulator && !fs.existsSync(path.join(AVD_HOME, 'capy.ini'))) {
    const r = cp.spawnSync('cmd', ['/c', sdkTool('cmdline-tools/latest/bin/avdmanager.bat'), 'create', 'avd', '-n', 'capy', '-k', IMAGE, '-d', 'pixel_7', '--force'], { env: toolEnv(), input: 'no\n', encoding: 'utf8', ...hide });
    if (r.status !== 0) throw new Error('avdmanager: ' + (r.stderr || r.stdout || '').slice(-500));
  }
  console.log('ГОТОВО: інструменти в ' + TOOLS);
})().catch(e => { console.error('ПОМИЛКА: ' + e.message); process.exit(1); });
