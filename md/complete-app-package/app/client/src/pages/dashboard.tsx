import React from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { ResponsiveDashboardContainer, WidgetConfig } from "@/components/dashboard/responsive-dashboard-container";
import { StatsWidget } from "@/components/dashboard/widgets/stats-widget";
import { ActivitiesWidget } from "@/components/dashboard/widgets/activities-widget";
import { TodaysActivityWidget } from "@/components/dashboard/widgets/todays-activity-widget";
import { DeadlinesWidget } from "@/components/dashboard/widgets/deadlines-widget";
import { InsightsWidget } from "@/components/dashboard/widgets/insights-widget";

export default function Dashboard() {
  const [, navigate] = useLocation();

  // Default widget configurations for the dashboard
  const defaultWidgets: WidgetConfig[] = [
    {
      id: 'stats',
      title: 'Dashboard Statistics',
      visible: true,
    },
    {
      id: 'todays-activity',
      title: "Today's Activity",
      visible: true,
    },
    {
      id: 'activities',
      title: 'Recent Activities',
      visible: true,
    },
    {
      id: 'deadlines',
      title: 'Upcoming Deadlines',
      visible: true,
    },
    {
      id: 'insights',
      title: 'AI Insights',
      visible: true,
    },
  ];

  // Widget renderer function
  const renderWidget = (config: WidgetConfig, className?: string) => {
    switch (config.id) {
      case 'stats':
        return <StatsWidget key={config.id} className={className} />;
      case 'todays-activity':
        return <TodaysActivityWidget key={config.id} className={className} />;
      case 'activities':
        return <ActivitiesWidget key={config.id} className={className} />;
      case 'deadlines':
        return <DeadlinesWidget key={config.id} className={className} />;
      case 'insights':
        return <InsightsWidget key={config.id} className={className} />;
      default:
        return null;
    }
  };

  return (
    <main className="dashboard-container">
      {/* Header with Logo */}
      <div className="dashboard-header">
        <div className="flex justify-center mb-4">
          <Logo centered className="transform hover:scale-105 transition-transform duration-200" />
        </div>
        <h1 className="dashboard-title mb-2">Dashboard</h1>
        <p className="dashboard-subtitle">Overview of your tender activities and metrics</p>
      </div>

      {/* Responsive Dashboard Container with Customizable Widgets */}
      <div className="dashboard-content">
        <ResponsiveDashboardContainer
          widgets={defaultWidgets}
          renderWidget={renderWidget}
        />
      </div>
    </main>
  );
}