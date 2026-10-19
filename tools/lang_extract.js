// Витягує англійські тексти гри (з dump.json) у шматки для перекладу: <папка>/src_NN.tsv (id<TAB>текст), порядок — у ids.json.
// Запуск: node tools/lang_extract.js <dump.json> <папка> [розмір шматка, символів]
// dump.json робить tools/lang_dump.js із запущеної гри (translations.en, SKIN_LINES, TOUR_TXT, CUT_TXT, NEWS_ABOUT, NP_GUIDE, NP_SOON, NP_SEC).
// У TSV: \\ = зворотний слеш, \n = новий рядок, \t = табуляція.
const fs = require('fs'), path = require('path');
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), out = process.argv[3], SZ = +(process.argv[4] || 9000);
fs.mkdirSync(out, { recursive: true });
const esc = s => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
const need = s => typeof s === 'string' && /[A-Za-z]{3}/.test(s.replace(/<[^>]+>/g, '').replace(/\{\d+\}/g, ''));
const items = [];
Object.keys(d.en).forEach(k => { if (need(d.en[k])) items.push(['T:' + k, d.en[k]]); });
function walk(sec, v, p) {
  if (typeof v === 'string') { if (need(v)) items.push([sec + ':' + p, v]); return; }
  if (Array.isArray(v)) v.forEach((x, i) => walk(sec, x, p + '/' + i));
  else if (v && typeof v === 'object') Object.keys(v).forEach(k => walk(sec, v[k], p + '/' + k));
}
['skin', 'tour', 'cut', 'about', 'guide', 'soon', 'sec'].forEach(sec => walk(sec, d[sec].en, ''));
fs.writeFileSync(path.join(out, 'ids.json'), JSON.stringify(items.map(x => x[0])));
let n = 0, cur = [], len = 0;
const flush = () => { if (!cur.length) return; fs.writeFileSync(path.join(out, 'src_' + String(n).padStart(2, '0') + '.tsv'), cur.join('\n') + '\n'); n++; cur = []; len = 0; };
items.forEach(([id, v]) => { const line = id + '\t' + esc(v); if (len + line.length > SZ && cur.length) flush(); cur.push(line); len += line.length; });
flush();
console.log('елементів', items.length, 'шматків', n);
