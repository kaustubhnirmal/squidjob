import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";

// Define the reminder form validation schema
const reminderFormSchema = z.object({
  reminderDate: z.date({
    required_error: "Please select a date for the reminder",
  }),
  reminderTime: z.string().min(1, { message: "Please enter a time for the reminder" }),
  comments: z.string().optional(),
  sendEmail: z.boolean().default(true),
  sendNotification: z.boolean().default(true),
});

// Type for the form values
export type ReminderFormValues = z.infer<typeof reminderFormSchema>;

interface ReminderModalProps {
  open: boolean;
  tenderId: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReminderFormValues) => void;
}

export function ReminderModal({ open, tenderId, onOpenChange, onSubmit }: ReminderModalProps) {
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      reminderDate: new Date(),
      reminderTime: "09:00",
      comments: "",
      sendEmail: true,
      sendNotification: true,
    },
  });

  const handleSubmit = (data: ReminderFormValues) => {
    onSubmit({
      ...data,
      // Combine date and time for the backend
      reminderDate: new Date(
        data.reminderDate.setHours(
          parseInt(data.reminderTime.split(":")[0]),
          parseInt(data.reminderTime.split(":")[1]),
          0,
          0
        )
      ),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
          <DialogDescription>
            Create a reminder for this tender. You'll receive notifications based on your preferences.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(handleSubmit)} 
            className="space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
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
                          className={`w-full pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
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
              name="reminderTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder Time</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        {...field}
                      />
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this reminder..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="sendEmail"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormLabel className="m-0">Send Email</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sendNotification"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormLabel className="m-0">Send Notification</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Set Reminder</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}