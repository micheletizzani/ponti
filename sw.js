/* Ponti — service worker versionato per build. */
const BUILD_ID = 'ccccb9306591';
const CACHE_PREFIX = 'ponti-';
const CACHE = `${CACHE_PREFIX}${BUILD_ID}`;
const INDEX_URL = new URL('index.html', self.registration.scope).href;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
        .map((key) => caches.delete(key)),
    );
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => client.postMessage({ type: 'PONTI_SW_ACTIVE', buildId: BUILD_ID }));
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Le navigazioni preferiscono la rete, con fallback offline sulla shell.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Asset: prima la copia locale, così tablet senza rete restano operativi.
  event.respondWith(cacheFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) {
      await cache.put(request, response.clone());
      if (response.headers.get('content-type')?.includes('text/html')) {
        await cache.put(INDEX_URL, response.clone());
      }
    }
    return response;
  } catch {
    return (await cache.match(request)) || (await cache.match(INDEX_URL)) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}
