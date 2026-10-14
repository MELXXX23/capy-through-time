// Лишає в PROGRESS.md лише останні N пунктів (за замовчуванням 4), старі дописує в archive/PROGRESS_71+.md.
// Запуск: node tools/progress_rotate.js [N]
const fs = require('fs');
const keep = +(process.argv[2] || 4);
const p = fs.readFileSync('PROGRESS.md', 'utf8').replace(/\r/g, '');
const idx = []; const re = /^## \d+[а-я]?\. /gm; let m;
while ((m = re.exec(p))) idx.push(m.index);
if (idx.length <= keep) { console.log('Пунктів ' + idx.length + ' — ротація не потрібна'); process.exit(0); }
const head = p.slice(0, idx[0]), cut = idx[idx.length - keep];
const moved = p.slice(idx[0], cut), rest = p.slice(cut);
const arc = 'archive/PROGRESS_71+.md';
const old = fs.existsSync(arc) ? fs.readFileSync(arc, 'utf8') : '# PROGRESS (архів): пункти 71 і далі\n\n';
fs.writeFileSync(arc, old.trimEnd() + '\n\n' + moved.trim() + '\n');
fs.writeFileSync('PROGRESS.md', head + rest);
console.log('Перенесено в ' + arc + ': ' + (idx.length - keep) + ' пунктів; у PROGRESS.md лишилось ' + keep);
