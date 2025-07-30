import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface DeadlinesWidgetProps {
  className?: string;
  isMobile?: boolean;
  isTablet?: boolean;
  isDesktop?: boolean;
}

export function DeadlinesWidget({ className }: DeadlinesWidgetProps) {
  const { data: deadlines, isLoading } = useQuery({
    queryKey: ["/api/dashboard/upcoming-deadlines"],
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!deadlines || deadlines.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming deadlines</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil < 0) return "destructive";
    if (daysUntil <= 2) return "destructive";
    if (daysUntil <= 7) return "default";
    return "secondary";
  };

  const getUrgencyIcon = (daysUntil: number) => {
    if (daysUntil < 0 || daysUntil <= 2) return <AlertTriangle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {deadlines.slice(0, 10).map((tender: any) => {
            const submissionDate = new Date(tender.submissionDate);
            const daysUntil = differenceInDays(submissionDate, new Date());
            
            return (
              <div key={tender.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {tender.title || "Untitled Tender"}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {tender.referenceNo}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Due: {format(submissionDate, "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getUrgencyColor(daysUntil)} className="flex items-center space-x-1">
                    {getUrgencyIcon(daysUntil)}
                    <span>
                      {daysUntil < 0 ? "Overdue" : daysUntil === 0 ? "Today" : `${daysUntil}d`}
                    </span>
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
        {deadlines.length > 10 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Deadlines
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}