// Маленький сервер для телефона: роздає гру по домашньому Wi-Fi. Без жодних додаткових бібліотек.
// Запуск: двічі клікни phone-server.bat. Закрий чорне вікно — сервер вимкнеться.
'use strict';
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

// спершу оновлюємо копію гри (з локальним шрифтом, щоб усе працювало без Google)
try { execFileSync(process.execPath, [path.join(__dirname, 'prepare.js')], { stdio: 'inherit' }); } catch (e) { /* якщо не вийшло — роздаємо те, що є */ }

const ROOT = path.join(__dirname, 'app');
const PORT = 8080;
const TYPES = { '.html': 'text/html; charset=utf-8', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.png': 'image/png', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent((req.url || '/').split('?')[0]);
  if (rel === '/' || rel === '') rel = '/game.html';
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
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
