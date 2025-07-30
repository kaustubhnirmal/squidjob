import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MisReportSearch } from "@/components/reports/mis-report-search";
import { ReportsTable } from "@/components/reports/reports-table";

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

export default function MisReports() {
  const [filters, setFilters] = React.useState<ReportFilters>({});
  const [activeTab, setActiveTab] = React.useState("state-wise");
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleSearch = (newFilters: ReportFilters) => {
    setFilters(newFilters);
  };

  const handleClear = () => {
    setFilters({});
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  // Sample report data
  const stateWiseReports = [
    { id: 1, state: "Karnataka", tenders: 156, awarded: 42, value: "₹ 45.6 Cr", winPercentage: "26.9%" },
    { id: 2, state: "Tamil Nadu", tenders: 124, awarded: 38, value: "₹ 39.2 Cr", winPercentage: "30.6%" },
    { id: 3, state: "Maharashtra", tenders: 198, awarded: 56, value: "₹ 67.8 Cr", winPercentage: "28.3%" },
    { id: 4, state: "Gujarat", tenders: 112, awarded: 34, value: "₹ 29.1 Cr", winPercentage: "30.4%" },
    { id: 5, state: "Delhi", tenders: 86, awarded: 24, value: "₹ 21.5 Cr", winPercentage: "27.9%" }
  ];

  const departmentReports = [
    { id: 1, department: "Railways", tenders: 92, awarded: 28, value: "₹ 32.7 Cr", winPercentage: "30.4%" },
    { id: 2, department: "Public Works", tenders: 134, awarded: 41, value: "₹ 45.3 Cr", winPercentage: "30.6%" },
    { id: 3, department: "Healthcare", tenders: 78, awarded: 19, value: "₹ 22.8 Cr", winPercentage: "24.4%" },
    { id: 4, department: "Education", tenders: 65, awarded: 18, value: "₹ 19.5 Cr", winPercentage: "27.7%" },
    { id: 5, department: "Energy", tenders: 104, awarded: 32, value: "₹ 38.1 Cr", winPercentage: "30.8%" }
  ];

  const bidderReports = [
    { id: 1, bidder: "Ncc Limited", tenders: 122, awarded: 58, value: "₹ 82.3 Cr", winPercentage: "47.5%" },
    { id: 2, bidder: "Rcc Developers Limited", tenders: 98, awarded: 35, value: "₹ 47.2 Cr", winPercentage: "35.7%" },
    { id: 3, bidder: "M/S Globe Civil Projects", tenders: 134, awarded: 42, value: "₹ 63.5 Cr", winPercentage: "31.3%" },
    { id: 4, bidder: "Larsen And Toubro Limited", tenders: 176, awarded: 89, value: "₹ 127.8 Cr", winPercentage: "50.6%" },
    { id: 5, bidder: "Renashus Projects", tenders: 82, awarded: 27, value: "₹ 39.1 Cr", winPercentage: "32.9%" }
  ];

  const getReportData = () => {
    switch (activeTab) {
      case "state-wise":
        return {
          columns: ["State", "Tenders", "Awarded", "Value", "Win %"],
          data: stateWiseReports.map(item => [
            item.state,
            item.tenders.toString(),
            item.awarded.toString(),
            item.value,
            item.winPercentage
          ])
        };
      case "department":
        return {
          columns: ["Department", "Tenders", "Awarded", "Value", "Win %"],
          data: departmentReports.map(item => [
            item.department,
            item.tenders.toString(),
            item.awarded.toString(),
            item.value,
            item.winPercentage
          ])
        };
      case "bidders":
        return {
          columns: ["Bidder", "Tenders", "Awarded", "Value", "Win %"],
          data: bidderReports.map(item => [
            item.bidder,
            item.tenders.toString(),
            item.awarded.toString(),
            item.value,
            item.winPercentage
          ])
        };
      default:
        return {
          columns: [],
          data: []
        };
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">MIS Reports</h1>
        <p className="text-sm text-gray-600 mt-1">
          Generate and view management information system reports
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="px-5 py-4 border-b border-gray-200">
          <CardTitle className="text-lg font-medium text-gray-800">MIS Reports Search</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <MisReportSearch onSearch={handleSearch} onClear={handleClear} />
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleGenerateReport} 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : "Generate MIS"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="state-wise" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="state-wise">State-wise Results</TabsTrigger>
          <TabsTrigger value="department">Department Reports</TabsTrigger>
          <TabsTrigger value="bidders">Bidders Reports</TabsTrigger>
          <TabsTrigger value="ownership">Ownership Reports</TabsTrigger>
          <TabsTrigger value="month-wise">Month-wise Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="state-wise">
          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <CardTitle className="text-lg font-medium text-gray-800">State-wise Results</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </Button>
                <Button variant="outline" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ReportsTable report={getReportData()} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="department">
          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <CardTitle className="text-lg font-medium text-gray-800">Department Reports</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </Button>
                <Button variant="outline" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ReportsTable report={getReportData()} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bidders">
          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <CardTitle className="text-lg font-medium text-gray-800">Bidders Reports</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </Button>
                <Button variant="outline" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ReportsTable report={getReportData()} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ownership">
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports generated</h3>
              <p className="mt-1 text-sm text-gray-500">Use the search form above to generate ownership reports.</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="month-wise">
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports generated</h3>
              <p className="mt-1 text-sm text-gray-500">Use the search form above to generate month-wise reports.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
