import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Download, FileText, Loader2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface ChecklistDocument {
  id: number;
  documentName: string;
  checklistId: number;
  createdAt: string;
  fileId?: number;
}

interface ResponseSubmission {
  id: number;
  responseName: string;
  responseType: string;
  createdAt: string;
  remarks: string;
  fileSize: string;
  isCompressed: boolean;
  status: string;
}

interface DocumentOrder {
  documentId: number;
  order: number;
  selected: boolean;
}

export default function PrepareChecklist() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Get parameters from URL or localStorage
  const [tenderId, setTenderId] = useState<number>(0);
  const [checklistId, setChecklistId] = useState<number>(0);
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentOrder[]>([]);
  const [responseName, setResponseName] = useState('');
  const [responseType, setResponseType] = useState('');
  const [remarks, setRemarks] = useState('');
  const [includeIndex, setIncludeIndex] = useState(false);
  const [indexStartFrom, setIndexStartFrom] = useState(1);
  const [signStampFile, setSignStampFile] = useState<File | null>(null);

  // Load data from localStorage or URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tId = params.get('tenderId') || localStorage.getItem('selectedTenderId');
    const cId = params.get('checklistId') || localStorage.getItem('selectedChecklistId');
    
    if (tId) setTenderId(parseInt(tId));
    if (cId) setChecklistId(parseInt(cId));
  }, []);

  // Fetch checklist documents
  const { data: checklistDocuments = [], isLoading: documentsLoading } = useQuery<ChecklistDocument[]>({
    queryKey: [`/api/checklists/${checklistId}/documents`],
    enabled: checklistId > 0,
  });

  // Fetch tender data
  const { data: tenderData = {} } = useQuery<{id: number; referenceNo: string; [key: string]: any}>({
    queryKey: ['/api/tenders', tenderId],
    enabled: tenderId > 0,
  });

  // Fetch submitted responses
  const { data: submittedResponses = [], isLoading: responsesLoading } = useQuery<ResponseSubmission[]>({
    queryKey: [`/api/tender-responses/${tenderId}`],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: tenderId > 0,
  });

  // Initialize document orders
  useEffect(() => {
    if (Array.isArray(checklistDocuments) && checklistDocuments.length > 0) {
      const initialOrders = (checklistDocuments as ChecklistDocument[]).map((doc, index) => ({
        documentId: doc.id,
        order: index + 1,
        selected: false,
      }));
      setSelectedDocuments(initialOrders);
    }
  }, [checklistDocuments]);

  // Handle document selection
  const toggleDocumentSelection = (documentId: number, checked: boolean) => {
    setSelectedDocuments(prev => 
      prev.map(doc => 
        doc.documentId === documentId 
          ? { ...doc, selected: checked }
          : doc
      )
    );
  };

  // Handle order change
  const updateDocumentOrder = (documentId: number, newOrder: number) => {
    setSelectedDocuments(prev => 
      prev.map(doc => 
        doc.documentId === documentId 
          ? { ...doc, order: newOrder }
          : doc
      )
    );
  };

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('tenderId', tenderId.toString());
      formData.append('checklistId', checklistId.toString());
      formData.append('responseName', responseName);
      formData.append('responseType', responseType);
      formData.append('remarks', remarks);
      formData.append('includeIndex', includeIndex.toString());
      formData.append('indexStartFrom', indexStartFrom.toString());
      formData.append('selectedDocuments', JSON.stringify(selectedDocuments.filter(doc => doc.selected)));
      
      if (signStampFile) {
        formData.append('signStampFile', signStampFile);
      }

      const response = await fetch('/api/tender-responses', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit response');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tender-responses', tenderId] });
      // Reset form
      setResponseName('');
      setResponseType('');
      setRemarks('');
      setIncludeIndex(false);
      setIndexStartFrom(1);
      setSignStampFile(null);
      setSelectedDocuments(prev => prev.map(doc => ({ ...doc, selected: false })));
    },
  });

  // Download all submissions mutation
  const downloadAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tender-responses/tender/${tenderId}/download-all`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to download all submissions');
      }
      
      // Create blob with explicit PDF type
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'all_submissions.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      return { success: true };
    },
  });

  const handleSubmit = () => {
    // Enhanced form validation as per requirements
    if (!responseName || !responseType) {
      alert('Response name and type are required');
      return;
    }
    
    const selectedDocs = selectedDocuments.filter(doc => doc.selected);
    if (selectedDocs.length === 0) {
      alert('Please select any one of the document');
      return;
    }
    

    
    submitResponseMutation.mutate({});
  };

  const handleDownloadAllSubmissions = () => {
    downloadAllMutation.mutate();
  };

  // Download individual response
  const handleDownloadResponse = (responseId: number) => {
    try {
      console.log(`Starting download for response ID: ${responseId}`);
      
      // Create the download URL
      const downloadUrl = `/api/tender-responses/${responseId}/download`;
      
      // Open in new window to trigger download
      const newWindow = window.open(downloadUrl, '_blank');
      
      // If popup was blocked, try direct navigation
      if (!newWindow) {
        console.log('Popup blocked, trying direct navigation');
        window.location.href = downloadUrl;
      }
      
      console.log('Download initiated successfully');
      
    } catch (error: any) {
      console.error('Download error details:', error);
      alert(`Failed to download compiled response: ${error?.message || 'Unknown error'}`);
    }
  };

  // Delete response
  const handleDeleteResponse = async (responseId: number) => {
    if (!confirm('Are you sure you want to delete this response?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tender-responses/${responseId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete response');
      }
      
      // Refresh the responses list
      queryClient.invalidateQueries({ queryKey: ['/api/tender-responses', tenderId] });
      alert('Response deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete response');
    }
  };

  const handleBack = () => {
    setLocation(`/tender-checklist?tenderId=${tenderId}`);
  };

  const getSelectedDocumentDetails = () => {
    return selectedDocuments
      .filter(doc => doc.selected)
      .sort((a, b) => a.order - b.order)
      .map(doc => {
        const docInfo = (checklistDocuments as ChecklistDocument[]).find(d => d.id === doc.documentId);
        return { ...doc, name: docInfo?.documentName || 'Unknown Document' };
      });
  };

  if (documentsLoading) {
    return <div className="p-6">Loading documents...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Prepare CheckList</h1>
          </div>
          <div className="text-sm text-gray-600">
            Tender Id: {(tenderData as any)?.referenceNo || tenderId}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Panel - Document List */}
        <div className="w-96 bg-white border-r border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Prepare CheckList</h2>
          
          <Table className="border">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="text-center font-semibold w-20">SR. NO.</TableHead>
                <TableHead className="text-center font-semibold">TYPE DOCUMENT NAME</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(checklistDocuments) && checklistDocuments.length > 0 ? (
                checklistDocuments.map((doc: ChecklistDocument, index: number) => (
                  <TableRow key={doc.id} className="border-b">
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="text-center">{doc.documentName}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                    No documents found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Main Content - Document Selection */}
        <div className="flex-1 bg-gray-50 p-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Tender Id: {(tenderData as any)?.referenceNo || tenderId}</h3>
              <div className="text-sm text-gray-600">
                Index Start from: {indexStartFrom}
              </div>
            </div>

            <Table className="border">
              <TableHeader>
                <TableRow className="bg-[#0076a8]">
                  <TableHead className="font-semibold text-white text-center w-12"></TableHead>
                  <TableHead className="font-semibold text-white text-center">DOCUMENT NAME</TableHead>
                  <TableHead className="font-semibold text-white text-center w-32">ORDER BY</TableHead>
                  <TableHead className="font-semibold text-white text-center w-24">VIEW</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(checklistDocuments) && checklistDocuments.length > 0 ? (
                  checklistDocuments.map((doc: ChecklistDocument, index: number) => {
                    const docOrder = selectedDocuments.find(d => d.documentId === doc.id);
                    const isSelected = docOrder?.selected || false;
                    
                    return (
                      <TableRow key={doc.id}>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => toggleDocumentSelection(doc.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="text-center">{doc.documentName}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="1"
                            value={docOrder?.order || index + 1}
                            onChange={(e) => updateDocumentOrder(doc.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <FileText className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No documents found for this checklist
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
          <div className="space-y-4">
            <Button
              className="w-full bg-[#0076a8] hover:bg-[#005a7a] text-white"
              onClick={() => {/* Download file functionality */}}
            >
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Name *
              </label>
              <Input
                value={responseName}
                onChange={(e) => setResponseName(e.target.value)}
                placeholder="Response Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Type *
              </label>
              <Select value={responseType} onValueChange={setResponseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Response Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Experience">Experience</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Past Performance">Past Performance</SelectItem>
                  <SelectItem value="OEM Financial">OEM Financial</SelectItem>
                  <SelectItem value="OEM Experience">OEM Experience</SelectItem>
                  <SelectItem value="Autorization Certificate">Autorization Certificate</SelectItem>
                  <SelectItem value="ATC1">ATC1</SelectItem>
                  <SelectItem value="ATC2">ATC2</SelectItem>
                  <SelectItem value="MSE">MSE</SelectItem>
                  <SelectItem value="MII">MII</SelectItem>
                  <SelectItem value="EMD">EMD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sign and Stamp
              </label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setSignStampFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeIndex"
                checked={includeIndex}
                onCheckedChange={(checked) => setIncludeIndex(checked as boolean)}
              />
              <label htmlFor="includeIndex" className="text-sm text-gray-700">
                Include Index
              </label>
            </div>

            {includeIndex && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Index Start From
                </label>
                <Input
                  type="number"
                  min="1"
                  value={indexStartFrom}
                  onChange={(e) => setIndexStartFrom(parseInt(e.target.value) || 1)}
                />
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitResponseMutation.isPending || !selectedDocuments.length}
              className="w-full btn-purple disabled:opacity-50 icon-btn"
            >
              {submitResponseMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating PDF...</span>
                </div>
              ) : (
                'Submit'
              )}
            </Button>

            <div className="text-xs text-gray-500">
              Note: Only PNG, JPG, and SVG files are allowed in sign and stamp
            </div>
          </div>
        </div>
      </div>

      {/* Response History Table */}
      <div className="px-6 pb-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Submitted Responses</CardTitle>
              {submittedResponses.length > 0 && (
                <Button
                  onClick={handleDownloadAllSubmissions}
                  disabled={downloadAllMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {downloadAllMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Merging...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download All Submissions
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table className="table-enhanced">
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead className="font-semibold text-white text-center">TENDER SUBMITTED RESPONSE NAME</TableHead>
                  <TableHead className="font-semibold text-white text-center">RESPONSE TYPE NAME</TableHead>
                  <TableHead className="font-semibold text-white text-center">CREATED DATE & TIME</TableHead>
                  <TableHead className="font-semibold text-white text-center">REMARKS</TableHead>
                  <TableHead className="font-semibold text-white text-center">DOWNLOAD</TableHead>
                  <TableHead className="font-semibold text-white text-center">COMPRESSED FILE</TableHead>
                  <TableHead className="font-semibold text-white text-center">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submittedResponses.length > 0 ? (
                  submittedResponses.map((response: ResponseSubmission) => (
                    <TableRow key={response.id}>
                      <TableCell className="text-center">{response.responseName}</TableCell>
                      <TableCell className="text-center">{response.responseType}</TableCell>
                      <TableCell className="text-center">{new Date(response.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-center">{response.remarks}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          size="sm" 
                          className="btn-purple text-xs icon-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDownloadResponse(response.id);
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          {response.fileSize || '0.798 MB'}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" className="btn-success text-xs icon-btn">
                          <FileText className="h-3 w-3 mr-1" />
                          {response.isCompressed ? 'Compressed' : 'No Compress'}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          size="sm" 
                          className="btn-danger text-xs icon-btn"
                          onClick={() => handleDeleteResponse(response.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No data found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}