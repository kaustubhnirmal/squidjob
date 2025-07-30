import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Calendar as CalendarIcon, Users, Eye, Download, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tender, User } from "@shared/schema";

interface KickOffCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: number;
}

interface KickOffCallResponse {
  id: number;
  tenderId: number;
  tenderBrief: string;
  tenderAuthority: string;
  tenderValue: string;
  meetingHost: string;
  meetingSubject: string;
  meetingDateTime: string;
  meetingLink: string | null;
  momUserId: number;
  emailIds: string | null;
  description: string;
  documentPath: string | null;
  createdAt: string;
  participants: string[];
}

export function KickOffCallDialog({ isOpen, onClose, tenderId }: KickOffCallDialogProps) {
  const [formData, setFormData] = useState({
    registeredUser: "",
    meetingDate: new Date(),
    meetingTime: "09:00",
    meetingLink: "",
    meetingSubject: "",
    description: "",
    momUser: "",
    nonRegisteredEmails: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedCall, setSelectedCall] = useState<KickOffCallResponse | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tender details
  const { data: tender } = useQuery<Tender>({
    queryKey: [`/api/tenders/${tenderId}`],
    enabled: !!tenderId,
  });

  // Fetch users for dropdown
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch kick off calls for this tender
  const { data: kickOffCalls = [] } = useQuery<KickOffCallResponse[]>({
    queryKey: [`/api/tenders/${tenderId}/kick-off-calls`],
    enabled: !!tenderId,
  });

  // Create kick off call mutation
  const createKickOffCallMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/tenders/${tenderId}/kick-off-calls`, {
        method: "POST",
        body: data,
      });
      if (!response.ok) throw new Error("Failed to create kick off call");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Kick off call scheduled successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${tenderId}/kick-off-calls`] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      registeredUser: "",
      meetingDate: new Date(),
      meetingTime: "09:00",
      meetingLink: "",
      meetingSubject: "",
      description: "",
      momUser: "",
      nonRegisteredEmails: "",
    });
    setUploadedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time
    const [hours, minutes] = formData.meetingTime.split(':');
    const meetingDateTime = new Date(formData.meetingDate);
    meetingDateTime.setHours(parseInt(hours), parseInt(minutes));

    const formDataToSend = new FormData();
    formDataToSend.append('registeredUser', formData.registeredUser);
    formDataToSend.append('meetingDateTime', meetingDateTime.toISOString());
    formDataToSend.append('meetingLink', formData.meetingLink);
    formDataToSend.append('meetingSubject', formData.meetingSubject);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('momUser', formData.momUser);
    formDataToSend.append('nonRegisteredEmails', formData.nonRegisteredEmails);
    
    if (uploadedFile) {
      formDataToSend.append('file', uploadedFile);
    }

    createKickOffCallMutation.mutate(formDataToSend);
  };

  if (selectedCall) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>View Kick Off Call Detail</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Tender ID:</Label>
                <p className="text-gray-700">{selectedCall.tenderId}</p>
              </div>
              <div>
                <Label className="font-medium">Tender Brief:</Label>
                <p className="text-gray-700 text-sm">{selectedCall.tenderBrief}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Tender Authority:</Label>
                <p className="text-gray-700">{selectedCall.tenderAuthority}</p>
              </div>
              <div>
                <Label className="font-medium">Tender Value:</Label>
                <p className="text-gray-700">{selectedCall.tenderValue}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Meeting Host:</Label>
                <p className="text-gray-700">{selectedCall.meetingHost}</p>
              </div>
              <div>
                <Label className="font-medium">Meeting Subject:</Label>
                <p className="text-gray-700">{selectedCall.meetingSubject}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Meeting Date & Time:</Label>
                <p className="text-gray-700">{new Date(selectedCall.meetingDateTime).toLocaleString()}</p>
              </div>
              <div>
                <Label className="font-medium">Created Date & Time:</Label>
                <p className="text-gray-700">{new Date(selectedCall.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <Label className="font-medium">Description:</Label>
              <p className="text-gray-700">{selectedCall.description}</p>
            </div>

            {selectedCall.meetingLink && (
              <div>
                <Label className="font-medium">Meeting Link:</Label>
                <p className="text-blue-600 underline cursor-pointer" onClick={() => window.open(selectedCall.meetingLink!, '_blank')}>
                  {selectedCall.meetingLink}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedCall(null);
                }}
              >
                Back to List
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Kick Off Call</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tender Information Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tender ID</Label>
                <Input 
                  value={tender?.referenceNo || ""} 
                  disabled 
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Tender Brief</Label>
                <Input 
                  value={tender?.brief || ""} 
                  disabled 
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Authority and Value Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tendering Authority</Label>
                <Input 
                  value={tender?.authority || ""} 
                  disabled 
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Tender Value</Label>
                <Input 
                  value={tender?.estimatedValue ? `₹ ${(Number(tender.estimatedValue) / 10000000).toFixed(2)} CR.` : ""} 
                  disabled 
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* User Selection Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Registered Users *</Label>
                <Select 
                  value={formData.registeredUser} 
                  onValueChange={(value) => setFormData(prev => ({...prev, registeredUser: value}))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Non Registered Users</Label>
                <Input 
                  placeholder="Enter Email"
                  value={formData.nonRegisteredEmails}
                  onChange={(e) => setFormData(prev => ({...prev, nonRegisteredEmails: e.target.value}))}
                />
              </div>
            </div>

            {/* Meeting Date & Time Row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Meeting Date & Time *</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !formData.meetingDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.meetingDate ? format(formData.meetingDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.meetingDate}
                        onSelect={(date) => date && setFormData(prev => ({...prev, meetingDate: date}))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <Input
                      type="time"
                      value={formData.meetingTime}
                      onChange={(e) => setFormData(prev => ({...prev, meetingTime: e.target.value}))}
                      className="w-24"
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>Meeting Link</Label>
                <Input 
                  placeholder="Meeting link"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData(prev => ({...prev, meetingLink: e.target.value}))}
                />
              </div>
              <div>
                <Label>Meeting Subject *</Label>
                <Input 
                  placeholder="Subject"
                  value={formData.meetingSubject}
                  onChange={(e) => setFormData(prev => ({...prev, meetingSubject: e.target.value}))}
                  required
                />
              </div>
            </div>

            {/* File Upload and MOM User Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Upload File</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="file" 
                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {uploadedFile && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span className="text-xs">{uploadedFile.name}</span>
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <Label>MOM Add User *</Label>
                <Select 
                  value={formData.momUser} 
                  onValueChange={(value) => setFormData(prev => ({...prev, momUser: value}))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="MOM Add User" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>Description *</Label>
              <Textarea 
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                rows={3}
                required
              />
            </div>

            {/* Submit and Clear Buttons */}
            <div className="flex space-x-2">
              <Button 
                type="submit"
                disabled={createKickOffCallMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                onClick={(e) => e.stopPropagation()}
              >
                {createKickOffCallMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  resetForm();
                }}
              >
                Clear
              </Button>
            </div>
          </form>

          {/* Kick Off Calls Table */}
          <div className="mt-6">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg font-bold">
              <div className="grid grid-cols-6 gap-4 text-sm font-medium">
                <div>MEETING HOST</div>
                <div>MEETING SUBJECT</div>
                <div>MEETING DATE & TIME</div>
                <div>CREATED DATE & TIME</div>
                <div>MEETING DETAILS</div>
                <div>ACTION</div>
              </div>
            </div>
            <div className="border border-t-0 rounded-b-lg min-h-[100px]">
              {kickOffCalls.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No kick off calls found
                </div>
              ) : (
                kickOffCalls.map((call: KickOffCallResponse) => (
                  <div key={call.id} className="grid grid-cols-6 gap-4 p-3 text-sm border-b last:border-b-0">
                    <div className="text-blue-600">{call.meetingHost}</div>
                    <div>{call.meetingSubject}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(call.meetingDateTime).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(call.createdAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {call.description || "No details provided"}
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedCall(call);
                        }}
                        className="h-8 px-3 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}