import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Download, Search, Star, Heart, Clock, User, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TenderActionButtons } from "@/components/tender/action-buttons";
import { AssignButton } from "@/components/tender/assign-button";
import { TenderFilter } from "@/components/tender/tender-filter";
import { TenderStatus } from "@/components/tender-status";
import { exportTendersToExcel, TenderExportData } from "@/utils/excel-export";
import { useUser } from "@/hooks/use-user";

// Define the tender interface to avoid 'any' type errors
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
  // User-specific tender properties
  isStarred?: boolean;
  isInterested?: boolean;
}

export default function Tenders() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { currentUser } = useUser();
  
  // Clean up old filter states - now handled by TenderFilter component

  // Tab state
  const [activeTab, setActiveTab] = useState("all");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Export to Excel functionality
  const handleExportToExcel = async () => {
    try {
      toast({
        title: "Generating Excel Report",
        description: "Please wait while we collect data from all tabs...",
      });

      // Fetch data from all tabs
      const allTabs = ['fresh', 'live', 'archive', 'interested', 'star'];
      const allTendersData: TenderExportData[] = [];

      for (const tab of allTabs) {
        const response = await fetch(`/api/tenders?status=${tab}`, {
          headers: {
            'x-user-id': currentUser?.id?.toString() || '2'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const tenders = Array.isArray(data) ? data : data.tenders || [];
          
          // Map tenders to export format
          const mappedTenders = tenders.map((tender: any) => ({
            id: tender.id,
            referenceNo: tender.referenceNo,
            title: tender.title,
            authority: tender.authority,
            location: tender.location,
            deadline: tender.deadline,
            emdAmount: tender.emdAmount,
            estimatedValue: tender.estimatedValue,
            status: tender.status,
            publishedDate: tender.publishedDate || tender.createdAt,
            bidStartDate: tender.bidStartDate,
            dueDate: tender.dueDate || tender.deadline,
            tabName: tab.charAt(0).toUpperCase() + tab.slice(1),
            assignedUsers: tender.assignedUsers || (tender.assignedUser ? [tender.assignedUser] : []),
            raNo: tender.raNo,
            l1Bidder: tender.l1Bidder,
            l1Amount: tender.l1Amount
          }));
          
          allTendersData.push(...mappedTenders);
        }
      }

      // Export to Excel
      exportTendersToExcel(allTendersData, 'all-tenders-report.xlsx');
      
      toast({
        title: "Export Successful",
        description: "Tenders report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate Excel report. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch all tenders data at once for instant tab switching
  const { data: allTendersData = [], isLoading } = useQuery({
    queryKey: ['/api/tenders/all', currentUser?.id],
    queryFn: async () => {
      const res = await fetch('/api/tenders/all', {
        headers: {
          'x-user-id': currentUser?.id?.toString() || '2' // Use current user ID
        }
      });
      if (!res.ok) throw new Error("Failed to fetch tenders");
      return res.json();
    },
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  });
  
  // Filter tenders based on active tab and search query
  const getFilteredTenders = () => {
    let filteredData = allTendersData;
    
    // Apply tab filtering
    switch (activeTab) {
      case "all":
        filteredData = allTendersData; // Show all published tenders
        break;
      case "live":
        filteredData = allTendersData.filter((tender: Tender) => {
          const daysLeft = Math.ceil((new Date(tender.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysLeft >= 0;
        });
        break;
      case "archive":
        filteredData = allTendersData.filter((tender: Tender) => {
          const daysLeft = Math.ceil((new Date(tender.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysLeft < 0;
        });
        break;
      case "interested":
        filteredData = allTendersData.filter((tender: Tender) => tender.isInterested);
        break;
      case "star":
        filteredData = allTendersData.filter((tender: Tender) => tender.isStarred);
        break;
      default:
        filteredData = allTendersData;
    }
    
    // Apply search filter
    if (searchQuery) {
      filteredData = filteredData.filter((tender: Tender) =>
        tender.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.referenceNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.authority?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filteredData;
  };
  
  const tenders = getFilteredTenders();
  
  // Calculate tab counts based on all data
  const tabCounts = {
    all: allTendersData.length, // Count of all published tenders
    live: allTendersData.filter((tender: Tender) => {
      const daysLeft = Math.ceil((new Date(tender.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft >= 0;
    }).length,
    archive: allTendersData.filter((tender: Tender) => {
      const daysLeft = Math.ceil((new Date(tender.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft < 0;
    }).length,
    interested: allTendersData.filter((tender: Tender) => tender.isInterested).length,
    star: allTendersData.filter((tender: Tender) => tender.isStarred).length,
  };
  
  // Calculate pagination
  const totalTenders = tenders.length;
  const totalPages = Math.ceil(totalTenders / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTenders = tenders.slice(startIndex, endIndex);
  
  // Reset to first page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Search functions removed - now handled by TenderFilter component



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
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Tender</h1>
      </div>

      {/* Filter Section */}
      <TenderFilter 
        initiallyExpanded={false}
        onSearch={(filters) => {
          const searchText = filters.referenceNumber || filters.tenderId || filters.keyword;
          setSearchQuery(searchText);
          toast({
            title: "Searching tenders",
            description: searchText ? `Searching for "${searchText}"` : "Showing all tenders"
          });
        }}
        hideReferenceNumber={false}
        pageType="all"
      />

      {/* Tabs and Export Button - Responsive */}
      <div className="bg-gray-50 rounded-t-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200">
          {/* Tab buttons - responsive wrap */}
          <div className="flex flex-wrap items-center flex-1 min-w-0">
            <button
              className={`px-3 py-2 font-medium text-xs sm:text-sm flex-shrink-0 ${
                activeTab === "all" ? "bg-white text-blue-600" : "text-gray-500 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All ({tabCounts.all})
            </button>
            <button
              className={`px-3 py-2 font-medium text-xs sm:text-sm flex-shrink-0 ${
                activeTab === "live" ? "bg-white text-blue-600" : "text-gray-500 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("live")}
            >
              Live ({tabCounts.live})
            </button>
            <button
              className={`px-3 py-2 font-medium text-xs sm:text-sm flex-shrink-0 ${
                activeTab === "archive" ? "bg-white text-blue-600" : "text-gray-500 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("archive")}
            >
              Archive ({tabCounts.archive})
            </button>
            <button
              className={`px-3 py-2 font-medium text-xs sm:text-sm flex-shrink-0 ${
                activeTab === "interested" ? "bg-white text-blue-600" : "text-gray-500 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("interested")}
            >
              Interested ({tabCounts.interested})
            </button>
            <button
              className={`px-3 py-2 font-medium text-xs sm:text-sm flex-shrink-0 ${
                activeTab === "star" ? "bg-white text-blue-600" : "text-gray-500 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("star")}
            >
              Star ({tabCounts.star})
            </button>
          </div>
          
          {/* Export section - responsive */}
          <div className="flex items-center justify-between sm:justify-end px-4 py-2 border-t sm:border-t-0 bg-gray-50">
            <div className="flex items-center mr-4">
              <span className="text-xs sm:text-sm mr-1">Value</span>
              <div className="flex flex-col">
                <ChevronUp className="h-3 w-3" />
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportToExcel} 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Excel</span>
              <span className="sm:hidden">XLS</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tender Content */}
      <div className="bg-white border-x border-b border-gray-200 rounded-b-lg shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : paginatedTenders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {searchQuery ? `No tenders found matching "${searchQuery}"` : "No tenders available"}
            </p>
          </div>
        ) : (
          <div>
            {(paginatedTenders as Tender[]).map((tender: Tender, index: number) => {
              const { daysLeft, colorClass } = getDaysLeftInfo(tender.deadline);
              
              return (
                <div 
                  key={tender.id || index} 
                  className="border-b border-gray-200 p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/tenders/${tender.id}`)}
                >
                  {/* Mobile-first responsive layout */}
                  <div className="space-y-3 sm:space-y-2">
                    
                    {/* Top Row: Days Left + Bid ID */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex items-center flex-wrap gap-1">
                        <span className={`font-medium text-sm sm:text-base ${colorClass}`}>
                          {daysLeft} Days Left
                        </span>
                        <TenderStatus 
                          status={tender.status} 
                          updatedAt={tender.updatedAt} 
                          className="ml-2"
                        />
                      </div>
                      <div className="text-sm text-gray-600 sm:text-right">
                        <span className="font-medium">Bid ID: <span className="font-semibold text-blue-600">{tender.referenceNo || "N/A"}</span></span>
                      </div>
                    </div>

                    {/* Second Row: Date, Time, Value */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="mr-1">📅</span>
                        {new Date(tender.deadline).toLocaleDateString('en-IN')}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">⏱️</span>
                        {new Date(tender.deadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center font-medium text-blue-600">
                        <span className="mr-1">💰</span>
                        {tender.bidValue 
                          ? `₹ ${(tender.bidValue).toLocaleString('en-IN')}` 
                          : tender.estimatedValue 
                            ? `₹ ${(tender.estimatedValue / 10000000).toFixed(2)} CR.` 
                            : 'Value Not Specified'}
                      </div>
                    </div>

                    {/* Third Row: EMD */}
                    <div className="text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">EMD:</span> {tender.emdAmount ? `₹ ${tender.emdAmount.toLocaleString('en-IN')}` : 'Refer Document'}
                    </div>

                    {/* Fourth Row: Assigned User + Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <div className="flex items-center text-sm font-medium text-blue-600">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-blue-500" />
                        <span>{tender.assignedUser ? tender.assignedUser.name.split(' ')[0] : "Not Assigned"}</span>
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-2 sm:line-clamp-1">
                        {tender.title || "No title available"}
                      </div>
                    </div>

                    {/* Fifth Row: Authority + Location */}
                    <div className="flex items-start text-xs sm:text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="line-clamp-2">
                        {tender.authority} {tender.location ? `- ${tender.location}` : ''}
                      </span>
                    </div>
                    
                    {/* Document Links - Mobile optimized */}
                    {(tender.bidDocumentPath || tender.atcDocumentPath || tender.techSpecsDocumentPath) && (
                      <div className="flex flex-wrap gap-1 sm:gap-2 pt-2 border-t border-gray-100">
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
                    
                    {/* Action buttons row */}
                    <div className="flex space-x-2 sm:space-x-3 justify-end pt-2">
                      {tender.id && (
                        <TenderActionButtons 
                          tenderId={tender.id} 
                          tenderReferenceNo={tender.referenceNo}
                          isStarred={tender.isStarred}
                          isInterested={tender.isInterested}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
              <span>Showing {startIndex + 1} to {Math.min(endIndex, totalTenders)} of {totalTenders} entries</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="ml-4 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="ml-2">per page</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "bg-purple-600 text-white" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}