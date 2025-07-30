import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Star,
  Archive,
  Trash2,
  MoreVertical,
  ExternalLink,
  Reply,
  Share2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: number;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  data?: {
    tenderId?: string;
    bidId?: string;
    actionUrl?: string;
    [key: string]: any;
  };
  channels: string[];
  engagementScore?: number;
}

interface NotificationItemProps {
  notification: Notification;
  selected: boolean;
  onSelect: (notificationId: string, checked: boolean) => void;
  onMarkAsRead: () => void;
  onMarkAsUnread: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function NotificationItem({
  notification,
  selected,
  onSelect,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onDelete
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get priority color and icon
  const getPriorityInfo = (priority: number) => {
    if (priority >= 80) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: AlertCircle,
        label: 'High Priority'
      };
    } else if (priority >= 50) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: Clock,
        label: 'Medium Priority'
      };
    } else {
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: Info,
        label: 'Low Priority'
      };
    }
  };

  // Get notification type icon
  const getTypeIcon = (type: string) => {
    const typeIcons: { [key: string]: any } = {
      'tender_published': CheckCircle,
      'tender_updated': Info,
      'tender_cancelled': X,
      'deadline_reminder': Clock,
      'bid_submitted': CheckCircle,
      'bid_accepted': CheckCircle,
      'bid_rejected': X,
      'document_uploaded': Info,
      'status_change': Info,
      'general_update': Info
    };
    return typeIcons[type] || Info;
  };

  // Get notification type color
  const getTypeColor = (type: string) => {
    const typeColors: { [key: string]: string } = {
      'tender_published': 'text-green-600 bg-green-50',
      'tender_updated': 'text-blue-600 bg-blue-50',
      'tender_cancelled': 'text-red-600 bg-red-50',
      'deadline_reminder': 'text-orange-600 bg-orange-50',
      'bid_submitted': 'text-green-600 bg-green-50',
      'bid_accepted': 'text-green-600 bg-green-50',
      'bid_rejected': 'text-red-600 bg-red-50',
      'document_uploaded': 'text-blue-600 bg-blue-50',
      'status_change': 'text-purple-600 bg-purple-50',
      'general_update': 'text-gray-600 bg-gray-50'
    };
    return typeColors[type] || 'text-gray-600 bg-gray-50';
  };

  const priorityInfo = getPriorityInfo(notification.priority);
  const TypeIcon = getTypeIcon(notification.type);
  const typeColor = getTypeColor(notification.type);

  const handleAction = (action: string) => {
    switch (action) {
      case 'mark-read':
        onMarkAsRead();
        break;
      case 'mark-unread':
        onMarkAsUnread();
        break;
      case 'archive':
        onArchive();
        break;
      case 'delete':
        onDelete();
        break;
      case 'reply':
        // Handle reply action
        break;
      case 'share':
        // Handle share action
        break;
      case 'open':
        if (notification.data?.actionUrl) {
          window.open(notification.data.actionUrl, '_blank');
        }
        break;
    }
  };

  return (
    <div
      className={`notification-item p-4 hover:bg-gray-50 transition-colors ${
        !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      } ${selected ? 'bg-blue-100' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(notification.id, checked as boolean)}
          className="mt-1"
        />

        {/* Avatar */}
        <Avatar className="h-8 w-8">
          <AvatarImage src={notification.sender?.avatar} />
          <AvatarFallback>
            {notification.sender?.name?.charAt(0) || 'N'}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-sm">
                  {notification.sender?.name || 'System'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
                {notification.priority >= 80 && (
                  <Badge variant="destructive" className="text-xs">
                    Urgent
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h4 className={`text-sm font-medium mb-1 ${
                !notification.isRead ? 'text-gray-900' : 'text-gray-600'
              }`}>
                {notification.title}
              </h4>

              {/* Message */}
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {notification.message}
              </p>

              {/* Metadata */}
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                {/* Type */}
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${typeColor}`}>
                  <TypeIcon className="h-3 w-3" />
                  <span>{notification.type.replace('_', ' ')}</span>
                </div>

                {/* Priority */}
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${priorityInfo.bgColor}`}>
                  <priorityInfo.icon className={`h-3 w-3 ${priorityInfo.color}`} />
                  <span className={priorityInfo.color}>{priorityInfo.label}</span>
                </div>

                {/* Channels */}
                {notification.channels.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span>via:</span>
                    {notification.channels.map((channel, index) => (
                      <Badge key={channel} variant="outline" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Engagement Score */}
                {notification.engagementScore && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{notification.engagementScore}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1">
              {/* Quick Actions */}
              {isHovered && (
                <div className="flex items-center space-x-1">
                  {!notification.isRead ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction('mark-read')}
                      className="h-6 w-6 p-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction('mark-unread')}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}

                  {notification.data?.actionUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction('open')}
                      className="h-6 w-6 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!notification.isRead ? (
                    <DropdownMenuItem onClick={() => handleAction('mark-read')}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark as read
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleAction('mark-unread')}>
                      <X className="h-4 w-4 mr-2" />
                      Mark as unread
                    </DropdownMenuItem>
                  )}

                  {notification.data?.actionUrl && (
                    <DropdownMenuItem onClick={() => handleAction('open')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open details
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => handleAction('reply')}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => handleAction('share')}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => handleAction('archive')}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={() => handleAction('delete')}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Related Data */}
          {notification.data && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md">
              <div className="text-xs text-gray-600">
                {notification.data.tenderId && (
                  <div>Tender ID: {notification.data.tenderId}</div>
                )}
                {notification.data.bidId && (
                  <div>Bid ID: {notification.data.bidId}</div>
                )}
                {Object.entries(notification.data)
                  .filter(([key]) => !['tenderId', 'bidId', 'actionUrl'].includes(key))
                  .map(([key, value]) => (
                    <div key={key}>{key}: {String(value)}</div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 