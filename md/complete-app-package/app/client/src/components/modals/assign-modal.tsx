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

// Define the assign form validation schema
const assignFormSchema = z.object({
  userId: z.coerce.number({
    required_error: "Please select a team member to assign",
  }),
  comments: z.string().optional(),
});

// Type for the form values
export type AssignFormValues = z.infer<typeof assignFormSchema>;

// Type for team member data
interface TeamMember {
  id: number;
  name: string;
  role?: string;
  department?: string;
}

interface AssignModalProps {
  open: boolean;
  tenderId: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AssignFormValues) => void;
}

export function AssignModal({ open, tenderId, onOpenChange, onSubmit }: AssignModalProps) {
  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignFormSchema),
    defaultValues: {
      comments: "",
    },
  });

  // Fetch team members from database to populate dropdown
  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/users'],
  });

  const handleSubmit = (data: AssignFormValues) => {
    // Add the tenderId to the submission data
    const completeData = {
      ...data,
      assignedBy: 1, // Default to admin user ID
      tenderId: tenderId
    };
    
    // Pass the complete data to parent component
    onSubmit(completeData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Assign Tender</DialogTitle>
          <DialogDescription>
            Assign this tender to a team member for processing.
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
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Member</FormLabel>
                  <Select 
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers?.map(member => (
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
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any instructions or notes for the assignee..."
                      className="resize-none"
                      {...field}
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
              <Button type="submit">Assign</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}