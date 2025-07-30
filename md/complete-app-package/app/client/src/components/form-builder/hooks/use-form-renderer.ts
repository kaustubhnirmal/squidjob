/**
 * Form Renderer Hook
 * Manages form data, validation, and submission for rendered forms
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FormTemplate, 
  FormField, 
  ValidationRule,
  UseFormRendererReturn,
  FormBuilderAPI 
} from '../types';

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

// Check conditional field visibility
const isFieldVisible = (field: FormField, formData: Record<string, any>): boolean => {
  if (!field.conditional) return true;
  
  const { field: dependentField, operator, value } = field.conditional;
  const dependentValue = formData[dependentField];
  
  switch (operator) {
    case 'equals':
      return dependentValue === value;
    case 'not_equals':
      return dependentValue !== value;
    case 'contains':
      return typeof dependentValue === 'string' && dependentValue.includes(value);
    case 'greater_than':
      return typeof dependentValue === 'number' && dependentValue > value;
    case 'less_than':
      return typeof dependentValue === 'number' && dependentValue < value;
    default:
      return true;
  }
};

// Check section visibility
const isSectionVisible = (section: any, formData: Record<string, any>): boolean => {
  if (!section.conditional) return true;
  
  const { field, operator, value } = section.conditional;
  const fieldValue = formData[field];
  
  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'not_equals':
      return fieldValue !== value;
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(value);
    case 'greater_than':
      return typeof fieldValue === 'number' && fieldValue > value;
    case 'less_than':
      return typeof fieldValue === 'number' && fieldValue < value;
    default:
      return true;
  }
};

// Calculate form progress
const calculateProgress = (template: FormTemplate, formData: Record<string, any>): number => {
  let totalFields = 0;
  let completedFields = 0;
  
  template.sections.forEach(section => {
    if (!isSectionVisible(section, formData)) return;
    
    section.fields.forEach(field => {
      if (!isFieldVisible(field, formData)) return;
      
      totalFields++;
      const value = formData[field.id];
      
      if (field.required) {
        if (value !== undefined && value !== null && value !== '') {
          completedFields++;
        }
      } else if (value !== undefined && value !== null && value !== '') {
        completedFields++;
      }
    });
  });
  
  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
};

// Main hook
export const useFormRenderer = (
  template: FormTemplate,
  initialData?: Record<string, any>,
  api?: FormBuilderAPI,
  config?: {
    autoSave?: boolean;
    autoSaveInterval?: number;
    validateOnChange?: boolean;
  }
): UseFormRendererReturn => {
  const queryClient = useQueryClient();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  
  // Initialize form data
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Calculate initial progress
  useEffect(() => {
    setProgress(calculateProgress(template, formData));
  }, [template, formData]);
  
  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!api || !config?.autoSave) return;
    
    try {
      const formDataString = JSON.stringify(formData);
      if (formDataString !== lastSavedRef.current) {
        // Create or update form instance
        const instance = {
          templateId: template.id,
          data: formData,
          status: 'draft' as const,
          progress,
          currentStep: 0,
          auditTrail: [{
            action: 'auto_save',
            timestamp: new Date().toISOString(),
            userId: 'current-user',
            details: { progress }
          }]
        };
        
        await api.instances.create(instance);
        lastSavedRef.current = formDataString;
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [formData, template.id, progress, api, config?.autoSave]);
  
  // Set up auto-save interval
  useEffect(() => {
    if (!config?.autoSave) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(autoSave, config.autoSaveInterval || 30000);
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, autoSave, config?.autoSave, config?.autoSaveInterval]);
  
  // Mutations
  const submitMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      if (api) {
        const instance = {
          templateId: template.id,
          data,
          status: 'submitted' as const,
          progress: 100,
          currentStep: 0,
          submittedAt: new Date().toISOString(),
          auditTrail: [{
            action: 'submit',
            timestamp: new Date().toISOString(),
            userId: 'current-user'
          }]
        };
        
        return await api.instances.create(instance);
      }
      return { id: 'local-submission', data };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['form-instances'] });
    },
    onError: (error) => {
      console.error('Failed to submit form:', error);
    }
  });
  
  const saveDraftMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      if (api) {
        const instance = {
          templateId: template.id,
          data,
          status: 'draft' as const,
          progress,
          currentStep: 0,
          auditTrail: [{
            action: 'save_draft',
            timestamp: new Date().toISOString(),
            userId: 'current-user',
            details: { progress }
          }]
        };
        
        return await api.instances.create(instance);
      }
      return { id: 'local-draft', data };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['form-instances'] });
    }
  });
  
  // Field validation
  const validateField = useCallback((fieldId: string): string[] => {
    const field = template.sections
      .flatMap(section => section.fields)
      .find(f => f.id === fieldId);
    
    if (!field) return [];
    
    const value = formData[fieldId];
    return validateField(field, value);
  }, [template, formData]);
  
  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string[]> = {};
    let isValid = true;
    
    template.sections.forEach(section => {
      if (!isSectionVisible(section, formData)) return;
      
      section.fields.forEach(field => {
        if (!isFieldVisible(field, formData)) return;
        
        const fieldErrors = validateField(field, formData[field.id]);
        if (fieldErrors.length > 0) {
          newErrors[field.id] = fieldErrors;
          isValid = false;
        }
      });
    });
    
    setErrors(newErrors);
    return isValid;
  }, [template, formData]);
  
  // Set field value
  const setFieldValue = useCallback((fieldId: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [fieldId]: value };
      
      // Update progress
      const newProgress = calculateProgress(template, newData);
      setProgress(newProgress);
      
      return newData;
    });
    
    // Clear field errors when value changes
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
    
    // Validate field on change if enabled
    if (config?.validateOnChange) {
      const fieldErrors = validateField(fieldId);
      if (fieldErrors.length > 0) {
        setErrors(prev => ({
          ...prev,
          [fieldId]: fieldErrors
        }));
      }
    }
  }, [template, errors, config?.validateOnChange, validateField]);
  
  // Submit form
  const submitForm = useCallback(async () => {
    if (!validateForm()) {
      throw new Error('Form validation failed');
    }
    
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, submitMutation]);
  
  // Save draft
  const saveDraft = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await saveDraftMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, saveDraftMutation]);
  
  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData || {});
    setErrors({});
    setProgress(calculateProgress(template, initialData || {}));
  }, [initialData, template]);
  
  // Check if form is valid
  const isValid = Object.keys(errors).length === 0 && validateForm();
  
  return {
    formData,
    errors,
    isValid,
    isSubmitting,
    actions: {
      setFieldValue,
      validateField,
      validateForm,
      submitForm,
      saveDraft,
      resetForm
    }
  };
}; 