import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Users, Target } from "lucide-react";

interface InsightsWidgetProps {
  className?: string;
  isMobile?: boolean;
  isTablet?: boolean;
  isDesktop?: boolean;
}

export function InsightsWidget({ className }: InsightsWidgetProps) {
  const { data: aiInsights, isLoading } = useQuery({
    queryKey: ["/api/dashboard/ai-insights"],
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-4 border rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default insights when no AI data is available
  const insights = aiInsights && aiInsights.length > 0 && aiInsights[0].insightData ? aiInsights[0].insightData : {
    waterTreatmentLiveTenders: 1180,
    waterTreatmentPastResults: 13750,
    maximumWins: [
      "M/S Satin Enterprise",
      "Mondal Construction", 
      "Sakdaha Youth And Cultural Forum",
      "Mesa Paddarga Construction",
      "Tarasani Hardware And Contractor"
    ],
    probableParticipants: [
      "Ncc Limited",
      "Rcc Developers Limited",
      "M/S Globe Civil Projects Private Limited",
      "Renashus Projects Private Limited",
      "Larsen And Toubro Limited"
    ]
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>AI Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Market Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {insights.waterTreatmentLiveTenders?.toLocaleString() || '1,180'}
              </div>
              <div className="text-sm text-gray-600">Live Tenders</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {insights.waterTreatmentPastResults?.toLocaleString() || '13,750'}
              </div>
              <div className="text-sm text-gray-600">Past Results</div>
            </div>
          </div>

          {/* Top Competitors */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2 text-orange-600" />
              Top Competitors
            </h4>
            <div className="space-y-2">
              {insights.maximumWins?.slice(0, 3).map((company: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm text-gray-700 truncate">{company}</span>
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              )) || (
                <div className="text-sm text-gray-500">No competitor data available</div>
              )}
            </div>
          </div>

          {/* Probable Participants */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Probable Participants</h4>
            <div className="flex flex-wrap gap-2">
              {insights.probableParticipants?.slice(0, 4).map((participant: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {participant.length > 20 ? `${participant.substring(0, 20)}...` : participant}
                </Badge>
              )) || (
                <div className="text-sm text-gray-500">No participant data available</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              View Detailed Analysis
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Export Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}