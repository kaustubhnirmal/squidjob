import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, TrendingUp, Users, Target, Award, ArrowUpRight, GripVertical, Bell, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, eachDayOfInterval } from "date-fns";

import { useUser } from "@/user-context";
import { UserCalendar } from "@/components/dashboard/user-calendar";
import { TodaysActivityWidget } from "@/components/dashboard/widgets/todays-activity-widget";
import { formatIndianCurrency } from "@/utils/currency";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface DashboardStats {
  totalTenders: number;
  activeTenders: number;
  completedTenders: number;
  pendingTenders: number;
  winRate?: number;
}

interface ResourceAllocation {
  name: string;
  percentage: number;
  count: number;
  avatar?: string;
}

interface BidActivity {
  month: string;
  opportunities: number;
}

export default function SalesDashboard() {
  const { user } = useUser();
  const [dateRange, setDateRange] = useState("All Time");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [businessLineFilter, setBusinessLineFilter] = useState("All");
  
  // Calendar state
  const [currentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Calendar helper functions
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleDateClick = (date: Date) => setSelectedDate(date);
  
  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Group days into weeks
  const daysRows = [];
  for (let i = 0; i < days.length; i += 7) {
    daysRows.push(days.slice(i, i + 7));
  }

  // Fetch dashboard stats
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch real data for dashboard widgets
  const { data: resourceAllocation } = useQuery<ResourceAllocation[]>({
    queryKey: ["/api/dashboard/resource-allocation"],
  });

  const { data: bidActivity } = useQuery<BidActivity[]>({
    queryKey: ["/api/dashboard/bid-activity"],
  });

  const { data: tenderDistribution } = useQuery<any[]>({
    queryKey: ["/api/dashboard/tender-distribution"],
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

  const { data: upcomingDeadlines } = useQuery({
    queryKey: ["/api/dashboard/upcoming-deadlines"],
  });

  const { data: recentActivities } = useQuery({
    queryKey: ["/api/dashboard/recent-activities"],
  });



  // Fetch notifications and reminders
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/notifications/${user.id}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Calculate derived metrics from real data
  const projectValueWon = stats?.totalEmdAmount ? formatIndianCurrency(stats.totalEmdAmount) : "₹0";
  const winLossRatio = stats ? `${stats.wonTenders}:${stats.rejectedTenders}` : "0:0";
  const captureRatio = stats ? { 
    won: stats.totalEmdAmount ? (stats.totalEmdAmount / 1000000) : 0, 
    total: stats.totalEmdAmount ? ((stats.totalEmdAmount * 2) / 1000000) : 0
  } : { won: 0, total: 0 };
  const registeredOpportunities = stats?.totalTenders || 0;

  // Bid/No Bid Progress Data based on real stats
  const bidProgress = stats ? {
    bid: stats.successRate,
    noBid: 100 - stats.successRate,
    averageScore: stats.completionRate
  } : {
    bid: 0,
    noBid: 100,
    averageScore: 0
  };

  // Add fallback data for missing sections
  const fallbackNotifications = [
    { id: 1, title: "New tender assigned", message: "GEM/2025/B/6251792 has been assigned to you", time: "2 hours ago" },
    { id: 2, title: "Reminder", message: "Tender deadline approaching for GEM/2025/B/6303243", time: "1 day ago" },
    { id: 3, title: "Status update", message: "Tender submission completed successfully", time: "2 days ago" }
  ];

  const fallbackUpcomingDeadlines = [
    { id: 1, title: "Supply of Laboratory Equipment", referenceNo: "GEM/2025/B/6251792", deadline: "Dec 15, 2024", priority: "high" },
    { id: 2, title: "Computer Hardware Supply", referenceNo: "GEM/2025/B/6303243", deadline: "Dec 20, 2024", priority: "medium" },
    { id: 3, title: "Office Furniture", referenceNo: "GEM/2025/B/6282942", deadline: "Dec 25, 2024", priority: "low" }
  ];

  const fallbackRecentActivities = [
    { id: 1, user: "Poonam Amale", action: "Assigned tender GEM/2025/B/6251792", timestamp: "2 hours ago", type: "Assignment", avatar: "" },
    { id: 2, user: "Amit Pathariya", action: "Submitted proposal for GEM/2025/B/6303243", timestamp: "1 day ago", type: "Submission", avatar: "" },
    { id: 3, user: "Rahul Sharma", action: "Updated tender status to In Progress", timestamp: "2 days ago", type: "Status", avatar: "" }
  ];

  const fallbackResourceAllocation = [
    { name: "Poonam", percentage: 85, count: 12 },
    { name: "Amit", percentage: 75, count: 8 },
    { name: "Rahul", percentage: 60, count: 5 },
    { name: "Priya", percentage: 45, count: 3 }
  ];

  const fallbackBidActivity = [
    { month: "Jan", opportunities: 12, submissions: 8 },
    { month: "Feb", opportunities: 15, submissions: 10 },
    { month: "Mar", opportunities: 18, submissions: 12 },
    { month: "Apr", opportunities: 20, submissions: 15 },
    { month: "May", opportunities: 22, submissions: 18 },
    { month: "Jun", opportunities: 25, submissions: 20 }
  ];

  const fallbackTenderDistribution = [
    { name: "Active", value: 35 },
    { name: "Completed", value: 25 },
    { name: "Pending", value: 20 },
    { name: "Rejected", value: 20 }
  ];

  // Use fallback data when API data is not available
  const displayNotifications = notifications.length > 0 ? notifications : fallbackNotifications;
  const displayUpcomingDeadlines = upcomingDeadlines || fallbackUpcomingDeadlines;
  const displayRecentActivities = recentActivities || fallbackRecentActivities;
  const displayResourceAllocation = resourceAllocation || fallbackResourceAllocation;
  const displayBidActivity = bidActivity || fallbackBidActivity;
  const displayTenderDistribution = tenderDistribution || fallbackTenderDistribution;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="p-6 bg-white border-b shadow-sm">
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3 transform hover:scale-105 transition-transform duration-200">
            S
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Sales Dashboard</h1>
        </div>
      </div>
      
      <div className="p-6">

        {/* Sales Summary Cards - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Project Value Won */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-center mb-3">
                <Target className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="font-bold text-center mb-2">Project Value Won</h3>
              <div className="text-xl font-bold text-center text-blue-600 mb-2">{projectValueWon}</div>
            </CardContent>
          </Card>

          {/* Win/Loss Ratio */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-center mb-3">
                <Award className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="font-bold text-center mb-2">Win / Loss Ratio</h3>
              <div className="text-xl font-bold text-center text-green-600 mb-2">{winLossRatio}</div>
              <div className="text-xs text-gray-600 text-center">All Time</div>
            </CardContent>
          </Card>

          {/* Capture Ratio */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-center mb-3">
                <TrendingUp className="h-12 w-12 text-cyan-600" />
              </div>
              <h3 className="font-bold text-center mb-2">Capture Ratio</h3>
              <div className="text-lg font-bold text-center text-cyan-600 mb-2">
                ${captureRatio.won}M : ${captureRatio.total}B
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-cyan-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(captureRatio.won / (captureRatio.total * 1000)) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 text-center">All Time</div>
            </CardContent>
          </Card>

          {/* Registered Opportunities */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-center mb-3">
                <Users className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="font-bold text-center mb-2">Registered Opportunities</h3>
              <div className="text-xl font-bold text-center text-purple-600 mb-2">{registeredOpportunities}</div>
              <div className="text-xs text-gray-600 text-center">All Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics Grid - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-1">{stats?.totalTenders || 0}</div>
                <div className="text-sm text-gray-600">Total Tenders</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats?.activeTenders || 0}</div>
                <div className="text-sm text-gray-600">Active Tenders</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats?.completedTenders || 0}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{stats?.winRate || 0}%</div>
                <div className="text-sm text-gray-600">Win Rate</div>
              </div>
            </CardContent>
          </Card>
        </div>





      {/* Calendar and Today's Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-1">
          {/* Calendar */}
          <div className="w-full bg-white p-3 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
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
        <div className="md:col-span-2">
          <TodaysActivityWidget 
            className="h-full" 
            dashboardType="sales"
            selectedDate={selectedDate}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Bid Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayBidActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Bar dataKey="opportunities" fill="#8884d8" />
                <Bar dataKey="submissions" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={displayTenderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {displayTenderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      
    </div>
  </div>
  );
}