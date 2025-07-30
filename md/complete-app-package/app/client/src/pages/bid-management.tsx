import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Building2,
  FileText,
  Users,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/hooks/use-user";

// Types based on database schema
interface BidParticipation {
  id: number;
  tender_id: number;
  bid_amount: string;
  notes: string | null;
  status: "draft" | "submitted" | "approved" | "rejected";
  created_at: Date;
  created_by: number;
  updated_at: Date | null;
  tender?: {
    id: number;
    title: string;
    referenceNo: string;
    deadline: Date;
    authority: string;
  };
  companies?: Array<{
    id: number;
    name: string;
    role: string;
  }>;
}

interface Company {
  id: number;
  name: string;
  type: "Dealer" | "OEM";
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  gst_number: string;
  status: "Active" | "Inactive";
  created_at: Date;
}

interface BidDocument {
  id: number;
  bid_participation_id: number;
  document_name: string;
  file_path: string;
  document_type: string;
  uploaded_at: Date;
  uploaded_by: number;
}

export default function BidManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useUser();
  
  // State management
  const [activeTab, setActiveTab] = useState("participations");
  const [selectedParticipation, setSelectedParticipation] = useState<BidParticipation | null>(null);
  const [isCreateParticipationOpen, setIsCreateParticipationOpen] = useState(false);
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form states
  const [participationForm, setParticipationForm] = useState({
    tender_id: "",
    bid_amount: "",
    notes: "",
    companies: [] as Array<{ company_id: number; role: string; }>,
  });

  const [companyForm, setCompanyForm] = useState({
    name: "",
    type: "Dealer" as "Dealer" | "OEM",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    gst_number: "",
  });

  // Fetch data
  const { data: bidParticipations = [], isLoading: loadingParticipations } = useQuery<BidParticipation[]>({
    queryKey: ["/api/bid-participations"],
  });

  const { data: companies = [], isLoading: loadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: tenders = [] } = useQuery<any[]>({
    queryKey: ["/api/tenders"],
  });

  const { data: bidDocuments = [] } = useQuery<BidDocument[]>({
    queryKey: ["/api/bid-documents"],
  });

  // Mutations
  const createParticipationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bid-participations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bid-participations"] });
      setIsCreateParticipationOpen(false);
      setParticipationForm({
        tender_id: "",
        bid_amount: "",
        notes: "",
        companies: [],
      });
      toast({
        title: "Success",
        description: "Bid participation created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create bid participation",
        variant: "destructive",
      });
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/companies", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setIsCreateCompanyOpen(false);
      setCompanyForm({
        name: "",
        type: "Dealer",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        gst_number: "",
      });
      toast({
        title: "Success",
        description: "Company created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create company",
        variant: "destructive",
      });
    },
  });

  // Filter and pagination logic
  const filteredParticipations = bidParticipations.filter(participation => {
    const matchesSearch = participation.tender?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participation.tender?.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || participation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredParticipations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParticipations = filteredParticipations.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "submitted": return "bg-blue-100 text-blue-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const addCompanyToParticipation = () => {
    setParticipationForm(prev => ({
      ...prev,
      companies: [...prev.companies, { company_id: 0, role: "participant" }]
    }));
  };

  const removeCompanyFromParticipation = (index: number) => {
    setParticipationForm(prev => ({
      ...prev,
      companies: prev.companies.filter((_, i) => i !== index)
    }));
  };

  const updateCompanyInParticipation = (index: number, field: string, value: any) => {
    setParticipationForm(prev => ({
      ...prev,
      companies: prev.companies.map((company, i) => 
        i === index ? { ...company, [field]: value } : company
      )
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bid Management</h1>
          <p className="text-gray-600 mt-1">Manage bid participations, companies, and documents</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bids</p>
                <p className="text-2xl font-bold text-gray-900">{bidParticipations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Companies</p>
                <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Bids</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bidParticipations.filter(p => p.status === "submitted" || p.status === "approved").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bid Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{bidParticipations.reduce((sum, p) => sum + parseFloat(p.bid_amount || "0"), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="participations">Bid Participations</TabsTrigger>
          <TabsTrigger value="companies">Company Management</TabsTrigger>
          <TabsTrigger value="documents">Document Compilation</TabsTrigger>
        </TabsList>

        {/* Bid Participations Tab */}
        <TabsContent value="participations" className="space-y-6">
          <Card>
            <CardHeader className="bg-[#0076a8]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Bid Participations</CardTitle>
                <Dialog open={isCreateParticipationOpen} onOpenChange={setIsCreateParticipationOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-[#0076a8] hover:bg-gray-100">
                      <Plus className="h-4 w-4 mr-2" />
                      New Participation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Bid Participation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tender">Tender</Label>
                        <Select
                          value={participationForm.tender_id}
                          onValueChange={(value) => setParticipationForm(prev => ({ ...prev, tender_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select tender" />
                          </SelectTrigger>
                          <SelectContent>
                            {tenders.map((tender: any) => (
                              <SelectItem key={tender.id} value={tender.id.toString()}>
                                {tender.referenceNo} - {tender.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="bid_amount">Bid Amount (₹)</Label>
                        <Input
                          id="bid_amount"
                          type="number"
                          value={participationForm.bid_amount}
                          onChange={(e) => setParticipationForm(prev => ({ ...prev, bid_amount: e.target.value }))}
                          placeholder="Enter bid amount"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={participationForm.notes}
                          onChange={(e) => setParticipationForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional notes or comments"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Companies</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addCompanyToParticipation}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Company
                          </Button>
                        </div>
                        {participationForm.companies.map((company, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-2">
                            <Select
                              value={company.company_id.toString()}
                              onValueChange={(value) => updateCompanyInParticipation(index, "company_id", parseInt(value))}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select company" />
                              </SelectTrigger>
                              <SelectContent>
                                {companies.map((comp) => (
                                  <SelectItem key={comp.id} value={comp.id.toString()}>
                                    {comp.name} ({comp.type})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={company.role}
                              onValueChange={(value) => updateCompanyInParticipation(index, "role", value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="participant">Participant</SelectItem>
                                <SelectItem value="lead">Lead</SelectItem>
                                <SelectItem value="subcontractor">Subcontractor</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCompanyFromParticipation(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateParticipationOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={() => createParticipationMutation.mutate(participationForm)}
                          disabled={createParticipationMutation.isPending}
                        >
                          {createParticipationMutation.isPending ? "Creating..." : "Create Participation"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by tender title or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Participations Table */}
              <div className="rounded-lg border">
                <Table>
                  <TableHeader className="bg-[#0076a8]">
                    <TableRow>
                      <TableHead className="text-white font-medium">Tender Reference</TableHead>
                      <TableHead className="text-white font-medium">Tender Title</TableHead>
                      <TableHead className="text-white font-medium">Bid Amount</TableHead>
                      <TableHead className="text-white font-medium">Status</TableHead>
                      <TableHead className="text-white font-medium">Companies</TableHead>
                      <TableHead className="text-white font-medium">Created Date</TableHead>
                      <TableHead className="text-white font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedParticipations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          {loadingParticipations ? "Loading..." : "No bid participations found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedParticipations.map((participation) => (
                        <TableRow key={participation.id}>
                          <TableCell className="font-medium">
                            {participation.tender?.referenceNo || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate" title={participation.tender?.title}>
                              {participation.tender?.title || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>₹{parseFloat(participation.bid_amount || "0").toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(participation.status)}>
                              {participation.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {participation.companies?.slice(0, 2).map((company, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {company.name}
                                </Badge>
                              ))}
                              {(participation.companies?.length || 0) > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(participation.companies?.length || 0) - 2} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(participation.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredParticipations.length)} of {filteredParticipations.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Management Tab */}
        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader className="bg-[#0076a8]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Company Management</CardTitle>
                <Dialog open={isCreateCompanyOpen} onOpenChange={setIsCreateCompanyOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-[#0076a8] hover:bg-gray-100">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Company
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Company</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Company Name</Label>
                          <Input
                            id="name"
                            value={companyForm.name}
                            onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter company name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="type">Company Type</Label>
                          <Select
                            value={companyForm.type}
                            onValueChange={(value: "Dealer" | "OEM") => setCompanyForm(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Dealer">Dealer</SelectItem>
                              <SelectItem value="OEM">OEM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contact_person">Contact Person</Label>
                          <Input
                            id="contact_person"
                            value={companyForm.contact_person}
                            onChange={(e) => setCompanyForm(prev => ({ ...prev, contact_person: e.target.value }))}
                            placeholder="Enter contact person name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={companyForm.phone}
                            onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={companyForm.email}
                            onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="gst_number">GST Number</Label>
                          <Input
                            id="gst_number"
                            value={companyForm.gst_number}
                            onChange={(e) => setCompanyForm(prev => ({ ...prev, gst_number: e.target.value }))}
                            placeholder="Enter GST number"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={companyForm.address}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter complete address"
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateCompanyOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={() => createCompanyMutation.mutate(companyForm)}
                          disabled={createCompanyMutation.isPending}
                        >
                          {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader className="bg-[#0076a8]">
                    <TableRow>
                      <TableHead className="text-white font-medium">Company Name</TableHead>
                      <TableHead className="text-white font-medium">Type</TableHead>
                      <TableHead className="text-white font-medium">Contact Person</TableHead>
                      <TableHead className="text-white font-medium">Email</TableHead>
                      <TableHead className="text-white font-medium">Phone</TableHead>
                      <TableHead className="text-white font-medium">GST Number</TableHead>
                      <TableHead className="text-white font-medium">Status</TableHead>
                      <TableHead className="text-white font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          {loadingCompanies ? "Loading..." : "No companies found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell>
                            <Badge variant={company.type === "OEM" ? "default" : "secondary"}>
                              {company.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{company.contact_person}</TableCell>
                          <TableCell>{company.email}</TableCell>
                          <TableCell>{company.phone}</TableCell>
                          <TableCell>{company.gst_number}</TableCell>
                          <TableCell>
                            <Badge className={company.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {company.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Compilation Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader className="bg-[#0076a8]">
              <CardTitle className="text-white">Document Compilation & Export</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Document Management</h3>
                <p className="text-gray-600 mb-6">Upload, organize, and export bid documents</p>
                
                <div className="flex justify-center space-x-4">
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Package
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}