import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock } from "lucide-react";
import { format } from "date-fns";
import { useUser } from "@/user-context";

interface TodayActivity {
  id: number;
  tenderId?: number;
  userId?: number;
  reminderDate?: string;
  comments?: string;
  createdAt: string;
  tenderReferenceNo?: string;
  tenderTitle?: string;
  userName?: string;
  type?: string;
  approvalType?: string;
  requestAmount?: string;
  status?: string;
  requestedBy?: string;
  description?: string;
  action?: string;
  entityType?: string;
  entityId?: number;
  metadata?: any;
  actionColor?: string;
  userEmail?: string;
  department?: string;
  // Tender assignment specific fields
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: string;
  submissionDate?: string;
}

interface TodaysActivityWidgetProps {
  className?: string;
  isMobile?: boolean;
  isTablet?: boolean;
  isDesktop?: boolean;
  dashboardType?: 'sales' | 'finance';
  selectedDate?: Date;
}

export function TodaysActivityWidget({ className, dashboardType = 'sales', selectedDate }: TodaysActivityWidgetProps) {
  const { currentUser } = useUser();
  const targetDate = selectedDate || new Date();
  
  // Fetch activities for the selected date
  const { data: todaysActivities = [], isLoading } = useQuery<TodayActivity[]>({
    queryKey: ["/api/dashboard/todays-activity", dashboardType, format(targetDate, 'yyyy-MM-dd'), currentUser?.id],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('date', format(targetDate, 'yyyy-MM-dd'));
      params.append('type', dashboardType);
      if (currentUser?.id) {
        params.append('userId', currentUser.id.toString());
      }
      
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
        <CardHeader className="bg-purple-600 text-white">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activities for {format(targetDate, 'MMM dd, yyyy')}
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
        <CardHeader className="bg-purple-600 text-white">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activities for {format(targetDate, 'MMM dd, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No recent activities</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="bg-purple-600 text-white">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activities for {format(targetDate, 'MMM dd, yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto">
          {todaysActivities.slice(0, 5).map((activity, index) => (
            <div key={activity.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.actionColor || 'bg-blue-100'
                  }`}>
                    <Clock className={`w-4 h-4 ${
                      activity.actionColor?.includes('bg-blue') ? 'text-blue-600' :
                      activity.actionColor?.includes('bg-green') ? 'text-green-600' :
                      activity.actionColor?.includes('bg-orange') ? 'text-orange-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  {activity.type === 'tender_assignment' ? (
                    // Tender Assignment Activity - Format requested by user
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {activity.action === 'assign' ? 'Tender Assigned to Team' : 'Tender Assignment Received'}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Tender Assign to:</span> {activity.assignedTo || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Tender ID:</span> {activity.tenderReferenceNo?.trim() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Assign By:</span> {activity.assignedBy || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Assign Date & Time:</span> {activity.assignedAt ? format(new Date(activity.assignedAt), "dd-MM-yyyy, HH:mm") : format(new Date(activity.createdAt), "dd-MM-yyyy, HH:mm")}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Submission Date:</span> {activity.submissionDate ? format(new Date(activity.submissionDate), "dd-MM-yyyy") : 'Not specified'}
                      </div>
                      {activity.comments && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Comments:</span> {activity.comments}
                        </div>
                      )}
                    </>
                  ) : activity.type === 'financial_request' ? (
                    // Financial Request Activity
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        Financial Request
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Tender:</span> {activity.tenderReferenceNo?.trim() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Request:</span> {activity.description}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Status:</span> <Badge variant="secondary">{activity.status}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Requested By:</span> {activity.requestedBy}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Time:</span> {format(new Date(activity.createdAt), "dd-MM-yyyy, HH:mm")}
                      </div>
                    </>
                  ) : activity.type === 'general_finance' ? (
                    // General Finance Activity (from Request to Finance) - Enhanced format
                    <>
                      {/* Yellow background header like in the image */}
                      <div className="bg-yellow-100 p-2 rounded-md mb-2">
                        <div className="text-sm font-bold text-black">
                          {activity.metadata?.approvalType || 'Finance Request'}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Tender ID :</span> {activity.tenderReferenceNo?.replace(/^.*\//, '') || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Requested By :</span> {activity.metadata?.currentUserName || activity.userName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Requested Date :</span> {activity.metadata?.requestedDate ? format(new Date(activity.metadata.requestedDate), "dd-MM-yyyy") : format(new Date(activity.createdAt), "dd-MM-yyyy")}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Dead Line :</span> {activity.metadata?.deadline ? format(new Date(activity.metadata.deadline), "dd-MM-yyyy HH:mm") : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Amount :</span> {activity.metadata?.requestAmount ? `₹${Number(activity.metadata.requestAmount).toLocaleString()}` : 'N/A'}
                      </div>
                      
                      {/* Request approval section */}
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-700">Request Approval</div>
                      </div>
                    </>
                  ) : activity.type === 'general_activity' ? (
                    // General Activity
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {activity.description || activity.action || 'System Activity'}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">By:</span> {activity.userName || 'System'}
                      </div>
                      {activity.entityType === 'tender' && activity.entityId && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Tender:</span> {activity.entityId}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Time:</span> {format(new Date(activity.createdAt), "dd-MM-yyyy, HH:mm")}
                      </div>
                    </>
                  ) : activity.type === 'tender_reminder' ? (
                    // Tender Reminder Activity (specific format requested)
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        Tender Reminder
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Tender ID:</span> {activity.tenderReferenceNo?.trim() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Comment:</span> {activity.reminderCreatorName || activity.userName} - {activity.comments || 'No description'}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Reminder Date & Time:</span> {format(new Date(activity.reminderDate), "dd-MM-yyyy, HH:mm")}
                      </div>
                    </>
                  ) : (
                    // Fallback Activity
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        Activity
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">By:</span> {activity.userName || 'System'}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Time:</span> {format(new Date(activity.createdAt), "dd-MM-yyyy, HH:mm")}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {todaysActivities.length > 5 && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="text-sm text-gray-600 text-center">
                Showing 5 of {todaysActivities.length} activities
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}