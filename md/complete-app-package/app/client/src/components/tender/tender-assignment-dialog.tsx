import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  department: string;
}

interface Assignment {
  id: number;
  tenderId: number;
  userId: number;
  assignedBy: number;
  assignType: string;
  comments: string;
  createdAt: string;
  user: {
    name: string;
  };
  assignedByUser?: {
    name: string;
  };
}

interface TenderAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: number;
  tenderReferenceNo: string;
}

export function TenderAssignmentDialog({ 
  isOpen, 
  onClose, 
  tenderId, 
  tenderReferenceNo 
}: TenderAssignmentDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users for assignment
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });

  // Fetch existing assignments for this tender
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['/api/tenders', tenderId, 'assignments'],
    queryFn: async () => {
      const res = await fetch(`/api/tenders/${tenderId}/assignments`);
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return res.json();
    },
    enabled: isOpen && !!tenderId
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (data: { userId: number; remarks: string }) => {
      const res = await apiRequest("POST", `/api/tenders/${tenderId}/assign`, {
        userId: data.userId,
        comments: data.remarks,
        assignType: "individual"
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tender assigned successfully"
      });
      setSelectedUserId("");
      setRemarks("");
      queryClient.invalidateQueries({ queryKey: ['/api/tenders', tenderId, 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign tender",
        variant: "destructive"
      });
    }
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      const res = await apiRequest("DELETE", `/api/tenders/${tenderId}/assignments/${assignmentId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment removed successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tenders', tenderId, 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove assignment",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive"
      });
      return;
    }

    createAssignmentMutation.mutate({
      userId: parseInt(selectedUserId),
      remarks
    });
  };

  const handleDeleteAssignment = (assignmentId: number) => {
    if (window.confirm("Are you sure you want to remove this assignment?")) {
      deleteAssignmentMutation.mutate(assignmentId);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tender Assign</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tender Info */}
          <div>
            <Label className="text-sm font-medium">Tender Id:</Label>
            <div className="text-sm text-gray-600">{tenderReferenceNo}</div>
          </div>

          {/* Assignment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="user" className="text-sm font-medium">
                Select User <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="remarks" className="text-sm font-medium">
                Remarks <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks"
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createAssignmentMutation.isPending}
            >
              {createAssignmentMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </form>

          {/* Assignments Table */}
          <div>
            <h3 className="text-lg font-medium mb-4">Assignment History</h3>
            {isLoadingAssignments ? (
              <div>Loading assignments...</div>
            ) : assignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-blue-600">
                    <tr>
                      <th className="px-4 py-2 text-left text-white text-sm font-medium">ASSIGNED BY</th>
                      <th className="px-4 py-2 text-left text-white text-sm font-medium">ASSIGN TO</th>
                      <th className="px-4 py-2 text-left text-white text-sm font-medium">REMARKS</th>
                      <th className="px-4 py-2 text-left text-white text-sm font-medium">ASSIGN DATE TIME</th>
                      <th className="px-4 py-2 text-left text-white text-sm font-medium">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assignments.map((assignment: Assignment, index: number) => (
                      <tr key={assignment.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="px-4 py-2 text-sm">
                          {assignment.assignedByUser?.name || "System"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {assignment.user.name}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {assignment.comments || "No remarks"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {formatDateTime(assignment.createdAt)}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            disabled={deleteAssignmentMutation.isPending}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No assignments found for this tender
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}