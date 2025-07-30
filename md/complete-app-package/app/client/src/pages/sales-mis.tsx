import React, { useState, useEffect, useMemo } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { DateRange } from "react-day-picker";
import * as XLSX from 'xlsx';

interface User {
  id: number;
  username: string;
  name: string;
  createdAt?: string; // ISO date string
}

interface SalesMisData {
  id: number;
  userId: number;
  username: string;
  name: string;
  displayName?: string;
  assigned: number;
  inProcess: number;
  submitted: number;
  cancelled: number;
  awarded: number;
  lost: number;
  rejected: number;
  dropped: number;
  reopened: number;
  totalTender: number;
}

export default function SalesMIS() {
  const queryClient = useQueryClient();
  
  // Date range state
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

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

  // Fetch sales MIS data
  const { 
    data: salesMisData = [], 
    isLoading: isLoadingSalesMis,
    refetch 
  } = useQuery<SalesMisData[]>({
    queryKey: ['/api/sales-mis'],
    queryFn: async () => {
      // Build URL with query parameters
      let url = '/api/sales-mis';
      const params = new URLSearchParams();
      
      if (selectedUser) {
        params.append('username', selectedUser);
      }
      
      if (dateRange.from) {
        params.append('startDate', dateRange.from.toISOString());
      }
      
      if (dateRange.to) {
        params.append('endDate', dateRange.to.toISOString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch sales MIS data');
      }
      return response.json();
    },
    enabled: !isLoadingUsers,
  });

  // Filter users based on department = 'Sales' or role = 'Sales'
  const filteredUsers = useMemo(() => {
    return users;
  }, [users]);

  // Filter sales MIS data based on selected filters
  const tableData = useMemo(() => {
    if (!salesMisData) return [];
    return salesMisData;
  }, [salesMisData]);

  // Handlers
  const handleSearch = () => {
    refetch();
  };

  const handleClear = () => {
    setSelectedUser("");
    setDateRange({ from: undefined, to: undefined });
    
    // Reset the query params and refetch
    queryClient.invalidateQueries({ queryKey: ['/api/sales-mis'] });
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange({
        from: range.from,
        to: range.to
      });
      if (range.to) {
        setShowCalendar(false);
      }
    } else {
      setDateRange({ from: undefined, to: undefined });
    }
  };

  const handleExportToExcel = () => {
    // Prepare data for export
    const exportData = tableData.map(row => ({
      'ID': row.id,
      'User Name': row.displayName || row.name || row.username,
      'Assigned': row.assigned,
      'In Process': row.inProcess,
      'Submitted': row.submitted,
      'Cancelled': row.cancelled,
      'Awarded': row.awarded,
      'Lost': row.lost,
      'Rejected': row.rejected,
      'Dropped': row.dropped,
      'Reopened': row.reopened,
      'Total Tender': row.totalTender
    }));
    
    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales MIS');
    
    // Create file name with date
    const fileName = `Sales_MIS_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
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
    return 'Date From -- Date To';
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

  return (
    <div className="p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales MIS</h1>
      </div>

      {/* Search Panel */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2 text-gray-500" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="text-lg font-medium">Search</span>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700 p-2"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            {isFilterExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {isFilterExpanded && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="User Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {filteredUsers.map(user => (
                      <SelectItem key={user.id} value={user.username}>
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
                  <span>{formatDateRange()}</span>
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
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                className="bg-[#0076a8] hover:bg-[#00608a] text-white px-8"
                onClick={handleSearch}
              >
                Search
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300 px-8"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-end p-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-gray-300"
            onClick={handleExportToExcel}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export to Excel
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">User Name</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Assigned</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">In Process</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Submitted</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Cancelled</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Awarded</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Lost</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Rejected</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Dropped</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Reopened</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Total Tender</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{row.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{row.displayName || row.name || row.username}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{row.assigned}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{row.inProcess}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{row.submitted}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{row.cancelled}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{row.awarded}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{row.lost}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{row.rejected}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{row.dropped}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{row.reopened}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{row.totalTender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center">
            <select 
              className="mr-2 border-gray-300 rounded-md text-sm" 
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={10}>Show 10</option>
              <option value={25}>Show 25</option>
              <option value={50}>Show 50</option>
              <option value={100}>Show 100</option>
            </select>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}