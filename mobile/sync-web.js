// Кладе гру в mobile/www: index.html (шрифт локальний, без Google) + fonts. Запуск: node sync-web.js (або npm run web)
// Спільний game.html не чіпаємо: усі правки для телефона робимо лише в копії. --head бере гру з останнього коміту (коли в src/ хтось зараз працює).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const useHead = process.argv.includes('--head');
function gameSource() {
  if (useHead) return cp.execFileSync('git', ['show', 'HEAD:game.html'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, windowsHide: true });
  const dir = path.join(ROOT, 'src');
  const built = fs.readdirSync(dir).filter(f => /^\d+_.+\.(html|css|js)$/.test(f)).sort().map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('');
  const game = fs.readFileSync(path.join(ROOT, 'game.html'), 'utf8');
  if (built !== game) { console.error('src/ і game.html різні. Спершу node tools/build.js, або запусти з --head (версія з останнього коміту).'); process.exit(1); }
  return game;
}
let html = gameSource();
html = html.replace(/<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, '');
html = html.replace(/<link rel="manifest"[^>]*>\s*/, '');                                     // сайтовий файл, у застосунку його нема
html = html.replace('</title>', "</title>\n<style>@font-face{font-family:'Press Start 2P';src:url('fonts/PressStart2P-Regular.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}#fbContact{display:none}</style>");
function must(re, to, what) {                                                                 // шаблон зник = зупинка: краще без збірки, ніж випуск без правки
  if (!re.test(html)) { console.error('sync-web: не знайшов «' + what + '» у грі, правку треба оновити.'); process.exit(1); }
  html = html.replace(re, to);
}
// Режим бога лише в exe: прапорці мають бути вимкнені, а код власника в цій збірці не спрацює ні на якому пристрої.
['const DEV_OPEN_BUILD = false;', 'const SKINS_FREE_BUILD = false;'].forEach(s => { if (!html.includes(s)) { console.error('sync-web: у грі ввімкнений режим бога (' + s + ').'); process.exit(1); } });
if (html.includes('window.__debug = true')) { console.error('sync-web: у грі ввімкнена панель налагодження.'); process.exit(1); }
must(/const GOD_HASH = '[0-9a-f]{64}';/, "const GOD_HASH = '';", 'GOD_HASH');
// Відгук у застосунку йде через поштову програму гравця: сама гра нічого нікуди не надсилає.
must(/const FEEDBACK = \{ url: '[^']*', key: '[^']*',/, "const FEEDBACK = { url: '', key: '',", 'FEEDBACK');
// Реклама AdMob: лише коли є mobile/ads.json (живі ID або {"testing":true,"rewardedId":"..."}). Нема файлу = реклами нема зовсім.
let ads = null;
try { ads = JSON.parse(fs.readFileSync(path.join(__dirname, 'ads.json'), 'utf8')); } catch (e) { /* нема файлу */ }
if (ads) html = html.replace('</title>', '</title>\n<script>window.__ADS=' + JSON.stringify(ads) + ';</script>');
console.log('Реклама: ' + (ads ? (ads.testing ? 'ТЕСТОВИЙ режим' : 'ЖИВІ ID') : 'немає'));
// Оплати Google Play: лише коли є mobile/iap.json (див. iap.example.json, store/PLAY_PAYMENTS.md). Без нього застосунок без оплат.
let iap = null;
try { iap = JSON.parse(fs.readFileSync(path.join(__dirname, 'iap.json'), 'utf8')); } catch (e) { /* нема файлу */ }
if (iap) html = html.replace('</title>', '</title>\n<script>window.__IAP=' + JSON.stringify(iap) + ';</script>');
console.log('Оплати: ' + (iap ? 'УВІМКНЕНО (' + (iap.products || []).length + ' товарів)' : 'немає'));
const www = path.join(__dirname, 'www');
fs.mkdirSync(path.join(www, 'fonts'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'docs', 'fonts', 'PressStart2P-Regular.ttf'), path.join(www, 'fonts', 'PressStart2P-Regular.ttf'));
fs.copyFileSync(path.join(ROOT, 'docs', 'fonts', 'OFL.txt'), path.join(www, 'fonts', 'OFL.txt'));
fs.writeFileSync(path.join(www, 'index.html'), html, 'utf8');
console.log('mobile/www/index.html готовий (' + Math.round(html.length / 1024) + ' КБ)' + (useHead ? ', версія з останнього коміту' : ''));
