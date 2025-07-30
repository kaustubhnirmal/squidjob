import React from 'react';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TenderStatusProps {
  status: string | undefined | null;
  updatedAt?: Date | string;
  className?: string;
}

const getStatusConfig = (status: string | undefined | null) => {
  if (!status || typeof status !== 'string') {
    return {
      icon: AlertCircle,
      text: 'Unknown',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-300'
    };
  }
  
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'won':
    case 'awarded':
      return {
        icon: Check,
        text: 'Won',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        borderColor: 'border-green-300'
      };
    
    case 'lost':
    case 'rejected':
      return {
        icon: X,
        text: 'Lost',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        borderColor: 'border-red-300'
      };
    
    case 'submitted':
      return {
        icon: Check,
        text: 'Submitted',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-300'
      };
    
    case 'in-process':
    case 'in process':
      return {
        icon: Clock,
        text: 'In Process',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        borderColor: 'border-orange-300'
      };
    
    case 'new':
      return {
        icon: AlertCircle,
        text: 'New',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        borderColor: 'border-purple-300'
      };
    
    case 'live':
      return {
        icon: AlertCircle,
        text: 'Live',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600',
        borderColor: 'border-yellow-300'
      };
    
    default:
      return {
        icon: AlertCircle,
        text: status,
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-300'
      };
  }
};

export function TenderStatus({ status, updatedAt, className = '' }: TenderStatusProps) {
  const config = getStatusConfig(status);
  const IconComponent = config.icon;
  
  const formatDate = (date: Date | string) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm');
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
        <IconComponent className="h-4 w-4" />
        <span className="font-medium">{config.text}</span>
      </div>
      
      {updatedAt && (
        <span className="text-sm text-gray-600">
          {formatDate(updatedAt)}
        </span>
      )}
    </div>
  );
}