/**
 * Form Builder Component
 * Main component for building dynamic forms with drag & drop functionality
 */

import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Settings, 
  Eye, 
  Save, 
  Play, 
  Copy, 
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  MoreVertical
} from 'lucide-react';
import { useFormBuilder } from '../hooks/use-form-builder';
import { FormBuilderProps, FormTemplate, FormField, FormSection, FieldType } from '../types';
import { createField, createSection, FIELD_TYPES } from '../utils/field-factory';
import { FieldToolbox } from './field-toolbox';
import { FieldEditor } from './field-editor';
import { FormPreview } from './form-preview';
import { SectionEditor } from './section-editor';
import { AIAssistant } from './ai-assistant';

export const FormBuilder: React.FC<FormBuilderProps> = ({
  template,
  onSave,
  onPublish,
  onPreview,
  readOnly = false,
  className = ''
}) => {
  const { state, actions } = useFormBuilder(template);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [editingSection, setEditingSection] = useState<FormSection | null>(null);

  // Handle drag end
  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'field') {
      if (source.droppableId === 'toolbox' && destination.droppableId.startsWith('section-')) {
        // Add new field from toolbox
        const fieldType = result.draggableId as FieldType;
        const sectionIndex = parseInt(destination.droppableId.split('-')[1]);
        const newField = createField(fieldType, `New ${FIELD_TYPES[fieldType].label}`);
        actions.addField(newField, sectionIndex);
      } else if (source.droppableId.startsWith('section-') && destination.droppableId.startsWith('section-')) {
        // Move field within or between sections
        const fromSection = parseInt(source.droppableId.split('-')[1]);
        const toSection = parseInt(destination.droppableId.split('-')[1]);
        const fieldId = result.draggableId;
        actions.moveField(fieldId, fromSection, toSection, destination.index);
      }
    } else if (type === 'section') {
      // Reorder sections
      const newSections = Array.from(state.template.sections);
      const [removed] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, removed);
      
      // Update template with reordered sections
      actions.updateSection(state.template.sections[source.index].id, {});
      // Note: This is a simplified approach. In a real implementation, you'd need to handle section reordering properly
    }
  }, [state.template.sections, actions]);

  // Add new section
  const handleAddSection = useCallback(() => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: 'Enter section description',
      fields: [],
      collapsed: false
    };
    actions.addSection(newSection);
  }, [actions]);

  // Edit field
  const handleEditField = useCallback((field: FormField) => {
    setEditingField(field);
    setShowFieldEditor(true);
  }, []);

  // Edit section
  const handleEditSection = useCallback((section: FormSection) => {
    setEditingSection(section);
    setShowSectionEditor(true);
  }, []);

  // Save field changes
  const handleSaveField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    actions.updateField(fieldId, updates);
    setShowFieldEditor(false);
    setEditingField(null);
  }, [actions]);

  // Save section changes
  const handleSaveSection = useCallback((sectionId: string, updates: Partial<FormSection>) => {
    actions.updateSection(sectionId, updates);
    setShowSectionEditor(false);
    setEditingSection(null);
  }, [actions]);

  // Remove field
  const handleRemoveField = useCallback((fieldId: string) => {
    actions.removeField(fieldId);
  }, [actions]);

  // Remove section
  const handleRemoveSection = useCallback((sectionId: string) => {
    actions.removeSection(sectionId);
  }, [actions]);

  // Toggle section collapse
  const handleToggleSection = useCallback((sectionId: string, collapsed: boolean) => {
    actions.updateSection(sectionId, { collapsed });
  }, [actions]);

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      await actions.saveTemplate();
      onSave?.(state.template);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  }, [actions, state.template, onSave]);

  // Handle publish
  const handlePublish = useCallback(async () => {
    try {
      await actions.publishTemplate();
      onPublish?.(state.template);
    } catch (error) {
      console.error('Failed to publish template:', error);
    }
  }, [actions, state.template, onPublish]);

  // Handle preview
  const handlePreview = useCallback(() => {
    actions.togglePreviewMode();
    onPreview?.(state.template);
  }, [actions, state.template, onPreview]);

  return (
    <div className={`form-builder ${className}`}>
      {/* Header */}
      <div className="form-builder-header bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {state.template.name}
            </h1>
            {state.isDirty && (
              <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAIAssistant(true)}
              className="btn btn-secondary"
              disabled={readOnly}
            >
              <Plus className="w-4 h-4 mr-2" />
              AI Assistant
            </button>
            
            <button
              onClick={handlePreview}
              className="btn btn-secondary"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            
            <button
              onClick={actions.duplicateTemplate}
              className="btn btn-secondary"
              disabled={readOnly}
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </button>
            
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={readOnly || !state.isDirty}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            
            <button
              onClick={handlePublish}
              className="btn btn-success"
              disabled={readOnly || !state.isDirty}
            >
              <Play className="w-4 h-4 mr-2" />
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="form-builder-content flex h-full">
        {/* Field Toolbox */}
        <div className="form-builder-toolbox w-80 bg-gray-50 border-r border-gray-200 p-4">
          <FieldToolbox
            onFieldSelect={(fieldType) => {
              const newField = createField(fieldType, `New ${FIELD_TYPES[fieldType].label}`);
              actions.addField(newField, state.currentSection);
            }}
            readOnly={readOnly}
          />
        </div>

        {/* Form Canvas */}
        <div className="form-builder-canvas flex-1 bg-white p-6 overflow-y-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="space-y-6">
              {/* Sections */}
              <Droppable droppableId="sections" type="section">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4"
                  >
                    <AnimatePresence>
                      {state.template.sections.map((section, sectionIndex) => (
                        <motion.div
                          key={section.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="section-container bg-white border border-gray-200 rounded-lg shadow-sm"
                        >
                          {/* Section Header */}
                          <div className="section-header flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-2">
                              <Draggable draggableId={section.id} index={sectionIndex}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="cursor-move"
                                  >
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </Draggable>
                              
                              <button
                                onClick={() => handleToggleSection(section.id, !section.collapsed)}
                                className="flex items-center space-x-2 text-left"
                              >
                                {section.collapsed ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronUp className="w-4 h-4" />
                                )}
                                <h3 className="font-medium text-gray-900">{section.title}</h3>
                              </button>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditSection(section)}
                                className="btn btn-sm btn-secondary"
                                disabled={readOnly}
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleRemoveSection(section.id)}
                                className="btn btn-sm btn-danger"
                                disabled={readOnly}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Section Content */}
                          {!section.collapsed && (
                            <div className="section-content p-4">
                              {section.description && (
                                <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                              )}
                              
                              {/* Fields */}
                              <Droppable droppableId={`section-${sectionIndex}`} type="field">
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="space-y-4"
                                  >
                                    <AnimatePresence>
                                      {section.fields.map((field, fieldIndex) => (
                                        <motion.div
                                          key={field.id}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: 20 }}
                                          className="field-container bg-gray-50 border border-gray-200 rounded-md p-3"
                                        >
                                          <Draggable draggableId={field.id} index={fieldIndex}>
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`flex items-center justify-between ${
                                                  snapshot.isDragging ? 'opacity-50' : ''
                                                }`}
                                              >
                                                <div
                                                  {...provided.dragHandleProps}
                                                  className="flex items-center space-x-3 flex-1 cursor-move"
                                                >
                                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                                  
                                                  <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                      <span className="text-sm font-medium text-gray-900">
                                                        {field.label}
                                                      </span>
                                                      {field.required && (
                                                        <span className="text-red-500">*</span>
                                                      )}
                                                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                                        {FIELD_TYPES[field.type].label}
                                                      </span>
                                                    </div>
                                                    
                                                    {field.description && (
                                                      <p className="text-xs text-gray-600 mt-1">
                                                        {field.description}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2">
                                                  <button
                                                    onClick={() => handleEditField(field)}
                                                    className="btn btn-sm btn-secondary"
                                                    disabled={readOnly}
                                                  >
                                                    <Settings className="w-4 h-4" />
                                                  </button>
                                                  
                                                  <button
                                                    onClick={() => handleRemoveField(field.id)}
                                                    className="btn btn-sm btn-danger"
                                                    disabled={readOnly}
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                        </motion.div>
                                      ))}
                                    </AnimatePresence>
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Add Section Button */}
              {!readOnly && (
                <motion.button
                  onClick={handleAddSection}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-5 h-5 mx-auto mb-2" />
                  <span className="text-sm font-medium">Add Section</span>
                </motion.button>
              )}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showFieldEditor && editingField && (
          <FieldEditor
            field={editingField}
            onSave={handleSaveField}
            onClose={() => {
              setShowFieldEditor(false);
              setEditingField(null);
            }}
          />
        )}
        
        {showSectionEditor && editingSection && (
          <SectionEditor
            section={editingSection}
            onSave={handleSaveSection}
            onClose={() => {
              setShowSectionEditor(false);
              setEditingSection(null);
            }}
          />
        )}
        
        {showAIAssistant && (
          <AIAssistant
            template={state.template}
            onClose={() => setShowAIAssistant(false)}
            onApplySuggestion={(suggestion) => {
              // Handle AI suggestion application
              console.log('Applying suggestion:', suggestion);
              setShowAIAssistant(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      {state.previewMode && (
        <FormPreview
          template={state.template}
          onClose={() => actions.togglePreviewMode()}
        />
      )}
    </div>
  );
}; 