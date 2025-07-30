import React from 'react';
import { usePWA } from '../../hooks/use-pwa';
import { useOfflineStorage } from '../../hooks/use-offline-storage';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Smartphone,
  Settings
} from 'lucide-react';

interface PWAStatusBarProps {
  className?: string;
  showDetails?: boolean;
}

export function PWAStatusBar({ className = '', showDetails = false }: PWAStatusBarProps) {
  const [pwaState, pwaActions] = usePWA();
  const [storageState, storageActions] = useOfflineStorage();

  const getStatusIcon = () => {
    if (!pwaState.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    switch (pwaState.syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusText = () => {
    if (!pwaState.isOnline) {
      return 'Offline';
    }
    
    switch (pwaState.syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'completed':
        return 'Synced';
      case 'error':
        return 'Sync Error';
      default:
        return 'Online';
    }
  };

  const handleSync = async () => {
    await pwaActions.syncOfflineData();
  };

  const handleInstall = async () => {
    await pwaActions.installApp();
  };

  const formatStorageSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`pwa-status-bar bg-white border-b border-gray-200 px-4 py-2 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Status Indicators */}
        <div className="flex items-center space-x-4">
          {/* Online/Offline Status */}
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm font-medium text-gray-700">
              {getStatusText()}
            </span>
          </div>

          {/* PWA Install Status */}
          {pwaState.canInstall && !pwaState.isInstalled && (
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4 text-purple-500" />
              <button
                onClick={handleInstall}
                className="text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                Install App
              </button>
            </div>
          )}

          {/* Update Available */}
          {pwaState.isUpdateAvailable && (
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4 text-blue-500" />
              <button
                onClick={pwaActions.checkForUpdates}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Update Available
              </button>
            </div>
          )}

          {/* Sync Button */}
          {pwaState.offlineData.length > 0 && (
            <div className="flex items-center space-x-2">
              <Upload className="h-4 w-4 text-orange-500" />
              <button
                onClick={handleSync}
                disabled={pwaState.syncStatus === 'syncing'}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50"
              >
                Sync ({pwaState.offlineData.length})
              </button>
            </div>
          )}
        </div>

        {/* Storage Info */}
        {showDetails && storageState.isAvailable && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {formatStorageSize(storageState.storageSize)} • {storageState.itemCount} items
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Status (when expanded) */}
      {showDetails && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">Service Worker:</span>
              <span className={`ml-1 ${pwaState.isServiceWorkerRegistered ? 'text-green-600' : 'text-red-600'}`}>
                {pwaState.isServiceWorkerRegistered ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="font-medium">PWA Mode:</span>
              <span className={`ml-1 ${pwaState.isInstalled ? 'text-green-600' : 'text-gray-600'}`}>
                {pwaState.isInstalled ? 'Installed' : 'Browser'}
              </span>
            </div>
            <div>
              <span className="font-medium">Storage:</span>
              <span className={`ml-1 ${storageState.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {storageState.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div>
              <span className="font-medium">Notifications:</span>
              <span className="ml-1 text-gray-600">
                {Notification.permission === 'granted' ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 