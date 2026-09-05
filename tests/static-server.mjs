import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, normalize, resolve, sep } from 'node:path';

const port = Number(process.argv[2] ?? 4173);
const dist = resolve(process.cwd(), 'dist');
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

function pathFor(urlPath) {
  const requested = urlPath === '/demo' ? '/demo/' : urlPath;
  const relative = requested.endsWith('/') ? `${requested}index.html` : requested;
  const target = resolve(dist, `.${normalize(relative)}`);
  return target.startsWith(`${dist}${sep}`) ? target : null;
}

async function existingFile(file) {
  if (!file) return null;
  try {
    return (await stat(file)).isFile() ? file : null;
  } catch {
    return null;
  }
}

createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host}`);
  const file = await existingFile(pathFor(decodeURIComponent(requestUrl.pathname)));
  const isNotFound = !file;
  const target = file ?? resolve(dist, '404.html');

  try {
    const body = await readFile(target);
    const type = mimeTypes[extname(target)] ?? 'application/octet-stream';
    const cacheControl = requestUrl.pathname === '/sw.js'
      ? 'no-cache'
      : requestUrl.pathname.startsWith('/assets/')
        ? 'public, max-age=31536000, immutable'
        : 'no-cache';
    response.writeHead(isNotFound ? 404 : 200, { 'Content-Type': type, 'Cache-Control': cacheControl });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Static server could not read the requested file.');
  }
}).listen(port, '127.0.0.1', () => {
  process.stdout.write(`Static test server listening on ${port}\n`);
});
