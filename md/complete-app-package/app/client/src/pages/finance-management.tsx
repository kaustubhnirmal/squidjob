import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Plus, RefreshCw, FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import FinanceFilterPanel from "@/components/finance/finance-filter-panel";

export default function FinanceManagement() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("new-request");
  const [appliedFilters, setAppliedFilters] = useState({});

  // Handle new transaction
  const handleNewTransaction = () => {
    toast({
      title: "Creating New Finance Request",
      description: "Redirecting to new request page"
    });
    setLocation("/finance-management/new-request");
  };

  // Handle export to Excel
  const handleExportToExcel = () => {
    toast({
      title: "Exporting to Excel",
      description: "Financial data export has started."
    });
  };
  
  // Handle filter application
  const handleApplyFilter = (filters: any) => {
    setAppliedFilters(filters);
    toast({
      title: "Filters Applied",
      description: "Finance requests have been filtered."
    });
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Finance Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage tender-related financial requests</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button onClick={handleNewTransaction}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
          <Button variant="outline" onClick={handleExportToExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Requests
          </Button>
        </div>
      </div>

      {/* Collapsible Filter Panel */}
      <FinanceFilterPanel onApplyFilter={handleApplyFilter} />
        
      <Tabs 
        defaultValue="new-request" 
        className="space-y-6"
        onValueChange={(value) => {
          setActiveTab(value);
          setLocation(`/finance-management/${value}`);
        }}
      >
        <TabsList>
          <TabsTrigger value="new-request">
            New Request
          </TabsTrigger>
          <TabsTrigger value="approve-request">
            Approve Request
          </TabsTrigger>
          <TabsTrigger value="denied-request">
            Denied Request
          </TabsTrigger>
          <TabsTrigger value="complete-request">
            Complete Request
          </TabsTrigger>
        </TabsList>

        {/* New Request Tab - redirects to New Request page */}
        <TabsContent value="new-request">
          <div className="flex items-center justify-center p-8">
            <p className="text-center text-gray-500">
              Redirecting to New Request page...
            </p>
          </div>
        </TabsContent>

        {/* Approve Request Tab - redirects to Approve Request page */}
        <TabsContent value="approve-request">
          <div className="flex items-center justify-center p-8">
            <p className="text-center text-gray-500">
              Redirecting to Approve Request page...
            </p>
          </div>
        </TabsContent>

        {/* Denied Request Tab - redirects to Denied Request page */}
        <TabsContent value="denied-request">
          <div className="flex items-center justify-center p-8">
            <p className="text-center text-gray-500">
              Redirecting to Denied Request page...
            </p>
          </div>
        </TabsContent>

        {/* Complete Request Tab - redirects to Complete Request page */}
        <TabsContent value="complete-request">
          <div className="flex items-center justify-center p-8">
            <p className="text-center text-gray-500">
              Redirecting to Complete Request page...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}