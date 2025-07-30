// Service Worker for SquidJob Tender Management PWA
const CACHE_NAME = 'squidjob-v1.0.0';
const STATIC_CACHE = 'squidjob-static-v1.0.0';
const DYNAMIC_CACHE = 'squidjob-dynamic-v1.0.0';
const API_CACHE = 'squidjob-api-v1.0.0';

// Cache strategies
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  DYNAMIC: 'stale-while-revalidate',
  API: 'network-first',
  OFFLINE: 'cache-only'
};

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Static assets to cache
const STATIC_ASSETS = [
  '/static/js/',
  '/static/css/',
  '/static/media/',
  '/icons/',
  '/images/',
  '/fonts/'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/tenders',
  '/api/dashboard',
  '/api/forms',
  '/api/users'
];

// Offline fallback pages
const OFFLINE_PAGES = {
  '/': '/offline.html',
  '/dashboard': '/offline-dashboard.html',
  '/tenders': '/offline-tenders.html'
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
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
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle different cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'tender-sync') {
    event.waitUntil(syncTenderData());
  } else if (event.tag === 'form-sync') {
    event.waitUntil(syncFormData());
  } else if (event.tag === 'user-sync') {
    event.waitUntil(syncUserData());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New tender update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/action-1.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-2.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('SquidJob Tender Management', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions
function isStaticAsset(request) {
  return STATIC_ASSETS.some(asset => request.url.includes(asset));
}

function isAPIRequest(request) {
  return API_ENDPOINTS.some(endpoint => request.url.includes(endpoint));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Cache strategies
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Static asset fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API request failed, trying cache:', error);
    
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation request failed, trying offline page:', error);
    
    const offlinePage = OFFLINE_PAGES[request.url] || '/offline.html';
    const cache = await caches.open(STATIC_CACHE);
    const offlineResponse = await cache.match(offlinePage);
    
    if (offlineResponse) {
      return offlineResponse;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Dynamic request failed, trying cache:', error);
    
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Background sync functions
async function syncTenderData() {
  try {
    const db = await openIndexedDB();
    const pendingTenders = await db.getAll('pendingTenders');
    
    for (const tender of pendingTenders) {
      try {
        const response = await fetch('/api/tenders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tender)
        });
        
        if (response.ok) {
          await db.delete('pendingTenders', tender.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync tender:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Tender sync failed:', error);
  }
}

async function syncFormData() {
  try {
    const db = await openIndexedDB();
    const pendingForms = await db.getAll('pendingForms');
    
    for (const form of pendingForms) {
      try {
        const response = await fetch('/api/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        
        if (response.ok) {
          await db.delete('pendingForms', form.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync form:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Form sync failed:', error);
  }
}

async function syncUserData() {
  try {
    const db = await openIndexedDB();
    const pendingUsers = await db.getAll('pendingUsers');
    
    for (const user of pendingUsers) {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        
        if (response.ok) {
          await db.delete('pendingUsers', user.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync user:', error);
      }
    }
  } catch (error) {
    console.error('[SW] User sync failed:', error);
  }
}

// IndexedDB helper
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SquidJobDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('pendingTenders')) {
        db.createObjectStore('pendingTenders', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingForms')) {
        db.createObjectStore('pendingForms', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingUsers')) {
        db.createObjectStore('pendingUsers', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'key' });
      }
    };
  });
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
}); 