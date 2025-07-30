import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TenderAddModify() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    tenderBrief: '',
    referenceNo: '',
    organizationName: '',
    keyword: '',
    siteLocation: '',
    profile: '',
    estimatedCost: '',
    earnestMoneyDeposite: '',
    documentFees: '',
    submissionDate: '',
    tenderOpeningDate: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create form data to send files
      const data = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      
      // Add file if selected
      if (selectedFile) {
        data.append('document', selectedFile);
      }
      
      // Submit form (this is a placeholder, replace with your API endpoint)
      // const response = await fetch('/api/tenders', {
      //   method: 'POST',
      //   body: data
      // });
      
      // if (!response.ok) throw new Error('Failed to create tender');
      
      toast({
        title: "Success",
        description: "Tender created successfully",
      });
      
      // Reset form
      setFormData({
        tenderBrief: '',
        referenceNo: '',
        organizationName: '',
        keyword: '',
        siteLocation: '',
        profile: '',
        estimatedCost: '',
        earnestMoneyDeposite: '',
        documentFees: '',
        submissionDate: '',
        tenderOpeningDate: ''
      });
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to create tender. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      tenderBrief: '',
      referenceNo: '',
      organizationName: '',
      keyword: '',
      siteLocation: '',
      profile: '',
      estimatedCost: '',
      earnestMoneyDeposite: '',
      documentFees: '',
      submissionDate: '',
      tenderOpeningDate: ''
    });
    setSelectedFile(null);
  };

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">New Tender</h1>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Tender Id"
            className="max-w-xs"
          />
          <Button className="bg-blue-500 hover:bg-blue-600">
            Search
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Tender</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tenderBrief" className="required">Tender Brief</Label>
                  <Input
                    id="tenderBrief"
                    name="tenderBrief"
                    placeholder="Tender Brief"
                    value={formData.tenderBrief}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-start-1">
                  <Label htmlFor="referenceNo" className="required">Reference No.</Label>
                  <Input
                    id="referenceNo"
                    name="referenceNo"
                    placeholder="Reference No."
                    value={formData.referenceNo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName" className="required">Organization Name</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange('organizationName', value)}
                    defaultValue={formData.organizationName}
                  >
                    <SelectTrigger id="organizationName">
                      <SelectValue placeholder="Organization Name" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="org1">Organization 1</SelectItem>
                      <SelectItem value="org2">Organization 2</SelectItem>
                      <SelectItem value="org3">Organization 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyword" className="required">Keyword</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange('keyword', value)}
                    defaultValue={formData.keyword}
                  >
                    <SelectTrigger id="keyword">
                      <SelectValue placeholder="Search by Keywords" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keyword1">Keyword 1</SelectItem>
                      <SelectItem value="keyword2">Keyword 2</SelectItem>
                      <SelectItem value="keyword3">Keyword 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteLocation" className="required">Site Location</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange('siteLocation', value)}
                    defaultValue={formData.siteLocation}
                  >
                    <SelectTrigger id="siteLocation">
                      <SelectValue placeholder="Site Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="location1">Location 1</SelectItem>
                      <SelectItem value="location2">Location 2</SelectItem>
                      <SelectItem value="location3">Location 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile" className="required">Profile</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange('profile', value)}
                    defaultValue={formData.profile}
                  >
                    <SelectTrigger id="profile">
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profile1">Profile 1</SelectItem>
                      <SelectItem value="profile2">Profile 2</SelectItem>
                      <SelectItem value="profile3">Profile 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedCost" className="required">Estimated Cost</Label>
                  <Input
                    id="estimatedCost"
                    name="estimatedCost"
                    placeholder="Estimated Cost"
                    value={formData.estimatedCost}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="earnestMoneyDeposite" className="required">Earnest Money Deposite</Label>
                  <Input
                    id="earnestMoneyDeposite"
                    name="earnestMoneyDeposite"
                    placeholder="Earnest Money Deposite"
                    value={formData.earnestMoneyDeposite}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentFees" className="required">Document Fees</Label>
                  <Input
                    id="documentFees"
                    name="documentFees"
                    placeholder="Document Fees"
                    value={formData.documentFees}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="submissionDate" className="required">Submission Date</Label>
                  <Input
                    id="submissionDate"
                    name="submissionDate"
                    type="date"
                    placeholder="Submission Date"
                    value={formData.submissionDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenderOpeningDate" className="required">Tender Opening Date</Label>
                  <Input
                    id="tenderOpeningDate"
                    name="tenderOpeningDate"
                    type="date"
                    placeholder="Tender Opening Date"
                    value={formData.tenderOpeningDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Document upload section */}
                <div className="space-y-2 md:col-span-2">
                  <h3 className="text-lg font-medium">Document</h3>
                  <Separator className="my-2" />
                
                  <div className="space-y-2">
                    <Label htmlFor="documentUpload">Upload File:</Label>
                    <Input
                      id="documentUpload"
                      type="file"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedFile ? `Selected file: ${selectedFile.name}` : 'No file chosen'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-start space-x-3 pt-6">
                <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600">
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}