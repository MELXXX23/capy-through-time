// Маленький сервер для перегляду зразків у папці previews (без бібліотек): node tools/serve-previews.js
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', 'previews'), PORT = +process.env.PORT || 8090;
const TYPES = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.js': 'text/javascript', '.json': 'application/json', '.webm': 'video/webm', '.mp4': 'video/mp4', '.wav': 'audio/wav' };
http.createServer((req, res) => {
  let rel = decodeURIComponent((req.url || '/').split('?')[0]);
  if (rel === '/') rel = '/transitions.html';
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    const head = { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');    // звук і відео: перемотування й тривалість
    if (m && (m[1] || m[2])) {
      const s = m[1] ? +m[1] : Math.max(0, data.length - +m[2]), e = m[1] && m[2] ? Math.min(+m[2], data.length - 1) : data.length - 1;
      res.writeHead(206, Object.assign(head, { 'Content-Range': 'bytes ' + s + '-' + e + '/' + data.length, 'Content-Length': e - s + 1 }));
      return res.end(data.subarray(s, e + 1));
    }
    res.writeHead(200, Object.assign(head, { 'Content-Length': data.length }));
    res.end(data);
  });
}).listen(PORT, () => console.log('previews on http://localhost:' + PORT));
