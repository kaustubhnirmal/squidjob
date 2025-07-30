/**
 * Field Toolbox Component
 * Displays available field types for drag & drop into the form builder
 */

import React, { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { 
  Type, 
  Hash, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  ChevronDown, 
  List, 
  CheckSquare, 
  Circle, 
  AlignLeft, 
  Upload, 
  PenTool, 
  Folder, 
  Copy,
  Search,
  Filter
} from 'lucide-react';
import { FieldType, FIELD_TYPES } from '../types';
import { getFieldIcon, getFieldDescription } from '../utils/field-factory';

interface FieldToolboxProps {
  onFieldSelect: (fieldType: FieldType) => void;
  readOnly?: boolean;
}

const FIELD_ICONS: Record<FieldType, React.ComponentType<any>> = {
  text: Type,
  number: Hash,
  email: Mail,
  phone: Phone,
  date: Calendar,
  datetime: Clock,
  select: ChevronDown,
  multiselect: List,
  checkbox: CheckSquare,
  radio: Circle,
  textarea: AlignLeft,
  file: Upload,
  signature: PenTool,
  section: Folder,
  repeater: Copy
};

export const FieldToolbox: React.FC<FieldToolboxProps> = ({
  onFieldSelect,
  readOnly = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(true);

  // Field categories
  const categories = {
    all: 'All Fields',
    basic: 'Basic Inputs',
    advanced: 'Advanced Inputs',
    media: 'Media & Files',
    layout: 'Layout & Structure'
  };

  const fieldCategories: Record<FieldType, string> = {
    text: 'basic',
    number: 'basic',
    email: 'basic',
    phone: 'basic',
    date: 'basic',
    datetime: 'basic',
    select: 'advanced',
    multiselect: 'advanced',
    checkbox: 'basic',
    radio: 'basic',
    textarea: 'basic',
    file: 'media',
    signature: 'media',
    section: 'layout',
    repeater: 'advanced'
  };

  // Filter fields based on search and category
  const filteredFields = Object.entries(FIELD_TYPES).filter(([type, config]) => {
    const matchesSearch = config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || fieldCategories[type as FieldType] === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFieldClick = (fieldType: FieldType) => {
    if (!readOnly) {
      onFieldSelect(fieldType);
    }
  };

  return (
    <div className="field-toolbox">
      {/* Header */}
      <div className="toolbox-header mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Field Types</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>
        
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                {Object.entries(categories).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Field List */}
      {isExpanded && (
        <Droppable droppableId="toolbox" type="field" isDropDisabled={readOnly}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-2 ${
                snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 rounded-lg' : ''
              }`}
            >
              {filteredFields.map(([type, config], index) => {
                const IconComponent = FIELD_ICONS[type as FieldType];
                
                return (
                  <Draggable
                    key={type}
                    draggableId={type}
                    index={index}
                    isDragDisabled={readOnly}
                  >
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`field-item p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:shadow-sm transition-all ${
                          snapshot.isDragging ? 'opacity-50 shadow-lg' : ''
                        } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleFieldClick(type as FieldType)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {config.label}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {config.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}

      {/* Quick Add Buttons */}
      {isExpanded && !readOnly && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Add</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(FIELD_TYPES)
              .filter(([type]) => ['text', 'email', 'select', 'checkbox'].includes(type))
              .map(([type, config]) => {
                const IconComponent = FIELD_ICONS[type as FieldType];
                
                return (
                  <button
                    key={type}
                    onClick={() => handleFieldClick(type as FieldType)}
                    className="flex items-center space-x-2 p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                  >
                    <IconComponent className="w-3 h-3 text-gray-600" />
                    <span className="text-gray-700">{config.label}</span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {isExpanded && filteredFields.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            {searchTerm ? 'No fields match your search' : 'No fields in this category'}
          </p>
        </div>
      )}

      {/* Read Only Notice */}
      {readOnly && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            Form builder is in read-only mode. Fields cannot be added or modified.
          </p>
        </div>
      )}
    </div>
  );
}; 