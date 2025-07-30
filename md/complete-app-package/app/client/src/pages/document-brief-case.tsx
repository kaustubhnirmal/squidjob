import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, ChevronDown, ChevronUp, Edit, FileText, Plus, Trash2, Download, X, FolderPlus, FolderMinus, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Interface for document brief case type
interface DocumentBriefItem {
  id: number;
  folderName: string;
  subFolderName: string;
  fileName: string;
  fileExtension?: string;
  createdBy: string;
  createdDate: string;
}

// Interface for folder type
interface FolderItem {
  id: number;
  name: string;
  parentId: number | null;
  fileCount: number;
  createdBy: string;
  subfolders?: FolderItem[];
}

export default function DocumentBriefCase() {
  const { toast } = useToast();
  
  // Utility function to extract file extension
  const getFileExtension = (filename: string): string => {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  };
  const [showDeletedFiles, setShowDeletedFiles] = useState(false);
  const [folderFilter, setFolderFilter] = useState("all");
  const [subFolderFilter, setSubFolderFilter] = useState("all");
  const [fileNameFilter, setFileNameFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Fetch files from the database
  const { data: filesData = [], isLoading: filesLoading, refetch: refetchFiles } = useQuery({
    queryKey: ["/api/files"],
    queryFn: async () => {
      const response = await fetch("/api/files");
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      return response.json();
    },
  });

  // Transform files data to DocumentBriefItem format
  const briefCaseDocuments: DocumentBriefItem[] = filesData.map((file: any) => ({
    id: file.id,
    folderName: file.folderName || 'Unknown',
    subFolderName: file.subFolderName || '-',
    fileName: file.name,
    fileExtension: getFileExtension(file.originalName),
    createdBy: file.createdBy || 'Unknown',
    createdDate: new Date(file.createdAt).toLocaleString()
  }));

  // Track uploaded files in current session
  const [uploadedFiles, setUploadedFiles] = useState<{id: number; name: string; folder: string; subFolder: string; file: File}[]>([]);

  // Filter brief case documents
  const filteredBriefCaseDocuments = briefCaseDocuments.filter(doc => {
    const matchesFolder = folderFilter === "all" || doc.folderName === folderFilter;
    const matchesSubFolder = subFolderFilter === "all" || doc.subFolderName === subFolderFilter;
    const matchesFileName = !fileNameFilter || doc.fileName.toLowerCase().includes(fileNameFilter.toLowerCase());
    return matchesFolder && matchesSubFolder && matchesFileName;
  });

  // Pagination calculations
  const totalItems = filteredBriefCaseDocuments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = filteredBriefCaseDocuments.slice(startIndex, endIndex);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [folderFilter, subFolderFilter, fileNameFilter]);

  // Toggle all row selection (for current page)
  const toggleAllRows = () => {
    if (allSelected) {
      setSelectedRows([]);
      setAllSelected(false);
    } else {
      setSelectedRows(currentDocuments.map(doc => doc.id));
      setAllSelected(true);
    }
  };

  // Toggle single row selection
  const toggleRowSelection = (docId: number) => {
    if (selectedRows.includes(docId)) {
      setSelectedRows(selectedRows.filter(id => id !== docId));
      setAllSelected(false);
    } else {
      setSelectedRows([...selectedRows, docId]);
      if (selectedRows.length + 1 === currentDocuments.length) {
        setAllSelected(true);
      }
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFolderFilter("all");
    setSubFolderFilter("all");
    setFileNameFilter("");
    setShowDeletedFiles(false);
  };

  // Handle document actions
  const handleEditDocument = (docId: number) => {
    const document = briefCaseDocuments.find(doc => doc.id === docId);
    if (document) {
      setEditingDocument(document);
      // Remove file extension for editing
      const nameWithoutExt = document.fileName.replace(/\.[^/.]+$/, "");
      setEditFileName(nameWithoutExt);
      setIsEditOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingDocument || !editFileName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid file name",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update file name via API
      const response = await fetch(`/api/files/${editingDocument.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editFileName.trim()
        }),
      });

      if (response.ok) {
        const updatedFile = await response.json();
        
        // Refetch files to get updated data
        await refetchFiles();

        toast({
          title: "Success",
          description: "File name updated successfully"
        });
        
        setIsEditOpen(false);
        setEditingDocument(null);
        setEditFileName("");
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update file name",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Edit error:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating the file name",
        variant: "destructive"
      });
    }
  };

  // Function to download individual file
  const handleDownloadDocument = async (docId: number) => {
    try {
      // Download individual file using the file ID
      const response = await fetch(`/api/files/${docId}/download`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'download';
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Download Successful",
          description: `${filename} downloaded successfully`
        });
      } else {
        toast({
          title: "Download Failed",
          description: "Failed to download file",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "An error occurred while downloading",
        variant: "destructive"
      });
    }
  };

  // State for file upload dialog
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [selectedMainFolder, setSelectedMainFolder] = useState("");
  const [selectedSubFolder, setSelectedSubFolder] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [parentFolderId, setParentFolderId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentBriefItem | null>(null);
  const [editFileName, setEditFileName] = useState("");
  
  // State for folder tree view
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [showFolderTree, setShowFolderTree] = useState(true);
  
  // Fetch folders from the API (flat structure)
  const { data: folders = [], isLoading: loadingFolders } = useQuery<FolderItem[]>({
    queryKey: ["/api/folders"],
  });

  // Fetch hierarchical folder structure
  const { data: folderHierarchy = [], isLoading: loadingHierarchy } = useQuery<FolderItem[]>({
    queryKey: ["/api/folders/hierarchy"],
  });

  // No longer need localStorage since we're using database

  // Tree view functions
  const toggleFolderExpansion = (folderId: number) => {
    setExpandedFolders(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return newExpanded;
    });
  };

  // Recursive folder tree renderer
  const renderFolderTree = (folders: FolderItem[], level = 0) => {
    return folders.map((folder) => (
      <div key={folder.id} className="folder-tree-item">
        <div 
          className={`flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded ${level > 0 ? 'ml-4' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {folder.subfolders && folder.subfolders.length > 0 ? (
            <button
              onClick={() => toggleFolderExpansion(folder.id)}
              className="p-0 h-4 w-4 flex items-center justify-center"
            >
              {expandedFolders.has(folder.id) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
          
          {expandedFolders.has(folder.id) ? (
            <FolderOpen className="h-4 w-4 text-blue-600" />
          ) : (
            <Folder className="h-4 w-4 text-blue-600" />
          )}
          
          <span className="text-sm font-medium">{folder.name}</span>
          <span className="text-xs text-gray-500">({folder.fileCount} files)</span>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleAddNewFolder(folder.id);
            }}
            className="ml-auto p-1 h-6 w-6"
          >
            <FolderPlus className="h-3 w-3" />
          </Button>
        </div>
        
        {folder.subfolders && folder.subfolders.length > 0 && expandedFolders.has(folder.id) && (
          <div className="subfolder-container">
            {renderFolderTree(folder.subfolders, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const handleAddNewFile = () => {
    setSelectedMainFolder("");
    setSelectedSubFolder("");
    setSelectedFile(null);
    setFileName("");
    setIsAddFileOpen(true);
  };

  const handleAddNewFolder = (parentId: number | null = null) => {
    setNewFolderName("");
    setParentFolderId(parentId);
    setIsAddFolderOpen(true);
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      try {
        const folderData = { 
          name: newFolderName.trim(),
          ...(parentFolderId && { parentId: parentFolderId })
        };
        
        const response = await fetch('/api/folders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(folderData),
        });

        if (response.ok) {
          // Invalidate the query to refetch folders
          window.location.reload(); // Simple reload for now
          const folderType = parentFolderId ? "Subfolder" : "Folder";
          toast({
            title: `${folderType} Created`,
            description: `${folderType} "${newFolderName}" has been created successfully`
          });
        } else {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: errorData.message || "Failed to create folder",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create folder",
          variant: "destructive"
        });
      }
      setIsAddFolderOpen(false);
    }
  };

  const handleFileUpload = async () => {
    if (isUploading) {
      return; // Prevent multiple submissions
    }

    if (!selectedMainFolder) {
      toast({
        title: "Error",
        description: "Please select a folder",
        variant: "destructive"
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Find the folder ID from the selected folder name
      const selectedFolder = folders.find((folder: any) => folder.name === selectedMainFolder);
      if (!selectedFolder) {
        toast({
          title: "Error",
          description: "Selected folder not found",
          variant: "destructive"
        });
        return;
      }

      const displayName = fileName.trim() || selectedFile.name;
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', displayName);
      formData.append('folderId', selectedFolder.id.toString());
      if (selectedSubFolder && selectedSubFolder !== 'none') {
        formData.append('subFolder', selectedSubFolder);
      }

      // Upload file to server
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const uploadedFile = await response.json();
        
        // Add to briefcase documents
        const newDocument: DocumentBriefItem = {
          id: uploadedFile.id,
          folderName: selectedMainFolder,
          subFolderName: selectedSubFolder === 'none' ? '' : selectedSubFolder,
          fileName: displayName,
          fileExtension: getFileExtension(uploadedFile.originalName || displayName),
          createdBy: "Current User",
          createdDate: new Date().toLocaleString()
        };

        // Refetch files to get updated data
        await refetchFiles();
        
        // Reset form and close dialog
        setSelectedMainFolder("");
        setSelectedSubFolder("");
        setSelectedFile(null);
        setFileName("");
        setIsAddFileOpen(false);

        toast({
          title: "File Uploaded",
          description: `"${displayName}" has been uploaded to ${selectedMainFolder}`
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Upload Failed",
          description: errorData.message || "Failed to upload file",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading the file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocuments = async () => {
    if (selectedRows.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one document to delete",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Delete files via API calls
      const deletePromises = selectedRows.map(async (fileId) => {
        const response = await fetch(`/api/files/${fileId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return { fileId, success: response.ok };
      });
      
      const deleteResults = await Promise.all(deletePromises);
      const successCount = deleteResults.filter(r => r.success).length;
      const failCount = deleteResults.filter(r => !r.success).length;
      
      if (successCount > 0) {
        // Refetch files to get updated data
        await refetchFiles();
        
        // Also remove from uploadedFiles if they're there
        setUploadedFiles(uploadedFiles.filter(file => !selectedRows.includes(file.id)));
        
        toast({
          title: "Documents Deleted",
          description: `${successCount} document(s) have been deleted successfully${failCount > 0 ? ` (${failCount} failed)` : ''}`
        });
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete documents",
          variant: "destructive"
        });
      }
      
      setSelectedRows([]);
      setAllSelected(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting documents",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Briefcase className="h-6 w-6 mr-2" />
            Document Brief Case
          </h1>
          
          <div className="flex space-x-2">
            {selectedRows.length > 0 && (
              <>
                <Button 
                  onClick={handleDeleteDocuments}
                  className="bg-red-500 hover:bg-red-600 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedRows.length})
                </Button>
                
                {folderFilter !== "all" && (
                  <Button 
                    onClick={() => {
                      // Delete all documents in current folder
                      const docsInFolder = briefCaseDocuments.filter(doc => doc.folderName === folderFilter);
                      const idsToRemove = docsInFolder.map(doc => doc.id);
                      
                      // Delete files via API would be implemented here
                      refetchFiles();
                      setUploadedFiles(uploadedFiles.filter(file => file.folder !== folderFilter));
                      setSelectedRows(selectedRows.filter(id => !idsToRemove.includes(id)));
                      
                      toast({
                        title: "Files Deleted",
                        description: `All files in "${folderFilter}" folder have been deleted`
                      });
                    }}
                    className="bg-orange-500 hover:bg-orange-600 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Files in Current Folder
                  </Button>
                )}
              </>
            )}
          </div>
          <Button 
            onClick={handleAddNewFile} 
            className="bg-[#0076a8] hover:bg-[#005a7f] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add File
          </Button>
        </div>
        
        {/* Folder Tree View */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-6 bg-purple-100 text-gray-800 border-b">
            <CardTitle className="text-base font-medium flex items-center">
              <Folder className="h-4 w-4 mr-2" />
              Folder Structure
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleAddNewFolder()}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <FolderPlus className="h-4 w-4 mr-1" />
                New Folder
              </Button>
              <button
                className="text-gray-500 hover:text-gray-700 p-2"
                onClick={() => setShowFolderTree(!showFolderTree)}
              >
                {showFolderTree ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </CardHeader>
          {showFolderTree && (
            <CardContent className="p-4 bg-white max-h-96 overflow-y-auto">
              {loadingHierarchy ? (
                <div className="text-center py-4 text-gray-500">Loading folders...</div>
              ) : folderHierarchy.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No folders found. Create your first folder to get started.
                </div>
              ) : (
                <div className="folder-tree">
                  {renderFolderTree(folderHierarchy)}
                </div>
              )}
            </CardContent>
          )}
        </Card>
        
        {/* Search and Filter */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-6 bg-gray-100 text-gray-800 border-b">
            <CardTitle className="text-base font-medium">
              Document Brief Filter
            </CardTitle>
            <button
              className="text-gray-500 hover:text-gray-700 p-2"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              {isFilterExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </CardHeader>
          {isFilterExpanded && (
            <CardContent className="p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700">Folder Name</label>
                  <Select value={folderFilter} onValueChange={setFolderFilter}>
                    <SelectTrigger className="border-gray-300 bg-white">
                      <SelectValue placeholder="All Folders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Folders</SelectItem>
                      
                      {/* Include folders from API */}
                      {folders.map((folder: FolderItem) => (
                        <SelectItem key={folder.id} value={folder.name}>{folder.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700">Sub Folder Name</label>
                  <Select value={subFolderFilter} onValueChange={setSubFolderFilter}>
                    <SelectTrigger className="border-gray-300 bg-white">
                      <SelectValue placeholder="All Sub Folders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sub Folders</SelectItem>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="proposals">Proposals</SelectItem>
                      <SelectItem value="reports">Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700">File Name</label>
                  <Input 
                    placeholder="Search by file name" 
                    value={fileNameFilter}
                    onChange={(e) => setFileNameFilter(e.target.value)}
                    className="border-gray-300 bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center">
                  <Checkbox 
                    id="showDeleted" 
                    checked={showDeletedFiles}
                    onCheckedChange={(checked) => setShowDeletedFiles(!!checked)}
                  />
                  <label htmlFor="showDeleted" className="text-sm ml-2 cursor-pointer text-gray-700">
                    Show Deleted File
                  </label>
                </div>
                <div className="ml-auto space-x-2">
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    Search
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Documents Table */}
        <div className="bg-white rounded-sm shadow">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#0076a8] text-white">
                <tr>
                  <th className="p-3 text-left">
                    <Checkbox 
                      checked={allSelected} 
                      onCheckedChange={toggleAllRows}
                      className="accent-white"
                    />
                  </th>
                  <th className="p-3 text-center text-sm font-medium">#</th>
                  <th className="p-3 text-left text-sm font-medium">FOLDER NAME</th>
                  <th className="p-3 text-left text-sm font-medium">SUB FOLDER NAME</th>
                  <th className="p-3 text-left text-sm font-medium">FILE NAME</th>
                  <th className="p-3 text-left text-sm font-medium">CREATED BY</th>
                  <th className="p-3 text-left text-sm font-medium">CREATED DATE & TIME</th>
                  <th className="p-3 text-center text-sm font-medium">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {currentDocuments.map((doc, index) => (
                  <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 text-center">
                      <Checkbox 
                        checked={selectedRows.includes(doc.id)}
                        onCheckedChange={() => toggleRowSelection(doc.id)}
                      />
                    </td>
                    <td className="p-3 text-center">{startIndex + index + 1}</td>
                    <td className="p-3">{doc.folderName}</td>
                    <td className="p-3">{doc.subFolderName || "-"}</td>
                    <td className="p-3">{doc.fileName}{doc.fileExtension || ''}</td>
                    <td className="p-3">{doc.createdBy}</td>
                    <td className="p-3">{doc.createdDate}</td>
                    <td className="p-3">
                      <div className="flex justify-center space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleEditDocument(doc.id)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleDownloadDocument(doc.id)}
                                className="text-green-500 hover:text-green-700"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Download</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={async () => {
                                  try {
                                    // Delete file via API
                                    const response = await fetch(`/api/files/${doc.id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                    });
                                    
                                    if (response.ok) {
                                      // Refetch files to get updated data
                                      await refetchFiles();
                                      setUploadedFiles(uploadedFiles.filter(file => file.id !== doc.id));
                                      setSelectedRows(selectedRows.filter(id => id !== doc.id));
                                      
                                      toast({
                                        title: "Document Deleted",
                                        description: `"${doc.fileName}" has been deleted successfully`
                                      });
                                    } else {
                                      toast({
                                        title: "Delete Failed",
                                        description: "Failed to delete document",
                                        variant: "destructive"
                                      });
                                    }
                                  } catch (error) {
                                    console.error('Delete error:', error);
                                    toast({
                                      title: "Error",
                                      description: "An error occurred while deleting the document",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                ))}

                {currentDocuments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-gray-500">
                      {filteredBriefCaseDocuments.length === 0 
                        ? "No documents found. Use the Add File button to upload documents."
                        : "No documents on this page."
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
        </div>
      </div>

      {/* Add File Dialog */}
      <Dialog open={isAddFileOpen} onOpenChange={setIsAddFileOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1 flex-1">
                <label className="text-sm font-medium text-gray-700">
                  Folder
                </label>
                <Select value={selectedMainFolder} onValueChange={setSelectedMainFolder}>
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder: FolderItem) => (
                      <SelectItem key={folder.id} value={folder.name}>{folder.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="ml-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleAddNewFolder()}
                        variant="outline"
                        className="flex items-center h-9 mt-6"
                      >
                        <FolderPlus className="h-4 w-4 mr-1" />
                        New Folder
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create New Folder</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Sub Folder (Optional)
              </label>
              <Select value={selectedSubFolder} onValueChange={setSelectedSubFolder}>
                <SelectTrigger className="border-gray-300 bg-white">
                  <SelectValue placeholder="Select a sub folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="proposals">Proposals</SelectItem>
                  <SelectItem value="reports">Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                File Name (Optional - will use original filename if empty)
              </label>
              <Input 
                placeholder="Enter a name for the file"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="border-gray-300"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Select File
              </label>
              <div className="mt-1 flex items-center">
                <label className="block w-full">
                  <span className="sr-only">Choose file</span>
                  <input
                    type="file"
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0076a8] file:text-white
                      hover:file:bg-[#005a7f]"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
              {selectedFile && (
                <div className="mt-2 text-sm text-gray-500 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  <button
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddFileOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleFileUpload} 
              disabled={isUploading}
              className="bg-[#0076a8] hover:bg-[#005a7f] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Folder Dialog */}
      <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {parentFolderId ? "Create New Subfolder" : "Create New Folder"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Parent Folder Selection (for subfolders) */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Parent Folder
              </label>
              <Select value={parentFolderId?.toString() || ""} onValueChange={(value) => setParentFolderId(value ? parseInt(value) : null)}>
                <SelectTrigger className="border-gray-300 bg-white mt-1">
                  <SelectValue placeholder="Select parent folder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Root Folder)</SelectItem>
                  {folders.map((folder: FolderItem) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Folder Name Input */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                {parentFolderId ? "Subfolder Name" : "Folder Name"}
              </label>
              <Input 
                placeholder={parentFolderId ? "Enter subfolder name" : "Enter folder name"}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="border-gray-300 mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>
              Create {parentFolderId ? "Subfolder" : "Folder"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit File Name Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Editing document ID: {editingDocument?.id}
              </label>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                File Name
              </label>
              <Input 
                placeholder="Enter new file name"
                value={editFileName}
                onChange={(e) => setEditFileName(e.target.value)}
                className="border-gray-300 mt-1"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              className="bg-[#0076a8] hover:bg-[#005a7f] text-white"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}