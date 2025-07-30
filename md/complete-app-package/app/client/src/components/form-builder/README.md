# Dynamic Form Builder Component

A comprehensive, feature-rich form builder component for creating dynamic forms with drag & drop functionality, AI-powered suggestions, and advanced validation.

## 🚀 Features

### Core Features
- **Drag & Drop Form Building**: Intuitive interface for creating forms by dragging fields from toolbox
- **Multiple Field Types**: Text, number, email, phone, date, select, checkbox, radio, textarea, file upload, signature, and more
- **Real-time Validation**: Custom validation rules with immediate feedback
- **Auto-save Functionality**: Automatic saving with optimistic updates
- **Multi-step Forms**: Support for multi-step form workflows with progress tracking
- **Template System**: Save and load form templates
- **Live Preview**: Real-time preview of forms being built

### Advanced Capabilities
- **AI-powered Suggestions**: Intelligent field suggestions based on form context
- **Conditional Logic**: Show/hide fields and sections based on other field values
- **Bulk Data Import**: Import data from Excel/CSV files
- **Document Parsing**: Auto-populate forms from uploaded documents
- **Version Control**: Track changes and manage form versions
- **Approval Workflows**: Digital signatures and approval processes
- **Audit Trail**: Complete change tracking and history

### UI/UX Requirements
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Professional Styling**: Modern, clean interface with smooth animations
- **Contextual Help**: Tooltips and help text for better user experience
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader Compatible**: WCAG 2.1 AA compliance
- **Dark Mode Support**: Toggle between light and dark themes

## 📦 Installation

### Dependencies

Add the following dependencies to your `package.json`:

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-beautiful-dnd": "^13.1.1",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.263.1",
    "@tanstack/react-query": "^4.29.0",
    "react-hook-form": "^7.45.0",
    "zod": "^3.22.0",
    "nanoid": "^4.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

### CSS Requirements

Import Tailwind CSS or include the required styles:

```css
/* Form Builder Styles */
.form-builder {
  @apply relative;
}

.form-builder-header {
  @apply bg-white border-b border-gray-200;
}

.form-builder-content {
  @apply flex h-full;
}

.form-builder-toolbox {
  @apply w-80 bg-gray-50 border-r border-gray-200;
}

.form-builder-canvas {
  @apply flex-1 bg-white overflow-y-auto;
}

/* Button Styles */
.btn {
  @apply px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-white text-gray-700 border border-gray-300 hover:bg-gray-50;
}

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700;
}

.btn-sm {
  @apply px-3 py-1 text-xs;
}
```

## 🎯 Quick Start

### Basic Usage

```tsx
import React from 'react';
import { FormBuilder } from './components/form-builder';

function App() {
  const handleSave = (template) => {
    console.log('Form template saved:', template);
  };

  const handlePublish = (template) => {
    console.log('Form template published:', template);
  };

  return (
    <div className="h-screen">
      <FormBuilder
        onSave={handleSave}
        onPublish={handlePublish}
        className="h-full"
      />
    </div>
  );
}
```

### With API Integration

```tsx
import React from 'react';
import { FormBuilder } from './components/form-builder';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const api = {
  templates: {
    list: () => fetch('/api/templates').then(res => res.json()),
    get: (id) => fetch(`/api/templates/${id}`).then(res => res.json()),
    create: (template) => fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    }).then(res => res.json()),
    update: (id, template) => fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    }).then(res => res.json()),
    delete: (id) => fetch(`/api/templates/${id}`, { method: 'DELETE' }),
    duplicate: (id) => fetch(`/api/templates/${id}/duplicate`, { method: 'POST' })
  },
  instances: {
    list: () => fetch('/api/instances').then(res => res.json()),
    get: (id) => fetch(`/api/instances/${id}`).then(res => res.json()),
    create: (instance) => fetch('/api/instances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(instance)
    }).then(res => res.json()),
    update: (id, instance) => fetch(`/api/instances/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(instance)
    }).then(res => res.json()),
    delete: (id) => fetch(`/api/instances/${id}`, { method: 'DELETE' }),
    submit: (id) => fetch(`/api/instances/${id}/submit`, { method: 'POST' }),
    approve: (id, approvedBy) => fetch(`/api/instances/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy })
    }).then(res => res.json()),
    reject: (id, approvedBy, comments) => fetch(`/api/instances/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy, comments })
    }).then(res => res.json())
  },
  ai: {
    suggestFields: (tenderType, context) => fetch('/api/ai/suggest-fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenderType, context })
    }).then(res => res.json()),
    parseDocument: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch('/api/ai/parse-document', {
        method: 'POST',
        body: formData
      }).then(res => res.json());
    },
    validateForm: (template, data) => fetch('/api/ai/validate-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, data })
    }).then(res => res.json())
  },
  files: {
    upload: (file, formId) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('formId', formId);
      return fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      }).then(res => res.json());
    },
    delete: (fileId) => fetch(`/api/files/${fileId}`, { method: 'DELETE' })
  }
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen">
        <FormBuilder
          api={api}
          onSave={(template) => console.log('Saved:', template)}
          onPublish={(template) => console.log('Published:', template)}
          className="h-full"
        />
      </div>
    </QueryClientProvider>
  );
}
```

## 🧩 Components

### FormBuilder
The main form builder component with drag & drop functionality.

```tsx
<FormBuilder
  template={initialTemplate}
  api={api}
  onSave={handleSave}
  onPublish={handlePublish}
  onPreview={handlePreview}
  readOnly={false}
  className="h-full"
