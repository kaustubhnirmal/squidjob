import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  Search, 
  Filter, 
  MoreVertical, 
  Check, 
  X, 
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Star,
  Archive,
  Trash2,
  Settings,
  Download
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { NotificationItem } from './NotificationItem';
import { NotificationFilters } from './NotificationFilters';
import { NotificationSettings } from './NotificationSettings';
import { NotificationAnalytics } from './NotificationAnalytics';
import { useNotifications } from '../../hooks/use-notifications';
import { useNotificationPreferences } from '../../hooks/use-notification-preferences';

interface NotificationCenterProps {
  className?: string;
  showUnreadCount?: boolean;
  maxNotifications?: number;
}

export function NotificationCenter({ 
  className = '', 
  showUnreadCount = true,
  maxNotifications = 50 
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all',
    dateRange: 'all'
  });

  const queryClient = useQueryClient();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error 
  } = useNotifications();
  
  const { 
    preferences, 
    updatePreferences 
  } = useNotificationPreferences();

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mark as unread mutation
  const markAsUnreadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await fetch('/api/notifications/mark-unread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Delete notifications mutation
  const deleteNotificationsMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setSelectedNotifications([]);
    }
  });

  // Archive notifications mutation
  const archiveNotificationsMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await fetch('/api/notifications/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setSelectedNotifications([]);
    }
  });

  // Filter notifications based on search and filters
  const filteredNotifications = useCallback(() => {
    if (!notifications) return [];

    return notifications.filter(notification => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          notification.title.toLowerCase().includes(searchLower) ||
          notification.message.toLowerCase().includes(searchLower) ||
          notification.type.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Tab filter
      if (activeTab === 'unread' && notification.isRead) return false;
      if (activeTab === 'read' && !notification.isRead) return false;
      if (activeTab === 'archived' && !notification.isArchived) return false;

      // Type filter
      if (filters.type !== 'all' && notification.type !== filters.type) return false;

      // Status filter
      if (filters.status !== 'all') {
        if (filters.status === 'urgent' && notification.priority < 80) return false;
        if (filters.status === 'normal' && notification.priority >= 80) return false;
      }

      // Priority filter
      if (filters.priority !== 'all') {
        const priorityRanges = {
          high: [80, 100],
          medium: [50, 79],
          low: [1, 49]
        };
        const range = priorityRanges[filters.priority as keyof typeof priorityRanges];
        if (range && (notification.priority < range[0] || notification.priority > range[1])) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const notificationDate = new Date(notification.createdAt);
        const diffInHours = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);
        
        const dateRanges = {
          '1h': 1,
          '24h': 24,
          '7d': 168,
          '30d': 720
        };
        
        const maxHours = dateRanges[filters.dateRange as keyof typeof dateRanges];
        if (maxHours && diffInHours > maxHours) return false;
      }

      return true;
    });
  }, [notifications, searchQuery, activeTab, filters]);

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedNotifications.length === 0) return;

    switch (action) {
      case 'mark-read':
        markAsReadMutation.mutate(selectedNotifications);
        break;
      case 'mark-unread':
        markAsUnreadMutation.mutate(selectedNotifications);
        break;
      case 'archive':
        archiveNotificationsMutation.mutate(selectedNotifications);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete the selected notifications?')) {
          deleteNotificationsMutation.mutate(selectedNotifications);
        }
        break;
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(filteredNotifications().map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  // Handle individual selection
  const handleSelectNotification = (notificationId: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, notificationId]);
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    }
  };

  const filteredNotificationsList = filteredNotifications();

  return (
    <div className={`notification-center ${className}`}>
      {/* Notification Bell with Badge */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {showUnreadCount && unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notification Panel */}
        {isOpen && (
          <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsReadMutation.mutate(
                      filteredNotificationsList
                        .filter(n => !n.isRead)
                        .map(n => n.id)
                    )}
                    disabled={!filteredNotificationsList.some(n => !n.isRead)}
                  >
                    Mark all read
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsOpen(false)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="read">Read</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-gray-200">
              <NotificationFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.length} selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('mark-read')}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark Read
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('archive')}
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('delete')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading notifications...
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  Error loading notifications
                </div>
              ) : filteredNotificationsList.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications found
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {/* Select All */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedNotifications.length === filteredNotificationsList.length}
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="text-sm text-gray-600">Select all</span>
                    </div>
                  </div>

                  {/* Notification Items */}
                  {filteredNotificationsList.slice(0, maxNotifications).map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      selected={selectedNotifications.includes(notification.id)}
                      onSelect={handleSelectNotification}
                      onMarkAsRead={() => markAsReadMutation.mutate([notification.id])}
                      onMarkAsUnread={() => markAsUnreadMutation.mutate([notification.id])}
                      onArchive={() => archiveNotificationsMutation.mutate([notification.id])}
                      onDelete={() => deleteNotificationsMutation.mutate([notification.id])}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {filteredNotificationsList.length} of {notifications?.length || 0} notifications
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="hidden">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
          </DialogHeader>
          <NotificationSettings
            preferences={preferences}
            onPreferencesChange={updatePreferences}
          />
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="hidden">
            <Info className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Notification Analytics</DialogTitle>
          </DialogHeader>
          <NotificationAnalytics />
        </DialogContent>
      </Dialog>
    </div>
  );
} 