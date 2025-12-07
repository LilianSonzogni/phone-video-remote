/**
 * Phone Video Remote - Service Worker
 * Provides offline functionality and PWA installation support
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `video-remote-${CACHE_VERSION}`;

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

/**
 * Logs a message with timestamp and prefix
 * @param {string} message - Message to log
 */
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[Service Worker] [${timestamp}] ${message}`);
}

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
  log('Installing service worker...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        log('Static assets cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        log(`Cache failed: ${error.message}`);
      })
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  log('Activating service worker...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        // Delete old caches
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('video-remote-') && name !== CACHE_NAME)
            .map((name) => {
              log(`Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        log('Service worker activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

/**
 * Fetch Event - Cache-first strategy for static assets
 * Network-first for WebSocket and dynamic content
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip WebSocket requests
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches
      .match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          log(`Serving from cache: ${url.pathname}`);
          return cachedResponse;
        }

        // Not in cache, fetch from network
        log(`Fetching from network: ${url.pathname}`);
        return fetch(request)
          .then((response) => {
            // Don't cache if not a success response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response (can only be consumed once)
            const responseToCache = response.clone();

            // Cache the fetched response for future use
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });

            return response;
          })
          .catch((error) => {
            log(`Fetch failed: ${error.message}`);

            // Return offline page if available
            if (request.mode === 'navigate') {
              return caches.match('./index.html');
            }

            throw error;
          });
      })
  );
});

/**
 * Message Event - Handle messages from the app
 */
self.addEventListener('message', (event) => {
  log(`Received message: ${JSON.stringify(event.data)}`);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

/**
 * Sync Event - Background sync support (optional)
 */
self.addEventListener('sync', (event) => {
  log(`Background sync: ${event.tag}`);

  if (event.tag === 'sync-commands') {
    event.waitUntil(
      // Could be used to queue commands when offline
      // and send them when connection is restored
      Promise.resolve()
    );
  }
});

/**
 * Push Event - Push notification support (optional, for future use)
 */
self.addEventListener('push', (event) => {
  log('Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'Video control command',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'video-remote-notification'
  };

  event.waitUntil(
    self.registration.showNotification('Phone Video Remote', options)
  );
});

/**
 * Notification Click Event - Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  log('Notification clicked');

  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }

        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
  );
});

log('Service worker script loaded');
