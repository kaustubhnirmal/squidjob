/**
 * Dynamic Form Builder - Type Definitions
 * Comprehensive type system for the tender management form builder
 */

// Field Types
export type FieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'phone' 
  | 'date' 
  | 'datetime' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'textarea' 
  | 'file' 
  | 'signature' 
  | 'section' 
  | 'repeater';

// Validation Rules
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value?: string | number;
  message: string;
  customValidator?: (value: any) => boolean | string;
}

// Field Configuration
export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  required?: boolean;
  validation?: ValidationRule[];
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  conditional?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
  settings?: {
    min?: number;
    max?: number;
    step?: number;
    rows?: number;
    cols?: number;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    allowedTypes?: string[];
  };
  styling?: {
    width?: string;
    className?: string;
    inline?: boolean;
  };
  metadata?: Record<string, any>;
}

// Form Section
export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  collapsed?: boolean;
  conditional?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
}

// Form Template
export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  version: string;
  sections: FormSection[];
  settings: {
    multiStep: boolean;
    autoSave: boolean;
    allowDraft: boolean;
    requireApproval: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  metadata?: {
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    tenderType?: string;
  };
}

// Form Instance
export interface FormInstance {
  id: string;
  templateId: string;
  data: Record<string, any>;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'archived';
  progress: number;
  currentStep: number;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  comments?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    uploadedAt: string;
  }>;
  auditTrail: Array<{
    action: string;
    timestamp: string;
    userId: string;
    details?: any;
  }>;
  metadata?: Record<string, any>;
}

// Form Builder State
export interface FormBuilderState {
  template: FormTemplate;
  currentSection: number;
  selectedField: string | null;
  previewMode: boolean;
  isDirty: boolean;
  autoSaveEnabled: boolean;
  validationErrors: Record<string, string[]>;
}

// Drag & Drop Types
export interface DragItem {
  type: 'field' | 'section';
  id: string;
  source: 'toolbox' | 'form';
  fieldType?: FieldType;
}

export interface DropResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
}

// AI Suggestions
export interface AISuggestion {
  id: string;
  type: 'field' | 'section' | 'validation';
  title: string;
  description: string;
  confidence: number;
  implementation: {
    field?: Partial<FormField>;
    section?: Partial<FormSection>;
    validation?: ValidationRule;
  };
}

// API Response Types
export interface FormBuilderAPI {
  templates: {
    list: () => Promise<FormTemplate[]>;
    get: (id: string) => Promise<FormTemplate>;
    create: (template: Omit<FormTemplate, 'id'>) => Promise<FormTemplate>;
    update: (id: string, template: Partial<FormTemplate>) => Promise<FormTemplate>;
    delete: (id: string) => Promise<void>;
    duplicate: (id: string) => Promise<FormTemplate>;
  };
  instances: {
    list: () => Promise<FormInstance[]>;
    get: (id: string) => Promise<FormInstance>;
    create: (instance: Omit<FormInstance, 'id'>) => Promise<FormInstance>;
    update: (id: string, instance: Partial<FormInstance>) => Promise<FormInstance>;
    delete: (id: string) => Promise<void>;
    submit: (id: string) => Promise<FormInstance>;
    approve: (id: string, approvedBy: string) => Promise<FormInstance>;
    reject: (id: string, approvedBy: string, comments: string) => Promise<FormInstance>;
  };
  ai: {
    suggestFields: (tenderType: string, context: string) => Promise<AISuggestion[]>;
    parseDocument: (file: File) => Promise<Record<string, any>>;
    validateForm: (template: FormTemplate, data: Record<string, any>) => Promise<ValidationRule[]>;
  };
  files: {
    upload: (file: File, formId: string) => Promise<{ url: string; id: string }>;
    delete: (fileId: string) => Promise<void>;
  };
}

// Component Props
export interface FormBuilderProps {
  template?: FormTemplate;
  onSave?: (template: FormTemplate) => void;
  onPublish?: (template: FormTemplate) => void;
  onPreview?: (template: FormTemplate) => void;
  readOnly?: boolean;
  className?: string;
}

