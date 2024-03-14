const CACHE_NAME = 'Altered_Counter_cache-v7';

let urlsToCache = [
    '/',
    '/static/Styles.css',
    '/static/Script.js',
    '/static/Assets/addCharacterIcon.svg',
    '/static/Assets/AlteredLogo.webp',
    '/static/Assets/appIcon_256.png',
    '/static/Assets/appIcon_512.png',
    '/static/Assets/boost.webp',
    '/static/Assets/boostNegate.webp',
    '/static/Assets/check.svg',
    '/static/Assets/cross_light.svg',
    '/static/Assets/cross_dark.svg',
    '/static/Assets/reset.svg',
    '/static/Assets/rotateLogo.svg',
    '/static/Assets/upArrow_forest.svg',
    '/static/Assets/upArrow_mountain.svg',
    '/static/Assets/upArrow_water.svg',
    '/static/Assets/pause.svg',
    '/static/Assets/play.svg',
    '/static/Assets/stop.svg',
    '/static/Assets/zoomIn_dark.svg',
    '/static/Assets/zoomIn_light.svg',
    '/static/Assets/zoomOut_dark.svg',
    '/static/Assets/zoomOut_light.svg',
    '/static/Assets/advanceArrow.svg',
    '/static/Assets/companion_token.svg',
    '/static/Assets/hero_token.svg',
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

self.addEventListener('fetch', function(e) {
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
});
