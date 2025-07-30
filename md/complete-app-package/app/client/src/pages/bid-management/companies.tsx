import React, { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Import basic skeleton component directly
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Search, Eye, Link, FileText, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Company type
type Company = {
  id: number;
  name: string;
  type: "Dealer" | "OEM";
  address: string;
  email: string | null;
  phone: string | null;
  gst_number: string | null;
  pan_number: string | null;
  created_at: string;
  created_by: number;
};

// Document type
type Document = {
  id: number;
  name: string;
  file_url: string;
  file_type: string;
  category: string;
};

const CompanyManagementPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Dealer" | "OEM">("all");
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  // Selected company state
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // New/edit company form state
  const [formData, setFormData] = useState<{
    name: string;
    type: "Dealer" | "OEM";
    address: string;
    email: string;
    phone: string;
    gstNumber: string;
    panNumber: string;
  }>({
    name: "",
    type: "Dealer",
    address: "",
    email: "",
    phone: "",
    gstNumber: "",
    panNumber: "",
  });
  
  // Get companies from API
  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies', typeFilter],
    queryFn: async () => {
      const endpoint = typeFilter === "all" 
        ? '/api/companies' 
        : `/api/companies?type=${typeFilter}`;
      
      const response = await apiRequest("GET", endpoint);
      return response.json();
    }
  });
  
  // Filter companies by search term
  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.phone && company.phone.includes(searchTerm))
  );
  
  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/companies", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company created successfully.",
      });
      resetFormAndCloseModals();
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create company: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const response = await apiRequest("PUT", `/api/companies/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company updated successfully.",
      });
      resetFormAndCloseModals();
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update company: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/companies/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company deleted successfully.",
      });
      resetFormAndCloseModals();
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete company: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Get linked documents for a company
  const { data: linkedDocuments = [], isLoading: isLoadingDocuments } = useQuery<Document[]>({
    queryKey: ['/api/companies', selectedCompany?.id, 'documents'],
    queryFn: async () => {
      if (!selectedCompany) return [];
      
      const response = await apiRequest("GET", `/api/companies/${selectedCompany.id}/documents`);
      return response.json();
    },
    enabled: !!selectedCompany && isDocumentsModalOpen,
  });
  
  // Link document to company mutation
  const linkDocumentMutation = useMutation({
    mutationFn: async ({ companyId, documentId }: { companyId: number; documentId: number }) => {
      const response = await apiRequest("POST", `/api/companies/${companyId}/documents`, { documentId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document linked successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies', selectedCompany?.id, 'documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to link document: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Reset form and close all modals
  const resetFormAndCloseModals = () => {
    setFormData({
      name: "",
      type: "Dealer",
      address: "",
      email: "",
      phone: "",
      gstNumber: "",
      panNumber: "",
    });
    setSelectedCompany(null);
    setIsAddModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsDocumentsModalOpen(false);
    setIsEditMode(false);
  };
  
  // Open add company modal
  const handleAddClick = () => {
    resetFormAndCloseModals();
    setIsAddModalOpen(true);
  };
  
  // Open edit company modal
  const handleEditClick = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      type: company.type,
      address: company.address,
      email: company.email || "",
      phone: company.phone || "",
      gstNumber: company.gst_number || "",
      panNumber: company.pan_number || "",
    });
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };
  
  // Open view company modal
  const handleViewClick = (company: Company) => {
    setSelectedCompany(company);
    setIsViewModalOpen(true);
  };
  
  // Open delete company confirmation modal
  const handleDeleteClick = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteModalOpen(true);
  };
  
  // Open documents modal for a company
  const handleDocumentsClick = (company: Company) => {
    setSelectedCompany(company);
    setIsDocumentsModalOpen(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.type || !formData.address.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      toast({
        title: "Validation Error",
        description: "Phone number must be 10 digits.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.gstNumber && !/^[0-9A-Z]{15}$/.test(formData.gstNumber)) {
      toast({
        title: "Validation Error",
        description: "GST Number must be 15 alphanumeric characters.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.panNumber && !/^[A-Z0-9]{10}$/.test(formData.panNumber)) {
      toast({
        title: "Validation Error",
        description: "PAN Number must be 10 alphanumeric characters.",
        variant: "destructive",
      });
      return;
    }
    
    // Create or update company
    if (isEditMode && selectedCompany) {
      updateCompanyMutation.mutate({ id: selectedCompany.id, data: formData });
    } else {
      createCompanyMutation.mutate(formData);
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedCompany) {
      deleteCompanyMutation.mutate(selectedCompany.id);
    }
  };

  // Show simplified loading state while data is loading
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardHeader className="flex-row flex items-center justify-between">
              <div>
                <Skeleton className="h-7 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-32 rounded-md" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-10 w-72 rounded-md" />
                  <Skeleton className="h-10 w-48 rounded-md" />
                </div>
                
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted">
                        <TableHead><Skeleton className="h-4 w-40" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-40" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Skeleton className="h-8 w-8 rounded-md" />
                              <Skeleton className="h-8 w-8 rounded-md" />
                              <Skeleton className="h-8 w-8 rounded-md" />
                              <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex-row flex items-center justify-between">
            <div>
              <CardTitle>Company Management</CardTitle>
              <CardDescription>
                Add and manage companies for bid participation
              </CardDescription>
            </div>
            <Button
              onClick={handleAddClick}
              className="bg-[#0076a8] hover:bg-[#005e86]"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, email or phone..."
                  className="pl-8 w-[280px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={typeFilter}
                onValueChange={(value: "all" | "Dealer" | "OEM") => setTypeFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Dealer">Dealer</SelectItem>
                  <SelectItem value="OEM">OEM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Companies Table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#0076a8] text-white hover:bg-[#005e86]">
                    <TableHead className="text-white">Company Name</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Email</TableHead>
                    <TableHead className="text-white">Phone</TableHead>
                    <TableHead className="text-white text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading companies...
                      </TableCell>
                    </TableRow>
                  ) : filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No companies found. Try adjusting your filters or add a new company.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            company.type === "Dealer" 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {company.type}
                          </span>
                        </TableCell>
                        <TableCell>{company.email || '-'}</TableCell>
                        <TableCell>{company.phone || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewClick(company)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(company)}
                              title="Edit Company"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDocumentsClick(company)}
                              title="Manage Documents"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(company)}
                              title="Delete Company"
                              className="text-red-500 hover:text-red-700"
                            >
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

        {/* Add/Edit Company Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Company" : "Add New Company"}</DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Update the company details below."
                  : "Enter the company details to add it to the system."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <Label htmlFor="name" className="text-right">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-right">
                    Company Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange(value, "type")}
                  >
                    <SelectTrigger id="type" className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dealer">Dealer</SelectItem>
                      <SelectItem value="OEM">OEM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-right">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="10-digit number"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="email" className="text-right">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address" className="text-right">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gstNumber" className="text-right">
                    GST Number
                  </Label>
                  <Input
                    id="gstNumber"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="15-character alphanumeric"
                  />
                </div>
                <div>
                  <Label htmlFor="panNumber" className="text-right">
                    PAN Number
                  </Label>
                  <Input
                    id="panNumber"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="10-character alphanumeric"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFormAndCloseModals}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#0076a8] hover:bg-[#005e86]"
                  disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}
                >
                  {(createCompanyMutation.isPending || updateCompanyMutation.isPending) ? (
                    "Saving..."
                  ) : isEditMode ? (
                    "Update Company"
                  ) : (
                    "Add Company"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Company Modal */}
        {selectedCompany && (
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Company Details</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <p className="text-sm font-medium">Company Name</p>
                  <p className="text-sm">{selectedCompany.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Company Type</p>
                  <p className="text-sm">{selectedCompany.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone Number</p>
                  <p className="text-sm">{selectedCompany.phone || "Not provided"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-sm">{selectedCompany.email || "Not provided"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm">{selectedCompany.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">GST Number</p>
                  <p className="text-sm">{selectedCompany.gst_number || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">PAN Number</p>
                  <p className="text-sm">{selectedCompany.pan_number || "Not provided"}</p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Modal */}
        {selectedCompany && (
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {selectedCompany.name}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={resetFormAndCloseModals}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={deleteCompanyMutation.isPending}
                >
                  {deleteCompanyMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Documents Modal */}
        {selectedCompany && (
          <Dialog open={isDocumentsModalOpen} onOpenChange={setIsDocumentsModalOpen}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Linked Documents - {selectedCompany.name}</DialogTitle>
                <DialogDescription>
                  View and manage documents linked to this company
                </DialogDescription>
              </DialogHeader>
              {isLoadingDocuments ? (
                <div className="flex justify-center py-8">Loading documents...</div>
              ) : linkedDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="mb-4">No documents linked to this company yet.</p>
                  <Button 
                    className="bg-[#0076a8] hover:bg-[#005e86]"
                    onClick={() => {
                      // Redirect to document management page
                      window.location.href = `/document-management?companyId=${selectedCompany.id}`;
                    }}
                  >
                    <Link className="mr-2 h-4 w-4" />
                    Link Documents
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#0076a8] text-white hover:bg-[#005e86]">
                          <TableHead className="text-white">Document Name</TableHead>
                          <TableHead className="text-white">Category</TableHead>
                          <TableHead className="text-white">Type</TableHead>
                          <TableHead className="text-white text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {linkedDocuments.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.name}</TableCell>
                            <TableCell>{doc.category || "Uncategorized"}</TableCell>
                            <TableCell>{doc.file_type || "Unknown"}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(doc.file_url, "_blank")}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      className="bg-[#0076a8] hover:bg-[#005e86]"
                      onClick={() => {
                        // Redirect to document management page
                        window.location.href = `/document-management?companyId=${selectedCompany.id}`;
                      }}
                    >
                      <Link className="mr-2 h-4 w-4" />
                      Manage Documents
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default CompanyManagementPage;