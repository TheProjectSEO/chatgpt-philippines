// ChatGPT Philippines - Service Worker
// Version: 1.0.0
// Last Updated: 2025-11-16

const CACHE_VERSION = 'chatgpt-ph-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/chat',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Cache size limits
const CACHE_LIMITS = {
  [DYNAMIC_CACHE]: 50,
  [API_CACHE]: 100,
  [IMAGE_CACHE]: 60,
};

// API endpoints that should be cached
const CACHEABLE_API_ROUTES = [
  '/api/health',
];

// API endpoints that should never be cached
const UNCACHEABLE_API_ROUTES = [
  '/api/auth',
  '/api/supabase',
  '/api/rate-limit',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old cache versions
              return cacheName.startsWith('chatgpt-ph-') &&
                     cacheName !== STATIC_CACHE &&
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== API_CACHE &&
                     cacheName !== IMAGE_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request, url));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

// Handle page requests (Network First, fallback to cache)
async function handlePageRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      await limitCacheSize(DYNAMIC_CACHE, CACHE_LIMITS[DYNAMIC_CACHE]);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);

    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page if available
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }

    // Return a basic offline response
    return new Response(
      '<html><body><h1>Offline</h1><p>You are currently offline. Please check your connection.</p></body></html>',
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Handle API requests (Network First with timeout, fallback to cache)
async function handleAPIRequest(request, url) {
  // Don't cache authentication or sensitive routes
  if (UNCACHEABLE_API_ROUTES.some(route => url.pathname.startsWith(route))) {
    return fetch(request);
  }

  const NETWORK_TIMEOUT = 5000; // 5 seconds

  try {
    // Race network request against timeout
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
      ),
    ]);

    // Cache successful responses for cacheable routes
    if (networkResponse && networkResponse.ok) {
      if (CACHEABLE_API_ROUTES.some(route => url.pathname.startsWith(route))) {
        const cache = await caches.open(API_CACHE);
        cache.put(request, networkResponse.clone());
        await limitCacheSize(API_CACHE, CACHE_LIMITS[API_CACHE]);
      }
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] API network failed, trying cache:', error);

    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return error response
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'You are currently offline. This feature requires an internet connection.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle image requests (Cache First, fallback to network)
async function handleImageRequest(request) {
  // Try cache first for images
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Try network
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
      await limitCacheSize(IMAGE_CACHE, CACHE_LIMITS[IMAGE_CACHE]);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Image fetch failed:', error);

    // Return a placeholder image or empty response
    return new Response('', {
      status: 404,
      statusText: 'Image not found',
    });
  }
}

// Helper: Check if request is for an image
function isImageRequest(request) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'];
  const url = new URL(request.url);
  return imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    // Delete oldest items (FIFO)
    const itemsToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(
      itemsToDelete.map(key => cache.delete(key))
    );
    console.log(`[SW] Deleted ${itemsToDelete.length} items from ${cacheName}`);
  }
}

// Handle background sync (for offline message queue)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

// Sync offline messages when back online
async function syncMessages() {
  console.log('[SW] Syncing offline messages...');

  try {
    // Get offline messages from IndexedDB or cache
    // This would integrate with your existing message queue
    const messages = await getOfflineMessages();

    if (messages.length === 0) {
      return;
    }

    // Send messages to server
    const results = await Promise.allSettled(
      messages.map(msg => sendMessage(msg))
    );

    // Clear successfully sent messages
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[SW] Synced ${successCount}/${messages.length} offline messages`);

    // Notify user if needed
    if (successCount > 0) {
      self.registration.showNotification('Messages Synced', {
        body: `${successCount} offline messages have been sent.`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
      });
    }
  } catch (error) {
    console.error('[SW] Failed to sync messages:', error);
  }
}

// Placeholder functions (implement with your actual logic)
async function getOfflineMessages() {
  // TODO: Implement IndexedDB logic to get queued messages
  return [];
}

async function sendMessage(message) {
  // TODO: Implement actual message sending logic
  return fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
}

// Handle push notifications (optional)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);

  const options = {
    body: event.data ? event.data.text() : 'New notification from ChatGPT Philippines',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'chatgpt-ph-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification('ChatGPT Philippines', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if no existing window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received from client:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        })
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
    );
  }

  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    event.waitUntil(
      getCacheStats()
        .then((stats) => {
          event.ports[0].postMessage(stats);
        })
    );
  }
});

// Get cache statistics
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = keys.length;
  }

  return stats;
}

console.log('[SW] Service worker script loaded');
