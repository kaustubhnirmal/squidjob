import React, { useState, useEffect } from "react";
import { Settings, Eye, EyeOff, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/user-context";
import { useToast } from "@/hooks/use-toast";

export interface WidgetConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  defaultVisible: boolean;
  defaultPosition: { row: number; col: number };
  defaultSize: { width: number; height: number };
  props?: any;
}

export interface DashboardLayoutConfig {
  widgets: {
    [widgetId: string]: {
      visible: boolean;
      position: { row: number; col: number };
      size: { width: number; height: number };
    };
  };
}

interface DashboardCustomizerProps {
  widgets: WidgetConfig[];
  layout: DashboardLayoutConfig;
  onLayoutChange: (layout: DashboardLayoutConfig) => void;
}

export function DashboardCustomizer({ widgets, layout, onLayoutChange }: DashboardCustomizerProps) {
  const { currentUser: user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [localLayout, setLocalLayout] = useState<DashboardLayoutConfig>(layout);

  // Fetch user's dashboard layout
  const { data: savedLayout } = useQuery({
    queryKey: ["/api/dashboard/layout", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/dashboard/layout/${user.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Save dashboard layout mutation
  const saveLayoutMutation = useMutation({
    mutationFn: async (layoutConfig: DashboardLayoutConfig) => {
      return apiRequest(`/api/dashboard/layout`, "POST", {
        userId: user?.id,
        layoutConfig,
      });
    },
    onSuccess: () => {
      toast({
        title: "Layout Saved",
        description: "Your dashboard layout has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/layout", user?.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save dashboard layout.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (savedLayout?.layoutConfig) {
      setLocalLayout(savedLayout.layoutConfig);
      onLayoutChange(savedLayout.layoutConfig);
    }
  }, [savedLayout, onLayoutChange]);

  const handleWidgetVisibilityChange = (widgetId: string, visible: boolean) => {
    const updatedLayout = {
      ...localLayout,
      widgets: {
        ...localLayout.widgets,
        [widgetId]: {
          ...localLayout.widgets[widgetId],
          visible,
        },
      },
    };
    setLocalLayout(updatedLayout);
  };

  const handleSaveLayout = () => {
    onLayoutChange(localLayout);
    saveLayoutMutation.mutate(localLayout);
    setIsOpen(false);
  };

  const handleResetLayout = () => {
    const defaultLayout: DashboardLayoutConfig = {
      widgets: {},
    };
    
    widgets.forEach((widget) => {
      defaultLayout.widgets[widget.id] = {
        visible: widget.defaultVisible,
        position: widget.defaultPosition,
        size: widget.defaultSize,
      };
    });

    setLocalLayout(defaultLayout);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white hover:bg-purple-50 border-purple-200 text-purple-600 hover:text-purple-700"
        >
          <Settings className="h-4 w-4 mr-2" />
          Customize Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Customize Dashboard Layout
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Widget Visibility Controls */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Widget Visibility</h3>
            <div className="grid gap-3">
              {widgets.map((widget) => (
                <Card key={widget.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <div>
                        <h4 className="font-medium">{widget.title}</h4>
                        <p className="text-sm text-gray-500">
                          {localLayout.widgets[widget.id]?.visible ? "Visible" : "Hidden"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {localLayout.widgets[widget.id]?.visible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <Switch
                        checked={localLayout.widgets[widget.id]?.visible || false}
                        onCheckedChange={(checked) =>
                          handleWidgetVisibilityChange(widget.id, checked)
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Layout Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Layout Preview</h3>
            <div className="border rounded-lg p-4 bg-gray-50 min-h-32">
              <div className="grid grid-cols-2 gap-2">
                {widgets
                  .filter((widget) => localLayout.widgets[widget.id]?.visible)
                  .map((widget) => (
                    <div
                      key={widget.id}
                      className="bg-white border rounded p-2 text-xs text-center text-gray-600"
                    >
                      {widget.title}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleResetLayout}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveLayout}
                disabled={saveLayoutMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {saveLayoutMutation.isPending ? "Saving..." : "Save Layout"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}