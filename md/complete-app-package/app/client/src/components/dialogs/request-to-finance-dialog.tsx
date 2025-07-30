import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X, Eye, Edit, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Tender } from "@shared/schema";

const financialRequestSchema = z.object({
  requirement: z.enum([
    "Document Fees",
    "EMD",
    "Registration Fees",
    "Bank Guarantee",
    "Security Deposit",
    "Other Expense",
    "Processing Fees"
  ]),
  amount: z.number().positive("Amount must be positive"),
  deadline: z.date(),
  reminderTime: z.string().min(1, "Reminder time is required"),
  requestTo: z.number({
    required_error: "Please select a user to request",
    invalid_type_error: "Please select a user to request"
  }).min(1, "Please select a user to request"),
  payment: z.enum(["Offline", "Online"]),
  paymentDescription: z.string().min(1, "Payment description is required"),
  uploadedFile: z.any().optional(),
});

type FinancialRequestForm = z.infer<typeof financialRequestSchema>;

interface RequestToFinanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tender: Tender;
}

export function RequestToFinanceDialog({
  open,
  onOpenChange,
  tender,
}: RequestToFinanceDialogProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<FinancialRequestForm>({
    resolver: zodResolver(financialRequestSchema),
    defaultValues: {
      requirement: "Document Fees",
      amount: 0,
      deadline: new Date(),
      reminderTime: format(new Date(), "HH:mm"),
      requestTo: undefined,
      payment: "Offline",
      paymentDescription: "",
    },
  });

  // Fetch all users for the Request To dropdown
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    enabled: open,
  });

  // Fetch existing financial requests for this tender
  const { data: financialRequests = [] } = useQuery({
    queryKey: [`/api/tenders/${tender.id}/financial-approvals`],
    enabled: open,
  });

  const createFinancialRequest = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/tenders/financial-approvals', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create financial request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tender.id}/financial-approvals`] });
      form.reset({
        requirement: "Document Fees",
        amount: 0,
        deadline: new Date(),
        reminderTime: format(new Date(), "HH:mm"),
        requestTo: undefined,
        payment: "Offline",
        paymentDescription: "",
      });
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      console.error('Financial request error:', error);
    },
  });

  const onSubmit = async (data: FinancialRequestForm) => {
    try {
      // Combine date and time
      const [hours, minutes] = data.reminderTime.split(':');
      const combinedDateTime = new Date(data.deadline);
      combinedDateTime.setHours(parseInt(hours), parseInt(minutes));

      const formData = new FormData();
      formData.append('tenderId', tender.id.toString());
      formData.append('requirement', data.requirement);
      formData.append('amount', data.amount.toString());
      formData.append('deadline', combinedDateTime.toISOString());
      formData.append('requestTo', data.requestTo.toString());
      formData.append('payment', data.payment);
      formData.append('paymentDescription', data.paymentDescription);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await createFinancialRequest.mutateAsync(formData);
    } catch (error) {
      console.error("Error creating financial request:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleClear = () => {
    form.reset({
      requirement: "Document Fees",
      amount: 0,
      deadline: new Date(),
      reminderTime: format(new Date(), "HH:mm"),
      requestTo: undefined,
      payment: "Offline",
      paymentDescription: "",
    });
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Request To Finance</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tender Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-600">Tender ID</label>
              <p className="text-sm font-semibold text-blue-600">{tender.referenceNo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tender Brief</label>
              <p className="text-sm">{tender.brief}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tender Authority</label>
              <p className="text-sm">{tender.authority}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tender Value</label>
              <p className="text-sm">₹{tender.emdAmount ? Number(tender.emdAmount).toLocaleString() : 'N/A'}</p>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Requirement */}
                <FormField
                  control={form.control}
                  name="requirement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirement *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select requirement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Document Fees">Document Fees</SelectItem>
                          <SelectItem value="EMD">EMD</SelectItem>
                          <SelectItem value="Registration Fees">Registration Fees</SelectItem>
                          <SelectItem value="Bank Guarantee">Bank Guarantee</SelectItem>
                          <SelectItem value="Security Deposit">Security Deposit</SelectItem>
                          <SelectItem value="Other Expense">Other Expense</SelectItem>
                          <SelectItem value="Processing Fees">Processing Fees</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Amount"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            field.onChange(Number(value) || 0);
                          }}
                          className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Combined Deadline with Time */}
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline *</FormLabel>
                      <div className="flex gap-2">
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "flex-1 pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd-MM-yyyy")
                                ) : (
                                  <span>Reminder Date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setIsCalendarOpen(false);
                              }}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormField
                          control={form.control}
                          name="reminderTime"
                          render={({ field: timeField }) => (
                            <FormControl>
                              <div className="flex items-center gap-1 w-24">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <Input
                                  type="time"
                                  {...timeField}
                                  className="text-xs"
                                />
                              </div>
                            </FormControl>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Request To */}
                <FormField
                  control={form.control}
                  name="requestTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request To *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value > 0 ? field.value.toString() : ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select User" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(users as any[])?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name}
                            </SelectItem>
                          )) || []}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment and Upload File in same row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Payment */}
                  <FormField
                    control={form.control}
                    name="payment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Payment Mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Offline">Offline</SelectItem>
                            <SelectItem value="Online">Online</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Upload File */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload File :</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        id="fileUpload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setSelectedFile(file || null);
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          document.getElementById('fileUpload')?.click();
                        }}
                      >
                        Choose Files
                      </Button>
                      <span className="text-sm text-gray-500">
                        {selectedFile ? selectedFile.name : "No file chosen"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Description */}
              <FormField
                control={form.control}
                name="paymentDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Payment Description"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={createFinancialRequest.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  {createFinancialRequest.isPending ? "Submitting..." : "Submit"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  Clear
                </Button>
              </div>
            </form>
          </Form>

          {/* Financial Requests Table */}
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-600 hover:bg-blue-600">
                  <TableHead className="text-white font-medium">#</TableHead>
                  <TableHead className="text-white font-medium">Request To</TableHead>
                  <TableHead className="text-white font-medium">Requirement & Amount</TableHead>
                  <TableHead className="text-white font-medium">Request Status & Status Updated Date</TableHead>
                  <TableHead className="text-white font-medium">Requested Date & Request Deadline Date</TableHead>
                  <TableHead className="text-white font-medium">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialRequests && (financialRequests as any[]).length > 0 ? (
                  (financialRequests as any[]).map((request: any, index: number) => {
                    const requestedUser = (users as any[])?.find((u: any) => u.id === request.requestTo);
                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="text-blue-600">{requestedUser?.name || 'Samarth Patel'}</TableCell>
                        <TableCell>
                          <div className="font-medium">{request.requirement} - ₹{Number(request.amount).toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <Badge variant="default" className="w-fit mb-1 bg-green-100 text-green-800">
                              {request.status || 'Complete'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {request.updatedAt ? format(new Date(request.updatedAt), "dd-MM-yyyy HH:mm") : format(new Date(), "dd-MM-yyyy HH:mm")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div>{request.createdAt ? format(new Date(request.createdAt), "dd-MM-yyyy HH:mm") : 'N/A'}</div>
                            <div>→</div>
                            <div>{request.deadline ? format(new Date(request.deadline), "dd-MM-yyyy HH:mm") : 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Download File">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                      No financial requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-b-lg text-sm mt-2">
              <div>Show 10</div>
              <div>Page 1 of 1</div>
              <div className="flex space-x-1">
                <Button size="sm" variant="outline" disabled>Prev</Button>
                <Button size="sm" variant="outline" className="bg-blue-600 text-white">1</Button>
                <Button size="sm" variant="outline" disabled>Next</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}