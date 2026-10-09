// Розкладає game.html назад по частинах src/ за рядками-маркерами «#part». Запуск: node tools/split.js
// Потрібен, коли game.html правили напряму (старі скрипти-латки previews/*/lib.js викликають його самі).
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const dir = path.join(ROOT, 'src');
const text = fs.readFileSync(path.join(ROOT, 'game.html'), 'utf8');
const lines = text.split('\n');
const re = /^(?:<!--#part (\S+?)-->|\/\/#part (\S+)|\/\*#part (\S+?)\*\/)$/;
const marks = [];
lines.forEach((l, i) => { const m = re.exec(l); if (m) marks.push({ at: i, name: m[1] || m[2] || m[3] }); });
if (!marks.length) { console.error('У game.html немає маркерів #part — нічого розкладати'); process.exit(1); }
if (new Set(marks.map(m => m.name)).size !== marks.length) { console.error('Дублікати імен частин: перевір маркери'); process.exit(1); }
if (marks[0].at !== 0) { console.error('Перед першим маркером є текст (рядок 1..' + marks[0].at + '): постав маркер на початок'); process.exit(1); }
let changed = 0, keep = new Set();
marks.forEach((m, i) => {
  const end = i + 1 < marks.length ? marks[i + 1].at : lines.length;
  const body = lines.slice(m.at, end).join('\n') + (i + 1 < marks.length ? '\n' : '');
  const f = path.join(dir, m.name); keep.add(m.name);
  if (!fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== body) { fs.writeFileSync(f, body, 'utf8'); changed++; }
});
fs.readdirSync(dir).filter(f => /^\d+_.+\.(html|css|js)$/.test(f) && !keep.has(f)).forEach(f => { fs.unlinkSync(path.join(dir, f)); console.log('видалено частину, якої нема в game.html: ' + f); changed++; });
console.log('розкладено: ' + marks.length + ' частин, змінено файлів: ' + changed);
