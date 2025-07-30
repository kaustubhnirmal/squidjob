import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface TenderFilterProps {
  initiallyExpanded?: boolean;
  onSearch?: (filters: any) => void;
  hideReferenceNumber?: boolean;
  pageType?: 'all' | 'submitted' | 'other';
}

// Indian states list
const indianStates = [
  { value: "all", label: "All States" },
  { value: "andaman_nicobar", label: "Andaman and Nicobar Islands" },
  { value: "andhra_pradesh", label: "Andhra Pradesh" },
  { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
  { value: "assam", label: "Assam" },
  { value: "bihar", label: "Bihar" },
  { value: "chandigarh", label: "Chandigarh" },
  { value: "chhattisgarh", label: "Chhattisgarh" },
  { value: "dadra_nagar_haveli", label: "Dadra and Nagar Haveli" },
  { value: "daman_diu", label: "Daman and Diu" },
  { value: "delhi", label: "Delhi" },
  { value: "goa", label: "Goa" },
  { value: "gujarat", label: "Gujarat" },
  { value: "haryana", label: "Haryana" },
  { value: "himachal_pradesh", label: "Himachal Pradesh" },
  { value: "jammu_kashmir", label: "Jammu and Kashmir" },
  { value: "jharkhand", label: "Jharkhand" },
  { value: "karnataka", label: "Karnataka" },
  { value: "kerala", label: "Kerala" },
  { value: "ladakh", label: "Ladakh" },
  { value: "lakshadweep", label: "Lakshadweep" },
  { value: "madhya_pradesh", label: "Madhya Pradesh" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "manipur", label: "Manipur" },
  { value: "meghalaya", label: "Meghalaya" },
  { value: "mizoram", label: "Mizoram" },
  { value: "nagaland", label: "Nagaland" },
  { value: "odisha", label: "Odisha" },
  { value: "puducherry", label: "Puducherry" },
  { value: "punjab", label: "Punjab" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "sikkim", label: "Sikkim" },
  { value: "tamil_nadu", label: "Tamil Nadu" },
  { value: "telangana", label: "Telangana" },
  { value: "tripura", label: "Tripura" },
  { value: "uttar_pradesh", label: "Uttar Pradesh" },
  { value: "uttarakhand", label: "Uttarakhand" },
  { value: "west_bengal", label: "West Bengal" }
];

export function TenderFilter({ initiallyExpanded = false, onSearch, hideReferenceNumber = false, pageType = 'other' }: TenderFilterProps) {
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(initiallyExpanded);
  
  // Filter states
  const [keyword, setKeyword] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [state, setState] = useState("all");
  const [stateSearchText, setStateSearchText] = useState("");
  const [city, setCity] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [tenderStatus, setTenderStatus] = useState("all");
  const [assignBy, setAssignBy] = useState("all");
  const [assignTo, setAssignTo] = useState("all");
  const [tenderId, setTenderId] = useState("");
  const [website, setWebsite] = useState("");
  const [closingFromDate, setClosingFromDate] = useState("");
  const [closingToDate, setClosingToDate] = useState("");
  const [ownerRight, setOwnerRight] = useState("");
  const [quantityOperator, setQuantityOperator] = useState(">=");
  const [quantityValue, setQuantityValue] = useState("");
  const [valueOperator, setValueOperator] = useState("=");
  const [valueAmount, setValueAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [unit, setUnit] = useState("Lakh");
  const [isGeM, setIsGeM] = useState("all");
  const [msmeExemption, setMsmeExemption] = useState(false);
  const [startupExemption, setStartupExemption] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);

  // Fetch users for dropdown
  const { data: users = [] } = useQuery<Array<{id: number, username: string, name: string}>>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    }
  });

  // Filter states based on search text
  const filteredStates = stateSearchText
    ? indianStates.filter(state => 
        state.label.toLowerCase().includes(stateSearchText.toLowerCase())
      )
    : indianStates;

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        keyword,
        referenceNumber: hideReferenceNumber ? undefined : referenceNumber,
        state,
        city,
        departmentName,
        tenderStatus,
        assignBy,
        assignTo,
        tenderId,
        website,
        closingFromDate,
        closingToDate,
        ownerRight,
        quantityOperator,
        quantityValue,
        valueOperator,
        valueAmount,
        toAmount,
        unit,
        isGeM,
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
    setStateSearchText("");
    setCity("");
    setDepartmentName("");
    setTenderStatus("all");
    setAssignBy("all");
    setAssignTo("all");
    setTenderId("");
    setWebsite("");
    setClosingFromDate("");
    setClosingToDate("");
    setOwnerRight("");
    setQuantityOperator(">=");
    setQuantityValue("");
    setValueOperator("=");
    setValueAmount("");
    setToAmount("");
    setUnit("Lakh");
    setIsGeM("all");
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
            {!hideReferenceNumber && (
              <div>
                <Input
                  placeholder="Reference Number"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
            )}
            <div>
              <div className="relative">
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Search state..."
                        value={stateSearchText}
                        onChange={(e) => setStateSearchText(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredStates.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hideReferenceNumber && (
              <div>
                <Input
                  placeholder="Department Name"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                />
              </div>
            )}
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
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
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
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.username}>
                      {user.name}
                    </SelectItem>
                  ))}
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
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.username}>
                      {user.name}
                    </SelectItem>
                  ))}
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

          {/* Additional fields row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="relative">
                <Input
                  type="date"
                  value={closingFromDate}
                  onChange={(e) => setClosingFromDate(e.target.value)}
                  className="peer shadow-none focus:shadow-none focus-visible:shadow-none"
                  style={{ boxShadow: 'none' }}
                />
                {!closingFromDate && (
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 peer-focus:opacity-0">
                    Closing From
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="relative">
                <Input
                  type="date"
                  value={closingToDate}
                  onChange={(e) => setClosingToDate(e.target.value)}
                  className="peer shadow-none focus:shadow-none focus-visible:shadow-none"
                  style={{ boxShadow: 'none' }}
                />
                {!closingToDate && (
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 peer-focus:opacity-0">
                    Closing To
                  </div>
                )}
              </div>
            </div>
            <div>
              <Input
                placeholder="Owner/Right"
                value={ownerRight}
                onChange={(e) => setOwnerRight(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm whitespace-nowrap">Quantity:</span>
              <div className="w-16">
                <Select value={quantityOperator} onValueChange={setQuantityOperator}>
                  <SelectTrigger>
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
                placeholder="Enter Quantity" 
                value={quantityValue}
                onChange={(e) => setQuantityValue(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm whitespace-nowrap">Tender Value:</span>
              <div className="w-16">
                <Select value={valueOperator} onValueChange={setValueOperator}>
                  <SelectTrigger>
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
                value={valueAmount}
                onChange={(e) => setValueAmount(e.target.value)}
                className="w-24"
              />
              <div className="w-24">
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lakh">Lakh</SelectItem>
                    <SelectItem value="Crore">Crore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">To</span>
              <Input 
                placeholder="" 
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="w-24"
              />
              <div className="w-24">
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
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
            <div className="flex items-center space-x-2">
              <span className="text-sm whitespace-nowrap">GeM / Non GeM :</span>
              <label className="flex items-center space-x-1">
                <input 
                  type="radio" 
                  name="gemType" 
                  checked={isGeM === "all"} 
                  onChange={() => setIsGeM("all")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">All</span>
              </label>
              <label className="flex items-center space-x-1">
                <input 
                  type="radio" 
                  name="gemType" 
                  checked={isGeM === "gem"} 
                  onChange={() => setIsGeM("gem")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">GeM</span>
              </label>
              <label className="flex items-center space-x-1">
                <input 
                  type="radio" 
                  name="gemType" 
                  checked={isGeM === "nonGem"} 
                  onChange={() => setIsGeM("nonGem")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Non GeM</span>
              </label>
            </div>
            <div className="flex items-center">
              <span className="text-sm whitespace-nowrap mr-2">MSME Exemption :</span>
              <input 
                type="checkbox"
                checked={msmeExemption}
                onChange={() => setMsmeExemption(!msmeExemption)}
                className="w-4 h-4 text-blue-600"
              />
            </div>
            <div className="flex items-center">
              <span className="text-sm whitespace-nowrap mr-2">Manual Entry :</span>
              <input 
                type="checkbox"
                checked={manualEntry}
                onChange={() => setManualEntry(!manualEntry)}
                className="w-4 h-4 text-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-start space-x-2">
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              Search
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}