// Збирає game.html з частин у src/ (за порядком імен файлів). Запуск: node tools/build.js
// Частини розділені рядками-маркерами «#part». Читай src/README.md.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const dir = path.join(ROOT, 'src');
const files = fs.readdirSync(dir).filter(f => /^\d+_.+\.(html|css|js)$/.test(f)).sort();
if (!files.length) { console.error('src/ порожня'); process.exit(1); }
const out = files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('');
const dst = path.join(ROOT, 'game.html');
const old = fs.existsSync(dst) ? fs.readFileSync(dst, 'utf8') : '';
if (old === out) { console.log('game.html вже актуальний (' + files.length + ' частин)'); }
else { fs.writeFileSync(dst, out, 'utf8'); console.log('game.html зібрано з ' + files.length + ' частин (' + Math.round(out.length / 1024) + ' КБ)'); }
// Перевірка синтаксису: зламаний скрипт = порожній екран у гравців. Кожен <script> компілюємо (без запуску); помилка — код виходу 1.
{
  const vm = require('vm'), re = /<script([^>]*)>([\s\S]*?)<\/script>/g; let m, bad = 0;
  while ((m = re.exec(out))) {
    if (/src=|type="(?!text\/javascript)/.test(m[1])) continue;
    try { new vm.Script(m[2], { filename: 'game.html' }); }
    catch (e) { bad++; console.error('СИНТАКСИС: ' + e.message + ' (скрипт від рядка ' + out.slice(0, m.index).split('\n').length + ' у game.html)'); }
  }
  if (bad) process.exit(1);
}
