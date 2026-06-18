const CACHE_VERSION = 'v2';
const STATIC_CACHE = 'eduai-static-' + CACHE_VERSION;
const DYNAMIC_CACHE = 'eduai-dynamic-' + CACHE_VERSION;
const IMAGE_CACHE = 'eduai-images-' + CACHE_VERSION;
const FONT_CACHE = 'eduai-fonts-' + CACHE_VERSION;
const API_CACHE = 'eduai-api-' + CACHE_VERSION;

var PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/offline'
];

// ============================================================
// INSTALL - Precache critical assets
// ============================================================
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ============================================================
// ACTIVATE - Clean old caches
// ============================================================
self.addEventListener('activate', function(event) {
  var currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, FONT_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return !currentCaches.includes(key);
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      // Claim all clients immediately
      return self.clients.claim();
    }).then(function() {
      // Notify all clients that update is complete
      return self.clients.matchAll();
    }).then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
      });
    })
  );
});

// ============================================================
// FETCH - Advanced caching strategies
// ============================================================
self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  if (url.pathname.startsWith('/_next/')) return;

  // API requests - Network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithTimeout(request, API_CACHE, 3000));
    return;
  }

  // Image requests - Cache first
  if (request.destination === 'image' || /\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirstWithRefresh(request, IMAGE_CACHE));
    return;
  }

  // Font requests - Cache first (fonts rarely change)
  if (request.destination === 'font' || /\.(woff|woff2|ttf|otf|eot)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // Static assets - Cache first
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(cacheFirstWithRefresh(request, STATIC_CACHE));
    return;
  }

  // Navigation requests - Stale while revalidate
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    return;
  }

  // Default - Network first
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// ============================================================
// CACHE STRATEGIES
// ============================================================

function cacheFirst(request, cacheName) {
  return caches.match(request).then(function(cached) {
    if (cached) return cached;
    return fetch(request).then(function(response) {
      if (response.ok) {
        var clone = response.clone();
        caches.open(cacheName).then(function(c) { c.put(request, clone); });
      }
      return response;
    }).catch(function() {
      return new Response('Offline', { status: 503 });
    });
  });
}

function cacheFirstWithRefresh(request, cacheName) {
  return caches.match(request).then(function(cached) {
    var fetchPromise = fetch(request).then(function(response) {
      if (response.ok) {
        var clone = response.clone();
        caches.open(cacheName).then(function(c) { c.put(request, clone); });
      }
      return response;
    }).catch(function() {
      return cached || new Response('Offline', { status: 503 });
    });
    return cached || fetchPromise;
  });
}

