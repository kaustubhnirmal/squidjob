import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp, Download, Search, X, Calendar, Upload } from 'lucide-react';
import { useUser } from '@/user-context';
import { usePermissions } from '@/hooks/use-permissions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Page Header Component
const PageHeader = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
    </div>
    {children && <div className="flex gap-2">{children}</div>}
  </div>
);

// Create OEM Dialog
const CreateOEMDialog = ({ isOpen, onClose, onSubmit }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    tenderNo: '',
    departmentName: '',
    dealerId: '',
    authorizationDate: null as Date | null,
    reminderDate: null as Date | null,
    authorizationDocument: null as File | null,
    followupRemarks: '',
    authorizationLetterBrief: '',
    followupDate: null as Date | null,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { data: dealers = [], isLoading: isLoadingDealers } = useQuery({
    queryKey: ['/api/dealers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/dealers');
      return response.json();
    },
  });
  
  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleDateChange = (name: string, date: Date | null) => {
    setFormData(prev => ({ ...prev, [name]: date }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, authorizationDocument: file }));
      
      // Clear error for this field if it exists
      if (errors.authorizationDocument) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.authorizationDocument;
          return newErrors;
        });
      }
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.tenderNo) newErrors.tenderNo = 'Tender number is required';
    if (!formData.departmentName) newErrors.departmentName = 'Department name is required';
    if (!formData.dealerId) newErrors.dealerId = 'Dealer name is required';
    if (!formData.authorizationDate) newErrors.authorizationDate = 'Authorization date is required';
    if (!formData.reminderDate) newErrors.reminderDate = 'Reminder date is required';
    if (!formData.followupDate) newErrors.followupDate = 'Followup date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert dates to string for submission
      const formDataForSubmission = {
        ...formData,
        authorizationDate: formData.authorizationDate ? format(formData.authorizationDate, 'yyyy-MM-dd') : null,
        reminderDate: formData.reminderDate ? format(formData.reminderDate, 'yyyy-MM-dd') : null,
        followupDate: formData.followupDate ? format(formData.followupDate, 'yyyy-MM-dd') : null,
      };
      
      onSubmit(formDataForSubmission);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create OEM</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tender No */}
            <div>
              <label htmlFor="tenderNo" className="block text-sm font-medium text-gray-700 mb-1">
                Tender No <span className="text-red-500">*</span>
              </label>
              <Input
                id="tenderNo"
                name="tenderNo"
                placeholder="Tender No"
                value={formData.tenderNo}
                onChange={handleChange}
                className={errors.tenderNo ? "border-red-500" : ""}
              />
              {errors.tenderNo && (
                <p className="text-red-500 text-xs mt-1">{errors.tenderNo}</p>
              )}
            </div>
            
            {/* Department Name */}
            <div>
              <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700 mb-1">
                Department Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="departmentName"
                name="departmentName"
                placeholder="Department Name"
                value={formData.departmentName}
                onChange={handleChange}
                className={errors.departmentName ? "border-red-500" : ""}
              />
              {errors.departmentName && (
                <p className="text-red-500 text-xs mt-1">{errors.departmentName}</p>
              )}
            </div>
            
            {/* Dealer Name */}
            <div>
              <label htmlFor="dealerId" className="block text-sm font-medium text-gray-700 mb-1">
                Dealer Name <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.dealerId}
                onValueChange={(value) => handleSelectChange('dealerId', value)}
              >
                <SelectTrigger className={errors.dealerId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Dealer" />
                </SelectTrigger>
                <SelectContent>
                  {dealers.map((dealer: any) => (
                    <SelectItem key={dealer.id} value={dealer.id.toString()}>
                      {dealer.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dealerId && (
                <p className="text-red-500 text-xs mt-1">{errors.dealerId}</p>
              )}
            </div>
            
            {/* Authorization Document */}
            <div>
              <label htmlFor="authorizationDocument" className="block text-sm font-medium text-gray-700 mb-1">
                Authorization Document
              </label>
              <div className="flex items-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="bg-gray-100 border border-gray-300 rounded-md py-1.5 px-3 text-sm flex items-center gap-2">
                    <Upload size={16} className="text-gray-500" />
                    Choose File
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.csv,.xlsx"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <span className="ml-2 text-sm text-gray-500">
                  {formData.authorizationDocument ? formData.authorizationDocument.name : "No file chosen"}
                </span>
              </div>
              {errors.authorizationDocument && (
                <p className="text-red-500 text-xs mt-1">{errors.authorizationDocument}</p>
              )}
            </div>
            
            {/* Authorization Date */}
            <div>
              <label htmlFor="authorizationDate" className="block text-sm font-medium text-gray-700 mb-1">
                Authorization Date <span className="text-red-500">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${errors.authorizationDate ? "border-red-500" : ""}`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.authorizationDate ? (
                      format(formData.authorizationDate, "PPP")
                    ) : (
                      <span>Authorization Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.authorizationDate || undefined}
                    onSelect={(date) => handleDateChange('authorizationDate', date as Date | null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.authorizationDate && (
                <p className="text-red-500 text-xs mt-1">{errors.authorizationDate}</p>
              )}
            </div>
            
            {/* Reminder Date */}
            <div>
              <label htmlFor="reminderDate" className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Date <span className="text-red-500">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${errors.reminderDate ? "border-red-500" : ""}`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.reminderDate ? (
                      format(formData.reminderDate, "PPP")
                    ) : (
                      <span>Reminder Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.reminderDate || undefined}
                    onSelect={(date) => handleDateChange('reminderDate', date as Date | null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.reminderDate && (
                <p className="text-red-500 text-xs mt-1">{errors.reminderDate}</p>
              )}
            </div>
            
            {/* Followup Remarks */}
            <div>
              <label htmlFor="followupRemarks" className="block text-sm font-medium text-gray-700 mb-1">
                Followup Remarks
              </label>
              <Input
                id="followupRemarks"
                name="followupRemarks"
                placeholder="Followup Remarks"
                value={formData.followupRemarks}
                onChange={handleChange}
              />
            </div>
            
            {/* Authorization Letter Brief */}
            <div>
              <label htmlFor="authorizationLetterBrief" className="block text-sm font-medium text-gray-700 mb-1">
                Authorization Letter Brief
              </label>
              <Input
                id="authorizationLetterBrief"
                name="authorizationLetterBrief"
                placeholder="Authorization Letter Brief"
                value={formData.authorizationLetterBrief}
                onChange={handleChange}
              />
            </div>
            
            {/* Followup Date */}
            <div>
              <label htmlFor="followupDate" className="block text-sm font-medium text-gray-700 mb-1">
                Followup Date <span className="text-red-500">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${errors.followupDate ? "border-red-500" : ""}`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.followupDate ? (
                      format(formData.followupDate, "PPP")
                    ) : (
                      <span>Followup Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.followupDate || undefined}
                    onSelect={(date) => handleDateChange('followupDate', date as Date | null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.followupDate && (
                <p className="text-red-500 text-xs mt-1">{errors.followupDate}</p>
              )}
            </div>
            

          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0076a8] hover:bg-[#00608a] text-white"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Not Authorized Component
const NotAuthorized = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[70vh] p-4">
    <div className="flex flex-col items-center justify-center text-center max-w-lg">
      <div className="bg-red-100 p-4 rounded-full mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="16.5" y1="7.5" x2="7.5" y2="16.5" />
          <line x1="7.5" y1="7.5" x2="16.5" y2="16.5" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-lg text-gray-600 mb-6">
        You don't have permission to view this page. Please contact your administrator if you believe this is an error.
      </p>
      <Button 
        className="bg-primary-600 hover:bg-primary-700 text-white"
        onClick={() => window.location.href = '/'}
      >
        Return to Dashboard
      </Button>
    </div>
  </div>
);

export default function OEMPage() {
  const { currentUser } = useUser();
  const { hasPermission } = usePermissions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Filter state
  const [filters, setFilters] = useState({
    tenderNumber: '',
    departmentName: '',
    tenderStatus: '',
    authorizationDateFrom: null as Date | null,
    authorizationDateTo: null as Date | null,
    followupDateFrom: null as Date | null,
    followupDateTo: null as Date | null,
  });
  
  // Check if user has permission
  if (!hasPermission('oemManagement')) {
    return <NotAuthorized />;
  }
  
  // Fetch OEM data with filters applied
  const { data: oemEntries = [], isLoading } = useQuery({
    queryKey: ['/api/oem', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (filters.tenderNumber) queryParams.append('tenderNumber', filters.tenderNumber);
      if (filters.departmentName) queryParams.append('departmentName', filters.departmentName);
      if (filters.tenderStatus && filters.tenderStatus !== 'all') queryParams.append('tenderStatus', filters.tenderStatus);
      
      if (filters.authorizationDateFrom) {
        queryParams.append('authorizationDateFrom', format(filters.authorizationDateFrom, 'yyyy-MM-dd'));
      }
      
      if (filters.authorizationDateTo) {
        queryParams.append('authorizationDateTo', format(filters.authorizationDateTo, 'yyyy-MM-dd'));
      }
      
      if (filters.followupDateFrom) {
        queryParams.append('followupDateFrom', format(filters.followupDateFrom, 'yyyy-MM-dd'));
      }
      
      if (filters.followupDateTo) {
        queryParams.append('followupDateTo', format(filters.followupDateTo, 'yyyy-MM-dd'));
      }
      
      const url = `/api/oem?${queryParams.toString()}`;
      
      try {
        const response = await apiRequest('GET', url);
        return response.json();
      } catch (error) {
        console.error("Failed to fetch OEM data:", error);
        return [];
      }
    },
  });
  
  // Create OEM mutation
  const createOEMMutation = useMutation({
    mutationFn: async (oemData: any) => {
      // First, create the OEM entry
      const oemResponse = await apiRequest('POST', '/api/oem', {
        tenderNo: oemData.tenderNo,
        departmentName: oemData.departmentName,
        dealerId: parseInt(oemData.dealerId),
        authorizationDate: oemData.authorizationDate,
        reminderDate: oemData.reminderDate,
        followupDate: oemData.followupDate,
        followupRemarks: oemData.followupRemarks,
        authorizationLetterBrief: oemData.authorizationLetterBrief
      });
      
      if (!oemResponse.ok) {
        throw new Error(`Error creating OEM: ${oemResponse.status}`);
      }
      
      const oemResult = await oemResponse.json();
      
      // If we have a document to upload and the OEM was created successfully
      if (oemData.authorizationDocument && oemResult.id) {
        const formData = new FormData();
        formData.append('document', oemData.authorizationDocument);
        
        // Upload the document
        const uploadResponse = await fetch(`/api/oem/${oemResult.id}/upload-document`, {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Error uploading document: ${uploadResponse.status}`);
        }
        
        return uploadResponse.json();
      }
      
      return oemResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oem'] });
      toast({
        title: 'Success',
        description: 'OEM created successfully',
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create OEM',
        variant: 'destructive',
      });
    },
  });
  
  const handleCreateOEM = (data: any) => {
    createOEMMutation.mutate(data);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (name: string, date: Date | null) => {
    setFilters(prev => ({ ...prev, [name]: date }));
  };
  
  const handleSearchClick = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/oem'] });
  };
  
  const handleClearClick = () => {
    setFilters({
      tenderNumber: '',
      departmentName: '',
      tenderStatus: '',
      authorizationDateFrom: null,
      authorizationDateTo: null,
      followupDateFrom: null,
      followupDateTo: null,
    });
    queryClient.invalidateQueries({ queryKey: ['/api/oem'] });
  };
  
  const handleExportToExcel = () => {
    // In a real implementation, this would generate and download an Excel file
    console.log('Export to Excel button clicked');
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="OEM">
        <Button
          className="bg-[#0076a8] hover:bg-[#00608a] text-white"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          + Create OEM
        </Button>
      </PageHeader>
      
      {/* Create OEM Dialog */}
      {isCreateDialogOpen && (
        <CreateOEMDialog 
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateOEM}
        />
      )}
      
      <div className="bg-background-50 shadow-sm rounded-lg p-6 mt-6">
        {/* Search panel with toggle */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Search className="h-5 w-5 mr-2 text-gray-500" />
              <h2 className="text-lg font-medium">Search</h2>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700 p-2"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              {isFilterExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          {isFilterExpanded && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tender Number */}
              <div>
                <Input
                  placeholder="Tender Number"
                  name="tenderNumber"
                  value={filters.tenderNumber}
                  onChange={handleFilterChange}
                />
              </div>
              
              {/* Department Name */}
              <div>
                <Input
                  placeholder="Department Name"
                  name="departmentName"
                  value={filters.departmentName}
                  onChange={handleFilterChange}
                />
              </div>
              
              {/* Tender Status */}
              <div>
                <Select
                  value={filters.tenderStatus}
                  onValueChange={(value) => handleSelectChange('tenderStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="OEM Tender Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Win">Win</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Authorization Date From */}
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.authorizationDateFrom ? (
                        format(filters.authorizationDateFrom, "PPP")
                      ) : (
                        <span className="text-gray-500">Authorization Date From</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={filters.authorizationDateFrom || undefined}
                      onSelect={(date) => handleDateChange('authorizationDateFrom', date as Date | null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Authorization Date To */}
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.authorizationDateTo ? (
                        format(filters.authorizationDateTo, "PPP")
                      ) : (
                        <span className="text-gray-500">Authorization Date To</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={filters.authorizationDateTo || undefined}
                      onSelect={(date) => handleDateChange('authorizationDateTo', date as Date | null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* FollowUp Date From */}
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.followupDateFrom ? (
                        format(filters.followupDateFrom, "PPP")
                      ) : (
                        <span className="text-gray-500">FollowUP Date From</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={filters.followupDateFrom || undefined}
                      onSelect={(date) => handleDateChange('followupDateFrom', date as Date | null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* FollowUp Date To */}
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.followupDateTo ? (
                        format(filters.followupDateTo, "PPP")
                      ) : (
                        <span className="text-gray-500">FollowUp Date To</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={filters.followupDateTo || undefined}
                      onSelect={(date) => handleDateChange('followupDateTo', date as Date | null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Search and Clear buttons */}
              <div className="flex gap-2">
                <Button 
                  className="bg-[#0076a8] hover:bg-[#00608a] text-white w-24"
                  onClick={handleSearchClick}
                >
                  Search
                </Button>
                <Button 
                  variant="outline"
                  className="bg-gray-100 w-24"
                  onClick={handleClearClick}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Export to Excel button */}
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-gray-300"
            onClick={handleExportToExcel}
          >
            <Download className="h-4 w-4" />
            Export To Excel
          </Button>
        </div>
        
        {/* OEM Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#0076a8] text-white">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  TENDER NO.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  DEALER NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  AUTHORIZATION DATE
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  NEXT FOLLOWUP DATE
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  DEPARTMENT NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : oemEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                oemEntries.map((oem: any, index: number) => (
                  <tr key={oem.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{oem.tenderNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{oem.dealer?.companyName || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {oem.authorizationDate ? format(new Date(oem.authorizationDate), 'PP') : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {oem.followupDate ? format(new Date(oem.followupDate), 'PP') : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{oem.departmentName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        oem.status === 'Win' ? 'bg-green-100 text-green-800' : 
                        oem.status === 'Lost' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {oem.status || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <span className="mr-2">Show</span>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => {
                // Handle page size change
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm">Page {pageIndex + 1}</span>
            <div className="flex space-x-1">
              <button
                onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                disabled={pageIndex === 0}
                className="p-1 rounded border border-gray-300 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setPageIndex(pageIndex + 1)}
                disabled={oemEntries.length < pageSize}
                className="p-1 rounded border border-gray-300 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}