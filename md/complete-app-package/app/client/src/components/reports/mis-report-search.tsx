import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MisReportSearchProps {
  onSearch: (filters: ReportFilters) => void;
  onClear: () => void;
}

interface ReportFilters {
  keyword?: string;
  state?: string;
  department?: string;
  category?: string;
  bidders?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function MisReportSearch({ onSearch, onClear }: MisReportSearchProps) {
  const [filters, setFilters] = React.useState<ReportFilters>({});
  
  const handleChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };
  
  const handleClear = () => {
    setFilters({});
    onClear();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="word-search" className="block text-sm font-medium text-gray-700 mb-1">
            Word Search
          </label>
          <Input
            id="word-search"
            placeholder="Search for keywords"
            value={filters.keyword || ''}
            onChange={(e) => handleChange('keyword', e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="select-state" className="block text-sm font-medium text-gray-700 mb-1">
            Select State
          </label>
          <Select
            value={filters.state || ''}
            onValueChange={(value) => handleChange('state', value)}
          >
            <SelectTrigger id="select-state">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_states">All States</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
              <SelectItem value="Gujarat">Gujarat</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <Select
            value={filters.department || ''}
            onValueChange={(value) => handleChange('department', value)}
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_departments">All Departments</SelectItem>
              <SelectItem value="Railways">Railways</SelectItem>
              <SelectItem value="Public Works">Public Works</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Energy">Energy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select
            value={filters.category || ''}
            onValueChange={(value) => handleChange('category', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_categories">All Categories</SelectItem>
              <SelectItem value="Construction">Construction</SelectItem>
              <SelectItem value="IT Services">IT Services</SelectItem>
              <SelectItem value="Medical Equipment">Medical Equipment</SelectItem>
              <SelectItem value="Electrical">Electrical</SelectItem>
              <SelectItem value="Mechanical">Mechanical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="bidders" className="block text-sm font-medium text-gray-700 mb-1">
            Participating Bidders
          </label>
          <Select
            value={filters.bidders || ''}
            onValueChange={(value) => handleChange('bidders', value)}
          >
            <SelectTrigger id="bidders">
              <SelectValue placeholder="All Bidders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_bidders">All Bidders</SelectItem>
              <SelectItem value="Ncc Limited">Ncc Limited</SelectItem>
              <SelectItem value="Rcc Developers Limited">Rcc Developers Limited</SelectItem>
              <SelectItem value="M/S Globe Civil Projects">M/S Globe Civil Projects</SelectItem>
              <SelectItem value="Larsen And Toubro Limited">Larsen And Toubro Limited</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              id="start-date"
              type="date"
              onChange={(e) => handleChange('dateRange', {
                ...(filters.dateRange || { end: new Date() }),
                start: new Date(e.target.value)
              })}
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              id="end-date"
              type="date"
              onChange={(e) => handleChange('dateRange', {
                ...(filters.dateRange || { start: new Date() }),
                end: new Date(e.target.value)
              })}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
        >
          Clear
        </Button>
        <Button
          type="submit"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
