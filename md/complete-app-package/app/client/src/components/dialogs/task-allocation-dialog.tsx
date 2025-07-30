import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Clock, Upload, User, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { apiRequest } from "@/lib/queryClient";

const taskAllocationSchema = z.object({
  taskName: z.string().min(1, "Task name is required"),
  assignedTo: z.number().min(1, "Please select a user to assign to"),
  taskDeadline: z.date(),
  reminderTime: z.string().min(1, "Reminder time is required"),
  remarks: z.string().optional(),
});

type FormData = z.infer<typeof taskAllocationSchema>;

interface TaskAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenderId: number;
}

export function TaskAllocationDialog({
  open,
  onOpenChange,
  tenderId,
}: TaskAllocationDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(taskAllocationSchema),
    defaultValues: {
      taskName: "",
      assignedTo: undefined,
      taskDeadline: new Date(),
      reminderTime: format(new Date(), "HH:mm"),
      remarks: "",
    },
  });

  // Fetch all users for assignment dropdown
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    enabled: open,
  });

  // Fetch tender details to display tender ID
  const { data: tender, isLoading: tenderLoading } = useQuery({
    queryKey: [`/api/tenders/${tenderId}`],
    enabled: open && tenderId > 0,
  });
  
  // Debug log to check if tender data is being fetched
  console.log("Task Allocation Dialog - Tender Data:", { tenderId, open });

  // Fetch existing task allocations for this tender
  const { data: taskAllocations = [] } = useQuery({
    queryKey: [`/api/task-allocations`, tenderId],
    enabled: open,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: FormData & { filePath?: string }) => {
      const response = await apiRequest("POST", "/api/task-allocations", {
        tenderId: tenderId,
        taskName: data.taskName,
        assignedTo: data.assignedTo,
        taskDeadline: typeof data.taskDeadline === 'string' ? data.taskDeadline : data.taskDeadline.toISOString(),
        remarks: data.remarks,
        assignedBy: user?.id || 1,
        status: "Pending",
        filePath: data.filePath,
      });

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Task Allocated Successfully",
        description: "The task has been assigned to the selected user.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/task-allocations`, tenderId] });
      form.reset({
        taskName: "",
        assignedTo: 0,
        taskDeadline: new Date(),
        reminderTime: format(new Date(), "HH:mm"),
        remarks: "",
      });
      setFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to allocate task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Combine date and time
      const [hours, minutes] = data.reminderTime.split(':');
      const combinedDateTime = new Date(data.taskDeadline);
      combinedDateTime.setHours(parseInt(hours), parseInt(minutes));

      let filePath: string | undefined;
      
      if (file) {
        // Upload file first
        const formData = new FormData();
        formData.append("file", file);
        formData.append("tenderId", tenderId.toString());
        
        // Get current user from localStorage for authentication
        const storedUser = localStorage.getItem('startender_user');
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        
        const headers: Record<string, string> = {};
        if (currentUser?.id) {
          headers["x-user-id"] = currentUser.id.toString();
        }
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          headers,
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file");
        }
        
        const uploadResult = await uploadResponse.json();
        filePath = uploadResult.filePath;
      }

      await createTaskMutation.mutateAsync({
        ...data,
        taskDeadline: combinedDateTime.toISOString(),
        filePath,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to allocate task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            Task Allocation
          </DialogTitle>
          {tender && (
            <div className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded-md border">
              <span className="font-semibold text-purple-600">Tender ID:</span> {tender.referenceNo}
            </div>
          )}
          {tenderLoading && (
            <div className="text-sm text-gray-500 mt-2">Loading tender details...</div>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Assign To *
                    </FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select User" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
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
                name="taskName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name:</FormLabel>
                    <FormControl>
                      <Input placeholder="Task Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taskDeadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Task Deadline *</FormLabel>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "flex-1 pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "yyyy-MM-dd")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <FormField
                        control={form.control}
                        name="reminderTime"
                        render={({ field: timeField }) => (
                          <FormControl>
                            <Input
                              type="time"
                              placeholder="Reminder Date"
                              {...timeField}
                              className="w-32"
                            />
                          </FormControl>
                        )}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Attach File (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.xlsx,.xls"
                  />
                </FormControl>
                {file && (
                  <p className="text-sm text-gray-600">
                    Selected: {file.name}
                  </p>
                )}
              </FormItem>
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Remarks :
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Remarks"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.reset();
                  setFile(null);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
              >
                Clear
              </Button>
              <Button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {createTaskMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* Task Allocations Table */}
        <div className="mt-6">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg font-bold">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium">
              <div>#</div>
              <div>ASSIGN BY</div>
              <div>ASSIGN TO</div>
              <div>REMARK</div>
              <div>ASSIGN DATE TIME</div>
              <div>ACTION</div>
            </div>
          </div>
          <div className="border border-t-0 rounded-b-lg min-h-[100px]">
            {taskAllocations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No task allocations found
              </div>
            ) : (
              taskAllocations.map((task: any, index: number) => (
                <div key={task.id} className="grid grid-cols-6 gap-4 p-3 text-sm border-b last:border-b-0">
                  <div className="font-medium">{index + 1}</div>
                  <div className="text-blue-600">{task.assignedByName || 'Unknown'}</div>
                  <div>{task.assignedToName || 'Unknown'}</div>
                  <div>
                    <div className="max-w-[150px] truncate" title={task.remarks}>
                      {task.remarks || 'No remarks'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {task.taskDeadline ? format(new Date(task.taskDeadline), "yyyy-MM-dd HH:mm") : 'N/A'}
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="h-6 w-6 p-0" title="View">
                      <FileText className="h-3 w-3" />
                    </Button>
                    {task.filePath && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 w-6 p-0" 
                        title="Download File"
                        onClick={() => window.open(task.filePath, '_blank')}
                      >
                        <Upload className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}