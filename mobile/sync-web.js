// Кладе гру в mobile/www: index.html (шрифт локальний, без Google) + fonts. Запуск: node sync-web.js (або npm run web)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
require('child_process').execFileSync('node', [path.join(ROOT, 'tools', 'sync.js')], { stdio: 'inherit' });     // src/ і game.html мають збігатися
let html = fs.readFileSync(path.join(ROOT, 'game.html'), 'utf8');
html = html.replace(/<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, '');
html = html.replace('</title>', "</title>\n<style>@font-face{font-family:'Press Start 2P';src:url('fonts/PressStart2P-Regular.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}</style>");
// Реклама AdMob: лише в телефонній збірці. ads.json (живі ID) необов'язковий; без нього — ТЕСТОВІ ID Google (безпечно, реальних показів нема).
let ads = { testing: true, rewardedId: 'ca-app-pub-3940256099942544/5224354917' };
try { ads = Object.assign(ads, JSON.parse(fs.readFileSync(path.join(__dirname, 'ads.json'), 'utf8'))); } catch (e) { /* нема файлу */ }
html = html.replace('</title>', '</title>\n<script>window.__ADS=' + JSON.stringify(ads) + ';</script>');
console.log('Реклама: ' + (ads.testing ? 'ТЕСТОВИЙ режим' : 'ЖИВІ ID'));
const www = path.join(__dirname, 'www');
fs.mkdirSync(path.join(www, 'fonts'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'docs', 'fonts', 'PressStart2P-Regular.ttf'), path.join(www, 'fonts', 'PressStart2P-Regular.ttf'));
fs.copyFileSync(path.join(ROOT, 'docs', 'fonts', 'OFL.txt'), path.join(www, 'fonts', 'OFL.txt'));
fs.writeFileSync(path.join(www, 'index.html'), html, 'utf8');
console.log('mobile/www/index.html готовий (' + Math.round(html.length / 1024) + ' КБ)');
