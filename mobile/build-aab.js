// Збирає AAB для Google Play: node build-aab.js [--test] [--head]
//   без прапорців: справжній ключ (пароль спитає в терміналі або візьме зі змінної CAPY_KEY_PASS);
//   --test: одноразовий ключ лише для перевірки на своєму пристрої, такий файл у Play Console не завантажувати;
//   --head: гра з останнього коміту (коли в src/ зараз хтось працює).
// Результат: previews/play/aab/ (папка не в git). Усі запуски без вікон на столі.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { SDK, KEYSTORE, toolEnv, javaTool } = require('./tools-paths');
const { askHidden } = require('./ask-hidden');
const ROOT = path.resolve(__dirname, '..'), ANDROID = path.join(__dirname, 'android');
const isTest = process.argv.includes('--test'), head = process.argv.includes('--head');

function run(cmd, args, opts) {
  const r = cp.spawnSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', maxBuffer: 1 << 28, windowsHide: true, ...opts });
  if (r.status !== 0) { console.error((r.stdout || '').slice(-3000) + (r.stderr || '').slice(-3000)); throw new Error(path.basename(cmd) + ' ' + args.slice(0, 3).join(' ') + ': код ' + r.status); }
  return r.stdout || '';
}
function testKey() {                                                                          // не секрет: цим ключем нічого не випускаємо
  const { TEST_KEY: file, TEST_PASS: pass } = require('./tools-paths');
  if (!fs.existsSync(file)) run(javaTool('keytool'), ['-genkeypair', '-keystore', file, '-storetype', 'PKCS12', '-alias', 'upload', '-keyalg', 'RSA', '-keysize', '2048', '-validity', '3650', '-dname', 'CN=Test only', '-storepass:env', 'CAPY_KEY_PASS', '-keypass:env', 'CAPY_KEY_PASS'], { env: toolEnv({ CAPY_KEY_PASS: pass }) });
  return { file, pass };
}

(async () => {
  let key;
  if (isTest) key = testKey();
  else {
    if (!fs.existsSync(KEYSTORE)) { console.error('Немає ключа ' + KEYSTORE + '. Спершу: node make-key.js'); process.exit(1); }
    key = { file: KEYSTORE, pass: process.env.CAPY_KEY_PASS || await askHidden('Пароль ключа: ') };
  }
  fs.writeFileSync(path.join(ANDROID, 'local.properties'), 'sdk.dir=' + SDK.replace(/\\/g, '\\\\').replace(/:/g, '\\:') + '\n');
  console.log('1/3 готую гру');
  process.stdout.write(run(process.execPath, [path.join(__dirname, 'sync-web.js')].concat(head ? ['--head'] : [])));
  run(process.execPath, [path.join(__dirname, 'node_modules', '@capacitor', 'cli', 'bin', 'capacitor'), 'sync', 'android'], { cwd: __dirname, env: toolEnv() });
  console.log('2/3 збираю (перший раз Gradle качає бібліотеки, кілька хвилин)');
  run('cmd', ['/c', path.join(ANDROID, 'gradlew.bat'), 'bundleRelease', '--console=plain', '--no-daemon'], { cwd: ANDROID, env: toolEnv({ CAPY_KEYSTORE: key.file, CAPY_KEY_PASS: key.pass }) });
  const src = path.join(ANDROID, 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');
  const gradle = fs.readFileSync(path.join(ANDROID, 'app', 'build.gradle'), 'utf8');
  const code = (gradle.match(/versionCode (\d+)/) || [])[1], name = (gradle.match(/versionName "([^"]+)"/) || [])[1];
  const outDir = path.join(ROOT, 'previews', 'play', 'aab'); fs.mkdirSync(outDir, { recursive: true });
  const dst = path.join(outDir, 'CapyTapMarket-' + name + '-' + code + (isTest ? '-TEST' : '') + '.aab');
  fs.copyFileSync(src, dst);
  console.log('3/3 перевіряю підпис');
  const sig = run(javaTool('jarsigner'), ['-verify', dst], { env: toolEnv() });
  if (!/jar verified/.test(sig)) throw new Error('підпис не пройшов перевірку');
  console.log('ГОТОВО: ' + dst + ' (' + (fs.statSync(dst).size / 1048576).toFixed(1) + ' МБ)' + (isTest ? '\nЦе ТЕСТОВИЙ підпис, у Play Console не завантажувати.' : ''));
})().catch(e => { console.error('ПОМИЛКА: ' + e.message); process.exit(1); });
