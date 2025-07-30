import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Competitor } from "@/types";

interface CompareFormProps {
  competitors: Competitor[];
  onCompare: (company1Id: number, company2Id: number) => void;
}

export function CompareForm({ competitors, onCompare }: CompareFormProps) {
  const [company1, setCompany1] = React.useState<string>("");
  const [company2, setCompany2] = React.useState<string>("");
  const [category, setCategory] = React.useState<string>("");

  const handleCompare = () => {
    if (!company1 || !company2) return;
    
    onCompare(parseInt(company1), parseInt(company2));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium text-gray-800 mb-2">Search Company</h3>
            <Select value={company1} onValueChange={setCompany1}>
              <SelectTrigger>
                <SelectValue placeholder="Search Company" />
              </SelectTrigger>
              <SelectContent>
                {competitors.map(competitor => (
                  <SelectItem key={competitor.id} value={competitor.id.toString()}>
                    {competitor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-800 mb-2">Select Category</h3>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_categories">All Categories</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="civil">Civil Works</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="mechanical">Mechanical</SelectItem>
                <SelectItem value="it">IT & Software</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-800 mb-2">Select State</h3>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_states">All States</SelectItem>
                <SelectItem value="karnataka">Karnataka</SelectItem>
                <SelectItem value="maharashtra">Maharashtra</SelectItem>
                <SelectItem value="tamilnadu">Tamil Nadu</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="gujarat">Gujarat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium text-gray-800 mb-2">Search Company</h3>
            <Select value={company2} onValueChange={setCompany2}>
              <SelectTrigger>
                <SelectValue placeholder="Search Company" />
              </SelectTrigger>
              <SelectContent>
                {competitors.map(competitor => (
                  <SelectItem key={competitor.id} value={competitor.id.toString()}>
                    {competitor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-800 mb-2">Select Category</h3>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_categories">All Categories</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="civil">Civil Works</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="mechanical">Mechanical</SelectItem>
                <SelectItem value="it">IT & Software</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-800 mb-2">Select State</h3>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_states">All States</SelectItem>
                <SelectItem value="karnataka">Karnataka</SelectItem>
                <SelectItem value="maharashtra">Maharashtra</SelectItem>
                <SelectItem value="tamilnadu">Tamil Nadu</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="gujarat">Gujarat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="h-48 flex items-center justify-center">
              {company1 ? (
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-green-800">
                    {competitors.find(c => c.id.toString() === company1)?.name || "Company 1"}
                  </h3>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="mt-2 text-gray-600">Select company 1</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="h-48 flex items-center justify-center">
              {company2 ? (
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-blue-800">
                    {competitors.find(c => c.id.toString() === company2)?.name || "Company 2"}
                  </h3>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="mt-2 text-gray-600">Select company 2</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleCompare}
            disabled={!company1 || !company2}
            className="px-8"
          >
            Compare Now
          </Button>
        </div>
      </div>
    </div>
  );
}