const CACHE = 'equation-audio-guide-v7';
const SHELL = ['/', '/demo/', '/privacy/', '/terms/', '/404.html', '/favicon.svg', '/apple-touch-icon.png', '/equation-audio-guide-social.jpg', '/manifest.webmanifest', '/assets/audio-margin-hero-720.webp', '/assets/audio-margin-hero-1120.webp'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    const home = await fetch('/');
    const markup = await home.clone().text();
    const buildAssets = Array.from(markup.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g), (match) => match[1]);
    await cache.addAll(buildAssets);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

async function navigationFallback(request) {
  const path = new URL(request.url).pathname;
  const cached = (await caches.match(request)) || (path === '/demo' ? await caches.match('/demo/') : undefined) || (await caches.match('/'));
  if (!cached) return Response.error();
  return new Response(await cached.blob(), {
    status: cached.status,
    statusText: cached.statusText,
    headers: cached.headers,
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => navigationFallback(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
