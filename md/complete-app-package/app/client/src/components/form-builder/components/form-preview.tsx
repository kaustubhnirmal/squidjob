/**
 * Form Preview Component
 * Shows a live preview of the form being built
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Smartphone, Monitor, Tablet } from 'lucide-react';
import { FormTemplate } from '../types';
import { FormRenderer } from './form-renderer';

interface FormPreviewProps {
  template: FormTemplate;
  onClose: () => void;
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

export const FormPreview: React.FC<FormPreviewProps> = ({
  template,
  onClose
}) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [showData, setShowData] = useState(false);

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return 'w-80';
      case 'tablet':
        return 'w-96';
      case 'desktop':
      default:
        return 'w-full max-w-4xl';
    }
  };

  const getPreviewHeight = () => {
    switch (previewMode) {
      case 'mobile':
        return 'h-[600px]';
      case 'tablet':
        return 'h-[700px]';
      case 'desktop':
      default:
        return 'h-[800px]';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white rounded-lg shadow-xl ${getPreviewWidth()} max-h-[90vh] overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Form Preview</h2>
              </div>
              
              {/* Device Toggle */}
              <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded ${
                    previewMode === 'desktop' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-2 rounded ${
                    previewMode === 'tablet' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded ${
                    previewMode === 'mobile' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowData(!showData)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                {showData ? 'Hide' : 'Show'} Data
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className={`${getPreviewHeight()} overflow-y-auto bg-gray-100 p-4`}>
            <div className="bg-white rounded-lg shadow-sm h-full">
              <FormRenderer
                template={template}
                data={showData ? {
                  // Sample data for preview
                  companyName: 'Sample Company Ltd',
                  contactPerson: 'John Doe',
                  email: 'john@samplecompany.com',
                  phone: '+1234567890',
                  address: '123 Business Street, City, Country',
                  tenderValue: 50000,
                  submissionDeadline: '2024-12-31',
                  tenderType: 'services',
                  experience: 5
                } : undefined}
                readOnly={true}
                className="p-6"
              />
            </div>
          </div>

          {/* Preview Info */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-medium">Preview Mode:</span> {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)}
                {showData && <span className="ml-2 text-blue-600">• Sample data loaded</span>}
              </div>
              <div>
                <span className="font-medium">Fields:</span> {template.sections.reduce((total, section) => total + section.fields.length, 0)}
                <span className="mx-2">•</span>
                <span className="font-medium">Sections:</span> {template.sections.length}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 