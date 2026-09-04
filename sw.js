/**
 * ResearchFlow service worker. It lives at the app root so its default scope
 * covers the full application, including source modules and styles.
 */

const CACHE_NAME = 'gnosis-tasks-v0.2.0';
const APP_ROOT = new URL('./', self.location.href);
const SHELL = [
    './',
    './index.html',
    './public/manifest.json',
    './styles/app.css',
    './src/ui/app.js'
].map(path => new URL(path, APP_ROOT).href);

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)));
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const requestUrl = new URL(event.request.url);
    if (requestUrl.origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                }
                return response;
            })
            .catch(async () => {
                const cached = await caches.match(event.request);
                if (cached) return cached;
                if (event.request.mode === 'navigate') {
                    return caches.match(new URL('./index.html', APP_ROOT).href);
                }
                return Response.error();
            })
    );
});
