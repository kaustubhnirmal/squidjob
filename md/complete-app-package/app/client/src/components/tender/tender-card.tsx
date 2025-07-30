import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Clock, DollarSign, FileText, User } from "lucide-react";
import { TenderStatus } from "@/components/tender-status";
import { TenderActionButtons } from "@/components/tender/action-buttons";
import { DocumentLinks } from "@/components/tender/document-links";
import { useLocation } from "wouter";

interface TenderCardProps {
  tender: {
    id?: number;
    referenceNo?: string;
    title?: string;
    brief?: string;
    authority?: string;
    location?: string;
    deadline: string;
    emdAmount?: number;
    documentFee?: number;
    estimatedValue?: number;
    bidValue?: number;
    status: string;
    bidDocumentPath?: string;
    atcDocumentPath?: string;
    techSpecsDocumentPath?: string;
    createdAt?: string;
    updatedAt?: string;
    assignedUser?: {
      id: number;
      name: string;
    };
    assignedBy?: {
      id: number;
      name: string;
    };
    isStarred?: boolean;
    isInterested?: boolean;
    approvalStatus?: string;
  };
  showAssignmentInfo?: boolean;
  className?: string;
}

export function TenderCard({ tender, showAssignmentInfo = false, className = "" }: TenderCardProps) {
  const [, setLocation] = useLocation();

  // Calculate days left
  const getDaysLeftInfo = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let colorClass = "text-green-600";
    let daysLeft = `${diffDays} Days Left`;
    
    if (diffDays < 0) {
      colorClass = "text-red-600";
      daysLeft = "Expired";
    } else if (diffDays === 0) {
      colorClass = "text-red-600";
      daysLeft = "Today";
    } else if (diffDays <= 3) {
      colorClass = "text-red-600";
    } else if (diffDays <= 7) {
      colorClass = "text-orange-600";
    }
    
    return { daysLeft, colorClass };
  };

  const { daysLeft, colorClass } = getDaysLeftInfo(tender.deadline);

  const handleCardClick = (e: React.MouseEvent) => {
    console.log("Card clicked - checking if should navigate");
    console.log("Event target:", e.target);
    
    // Don't navigate if clicking on interactive elements
    if (
      e.target instanceof HTMLElement && 
      (e.target.closest('button') || 
       e.target.closest('a') || 
       e.target.closest('[role="button"]') ||
       e.target.closest('.tooltip') ||
       e.target.closest('[data-radix-tooltip-trigger]'))
    ) {
      console.log("Clicked on interactive element - not navigating");
      return;
    }
    
    console.log("Navigating to tender details");
    if (tender.id) {
      setLocation(`/tenders/${tender.id}`);
    }
  };

  return (
    <Card 
      className={`hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Primary Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tender ID</label>
                <p className="text-base font-semibold text-blue-600 mt-1">{tender.referenceNo || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <TenderStatus status={tender.status} updatedAt={tender.updatedAt} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Days Left</label>
                <p className={`text-base font-semibold mt-1 ${colorClass}`}>{daysLeft}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Authority</label>
                <p className="text-base font-medium text-gray-900 mt-1 truncate">
                  {tender.authority || "N/A"}
                </p>
              </div>
            </div>

            {/* Date and Time Info */}
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                📅 {new Date(tender.deadline).toLocaleDateString('en-IN')}
              </span>
              <span>
                ⏱️ {new Date(tender.deadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Financial Information */}
            <div className="flex items-center gap-4 mb-3 text-sm">
              <span className="flex items-center gap-1 font-medium text-blue-600">
                <DollarSign className="h-4 w-4" />
                Value: {tender.bidValue 
                  ? `₹${tender.bidValue.toLocaleString('en-IN')}`
                  : tender.estimatedValue 
                    ? `₹${tender.estimatedValue.toLocaleString('en-IN')}`
                    : 'N/A'}
              </span>
              <span className="text-gray-600">
                EMD: {tender.emdAmount ? `₹${tender.emdAmount.toLocaleString('en-IN')}` : 'Refer Document'}
              </span>
            </div>

            {/* Assignment Information */}
            {showAssignmentInfo && (tender.assignedUser || tender.assignedBy) && (
              <div className="flex items-center gap-4 mb-3 text-sm">
                <span className="flex items-center gap-1 text-blue-600">
                  <User className="h-4 w-4" />
                  Assigned To: {tender.assignedUser?.name || 'N/A'}
                </span>
                <span className="text-gray-600">
                  Assigned By: {tender.assignedBy?.name || 'Admin'}
                </span>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center gap-1 mb-3 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              {tender.location || 'Location not specified'}
            </div>

            {/* Website Link */}
            <div className="mb-3">
              <label className="text-sm font-medium text-gray-500">Website</label>
              <div className="mt-1">
                <a 
                  href="https://gem.gov.in" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Click here <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Brief Description */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-500">Brief</label>
              <p className="text-sm text-gray-800 mt-1 leading-relaxed line-clamp-3">
                {tender.brief || tender.title || "No description available"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-end gap-2 ml-4">
            <div 
              onClick={(e) => {
                console.log("Action buttons wrapper clicked");
                e.stopPropagation();
                e.preventDefault();
              }}
              onPointerDown={(e) => {
                console.log("Action buttons wrapper pointer down");
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                console.log("Action buttons wrapper mouse down");
                e.stopPropagation();
              }}
            >
              <TenderActionButtons 
                tenderId={tender.id} 
                tenderReferenceNo={tender.referenceNo}
                isStarred={tender.isStarred}
                isInterested={tender.isInterested}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Document Links */}
        <div className="flex justify-between items-center">
          <div onClick={(e) => e.stopPropagation()}>
            <DocumentLinks 
              tenderId={tender.id}
              bidDocumentPath={tender.bidDocumentPath}
              atcDocumentPath={tender.atcDocumentPath}
              techSpecsDocumentPath={tender.techSpecsDocumentPath}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick(e);
            }}
            className="text-blue-600 hover:bg-blue-50"
          >
            <FileText className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}