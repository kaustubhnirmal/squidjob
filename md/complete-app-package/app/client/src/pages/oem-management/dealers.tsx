import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp, Download, Search, X } from 'lucide-react';
import { useUser } from '@/user-context';
import { usePermissions } from '@/hooks/use-permissions';

// Page Header Component
const PageHeader = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
    </div>
    {children && <div className="flex gap-2">{children}</div>}
  </div>
);

// Create Dealer Dialog
const CreateDealerDialog = ({ isOpen, onClose, onSubmit }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    personName: '',
    contactNo: '',
    alternativeContactNo: '',
    emailId: '',
    alternativeEmailId: '',
    streetAddress: '',
    state: '',
    city: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Static list of Indian states for the dropdown
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
    'Delhi', 'Lakshadweep', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'
  ];
  
  // Map of cities by state for the dropdown
  const citiesByState: Record<string, string[]> = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belgaum', 'Gulbarga', 'Davanagere'],
    'Delhi': ['New Delhi', 'Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
    // Add more states and their cities as needed
  };
  
  // You can add more states and cities as needed
  
  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // If state changed, reset city
    if (name === 'state') {
      setFormData(prev => ({ ...prev, city: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.companyName) newErrors.companyName = 'Company name is required';
    if (!formData.personName) newErrors.personName = 'Person name is required';
    if (!formData.contactNo) newErrors.contactNo = 'Contact number is required';
    if (!formData.emailId) newErrors.emailId = 'Email is required';
    if (!formData.streetAddress) newErrors.streetAddress = 'Street address is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    
    // Validate email format
    if (formData.emailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      newErrors.emailId = 'Please enter a valid email address';
    }
    
    // Validate alternative email if provided
    if (formData.alternativeEmailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.alternativeEmailId)) {
      newErrors.alternativeEmailId = 'Please enter a valid email address';
    }
    
    // Validate phone number format (basic validation)
    if (formData.contactNo && !/^\d{10}$/.test(formData.contactNo)) {
      newErrors.contactNo = 'Please enter a valid 10-digit contact number';
    }
    
    // Validate alternative phone if provided
    if (formData.alternativeContactNo && !/^\d{10}$/.test(formData.alternativeContactNo)) {
      newErrors.alternativeContactNo = 'Please enter a valid 10-digit contact number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create Dealer</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                className={errors.companyName ? "border-red-500" : ""}
              />
              {errors.companyName && (
                <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
              )}
            </div>
            
            {/* Person Name */}
            <div>
              <label htmlFor="personName" className="block text-sm font-medium text-gray-700 mb-1">
                Person Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="personName"
                name="personName"
                placeholder="Person Name"
                value={formData.personName}
                onChange={handleChange}
                className={errors.personName ? "border-red-500" : ""}
              />
              {errors.personName && (
                <p className="text-red-500 text-xs mt-1">{errors.personName}</p>
              )}
            </div>
            
            {/* Contact No. */}
            <div>
              <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-1">
                Contact No. <span className="text-red-500">*</span>
              </label>
              <Input
                id="contactNo"
                name="contactNo"
                placeholder="Contact No."
                value={formData.contactNo}
                onChange={handleChange}
                className={errors.contactNo ? "border-red-500" : ""}
              />
              {errors.contactNo && (
                <p className="text-red-500 text-xs mt-1">{errors.contactNo}</p>
              )}
            </div>
            
            {/* Alternative Contact No. */}
            <div>
              <label htmlFor="alternativeContactNo" className="block text-sm font-medium text-gray-700 mb-1">
                Alternative Contact No.
              </label>
              <Input
                id="alternativeContactNo"
                name="alternativeContactNo"
                placeholder="Alternative Contact No."
                value={formData.alternativeContactNo}
                onChange={handleChange}
                className={errors.alternativeContactNo ? "border-red-500" : ""}
              />
              {errors.alternativeContactNo && (
                <p className="text-red-500 text-xs mt-1">{errors.alternativeContactNo}</p>
              )}
            </div>
            
            {/* Email Id */}
            <div>
              <label htmlFor="emailId" className="block text-sm font-medium text-gray-700 mb-1">
                Email Id <span className="text-red-500">*</span>
              </label>
              <Input
                id="emailId"
                name="emailId"
                placeholder="Email Id"
                value={formData.emailId}
                onChange={handleChange}
                className={errors.emailId ? "border-red-500" : ""}
              />
              {errors.emailId && (
                <p className="text-red-500 text-xs mt-1">{errors.emailId}</p>
              )}
            </div>
            
            {/* Alternative Email Id */}
            <div>
              <label htmlFor="alternativeEmailId" className="block text-sm font-medium text-gray-700 mb-1">
                Alternative Email Id
              </label>
              <Input
                id="alternativeEmailId"
                name="alternativeEmailId"
                placeholder="Alternative Email Id"
                value={formData.alternativeEmailId}
                onChange={handleChange}
                className={errors.alternativeEmailId ? "border-red-500" : ""}
              />
              {errors.alternativeEmailId && (
                <p className="text-red-500 text-xs mt-1">{errors.alternativeEmailId}</p>
              )}
            </div>
            
            {/* Street Address */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <Input
                id="streetAddress"
                name="streetAddress"
                placeholder="Street Address"
                value={formData.streetAddress}
                onChange={handleChange}
                className={errors.streetAddress ? "border-red-500" : ""}
              />
              {errors.streetAddress && (
                <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>
              )}
            </div>
            
            {/* State */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleSelectChange('state', value)}
              >
                <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
              )}
            </div>
            
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <Input
                id="city"
                name="city"
                placeholder="Enter City"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
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

export default function DealersPage() {
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
    companyName: '',
    emailId: '',
    contactNo: '',
    state: '',
    city: '',
  });
  
  // Check if user has permission
  if (!hasPermission('oemManagement')) {
    return <NotAuthorized />;
  }
  
  // Fetch dealers with filters applied
  const { data: dealers = [], isLoading } = useQuery({
    queryKey: ['/api/dealers', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (filters.companyName) queryParams.append('companyName', filters.companyName);
      if (filters.emailId) queryParams.append('emailId', filters.emailId);
      if (filters.contactNo) queryParams.append('contactNo', filters.contactNo);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.city) queryParams.append('city', filters.city);
      
      const url = `/api/dealers/search?${queryParams.toString()}`;
      const response = await apiRequest('GET', url);
      return response.json();
    },
  });
  
  // Create dealer mutation
  const createDealerMutation = useMutation({
    mutationFn: async (dealerData: any) => {
      const response = await apiRequest('POST', '/api/dealers', dealerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dealers'] });
      toast({
        title: 'Success',
        description: 'Dealer created successfully',
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create dealer',
        variant: 'destructive',
      });
    },
  });
  
  const handleCreateDealer = (data: any) => {
    createDealerMutation.mutate(data);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    
    // If state changed, reset city
    if (name === 'state') {
      setFilters(prev => ({ ...prev, city: '' }));
    }
  };
  
  const handleSearchClick = () => {
    // If "not_classified" is selected, we should set state to empty string for filtering
    const adjustedFilters = { ...filters };
    if (adjustedFilters.state === "not_classified") {
      adjustedFilters.state = "";
    }
    setFilters(adjustedFilters);
    queryClient.invalidateQueries({ queryKey: ['/api/dealers'] });
  };
  
  const handleClearClick = () => {
    setFilters({
      companyName: '',
      emailId: '',
      contactNo: '',
      state: '',
      city: '',
    });
    queryClient.invalidateQueries({ queryKey: ['/api/dealers'] });
  };
  
  const handleExportToExcel = () => {
    // In a real implementation, this would generate and download an Excel file
    console.log('Export to Excel button clicked');
  };
  
  // Static list of Indian states for the dropdown
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
    'Delhi', 'Lakshadweep', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'
  ];
  
  // Map of cities by state for the dropdown
  const citiesByState: Record<string, string[]> = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belgaum', 'Gulbarga', 'Davanagere'],
    'Delhi': ['New Delhi', 'Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
    // Add more states and their cities as needed
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Dealers">
        <Button
          className="bg-[#0076a8] hover:bg-[#00608a] text-white"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          + Create Dealer
        </Button>
      </PageHeader>
      
      {/* Create Dealer Dialog */}
      {isCreateDialogOpen && (
        <CreateDealerDialog 
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateDealer}
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
              {/* Company Name */}
              <div>
                <Input
                  placeholder="Company Name"
                  name="companyName"
                  value={filters.companyName}
                  onChange={handleFilterChange}
                />
              </div>
              
              {/* Email ID */}
              <div>
                <Input
                  placeholder="Email Id"
                  name="emailId"
                  value={filters.emailId}
                  onChange={handleFilterChange}
                />
              </div>
              
              {/* Contact No */}
              <div>
                <Input
                  placeholder="Contact No"
                  name="contactNo"
                  value={filters.contactNo}
                  onChange={handleFilterChange}
                />
              </div>
              
              {/* State */}
              <div>
                <Select
                  value={filters.state}
                  onValueChange={(value) => handleSelectChange('state', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Not Classified" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_classified">Not Classified</SelectItem>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* City */}
              <div>
                <Input
                  placeholder="City"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                />
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
        
        {/* Dealers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#0076a8] text-white">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  COMPANY NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  PERSON NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  CONTACT NO.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  EMAIL ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  CITY NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : dealers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                dealers.map((dealer: any, index: number) => (
                  <tr key={dealer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{dealer.companyName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{dealer.personName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{dealer.contactNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{dealer.emailId}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{dealer.city}</td>
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
                disabled={dealers.length < pageSize}
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