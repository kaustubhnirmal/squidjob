import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from '@tanstack/react-query';
import type { DateRange } from "react-day-picker";
import * as XLSX from 'xlsx';

interface User {
  id: number;
  username: string;
  name: string;
}

interface LoginLog {
  id: number;
  userId: number;
  employeeName: string;
  loginDateTime: string;
  logoutDateTime?: string;
  ipAddress: string;
}

export default function LoginMIS() {
  // Date range state
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSearchPanelExpanded, setIsSearchPanelExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch users data
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    }
  });

  // Fetch login logs data
  const { 
    data: loginLogs = [], 
    isLoading: isLoadingLogs,
    refetch: refetchLoginLogs
  } = useQuery<LoginLog[]>({
    queryKey: ['/api/login-mis', employeeId, selectedEmployee, dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      // Construct query parameters
      const params = new URLSearchParams();
      
      if (employeeId) {
        params.append('employeeId', employeeId);
      }
      
      if (selectedEmployee && selectedEmployee !== 'all') {
        params.append('employeeName', selectedEmployee);
      }
      
      if (dateRange.from) {
        params.append('fromDate', dateRange.from.toISOString());
      }
      
      if (dateRange.to) {
        params.append('toDate', dateRange.to.toISOString());
      }
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/login-mis${queryString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch login data');
      }
      
      return await response.json();
    },
    enabled: true // Always fetch initial data
  });

  // Current filtered users
  const filteredUsers = useMemo(() => {
    // Filter users logic could be added here if needed
    return users;
  }, [users]);

  // Table data for display
  const tableData = useMemo(() => {
    if (loginLogs.length > 0) {
      return loginLogs;
    }
    
    // Default: show placeholder data for Poonam
    return [{
      id: 1,
      userId: 1,
      employeeName: "Poonam Amale",
      loginDateTime: "2023-05-13T10:00:00.000Z",
      logoutDateTime: undefined,
      ipAddress: "192.168.224.2"
    }];
  }, [loginLogs]);

  const handleSearch = () => {
    // Refetch data with current filters
    refetchLoginLogs();
  };

  const handleClear = () => {
    setEmployeeId("");
    setSelectedEmployee("all");
    setDateRange({ from: undefined, to: undefined });
  };
  
  // Export to Excel function
  const handleExportToExcel = () => {
    // Prepare the data for export
    const exportData = tableData.map(row => ({
      'ID': row.id,
      'Employee Name': row.employeeName,
      'Login Date Time': row.loginDateTime ? format(new Date(row.loginDateTime), 'dd-MM-yyyy HH:mm:ss') : '-',
      'Logout Date Time': row.logoutDateTime ? format(new Date(row.logoutDateTime), 'dd-MM-yyyy HH:mm:ss') : '-',
      'IP Address': row.ipAddress
    }));
    
    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Login MIS');
    
    // Create file name with date
    const fileName = `Login_MIS_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
    // Export to Excel file
    XLSX.writeFile(workbook, fileName);
  };

  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`;
    } else if (dateRange.from) {
      return `${format(dateRange.from, 'dd/MM/yyyy')} - Select End Date`;
    } else if (dateRange.to) {
      return `Select Start Date - ${format(dateRange.to, 'dd/MM/yyyy')}`;
    }
    return 'Login From → Login To';
  };

  // Total pages calculation
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Get the current slice of data based on pagination
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tableData.slice(startIndex, startIndex + itemsPerPage);
  }, [tableData, currentPage, itemsPerPage]);

  // Handle the DateRange selection
  const handleDateRangeSelect = (selectedRange: DateRange | undefined) => {
    if (selectedRange) {
      setDateRange({
        from: selectedRange.from,
        to: selectedRange.to
      });
      if (selectedRange.to) {
        setShowCalendar(false);
      }
    } else {
      setDateRange({ from: undefined, to: undefined });
    }
  };

  return (
    <div className="p-6 max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Login MIS</h1>
      </div>

      {/* Search Panel */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Search className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-lg font-medium">Search</span>
          </div>
          <button 
            onClick={() => setIsSearchPanelExpanded(!isSearchPanelExpanded)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={isSearchPanelExpanded ? "Collapse search panel" : "Expand search panel"}
          >
            {isSearchPanelExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {isSearchPanelExpanded && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-3">
              <div>
                <Input 
                  placeholder="Employee ID" 
                  className="w-full bg-white"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>
              
              <div>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Employee Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {filteredUsers.map(user => (
                      <SelectItem key={user.id} value={user.username || `user-${user.id}`}>
                        {user.name || user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div 
                  className="relative border border-input rounded-md px-3 py-2 bg-white text-sm flex items-center cursor-pointer"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>{dateRange.from ? format(dateRange.from, 'dd/MM/yyyy') : 'Login Date From'}</span>
                </div>
              </div>
              
              <div>
                <div 
                  className="relative border border-input rounded-md px-3 py-2 bg-white text-sm flex items-center cursor-pointer"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>{dateRange.to ? format(dateRange.to, 'dd/MM/yyyy') : 'Login Date To'}</span>
                </div>
              </div>
            </div>
            
            {showCalendar && (
              <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                <div className="flex">
                  <div className="p-2">
                    <div className="text-center font-medium mb-2">
                      {format(new Date(), 'MMM yyyy')}
                    </div>
                    <Calendar
                      mode="range"
                      selected={{
                        from: dateRange.from,
                        to: dateRange.to
                      }}
                      onSelect={handleDateRangeSelect}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="p-2">
                    <div className="text-center font-medium mb-2">
                      {format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'MMM yyyy')}
                    </div>
                    <Calendar
                      mode="range"
                      selected={{
                        from: dateRange.from,
                        to: dateRange.to
                      }}
                      onSelect={handleDateRangeSelect}
                      defaultMonth={new Date(new Date().setMonth(new Date().getMonth() + 1))}
                      className="rounded-md border"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <Button 
                className="bg-[#0076a8] hover:bg-[#00608a] text-white px-6"
                onClick={handleSearch}
              >
                Search
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300 px-6"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Export Button */}
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-gray-300"
          onClick={handleExportToExcel}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export To Excel
        </Button>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Login Date Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Logout Date Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingLogs ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center">
                    No data found
                  </td>
                </tr>
              ) : (
                currentData.map((log, index) => (
                  <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-center whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{log.userId || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{log.employeeName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.loginDateTime ? format(new Date(log.loginDateTime), 'dd-MM-yyyy HH:mm:ss') : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.logoutDateTime ? format(new Date(log.logoutDateTime), 'dd-MM-yyyy HH:mm:ss') : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{log.ipAddress}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">
              Show
            </span>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(value) => setItemsPerPage(parseInt(value))}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`inline-flex items-center justify-center w-8 h-8 border ${
                  currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
                } rounded-l-md`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`inline-flex items-center justify-center w-8 h-8 border ${
                  currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
                } rounded-r-md`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}