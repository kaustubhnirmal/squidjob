import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Award, Users, Edit2, Search, Save, FileText, Download, ExternalLink } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import type { BidParticipant, InsertBidParticipant, Competitor, InsertCompetitor } from "@shared/schema";

interface BidResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tender: any;
}

interface NewCompetitorForm {
  name: string;
  location: string;
  representativeName: string;
  contact: string;
}

export function BidResultsDialog({ open, onOpenChange, tender }: BidResultsDialogProps) {
  const { toast } = useToast();
  const [participants, setParticipants] = useState<InsertBidParticipant[]>([]);
  const [editingParticipant, setEditingParticipant] = useState<BidParticipant | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewCompetitorForm, setShowNewCompetitorForm] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState<NewCompetitorForm>({
    name: "",
    location: "",
    representativeName: "",
    contact: ""
  });
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: number; name: string } | null>(null);

  // Get current user for admin check
  const { data: currentUser } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  const isAdmin = currentUser?.role === 'Admin';

  // Check if RA data exists
  const { data: reverseAuctions = [] } = useQuery({
    queryKey: [`/api/tenders/${tender?.id}/ra`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: open && !!tender?.id
  });

  // Calculate RA data status
  const hasRAData = reverseAuctions && reverseAuctions.length > 0;
  const latestRA = hasRAData ? reverseAuctions[reverseAuctions.length - 1] : null;

  // Get existing bid participants
  const { data: existingParticipants = [] } = useQuery({
    queryKey: [`/api/bid-participants/${tender?.id}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: open && !!tender?.id
  });

  // Get competitors for autocomplete
  const { data: competitors = [] } = useQuery({
    queryKey: [`/api/competitors`, { search: searchTerm }],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: open
  });

  // Create bid participant mutation
  const createParticipantMutation = useMutation({
    mutationFn: (participant: InsertBidParticipant) => 
      apiRequest("/api/bid-participants", {
        method: "POST",
        body: JSON.stringify(participant)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bid-participants/${tender?.id}`] });
      setParticipants([]);
      toast({ title: "Bid participants saved successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error saving participants", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update bid participant mutation
  const updateParticipantMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertBidParticipant> }) =>
      apiRequest(`/api/bid-participants/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bid-participants/${tender?.id}`] });
      setEditingParticipant(null);
      toast({ title: "Participant updated successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating participant", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete bid participant mutation
  const deleteParticipantMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/bid-participants/${id}`, {
        method: "DELETE"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bid-participants/${tender?.id}`] });
      toast({ title: "Participant deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting participant", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create competitor mutation
  const createCompetitorMutation = useMutation({
    mutationFn: (competitor: InsertCompetitor) => 
      apiRequest("/api/competitors", {
        method: "POST",
        body: JSON.stringify(competitor)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/competitors`] });
      setNewCompetitor({ name: "", location: "", representativeName: "", contact: "" });
      setShowNewCompetitorForm(false);
      toast({ title: "Competitor created successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error creating competitor", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getNextBidderStatus = () => {
    const existingStatuses = [...existingParticipants.map(p => p.bidderStatus), ...participants.map(p => p.bidderStatus)];
    const statusNumbers = existingStatuses.map(status => parseInt(status.replace('L', ''))).filter(n => !isNaN(n));
    
    // Find the lowest missing status starting from L1
    for (let i = 1; i <= statusNumbers.length + 1; i++) {
      if (!statusNumbers.includes(i)) {
        return `L${i}`;
      }
    }
    
    // If no missing status found, return the next highest
    const nextNumber = statusNumbers.length > 0 ? Math.max(...statusNumbers) + 1 : 1;
    return `L${nextNumber}`;
  };

  const validateBidAmount = (bidAmount: string, bidderStatus: string) => {
    // Only validate if there's actual input
    if (!bidAmount || bidAmount.trim() === '') return null;
    
    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) return "Invalid amount";
    
    // Get all participants (existing + new)
    const allParticipants = [...existingParticipants, ...participants];
    const statusNumber = parseInt(bidderStatus.replace('L', ''));
    
    // Check bid amount rules: L1 < L2 < L3... (L1 has lowest bid amount, is the winner)
    for (const participant of allParticipants) {
      const participantStatusNumber = parseInt(participant.bidderStatus.replace('L', ''));
      const participantAmount = parseFloat(participant.bidAmount);
      
      if (isNaN(participantAmount)) continue;
      
      // If current participant has lower rank number (L1 vs L2), their bid should be lower
      if (statusNumber < participantStatusNumber && amount >= participantAmount) {
        return `L${statusNumber} amount must be lower than L${participantStatusNumber} (₹${participantAmount.toLocaleString('en-IN')})`;
      }
      
      // If current participant has higher rank number (L3 vs L2), their bid should be higher
      if (statusNumber > participantStatusNumber && amount <= participantAmount) {
        return `L${statusNumber} amount must be higher than L${participantStatusNumber} (₹${participantAmount.toLocaleString('en-IN')})`;
      }
    }
    
    return null;
  };

  const validateParticipantName = (participantName: string, currentIndex?: number) => {
    // Only validate if there's actual input
    if (!participantName || participantName.trim() === '') return null;
    
    // Check against existing participants (already saved in database)
    const existingDuplicate = existingParticipants.find(p => 
      p.participantName.toLowerCase() === participantName.toLowerCase()
    );
    
    if (existingDuplicate) {
      return "Participant name already exists";
    }
    
    // Check against new participants being added (excluding current)
    const newDuplicate = participants.find((p, index) => 
      index !== currentIndex && p.participantName.toLowerCase() === participantName.toLowerCase()
    );
    
    if (newDuplicate) {
      return "Participant name already exists";
    }
    
    return null;
  };

  const handleAddParticipant = () => {
    const nextStatus = getNextBidderStatus();
    setParticipants([...participants, {
      tenderId: tender.id,
      participantName: "",
      bidderStatus: nextStatus,
      bidAmount: "",
      remarks: ""
    }]);
  };

  const handleParticipantChange = (index: number, field: keyof InsertBidParticipant, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const handleSaveParticipants = () => {
    // Validate all participants
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      
      if (!participant.participantName || !participant.bidAmount) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Check for duplicate participant names
      const nameError = validateParticipantName(participant.participantName, i);
      if (nameError) {
        toast({
          title: "Validation Error",
          description: nameError,
          variant: "destructive"
        });
        return;
      }
      
      // Check bid amount validation
      const amountError = validateBidAmount(participant.bidAmount, participant.bidderStatus);
      if (amountError) {
        toast({
          title: "Validation Error",
          description: amountError,
          variant: "destructive"
        });
        return;
      }
    }
    
    // Save all participants if validation passes
    participants.forEach(participant => {
      createParticipantMutation.mutate(participant);
    });
  };

  const handleDeleteParticipant = (id: number, name: string) => {
    setDeleteConfirmation({ id, name });
  };

  const confirmDeleteParticipant = () => {
    if (deleteConfirmation) {
      deleteParticipantMutation.mutate(deleteConfirmation.id);
      setDeleteConfirmation(null);
    }
  };

  const handleRemoveNewParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleSelectCompetitor = (competitorName: string) => {
    setSearchTerm(competitorName);
  };

  const handleCreateCompetitor = () => {
    if (!newCompetitor.name) {
      toast({ title: "Competitor name is required", variant: "destructive" });
      return;
    }
    createCompetitorMutation.mutate(newCompetitor);
  };

  const getBidderStatusColor = (status: string) => {
    const statusNum = parseInt(status.replace('L', ''));
    if (statusNum === 1) return "bg-green-100 text-green-800 border-green-300";
    if (statusNum === 2) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (statusNum === 3) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const formatAmount = (amount: string | number) => {
    if (!amount) return "N/A";
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  const filteredCompetitors = competitors.filter(comp => 
    comp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const timestamp = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'Asia/Kolkata'
      });
      
      const formatDate = (date: string | Date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      };
      
      const formatDateTime = (date: string | Date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };
      
      // Comprehensive tender details
      const tenderDetails = {
        tenderId: tender?.referenceNo || 'N/A',
        tenderStatus: tender?.status || 'N/A',
        tenderAuthority: tender?.authority || 'N/A',
        estimateValue: tender?.emdAmount ? formatAmount(tender.emdAmount) : 'N/A',
        emdAmount: tender?.emdAmount ? formatAmount(tender.emdAmount) : '₹ 14,000',
        publishedDate: formatDate(tender?.createdAt),
        dueDate: formatDate(tender?.deadline),
        bidStartDate: formatDate(tender?.createdAt),
        location: tender?.location || 'N/A',
        brief: tender?.brief || 'N/A'
      };
      
      // Enhanced RA data with all fields from screenshot
      const raData = hasRAData && latestRA ? {
        raNo: latestRA.reference_number || latestRA.bidNo || 'N/A',
        status: 'Active',
        startDateTime: formatDateTime(latestRA.start_time),
        endDateTime: formatDateTime(latestRA.end_time),
        startAmount: formatAmount(latestRA.start_amount),
        endAmount: formatAmount(latestRA.end_amount),
        createdBy: latestRA.createdByName || 'N/A',
        createdOn: formatDate(latestRA.createdAt)
      } : null;
      
      const participantsData = existingParticipants.map(p => ({
        participantName: p.participantName,
        bidderStatus: p.bidderStatus,
        bidAmount: formatAmount(p.bidAmount),
        remarks: p.remarks || 'N/A'
      }));
      
      const pdfData = {
        title: `Bid Results - ${tender?.referenceNo}`,
        timestamp,
        tenderDetails,
        raData,
        participants: participantsData,
        watermark: 'SquidJob - Tender Management System',
        generatedBy: currentUser?.name || 'System'
      };
      
      // Generate PDF via API
      const response = await fetch(`/api/tenders/${tender?.id}/bid-results-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id?.toString() || '1'
        },
        body: JSON.stringify(pdfData)
      });
      
      if (!response.ok) {
        throw new Error('PDF generation failed');
      }
      
      // Get filename from server response header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Bid_Results_${tender?.referenceNo}_${new Date().toISOString().split('T')[0]}.pdf`; // fallback
      
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const matches = contentDisposition.match(/filename="([^"]+)"/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Use actual filename from server
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF Generated Successfully",
        description: "Bid results PDF has been downloaded",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Log dialog open/close events
  useEffect(() => {
    if (open && tender?.id && currentUser?.id) {
      // Log dialog open
      fetch(`/api/tenders/${tender.id}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString()
        },
        body: JSON.stringify({
          action: 'open_bid_results_dialog',
          description: `Opened bid results dialog for tender ${tender.referenceNo}`,
          metadata: {
            tenderTitle: tender.title,
            openedAt: new Date().toISOString()
          }
        })
      }).catch(error => console.error('Failed to log dialog open:', error));
    }
    
    if (!open) {
      setParticipants([]);
      setEditingParticipant(null);
      setSearchTerm("");
      setShowNewCompetitorForm(false);
      
      // Log dialog close if tender exists
      if (tender?.id && currentUser?.id) {
        fetch(`/api/tenders/${tender.id}/activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id.toString()
          },
          body: JSON.stringify({
            action: 'close_bid_results_dialog',
            description: `Closed bid results dialog for tender ${tender.referenceNo}`,
            metadata: {
              tenderTitle: tender.title,
              closedAt: new Date().toISOString()
            }
          })
        }).catch(error => console.error('Failed to log dialog close:', error));
      }
    }
  }, [open, tender?.id, tender?.referenceNo, tender?.title, currentUser?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Bid Results - {tender?.referenceNo}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="ml-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* RA Data Section (Reduced Space) */}
          {hasRAData && latestRA && (
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Reverse Auction Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <Label className="text-gray-600 text-xs">RA No.</Label>
                    <p className="font-medium text-sm">{latestRA.reference_number || latestRA.bidNo || tender?.referenceNo || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-xs">Start Date & Time</Label>
                    <p className="font-medium text-sm">
                      {latestRA.start_time 
                        ? new Date(latestRA.start_time).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) + ', ' + new Date(latestRA.start_time).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : tender?.deadline ? new Date(tender.deadline).toLocaleDateString('en-GB') : "N/A"
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-xs">Start Amount</Label>
                    <p className="font-medium text-sm">{latestRA.start_amount ? formatAmount(latestRA.start_amount) : (tender?.emdAmount ? `₹${parseFloat(tender.emdAmount).toLocaleString('en-IN')}` : "N/A")}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 text-xs">End Amount</Label>
                    <p className="font-medium text-sm">{formatAmount(latestRA.end_amount)}</p>
                  </div>
                </div>
                <div className="mt-2 pt-1 border-t text-xs text-gray-500 flex justify-between">
                  <span>Created by: {latestRA.createdByName || currentUser?.name || "N/A"}</span>
                  <span>Created on: {latestRA.createdAt 
                    ? new Date(latestRA.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                    : new Date().toLocaleDateString('en-GB')
                  }</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Participant Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Bid Participants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {participants.map((participant, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getBidderStatusColor(participant.bidderStatus)}>
                      {participant.bidderStatus}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveNewParticipant(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Participant Name *</Label>
                      <div className="relative">
                        <Input
                          value={participant.participantName}
                          onChange={(e) => {
                            handleParticipantChange(index, 'participantName', e.target.value);
                            setSearchTerm(e.target.value);
                          }}
                          placeholder="Enter or search participant name"
                          className={`pr-16 ${validateParticipantName(participant.participantName, index) ? 'border-red-500' : ''}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewCompetitorForm(true)}
                          className="absolute right-8 top-0 h-full px-2 text-blue-600 hover:text-blue-800"
                        >
                          Add
                        </Button>
                        <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                      {validateParticipantName(participant.participantName, index) && (
                        <p className="text-red-500 text-xs mt-1">{validateParticipantName(participant.participantName, index)}</p>
                      )}
                      {searchTerm && filteredCompetitors.length > 0 && (
                        <div className="border rounded-md mt-1 bg-white shadow-lg max-h-32 overflow-y-auto">
                          {filteredCompetitors.map(comp => (
                            <div
                              key={comp.id}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                              onClick={() => {
                                handleParticipantChange(index, 'participantName', comp.name);
                                setSearchTerm("");
                              }}
                            >
                              <div className="font-medium">{comp.name}</div>
                              <div className="text-xs text-gray-500">{comp.location} • {comp.contact}</div>
                            </div>
                          ))}
                          <div className="border-t p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowNewCompetitorForm(true)}
                              className="w-full text-left"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add New Competitor
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-sm">Bid Amount *</Label>
                      <Input
                        type="number"
                        value={participant.bidAmount}
                        onChange={(e) => handleParticipantChange(index, 'bidAmount', e.target.value)}
                        placeholder="Enter bid amount"
                        className={`${validateBidAmount(participant.bidAmount, participant.bidderStatus) ? 'border-red-500' : ''}`}
                      />
                      {validateBidAmount(participant.bidAmount, participant.bidderStatus) && (
                        <p className="text-red-500 text-xs mt-1">{validateBidAmount(participant.bidAmount, participant.bidderStatus)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Remarks</Label>
                    <Textarea
                      value={participant.remarks || ""}
                      onChange={(e) => handleParticipantChange(index, 'remarks', e.target.value)}
                      placeholder="Additional remarks"
                      rows={2}
                      className="h-16"
                    />
                  </div>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Button onClick={handleAddParticipant} variant="outline" className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add {getNextBidderStatus()} Participant
                </Button>
                {participants.length > 0 && (
                  <Button onClick={handleSaveParticipants} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save All Participants
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* New Competitor Form */}
          {showNewCompetitorForm && (
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-700">Add New Competitor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Competitor Name *</Label>
                    <Input
                      value={newCompetitor.name}
                      onChange={(e) => setNewCompetitor({...newCompetitor, name: e.target.value})}
                      placeholder="Enter competitor name"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Location</Label>
                    <Input
                      value={newCompetitor.location}
                      onChange={(e) => setNewCompetitor({...newCompetitor, location: e.target.value})}
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Representative Name</Label>
                    <Input
                      value={newCompetitor.representativeName}
                      onChange={(e) => setNewCompetitor({...newCompetitor, representativeName: e.target.value})}
                      placeholder="Enter representative name"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Contact</Label>
                    <Input
                      value={newCompetitor.contact}
                      onChange={(e) => setNewCompetitor({...newCompetitor, contact: e.target.value})}
                      placeholder="Enter contact details"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateCompetitor} className="bg-blue-600 hover:bg-blue-700">
                    Create Competitor
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewCompetitorForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Bid Participants Table */}
          {existingParticipants.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Current Bid Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Participant Name</TableHead>
                      <TableHead>Bid Amount</TableHead>
                      <TableHead>Remarks</TableHead>
                      {isAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {existingParticipants
                      .sort((a, b) => {
                        // Sort by bidderStatus in ascending order (L1, L2, L3...)
                        const statusA = parseInt(a.bidderStatus.replace('L', ''));
                        const statusB = parseInt(b.bidderStatus.replace('L', ''));
                        return statusA - statusB;
                      })
                      .map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>
                          <Badge variant="outline" className={getBidderStatusColor(participant.bidderStatus)}>
                            {participant.bidderStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {(() => {
                            // Find competitor by name
                            const competitor = competitors.find(c => c.name === participant.participantName);
                            if (competitor) {
                              return (
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-blue-600 hover:text-blue-800 text-left"
                                  onClick={() => setSelectedCompetitor(competitor)}
                                >
                                  {participant.participantName}
                                </Button>
                              );
                            } else {
                              return <span>{participant.participantName}</span>;
                            }
                          })()}
                        </TableCell>
                        <TableCell>{formatAmount(participant.bidAmount)}</TableCell>
                        <TableCell>{participant.remarks || "-"}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingParticipant(participant)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteParticipant(participant.id, participant.participantName)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Participant Dialog */}
        {editingParticipant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Participant</h3>
              <div className="space-y-4">
                <div>
                  <Label>Participant Name</Label>
                  <Input
                    value={editingParticipant.participantName}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Bid Amount</Label>
                  <Input
                    type="number"
                    value={editingParticipant.bidAmount}
                    onChange={(e) => setEditingParticipant({...editingParticipant, bidAmount: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Remarks</Label>
                  <Textarea
                    value={editingParticipant.remarks || ""}
                    onChange={(e) => setEditingParticipant({...editingParticipant, remarks: e.target.value})}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setEditingParticipant(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => updateParticipantMutation.mutate({
                      id: editingParticipant.id,
                      data: {
                        participantName: editingParticipant.participantName,
                        bidAmount: editingParticipant.bidAmount,
                        remarks: editingParticipant.remarks
                      }
                    })}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Competitor Details Dialog */}
        {selectedCompetitor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-purple-600">Competitor Details</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Company Name</Label>
                  <p className="text-sm font-medium">{selectedCompetitor.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location</Label>
                  <p className="text-sm">{selectedCompetitor.location || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Representative</Label>
                  <p className="text-sm">{selectedCompetitor.representativeName || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Contact</Label>
                  <p className="text-sm">{selectedCompetitor.contact || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Category</Label>
                  <p className="text-sm">{selectedCompetitor.category || "N/A"}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div>
                    <Label className="text-xs text-gray-500">Participated</Label>
                    <p className="text-sm font-medium">{selectedCompetitor.participatedTenders || 0}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Awarded</Label>
                    <p className="text-sm font-medium text-green-600">{selectedCompetitor.awardedTenders || 0}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Lost</Label>
                    <p className="text-sm font-medium text-red-600">{selectedCompetitor.lostTenders || 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => setSelectedCompetitor(null)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog 
          open={!!deleteConfirmation} 
          onOpenChange={(open) => !open && setDeleteConfirmation(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Participant</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteConfirmation?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirmation(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteParticipant}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}