import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompetitorSearchProps {
  onSearch: (filters: CompetitorFilters) => void;
  onClear: () => void;
}

interface CompetitorFilters {
  name?: string;
  state?: string;
  category?: string;
}

export function CompetitorSearch({ onSearch, onClear }: CompetitorSearchProps) {
  const [filters, setFilters] = React.useState<CompetitorFilters>({});

  const handleChange = (key: keyof CompetitorFilters, value: string) => {
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
            Search Company
          </label>
          <Input
            id="company-name"
            placeholder="Company name"
            value={filters.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="tendering-ownership" className="block text-sm font-medium text-gray-700 mb-1">
            Tendering Ownership
          </label>
          <Select
            value={filters.category || ''}
            onValueChange={(value) => handleChange('category', value)}
          >
            <SelectTrigger id="tendering-ownership">
              <SelectValue placeholder="Select Ownership" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_ownerships">All Ownerships</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="joint">Joint Venture</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <Select
            value={filters.state || ''}
            onValueChange={(value) => handleChange('state', value)}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_states">All States</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Gujarat">Gujarat</SelectItem>
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
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_categories">All Categories</SelectItem>
              <SelectItem value="Construction">Construction</SelectItem>
              <SelectItem value="Civil Works">Civil Works</SelectItem>
              <SelectItem value="Electrical">Electrical</SelectItem>
              <SelectItem value="Mechanical">Mechanical</SelectItem>
              <SelectItem value="IT Services">IT Services</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
        >
          Clear
        </Button>
        <Button
          type="submit"
          className="bg-primary text-white"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
