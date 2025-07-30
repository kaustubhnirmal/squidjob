import React, { useState, useRef } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, AlertTriangle, CheckCircle, X, Download, File, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TenderDataEditor } from "@/components/tender/tender-data-editor";

interface TenderData {
  "Bid Number": string;
  "Dated": string;
  "Bid End Date/Time": string;
  "Bid Opening Date/Time": string;
  "Bid Offer Validity (From End Date)": string;
  "Ministry/State Name": string;
  "Department Name": string;
  "Organisation Name": string;
  "Office Name": string;
  "Buyer Email": string;
  "Total Quantity": string;
  "BOQ Title": string;
  "MSE Exemption for Years of Experience and Turnover": string;
  "EMD Amount": string;
  "Bid Value": string;
  "ePBG Detail: Required": string;
}

export default function ImportTender() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [extractedData, setExtractedData] = useState<TenderData[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'confirm'>('upload');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importMethod, setImportMethod] = useState<'pdf' | 'excel'>('pdf');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      if (importMethod === 'pdf') {
        // Check file count for PDFs
        if (selectedFiles.length > 5) {
          toast({
            title: "Too many files",
            description: "You can upload a maximum of 5 PDF files at once.",
            variant: "destructive",
          });
          return;
        }
        
        // Check file types for PDFs
        const invalidFiles = selectedFiles.filter(file => file.type !== "application/pdf");
        if (invalidFiles.length > 0) {
          toast({
            title: "Invalid file type",
            description: "Only PDF files are allowed.",
            variant: "destructive",
          });
          return;
        }
      } else if (importMethod === 'excel') {
        // Check file count for Excel - only 1 allowed
        if (selectedFiles.length > 1) {
          toast({
            title: "Too many files",
            description: "You can upload only 1 Excel file at a time.",
            variant: "destructive",
          });
          return;
        }
        
        // Check file types for Excel
        const validExcelTypes = [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv'
        ];
        
        const invalidFiles = selectedFiles.filter(
          file => !validExcelTypes.includes(file.type) && 
                 // Check file extension as fallback since some CSV files might have different MIME types
                 !file.name.endsWith('.xls') && 
                 !file.name.endsWith('.xlsx') && 
                 !file.name.endsWith('.csv')
        );
        
        if (invalidFiles.length > 0) {
          toast({
            title: "Invalid file type",
            description: "Only Excel or CSV files are allowed.",
            variant: "destructive",
          });
          return;
        }
      }
      
      setFiles(selectedFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Upload files to server
  const uploadFiles = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create a FormData instance to send files
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add import method to the form data
    formData.append('importMethod', importMethod);
    
    try {
      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) { // Up to 95% for upload, remaining 5% for processing
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);
      
      // Set processing state after upload appears complete
      setTimeout(() => {
        setIsProcessing(true);
      }, files.length * 200); // Time based on number of files
      
      // Choose the appropriate API endpoint based on import method
      const endpoint = importMethod === 'pdf' 
        ? '/api/import-tender/upload-pdf' 
        : '/api/import-tender/upload-excel';
      
      // Make API call to upload files
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      setExtractedData(result.data);
      setCurrentStep('preview');
      
    } catch (error: unknown) {
      console.error('Error uploading files:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error uploading or processing files';
      setErrorMessage(errorMsg);
      setIsAlertOpen(true);
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };
  
  // Download empty Excel template for manual completion
  const downloadExcelTemplate = () => {
    // Create a CSV template based on the TenderData interface
    const headers = [
      "Bid Number",
      "Dated",
      "Bid End Date/Time",
      "Bid Opening Date/Time",
      "Bid Offer Validity (From End Date)",
      "Ministry/State Name",
      "Department Name",
      "Organisation Name",
      "Office Name",
      "Buyer Email",
      "Total Quantity",
      "BOQ Title",
      "MSE Exemption for Years of Experience and Turnover",
      "EMD Amount",
      "Bid Value",
      "ePBG Detail: Required"
    ];
    
    // Create a sample row with empty values or examples
    const exampleRow = [
      "GEM/2025/B/1234567",
      "01-04-2025",
      "15-04-2025 15:00:00",
      "15-04-2025 15:30:00",
      "120 (Days)",
      "Ministry of Finance",
      "Department of Revenue",
      "Income Tax Department",
      "Central Office",
      "buyer@example.gov.in",
      "1000",
      "Supply of IT Equipment",
      "No",
      "50000",
      "5000000",
      "No"
    ];
    
    // Format as CSV
    const csvContent = [
      headers.join(','),
      exampleRow.join(',')
    ].join('\n');
    
    // Create a Blob and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tender_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Template downloaded",
      description: "Fill this template with your tender data and upload it for bulk import.",
    });
  };
  
  // For development/demo purposes, we'll fall back to simulated data if the API call fails
  const processPdfContent = () => {
    const mockData: TenderData[] = files.map((file, index) => ({
      "Bid Number": `GEM/2025/B/${5986924 + index}`,
      "Dated": "24-02-2025",
      "Bid End Date/Time": "07-03-2025 15:00:00",
      "Bid Opening Date/Time": "07-03-2025 15:30:00",
      "Bid Offer Validity (From End Date)": "120 (Days)",
      "Ministry/State Name": "Ministry Of Steel",
      "Department Name": "Nmdc Steel Limited",
      "Organisation Name": "Nmdc Steel Limited",
      "Office Name": "Nmdc Iron Steel Plant Jagdalpur Bastar Cg 494001",
      "Buyer Email": "buycon105.nl.cg@gembuyer.in",
      "Total Quantity": "46562",
      "BOQ Title": "Claus Kiln Refractories",
      "MSE Exemption for Years of Experience and Turnover": "No",
      "EMD Amount": "53800",
      "Bid Value": "5300000",
      "ePBG Detail: Required": "No"
    }));
    
    setExtractedData(mockData);
    setCurrentStep('preview');
  };

  const handleUpload = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: importMethod === 'pdf' 
          ? "Please select at least one PDF file to upload." 
          : "Please select an Excel or CSV file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (importMethod === 'excel' && files.length > 1) {
      toast({
        title: "Too many files",
        description: "You can only upload one Excel/CSV file at a time.",
        variant: "destructive",
      });
      return;
    }
    
    // Call the uploadFiles function to send files to backend
    uploadFiles().catch((error: unknown) => {
      console.error("Upload failed:", error);
      
      // Show error toast
      toast({
        title: "Upload failed",
        description: error instanceof Error 
          ? error.message 
          : `Failed to process ${importMethod === 'pdf' ? 'PDF' : 'Excel/CSV'} file${files.length > 1 ? 's' : ''}`,
        variant: "destructive",
      });
      
      // Reset upload states
      setIsProcessing(false);
      setIsUploading(false);
    });
  };

  const handleCancel = () => {
    setFiles([]);
    setCurrentStep('upload');
    setExtractedData([]);
  };

  const handleConfirm = async () => {
    try {
      setIsUploading(true); // Reuse this state to show loading
      
      // Prepare data with assignments
      const tendersWithAssignments = extractedData.map((tender, index) => ({
        ...tender,
        assignedTo: tenderAssignments[index] || null
      }));
      
      // Send the validated data to the backend
      const response = await fetch('/api/import-tender/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          tenders: tendersWithAssignments,
          assignments: tenderAssignments
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save tenders: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Show success message with actual results from the server
      toast({
        title: "Tenders imported successfully",
        description: result.message || `${extractedData.length} tenders have been imported and added to the system.`,
      });
      
      // Reset the form
      setFiles([]);
      setCurrentStep('upload');
      setExtractedData([]);
      
    } catch (error: unknown) {
      console.error('Error saving tenders:', error);
      
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "There was an error saving the tenders. Please try again.",
        variant: "destructive"
      });
      
    } finally {
      setIsUploading(false);
    }
  };

  // Function to handle editing data fields
  const handleDataEdit = (index: number, field: keyof TenderData, value: string) => {
    setExtractedData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const [selectedTenderIndex, setSelectedTenderIndex] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<Array<{id: number, name: string, username: string}>>([]);
  const [tenderAssignments, setTenderAssignments] = useState<{[index: number]: number}>({});
  
  // Fetch users for assignment dropdown
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleEditTender = (index: number) => {
    setSelectedTenderIndex(index);
    setIsEditorOpen(true);
  };
  
  const handleAssignTender = (index: number, userId: number) => {
    setTenderAssignments(prev => ({
      ...prev,
      [index]: userId
    }));
    
    const assignedUser = users.find(user => user.id === userId);
    if (assignedUser) {
      toast({
        title: "Tender assigned",
        description: `Tender will be assigned to ${assignedUser.name} on import.`,
      });
    }
  };
  
  const handleDeleteTender = (index: number) => {
    setExtractedData(prev => {
      const newData = [...prev];
      newData.splice(index, 1);
      return newData;
    });
    
    toast({
      title: "Tender removed",
      description: "The tender has been removed from the import list.",
    });
  };
  
  const handleSaveTenderData = (updatedData: TenderData) => {
    if (selectedTenderIndex !== null) {
      setExtractedData(prev => {
        const newData = [...prev];
        newData[selectedTenderIndex] = updatedData;
        return newData;
      });
      
      toast({
        title: "Tender data updated",
        description: "The tender data has been updated successfully.",
      });
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="w-full mx-auto mb-6">
        <CardHeader className="bg-white">
          <CardTitle className="text-xl font-semibold">Import Tender Data</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {currentStep === 'upload' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Import Methods</h3>
                <div className="flex flex-wrap gap-4">
                  <div 
                    className={`p-4 rounded-md flex-1 cursor-pointer border ${importMethod === 'pdf' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white'}`}
                    onClick={() => setImportMethod('pdf')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <File className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">From PDF</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Extract tender data automatically from GEM bidding PDFs. 
                      Upload up to 5 files at once.
                    </p>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-md flex-1 cursor-pointer border ${importMethod === 'excel' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white'}`}
                    onClick={() => setImportMethod('excel')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <File className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium">From Excel/CSV</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Upload Excel or CSV file with tender data in the required format. 
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          downloadExcelTemplate();
                        }}
                        className="text-blue-600 ml-1 underline"
                      >
                        Download template
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {importMethod === 'pdf' ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Upload className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-600">
                          Drag and drop PDF files here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Upload up to 5 PDF files (Max 10MB each)
                        </p>
                      </div>
                      <Button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="mt-2"
                      >
                        Select PDF Files
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      ref={excelFileInputRef}
                      type="file"
                      accept=".xls,.xlsx,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Upload className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-600">
                          Drag and drop Excel/CSV file here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Use our template format for accurate import (Max 10MB)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => excelFileInputRef.current?.click()} 
                          className="mt-2"
                        >
                          Select Excel/CSV File
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={downloadExcelTemplate} 
                          className="mt-2"
                        >
                          Download Template
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {files.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Selected Files</h3>
                  <div className="bg-white rounded-md shadow">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>File Name</TableHead>
                          <TableHead className="w-24">Size</TableHead>
                          <TableHead className="w-20 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {files.map((file, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="flex items-center">
                              <File className="h-4 w-4 mr-2 text-blue-500" />
                              {file.name}
                            </TableCell>
                            <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleUpload} disabled={files.length === 0 || isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      {isProcessing ? "Processing..." : "Uploading..."}
                    </>
                  ) : (
                    "Upload and Extract Data"
                  )}
                </Button>
              </div>
              
              {isUploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>{isProcessing ? "Processing PDF content..." : "Uploading files..."}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'preview' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-md flex items-start mb-4">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 text-yellow-600" />
                <div>
                  <p className="font-medium">Review the extracted data</p>
                  <p className="text-sm">Please verify the data extracted from the PDF files. Edit any incorrect values before importing.</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Bid Number</TableHead>
                      <TableHead>Dated</TableHead>
                      <TableHead>Bid End Date/Time</TableHead>
                      <TableHead>Organisation</TableHead>
                      <TableHead>BOQ Title</TableHead>
                      <TableHead>EMD Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-40 text-center">Assign Tender</TableHead>
                      <TableHead className="w-20 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extractedData.map((data, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{data["Bid Number"]}</TableCell>
                        <TableCell>{data["Dated"]}</TableCell>
                        <TableCell>{data["Bid End Date/Time"]}</TableCell>
                        <TableCell>{data["Organisation Name"]}</TableCell>
                        <TableCell>{data["BOQ Title"]}</TableCell>
                        <TableCell>{data["EMD Amount"]}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-green-700 text-sm">Valid</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(value) => handleAssignTender(index, parseInt(value))}
                            value={tenderAssignments[index]?.toString() || ""}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.name || user.username}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditTender(index)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteTender(index)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              title="Delete"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={() => setCurrentStep('confirm')}>
                  Confirm and Import
                </Button>
              </div>
            </div>
          )}
          
          {currentStep === 'confirm' && (
            <div className="space-y-6 py-4">
              <div className="bg-green-50 border border-green-300 text-green-800 p-4 rounded-md flex items-start mb-4">
                <CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-600" />
                <div>
                  <p className="font-medium">Ready to import</p>
                  <p className="text-sm">You are about to import {extractedData.length} tender(s) into the system. This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Bid Number</TableHead>
                      <TableHead>Dated</TableHead>
                      <TableHead>Bid End Date/Time</TableHead>
                      <TableHead>Organisation</TableHead>
                      <TableHead>BOQ Title</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extractedData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{data["Bid Number"]}</TableCell>
                        <TableCell>{data["Dated"]}</TableCell>
                        <TableCell>{data["Bid End Date/Time"]}</TableCell>
                        <TableCell>{data["Organisation Name"]}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{data["BOQ Title"]}</span>
                            {tenderAssignments[index] && (
                              <span className="text-xs text-blue-600 mt-1">
                                Assigned to: {users.find(u => u.id === tenderAssignments[index])?.name || 'User'}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep('preview')} disabled={isUploading}>Back</Button>
                <Button onClick={handleConfirm} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Confirm Import"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error Processing PDF</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* TenderDataEditor for detailed editing */}
      {selectedTenderIndex !== null && extractedData[selectedTenderIndex] && (
        <TenderDataEditor 
          isOpen={isEditorOpen} 
          onClose={() => setIsEditorOpen(false)} 
          data={extractedData[selectedTenderIndex]} 
          onSave={handleSaveTenderData} 
          index={selectedTenderIndex}
        />
      )}
    </div>
  );
}