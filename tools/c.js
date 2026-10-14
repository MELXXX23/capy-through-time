// Дешевий навігатор по коду гри (замість читання великих частин src/ і game.html). Запуск: node tools/c.js <команда> ...
//   find <regexp> [-f частина] [-n 30]  — рядки з збігом: частина:рядок: перші 150 символів (довгі рядки обрізані)
//   fn <ім'я> [-l 120]                  — вивести функцію/const/метод повністю (до -l рядків; довгі рядки обрізані до 200 символів)
//   outline <частина>                   — верхні оголошення частини з номерами рядків і розмірами (для IIFE — вкладені на 1 рівень)
//   use <ім'я>                          — у яких частинах і скільки разів зустрічається слово
//   lines <частина> <від> [до]          — показати рядки (обрізані до 200 символів), нумерація як у файлі
// Усі номери рядків — у файлах src/ (саме їх правити, потім node tools/build.js).
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), dir = path.join(ROOT, 'src');
const files = fs.readdirSync(dir).filter(f => /^\d+_.+\.(html|css|js)$/.test(f)).sort();
const [cmd, ...rest] = process.argv.slice(2);
const opt = (k, d) => { const i = rest.indexOf(k); if (i < 0) return d; const v = rest[i + 1]; rest.splice(i, 2); return v; };
const cut = (s, n) => (s.length > n ? s.slice(0, n) + ' …[+' + (s.length - n) + ']' : s);
const read = f => fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r/g, '');
const partOf = q => files.filter(f => f.includes(q));
const need = (c, msg) => { if (!c) { console.error(msg); process.exit(1); } };
const getTs = () => require(path.join(ROOT, 'desktop/node_modules/typescript'));

