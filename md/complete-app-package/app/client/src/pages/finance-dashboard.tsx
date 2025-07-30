import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, eachDayOfInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Building, Shield, FileText, Settings, DollarSign } from "lucide-react";
import { Logo } from "@/components/logo";
import FinancialApprovalUpdateModal, { FinancialApprovalUpdateValues } from "@/components/modals/financial-approval-update-modal";
import { apiRequest } from "@/lib/queryClient";
import { MainLayout } from "@/components/layout/main-layout";
import { TodaysActivityWidget } from "@/components/dashboard/widgets/todays-activity-widget";
import { useUser } from "@/user-context";

// Financial Approval Interface
interface FinancialApproval {
  id: number;
  tenderId: number;
  requesterId: number;
  financeUserId: number | null;
  approvalType: string;
  requestAmount: string | null;
  reminderDate: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  requesterName?: string;
  tenderReference?: string;
  tenderTitle?: string;
}

// Finance User Interface
interface FinanceUser {
  id: number;
  name: string;
}

export default function FinanceDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser: user } = useUser();
  const [currentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedApproval, setSelectedApproval] = useState<FinancialApproval | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  // Query for financial approvals
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ["/api/financial-approvals"],
    queryFn: async () => {
      const response = await fetch(`/api/financial-approvals`);
      if (!response.ok) {
        throw new Error("Failed to fetch financial approvals");
      }
      return response.json();
    },
  });

  // Query for finance users
  const { data: financeUsers = [] } = useQuery<FinanceUser[]>({
    queryKey: ["/api/users/finance"],
    queryFn: async () => {
      const response = await fetch("/api/users/finance");
      if (!response.ok) {
        throw new Error("Failed to fetch finance users");
      }
      return response.json();
    },
  });

  // Fetch activity dates for calendar highlighting
  const { data: activityDates } = useQuery<string[]>({
    queryKey: ["/api/dashboard/activity-dates", user?.id, currentMonth.getTime()],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      
      const params = new URLSearchParams({
        userId: user.id.toString(),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      const response = await fetch(`/api/dashboard/activity-dates?${params}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id
  });
  
  // Mutation for updating financial approval status
  const updateStatusMutation = useMutation({
    mutationFn: async (data: FinancialApprovalUpdateValues & { id: number }) => {
      await apiRequest("PATCH", `/api/financial-approvals/${data.id}`, {
        status: data.status,
        notes: data.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-approvals"] });
      toast({
        title: "Status Updated",
        description: "The financial approval status has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating financial approval status:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calendar Functions
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Get calendar days for the month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const daysRows = [];
  
  // Split the days into weeks
  for (let i = 0; i < days.length; i += 7) {
    daysRows.push(days.slice(i, i + 7));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="p-6 bg-white border-b shadow-sm">
        <div className="flex flex-col items-center mb-4">
          <Logo centered className="transform hover:scale-105 transition-transform duration-200 mb-3" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Finance Dashboard</h1>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        {/* EMD Payment & Refund Summary */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2">EMD Payment & Refund Summary</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Paid EMD :</span>
                <span className="font-semibold">0 (0)</span>
              </div>
              <div className="flex justify-between">
                <span>Refund EMD :</span>
                <span className="font-semibold">0 (0)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SD Payment & Refund Summary */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2">SD Payment & Refund Summary</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Paid SD :</span>
                <span className="font-semibold">0 (0)</span>
              </div>
              <div className="flex justify-between">
                <span>Refund SD :</span>
                <span className="font-semibold">0 (0)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EMD Under Process */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2">EMD Under Process</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Under Process EMD :</span>
                <span className="font-semibold">0 (0)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EMD & SD Forfeited */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2">EMD & SD Forfeited</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Forfeited EMD :</span>
                <span className="font-semibold">0 (0)</span>
              </div>
              <div className="flex justify-between">
                <span>Forfeited SD :</span>
                <span className="font-semibold">0 (0)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expired EMD & SD */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2">Expired EMD & SD</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Expired EMD :</span>
                <span className="font-semibold">0 (0)</span>
              </div>
              <div className="flex justify-between">
                <span>Expired SD :</span>
                <span className="font-semibold">0 (0)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        {/* Bank Guarantee */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-center mb-3">
              <Building className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="font-bold text-center mb-2">Bank Guarantee</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>New Request :</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span>Used B.G. :</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Deposit */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-center mb-3">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="font-bold text-center mb-2">Security Deposit</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>New Request :</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span>Used S.D. :</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fees */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-center mb-3">
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="font-bold text-center mb-2">Fees</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>New Request :</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span>Used Fees :</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Others */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-center mb-3">
              <Settings className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="font-bold text-center mb-2">Others</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>New Request :</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span>Used Other :</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EMD */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-center mb-3">
              <DollarSign className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="font-bold text-center mb-2">EMD</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>New Request :</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span>Used Emd :</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-4">
          {/* Calendar */}
          <div className="w-full bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="p-1">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button onClick={nextMonth} className="p-1">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium">
                  {day}
                </div>
              ))}
            </div>

            {daysRows.map((week, i) => (
              <div key={i} className="grid grid-cols-7 gap-1 mb-1">
                {week.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, currentDate);
                  const isSelected = isSameDay(day, selectedDate);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const hasActivity = activityDates?.includes(format(day, 'yyyy-MM-dd'));
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => handleDateClick(day)}
                      className={`
                        text-center py-2 text-sm cursor-pointer hover:bg-gray-100 rounded transition-colors relative
                        ${!isCurrentMonth ? 'text-gray-300' : ''}
                        ${isToday ? 'bg-green-100 text-green-800 font-semibold' : ''}
                        ${isSelected && !isToday ? 'bg-purple-100 text-purple-800 font-semibold' : ''}
                        ${isWeekend && isCurrentMonth ? 'text-red-500' : ''}
                        ${hasActivity && isCurrentMonth && !isToday && !isSelected ? 'bg-blue-50 text-blue-700 font-medium' : ''}
                      `}
                    >
                      {format(day, 'd')}
                      {hasActivity && isCurrentMonth && (
                        <>
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full transform translate-x-1 translate-y-1"></div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-purple-500"></div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-1">
          <TodaysActivityWidget 
            className="h-full" 
            dashboardType="finance"
            selectedDate={selectedDate}
          />
        </div>
      </div>
      
      {/* Update Status Modal */}
      {selectedApproval && (
        <FinancialApprovalUpdateModal
          open={updateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
          onSubmit={async (data) => {
            await updateStatusMutation.mutateAsync({
              ...data,
              id: selectedApproval.id
            });
            setUpdateModalOpen(false);
          }}
          currentStatus={selectedApproval.status}
          approvalId={selectedApproval.id}
        />
      )}
      </div>
    </div>
  );
}