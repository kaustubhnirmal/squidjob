import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePWA } from '../../hooks/use-pwa';
import { useOfflineStorage } from '../../hooks/use-offline-storage';
import { PWAStatusBar } from './pwa-status-bar';
import { MobileNavigation } from './mobile-navigation';
import { OfflineFallback } from './offline-fallback';

interface PWAContextType {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  isUpdateAvailable: boolean;
  syncStatus: 'idle' | 'syncing' | 'completed' | 'error';
  offlineData: any[];
  installApp: () => Promise<void>;
  syncOfflineData: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
}

const PWAContext = createContext<PWAContextType | null>(null);

export function usePWAContext() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
}

interface PWAProviderProps {
  children: React.ReactNode;
  showStatusBar?: boolean;
  showMobileNav?: boolean;
}

export function PWAProvider({ 
  children, 
  showStatusBar = true, 
  showMobileNav = true 
}: PWAProviderProps) {
  const [pwaState, pwaActions] = usePWA();
  const [storageState, storageActions] = useOfflineStorage();
  const [showOfflineFallback, setShowOfflineFallback] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle offline state
  useEffect(() => {
    if (!pwaState.isOnline && !showOfflineFallback) {
      setShowOfflineFallback(true);
    } else if (pwaState.isOnline && showOfflineFallback) {
      setShowOfflineFallback(false);
    }
  }, [pwaState.isOnline, showOfflineFallback]);

  // Request notification permission on first visit
  useEffect(() => {
    const hasRequestedPermission = localStorage.getItem('notification-permission-requested');
    if (!hasRequestedPermission && pwaState.isServiceWorkerRegistered) {
      setTimeout(async () => {
        await pwaActions.requestNotificationPermission();
        localStorage.setItem('notification-permission-requested', 'true');
      }, 3000);
    }
  }, [pwaState.isServiceWorkerRegistered, pwaActions]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (pwaState.isOnline && pwaState.offlineData.length > 0) {
      const lastSync = localStorage.getItem('last-auto-sync');
      const now = Date.now();
      
      if (!lastSync || (now - parseInt(lastSync)) > 60000) { // Sync once per minute
        pwaActions.syncOfflineData();
        localStorage.setItem('last-auto-sync', now.toString());
      }
    }
  }, [pwaState.isOnline, pwaState.offlineData.length, pwaActions]);

  // Show update notification
  useEffect(() => {
    if (pwaState.isUpdateAvailable) {
      pwaActions.sendNotification('Update Available', {
        body: 'A new version of SquidJob is available. Click to update.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'update-available',
        data: { type: 'update' }
      });
    }
  }, [pwaState.isUpdateAvailable, pwaActions]);

  const contextValue: PWAContextType = {
    isOnline: pwaState.isOnline,
    isInstalled: pwaState.isInstalled,
    canInstall: pwaState.canInstall,
    isUpdateAvailable: pwaState.isUpdateAvailable,
    syncStatus: pwaState.syncStatus,
    offlineData: pwaState.offlineData,
    installApp: pwaActions.installApp,
    syncOfflineData: pwaActions.syncOfflineData,
    clearOfflineData: pwaActions.clearOfflineData,
    requestNotificationPermission: pwaActions.requestNotificationPermission,
    sendNotification: pwaActions.sendNotification
  };

  // Show offline fallback if offline
  if (showOfflineFallback) {
    return <OfflineFallback />;
  }

  return (
    <PWAContext.Provider value={contextValue}>
      {/* PWA Status Bar */}
      {showStatusBar && (
        <PWAStatusBar 
          className="sticky top-0 z-40"
          showDetails={!isMobile}
        />
      )}

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>

      {/* Mobile Navigation */}
      {showMobileNav && isMobile && (
        <MobileNavigation />
      )}

      {/* PWA Splash Screen */}
      <PWASplashScreen />
    </PWAContext.Provider>
  );
}

// PWA Splash Screen Component
function PWASplashScreen() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!showSplash) return null;

  return (
    <div className="pwa-splash">
      <div className="pwa-splash-logo">
        <span className="text-2xl font-bold text-purple-600">SJ</span>
      </div>
      <h1 className="pwa-splash-title">SquidJob</h1>
      <p className="pwa-splash-subtitle">Tender Management</p>
    </div>
  );
}

// PWA Install Button Component
export function PWAInstallButton({ className = '' }: { className?: string }) {
  const { canInstall, installApp } = usePWAContext();

  if (!canInstall) return null;

  return (
    <button
      onClick={installApp}
      className={`pwa-install-button ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      Install App
    </button>
  );
}

// PWA Sync Button Component
export function PWASyncButton({ className = '' }: { className?: string }) {
  const { offlineData, syncStatus, syncOfflineData } = usePWAContext();

  if (offlineData.length === 0) return null;

  return (
    <button
      onClick={syncOfflineData}
      disabled={syncStatus === 'syncing'}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50 ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {syncStatus === 'syncing' ? 'Syncing...' : `Sync (${offlineData.length})`}
    </button>
  );
}

// PWA Update Notification Component
export function PWAUpdateNotification() {
  const { isUpdateAvailable, checkForUpdates } = usePWAContext();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isUpdateAvailable) {
      setShowNotification(true);
    }
  }, [isUpdateAvailable]);

  if (!showNotification) return null;

  return (
    <div className="sw-update-notification">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <div>
          <p className="font-medium">Update Available</p>
          <p className="text-sm opacity-90">A new version is ready</p>
        </div>
        <button
          onClick={() => {
            checkForUpdates();
            setShowNotification(false);
          }}
          className="ml-4 px-3 py-1 bg-white bg-opacity-20 rounded text-sm font-medium hover:bg-opacity-30"
        >
          Update
        </button>
        <button
          onClick={() => setShowNotification(false)}
          className="ml-2 text-white opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
} 