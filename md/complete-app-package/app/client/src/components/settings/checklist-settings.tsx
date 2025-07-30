import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusCircle, Pencil, Trash2, FileText, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/user-context";

interface Checklist {
  id: number;
  name: string;
  createdBy: string;
  createdAt: string;
}

interface ChecklistDocument {
  id: number;
  checklistId: number;
  documentName: string;
  fileId?: number;
  filePath?: string;
  fileName?: string;
  fileType?: string;
  createdBy: string;
  createdAt: string;
}

interface BriefcaseFile {
  id: number;
  name: string;
  originalName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  folderId: number;
  createdBy: string;
  createdAt: string;
}

export function CheckListSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useUser();
  
  // State for dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  
  // State for forms
  const [newChecklistName, setNewChecklistName] = useState("");
  const [editChecklistName, setEditChecklistName] = useState("");
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  
  // State for document form
  const [documentName, setDocumentName] = useState("");
  const [selectedFileId, setSelectedFileId] = useState("");
  const [uploadFile, setUploadFile] = useState<globalThis.File | null>(null);
  const [documentSource, setDocumentSource] = useState<"briefcase" | "upload">("briefcase");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState("");
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);
  const folderDropdownRef = useRef<HTMLDivElement>(null);
  
  // State for viewing documents
  const [viewingChecklistId, setViewingChecklistId] = useState<number | null>(null);
  const [isDocumentViewOpen, setIsDocumentViewOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Document pagination state
  const [docCurrentPage, setDocCurrentPage] = useState(1);
  const [docItemsPerPage, setDocItemsPerPage] = useState(10);

  // Fetch checklists
  const { data: checklists = [], isLoading: checklistsLoading } = useQuery({
    queryKey: ["/api/checklists"],
    queryFn: async () => {
      const response = await apiRequest("/api/checklists", { method: "GET" });
      const data = await response.json();
      console.log("Checklists data:", data);
      return data;
    },
  });

  // Fetch files from files table (uploaded from document briefcase)
  const { data: files = [] } = useQuery({
    queryKey: ["/api/files"],
    queryFn: async () => {
      const response = await apiRequest("/api/files", { method: "GET" });
      const data = await response.json();
      console.log("Files table data:", data);
      return data;
    },
  });

  // Fetch folders
  const { data: folders = [] } = useQuery({
    queryKey: ["/api/folders"],
    queryFn: async () => {
      const response = await apiRequest("/api/folders", { method: "GET" });
      const data = await response.json();
      console.log("Folders data:", data);
      // Filter out any invalid entries and ensure unique ids
      const validFolders = data.filter((folder: any) => 
        folder && folder.id && folder.name && typeof folder.id === 'number'
      );
      console.log("Valid folders:", validFolders);
      return validFolders;
    },
  });

  // Filter files based on search term
  const filteredFiles = files.filter((file: BriefcaseFile) => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter folders based on search term for autocomplete
  const filteredFolders = folders.filter((folder: any) => 
    folder && folder.name && folder.name.toLowerCase().includes(selectedFolderName.toLowerCase())
  );

  // Click outside handler for folder dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (folderDropdownRef.current && !folderDropdownRef.current.contains(event.target as Node)) {
        setIsFolderDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper function to handle file selection
  const handleFileSelect = (file: BriefcaseFile) => {
    setSelectedFileId(file.id.toString());
    setSelectedFileName(file.name);
    setIsDropdownOpen(false);
    setSearchTerm("");
    // Clear uploaded file when selecting from briefcase
    setUploadFile(null);
    setDocumentSource("briefcase");
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Helper function to clear selected file
  const clearSelectedFile = () => {
    setSelectedFileId("");
    setSelectedFileName("");
    setSearchTerm("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest('.document-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Fetch checklist documents
  const { data: checklistDocuments = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/checklists", viewingChecklistId, "documents"],
    queryFn: async () => {
      if (!viewingChecklistId) return [];
      const response = await apiRequest(`/api/checklists/${viewingChecklistId}/documents`, { method: "GET" });
      return response.json();
    },
    enabled: !!viewingChecklistId,
  });

  // Pagination calculations
  const totalItems = checklists.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentChecklists = checklists.slice(startIndex, endIndex);
  
  // Document pagination calculations
  const docTotalItems = checklistDocuments.length;
  const docTotalPages = Math.ceil(docTotalItems / docItemsPerPage);
  const docStartIndex = (docCurrentPage - 1) * docItemsPerPage;
  const docEndIndex = docStartIndex + docItemsPerPage;
  const currentDocuments = checklistDocuments.slice(docStartIndex, docEndIndex);

  // Reset current page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [checklists.length]);
  
  // Reset document pagination when viewing different checklist
  useEffect(() => {
    setDocCurrentPage(1);
  }, [viewingChecklistId, checklistDocuments.length]);

  // Create checklist mutation
  const createChecklistMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("/api/checklists", { method: "POST", body: JSON.stringify({ name }) });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
      setIsAddOpen(false);
      setNewChecklistName("");
      toast({
        title: "Success",
        description: "Checklist created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create checklist",
        variant: "destructive",
      });
    },
  });

  // Update checklist mutation
  const updateChecklistMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await apiRequest(`/api/checklists/${id}`, { method: "PUT", body: JSON.stringify({ name }) });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
      setIsEditOpen(false);
      setEditChecklistName("");
      setSelectedChecklist(null);
      toast({
        title: "Success",
        description: "Checklist updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update checklist",
        variant: "destructive",
      });
    },
  });

  // Delete checklist mutation
  const deleteChecklistMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/checklists/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
      setIsDeleteOpen(false);
      setSelectedChecklist(null);
      toast({
        title: "Success",
        description: "Checklist deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete checklist",
        variant: "destructive",
      });
    },
  });

  // Add document to checklist mutation
  const addDocumentMutation = useMutation({
    mutationFn: async (data: { checklistId: number; documentName: string; fileId?: number; file?: globalThis.File; folderId?: number }) => {
      const formData = new FormData();
      formData.append("checklistId", data.checklistId.toString());
      formData.append("documentName", data.documentName);
      if (data.fileId) {
        formData.append("fileId", data.fileId.toString());
      }
      if (data.file) {
        formData.append("file", data.file);
      }
      if (data.folderId) {
        formData.append("folderId", data.folderId.toString());
      }
      
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : null;
      const response = await fetch(`/api/checklists/documents`, {
        method: "POST",
        headers: {
          'x-user-id': userId?.toString() || '',
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to add document");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/checklists", viewingChecklistId, "documents"] });
      // Don't close the dialog, just reset the form fields
      resetDocumentFormFields();
      toast({
        title: "Success",
        description: "Document added to checklist successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add document to checklist",
        variant: "destructive",
      });
    },
  });

  const resetDocumentForm = () => {
    setDocumentName("");
    setSelectedFileId("");
    setUploadFile(null);
    setDocumentSource("briefcase");
    setSelectedChecklist(null);
    setSearchTerm("");
    setSelectedFileName("");
    setSelectedFolderId(null);
    setSelectedFolderName("");
    setIsDropdownOpen(false);
    setIsFolderDropdownOpen(false);
  };

  const resetDocumentFormFields = () => {
    setDocumentName("");
    setSelectedFileId("");
    setUploadFile(null);
    setDocumentSource("briefcase");
    setSearchTerm("");
    setSelectedFileName("");
    setSelectedFolderId(null);
    setSelectedFolderName("");
    setIsDropdownOpen(false);
    setIsFolderDropdownOpen(false);
    // Don't reset selectedChecklist to keep dialog open
  };

  const handleCreateChecklist = () => {
    if (!newChecklistName.trim()) {
      toast({
        title: "Error",
        description: "Checklist name is required",
        variant: "destructive",
      });
      return;
    }
    createChecklistMutation.mutate(newChecklistName.trim());
  };

  const handleEditChecklist = (checklist: Checklist) => {
    try {
      if (!checklist || !checklist.id || !checklist.name) {
        toast({
          title: "Error",
          description: "Invalid checklist data",
          variant: "destructive",
        });
        return;
      }
      setSelectedChecklist(checklist);
      setEditChecklistName(checklist.name);
      setIsEditOpen(true);
    } catch (error) {
      console.error('Edit checklist error:', error);
      toast({
        title: "Error",
        description: "Failed to open edit dialog",
        variant: "destructive",
      });
    }
  };

  const handleUpdateChecklist = () => {
    if (!selectedChecklist || !editChecklistName.trim()) {
      toast({
        title: "Error",
        description: "Checklist name is required",
        variant: "destructive",
      });
      return;
    }
    updateChecklistMutation.mutate({
      id: selectedChecklist.id,
      name: editChecklistName.trim(),
    });
  };

  const handleDeleteChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedChecklist) {
      deleteChecklistMutation.mutate(selectedChecklist.id);
    }
  };

  const handleAddDocument = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setViewingChecklistId(checklist.id);
    setIsAddDocumentOpen(true);
  };

  // Delete checklist document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await apiRequest(`/api/checklists/documents/${documentId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists", viewingChecklistId, "documents"] });
      toast({
        title: "Success",
        description: "Document removed from checklist successfully",
      });
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to remove document",
        variant: "destructive",
      });
    },
  });

  // Download document function
  const handleDownloadDocument = async (doc: ChecklistDocument) => {
    try {
      let downloadUrl = '';
      let fileName = doc.documentName;
      
      if (doc.fileId) {
        // Download from briefcase file - find the file details
        const briefcaseFile = files.find(f => f.id === doc.fileId);
        if (briefcaseFile) {
          downloadUrl = `/api/files/${doc.fileId}/download`;
          fileName = briefcaseFile.name;
        } else {
          // Fallback to checklist document download
          downloadUrl = `/api/checklists/documents/${doc.id}/download`;
        }
      } else if (doc.filePath) {
        // Download uploaded file using generic upload endpoint
        downloadUrl = `/api/uploads/download?path=${encodeURIComponent(doc.filePath)}`;
        fileName = doc.fileName || doc.documentName;
      } else {
        // Use the dedicated checklist document download endpoint
        downloadUrl = `/api/checklists/documents/${doc.id}/download`;
        fileName = doc.fileName || doc.documentName;
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: `Failed to download document: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = (document: ChecklistDocument) => {
    if (window.confirm(`Are you sure you want to remove "${document.documentName}" from this checklist?`)) {
      deleteDocumentMutation.mutate(document.id);
    }
  };

  const handleSubmitDocument = () => {
    if (!selectedChecklist || !documentName.trim()) {
      toast({
        title: "Error",
        description: "Document name is required",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFolderId) {
      toast({
        title: "Error",
        description: "Please select a folder",
        variant: "destructive",
      });
      return;
    }

    if (documentSource === "briefcase" && !selectedFileId) {
      toast({
        title: "Error",
        description: "Please select a file from briefcase",
        variant: "destructive",
      });
      return;
    }

    if (documentSource === "upload" && !uploadFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    addDocumentMutation.mutate({
      checklistId: selectedChecklist.id,
      documentName: documentName.trim(),
      fileId: documentSource === "briefcase" ? parseInt(selectedFileId) : undefined,
      file: documentSource === "upload" ? uploadFile : undefined,
      folderId: selectedFolderId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end items-center mb-6">
        <Button onClick={() => setIsAddOpen(true)} className="bg-[#0076a8] hover:bg-[#005a7d]">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Check List
        </Button>
      </div>

      {/* Checklists Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#0076a8] text-white">
                <TableRow>
                  <TableHead className="text-white font-medium text-center">#</TableHead>
                  <TableHead className="text-white font-medium">CHECK LIST NAME</TableHead>
                  <TableHead className="text-white font-medium">CREATED BY</TableHead>
                  <TableHead className="text-white font-medium">CREATED DATE & TIME</TableHead>
                  <TableHead className="text-white font-medium text-center">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checklistsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : currentChecklists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      {checklists.length === 0 
                        ? "No checklists found. Create your first checklist."
                        : "No checklists on this page."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  currentChecklists.map((checklist: Checklist, index: number) => (
                    <TableRow key={checklist.id}>
                      <TableCell className="text-center">{startIndex + index + 1}</TableCell>
                      <TableCell>{checklist.name}</TableCell>
                      <TableCell>{checklist.createdBy}</TableCell>
                      <TableCell>
                        {new Date(checklist.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditChecklist(checklist)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteChecklist(checklist)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddDocument(checklist)}
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Add Document</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Show</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 h-8"
                >
                  Prev
                </Button>
                
                <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded min-w-[32px] text-center">
                  {currentPage}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Checklist Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Check List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Check List Name*
              </Label>
              <Input
                placeholder="Enter checklist name"
                value={newChecklistName}
                onChange={(e) => setNewChecklistName(e.target.value)}
                className="border-gray-300 mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateChecklist}
              disabled={createChecklistMutation.isPending}
              className="bg-[#0076a8] hover:bg-[#005a7d]"
            >
              {createChecklistMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Checklist Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setEditChecklistName("");
          setSelectedChecklist(null);
        }
        setIsEditOpen(open);
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Check List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Check List Name*
              </Label>
              <Input
                placeholder="Enter checklist name"
                value={editChecklistName}
                onChange={(e) => setEditChecklistName(e.target.value)}
                className="border-gray-300 mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => {
              setIsEditOpen(false);
              setEditChecklistName("");
              setSelectedChecklist(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateChecklist}
              disabled={updateChecklistMutation.isPending}
              className="bg-[#0076a8] hover:bg-[#005a7d]"
            >
              {updateChecklistMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[#0076a8]">Delete Confirmation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure want to Delete ?</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              disabled={deleteChecklistMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteChecklistMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog open={isAddDocumentOpen} onOpenChange={(open) => {
        if (!open) {
          resetDocumentForm();
        }
        setIsAddDocumentOpen(open);
      }}>
        <DialogContent className="right-side-modal bg-white overflow-y-auto shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Check List Name
              </Label>
              <Input
                value={selectedChecklist?.name || ""}
                disabled
                className="border-gray-300 mt-1 bg-gray-50"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Document Name*
              </Label>
              <Input
                placeholder="Document Name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="border-gray-300 mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Select Folder *
              </Label>
              <div className="relative mt-1" ref={folderDropdownRef}>
                <Input
                  placeholder="Search and select folder/sub-folder..."
                  value={selectedFolderName}
                  onChange={(e) => {
                    setSelectedFolderName(e.target.value);
                    setIsFolderDropdownOpen(true);
                  }}
                  onFocus={() => setIsFolderDropdownOpen(true)}
                  className="border-gray-300"
                />
                {isFolderDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredFolders.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No folders found
                      </div>
                    ) : (
                      filteredFolders.map((folder: any) => (
                        <div
                          key={`folder-${folder.id}`}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectedFolderId(folder.id);
                            setSelectedFolderName(folder.name);
                            setIsFolderDropdownOpen(false);
                          }}
                        >
                          {folder.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Select Document From Briefcase *
              </Label>
              <div className="relative mt-1 document-dropdown">
                {/* Selected file display */}
                {selectedFileName && (
                  <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <span className="text-sm truncate">{selectedFileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearSelectedFile}
                      className="h-4 w-4 p-0 hover:bg-gray-200"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                {/* Search input and dropdown */}
                {!selectedFileName && (
                  <div>
                    <Input
                      placeholder="Search and select document from briefcase..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsDropdownOpen(true)}
                      className="border-gray-300"
                    />
                    
                    {/* Dropdown list */}
                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredFiles.length > 0 ? (
                          filteredFiles.map((file: BriefcaseFile) => (
                            <div
                              key={file.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => handleFileSelect(file)}
                            >
                              <span className="truncate">{file.name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            {searchTerm ? 'No documents found' : 'No documents available'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="text-center text-gray-500">
              -------------------------------------------- OR --------------------------------------------
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Upload New Document *
              </Label>
              <div className="mt-1">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                      setSelectedFileId(""); // Clear briefcase selection
                      setDocumentSource("upload");
                    }
                  }}
                  className={`w-full p-2 border rounded-md ${
                    selectedFileId ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                  }`}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  disabled={selectedFileId !== ""}
                />
                {selectedFileId && (
                  <p className="text-xs text-gray-500 mt-1">
                    File upload is disabled because you selected a document from briefcase
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t px-6 py-4">
            <Button 
              onClick={handleSubmitDocument}
              disabled={addDocumentMutation.isPending}
              className="bg-[#0076a8] hover:bg-[#005a7d]"
            >
              {addDocumentMutation.isPending ? "Adding..." : "Submit"}
            </Button>
            <Button variant="outline" onClick={() => {
              resetDocumentForm();
              setIsAddDocumentOpen(false);
            }}>
              Cancel
            </Button>
          </div>

          {/* Documents Table */}
          {checklistDocuments.length > 0 && (
            <div className="px-6 pb-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#0076a8]">
                      <TableHead className="font-semibold text-white">DOCUMENT NAME</TableHead>
                      <TableHead className="font-semibold text-white">CREATED BY</TableHead>
                      <TableHead className="font-semibold text-white">CREATED DATE</TableHead>
                      <TableHead className="font-semibold text-white text-center">ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentDocuments.map((doc: ChecklistDocument) => (
                      <TableRow key={doc.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span>{doc.documentName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{doc.createdBy}</TableCell>
                        <TableCell>
                          {new Date(doc.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) + ', ' + new Date(doc.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadDocument(doc)}
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                              title="Download Document"
                            >
                              <Download className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc)}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                              title="Remove Document"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination for document table */}
              {docTotalItems > 0 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Show</span>
                    <Select value={docItemsPerPage.toString()} onValueChange={(value) => setDocItemsPerPage(Number(value))}>
                      <SelectTrigger className="w-16 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    Page {docCurrentPage} of {docTotalPages}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDocCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={docCurrentPage === 1}
                      className="px-3 h-8"
                    >
                      Prev
                    </Button>
                    
                    <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded min-w-[32px] text-center">
                      {docCurrentPage}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDocCurrentPage(prev => Math.min(prev + 1, docTotalPages))}
                      disabled={docCurrentPage === docTotalPages}
                      className="px-3 h-8"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}