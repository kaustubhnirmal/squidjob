import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ExternalLink, 
  Users, 
  Bell, 
  DollarSign, 
  UserPlus, 
  FileText, 
  BarChart3,
  Calendar,
  MapPin,
  Building,
  Sparkles,
  Eye,
  X,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ClipboardList,
  Download,
  FileCheck,
  File,
  Clock,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { Tender } from "@shared/schema";
import { TenderReminderPopup } from "@/components/tender/tender-reminder-popup";
import { RequestToFinanceDialog } from "@/components/dialogs/request-to-finance-dialog";
import { TaskAllocationDialog } from "@/components/dialogs/task-allocation-dialog";
import { KickOffCallDialog } from "@/components/tender/kick-off-call-dialog";
import { TenderStatusDialog } from "@/components/dialogs/tender-status-dialog";
import { RequestApprovalDialog } from "@/components/dialogs/request-approval-dialog";
import { TenderAssignDialog } from "@/components/tender/tender-assign-dialog";
import { BidToRADialog } from "@/components/dialogs/bid-to-ra-dialog";
import { BidResultsDialog } from "@/components/dialogs/bid-results-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TenderDetailsPage() {
  const { id: tenderId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reminderPopupOpen, setReminderPopupOpen] = useState(false);
  const [requestToFinanceOpen, setRequestToFinanceOpen] = useState(false);
  const [taskAllocationOpen, setTaskAllocationOpen] = useState(false);
  const [kickOffCallOpen, setKickOffCallOpen] = useState(false);
  const [showTenderStatusDialog, setShowTenderStatusDialog] = useState(false);
  const [requestApprovalOpen, setRequestApprovalOpen] = useState(false);
  const [bidToRAOpen, setBidToRAOpen] = useState(false);
  const [bidResultsOpen, setBidResultsOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    details: true,
    aiSummary: false,
    participateBidder: false,
    documents: false,
    activityLog: false
  });

  // Get tender details
  const { data: tender = {}, isLoading: tenderLoading } = useQuery({
    queryKey: [`/api/tenders/${tenderId}`],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: !!tenderId
  });

  // Get tender responses to determine button state
  const { data: tenderResponses, refetch: refetchResponses } = useQuery({
    queryKey: [`/api/tender-responses/${tenderId}`],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: !!tenderId,
  });

  // Get all tender documents
  const { data: allDocuments = [], isLoading: documentsLoading } = useQuery({
    queryKey: [`/api/tenders/${tenderId}/all-documents`],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: !!tenderId,
  });

  // Get tender activities
  const { data: tenderActivities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: [`/api/tenders/${tenderId}/activities`],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: !!tenderId,
  });

  // Get AI insights
  const { data: aiInsight = {} } = useQuery({
    queryKey: ["/api/tenders", tenderId, "ai-insights"],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: !!tenderId
  });

  // Get assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/tenders", tenderId, "assignments"],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: !!tenderId
  });

  // Get users for assignment
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: getQueryFn({ on401: "redirect" })
  });

  // Get task allocations
  const { data: taskAllocations = [] } = useQuery({
    queryKey: ["/api/task-allocations", { tenderId }],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: !!tenderId
  });

  // Get RA details
  const { data: reverseAuctions = [] } = useQuery({
    queryKey: [`/api/tenders/${tenderId}/ra`],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: !!tenderId
  });

  // Get bid participants
  const { data: bidParticipants = [] } = useQuery({
    queryKey: [`/api/bid-participants/${tenderId}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!tenderId
  });

  // Generate AI insight mutation
  const generateInsightMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/tenders/${tenderId}/generate-insight`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenders", tenderId, "ai-insights"] });
      toast({
        title: "AI Insight Generated",
        description: "AI analysis has been generated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });



  // Get current user
  const { data: currentUser = {} } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });



  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !(prev as any)[section]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'closed': return 'bg-red-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number | string) => {
    if (!amount) return "N/A";
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹ ${(numAmount / 10000000).toFixed(2)} CR.`;
  };

  // Helper function to get document icon based on type
  const getDocumentIcon = (iconType: string) => {
    switch (iconType) {
      case 'FileText':
        return <FileText className="h-4 w-4" />;
      case 'FileCheck':
        return <FileCheck className="h-4 w-4" />;
      case 'File':
        return <File className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Helper function to get document color classes
  const getDocumentColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'green':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'orange':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'gray':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Helper function to get activity color classes
  const getActivityColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return 'text-red-600';
      case 'orange':
        return 'text-orange-600';
      case 'green':
        return 'text-green-600';
      case 'blue':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Helper function to format activity action
  const formatActivityAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (tenderLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Tender Not Found</h2>
            <p className="text-gray-500 mb-4">The requested tender could not be found.</p>
            <Link href="/tenders">
              <Button>Back to Tenders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium text-gray-900">Tender Details</h1>
              <p className="text-xs text-gray-600 mt-1">Complete tender information and insights</p>
            </div>
            <Link href="/tenders">
              <Button variant="outline">Back to Tenders</Button>
            </Link>
          </div>

          {/* Tender Details Section */}
          <Card>
            <Collapsible open={openSections.details} onOpenChange={() => toggleSection('details')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      Tender Details
                    </CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.details ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {/* Primary Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tender ID</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{(tender as any)?.referenceNo || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tender Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="capitalize">{(tender as any)?.status || "N/A"}</Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tender Authority</label>
                      <p className="text-base font-medium text-gray-900 mt-1">
                        {(tender as any)?.authority || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Key Information Grid */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Estimate Value</label>
                        <p className="text-base font-medium text-gray-900 mt-1">
                          {tender?.estimatedValue ? `₹ ${Number(tender.estimatedValue).toLocaleString()}` : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">EMD Amount</label>
                        <p className="text-base font-medium text-gray-900 mt-1">
                          {tender?.emdAmount ? `₹ ${Number(tender.emdAmount).toLocaleString()}` : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Published Date</label>
                        <p className="text-base font-medium text-gray-900 mt-1">
                          {tender?.createdAt ? formatDate(tender.createdAt) : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Due Date</label>
                        <p className="text-base font-medium text-gray-900 mt-1">
                          {tender?.deadline ? formatDate(tender.deadline) : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Bid Start Date</label>
                        <p className="text-base font-medium text-gray-900 mt-1">
                          {tender?.createdAt ? formatDate(tender.createdAt) : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Location</label>
                        <p className="text-base font-medium text-gray-900 mt-1">
                          {tender?.location || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Brief Section */}
                  <div className="border-t pt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Brief</label>
                      <p className="text-base text-gray-800 mt-2 leading-relaxed">
                        {tender?.brief || tender?.title || "No description available"}
                      </p>
                    </div>
                  </div>

                  {/* RA Section within Tender Details - Only show when data exists */}
                  {reverseAuctions && reverseAuctions.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                        
                        <div className="space-y-4">
                          {reverseAuctions.map((ra: any) => (
                            <div key={ra.id} className="bg-white border border-red-200 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-red-700">RA No.</label>
                                  <p className="text-base font-semibold text-gray-900 mt-1">{ra.raNo}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-red-700">Status</label>
                                  <Badge 
                                    variant={ra.status === 'Active' ? 'default' : 'secondary'} 
                                    className={ra.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}
                                  >
                                    {ra.status}
                                  </Badge>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-red-700">Start Date & Time</label>
                                  <p className="text-base font-medium text-gray-900 mt-1">
                                    {ra.startDate ? new Date(ra.startDate).toLocaleString('en-GB', { 
                                      year: 'numeric', 
                                      month: '2-digit', 
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                    }) : "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-red-700">End Date & Time</label>
                                  <p className="text-base font-medium text-gray-900 mt-1">
                                    {ra.endDate ? new Date(ra.endDate).toLocaleString('en-GB', { 
                                      year: 'numeric', 
                                      month: '2-digit', 
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                    }) : "N/A"}
                                  </p>
                                </div>

                                {ra.startAmount && (
                                  <div>
                                    <label className="text-sm font-medium text-red-700">Start Amount</label>
                                    <p className="text-base font-medium text-gray-900 mt-1">
                                      ₹ {Number(ra.startAmount).toLocaleString()}
                                    </p>
                                  </div>
                                )}
                                {ra.endAmount && (
                                  <div>
                                    <label className="text-sm font-medium text-red-700">End Amount</label>
                                    <p className="text-base font-medium text-gray-900 mt-1">
                                      ₹ {Number(ra.endAmount).toLocaleString()}
                                    </p>
                                  </div>
                                )}
                                {ra.documentPath && (
                                  <div>
                                    <label className="text-sm font-medium text-red-700">Document</label>
                                    <p className="text-base font-medium text-blue-600 mt-1">
                                      <a href={`/api/ra/${ra.id}/download`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                        <Download className="h-4 w-4" />
                                        Download Document
                                      </a>
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="mt-4 pt-4 border-t border-red-200">
                                <div className="flex justify-between items-center text-xs text-gray-400">
                                  <span>Created by: {ra.createdByUser || "N/A"}</span>
                                  <span>Created on: {ra.createdAt ? new Date(ra.createdAt).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  }) : 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* AI Generated Summary Section */}
          <Card>
            <Collapsible open={openSections.aiSummary} onOpenChange={() => toggleSection('aiSummary')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="h-5 w-5" />
                      AI Generated Tender Summary / Eligibility Criteria
                    </CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.aiSummary ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {aiInsight ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
                        <p className="text-gray-700 leading-relaxed">{aiInsight.summary}</p>
                      </div>
                      
                      {aiInsight.keyPoints && aiInsight.keyPoints.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Key Points</h4>
                          <ul className="space-y-2">
                            {aiInsight.keyPoints.map((point, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiInsight.requirements && aiInsight.requirements.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Requirements</h4>
                          <ul className="space-y-2">
                            {aiInsight.requirements.map((req, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiInsight.riskFactors && aiInsight.riskFactors.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Risk Factors</h4>
                          <ul className="space-y-2">
                            {aiInsight.riskFactors.map((risk, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-red-700">{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiInsight.recommendations && aiInsight.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Recommendations</h4>
                          <ul className="space-y-2">
                            {aiInsight.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span className="text-green-700">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t">
                        <p className="text-sm text-gray-500">
                          Generated on {formatDate(aiInsight.createdAt)}
                        </p>
                        <Button 
                          onClick={() => generateInsightMutation.mutate()}
                          disabled={generateInsightMutation.isPending}
                          variant="outline"
                          size="sm"
                        >
                          {generateInsightMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-2" />
                              Regenerate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Insights Available</h3>
                      <p className="text-gray-500 mb-4">Generate AI-powered tender summary and analysis</p>
                      <Button 
                        onClick={() => generateInsightMutation.mutate()}
                        disabled={generateInsightMutation.isPending}
                      >
                        {generateInsightMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate AI Summary
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>







          {/* Tender Documents Section */}
          <Card>
            <Collapsible open={openSections.documents} onOpenChange={() => toggleSection('documents')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      Tender Documents
                    </CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.documents ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {documentsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gray-200 rounded"></div>
                            <div className="flex-1 space-y-2">
                              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                              <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : allDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {allDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getDocumentColorClasses(doc.color)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`p-2 rounded-full ${getDocumentColorClasses(doc.color)}`}>
                                {getDocumentIcon(doc.icon)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {doc.category}
                                  </Badge>
                                  {doc.responseType && (
                                    <Badge variant="outline" className="text-xs">
                                      {doc.responseType}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {new Date(doc.createdAt).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })} at {new Date(doc.createdAt).toLocaleTimeString('en-GB', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <User className="h-3 w-3" />
                                    <span>{doc.uploadedByName}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium btn-purple rounded-md transition-colors"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Available</h3>
                      <p className="text-gray-500">No documents have been uploaded for this tender yet.</p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Activity Log Section */}
          <Card>
            <Collapsible open={openSections.activityLog} onOpenChange={() => toggleSection('activityLog')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ClipboardList className="h-5 w-5" />
                      Activity Log
                    </CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.activityLog ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                              <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : tenderActivities.length > 0 ? (
                    <div className="space-y-3">
                      {tenderActivities.map((activity, index) => (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-purple-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">{activity.userName}</span>
                              <span className={`font-medium ${getActivityColorClasses(activity.actionColor)}`}>
                                {formatActivityAction(activity.action)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              <span className="font-medium text-purple-600 mr-2">#{activity.activityNumber}</span>
                              {activity.metadata?.description || activity.action}
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(activity.createdAt).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })} at {new Date(activity.createdAt).toLocaleTimeString('en-GB', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              {activity.userEmail && (
                                <span className="text-gray-400">{activity.userEmail}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Yet</h3>
                      <p className="text-gray-500">No activities have been recorded for this tender.</p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="btn-purple py-3 px-4">
              <CardTitle className="text-sm font-medium text-center">TENDER FEATURES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">

              <Button 
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200" 
                variant="outline"
                onClick={() => setAssignModalOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Team
              </Button>
              <Button 
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200" 
                variant="outline"
                onClick={() => setReminderPopupOpen(true)}
              >
                <Bell className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
              <Button 
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200" 
                variant="outline"
                onClick={() => setRequestToFinanceOpen(true)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Request to Finance
              </Button>
              <Button 
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200" 
                variant="outline"
                onClick={() => setTaskAllocationOpen(true)}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Task Allocation
              </Button>
              <Button 
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200" 
                variant="outline"
                onClick={() => setKickOffCallOpen(true)}
              >
                <Bell className="h-4 w-4 mr-2" />
                Kick off call
              </Button>
              <Button 
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200" 
                variant="outline"
                onClick={() => setShowTenderStatusDialog(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Tender Status
              </Button>
              <Button 
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200" 
                variant="outline"
                onClick={() => setRequestApprovalOpen(true)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Request For Approval
              </Button>
              <Button 
                className={`w-full ${
                  tenderResponses && tenderResponses.length > 0 
                    ? "btn-purple" 
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                }`}
                variant={tenderResponses && tenderResponses.length > 0 ? "default" : "outline"}
                onClick={() => setLocation(`/tender-checklist/${tenderId}`)}
              >
                <Lightbulb className={`h-4 w-4 mr-2 ${
                  tenderResponses && tenderResponses.length > 0 ? "text-yellow-400" : ""
                }`} />
                {tenderResponses && tenderResponses.length > 0 ? "View Response" : "Prepare Response"}
              </Button>
              <Button 
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200" 
                variant="outline"
                onClick={() => setBidToRAOpen(true)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                RA
              </Button>
              <Button 
                className={`w-full ${
                  bidParticipants && bidParticipants.length > 0 
                    ? "btn-purple" 
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                }`}
                variant={bidParticipants && bidParticipants.length > 0 ? "default" : "outline"}
                onClick={() => setBidResultsOpen(true)}
              >
                <Users className={`h-4 w-4 mr-2 ${
                  bidParticipants && bidParticipants.length > 0 ? "text-white" : ""
                }`} />
                Bid Results
              </Button>
            </CardContent>
          </Card>


        </div>
      </div>

      {/* Tender Assignment Dialog */}
      <TenderAssignDialog
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        tenderId={parseInt(tenderId || "0")}
        tenderReferenceNo={tender?.referenceNo || ""}
      />

      {/* Tender Reminder Popup */}
      <TenderReminderPopup
        isOpen={reminderPopupOpen}
        onClose={() => setReminderPopupOpen(false)}
        tenderId={parseInt(tenderId || "0")}
        tenderReferenceNo={tender?.referenceNo || ""}
      />

      {/* Request to Finance Dialog */}
      {tender && (
        <RequestToFinanceDialog
          open={requestToFinanceOpen}
          onOpenChange={setRequestToFinanceOpen}
          tender={tender}
        />
      )}

      {/* Task Allocation Dialog */}
      {tender && (
        <TaskAllocationDialog
          open={taskAllocationOpen}
          onOpenChange={setTaskAllocationOpen}
          tenderId={parseInt(tenderId || "0")}
          tenderReferenceNo={tender.referenceNo}
        />
      )}

      {/* Kick Off Call Dialog */}
      <KickOffCallDialog
        isOpen={kickOffCallOpen}
        onClose={() => setKickOffCallOpen(false)}
        tenderId={parseInt(tenderId!)}
      />

      {/* Tender Status Dialog */}
      {tender && (
        <TenderStatusDialog
          isOpen={showTenderStatusDialog}
          onClose={() => setShowTenderStatusDialog(false)}
          tender={tender}
        />
      )}

      {/* Request Approval Dialog */}
      {tender && (
        <RequestApprovalDialog
          open={requestApprovalOpen}
          onOpenChange={setRequestApprovalOpen}
          tender={tender}
        />
      )}

      {/* Bid to RA Dialog */}
      {tender && (
        <BidToRADialog
          open={bidToRAOpen}
          onOpenChange={setBidToRAOpen}
          tender={tender}
        />
      )}

      {/* Bid Results Dialog */}
      {tender && (
        <BidResultsDialog
          open={bidResultsOpen}
          onOpenChange={setBidResultsOpen}
          tender={tender}
        />
      )}
    </div>
  );
}