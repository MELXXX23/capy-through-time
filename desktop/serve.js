// Маленький сервер для телефона: роздає гру по домашньому Wi-Fi. Без жодних додаткових бібліотек.
// Запуск: двічі клікни phone-server.bat. Закрий чорне вікно — сервер вимкнеться.
// Живе оновлення: якщо відкрити сторінку з ?live=1, вона сама перезавантажується щойно змінюється game.html (для перегляду правок у вкладці збоку).
'use strict';
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const PREPARE = path.join(__dirname, 'prepare.js');
function prepare(quiet) {      // оновлюємо копію гри (з локальним шрифтом, щоб усе працювало без Google)
  try { execFileSync(process.execPath, [PREPARE], { stdio: quiet ? 'ignore' : 'inherit' }); return true; } catch (e) { return false; }
}
prepare(false);

const ROOT = path.join(__dirname, 'app');
const PORT = +process.env.PORT || 8080;   // для телефона за замовчуванням 8080; перегляд у вкладці може задати інший порт через змінну PORT
const TYPES = { '.html': 'text/html; charset=utf-8', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.png': 'image/png', '.json': 'application/json' };

// стежимо за game.html: щойно файл змінився — оновлюємо копію й піднімаємо «версію», за якою сторінка вирішує перезавантажитись
let version = String(Date.now()), timer = null;
const SRC = path.join(__dirname, '..', 'game.html');
try {
  fs.watch(SRC, () => { clearTimeout(timer); timer = setTimeout(() => { if (prepare(true)) version = String(Date.now()); }, 300); });
} catch (e) { /* без живого оновлення теж працює */ }
const LIVE_SNIPPET = '<script>(function(){if(!/[?&]live=1/.test(location.search))return;var v=null;setInterval(function(){fetch("/__version",{cache:"no-store"}).then(function(r){return r.text();}).then(function(t){if(v===null)v=t;else if(t!==v)location.reload();}).catch(function(){});},700);})();</script>';

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent((req.url || '/').split('?')[0]);
  if (rel === '/__version') { res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }); res.end(version); return; }
  if (rel === '/' || rel === '') rel = '/game.html';
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    if (path.extname(file) === '.html') data = Buffer.from(data.toString('utf8').replace('</body>', LIVE_SNIPPET + '</body>'), 'utf8');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = [];
  Object.values(os.networkInterfaces()).forEach(list => (list || []).forEach(i => {
    if (i.family === 'IPv4' && !i.internal) ips.push(i.address);
  }));
  console.log('');
  console.log('  Гра запущена! На телефоні (він має бути в ТІЙ САМІЙ мережі Wi-Fi) відкрий у браузері адресу:');
  console.log('');
  (ips.length ? ips : ['(не вдалося визначити IP)']).forEach(ip => console.log('      http://' + ip + ':' + PORT));
  console.log('');
  console.log('  Не закривай це вікно, поки граєш. Щоб вимкнути — закрий вікно.');
});
