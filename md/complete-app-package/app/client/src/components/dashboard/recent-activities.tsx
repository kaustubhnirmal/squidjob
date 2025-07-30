import React from "react";
import { Button } from "@/components/ui/button";
import { FormattedActivity } from "@/types";

interface RecentActivitiesProps {
  activities: FormattedActivity[];
  onViewAll: () => void;
}

export function RecentActivities({ activities, onViewAll }: RecentActivitiesProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Recent Activities</h3>
      </div>
      <div className="p-5 space-y-5">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full ${activity.iconBgColor} flex items-center justify-center ${activity.iconColor}`}>
                  <i className={`fas ${activity.icon}`}></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: activity.message }} />
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            No recent activities
          </div>
        )}
        
        <Button
          variant="link"
          className="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 font-medium"
          onClick={onViewAll}
        >
          View All Activities
        </Button>
      </div>
    </div>
  );
}
