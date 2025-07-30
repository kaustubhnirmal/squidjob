// Template: TenderForm.jsx
// Comprehensive form component for creating and editing tenders

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Form validation schema
const tenderFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  authority: z.string().min(1, 'Authority is required'),
  location: z.string().optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  publishedDate: z.string().optional(),
  emdAmount: z.coerce.number().min(0, 'EMD amount must be positive').optional(),
  documentFee: z.coerce.number().min(0, 'Document fee must be positive').optional(),
  estimatedValue: z.coerce.number().min(0, 'Estimated value must be positive').optional(),
  status: z.enum(['draft', 'live', 'in_process', 'submitted', 'awarded', 'rejected']).default('draft')
});

/**
 * TenderForm Component
 * @param {Object} tender - Existing tender data (for edit mode)
 * @param {Function} onSubmit - Form submission handler
 * @param {Function} onCancel - Cancel handler
 * @param {boolean} isLoading - Loading state
 * @param {boolean} isEdit - Edit mode flag
 */
export const TenderForm = ({
  tender = null,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false
}) => {
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [currentStep, setCurrentStep] = React.useState(1);

  // Form steps configuration
  const steps = [
    { id: 1, title: 'Basic Information', description: 'Essential tender details' },
    { id: 2, title: 'Timeline & Dates', description: 'Important dates and deadlines' },
    { id: 3, title: 'Financial Details', description: 'Costs and monetary information' },
    { id: 4, title: 'Documents', description: 'Upload relevant documents' },
    { id: 5, title: 'Review', description: 'Review and submit' }
  ];

  // Initialize form with default values
  const form = useForm({
    resolver: zodResolver(tenderFormSchema),
    defaultValues: {
      title: tender?.title || '',
      description: tender?.description || '',
      authority: tender?.authority || '',
      location: tender?.location || '',
      deadline: tender?.deadline ? new Date(tender.deadline).toISOString().slice(0, 16) : '',
      publishedDate: tender?.publishedDate ? new Date(tender.publishedDate).toISOString().slice(0, 10) : '',
      emdAmount: tender?.emdAmount || 0,
      documentFee: tender?.documentFee || 0,
      estimatedValue: tender?.estimatedValue || 0,
      status: tender?.status || 'draft'
    }
  });

  // Handle form submission
  const handleSubmit = async (data) => {
    try {
      // Convert deadline string to Date object
      const formattedData = {
        ...data,
        deadline: new Date(data.deadline).toISOString(),
        publishedDate: data.publishedDate ? new Date(data.publishedDate).toISOString() : null,
        documents: uploadedFiles
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = (event, documentType) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: documentType,
      id: Date.now() + Math.random()
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  // Remove uploaded file
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Navigate between steps
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Tender' : 'Create New Tender'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? 'Update tender information' : 'Fill in the details to create a new tender'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {step.id}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="ml-4 flex-1 h-0.5 bg-gray-200 hidden sm:block">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ 
                      width: currentStep > step.id ? '100%' : '0%' 
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential tender details and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Tender Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter tender title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issuing Authority *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter authority name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter detailed description"
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Timeline & Dates */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Timeline & Dates</CardTitle>
                <CardDescription>Important dates and deadlines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Submission Deadline *</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="publishedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publication Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isEdit && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="in_process">In Process</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="awarded">Awarded</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Financial Details */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
                <CardDescription>Costs and monetary details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="emdAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EMD Amount (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="documentFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Fee (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Value (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Upload relevant documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload Areas */}
                <div className="space-y-4">
                  {/* Tender Document */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="tender-document" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload Tender Document
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PDF, DOC, DOCX up to 50MB
                          </span>
                        </label>
                        <input
                          id="tender-document"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'tender_document')}
                          multiple
                        />
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="tech-specs" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload Technical Specifications
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PDF, DOC, DOCX up to 50MB
                          </span>
                        </label>
                        <input
                          id="tech-specs"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'tech_specs')}
                          multiple
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Uploaded Files</h4>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {file.name.split('.').pop().toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • {file.type}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>Review all information before submitting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary of form data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Title:</span> {form.watch('title')}
                    </div>
                    <div>
                      <span className="font-medium">Authority:</span> {form.watch('authority')}
                    </div>
                    <div>
                      <span className="font-medium">Deadline:</span> {form.watch('deadline')}
                    </div>
                    <div>
                      <span className="font-medium">Documents:</span> {uploadedFiles.length} files
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>
            <div className="space-x-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              {currentStep < steps.length ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (isEdit ? 'Update Tender' : 'Create Tender')}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TenderForm;