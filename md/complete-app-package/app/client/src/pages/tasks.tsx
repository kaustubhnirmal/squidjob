import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, ChevronUp, ChevronDown, Eye, Edit, Download, Trash2 } from 'lucide-react';
import { useUser } from '@/user-context';
import { usePermissions } from '@/hooks/use-permissions';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import * as XLSX from 'xlsx';
import { getQueryFn } from '@/lib/queryClient';

// Local components to avoid path issues - simplified without greeting message
const PageHeader = ({ title, children }: any) => (
  <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
    </div>
    {children && <div className="flex gap-2">{children}</div>}
  </div>
);

const NotAuthorized = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[70vh] p-4">
    <div className="flex flex-col items-center justify-center text-center max-w-lg">
      <div className="bg-red-100 p-4 rounded-full mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="16.5" y1="7.5" x2="7.5" y2="16.5" />
          <line x1="7.5" y1="7.5" x2="16.5" y2="16.5" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-lg text-gray-600 mb-6">
        You don't have permission to view this page. Please contact your administrator if you believe this is an error.
      </p>
      <Button 
        className="bg-primary-600 hover:bg-primary-700 text-white"
        onClick={() => window.location.href = '/'}
      >
        Return to Dashboard
      </Button>
    </div>
  </div>
);

export default function TasksPage() {
  const { currentUser } = useUser();
  const { hasPermission } = usePermissions();
  const [pageIndex, setPageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('under-process');
  const pageSize = 10;
  
  // Filter state
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [tenderId, setTenderId] = useState('');
  const [tenderStatus, setTenderStatus] = useState('under-process'); // Default to match active tab
  const [assignedBy, setAssignedBy] = useState('all');
  const [assignedTo, setAssignedTo] = useState('all');
  
  // Fetch users for dropdowns
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: getQueryFn({ on401: "redirect" }),
  });

  // Fetch task allocations
  const { data: taskAllocations = [] } = useQuery({
    queryKey: ['/api/task-allocations'],
    queryFn: getQueryFn({ on401: "redirect" }),
  });

  // Filter task allocations based on status and filters
  const filteredTasks = taskAllocations.filter((task: any) => {
    let matches = true;
    
    if (tenderId && !task.tenderReferenceNo?.includes(tenderId)) {
      matches = false;
    }
    
    if (assignedBy !== 'all' && task.assignedBy.toString() !== assignedBy) {
      matches = false;
    }
    
    if (assignedTo !== 'all' && task.assignedTo.toString() !== assignedTo) {
      matches = false;
    }

    // Map tender status to task status
    if (tenderStatus !== 'under-process' && task.status !== tenderStatus.replace('-', ' ')) {
      matches = false;
    }
    
    return matches;
  });

  // Check if user has permission to view tasks
  if (!hasPermission('task')) {
    return <NotAuthorized />;
  }

  // Tab data with counts based on real data
  const tabs = [
    { id: 'under-process', label: 'Under Process', count: taskAllocations.filter((t: any) => t.status === 'Pending').length },
    { id: 'under-review', label: 'Under Review', count: taskAllocations.filter((t: any) => t.status === 'Under Review').length },
    { id: 'under-revision', label: 'Under Revision', count: taskAllocations.filter((t: any) => t.status === 'Under Revision').length },
    { id: 'approved', label: 'Approved', count: taskAllocations.filter((t: any) => t.status === 'Completed').length },
    { id: 'drop', label: 'Drop', count: taskAllocations.filter((t: any) => t.status === 'Dropped').length },
  ];
  
  const handleSearch = () => {
    // Filter tasks based on selected criteria
    console.log('Search with filters:', {
      tenderId,
      tenderStatus,
      assignedBy,
      assignedTo
    });
    // In a real implementation, this would fetch filtered data from the API
  };
  
  const handleClear = () => {
    // Reset all filters
    setTenderId('');
    setTenderStatus(activeTab); // Reset to current active tab
    setAssignedBy('all');
    setAssignedTo('all');
  };
  
  const handleExportToExcel = () => {
    // Create Excel workbook
    const ws = XLSX.utils.json_to_sheet(filteredTasks.map((task, index) => ({
      'S.No': index + 1,
      'Tender ID': task.tenderReferenceNo?.trim() || '',
      'Tender Name': task.tenderTitle || task.taskName || '',
      'Client Name': task.tenderClientName || '',
      'Location': task.tenderLocation || '',
      'Submission Date': task.tenderSubmissionDate ? new Date(task.tenderSubmissionDate).toLocaleDateString() : '',
      'Task Work': task.taskName || '',
      'Assignor Name': task.assignedByName || '',
      'Assignee Name': task.assignedToName || '',
      'Created Date & Time': task.createdAt ? new Date(task.createdAt).toLocaleString() : '',
      'Deadline': task.taskDeadline ? new Date(task.taskDeadline).toLocaleString() : '',
      'Status': task.status || '',
      'Remarks': task.remarks || ''
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
    
    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `Tasks_Report_${currentDate}.xlsx`;
    
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Task" />
      
      <div className="bg-background-50 shadow-sm rounded-lg p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          {/* Title with toggle button */}
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-400" />
            <span className="font-medium">Task Filter</span>
            <button 
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none ml-2"
            >
              {isFilterExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* This div is intentionally empty to maintain layout */}
          <div></div>
        </div>

        {/* Filter Panel */}
        {isFilterExpanded && (
          <div className="mb-6 bg-white p-4 border border-gray-200 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Select value={tenderStatus} onValueChange={setTenderStatus}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Tender Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select Status</SelectItem>
                    <SelectItem value="under-process">Under Process</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                    <SelectItem value="re-work">Re-Work</SelectItem>
                    <SelectItem value="re-assign">Re-Assign</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="drop">Drop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={assignedBy} onValueChange={setAssignedBy}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Assign By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select Assignor</SelectItem>
                    {users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name || user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Assign To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select Assignee</SelectItem>
                    {users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name || user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Input
                  placeholder="Tender ID"
                  value={tenderId}
                  onChange={(e) => setTenderId(e.target.value)}
                  className="w-full bg-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="btn-purple"
                onClick={handleSearch}
              >
                Search
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300 hover:bg-purple-50"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-6 py-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab(tab.id);
                setTenderStatus(tab.id);
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Export to Excel Button */}
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
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  TENDER ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  TENDER NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  CLIENT NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  LOCATION
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  SUBMISSION DATE
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  TASK WORK
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  ASSIGNOR NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  ASSIGNEE NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  CREATED DATE & TIME
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  DEADLINE
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                    No task allocations found
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task, index) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Link href={`/tenders/${task.tenderId}`}>
                        <span className="text-purple-600 hover:text-purple-800 cursor-pointer font-medium">
                          {task.tenderReferenceNo?.trim() || ''}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{task.tenderTitle || task.taskName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{task.tenderClientName || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{task.tenderLocation || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {task.tenderSubmissionDate ? new Date(task.tenderSubmissionDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{task.taskName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{task.assignedByName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{task.assignedToName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {task.createdAt ? new Date(task.createdAt).toLocaleDateString() + ' ' + new Date(task.createdAt).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {task.taskDeadline ? new Date(task.taskDeadline).toLocaleDateString() + ' ' + new Date(task.taskDeadline).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600" 
                          title="View Task Details"
                          onClick={() => console.log('View task:', task.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600" 
                          title="Edit Task"
                          onClick={() => console.log('Edit task:', task.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {task.attachmentPath && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600" 
                            title="Download Attachment"
                            onClick={() => console.log('Download attachment:', task.attachmentPath)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600" 
                          title="Delete Task"
                          onClick={() => console.log('Delete task:', task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <span className="mr-2">Show</span>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => {
                // Handle page size change
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm mr-2">Page {pageIndex + 1}</span>
            <div className="flex space-x-1">
              <button
                onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                disabled={pageIndex === 0}
                className="p-1 rounded border border-gray-300 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPageIndex(pageIndex + 1)}
                disabled={filteredTasks.length < pageSize}
                className="p-1 rounded border border-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}