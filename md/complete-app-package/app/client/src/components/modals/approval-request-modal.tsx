import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Define the approval request form validation schema
const approvalRequestSchema = z.object({
  approverId: z.coerce.number({
    required_error: "Please select an approver",
  }),
  priority: z.string().default("medium"),
  approvalType: z.string({
    required_error: "Please select an approval type",
  }),
  requestNotes: z.string().min(1, {
    message: "Please provide details about what you need approval for",
  }),
});

// Type for the form values
export type ApprovalRequestValues = z.infer<typeof approvalRequestSchema>;

// Type for approver data
interface Approver {
  id: number;
  name: string;
  role?: string;
  department?: string;
}

interface ApprovalRequestModalProps {
  open: boolean;
  tenderId: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApprovalRequestValues) => void;
}

export function ApprovalRequestModal({ open, tenderId, onOpenChange, onSubmit }: ApprovalRequestModalProps) {
  const form = useForm<ApprovalRequestValues>({
    resolver: zodResolver(approvalRequestSchema),
    defaultValues: {
      priority: "medium",
      approvalType: "technical",
      requestNotes: "",
    },
  });

  // Fetch approvers to populate dropdown
  const { data: approvers, isLoading } = useQuery<Approver[]>({
    queryKey: ['/api/users/approvers'],
  });

  const handleSubmit = (data: ApprovalRequestValues) => {
    onSubmit({
      ...data,
      // tenderId will be added in the parent component
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Approval</DialogTitle>
          <DialogDescription>
            Submit an approval request for this tender.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="approverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approver</FormLabel>
                  <Select 
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger onClick={(e) => e.stopPropagation()}>
                        <SelectValue placeholder="Select an approver" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      {approvers?.map(approver => (
                        <SelectItem key={approver.id} value={approver.id.toString()} onClick={(e) => e.stopPropagation()}>
                          {approver.name} {approver.role ? `(${approver.role})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="approvalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approval Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger onClick={(e) => e.stopPropagation()}>
                        <SelectValue placeholder="Select approval type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      <SelectItem value="technical" onClick={(e) => e.stopPropagation()}>Technical Approval</SelectItem>
                      <SelectItem value="financial" onClick={(e) => e.stopPropagation()}>Financial Approval</SelectItem>
                      <SelectItem value="submission" onClick={(e) => e.stopPropagation()}>Submission Approval</SelectItem>
                      <SelectItem value="other" onClick={(e) => e.stopPropagation()}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger onClick={(e) => e.stopPropagation()}>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      <SelectItem value="low" onClick={(e) => e.stopPropagation()}>Low</SelectItem>
                      <SelectItem value="medium" onClick={(e) => e.stopPropagation()}>Medium</SelectItem>
                      <SelectItem value="high" onClick={(e) => e.stopPropagation()}>High</SelectItem>
                      <SelectItem value="urgent" onClick={(e) => e.stopPropagation()}>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requestNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what you need approval for..."
                      className="resize-none min-h-[100px]"
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                onClick={(e) => e.stopPropagation()}
              >
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}