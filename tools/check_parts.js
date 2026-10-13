// Перевірка розбиття на частини: node tools/check_parts.js [<еталонний game.html>]
// 1) без рядків-маркерів #part зібраний game.html такий самий, як еталон (за замовчуванням — з git HEAD);
// 2) кожен маркер у JS — справжній рядковий коментар (не в рядку, шаблоні, регулярному виразі чи блочному коментарі).
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const ts = require(path.join(ROOT, 'desktop/node_modules/typescript'));
const MARK = /^(<!--#part [^\n]*-->|\/\/#part [^\n]*|\/\*#part [^\n]*\*\/)$/;
const strip = s => s.split('\n').filter(l => !MARK.test(l)).join('\n');
const now = fs.readFileSync(path.join(ROOT, 'game.html'), 'utf8');
const ref = process.argv[2] ? fs.readFileSync(process.argv[2], 'utf8') : cp.execFileSync('git', ['show', 'HEAD:game.html'], { cwd: ROOT, maxBuffer: 1 << 28 }).toString('utf8');
let bad = 0;
if (strip(now) === strip(ref)) console.log('OK  текст гри без маркерів збігається з еталоном (' + Math.round(strip(now).length / 1024) + ' КБ)');
else { console.log('ПОМИЛКА  текст гри ВІДРІЗНЯЄТЬСЯ від еталона'); bad++; }
// JS-частина: від <script>, за яким іде 'use strict', до останнього </script>
const a = now.indexOf("<script>\n'use strict';"), b = now.lastIndexOf('</script>');
if (a < 0 || b < a) { console.log('ПОМИЛКА  не знайдено головний <script>'); process.exit(1); }
const js = now.slice(a + 8, b), sf = ts.createSourceFile('game.js', js, ts.ScriptTarget.ES2020, true, ts.ScriptKind.JS);
if (sf.parseDiagnostics.length) { console.log('ПОМИЛКА  синтаксис JS: ' + sf.parseDiagnostics.length + ' помилок'); bad++; }
const comments = new Set(); const seen = new Set();
const grab = (pos) => { if (seen.has(pos)) return; seen.add(pos); (ts.getLeadingCommentRanges(js, pos) || []).forEach(r => comments.add(r.pos + ':' + r.kind)); };
(function walk(n) { grab(n.getFullStart()); ts.forEachChild(n, walk); })(sf);
grab(sf.endOfFileToken.getFullStart());
let markers = 0, off = 0;
js.split('\n').forEach(l => {
  if (/^\/\/#part /.test(l)) { markers++; if (!comments.has(off + ':' + ts.SyntaxKind.SingleLineCommentTrivia)) { console.log('ПОМИЛКА  маркер усередині рядка/шаблону/коментаря: ' + l); bad++; } }
  off += l.length + 1;
});
console.log((bad ? 'ПОМИЛКА' : 'OK ') + ' маркерів у JS: ' + markers + (bad ? ', проблем: ' + bad : ', усі стоять у коментарях'));
process.exit(bad ? 1 : 0);
