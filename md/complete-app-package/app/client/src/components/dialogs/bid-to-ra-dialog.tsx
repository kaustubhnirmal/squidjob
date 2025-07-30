import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BidToRADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tender: any;
}

export function BidToRADialog({ open, onOpenChange, tender }: BidToRADialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    raNo: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    startTime: "",
    endTime: "",
    startAmount: "",
    endAmount: "",
    document: null as File | null,
    existingDocumentPath: ""
  });
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Fetch existing RA data
  const { data: existingRA } = useQuery({
    queryKey: [`/api/tenders/${tender?.id}/ra`],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: !!tender?.id && open
  });

  // Populate form with existing data when dialog opens
  useEffect(() => {
    if (open && existingRA && existingRA.length > 0) {
      const raData = existingRA[0]; // Use the first RA record
      const startDateTime = raData.startDate ? new Date(raData.startDate) : undefined;
      const endDateTime = raData.endDate ? new Date(raData.endDate) : undefined;
      
      setFormData({
        raNo: raData.raNo || "",
        startDate: startDateTime,
        endDate: endDateTime,
        startTime: startDateTime ? startDateTime.toTimeString().slice(0, 5) : "",
        endTime: endDateTime ? endDateTime.toTimeString().slice(0, 5) : "",
        startAmount: raData.startAmount || "",
        endAmount: raData.endAmount || "",
        document: null, // Don't populate file, user needs to upload again if needed
        existingDocumentPath: raData.documentPath || ""
      });
    }
  }, [open, existingRA]);

  const createRAMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Get current user from localStorage for authentication
      const storedUser = localStorage.getItem('startender_user');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      const headers: Record<string, string> = {};
      if (currentUser?.id) {
        headers["x-user-id"] = currentUser.id.toString();
      }
      
      const response = await fetch(`/api/tenders/${tender.id}/ra`, {
        method: "POST",
        headers,
        body: data,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create RA");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "RA created successfully"
      });
      onOpenChange(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tender.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tender.id}/ra`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create RA",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      raNo: "",
      startDate: undefined,
      endDate: undefined,
      startTime: "",
      endTime: "",
      startAmount: "",
      endAmount: "",
      document: null,
      existingDocumentPath: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.raNo || !formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (RA No., dates, and times)",
        variant: "destructive"
      });
      return;
    }

    // Combine date and time
    const startDateTime = new Date(formData.startDate);
    const [startHours, startMinutes] = formData.startTime.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

    const endDateTime = new Date(formData.endDate);
    const [endHours, endMinutes] = formData.endTime.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

    const submitData = new FormData();
    submitData.append("bidNo", tender?.referenceNo || ""); // Use tender reference number
    submitData.append("raNo", formData.raNo);
    submitData.append("startDate", startDateTime.toISOString());
    submitData.append("endDate", endDateTime.toISOString());
    if (formData.startAmount) submitData.append("startAmount", formData.startAmount);
    if (formData.endAmount) submitData.append("endAmount", formData.endAmount);
    
    if (formData.document) {
      submitData.append("document", formData.document);
    }

    createRAMutation.mutate(submitData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, document: file }));
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, document: null }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bid To RA</DialogTitle>
          <DialogDescription>
            Create a reverse auction for tender {tender?.referenceNo}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="raNo">RA No:</Label>
            <Input
              id="raNo"
              value={formData.raNo}
              onChange={(e) => setFormData(prev => ({ ...prev, raNo: e.target.value }))}
              placeholder="Enter RA number"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date:</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => {
                      setFormData(prev => ({ ...prev, startDate: date }));
                      setStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date:</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => {
                      setFormData(prev => ({ ...prev, endDate: date }));
                      setEndDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time:</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
                pattern="[0-9]{2}:[0-9]{2}"
                style={{ colorScheme: 'dark' }}
                className="time-input-24h"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time:</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
                pattern="[0-9]{2}:[0-9]{2}"
                style={{ colorScheme: 'dark' }}
                className="time-input-24h"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startAmount">Start Amount (Optional):</Label>
              <Input
                id="startAmount"
                type="number"
                value={formData.startAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, startAmount: e.target.value }))}
                placeholder="Enter start amount"
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endAmount">End Amount (Optional):</Label>
              <Input
                id="endAmount"
                type="number"
                value={formData.endAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, endAmount: e.target.value }))}
                placeholder="Enter end amount"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Upload Document (Optional):</Label>
            <div className="space-y-2">
              {formData.existingDocumentPath && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                  <span className="text-sm text-gray-600">Current document:</span>
                  <a 
                    href={formData.existingDocumentPath} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Download existing document
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="document-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("document-upload")?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {formData.document ? "Change File" : formData.existingDocumentPath ? "Replace Document" : "Choose File"}
                </Button>
                {formData.document && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{formData.document.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createRAMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createRAMutation.isPending 
                ? (existingRA && existingRA.length > 0 ? "Updating..." : "Adding...") 
                : (existingRA && existingRA.length > 0 ? "Update RA" : "Add To RA")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}