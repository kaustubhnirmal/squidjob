import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Clock, Eye, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RequestApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tender: any;
}

export function RequestApprovalDialog({ open, onOpenChange, tender }: RequestApprovalDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [approvalFor, setApprovalFor] = useState("");
  const [deadline, setDeadline] = useState<Date>();
  const [deadlineTime, setDeadlineTime] = useState("12:00");
  const [approvalFrom, setApprovalFrom] = useState("");
  const [inLoop, setInLoop] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState("");

  // Get users for dropdowns
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
    enabled: open,
  });

  // Get existing approval requests for this tender
  const { data: approvalRequests = [], refetch: refetchApprovals } = useQuery<any[]>({
    queryKey: ['/api/approval-requests', tender?.id],
    enabled: !!tender?.id && open,
  });

  // Create approval request mutation
  const createApprovalMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/approval-requests`, {
        method: 'POST',
        body: data,
      });
      if (!response.ok) {
        throw new Error('Failed to create approval request');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Approval request submitted successfully",
      });
      clearForm();
      refetchApprovals();
      queryClient.invalidateQueries({ queryKey: ['/api/approval-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit approval request",
        variant: "destructive",
      });
    },
  });

  const clearForm = () => {
    setApprovalFor("");
    setDeadline(undefined);
    setDeadlineTime("12:00");
    setApprovalFrom("");
    setInLoop("");
    setUploadFile(null);
    setRemarks("");
  };

  const handleSubmit = async () => {
    if (!approvalFor || !deadline || !approvalFrom) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('tenderId', tender.id.toString());
      formData.append('tenderBrief', tender.brief || tender.title || '');
      formData.append('tenderAuthority', tender.authority || '');
      formData.append('tenderValue', tender.estimatedValue || tender.emdAmount || '0');
      formData.append('approvalFor', approvalFor);
      
      // Combine date and time
      const [hours, minutes] = deadlineTime.split(':');
      const combinedDateTime = new Date(deadline);
      combinedDateTime.setHours(parseInt(hours), parseInt(minutes));
      formData.append('deadline', combinedDateTime.toISOString());
      
      formData.append('approvalFrom', approvalFrom);
      if (inLoop) {
        formData.append('inLoop', inLoop);
      }
      if (remarks) {
        formData.append('remarks', remarks);
      }
      if (uploadFile) {
        formData.append('uploadFile', uploadFile);
      }

      await createApprovalMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Submit approval request error:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Request To Approval</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tender Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Tender ID:</Label>
              <div className="text-sm">{tender?.referenceNo || 'N/A'}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Tender Brief:</Label>
              <div className="text-sm">{tender?.brief || tender?.title || 'N/A'}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Tender Authority:</Label>
              <div className="text-sm">{tender?.authority || 'N/A'}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Tender Value:</Label>
              <div className="text-sm">{tender?.estimatedValue || tender?.emdAmount || 'Refer Document'}</div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="approvalFor">Approval For *</Label>
              <Select value={approvalFor} onValueChange={setApprovalFor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select approval type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Price">Price</SelectItem>
                  <SelectItem value="EMD">EMD</SelectItem>
                  <SelectItem value="Registration">Registration</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Document Fee">Document Fee</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Deadline *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Reminder Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <Input
                        type="time"
                        value={deadlineTime}
                        onChange={(e) => setDeadlineTime(e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approvalFrom">Approval From *</Label>
              <Select value={approvalFrom} onValueChange={setApprovalFrom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select approver" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inLoop">In Loop</Label>
              <Select value={inLoop} onValueChange={setInLoop}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user to keep in loop" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uploadFile">Upload File</Label>
              <Input
                id="uploadFile"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              />
              {uploadFile && (
                <div className="text-sm text-gray-600">
                  Selected: {uploadFile.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks"
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }}
              disabled={createApprovalMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createApprovalMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clearForm();
              }}
            >
              Clear
            </Button>
          </div>

          {/* Approval Requests Table */}
          <div className="mt-6">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg">
              <div className="grid grid-cols-7 gap-4 text-sm font-medium">
                <div>APPROVAL FOR</div>
                <div>APPROVAL FROM</div>
                <div>IN LOOP</div>
                <div>REQUEST DATE</div>
                <div>DEADLINE DATE & TIME</div>
                <div>STATUS</div>
                <div>ACTION</div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-b-lg overflow-hidden">
              {approvalRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No data found
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto">
                  {approvalRequests.map((request: any, index: number) => (
                    <div key={request.id} className="grid grid-cols-7 gap-4 p-3 text-sm border-b border-gray-100 hover:bg-gray-50">
                      <div>{request.approvalFor}</div>
                      <div>{request.approverName || 'N/A'}</div>
                      <div>{request.inLoopName || '-'}</div>
                      <div>{format(new Date(request.createdAt), 'dd-MM-yyyy HH:mm')}</div>
                      <div>{format(new Date(request.deadline), 'dd-MM-yyyy HH:mm')}</div>
                      <div>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs",
                          request.status === 'Pending' && "bg-yellow-100 text-yellow-800",
                          request.status === 'Approved' && "bg-green-100 text-green-800",
                          request.status === 'Rejected' && "bg-red-100 text-red-800"
                        )}>
                          {request.status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="p-1">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="p-1 text-red-600">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 text-sm">
              <div>Show 10 Page 1 of 1</div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">Prev</Button>
                <Button variant="outline" size="sm" className="bg-blue-600 text-white">1</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}