import React, { useState, useEffect, useRef } from 'react';
import { usePWA } from '../../hooks/use-pwa';
import { 
  Home, 
  FileText, 
  Plus, 
  Search, 
  Settings, 
  Menu, 
  X,
  Bell,
  Download,
  Upload,
  Smartphone
} from 'lucide-react';

interface MobileNavigationProps {
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

export function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const [pwaState, pwaActions] = usePWA();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number } | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      href: '/dashboard'
    },
    {
      id: 'tenders',
      label: 'Tenders',
      icon: <FileText className="h-5 w-5" />,
      href: '/tenders',
      badge: 12
    },
    {
      id: 'new',
      label: 'New',
      icon: <Plus className="h-5 w-5" />,
      href: '/tenders/new'
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search className="h-5 w-5" />,
      href: '/search'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/settings'
    }
  ];

  // Touch gesture handling
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setSwipeStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!swipeStart) return;

      const deltaX = e.changedTouches[0].clientX - swipeStart.x;
      const deltaY = e.changedTouches[0].clientY - swipeStart.y;
      const minSwipeDistance = 50;

      // Horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          // Swipe right - open menu
          setIsMenuOpen(true);
        } else {
          // Swipe left - close menu
          setIsMenuOpen(false);
        }
      }

      setSwipeStart(null);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [swipeStart]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show install prompt after delay
  useEffect(() => {
    if (pwaState.canInstall && !pwaState.isInstalled) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [pwaState.canInstall, pwaState.isInstalled]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  const handleInstall = async () => {
    await pwaActions.installApp();
    setShowInstallPrompt(false);
  };

  const handleSync = async () => {
    await pwaActions.syncOfflineData();
  };

  const handleNotificationPermission = async () => {
    await pwaActions.requestNotificationPermission();
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className={`mobile-navigation fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 ${className}`}>
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center w-full py-2 px-1 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* PWA Status Indicators */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              {/* Online Status */}
              <div className={`flex items-center space-x-1 ${
                pwaState.isOnline ? 'text-green-600' : 'text-red-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  pwaState.isOnline ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>{pwaState.isOnline ? 'Online' : 'Offline'}</span>
              </div>

              {/* Sync Status */}
              {pwaState.offlineData.length > 0 && (
                <button
                  onClick={handleSync}
                  disabled={pwaState.syncStatus === 'syncing'}
                  className="flex items-center space-x-1 text-orange-600 disabled:opacity-50"
                >
                  <Upload className="h-3 w-3" />
                  <span>Sync ({pwaState.offlineData.length})</span>
                </button>
              )}
            </div>

            {/* PWA Features */}
            <div className="flex items-center space-x-2">
              {pwaState.canInstall && !pwaState.isInstalled && (
                <button
                  onClick={handleInstall}
                  className="flex items-center space-x-1 text-purple-600"
                >
                  <Smartphone className="h-3 w-3" />
                  <span>Install</span>
                </button>
              )}

              {Notification.permission !== 'granted' && (
                <button
                  onClick={handleNotificationPermission}
                  className="flex items-center space-x-1 text-blue-600"
                >
                  <Bell className="h-3 w-3" />
                  <span>Notifications</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Side Menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SJ</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">SquidJob</h2>
                <p className="text-xs text-gray-500">Tender Management</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-4">
              {navigationItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>

            {/* PWA Settings */}
            <div className="mt-6 px-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">PWA Settings</h3>
              <div className="space-y-2">
                {pwaState.canInstall && !pwaState.isInstalled && (
                  <button
                    onClick={handleInstall}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg hover:bg-gray-50"
                  >
                    <Smartphone className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Install App</span>
                  </button>
                )}

                {pwaState.isUpdateAvailable && (
                  <button
                    onClick={pwaActions.checkForUpdates}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg hover:bg-gray-50"
                  >
                    <Download className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Update Available</span>
                  </button>
                )}

                {Notification.permission !== 'granted' && (
                  <button
                    onClick={handleNotificationPermission}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg hover:bg-gray-50"
                  >
                    <Bell className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Enable Notifications</span>
                  </button>
                )}

                {pwaState.offlineData.length > 0 && (
                  <button
                    onClick={handleSync}
                    disabled={pwaState.syncStatus === 'syncing'}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Upload className="h-5 w-5 text-orange-600" />
                    <span className="text-sm">
                      Sync Offline Data ({pwaState.offlineData.length})
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p>Version 1.0.0</p>
              <p>PWA Mode: {pwaState.isInstalled ? 'Installed' : 'Browser'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-center space-x-3">
            <Smartphone className="h-8 w-8 text-purple-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Install SquidJob</h3>
              <p className="text-sm text-gray-600">Add to home screen for quick access</p>
            </div>
          </div>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium"
            >
              Not Now
            </button>
          </div>
        </div>
      )}

      {/* Bottom spacing for mobile navigation */}
      <div className="h-24" />
    </>
  );
} 