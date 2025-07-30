import React from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Competitor } from "@/types";

interface CompetitorListProps {
  competitors: Competitor[];
  loading?: boolean;
}

export function CompetitorList({ competitors, loading = false }: CompetitorListProps) {
  const { toast } = useToast();
  
  const handleViewReport = (id: number) => {
    toast({
      title: "Coming Soon",
      description: "Detailed competitor reports are under development.",
    });
  };
  
  const handleSetShortlistCompetitor = (id: number, shortlisted: boolean) => {
    toast({
      title: shortlisted ? "Added to Shortlist" : "Removed from Shortlist",
      description: `The competitor has been ${shortlisted ? 'added to' : 'removed from'} your shortlist.`,
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm text-gray-600">Loading competitors...</span>
      </div>
    );
  }
  
  if (competitors.length === 0) {
    return (
      <div className="text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No competitors found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search parameters or add a new competitor.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participated Tenders</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Awarded Tenders</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lost Tenders</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate %</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shortlist Competitor</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {competitors.map((competitor) => {
            const winRate = competitor.participatedTenders > 0 
              ? ((competitor.awardedTenders / competitor.participatedTenders) * 100).toFixed(1) 
              : "0.0";
              
            return (
              <tr key={competitor.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{competitor.name}</div>
                  <div className="text-sm text-gray-500">{competitor.state}, {competitor.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {competitor.participatedTenders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {competitor.awardedTenders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {competitor.lostTenders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {winRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-primary border-gray-300 rounded"
                    onChange={(e) => handleSetShortlistCompetitor(competitor.id, e.target.checked)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewReport(competitor.id)}
                  >
                    View Report
                  </Button>
                </td>
              </tr>
            );
          })}
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
                Showing <span className="font-medium">1</span> to <span className="font-medium">{competitors.length}</span> of{" "}
                <span className="font-medium">{competitors.length}</span> competitors
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button variant="outline" size="sm" className="rounded-l-md">
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button variant="outline" size="sm" className="bg-primary-50 border-primary-500 text-primary-600">
                  1
                </Button>
                <Button variant="outline" size="sm" className="rounded-r-md">
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
