import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, formatDistance } from "date-fns";

interface ActivitiesWidgetProps {
  className?: string;
  isMobile?: boolean;
  isTablet?: boolean;
  isDesktop?: boolean;
}

export function ActivitiesWidget({ className }: ActivitiesWidgetProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-activities"],
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No recent activities</p>
        </CardContent>
      </Card>
    );
  }

  const formatTimeDistance = (date: Date): string => {
    const now = new Date();
    const diffDays = Math.abs(Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (diffDays <= 0) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${format(date, "h:mm a")}`;
    } else if (diffDays <= 7) {
      return formatDistance(date, now, { addSuffix: true });
    } else {
      return format(date, "dd/MM/yyyy, h:mm a");
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.slice(0, 10).map((activity: any) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 mb-1">
                  {activity.action === "assign" && "Tender assigned to team member"}
                  {activity.action === "add" && "New tender added to system"}
                  {activity.action === "approve" && "EMD approval processed"}
                  {activity.action === "reminder" && "Reminder set for deadline"}
                  {activity.action === "reject" && "Tender marked as rejected"}
                  {!["assign", "add", "approve", "reminder", "reject"].includes(activity.action) && `Activity: ${activity.action}`}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    #{activity.metadata?.tenderNumber || activity.entityId}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatTimeDistance(new Date(activity.createdAt))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}