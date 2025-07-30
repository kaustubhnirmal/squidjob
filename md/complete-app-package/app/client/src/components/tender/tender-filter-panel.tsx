import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TenderFilterPanelProps {
  initiallyExpanded?: boolean;
  onSearch?: (filters: any) => void;
}

export function TenderFilterPanel({ initiallyExpanded = false, onSearch }: TenderFilterPanelProps) {
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(initiallyExpanded);
  
  // Filter states
  const [keyword, setKeyword] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [state, setState] = useState("all");
  const [city, setCity] = useState("");
  const [tenderStatus, setTenderStatus] = useState("all");
  const [assignBy, setAssignBy] = useState("all");
  const [assignTo, setAssignTo] = useState("all");
  const [tenderId, setTenderId] = useState("");
  const [website, setWebsite] = useState("");
  const [quantity, setQuantity] = useState(">=");
  const [quantityValue, setQuantityValue] = useState("");
  const [tenderValue, setTenderValue] = useState("=");
  const [valueFrom, setValueFrom] = useState("");
  const [valueTo, setValueTo] = useState("");
  const [valueLakh, setValueLakh] = useState("Lakh");
  const [ownership, setOwnership] = useState("all");
  const [gemType, setGemType] = useState("all");
  const [msmeExemption, setMsmeExemption] = useState(false);
  const [startupExemption, setStartupExemption] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        keyword,
        referenceNumber,
        state,
        city,
        tenderStatus,
        assignBy,
        assignTo,
        tenderId,
        website,
        quantity,
        quantityValue,
        tenderValue,
        valueFrom,
        valueTo,
        valueLakh,
        ownership,
        gemType,
        msmeExemption,
        startupExemption,
        manualEntry
      });
    } else {
      toast({
        title: "Searching...",
        description: "Search functionality will be implemented soon."
      });
    }
  };

  const handleClear = () => {
    setKeyword("");
    setReferenceNumber("");
    setState("all");
    setCity("");
    setTenderStatus("all");
    setAssignBy("all");
    setAssignTo("all");
    setTenderId("");
    setWebsite("");
    setQuantity(">=");
    setQuantityValue("");
    setTenderValue("=");
    setValueFrom("");
    setValueTo("");
    setValueLakh("Lakh");
    setOwnership("all");
    setGemType("all");
    setMsmeExemption(false);
    setStartupExemption(false);
    setManualEntry(false);
  };

  return (
    <div className="bg-white rounded-md shadow-sm mb-6">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium">Tender Filter</span>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="focus:outline-none">
          {showFilters ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      {showFilters && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Input
                placeholder="Search By Keywords"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div>
              <Input
                placeholder="Reference Number"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
            <div>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="andhra_pradesh">Andhra Pradesh</SelectItem>
                  <SelectItem value="arunachal_pradesh">Arunachal Pradesh</SelectItem>
                  <SelectItem value="assam">Assam</SelectItem>
                  <SelectItem value="bihar">Bihar</SelectItem>
                  <SelectItem value="chhattisgarh">Chhattisgarh</SelectItem>
                  <SelectItem value="goa">Goa</SelectItem>
                  <SelectItem value="gujarat">Gujarat</SelectItem>
                  <SelectItem value="haryana">Haryana</SelectItem>
                  <SelectItem value="himachal_pradesh">Himachal Pradesh</SelectItem>
                  <SelectItem value="jharkhand">Jharkhand</SelectItem>
                  <SelectItem value="karnataka">Karnataka</SelectItem>
                  <SelectItem value="kerala">Kerala</SelectItem>
                  <SelectItem value="madhya_pradesh">Madhya Pradesh</SelectItem>
                  <SelectItem value="maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="manipur">Manipur</SelectItem>
                  <SelectItem value="meghalaya">Meghalaya</SelectItem>
                  <SelectItem value="mizoram">Mizoram</SelectItem>
                  <SelectItem value="nagaland">Nagaland</SelectItem>
                  <SelectItem value="odisha">Odisha</SelectItem>
                  <SelectItem value="punjab">Punjab</SelectItem>
                  <SelectItem value="rajasthan">Rajasthan</SelectItem>
                  <SelectItem value="sikkim">Sikkim</SelectItem>
                  <SelectItem value="tamil_nadu">Tamil Nadu</SelectItem>
                  <SelectItem value="telangana">Telangana</SelectItem>
                  <SelectItem value="tripura">Tripura</SelectItem>
                  <SelectItem value="uttar_pradesh">Uttar Pradesh</SelectItem>
                  <SelectItem value="uttarakhand">Uttarakhand</SelectItem>
                  <SelectItem value="west_bengal">West Bengal</SelectItem>
                  <SelectItem value="andaman_nicobar">Andaman and Nicobar Islands</SelectItem>
                  <SelectItem value="chandigarh">Chandigarh</SelectItem>
                  <SelectItem value="daman_diu">Dadra and Nagar Haveli and Daman and Diu</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="jammu_kashmir">Jammu and Kashmir</SelectItem>
                  <SelectItem value="ladakh">Ladakh</SelectItem>
                  <SelectItem value="lakshadweep">Lakshadweep</SelectItem>
                  <SelectItem value="puducherry">Puducherry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <Select value={tenderStatus} onValueChange={setTenderStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Tender Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="n/a">N/A</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in-process">In Process</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="awarded">Awarded</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={assignBy} onValueChange={setAssignBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="poonam">Poonam Amale</SelectItem>
                  <SelectItem value="rahul">Rahul Patel</SelectItem>
                  <SelectItem value="neha">Neha Sharma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Select value={assignTo} onValueChange={setAssignTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign To" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="amit">Amit Sharma</SelectItem>
                  <SelectItem value="sanjay">Sanjay Patel</SelectItem>
                  <SelectItem value="priya">Priya Desai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                placeholder="Tender Id"
                value={tenderId}
                onChange={(e) => setTenderId(e.target.value)}
              />
            </div>
            <div>
              <Input
                placeholder="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="whitespace-nowrap">Quantity:</span>
              <Select value={quantity} onValueChange={setQuantity}>
                <SelectTrigger className="w-24 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="=">=</SelectItem>
                  <SelectItem value=">">&gt;</SelectItem>
                  <SelectItem value="<">&lt;</SelectItem>
                  <SelectItem value=">=">&gt;=</SelectItem>
                  <SelectItem value="<=">&lt;=</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                placeholder="Enter Quantity" 
                value={quantityValue}
                onChange={(e) => setQuantityValue(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="whitespace-nowrap">Tender Value:</span>
              <div className="w-16">
                <Select value={tenderValue} onValueChange={setTenderValue}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="=">=</SelectItem>
                    <SelectItem value=">">&gt;</SelectItem>
                    <SelectItem value="<">&lt;</SelectItem>
                    <SelectItem value=">=">&gt;=</SelectItem>
                    <SelectItem value="<=">&lt;=</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input 
                placeholder="Value"
                value={valueFrom}
                onChange={(e) => setValueFrom(e.target.value)}
                className="w-24"
              />
              <div className="w-24">
                <Select value={valueLakh} onValueChange={setValueLakh}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lakh">Lakh</SelectItem>
                    <SelectItem value="Crore">Crore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center">
              <Input 
                placeholder="To" 
                value={valueTo}
                onChange={(e) => setValueTo(e.target.value)}
                className="w-24 mr-2"
              />
              <div className="w-24">
                <Select value={valueLakh} onValueChange={setValueLakh}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lakh">Lakh</SelectItem>
                    <SelectItem value="Crore">Crore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Select value={ownership} onValueChange={setOwnership}>
                <SelectTrigger>
                  <SelectValue placeholder="Ownership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="whitespace-nowrap">GeM / Non GeM :</span>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="gemType" 
                    checked={gemType === "all"} 
                    onChange={() => setGemType("all")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>All</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="gemType" 
                    checked={gemType === "gem"} 
                    onChange={() => setGemType("gem")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>GeM</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="gemType" 
                    checked={gemType === "non-gem"} 
                    onChange={() => setGemType("non-gem")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Non GeM</span>
                </label>
              </div>
            </div>
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">MSME Exemption :</span>
              <input 
                type="checkbox"
                checked={msmeExemption}
                onChange={() => setMsmeExemption(!msmeExemption)}
                className="w-4 h-4 text-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Startup Exemption :</span>
              <input 
                type="checkbox"
                checked={startupExemption}
                onChange={() => setStartupExemption(!startupExemption)}
                className="w-4 h-4 text-blue-600"
              />
            </div>
            <div className="flex items-center">
              <span className="whitespace-nowrap mr-2">Manual Entry :</span>
              <input 
                type="checkbox"
                checked={manualEntry}
                onChange={() => setManualEntry(!manualEntry)}
                className="w-4 h-4 text-blue-600"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}