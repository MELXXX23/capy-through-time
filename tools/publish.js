const fs=require('fs');
require('child_process').execFileSync('node',[require('path').join(__dirname,'sync.js')],{stdio:'inherit'});     // src/ і game.html мають збігатися
let s=fs.readFileSync('game.html','utf8');
s=s.replace(/<link rel="preconnect"[^>]*>\s*/g,'').replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>\s*/g,'');
s=s.replace('</title>',"</title>\n<style>@font-face{font-family:'Press Start 2P';src:url('fonts/PressStart2P-Regular.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}</style>");
fs.writeFileSync('docs/index.html',s);
console.log(s.includes('googleapis'), s.length);
