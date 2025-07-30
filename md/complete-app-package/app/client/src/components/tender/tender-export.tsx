import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface TenderExportProps {
  onExport?: (format: string) => void;
}

export function TenderExport({ onExport }: TenderExportProps) {
  const handleExport = () => {
    if (onExport) {
      onExport('Excel');
    } else {
      alert(`Export to Excel coming soon!`);
    }
  };

  return (
    <div className="border-t border-b border-gray-200 py-4 mb-6 flex justify-between items-center">
      <div className="w-full flex justify-center">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>
    </div>
  );
}