import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function contentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function sendFile(res, filePath, status = 200) {
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(status, { 'Content-Type': contentType(filePath) });
    res.end(data);
  } catch (err) {
    console.error('Failed to read file:', filePath, err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server error');
  }
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname.replace(/\/\/+/, '/'));

  if (pathname === '/' || pathname === '/index.html') {
    return sendFile(res, path.join(ROOT, 'index.html'));
  }

  if (pathname === '/games') {
    return sendFile(res, path.join(ROOT, 'games', 'index.html'));
  }

  const filePath = path.join(ROOT, pathname);
  const normalized = path.normalize(filePath);
  if (!normalized.startsWith(ROOT)) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  try {
    const stats = await fs.stat(normalized);
    if (stats.isDirectory()) {
      const indexFile = path.join(normalized, 'index.html');
      return sendFile(res, indexFile);
    }
    return sendFile(res, normalized);
  } catch {
    return sendFile(res, path.join(ROOT, '404.html'), 404);
  }
}

const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`Serving ${ROOT} on http://localhost:${PORT}`);
});
