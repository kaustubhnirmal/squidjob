import React from "react";
import { useQuery } from "@tanstack/react-query";
import { CompetitorSearch } from "@/components/competitors/competitor-search";
import { CompetitorList } from "@/components/competitors/competitor-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Competitor } from "@/types";

interface CompetitorFilters {
  name?: string;
  state?: string;
  category?: string;
}

export default function Competitors() {
  const [filters, setFilters] = React.useState<CompetitorFilters>({});

  // Fetch competitors
  const { data: competitors, isLoading } = useQuery<Competitor[]>({
    queryKey: ["/api/competitors"],
  });

  // Filter competitors based on search filters
  const filteredCompetitors = React.useMemo(() => {
    if (!competitors) return [];
    
    let result = [...competitors];
    
    if (filters.name) {
      const name = filters.name.toLowerCase();
      result = result.filter(competitor => 
        competitor.name.toLowerCase().includes(name)
      );
    }
    
    if (filters.state) {
      const state = filters.state.toLowerCase();
      result = result.filter(competitor => 
        competitor.state?.toLowerCase().includes(state)
      );
    }
    
    if (filters.category) {
      const category = filters.category.toLowerCase();
      result = result.filter(competitor => 
        competitor.category?.toLowerCase().includes(category)
      );
    }
    
    return result;
  }, [competitors, filters]);

  const handleSearch = (newFilters: CompetitorFilters) => {
    setFilters(newFilters);
  };

  const handleClear = () => {
    setFilters({});
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Competitors</h1>
        <p className="text-sm text-gray-600 mt-1">
          Track and analyze your competitors' bidding activities
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="px-5 py-4 border-b border-gray-200">
          <CardTitle className="text-lg font-medium text-gray-800">Competitors Search</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <CompetitorSearch onSearch={handleSearch} onClear={handleClear} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <CardTitle className="text-lg font-medium text-gray-800">Bidders</CardTitle>
            {filteredCompetitors.length > 0 && (
              <Badge variant="outline" className="ml-2 bg-gray-100">
                {filteredCompetitors.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <CompetitorList competitors={filteredCompetitors} loading={isLoading} />
        </CardContent>
      </Card>
    </main>
  );
}
