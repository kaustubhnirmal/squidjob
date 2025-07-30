import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { FolderIcon, Plus, Search, Edit, Trash2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import type { Folder as FolderType } from "@shared/schema";
import { useUser } from "@/hooks/use-user";

export default function DocumentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useUser();
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const [folderName, setFolderName] = useState("");
  const [editFolderName, setEditFolderName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [parentFolderId, setParentFolderId] = useState<number | null>(null);

  // Fetch folders from API
  const { data: folders = [], isLoading } = useQuery<FolderType[]>({
    queryKey: ["/api/folders"],
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async ({ name, parentId }: { name: string; parentId?: number | null }) => {
      const res = await apiRequest("/api/folders", {
        method: "POST",
        body: JSON.stringify({ name, parentId })
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/folders/hierarchy"] });
      setIsAddFolderOpen(false);
      setFolderName("");
      setParentFolderId(null);
      toast({
        title: "Success",
        description: parentFolderId ? "Subfolder created successfully" : "Folder created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update folder mutation
  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await apiRequest(`/api/folders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name })
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      setIsEditFolderOpen(false);
      setSelectedFolder(null);
      setEditFolderName("");
      toast({
        title: "Success",
        description: "Folder updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(`/api/folders/${id}`, {
        method: "DELETE"
      });
      // Don't try to parse JSON from 204 No Content response
      return res.status === 204 ? null : await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      setIsDeleteDialogOpen(false);
      setSelectedFolder(null);
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateFolder = () => {
    if (!folderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name is required",
        variant: "destructive",
      });
      return;
    }
    createFolderMutation.mutate({ name: folderName.trim(), parentId: parentFolderId });
  };

  const handleEditFolder = (folder: FolderType) => {
    setSelectedFolder(folder);
    setEditFolderName(folder.name);
    setIsEditFolderOpen(true);
  };

  const handleUpdateFolder = () => {
    if (!editFolderName.trim() || !selectedFolder) {
      toast({
        title: "Error",
        description: "Folder name is required",
        variant: "destructive",
      });
      return;
    }
    updateFolderMutation.mutate({ id: selectedFolder.id, name: editFolderName.trim() });
  };

  const handleDeleteFolder = (folder: FolderType) => {
    setSelectedFolder(folder);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteFolder = () => {
    if (selectedFolder) {
      deleteFolderMutation.mutate(selectedFolder.id);
    }
  };

  const handleDownloadFolder = async (folder: FolderType) => {
    try {
      const response = await fetch(`/api/folders/${folder.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${folder.name}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({
          title: "Success",
          description: "Folder downloaded successfully",
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download folder",
        variant: "destructive",
      });
    }
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFolders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFolders = filteredFolders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
            <FolderIcon className="h-6 w-6 mr-2 text-purple-600" />
            Folders
          </h1>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsAddFolderOpen(true)}
              className="bg-[#0076a8] hover:bg-[#005a7d] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Folders Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0076a8] text-white">
                      <tr>
                        <th className="text-center py-3 px-4 font-medium text-sm">#</th>
                        <th className="text-center py-3 px-4 font-medium text-sm">FOLDER NAME</th>
                        <th className="text-center py-3 px-4 font-medium text-sm">TOTAL NO. FILES</th>
                        <th className="text-center py-3 px-4 font-medium text-sm">CREATED BY</th>
                        <th className="text-center py-3 px-4 font-medium text-sm">CREATED DATE & TIME</th>
                        <th className="text-center py-3 px-4 font-medium text-sm">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedFolders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            No folders found. Click "New Folder" to create your first folder.
                          </td>
                        </tr>
                      ) : (
                        paginatedFolders.map((folder, index) => (
                          <tr key={folder.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            <td className="text-center py-3 px-4 text-sm">{startIndex + index + 1}</td>
                            <td className="text-center py-3 px-4 text-sm">{folder.name}</td>
                            <td className="text-center py-3 px-4 text-sm">
                              {(folder as any).fileCount || 0}
                            </td>
                            <td className="text-center py-3 px-4 text-sm">{folder.createdBy}</td>
                            <td className="text-center py-3 px-4 text-sm">
                              {new Date(folder.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })} {new Date(folder.createdAt).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="text-center py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                                        onClick={() => handleEditFolder(folder)}
                                        disabled={updateFolderMutation.isPending}
                                      >
                                        <Edit className="h-4 w-4" />
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
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                        onClick={() => handleDeleteFolder(folder)}
                                        disabled={deleteFolderMutation.isPending}
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
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                                        onClick={() => handleDownloadFolder(folder)}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Download</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredFolders.length > 0 && (
                  <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="w-16 h-8 rounded border border-gray-300 px-2 text-sm"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    
                    <div className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 h-8"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Folder Modal */}
      <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {parentFolderId ? "Create New Subfolder" : "Add New Folder"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Parent Folder Selection */}
            <div>
              <Label htmlFor="parentFolder" className="text-sm font-medium">
                Parent Folder
              </Label>
              <Select value={parentFolderId?.toString() || ""} onValueChange={(value) => setParentFolderId(value ? parseInt(value) : null)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select parent folder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Root Folder)</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="folderName" className="text-sm font-medium">
                {parentFolderId ? "Subfolder Name *" : "Folder Name *"}
              </Label>
              <Input
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder={parentFolderId ? "Enter subfolder name" : "Enter folder name"}
                className="mt-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddFolderOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={createFolderMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createFolderMutation.isPending ? "Creating..." : `Create ${parentFolderId ? "Subfolder" : "Folder"}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={isEditFolderOpen} onOpenChange={setIsEditFolderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFolderName" className="text-sm font-medium">
                Folder Name *
              </Label>
              <Input
                id="editFolderName"
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="mt-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateFolder();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditFolderOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateFolder}
                disabled={updateFolderMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateFolderMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete the folder "{selectedFolder?.name}"? This action cannot be undone and will remove all files within this folder.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteFolder}
                disabled={deleteFolderMutation.isPending}
              >
                {deleteFolderMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}