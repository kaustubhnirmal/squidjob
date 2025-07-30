/**
 * Enhanced Dashboard Widget Component
 * 
 * A comprehensive, interactive dashboard widget system for the SquidJob tender management system.
 * Features include real-time data updates, drag & drop reordering, export functionality,
 * full-screen modal view, theme toggle, and performance optimization for 1000+ data points.
 * 
 * @author SquidJob Development Team
 * @version 2.0.0
 * @since 2025-01-01
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  Maximize2, 
  Download, 
  Settings, 
  Moon, 
  Sun,
  AlertCircle
} from 'lucide-react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from 'react-beautiful-dnd';
import { 
  StatsWidget, 
  ChartWidget, 
  TimelineWidget, 
  CountdownWidget, 
  InsightsWidget 
} from './widget-components';

// TypeScript Interfaces
interface WidgetData {
  id: string;
  type: 'stats' | 'chart' | 'timeline' | 'countdown' | 'insights';
  title: string;
  data: any;
  config?: WidgetConfig;
  lastUpdated: Date;
  refreshInterval?: number; // in seconds
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

interface EnhancedDashboardWidgetProps {
  /** Unique identifier for the widget */
  widgetId: string;
  /** Widget type determines the rendering component */
  widgetType: WidgetData['type'];
  /** Widget title displayed in the header */
  title: string;
  /** Initial data for the widget */
  initialData?: any;
  /** Configuration options for the widget */
  config?: WidgetConfig;
  /** CSS class name for styling */
  className?: string;
  /** Callback when widget data is updated */
  onDataUpdate?: (data: any) => void;
  /** Callback when widget is reordered */
  onReorder?: (widgetId: string, newIndex: number) => void;
  /** Whether the widget is in edit mode */
  isEditMode?: boolean;
  /** Whether to show loading states */
  showLoading?: boolean;
  /** Custom error message */
  errorMessage?: string;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  light: string;
  dark: string;
  background: string;
  text: string;
}

// Color schemes for different widget types
const COLOR_SCHEMES = {
  purple: {
    primary: '#7c3aed',
    secondary: '#8b5cf6',
    light: '#a78bfa',
    dark: '#5b21b6',
    background: '#faf5ff',
    text: '#4c1d95'
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#60a5fa',
    light: '#93c5fd',
    dark: '#1d4ed8',
    background: '#eff6ff',
    text: '#1e40af'
  },
  green: {
    primary: '#10b981',
    secondary: '#34d399',
    light: '#6ee7b7',
    dark: '#059669',
    background: '#ecfdf5',
    text: '#047857'
  },
  orange: {
    primary: '#f59e0b',
    secondary: '#fbbf24',
    light: '#fcd34d',
    dark: '#d97706',
    background: '#fffbeb',
    text: '#b45309'
  },
  red: {
    primary: '#ef4444',
    secondary: '#f87171',
    light: '#fca5a5',
    dark: '#dc2626',
    background: '#fef2f2',
    text: '#b91c1c'
  }
};

/**
 * Enhanced Dashboard Widget Component
 * 
 * A comprehensive widget system that supports multiple widget types with real-time updates,
 * drag & drop functionality, export capabilities, and theme switching.
 */
export function EnhancedDashboardWidget({
  widgetId,
  widgetType,
  title,
  initialData,
  config = {},
  className = '',
  onDataUpdate,
  onReorder,
  isEditMode = false,
  showLoading = false,
  errorMessage
}: EnhancedDashboardWidgetProps) {
  // State management
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(config.autoRefresh ?? true);
  const [refreshInterval, setRefreshInterval] = useState(config.refreshInterval ?? 30);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage || null);

  // Query client for data management
  const queryClient = useQueryClient();

  // Data fetching with React Query
  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey: [`widget-${widgetId}`, widgetType],
    queryFn: async () => {
      // Simulate API call - replace with actual endpoint
      const response = await fetch(`/api/dashboard/widgets/${widgetId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch widget data');
      }
      return response.json();
    },
    initialData,
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Error boundary effect
  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch]);

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Color scheme based on config
  const colorScheme = useMemo(() => {
    return COLOR_SCHEMES[config.colorScheme || 'purple'];
  }, [config.colorScheme]);

  // Handle export functionality
  const handleExport = useCallback(async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would implement actual export logic
      console.log(`Exporting widget ${widgetId} as ${format}`);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = `data:text/${format};charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
      link.download = `${widgetId}-${format}.${format}`;
      link.click();
    } catch (error) {
      setError('Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [widgetId, data]);

  // Handle full screen toggle
  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  // Handle theme toggle
  const toggleTheme = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode]);

  // Handle drag end for reordering
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.index !== destination.index) {
      onReorder?.(widgetId, destination.index);
    }
  }, [widgetId, onReorder]);

  // Render loading skeleton
  if (isLoading || showLoading) {
    return (
      <Card className={`widget-skeleton ${className}`}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className={`widget-error ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Widget Error</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Widget content based on type
  const renderWidgetContent = () => {
    switch (widgetType) {
      case 'stats':
        return <StatsWidget data={data} colorScheme={colorScheme} />;
      case 'chart':
        return <ChartWidget data={data} config={config} colorScheme={colorScheme} />;
      case 'timeline':
        return <TimelineWidget data={data} colorScheme={colorScheme} />;
      case 'countdown':
        return <CountdownWidget data={data} colorScheme={colorScheme} />;
      case 'insights':
        return <InsightsWidget data={data} colorScheme={colorScheme} />;
      default:
        return <div>Unknown widget type: {widgetType}</div>;
    }
  };

  // Widget header with controls
  const renderWidgetHeader = () => (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-lg font-semibold" style={{ color: colorScheme.text }}>
        {title}
      </CardTitle>
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-8 w-8 p-0"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Auto-refresh Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            checked={autoRefresh}
            onCheckedChange={setAutoRefresh}
            className="scale-75"
          />
          <span className="text-xs text-gray-500">Auto</span>
        </div>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Full Screen Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullScreen}
          className="h-8 w-8 p-0"
          aria-label="Toggle full screen"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setRefreshInterval(15)}>
              15s refresh
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRefreshInterval(30)}>
              30s refresh
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRefreshInterval(60)}>
              1m refresh
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
  );

  // Main widget component with drag & drop support
  const widgetContent = (
    <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
      <DialogTrigger asChild>
        <Card 
          className={`enhanced-widget ${className} transition-all duration-200 hover:shadow-lg`}
          style={{
            background: `linear-gradient(135deg, ${colorScheme.background} 0%, white 100%)`,
            borderColor: colorScheme.light
          }}
        >
          {renderWidgetHeader()}
          <CardContent className="pt-0">
            {renderWidgetContent()}
          </CardContent>
        </Card>
      </DialogTrigger>
      
      {/* Full Screen Modal */}
      <DialogContent className="max-w-7xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {renderWidgetContent()}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Return with drag & drop wrapper if in edit mode
  if (isEditMode) {
    return (
      <Draggable draggableId={widgetId} index={0}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
          >
            {widgetContent}
          </div>
        )}
      </Draggable>
    );
  }

  return widgetContent;
}

// Export the main component
export default EnhancedDashboardWidget; 