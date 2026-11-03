// Питає пароль у терміналі так, щоб символів не було видно.
'use strict';
function askHidden(prompt) {
  return new Promise((ok, no) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) { no(new Error('Пароль можна ввести лише в терміналі.')); return; }
    process.stdout.write(prompt);
    let s = '';
    stdin.setRawMode(true); stdin.resume(); stdin.setEncoding('utf8');
    const on = chunk => {
      for (const c of chunk) {
        if (c === '\r' || c === '\n') { stdin.setRawMode(false); stdin.pause(); stdin.removeListener('data', on); process.stdout.write('\n'); ok(s); return; }
        if (c === '\u0003') { stdin.setRawMode(false); process.stdout.write('\n'); process.exit(1); }
        if (c === '\b' || c === '\u007f') s = s.slice(0, -1); else s += c;
      }
    };
    stdin.on('data', on);
  });
}
module.exports = { askHidden };
