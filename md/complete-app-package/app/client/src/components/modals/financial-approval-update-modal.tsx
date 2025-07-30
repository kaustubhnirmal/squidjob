import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Form schema
const formSchema = z.object({
  status: z.string().min(1, "Please select a status"),
  notes: z.string().optional(),
});

export type FinancialApprovalUpdateValues = z.infer<typeof formSchema>;

interface FinancialApprovalUpdateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FinancialApprovalUpdateValues) => Promise<void>;
  approvalId: number;
  currentStatus: string;
}

export default function FinancialApprovalUpdateModal({
  open,
  onClose,
  onSubmit,
  approvalId,
  currentStatus
}: FinancialApprovalUpdateModalProps) {
  // Form definition
  const form = useForm<FinancialApprovalUpdateValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: currentStatus,
      notes: ""
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  // Handle form submission
  const handleSubmit = async (values: FinancialApprovalUpdateValues) => {
    try {
      await onSubmit(values);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error updating financial approval:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Financial Approval</DialogTitle>
          <DialogDescription>
            Update the status of this financial approval request.
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_process">In Process</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional notes about this status update" 
                      className="resize-none" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}