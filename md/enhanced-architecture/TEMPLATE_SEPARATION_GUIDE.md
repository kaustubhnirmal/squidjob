# UI/UX Template Separation Guide
# Complete Frontend Architecture for Modular Development

## Table of Contents
1. [Template Architecture Overview](#template-architecture-overview)
2. [Component Separation Strategy](#component-separation-strategy)
3. [Theme Management System](#theme-management-system)
4. [Template Engine Implementation](#template-engine-implementation)
5. [CSS Architecture](#css-architecture)
6. [Configuration Management](#configuration-management)
7. [Development Workflow](#development-workflow)
8. [Customization Guidelines](#customization-guidelines)

## Template Architecture Overview

### Directory Structure
```
frontend/
├── core/                           # Core framework (unchangeable)
│   ├── components/                 # Base components
│   │   ├── Layout/
│   │   │   ├── AppShell.jsx       # Main application shell
│   │   │   ├── Header.jsx         # Global header component
│   │   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   │   └── Footer.jsx         # Global footer
│   │   ├── Auth/
│   │   │   ├── LoginForm.jsx      # Authentication forms
│   │   │   ├── ProtectedRoute.jsx # Route protection
│   │   │   └── AuthProvider.jsx   # Auth context provider
│   │   ├── Common/
│   │   │   ├── Button.jsx         # Base button component
│   │   │   ├── Input.jsx          # Base input component
│   │   │   ├── Modal.jsx          # Base modal component
│   │   │   ├── Table.jsx          # Base table component
│   │   │   └── Form.jsx           # Base form component
│   │   └── Utils/
│   │       ├── ErrorBoundary.jsx  # Error handling
│   │       ├── LoadingSpinner.jsx # Loading states
│   │       └── EmptyState.jsx     # Empty state component
│   ├── hooks/                      # Core React hooks
│   │   ├── useAuth.js             # Authentication hook
│   │   ├── usePermissions.js      # Permission checking
│   │   ├── useApi.js              # API interaction
│   │   ├── useLocalStorage.js     # Local storage management
│   │   └── useTheme.js            # Theme management
│   ├── services/                   # Core services
│   │   ├── api.js                 # API client
│   │   ├── auth.js                # Auth service
│   │   ├── storage.js             # Storage service
│   │   └── validation.js          # Validation utilities
│   └── utils/                      # Core utilities
│       ├── constants.js           # Application constants
│       ├── helpers.js             # Helper functions
│       ├── formatters.js          # Data formatters
│       └── validators.js          # Input validators
├── themes/                         # Theme system (customizable)
│   ├── default/
│   │   ├── variables.css          # CSS custom properties
│   │   ├── components.css         # Component styles
│   │   ├── layouts.css            # Layout styles
│   │   ├── utilities.css          # Utility classes
│   │   └── theme.config.js        # Theme configuration
│   ├── corporate/
│   │   ├── variables.css          # Corporate theme variables
│   │   ├── components.css         # Corporate component styles
│   │   └── theme.config.js        # Corporate theme config
│   ├── government/
│   │   ├── variables.css          # Government theme variables
│   │   ├── components.css         # Government component styles
│   │   └── theme.config.js        # Government theme config
│   └── custom/
│       ├── variables.css          # Client-specific variables
│       ├── components.css         # Client-specific styles
│       └── theme.config.js        # Client configuration
├── templates/                      # Page templates (customizable)
│   ├── layouts/
│   │   ├── DashboardLayout.jsx    # Dashboard page layout
│   │   ├── FormLayout.jsx         # Form page layout
│   │   ├── ListLayout.jsx         # List page layout
│   │   └── DetailLayout.jsx       # Detail page layout
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   ├── DashboardTemplate.jsx
│   │   │   ├── StatsTemplate.jsx
│   │   │   └── ChartsTemplate.jsx
│   │   ├── Forms/
│   │   │   ├── CreateFormTemplate.jsx
│   │   │   ├── EditFormTemplate.jsx
│   │   │   └── ViewFormTemplate.jsx
│   │   ├── Lists/
│   │   │   ├── DataListTemplate.jsx
│   │   │   ├── CardListTemplate.jsx
│   │   │   └── TableListTemplate.jsx
│   │   └── Details/
│   │       ├── RecordDetailTemplate.jsx
│   │       ├── PreviewTemplate.jsx
│   │       └── PrintTemplate.jsx
│   └── components/
│       ├── Navigation/
│       │   ├── NavigationTemplate.jsx
│       │   ├── BreadcrumbTemplate.jsx
│       │   └── TabsTemplate.jsx
│       ├── Data/
│       │   ├── DataTableTemplate.jsx
│       │   ├── CardTemplate.jsx
│       │   └── ChartTemplate.jsx
│       └── Interaction/
│           ├── FormTemplate.jsx
│           ├── ModalTemplate.jsx
│           └── DialogTemplate.jsx
└── modules/                        # Module-specific UI (modular)
    ├── tender/
    │   ├── components/
    │   │   ├── TenderCard.jsx
    │   │   ├── TenderForm.jsx
    │   │   ├── TenderSearch.jsx
    │   │   └── TenderFilters.jsx
    │   ├── pages/
    │   │   ├── TenderList.jsx
    │   │   ├── TenderDetails.jsx
    │   │   ├── TenderCreate.jsx
    │   │   └── TenderEdit.jsx
    │   ├── templates/
    │   │   ├── TenderListTemplate.jsx
    │   │   ├── TenderFormTemplate.jsx
    │   │   └── TenderDetailTemplate.jsx
    │   └── styles/
    │       ├── tender.module.css
    │       └── tender-responsive.css
    ├── company/
    │   ├── components/
    │   ├── pages/
    │   ├── templates/
    │   └── styles/
    ├── finance/
    │   ├── components/
    │   ├── pages/
    │   ├── templates/
    │   └── styles/
    └── analytics/
        ├── components/
        ├── pages/
        ├── templates/
        └── styles/
```

## Component Separation Strategy

### Base Component Architecture
```jsx
// core/components/Common/Button.jsx
/**
 * Base Button Component
 * Core UI component that provides consistent styling and behavior
 * Should not be modified for customizations - use theming instead
 */
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/className';

export const Button = React.forwardRef(({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  children,
  className,
  onClick,
  ...props
}, ref) => {
  const { theme } = useTheme();
  
  // Base classes that never change
  const baseClasses = 'btn btn-base transition-all duration-200 focus:outline-none focus:ring-2';
  
  // Theme-dependent classes
  const variantClasses = {
    primary: theme.button.primary,
    secondary: theme.button.secondary,
    outline: theme.button.outline,
    ghost: theme.button.ghost,
    danger: theme.button.danger
  };
  
  const sizeClasses = {
    small: theme.button.sizes.small,
    medium: theme.button.sizes.medium,
    large: theme.button.sizes.large
  };
  
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };
  
  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        {
          [theme.button.disabled]: disabled,
          [theme.button.loading]: loading
        },
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <span className="btn-spinner" aria-hidden="true">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      <span className={loading ? 'btn-content-loading' : 'btn-content'}>
        {children}
      </span>
    </button>
  );
});

Button.displayName = 'Button';
```

### Template Component System
```jsx
// templates/components/Data/DataTableTemplate.jsx
/**
 * Data Table Template
 * Provides consistent table layout while allowing content customization
 */
import React from 'react';
import { useTheme } from '../../../core/hooks/useTheme';
import { Button } from '../../../core/components/Common/Button';
import { LoadingSpinner } from '../../../core/components/Utils/LoadingSpinner';
import { EmptyState } from '../../../core/components/Utils/EmptyState';

export const DataTableTemplate = ({
  title,
  description,
  columns,
  data,
  loading = false,
  error = null,
  actions,
  filters,
  pagination,
  selection = false,
  sorting = false,
  className,
  customization = {}
}) => {
  const { theme } = useTheme();
  
  // Merge theme with customizations
  const tableStyles = {
    ...theme.table,
    ...customization.table
  };
  
  const headerStyles = {
    ...theme.table.header,
    ...customization.header
  };
  
  if (loading) {
    return (
      <div className={`data-table-template ${className || ''}`}>
        <LoadingSpinner message="Loading data..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`data-table-template ${className || ''}`}>
        <div className="table-error">
          <p className="error-message">{error.message}</p>
          {error.retry && (
            <Button onClick={error.retry} variant="outline">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`data-table-template ${className || ''}`} style={tableStyles.container}>
      {/* Table Header */}
      <div className="table-header" style={headerStyles}>
        <div className="table-title-section">
          {title && <h2 className="table-title">{title}</h2>}
          {description && <p className="table-description">{description}</p>}
        </div>
        
        {actions && (
          <div className="table-actions">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'primary'}
                size={action.size || 'medium'}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.icon && <span className="action-icon">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {/* Filters */}
      {filters && (
        <div className="table-filters" style={tableStyles.filters}>
          {filters}
        </div>
      )}
      
      {/* Table Content */}
      {data && data.length > 0 ? (
        <div className="table-wrapper" style={tableStyles.wrapper}>
          <table className="data-table" style={tableStyles.table}>
            <thead style={tableStyles.thead}>
              <tr>
                {selection && (
                  <th style={tableStyles.th}>
                    <input type="checkbox" className="select-all" />
                  </th>
                )}
                {columns.map((column, index) => (
                  <th 
                    key={index} 
                    style={{...tableStyles.th, ...column.headerStyle}}
                    className={sorting && column.sortable ? 'sortable' : ''}
                  >
                    <div className="th-content">
                      <span>{column.title}</span>
                      {sorting && column.sortable && (
                        <span className="sort-indicator">
                          ↕️
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={tableStyles.tbody}>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} style={tableStyles.tr}>
                  {selection && (
                    <td style={tableStyles.td}>
                      <input 
                        type="checkbox" 
                        value={row.id} 
                        className="row-select"
                      />
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      style={{...tableStyles.td, ...column.cellStyle}}
                    >
                      {column.render ? 
                        column.render(row[column.key], row, rowIndex) : 
                        row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No data available"
          message="There are no records to display"
          action={actions?.[0]}
        />
      )}
      
      {/* Pagination */}
      {pagination && data && data.length > 0 && (
        <div className="table-pagination" style={tableStyles.pagination}>
          {pagination}
        </div>
      )}
    </div>
  );
};
```

## Theme Management System

### Theme Configuration Structure
```javascript
// themes/default/theme.config.js
/**
 * Default Theme Configuration
 * Provides base styling definitions for all components
 */
export const defaultTheme = {
  // Color system
  colors: {
    // Primary brand colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',   // Main primary
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    
    // Semantic colors
    success: {
      light: '#d1fae5',
      main: '#10b981',
      dark: '#059669'
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#d97706'
    },
    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#dc2626'
    },
    
    // Neutral colors
    neutral: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },
  
  // Typography system
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace']
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem'  // 36px
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  
  // Spacing system
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem'      // 96px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    full: '9999px'
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  
  // Component-specific styles
  components: {
    button: {
      base: 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      
      variants: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      },
      
      sizes: {
        small: 'px-3 py-1.5 text-sm rounded-md',
        medium: 'px-4 py-2 text-base rounded-md',
        large: 'px-6 py-3 text-lg rounded-lg'
      },
      
      states: {
        disabled: 'opacity-50 cursor-not-allowed',
        loading: 'cursor-wait'
      }
    },
    
    input: {
      base: 'block w-full rounded-md border-gray-300 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:ring-blue-500',
      
      variants: {
        default: 'bg-white text-gray-900',
        error: 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-300 text-green-900 focus:border-green-500 focus:ring-green-500'
      },
      
      sizes: {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-3 py-2 text-base',
        large: 'px-4 py-3 text-lg'
      }
    },
    
    card: {
      base: 'bg-white rounded-lg shadow-md border border-gray-200',
      header: 'px-6 py-4 border-b border-gray-200',
      body: 'px-6 py-4',
      footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50'
    },
    
    table: {
      container: 'overflow-hidden bg-white shadow-sm rounded-lg border border-gray-200',
      wrapper: 'overflow-x-auto',
      table: 'min-w-full divide-y divide-gray-200',
      thead: 'bg-gray-50',
      th: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      tbody: 'bg-white divide-y divide-gray-200',
      tr: 'hover:bg-gray-50 transition-colors duration-150',
      td: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
      pagination: 'px-6 py-3 border-t border-gray-200 bg-gray-50'
    }
  }
};
```

### Dynamic Theme Application
```javascript
// core/hooks/useTheme.js
/**
 * Theme management hook
 * Provides theme switching and customization capabilities
 */
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children, defaultTheme = 'default' }) => {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [customizations, setCustomizations] = useState({});
  const [themes, setThemes] = useState(new Map());
  
  // Load theme configuration
  useEffect(() => {
    loadTheme(currentTheme);
  }, [currentTheme]);
  
  const loadTheme = async (themeName) => {
    try {
      const themeModule = await import(`../../themes/${themeName}/theme.config.js`);
      const themeConfig = themeModule.default || themeModule[`${themeName}Theme`];
      
      setThemes(prev => new Map(prev).set(themeName, themeConfig));
      
      // Apply CSS custom properties
      applyCSSVariables(themeConfig);
      
    } catch (error) {
      console.error(`Failed to load theme: ${themeName}`, error);
    }
  };
  
  const applyCSSVariables = (theme) => {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([colorName, colorValue]) => {
      if (typeof colorValue === 'object') {
        Object.entries(colorValue).forEach(([shade, value]) => {
          root.style.setProperty(`--color-${colorName}-${shade}`, value);
        });
      } else {
        root.style.setProperty(`--color-${colorName}`, colorValue);
      }
    });
    
    // Apply spacing variables
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Apply typography variables
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    // Apply border radius variables
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
    // Apply shadow variables
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  };
  
  const switchTheme = async (themeName) => {
    await loadTheme(themeName);
    setCurrentTheme(themeName);
    localStorage.setItem('selectedTheme', themeName);
  };
  
  const customizeTheme = (customizations) => {
    setCustomizations(prev => ({ ...prev, ...customizations }));
    
    // Apply custom CSS variables
    const root = document.documentElement;
    Object.entries(customizations).forEach(([property, value]) => {
      root.style.setProperty(`--${property}`, value);
    });
  };
  
  const getTheme = () => {
    const baseTheme = themes.get(currentTheme);
    
    if (!baseTheme) {
      return null;
    }
    
    // Merge base theme with customizations
    return mergeDeep(baseTheme, customizations);
  };
  
  const value = {
    currentTheme,
    themes: Array.from(themes.keys()),
    theme: getTheme(),
    switchTheme,
    customizeTheme,
    customizations
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// Helper function for deep merging objects
const mergeDeep = (target, source) => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = mergeDeep(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};
```

This comprehensive template separation guide ensures that UI/UX customizations can be made without affecting core functionality, enabling easy theme switching and client-specific customizations while maintaining code maintainability.