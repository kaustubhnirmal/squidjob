import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Search, Calendar as CalendarIcon, Loader2, FileText, SearchX } from "lucide-react";
import { useUser } from "@/user-context";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

interface ValidationError {
  code: string;
  expected: string;
  received: string;
  path: string[];
  message: string;
}

interface ValidationErrorResponse extends Error {
  errors?: ValidationError[];
}

interface Tender {
  id?: number;
  referenceNo?: string;
  title?: string;
  brief?: string;
  authority?: string;
  location?: string;
  startDate?: string;
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
}

export default function AddModifyTender() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useUser();
  
  // Form states
  const [formMode, setFormMode] = useState<"add" | "modify">("add");
  const [searchTenderId, setSearchTenderId] = useState("");
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

  const [referenceNo, setReferenceNo] = useState("");
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [authority, setAuthority] = useState("");
  const [tenderLocation, setTenderLocation] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [deadline, setDeadline] = useState<Date>(new Date());
  const [emdRequired, setEmdRequired] = useState<string>("No");
  const [emdAmount, setEmdAmount] = useState<number | undefined>();
  const [documentFee, setDocumentFee] = useState<number | undefined>();
  const [estimatedValue, setEstimatedValue] = useState<number | undefined>();
  const [bidValue, setBidValue] = useState<number | undefined>();
  const [status, setStatus] = useState("new");
  
  // Field validation states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({}); // Allow undefined values for when clearing errors
  
  // File states
  const [bidDocument, setBidDocument] = useState<File | null>(null);
  const [atcFile, setAtcFile] = useState<File | null>(null);
  const [techSpecsFile, setTechSpecsFile] = useState<File | null>(null);

  // Fetch tender if in edit mode
  const { data: searchResults, isLoading: isSearching, refetch: searchTender } = useQuery({
    queryKey: ['/api/tenders/search', searchTenderId],
    queryFn: async () => {
      if (!searchTenderId || searchTenderId.trim() === '') return null;
      
      // Try to find the tender by reference number or other fields
      try {
        const searchResponse = await fetch(`/api/tenders?search=${encodeURIComponent(searchTenderId.trim())}`);
        
        if (!searchResponse.ok) {
          throw new Error(`Search failed: ${searchResponse.status}`);
        }
        
        const searchData = await searchResponse.json();
        
        // Check if we got tenders array from the response
        if (searchData && searchData.tenders && Array.isArray(searchData.tenders)) {
          if (searchData.tenders.length > 0) {
            // Return the first match
            return searchData.tenders[0];
          }
        } else if (searchData && Array.isArray(searchData)) {
          // Handle direct array response
          if (searchData.length > 0) {
            return searchData[0];
          }
        }
        
        // If no results found, show appropriate message
        toast({
          title: "Tender not found",
          description: `No tender found matching "${searchTenderId}". Please check the tender ID or reference number.`,
          variant: "destructive"
        });
        return null;
        
      } catch (error: any) {
        console.error("Search error:", error);
        toast({
          title: "Search failed",
          description: "Error searching for tender: " + (error.message || "Unknown error"),
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: false // Don't run automatically
  });

  // Create tender mutation
  const createTenderMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        // Extract basic data 
        const basicData: Record<string, any> = {};
        basicData.referenceNo = formData.get("referenceNo") as string;
        basicData.title = formData.get("title") as string;
        basicData.brief = formData.get("brief") as string;
        basicData.authority = formData.get("authority") as string;
        basicData.location = formData.get("location") as string;
        
        // No start date field in schema, only deadline is required
        
        // Handle date with time for deadline/bid expiry
        try {
          const deadlineStr = formData.get("deadline") as string;
          if (deadlineStr) {
            // Convert to proper ISO format to ensure proper date parsing
            const deadlineDate = new Date(deadlineStr);
            if (!isNaN(deadlineDate.getTime())) {
              basicData.deadline = deadlineDate.toISOString();
            } else {
              throw new Error("Invalid date format for bid expiry");
            }
          }
        } catch (error) {
          console.error("Date parsing error:", error);
          throw new Error("Invalid date format for bid expiry. Please select a valid date and time.");
        }
        
        basicData.status = formData.get("status") as string;
        
        // Handle numeric values safely - only include EMD amount if EMD is required
        if (emdRequired === "Yes") {
          const emdAmountStr = formData.get("emdAmount") as string;
          if (emdAmountStr) basicData.emdAmount = emdAmountStr;
        }
        
        const documentFeeStr = formData.get("documentFee") as string;
        if (documentFeeStr) basicData.documentFee = documentFeeStr;
        
        const estimatedValueStr = formData.get("estimatedValue") as string;
        if (estimatedValueStr) basicData.estimatedValue = estimatedValueStr;
        
        const bidValueStr = formData.get("bidValue") as string;
        if (bidValueStr) basicData.bidValue = bidValueStr;
        
        console.log("Sending tender creation data:", basicData);
        
        // Create tender first
        const response = await fetch('/api/tenders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentUser?.id && { 'x-user-id': currentUser.id.toString() })
          },
          body: JSON.stringify(basicData),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          // Check if we have validation errors to display them properly
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const validationError = new Error(errorData.message || "Failed to create tender") as ValidationErrorResponse;
            validationError.errors = errorData.errors;
            throw validationError;
          } else {
            throw new Error(errorData.message || "Failed to create tender");
          }
        }
        
        const createdTender = await response.json();
        
        // Check if we have any documents to upload
        const hasDocuments = bidDocument || atcFile || techSpecsFile;
        
        if (hasDocuments) {
          // Create a new FormData for documents
          const documentFormData = new FormData();
          if (bidDocument) documentFormData.append("bidDocument", bidDocument);
          if (atcFile) documentFormData.append("atcDocument", atcFile);
          if (techSpecsFile) documentFormData.append("techSpecsDocument", techSpecsFile);
          
          // Upload documents - add credentials to ensure cookies are sent
          const uploadResponse = await fetch(`/api/tenders/${createdTender.id}/documents`, {
            method: 'POST',
            body: documentFormData,
            credentials: 'include'
          });
          
          if (!uploadResponse.ok) {
            // Documents failed to upload but tender was created
            toast({
              title: "Warning",
              description: "Tender created but document upload failed",
              variant: "destructive"
            });
          } else {
            // Successfully uploaded documents
            const documentResult = await uploadResponse.json();
            console.log("Document upload success:", documentResult);
          }
        }
        
        return createdTender;
      } catch (error: any) {
        console.error("Error creating tender:", error);
        throw new Error(error.message || "An error occurred while creating the tender");
      }
    },
    onSuccess: async (createdTender) => {
      try {
        // Add the tender to My Tenders by creating a user-tender relationship
        if (createdTender && createdTender.id) {
          // Get current user to obtain userId
          const userResponse = await fetch('/api/user', {
            credentials: 'include'
          });
          
          if (userResponse.ok) {
            const currentUser = await userResponse.json();
            
            // First create a user-tender relationship
            const userTenderResponse = await fetch(`/api/user-tenders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({ 
                userId: currentUser.id,
                tenderId: createdTender.id,
                isStarred: false,
                isInterested: true
              })
            });
            
            if (!userTenderResponse.ok) {
              console.error('Failed to link tender to user');
            }
            
            // Then assign the tender to the current user
            const assignResponse = await fetch(`/api/tenders/${createdTender.id}/assign`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({ 
                userId: currentUser.id,
                assignedBy: currentUser.id,
                assignType: 'individual',
                comments: 'Self-assigned from Add Tender form'
              })
            });
            
            if (!assignResponse.ok) {
              console.error('Failed to assign tender to user');
            }
          }
        }
        
        // Invalidate both All Tenders and My Tenders queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
        queryClient.invalidateQueries({ queryKey: ['/api/users/1/tenders'] });
        
        toast({
          title: "Success!",
          description: "Tender created successfully and added to your tenders",
        });
        resetForm();
      } catch (error) {
        console.error("Error linking tender to user:", error);
        toast({
          title: "Tender Created",
          description: "Tender was created but there was a problem adding it to your tenders.",
          variant: "warning"
        });
      }
    },
    onError: (error: Error | any) => {
      // Reset field errors
      setFieldErrors({});
      
      // Check if there are validation errors
      if (error.errors && Array.isArray(error.errors)) {
        // Build new field errors
        const newFieldErrors: Record<string, string | undefined> = {};
        
        error.errors.forEach((err: {path?: string[], message?: string}) => {
          if (err.path && err.path.length > 0) {
            const fieldName = err.path[0];
            newFieldErrors[fieldName] = err.message || "Invalid value";
            
            // Add field specific errors
            if (fieldName === 'deadline') {
              toast({
                title: "Bid Expiry validation error",
                description: "The bid expiry field has an invalid format. Please select a valid date and time.",
                variant: "destructive"
              });
            } else {
              toast({
                title: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} validation error`,
                description: err.message,
                variant: "destructive"
              });
            }
          }
        });
        
        // Set field errors
        setFieldErrors(newFieldErrors);
      } else {
        // Handle specific error types
        if (error.message?.includes("reference number already exists") || error.error === "DUPLICATE_REFERENCE_NO") {
          toast({
            title: "Duplicate Reference Number",
            description: "A tender with this reference number already exists. Please use a different reference number.",
            variant: "destructive"
          });
          setFieldErrors({ referenceNo: "This reference number already exists" });
        } else {
          // Generic error message
          toast({
            title: "Error creating tender",
            description: error.message || "An unexpected error occurred",
            variant: "destructive"
          });
        }
      }
    }
  });

  // Update tender mutation
  const updateTenderMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const id = selectedTender?.id;
      if (!id) {
        throw new Error("No tender selected for update");
      }
      
      try {
        // Create a plain object for the API request
        const tenderData: Record<string, any> = {
          referenceNo: formData.get("referenceNo") as string,
          title: formData.get("title") as string,
          brief: formData.get("brief") as string,
          authority: formData.get("authority") as string,
          location: formData.get("location") as string,
          status: formData.get("status") as string,
        };
        
        // Handle date with time for deadline/bid expiry
        try {
          const deadlineStr = formData.get("deadline") as string;
          if (deadlineStr) {
            // Convert to proper ISO format to ensure proper date parsing
            const deadlineDate = new Date(deadlineStr);
            if (!isNaN(deadlineDate.getTime())) {
              tenderData.deadline = deadlineDate.toISOString();
            } else {
              throw new Error("Invalid date format for bid expiry");
            }
          }
        } catch (error) {
          console.error("Date parsing error:", error);
          throw new Error("Invalid date format for bid expiry. Please select a valid date and time.");
        }
        
        // Handle numeric fields safely
        const emdAmountStr = formData.get("emdAmount") as string;
        if (emdAmountStr) tenderData.emdAmount = emdAmountStr;
        
        const documentFeeStr = formData.get("documentFee") as string;
        if (documentFeeStr) tenderData.documentFee = documentFeeStr;
        
        const estimatedValueStr = formData.get("estimatedValue") as string;
        if (estimatedValueStr) tenderData.estimatedValue = estimatedValueStr;
        
        const bidValueStr = formData.get("bidValue") as string;
        if (bidValueStr) tenderData.bidValue = bidValueStr;
        
        console.log("Sending tender update data:", tenderData);
        
        // Update tender basic info
        const response = await fetch(`/api/tenders/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tenderData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server error response:", errorData);
          
          // If we have validation errors, throw them with the error object
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const validationError = new Error(errorData.message || "Failed to update tender") as ValidationErrorResponse;
            validationError.errors = errorData.errors;
            throw validationError;
          } else {
            throw new Error(errorData.message || "Failed to update tender");
          }
        }
        
        const updatedTender = await response.json();
        
        // Handle document uploads
        const hasDocuments = bidDocument || atcFile || techSpecsFile;
        
        if (hasDocuments) {
          // Create a new FormData for documents
          const documentFormData = new FormData();
          if (bidDocument) documentFormData.append("bidDocument", bidDocument);
          if (atcFile) documentFormData.append("atcDocument", atcFile);
          if (techSpecsFile) documentFormData.append("techSpecsDocument", techSpecsFile);
          
          // Upload documents
          const uploadResponse = await fetch(`/api/tenders/${id}/documents`, {
            method: 'POST',
            body: documentFormData
          });
          
          if (!uploadResponse.ok) {
            // Documents failed to upload but tender was updated
            toast({
              title: "Warning",
              description: "Tender updated but document upload failed",
              variant: "destructive"
            });
          } else {
            // Successfully uploaded documents
            const documentResult = await uploadResponse.json();
            console.log("Document upload success:", documentResult);
          }
        }
        
        return updatedTender;
      } catch (error: any) {
        console.error("Error updating tender:", error);
        // If this is already a ValidationErrorResponse with errors, rethrow it
        if (error.errors && Array.isArray(error.errors)) {
          throw error;
        }
        // Otherwise, create a new generic error
        throw new Error(error.message || "An error occurred while updating the tender");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
      toast({
        title: "Success!",
        description: "Tender updated successfully",
      });
      resetForm();
    },
    onError: (error: Error | any) => {
      // Reset field errors
      setFieldErrors({});
      
      // Check if there are validation errors
      if (error.errors && Array.isArray(error.errors)) {
        // Build new field errors
        const newFieldErrors: Record<string, string | undefined> = {};
        
        error.errors.forEach((err: {path?: string[], message?: string}) => {
          if (err.path && err.path.length > 0) {
            const fieldName = err.path[0];
            newFieldErrors[fieldName] = err.message || "Invalid value";
            
            // Add field specific errors
            if (fieldName === 'deadline') {
              toast({
                title: "Bid Expiry validation error",
                description: "The bid expiry field has an invalid format. Please select a valid date and time.",
                variant: "destructive"
              });
            } else {
              toast({
                title: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} validation error`,
                description: err.message,
                variant: "destructive"
              });
            }
          }
        });
        
        // Set field errors
        setFieldErrors(newFieldErrors);
      } else {
        // Generic error message
        toast({
          title: "Error updating tender",
          description: error.message || "An unexpected error occurred",
          variant: "destructive"
        });
      }
    }
  });

  // Handle search button click
  const handleSearch = () => {
    if (!searchTenderId.trim()) {
      toast({
        title: "Search ID required",
        description: "Please enter a tender ID to search",
        variant: "destructive"
      });
      return;
    }
    searchTender();
  };

  // When search results change
  useEffect(() => {
    if (searchResults) {
      setSelectedTender(searchResults);
      populateForm(searchResults);
    }
  }, [searchResults]);

  // Populate form with selected tender data
  const populateForm = (tender: Tender) => {
    setReferenceNo(tender.referenceNo || "");
    setTitle(tender.title || "");
    setBrief(tender.brief || "");
    setAuthority(tender.authority || "");
    setTenderLocation(tender.location || "");
    setStartDate(tender.startDate ? new Date(tender.startDate) : new Date());
    setDeadline(tender.deadline ? new Date(tender.deadline) : new Date());
    setEmdRequired(tender.emdAmount ? "Yes" : "No");
    setEmdAmount(tender.emdAmount);
    setDocumentFee(tender.documentFee);
    setEstimatedValue(tender.estimatedValue);
    setBidValue(tender.bidValue);
    setStatus(tender.status);
  };

  // Reset form
  const resetForm = () => {
    setFormMode("add");
    setSearchTenderId("");
    setSelectedTender(null);
    setReferenceNo("");
    setTitle("");
    setBrief("");
    setAuthority("");
    setTenderLocation("");
    setStartDate(new Date());
    setDeadline(new Date());
    setEmdRequired("No");
    setEmdAmount(undefined);
    setDocumentFee(undefined);
    setEstimatedValue(undefined);
    setBidValue(undefined);
    setStatus("new");
    setBidDocument(null);
    setAtcFile(null);
    setTechSpecsFile(null);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referenceNo || !title || !deadline) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Bid Number, Title, Deadline)",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append("referenceNo", referenceNo);
    formData.append("title", title);
    formData.append("brief", brief);
    formData.append("authority", authority);
    formData.append("location", tenderLocation);
    formData.append("deadline", deadline.toISOString());
    if (emdAmount !== undefined && emdAmount !== null) formData.append("emdAmount", emdAmount.toString());
    if (documentFee !== undefined && documentFee !== null) formData.append("documentFee", documentFee.toString());
    if (estimatedValue !== undefined && estimatedValue !== null) formData.append("estimatedValue", estimatedValue.toString());
    if (bidValue !== undefined && bidValue !== null) formData.append("bidValue", bidValue.toString());
    formData.append("status", status);
    
    // Add files if present
    if (bidDocument) formData.append("bidDocument", bidDocument);
    if (atcFile) formData.append("atcDocument", atcFile);
    if (techSpecsFile) formData.append("techSpecsDocument", techSpecsFile);
    
    if (formMode === "add") {
      createTenderMutation.mutate(formData);
    } else {
      updateTenderMutation.mutate(formData);
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'bid' | 'atc' | 'tech') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      switch (fileType) {
        case 'bid':
          setBidDocument(file);
          break;
        case 'atc':
          setAtcFile(file);
          break;
        case 'tech':
          setTechSpecsFile(file);
          break;
      }
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Add/Modify Tender</h1>
      </div>

      {/* Choose Action Section */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
        <h2 className="text-lg font-medium mb-4">Choose Action</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex space-x-4">
              <Button
                variant={formMode === "add" ? "default" : "outline"}
                onClick={() => {
                  setFormMode("add");
                  resetForm();
                }}
                className="w-full sm:w-auto"
              >
                Add New Tender
              </Button>
              <Button
                variant={formMode === "modify" ? "default" : "outline"}
                onClick={() => setFormMode("modify")}
                className="w-full sm:w-auto"
              >
                Modify Existing Tender
              </Button>
            </div>
          </div>
          
          {formMode === "modify" && (
            <div className="flex-1 flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
              <div className="relative flex-1">
                <Input
                  placeholder="Enter Tender ID or Reference No."
                  value={searchTenderId}
                  onChange={(e) => setSearchTenderId(e.target.value)}
                  className="w-full pr-10"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="whitespace-nowrap"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Show a message when in modify mode but no tender is searched/selected yet */}
      {formMode === "modify" && !selectedTender && !isSearching && searchTenderId === "" && (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="py-8">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search for a tender to modify</h3>
            <p className="text-gray-500">
              Enter a tender ID or reference number in the search field above.
            </p>
          </div>
        </div>
      )}

      {/* Show loading state while searching */}
      {formMode === "modify" && isSearching && (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="py-8">
            <Loader2 className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Searching...</h3>
            <p className="text-gray-500">
              Looking for tender with ID or reference "{searchTenderId}"
            </p>
          </div>
        </div>
      )}

      {/* Show "Not Found" state when search returns no results */}
      {formMode === "modify" && !selectedTender && !isSearching && searchTenderId.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="py-8">
            <SearchX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tender found</h3>
            <p className="text-gray-500">
              No tender with ID or reference number "{searchTenderId}" was found. Please try again with a different ID.
            </p>
          </div>
        </div>
      )}

      {/* Tender Form - Only show when in Add mode or when a tender is found in Modify mode */}
      {(formMode === "add" || (formMode === "modify" && selectedTender)) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="referenceNo">Bid Number *</Label>
                <Input
                  id="referenceNo"
                  placeholder="e.g., GEM-2023-1234567"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Tender Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="authority">Authority</Label>
                <Input
                  id="authority"
                  placeholder="Issuing Authority"
                  value={authority}
                  onChange={(e) => setAuthority(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Location"
                  value={tenderLocation}
                  onChange={(e) => setTenderLocation(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="brief">Brief Description</Label>
                <Textarea
                  id="brief"
                  placeholder="Brief description of the tender"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <Label 
                    htmlFor="startDate" 
                    className={fieldErrors.startDate ? "text-red-500" : ""}
                  >
                    Bid Start Date *
                  </Label>
                  {fieldErrors.startDate && (
                    <div className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Invalid date format</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${
                            fieldErrors.startDate ? "border-red-500" : ""
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Input
                      type="time"
                      id="startDateTime"
                      placeholder="Time (HH:MM)"
                      value={startDate ? format(startDate, "HH:mm") : ""}
                      onChange={(e) => {
                        if (e.target.value && startDate) {
                          const [hours, minutes] = e.target.value.split(':').map(Number);
                          const newStartDate = new Date(startDate);
                          newStartDate.setHours(hours, minutes);
                          setStartDate(newStartDate);
                        }
                      }}
                      className={fieldErrors.startDate ? "border-red-500" : ""}
                    />
                  </div>
                </div>
                {fieldErrors.startDate && (
                  <p className="mt-1 text-sm text-red-500">
                    Please select a valid date and time for the bid start date
                  </p>
                )}
              </div>
              
              <div>
                <div className="flex justify-between">
                  <Label 
                    htmlFor="deadline" 
                    className={fieldErrors.deadline ? "text-red-500" : ""}
                  >
                    Bid Expiry *
                  </Label>
                  {fieldErrors.deadline && (
                    <div className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Invalid date format</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="deadline"
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            fieldErrors.deadline ? "border-red-500 focus:ring-red-500" : ""
                          }`}
                        >
                          <CalendarIcon className={`mr-2 h-4 w-4 ${fieldErrors.deadline ? "text-red-500" : ""}`} />
                          {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={deadline}
                          onSelect={(date) => {
                            if (date) {
                              // Preserve the time component from the current deadline
                              const newDate = new Date(date);
                              newDate.setHours(deadline.getHours());
                              newDate.setMinutes(deadline.getMinutes());
                              setDeadline(newDate);
                              
                              // Clear any deadline error when a new date is selected
                              if (fieldErrors.deadline) {
                                setFieldErrors({
                                  ...fieldErrors,
                                  deadline: undefined
                                });
                              }
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Input
                      type="time"
                      value={`${String(deadline.getHours()).padStart(2, '0')}:${String(deadline.getMinutes()).padStart(2, '0')}`}
                      onChange={(e) => {
                        if (e.target.value) {
                          const [hours, minutes] = e.target.value.split(':').map(Number);
                          const newDate = new Date(deadline);
                          newDate.setHours(hours);
                          newDate.setMinutes(minutes);
                          setDeadline(newDate);
                          
                          // Clear any deadline error when time is changed
                          if (fieldErrors.deadline) {
                            setFieldErrors({
                              ...fieldErrors,
                              deadline: undefined
                            });
                          }
                        }
                      }}
                      className={`${fieldErrors.deadline ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                </div>
                {fieldErrors.deadline && (
                  <p className="mt-1 text-sm text-red-500">
                    Please select a valid date and time for the bid expiry
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="emdRequired">EMD Required</Label>
                <Select value={emdRequired} onValueChange={(value) => {
                  setEmdRequired(value);
                  // Clear EMD amount when "No" is selected
                  if (value === "No") {
                    setEmdAmount(undefined);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select EMD Required" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {emdRequired === "Yes" && (
                <div>
                  <Label htmlFor="emdAmount">EMD Amount</Label>
                  <Input
                    id="emdAmount"
                    type="number"
                    placeholder="0.00"
                    value={emdAmount !== undefined && emdAmount !== null ? emdAmount : ""}
                    onChange={(e) => setEmdAmount(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="documentFee">Document Fee</Label>
                <Input
                  id="documentFee"
                  type="number"
                  placeholder="0.00"
                  value={documentFee !== undefined && documentFee !== null ? documentFee : ""}
                  onChange={(e) => setDocumentFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              
              <div>
                <Label htmlFor="estimatedValue">Estimated Value</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  placeholder="0.00"
                  value={estimatedValue !== undefined && estimatedValue !== null ? estimatedValue : ""}
                  onChange={(e) => setEstimatedValue(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              
              <div>
                <Label htmlFor="bidValue">Bid Value</Label>
                <Input
                  id="bidValue"
                  type="number"
                  placeholder="0.00"
                  value={bidValue !== undefined && bidValue !== null ? bidValue : ""}
                  onChange={(e) => setBidValue(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in-process">In Process</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Document Upload Section */}
          <div className="mt-8">
            {formMode === "modify" && selectedTender ? (
              <>
                <h3 className="text-lg font-medium mb-4">Document Upload for Tender: {selectedTender.referenceNo}</h3>
                
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Label htmlFor="bidDocument">Bid Document (PDF)</Label>
                      {selectedTender.bidDocumentPath && (
                        <a 
                          href={`/uploads/${selectedTender.bidDocumentPath}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          <span>View current document</span>
                        </a>
                      )}
                    </div>
                    <Input
                      id="bidDocument"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, 'bid')}
                      className="mt-1"
                    />
                    {bidDocument && (
                      <p className="mt-2 text-sm text-green-600 flex items-center">
                        <Check className="h-4 w-4 mr-1" /> New file: {bidDocument.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Label htmlFor="atcDocument">ATC File</Label>
                      {selectedTender.atcDocumentPath && (
                        <a 
                          href={`/uploads/${selectedTender.atcDocumentPath}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          <span>View current document</span>
                        </a>
                      )}
                    </div>
                    <Input
                      id="atcDocument"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'atc')}
                      className="mt-1"
                    />
                    {atcFile && (
                      <p className="mt-2 text-sm text-green-600 flex items-center">
                        <Check className="h-4 w-4 mr-1" /> New file: {atcFile.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Label htmlFor="techSpecsDocument">Tech Specs File</Label>
                      {selectedTender.techSpecsDocumentPath && (
                        <a 
                          href={`/uploads/${selectedTender.techSpecsDocumentPath}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          <span>View current document</span>
                        </a>
                      )}
                    </div>
                    <Input
                      id="techSpecsDocument"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => handleFileChange(e, 'tech')}
                      className="mt-1"
                    />
                    {techSpecsFile && (
                      <p className="mt-2 text-sm text-green-600 flex items-center">
                        <Check className="h-4 w-4 mr-1" /> New file: {techSpecsFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-4">Document Upload</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="bidDocument">Bid Document (PDF)</Label>
                    <Input
                      id="bidDocument"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, 'bid')}
                      className="mt-1.5"
                    />
                    {bidDocument && (
                      <div className="mt-1 text-sm text-gray-500">
                        {bidDocument.name} ({Math.round(bidDocument.size / 1024)} KB)
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="atcDocument">ATC File</Label>
                    <Input
                      id="atcDocument"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'atc')}
                      className="mt-1.5"
                    />
                    {atcFile && (
                      <div className="mt-1 text-sm text-gray-500">
                        {atcFile.name} ({Math.round(atcFile.size / 1024)} KB)
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="techSpecsDocument">Tech Specs File</Label>
                    <Input
                      id="techSpecsDocument"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => handleFileChange(e, 'tech')}
                      className="mt-1.5"
                    />
                    {techSpecsFile && (
                      <div className="mt-1 text-sm text-gray-500">
                        {techSpecsFile.name} ({Math.round(techSpecsFile.size / 1024)} KB)
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTenderMutation.isPending || updateTenderMutation.isPending}>
              {(createTenderMutation.isPending || updateTenderMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {formMode === "add" ? "Add Tender" : "Update Tender"}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}