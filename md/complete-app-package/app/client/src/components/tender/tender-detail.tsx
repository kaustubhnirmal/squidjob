import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tender } from "@/types";
import { formatCurrency, formatDeadline } from "@/lib/utils";

interface TenderDetailProps {
  tender: Tender;
  onMarkInterested: (tenderId: number, interested: boolean) => void;
  onMarkStarred: (tenderId: number, starred: boolean) => void;
  onSetReminder: (tenderId: number) => void;
  onAssign: (tenderId: number) => void;
  isInterested?: boolean;
  isStarred?: boolean;
}

export function TenderDetail({
  tender,
  onMarkInterested,
  onMarkStarred,
  onSetReminder,
  onAssign,
  isInterested = false,
  isStarred = false
}: TenderDetailProps) {
  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Tender #{tender.id} Details</h1>
          <p className="text-sm text-gray-600 mt-1">{tender.title}</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button
            variant={isInterested ? "secondary" : "default"}
            size="sm"
            className="inline-flex items-center"
            onClick={() => onMarkInterested(tender.id, !isInterested)}
          >
            {isInterested ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )}
            {isInterested ? "Marked as Interested" : "Mark as Interested"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center"
            onClick={() => onMarkStarred(tender.id, !isStarred)}
          >
            {isStarred ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )}
            {isStarred ? "Starred" : "Star"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center"
            onClick={() => onSetReminder(tender.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Set Reminder
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center"
            onClick={() => onAssign(tender.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Assign
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden mb-6">
        <CardHeader className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
          <CardTitle className="text-lg font-medium text-gray-800">Tender Details</CardTitle>
          <div className="flex items-center">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              tender.status === "new" ? "bg-blue-100 text-blue-800" : 
              tender.status === "in-process" ? "bg-yellow-100 text-yellow-800" : 
              tender.status === "submitted" ? "bg-green-100 text-green-800" : 
              tender.status === "awarded" ? "bg-purple-100 text-purple-800" : 
              tender.status === "rejected" ? "bg-red-100 text-red-800" : 
              "bg-gray-100 text-gray-800"
            } mr-2`}>
              {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
            </span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-5">
          {/* Top row - Bid ID and Document Links */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Bid ID: </span>
                <span className="font-semibold text-blue-600">{tender.referenceNo || "N/A"}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {tender.bidDocumentPath && (
                <a 
                  href={tender.bidDocumentPath} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Bid Document
                </a>
              )}
              {tender.atcDocumentPath && (
                <a 
                  href={tender.atcDocumentPath} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  ATC Document
                </a>
              )}
              {tender.techSpecsDocumentPath && (
                <a 
                  href={tender.techSpecsDocumentPath} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded hover:bg-emerald-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Tech Specs
                </a>
              )}
            </div>
          </div>

          {/* Main information row - Same as All Tenders */}
          <div className="flex items-center flex-wrap mb-4 bg-gray-50 p-3 rounded-md">
            {/* Calculate days left */}
            {(() => {
              const today = new Date();
              const deadline = new Date(tender.deadline);
              const diffTime = deadline.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              let colorClass = "text-green-600";
              if (diffDays <= 5) {
                colorClass = "text-red-600";
              } else if (diffDays <= 8) {
                colorClass = "text-orange-500";
              }
              
              return (
                <span className={`mr-2 font-medium ${colorClass}`}>
                  {diffDays} Days Left | 
                </span>
              );
            })()}
            
            {/* Bid Expiry Date and Time */}
            <span className="text-sm text-gray-600 mr-2">
              📅 {new Date(tender.deadline).toLocaleDateString('en-IN')} |
            </span>
            
            <span className="text-sm text-gray-600 mr-2">
              ⏱️ {new Date(tender.deadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} |
            </span>
            
            {/* Bid/Estimated Value */}
            <span className="text-sm font-medium text-blue-600 mr-2">
              {tender.bidValue 
                ? `₹ ${(tender.bidValue).toLocaleString('en-IN')}` 
                : tender.estimatedValue 
                  ? `₹ ${(tender.estimatedValue / 10000000).toFixed(2)} CR.` 
                  : 'Value Not Specified'} |
            </span>
            
            {/* EMD */}
            <span className="text-sm text-gray-600 mr-2">
              EMD: {tender.emdAmount ? `₹ ${tender.emdAmount.toLocaleString('en-IN')}` : 'Refer Document'} |
            </span>
            
            {/* Status */}
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              tender.status === 'new' ? 'bg-blue-100 text-blue-800' :
              tender.status === 'in-process' ? 'bg-yellow-100 text-yellow-800' :
              tender.status === 'submitted' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
            </span>
          </div>
          
          {/* Assigned User and Title */}
          <div className="flex items-center mt-2 mb-4">
            <span className="text-sm font-medium text-blue-600 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {tender.assignedUser 
                ? tender.assignedUser.name.split(' ')[0] 
                : "Not Assigned"} -
            </span>
            <span className="text-sm text-gray-700">
              {tender.title || "No title available"}
            </span>
          </div>

          {/* Authority and Location */}
          <div className="mt-2 mb-6">
            <span className="flex items-center text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {tender.authority} {tender.location ? `- ${tender.location}` : ''}
            </span>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t border-gray-200 pt-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Document Fee</p>
              <p className="text-sm font-medium text-gray-900">{formatCurrency(tender.documentFee)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Created At</p>
              <p className="text-sm font-medium text-gray-900">{tender.createdAt ? formatDeadline(tender.createdAt) : 'N/A'}</p>
            </div>
          </div>

          {/* Brief */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Brief</h4>
            <p className="text-sm text-gray-700">{tender.brief || "No brief available"}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="eligibility">
        <TabsList className="mb-6 border-b border-gray-200 w-full">
          <TabsTrigger value="eligibility">Eligibility Criteria</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        
        <TabsContent value="eligibility">
          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <CardTitle className="text-lg font-medium text-gray-800">Eligibility Criteria</CardTitle>
              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">AI Extracted</span>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-md">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="col-span-2 lg:col-span-1">
                        <h4 className="font-medium text-gray-800">Criteria</h4>
                      </div>
                      <div className="col-span-2 lg:col-span-4">
                        <p className="text-sm text-gray-700">
                          Preference shall be given to Class-I Local Supplier as Defined in Public Procurement (Preference to Make in India), Order 2017 as Amended From Time to Time And Its Subsequent Orders/Notifications Issued by Concerned Nodal Ministry for Specific Goods/Products.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-md">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="col-span-2 lg:col-span-1">
                        <h4 className="font-medium text-gray-800">MSE/Startup</h4>
                      </div>
                      <div className="col-span-2 lg:col-span-4">
                        <p className="text-sm text-gray-700">
                          Bidder Through Udyam Registration Portal as Defined in Public Procurement Policy for Micro and Small Enterprises (MSEs) Order, 2012 Dated 23.03.2012 Issued by Ministry of Micro, Small and Medium Enterprises and Any Subsequent Order Issued by The Central Government.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-md">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="col-span-2 lg:col-span-1">
                        <h4 className="font-medium text-gray-800">Local Content</h4>
                      </div>
                      <div className="col-span-2 lg:col-span-4">
                        <p className="text-sm text-gray-700">
                          Minimum 50% As 83.25% Local Content Required For Qualifying As Class-I And More Than 20% But Less Than 50% For Qualifying As Class-II Local Supplier In Conformity With The Provisions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button variant="outline">
                  Download Full Eligibility Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200">
              <CardTitle className="text-lg font-medium text-gray-800">Tender Documents</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex flex-col space-y-4">
                <div className="border border-gray-200 p-4 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Technical Specifications.pdf</h4>
                      <p className="text-xs text-gray-500">2.4 MB • Uploaded on {formatDeadline(tender.createdAt)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </Button>
                </div>
                
                <div className="border border-gray-200 p-4 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Tender Document.pdf</h4>
                      <p className="text-xs text-gray-500">5.7 MB • Uploaded on {formatDeadline(tender.createdAt)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button>
                  Upload New Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="checklist">
          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <CardTitle className="text-lg font-medium text-gray-800">Tender Checklist</CardTitle>
              <Button size="sm">Generate AI Checklist</Button>
            </CardHeader>
            <CardContent className="p-5">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL No.</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type/Document Name</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Document</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">View Document</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">PAN Card</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Button variant="outline" size="sm" className="px-3 py-1 h-auto">Upload</Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Button variant="outline" size="sm" className="px-3 py-1 h-auto">View</Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completed</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">GST</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Button variant="outline" size="sm" className="px-3 py-1 h-auto">Upload</Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Pending</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">3</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ITR</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Button variant="outline" size="sm" className="px-3 py-1 h-auto">Upload</Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Pending</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="finance">
          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200">
              <CardTitle className="text-lg font-medium text-gray-800">Finance Information</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">EMD Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Amount:</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(tender.emdAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className="text-sm font-medium text-yellow-600">Pending</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Due Date:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDeadline(tender.deadline)}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button size="sm">Request EMD</Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Document Fee Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Amount:</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(tender.documentFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className="text-sm font-medium text-green-600">Paid</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Payment Date:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDeadline(tender.createdAt)}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button size="sm" variant="outline">View Receipt</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team">
          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <CardTitle className="text-lg font-medium text-gray-800">Team Assignment</CardTitle>
              <Button size="sm" onClick={() => onAssign(tender.id)}>Assign Team Member</Button>
            </CardHeader>
            <CardContent className="p-5">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Member</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned On</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Rahul Kumar</div>
                            <div className="text-sm text-gray-500">rahul@example.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Technical Lead</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15/06/2023</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Priya Sharma</div>
                            <div className="text-sm text-gray-500">priya@example.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Finance Coordinator</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">16/06/2023</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
