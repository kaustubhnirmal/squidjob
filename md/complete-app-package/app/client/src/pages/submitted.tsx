import { useState } from "react";
import { useLocation } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Bell, Eye, Download, ChevronLeft, ChevronRight, ChevronDown, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { TenderFilter } from "@/components/tender/tender-filter";
import { TenderActionButtons } from "@/components/tender/action-buttons";
import { TenderStatus } from "@/components/tender-status";
import { TenderCard } from "@/components/tender/tender-card";

// Define the tender interface
interface Tender {
  id?: number;
  referenceNo?: string;
  title?: string;
  brief?: string;
  authority?: string;
  location?: string;
  deadline: string;
  emdAmount?: number;
  documentFee?: number;
  estimatedValue?: number;
  bidValue?: number;
  status: string;
  bidDocumentPath?: string;
  atcDocumentPath?: string;
  techSpecsDocumentPath?: string;
  createdAt?: string;
  updatedAt?: string;
  assignedUser?: {
    id: number;
    name: string;
  };
  isStarred?: boolean;
  isInterested?: boolean;
}

export default function SubmittedTender() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("live");

  // Fetch tenders with submitted status
  const { data: tenderResponse = { tenders: [], counts: {} }, isLoading } = useQuery({
    queryKey: ['/api/tenders', 'submitted'],
    queryFn: async () => {
      const res = await fetch('/api/tenders?status=submitted');
      if (!res.ok) throw new Error("Failed to fetch tenders");
      return res.json();
    }
  });

  const tenders = tenderResponse.tenders || [];

  // Function to calculate days left and get appropriate color
  const getDaysLeftInfo = (deadline: string) => {
    const daysLeft = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    let colorClass = "text-green-600"; // > 3 days: green
    
    if (daysLeft < 0) {
      colorClass = "text-red-600 font-bold"; // Expired: red
    } else if (daysLeft < 3) {
      colorClass = "text-orange-500 font-medium"; // < 3 days: orange
    }
    
    return { daysLeft, colorClass };
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100">
      <header className="page-header mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Submitted Tender</h1>
      </header>

      {/* Filter Section */}
      <TenderFilter 
        initiallyExpanded={false} 
        onSearch={(filters) => {
          toast({
            title: "Searching with filters",
            description: "Search functionality will be implemented soon."
          });
          console.log("Search filters:", filters);
        }}
        hideReferenceNumber={true}
        pageType="submitted"
      />

      {/* Tabs and Export Button */}
      <div className="bg-gray-50 rounded-t-lg border border-gray-200">
        <div className="flex flex-wrap items-center border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "live" ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("live")}
          >
            Live ({tenders.length})
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "archive" ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("archive")}
          >
            Archive
          </button>
          <div className="ml-auto px-4 py-2">
            <div className="flex items-center justify-end">
              <div className="flex items-center mr-4">
                <span className="text-sm mr-1">Value</span>
                <div className="flex flex-col">
                  <ChevronDown className="h-3 w-3" />
                  <ChevronDown className="h-3 w-3" />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="flex items-center text-blue-600">
                <Download className="h-4 w-4 mr-1" />
                Export To Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tender Content - List View */}
      <div className="bg-white border-x border-b border-gray-200 rounded-b-lg shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : tenders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No submitted tenders available</p>
          </div>
        ) : (
          <div>
            {(tenders as Tender[]).map((tender: Tender, index: number) => {
              const { daysLeft, colorClass } = getDaysLeftInfo(tender.deadline);
              
              return (
                <div 
                  key={tender.id || index} 
                  className="border-b border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/tenders/${tender.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center flex-wrap">
                        {/* Days Left with color coding */}
                        <span className={`mr-2 font-medium ${colorClass}`}>
                          {daysLeft} Days Left | 
                        </span>
                        
                        {/* Bid Expiry Date and Time */}
                        <span className="text-sm text-gray-600 mr-2">
                          📅 {new Date(tender.deadline).toLocaleDateString('en-IN')} |
                        </span>
                        
                        <span className="text-sm text-gray-600 mr-2">
                          ⏱️ {new Date(tender.deadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} |
                        </span>
                        
                        {/* Bid/Estimated Value */}
                        <span className="text-sm font-medium text-blue-600 mr-2">
                          {tender.bidValue 
                            ? `₹ ${(tender.bidValue).toLocaleString('en-IN')}` 
                            : tender.estimatedValue 
                              ? `₹ ${(tender.estimatedValue / 10000000).toFixed(2)} CR.` 
                              : 'Value Not Specified'} |
                        </span>
                        
                        {/* EMD */}
                        <span className="text-sm text-gray-600 mr-2">
                          EMD: {tender.emdAmount ? `₹ ${tender.emdAmount.toLocaleString('en-IN')}` : 'Refer Document'} |
                        </span>
                        
                        {/* Status */}
                        <TenderStatus 
                          status={tender.status} 
                          updatedAt={tender.updatedAt} 
                          className="ml-1"
                        />
                      </div>
                      
                      {/* Assigned User and Project Title on same line */}
                      <div className="flex items-center mt-2">
                        <span className="text-sm font-medium text-blue-600 mr-2">
                          <User className="h-4 w-4 inline mr-1 text-blue-500" />
                          {tender.assignedUser 
                            ? tender.assignedUser.name.split(' ')[0] 
                            : "Not Assigned"} -
                        </span>
                        <span className="text-sm text-gray-700">
                          {tender.title || "No title available"}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <span className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {tender.authority} {tender.location ? `- ${tender.location}` : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {/* Bid ID on right side */}
                      <div className="text-sm text-gray-600 mb-2 text-right">
                        <span className="font-medium">Bid ID: <span className="font-semibold text-blue-600">{tender.referenceNo || "N/A"}</span></span>
                      </div>
                      
                      {/* Document Links */}
                      {(tender.bidDocumentPath || tender.atcDocumentPath || tender.techSpecsDocumentPath) && (
                        <div className="mb-3 flex flex-wrap gap-2 justify-end">
                          {tender.bidDocumentPath && (
                            <a 
                              href={`/api/documents/${tender.id}/bid`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Bid Document
                            </a>
                          )}
                          {tender.atcDocumentPath && (
                            <a 
                              href={`/api/documents/${tender.id}/atc`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              ATC Document
                            </a>
                          )}
                          {tender.techSpecsDocumentPath && (
                            <a 
                              href={`/api/documents/${tender.id}/tech`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded hover:bg-emerald-100"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Tech Specs
                            </a>
                          )}
                        </div>
                      )}
                      
                      {/* Single row of action buttons */}
                      <div className="flex space-x-3 justify-end">
                        {tender.id && 
                          <TenderActionButtons 
                            tenderId={tender.id} 
                            isStarred={tender.isStarred}
                            isInterested={tender.isInterested}
                          />
                        }
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}