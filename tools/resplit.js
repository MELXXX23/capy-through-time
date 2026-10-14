// Ріже велику частину src/ на менші, НЕ змінюючи текст гри. Запуск:
//   node tools/resplit.js <файл-частина> <кількість-частин> [--at "<regexp рядка-розрізу>"] [--dry]
// Місця розрізу: початки верхніх операторів (через TypeScript-парсер) або, якщо задано --at, рядки за регулярним виразом.
// Нові імена: NNN_x.js -> NNN_a_x.js, NNN_b_x.js…; NNN_a_x.js -> NNN_a1_x.js, NNN_a2_x.js… (порядок імен зберігається).
// Після розрізу: node tools/build.js && node tools/check_parts.js && node tools/mkmap.js
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), dir = path.join(ROOT, 'src');
const ts = require(path.join(ROOT, 'desktop/node_modules/typescript'));
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const atIdx = args.indexOf('--at');
const at = atIdx >= 0 ? new RegExp(args[atIdx + 1]) : null;
const pos = args.filter((a, i) => !a.startsWith('--') && !(atIdx >= 0 && i === atIdx + 1));
const name = path.basename(pos[0] || ''), n = parseInt(pos[1], 10);
if (!/\.js$/.test(name) || !(n >= 2)) { console.error('Використання: node tools/resplit.js <частина.js> <N≥2> [--at "regexp"] [--dry]'); process.exit(1); }
const src = fs.readFileSync(path.join(dir, name), 'utf8');
const lines = src.split('\n');
if (!/^\/\/#part /.test(lines[0])) { console.error('Перший рядок має бути маркером //#part'); process.exit(1); }
const body = lines.slice(1);                       // без маркера
const lineStart = []; { let o = 0; body.forEach(l => { lineStart.push(o); o += l.length + 1; }); }
const text = body.join('\n');
const lineOf = off => { let lo = 0, hi = lineStart.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (lineStart[m] <= off) lo = m; else hi = m - 1; } return lo; };
const cand = new Set();
if (at) body.forEach((l, i) => { if (i > 0 && at.test(l)) cand.add(i); });
else {
  const sf = ts.createSourceFile(name, text, ts.ScriptTarget.ES2020, true, ts.ScriptKind.JS);
  // розріз = перший непорожній рядок ПІСЛЯ кінця попереднього оператора (разом із його банер-коментарем)
  sf.statements.forEach((st, i) => { if (i > 0) { let j = lineOf(st.getFullStart()) + 1; while (j < body.length && body[j].trim() === '') j++; cand.add(j); } });
}
const total = text.length, cuts = [];
for (let k = 1; k < n; k++) {
  const ideal = total * k / n; let best = -1, bd = Infinity;
  cand.forEach(i => { const d = Math.abs(lineStart[i] - ideal); if (d < bd && !cuts.includes(i)) { bd = d; best = i; } });
  if (best < 0) { console.error('Немає місць розрізу'); process.exit(1); }
  cuts.push(best);
}
cuts.sort((a, b) => a - b);
const stem = name.replace(/\.js$/, ''), m = /^(\d+)_([a-z])_(.+)$/.exec(stem), m2 = /^(\d+)_(.+)$/.exec(stem);
const mk = k => m ? m[1] + '_' + m[2] + (k + 1) + '_' + m[3] : (m2[1] + '_' + 'abcdefghij'[k] + '_' + m2[2]);
const edges = [0, ...cuts, body.length], out = [];
for (let k = 0; k < edges.length - 1; k++) {
  const fn = mk(k) + '.js';
  const chunk = body.slice(edges[k], edges[k + 1]).join('\n') + (k + 1 < edges.length - 1 ? '\n' : '');
  out.push({ fn, data: '//#part ' + fn + '\n' + chunk });
}
out.forEach(o => console.log(o.fn, Math.round(o.data.length / 1024) + ' КБ', 'рядків ' + o.data.split('\n').length));
if (dry) { console.log('--dry: нічого не записано'); process.exit(0); }
out.forEach(o => fs.writeFileSync(path.join(dir, o.fn), o.data, 'utf8'));
if (!out.some(o => o.fn === name)) fs.unlinkSync(path.join(dir, name));
console.log('Готово. Далі: node tools/build.js && node tools/check_parts.js && node tools/mkmap.js');
