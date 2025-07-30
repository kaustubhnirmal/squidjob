import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { useUser } from "@/user-context";

interface TodayActivity {
  id: number;
  tenderId: number;
  userId?: number;
  reminderDate: string;
  comments?: string;
  createdAt: string;
  tenderReferenceNo: string;
  tenderTitle?: string;
  userName?: string;
  type?: string;
  approvalType?: string;
  requestAmount?: string;
  status?: string;
  requestedBy?: string;
  description?: string;
}

interface DateActivityWidgetProps {
  className?: string;
  dashboardType?: 'sales' | 'finance';
  selectedDate?: Date;
}

export function DateActivityWidget({ className, dashboardType = 'sales', selectedDate }: DateActivityWidgetProps) {
  const { currentUser } = useUser();
  const targetDate = selectedDate || new Date();
  
  const { data: todaysActivities = [], isLoading } = useQuery<TodayActivity[]>({
    queryKey: ["/api/dashboard/todays-activity", currentUser?.id, dashboardType, targetDate.toDateString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentUser?.id) {
        params.append('userId', currentUser.id.toString());
      }
      params.append('type', dashboardType);
      params.append('date', targetDate.toISOString().split('T')[0]);
      
      const url = `/api/dashboard/todays-activity?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      return response.json();
    },
    enabled: !!currentUser?.id
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-lg font-semibold">
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
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

  if (!todaysActivities || todaysActivities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-lg font-semibold">
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No activities for {selectedDate ? format(targetDate, "dd MMM yyyy") : "today"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="bg-blue-600 text-white">
        <CardTitle className="text-lg font-semibold">
          Today's Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {todaysActivities.map((activity, index) => (
            <div key={activity.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  {activity.type === 'financial_request' ? (
                    // Financial Request Activity
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        Financial Request
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Tender ID:</span> {activity.tenderReferenceNo}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Request by:</span> {activity.requestedBy}: {activity.description}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Status:</span> <Badge variant="secondary">{activity.status}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Reminder Date & Time:</span> {format(new Date(activity.reminderDate), "dd-MM-yyyy, HH:mm")}
                      </div>
                    </>
                  ) : (
                    // Reminder Activity
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        Tender Reminder
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Tender ID:</span> {activity.tenderReferenceNo}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Comment:</span> reminder set by {activity.userName}: {activity.comments || 'No description'}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Reminder Date & Time:</span> {format(new Date(activity.reminderDate), "dd-MM-yyyy, HH:mm")}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}