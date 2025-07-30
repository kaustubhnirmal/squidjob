import React from "react";
import { Button } from "@/components/ui/button";
import { Tender } from "@/types";
import { formatDeadline, getStatusBadgeClass, truncate } from "@/lib/utils";

interface UpcomingDeadlinesProps {
  deadlines: Tender[];
  onViewAll: () => void;
  onViewTender: (id: number) => void;
  onSetReminder: (id: number) => void;
  onAssignTender: (id: number) => void;
}

export function UpcomingDeadlines({
  deadlines,
  onViewAll,
  onViewTender,
  onSetReminder,
  onAssignTender
}: UpcomingDeadlinesProps) {
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow">
      <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800">Upcoming Deadlines</h3>
        <div className="flex">
          <Button
            variant="link"
            className="text-sm font-medium text-primary hover:text-primary/90"
            onClick={onViewAll}
          >
            View All
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tender ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Authority</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deadlines.length > 0 ? (
              deadlines.map((tender) => (
                <tr key={tender.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">#{tender.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{truncate(tender.authority, 30)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <span className={isToday(new Date(tender.deadline)) ? "text-warning font-medium" : "font-medium"}>
                      {formatDeadline(tender.deadline)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadgeClass(tender.status)}>{tender.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        className="text-primary hover:text-primary/80"
                        onClick={() => onViewTender(tender.id)}
                        title="View Details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        className="text-warning hover:text-warning/80"
                        onClick={() => onSetReminder(tender.id)}
                        title="Set Reminder"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-800"
                        onClick={() => onAssignTender(tender.id)}
                        title="Assign Tender"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <line x1="20" y1="8" x2="20" y2="14" />
                          <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No upcoming deadlines
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {deadlines.length > 0 && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          Showing {deadlines.length} of {deadlines.length} upcoming deadlines
        </div>
      )}
    </div>
  );
}

function isToday(date: Date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}
