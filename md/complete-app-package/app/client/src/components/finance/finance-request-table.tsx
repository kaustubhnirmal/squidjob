import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, FileEdit, Trash2, CheckCircle, Pencil, Calendar, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/user-context";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import FinanceFilterPanel from "./finance-filter-panel";

interface FinanceRequestData {
  id: number;
  tenderId: string;
  requirement: string;
  paymentMode: string;
  amount: string;
  requesterName: string;
  financeExecutive: string;
  requestedDate: string;
  deadlineDate: string;
  validity: string;
  approvalStatus: string;
}

interface FinanceRequestTableProps {
  title: string;
  data: FinanceRequestData[];
}

const FinanceRequestTable = ({ title, data }: FinanceRequestTableProps) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedFinanceRequest, setSelectedFinanceRequest] = useState<FinanceRequestData | null>(null);
  const { currentUser } = useUser();
  const { toast } = useToast();

  // If no data is provided, use a placeholder with the current user
  const tableData = data.length > 0 ? data : [
    {
      id: 1,
      tenderId: "14371",
      requirement: "EMD",
      paymentMode: "Online",
      amount: "13500",
      requesterName: currentUser?.name || "User",
      financeExecutive: "Sampark Patel",
      requestedDate: "04-12-2024 18:00",
      deadlineDate: "05-12-2024 12:00",
      validity: "02-01-2025 12:00",
      approvalStatus: "Pending"
    },
    {
      id: 2,
      tenderId: "16751",
      requirement: "EMD",
      paymentMode: "Offline",
      amount: "5000",
      requesterName: currentUser?.name || "User",
      financeExecutive: "Palak Shah",
      requestedDate: "02-12-2024 15:44",
      deadlineDate: "06-12-2024 12:00",
      validity: "02-01-2025 12:00",
      approvalStatus: "Self Approved"
    }
  ];

  const handleApproveSubmit = () => {
    if (!selectedFinanceRequest) return;
    
    toast({
      title: "Request Approved",
      description: `Finance request for tender ${selectedFinanceRequest.tenderId} has been approved.`
    });
    
    setSelectedFinanceRequest(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Finance Request Approval Dialog */}
      <Dialog open={!!selectedFinanceRequest} onOpenChange={(open) => !open && setSelectedFinanceRequest(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="finance-approval-description">
          <DialogHeader>
            <DialogTitle>Approve Request Finance Details</DialogTitle>
            <p id="finance-approval-description" className="text-sm text-gray-500">
              Review tender details and approve finance request
            </p>
          </DialogHeader>
          
          {selectedFinanceRequest && (
            <div className="overflow-y-auto pr-2 -mr-2 pb-4">
              <div className="bg-gray-50 rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Tender Brief:</p>
                    <p className="text-sm">
                      corrigendum : laying of underground cables including street lighting and associated repair of road works in epc mode including dip of one year ......
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Tender ID:</p>
                    <p className="text-sm">{selectedFinanceRequest.tenderId}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Tender Authority:</p>
                    <p className="text-sm">Agartala Smart City Limited</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Reference No.:</p>
                    <p className="text-sm">2024_CEO_54579_1</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Tender Status:</p>
                    <p className="text-sm">Assigned</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Request Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Requirement:</p>
                      <p className="text-sm">{selectedFinanceRequest.requirement}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Requested Date:</p>
                      <p className="text-sm">{selectedFinanceRequest.requestedDate}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Payment Mode:</p>
                      <p className="text-sm">{selectedFinanceRequest.paymentMode}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Finance Executive:</p>
                      <p className="text-sm">{selectedFinanceRequest.financeExecutive}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Remarks:</p>
                      <p className="text-sm">for emd preparation</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Requester:</p>
                      <p className="text-sm">{selectedFinanceRequest.requesterName}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Deadline:</p>
                      <p className="text-sm">{selectedFinanceRequest.deadlineDate}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Amount:</p>
                      <p className="text-sm">{selectedFinanceRequest.amount}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Status:</p>
                      <p className="text-sm">{selectedFinanceRequest.approvalStatus}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Document:</p>
                      <p className="text-sm">-</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Approve Finance Request Detail</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="finance-executive">Finance Executive *</Label>
                    <Select defaultValue="finance-executive">
                      <SelectTrigger id="finance-executive">
                        <SelectValue placeholder="Select Finance Executive" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="finance-executive">Finance Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline *</Label>
                    <Select defaultValue="deadline">
                      <SelectTrigger id="deadline">
                        <SelectValue placeholder="Select Deadline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deadline">Deadline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea 
                      id="remarks" 
                      placeholder="Enter your remarks here"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-shrink-0 border-t pt-4 mt-auto">
            <Button variant="outline" onClick={() => setSelectedFinanceRequest(null)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 text-white" onClick={handleApproveSubmit}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center p-4 bg-white border-b">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      
      {/* Finance Filter Panel */}
      <FinanceFilterPanel 
        onSearch={(filters) => {
          console.log('Search with filters:', filters);
          toast({
            title: "Search Applied",
            description: "Filters have been applied to the data"
          });
        }}
        onClear={() => {
          console.log('Filters cleared');
          toast({
            title: "Filters Cleared",
            description: "All filters have been reset"
          });
        }}
        username={currentUser?.name || "User"}
      />
      
      {/* Export Button */}
      <div className="flex justify-end px-4 mb-4">
        <Button 
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export To Excel
        </Button>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        <div className="bg-white rounded-md shadow">
          <div className="overflow-x-auto">
            <Table className="whitespace-nowrap">
              <TableHeader>
                <TableRow className="bg-blue-600 text-white hover:bg-blue-700">
                  <TableHead className="text-white font-medium text-center w-10">#</TableHead>
                  <TableHead className="text-white font-medium">TENDER ID</TableHead>
                  <TableHead className="text-white font-medium">REQUIREMENT</TableHead>
                  <TableHead className="text-white font-medium">PAYMENT MODE</TableHead>
                  <TableHead className="text-white font-medium">AMOUNT</TableHead>
                  <TableHead className="text-white font-medium">REQUESTER NAME</TableHead>
                  <TableHead className="text-white font-medium">FINANCE EXECUTIVE</TableHead>
                  <TableHead className="text-white font-medium">REQUESTED DATE</TableHead>
                  <TableHead className="text-white font-medium">DEADLINE DATE</TableHead>
                  <TableHead className="text-white font-medium">VALIDITY</TableHead>
                  <TableHead className="text-white font-medium">APPROVAL STATUS</TableHead>
                  <TableHead className="text-white font-medium">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow key={row.id} className="hover:bg-gray-50">
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="text-blue-600 font-medium">{row.tenderId}</TableCell>
                    <TableCell>{row.requirement}</TableCell>
                    <TableCell>{row.paymentMode}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell>{row.requesterName}</TableCell>
                    <TableCell>{row.financeExecutive}</TableCell>
                    <TableCell>{row.requestedDate}</TableCell>
                    <TableCell>{row.deadlineDate}</TableCell>
                    <TableCell>{row.validity}</TableCell>
                    <TableCell>
                      <span 
                        className={`py-1 px-2 rounded-full text-xs ${
                          row.approvalStatus === "Pending" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : row.approvalStatus === "Self Approved" 
                            ? "bg-green-100 text-green-800"
                            : row.approvalStatus === "Denied"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {row.approvalStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          title="Edit Request"
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          title="Delete Request"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          title="Update Payment Details"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          title="Send Approve"
                          onClick={() => setSelectedFinanceRequest(row)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">Show</span>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(value) => setRowsPerPage(parseInt(value))}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-700 ml-2">Page {page} of {Math.max(1, Math.ceil(tableData.length / rowsPerPage))}</span>
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Prev
              </Button>
              <Button 
                variant="default"
                size="sm"
                className="bg-black text-white"
              >
                {page}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(Math.ceil(tableData.length / rowsPerPage), page + 1))}
                disabled={page >= Math.ceil(tableData.length / rowsPerPage)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceRequestTable;