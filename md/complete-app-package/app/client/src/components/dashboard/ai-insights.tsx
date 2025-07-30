import React from "react";
import { Button } from "@/components/ui/button";

interface InsightProps {
  title: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  stats?: {
    label: string;
    value: string;
    subLabel?: string;
  }[];
  items?: {
    label?: string;
    list: string[];
  };
  buttonText: string;
  onButtonClick: () => void;
}

export function AiInsight({
  title,
  icon,
  iconBgColor,
  iconColor,
  stats,
  items,
  buttonText,
  onButtonClick
}: InsightProps) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-center mb-3">
        <div className={`h-10 w-10 rounded-lg ${iconBgColor} flex items-center justify-center ${iconColor} mr-3`}>
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
      </div>
      
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
              <p className={`text-2xl font-semibold ${index === 0 ? "text-primary" : "text-secondary"}`}>{stat.value}</p>
              {stat.subLabel && <p className="text-xs text-gray-500">{stat.subLabel}</p>}
            </div>
          ))}
        </div>
      )}
      
      {items && (
        <>
          {items.label && <h4 className="text-sm font-medium text-gray-700 mb-2">{items.label}:</h4>}
          <ul className="text-sm text-gray-600 space-y-1 mb-4">
            {items.list.map((item, index) => (
              <li key={index} className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </>
      )}
      
      <Button
        variant={title === "Tender Insights" ? "secondary" : "default"}
        className="w-full py-2 px-4 text-sm font-medium"
        onClick={onButtonClick}
      >
        {buttonText}
      </Button>
    </div>
  );
}

interface AiInsightsProps {
  insights: {
    waterTreatmentLiveTenders: number;
    waterTreatmentPastResults: number;
    maximumWins: string[];
    probableParticipants: string[];
  };
  onViewMoreInsights: () => void;
  onViewProbableParticipants: () => void;
}

export function AiInsights({
  insights,
  onViewMoreInsights,
  onViewProbableParticipants
}: AiInsightsProps) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-gray-800 mb-3">AI-Generated Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AiInsight
          title="Tender Insights"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
          iconBgColor="bg-primary-100"
          iconColor="text-primary"
          stats={[
            {
              label: "Water Treatment Plant Tenders",
              value: insights.waterTreatmentLiveTenders.toLocaleString(),
              subLabel: "Live"
            },
            {
              label: "Water Treatment Plant Results",
              value: insights.waterTreatmentPastResults.toLocaleString(),
              subLabel: "Last 3 Years"
            }
          ]}
          items={{
            label: "Maximum Wins",
            list: insights.maximumWins.slice(0, 3)
          }}
          buttonText="View More Insights"
          onButtonClick={onViewMoreInsights}
        />
        
        <AiInsight
          title="Probable Participants"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          items={{
            list: insights.probableParticipants.map(name => name)
          }}
          buttonText="View All Probable Participants"
          onButtonClick={onViewProbableParticipants}
        />
      </div>
    </div>
  );
}
