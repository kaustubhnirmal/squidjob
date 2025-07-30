import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { X, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useUser } from "@/hooks/use-user";

interface TenderAssignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: number;
  tenderReferenceNo: string;
}

interface Assignment {
  id: number;
  tenderId: number;
  assignedBy: string;
  assignedByName: string;
  assignedTo: string;
  remarks: string;
  assignedAt: string;
  assignedByUserId: number;
  assignedToUserId: number;
}

export function TenderAssignDialog({
  isOpen,
  onClose,
  tenderId,
  tenderReferenceNo,
}: TenderAssignDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useUser();

  // Get users for assignment dropdown
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: getQueryFn({ on401: "redirect" }),
  });

  // Get current assignments
  const { data: assignments = [], refetch: refetchAssignments } = useQuery({
    queryKey: [`/api/tenders/${tenderId}/assignments`],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: isOpen && !!tenderId,
  });

  // Assignment mutation
  const assignMutation = useMutation({
    mutationFn: async (data: {
      userId: number;
      comments: string;
      assignedBy: number;
    }) => {
      const response = await apiRequest(`/api/tenders/${tenderId}/assign`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      console.log("Assignment successful - dialog should remain open");
      toast({
        title: "Tender Assigned",
        description: "Tender has been successfully assigned and email notification sent.",
      });
      refetchAssignments();
      // More specific query invalidation to prevent page re-render issues
      queryClient.invalidateQueries({ queryKey: ['/api/tenders', tenderId, 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assigned-tenders'] });
      setSelectedUserId(""); // Clear selection to allow assigning to another user
      // NOTE: Dialog should remain open for multiple assignments - DO NOT call onClose()
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign tender",
        variant: "destructive",
      });
    },
  });

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      const response = await apiRequest(`/api/tenders/${tenderId}/assignments/${assignmentId}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assignment Removed",
        description: "Tender assignment has been removed successfully.",
      });
      refetchAssignments();
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assigned-tenders'] });
      // Do NOT close dialog or navigate
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to remove assignment",
        variant: "destructive",
      });
    },
  });

  const handleAssign = () => {
    if (usersLoading) {
      toast({
        title: "Loading",
        description: "Users are still loading. Please wait...",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedUserId || selectedUserId === "" || selectedUserId === null || selectedUserId === undefined) {
      toast({
        title: "Invalid Selection",
        description: "Please select a user to assign the tender to.",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "User authentication required. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    // Send assignedBy in the request body along with user ID
    console.log("About to assign tender:", {
      userId: parseInt(selectedUserId),
      assignedBy: currentUser.id,
      currentUser: currentUser
    });
    
    assignMutation.mutate({
      userId: parseInt(selectedUserId),
      comments: "", // Empty comments since we removed the remarks field
      assignedBy: currentUser.id
    });
  };

  const handleDelete = (assignmentId: number) => {
    deleteMutation.mutate(assignmentId);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log("Dialog onOpenChange called:", open);
        console.log("Assignment pending:", assignMutation.isPending);
        console.log("Delete pending:", deleteMutation.isPending);
        
        // Prevent closing while mutations are pending
        if (!open && (assignMutation.isPending || deleteMutation.isPending)) {
          console.log("Preventing dialog close due to pending mutations");
          return;
        }
        
        // Only call onClose when dialog should actually close (open = false)
        if (!open) {
          console.log("Closing dialog via onOpenChange");
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Tender Assign
          </DialogTitle>

        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Form */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tender-id">Tender ID</Label>
                <Input
                  id="tender-id"
                  value={tenderReferenceNo}
                  readOnly
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="select-user">Select User *</Label>
                <Select value={selectedUserId} onValueChange={(value) => {
                  console.log("User selected:", value);
                  setSelectedUserId(value);
                }}>
                  <SelectTrigger id="select-user">
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(users) && users.length > 0 ? (
                      users.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name || user.username}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        {usersLoading ? "Loading users..." : "No users available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>


            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Select a user and click "Assign" to assign this tender. You can assign to multiple users.
              </p>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="px-4 py-2"
                >
                  Close Dialog
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={!selectedUserId || assignMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2"
                >
                  {assignMutation.isPending ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </div>
          </div>

          {/* Assignments Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Assignments</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table className="w-full"
                style={{ 
                  tableLayout: 'fixed',
                  borderCollapse: 'separate',
                  borderSpacing: 0
                }}
              >
                <TableHeader>
                  <TableRow className="bg-purple-600" style={{ backgroundColor: '#7c3aed !important' }}>
                    <TableHead className="text-white text-center w-12 font-semibold border-none" style={{ color: 'white !important', opacity: 1, backgroundColor: '#7c3aed' }}>#</TableHead>
                    <TableHead className="text-white text-center font-semibold border-none" style={{ color: 'white !important', opacity: 1, backgroundColor: '#7c3aed' }}>ASSIGN TO</TableHead>
                    <TableHead className="text-white text-center font-semibold border-none" style={{ color: 'white !important', opacity: 1, backgroundColor: '#7c3aed' }}>ASSIGN BY</TableHead>
                    <TableHead className="text-white text-center font-semibold border-none" style={{ color: 'white !important', opacity: 1, backgroundColor: '#7c3aed' }}>ASSIGN DATE TIME</TableHead>
                    <TableHead className="text-white text-center w-20 font-semibold border-none" style={{ color: 'white !important', opacity: 1, backgroundColor: '#7c3aed' }}>ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    console.log("Rendering assignments table, data:", assignments);
                    console.log("Assignments length:", assignments.length);
                    return assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          No assignments found for this tender.
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignments.map((assignment: Assignment, index: number) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="text-center">{assignment.assignedTo}</TableCell>
                        <TableCell className="text-center">{assignment.assignedBy}</TableCell>
                        <TableCell className="text-center">
                          {assignment.assignedAt ? 
                            new Date(assignment.assignedAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })
                            : "—"
                          }
                        </TableCell>
                        <TableCell className="text-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-gray-900">Are you sure you want to remove this assignment?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                  This action cannot be undone. This will permanently remove the assignment from this tender.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(assignment.id)}
                                  className="bg-purple-600 text-white hover:bg-purple-700"
                                >
                                  OK
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                      ))
                    );
                  })()}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}