// Қарапайым статикалық сервер (тәуелділіксіз) — Railway/контейнер үшін.
// index.html мен қасындағы файлдарды (music.mp3, суреттер, т.б.) таратады.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.mp3':  'audio/mpeg',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2':'font/woff2'
};

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

    // Жол-траверсалдан қорғау
    const safePath = path.normalize(path.join(ROOT, urlPath));
    if (!safePath.startsWith(ROOT)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }

    fs.stat(safePath, (err, stat) => {
      if (err || !stat.isFile()) {
        // Табылмаса — басты бетке қайтару
        const fallback = path.join(ROOT, 'index.html');
        fs.readFile(fallback, (e, data) => {
          if (e) { res.writeHead(404); res.end('Not found'); return; }
          res.writeHead(200, { 'Content-Type': TYPES['.html'] });
          res.end(data);
        });
        return;
      }
      const ext = path.extname(safePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(safePath).pipe(res);
    });
  } catch (e) {
    res.writeHead(500); res.end('Server error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Той шақырту сайты ' + PORT + ' портта істеп тұр');
});