/>
```

### FormRenderer
Renders the actual form for users to fill out.

```tsx
<FormRenderer
  template={template}
  data={initialData}
  onSubmit={handleSubmit}
  onSave={handleSave}
  readOnly={false}
  className="max-w-4xl mx-auto"
/>
```

### FieldToolbox
Displays available field types for drag & drop.

```tsx
<FieldToolbox
  onFieldSelect={handleFieldSelect}
  readOnly={false}
/>
```

### FieldEditor
Modal for editing field properties and validation rules.

```tsx
<FieldEditor
  field={field}
  onSave={handleSaveField}
  onClose={handleClose}
/>
```

### AIAssistant
Provides intelligent suggestions for form building.

```tsx
<AIAssistant
  template={template}
  onClose={handleClose}
  onApplySuggestion={handleApplySuggestion}
/>
```

## 🎣 Hooks

### useFormBuilder
Manages the form builder state and actions.

```tsx
const { state, actions } = useFormBuilder(initialTemplate, api, config);
```

### useFormRenderer
Manages form data, validation, and submission.

```tsx
const { formData, errors, isValid, isSubmitting, actions } = useFormRenderer(
  template,
  initialData,
  api,
  config
);
```

## 🔧 Configuration

### FormBuilderConfig

```tsx
const config = {
  theme: {
    colors: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem'
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    }
  },
  accessibility: {
    enableScreenReader: true,
    enableKeyboardNavigation: true,
    enableHighContrast: false,
    enableReducedMotion: false,
    ariaLabels: {
      addField: 'Add field to form',
      removeField: 'Remove field from form',
      editField: 'Edit field properties',
      saveForm: 'Save form template',
      publishForm: 'Publish form template'
    },
    focusManagement: 'auto'
  },
  autoSave: {
    enabled: true,
    interval: 30000,
    maxRetries: 3
  },
  validation: {
    realTime: true,
    debounceMs: 300,
    showErrors: 'onBlur'
  },
  fileUpload: {
    maxSize: 10,
    allowedTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    multiple: true,
    autoUpload: true
  },
  ai: {
    enabled: true,
    suggestions: true,
    autoComplete: true,
    documentParsing: true
  },
  performance: {
    virtualScrolling: true,
    lazyLoading: true,
    debounceUpdates: true
  }
};
```

## 📊 Field Types

### Basic Inputs
- **text**: Single line text input
- **number**: Numeric input with optional min/max
- **email**: Email address input with validation
- **phone**: Phone number input with formatting
- **date**: Date picker input
- **datetime**: Date and time picker input

### Advanced Inputs
- **select**: Single choice dropdown
- **multiselect**: Multiple choice dropdown
- **checkbox**: Single checkbox input
- **radio**: Radio button group
- **textarea**: Multi-line text input

### Media & Files
- **file**: File upload input
- **signature**: Digital signature pad

### Layout & Structure
- **section**: Section divider with title
- **repeater**: Repeatable field group

## 🔍 Validation Rules

### Built-in Validations
- **required**: Field must be filled
- **email**: Must be valid email format
- **url**: Must be valid URL format
- **min**: Minimum value/length
- **max**: Maximum value/length
- **pattern**: Custom regex pattern
- **custom**: Custom validation function

### Custom Validation Example

```tsx
const customValidator = (value) => {
  if (value && value.length < 3) {
    return 'Value must be at least 3 characters long';
  }
  return null;
};