if (cmd === 'find') {
  const f = opt('-f', ''), n = +opt('-n', 30); need(rest[0], 'find <regexp>');
  const re = new RegExp(rest[0]); let k = 0;
  for (const p of files.filter(x => x.includes(f))) {
    const L = read(p).split('\n');
    for (let i = 0; i < L.length; i++) if (re.test(L[i])) { if (k++ < n) console.log(p + ':' + (i + 1) + ': ' + cut(L[i].trim(), 150)); }
  }
  if (k > n) console.log('… ще ' + (k - n) + ' збігів (звузь: -f частина, або точніший regexp)');
  if (!k) console.log('нічого не знайдено');
} else if (cmd === 'fn') {
  const maxL = +opt('-l', 120); const name = rest[0]; need(name, 'fn <ім\'я>');
  const ts = getTs(); const hits = [];
  for (const p of files.filter(x => x.endsWith('.js'))) {
    const s = read(p); if (!s.includes(name)) continue;
    const sf = ts.createSourceFile(p, s, ts.ScriptTarget.ES2020, true, ts.ScriptKind.JS);
    (function walk(nd) {
      let nm = null, target = nd;
      if ((ts.isFunctionDeclaration(nd) || ts.isClassDeclaration(nd)) && nd.name) nm = nd.name.text;
      else if (ts.isVariableDeclaration(nd) && ts.isIdentifier(nd.name)) { nm = nd.name.text; target = ts.isVariableDeclarationList(nd.parent) && ts.isVariableStatement(nd.parent.parent) && nd.parent.declarations.length === 1 ? nd.parent.parent : nd; }
      else if ((ts.isMethodDeclaration(nd) || ts.isPropertyAssignment(nd)) && nd.name && (ts.isIdentifier(nd.name) || ts.isStringLiteral(nd.name))) nm = nd.name.text;
      if (nm === name) {
        const a = sf.getLineAndCharacterOfPosition(target.getStart()).line, b = sf.getLineAndCharacterOfPosition(target.end).line;
        hits.push({ p, a: a + 1, b: b + 1, text: s.split('\n').slice(a, b + 1) });
      }
      ts.forEachChild(nd, walk);
    })(sf);
  }
  if (!hits.length) { console.log('не знайдено оголошення «' + name + '» (спробуй: node tools/c.js find "' + name + '")'); process.exit(0); }
  hits.slice(0, 3).forEach((h, i) => {
    console.log('=== ' + h.p + ':' + h.a + '-' + h.b + ' (' + (h.b - h.a + 1) + ' рядків)');
    if (i === 0) {
      h.text.slice(0, maxL).forEach((l, k) => console.log((h.a + k) + ': ' + cut(l, 200)));
      if (h.text.length > maxL) console.log('… ще ' + (h.text.length - maxL) + ' рядків (-l ' + h.text.length + ' або node tools/c.js lines ' + h.p + ' ' + (h.a + maxL) + ')');
    }
  });
  if (hits.length > 3) console.log('… ще ' + (hits.length - 3) + ' збігів');
} else if (cmd === 'outline') {
  need(rest[0], 'outline <частина>'); const ps = partOf(rest[0]).filter(x => x.endsWith('.js'));
  need(ps.length, 'частину не знайдено');
  const ts = getTs();
  ps.forEach(p => {
    const s = read(p), sf = ts.createSourceFile(p, s, ts.ScriptTarget.ES2020, true, ts.ScriptKind.JS);
    console.log('# ' + p + ' (' + Math.round(s.length / 1024) + ' КБ, ' + s.split('\n').length + ' рядків)');
    const line = nd => sf.getLineAndCharacterOfPosition(nd.getStart()).line + 1;
    const lab = nd => {
      if (ts.isFunctionDeclaration(nd)) return 'function ' + (nd.name ? nd.name.text : '?');
      if (ts.isClassDeclaration(nd)) return 'class ' + (nd.name ? nd.name.text : '?');
      if (ts.isVariableStatement(nd)) return nd.declarationList.declarations.map(d => ts.isIdentifier(d.name) ? d.name.text : '{…}').join(', ');
      return null;
    };
    const emit = (nd, ind) => {
      const l = lab(nd); const size = sf.getLineAndCharacterOfPosition(nd.end).line + 1 - line(nd) + 1;
      if (l) console.log(ind + 'L' + line(nd) + ' ' + l + ' (' + size + ' р.)');
      else if (ts.isExpressionStatement(nd)) {
        let e = nd.expression; while (ts.isParenthesizedExpression(e)) e = e.expression;
        if (ts.isCallExpression(e) && (ts.isFunctionExpression(e.expression) || ts.isArrowFunction(e.expression) || ts.isParenthesizedExpression(e.expression))) {
          console.log(ind + 'L' + line(nd) + ' (IIFE, ' + size + ' р.)');
          let fe = e.expression; while (ts.isParenthesizedExpression(fe)) fe = fe.expression;
          if (fe.body && fe.body.statements && ind === '') fe.body.statements.forEach(c => { const cl = lab(c); if (cl) console.log('  L' + line(c) + ' ' + cl + ' (' + (sf.getLineAndCharacterOfPosition(c.end).line + 1 - line(c) + 1) + ' р.)'); });
        } else console.log(ind + 'L' + line(nd) + ' ' + cut(s.slice(nd.getStart(), nd.end).split('\n')[0], 90));
      }
    };
    sf.statements.forEach(st => emit(st, ''));
  });
} else if (cmd === 'use') {
  need(rest[0], 'use <ім\'я>'); const re = new RegExp('\\b' + rest[0].replace(/[$]/g, '\\$') + '\\b', 'g'); let tot = 0;
  files.forEach(p => { const m = read(p).match(re); if (m) { tot += m.length; console.log(p + ': ' + m.length); } });
  console.log('разом: ' + tot);
} else if (cmd === 'lines') {
  need(rest[0] && rest[1], 'lines <частина> <від> [до]');
  const ps = partOf(rest[0]); need(ps.length === 1, ps.length ? 'кілька частин: ' + ps.join(', ') : 'частину не знайдено');
  const L = read(ps[0]).split('\n'), a = +rest[1], b = +(rest[2] || a + 40);
  for (let i = a; i <= Math.min(b, L.length); i++) console.log(i + ': ' + cut(L[i - 1], 200));
} else {
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 9).join('\n'));
}
