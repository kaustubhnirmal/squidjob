import { useState, useEffect } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useUser } from "@/hooks/use-user";

interface TenderReminderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: number;
  tenderReferenceNo: string;
}

interface ReminderData {
  tenderId: number;
  reminderDate: string;
  comments: string;
}

export function TenderReminderPopup({ isOpen, onClose, tenderId, tenderReferenceNo }: TenderReminderPopupProps) {
  const [reminderDate, setReminderDate] = useState<Date>();
  const [reminderTime, setReminderTime] = useState({ hours: "00", minutes: "00" });
  const [remarks, setRemarks] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [existingReminder, setExistingReminder] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useUser();

  // Fetch existing reminder when popup opens
  const { data: reminders } = useQuery({
    queryKey: [`/api/tenders/${tenderId}/reminders`],
    queryFn: getQueryFn({ on401: "redirect" }),
    enabled: isOpen && !!tenderId,
  });

  // Set existing reminder data when available
  useEffect(() => {
    if (reminders && Array.isArray(reminders) && reminders.length > 0) {
      const reminder = reminders[0]; // Get the latest reminder
      setExistingReminder(reminder);
      const reminderDateTime = new Date(reminder.reminderDate);
      setReminderDate(reminderDateTime);
      setReminderTime({
        hours: reminderDateTime.getHours().toString().padStart(2, '0'),
        minutes: reminderDateTime.getMinutes().toString().padStart(2, '0')
      });
      setRemarks(reminder.comments || "");
      setIsEditing(false); // Start in view mode
    } else {
      setExistingReminder(null);
      setIsEditing(true); // Start in edit mode for new reminders
    }
  }, [reminders]);

  const createReminderMutation = useMutation({
    mutationFn: async (data: ReminderData) => {
      const method = existingReminder ? "PUT" : "POST";
      const url = existingReminder ? 
        `/api/tenders/${tenderId}/reminders/${existingReminder.id}` : 
        `/api/tenders/${tenderId}/reminders`;
      
      const response = await apiRequest(url, {
        method,
        body: JSON.stringify({
          reminderDate: data.reminderDate,
          comments: data.comments,
          userId: currentUser?.id || 1
        }),
      });

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: existingReminder ? "Reminder Updated" : "Reminder Set",
        description: existingReminder ? 
          "Tender reminder has been updated successfully." : 
          "Tender reminder has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}/reminders`] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to save reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!reminderDate) {
      toast({
        title: "Validation Error",
        description: "Please select a reminder date.",
        variant: "destructive",
      });
      return;
    }

    if (!remarks.trim()) {
      toast({
        title: "Validation Error", 
        description: "Please add remarks for the reminder.",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time
    const combinedDateTime = new Date(reminderDate);
    combinedDateTime.setHours(parseInt(reminderTime.hours), parseInt(reminderTime.minutes));

    createReminderMutation.mutate({
      tenderId,
      reminderDate: combinedDateTime.toISOString(),
      comments: remarks.trim(),
    });
  };

  const handleClose = () => {
    setReminderDate(undefined);
    setReminderTime({ hours: "00", minutes: "00" });
    setRemarks("");
    setIsEditing(false);
    setExistingReminder(null);
    onClose();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={handleClose}
      />
      
      {/* Right side panel - matching exact dimensions from reference image */}
      <div 
        className="absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl border-l border-gray-200 pointer-events-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Tender Reminder</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body - right panel layout with proper spacing */}
        <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
          {/* Tender ID */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Tender ID :</Label>
            <div className="text-sm text-gray-900 font-medium bg-gray-50 p-2 rounded border">
              {tenderReferenceNo}
            </div>
          </div>

          {existingReminder && !isEditing ? (
            // View mode - show existing reminder with modify option
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Reminder Date Time :</Label>
                <div className="text-sm text-gray-900 py-2">
                  {format(new Date(existingReminder.reminderDate), "dd-MM-yyyy HH:mm")}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Remarks :</Label>
                <div className="text-sm text-gray-900 py-2">
                  {existingReminder.comments || "No remarks"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-700">Modify :</Label>
                  <Button
                    variant="link"
                    className="text-blue-600 hover:text-blue-800 p-0 h-auto text-sm font-normal"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                  >
                    Change
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // Edit mode - show form fields with better layout
            <>
              {/* Reminder Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Reminder Date * :</Label>
                <Input
                  type="date"
                  value={reminderDate ? format(reminderDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setReminderDate(new Date(e.target.value));
                    }
                  }}
                  className="h-10 text-sm border-gray-300"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <div className="flex gap-3 items-center justify-center">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={reminderTime.hours}
                    onChange={(e) => setReminderTime(prev => ({ ...prev, hours: e.target.value.padStart(2, '0') }))}
                    className="w-16 h-10 text-sm text-center border-gray-300"
                    placeholder="00"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-lg text-gray-500 font-medium">:</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={reminderTime.minutes}
                    onChange={(e) => setReminderTime(prev => ({ ...prev, minutes: e.target.value.padStart(2, '0') }))}
                    className="w-16 h-10 text-sm text-center border-gray-300"
                    placeholder="00"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Remarks * :</Label>
                <Textarea
                  placeholder="Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="min-h-[120px] resize-none border-gray-300 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Save Button - inline with form */}
              <div className="pt-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  disabled={createReminderMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 text-sm font-medium rounded"
                >
                  {createReminderMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}