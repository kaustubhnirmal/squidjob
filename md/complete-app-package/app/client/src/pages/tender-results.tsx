import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Award, 
  Eye, 
  Save, 
  Share2,
  Building,
  Clock,
  Search,
  Filter,
  ChevronDown,
  Users,
  UserPlus,
  FileText,
  Download,
  FileSpreadsheet,
  FileX
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getQueryFn } from "@/lib/queryClient";
import { Link } from "wouter";
import { BidResultsDialog } from "@/components/dialogs/bid-results-dialog";
import { exportTenderResultsToExcel, exportTenderResultsToPDF, TenderResultExport } from "@/utils/tender-results-export";
import { useToast } from "@/hooks/use-toast";

interface TenderResult {
  id: number;
  referenceNo: string;
  title: string;
  brief: string;
  authority: string;
  location: string;
  deadline: string;
  emdAmount: string;
  status: string;
  createdAt: string;
  l1Winner?: {
    participantName: string;
    bidAmount: string;
    bidderStatus: string;
  };
  participantCount: number;
  userParticipated: boolean;
}

const statusColors = {
  awarded: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  published: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons = {
  awarded: Trophy,
  completed: Award,
  published: Award,
  cancelled: Award,
};

export default function TenderResults() {
  const [activeTab, setActiveTab] = useState("fresh");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [bidResultsOpen, setBidResultsOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<TenderResult | null>(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const { toast } = useToast();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  // Get all tender results data at once
  const { data: allTenderResults = [], isLoading } = useQuery({
    queryKey: ["/api/tender-results"],
    queryFn: async () => {
      const response = await fetch(`/api/tender-results`, {
        headers: {
          'x-user-id': currentUser?.id.toString() || '',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tender results');
      }
      return response.json();
    },
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  });

  const formatAmount = (amount: string | number) => {
    if (!amount) return "N/A";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getDaysLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter data based on active tab and search/filter criteria
  const getFilteredResults = () => {
    let filteredData = allTenderResults;

    // Filter by tab
    switch (activeTab) {
      case "fresh":
        filteredData = allTenderResults.filter((t: TenderResult) => 
          t.status === "published" || t.status === "awarded" || t.status === "lost"
        );
        break;
      case "awarded":
        filteredData = allTenderResults.filter((t: TenderResult) => t.status === "awarded");
        break;
      case "lost":
        filteredData = allTenderResults.filter((t: TenderResult) => t.status === "lost");
        break;
      case "myResults":
        filteredData = allTenderResults.filter((t: TenderResult) => t.userParticipated);
        break;
      default:
        filteredData = allTenderResults;
    }

    // Apply search filter
    if (searchQuery) {
      filteredData = filteredData.filter((tender: TenderResult) =>
        tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.authority.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply additional filters
    if (filterBy === "won") {
      filteredData = filteredData.filter((tender: TenderResult) => 
        tender.l1Winner?.participantName === currentUser?.name
      );
    } else if (filterBy === "participated") {
      filteredData = filteredData.filter((tender: TenderResult) => tender.userParticipated);
    }

    return filteredData;
  };

  const tenderResults = getFilteredResults();

  const getStatusColor = (status: string) => {
    return statusColors[status.toLowerCase() as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = statusIcons[status.toLowerCase() as keyof typeof statusIcons] || Award;
    return IconComponent;
  };

  const handleDownloadPDF = async (tender: TenderResult) => {
    try {
      const response = await fetch(`/api/tenders/${tender.id}/bid-results/download`, {
        method: 'GET',
        headers: {
          'x-user-id': currentUser?.id.toString() || '',
        },
      });
      
      if (response.ok) {
        // Get filename from server response header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `tender-results-${tender.referenceNo}.pdf`; // fallback
        
        if (contentDisposition && contentDisposition.includes('filename=')) {
          const matches = contentDisposition.match(/filename="([^"]+)"/);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // Use actual filename from server
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleAddParticipants = (tender: TenderResult) => {
    setSelectedTender(tender);
    setBidResultsOpen(true);
  };

  // Calculate tab counts based on all data
  const tabCounts = {
    fresh: allTenderResults.filter((t: TenderResult) => t.status === "published" || t.status === "awarded" || t.status === "lost").length,
    awarded: allTenderResults.filter((t: TenderResult) => t.status === "awarded").length,
    lost: allTenderResults.filter((t: TenderResult) => t.status === "lost").length,
    myResults: allTenderResults.filter((t: TenderResult) => t.userParticipated).length,
  };

  const filteredResults = tenderResults;

  // Export functions
  const handleExportToExcel = async () => {
    if (isExportingExcel) return;
    
    setIsExportingExcel(true);
    try {
      // Get detailed tender data for export
      const exportData = await Promise.all(
        tenderResults.map(async (tender: TenderResult) => {
          // Get bid participants for this tender
          const participantsResponse = await fetch(`/api/tenders/${tender.id}/participants`, {
            headers: { 'x-user-id': currentUser?.id.toString() || '' }
          });
          const participants = participantsResponse.ok ? await participantsResponse.json() : [];
          
          // Get tender assignments
          const assignmentsResponse = await fetch(`/api/tenders/${tender.id}/assignments`, {
            headers: { 'x-user-id': currentUser?.id.toString() || '' }
          });
          const assignments = assignmentsResponse.ok ? await assignmentsResponse.json() : [];
          
          // Get RA data
          const raResponse = await fetch(`/api/tenders/${tender.id}/ra`, {
            headers: { 'x-user-id': currentUser?.id.toString() || '' }
          });
          const raData = raResponse.ok ? await raResponse.json() : null;
          
          return {
            ...tender,
            participants: participants.map((p: any) => ({
              ...p,
              participantName: p.participantName || 'Unknown Participant',
              status: p.bidderStatus || p.status || 'L1',
              startAmount: p.bidAmount || p.startAmount || 0,
              endAmount: p.bidAmount || p.endAmount || 0
            })),
            assignedUsers: assignments.map((a: any) => ({ 
              name: a.assignedTo || a.assignedUser?.name || 'System'
            })),
            raNo: raData?.raNo || raData?.bidNo || '',
            estimatedValue: tender.estimatedValue || tender.emdAmount || 0,
            publishedDate: tender.createdAt,
            bidStartDate: tender.createdAt,
            dueDate: tender.deadline,
            tabName: activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
          } as TenderResultExport;
        })
      );
      
      exportTenderResultsToExcel(exportData, `tender-results-${activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: "Tender results have been exported to Excel successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export tender results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportToPDF = async () => {
    if (isExportingPDF) return;
    
    setIsExportingPDF(true);
    try {
      // Get detailed tender data for export
      const exportData = await Promise.all(
        tenderResults.map(async (tender: TenderResult) => {
          // Get bid participants for this tender
          const participantsResponse = await fetch(`/api/tenders/${tender.id}/participants`, {
            headers: { 'x-user-id': currentUser?.id.toString() || '' }
          });
          const participants = participantsResponse.ok ? await participantsResponse.json() : [];
          
          // Get tender assignments
          const assignmentsResponse = await fetch(`/api/tenders/${tender.id}/assignments`, {
            headers: { 'x-user-id': currentUser?.id.toString() || '' }
          });
          const assignments = assignmentsResponse.ok ? await assignmentsResponse.json() : [];
          
          // Get RA data
          const raResponse = await fetch(`/api/tenders/${tender.id}/ra`, {
            headers: { 'x-user-id': currentUser?.id.toString() || '' }
          });
          const raData = raResponse.ok ? await raResponse.json() : null;
          
          return {
            ...tender,
            participants: participants.map((p: any) => ({
              ...p,
              participantName: p.participantName || 'Unknown Participant',
              status: p.bidderStatus || p.status || 'L1',
              startAmount: p.bidAmount || p.startAmount || 0,
              endAmount: p.bidAmount || p.endAmount || 0
            })),
            assignedUsers: assignments.map((a: any) => ({ 
              name: a.assignedTo || a.assignedUser?.name || 'System'
            })),
            raNo: raData?.raNo || raData?.bidNo || '',
            estimatedValue: tender.estimatedValue || tender.emdAmount || 0,
            publishedDate: tender.createdAt,
            bidStartDate: tender.createdAt,
            dueDate: tender.deadline,
            tabName: activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
          } as TenderResultExport;
        })
      );
      
      exportTenderResultsToPDF(exportData, `tender-results-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export Successful",
        description: "Tender results have been exported to PDF successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export tender results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExportingPDF(false);
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tender Results</h1>
              <p className="text-sm text-gray-600">Track the outcome of tenders you've participated in</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportToExcel}
                disabled={isExportingExcel}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                size="sm"
                variant="outline"
              >
                {isExportingExcel ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </>
                )}
              </Button>
              <Button
                onClick={handleExportToPDF}
                disabled={isExportingPDF}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                size="sm"
                variant="outline"
              >
                {isExportingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter By
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search tenders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Filter By</Label>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="won">Won Tenders</SelectItem>
                    <SelectItem value="participated">Participated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border rounded-lg p-1">
            <TabsTrigger 
              value="fresh" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Fresh Results
              {tabCounts.fresh > 0 && (
                <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                  {tabCounts.fresh}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="awarded" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Awarded Tenders
              {tabCounts.awarded > 0 && (
                <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                  {tabCounts.awarded}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="lost" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Lost Tenders
              {tabCounts.lost > 0 && (
                <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                  {tabCounts.lost}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="myResults" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              My Results
              {tabCounts.myResults > 0 && (
                <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                  {tabCounts.myResults}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredResults.map((tender: TenderResult) => {
                const StatusIcon = getStatusIcon(tender.status);
                const daysLeft = getDaysLeft(tender.deadline);
                const isWon = tender.l1Winner?.participantName === currentUser?.name;
                
                return (
                  <Card key={tender.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        {/* Left side - Main content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getStatusColor(tender.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
                            </Badge>
                            {isWon && (
                              <Badge className="bg-green-100 text-green-800">
                                <Trophy className="w-3 h-3 mr-1" />
                                Won
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {tender.title}
                          </h3>
                          
                          <p className="text-sm text-purple-600 font-medium mb-3">
                            {tender.referenceNo}
                          </p>
                          
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {tender.brief}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 truncate">{tender.authority}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 truncate">{tender.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {formatDate(tender.deadline)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <IndianRupee className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {formatAmount(tender.emdAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right side - Actions */}
                        <div className="flex flex-col items-end gap-4 ml-6">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadPDF(tender)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {daysLeft >= 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days ago`}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{tender.participantCount} participants</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {tender.participantCount > 0 ? (
                              <Button 
                                onClick={() => handleAddParticipants(tender)}
                                size="sm" 
                                variant="outline"
                                className="border-purple-600 text-purple-600 hover:bg-purple-50"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View Results
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handleAddParticipants(tender)}
                                size="sm" 
                                variant="outline"
                                className="border-purple-600 text-purple-600 hover:bg-purple-50"
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Participants
                              </Button>
                            )}
                            <Link href={`/tenders/${tender.id}`}>
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                      
                      {/* L1 Winner Information - Full width */}
                      {tender.l1Winner && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-medium text-yellow-800">L1 Winner</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-yellow-700">
                              <IndianRupee className="w-3 h-3" />
                              <span className="font-medium">{formatAmount(tender.l1Winner.bidAmount)}</span>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-yellow-700 mt-1">
                            {tender.l1Winner.participantName}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredResults.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tender results found</h3>
                <p className="text-gray-600">
                  {searchQuery || filterBy !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "No tender results are available for this category"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bid Results Dialog */}
      {selectedTender && (
        <BidResultsDialog
          open={bidResultsOpen}
          onOpenChange={setBidResultsOpen}
          tender={selectedTender}
        />
      )}
    </div>
  );
}