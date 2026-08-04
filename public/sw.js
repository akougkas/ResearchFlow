/**
 * ResearchFlow Service Worker - Lab Offline Caching Engine
 */

const CACHE_NAME = 'researchflow-v1.0.0-alpha';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles/variables.css',
    '/styles/reset.css',
    '/styles/utils.css',
    '/styles/layout.css',
    '/styles/components.css',
    '/styles/responsive.css',
    '/src/ui/app.js',
    '/src/ui/components/TriptychLayout.js',
    '/src/ui/components/Navigation.js',
    '/src/ui/components/TaskMatrix.js',
    '/src/ui/components/ContextPanel.js',
    '/src/ui/components/GraphView.js',
    '/src/ui/components/KanbanView.js',
    '/src/ui/components/TimelineView.js',
    '/src/ui/components/TaskModal.js',
    '/src/ui/components/TemplateModal.js',
    '/src/ui/components/AITaskModal.js',
    '/src/ui/components/SystemMenu.js',
    '/src/core/taskStore.js',
    '/src/core/exportImport.js',
    '/src/core/graph/GraphEngine.js',
    '/src/features/ai/TaskBreakdownEngine.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).catch(() => {
                // Return cached index.html for navigation requests when offline
                if (e.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
