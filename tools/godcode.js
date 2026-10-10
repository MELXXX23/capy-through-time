// Видає код режиму бога для телефона/сайту: node tools/godcode.js
// Пароль лежить у backups/god_secret.txt (поза git). У грі (src/100_config.js) зберігається лише його SHA-256.
// Код вставляється в Налаштування → поле імпорту прогресу → «Завантажити»: GOD:<пароль>. GOD:OFF — вимкнути.
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const secretFile = path.join(ROOT, 'backups', 'god_secret.txt');
fs.mkdirSync(path.dirname(secretFile), { recursive: true });
let secret = fs.existsSync(secretFile) ? fs.readFileSync(secretFile, 'utf8').trim() : '';
if (!secret) { secret = crypto.randomBytes(15).toString('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, 20); fs.writeFileSync(secretFile, secret, 'utf8'); }
const hash = crypto.createHash('sha256').update('capy-god|' + secret, 'utf8').digest('hex');
const cfg = path.join(ROOT, 'src', '100_config.js');
let src = fs.readFileSync(cfg, 'utf8');
const m = /const GOD_HASH = '([0-9a-f_A-Z]*)';/.exec(src);
if (!m) { console.error('GOD_HASH не знайдено в src/100_config.js'); process.exit(1); }
if (m[1] !== hash) { src = src.replace(m[0], "const GOD_HASH = '" + hash + "';"); fs.writeFileSync(cfg, src, 'utf8'); console.log('Оновлено хеш у src/100_config.js — запусти: node tools/build.js'); }
const code = 'GOD:' + secret;
fs.writeFileSync(path.join(ROOT, 'backups', 'GOD_CODE.txt'), code, 'utf8');
try { execSync('clip', { input: code }); console.log('Код скопійовано в буфер обміну.'); } catch (e) { /* не страшно */ }
console.log('Код режиму бога:\n' + code);
