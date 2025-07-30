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

// Define the finance request form validation schema
const financeRequestSchema = z.object({
  userId: z.coerce.number({
    required_error: "Please select a finance team member",
  }),
  priority: z.string().default("medium"),
  requestedAmount: z.string().optional(),
  requestType: z.string({
    required_error: "Please select a request type",
  }),
  comments: z.string().optional(),
});

// Type for the form values
export type FinanceRequestValues = z.infer<typeof financeRequestSchema>;

// Type for team member data
interface FinanceTeamMember {
  id: number;
  name: string;
  role?: string;
  department?: string;
}

interface FinanceRequestModalProps {
  open: boolean;
  tenderId: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FinanceRequestValues) => void;
}

export function FinanceRequestModal({ open, tenderId, onOpenChange, onSubmit }: FinanceRequestModalProps) {
  const form = useForm<FinanceRequestValues>({
    resolver: zodResolver(financeRequestSchema),
    defaultValues: {
      priority: "medium",
      requestType: "emd",
      comments: "",
    },
  });

  // Fetch finance team members to populate dropdown
  const { data: financeTeam, isLoading } = useQuery<FinanceTeamMember[]>({
    queryKey: ['/api/users/finance'],
  });

  const handleSubmit = async (data: FinanceRequestValues) => {
    try {
      const response = await fetch(`/api/tenders/${tenderId}/finance-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(data.userId.toString()),
          requestType: data.requestType,
          requestedAmount: data.requestedAmount,
          priority: data.priority,
          comments: data.comments
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Finance request created successfully:', result);
        onSubmit(data);
        onOpenChange(false);
      } else {
        const error = await response.json();
        console.error('Failed to create finance request:', error);
        onSubmit(data);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error submitting finance request:', error);
      onSubmit(data);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Finance Request</DialogTitle>
          <DialogDescription>
            Submit a finance-related request for this tender.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Finance Team Member</FormLabel>
                  <Select 
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select finance team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {financeTeam?.map(member => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.name} {member.role ? `(${member.role})` : ''}
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
              name="requestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="emd">EMD Payment</SelectItem>
                      <SelectItem value="tender_fee">Tender Fee</SelectItem>
                      <SelectItem value="performance_guarantee">Performance Guarantee</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requestedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requested Amount (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Enter amount" 
                      {...field}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                    />
                  </FormControl>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
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
                  <FormLabel>Additional Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any details about this request..."
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}