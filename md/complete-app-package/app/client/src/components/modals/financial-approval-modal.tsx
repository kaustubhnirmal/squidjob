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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Form schema
const formSchema = z.object({
  tenderId: z.number(),
  requesterId: z.number(),
  financeUserId: z.number().optional(),
  approvalType: z.string().min(1, "Please select an approval type"),
  requestAmount: z.string().optional(),
  reminderDate: z.date({
    required_error: "Please select a reminder date"
  }),
  notes: z.string().optional(),
  status: z.string().default("pending")
});

export type FinancialApprovalFormValues = z.infer<typeof formSchema>;

interface FinancialApprovalModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FinancialApprovalFormValues) => Promise<void>;
  tenderId: number;
  financeUsers: Array<{ id: number; name: string }>;
  currentUserId: number;
}

export default function FinancialApprovalModal({
  open,
  onClose,
  onSubmit,
  tenderId,
  financeUsers,
  currentUserId
}: FinancialApprovalModalProps) {
  // Form definition
  const form = useForm<FinancialApprovalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenderId,
      requesterId: currentUserId,
      approvalType: "",
      status: "pending",
      reminderDate: new Date()
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  // Handle form submission
  const handleSubmit = async (values: FinancialApprovalFormValues) => {
    try {
      await onSubmit(values);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting financial approval:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Financial Approval Request</DialogTitle>
          <DialogDescription>
            Submit a financial approval request for this tender.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                      <SelectItem value="EMD Payment" onClick={(e) => e.stopPropagation()}>EMD Payment</SelectItem>
                      <SelectItem value="EMD Refund" onClick={(e) => e.stopPropagation()}>EMD Refund</SelectItem>
                      <SelectItem value="SD Payment" onClick={(e) => e.stopPropagation()}>SD Payment</SelectItem>
                      <SelectItem value="SD Refund" onClick={(e) => e.stopPropagation()}>SD Refund</SelectItem>
                      <SelectItem value="PBG Payment" onClick={(e) => e.stopPropagation()}>PBG Payment</SelectItem>
                      <SelectItem value="PBG Refund" onClick={(e) => e.stopPropagation()}>PBG Refund</SelectItem>
                      <SelectItem value="Other Payment" onClick={(e) => e.stopPropagation()}>Other Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="financeUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger onClick={(e) => e.stopPropagation()}>
                        <SelectValue placeholder="Select finance team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      {financeUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()} onClick={(e) => e.stopPropagation()}>
                          {user.name}
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
              name="requestAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter amount" 
                      type="text" 
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reminderDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Reminder Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                      placeholder="Add any additional information about this request" 
                      className="resize-none" 
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                onClick={(e) => e.stopPropagation()}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}