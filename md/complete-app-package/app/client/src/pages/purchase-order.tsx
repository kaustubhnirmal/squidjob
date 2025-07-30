import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { useUser } from '@/user-context';
import { usePermissions } from '@/hooks/use-permissions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Import local components to avoid path issues - simplified without greeting message
const PageHeader = ({ title, children }: any) => (
  <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
    </div>
    {children && <div className="flex gap-2">{children}</div>}
  </div>
);

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

// Upload Purchase Order Dialog Component
const UploadPODialog = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (file: File) => void }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleChooseFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      onSave(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upload Purchase Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File*
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
            className="hidden"
          />
          <div className="flex items-center">
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={handleChooseFile}
            >
              Choose File
            </Button>
            <span className="text-sm text-gray-500">
              {selectedFile ? selectedFile.name : 'No file chosen'}
            </span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            className="bg-[#0076a8] hover:bg-[#00608a] text-white"
            onClick={handleSave}
            disabled={!selectedFile}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function PurchaseOrderPage() {
  const { currentUser } = useUser();
  const { hasPermission } = usePermissions();
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has permission to view purchase orders
  if (!hasPermission('purchaseOrder')) {
    return <NotAuthorized />;
  }

  // Fetch purchase orders
  const { data: purchaseOrders = [], isLoading } = useQuery({
    queryKey: ['/api/purchase-orders'],
    queryFn: () => apiRequest('GET', '/api/purchase-orders')
      .then(res => res.json()),
  });

  // Upload PO mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      // We're using FormData, so we shouldn't use JSON stringification
      const response = await fetch('/api/purchase-orders/upload', {
        method: 'POST',
        body: formData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({
        title: 'Success',
        description: 'Purchase order uploaded successfully',
      });
      setIsUploadDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload purchase order',
        variant: 'destructive',
      });
    },
  });

  const handleUploadPO = () => {
    setIsUploadDialogOpen(true);
  };

  const handleSavePO = (file: File) => {
    uploadMutation.mutate(file);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Purchase Order" />
      
      <div className="bg-background-50 shadow-sm rounded-lg p-6 mt-6">
        <div className="flex justify-end mb-4">
          <Button 
            className="bg-[#0076a8] hover:bg-[#00608a] text-white"
            onClick={handleUploadPO}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload PO
          </Button>
        </div>
        
        {/* Upload PO Dialog */}
        <UploadPODialog 
          isOpen={isUploadDialogOpen} 
          onClose={() => setIsUploadDialogOpen(false)}
          onSave={handleSavePO}
        />

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#0076a8] text-white">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  GEM CONTRACT NO
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  ORGANIZATION NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  PRODUCT NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  BRAND
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  MODEL
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  ORDERED QUANTITY
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  UNIT PRICE
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  TOTAL PRICE
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  START DATE
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  EPBG PERCENTAGE
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  GENERATED DATE
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
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-4 py-8 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((po: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{po.gemContractNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{po.organizationName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{po.productName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{po.brand}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{po.model}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{po.orderedQuantity}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{po.unitPrice}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{po.totalPrice}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{po.startDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{po.epbgPercentage}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{po.generatedDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{po.status}</td>
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
                disabled={purchaseOrders.length < pageSize}
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