const CACHE_NAME = 'Altered_Counter_cache-v9';

let urlsToCache = [
    '/altered/',
    '/altered/index.html',
    '/altered/static/Styles.css',
    '/altered/static/Script.js',
    '/altered/static/Assets/addCharacterIcon.svg',
    '/altered/static/Assets/AlteredLogo.webp',
    '/altered/static/Assets/appIcon_256.png',
    '/altered/static/Assets/appIcon_512.png',
    '/altered/static/Assets/boost.webp',
    '/altered/static/Assets/boostNegate.webp',
    '/altered/static/Assets/check.svg',
    '/altered/static/Assets/cross_light.svg',
    '/altered/static/Assets/cross_dark.svg',
    '/altered/static/Assets/reset.svg',
    '/altered/static/Assets/rotateLogo.svg',
    '/altered/static/Assets/upArrow_forest.svg',
    '/altered/static/Assets/upArrow_mountain.svg',
    '/altered/static/Assets/upArrow_water.svg',
    '/altered/static/Assets/pause.svg',
    '/altered/static/Assets/play.svg',
    '/altered/static/Assets/stop.svg',
    '/altered/static/Assets/zoomIn_dark.svg',
    '/altered/static/Assets/zoomIn_light.svg',
    '/altered/static/Assets/zoomOut_dark.svg',
    '/altered/static/Assets/zoomOut_light.svg',
    '/altered/static/Assets/advanceArrow.svg',
    '/altered/static/Assets/companion_token.svg',
    '/altered/static/Assets/hero_token.svg',
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            //console.log("[Service Worker] Caching all: app shell and content");
            //await cache.addAll(urlsToCache);
            let ok;
            for (let i of urlsToCache) {
                try {
                    ok = await cache.add(i);
                } catch (err) {
                    console.warn('sw: cache.add', i);
                }
            }
        })(),
    );
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key === CACHE_NAME) {
                        return;
                    }
                    return caches.delete(key);
                }),
            );
        }),
    );
});

/*self.addEventListener('fetch', function(e) {
    e.respondWith(
        (async () => {
            const cacheResponse = await caches.match(e.request);
            //console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
            if (cacheResponse) {
                //console.log(`[Service Worker] Using cache resource: ${e.request.url}`);
                const cache = await caches.open(CACHE_NAME);
                const serverResponse = await fetch(e.request);
                if(serverResponse.ok) {
                    await cache.put(e.request, serverResponse.clone());
                }
                return cacheResponse;
            }
            const response = await fetch(e.request);
            const cache = await caches.open(CACHE_NAME);
            //console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
            await cache.put(e.request, response.clone());
            return response;
        })(),
    );
});*/

/*self.addEventListener('fetch', function(e) {
    e.respondWith(
        (async () => {
            return fetch(e.request)
                .then(async (serverResponse) => {
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(e.request, serverResponse.clone());
                    return serverResponse;
                })
                .catch(async (error) => {
                    const cacheResponse = await caches.match(e.request);
                    if (cacheResponse) {
                        return cacheResponse;
                    } else {
                        return new Response('', { status: 404, statusText: 'Not Found' });
                    }
                });
        })(),
    );
});*/

self.addEventListener('fetch', function(e) {
    e.respondWith(
        (async () => {
            const cachedResponse = await caches.match(e.request);
            const networkResponsePromise = fetch(e.request).then(async (response) => {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(e.request, response.clone());
                return response;
            }).catch(() => {
                return cachedResponse || new Response('', { status: 404, statusText: 'Not Found' });
            });
            return cachedResponse || networkResponsePromise;
        })(),
    );
});