const validationRule = {
  type: 'custom',
  message: 'Custom validation failed',
  customValidator
};
```

## 🎨 Theming

### Custom Theme

```tsx
const customTheme = {
  colors: {
    primary: '#8B5CF6', // Purple
    secondary: '#64748B',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0'
  },
  // ... other theme properties
};
```

## 🧪 Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FormBuilder } from './components/form-builder';

describe('FormBuilder', () => {
  it('renders form builder interface', () => {
    render(<FormBuilder />);
    expect(screen.getByText('Field Types')).toBeInTheDocument();
  });

  it('allows adding fields', () => {
    render(<FormBuilder />);
    const textField = screen.getByText('Text Input');
    fireEvent.click(textField);
    expect(screen.getByText('New Text Input')).toBeInTheDocument();
  });
});
```

### Integration Tests

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormRenderer } from './components/form-renderer';

describe('FormRenderer', () => {
  it('submits form data correctly', async () => {
    const mockSubmit = jest.fn();
    const template = {
      // ... template definition
    };

    render(<FormRenderer template={template} onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByText('Submit');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });
});
```

## 🚀 Performance

### Optimization Tips

1. **Virtual Scrolling**: Enable for large forms with many fields
2. **Lazy Loading**: Load field components on demand
3. **Debounced Updates**: Prevent excessive re-renders
4. **Memoization**: Use React.memo for expensive components
5. **Code Splitting**: Split large components into smaller chunks

### Performance Monitoring

```tsx
import { useEffect } from 'react';

const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`${componentName} render time:`, endTime - startTime);
    };
  });
};
```

## 🔒 Security

### Best Practices

1. **Input Validation**: Always validate on both client and server
2. **XSS Prevention**: Sanitize user inputs
3. **CSRF Protection**: Include CSRF tokens in forms
4. **File Upload Security**: Validate file types and sizes
5. **Access Control**: Implement proper authorization

### Security Configuration

```tsx
const securityConfig = {
  allowedFileTypes: ['.pdf', '.doc', '.docx'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  csrfToken: 'your-csrf-token',
  validateOnServer: true,
  sanitizeInputs: true
};
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
.form-builder {
  @apply w-full;
}

/* Tablet */
@media (min-width: 768px) {
  .form-builder-toolbox {
    @apply w-80;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .form-builder-toolbox {
    @apply w-96;
  }
}
```

## ♿ Accessibility

### WCAG 2.1 AA Compliance

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels and roles
- **Color Contrast**: Minimum 4.5:1 ratio
- **Focus Management**: Visible focus indicators
- **Error Handling**: Clear error messages

### Accessibility Features

```tsx
const accessibilityConfig = {
  enableScreenReader: true,
  enableKeyboardNavigation: true,
  enableHighContrast: false,
  enableReducedMotion: false,
  ariaLabels: {
    addField: 'Add field to form',
    removeField: 'Remove field from form',
    editField: 'Edit field properties'
  }
};
```

## 🔄 Migration Guide

### From v1.x to v2.x

```tsx
// Old API
<FormBuilder
  fields={fields}
  onChange={handleChange}
/>

// New API
<FormBuilder
  template={template}
  onSave={handleSave}
  onPublish={handlePublish}
/>
```

## 🤝 Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Run tests: `npm test`

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configuration
- Write comprehensive tests
- Document all public APIs

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: [Full documentation](https://docs.formbuilder.com)
- **Issues**: [GitHub Issues](https://github.com/formbuilder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/formbuilder/discussions)
- **Email**: support@formbuilder.com

## 🗺️ Roadmap

### v2.1.0 (Q1 2024)
- [ ] Advanced conditional logic
- [ ] Multi-language support
- [ ] Enhanced AI suggestions
- [ ] Performance optimizations

### v2.2.0 (Q2 2024)
- [ ] Offline support
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] Plugin system

### v3.0.0 (Q3 2024)
- [ ] Complete rewrite with modern architecture
- [ ] Enhanced performance
- [ ] Better developer experience
- [ ] More customization options 