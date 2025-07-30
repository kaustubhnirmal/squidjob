import React, { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Import basic skeleton components directly
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowDown,
  Check,
  ChevronDown,
  Download,
  FileText,
  Filter,
  Search,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

// Types
type Tender = {
  id: number;
  title: string;
  referenceNo: string;
  organization: string;
  submissionDeadline: string;
  status: string;
};

type Company = {
  id: number;
  name: string;
  type: "Dealer" | "OEM";
  email: string | null;
  phone: string | null;
};

type TenderDocument = {
  id: number;
  name: string;
  category: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
  uploadedBy: number;
};

type CompanyDocument = {
  id: number;
  document: {
    id: number;
    name: string;
    category: string;
    fileUrl: string;
    fileType: string;
  };
};

// Main component
const DocumentExportPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [includeCompanyDocs, setIncludeCompanyDocs] = useState<boolean>(true);
  const [exportFormat, setExportFormat] = useState<string>("pdf");
  
  // Get tenders that are in process or submitted
  const { data: tenders = [], isLoading: isLoadingTenders } = useQuery<Tender[]>({
    queryKey: ['/api/tenders'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/tenders");
      return response.json();
    }
  });

  // Filter tenders based on search term and status
  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.organization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || tender.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get documents for a specific tender
  const { data: tenderDocuments = [], isLoading: isLoadingDocuments } = useQuery<TenderDocument[]>({
    queryKey: ['/api/tenders', selectedTender?.id, 'documents'],
    queryFn: async () => {
      if (!selectedTender) return [];
      
      const response = await apiRequest("GET", `/api/tenders/${selectedTender.id}/documents`);
      return response.json();
    },
    enabled: !!selectedTender
  });

  // Get companies associated with the selected tender (would typically come from bid participation)
  const { data: associatedCompanies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ['/api/tenders', selectedTender?.id, 'companies'],
    queryFn: async () => {
      if (!selectedTender) return [];
      
      // This would ideally fetch companies from bid participation records
      // For now, we'll just fetch all companies as a placeholder
      const response = await apiRequest("GET", "/api/companies");
      return response.json();
    },
    enabled: !!selectedTender && includeCompanyDocs
  });

  // Get documents for each company
  const { data: companyDocuments = {}, isLoading: isLoadingCompanyDocs } = useQuery<Record<number, CompanyDocument[]>>({
    queryKey: ['/api/companies', 'documents', associatedCompanies.map(c => c.id)],
    queryFn: async () => {
      if (associatedCompanies.length === 0) return {};
      
      const results: Record<number, CompanyDocument[]> = {};
      
      // Fetch documents for each company
      await Promise.all(associatedCompanies.map(async (company) => {
        const response = await apiRequest("GET", `/api/companies/${company.id}/documents`);
        const documents = await response.json();
        results[company.id] = documents;
      }));
      
      return results;
    },
    enabled: !!selectedTender && includeCompanyDocs && associatedCompanies.length > 0
  });

  // Handle tender selection
  const handleTenderSelect = (tender: Tender) => {
    setSelectedTender(tender);
    setSelectedDocuments([]);
  };

  // Toggle document selection
  const toggleDocumentSelection = (documentId: number) => {
    if (selectedDocuments.includes(documentId)) {
      setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
    } else {
      setSelectedDocuments([...selectedDocuments, documentId]);
    }
  };

  // Handle document selection for a specific category
  const handleCategorySelection = (category: string, select: boolean) => {
    const categoryDocIds = tenderDocuments
      .filter(doc => doc.category === category)
      .map(doc => doc.id);
    
    if (select) {
      // Add all category documents that aren't already selected
      const newSelections = categoryDocIds.filter(id => !selectedDocuments.includes(id));
      setSelectedDocuments([...selectedDocuments, ...newSelections]);
    } else {
      // Remove all category documents
      setSelectedDocuments(selectedDocuments.filter(id => !categoryDocIds.includes(id)));
    }
  };

  // Select all documents
  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedDocuments(tenderDocuments.map(doc => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  // Generate document export
  const handleExportDocuments = () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one document to export",
        variant: "destructive",
      });
      return;
    }

    // This would typically make an API call to generate an export
    // For now, we'll just simulate success
    toast({
      title: "Export Started",
      description: "Your documents are being compiled for export. This may take a moment.",
    });

    // Simulate completion after 2 seconds
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${selectedDocuments.length} documents exported successfully as ${exportFormat.toUpperCase()}`,
      });
    }, 2000);
  };

  // Group documents by category
  const documentsByCategory = tenderDocuments.reduce<Record<string, TenderDocument[]>>((acc, doc) => {
    const category = doc.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {});

  // Show simplified loading state while initial data is loading
  if (isLoadingTenders) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-10 w-36" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="border rounded-md p-4">
                    <Skeleton className="h-8 w-48 mb-4" />
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full mb-2" />
                    ))}
                  </div>
                  <div className="lg:col-span-2 border rounded-md p-4">
                    <Skeleton className="h-8 w-64 mb-4" />
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full mb-2" />
                    ))}
                  </div>
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
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Document Export</CardTitle>
                <CardDescription>
                  Compile and export documents for bid submissions
                </CardDescription>
              </div>
              
              {selectedTender && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="includeCompanyDocs" className="cursor-pointer">
                      Include company documents
                    </Label>
                    <Switch
                      id="includeCompanyDocs"
                      checked={includeCompanyDocs}
                      onCheckedChange={setIncludeCompanyDocs}
                    />
                  </div>
                  
                  <Select
                    value={exportFormat}
                    onValueChange={setExportFormat}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Export format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="zip">ZIP Archive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    onClick={handleExportDocuments}
                    className="bg-[#0076a8] hover:bg-[#005e86]"
                    disabled={selectedDocuments.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Documents
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left panel - Tender Selection */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Select Tender</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </Button>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search tenders..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="statusFilter">Status</Label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger id="statusFilter" className="w-full">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="In Process">In Process</SelectItem>
                          <SelectItem value="Submitted">Submitted</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Tenders List */}
                <div className="border rounded-md overflow-hidden">
                  <div className="max-h-[500px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead>Tender</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingTenders ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-8">
                              Loading tenders...
                            </TableCell>
                          </TableRow>
                        ) : filteredTenders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-8">
                              No tenders found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTenders.map((tender) => (
                            <TableRow 
                              key={tender.id}
                              className={selectedTender?.id === tender.id ? "bg-blue-50" : ""}
                              onClick={() => handleTenderSelect(tender)}
                              style={{ cursor: "pointer" }}
                            >
                              <TableCell>
                                <div className="font-medium">{tender.title}</div>
                                <div className="text-sm text-gray-500">Ref: {tender.referenceNo}</div>
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  tender.status === "In Process" 
                                    ? "bg-yellow-100 text-yellow-700" 
                                    : tender.status === "Submitted"
                                    ? "bg-blue-100 text-blue-700"
                                    : tender.status === "Completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}>
                                  {tender.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              {/* Right panel - Document Selection */}
              <div className="lg:col-span-2">
                {selectedTender ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex items-center mb-2">
                        <FileText className="mr-2 h-5 w-5 text-blue-700" />
                        <h3 className="font-medium text-blue-700">Selected Tender</h3>
                      </div>
                      <div className="ml-7">
                        <p className="font-semibold">{selectedTender.title}</p>
                        <p className="text-sm text-gray-500">
                          Reference: {selectedTender.referenceNo} | Organization: {selectedTender.organization}
                        </p>
                      </div>
                    </div>

                    {/* Select All Documents Control */}
                    {tenderDocuments.length > 0 && (
                      <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="selectAll"
                            checked={selectedDocuments.length === tenderDocuments.length && tenderDocuments.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                          <Label htmlFor="selectAll" className="cursor-pointer">
                            Select all documents
                          </Label>
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedDocuments.length} of {tenderDocuments.length} documents selected
                        </div>
                      </div>
                    )}

                    {/* Document Categories */}
                    {isLoadingDocuments ? (
                      <div className="text-center py-8">Loading documents...</div>
                    ) : tenderDocuments.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-md">
                        No documents available for this tender
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Tender Documents</h3>
                        <Accordion type="multiple" className="space-y-4">
                          {Object.entries(documentsByCategory).map(([category, documents]) => (
                            <AccordionItem 
                              key={category}
                              value={category}
                              className="border rounded-md overflow-hidden"
                            >
                              <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="flex items-center gap-2">
                                    <Checkbox 
                                      id={`category-${category}`}
                                      checked={documents.every(doc => selectedDocuments.includes(doc.id))}
                                      onCheckedChange={(checked) => {
                                        handleCategorySelection(category, checked === true);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span>{category} ({documents.length})</span>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-0 pt-0">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-gray-50">
                                      <TableHead className="w-12"></TableHead>
                                      <TableHead>Document Name</TableHead>
                                      <TableHead>Type</TableHead>
                                      <TableHead>Date</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {documents.map((doc) => (
                                      <TableRow key={doc.id}>
                                        <TableCell>
                                          <Checkbox 
                                            checked={selectedDocuments.includes(doc.id)}
                                            onCheckedChange={() => toggleDocumentSelection(doc.id)}
                                          />
                                        </TableCell>
                                        <TableCell className="font-medium">{doc.name}</TableCell>
                                        <TableCell>{doc.fileType}</TableCell>
                                        <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>

                        {/* Company Documents Section */}
                        {includeCompanyDocs && (
                          <div className="mt-8 space-y-4">
                            <h3 className="font-medium text-lg">Associated Company Documents</h3>
                            {isLoadingCompanies ? (
                              <div className="text-center py-4">Loading companies...</div>
                            ) : associatedCompanies.length === 0 ? (
                              <div className="text-center py-4 bg-gray-50 rounded-md">
                                No companies associated with this tender
                              </div>
                            ) : (
                              <Accordion type="multiple" className="space-y-4">
                                {associatedCompanies.map((company) => {
                                  const companyDocs = companyDocuments[company.id] || [];
                                  return (
                                    <AccordionItem 
                                      key={company.id}
                                      value={`company-${company.id}`}
                                      className="border rounded-md overflow-hidden"
                                    >
                                      <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                                        <div className="flex items-center justify-between w-full pr-4">
                                          <div className="flex items-center gap-2">
                                            <span>
                                              {company.name} 
                                              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                                company.type === "Dealer" 
                                                  ? "bg-blue-100 text-blue-700" 
                                                  : "bg-purple-100 text-purple-700"
                                              }`}>
                                                {company.type}
                                              </span>
                                            </span>
                                          </div>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="px-0 pt-0">
                                        {isLoadingCompanyDocs ? (
                                          <div className="text-center py-4">Loading documents...</div>
                                        ) : companyDocs.length === 0 ? (
                                          <div className="text-center py-4 bg-gray-50">
                                            No documents available for this company
                                          </div>
                                        ) : (
                                          <Table>
                                            <TableHeader>
                                              <TableRow className="bg-gray-50">
                                                <TableHead className="w-12"></TableHead>
                                                <TableHead>Document Name</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Type</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {companyDocs.map((docLink) => (
                                                <TableRow key={docLink.id}>
                                                  <TableCell>
                                                    <Checkbox 
                                                      checked={selectedDocuments.includes(docLink.document.id)}
                                                      onCheckedChange={() => toggleDocumentSelection(docLink.document.id)}
                                                    />
                                                  </TableCell>
                                                  <TableCell className="font-medium">
                                                    {docLink.document.name}
                                                  </TableCell>
                                                  <TableCell>{docLink.document.category || "-"}</TableCell>
                                                  <TableCell>{docLink.document.fileType}</TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        )}
                                      </AccordionContent>
                                    </AccordionItem>
                                  );
                                })}
                              </Accordion>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-md">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="font-medium text-lg text-gray-600">Select a Tender</h3>
                    <p className="text-gray-500">
                      Choose a tender from the list to view and export its documents
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DocumentExportPage;