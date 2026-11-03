// Створює ключ завантаження для Google Play. Запускає сам власник гри, пароль вводить у терміналі (символи не видно, ніде не зберігається):
//   node make-key.js
// Файл ключа лежить поза git. Наявний ключ скрипт ніколи не перезаписує.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { KEY_DIR, KEYSTORE, toolEnv, javaTool } = require('./tools-paths');
const { askHidden } = require('./ask-hidden');

(async () => {
  if (fs.existsSync(KEYSTORE)) { console.log('Ключ уже є: ' + KEYSTORE + '\nНе перезаписую. Новий ключ потрібен лише за втрати старого, і тоді його заміну просять у Play Console.'); return; }
  console.log('Придумай пароль (щонайменше 8 символів) і запиши в менеджер паролів. Без нього ключем не скористатись.');
  const a = await askHidden('Пароль: '), b = await askHidden('Ще раз: ');
  if (a !== b) { console.error('Паролі різні, нічого не створено.'); process.exit(1); }
  if (a.length < 8) { console.error('Закороткий пароль, нічого не створено.'); process.exit(1); }
  fs.mkdirSync(KEY_DIR, { recursive: true });
  const env = toolEnv({ CAPY_KEY_PASS: a });
  cp.execFileSync(javaTool('keytool'), ['-genkeypair', '-v', '-keystore', KEYSTORE, '-storetype', 'PKCS12', '-alias', 'upload', '-keyalg', 'RSA', '-keysize', '4096', '-validity', '10000',
    '-dname', 'CN=CapyTap Company', '-storepass:env', 'CAPY_KEY_PASS', '-keypass:env', 'CAPY_KEY_PASS'], { env, stdio: ['ignore', 'ignore', 'ignore'], windowsHide: true });
  cp.execFileSync(javaTool('keytool'), ['-export', '-rfc', '-keystore', KEYSTORE, '-alias', 'upload', '-file', path.join(KEY_DIR, 'upload_certificate.pem'), '-storepass:env', 'CAPY_KEY_PASS'], { env, stdio: ['ignore', 'ignore', 'ignore'], windowsHide: true });
  console.log('\nГотово: ' + KEYSTORE);
  console.log('Зроби копію цього файла й пароля в надійне місце (флешка, менеджер паролів). У git і в листування не клади.');
})().catch(e => { console.error('ПОМИЛКА: ' + e.message); process.exit(1); });
