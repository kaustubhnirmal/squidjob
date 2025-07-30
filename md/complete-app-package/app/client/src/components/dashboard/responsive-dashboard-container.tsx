import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export interface WidgetConfig {
  id: string;
  title: string;
  visible: boolean;
}

interface ResponsiveDashboardContainerProps {
  widgets: WidgetConfig[];
  renderWidget: (config: WidgetConfig, className?: string) => React.ReactNode;
  className?: string;
}

export function ResponsiveDashboardContainer({ 
  widgets, 
  renderWidget, 
  className 
}: ResponsiveDashboardContainerProps) {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [widgetVisibility, setWidgetVisibility] = useState<Record<string, boolean>>(() => {
    const visibility: Record<string, boolean> = {};
    widgets.forEach(widget => {
      visibility[widget.id] = widget.visible;
    });
    return visibility;
  });

  // Responsive breakpoint detection
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else setBreakpoint('xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  // Get responsive grid columns based on breakpoint
  const getGridColumns = () => {
    switch (breakpoint) {
      case 'sm': return 1;
      case 'md': return 1;
      case 'lg': return 2;
      case 'xl': return 3;
      default: return 2;
    }
  };

  // Filter visible widgets
  const visibleWidgets = widgets.filter(widget => widgetVisibility[widget.id]);

  // Get grid class based on columns
  const getGridClass = () => {
    const cols = getGridColumns();
    return cn(
      "grid gap-6",
      {
        "grid-cols-1": cols === 1,
        "grid-cols-2": cols === 2,
        "grid-cols-3": cols === 3,
      }
    );
  };

  // Widget sizing based on screen size
  const getWidgetClassName = (widgetId: string) => {
    return cn(
      "transition-all duration-200 ease-in-out",
      breakpoint === 'sm' || breakpoint === 'md' ? "col-span-1" : "col-span-1"
    );
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgetVisibility(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId]
    }));
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dashboard Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Dashboard Widgets
          </h2>
          <span className="text-sm text-gray-500">
            ({visibleWidgets.length} of {widgets.length} visible)
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustomizer(!showCustomizer)}
          className="flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>Customize</span>
        </Button>
      </div>

      {/* Widget Customizer */}
      {showCustomizer && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium text-gray-900 mb-3">Widget Visibility</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {widgets.map(widget => (
              <label key={widget.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={widgetVisibility[widget.id]}
                  onChange={() => toggleWidgetVisibility(widget.id)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{widget.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Responsive Widget Grid */}
      <div className={getGridClass()}>
        {visibleWidgets.map(widget => (
          <div key={widget.id} className={getWidgetClassName(widget.id)}>
            {renderWidget(widget, "h-full")}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {visibleWidgets.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Widgets Visible</h3>
          <p className="text-gray-500 mb-4">Enable some widgets to see your dashboard content.</p>
          <Button
            variant="outline"
            onClick={() => setShowCustomizer(true)}
            className="flex items-center space-x-2 mx-auto"
          >
            <Settings className="h-4 w-4" />
            <span>Customize Dashboard</span>
          </Button>
        </div>
      )}
    </div>
  );
}