const CACHE_NAME = "vix-cursos-v1";
const APP_SHELL = [
    "/",
    "/index.html",
    "/style.css",
    "/manifest.webmanifest",
    "/public/script/script.js",
    "/public/script/layout.js",
    "/public/components/header.html",
    "/public/components/footer.html",
    "/public/imagem/VIxcursos.png",
    "/public/imagem/prefeitura.png",
    "/public/imagem/terceira_ponte.png",
    "/public/imagem/proficao/proficao.png",
    "/public/imagem/proficao/proficao2.png",
    "/public/imagem/proficao/proficao3.png",
    "/public/imagem/proficao/proficao4.png",
    "/public/pages/vocacional.html",
    "/public/pages/informacoes.html",
    "/public/css/vocacional.css",
    "/public/css/info.css"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    if (url.pathname.startsWith("/api/")) {
        event.respondWith(fetch(request).catch(() => caches.match(request)));
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;

            return fetch(request).then((response) => {
                if (!response || response.status !== 200 || response.type !== "basic") {
                    return response;
                }

                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                return response;
            });
        })
    );
});
