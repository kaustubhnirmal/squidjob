import React from "react";
import { useLocation } from "wouter";
import { Tender } from "@/types";
import { formatCurrency, formatDeadline, getStatusBadgeClass, truncate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TenderListProps {
  tenders: Tender[];
  loading?: boolean;
  view?: "default" | "my-tenders";
  onSetReminder?: (id: number) => void;
  onAssign?: (id: number) => void;
  onStarToggle?: (id: number, isStarred: boolean) => void;
  starredTenders?: number[];
}

export function TenderList({
  tenders,
  loading = false,
  view = "default",
  onSetReminder,
  onAssign,
  onStarToggle,
  starredTenders = []
}: TenderListProps) {
  const [, navigate] = useLocation();

  const handleViewTender = (id: number) => {
    navigate(`/tenders/${id}`);
  };

  if (loading) {
    return (
      <Card className="py-10">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-sm text-gray-600">Loading tenders...</span>
        </div>
      </Card>
    );
  }

  if (tenders.length === 0) {
    return (
      <Card className="py-16">
        <div className="text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 mx-auto text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tenders found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new tender or adjust your filters.</p>
          <div className="mt-6">
            <Button 
              onClick={() => navigate("/tenders/new")}
              className="inline-flex items-center"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="-ml-1 mr-2 h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              Create New Tender
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tender ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Closing Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {view === "my-tenders" && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned By
              </th>
            )}
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tenders.map((tender, index) => (
            <tr key={tender.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-primary">#{index + 1}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 font-medium">{truncate(tender.title, 50)}</div>
                <div className="text-sm text-gray-500 mt-1">{tender.location || 'Location not specified'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatDeadline(tender.deadline).split(',')[0]}</div>
                <div className="text-sm text-gray-500">{formatDeadline(tender.deadline).split(',')[1]}</div>
                {tender.status === "submitted" && (
                  <div className="mt-1">
                    <div className="text-xs text-gray-600">Submitted By: <span className="font-medium">Moksh Desai</span></div>
                    <div className="text-xs text-gray-600">Submitted Date: <span className="font-medium">04-12-2024</span></div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatCurrency(tender.estimatedValue)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getStatusBadgeClass(tender.status)}>
                  {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
                </span>
              </td>
              {view === "my-tenders" && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Pankaj Shah
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-3 overflow-x-auto max-w-[140px] pb-2">
                  {onStarToggle && (
                    <button 
                      className={`${starredTenders.includes(tender.id) ? "text-yellow-400 hover:text-yellow-500" : "text-gray-400 hover:text-gray-500"} flex-shrink-0`}
                      onClick={() => onStarToggle(tender.id, !starredTenders.includes(tender.id))}
                      title={starredTenders.includes(tender.id) ? "Remove from starred" : "Add to starred"}
                    >
                      {starredTenders.includes(tender.id) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      )}
                    </button>
                  )}
                  {onSetReminder && (
                    <button 
                      className="text-gray-400 hover:text-gray-500 flex-shrink-0"
                      onClick={() => onSetReminder(tender.id)}
                      title="Set reminder"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </button>
                  )}
                  <button 
                    className="text-primary hover:text-primary/90 flex-shrink-0"
                    onClick={() => handleViewTender(tender.id)}
                    title="View details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  {onAssign && (
                    <button 
                      className="text-gray-400 hover:text-gray-500 flex-shrink-0"
                      onClick={() => onAssign(tender.id)}
                      title="Assign tender"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{tenders.length}</span> of{" "}
                <span className="font-medium">{tenders.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button variant="outline" size="sm" className="rounded-l-md">
                  <span className="sr-only">Previous</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button variant="outline" size="sm" className="bg-primary-50 border-primary-500 text-primary-600">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm" className="rounded-r-md">
                  <span className="sr-only">Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
