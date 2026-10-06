// Готує гру для програми: бере ../game.html (його НЕ змінює), робить копію в app/game.html
// і замінює підключення шрифту з інтернету на локальний файл app/fonts/PressStart2P-Regular.ttf.
// Запускається автоматично командами npm start та npm run dist.
'use strict';
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'game.html');
const dstDir = path.join(__dirname, 'app');
const dst = path.join(dstDir, 'game.html');
const fontFile = path.join(dstDir, 'fonts', 'PressStart2P-Regular.ttf');

if (!fs.existsSync(src)) { console.error('Не знайдено ' + src); process.exit(1); }
if (!fs.existsSync(fontFile)) { console.error('Немає шрифту ' + fontFile + ' — гра без нього виглядатиме інакше без інтернету.'); process.exit(1); }

let html = fs.readFileSync(src, 'utf8');

// прибираємо підключення шрифтів Google (потрібен інтернет)
html = html.replace(/<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, '');

// вбудовуємо локальний шрифт
const fontFace =
  "<style>@font-face{font-family:'Press Start 2P';src:url('fonts/PressStart2P-Regular.ttf') format('truetype');" +
  'font-weight:400;font-style:normal;font-display:block}</style>';
html = html.replace('</title>', '</title>\n' + fontFace);

if (/googleapis|gstatic/.test(html)) console.warn('Увага: у game.html лишилися посилання на Google Fonts.');

// РЕЖИМ БОГА — лише для версії на ПК (exe та npm start): усі епохи й сезони відкриті, усі скіни безкоштовні, панель налагодження.
// На сайт (docs/index.html) і в телефонний сервер він НЕ потрапляє: serve.js ставить CAPY_NOGOD=1.
if (process.env.CAPY_NOGOD !== '1') {
  const before = html;
  html = html.replace('const DEV_OPEN_ALL = false;', 'const DEV_OPEN_ALL = true;').replace('const SKINS_FREE = false;', 'const SKINS_FREE = true;');
  html = html.replace('<body>', '<body>\n<script>window.__debug = true;</script>');
  console.log(html !== before ? 'Режим бога ввімкнено (лише для ПК).' : 'Увага: режим бога не вставився — перевір назви прапорців у game.html.');
}
fs.mkdirSync(dstDir, { recursive: true });
fs.writeFileSync(dst, html, 'utf8');
console.log('Готово: app/game.html оновлено (' + Math.round(html.length / 1024) + ' КБ).');
