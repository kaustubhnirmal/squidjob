import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function FinanceMIS() {
  const [isSearchPanelExpanded, setIsSearchPanelExpanded] = useState(true);

  return (
    <div className="p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Finance MIS</h1>
      </div>

      {/* Search Panel */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Tender Filter</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Tender Id</label>
                <Input 
                  type="text" 
                  placeholder="Tender Id" 
                  className="w-full bg-white border-gray-200"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Search Text</label>
                <Input 
                  type="text" 
                  placeholder="Search Text" 
                  className="w-full bg-white border-gray-200"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Organization Name</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Organization Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Organizations</SelectItem>
                    <SelectItem value="org1">Organization 1</SelectItem>
                    <SelectItem value="org2">Organization 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Select Requirement</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document-fees">Document Fees</SelectItem>
                    <SelectItem value="emd">EMD</SelectItem>
                    <SelectItem value="registration-fees">Registration Fees</SelectItem>
                    <SelectItem value="bank-guarantee">Bank Guarantee</SelectItem>
                    <SelectItem value="security-deposit">Security Deposit</SelectItem>
                    <SelectItem value="other-expense">Other Expense</SelectItem>
                    <SelectItem value="processing-fees">Processing Fees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Select Request From</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Request from" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user1">User 1</SelectItem>
                    <SelectItem value="user2">User 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Select Request To</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Request To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user3">User 3</SelectItem>
                    <SelectItem value="user4">User 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Status</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="forfeit">Forfeit</SelectItem>
                    <SelectItem value="convert">Convert To Security Deposit</SelectItem>
                    <SelectItem value="under-process">Under Process</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="refund-follow-up">Refund Follow Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Payment Mode</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Favour Of</label>
                <Input
                  type="text"
                  placeholder="Favour Of"
                  className="w-full bg-white border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Payment Date From</label>
                <Input
                  type="text" 
                  placeholder="dd/mm/yyyy"
                  className="w-full bg-white border-gray-200"
                  onFocus={(e) => {
                    e.currentTarget.type = 'date';
                    e.currentTarget.focus();
                  }}
                  onBlur={(e) => {
                    if (!e.currentTarget.value) {
                      e.currentTarget.type = 'text';
                    }
                  }}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Payment Date To</label>
                <Input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  className="w-full bg-white border-gray-200"
                  onFocus={(e) => {
                    e.currentTarget.type = 'date';
                    e.currentTarget.focus();
                  }}
                  onBlur={(e) => {
                    if (!e.currentTarget.value) {
                      e.currentTarget.type = 'text';
                    }
                  }}
                />
              </div>
              <div className="flex items-end">
                <div className="w-24 mr-3">
                  <label className="text-sm text-gray-600 mb-1 block">Select Value</label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="=" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="=">=</SelectItem>
                      <SelectItem value="<=">&lt;=</SelectItem>
                      <SelectItem value=">=">&gt;=</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-600 mb-1 block">Amount</label>
                  <Input
                    type="text"
                    placeholder="Amount"
                    className="w-full bg-white border-gray-200"
                  />
                </div>
              </div>
            </div>

            <div>
              <Button className="bg-[#0076a8] hover:bg-[#00608a] text-white px-8 mr-2">
                Search
              </Button>
              <Button variant="outline" className="border-gray-300 px-8">
                Clear
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Results Panel - Empty State */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="min-h-[300px] flex flex-col items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 text-gray-300 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
          <p className="text-gray-500 text-lg">Use the search filters above to find financial records</p>
        </div>
      </div>
    </div>
  );
}