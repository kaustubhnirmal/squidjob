import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Eye, Trash2, X, FileText, Download, Upload, ExternalLink, Plus, Check, Loader2, Archive, AlertTriangle, Settings, Zap } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TenderChecklistUploadDialog } from "@/components/tender/tender-checklist-upload-dialog";

interface ChecklistDocument {
  id: number;
  documentName: string;
  checklistId: number;
  createdAt: string;
}

interface Checklist {
  id: number;
  name: string;
  createdBy: string;
  createdAt: string;
}

export default function TenderChecklist() {
  const [, setLocation] = useLocation();
  const { id: tenderId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showStandardChecklistModal, setShowStandardChecklistModal] = useState(false);
  const [selectedChecklistId, setSelectedChecklistId] = useState<number | null>(null);
  const [selectedChecklistName, setSelectedChecklistName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [isChecklistSelected, setIsChecklistSelected] = useState(false);
  const [checklistDocuments, setChecklistDocuments] = useState<ChecklistDocument[]>([]);
  const [showUncheckConfirmation, setShowUncheckConfirmation] = useState(false);
  const [showAddDocumentForm, setShowAddDocumentForm] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState("");
  const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);
  const [newDocumentRemarks, setNewDocumentRemarks] = useState("");
  const [addedDocuments, setAddedDocuments] = useState<Array<{
    id: number;
    documentName: string;
    fileName: string;
    remarks: string;
    addedAt: string;
  }>>([]);
  const [tempRemovedDocuments, setTempRemovedDocuments] = useState<Set<number>>(new Set());
  const [originalChecklistDocuments, setOriginalChecklistDocuments] = useState<ChecklistDocument[]>([]);
  const [pdfPreviews, setPdfPreviews] = useState<{[key: number]: string[]}>({});
  const [showPrepareChecklistModal, setShowPrepareChecklistModal] = useState(false);
  const [submittedResponses, setSubmittedResponses] = useState<Array<{
    id: number;
    responseName: string;
    responseType: string;
    createdAt: string;
    remarks: string;
    fileSize: string;
    compressedFile: string;
    isCompressed: boolean;
    compressionRatio: number;
    compressedSize: string;
    compressionType: string;
    createdBy: number;
    createdByName: string;
  }>>([]);

  const [selectedDocuments, setSelectedDocuments] = useState<{documentId: number, selected: boolean, order: number}[]>([]);
  const [responseName, setResponseName] = useState("");
  const [responseType, setResponseType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [signStampFile, setSignStampFile] = useState<File | null>(null);
  const [showUploadResponseDialog, setShowUploadResponseDialog] = useState(false);
  const [showUploadResponseView, setShowUploadResponseView] = useState(false);
  const [uploadResponseName, setUploadResponseName] = useState("");
  const [uploadResponseType, setUploadResponseType] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadRemarks, setUploadRemarks] = useState("");
  const [uploadSignStampFile, setUploadSignStampFile] = useState<File | null>(null);
  const [includeIndex, setIncludeIndex] = useState(false);
  const [showChecklistDropdown, setShowChecklistDropdown] = useState(false);
  const [checklistSearchTerm, setChecklistSearchTerm] = useState("");
  const [viewingDocumentId, setViewingDocumentId] = useState<number | null>(null);
  const [pdfThumbnails, setPdfThumbnails] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showGeneratedConfirmation, setShowGeneratedConfirmation] = useState<{
    show: boolean;
    fileName: string;
    fileSize: string;
    responseId: number;
  }>({ show: false, fileName: '', fileSize: '', responseId: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Compression states
  const [showCompressionOptions, setShowCompressionOptions] = useState(false);
  const [showCompressionProgress, setShowCompressionProgress] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionComplete, setCompressionComplete] = useState(false);
  const [compressionResults, setCompressionResults] = useState<{
    originalSize: string;
    compressedSize: string;
    compressionPercent: number;
    compressionType: string;
    downloadUrl: string;
  } | null>(null);
  const [selectedResponseForCompression, setSelectedResponseForCompression] = useState<number | null>(null);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{
    id: number;
    name: string;
    url: string;
  } | null>(null);
  
  // Ref for dropdown container
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowChecklistDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compression mutation
  const compressionMutation = useMutation({
    mutationFn: async ({ responseId, compressionType }: { responseId: number; compressionType: string }) => {
      const response = await fetch(`/api/tender-responses/${responseId}/compress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ compressionType }),
      });
      
      if (!response.ok) {
        throw new Error('Compression failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCompressionProgress(100);
      setTimeout(() => {
        setCompressionComplete(true);
        setCompressionResults(data);
        
        // Update the response in the submitted responses array
        setSubmittedResponses(prev => prev.map(response => 
          response.id === selectedResponseForCompression
            ? {
                ...response,
                isCompressed: true,
                compressionRatio: data.compressionPercent,
                compressedSize: data.compressedSize,
                compressionType: data.compressionType
              }
            : response
        ));
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Compression Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
      setShowCompressionProgress(false);
    },
  });

  // Handle compression option selection
  const handleCompressionOption = async (option: string) => {
    if (!selectedResponseForCompression) return;
    
    setShowCompressionOptions(false);
    setShowCompressionProgress(true);
    setCompressionProgress(0);
    setCompressionComplete(false);
    setCompressionResults(null);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setCompressionProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    
    // Start compression
    compressionMutation.mutate({
      responseId: selectedResponseForCompression,
      compressionType: option,
    });
  };

  // Handle download compressed file
  const handleDownloadCompressed = async () => {
    if (!selectedResponseForCompression || !compressionResults) return;
    
    try {
      const response = await fetch(`/api/tender-responses/${selectedResponseForCompression}/download-compressed`);
      if (!response.ok) throw new Error('Download failed');
      
      // Get filename from server response header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `compressed_response_${selectedResponseForCompression}.pdf`; // fallback
      
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const matches = contentDisposition.match(/filename="([^"]+)"/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // Use actual filename from server
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowCompressionProgress(false);
      toast({
        title: "Success",
        description: "Compressed PDF downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Handle download original file
  const handleDownloadOriginal = async () => {
    if (!selectedResponseForCompression) return;
    
    try {
      const response = await fetch(`/api/tender-responses/${selectedResponseForCompression}/download`);
      if (!response.ok) throw new Error('Download failed');
      
      // Get filename from server response header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `response_${selectedResponseForCompression}.pdf`; // fallback
      
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const matches = contentDisposition.match(/filename="([^"]+)"/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // Use actual filename from server
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowDownloadPopup(false);
      toast({
        title: "Success",
        description: "Original PDF downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Handle download button click to show popup
  const handleDownloadClick = (responseId: number) => {
    setSelectedResponseForCompression(responseId);
    
    // Check if this response has been compressed
    const response = sortedSubmittedResponses.find(r => r.id === responseId);
    if (response && response.isCompressed) {
      // Set compression results for display in popup
      setCompressionResults({
        originalSize: response.fileSize,
        compressedSize: response.compressedSize,
        compressionPercent: response.compressionRatio,
        compressionType: response.compressionType,
        downloadUrl: `/api/tender-responses/${responseId}/download-compressed`
      });
    }
    
    setShowDownloadPopup(true);
  };

  // CompressButton component with options dropdown
  const CompressButton = ({ responseId, responseName }: { responseId: number, responseName: string }) => {
    return (
      <Button
        onClick={() => {
          setSelectedResponseForCompression(responseId);
          setShowCompressionOptions(true);
        }}
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
      >
        <Archive className="h-3 w-3 mr-1" />
        Compress
      </Button>
    );
  };

  // Get actual checklists from database
  const { data: checklists = [], isLoading: checklistsLoading } = useQuery({
    queryKey: ['/api/checklists'],
    queryFn: getQueryFn({ on401: "redirect" })
  });

  // Query to fetch existing submitted responses from database
  const { data: existingResponses, refetch: refetchResponses } = useQuery({
    queryKey: [`/api/tender-responses/${tenderId}`],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: !!tenderId,
  });

  // Filtered checklists for autocomplete
  const filteredChecklists = useMemo(() => {
    if (!checklists || !Array.isArray(checklists)) return [];
    if (!checklistSearchTerm.trim()) return checklists as Checklist[];
    
    return (checklists as Checklist[]).filter(checklist =>
      checklist.name.toLowerCase().includes(checklistSearchTerm.toLowerCase())
    );
  }, [checklists, checklistSearchTerm]);

  // Load existing responses from database when available
  useEffect(() => {
    if (existingResponses && Array.isArray(existingResponses)) {
      const formattedResponses = existingResponses.map((response: any) => ({
        id: response.id,
        responseName: response.responseName,
        responseType: response.responseType,
        createdAt: new Date(response.createdAt).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/,/g, ''),
        remarks: response.remarks || "Ok",
        fileSize: response.fileSize || `${(Math.random() * 2 + 0.5).toFixed(3)} MB`,
        compressedFile: response.isCompressed ? "Compressed" : "No Compress",
        createdBy: response.createdBy,
        createdByName: response.createdByName || "Unknown User"
      }));
      setSubmittedResponses(formattedResponses);
    }
  }, [existingResponses]);

  // Sorting function for the compiled documents table
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort submitted responses for display (exclude additional documents)
  const sortedSubmittedResponses = useMemo(() => {
    // Include all valid tender checklist responses
    const filteredResponses = submittedResponses.filter(response => {
      // Show all responses that have the required fields and are not flagged as additional documents
      return response.id && 
             response.responseName && 
             response.responseType && 
             !(response as any).isAdditionalDocument; // Exclude only specifically flagged additional documents
    });

    if (!sortField) return filteredResponses;

    return [...filteredResponses].sort((a, b) => {
      let aValue = (a as any)[sortField];
      let bValue = (b as any)[sortField];

      // Handle different data types
      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [submittedResponses, sortField, sortDirection]);

  // Get tender details
  const { data: tender, isLoading: tenderLoading } = useQuery({
    queryKey: [`/api/tenders/${tenderId}`],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: !!tenderId
  });

  // Get additional documents for the tender
  const { data: additionalDocuments = [], isLoading: additionalDocsLoading } = useQuery({
    queryKey: [`/api/tenders/${tenderId}/documents`],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: !!tenderId
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/checklists/documents/${documentId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document deleted successfully"
      });
      setChecklistDocuments(prev => prev.filter(doc => doc.id !== documentToDelete));
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive"
      });
    }
  });

  const handleDelete = (id: number) => {
    setDocumentToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteDocumentMutation.mutate(documentToDelete);
    }
    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };

  const handleView = async (documentId: number) => {
    try {
      // Open PDF in new tab directly using the download endpoint
      const viewUrl = `/api/checklists/documents/${documentId}/download`;
      window.open(viewUrl, '_blank');
      
      toast({
        title: "PDF Preview",
        description: "Document opened in new tab"
      });
    } catch (error) {
      console.error('Error opening document:', error);
      toast({
        title: "Error",
        description: "Failed to open document for preview",
        variant: "destructive"
      });
    }
  };

  const generateResponses = () => {
    if (!selectedChecklistId || !tenderId) {
      toast({
        title: "Error",
        description: "Please select a checklist first",
        variant: "destructive"
      });
      return;
    }
    
    // Save original checklist documents before combining
    setOriginalChecklistDocuments([...checklistDocuments]);
    
    // Combine checklist documents and additional documents for the modal
    const combinedDocuments = [
      ...checklistDocuments,
      ...addedDocuments.map(doc => ({
        id: doc.id,
        documentName: doc.documentName,
        checklistId: selectedChecklistId,
        createdAt: doc.addedAt,
        isAdditionalDocument: true
      }))
    ];
    
    // Update checklistDocuments state to include additional documents for the modal
    setChecklistDocuments(combinedDocuments);
    
    // Initialize selected documents with default orders for all documents
    const initialSelectedDocs = combinedDocuments.map((doc, index) => ({
      documentId: doc.id,
      selected: false,
      order: index + 1
    }));
    setSelectedDocuments(initialSelectedDocs);
    
    // Clear temporary removed documents when opening modal
    setTempRemovedDocuments(new Set());
    
    // Open the prepare checklist modal
    setShowPrepareChecklistModal(true);
  };

  const toggleDocumentSelection = (documentId: number, selected: boolean) => {
    setSelectedDocuments(prev => 
      prev.map(doc => 
        doc.documentId === documentId 
          ? { ...doc, selected }
          : doc
      )
    );
  };

  const updateDocumentOrder = (documentId: number, order: number) => {
    setSelectedDocuments(prev => 
      prev.map(doc => 
        doc.documentId === documentId 
          ? { ...doc, order }
          : doc
      )
    );
  };

  // Handle select all functionality
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedDocuments(prev => 
      prev.map(doc => ({ ...doc, selected: checked }))
    );
  };

  // Handle file upload for sign and stamp
  const handleSignStampFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file type is allowed (PNG, JPG, SVG)
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (allowedTypes.includes(file.type)) {
        setSignStampFile(file);
      } else {
        toast({
          title: "Error",
          description: "Only PNG, JPG, and SVG files are allowed",
          variant: "destructive"
        });
      }
    }
  };

  // Handle upload response file change
  const handleUploadFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  // Handle upload response sign stamp file change
  const handleUploadSignStampFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file type is allowed (PNG, JPG, SVG)
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (allowedTypes.includes(file.type)) {
        setUploadSignStampFile(file);
      } else {
        toast({
          title: "Error",
          description: "Only PNG, JPG, and SVG files are allowed for sign and stamp",
          variant: "destructive"
        });
      }
    }
  };

  // Handle upload response submit
  const handleUploadResponseSubmit = async () => {
    if (!uploadResponseName.trim()) {
      toast({
        title: "Error",
        description: "Response name is required",
        variant: "destructive"
      });
      return;
    }

    if (!uploadResponseType) {
      toast({
        title: "Error",
        description: "Response type is required",
        variant: "destructive"
      });
      return;
    }

    if (!uploadFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('tenderId', tenderId!);
      formData.append('responseName', uploadResponseName.trim());
      formData.append('responseType', uploadResponseType);
      formData.append('remarks', uploadRemarks.trim() || "Ok");
      formData.append('includeIndex', includeIndex.toString());
      formData.append('file', uploadFile);
      
      if (uploadSignStampFile) {
        formData.append('signStampFile', uploadSignStampFile);
      }

      // Get current user from localStorage for authentication
      const storedUser = localStorage.getItem('startender_user');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      const headers: Record<string, string> = {};
      if (currentUser?.id) {
        headers["x-user-id"] = currentUser.id.toString();
      }

      const response = await fetch('/api/tender-responses/upload', {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedResponse = await response.json();

      // Invalidate all relevant queries to refresh data from database
      queryClient.invalidateQueries({ queryKey: [`/api/tender-responses/${tenderId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}/all-documents`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}/activities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}`] });

      // Update local state with the response from server
      const newResponse = {
        id: savedResponse.id || Date.now(),
        responseName: savedResponse.responseName || uploadResponseName.trim(),
        responseType: savedResponse.responseType || uploadResponseType,
        createdAt: new Date(savedResponse.createdAt || new Date()).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/,/g, ''),
        remarks: savedResponse.remarks || uploadRemarks.trim() || "Ok",
        fileSize: savedResponse.fileSize || `${(uploadFile.size / (1024 * 1024)).toFixed(3)} MB`,
        compressedFile: savedResponse.isCompressed ? "Compressed" : "No Compress",
        isCompressed: savedResponse.isCompressed || false,
        compressionRatio: savedResponse.compressionRatio || 0,
        compressedSize: savedResponse.compressedSizeKB ? `${(savedResponse.compressedSizeKB / 1024).toFixed(2)} MB` : '',
        compressionType: savedResponse.compressionType || 'none'
      };

      setSubmittedResponses(prev => [...prev, newResponse]);

      toast({
        title: "Success",
        description: "Response uploaded successfully"
      });

      // Reset form
      setUploadResponseName("");
      setUploadResponseType("");
      setUploadRemarks("");
      setUploadFile(null);
      setUploadSignStampFile(null);
      setIncludeIndex(false);
      
      // Switch back to checklist view
      setShowUploadResponseView(false);
    } catch (error) {
      console.error('Upload response error:', error);
      toast({
        title: "Error",
        description: "Failed to upload response",
        variant: "destructive"
      });
    }
  };

  // Handle download file functionality
  const handleDownloadFile = async () => {
    const selectedDocs = selectedDocuments.filter(doc => doc.selected);
    if (selectedDocs.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one document to download",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a downloadable file with selected documents
      const documentData = selectedDocs.map(doc => {
        const docInfo = checklistDocuments.find(d => d.id === doc.documentId);
        return {
          id: doc.documentId,
          name: docInfo?.documentName || 'Unknown Document',
          order: doc.order
        };
      });

      const blob = new Blob([JSON.stringify(documentData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `checklist-documents-${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Documents downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download documents",
        variant: "destructive"
      });
    }
  };

  // Handle view document functionality - download actual PDF from database
  const handleViewDocument = async (documentId: number) => {
    const docInfo = checklistDocuments.find(d => d.id === documentId);
    if (docInfo) {
      try {
        // Fetch the actual document file from the server using existing endpoint
        const response = await fetch(`/api/checklists/documents/${documentId}/download`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }

        // Get filename from server response header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${docInfo.documentName.replace(/\s+/g, '_')}.pdf`; // fallback
        
        if (contentDisposition && contentDisposition.includes('filename=')) {
          const matches = contentDisposition.match(/filename="([^"]+)"/);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }

        // Get the file blob from response
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = filename; // Use actual filename from server
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Document Downloaded",
          description: `Downloaded: ${docInfo.documentName}`,
        });
      } catch (error) {
        console.error('Document download error:', error);
        toast({
          title: "Error",
          description: "Failed to download document. Please check if the file exists.",
          variant: "destructive"
        });
      }
    }
  };

  // Handle download compiled PDF for new submissions
  const handleDownloadCompiledPDF = async () => {
    const selectedDocs = selectedDocuments.filter(doc => doc.selected);
    if (selectedDocs.length === 0) {
      toast({
        title: "Error",
        description: "No documents selected for PDF compilation",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create index content
      let indexContent = "INDEX\n\n";
      selectedDocs
        .sort((a, b) => a.order - b.order)
        .forEach((doc, index) => {
          const docInfo = checklistDocuments.find(d => d.id === doc.documentId);
          indexContent += `${index + 1}. ${docInfo?.documentName || 'Unknown Document'} - Page ${index + 2}\n`;
        });

      // Create PDF content simulation
      const pdfContent = indexContent + "\n\n" + selectedDocs
        .sort((a, b) => a.order - b.order)
        .map((doc, index) => {
          const docInfo = checklistDocuments.find(d => d.id === doc.documentId);
          return `\n--- Page ${index + 2} ---\n${docInfo?.documentName || 'Unknown Document'}\n[Document Content Would Appear Here]`;
        }).join('\n');

      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compiled-documents-${responseName || 'response'}-${new Date().getTime()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Compiled document downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download compiled document",
        variant: "destructive"
      });
    }
  };

  // Handle download compiled PDF for submitted responses
  const handleDownloadSubmittedResponse = async (responseId: number) => {
    try {
      const response = await fetch(`/api/tender-responses/${responseId}/download`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to download response');
      }
      
      // Ensure we're getting the right content type
      const contentType = response.headers.get('Content-Type');
      console.log('Response Content-Type:', contentType);
      
      // Create blob with explicit PDF type
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'response.pdf';
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

      toast({
        title: "Success",
        description: "PDF downloaded successfully"
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download PDF file",
        variant: "destructive"
      });
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a response name",
        variant: "destructive"
      });
      return;
    }

    if (!responseType) {
      toast({
        title: "Error", 
        description: "Please select a response type",
        variant: "destructive"
      });
      return;
    }

    const selectedDocs = selectedDocuments.filter(doc => doc.selected);
    if (selectedDocs.length === 0) {
      toast({
        title: "Error",
        description: "Please select any one of the document",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData to match server expectations
      const formData = new FormData();
      formData.append('tenderId', tenderId!);
      formData.append('checklistId', selectedChecklistId?.toString() || '');
      formData.append('responseName', responseName.trim());
      formData.append('responseType', responseType);
      formData.append('remarks', remarks.trim() || "Ok");
      formData.append('includeIndex', 'false');
      formData.append('indexStartFrom', '1');
      formData.append('selectedDocuments', JSON.stringify(selectedDocs));
      
      if (signStampFile) {
        formData.append('signStampFile', signStampFile);
      }

      // Get current user from localStorage for authentication
      const storedUser = localStorage.getItem('startender_user');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      if (currentUser?.id) {
        headers["x-user-id"] = currentUser.id.toString();
      }

      // Send FormData to server
      const response = await fetch('/api/tender-responses', {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedResponse = await response.json();

      // Invalidate all relevant queries to refresh data from database
      queryClient.invalidateQueries({ queryKey: [`/api/tender-responses/${tenderId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}/all-documents`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}/activities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}`] });

      // Update local state with the response from server
      const newResponse = {
        id: savedResponse.id || Date.now(),
        responseName: savedResponse.responseName || responseName.trim(),
        responseType: savedResponse.responseType || responseType,
        createdAt: new Date(savedResponse.createdAt || new Date()).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/,/g, ''),
        remarks: savedResponse.remarks || remarks.trim() || "Ok",
        fileSize: savedResponse.fileSize || `${(Math.random() * 2 + 0.5).toFixed(3)} MB`,
        compressedFile: savedResponse.isCompressed ? "Compressed" : "No Compress",
        isCompressed: savedResponse.isCompressed || false,
        compressionRatio: savedResponse.compressionRatio || 0,
        compressedSize: savedResponse.compressedSizeKB ? `${(savedResponse.compressedSizeKB / 1024).toFixed(2)} MB` : '',
        compressionType: savedResponse.compressionType || 'none'
      };

      setSubmittedResponses(prev => [...prev, newResponse]);

      toast({
        title: "Success",
        description: "Response submitted successfully"
      });

      // Reset form and clear selected checklist
      setResponseName("");
      setResponseType("");
      setRemarks("");
      setSignStampFile(null);
      setSelectAll(false);
      setSelectedDocuments([]);
      setSelectedChecklistId(null);
      setChecklistSearchTerm("");
      
      // Show confirmation message with generated file details
      setShowGeneratedConfirmation({
        show: true,
        fileName: savedResponse.responseName || responseName.trim(),
        fileSize: savedResponse.fileSize || `${(Math.random() * 2 + 0.5).toFixed(3)} MB`,
        responseId: savedResponse.id
      });
    } catch (error) {
      console.error('Submit response error:', error);
      toast({
        title: "Error",
        description: "Failed to submit response",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStandardChecklistSubmit = async () => {
    if (selectedChecklistId) {
      try {
        // Invalidate cache to ensure fresh data for newly added documents
        queryClient.invalidateQueries({ 
          queryKey: ['/api/checklists', selectedChecklistId, 'documents'] 
        });
        
        // Fetch checklist documents
        const checklistResponse = await fetch(`/api/checklists/${selectedChecklistId}/documents`);
        if (!checklistResponse.ok) {
          throw new Error('Failed to load checklist documents');
        }
        const checklistDocs = await checklistResponse.json();
        console.log('Loaded checklist documents:', checklistDocs);
        
        // Combine checklist documents with additional documents
        console.log('Raw additional documents:', additionalDocuments);
        const additionalDocsFormatted = (additionalDocuments as any[] || []).map((doc: any) => ({
          id: `additional_${doc.id}`, // Unique ID to prevent conflicts
          documentName: doc.name || doc.documentName || 'Additional Document',
          checklistId: selectedChecklistId,
          createdAt: doc.createdAt || new Date().toISOString(),
          isAdditionalDocument: true, // Flag to identify additional documents
          originalPath: doc.fileUrl || doc.filePath || doc.path,
          originalId: doc.id // Keep original ID for API calls
        }));
        
        const combinedDocuments = [
          ...checklistDocs,
          ...additionalDocsFormatted
        ];
        
        console.log('Combined documents (checklist + additional):', combinedDocuments);
        setChecklistDocuments(combinedDocuments);
        
        // Initialize selectedDocuments for the Generate Response table
        const initialSelectedDocs = combinedDocuments.map((doc: any, index: number) => ({
          documentId: doc.id,
          selected: false,
          order: index + 1
        }));
        setSelectedDocuments(initialSelectedDocs);
        
        const selectedChecklist = (checklists as Checklist[]).find(c => c.id === selectedChecklistId);
        if (selectedChecklist) {
          setSelectedChecklistName(selectedChecklist.name);
          setIsChecklistSelected(true);
          setShowStandardChecklistModal(false);
          
          const totalDocs = combinedDocuments.length;
          const checklistDocsCount = checklistDocs.length;
          const additionalDocsCount = Array.isArray(additionalDocuments) ? additionalDocuments.length : 0;
          
          toast({
            title: "Success",
            description: `Checklist "${selectedChecklist.name}" loaded with ${totalDocs} documents (${checklistDocsCount} checklist + ${additionalDocsCount} additional)`
          });
        }
      } catch (error) {
        console.error('Error loading documents:', error);
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Please select a checklist",
        variant: "destructive"
      });
    }
  };

  // Tender data for the side panel  
  const tenderData = {
    tenderId: (tender as any)?.referenceNo || "2048",
    brief: (tender as any)?.brief || (tender as any)?.title || "work of package: all civil works of power intake, head race channel, pressure shafts & penstock, va & tail...",
    prebidDate: "16-Sep-2023",
    quantity: "12",
    dueDateSubmission: "30-Sep-2023",
    dueDateClarification: "25-Sep-2023",
    preQualificationCriteria: "Refer Document",
    mistake: "Click Here",
    documentFees: "Refer Document",
    contactMissingDetails: "Refer Document",
    estimatedCost: "Refer Document",
    siteLocation: "Hyderabad, Telangana",
    standardDocument: "Click To Download",
    briefValue: "Refer Document"
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => setLocation(`/tenders/${tenderId}`)}
                className="flex items-center space-x-2 w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tender Checklist</h1>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full sm:w-auto"
              onClick={() => setShowUploadResponseView(!showUploadResponseView)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {showUploadResponseView ? "Back to Check List" : "Upload Response"}
            </Button>
          </div>



          {/* Generated Tender Checklist Documents Table - Always at Top */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Generated Tender Checklist Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="border min-w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead 
                          className="font-semibold text-black text-center w-12 sm:w-16 cursor-pointer hover:bg-gray-200 text-xs sm:text-sm"
                          onClick={() => handleSort('index')}
                        >
                          # {sortField === 'index' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-black text-center cursor-pointer hover:bg-gray-200 text-xs sm:text-sm min-w-[150px]"
                          onClick={() => handleSort('responseName')}
                        >
                          <span className="hidden sm:inline">TENDER SUBMITTED RESPONSE NAME</span>
                          <span className="sm:hidden">RESPONSE NAME</span>
                          {sortField === 'responseName' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-black text-center cursor-pointer hover:bg-gray-200 text-xs sm:text-sm hidden sm:table-cell"
                          onClick={() => handleSort('responseType')}
                        >
                          RESPONSE TYPE NAME {sortField === 'responseType' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-black text-center cursor-pointer hover:bg-gray-200 text-xs sm:text-sm hidden md:table-cell"
                          onClick={() => handleSort('createdBy')}
                        >
                          CREATED BY {sortField === 'createdBy' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-black text-center cursor-pointer hover:bg-gray-200 text-xs sm:text-sm hidden lg:table-cell"
                          onClick={() => handleSort('createdAt')}
                        >
                          CREATED DATE & TIME {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-black text-center cursor-pointer hover:bg-gray-200"
                          onClick={() => handleSort('remarks')}
                        >
                          REMARKS {sortField === 'remarks' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="font-semibold text-black text-center">DOWNLOAD</TableHead>
                        <TableHead className="font-semibold text-black text-center">COMPRESS</TableHead>
                        <TableHead className="font-semibold text-black text-center w-16">ACTION</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedSubmittedResponses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                            No compiled documents found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedSubmittedResponses.map((response, index) => (
                          <TableRow key={response.id} className="border-b hover:bg-gray-50">
                            <TableCell className="text-center font-medium text-xs sm:text-sm">{index + 1}</TableCell>
                            <TableCell className="text-center text-blue-600 font-medium text-xs sm:text-sm min-w-[150px]">
                              <div className="truncate" title={response.responseName}>
                                {response.responseName}
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-xs sm:text-sm hidden sm:table-cell">{response.responseType}</TableCell>
                            <TableCell className="text-center text-xs sm:text-sm hidden md:table-cell">{response.createdByName}</TableCell>
                            <TableCell className="text-center text-xs text-gray-500 hidden lg:table-cell">{response.createdAt}</TableCell>
                            <TableCell className="text-center">{response.remarks}</TableCell>
                            <TableCell className="text-center">
                              <Button 
                                className={`${
                                  response.isCompressed 
                                    ? response.compressionType === 'extreme' 
                                      ? 'bg-red-600 hover:bg-red-700'
                                      : response.compressionType === 'recommended'
                                      ? 'bg-orange-600 hover:bg-orange-700'
                                      : response.compressionType === 'light'
                                      ? 'bg-yellow-600 hover:bg-yellow-700'
                                      : 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                } text-white text-xs px-3 py-1`}
                                onClick={() => handleDownloadClick(response.id)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                {response.isCompressed && response.compressedSize ? response.compressedSize : response.fileSize}
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <CompressButton responseId={response.id} responseName={response.responseName} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-6 w-6 p-0 border-red-300 hover:bg-red-50" 
                                title="Delete"
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this compiled document?')) {
                                    try {
                                      const deleteResponse = await fetch(`/api/tender-responses/${response.id}`, {
                                        method: 'DELETE',
                                      });

                                      if (!deleteResponse.ok) {
                                        throw new Error('Delete failed');
                                      }

                                      // Remove from local state
                                      setSubmittedResponses(prev => prev.filter(r => r.id !== response.id));

                                      toast({
                                        title: "Success",
                                        description: "Compiled document deleted successfully"
                                      });
                                    } catch (error) {
                                      console.error('Delete error:', error);
                                      toast({
                                        title: "Error",
                                        description: "Failed to delete compiled document",
                                        variant: "destructive"
                                      });
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conditional Content - Upload Response View or Checklist View */}
          {showUploadResponseView ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Upload Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {/* Response Name */}
                  <div className="space-y-2">
                    <Label htmlFor="responseName" className="text-sm font-medium">
                      Response Name *
                    </Label>
                    <Input
                      id="responseName"
                      placeholder="Response Name"
                      value={uploadResponseName}
                      onChange={(e) => setUploadResponseName(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Response Type */}
                  <div className="space-y-2">
                    <Label htmlFor="responseType" className="text-sm font-medium">
                      Response Type *
                    </Label>
                    <Select value={uploadResponseType} onValueChange={setUploadResponseType}>
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

                  {/* Select File */}
                  <div className="space-y-2">
                    <Label htmlFor="uploadFile" className="text-sm font-medium">
                      Select File *
                    </Label>
                    <Input
                      id="uploadFile"
                      type="file"
                      onChange={handleUploadFileChange}
                      className="w-full"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                    />
                    {uploadFile && (
                      <p className="text-sm text-gray-600">
                        Selected: {uploadFile.name}
                      </p>
                    )}
                  </div>

                  {/* Remarks */}
                  <div className="space-y-2">
                    <Label htmlFor="uploadRemarks" className="text-sm font-medium">
                      Remarks *
                    </Label>
                    <Textarea
                      id="uploadRemarks"
                      placeholder="Remarks"
                      value={uploadRemarks}
                      onChange={(e) => setUploadRemarks(e.target.value)}
                      className="w-full min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Sign and Stamp - Full width below the grid */}
                <div className="mt-6 space-y-2">
                  <Label htmlFor="uploadSignStamp" className="text-sm font-medium">
                    Sign and Stamp
                  </Label>
                  <Input
                    id="uploadSignStamp"
                    type="file"
                    onChange={handleUploadSignStampFileChange}
                    className="w-full max-w-md"
                    accept=".png,.jpg,.jpeg,.svg"
                  />
                  {uploadSignStampFile && (
                    <p className="text-sm text-gray-600">
                      Selected: {uploadSignStampFile.name}
                    </p>
                  )}
                  <p className="text-sm text-red-500">
                    Note: Only PNG, JPG, and SVG files are allowed in sign and stamp
                  </p>
                </div>

                {/* Include Index Checkbox */}
                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox
                    id="includeIndex"
                    checked={includeIndex}
                    onCheckedChange={(checked) => setIncludeIndex(checked === true)}
                  />
                  <Label htmlFor="includeIndex" className="text-sm">
                    Include Index
                  </Label>
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <Button
                    onClick={handleUploadResponseSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  >
                    Submit
                  </Button>
                </div>

                {/* Upload Response Table */}
                <div className="mt-8">
                  <div className="bg-blue-600 text-white px-2 sm:px-4 py-2 rounded-t-lg overflow-x-auto">
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-4 text-xs sm:text-sm font-bold min-w-[600px] sm:min-w-0">
                      <div>#</div>
                      <div className="col-span-2 sm:col-span-1">RESPONSE NAME</div>
                      <div className="hidden sm:block">RESPONSE TYPE</div>
                      <div className="hidden sm:block">CREATED DATE & TIME</div>
                      <div className="hidden md:block">REMARKS</div>
                      <div>DOWNLOAD</div>
                      <div className="hidden lg:block">ACTION</div>
                    </div>
                  </div>
                  <div className="border border-t-0 rounded-b-lg min-h-[100px] overflow-x-auto">
                    {submittedResponses.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No data found.
                      </div>
                    ) : (
                      submittedResponses.map((response, index) => (
                        <div key={response.id} className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-4 p-2 sm:p-3 text-xs sm:text-sm border-b last:border-b-0 min-w-[600px] sm:min-w-0">
                          <div className="font-medium">{index + 1}</div>
                          <div className="text-blue-600 col-span-2 sm:col-span-1 truncate" title={response.responseName}>{response.responseName}</div>
                          <div className="hidden sm:block">{response.responseType}</div>
                          <div className="text-xs text-gray-500">{response.createdAt}</div>
                          <div>{response.remarks}</div>
                          <div className="text-blue-600 cursor-pointer hover:underline">Download</div>
                          <div>{response.compressedFile}</div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0" title="Delete">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Prepare CheckList</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Show confirmation message when response is generated */}
                {showGeneratedConfirmation.show ? (
                  <div className="text-center py-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-lg mx-auto">
                      <h3 className="text-xl font-bold text-green-800 mb-3">Response Generated Successfully!</h3>
                      <div className="space-y-2 mb-4">
                        <p className="text-lg font-semibold text-gray-800">
                          File: <span className="text-green-700">{showGeneratedConfirmation.fileName}</span>
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          Size: <span className="text-green-700">{showGeneratedConfirmation.fileSize}</span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-base font-semibold w-full"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/tender-responses/${showGeneratedConfirmation.responseId}/download`);
                              if (!response.ok) throw new Error('Download failed');
                              
                              // Get filename from server response header
                              const contentDisposition = response.headers.get('Content-Disposition');
                              let filename = `${showGeneratedConfirmation.fileName}.pdf`; // fallback
                              
                              if (contentDisposition && contentDisposition.includes('filename=')) {
                                const matches = contentDisposition.match(/filename="([^"]+)"/);
                                if (matches && matches[1]) {
                                  filename = matches[1];
                                }
                              }
                              
                              const blob = await response.blob();
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = filename; // Use actual filename from server
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                              
                              toast({
                                title: "Success",
                                description: "File downloaded successfully"
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to download file",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          Download Generated File
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full text-gray-600 border-gray-300"
                          onClick={() => {
                            setShowGeneratedConfirmation({ show: false, fileName: '', fileSize: '', responseId: 0 });
                          }}
                        >
                          Generate Another Response
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Controls Section */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                      {/* Autocomplete Text Field for Checklist Selection */}
                      <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                        <Input
                          type="text"
                          placeholder="Search and select checklist..."
                          value={checklistSearchTerm}
                          onChange={(e) => {
                            setChecklistSearchTerm(e.target.value);
                            setShowChecklistDropdown(true);
                          }}
                          onFocus={() => setShowChecklistDropdown(true)}
                          className="px-3 py-2 pr-10 border border-gray-300 rounded-md bg-white text-sm w-full sm:min-w-[250px]"
                          disabled={checklistsLoading}
                        />
                        {checklistSearchTerm && (
                          <button
                            type="button"
                            onClick={() => {
                              setChecklistSearchTerm('');
                              setSelectedChecklistId(null);
                              setSelectedChecklistName('');
                              setIsChecklistSelected(false);
                              setChecklistDocuments([]);
                              setShowChecklistDropdown(false);
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* Dropdown for filtered results */}
                        {showChecklistDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {filteredChecklists.length > 0 ? (
                              filteredChecklists.map((checklist) => (
                                <div
                                  key={checklist.id}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                  onClick={async () => {
                                    setSelectedChecklistId(checklist.id);
                                    setSelectedChecklistName(checklist.name);
                                    setChecklistSearchTerm(checklist.name);
                                    setShowChecklistDropdown(false);
                                    
                                    // Load checklist documents with proper cache refresh
                                    try {
                                      // Invalidate cache to ensure fresh data
                                      queryClient.invalidateQueries({ 
                                        queryKey: ['/api/checklists', checklist.id, 'documents'] 
                                      });
                                      
                                      const response = await fetch(`/api/checklists/${checklist.id}/documents`);
                                      if (response.ok) {
                                        const documents = await response.json();
                                        setChecklistDocuments(documents);
                                        setIsChecklistSelected(true);
                                        
                                        toast({
                                          title: "Success",
                                          description: `Checklist "${checklist.name}" loaded successfully with ${documents.length} documents`
                                        });
                                      }
                                    } catch (error) {
                                      toast({
                                        title: "Error",
                                        description: "Failed to load checklist documents",
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                >
                                  {checklist.name}
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500">
                                No checklists found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
                      <Button 
                        className="btn-purple icon-btn w-full sm:w-auto"
                        onClick={generateResponses}
                        disabled={!isChecklistSelected}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Responses
                      </Button>

                      {selectedChecklistId && (
                        <Button 
                          className="bg-[#0076a8] hover:bg-[#005a7a] text-white text-sm w-full sm:w-auto"
                          onClick={() => setShowUncheckConfirmation(true)}
                        >
                          Unchecked
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents Table */}
                {isChecklistSelected && (
                  <Table className="border mb-4">
                    <TableHeader>
                      <TableRow className="bg-[#0076a8]">
                        <TableHead className="font-semibold text-white text-center w-16">#</TableHead>
                        <TableHead className="font-semibold text-white text-center">DOCUMENT NAME</TableHead>
                        <TableHead className="font-semibold text-white text-center w-24">VIEW</TableHead>
                        <TableHead className="font-semibold text-white text-center w-32">OPEN/DOWNLOAD</TableHead>
                        <TableHead className="h-12 px-4 align-middle hover:bg-gray-100 hover:text-gray-900 [&:has([role=checkbox])]:pr-0 font-semibold text-white text-center w-16 bg-[#666d80]">ACTION</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checklistDocuments.map((doc, index) => (
                        <React.Fragment key={doc.id}>
                          <TableRow>
                            <TableCell className="text-center">{index + 1}</TableCell>
                            <TableCell className="text-center">{doc.documentName}</TableCell>
                            <TableCell className="text-center">
                              <Button 
                                className="bg-[#0076a8] hover:bg-[#005a7a] text-white text-xs px-3 py-1"
                                onClick={() => handleView(doc.id)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button 
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                                onClick={async () => {
                                  try {
                                    // Download file with proper document name
                                    const response = await fetch(`/api/checklists/documents/${doc.id}/download`);
                                    if (response.ok) {
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.style.display = 'none';
                                      a.href = url;
                                      a.download = `${doc.documentName}.pdf`;
                                      document.body.appendChild(a);
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                      
                                      toast({
                                        title: "Success",
                                        description: `Downloaded ${doc.documentName}.pdf`
                                      });
                                    } else {
                                      throw new Error('Download failed');
                                    }
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to download document",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Open
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button 
                                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
                                onClick={() => handleDelete(doc.id)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                          
                          {/* PDF Thumbnail Preview Row */}
                          {viewingDocumentId === doc.id && pdfThumbnails.length > 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="bg-gray-50 p-4">
                                <div className="flex justify-center space-x-4">
                                  <div className="text-sm font-medium text-gray-700 mb-2">PDF Preview - First 3 Pages:</div>
                                </div>
                                <div className="flex justify-center space-x-4 mt-2">
                                  {pdfThumbnails.map((thumbnail, thumbIndex) => (
                                    <div key={thumbIndex} className="flex flex-col items-center">
                                      <div className="w-32 h-40 bg-white border-2 border-gray-300 rounded-lg shadow-md flex items-center justify-center">
                                        <div className="text-gray-500 text-xs">Page {thumbIndex + 1}</div>
                                      </div>
                                      <span className="text-xs text-gray-600 mt-1">Page {thumbIndex + 1}</span>
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                      
                      {checklistDocuments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            {!isChecklistSelected 
                              ? "Search and select a checklist to view documents" 
                              : "No documents found in this checklist"
                            }
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {/* Add More Documents Button */}
                <div className="flex justify-center mt-6 mb-6">
                  <Button 
                    className="btn-purple"
                    onClick={() => setShowAddDocumentForm(!showAddDocumentForm)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add More Documents
                  </Button>
                </div>

                {/* Add Document Form */}
                {showAddDocumentForm && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Add New Document to Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newDocumentName" className="text-sm font-medium">Document Name *</Label>
                          <Input
                            id="newDocumentName"
                            placeholder="Enter document name"
                            value={newDocumentName}
                            onChange={(e) => setNewDocumentName(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newDocumentFile" className="text-sm font-medium">Upload PDF *</Label>
                          <Input
                            id="newDocumentFile"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setNewDocumentFile(e.target.files?.[0] || null)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="newDocumentRemarks" className="text-sm font-medium">Remarks</Label>
                        <Textarea
                          id="newDocumentRemarks"
                          placeholder="Enter remarks"
                          value={newDocumentRemarks}
                          onChange={(e) => setNewDocumentRemarks(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-3 mt-4">
                        <Button variant="outline" onClick={() => setShowAddDocumentForm(false)}>
                          Cancel
                        </Button>
                        <Button 
                          className="btn-purple"
                          onClick={async () => {
                            if (newDocumentName.trim() && newDocumentFile) {
                              try {
                                // Upload the file to server first
                                const formData = new FormData();
                                formData.append('file', newDocumentFile);
                                formData.append('name', newDocumentName.trim());
                                formData.append('createdBy', '2'); // Current user ID

                                const uploadResponse = await fetch('/api/files', {
                                  method: 'POST',
                                  body: formData
                                });

                                if (!uploadResponse.ok) {
                                  throw new Error('Failed to upload file');
                                }

                                const uploadedFile = await uploadResponse.json();
                                
                                // Create document with actual file ID from database
                                const newDoc = {
                                  id: uploadedFile.id, // Use actual database ID
                                  documentName: newDocumentName.trim(),
                                  fileName: newDocumentFile.name,
                                  remarks: newDocumentRemarks.trim() || "No remarks",
                                  addedAt: new Date().toLocaleString(),
                                  fileId: uploadedFile.id, // Store the file ID for later use
                                  filePath: uploadedFile.filePath
                                };
                                
                                setAddedDocuments(prev => [...prev, newDoc]);
                                
                                toast({
                                  title: "Success",
                                  description: "Document uploaded and added successfully"
                                });
                                
                                setShowAddDocumentForm(false);
                                setNewDocumentName("");
                                setNewDocumentFile(null);
                                setNewDocumentRemarks("");
                              } catch (error) {
                                console.error('Error uploading document:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to upload document. Please try again.",
                                  variant: "destructive"
                                });
                              }
                            } else {
                              toast({
                                title: "Error",
                                description: "Please fill in document name and select a file",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          Attach
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* PDF Preview Section */}
                {Object.keys(pdfPreviews).length > 0 && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Document Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Object.entries(pdfPreviews).map(([docId, pages]) => (
                        <div key={docId} className="mb-4">
                          <h4 className="font-medium mb-2">Preview - First 3 Pages</h4>
                          <div className="grid grid-cols-3 gap-4">
                            {pages.slice(0, 3).map((pageUrl, index) => (
                              <div key={index} className="border rounded">
                                <img 
                                  src={pageUrl} 
                                  alt={`Page ${index + 1}`}
                                  className="w-full h-32 object-cover rounded"
                                />
                                <p className="text-xs text-gray-500 text-center p-1">Page {index + 1}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Added Documents Section */}
                {addedDocuments.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Additional Documents</h3>
                    <Table className="border">
                      <TableHeader>
                        <TableRow className="bg-[#0076a8]">
                          <TableHead className="font-semibold text-white text-center w-16">#</TableHead>
                          <TableHead className="font-semibold text-white text-center">DOCUMENT NAME</TableHead>
                          <TableHead className="font-semibold text-white text-center w-24">VIEW</TableHead>
                          <TableHead className="font-semibold text-white text-center w-32">OPEN/DOWNLOAD</TableHead>
                          <TableHead className="font-semibold text-white text-center w-16 bg-[#666d80]">ACTION</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {addedDocuments.map((doc, index) => (
                          <React.Fragment key={doc.id}>
                            <TableRow>
                              <TableCell className="text-center">{checklistDocuments.length + index + 1}</TableCell>
                              <TableCell className="text-center">{doc.documentName}</TableCell>
                              <TableCell className="text-center">
                                <Button 
                                  className="bg-[#0076a8] hover:bg-[#005a7a] text-white text-xs px-3 py-1"
                                  onClick={() => handleView(doc.id)}
                                >
                                  {viewingDocumentId === doc.id ? "Hide" : "View"}
                                </Button>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button 
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                                  onClick={async () => {
                                    try {
                                      // Use the standard file download endpoint since we now have actual file IDs
                                      const response = await fetch(`/api/files/${doc.id}/download`);
                                      if (!response.ok) throw new Error('Download failed');
                                      
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.style.display = 'none';
                                      a.href = url;
                                      a.download = doc.fileName || doc.documentName;
                                      document.body.appendChild(a);
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                      document.body.removeChild(a);
                                      
                                      toast({
                                        title: "Success",
                                        description: `Downloaded ${doc.fileName || doc.documentName}`
                                      });
                                    } catch (error) {
                                      console.error('Download error:', error);
                                      toast({
                                        title: "Error",
                                        description: "Failed to download document",
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Open
                                </Button>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button 
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
                                  onClick={() => {
                                    setAddedDocuments(prev => prev.filter(d => d.id !== doc.id));
                                    toast({
                                      title: "Document Removed",
                                      description: `${doc.documentName} has been removed`
                                    });
                                  }}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                            
                            {/* PDF Thumbnail Preview Row for Added Documents */}
                            {viewingDocumentId === doc.id && pdfThumbnails.length > 0 && (
                              <TableRow>
                                <TableCell colSpan={5} className="bg-gray-50 p-4">
                                  <div className="flex justify-center space-x-4">
                                    <div className="text-sm font-medium text-gray-700 mb-2">PDF Preview - First 3 Pages:</div>
                                  </div>
                                  <div className="flex justify-center space-x-4 mt-2">
                                    {pdfThumbnails.map((thumbnail, thumbIndex) => (
                                      <div key={thumbIndex} className="flex flex-col items-center">
                                        <div className="w-32 h-40 bg-white border-2 border-gray-300 rounded-lg shadow-md flex items-center justify-center">
                                          <div className="text-gray-500 text-xs">Page {thumbIndex + 1}</div>
                                        </div>
                                        <span className="text-xs text-gray-600 mt-1">Page {thumbIndex + 1}</span>
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side Panel with Structured Table Format */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <div className="space-y-4">
            <div className="text-right">
              <span className="text-sm text-gray-600">TenderID: </span>
              <span className="font-medium">{tenderData.tenderId}</span>
            </div>
            
            {/* Brief Section as Structured Table */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Brief</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 font-medium bg-gray-100">Description</td>
                      <td className="px-3 py-2">{tenderData.brief}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 font-medium bg-gray-100">Pre-bid Date</td>
                      <td className="px-3 py-2">{tenderData.prebidDate}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 font-medium bg-gray-100">Quantity</td>
                      <td className="px-3 py-2">{tenderData.quantity}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 font-medium bg-gray-100">Due Date Submission</td>
                      <td className="px-3 py-2">{tenderData.dueDateSubmission}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 font-medium bg-gray-100">Due Date Clarification</td>
                      <td className="px-3 py-2">{tenderData.dueDateClarification}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 font-medium bg-gray-100">Pre-Qualification Criteria</td>
                      <td className="px-3 py-2">{tenderData.preQualificationCriteria}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 font-medium bg-gray-100">Tender Document</td>
                      <td className="px-3 py-2">
                        <Button 
                          variant="link" 
                          className="text-blue-600 underline cursor-pointer hover:text-blue-800 p-0 h-auto"
                          onClick={() => window.open('/api/tender-documents/download', '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Click To Download
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 font-medium bg-gray-100">Technical Specifications</td>
                      <td className="px-3 py-2">
                        <Button 
                          variant="link" 
                          className="text-blue-600 underline cursor-pointer hover:text-blue-800 p-0 h-auto"
                          onClick={() => window.open('/api/tender-documents/technical/download', '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download Technical Specs
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 font-medium bg-gray-100">ATC (Additional Terms)</td>
                      <td className="px-3 py-2">
                        <Button 
                          variant="link" 
                          className="text-blue-600 underline cursor-pointer hover:text-blue-800 p-0 h-auto"
                          onClick={() => window.open('/api/tender-documents/atc/download', '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download ATC
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium bg-gray-100">Brief Value</td>
                      <td className="px-3 py-2">{tenderData.briefValue}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standard Checklist Modal */}
      <Dialog open={showStandardChecklistModal} onOpenChange={setShowStandardChecklistModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium text-white bg-[#0076a8] px-4 py-2 rounded">
                Standard Checklist
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStandardChecklistModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Select any check List</h3>
            
            {checklistsLoading ? (
              <div className="text-center py-4">Loading checklists...</div>
            ) : (
              <RadioGroup 
                value={selectedChecklistId?.toString() || ""} 
                onValueChange={(value) => setSelectedChecklistId(parseInt(value))}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-4">
                  {(checklists as Checklist[]).map((checklist) => (
                    <div key={checklist.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={checklist.id.toString()} id={`checklist-${checklist.id}`} />
                      <Label htmlFor={`checklist-${checklist.id}`} className="text-sm">
                        {checklist.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
            
            <div className="flex items-center mt-6 mb-4">
              <input type="checkbox" id="cannot-change" className="mr-2" />
              <Label htmlFor="cannot-change" className="text-sm text-gray-600">
                Once selected, this option cannot be changed.
              </Label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowStandardChecklistModal(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-[#0076a8] hover:bg-[#005a7a] text-white"
                onClick={handleStandardChecklistSubmit}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium text-white bg-blue-600 px-4 py-2 rounded">
                Delete Confirmation
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="p-4">
            <p className="text-center mb-6">Are you sure you want to delete?</p>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteDocumentMutation.isPending}
              >
                {deleteDocumentMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prepare Checklist Modal - Generate Response */}
      <Dialog open={showPrepareChecklistModal} onOpenChange={(open) => {
        if (!open) {
          // When closing modal, restore original documents and clear temporary states
          setChecklistDocuments(originalChecklistDocuments);
          setTempRemovedDocuments(new Set());
          setSelectedDocuments([]);
        }
        setShowPrepareChecklistModal(open);
      }}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Prepare CheckList</DialogTitle>
          </DialogHeader>
          
          <div className="p-6">
            {/* Tender ID and Index Start From */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                TenderID: <span className="font-medium">{tender && typeof tender === 'object' && 'referenceNo' in tender ? (tender as any).referenceNo : `Tender-${tenderId}`}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Index Start from:</span>
                <Input
                  type="number"
                  value="1"
                  className="w-20 h-8 text-center border"
                  readOnly
                />
              </div>
            </div>

            {/* Documents Table */}
            <div className="border rounded-lg mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left border-b">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={(checked) => {
                          setSelectAll(checked as boolean);
                          setSelectedDocuments(prev => 
                            prev.map(doc => ({ ...doc, selected: checked as boolean }))
                          );
                        }}
                      />
                    </th>
                    <th className="p-3 text-left border-b font-medium">DOCUMENT NAME</th>
                    <th className="p-3 text-left border-b font-medium">ORDER BY</th>
                    <th className="p-3 text-left border-b font-medium">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {checklistDocuments
                    .filter(doc => !tempRemovedDocuments.has(doc.id))
                    .map((doc, index) => (
                    <tr key={doc.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedDocuments.find(d => d.documentId === doc.id)?.selected || false}
                          onCheckedChange={(checked) => {
                            setSelectedDocuments(prev => 
                              prev.map(d => 
                                d.documentId === doc.id 
                                  ? { ...d, selected: checked as boolean }
                                  : d
                              )
                            );
                          }}
                        />
                      </td>
                      <td className="p-3">
                        {doc.documentName}
                        {(doc as any).isAdditionalDocument && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Additional
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={selectedDocuments.find(d => d.documentId === doc.id)?.order || index + 1}
                          onChange={(e) => {
                            const newOrder = parseInt(e.target.value) || index + 1;
                            setSelectedDocuments(prev => 
                              prev.map(d => 
                                d.documentId === doc.id 
                                  ? { ...d, order: newOrder }
                                  : d
                              )
                            );
                          }}
                          className="w-16 text-center"
                          min="1"
                        />
                      </td>
                      <td className="p-3 flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(doc.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTempRemovedDocuments(prev => new Set(prev).add(doc.id));
                            setSelectedDocuments(prev => prev.filter(d => d.documentId !== doc.id));
                            toast({
                              title: "Document Removed",
                              description: `${doc.documentName} has been temporarily removed from this process`
                            });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Download File Button */}
            <div className="mb-6">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                onClick={async () => {
                  const selectedDocs = selectedDocuments.filter(d => d.selected);
                  if (selectedDocs.length === 0) {
                    toast({
                      title: "Error",
                      description: "Please select at least one document",
                      variant: "destructive"
                    });
                    return;
                  }

                  try {
                    // Create download request for selected documents
                    const response = await fetch('/api/generate-checklist-response', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        tenderId: tenderId,
                        checklistId: selectedChecklistId,
                        selectedDocuments: selectedDocs,
                        responseName: responseName || 'Generated Response',
                        responseType: responseType || 'Technical'
                      }),
                    });

                    if (response.ok) {
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = `${tenderId || 'Tender'}_Response.zip`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      
                      toast({
                        title: "Success",
                        description: "Checklist response downloaded successfully"
                      });
                    } else {
                      throw new Error('Download failed');
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to download checklist response",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="responseName" className="text-sm font-medium">
                  Response Name *
                </Label>
                <Input
                  id="responseName"
                  placeholder="Response Name"
                  value={responseName}
                  onChange={(e) => setResponseName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="responseType" className="text-sm font-medium">
                  Response Type *
                </Label>
                <Select value={responseType} onValueChange={setResponseType}>
                  <SelectTrigger className="mt-1">
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
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="remarks" className="text-sm font-medium">
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  placeholder="Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="signStamp" className="text-sm font-medium">
                  Sign and Stamp
                </Label>
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".png,.jpg,.svg"
                    onChange={(e) => setSignStampFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="signStampUpload"
                  />
                  <label htmlFor="signStampUpload" className="cursor-pointer">
                    <div className="text-sm text-gray-600">
                      {signStampFile ? signStampFile.name : "Choose File"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      No file chosen
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Include Index Checkbox */}
            <div className="flex items-center space-x-2 mb-6">
              <Checkbox
                id="includeIndex"
                checked={includeIndex}
                onCheckedChange={(checked) => setIncludeIndex(checked as boolean)}
              />
              <Label htmlFor="includeIndex" className="text-sm">
                Include Index
              </Label>
            </div>

            <div className="text-xs text-gray-500 mb-6">
              Note: Only PNG, JPG, and SVG files are allowed in sign and stamp.
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mb-6">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                disabled={isSubmitting}
                onClick={async () => {
                  if (!responseName.trim() || !responseType) {
                    toast({
                      title: "Error",
                      description: "Please fill in all required fields",
                      variant: "destructive"
                    });
                    return;
                  }

                  const selectedDocs = selectedDocuments.filter(d => d.selected);
                  if (selectedDocs.length === 0) {
                    toast({
                      title: "Error",
                      description: "Please select at least one document",
                      variant: "destructive"
                    });
                    return;
                  }

                  setIsSubmitting(true);

                  try {
                    // Submit the response to database
                    const formData = new FormData();
                    formData.append('tenderId', tenderId!);
                    formData.append('checklistId', selectedChecklistId?.toString() || '');
                    formData.append('responseName', responseName.trim());
                    formData.append('responseType', responseType);
                    formData.append('remarks', remarks.trim());
                    formData.append('includeIndex', includeIndex.toString());
                    formData.append('indexStartFrom', '1');
                    formData.append('selectedDocuments', JSON.stringify(selectedDocs));
                    
                    // Get current user ID for createdBy
                    const storedUser = localStorage.getItem('startender_user');
                    const currentUser = storedUser ? JSON.parse(storedUser) : null;
                    formData.append('createdBy', currentUser?.id?.toString() || '2');
                    
                    if (signStampFile) {
                      formData.append('signStampFile', signStampFile);
                    }

                    // Add authentication headers
                    const token = localStorage.getItem('token');
                    
                    const headers: HeadersInit = {};
                    
                    if (token) {
                      headers.Authorization = `Bearer ${token}`;
                    }
                    
                    if (currentUser?.id) {
                      headers['x-user-id'] = currentUser.id.toString();
                    }

                    const response = await fetch('/api/tender-responses', {
                      method: 'POST',
                      headers,
                      body: formData
                    });

                    if (response.ok) {
                      const savedResponse = await response.json();
                      
                      // Add to submitted responses
                      const newResponse = {
                        id: savedResponse.id || Date.now(),
                        responseName: responseName.trim(),
                        responseType: responseType,
                        createdAt: new Date().toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).replace(/,/g, ''),
                        remarks: remarks.trim(),
                        fileSize: `${(Math.random() * 2 + 0.5).toFixed(3)} MB`,
                        compressedFile: "No Compress",
                        createdBy: currentUser?.id || 2,
                        createdByName: currentUser?.name || "Unknown User"
                      };

                      setSubmittedResponses(prev => [...prev, newResponse]);
                      
                      // Refetch responses to ensure table is updated
                      refetchResponses();
                      
                      // Also invalidate the query cache to ensure fresh data
                      queryClient.invalidateQueries({ 
                        queryKey: [`/api/tender-responses/${tenderId}`] 
                      });
                      queryClient.invalidateQueries({ 
                        queryKey: [`/api/tender-responses`] 
                      });
                      
                      toast({
                        title: "Success",
                        description: "Response submitted successfully"
                      });

                      // Reset form and close modal
                      setResponseName("");
                      setResponseType("");
                      setRemarks("");
                      setSignStampFile(null);
                      setIncludeIndex(false);
                      setSelectedDocuments(prev => prev.map(doc => ({ ...doc, selected: false })));
                      setShowPrepareChecklistModal(false);
                      
                      // Show confirmation message with generated file details
                      setShowGeneratedConfirmation({
                        show: true,
                        fileName: savedResponse.responseName || responseName.trim(),
                        fileSize: savedResponse.fileSize || `${(Math.random() * 2 + 0.5).toFixed(3)} MB`,
                        responseId: savedResponse.id
                      });
                    } else {
                      throw new Error('Submit failed');
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to submit response",
                      variant: "destructive"
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? "Generating..." : "Submit"}
              </Button>
            </div>

            {/* Submitted Responses Table */}
            <div className="bg-white rounded-lg border">
              <div className="bg-[#17a2b8] text-white p-3 rounded-t-lg">
                <div className="grid grid-cols-7 gap-4 text-sm font-medium">
                  <div>TENDER SUBMITTED RESPONSE NAME</div>
                  <div>RESPONSE TYPE NAME</div>
                  <div>CREATED BY</div>
                  <div>CREATED DATE & TIME</div>
                  <div>REMARKS</div>
                  <div>DOWNLOAD</div>
                  <div>ACTION</div>
                </div>
              </div>
              <div className="p-4">
                {submittedResponses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No data found.</div>
                ) : (
                  <div className="space-y-2">
                    {submittedResponses.map((response, index) => (
                      <div key={response.id} className="grid grid-cols-7 gap-4 py-2 border-b text-sm">
                        <div>{response.responseName}</div>
                        <div>{response.responseType}</div>
                        <div>{response.createdByName}</div>
                        <div>{response.createdAt}</div>
                        <div>{response.remarks}</div>
                        <div>
                          <Button
                            variant="link"
                            className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                            onClick={async () => {
                              try {
                                // Generate and download PDF with bid number at top
                                const downloadResponse = await fetch('/api/generate-checklist-response', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    tenderId: tenderId,
                                    checklistId: selectedChecklistId,
                                    selectedDocuments: selectedDocuments.filter(d => d.selected),
                                    responseName: response.responseName,
                                    responseType: response.responseType,
                                    compiledFile: true,
                                    bidNumber: `BID-${tenderId}-${Date.now()}`
                                  }),
                                });

                                if (downloadResponse.ok) {
                                  const blob = await downloadResponse.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.style.display = 'none';
                                  a.href = url;
                                  a.download = `BID-${tenderId}-${response.responseName}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  
                                  toast({
                                    title: "Success",
                                    description: "Compiled response downloaded successfully"
                                  });
                                } else {
                                  throw new Error('Download failed');
                                }
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to download compiled response",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            {response.fileSize}
                          </Button>
                        </div>
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSubmittedResponses(prev => prev.filter(r => r.id !== response.id));
                              toast({
                                title: "Success",
                                description: "Response deleted successfully"
                              });
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Uncheck Confirmation Modal */}
      <Dialog open={showUncheckConfirmation} onOpenChange={setShowUncheckConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium text-white bg-blue-600 px-4 py-2 rounded">
                Uncheck Confirmation
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUncheckConfirmation(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="p-4">
            <p className="text-center mb-6">Are you sure you want to delete all files permanently once you add using standard checklist?</p>
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowUncheckConfirmation(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  setShowUncheckConfirmation(false);
                  // Cancel/deselect checklist from tender page (temporary removal)
                  setSelectedChecklistId(null);
                  setSelectedChecklistName("");
                  setIsChecklistSelected(false);
                  setChecklistDocuments([]);
                  toast({
                    title: "Success",
                    description: "Checklist cancelled from tender page"
                  });
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium">
                Document Preview: {previewDocument?.name}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {previewDocument && (
              <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
                <iframe
                  src={previewDocument.url}
                  className="w-full h-full"
                  title={`Preview of ${previewDocument.name}`}
                  onError={() => {
                    toast({
                      title: "Error",
                      description: "Failed to load document preview",
                      variant: "destructive"
                    });
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={async () => {
                if (previewDocument) {
                  try {
                    const response = await fetch(previewDocument.url);
                    if (response.ok) {
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = `${previewDocument.name}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      
                      toast({
                        title: "Success",
                        description: `Downloaded ${previewDocument.name}.pdf`
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to download document",
                      variant: "destructive"
                    });
                  }
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={() => setShowPreviewModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compression Options Dialog */}
      <Dialog open={showCompressionOptions} onOpenChange={setShowCompressionOptions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Compression Level</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div 
              className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => handleCompressionOption('extreme')}
            >
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <div className="font-medium">Extreme Compression</div>
                <div className="text-sm text-gray-500">Less quality, high compression</div>
              </div>
            </div>
            
            <div 
              className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => handleCompressionOption('recommended')}
            >
              <Settings className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Recommended Compression</div>
                <div className="text-sm text-gray-500">Good quality, good compression</div>
              </div>
            </div>
            
            <div 
              className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => handleCompressionOption('light')}
            >
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Less compression</div>
                <div className="text-sm text-gray-500">High quality, less compression</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compression Progress Dialog */}
      <Dialog open={showCompressionProgress} onOpenChange={setShowCompressionProgress}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              {compressionComplete ? "PDFs have been compressed!" : "Compressing PDF..."}
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-6">
            {!compressionComplete ? (
              <>
                {/* Progress Circle */}
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-8 border-gray-200 rounded-full"></div>
                  <div 
                    className="absolute inset-0 border-8 border-red-500 rounded-full border-t-transparent transform -rotate-90 transition-all duration-300"
                    style={{
                      background: `conic-gradient(from 0deg, #ef4444 ${compressionProgress * 3.6}deg, transparent ${compressionProgress * 3.6}deg)`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(compressionProgress)}%</div>
                      <div className="text-xs text-gray-500">SAVED</div>
                    </div>
                  </div>
                </div>
                <div className="text-gray-600">Please wait while we compress your PDF...</div>
              </>
            ) : (
              <>
                {/* Completion UI */}
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-8 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-8 border-red-500 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {compressionResults?.compressionPercent || 0}%
                      </div>
                      <div className="text-xs text-gray-500">SAVED</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-lg font-medium">
                    Your PDF are now {compressionResults?.compressionPercent || 0}% smaller!
                  </div>
                  <div className="text-sm text-gray-600">
                    {compressionResults?.originalSize || "0 MB"} → {compressionResults?.compressedSize || "0 MB"}
                  </div>
                </div>
                
                <Button 
                  onClick={handleDownloadCompressed}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download compressed PDF
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Download Options Popup */}
      <Dialog open={showDownloadPopup} onOpenChange={setShowDownloadPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Choose which version of the document you want to download:
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  handleDownloadOriginal();
                  setShowDownloadPopup(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Original File ({compressionResults?.originalSize || sortedSubmittedResponses.find(r => r.id === selectedResponseForCompression)?.fileSize || 'N/A'})
              </Button>
              
              {compressionResults && (
                <Button 
                  onClick={() => {
                    handleDownloadCompressed();
                    setShowDownloadPopup(false);
                  }}
                  className={`w-full text-white py-3 ${
                    compressionResults.compressionType === 'extreme' 
                      ? 'bg-red-600 hover:bg-red-700'
                      : compressionResults.compressionType === 'recommended'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : compressionResults.compressionType === 'light'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Compressed File ({compressionResults.compressedSize}) - {compressionResults.compressionPercent}% smaller
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
