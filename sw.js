const CACHE_NAME = 'my-website-pwa-cache-v1';
const urlsToCache = [
  '/SampleWebApp/', // The main page
  '/SampleWebApp/index.html', // Or your specific start URL if different
  // Add other essential files like:
  // '/style.css',
  // '/script.js',
  // '/icon-192x192.png',
  // '/icon-512x512.png',
  '/SampleWebApp/manifest.json' // It's good to cache the manifest too
];

// Install event: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to open cache or add URLs:', err);
      })
  );
});

// Fetch event: serve cached content when offline, otherwise fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          // Network request failed, try to serve a fallback if you have one
          // or just let the browser handle the error.
          // For a simple wrapper, just failing might be acceptable initially.
          console.error('Fetching failed:', error);
          // You could return a custom offline page here:
          // return caches.match('/offline.html');
        });
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});