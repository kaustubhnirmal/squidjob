import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Bell, Eye, Download, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TenderFilter } from "@/components/tender/tender-filter";
import { TenderCard } from "@/components/tender/tender-card";

interface Tender {
  id: number;
  reference: string;
  description: string;
  closingDate: string;
  value: string;
  location: string;
  assignedBy: string;
  assignedTo: string;
}

export default function DroppedTender() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"new" | "live" | "archive">("new");
  
  const [tenders] = useState<Tender[]>([]);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100">
      <header className="page-header mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dropped Tender</h1>
      </header>

      {/* Filter Section */}
      <TenderFilter 
        initiallyExpanded={false} 
        onSearch={(filters) => {
          toast({
            title: "Searching with filters",
            description: "Search functionality will be implemented soon."
          });
          console.log("Search filters:", filters);
        }}
        hideReferenceNumber={true}
        pageType="other"
      />

      {/* Export Button */}
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 text-gray-700 bg-white border border-gray-200"
        >
          <Download className="h-4 w-4" />
          Export To Excel
        </Button>
      </div>
      
      {/* Tabs and Value Sort */}
      <div className="flex mb-4 justify-between">
        <div className="flex border-b border-gray-200 w-full">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === "new" ? "border-blue-600 text-gray-800" : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("new")}
          >
            New (0)
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === "live" ? "border-blue-600 text-gray-800" : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("live")}
          >
            Live (0)
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === "archive" ? "border-blue-600 text-gray-800" : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("archive")}
          >
            Archive (0)
          </button>
          <div className="flex-grow"></div>
          <div className="flex items-center gap-2 pr-2">
            <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1">
              <span className="text-sm mr-1 text-gray-700">Value</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tender List - Table View */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-0">
          {tenders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-lg">No Record Found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white">
                    <TableHead className="font-medium text-gray-700 py-3">TENDER ID</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3">DETAILS</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3">CLOSING DATE</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3">VALUE</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3">ASSIGNED BY</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3">ASSIGNED TO</TableHead>
                    <TableHead className="font-medium text-gray-700 py-3">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenders.map((tender, index) => (
                    <TableRow key={tender.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-700">#{index + 1}</TableCell>
                      <TableCell className="max-w-md">
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-2">
                            {tender.description}
                          </p>
                          <p className="text-sm text-gray-600">{tender.location}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-gray-800">{tender.reference}</p>
                          <p className="text-sm text-gray-600">{tender.closingDate}</p>
                        </div>
                      </TableCell>
                      <TableCell>{tender.value}</TableCell>
                      <TableCell>{tender.assignedBy}</TableCell>
                      <TableCell>{tender.assignedTo}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <button className="text-gray-500 hover:text-yellow-500">
                            <Star className="h-5 w-5" />
                          </button>
                          <button className="text-gray-500 hover:text-blue-500">
                            <Bell className="h-5 w-5" />
                          </button>
                          <button className="text-gray-500 hover:text-blue-500">
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}