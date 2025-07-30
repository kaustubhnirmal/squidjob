import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

// Interface matching the CSV structure provided
interface TenderData {
  "Bid Number": string;
  "Dated": string;
  "Bid End Date/Time": string;
  "Bid Opening Date/Time": string;
  "Bid Offer Validity (From End Date)": string;
  "Ministry/State Name": string;
  "Department Name": string;
  "Organisation Name": string;
  "Office Name": string;
  "Buyer Email": string;
  "Total Quantity": string;
  "BOQ Title": string;
  "MSE Exemption for Years of Experience and Turnover": string;
  "EMD Amount": string;
  "Bid Value": string;
  "ePBG Detail: Required": string;
}

interface TenderDataEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: TenderData;
  onSave: (data: TenderData) => void;
  index: number;
}

export function TenderDataEditor({ 
  isOpen, 
  onClose, 
  data, 
  onSave,
  index 
}: TenderDataEditorProps) {
  const [editedData, setEditedData] = useState<TenderData>(data);
  
  const handleChange = (field: keyof TenderData, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = () => {
    onSave(editedData);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Tender Data (PDF {index + 1})</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bidNumber">Bid Number</Label>
              <Input
                id="bidNumber"
                value={editedData["Bid Number"]}
                onChange={(e) => handleChange("Bid Number", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dated">Dated</Label>
              <Input
                id="dated"
                value={editedData["Dated"]}
                onChange={(e) => handleChange("Dated", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bidEndDate">Bid End Date/Time</Label>
              <Input
                id="bidEndDate"
                value={editedData["Bid End Date/Time"]}
                onChange={(e) => handleChange("Bid End Date/Time", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bidOpeningDate">Bid Opening Date/Time</Label>
              <Input
                id="bidOpeningDate"
                value={editedData["Bid Opening Date/Time"]}
                onChange={(e) => handleChange("Bid Opening Date/Time", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bidValidity">Bid Offer Validity (From End Date)</Label>
              <Input
                id="bidValidity"
                value={editedData["Bid Offer Validity (From End Date)"]}
                onChange={(e) => handleChange("Bid Offer Validity (From End Date)", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ministryName">Ministry/State Name</Label>
              <Input
                id="ministryName"
                value={editedData["Ministry/State Name"]}
                onChange={(e) => handleChange("Ministry/State Name", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="departmentName">Department Name</Label>
              <Input
                id="departmentName"
                value={editedData["Department Name"]}
                onChange={(e) => handleChange("Department Name", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organisationName">Organisation Name</Label>
              <Input
                id="organisationName"
                value={editedData["Organisation Name"]}
                onChange={(e) => handleChange("Organisation Name", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="officeName">Office Name</Label>
              <Input
                id="officeName"
                value={editedData["Office Name"]}
                onChange={(e) => handleChange("Office Name", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="buyerEmail">Buyer Email</Label>
              <Input
                id="buyerEmail"
                value={editedData["Buyer Email"]}
                onChange={(e) => handleChange("Buyer Email", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalQuantity">Total Quantity</Label>
              <Input
                id="totalQuantity"
                value={editedData["Total Quantity"]}
                onChange={(e) => handleChange("Total Quantity", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="boqTitle">BOQ Title</Label>
              <Input
                id="boqTitle"
                value={editedData["BOQ Title"]}
                onChange={(e) => handleChange("BOQ Title", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mseExemption">MSE Exemption for Years of Experience and Turnover</Label>
              <Input
                id="mseExemption"
                value={editedData["MSE Exemption for Years of Experience and Turnover"]}
                onChange={(e) => handleChange("MSE Exemption for Years of Experience and Turnover", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emdAmount">EMD Amount</Label>
              <Input
                id="emdAmount"
                value={editedData["EMD Amount"]}
                onChange={(e) => handleChange("EMD Amount", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bidValue">Bid Value</Label>
              <Input
                id="bidValue"
                value={editedData["Bid Value"]}
                onChange={(e) => handleChange("Bid Value", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="epbgDetail">ePBG Detail: Required</Label>
              <Input
                id="epbgDetail"
                value={editedData["ePBG Detail: Required"]}
                onChange={(e) => handleChange("ePBG Detail: Required", e.target.value)}
              />
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}