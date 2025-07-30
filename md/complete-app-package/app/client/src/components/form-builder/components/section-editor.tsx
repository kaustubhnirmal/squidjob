/**
 * Section Editor Component
 * Modal for editing section properties and configuration
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Eye, EyeOff, Trash2, Plus } from 'lucide-react';
import { FormSection } from '../types';

interface SectionEditorProps {
  section: FormSection;
  onSave: (sectionId: string, updates: Partial<FormSection>) => void;
  onClose: () => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<FormSection>>(section);
  const [activeTab, setActiveTab] = useState<'basic' | 'layout' | 'conditional'>('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when section changes
  useEffect(() => {
    setFormData(section);
  }, [section]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Section title is required';
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

  // Handle save
  const handleSave = () => {
    if (!validateForm()) return;

    onSave(section.id, formData);
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
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Section</h2>
              <p className="text-sm text-gray-500">
                Configure section properties and layout
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
                { id: 'layout', label: 'Layout', icon: Eye },
                { id: 'conditional', label: 'Conditional', icon: Settings }
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
                  {/* Section Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter section title"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title}</p>
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
                      placeholder="Enter section description (optional)"
                    />
                  </div>

                  {/* Collapsed State */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="collapsed"
                      checked={formData.collapsed || false}
                      onChange={(e) => handleChange('collapsed', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="collapsed" className="ml-2 text-sm text-gray-700">
                      Start collapsed
                    </label>
                  </div>
                </motion.div>
              )}

              {activeTab === 'layout' && (
                <motion.div
                  key="layout"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Layout Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Layout
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="radio"
                            name="layout"
                            value="grid"
                            checked={true}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">Grid Layout</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Fields arranged in a responsive grid
                        </p>
                      </div>
                      
                      <div className="p-3 border border-gray-200 rounded-lg opacity-50">
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="radio"
                            name="layout"
                            value="list"
                            disabled
                            className="w-4 h-4 text-gray-400 border-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-500">List Layout</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Fields arranged in a single column
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column Configuration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Column Configuration
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map(cols => (
                        <button
                          key={cols}
                          className={`p-3 border rounded-lg text-center ${
                            cols === 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="text-sm font-medium">{cols} Column{cols > 1 ? 's' : ''}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spacing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Spacing
                    </label>
                    <select
                      value="normal"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="compact">Compact</option>
                      <option value="normal">Normal</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {activeTab === 'conditional' && (
                <motion.div
                  key="conditional"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Conditional Logic */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conditional Display
                    </label>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 mb-3">
                        Show this section only when specific conditions are met
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <select className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select field</option>
                            <option value="tender_type">Tender Type</option>
                            <option value="company_size">Company Size</option>
                          </select>
                          
                          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="equals">equals</option>
                            <option value="not_equals">not equals</option>
                            <option value="contains">contains</option>
                          </select>
                          
                          <input
                            type="text"
                            placeholder="Value"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
                        <Plus className="w-4 h-4 inline mr-1" />
                        Add another condition
                      </button>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advanced Options
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="show_progress"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="show_progress" className="ml-2 text-sm text-gray-700">
                          Show progress indicator
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="allow_skip"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="allow_skip" className="ml-2 text-sm text-gray-700">
                          Allow section to be skipped
                        </label>
                      </div>
                    </div>
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