function networkFirst(request, cacheName) {
  return fetch(request).then(function(response) {
    if (response.ok) {
      var clone = response.clone();
      caches.open(cacheName).then(function(c) { c.put(request, clone); });
    }
    return response;
  }).catch(function() {
    return caches.match(request).then(function(cached) {
      return cached || new Response(JSON.stringify({ error: 'Offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    });
  });
}

function networkFirstWithTimeout(request, cacheName, timeout) {
  return new Promise(function(resolve) {
    var fetchPromise = fetch(request).then(function(response) {
      if (response.ok) {
        var clone = response.clone();
        caches.open(cacheName).then(function(c) { c.put(request, clone); });
      }
      resolve(response);
    }).catch(function() {
      caches.match(request).then(function(cached) {
        resolve(cached || new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }));
      });
    });

    setTimeout(function() {
      caches.match(request).then(function(cached) {
        if (cached) resolve(cached);
      });
    }, timeout);
  });
}

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then(function(cache) {
    return cache.match(request).then(function(cached) {
      var fetchPromise = fetch(request).then(function(response) {
        if (response.ok) cache.put(request, response.clone());
        return response;
      }).catch(function() {
        return cached || offlinePage();
      });
      return cached || fetchPromise;
    });
  });
}

function offlinePage() {
  return new Response('<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EduAI - Offline</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#020203;color:#fff;font-family:system-ui}c{text-align:center;padding:2rem}h1{font-size:2rem;font-weight:900;background:linear-gradient(135deg,#22d3ee,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent}p{color:#71717a;max-width:400px;margin:1rem auto 2rem}a{display:inline-block;padding:12px 28px;border-radius:12px;background:#fff;color:#000;font-weight:700;text-decoration:none;font-size:14px}</style></head><body><div class="c"><h1>EduAI</h1><p>You are currently offline. Please check your internet connection.</p><a href="/">Retry</a></div></body></html>', {
    headers: { 'Content-Type': 'text/html' }
  });
}

// ============================================================
// BACKGROUND SYNC - Queue failed requests
// ============================================================
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-flashcards') {
    event.waitUntil(syncFlashcards());
  } else if (event.tag === 'sync-plans') {
    event.waitUntil(syncStudyPlans());
  } else if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncFlashcards() {
  try {
    var cache = await caches.open('eduai-sync-queue');
    var requests = await cache.keys();
    for (var request of requests) {
      if (request.url.includes('/api/flashcards')) {
        var response = await cache.match(request);
        var body = await response.json();
        await fetch('/api/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        await cache.delete(request);
      }
    }
  } catch (e) {
    console.error('Sync flashcards failed:', e);
  }
}

async function syncStudyPlans() {
  try {
    var cache = await caches.open('eduai-sync-queue');
    var requests = await cache.keys();
    for (var request of requests) {
      if (request.url.includes('/api/generate')) {
        var response = await cache.match(request);
        var body = await response.json();
        await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        await cache.delete(request);
      }
    }
  } catch (e) {
    console.error('Sync study plans failed:', e);
  }
}

async function syncAnalytics() {
  try {
    var cache = await caches.open('eduai-sync-queue');
    var requests = await cache.keys();
    for (var request of requests) {
      if (request.url.includes('/api/feedback') || request.url.includes('/api/history')) {
        var response = await cache.match(request);
        var body = await response.json();
        await fetch(request.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        await cache.delete(request);
      }
    }
  } catch (e) {
    console.error('Sync analytics failed:', e);
  }
}

// ============================================================
// PERIODIC BACKGROUND SYNC - Fetch new content
// ============================================================
self.addEventListener('periodicsync', function(event) {
  if (event.tag === 'fetch-new-flashcards') {
    event.waitUntil(fetchNewFlashcards());
  } else if (event.tag === 'update-streak') {
    event.waitUntil(updateStreak());
  }
});

async function fetchNewFlashcards() {
  try {
    var clients = await self.clients.matchAll();
    clients.forEach(function(client) {
      client.postMessage({
        type: 'PERIODIC_SYNC',
        action: 'fetch-flashcards'
      });
    });
  } catch (e) {
    console.error('Periodic sync failed:', e);
  }
}

async function updateStreak() {
  try {
    var clients = await self.clients.matchAll();
    clients.forEach(function(client) {
      client.postMessage({
        type: 'PERIODIC_SYNC',
        action: 'update-streak'
      });
    });
  } catch (e) {
    console.error('Update streak failed:', e);
  }
}

// ============================================================
// PUSH NOTIFICATIONS
// ============================================================
self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  var data = event.data.json();
  var options = {
    body: data.body || 'New notification from EduAI',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1,
      url: data.url || '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'Open EduAI',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.png'
      }
    ],
    tag: data.tag || 'eduai-notification',
    renotify: true,
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'EduAI', options)
  );
});

// ============================================================
// NOTIFICATION CLICK
// ============================================================
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'close') return;

  var urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if window is already open
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            url: urlToOpen
          });
          return client.focus();
        }
      }
      // Open new window if not
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// ============================================================
// MESSAGE HANDLER - Client communication
// ============================================================
self.addEventListener('message', function(event) {
  var data = event.data;

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (data.type === 'SET_BADGE') {
    // Badge API support
    if (self.setAppBadge) {
      if (data.count > 0) {
        self.setAppBadge(data.count);
      } else {
        self.clearAppBadge();
      }
    }
  }

  if (data.type === 'QUEUE_SYNC') {
    // Queue request for background sync
    event.waitUntil(queueForSync(data.url, data.method, data.body));
  }

  if (data.type === 'CACHE_URLS') {
    // Cache specific URLs
    event.waitUntil(cacheUrls(data.urls, data.cacheName));
  }
});

async function queueForSync(url, method, body) {
  try {
    var cache = await caches.open('eduai-sync-queue');
    var request = new Request(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    await cache.put(request, new Response(JSON.stringify(body)));
    
    // Register sync
    if (self.registration.sync) {
      await self.registration.sync.register('sync-' + Date.now());
    }
  } catch (e) {
    console.error('Queue sync failed:', e);
  }
}

async function cacheUrls(urls, cacheName) {
  try {
    var cache = await caches.open(cacheName || STATIC_CACHE);
    await Promise.all(
      urls.map(function(url) {
        return fetch(url).then(function(response) {
          if (response.ok) {
            return cache.put(url, response);
          }
        });
      })
    );
  } catch (e) {
    console.error('Cache URLs failed:', e);
  }
}