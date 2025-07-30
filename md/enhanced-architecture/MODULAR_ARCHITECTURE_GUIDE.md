# Modular Architecture Guide
# Enterprise-Grade Tender Management System

## Table of Contents
1. [Modular Design Philosophy](#modular-design-philosophy)
2. [Core Module System](#core-module-system)
3. [Module Configuration](#module-configuration)
4. [Database Architecture](#database-architecture)
5. [UI/UX Template Separation](#uiux-template-separation)
6. [Development Best Practices](#development-best-practices)
7. [Documentation Standards](#documentation-standards)
8. [Module Development Guidelines](#module-development-guidelines)

## Modular Design Philosophy

### Core Principles
1. **Separation of Concerns**: Each module handles a specific business domain
2. **Loose Coupling**: Modules interact through well-defined interfaces
3. **High Cohesion**: Related functionality grouped within modules
4. **Extensibility**: Easy addition of new modules without core changes
5. **Configurability**: Modules can be enabled/disabled per deployment

### Module Categories
```
Core Modules (Always Required):
├── Authentication & Authorization
├── User Management
├── Role & Permission System
└── System Configuration

Business Modules (Configurable):
├── Tender Management
├── Company & Vendor Management
├── Bid Participation System
├── Financial Management
├── Document Management
├── Analytics & Reporting
└── Notification System

Extension Modules (Optional):
├── CRM Integration
├── ERP Integration
├── Advanced Analytics
├── AI/ML Insights
├── Mobile App API
└── Third-party Connectors
```

## Core Module System

### Module Structure Template
```
modules/
├── core/
│   ├── auth/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── tests/
│   │   ├── config/
│   │   ├── migrations/
│   │   └── module.config.js
│   ├── users/
│   └── permissions/
├── business/
│   ├── tenders/
│   ├── companies/
│   ├── bids/
│   ├── finance/
│   ├── documents/
│   └── analytics/
└── extensions/
    ├── crm/
    ├── ai-insights/
    └── mobile-api/
```

### Module Configuration Schema
```javascript
// modules/[module]/module.config.js
export default {
  name: 'tender-management',
  version: '1.0.0',
  description: 'Complete tender lifecycle management',
  
  // Module metadata
  metadata: {
    author: 'Development Team',
    license: 'MIT',
    category: 'business',
    tags: ['tender', 'procurement', 'government']
  },
  
  // Dependencies
  dependencies: {
    core: ['auth', 'users', 'permissions'],
    business: ['companies', 'documents'],
    extensions: []
  },
  
  // Configuration options
  config: {
    enabled: true,
    autoload: true,
    priority: 5,
    features: {
      tenderImport: true,
      aiAnalysis: true,
      bulkOperations: true,
      advancedSearch: true
    }
  },
  
  // Database requirements
  database: {
    tables: ['tenders', 'tender_assignments', 'tender_documents'],
    migrations: ['001_create_tenders_table.sql'],
    seeds: ['default_tender_statuses.sql']
  },
  
  // API endpoints
  api: {
    prefix: '/api/tenders',
    routes: ['./routes/tender.routes.js'],
    middleware: ['auth', 'permission:manage_tenders']
  },
  
  // Frontend components
  frontend: {
    pages: ['TenderList', 'TenderForm', 'TenderDetails'],
    components: ['TenderCard', 'TenderSearch', 'TenderFilters'],
    routes: [
      { path: '/tenders', component: 'TenderList' },
      { path: '/tenders/create', component: 'TenderForm' },
      { path: '/tenders/:id', component: 'TenderDetails' }
    ]
  },
  
  // Permissions required
  permissions: [
    'view_tenders',
    'create_tender',
    'edit_tender',
    'delete_tender',
    'assign_tender'
  ]
};
```

### Module Registry System
```javascript
// core/ModuleRegistry.js
/**
 * Central module registry for dynamic module loading and management
 * Handles module discovery, dependency resolution, and lifecycle management
 */
class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.loadOrder = [];
    this.dependencyGraph = new Map();
  }
  
  /**
   * Register a module in the system
   * @param {Object} moduleConfig - Module configuration object
   * @param {string} modulePath - Path to module files
   */
  async registerModule(moduleConfig, modulePath) {
    // Validate module configuration
    this.validateModuleConfig(moduleConfig);
    
    // Check dependencies
    await this.resolveDependencies(moduleConfig);
    
    // Register module
    this.modules.set(moduleConfig.name, {
      config: moduleConfig,
      path: modulePath,
      loaded: false,
      instance: null
    });
    
    console.log(`📦 Module registered: ${moduleConfig.name} v${moduleConfig.version}`);
  }
  
  /**
   * Load all enabled modules in dependency order
   */
  async loadModules() {
    // Calculate load order based on dependencies
    this.calculateLoadOrder();
    
    // Load modules in order
    for (const moduleName of this.loadOrder) {
      await this.loadModule(moduleName);
    }
  }
  
  /**
   * Load a specific module
   * @param {string} moduleName - Name of module to load
   */
  async loadModule(moduleName) {
    const moduleInfo = this.modules.get(moduleName);
    
    if (!moduleInfo || moduleInfo.loaded) {
      return;
    }
    
    try {
      // Import module main file
      const ModuleClass = await import(`${moduleInfo.path}/index.js`);
      
      // Create module instance
      moduleInfo.instance = new ModuleClass.default(moduleInfo.config);
      
      // Initialize module
      await moduleInfo.instance.initialize();
      
      moduleInfo.loaded = true;
      
      console.log(`✅ Module loaded: ${moduleName}`);
    } catch (error) {
      console.error(`❌ Failed to load module ${moduleName}:`, error);
      throw new Error(`Module loading failed: ${moduleName}`);
    }
  }
  
  /**
   * Get enabled modules for a specific category
   * @param {string} category - Module category
   * @returns {Array} List of enabled modules
   */
  getEnabledModules(category = null) {
    const enabled = [];
    
    for (const [name, info] of this.modules) {
      if (info.config.config.enabled) {
        if (!category || info.config.metadata.category === category) {
          enabled.push({
            name,
            config: info.config,
            instance: info.instance
          });
        }
      }
    }
    
    return enabled;
  }
}

// Export singleton instance
export const moduleRegistry = new ModuleRegistry();
```

## Database Architecture

### Modular Database Schema
```sql
-- =====================================================
-- CORE SCHEMA (Always Required)
-- =====================================================

-- System configuration for module management
CREATE TABLE system_modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    version VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    config JSONB,
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feature flags for module functionality
CREATE TABLE feature_flags (
    id SERIAL PRIMARY KEY,
    module_name VARCHAR(100) REFERENCES system_modules(name),
    feature_key VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_name, feature_key)
);

-- =====================================================
-- MODULAR SCHEMA STRUCTURE
-- =====================================================

-- Each module maintains its own schema prefix
-- Example: tender_* tables, company_* tables, finance_* tables

-- Module: Tender Management
CREATE SCHEMA IF NOT EXISTS tender_module;

CREATE TABLE tender_module.tenders (
    id SERIAL PRIMARY KEY,
    -- Core tender fields
    reference_no VARCHAR(100) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Module-specific fields
    module_config JSONB,
    custom_fields JSONB,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    -- Soft delete support
    deleted_at TIMESTAMP NULL,
    deleted_by INTEGER NULL
);

-- Module: Company Management
CREATE SCHEMA IF NOT EXISTS company_module;

CREATE TABLE company_module.companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    
    -- Module-specific configuration
    module_config JSONB,
    enabled_features JSONB,
    
    -- Standard audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Migration System
```javascript
// core/database/MigrationManager.js
/**
 * Modular database migration system
 * Handles schema changes per module with rollback support
 */
class MigrationManager {
  constructor(database) {
    this.db = database;
    this.migrations = new Map();
  }
  
  /**
   * Register migrations for a module
   * @param {string} moduleName - Module name
   * @param {Array} migrations - List of migration files
   */
  registerModuleMigrations(moduleName, migrations) {
    this.migrations.set(moduleName, migrations);
  }
  
  /**
   * Run migrations for all enabled modules
   */
  async runMigrations() {
    // Create migrations tracking table if not exists
    await this.createMigrationTable();
    
    for (const [moduleName, migrations] of this.migrations) {
      await this.runModuleMigrations(moduleName, migrations);
    }
  }
  
  /**
   * Run migrations for specific module
   * @param {string} moduleName - Module name
   * @param {Array} migrations - Migration files
   */
  async runModuleMigrations(moduleName, migrations) {
    for (const migrationFile of migrations) {
      const migrationId = `${moduleName}_${migrationFile}`;
      
      // Check if migration already applied
      const applied = await this.isMigrationApplied(migrationId);
      
      if (!applied) {
        await this.runMigration(migrationId, migrationFile);
      }
    }
  }
  
  /**
   * Rollback module migrations
   * @param {string} moduleName - Module to rollback
   */
  async rollbackModule(moduleName) {
    const migrations = await this.getAppliedMigrations(moduleName);
    
    // Rollback in reverse order
    for (const migration of migrations.reverse()) {
      await this.rollbackMigration(migration);
    }
  }
}
```

## UI/UX Template Separation

### Template Architecture
```
frontend/
├── core/                    # Core UI framework (unchangeable)
│   ├── components/
│   │   ├── Layout/
│   │   ├── Navigation/
│   │   ├── Auth/
│   │   └── Common/
│   ├── hooks/
│   ├── utils/
│   └── services/
├── themes/                  # Customizable themes
│   ├── default/
│   │   ├── variables.css
│   │   ├── components.css
│   │   └── theme.config.js
│   ├── corporate/
│   └── government/
├── templates/               # Page templates (customizable)
│   ├── dashboard/
│   ├── forms/
│   ├── lists/
│   └── details/
└── modules/                 # Module-specific components
    ├── tender/
    │   ├── components/
    │   ├── pages/
    │   ├── templates/
    │   └── styles/
    └── company/
```

### Theme Configuration System
```javascript
// themes/ThemeManager.js
/**
 * Dynamic theme management system
 * Allows runtime theme switching without affecting core modules
 */
class ThemeManager {
  constructor() {
    this.currentTheme = 'default';
    this.themes = new Map();
    this.customizations = new Map();
  }
  
  /**
   * Register a theme
   * @param {string} name - Theme name
   * @param {Object} config - Theme configuration
   */
  registerTheme(name, config) {
    this.themes.set(name, {
      ...config,
      variables: this.loadThemeVariables(name),
      components: this.loadThemeComponents(name)
    });
  }
  
  /**
   * Apply theme to application
   * @param {string} themeName - Theme to apply
   */
  async applyTheme(themeName) {
    const theme = this.themes.get(themeName);
    
    if (!theme) {
      throw new Error(`Theme not found: ${themeName}`);
    }
    
    // Update CSS variables
    this.updateCSSVariables(theme.variables);
    
    // Load theme-specific components
    await this.loadThemeComponents(theme.components);
    
    this.currentTheme = themeName;
    
    // Persist theme choice
    localStorage.setItem('selectedTheme', themeName);
  }
  
  /**
   * Customize theme variables
   * @param {Object} customizations - Custom variable values
   */
  customizeTheme(customizations) {
    this.customizations.set(this.currentTheme, customizations);
    this.updateCSSVariables(customizations);
  }
}
```

### Component Template System
```jsx
// templates/ComponentTemplate.jsx
/**
 * Base template for all components
 * Provides consistent structure while allowing customization
 */
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { useModule } from '../hooks/useModule';

/**
 * Generic component template with theming and module support
 * @param {Object} props - Component props
 * @param {string} props.module - Module name
 * @param {string} props.template - Template name
 * @param {Object} props.data - Component data
 * @param {Object} props.customization - Custom styling
 */
export const ComponentTemplate = ({ 
  module, 
  template, 
  data, 
  customization,
  children 
}) => {
  const { theme, applyCustomization } = useTheme();
  const { moduleConfig } = useModule(module);
  
  // Merge theme, module, and custom styles
  const componentStyles = {
    ...theme.components[template],
    ...moduleConfig.styling,
    ...customization
  };
  
  return (
    <div 
      className={`component-template ${template}-template`}
      style={componentStyles}
      data-module={module}
      data-template={template}
    >
      {/* Template header */}
      <div className="template-header">
        {data.title && (
          <h2 className="template-title">{data.title}</h2>
        )}
        {data.actions && (
          <div className="template-actions">
            {data.actions.map((action, index) => (
              <button 
                key={index}
                className={`action-btn ${action.type}`}
                onClick={action.handler}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Template content */}
      <div className="template-content">
        {children}
      </div>
      
      {/* Template footer */}
      {data.footer && (
        <div className="template-footer">
          {data.footer}
        </div>
      )}
    </div>
  );
};
```

## Development Best Practices

### Code Documentation Standards
```javascript
/**
 * @fileoverview Tender Management Service
 * @module TenderService
 * @requires database
 * @requires logger
 * @requires validation
 * 
 * @description
 * Comprehensive service for managing tender lifecycle operations.
 * Handles CRUD operations, business logic, and data validation
 * for tender entities within the system.
 * 
 * @author Development Team
 * @since 1.0.0
 * @version 1.2.0
 * 
 * @example
 * import { TenderService } from './TenderService';
 * 
 * const tenderService = new TenderService(database);
 * const tender = await tenderService.createTender(tenderData);
 */

/**
 * Tender Management Service Class
 * 
 * Provides comprehensive tender management functionality including:
 * - CRUD operations for tenders
 * - Business logic validation
 * - Document processing
 * - Assignment management
 * - Status workflow management
 * 
 * @class TenderService
 */
class TenderService {
  /**
   * Initialize TenderService with dependencies
   * 
   * @param {Object} database - Database connection instance
   * @param {Object} logger - Logger instance for audit trail
   * @param {Object} validator - Data validation service
   * @param {Object} options - Service configuration options
   * @param {boolean} options.enableAudit - Enable audit logging
   * @param {boolean} options.enableCache - Enable result caching
   * 
   * @throws {Error} When required dependencies are missing
   * 
   * @example
   * const service = new TenderService(db, logger, validator, {
   *   enableAudit: true,
   *   enableCache: false
   * });
   */
  constructor(database, logger, validator, options = {}) {
    // Validate required dependencies
    if (!database) {
      throw new Error('Database connection is required for TenderService');
    }
    
    if (!logger) {
      throw new Error('Logger instance is required for TenderService');
    }
    
    this.db = database;
    this.logger = logger;
    this.validator = validator;
    this.options = {
      enableAudit: true,
      enableCache: false,
      ...options
    };
    
    // Initialize internal state
    this.cache = new Map();
    this.auditTrail = [];
    
    this.logger.info('TenderService initialized', {
      module: 'TenderService',
      options: this.options
    });
  }
  
  /**
   * Create a new tender in the system
   * 
   * @async
   * @param {Object} tenderData - Tender information
   * @param {string} tenderData.title - Tender title (required)
   * @param {string} tenderData.description - Tender description
   * @param {string} tenderData.authority - Issuing authority (required)
   * @param {Date} tenderData.deadline - Submission deadline (required)
   * @param {number} tenderData.estimatedValue - Estimated tender value
   * @param {number} userId - ID of user creating the tender
   * 
   * @returns {Promise<Object>} Created tender object with assigned ID
   * 
   * @throws {ValidationError} When tender data is invalid
   * @throws {DatabaseError} When database operation fails
   * @throws {AuthorizationError} When user lacks permissions
   * 
   * @example
   * const tenderData = {
   *   title: 'IT Equipment Procurement',
   *   description: 'Procurement of laptops and accessories',
   *   authority: 'Municipal Corporation',
   *   deadline: new Date('2025-12-31'),
   *   estimatedValue: 500000
   * };
   * 
   * const tender = await tenderService.createTender(tenderData, userId);
   * console.log('Created tender:', tender.id);
   */
  async createTender(tenderData, userId) {
    try {
      // Log operation start
      this.logger.info('Creating new tender', {
        operation: 'createTender',
        userId,
        title: tenderData.title
      });
      
      // Validate input data
      const validationResult = await this.validator.validate(tenderData, 'tenderCreate');
      
      if (!validationResult.isValid) {
        throw new ValidationError('Invalid tender data', validationResult.errors);
      }
      
      // Check user permissions
      await this.checkPermission(userId, 'create_tender');
      
      // Generate reference number
      const referenceNo = await this.generateReferenceNumber();
      
      // Prepare tender data for database
      const dbTenderData = {
        ...tenderData,
        referenceNo,
        status: 'draft',
        createdBy: userId,
        createdAt: new Date()
      };
      
      // Insert into database
      const tender = await this.db.tenders.create(dbTenderData);
      
      // Update audit trail
      if (this.options.enableAudit) {
        await this.logAuditEvent('tender_created', {
          tenderId: tender.id,
          userId,
          changes: dbTenderData
        });
      }
      
      // Clear relevant caches
      if (this.options.enableCache) {
        this.clearCache(['tenders_list', `user_tenders_${userId}`]);
      }
      
      this.logger.info('Tender created successfully', {
        operation: 'createTender',
        tenderId: tender.id,
        referenceNo: tender.referenceNo
      });
      
      return tender;
      
    } catch (error) {
      this.logger.error('Failed to create tender', {
        operation: 'createTender',
        error: error.message,
        userId,
        tenderData
      });
      
      throw error;
    }
  }
  
  /**
   * Generate unique reference number for tender
   * 
   * @private
   * @async
   * @returns {Promise<string>} Unique reference number
   * 
   * @description
   * Generates a unique reference number using format: TNR{YEAR}{SEQUENCE}
   * Example: TNR2025001, TNR2025002, etc.
   */
  async generateReferenceNumber() {
    const year = new Date().getFullYear();
    const prefix = `TNR${year}`;
    
    // Get latest sequence number for current year
    const latestTender = await this.db.tenders.findOne({
      where: {
        referenceNo: {
          startsWith: prefix
        }
      },
      orderBy: {
        referenceNo: 'desc'
      }
    });
    
    let sequence = 1;
    
    if (latestTender) {
      const lastSequence = parseInt(latestTender.referenceNo.slice(7), 10);
      sequence = lastSequence + 1;
    }
    
    return `${prefix}${sequence.toString().padStart(3, '0')}`;
  }
}

export { TenderService };
```

### Inline Documentation Examples
```javascript
// =====================================================
// INLINE DOCUMENTATION EXAMPLES
// =====================================================

/**
 * Database connection configuration with connection pooling
 * 
 * This configuration provides optimal performance for high-load scenarios
 * while maintaining connection stability and automatic recovery.
 */
const dbConfig = {
  // Connection details
  host: process.env.DB_HOST || 'localhost',     // Database server hostname
  port: process.env.DB_PORT || 5432,           // PostgreSQL default port
  database: process.env.DB_NAME || 'tender247', // Database name
  
  // Authentication
  username: process.env.DB_USER || 'postgres',  // Database username
  password: process.env.DB_PASS || '',          // Database password (from env)
  
  // Connection pooling for performance
  pool: {
    min: 5,        // Minimum connections in pool
    max: 20,       // Maximum connections in pool
    idle: 10000,   // Close connections after 10s of inactivity
    acquire: 60000 // Maximum time to get connection (60s)
  },
  
  // Logging configuration
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Performance optimization
  dialectOptions: {
    useUTC: false,                    // Use local timezone
    dateStrings: true,                // Return dates as strings
    typeCast: true                    // Automatic type casting
  }
};

/**
 * Middleware for request validation and sanitization
 * 
 * This middleware performs comprehensive input validation including:
 * - SQL injection prevention
 * - XSS attack prevention  
 * - Data type validation
 * - Required field validation
 * - Business rule validation
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Next middleware function
 */
const validateRequest = async (req, res, next) => {
  try {
    // Extract validation schema based on route
    const schema = getValidationSchema(req.route.path, req.method);
    
    if (!schema) {
      // No validation required for this route
      return next();
    }
    
    // Sanitize input data to prevent XSS
    const sanitizedBody = sanitizeInput(req.body);
    const sanitizedQuery = sanitizeInput(req.query);
    const sanitizedParams = sanitizeInput(req.params);
    
    // Validate against schema
    const validation = await schema.validate({
      body: sanitizedBody,
      query: sanitizedQuery,
      params: sanitizedParams
    });
    
    if (!validation.isValid) {
      // Return validation errors to client
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }
    
    // Replace request data with sanitized versions
    req.body = sanitizedBody;
    req.query = sanitizedQuery;
    req.params = sanitizedParams;
    
    next();
    
  } catch (error) {
    console.error('Validation middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal validation error'
    });
  }
};

/**
 * Helper function to sanitize user input
 * Prevents XSS attacks by escaping HTML entities
 * 
 * @param {Object|string|Array} input - Input data to sanitize
 * @returns {Object|string|Array} Sanitized data
 */
function sanitizeInput(input) {
  if (typeof input === 'string') {
    // Escape HTML entities to prevent XSS
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  if (Array.isArray(input)) {
    // Recursively sanitize array elements
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    // Recursively sanitize object properties
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  // Return primitive values unchanged
  return input;
}
```

This enhanced architecture guide provides:

1. **Modular Design**: Clean separation of core, business, and extension modules
2. **Configuration Management**: Module-based feature flags and configurations  
3. **Database Architecture**: Schema separation with migration management
4. **UI/UX Separation**: Theme and template systems independent of core
5. **Documentation Standards**: Comprehensive inline documentation examples
6. **Best Practices**: Enterprise-grade code structure and patterns

The system supports multi-tenant deployments where different clients can enable/disable specific modules based on their needs, while maintaining a clean, maintainable codebase.