// PWA Hooks
export { usePWA } from '../../hooks/use-pwa';
export { useOfflineStorage } from '../../hooks/use-offline-storage';

// PWA Components
export { PWAProvider, usePWAContext, PWAInstallButton, PWASyncButton, PWAUpdateNotification } from './pwa-provider';
export { PWAStatusBar } from './pwa-status-bar';
export { MobileNavigation } from './mobile-navigation';
export { OfflineFallback } from './offline-fallback';

// PWA Types
export interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  isUpdateAvailable: boolean;
  isServiceWorkerRegistered: boolean;
  syncStatus: 'idle' | 'syncing' | 'completed' | 'error';
  offlineData: any[];
}

export interface PWAActions {
  installApp: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
  syncOfflineData: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  getOfflineData: () => Promise<any[]>;
  saveOfflineData: (data: any) => Promise<void>;
}

export interface OfflineStorageState {
  isAvailable: boolean;
  isInitialized: boolean;
  storageSize: number;
  itemCount: number;
}

export interface OfflineStorageActions {
  setItem: (key: string, value: any) => Promise<void>;
  getItem: (key: string) => Promise<any>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  getAllKeys: () => Promise<string[]>;
  getStorageInfo: () => Promise<{ size: number; count: number }>;
}

// PWA Configuration
export const PWA_CONFIG = {
  name: 'SquidJob Tender Management',
  shortName: 'SquidJob',
  description: 'Professional tender management system with offline capabilities',
  themeColor: '#7c3aed',
  backgroundColor: '#ffffff',
  display: 'standalone',
  startUrl: '/',
  scope: '/',
  icons: [
    {
      src: '/icons/icon-72x72.png',
      sizes: '72x72',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icons/icon-96x96.png',
      sizes: '96x96',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icons/icon-128x128.png',
      sizes: '128x128',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icons/icon-144x144.png',
      sizes: '144x144',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icons/icon-152x152.png',
      sizes: '152x152',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icons/icon-384x384.png',
      sizes: '384x384',
      type: 'image/png',
      purpose: 'maskable any'
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable any'
    }
  ],
  shortcuts: [
    {
      name: 'Dashboard',
      shortName: 'Dashboard',
      description: 'View tender dashboard',
      url: '/dashboard',
      icons: [
        {
          src: '/icons/dashboard-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        }
      ]
    },
    {
      name: 'New Tender',
      shortName: 'New Tender',
      description: 'Create new tender',
      url: '/tenders/new',
      icons: [
        {
          src: '/icons/new-tender-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        }
      ]
    },
    {
      name: 'Tender List',
      shortName: 'Tenders',
      description: 'View all tenders',
      url: '/tenders',
      icons: [
        {
          src: '/icons/tender-list-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        }
      ]
    }
  ],
  categories: ['business', 'productivity'],
  lang: 'en',
  orientation: 'portrait-primary',
  preferRelatedApplications: false,
  relatedApplications: [],
  edgeSidePanel: {
    preferredWidth: 400
  },
  launchHandler: {
    clientMode: 'navigate-existing'
  },
  handleLinks: 'preferred',
  protocolHandlers: [
    {
      protocol: 'web+tender',
      url: '/tenders/%s'
    }
  ],
  fileHandlers: [
    {
      action: '/upload',
      accept: {
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
        'text/csv': ['.csv']
      }
    }
  ]
};

// PWA Cache Configuration
export const PWA_CACHE_CONFIG = {
  staticCache: 'squidjob-static-v1.0.0',
  dynamicCache: 'squidjob-dynamic-v1.0.0',
  apiCache: 'squidjob-api-v1.0.0',
  criticalResources: [
    '/',
    '/index.html',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
  ],
  staticAssets: [
    '/static/js/',
    '/static/css/',
    '/static/media/',
    '/icons/',
    '/images/',
    '/fonts/'
  ],
  apiEndpoints: [
    '/api/tenders',
    '/api/dashboard',
    '/api/forms',
    '/api/users'
  ],
  offlinePages: {
    '/': '/offline.html',
    '/dashboard': '/offline-dashboard.html',
    '/tenders': '/offline-tenders.html'
  }
};

// PWA Database Configuration
export const PWA_DB_CONFIG = {
  name: 'SquidJobDB',
  version: 1,
  stores: {
    pendingTenders: { keyPath: 'id' },
    pendingForms: { keyPath: 'id' },
    pendingUsers: { keyPath: 'id' },
    offlineData: { keyPath: 'key' }
  }
};

// PWA Sync Configuration
export const PWA_SYNC_CONFIG = {
  syncTags: {
    tender: 'tender-sync',
    form: 'form-sync',
    user: 'user-sync'
  },
  retryAttempts: 3,
  retryDelay: 5000,
  maxSyncAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// PWA Notification Configuration
export const PWA_NOTIFICATION_CONFIG = {
  defaultIcon: '/icons/icon-192x192.png',
  defaultBadge: '/icons/badge-72x72.png',
  defaultVibrate: [100, 50, 100],
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