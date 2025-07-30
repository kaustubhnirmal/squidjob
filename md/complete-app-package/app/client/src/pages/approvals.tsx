import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  Download,
  CalendarIcon,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Link } from 'wouter';

// Sample data types
interface Approval {
  id: number;
  tenderId: string;
  tenderFullId: number;
  approvalFor: string;
  approvalFrom: string;
  inLoop: string;
  requester: string;
  requestDate: string;
  actionDate: string;
  deadlineDate: string;
  status: string;
}

interface User {
  id: number;
  name: string;
}

export default function Approvals() {
  const { toast } = useToast();
  const [tenderId, setTenderId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFor, setApprovalFor] = useState('');
  const [approvalFrom, setApprovalFrom] = useState('all');
  const [requestDateFrom, setRequestDateFrom] = useState<Date | undefined>(undefined);
  const [requestDateTo, setRequestDateTo] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showSearchCard, setShowSearchCard] = useState(false);
  
  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Fetch real approval data
  const { data: approvals = [] } = useQuery<Approval[]>({
    queryKey: ['/api/approval-requests'],
    select: (data: any[]) => {
      return data.map(item => ({
        id: item.id,
        tenderId: item.tender?.referenceNo ? item.tender.referenceNo.trim() : item.tenderId?.toString() || 'N/A',
        tenderFullId: item.tender?.id || item.tenderId, // Keep full tender ID for linking
        approvalFor: item.approvalFor || 'N/A',
        approvalFrom: item.approvalFromUser?.name || 'N/A',
        inLoop: item.inLoopUser?.name || 'N/A',
        requester: item.requesterUser?.name || 'N/A',
        requestDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') + ' ' + new Date(item.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        actionDate: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') + ' ' + new Date(item.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        deadlineDate: item.deadline ? new Date(item.deadline).toLocaleDateString('en-GB') + ' ' + new Date(item.deadline).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        status: item.status || 'Pending'
      }));
    }
  });

  const handleViewApproval = (id: number) => {
    toast({
      title: "View Approval",
      description: `Viewing approval details for ID: ${id}`,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(0);
  };

  const handleSearch = () => {
    // In a real app, this would make an API call with the filter parameters
    toast({
      title: "Search",
      description: "Search functionality would be implemented in production",
    });
  };

  const handleClear = () => {
    setTenderId('');
    setStatusFilter('');
    setApprovalFor('');
    setApprovalFrom('');
    setRequestDateFrom(undefined);
    setRequestDateTo(undefined);
  };

  const toggleSearchCard = () => {
    setShowSearchCard(!showSearchCard);
  };

  const exportToExcel = () => {
    toast({
      title: "Export to Excel",
      description: "Data would be exported to Excel in production",
    });
  };

  // Filter approvals based on user selections
  const filteredApprovals = approvals.filter(approval => {
    // Filter by tender ID if provided
    const tenderIdMatch = tenderId 
      ? approval.tenderId.includes(tenderId)
      : true;
    
    // Filter by status if not "all"
    const statusMatch = statusFilter === 'all' 
      ? true 
      : approval.status === statusFilter;
    
    // Filter by approval from if not "all"
    const approvalFromMatch = approvalFrom === 'all'
      ? true
      : approval.approvalFrom === approvalFrom;
    
    // Filter by approval for if provided
    const approvalForMatch = approvalFor
      ? approval.approvalFor.toLowerCase().includes(approvalFor.toLowerCase())
      : true;
    
    // Return true only if all filters match
    return tenderIdMatch && statusMatch && approvalFromMatch && approvalForMatch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredApprovals.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApprovals = filteredApprovals.slice(startIndex, endIndex);

  return (
    <div className="container py-6 flex flex-col h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-purple-600">Approval's</h1>
        <div className="text-sm text-gray-500"></div>
      </div>

      <Card className="mb-6 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
          <div className="flex items-center">
            <Search className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium">Search</span>
          </div>
          <button 
            onClick={toggleSearchCard} 
            className="text-gray-500"
          >
            {showSearchCard ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        
        {showSearchCard && (
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {/* Tender ID */}
              <div>
                <Input
                  placeholder="Tender Id"
                  value={tenderId}
                  onChange={(e) => setTenderId(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {/* Approval Status */}
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Approval Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Approval For */}
              <div>
                <Input
                  placeholder="Approval For"
                  value={approvalFor}
                  onChange={(e) => setApprovalFor(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Approval From */}
              <div>
                <Select
                  value={approvalFrom}
                  onValueChange={setApprovalFrom}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Approval From" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.name}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Request Date From */}
              <div>
                <Input
                  type="date"
                  placeholder="Request Date From"
                  className="w-full"
                  onChange={(e) => e.target.valueAsDate && setRequestDateFrom(e.target.valueAsDate)}
                />
              </div>
              
              {/* Request Date To */}
              <div>
                <Input
                  type="date"
                  placeholder="Request Date To"
                  className="w-full"
                  onChange={(e) => e.target.valueAsDate && setRequestDateTo(e.target.valueAsDate)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                className="btn-purple"
              >
                Search
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex justify-end mb-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-purple-600 text-purple-600 hover:bg-purple-50"
          onClick={exportToExcel}
        >
          <Download className="h-4 w-4" /> Export To Excel
        </Button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden flex-grow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-purple-600">
              <TableRow>
                <TableHead className="w-12 text-white font-medium">#</TableHead>
                <TableHead className="text-white font-medium">TENDER ID</TableHead>
                <TableHead className="text-white font-medium">APPROVAL FOR</TableHead>
                <TableHead className="text-white font-medium">APPROVAL FROM</TableHead>
                <TableHead className="text-white font-medium">IN LOOP</TableHead>
                <TableHead className="text-white font-medium">REQUESTER</TableHead>
                <TableHead className="text-white font-medium">REQUEST DATE</TableHead>
                <TableHead className="text-white font-medium">ACTION DATE</TableHead>
                <TableHead className="text-white font-medium">DEADLINE DATE</TableHead>
                <TableHead className="text-white font-medium">STATUS</TableHead>
                <TableHead className="text-white font-medium text-right">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentApprovals.length > 0 ? (
                currentApprovals.map((approval, index) => (
                  <TableRow key={approval.id}>
                    <TableCell>{startIndex + index + 1}</TableCell>
                    <TableCell>
                      <Link href={`/tenders/${approval.tenderFullId}`} className="text-purple-600 hover:text-purple-800 hover:underline font-medium">
                        {approval.tenderId}
                      </Link>
                    </TableCell>
                    <TableCell>{approval.approvalFor}</TableCell>
                    <TableCell>{approval.approvalFrom}</TableCell>
                    <TableCell>{approval.inLoop}</TableCell>
                    <TableCell>{approval.requester}</TableCell>
                    <TableCell>{approval.requestDate}</TableCell>
                    <TableCell>{approval.actionDate}</TableCell>
                    <TableCell>{approval.deadlineDate}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        approval.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        approval.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        approval.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {approval.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewApproval(approval.id)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        <Eye className="h-4 w-4 mr-1" /> Action
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-2 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue placeholder={itemsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">
              Page {currentPage}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">Prev</span>
            <span className="text-sm text-gray-600">Next</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1 || totalPages === 0}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}