import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  Heart, 
  Clock, 
  Users, 
  BadgeDollarSign, 
  Phone, 
  FileCheck,
  FileEdit,
  ClipboardList,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import { TenderAssignDialog } from "@/components/tender/tender-assign-dialog";
import { RequestToFinanceDialog } from "@/components/dialogs/request-to-finance-dialog";
import { TenderStatusDialog } from "@/components/dialogs/tender-status-dialog";
import { RequestApprovalDialog } from "@/components/dialogs/request-approval-dialog";
import { TaskAllocationDialog } from "@/components/dialogs/task-allocation-dialog";
import { KickOffCallDialog } from "@/components/tender/kick-off-call-dialog";
import { TenderReminderPopup } from "@/components/tender/tender-reminder-popup";
import { useUser } from "@/hooks/use-user";

interface TenderActionButtonsProps {
  tenderId: number;
  tenderReferenceNo?: string;
  isStarred?: boolean;
  isInterested?: boolean;
  status?: string;
  contactPhone?: string;
  contactName?: string;
  contactEmail?: string;
}

export function TenderActionButtons({
  tenderId,
  tenderReferenceNo = "",
  isStarred = false,
  isInterested = false,
  status = "new",
  contactPhone = "+91 9876543210", // Default fallback value
  contactName,
  contactEmail
}: TenderActionButtonsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useUser();
  const [currentIsStarred, setCurrentIsStarred] = useState(isStarred);
  const [currentIsInterested, setCurrentIsInterested] = useState(isInterested);

  // Modal states
  const [reminderPopupOpen, setReminderPopupOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [taskAllocationModalOpen, setTaskAllocationModalOpen] = useState(false);
  const [kickOffCallModalOpen, setKickOffCallModalOpen] = useState(false);
  const [interestConfirmModalOpen, setInterestConfirmModalOpen] = useState(false);
  const [interestAction, setInterestAction] = useState<"add" | "remove">("add");


  // Star mutation
  const starMutation = useMutation({
    mutationFn: async (isStarred: boolean) => {
      const userId = currentUser?.id?.toString() || '1';
      const response = await fetch(`/api/tenders/${tenderId}/star`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ isStarred, userId: parseInt(userId) })
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      setCurrentIsStarred(variables);
      // Invalidate relevant queries to ensure UI updates
      // Invalidate all tender-related queries to ensure counts update correctly
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/current/tenders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenders/counts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenders/all'] });
      
      // Update the specific tender in the cached data to reflect the star change
      const userId = currentUser?.id;
      const cachedData = queryClient.getQueryData(['/api/tenders/all', userId]);
      if (cachedData && Array.isArray(cachedData)) {
        const updatedData = cachedData.map((tender: any) => 
          tender.id === tenderId 
            ? { ...tender, isStarred: variables }
            : tender
        );
        queryClient.setQueryData(['/api/tenders/all', userId], updatedData);
      }
      // Update the counts in the cache directly for immediate UI update
      const tenderData = queryClient.getQueryData(['/api/users/current/tenders']);
      if (tenderData && typeof tenderData === 'object' && 'counts' in tenderData && tenderData.counts) {
        queryClient.setQueryData(['/api/users/current/tenders'], {
          ...tenderData,
          counts: {
            ...tenderData.counts,
            star: (data.counts as any)?.star ?? (tenderData.counts as any)?.star ?? 0
          }
        });
      }
      
      toast({
        title: variables ? "Added to Starred" : "Removed from Starred",
        description: variables 
          ? "This tender has been added to your starred list." 
          : "This tender has been removed from your starred list.",
      });
    },
    onError: (error) => {
      console.error("Error toggling star:", error);
      toast({
        title: "Error",
        description: "Failed to update starred status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Interest mutation
  const interestMutation = useMutation({
    mutationFn: async (isInterested: boolean) => {
      const userId = currentUser?.id?.toString() || '1';
      const response = await fetch(`/api/tenders/${tenderId}/interest`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ isInterested, userId: parseInt(userId) })
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      setCurrentIsInterested(variables);
      setInterestConfirmModalOpen(false);
      
      // Invalidate relevant queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/current/tenders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenders/counts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenders/all'] });
      
      // Update the specific tender in the cached data to reflect the interest change
      const userId = currentUser?.id;
      const cachedData = queryClient.getQueryData(['/api/tenders/all', userId]);
      if (cachedData && Array.isArray(cachedData)) {
        const updatedData = cachedData.map((tender: any) => 
          tender.id === tenderId 
            ? { ...tender, isInterested: variables }
            : tender
        );
        queryClient.setQueryData(['/api/tenders/all', userId], updatedData);
      }
      
      // Update the counts in the cache directly for immediate UI update
      const tenderData = queryClient.getQueryData(['/api/users/current/tenders']);
      if (tenderData && typeof tenderData === 'object' && 'counts' in tenderData && tenderData.counts) {
        queryClient.setQueryData(['/api/users/current/tenders'], {
          ...tenderData,
          counts: {
            ...tenderData.counts,
            interested: (data.counts as any)?.interested ?? (tenderData.counts as any)?.interested ?? 0
          }
        });
      }
      
      toast({
        title: variables ? "Added to Interested" : "Removed from Interested",
        description: variables 
          ? "This tender has been added to your interested list." 
          : "This tender has been removed from your interested list.",
      });
    },
    onError: (error) => {
      console.error("Error toggling interest:", error);
      setInterestConfirmModalOpen(false);
      toast({
        title: "Error",
        description: "Failed to update interest status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle interest click with confirmation
  const handleInterestClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const newAction = currentIsInterested ? "remove" : "add";
    setInterestAction(newAction);
    setInterestConfirmModalOpen(true);
  };

  // Handle confirmed interest action
  const handleConfirmInterest = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const newState = interestAction === "add";
    interestMutation.mutate(newState);
    setInterestConfirmModalOpen(false);
  };

  // Handle dialog close without navigation
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setInterestConfirmModalOpen(false);
    }
  };



  // Assignment functionality is now handled by TenderAssignDialog







  // Current user is now obtained from useUser hook above

  // Get tender data for the approval dialog
  const { data: tenderData } = useQuery({
    queryKey: [`/api/tenders/${tenderId}`],
    enabled: !!tenderId,
  });


  
  // Handlers
  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    starMutation.mutate(!currentIsStarred);
  };

  const handleInterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Show confirmation modal instead of directly mutating
    setInterestAction(!currentIsInterested ? "add" : "remove");
    setInterestConfirmModalOpen(true);
  };



  // Assignment is now handled by TenderAssignDialog

  const handleFinanceRequestClose = () => {
    setFinanceModalOpen(false);
  };

  const handleStatusUpdateClose = () => {
    setStatusModalOpen(false);
  };


  
  const handleTaskAllocationSubmit = () => {
    // Task allocation is handled internally by the TaskAllocationDialog
    setTaskAllocationModalOpen(false);
  };

  return (
    <>
      <div 
        className="flex space-x-1" 
        onClick={(e) => {
          console.log("Action buttons container clicked");
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <TooltipProvider>
          {/* Star Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0" 
                onClick={handleStar}
                disabled={starMutation.isPending}
              >
                <Star 
                  className={`h-4 w-4 ${currentIsStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-500"}`} 
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentIsStarred ? "Remove from starred" : "Add to starred"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Interest Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0" 
                onClick={handleInterest}
                disabled={interestMutation.isPending}
              >
                <Heart 
                  className={`h-4 w-4 ${currentIsInterested ? "fill-red-500 text-red-500" : "text-gray-500"}`} 
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentIsInterested ? "Remove interest" : "Mark as interested"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Reminder Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0 text-blue-600" 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setReminderPopupOpen(true);
                }}
              >
                <Clock className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Set reminder</p>
            </TooltipContent>
          </Tooltip>

          {/* Assign Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0 text-blue-600" 
                onClick={(e) => {
                  console.log("Assign button clicked - preventing propagation");
                  e.stopPropagation();
                  e.preventDefault();
                  console.log("Setting assign modal open to true");
                  setAssignModalOpen(true);
                }}
              >
                <Users className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Assign tender</p>
            </TooltipContent>
          </Tooltip>

          {/* Finance Request Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0 text-blue-600" 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setFinanceModalOpen(true);
                }}
              >
                <BadgeDollarSign className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Request To Finance</p>
            </TooltipContent>
          </Tooltip>

          {/* Kick Off Call Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0 text-blue-600" 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setKickOffCallModalOpen(true);
                }}
              >
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Kick Off Call</p>
            </TooltipContent>
          </Tooltip>

          {/* Status Update Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0 text-blue-600" 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setStatusModalOpen(true);
                }}
              >
                <FileCheck className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tender Status</p>
            </TooltipContent>
          </Tooltip>

          {/* Approval Request Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0 text-blue-600" 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setApprovalModalOpen(true);
                }}
              >
                <FileEdit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Request To Approval</p>
            </TooltipContent>
          </Tooltip>

          {/* Task Allocation Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0 text-blue-600" 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setTaskAllocationModalOpen(true);
                }}
              >
                <ClipboardList className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Allocate task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Modals */}


      <TenderAssignDialog
        isOpen={assignModalOpen}
        onClose={() => {
          console.log("Assign modal being closed");
          setAssignModalOpen(false);
        }}
        tenderId={tenderId}
        tenderReferenceNo={tenderReferenceNo}
      />

      <RequestToFinanceDialog
        open={financeModalOpen}
        onOpenChange={setFinanceModalOpen}
        tender={tenderData || {
          id: tenderId,
          referenceNo: tenderReferenceNo,
          brief: "",
          authority: "",
          value: null,
          status: status || "new"
        } as any}
      />

      <TenderStatusDialog
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        tender={tenderData || {
          id: tenderId,
          referenceNo: tenderReferenceNo,
          status: status || "new"
        } as any}
      />

      <RequestApprovalDialog
        open={approvalModalOpen}
        onOpenChange={setApprovalModalOpen}
        tender={tenderData}
      />

      <TaskAllocationDialog
        open={taskAllocationModalOpen}
        onOpenChange={setTaskAllocationModalOpen}
        tenderId={tenderId}
      />

      <KickOffCallDialog
        isOpen={kickOffCallModalOpen}
        onClose={() => setKickOffCallModalOpen(false)}
        tenderId={tenderId}
      />

      {/* Interest Confirmation Modal */}
      <Dialog open={interestConfirmModalOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>
              Interested Confirmation
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-center text-gray-700">
              {interestAction === "add" 
                ? "Tender is mark as interested" 
                : "Tender is removed from Interested"
              }
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleConfirmInterest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              disabled={interestMutation.isPending}
            >
              {interestMutation.isPending ? "Processing..." : "Ok"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Right-Corner Reminder Popup */}
      <TenderReminderPopup
        isOpen={reminderPopupOpen}
        onClose={() => setReminderPopupOpen(false)}
        tenderId={tenderId}
        tenderReferenceNo={tenderReferenceNo}
      />
    </>
  );
}