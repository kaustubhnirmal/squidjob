import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Upload, X } from "lucide-react";

interface UploadResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: number;
}

export function UploadResponseDialog({ isOpen, onClose, tenderId }: UploadResponseDialogProps) {
  const [formData, setFormData] = useState({
    responseName: "",
    responseType: "",
    remarks: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create tender response mutation
  const uploadResponseMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/tenders/${tenderId}/responses`, {
        method: "POST",
        body: data,
      });
      if (!response.ok) throw new Error("Failed to upload response");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Response uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tender-responses', tenderId] });
      resetForm();
      onClose();
    },
    onError: (error: Error) => {
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Response</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Response Name */}
          <div>
            <Label htmlFor="responseName">Response Name *</Label>
            <Input
              id="responseName"
              placeholder="Enter response name"
              value={formData.responseName}
              onChange={(e) => setFormData(prev => ({ ...prev, responseName: e.target.value }))}
              required
            />
          </div>

          {/* Response Type */}
          <div>
            <Label htmlFor="responseType">Response Type *</Label>
            <Select 
              value={formData.responseType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, responseType: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select response type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technical Response">Technical Response</SelectItem>
                <SelectItem value="Financial Response">Financial Response</SelectItem>
                <SelectItem value="EMD">EMD</SelectItem>
                <SelectItem value="BOQ">BOQ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="file">Select File *</Label>
            <div className="flex items-center space-x-2">
              <Input 
                type="file" 
                id="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                required
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

          {/* Remarks */}
          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Enter remarks (optional)"
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Submit and Clear Buttons */}
          <div className="flex space-x-2">
            <Button 
              type="submit"
              disabled={uploadResponseMutation.isPending}
              className="btn-purple flex-1"
            >
              {uploadResponseMutation.isPending ? "Uploading..." : "Submit"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              className="flex-1"
            >
              Clear
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}