export interface FormRendererProps {
  template: FormTemplate;
  data?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => void;
  onSave?: (data: Record<string, any>) => void;
  readOnly?: boolean;
  className?: string;
}

// Hook Return Types
export interface UseFormBuilderReturn {
  state: FormBuilderState;
  actions: {
    addField: (field: FormField, sectionIndex: number) => void;
    updateField: (fieldId: string, updates: Partial<FormField>) => void;
    removeField: (fieldId: string) => void;
    addSection: (section: FormSection) => void;
    updateSection: (sectionId: string, updates: Partial<FormSection>) => void;
    removeSection: (sectionId: string) => void;
    moveField: (fieldId: string, fromSection: number, toSection: number, toIndex: number) => void;
    setCurrentSection: (index: number) => void;
    setSelectedField: (fieldId: string | null) => void;
    togglePreviewMode: () => void;
    saveTemplate: () => Promise<void>;
    publishTemplate: () => Promise<void>;
    duplicateTemplate: () => Promise<void>;
    validateTemplate: () => ValidationRule[];
  };
}

export interface UseFormRendererReturn {
  formData: Record<string, any>;
  errors: Record<string, string[]>;
  isValid: boolean;
  isSubmitting: boolean;
  actions: {
    setFieldValue: (fieldId: string, value: any) => void;
    validateField: (fieldId: string) => string[];
    validateForm: () => boolean;
    submitForm: () => Promise<void>;
    saveDraft: () => Promise<void>;
    resetForm: () => void;
  };
}

// Utility Types
export type FieldValidator = (value: any, field: FormField) => string | null;
export type FormValidator = (data: Record<string, any>, template: FormTemplate) => Record<string, string[]>;

// Event Types
export interface FormBuilderEvents {
  onFieldAdded: (field: FormField, sectionIndex: number) => void;
  onFieldUpdated: (fieldId: string, updates: Partial<FormField>) => void;
  onFieldRemoved: (fieldId: string) => void;
  onSectionAdded: (section: FormSection) => void;
  onSectionUpdated: (sectionId: string, updates: Partial<FormSection>) => void;
  onSectionRemoved: (sectionId: string) => void;
  onTemplateSaved: (template: FormTemplate) => void;
  onTemplatePublished: (template: FormTemplate) => void;
}

export interface FormRendererEvents {
  onFieldChange: (fieldId: string, value: any) => void;
  onSectionComplete: (sectionId: string) => void;
  onFormSubmit: (data: Record<string, any>) => void;
  onFormSave: (data: Record<string, any>) => void;
  onValidationError: (errors: Record<string, string[]>) => void;
}

// Theme and Styling
export interface FormBuilderTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
}

// Performance and Analytics
export interface FormBuilderMetrics {
  renderTime: number;
  validationTime: number;
  saveTime: number;
  fieldCount: number;
  sectionCount: number;
  validationErrors: number;
  userInteractions: Array<{
    action: string;
    timestamp: number;
    details?: any;
  }>;
}

// Accessibility
export interface AccessibilityConfig {
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  ariaLabels: Record<string, string>;
  focusManagement: 'auto' | 'manual';
}

// Configuration
export interface FormBuilderConfig {
  theme: FormBuilderTheme;
  accessibility: AccessibilityConfig;
  autoSave: {
    enabled: boolean;
    interval: number; // milliseconds
    maxRetries: number;
  };
  validation: {
    realTime: boolean;
    debounceMs: number;
    showErrors: 'immediate' | 'onBlur' | 'onSubmit';
  };
  fileUpload: {
    maxSize: number; // MB
    allowedTypes: string[];
    multiple: boolean;
    autoUpload: boolean;
  };
  ai: {
    enabled: boolean;
    suggestions: boolean;
    autoComplete: boolean;
    documentParsing: boolean;
  };
  performance: {
    virtualScrolling: boolean;
    lazyLoading: boolean;
    debounceUpdates: boolean;
  };
} 