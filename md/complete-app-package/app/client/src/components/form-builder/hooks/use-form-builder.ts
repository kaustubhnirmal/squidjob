/**
 * Form Builder Hook
 * Manages the state and actions for the dynamic form builder
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { 
  FormBuilderState, 
  FormTemplate, 
  FormField, 
  FormSection, 
  ValidationRule,
  UseFormBuilderReturn,
  FormBuilderAPI 
} from '../types';

// Default template structure
const createDefaultTemplate = (): FormTemplate => ({
  id: nanoid(),
  name: 'New Form Template',
  description: '',
  category: 'tender',
  version: '1.0.0',
  sections: [
    {
      id: nanoid(),
      title: 'Basic Information',
      description: 'Enter the basic information for this tender',
      fields: [],
      collapsed: false
    }
  ],
  settings: {
    multiStep: false,
    autoSave: true,
    allowDraft: true,
    requireApproval: false,
    maxFileSize: 10,
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
  },
  metadata: {
    createdBy: 'current-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    tenderType: 'general'
  }
});

// Validation functions
const validateField = (field: FormField, value: any): string[] => {
  const errors: string[] = [];
  
  if (!field.validation) return errors;
  
  field.validation.forEach(rule => {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push(rule.message);
        }
        break;
      case 'min':
        if (rule.value !== undefined && value < rule.value) {
          errors.push(rule.message);
        }
        break;
      case 'max':
        if (rule.value !== undefined && value > rule.value) {
          errors.push(rule.message);
        }
        break;
      case 'pattern':
        if (rule.value && typeof value === 'string' && !new RegExp(rule.value).test(value)) {
          errors.push(rule.message);
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(rule.message);
        }
        break;
      case 'url':
        if (value && !/^https?:\/\/.+/.test(value)) {
          errors.push(rule.message);
        }
        break;
      case 'custom':
        if (rule.customValidator) {
          const result = rule.customValidator(value);
          if (result === false || (typeof result === 'string' && result)) {
            errors.push(rule.message || result);
          }
        }
        break;
    }
  });
  
  return errors;
};

const validateTemplate = (template: FormTemplate): ValidationRule[] => {
  const errors: ValidationRule[] = [];
  
  if (!template.name.trim()) {
    errors.push({
      type: 'required',
      message: 'Template name is required'
    });
  }
  
  if (template.sections.length === 0) {
    errors.push({
      type: 'required',
      message: 'At least one section is required'
    });
  }
  
  template.sections.forEach((section, sectionIndex) => {
    if (!section.title.trim()) {
      errors.push({
        type: 'required',
        message: `Section ${sectionIndex + 1} title is required`
      });
    }
    
    section.fields.forEach((field, fieldIndex) => {
      if (!field.label.trim()) {
        errors.push({
          type: 'required',
          message: `Field ${fieldIndex + 1} in section "${section.title}" label is required`
        });
      }
      
      if (field.validation) {
        field.validation.forEach(rule => {
          if (!rule.message.trim()) {
            errors.push({
              type: 'required',
              message: `Validation rule for field "${field.label}" is missing a message`
            });
          }
        });
      }
    });
  });
  
  return errors;
};

// Auto-save functionality
const useAutoSave = (
  template: FormTemplate,
  onSave: (template: FormTemplate) => Promise<void>,
  enabled: boolean = true,
  interval: number = 30000
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  
  const saveTemplate = useCallback(async () => {
    try {
      const templateString = JSON.stringify(template);
      if (templateString !== lastSavedRef.current) {
        await onSave(template);
        lastSavedRef.current = templateString;
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [template, onSave]);
  
  useEffect(() => {
    if (!enabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(saveTemplate, interval);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [template, enabled, interval, saveTemplate]);
  
  return { saveTemplate };
};

// Main hook
export const useFormBuilder = (
  initialTemplate?: FormTemplate,
  api?: FormBuilderAPI,
  config?: {
    autoSave?: boolean;
    autoSaveInterval?: number;
  }
): UseFormBuilderReturn => {
  const queryClient = useQueryClient();
  
  // Initialize state
  const [state, setState] = useState<FormBuilderState>({
    template: initialTemplate || createDefaultTemplate(),
    currentSection: 0,
    selectedField: null,
    previewMode: false,
    isDirty: false,
    autoSaveEnabled: config?.autoSave ?? true,
    validationErrors: {}
  });
  
  // Auto-save functionality
  const { saveTemplate: autoSaveTemplate } = useAutoSave(
    state.template,
    async (template) => {
      if (api) {
        await api.templates.update(template.id, template);
      }
    },
    state.autoSaveEnabled,
    config?.autoSaveInterval ?? 30000
  );
  
  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (template: FormTemplate) => {
      if (api) {
        return await api.templates.update(template.id, template);
      }
      return template;
    },
    onSuccess: (updatedTemplate) => {
      setState(prev => ({
        ...prev,
        template: updatedTemplate,
        isDirty: false
      }));
      queryClient.invalidateQueries({ queryKey: ['form-templates'] });
    },
    onError: (error) => {
      console.error('Failed to save template:', error);
    }
  });
  
  const publishMutation = useMutation({
    mutationFn: async (template: FormTemplate) => {
      if (api) {
        return await api.templates.update(template.id, {
          ...template,
          metadata: {
            ...template.metadata,
            publishedAt: new Date().toISOString()
          }
        });
      }
      return template;
    },
    onSuccess: (updatedTemplate) => {
      setState(prev => ({
        ...prev,
        template: updatedTemplate,
        isDirty: false
      }));
      queryClient.invalidateQueries({ queryKey: ['form-templates'] });
    }
  });
  
  const duplicateMutation = useMutation({
    mutationFn: async (template: FormTemplate) => {
      const duplicated = {
        ...template,
        id: nanoid(),
        name: `${template.name} (Copy)`,
        metadata: {
          ...template.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          duplicatedFrom: template.id
        }
      };
      
      if (api) {
        return await api.templates.create(duplicated);
      }
      return duplicated;
    },
    onSuccess: (duplicatedTemplate) => {
      setState(prev => ({
        ...prev,
        template: duplicatedTemplate,
        isDirty: false
      }));
      queryClient.invalidateQueries({ queryKey: ['form-templates'] });
    }
  });
  
  // Action handlers
  const addField = useCallback((field: FormField, sectionIndex: number) => {
    setState(prev => {
      const newTemplate = { ...prev.template };
      const section = newTemplate.sections[sectionIndex];
      
      if (section) {
        section.fields.push(field);
      }
      
      return {
        ...prev,
        template: newTemplate,
        isDirty: true,
        selectedField: field.id
      };
    });
  }, []);
  
  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setState(prev => {
      const newTemplate = { ...prev.template };
      
      for (const section of newTemplate.sections) {
        const fieldIndex = section.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex !== -1) {
          section.fields[fieldIndex] = { ...section.fields[fieldIndex], ...updates };
          break;
        }
      }
      
      return {
        ...prev,
        template: newTemplate,
        isDirty: true
      };
    });
  }, []);
  
  const removeField = useCallback((fieldId: string) => {
    setState(prev => {
      const newTemplate = { ...prev.template };
      
      for (const section of newTemplate.sections) {
        const fieldIndex = section.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex !== -1) {
          section.fields.splice(fieldIndex, 1);
          break;
        }
      }
      
      return {
        ...prev,
        template: newTemplate,
        isDirty: true,
        selectedField: prev.selectedField === fieldId ? null : prev.selectedField
      };
    });
  }, []);
  
  const addSection = useCallback((section: FormSection) => {
    setState(prev => ({
      ...prev,
      template: {
        ...prev.template,
        sections: [...prev.template.sections, section]
      },
      isDirty: true,
      currentSection: prev.template.sections.length
    }));
  }, []);
  
  const updateSection = useCallback((sectionId: string, updates: Partial<FormSection>) => {
    setState(prev => {
      const newTemplate = { ...prev.template };
      const sectionIndex = newTemplate.sections.findIndex(s => s.id === sectionId);
      
      if (sectionIndex !== -1) {
        newTemplate.sections[sectionIndex] = {
          ...newTemplate.sections[sectionIndex],
          ...updates
        };
      }
      
      return {
        ...prev,
        template: newTemplate,
        isDirty: true
      };
    });
  }, []);
  
  const removeSection = useCallback((sectionId: string) => {
    setState(prev => {
      const newTemplate = { ...prev.template };
      const sectionIndex = newTemplate.sections.findIndex(s => s.id === sectionId);
      
      if (sectionIndex !== -1) {
        newTemplate.sections.splice(sectionIndex, 1);
      }
      
      return {
        ...prev,
        template: newTemplate,
        isDirty: true,
        currentSection: Math.min(prev.currentSection, newTemplate.sections.length - 1)
      };
    });
  }, []);
  
  const moveField = useCallback((
    fieldId: string, 
    fromSection: number, 
    toSection: number, 
    toIndex: number
  ) => {
    setState(prev => {
      const newTemplate = { ...prev.template };
      
      // Find and remove field from source section
      const sourceSection = newTemplate.sections[fromSection];
      const fieldIndex = sourceSection.fields.findIndex(f => f.id === fieldId);
      
      if (fieldIndex !== -1) {
        const [field] = sourceSection.fields.splice(fieldIndex, 1);
        
        // Add field to destination section
        const destSection = newTemplate.sections[toSection];
        destSection.fields.splice(toIndex, 0, field);
      }
      
      return {
        ...prev,
        template: newTemplate,
        isDirty: true
      };
    });
  }, []);
  
  const setCurrentSection = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentSection: index
    }));
  }, []);
  
  const setSelectedField = useCallback((fieldId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedField: fieldId
    }));
  }, []);
  
  const togglePreviewMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      previewMode: !prev.previewMode
    }));
  }, []);
  
  const saveTemplate = useCallback(async () => {
    await saveMutation.mutateAsync(state.template);
  }, [state.template, saveMutation]);
  
  const publishTemplate = useCallback(async () => {
    await publishMutation.mutateAsync(state.template);
  }, [state.template, publishMutation]);
  
  const duplicateTemplate = useCallback(async () => {
    await duplicateMutation.mutateAsync(state.template);
  }, [state.template, duplicateMutation]);
  
  const validateTemplate = useCallback(() => {
    return validateTemplate(state.template);
  }, [state.template]);
  
  // Update template metadata when dirty
  useEffect(() => {
    if (state.isDirty) {
      setState(prev => ({
        ...prev,
        template: {
          ...prev.template,
          metadata: {
            ...prev.template.metadata,
            updatedAt: new Date().toISOString()
          }
        }
      }));
    }
  }, [state.isDirty]);
  
  return {
    state,
    actions: {
      addField,
      updateField,
      removeField,
      addSection,
      updateSection,
      removeSection,
      moveField,
      setCurrentSection,
      setSelectedField,
      togglePreviewMode,
      saveTemplate,
      publishTemplate,
      duplicateTemplate,
      validateTemplate
    }
  };
}; 