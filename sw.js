const CACHE_NAME = 'sleep-aid-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/storage.js',
    '/js/audio-engine.js',
    '/js/binaural-beats.js',
    '/js/scene-manager.js',
    '/js/app.js',
    '/manifest.json'
];

// 安装阶段：缓存资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// 请求拦截：优先缓存，失败则网络
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then((response) => {
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => cache.put(event.request, responseClone));
                        return response;
                    });
            })
    );
});
