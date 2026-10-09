// Синхронізує game.html і src/: бере ту сторону, що змінена пізніше. Запуск: node tools/sync.js
// (викликається перед випуском; якщо змінено обидві сторони — зупиняється, щоб нічого не втратити)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const dir = path.join(ROOT, 'src');
const parts = fs.readdirSync(dir).filter(f => /^\d+_.+\.(html|css|js)$/.test(f)).map(f => path.join(dir, f));
const srcNewest = Math.max(...parts.map(f => fs.statSync(f).mtimeMs));
const gameT = fs.statSync(path.join(ROOT, 'game.html')).mtimeMs;
const built = parts.sort().map(f => path.basename(f)).sort().map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('');
const game = fs.readFileSync(path.join(ROOT, 'game.html'), 'utf8');
if (built === game) { console.log('src/ і game.html збігаються'); process.exit(0); }
const run = s => cp.execFileSync('node', [path.join(__dirname, s)], { stdio: 'inherit' });
if (gameT > srcNewest) { console.log('game.html новіший → розкладаю в src/'); run('split.js'); }
else { console.log('src/ новіший → збираю game.html'); run('build.js'); }
