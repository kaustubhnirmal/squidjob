import React, { useState, useEffect } from 'react';
import { usePWA } from '../../hooks/use-pwa';
import { useOfflineStorage } from '../../hooks/use-offline-storage';
import { 
  WifiOff, 
  RefreshCw, 
  FileText, 
  Plus, 
  Search, 
  Settings,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface OfflineFallbackProps {
  className?: string;
}

interface OfflineAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  available: boolean;
}

export function OfflineFallback({ className = '' }: OfflineFallbackProps) {
  const [pwaState, pwaActions] = usePWA();
  const [storageState, storageActions] = useOfflineStorage();
  const [offlineData, setOfflineData] = useState<any[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Load offline data
    const loadOfflineData = async () => {
      const data = await pwaActions.getOfflineData();
      setOfflineData(data);
    };

    loadOfflineData();
    
    // Get last sync time from localStorage
    const syncTime = localStorage.getItem('last-sync-time');
    if (syncTime) {
      setLastSyncTime(new Date(parseInt(syncTime)));
    }
  }, [pwaActions]);

  const handleSync = async () => {
    await pwaActions.syncOfflineData();
    setLastSyncTime(new Date());
    localStorage.setItem('last-sync-time', Date.now().toString());
    
    // Reload offline data
    const data = await pwaActions.getOfflineData();
    setOfflineData(data);
  };

  const handleCreateOfflineTender = () => {
    // Navigate to offline tender creation
    window.location.href = '/tenders/new?offline=true';
  };

  const handleViewOfflineTenders = () => {
    // Navigate to offline tenders list
    window.location.href = '/tenders?offline=true';
  };

  const handleClearOfflineData = async () => {
    if (confirm('Are you sure you want to clear all offline data? This action cannot be undone.')) {
      await pwaActions.clearOfflineData();
      setOfflineData([]);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const offlineActions: OfflineAction[] = [
    {
      id: 'create-tender',
      title: 'Create New Tender',
      description: 'Start a new tender offline',
      icon: <Plus className="h-5 w-5" />,
      action: handleCreateOfflineTender,
      available: true
    },
    {
      id: 'view-tenders',
      title: 'View Offline Tenders',
      description: `View ${offlineData.filter(d => d.type === 'tender').length} saved tenders`,
      icon: <FileText className="h-5 w-5" />,
      action: handleViewOfflineTenders,
      available: offlineData.filter(d => d.type === 'tender').length > 0
    },
    {
      id: 'sync',
      title: 'Sync When Online',
      description: 'Sync offline data when connection is restored',
      icon: <Upload className="h-5 w-5" />,
      action: handleSync,
      available: offlineData.length > 0
    },
    {
      id: 'clear-data',
      title: 'Clear Offline Data',
      description: 'Remove all offline data',
      icon: <Settings className="h-5 w-5" />,
      action: handleClearOfflineData,
      available: offlineData.length > 0
    }
  ];

  return (
    <div className={`offline-fallback min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <WifiOff className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">You're Offline</h1>
            <p className="text-sm text-gray-600">
              Some features are limited, but you can still work with saved data
            </p>
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Offline Status</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 font-medium">Offline</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Offline Data:</span>
              <span className="ml-2 font-medium">{offlineData.length} items</span>
            </div>
            <div>
              <span className="text-gray-600">Storage:</span>
              <span className="ml-2 font-medium">
                {storageState.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            {lastSyncTime && (
              <div className="col-span-2">
                <span className="text-gray-600">Last Sync:</span>
                <span className="ml-2 font-medium">{formatTimeAgo(lastSyncTime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Available Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Available Actions</h2>
          
          {offlineActions.map((action) => (
            <div
              key={action.id}
              className={`bg-white rounded-lg border border-gray-200 p-4 ${
                action.available ? 'cursor-pointer hover:border-purple-300 hover:shadow-sm' : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={action.available ? action.action : undefined}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  action.available ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                {action.available && (
                  <div className="text-purple-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Offline Data Summary */}
        {offlineData.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Offline Data Summary</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="space-y-3">
                {offlineData.filter(d => d.type === 'tender').length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Tenders</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {offlineData.filter(d => d.type === 'tender').length}
                    </span>
                  </div>
                )}
                
                {offlineData.filter(d => d.type === 'form').length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">Forms</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {offlineData.filter(d => d.type === 'form').length}
                    </span>
                  </div>
                )}
                
                {offlineData.filter(d => d.type === 'user').length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">User Data</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {offlineData.filter(d => d.type === 'user').length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <h3 className="font-medium text-blue-900">Waiting for Connection</h3>
                <p className="text-sm text-blue-700">
                  The app will automatically sync when you're back online
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Offline Tips</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Work Offline</h4>
                <p className="text-sm text-gray-600">
                  Create and edit tenders offline. They'll sync when you're back online.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Automatic Sync</h4>
                <p className="text-sm text-gray-600">
                  Changes are automatically synced when your connection is restored.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Limited Features</h4>
                <p className="text-sm text-gray-600">
                  Some features like real-time updates and external API calls are unavailable offline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 