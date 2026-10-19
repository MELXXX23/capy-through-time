// Збирає переклади зі шматків <папка>/<мова>_NN.tsv у частину src/279_z_lang_<мова>.js і перевіряє їх.
// Запуск: node tools/lang_merge.js <dump.json> <папка> <мова>
// Перевіряє: наявність кожного id, однакові {0}-підстановки, HTML-теги й емодзі, як в англійській. Розбіжності друкує (текст усе одно береться).
const fs = require('fs'), path = require('path');
const [dumpF, dir, lang] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(dumpF, 'utf8'));
const ids = JSON.parse(fs.readFileSync(path.join(dir, 'ids.json'), 'utf8'));
const unesc = s => s.replace(/\\(\\|n|t)/g, (_, c) => (c === 'n' ? '\n' : c === 't' ? '\t' : '\\'));
const map = {};
fs.readdirSync(dir).filter(f => f.startsWith(lang + '_') && f.endsWith('.tsv')).sort().forEach(f => {
  fs.readFileSync(path.join(dir, f), 'utf8').split('\n').forEach(line => {
    if (!line.trim()) return;
    const i = line.indexOf('\t'); if (i < 0) { console.log('! рядок без табуляції у ' + f + ': ' + line.slice(0, 60)); return; }
    map[line.slice(0, i)] = unesc(line.slice(i + 1));
  });
});
const en = {};
Object.keys(d.en).forEach(k => { en['T:' + k] = d.en[k]; });
function walk(sec, v, p) {
  if (typeof v === 'string') { en[sec + ':' + p] = v; return; }
  if (Array.isArray(v)) v.forEach((x, i) => walk(sec, x, p + '/' + i));
  else if (v && typeof v === 'object') Object.keys(v).forEach(k => walk(sec, v[k], p + '/' + k));
}
['skin', 'tour', 'cut', 'about', 'guide', 'soon', 'sec'].forEach(sec => walk(sec, d[sec].en, ''));
const toks = s => ({
  ph: (s.match(/\{\d+\}/g) || []).sort().join(','),
  tag: (s.match(/<[^>]+>/g) || []).join(''),
  em: (s.match(/\p{Extended_Pictographic}/gu) || []).sort().join('')
});
let missing = 0, bad = 0, same = 0;
ids.forEach(id => {
  const t = map[id];
  if (t === undefined) { missing++; if (missing <= 15) console.log('нема: ' + id); return; }
  const a = toks(en[id]), b = toks(t);
  ['ph', 'tag', 'em'].forEach(k => { if (a[k] !== b[k]) { bad++; if (bad <= 40) console.log('розбіжність ' + k + ' у ' + id + ': ' + en[id].slice(0, 70) + ' → ' + t.slice(0, 70)); } });
  if (t === en[id] && en[id].length > 30) same++;
  if (/[Ѐ-ӿ]/.test(t)) { bad++; console.log('кирилиця у ' + id + ': ' + t.slice(0, 60)); }
});
const extra = Object.keys(map).filter(k => !(k in en)).length;
console.log(lang + ': id ' + ids.length + ', нема ' + missing + ', розбіжностей ' + bad + ', зайвих ' + extra + ', без перекладу (довгі) ' + same);
const pack = { tr: {} };
['skin', 'tour', 'cut', 'about', 'guide', 'soon', 'sec'].forEach(sec => { pack[sec] = JSON.parse(JSON.stringify(d[sec].en)); });
function fill(sec, v, p, set) {
  if (typeof v === 'string') { const t = map[sec + ':' + p]; if (t !== undefined) set(t); return; }
  if (Array.isArray(v)) v.forEach((x, i) => fill(sec, x, p + '/' + i, t => { v[i] = t; }));
  else if (v && typeof v === 'object') Object.keys(v).forEach(k => fill(sec, v[k], p + '/' + k, t => { v[k] = t; }));
}
['skin', 'tour', 'cut', 'about', 'guide', 'soon', 'sec'].forEach(sec => fill(sec, pack[sec], '', () => {}));
Object.keys(d.en).forEach(k => { const t = map['T:' + k]; if (t !== undefined) pack.tr[k] = t; });
let out = '//#part 279_z_lang_' + lang + '.js\n// Пакет мови «' + lang + '» (зібрано tools/lang_merge.js; правити тут можна, але шматки в store/lang/ — джерело).\ninstallLang(' + JSON.stringify(lang) + ', {\n  tr: {\n';
out += Object.keys(pack.tr).map(k => '    ' + JSON.stringify(k) + ': ' + JSON.stringify(pack.tr[k])).join(',\n') + '\n  },\n';
out += ['skin', 'tour', 'cut', 'about', 'guide', 'soon', 'sec'].map(sec => '  ' + sec + ': ' + JSON.stringify(pack[sec])).join(',\n') + '\n});\n';
fs.writeFileSync(path.join(__dirname, '..', 'src', '279_z_lang_' + lang + '.js'), out);
console.log('записано src/279_z_lang_' + lang + '.js (' + Math.round(out.length / 1024) + ' КБ)');
