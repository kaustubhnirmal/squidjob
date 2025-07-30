import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  isUpdateAvailable: boolean;
  isServiceWorkerRegistered: boolean;
  syncStatus: 'idle' | 'syncing' | 'completed' | 'error';
  offlineData: any[];
}

interface PWAInstallPrompt {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAActions {
  installApp: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
  syncOfflineData: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  getOfflineData: () => Promise<any[]>;
  saveOfflineData: (data: any) => Promise<void>;
}

export function usePWA(): [PWAState, PWAActions] {
  const [state, setState] = useState<PWAState>({
    isOnline: navigator.onLine,
    isInstalled: window.matchMedia('(display-mode: standalone)').matches,
    canInstall: false,
    isUpdateAvailable: false,
    isServiceWorkerRegistered: false,
    syncStatus: 'idle',
    offlineData: []
  });

  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);

  // Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          setState(prev => ({ ...prev, isServiceWorkerRegistered: true }));

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setState(prev => ({ ...prev, isUpdateAvailable: true }));
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Online/Offline Detection
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Install Prompt Detection
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
      setState(prev => ({ ...prev, canInstall: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Service Worker Message Handling
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        setState(prev => ({ ...prev, isUpdateAvailable: true }));
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  // PWA Actions
  const installApp = useCallback(async () => {
    if (deferredPrompt) {
      try {
        const { outcome } = await deferredPrompt.prompt();
        console.log(`Install prompt outcome: ${outcome}`);
        
        if (outcome === 'accepted') {
          setState(prev => ({ 
            ...prev, 
            isInstalled: true, 
            canInstall: false 
          }));
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Install prompt failed:', error);
      }
    }
  }, [deferredPrompt]);

  const checkForUpdates = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      } catch (error) {
        console.error('Update check failed:', error);
      }
    }
  }, []);

  const syncOfflineData = useCallback(async () => {
    setState(prev => ({ ...prev, syncStatus: 'syncing' }));
    
    try {
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        
        // Register background sync
        await registration.sync.register('tender-sync');
        await registration.sync.register('form-sync');
        await registration.sync.register('user-sync');
        
        setState(prev => ({ ...prev, syncStatus: 'completed' }));
      } else {
        // Fallback: manual sync
        const offlineData = await getOfflineData();
        for (const data of offlineData) {
          try {
            await fetch(data.url, {
              method: data.method,
              headers: data.headers,
              body: data.body
            });
          } catch (error) {
            console.error('Sync failed for:', data, error);
          }
        }
        setState(prev => ({ ...prev, syncStatus: 'completed' }));
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setState(prev => ({ ...prev, syncStatus: 'error' }));
    }
  }, []);

  const clearOfflineData = useCallback(async () => {
    try {
      if ('indexedDB' in window) {
        const db = await openIndexedDB();
        await db.clear('pendingTenders');
        await db.clear('pendingForms');
        await db.clear('pendingUsers');
        await db.clear('offlineData');
        
        setState(prev => ({ ...prev, offlineData: [] }));
      }
    } catch (error) {
      console.error('Clear offline data failed:', error);
    }
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      });
    }
  }, []);

  const getOfflineData = useCallback(async (): Promise<any[]> => {
    try {
      if ('indexedDB' in window) {
        const db = await openIndexedDB();
        const tenders = await db.getAll('pendingTenders');
        const forms = await db.getAll('pendingForms');
        const users = await db.getAll('pendingUsers');
        
        const allData = [...tenders, ...forms, ...users];
        setState(prev => ({ ...prev, offlineData: allData }));
        return allData;
      }
      return [];
    } catch (error) {
      console.error('Get offline data failed:', error);
      return [];
    }
  }, []);

  const saveOfflineData = useCallback(async (data: any) => {
    try {
      if ('indexedDB' in window) {
        const db = await openIndexedDB();
        const storeName = data.type === 'tender' ? 'pendingTenders' : 
                         data.type === 'form' ? 'pendingForms' : 'pendingUsers';
        
        await db.add(storeName, {
          ...data,
          id: Date.now().toString(),
          timestamp: Date.now()
        });
        
        // Update state
        const currentData = await getOfflineData();
        setState(prev => ({ ...prev, offlineData: currentData }));
      }
    } catch (error) {
      console.error('Save offline data failed:', error);
    }
  }, [getOfflineData]);

  // IndexedDB helper
  const openIndexedDB = async () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('SquidJobDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
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
  };

  const actions: PWAActions = {
    installApp,
    checkForUpdates,
    syncOfflineData,
    clearOfflineData,
    requestNotificationPermission,
    sendNotification,
    getOfflineData,
    saveOfflineData
  };

  return [state, actions];
} 