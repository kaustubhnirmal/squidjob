/**
 * Field Editor Component
 * Modal for editing field properties and validation rules
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { FormField, ValidationRule, FieldType, FIELD_TYPES } from '../types';
import { getValidationOptions, createValidationRule, COMMON_VALIDATION_RULES } from '../utils/field-factory';

interface FieldEditorProps {
  field: FormField;
  onSave: (fieldId: string, updates: Partial<FormField>) => void;
  onClose: () => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<FormField>>(field);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>(field.validation || []);
  const [activeTab, setActiveTab] = useState<'basic' | 'validation' | 'advanced'>('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when field changes
  useEffect(() => {
    setFormData(field);
    setValidationRules(field.validation || []);
  }, [field]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.label?.trim()) {
      newErrors.label = 'Field label is required';
    }

    if (formData.type === 'select' || formData.type === 'multiselect' || formData.type === 'radio') {
      if (!formData.options || formData.options.length === 0) {
        newErrors.options = 'At least one option is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form data change
  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  // Add validation rule
  const handleAddValidation = (type: ValidationRule['type']) => {
    const newRule: ValidationRule = {
      type,
      message: `Please enter a valid ${type} value`,
      value: undefined
    };
    setValidationRules(prev => [...prev, newRule]);
  };

  // Update validation rule
  const handleUpdateValidation = (index: number, updates: Partial<ValidationRule>) => {
    setValidationRules(prev => 
      prev.map((rule, i) => i === index ? { ...rule, ...updates } : rule)
    );
  };

  // Remove validation rule
  const handleRemoveValidation = (index: number) => {
    setValidationRules(prev => prev.filter((_, i) => i !== index));
  };

  // Add option for select/multiselect/radio fields
  const handleAddOption = () => {
    const newOption = { value: `option${Date.now()}`, label: `Option ${Date.now()}` };
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption]
    }));
  };

  // Update option
  const handleUpdateOption = (index: number, updates: Partial<{ value: string; label: string }>) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.map((option, i) => 
        i === index ? { ...option, ...updates } : option
      )
    }));
  };

  // Remove option
  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index)
    }));
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) return;

    const updates: Partial<FormField> = {
      ...formData,
      validation: validationRules
    };

    onSave(field.id, updates);
  };

  // Get validation options for current field type
  const availableValidationOptions = getValidationOptions(field.type);

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
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Field</h2>
              <p className="text-sm text-gray-500">
                Configure {FIELD_TYPES[field.type].label} properties
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {[
                { id: 'basic', label: 'Basic', icon: Settings },
                { id: 'validation', label: 'Validation', icon: AlertCircle },
                { id: 'advanced', label: 'Advanced', icon: Settings }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 py-3 border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              {activeTab === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Field Label */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Label *
                    </label>
                    <input
                      type="text"
                      value={formData.label || ''}
                      onChange={(e) => handleChange('label', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.label ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter field label"
                    />
                    {errors.label && (
                      <p className="text-sm text-red-500 mt-1">{errors.label}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter field description (optional)"
                    />
                  </div>

                  {/* Placeholder */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={formData.placeholder || ''}
                      onChange={(e) => handleChange('placeholder', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  {/* Required */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="required"
                      checked={formData.required || false}
                      onChange={(e) => handleChange('required', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                      Required field
                    </label>
                  </div>

                  {/* Options for select/multiselect/radio */}
                  {(field.type === 'select' || field.type === 'multiselect' || field.type === 'radio') && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Options *
                        </label>
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {formData.options?.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={option.value}
                              onChange={(e) => handleUpdateOption(index, { value: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Value"
                            />
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) => handleUpdateOption(index, { label: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Label"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {errors.options && (
                        <p className="text-sm text-red-500 mt-1">{errors.options}</p>
                      )}
                    </div>
                  )}

                  {/* Field-specific settings */}
                  {field.type === 'number' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Value
                        </label>
                        <input
                          type="number"
                          value={formData.settings?.min || ''}
                          onChange={(e) => handleChange('settings', { 
                            ...formData.settings, 
                            min: e.target.value ? Number(e.target.value) : undefined 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Value
                        </label>
                        <input
                          type="number"
                          value={formData.settings?.max || ''}
                          onChange={(e) => handleChange('settings', { 
                            ...formData.settings, 
                            max: e.target.value ? Number(e.target.value) : undefined 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {field.type === 'textarea' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rows
                        </label>
                        <input
                          type="number"
                          value={formData.settings?.rows || 4}
                          onChange={(e) => handleChange('settings', { 
                            ...formData.settings, 
                            rows: Number(e.target.value) 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Columns
                        </label>
                        <input
                          type="number"
                          value={formData.settings?.cols || 50}
                          onChange={(e) => handleChange('settings', { 
                            ...formData.settings, 
                            cols: Number(e.target.value) 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'validation' && (
                <motion.div
                  key="validation"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Add Validation Rules */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Validation Rules
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableValidationOptions.map((option) => (
                        <button
                          key={option.type}
                          onClick={() => handleAddValidation(option.type)}
                          className="flex items-center space-x-2 p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Validation Rules List */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Validation Rules
                    </label>
                    <div className="space-y-3">
                      {validationRules.map((rule, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)}
                            </span>
                            <button
                              onClick={() => handleRemoveValidation(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={rule.message}
                              onChange={(e) => handleUpdateValidation(index, { message: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Error message"
                            />
                            
                            {(rule.type === 'min' || rule.type === 'max' || rule.type === 'pattern') && (
                              <input
                                type={rule.type === 'pattern' ? 'text' : 'number'}
                                value={rule.value || ''}
                                onChange={(e) => handleUpdateValidation(index, { 
                                  value: rule.type === 'pattern' ? e.target.value : Number(e.target.value) 
                                })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={rule.type === 'pattern' ? 'Regex pattern' : 'Value'}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {validationRules.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No validation rules added</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'advanced' && (
                <motion.div
                  key="advanced"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Conditional Logic */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conditional Logic
                    </label>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        Conditional logic allows you to show/hide this field based on other field values.
                      </p>
                      <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                        Configure conditional logic
                      </button>
                    </div>
                  </div>

                  {/* Styling */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Styling Options
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Width</label>
                        <select
                          value={formData.styling?.width || 'full'}
                          onChange={(e) => handleChange('styling', { 
                            ...formData.styling, 
                            width: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="full">Full Width</option>
                          <option value="half">Half Width</option>
                          <option value="third">One Third</option>
                          <option value="quarter">One Quarter</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Display</label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="inline"
                            checked={formData.styling?.inline || false}
                            onChange={(e) => handleChange('styling', { 
                              ...formData.styling, 
                              inline: e.target.checked 
                            })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="inline" className="ml-2 text-sm text-gray-700">
                            Inline display
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Metadata
                    </label>
                    <textarea
                      value={JSON.stringify(formData.metadata || {}, null, 2)}
                      onChange={(e) => {
                        try {
                          const metadata = JSON.parse(e.target.value);
                          handleChange('metadata', metadata);
                        } catch (error) {
                          // Invalid JSON, ignore
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      rows={4}
                      placeholder="Enter custom metadata as JSON"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 