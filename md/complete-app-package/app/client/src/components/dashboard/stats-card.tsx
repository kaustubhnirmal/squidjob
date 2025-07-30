import React from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  trendText?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  trend,
  trendText = "from last month"
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h2 className="text-2xl font-semibold text-gray-800">{value}</h2>
        </div>
        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", iconBgColor)}>
          <div className={cn("h-6 w-6", iconColor)}>{icon}</div>
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          <span className={trend.isPositive ? "text-success" : "text-destructive"}>
            <span className="inline-flex items-center">
              {trend.isPositive ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
              {trend.value}
            </span>
          </span>
          <span className="text-gray-500 ml-2">{trendText}</span>
        </div>
      )}
    </div>
  );
}
