import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, ChevronUp, User, X, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TenderActionButtons } from "@/components/tender/action-buttons";
import { TenderFilter } from "@/components/tender/tender-filter";
import { TenderCard } from "@/components/tender/tender-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

// Define assignment interface
interface Assignment {
  id: number;
  tenderId: number;
  assignedBy: string;
  assignedTo: string;
  remarks: string;
  assignedAt: string;
  assignedByUserId: number;
  assignedToUserId: number;
}

// Define user interface
interface User {
  id: number;
  name: string;
  role: string;
  department: string;
}

export default function AssignedTeam() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("live");
  
  // Assignment modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assignmentRemark, setAssignmentRemark] = useState("");

  // Fetch assigned tenders
  const { data: tenders = [], isLoading } = useQuery({
    queryKey: ['/api/assigned-tenders'],
    queryFn: async () => {
      const res = await fetch('/api/assigned-tenders');
      if (!res.ok) throw new Error("Failed to fetch assigned tenders");
      return res.json();
    }
  });

  // Fetch users for assignment
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const res = await fetch('/api/user');
      if (!res.ok) throw new Error("Failed to fetch current user");
      return res.json();
    }
  });

  // Fetch assignments for selected tender
  const { data: assignments = [], refetch: refetchAssignments } = useQuery({
    queryKey: ['/api/tenders', selectedTender?.id, 'assignments'],
    queryFn: async () => {
      if (!selectedTender?.id) return [];
      console.log('Fetching assignments for tender:', selectedTender.id);
      const res = await fetch(`/api/tenders/${selectedTender.id}/assignments`);
      if (!res.ok) throw new Error("Failed to fetch assignments");
      const data = await res.json();
      console.log('Assignments data received:', data);
      return data;
    },
    enabled: !!selectedTender?.id && assignModalOpen
  });

  // Assignment mutation
  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTender?.id || !selectedUserId) return;
      const res = await fetch(`/api/tenders/${selectedTender.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(selectedUserId),
          remarks: assignmentRemark,
          assignedBy: currentUser?.id
        })
      });
      if (!res.ok) throw new Error("Failed to assign tender");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tender assigned successfully"
      });
      setSelectedUserId("");
      setAssignmentRemark("");
      refetchAssignments();
      queryClient.invalidateQueries({ queryKey: ['/api/assigned-tenders'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign tender",
        variant: "destructive"
      });
    }
  });

  // Remove assignment mutation
  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      const res = await fetch(`/api/tender-assignments/${assignmentId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Failed to remove assignment");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment removed successfully"
      });
      refetchAssignments();
      queryClient.invalidateQueries({ queryKey: ['/api/assigned-tenders'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove assignment",
        variant: "destructive"
      });
    }
  });

  const handleSearch = (filters: any) => {
    toast({
      title: "Searching with filters",
      description: "Search functionality will be implemented soon."
    });
    console.log("Search filters:", filters);
  };

  const handleExportToExcel = () => {
    toast({
      title: "Exporting...",
      description: "Export to Excel functionality will be implemented soon."
    });
  };

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

  // Handle opening assignment modal
  const handleOpenAssignModal = (tender: Tender) => {
    setSelectedTender(tender);
    setAssignModalOpen(true);
  };

  // Handle closing assignment modal
  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedTender(null);
    setSelectedUserId("");
    setAssignmentRemark("");
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Assigned To Team</h1>
      </div>

      {/* Filter Section */}
      <TenderFilter 
        initiallyExpanded={false} 
        onSearch={handleSearch}
        hideReferenceNumber={true}
        pageType="other"
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
                  <ChevronUp className="h-3 w-3" />
                  <ChevronDown className="h-3 w-3" />
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleExportToExcel} className="flex items-center text-blue-600">
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
            <p className="text-gray-500">No assigned tenders available</p>
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
                        
                        {/* Status - Dynamic based on tender status */}
                        <span className={`px-2 py-0.5 text-xs rounded-full ml-1 ${
                          tender.status?.toLowerCase() === 'new' ? 'bg-blue-100 text-blue-800' :
                          tender.status?.toLowerCase() === 'in_process' ? 'bg-yellow-100 text-yellow-800' :
                          tender.status?.toLowerCase() === 'submitted' ? 'bg-green-100 text-green-800' :
                          tender.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tender.status?.toLowerCase() === 'in_process' ? 'In Process' : 
                           tender.status?.charAt(0).toUpperCase() + tender.status?.slice(1) || 'Assigned'}
                        </span>
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
                              onClick={(e) => e.stopPropagation()}
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
                              onClick={(e) => e.stopPropagation()}
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
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Tech Specs
                            </a>
                          )}
                        </div>
                      )}
                      
                      {/* Single row of action buttons */}
                      <div className="flex space-x-3 justify-end">
                        <TenderActionButtons 
                          tenderId={tender.id || 0} 
                          tenderReferenceNo={tender.referenceNo}
                          isStarred={tender.isStarred}
                          isInterested={tender.isInterested}
                        />
                        {/* Add Assign Button */}
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAssignModal(tender);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      <Dialog open={assignModalOpen} onOpenChange={handleCloseAssignModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Tender Assign
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Tender Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Tender ID</Label>
                  <Input 
                    value={selectedTender?.referenceNo || ""} 
                    readOnly 
                    className="mt-1 bg-white"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Tender Status</Label>
                  <Input 
                    value={selectedTender?.status || ""} 
                    readOnly 
                    className="mt-1 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* New Assignment Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-select" className="text-sm font-medium text-gray-700">
                    Select User *
                  </Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select User" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user: User) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="remarks" className="text-sm font-medium text-gray-700">
                    Remarks *
                  </Label>
                  <Textarea
                    id="remarks"
                    value={assignmentRemark}
                    onChange={(e) => setAssignmentRemark(e.target.value)}
                    placeholder="Remarks"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
              
              <Button
                onClick={() => assignMutation.mutate()}
                disabled={!selectedUserId || !assignmentRemark || assignMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {assignMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>

            {/* Existing Assignments Table */}
            {assignments.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Current Assignments</h3>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-blue-600">
                      <TableRow>
                        <TableHead className="text-white font-semibold">ASSIGN BY</TableHead>
                        <TableHead className="text-white font-semibold">ASSIGN TO</TableHead>
                        <TableHead className="text-white font-semibold">REMARKS</TableHead>
                        <TableHead className="text-white font-semibold">ASSIGN DATE AND TIME</TableHead>
                        <TableHead className="text-white font-semibold">ACTION</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {console.log('Rendering assignments in table:', assignments)}
                      {assignments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                            No assignments found for this tender
                          </TableCell>
                        </TableRow>
                      ) : (
                        assignments.map((assignment: Assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">{assignment.assignedBy}</TableCell>
                            <TableCell>{assignment.assignedTo}</TableCell>
                            <TableCell>{assignment.remarks}</TableCell>
                            <TableCell>
                              {new Date(assignment.assignedAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              })}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeAssignmentMutation.mutate(assignment.id)}
                                disabled={removeAssignmentMutation.isPending}
                                className="hover:bg-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Controls */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Show 10 | Page 1 of 1
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      Prev
                    </Button>
                    <Button variant="outline" size="sm" className="bg-blue-600 text-white">
                      1
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}