import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText } from 'lucide-react';

interface DocumentLinksProps {
  bidDocumentPath?: string;
  atcDocumentPath?: string;
  techSpecsDocumentPath?: string;
  tenderId: number;
}

export function DocumentLinks({ bidDocumentPath, atcDocumentPath, techSpecsDocumentPath, tenderId }: DocumentLinksProps) {
  const baseUrl = '/api/documents'; // Base URL for document downloads
  
  const handleOpenDocument = (documentType: string, path?: string) => {
    if (!path) {
      console.warn(`No ${documentType} document available`);
      return;
    }
    
    // Create the full URL to download/view the document
    const documentUrl = `${baseUrl}/${tenderId}/${documentType}`;
    
    // Open the document in a new tab
    window.open(documentUrl, '_blank');
  };
  
  return (
    <div className="flex gap-2 mt-2">
      {bidDocumentPath && (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-blue-600 text-xs flex items-center"
          onClick={() => handleOpenDocument('bid', bidDocumentPath)}
        >
          <FileText className="h-3 w-3 mr-1" />
          Bid Document
        </Button>
      )}
      
      {atcDocumentPath && (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-blue-600 text-xs flex items-center"
          onClick={() => handleOpenDocument('atc', atcDocumentPath)}
        >
          <FileText className="h-3 w-3 mr-1" />
          ATC Document
        </Button>
      )}
      
      {techSpecsDocumentPath && (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-blue-600 text-xs flex items-center"
          onClick={() => handleOpenDocument('tech', techSpecsDocumentPath)}
        >
          <FileText className="h-3 w-3 mr-1" />
          Tech Specs
        </Button>
      )}
    </div>
  );
}