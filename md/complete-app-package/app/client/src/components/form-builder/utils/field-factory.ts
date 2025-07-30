/**
 * Field Factory Utility
 * Generates field configurations and components for the form builder
 */

import { nanoid } from 'nanoid';
import { 
  FormField, 
  FieldType, 
  ValidationRule,
  FormBuilderTheme 
} from '../types';

// Field type configurations
export const FIELD_TYPES: Record<FieldType, {
  label: string;
  icon: string;
  description: string;
  defaultSettings: Partial<FormField>;
  validationOptions: Array<{
    type: ValidationRule['type'];
    label: string;
    description: string;
    defaultValue?: any;
  }>;
}> = {
  text: {
    label: 'Text Input',
    icon: 'Type',
    description: 'Single line text input',
    defaultSettings: {
      placeholder: 'Enter text...',
      settings: {
        min: undefined,
        max: undefined
      }
    },
    validationOptions: [
      { type: 'required', label: 'Required', description: 'Field must be filled' },
      { type: 'min', label: 'Minimum Length', description: 'Minimum number of characters', defaultValue: 1 },
      { type: 'max', label: 'Maximum Length', description: 'Maximum number of characters', defaultValue: 255 },
      { type: 'pattern', label: 'Pattern', description: 'Custom regex pattern' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  },
  number: {
    label: 'Number Input',
    icon: 'Hash',
    description: 'Numeric input with optional min/max',
    defaultSettings: {
      placeholder: 'Enter number...',
      settings: {
        min: undefined,
        max: undefined,
        step: 1
      }
    },
    validationOptions: [
      { type: 'required', label: 'Required', description: 'Field must be filled' },
      { type: 'min', label: 'Minimum Value', description: 'Minimum allowed value' },
      { type: 'max', label: 'Maximum Value', description: 'Maximum allowed value' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  },
  email: {
    label: 'Email Input',
    icon: 'Mail',
    description: 'Email address input with validation',
    defaultSettings: {
      placeholder: 'Enter email address...',
      settings: {}
    },
    validationOptions: [
      { type: 'required', label: 'Required', description: 'Field must be filled' },
      { type: 'email', label: 'Email Format', description: 'Must be valid email format' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  },
  phone: {
    label: 'Phone Input',
    icon: 'Phone',
    description: 'Phone number input with formatting',
    defaultSettings: {
      placeholder: 'Enter phone number...',
      settings: {}
    },
    validationOptions: [
      { type: 'required', label: 'Required', description: 'Field must be filled' },
      { type: 'pattern', label: 'Phone Pattern', description: 'Custom phone number pattern' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  },
  date: {
    label: 'Date Input',
    icon: 'Calendar',
    description: 'Date picker input',
    defaultSettings: {
      placeholder: 'Select date...',
      settings: {}
    },
    validationOptions: [
      { type: 'required', label: 'Required', description: 'Field must be filled' },
      { type: 'min', label: 'Minimum Date', description: 'Earliest allowed date' },
      { type: 'max', label: 'Maximum Date', description: 'Latest allowed date' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  },
  datetime: {
    label: 'Date & Time Input',
    icon: 'Clock',
    description: 'Date and time picker input',
    defaultSettings: {
      placeholder: 'Select date and time...',
      settings: {}
    },
    validationOptions: [
      { type: 'required', label: 'Required', description: 'Field must be filled' },
      { type: 'min', label: 'Minimum DateTime', description: 'Earliest allowed date/time' },
      { type: 'max', label: 'Maximum DateTime', description: 'Latest allowed date/time' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  },
  select: {
    label: 'Dropdown Select',
    icon: 'ChevronDown',
    description: 'Single choice dropdown',
    defaultSettings: {
      placeholder: 'Select an option...',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ],
      settings: {}
    },
    validationOptions: [
      { type: 'required', label: 'Required', description: 'Field must be filled' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  },
  multiselect: {
    label: 'Multi-Select',
    icon: 'List',
    description: 'Multiple choice dropdown',
    defaultSettings: {
      placeholder: 'Select options...',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ],
      settings: {}
    },
    validationOptions: [
      { type: 'required', label: 'Required', description: 'Field must be filled' },
      { type: 'min', label: 'Minimum Selections', description: 'Minimum number of selections' },
      { type: 'max', label: 'Maximum Selections', description: 'Maximum number of selections' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  },
  checkbox: {
    label: 'Checkbox',
    icon: 'CheckSquare',
    description: 'Single checkbox input',
    defaultSettings: {
      defaultValue: false,
      settings: {}
    },
    validationOptions: [
      { type: 'required', label: 'Required', description: 'Field must be checked' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  },
  radio: {
    label: 'Radio Group',
    icon: 'Circle',
    description: 'Radio button group',
    defaultSettings: {
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ],
      settings: {}
    },
    validationOptions: [
      { type: 'required', label: 'Required', description: 'Field must be filled' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  },
  textarea: {
    label: 'Text Area',
    icon: 'AlignLeft',
    description: 'Multi-line text input',
    defaultSettings: {
      placeholder: 'Enter text...',
      settings: {
        rows: 4,
        cols: 50
      }
    },
    validationOptions: [
      { type: 'required', label: 'Required', description: 'Field must be filled' },
      { type: 'min', label: 'Minimum Length', description: 'Minimum number of characters' },
      { type: 'max', label: 'Maximum Length', description: 'Maximum number of characters' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  },
  file: {
    label: 'File Upload',
    icon: 'Upload',
    description: 'File upload input',
    defaultSettings: {
      placeholder: 'Choose file...',
      settings: {
        accept: '.pdf,.doc,.docx,.xls,.xlsx',
        multiple: false,
        maxSize: 10,
        allowedTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
      }
    },
    validationOptions: [
      { type: 'required', label: 'Required', description: 'Field must be filled' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  },
  signature: {
    label: 'Digital Signature',
    icon: 'PenTool',
    description: 'Digital signature pad',
    defaultSettings: {
      settings: {}
    },
    validationOptions: [
      { type: 'required', label: 'Required', description: 'Signature must be provided' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  },
  section: {
    label: 'Section Header',
    icon: 'Folder',
    description: 'Section divider with title',
    defaultSettings: {
      settings: {}
    },
    validationOptions: []
  },
  repeater: {
    label: 'Repeater Field',
    icon: 'Copy',
    description: 'Repeatable field group',
    defaultSettings: {
      settings: {
        min: 1,
        max: 10
      }
    },
    validationOptions: [
      { type: 'min', label: 'Minimum Items', description: 'Minimum number of items' },
      { type: 'max', label: 'Maximum Items', description: 'Maximum number of items' },
      { type: 'custom', label: 'Custom Validation', description: 'Custom validation function' }
    ]
  }
};

// Create a new field
export const createField = (
  type: FieldType,
  label: string,
  options?: Partial<FormField>
): FormField => {
  const fieldConfig = FIELD_TYPES[type];
  
  return {
    id: nanoid(),
    type,
    label,
    required: false,
    validation: [],
    ...fieldConfig.defaultSettings,
    ...options
  };
};

// Create a new section
export const createSection = (
  title: string,
  description?: string,
  options?: Partial<FormField>
): FormField => {
  return {
    id: nanoid(),
    type: 'section',
    label: title,
    description,
    required: false,
    validation: [],
    settings: {},
    ...options
  };
};

// Generate field preview component
export const getFieldPreview = (field: FormField, theme?: FormBuilderTheme) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
  const errorClasses = 'border-red-500 focus:ring-red-500';
  const successClasses = 'border-green-500 focus:ring-green-500';
  
  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
      return (
        <input
          type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
          placeholder={field.placeholder}
          className={baseClasses}
          disabled
        />
      );
      
    case 'number':
      return (
        <input
          type="number"
          placeholder={field.placeholder}
          min={field.settings?.min}
          max={field.settings?.max}
          step={field.settings?.step}
          className={baseClasses}
          disabled
        />
      );
      
    case 'date':
      return (
        <input
          type="date"
          className={baseClasses}
          disabled
        />
      );
      
    case 'datetime':
      return (
        <input
          type="datetime-local"
          className={baseClasses}
          disabled
        />
      );
      
    case 'select':
      return (
        <select className={baseClasses} disabled>
          <option value="">{field.placeholder}</option>
          {field.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
      
    case 'multiselect':
      return (
        <select className={baseClasses} multiple disabled>
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
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled
          />
          <span className="ml-2 text-sm text-gray-600">{field.label}</span>
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
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                disabled
              />
              <span className="ml-2 text-sm text-gray-600">{option.label}</span>
            </div>
          ))}
        </div>
      );
      
    case 'textarea':
      return (
        <textarea
          placeholder={field.placeholder}
          rows={field.settings?.rows || 4}
          cols={field.settings?.cols || 50}
          className={baseClasses}
          disabled
        />
      );
      
    case 'file':
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-1 text-sm">{field.placeholder}</p>
          </div>
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
      
    case 'repeater':
      return (
        <div className="border border-gray-300 rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Repeater Field</span>
            <button className="text-sm text-blue-600 hover:text-blue-800" disabled>
              Add Item
            </button>
          </div>
          <div className="text-sm text-gray-500">Dynamic field group</div>
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

// Get field icon
export const getFieldIcon = (type: FieldType): string => {
  return FIELD_TYPES[type]?.icon || 'Square';
};

// Get field description
export const getFieldDescription = (type: FieldType): string => {
  return FIELD_TYPES[type]?.description || 'Unknown field type';
};

// Get validation options for field type
export const getValidationOptions = (type: FieldType) => {
  return FIELD_TYPES[type]?.validationOptions || [];
};

// Create validation rule
export const createValidationRule = (
  type: ValidationRule['type'],
  message: string,
  value?: string | number,
  customValidator?: (value: any) => boolean | string
): ValidationRule => {
  return {
    type,
    message,
    value,
    customValidator
  };
};

// Common validation rules
export const COMMON_VALIDATION_RULES: Record<string, ValidationRule> = {
  required: createValidationRule('required', 'This field is required'),
  email: createValidationRule('email', 'Please enter a valid email address'),
  url: createValidationRule('url', 'Please enter a valid URL'),
  phone: createValidationRule('pattern', 'Please enter a valid phone number', '^[+]?[0-9\\s\\-\\(\\)]{10,}$'),
  minLength: createValidationRule('min', 'Minimum length not met', 1),
  maxLength: createValidationRule('max', 'Maximum length exceeded', 255)
};

// Field templates for common tender fields
export const TENDER_FIELD_TEMPLATES: Record<string, FormField> = {
  companyName: createField('text', 'Company Name', {
    required: true,
    placeholder: 'Enter your company name',
    validation: [COMMON_VALIDATION_RULES.required]
  }),
  
  contactPerson: createField('text', 'Contact Person', {
    required: true,
    placeholder: 'Enter contact person name',
    validation: [COMMON_VALIDATION_RULES.required]
  }),
  
  email: createField('email', 'Email Address', {
    required: true,
    placeholder: 'Enter email address',
    validation: [COMMON_VALIDATION_RULES.required, COMMON_VALIDATION_RULES.email]
  }),
  
  phone: createField('phone', 'Phone Number', {
    required: true,
    placeholder: 'Enter phone number',
    validation: [COMMON_VALIDATION_RULES.required, COMMON_VALIDATION_RULES.phone]
  }),
  
  address: createField('textarea', 'Company Address', {
    required: true,
    placeholder: 'Enter complete company address',
    settings: { rows: 3 },
    validation: [COMMON_VALIDATION_RULES.required]
  }),
  
  tenderValue: createField('number', 'Tender Value', {
    required: true,
    placeholder: 'Enter tender value',
    settings: { min: 0, step: 0.01 },
    validation: [COMMON_VALIDATION_RULES.required, createValidationRule('min', 'Value must be positive', 0)]
  }),
  
  submissionDeadline: createField('date', 'Submission Deadline', {
    required: true,
    validation: [COMMON_VALIDATION_RULES.required]
  }),
  
  tenderType: createField('select', 'Tender Type', {
    required: true,
    options: [
      { value: 'goods', label: 'Goods' },
      { value: 'services', label: 'Services' },
      { value: 'works', label: 'Works' },
      { value: 'consultancy', label: 'Consultancy' }
    ],
    validation: [COMMON_VALIDATION_RULES.required]
  }),
  
  experience: createField('number', 'Years of Experience', {
    required: true,
    placeholder: 'Enter years of experience',
    settings: { min: 0, max: 100 },
    validation: [COMMON_VALIDATION_RULES.required, createValidationRule('min', 'Experience must be positive', 0)]
  }),
  
  documents: createField('file', 'Supporting Documents', {
    required: true,
    placeholder: 'Upload supporting documents',
    settings: {
      multiple: true,
      accept: '.pdf,.doc,.docx,.xls,.xlsx',
      maxSize: 10
    },
    validation: [COMMON_VALIDATION_RULES.required]
  }),
  
  signature: createField('signature', 'Digital Signature', {
    required: true,
    validation: [COMMON_VALIDATION_RULES.required]
  })
};

// Section templates
export const TENDER_SECTION_TEMPLATES: Record<string, { title: string; description: string; fields: string[] }> = {
  basicInfo: {
    title: 'Basic Information',
    description: 'Enter your company and contact information',
    fields: ['companyName', 'contactPerson', 'email', 'phone', 'address']
  },
  
  tenderDetails: {
    title: 'Tender Details',
    description: 'Provide tender-specific information',
    fields: ['tenderType', 'tenderValue', 'submissionDeadline']
  },
  
  experience: {
    title: 'Experience & Qualifications',
    description: 'Demonstrate your experience and qualifications',
    fields: ['experience']
  },
  
  documents: {
    title: 'Supporting Documents',
    description: 'Upload required supporting documents',
    fields: ['documents']
  },
  
  declaration: {
    title: 'Declaration',
    description: 'Confirm and sign your submission',
    fields: ['signature']
  }
}; 