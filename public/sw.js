// Rekayu Service Worker para soporte PWA offline y carga instantánea en iOS/Android
const CACHE_NAME = 'rekayu-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/IcoRekayu.ico',
];

// Instalación: precargar activos del shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Error precacheando assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activación: limpiar cachés obsoletas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Intercepción de peticiones de red
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo peticiones HTTP/HTTPS y método GET
  if (!request.url.startsWith('http') || request.method !== 'GET') {
    return;
  }

  // Estrategia para navegación (HTML): Network first, fallback a caché
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Estrategia para recursos estáticos (imágenes, fuentes, css, js): Cache first, fallback a red
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Si falla y es una imagen o icono, devolver fallback si existe
          if (request.destination === 'image') {
            return caches.match('/icons/apple-touch-icon.png');
          }
        });
    })
  );
});
