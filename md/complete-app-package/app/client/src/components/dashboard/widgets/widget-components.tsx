/**
 * Widget Components for Enhanced Dashboard
 * 
 * Individual widget components that render different types of dashboard widgets
 * with proper TypeScript interfaces, accessibility compliance, and performance optimization.
 * 
 * @author SquidJob Development Team
 * @version 2.0.0
 * @since 2025-01-01
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Target,
  Brain,
  Activity,
  Bell
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// TypeScript Interfaces
interface StatsCardData {
  title: string;
  value: number | string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  color: string;
  percentage?: number;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface TimelineData {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'success' | 'warning' | 'error' | 'info';
  user?: {
    name: string;
    avatar?: string;
  };
}

interface CountdownData {
  title: string;
  deadline: Date;
  progress: number; // 0-100
  status: 'urgent' | 'warning' | 'normal';
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

interface InsightsData {
  title: string;
  description: string;
  confidence: number; // 0-100
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  }>;
}

interface WidgetConfig {
  showTrend?: boolean;
  showPercentage?: boolean;
  chartType?: 'line' | 'area' | 'bar' | 'pie';
  colorScheme?: 'purple' | 'blue' | 'green' | 'orange' | 'red';
  autoRefresh?: boolean;
  exportEnabled?: boolean;
  fullScreenEnabled?: boolean;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  light: string;
  dark: string;
  background: string;
  text: string;
}

/**
 * Statistics Widget Component
 * Displays key metrics with animated counters and trend indicators
 */
export function StatsWidget({ 
  data, 
  colorScheme 
}: { 
  data: StatsCardData[], 
  colorScheme: ColorScheme 
}) {
  const [counters, setCounters] = useState<{ [key: string]: number }>({});

  // Animate counters on mount
  useEffect(() => {
    data.forEach((item, index) => {
      setTimeout(() => {
        setCounters(prev => ({
          ...prev,
          [item.title]: typeof item.value === 'number' ? item.value : 0
        }));
      }, index * 200);
    });
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((item, index) => (
        <div
          key={item.title}
          className="stat-card p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
          style={{ borderColor: colorScheme.light }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: colorScheme.background }}
              >
                {item.icon}
              </div>
              <span className="text-sm font-medium text-gray-600">{item.title}</span>
            </div>
            {item.trend && (
              <div className="flex items-center gap-1">
                {item.trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${
                  item.trend.isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {item.trend.value}%
                </span>
              </div>
            )}
          </div>
          
          <div className="text-2xl font-bold" style={{ color: colorScheme.primary }}>
            {typeof item.value === 'number' ? (
              counters[item.title]?.toLocaleString() || '0'
            ) : (
              item.value
            )}
          </div>
          
          {item.percentage && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: colorScheme.primary
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {item.percentage}% complete
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Chart Widget Component
 * Displays various chart types with Recharts library
 */
export function ChartWidget({ 
  data, 
  config, 
  colorScheme 
}: { 
  data: ChartData[], 
  config: WidgetConfig, 
  colorScheme: ColorScheme 
}) {
  const chartType = config.chartType || 'line';

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={colorScheme.primary}
                strokeWidth={2}
                dot={{ fill: colorScheme.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                fill={colorScheme.light}
                stroke={colorScheme.primary}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={colorScheme.primary} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill={colorScheme.primary}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorScheme.light} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="chart-container">
      {renderChart()}
    </div>
  );
}

/**
 * Timeline Widget Component
 * Displays recent activities with avatars and timestamps
 */
export function TimelineWidget({ 
  data, 
  colorScheme 
}: { 
  data: TimelineData[], 
  colorScheme: ColorScheme 
}) {
  const getStatusIcon = (type: TimelineData['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="timeline-container space-y-4">
      {data.map((item) => (
        <div key={item.id} className="timeline-item flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {item.user?.avatar ? (
              <img
                src={item.user.avatar}
                alt={item.user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: colorScheme.primary }}
              >
                {item.user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{item.user?.name || 'System'}</span>
              {getStatusIcon(item.type)}
            </div>
            <p className="text-sm text-gray-700 mb-1">{item.description}</p>
            <span className="text-xs text-gray-500">{formatTimeAgo(item.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Countdown Widget Component
 * Displays deadline countdowns with progress indicators
 */
export function CountdownWidget({ 
  data, 
  colorScheme 
}: { 
  data: CountdownData[], 
  colorScheme: ColorScheme 
}) {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

  // Calculate time remaining for each countdown
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const newTimeLeft: { [key: string]: number } = {};

      data.forEach(item => {
        const deadline = new Date(item.deadline).getTime();
        const difference = deadline - now;

        if (difference > 0) {
          newTimeLeft[item.title] = difference;
        } else {
          newTimeLeft[item.title] = 0;
        }
      });

      setTimeLeft(newTimeLeft);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [data]);

  const formatTimeLeft = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: CountdownData['status']) => {
    switch (status) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="countdown-container space-y-4">
      {data.map((item) => (
        <div
          key={item.title}
          className={`countdown-item p-4 rounded-lg border transition-all duration-200 ${getStatusColor(item.status)}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">{item.title}</h4>
            <Badge variant="outline" className={getStatusColor(item.status)}>
              {item.status}
            </Badge>
          </div>

          <div className="mb-3">
            <div className="text-2xl font-bold" style={{ color: colorScheme.primary }}>
              {timeLeft[item.title] ? formatTimeLeft(timeLeft[item.title]) : 'Expired'}
            </div>
            <div className="text-sm text-gray-500">
              Due: {new Date(item.deadline).toLocaleDateString()}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${item.progress}%`,
                  backgroundColor: colorScheme.primary
                }}
              />
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {item.progress}% complete
            </span>
          </div>

          {/* Action Buttons */}
          {item.actions && (
            <div className="flex gap-2">
              {item.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Insights Widget Component
 * Displays AI-powered insights with action buttons
 */
export function InsightsWidget({ 
  data, 
  colorScheme 
}: { 
  data: InsightsData[], 
  colorScheme: ColorScheme 
}) {
  return (
    <div className="insights-container space-y-4">
      {data.map((insight, index) => (
        <div
          key={index}
          className="insight-item p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
          style={{ borderColor: colorScheme.light }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" style={{ color: colorScheme.primary }} />
              <h4 className="font-medium">{insight.title}</h4>
            </div>
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ 
                color: colorScheme.primary,
                borderColor: colorScheme.light
              }}
            >
              {insight.confidence}% confidence
            </Badge>
          </div>

          <p className="text-sm text-gray-600 mb-4">{insight.description}</p>

          <div className="flex gap-2 flex-wrap">
            {insight.actions.map((action, actionIndex) => (
              <Button
                key={actionIndex}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                className="text-xs"
                style={{
                  ...(action.variant === 'default' && {
                    backgroundColor: colorScheme.primary,
                    color: 'white'
                  })
                }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 