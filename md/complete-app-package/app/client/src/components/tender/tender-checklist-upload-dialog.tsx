import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TenderChecklistUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: number;
}

export function TenderChecklistUploadDialog({ isOpen, onClose, tenderId }: TenderChecklistUploadDialogProps) {
  const [formData, setFormData] = useState({
    responseName: "",
    responseType: "",
    remarks: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch folders
  const { data: folders = [] } = useQuery({
    queryKey: ["/api/folders"],
    queryFn: async () => {
      const response = await apiRequest("/api/folders", { method: "GET" });
      return response.json();
    },
  });

  // Create tender response mutation
  const uploadResponseMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/tenders/${tenderId}/responses`, {
        method: "POST",
        body: data,
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || "Failed to upload response");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Response uploaded successfully",
      });
      // Invalidate all relevant queries to update the UI
      queryClient.invalidateQueries({ queryKey: [`/api/tender-responses/${tenderId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}/all-documents`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}/activities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}`] });
      resetForm();
      onClose();
    },
    onError: (error: Error) => {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      responseName: "",
      responseType: "",
      remarks: "",
    });
    setUploadedFile(null);
    setSelectedFolderId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('responseName', formData.responseName);
    formDataToSend.append('responseType', formData.responseType);
    formDataToSend.append('remarks', formData.remarks);
    formDataToSend.append('file', uploadedFile);
    
    if (selectedFolderId) {
      formDataToSend.append('folderId', selectedFolderId.toString());
    }

    uploadResponseMutation.mutate(formDataToSend);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
      } else {
        toast({
          title: "Error",
          description: "Only PDF, Word, and Excel files are allowed",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-yellow-100 border-4 border-yellow-400">
        <DialogHeader className="bg-yellow-300 -m-6 mb-4 p-4 rounded-t-lg">
          <DialogTitle className="text-lg font-bold text-black">Upload Response</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          {/* Response Name and Response Type Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responseName" className="text-sm font-medium text-black">Response Name *</Label>
              <Input
                id="responseName"
                placeholder="Response Name"
                value={formData.responseName}
                onChange={(e) => setFormData(prev => ({ ...prev, responseName: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="responseType" className="text-sm font-medium text-black">Response Type *</Label>
              <Select 
                value={formData.responseType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, responseType: value }))}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Response Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical Response">Technical Response</SelectItem>
                  <SelectItem value="Financial Response">Financial Response</SelectItem>
                  <SelectItem value="EMD">EMD</SelectItem>
                  <SelectItem value="BOQ">BOQ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Folder Selection */}
          <div>
            <Label htmlFor="folder" className="text-sm font-medium text-black">Select Folder (Optional)</Label>
            <Select 
              value={selectedFolderId?.toString() || ""} 
              onValueChange={(value) => setSelectedFolderId(value ? parseInt(value) : null)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a folder/sub-folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No folder</SelectItem>
                {folders.map((folder: any) => (
                  <SelectItem key={folder.id} value={folder.id.toString()}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload and Remarks Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="file" className="text-sm font-medium text-black">Select File *</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input 
                  type="file" 
                  id="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  required
                  className="flex-1"
                />
                {uploadedFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {uploadedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {uploadedFile.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="remarks" className="text-sm font-medium text-black">Remarks *</Label>
              <Textarea
                id="remarks"
                placeholder="Remarks"
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                rows={3}
                required
                className="mt-1"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button 
              type="submit"
              disabled={uploadResponseMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
            >
              {uploadResponseMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}