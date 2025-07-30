import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Clock, AlertCircle, XCircle, UserPlus } from "lucide-react";
import { BidResultsDialog } from "./bid-results-dialog";

interface TenderStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tender: any;
}

const TENDER_STATUSES = [
  { value: "New", label: "New", icon: Clock, color: "text-blue-500" },
  { value: "Live", label: "Live", icon: CheckCircle, color: "text-green-500" },
  { value: "In-Process", label: "In-Process", icon: AlertCircle, color: "text-yellow-500" },
  { value: "Submitted", label: "Submitted", icon: CheckCircle, color: "text-emerald-500" },
  { value: "Awarded", label: "Awarded", icon: CheckCircle, color: "text-purple-500" },
  { value: "Lost", label: "Lost", icon: XCircle, color: "text-red-500" },
  { value: "Rejected", label: "Rejected", icon: XCircle, color: "text-red-500" },
  { value: "Cancelled", label: "Cancelled", icon: XCircle, color: "text-gray-500" },
  { value: "On Hold", label: "On Hold", icon: AlertCircle, color: "text-orange-500" }
];

export function TenderStatusDialog({ isOpen, onClose, tender }: TenderStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [showParticipantsError, setShowParticipantsError] = useState(false);
  const [attemptedStatus, setAttemptedStatus] = useState("");
  const [bidResultsOpen, setBidResultsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update tender status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, remarks }: { status: string; remarks: string }) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/tenders/${(tender as any)?.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id?.toString() || '1'
        },
        body: JSON.stringify({
          status,
          comments: remarks
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.requiresParticipants) {
          setShowParticipantsError(true);
          setAttemptedStatus(status);
          throw new Error(data.message);
        }
        throw new Error(data.message || 'Failed to update tender status');
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tender status updated successfully"
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${(tender as any)?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assigned-tenders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setSelectedStatus("");
      setRemarks("");
      setShowParticipantsError(false);
      setAttemptedStatus("");
      onClose();
    },
    onError: (error) => {
      console.error('Update status error:', error);
      if (!showParticipantsError) {
        toast({
          title: "Error",
          description: error.message || "Failed to update tender status",
          variant: "destructive"
        });
      }
    }
  });

  const handleSubmit = () => {
    if (!selectedStatus) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive"
      });
      return;
    }

    updateStatusMutation.mutate({
      status: selectedStatus,
      remarks
    });
  };

  const getCurrentStatusInfo = () => {
    return TENDER_STATUSES.find(s => s.value === tender?.status) || TENDER_STATUSES[0];
  };

  const getNewStatusInfo = () => {
    return TENDER_STATUSES.find(s => s.value === selectedStatus) || TENDER_STATUSES[0];
  };

  const currentStatusInfo = getCurrentStatusInfo();
  const newStatusInfo = getNewStatusInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-black">
            Update Tender Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tender ID */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Tender ID</Label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="text-sm text-gray-900">{(tender as any)?.referenceNo || "N/A"}</span>
            </div>
          </div>

          {/* Current Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Current Status</Label>
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-md">
              <currentStatusInfo.icon className={`h-4 w-4 ${currentStatusInfo.color}`} />
              <span className="text-sm font-medium text-gray-900">{(tender as any)?.status || "new"}</span>
            </div>
          </div>

          {/* New Status Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">New Status *</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {TENDER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center space-x-2">
                      <status.icon className={`h-4 w-4 ${status.color}`} />
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Remarks</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks for status change..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Error Message for Missing Participants */}
          {showParticipantsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Cannot change status to "{attemptedStatus}"
                </span>
              </div>
              <p className="text-sm text-red-700 mb-3">
                Add the participants! At least L1 participant to change the status.
              </p>
              <Button 
                onClick={() => {
                  setBidResultsOpen(true);
                  setShowParticipantsError(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Participants
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }} 
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }}
              disabled={updateStatusMutation.isPending || !selectedStatus}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {/* Bid Results Dialog */}
      {tender && (
        <BidResultsDialog
          open={bidResultsOpen}
          onOpenChange={(open) => {
            setBidResultsOpen(open);
            // If participants were added and dialog is closed, retry the status update
            if (!open && attemptedStatus) {
              setTimeout(() => {
                updateStatusMutation.mutate({
                  status: attemptedStatus,
                  remarks
                });
              }, 500);
            }
          }}
          tender={tender}
        />
      )}
    </Dialog>
  );
}