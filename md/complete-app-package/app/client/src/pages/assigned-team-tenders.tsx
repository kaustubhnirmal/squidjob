import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Search, 
  Download, 
  Star, 
  Heart, 
  Bell, 
  User, 
  FileText, 
  PhoneCall,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Eye,
  Users,
  Phone,
  Archive,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useLocation } from "wouter";

interface AssignedTender {
  id: number;
  referenceNo: string;
  title: string;
  authority: string;
  location?: string;
  deadline: string;
  estimatedValue?: number;
  bidValue?: number;
  emdAmount?: number;
  status: string;
  bidDocumentPath?: string;
  atcDocumentPath?: string;
  techSpecsDocumentPath?: string;
  assignedUser?: {
    id: number;
    name: string;
  };
  assignedBy?: {
    id: number;
    name: string;
  };
  assignmentDate?: string;
  assignmentComments?: string;
}

export default function AssignedTeamTenders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("live");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [location, navigate] = useLocation();

  // Fetch assigned tenders
  const { data: assignedTenders = [], isLoading } = useQuery({
    queryKey: ["/api/assigned-tenders"],
    queryFn: async () => {
      const res = await fetch("/api/assigned-tenders");
      return res.json();
    },
  });

  // Filter tenders based on search query
  const filteredTenders = assignedTenders.filter((tender: AssignedTender) =>
    tender.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tender.referenceNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tender.authority?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tender.assignedUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDaysLeftInfo = (deadline: string) => {
    const daysLeft = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    let colorClass = "text-green-600"; // > 3 days: green
    
    if (daysLeft < 0) {
      colorClass = "text-red-600 font-bold"; // Expired: red
    } else if (daysLeft < 3) {
      colorClass = "text-orange-500 font-medium"; // < 3 days: orange
    }
    
    return { daysLeft, colorClass };
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading assigned tenders...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100">
      <header className="page-header mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Assigned To Team</h1>
      </header>
      {/* Tabs and Export Button */}
      <div className="bg-gray-50 rounded-t-lg border border-gray-200">
        <div className="flex flex-wrap items-center border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "live" ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
            onClick={() => setActiveTab("live")}
          >
            Live ({assignedTenders.length})
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "archive" ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
            onClick={() => setActiveTab("archive")}
          >
            Archive
          </button>
          <div className="ml-auto px-4 py-2">
            <div className="flex items-center justify-end">
              <div className="flex items-center mr-4">
                <span className="text-sm mr-1">Value</span>
                <div className="flex flex-col">
                  <ChevronUp className="h-3 w-3" />
                  <ChevronDown className="h-3 w-3" />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="flex items-center text-blue-600">
                <Download className="h-4 w-4 mr-1" />
                Export To Excel
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Tender Content - List View */}
      <div className="bg-white border-x border-b border-gray-200 rounded-b-lg shadow-sm">
        {filteredTenders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No assigned tenders available</p>
          </div>
        ) : (
          <div>
            {filteredTenders.map((tender: AssignedTender, index: number) => {
              const { daysLeft, colorClass } = getDaysLeftInfo(tender.deadline);
              return (
                <div
                  key={tender.id || index}
                  className="border-b border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/tenders/${tender.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center flex-wrap">
                        <span className={`mr-2 font-medium ${colorClass}`}>
                          {daysLeft} Days Left |
                        </span>
                        <span className="text-sm text-gray-600 mr-2">
                          📅 {new Date(tender.deadline).toLocaleDateString('en-IN')} |
                        </span>
                        <span className="text-sm text-gray-600 mr-2">
                          ⏱️ {new Date(tender.deadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} |
                        </span>
                        <span className="text-sm font-medium text-blue-600 mr-2">
                          {tender.bidValue
                            ? `₹ ${(tender.bidValue).toLocaleString('en-IN')}`
                            : tender.estimatedValue
                              ? `₹ ${(tender.estimatedValue / 10000000).toFixed(2)} CR.`
                              : 'Value Not Specified'} |
                        </span>
                        <span className="text-sm text-gray-600 mr-2">
                          EMD: {tender.emdAmount ? `₹ ${tender.emdAmount.toLocaleString('en-IN')}` : 'Refer Document'} |
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ml-1 ${tender.status?.toLowerCase() === 'new' ? 'bg-blue-100 text-blue-800' : tender.status?.toLowerCase() === 'in_process' ? 'bg-yellow-100 text-yellow-800' : tender.status?.toLowerCase() === 'submitted' ? 'bg-green-100 text-green-800' : tender.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{tender.status?.toLowerCase() === 'in_process' ? 'In Process' : tender.status?.charAt(0).toUpperCase() + tender.status?.slice(1) || 'Assigned'}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <span className="text-sm font-medium text-blue-600 mr-2">
                          <User className="h-4 w-4 inline mr-1 text-blue-500" />
                          {tender.assignedUser ? tender.assignedUser.name.split(' ')[0] : "Not Assigned"} -
                        </span>
                        <span className="text-sm text-gray-700">
                          {tender.title || "No title available"}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          {tender.authority} {tender.location ? `- ${tender.location}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-2 text-right">
                        <span className="font-medium">Bid ID: <span className="font-semibold text-blue-600">{tender.referenceNo || "N/A"}</span></span>
                      </div>
                      {(tender.bidDocumentPath || tender.atcDocumentPath || tender.techSpecsDocumentPath) && (
                        <div className="mb-3 flex flex-wrap gap-2 justify-end">
                          {tender.bidDocumentPath && (
                            <a
                              href={`/api/documents/${tender.id}/bid`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100"
                              onClick={e => e.stopPropagation()}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Bid Document
                            </a>
                          )}
                          {tender.atcDocumentPath && (
                            <a
                              href={`/api/documents/${tender.id}/atc`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100"
                              onClick={e => e.stopPropagation()}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              ATC Document
                            </a>
                          )}
                          {tender.techSpecsDocumentPath && (
                            <a
                              href={`/api/documents/${tender.id}/tech`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded hover:bg-emerald-100"
                              onClick={e => e.stopPropagation()}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Tech Specs
                            </a>
                          )}
                        </div>
                      )}
                      <div className="flex space-x-3 justify-end">
                        {/* Placeholder for action buttons, match In-Process page */}
                        {/* You can add TenderActionButtons or similar here if needed */}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}