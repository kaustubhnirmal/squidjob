import React, { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, ChevronRight, FileText, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
// Using inline skeletons instead of imported components

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

type BidParticipation = {
  tender_id: number;
  bid_amount: string;
  notes: string | null;
  status: "draft" | "submitted" | "approved" | "rejected";
};

// Main component
const BidParticipationPage = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch tenders
  const { data: tenders = [], isLoading: isLoadingTenders } = useQuery<Tender[]>({
    queryKey: ["/api/tenders"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tenders");
      const data = await res.json();
      return data;
    },
  });

  // Fetch companies
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/companies");
      const data = await res.json();
      return data;
    },
  });

  // Filtered tenders based on search term and status
  const filteredTenders = tenders.filter(
    (tender) => 
      (tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.organization.toLowerCase().includes(searchTerm.toLowerCase())) &&
      tender.status === "In Process"
  );

  // Create bid participation mutation
  const createBidParticipationMutation = useMutation({
    mutationFn: async (bidData: {
      bidParticipation: BidParticipation;
      companyIds: number[];
    }) => {
      // Create the bid participation
      const bidRes = await apiRequest(
        "POST", 
        "/api/bid-participations", 
        bidData.bidParticipation
      );
      const bid = await bidRes.json();
      
      // Associate companies with the bid participation
      const promises = bidData.companyIds.map(companyId => 
        apiRequest(
          "POST", 
          `/api/bid-participations/${bid.id}/companies`, 
          { company_id: companyId, role: "participant" }
        )
      );
      
      await Promise.all(promises);
      return bid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bid-participations"] });
      toast({
        title: "Bid participation created",
        description: "Bid participation has been created successfully.",
      });
      // Reset form state
      setCurrentStep(1);
      setSelectedTender(null);
      setSelectedCompanies([]);
      setBidAmount("");
      setNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create bid participation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle step navigation
  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle tender selection
  const handleTenderSelect = (tender: Tender) => {
    setSelectedTender(tender);
    setCurrentStep(2);
  };

  // Handle company selection toggle
  const toggleCompanySelection = (companyId: number) => {
    if (selectedCompanies.includes(companyId)) {
      setSelectedCompanies(selectedCompanies.filter(id => id !== companyId));
    } else {
      setSelectedCompanies([...selectedCompanies, companyId]);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedTender || selectedCompanies.length === 0 || !bidAmount) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createBidParticipationMutation.mutateAsync({
        bidParticipation: {
          tender_id: selectedTender.id,
          bid_amount: bidAmount,
          notes: notes || null,
          status: "draft",
        },
        companyIds: selectedCompanies,
      });
      
      toast({
        title: "Success",
        description: "Bid participation created successfully!",
      });
      
      // Reset and go back to step 1
      setCurrentStep(1);
      setSelectedTender(null);
      setSelectedCompanies([]);
      setBidAmount("");
      setNotes("");
    } catch (error) {
      console.error("Error creating bid participation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render company table
  const renderCompanyTable = (companiesToShow: Company[]) => {
    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="w-12"></TableHead>
            <TableHead>Company Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoadingCompanies ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Loading companies...
              </TableCell>
            </TableRow>
          ) : companiesToShow.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No companies found
              </TableCell>
            </TableRow>
          ) : (
            companiesToShow.map((company) => (
              <TableRow 
                key={company.id}
                className={selectedCompanies.includes(company.id) ? "bg-blue-50" : ""}
              >
                <TableCell>
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company.id)}
                      onChange={() => toggleCompanySelection(company.id)}
                      className="h-4 w-4 rounded border-gray-300 text-[#0076a8] focus:ring-[#0076a8]"
                    />
                  </div>
                </TableCell>
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };

  // Show simplified loading state while data is loading
  if (isLoadingTenders && currentStep === 1) {
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
                <div className="flex items-center justify-between">
                  <Skeleton className="h-9 w-32" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 w-24 rounded-md" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-4">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-3 flex justify-between items-center">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-9 w-36 rounded-md" />
                  </div>
                  <div className="p-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border-b last:border-0">
                        <div className="flex-1">
                          <Skeleton className="h-5 w-full max-w-md mb-1" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-24 rounded-md" />
                  <Skeleton className="h-10 w-24 rounded-md" />
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
            <CardTitle>Bid Participation</CardTitle>
            <CardDescription>
              Create and manage bid participations for tenders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step Indicator */}
            <div className="flex items-center mb-8">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? "bg-[#0076a8] text-white" : "bg-gray-200"
              }`}>
                {currentStep > 1 ? <Check size={16} /> : 1}
              </div>
              <div className={`flex-grow h-0.5 mx-2 ${
                currentStep > 1 ? "bg-[#0076a8]" : "bg-gray-200"
              }`}></div>
              
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? "bg-[#0076a8] text-white" : "bg-gray-200"
              }`}>
                {currentStep > 2 ? <Check size={16} /> : 2}
              </div>
              <div className={`flex-grow h-0.5 mx-2 ${
                currentStep > 2 ? "bg-[#0076a8]" : "bg-gray-200"
              }`}></div>
              
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 3 ? "bg-[#0076a8] text-white" : "bg-gray-200"
              }`}>
                {currentStep > 3 ? <Check size={16} /> : 3}
              </div>
              <div className={`flex-grow h-0.5 mx-2 ${
                currentStep > 3 ? "bg-[#0076a8]" : "bg-gray-200"
              }`}></div>
              
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 4 ? "bg-[#0076a8] text-white" : "bg-gray-200"
              }`}>
                4
              </div>
            </div>

            {/* Step Labels */}
            <div className="flex justify-between mb-8 text-sm">
              <div className="text-center w-1/4">Select Tender</div>
              <div className="text-center w-1/4">Select Companies</div>
              <div className="text-center w-1/4">Bid Details</div>
              <div className="text-center w-1/4">Review & Submit</div>
            </div>

            {/* Step 1: Select Tender */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search tenders by title, reference or organization..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#0076a8] text-white hover:bg-[#005e86]">
                        <TableHead className="text-white">Reference No.</TableHead>
                        <TableHead className="text-white">Title</TableHead>
                        <TableHead className="text-white">Organization</TableHead>
                        <TableHead className="text-white">Submission Deadline</TableHead>
                        <TableHead className="text-white text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingTenders ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Loading tenders...
                          </TableCell>
                        </TableRow>
                      ) : filteredTenders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No eligible tenders found. Only tenders with "In Process" status are displayed.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTenders.map((tender) => (
                          <TableRow key={tender.id}>
                            <TableCell>{tender.referenceNo}</TableCell>
                            <TableCell className="font-medium">{tender.title}</TableCell>
                            <TableCell>{tender.organization}</TableCell>
                            <TableCell>
                              {new Date(tender.submissionDeadline).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[#0076a8]"
                                onClick={() => handleTenderSelect(tender)}
                              >
                                Select <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Step 2: Select Companies */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <FileText className="mr-2 h-5 w-5 text-blue-700" />
                    <h3 className="font-medium text-blue-700">Selected Tender</h3>
                  </div>
                  <div className="ml-7">
                    <p className="font-semibold">{selectedTender?.title}</p>
                    <p className="text-sm text-gray-500">
                      Reference: {selectedTender?.referenceNo} | Organization: {selectedTender?.organization}
                    </p>
                  </div>
                </div>

                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Companies</TabsTrigger>
                    <TabsTrigger value="dealer">Dealers</TabsTrigger>
                    <TabsTrigger value="oem">OEMs</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="border rounded-md">
                    {renderCompanyTable(companies)}
                  </TabsContent>
                  
                  <TabsContent value="dealer" className="border rounded-md">
                    {renderCompanyTable(companies.filter(c => c.type === "Dealer"))}
                  </TabsContent>
                  
                  <TabsContent value="oem" className="border rounded-md">
                    {renderCompanyTable(companies.filter(c => c.type === "OEM"))}
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={handlePrevStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleNextStep}
                    disabled={selectedCompanies.length === 0}
                    className="bg-[#0076a8] hover:bg-[#005e86]"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Bid Details */}
            {currentStep === 3 && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <FileText className="mr-2 h-5 w-5 text-blue-700" />
                    <h3 className="font-medium text-blue-700">Selected Tender</h3>
                  </div>
                  <div className="ml-7">
                    <p className="font-semibold">{selectedTender?.title}</p>
                    <p className="text-sm text-gray-500">
                      Reference: {selectedTender?.referenceNo} | Organizations: {selectedTender?.organization}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div>
                    <Label htmlFor="bidAmount">Bid Amount (₹)*</Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      placeholder="Enter bid amount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional information about this bid participation"
                      className="min-h-[120px]"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={handlePrevStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleNextStep}
                    disabled={!bidAmount || isNaN(parseFloat(bidAmount)) || parseFloat(bidAmount) <= 0}
                    className="bg-[#0076a8] hover:bg-[#005e86]"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                  <h3 className="font-medium text-green-700 mb-2">Review Bid Participation</h3>
                  <p className="text-sm text-gray-600">
                    Please review the information below before submitting. Once submitted, 
                    you will not be able to edit these details.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Tender Information */}
                  <div className="border rounded-md p-4">
                    <h4 className="text-gray-500 text-sm font-medium mb-2">TENDER INFORMATION</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Reference No:</p>
                        <p className="font-medium">{selectedTender?.referenceNo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Title:</p>
                        <p className="font-medium">{selectedTender?.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Organization:</p>
                        <p className="font-medium">{selectedTender?.organization}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Submission Deadline:</p>
                        <p className="font-medium">
                          {selectedTender?.submissionDeadline && 
                            new Date(selectedTender.submissionDeadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selected Companies */}
                  <div className="border rounded-md p-4">
                    <h4 className="text-gray-500 text-sm font-medium mb-2">SELECTED COMPANIES</h4>
                    <div className="space-y-2">
                      {companies
                        .filter(company => selectedCompanies.includes(company.id))
                        .map(company => (
                          <div key={company.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{company.name}</p>
                              <p className="text-xs text-gray-500">{company.type}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {company.email && <p>{company.email}</p>}
                              {company.phone && <p>{company.phone}</p>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  {/* Bid Details */}
                  <div className="border rounded-md p-4">
                    <h4 className="text-gray-500 text-sm font-medium mb-2">BID DETAILS</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Bid Amount:</p>
                        <p className="font-medium">₹{parseFloat(bidAmount).toLocaleString()}</p>
                      </div>
                      {notes && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Notes:</p>
                          <p>{notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={handlePrevStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="bg-[#0076a8] hover:bg-[#005e86]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Bid Participation"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BidParticipationPage;