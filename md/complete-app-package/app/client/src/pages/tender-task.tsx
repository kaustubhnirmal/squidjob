import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TenderFilter } from "@/components/tender/tender-filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TenderTask() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("new");

  const tenders = [
    {
      id: 16895,
      value: "₹ 86.51 CR",
      reference: "09-12-2024",
      dueDate: "5 Days Left",
      emd: "₹ 2120330",
      status: "Awarded",
      description: "supply,transportation, trenching, laying, backfilling, hdpe pipe insertion, blowing, jointing and termination of optical fiber cable for provision of 4 48/fl optical fibre cable backbone in nagpur-raipur section",
      location: "Railtel Corporation Of India Limited - Multi Location",
      approvalStatus: "Pending",
    }
  ];

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Tender Task</h1>
        <div className="flex items-center text-sm text-gray-600">
          <span className="text-gray-700">Mr.Kaustubh Nirmal</span>
        </div>
      </div>

      {/* Tender Filter Panel */}
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
      <div className="mb-6 flex justify-end">
        <Button variant="outline" size="sm" className="h-7 gap-1 text-[#0076a8]">
          <Download className="h-4 w-4" />
          Export To Excel
        </Button>
      </div>

      {/* Status Filtering Tabs */}
      <div className="flex mb-4">
        <button
          onClick={() => setStatusFilter("new")}
          className={`px-5 py-2 mr-2 ${
            statusFilter === "new" 
              ? "bg-blue-50 text-[#0076a8] border-b-2 border-[#0076a8]" 
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          New
        </button>
        
        <button
          onClick={() => setStatusFilter("live")}
          className={`px-5 py-2 mr-2 ${
            statusFilter === "live" 
              ? "bg-blue-50 text-[#0076a8] border-b-2 border-[#0076a8]" 
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Live (0)
        </button>
        
        <button
          onClick={() => setStatusFilter("archive")}
          className={`px-5 py-2 ${
            statusFilter === "archive" 
              ? "bg-blue-50 text-[#0076a8] border-b-2 border-[#0076a8]" 
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Archive
        </button>
      </div>

      {/* Table for displaying tender data */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium text-gray-700 py-3">S.NO</TableHead>
              <TableHead className="font-medium text-gray-700 py-3 w-1/3">DESCRIPTION</TableHead>
              <TableHead className="font-medium text-gray-700 py-3">DUE DATE</TableHead>
              <TableHead className="font-medium text-gray-700 py-3">EMD AMOUNT</TableHead>
              <TableHead className="font-medium text-gray-700 py-3">VALUE</TableHead>
              <TableHead className="font-medium text-gray-700 py-3">STATUS</TableHead>
              <TableHead className="font-medium text-gray-700 py-3">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statusFilter !== "live" && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No Record Found.
                </TableCell>
              </TableRow>
            )}
            
            {statusFilter === "live" && tenders.slice(0, 1).map((tender, index) => (
              <TableRow key={tender.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-700">#{index + 1}</TableCell>
                <TableCell className="max-w-md">
                  <div>
                    <p className="font-medium text-gray-800 line-clamp-2">
                      {tender.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {tender.location}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-red-600 font-semibold">{tender.dueDate}</span>
                </TableCell>
                <TableCell className="font-medium">
                  {tender.emd}
                </TableCell>
                <TableCell className="font-medium text-blue-600">
                  {tender.value}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    {tender.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">Action</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}