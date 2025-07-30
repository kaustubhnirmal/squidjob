// Template: TenderCard.jsx
// Reusable tender card component for list and grid displays

import React from 'react';
import { Calendar, Building, MapPin, DollarSign, Users, Eye, Edit, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

/**
 * TenderCard Component
 * @param {Object} tender - Tender data object
 * @param {Function} onSelect - Handler for card selection
 * @param {Function} onEdit - Handler for edit action
 * @param {Function} onDelete - Handler for delete action
 * @param {string} variant - Card variant: 'default' | 'compact' | 'mobile'
 * @param {string} className - Additional CSS classes
 */
export const TenderCard = ({
  tender,
  onSelect,
  onEdit,
  onDelete,
  variant = 'default',
  className = ''
}) => {
  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      live: 'bg-green-100 text-green-800',
      in_process: 'bg-blue-100 text-blue-800',
      submitted: 'bg-yellow-100 text-yellow-800',
      awarded: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  // Compact variant for sidebar or small spaces
  if (variant === 'compact') {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}
        onClick={() => onSelect(tender)}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{tender.title}</h4>
          <Badge className={`text-xs ${getStatusColor(tender.status)}`}>
            {tender.status}
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mb-2">{tender.referenceNo}</p>
        <div className="flex items-center text-xs text-gray-600">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{getDaysRemaining(tender.deadline)}</span>
        </div>
      </div>
    );
  }

  // Mobile variant for responsive design
  if (variant === 'mobile') {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-4 active:bg-gray-50 ${className}`}
        onClick={() => onSelect(tender)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{tender.title}</h3>
            <p className="text-sm text-gray-600">{tender.referenceNo}</p>
          </div>
          <Badge className={`text-xs ml-2 ${getStatusColor(tender.status)}`}>
            {tender.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Building className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{tender.authority}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{formatDate(tender.deadline)}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              getDaysRemaining(tender.deadline).includes('Expired') ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {getDaysRemaining(tender.deadline)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            {tender.assignments?.slice(0, 2).map((assignment) => (
              <Avatar key={assignment.id} className="w-6 h-6">
                <AvatarImage src={assignment.user.avatar} />
                <AvatarFallback className="text-xs">
                  {assignment.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {tender.assignments?.length > 2 && (
              <span className="text-xs text-gray-500">+{tender.assignments.length - 2}</span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant for desktop displays
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 
            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 line-clamp-2"
            onClick={() => onSelect(tender)}
          >
            {tender.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{tender.referenceNo}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Badge className={getStatusColor(tender.status)}>
            {tender.status.replace('_', ' ')}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSelect(tender)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(tender)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Tender
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(tender)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card Content */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Building className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{tender.authority}</span>
        </div>
        
        {tender.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{tender.location}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Deadline: {formatDate(tender.deadline)}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            getDaysRemaining(tender.deadline).includes('Expired') 
              ? 'bg-red-100 text-red-800' 
              : getDaysRemaining(tender.deadline).includes('Today')
              ? 'bg-orange-100 text-orange-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {getDaysRemaining(tender.deadline)}
          </span>
        </div>

        {tender.estimatedValue && (
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Est. Value: {formatCurrency(tender.estimatedValue)}</span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {tender.assignments?.slice(0, 3).map((assignment) => (
              <Avatar key={assignment.id} className="w-7 h-7">
                <AvatarImage src={assignment.user.avatar} />
                <AvatarFallback className="text-xs">
                  {assignment.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {tender.assignments?.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-600">+{tender.assignments.length - 3}</span>
              </div>
            )}
          </div>
          {tender.assignments?.length > 0 && (
            <span className="text-xs text-gray-500">
              {tender.assignments.length} assigned
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSelect(tender)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(tender)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TenderCard;