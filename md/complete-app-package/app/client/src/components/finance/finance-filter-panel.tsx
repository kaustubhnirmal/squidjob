import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";

interface FinanceFilterPanelProps {
  onApplyFilter: (filters: any) => void;
}

export default function FinanceFilterPanel({ onApplyFilter }: FinanceFilterPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [filters, setFilters] = useState({
    tenderId: "",
    requestStatus: "all",
    startDate: "",
    endDate: "",
    approvedBy: "all"
  });

  // Toggle filter panel visibility
  const toggleFilterPanel = () => {
    setIsVisible(!isVisible);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle filter application
  const handleApplyFilter = () => {
    onApplyFilter(filters);
  };

  // Handle filter reset
  const handleResetFilter = () => {
    setFilters({
      tenderId: "",
      requestStatus: "all",
      startDate: "",
      endDate: "",
      approvedBy: "all"
    });
    onApplyFilter({
      tenderId: "",
      requestStatus: "all",
      startDate: "",
      endDate: "",
      approvedBy: "all"
    });
  };

  return (
    <div className="mb-6 bg-white border rounded-md shadow-sm">
      {/* Filter Toggle Button */}
      <div 
        className="p-3 border-b flex items-center justify-between cursor-pointer"
        onClick={toggleFilterPanel}
      >
        <div className="flex items-center text-[#0076a8]">
          <Filter className="h-4 w-4 mr-2" />
          <span className="font-medium">Filters</span>
        </div>
        <div>
          {isVisible ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Filter Content - Only visible when isVisible is true */}
      {isVisible && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="tenderId">Tender ID</Label>
              <Input
                id="tenderId"
                name="tenderId"
                value={filters.tenderId}
                onChange={handleInputChange}
                placeholder="Enter Tender ID"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="requestStatus">Request Status</Label>
              <Select
                value={filters.requestStatus}
                onValueChange={(value) => handleSelectChange("requestStatus", value)}
              >
                <SelectTrigger id="requestStatus" className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="approvedBy">Approved By</Label>
              <Select
                value={filters.approvedBy}
                onValueChange={(value) => handleSelectChange("approvedBy", value)}
              >
                <SelectTrigger id="approvedBy" className="mt-1">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="user1">Kaustubh Nirmal</SelectItem>
                  <SelectItem value="user2">Poonam Amale</SelectItem>
                  <SelectItem value="user3">Aman Sathe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={filters.startDate}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={filters.endDate}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleResetFilter}>
              Reset
            </Button>
            <Button className="bg-[#0076a8] hover:bg-[#005e86]" onClick={handleApplyFilter}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}