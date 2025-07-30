import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// Define status options
const TENDER_STATUSES = [
  { value: "new", label: "New" },
  { value: "in_process", label: "In Process" },
  { value: "submitted", label: "Submitted" },
  { value: "under_evaluation", label: "Under Evaluation" },
  { value: "awarded", label: "Awarded" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
] as const;

// Define the status update form validation schema
const statusUpdateSchema = z.object({
  status: z.string({
    required_error: "Please select a status",
  }),
  comments: z.string().optional(),
});

// Type for the form values
export type StatusUpdateValues = z.infer<typeof statusUpdateSchema>;

interface StatusUpdateModalProps {
  open: boolean;
  tenderId: number;
  currentStatus: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StatusUpdateValues) => void;
}

export function StatusUpdateModal({ 
  open, 
  tenderId, 
  currentStatus, 
  onOpenChange, 
  onSubmit 
}: StatusUpdateModalProps) {
  const form = useForm<StatusUpdateValues>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: currentStatus || "new",
      comments: "",
    },
  });

  const handleSubmit = (data: StatusUpdateValues) => {
    onSubmit({
      ...data,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Tender Status</DialogTitle>
          <DialogDescription>
            Change the status of this tender and add optional notes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger onClick={(e) => e.stopPropagation()}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      {TENDER_STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value} onClick={(e) => e.stopPropagation()}>
                          {status.label}
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
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Status Change</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this status change..."
                      className="resize-none"
                      {...field}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
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
                Update Status
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}