import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TrendingUp, FileText, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsWidgetProps {
  className?: string;
  isMobile?: boolean;
  isTablet?: boolean;
  isDesktop?: boolean;
}

export function StatsWidget({ className, isMobile }: StatsWidgetProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className={`dashboard-card ${className || ''}`}>
        <h3 className="widget-title">Dashboard Statistics</h3>
        <div className="dashboard-grid-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`dashboard-card ${className || ''}`}>
        <h3 className="widget-title">Dashboard Statistics</h3>
        <p className="widget-text">No statistics available</p>
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Tenders",
      value: stats.totalTenders || 0,
      icon: <FileText className="h-5 w-5" />,
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: { value: "+12%", isPositive: true },
    },
    {
      title: "Active Tenders", 
      value: stats.activeTenders || 0,
      icon: <Clock className="h-5 w-5" />,
      iconBgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      trend: { value: "+8%", isPositive: true },
    },
    {
      title: "Won Tenders",
      value: stats.wonTenders || 0,
      icon: <CheckCircle className="h-5 w-5" />,
      iconBgColor: "bg-green-100", 
      iconColor: "text-green-600",
      trend: { value: "+15%", isPositive: true },
    },
    {
      title: "Success Rate",
      value: `${stats.successRate || 0}%`,
      icon: <TrendingUp className="h-5 w-5" />,
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: { value: "+5%", isPositive: true },
    },
  ];

  return (
    <div className={`dashboard-card ${className || ''}`}>
      <h3 className="widget-title">Dashboard Statistics</h3>
      <div className="dashboard-grid-2">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconBgColor={stat.iconBgColor}
            iconColor={stat.iconColor}
            trend={stat.trend}
          />
        ))}
      </div>
    </div>
  );
}