import React from "react";
import { formatCurrency, formatDeadline, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TenderResult, Tender } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface TenderResultsListProps {
  results: (TenderResult & { tender: Tender })[];
  loading?: boolean;
}

export function TenderResultsList({ results, loading = false }: TenderResultsListProps) {
  const { toast } = useToast();
  
  const handleViewDetails = (id: number) => {
    toast({
      title: "Coming Soon",
      description: "Detailed tender result view is under development.",
    });
  };
  
  const handleShare = (id: number) => {
    toast({
      title: "Share Feature",
      description: "Share functionality is under development.",
    });
  };
  
  const handleSaveToDocuments = (id: number) => {
    toast({
      title: "Success",
      description: "Result saved to documents successfully.",
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm text-gray-600">Loading results...</span>
      </div>
    );
  }
  
  if (results.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
        <p className="mt-1 text-sm text-gray-500">There are no tender results matching your criteria.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {results.map((result) => (
          <li key={result.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="truncate text-sm font-medium text-primary-600">
                    #{result.tender.id} - {result.tender.referenceNo}
                  </p>
                  <Badge 
                    className={`ml-2 ${
                      result.status === "awarded" ? "bg-green-100 text-green-800" : 
                      result.status === "lost" ? "bg-red-100 text-red-800" : 
                      "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {result.status === "awarded" ? "Awarded" : 
                     result.status === "lost" ? "Lost" : "Pending"}
                  </Badge>
                </div>
                <div className="ml-2 flex flex-shrink-0">
                  <p className="inline-flex text-xs text-gray-500">
                    {formatDeadline(result.createdAt)}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-800">{result.tender.title}</p>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{truncate(result.tender.brief, 150)}</p>
              </div>
              <div className="mt-3 flex justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {result.tender.location || "Location not specified"}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {result.tender.authority}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatCurrency(result.bidAmount || result.tender.estimatedValue)}
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mr-2"
                  onClick={() => handleSaveToDocuments(result.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mr-2"
                  onClick={() => handleShare(result.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleViewDetails(result.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
