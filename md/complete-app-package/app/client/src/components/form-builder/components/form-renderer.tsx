/**
 * Form Renderer Component
 * Renders the actual form for users to fill out
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  Save,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { useFormRenderer } from '../hooks/use-form-renderer';
import { FormRendererProps, FormTemplate, FormField, FormSection } from '../types';
import { getFieldPreview } from '../utils/field-factory';

export const FormRenderer: React.FC<FormRendererProps> = ({
  template,
  data,
  onSubmit,
  onSave,
  readOnly = false,
  className = ''
}) => {
  const { formData, errors, isValid, isSubmitting, actions } = useFormRenderer(template, data);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  // Calculate total steps for multi-step forms
  const totalSteps = template.settings.multiStep ? template.sections.length : 1;
  const currentSection = template.sections[currentStep];

  // Handle field value change
  const handleFieldChange = (fieldId: string, value: any) => {
    actions.setFieldValue(fieldId, value);
  };

  // Handle field blur (for validation)
  const handleFieldBlur = (fieldId: string) => {
    const fieldErrors = actions.validateField(fieldId);
    if (fieldErrors.length > 0) {
      console.log(`Field ${fieldId} errors:`, fieldErrors);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (template.settings.multiStep) {
      if (currentStep < totalSteps - 1) {
        // Move to next step
        setCurrentStep(prev => prev + 1);
      } else {
        // Submit form
        try {
          await actions.submitForm();
          onSubmit?.(formData);
        } catch (error) {
          console.error('Form submission failed:', error);
        }
      }
    } else {
      // Single step form
      try {
        await actions.submitForm();
        onSubmit?.(formData);
      } catch (error) {
        console.error('Form submission failed:', error);
      }
    }
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    try {
      await actions.saveDraft();
      onSave?.(formData);
    } catch (error) {
      console.error('Save draft failed:', error);
    }
  };

  // Render field based on type
  const renderField = (field: FormField) => {
    const fieldValue = formData[field.id];
    const fieldErrors = errors[field.id] || [];
    const hasError = fieldErrors.length > 0;

    const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
    }`;

    const renderFieldContent = () => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'phone':
          return (
            <input
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onBlur={() => handleFieldBlur(field.id)}
              placeholder={field.placeholder}
              className={baseClasses}
              disabled={readOnly}
              required={field.required}
            />
          );

        case 'number':
          return (
            <input
              type="number"
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, Number(e.target.value))}
              onBlur={() => handleFieldBlur(field.id)}
              placeholder={field.placeholder}
              min={field.settings?.min}
              max={field.settings?.max}
              step={field.settings?.step}
              className={baseClasses}
              disabled={readOnly}
              required={field.required}
            />
          );

        case 'date':
          return (
            <input
              type="date"
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onBlur={() => handleFieldBlur(field.id)}
              className={baseClasses}
              disabled={readOnly}
              required={field.required}
            />
          );

        case 'datetime':
          return (
            <input
              type="datetime-local"
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onBlur={() => handleFieldBlur(field.id)}
              className={baseClasses}
              disabled={readOnly}
              required={field.required}
            />
          );

        case 'select':
          return (
            <select
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onBlur={() => handleFieldBlur(field.id)}
              className={baseClasses}
              disabled={readOnly}
              required={field.required}
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'multiselect':
          return (
            <select
              multiple
              value={Array.isArray(fieldValue) ? fieldValue : []}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                handleFieldChange(field.id, selectedOptions);
              }}
              onBlur={() => handleFieldBlur(field.id)}
              className={baseClasses}
              disabled={readOnly}
              required={field.required}
            >
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'checkbox':
          return (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={fieldValue || false}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                onBlur={() => handleFieldBlur(field.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={readOnly}
                required={field.required}
              />
              <label className="ml-2 text-sm text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
          );

        case 'radio':
          return (
            <div className="space-y-2">
              {field.options?.map(option => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={fieldValue === option.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    onBlur={() => handleFieldBlur(field.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={readOnly}
                    required={field.required}
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          );

        case 'textarea':
          return (
            <textarea
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onBlur={() => handleFieldBlur(field.id)}
              placeholder={field.placeholder}
              rows={field.settings?.rows || 4}
              cols={field.settings?.cols || 50}
              className={baseClasses}
              disabled={readOnly}
              required={field.required}
            />
          );

        case 'file':
          return (
            <div className="space-y-2">
              <input
                type="file"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  handleFieldChange(field.id, field.settings?.multiple ? files : files[0]);
                }}
                accept={field.settings?.accept}
                multiple={field.settings?.multiple}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={readOnly}
                required={field.required}
              />
              {field.settings?.maxSize && (
                <p className="text-xs text-gray-500">
                  Maximum file size: {field.settings.maxSize}MB
                </p>
              )}
            </div>
          );

        case 'signature':
          return (
            <div className="border-2 border-gray-300 rounded-md p-4 text-center h-32 flex items-center justify-center">
              <div className="text-gray-500">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <p className="mt-1 text-sm">Click to sign</p>
              </div>
            </div>
          );

        case 'section':
          return (
            <div className="border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-lg font-medium text-gray-900">{field.label}</h3>
              {field.description && (
                <p className="text-sm text-gray-500 mt-1">{field.description}</p>
              )}
            </div>
          );

        default:
          return (
            <div className="text-sm text-gray-500 italic">
              Unknown field type: {field.type}
            </div>
          );
      }
    };

    return (
      <motion.div
        key={field.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`field-wrapper ${field.styling?.width === 'half' ? 'md:w-1/2' : ''} ${
          field.styling?.inline ? 'inline-block' : 'block'
        }`}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {field.description && (
            <p className="text-xs text-gray-500 mb-2">{field.description}</p>
          )}
          
          {renderFieldContent()}
          
          {hasError && (
            <div className="mt-1 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-500">{fieldErrors[0]}</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Render section
  const renderSection = (section: FormSection) => {
    return (
      <motion.div
        key={section.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="section-wrapper mb-8"
      >
        <div className="section-header mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {section.title}
          </h2>
          {section.description && (
            <p className="text-gray-600">{section.description}</p>
          )}
        </div>
        
        <div className="section-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.fields.map(field => renderField(field))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`form-renderer ${className}`}>
      {/* Form Header */}
      <div className="form-header mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {template.name}
        </h1>
        {template.description && (
          <p className="text-gray-600">{template.description}</p>
        )}
        
        {/* Progress Bar for Multi-step */}
        {template.settings.multiStep && totalSteps > 1 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="form-content">
        <AnimatePresence mode="wait">
          {template.settings.multiStep ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderSection(currentSection)}
            </motion.div>
          ) : (
            <div>
              {template.sections.map(section => renderSection(section))}
            </div>
          )}
        </AnimatePresence>

        {/* Form Actions */}
        <div className="form-actions mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {template.settings.allowDraft && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
              )}
              
              <button
                type="button"
                onClick={actions.resetForm}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reset
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {template.settings.multiStep && currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || (!template.settings.multiStep && !isValid)}
                className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : template.settings.multiStep && currentStep < totalSteps - 1 ? (
                  <>
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Form Status */}
      <div className="form-status mt-4">
        {Object.keys(errors).length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">
                Please fix the errors above before submitting
              </span>
            </div>
          </div>
        )}
        
        {isValid && Object.keys(errors).length === 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-700">
                Form is ready to submit
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 