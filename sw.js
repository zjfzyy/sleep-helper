const CACHE_NAME = 'sleep-aid-v1';

// 安装阶段：缓存资源（使用相对路径）
self.addEventListener('install', (event) => {
    const CACHE_URLS = [
        './',
        './index.html',
        './css/styles.css',
        './js/storage.js',
        './js/audio-engine.js',
        './js/binaural-beats.js',
        './js/scene-manager.js',
        './js/app.js',
        './manifest.json'
    ];

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // 使用 addAll，但如果失败不阻止 SW 安装
                return cache.addAll(CACHE_URLS).catch((err) => {
                    console.warn('Cache addAll failed:', err);
                    // 即使缓存失败也继续
                });
            })
            .then(() => {
                console.log('SW installed');
                return self.skipWaiting();
            })
            .catch((err) => {
                console.warn('SW install error:', err);
                self.skipWaiting();
            })
    );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => {
            console.log('SW activated');
            return self.clients.claim();
        })
    );
});

// 请求拦截：网络优先，失败则缓存
self.addEventListener('fetch', (event) => {
    // 对于同源请求，使用网络优先策略
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 成功获取，缓存并返回
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // 网络失败，尝试从缓存获取
                return caches.match(event.request);
            })
    );
});
