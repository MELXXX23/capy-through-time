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

fs.mkdirSync(dstDir, { recursive: true });
fs.writeFileSync(dst, html, 'utf8');
console.log('Готово: app/game.html оновлено (' + Math.round(html.length / 1024) + ' КБ).');
