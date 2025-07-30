# Module Configuration System
# Enterprise-Grade Modular Architecture

## Table of Contents
1. [Configuration Architecture](#configuration-architecture)
2. [Module Registry System](#module-registry-system)
3. [Feature Flag Management](#feature-flag-management)
4. [Environment-Based Configuration](#environment-based-configuration)
5. [Runtime Module Management](#runtime-module-management)
6. [Configuration Validation](#configuration-validation)
7. [Multi-Tenant Support](#multi-tenant-support)
8. [Migration & Deployment](#migration--deployment)

## Configuration Architecture

### Module Configuration Schema
```javascript
// modules/[module-name]/module.config.js
/**
 * Module Configuration Template
 * Defines module metadata, dependencies, features, and deployment settings
 */
export default {
  // Module Identity
  meta: {
    name: 'tender-management',
    displayName: 'Tender Management System',
    version: '2.1.0',
    description: 'Complete tender lifecycle management with AI-powered insights',
    category: 'business',
    tags: ['tender', 'procurement', 'government', 'compliance'],
    author: 'Development Team',
    license: 'MIT',
    homepage: 'https://docs.tender247.com/modules/tender-management',
    repository: 'https://github.com/company/tender247-modules'
  },
  
  // Module Dependencies
  dependencies: {
    // Core modules (always required)
    core: [
      { name: 'auth', version: '^1.0.0', required: true },
      { name: 'users', version: '^1.2.0', required: true },
      { name: 'permissions', version: '^1.1.0', required: true },
      { name: 'notifications', version: '^1.0.0', required: false }
    ],
    
    // Business modules (conditional)
    business: [
      { name: 'companies', version: '^1.0.0', required: true },
      { name: 'documents', version: '^1.1.0', required: true },
      { name: 'finance', version: '^1.0.0', required: false }
    ],
    
    // Extension modules (optional)
    extensions: [
      { name: 'ai-insights', version: '^1.0.0', required: false },
      { name: 'analytics', version: '^1.0.0', required: false },
      { name: 'reporting', version: '^1.0.0', required: false }
    ],
    
    // External services
    external: [
      { name: 'openai', version: '^4.0.0', required: false },
      { name: 'aws-s3', version: '^3.0.0', required: false }
    ]
  },
  
  // Module Configuration Options
  configuration: {
    // Default settings
    defaults: {
      enableAIAnalysis: false,
      autoAssignment: true,
      documentCompression: true,
      notificationEmail: true,
      auditLogging: true,
      cacheResults: true,
      maxFileSize: 52428800, // 50MB
      allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
      defaultStatus: 'draft',
      reminderDays: [7, 3, 1], // Days before deadline
      workflowSteps: ['draft', 'live', 'in_process', 'submitted', 'awarded', 'rejected']
    },
    
    // Environment-specific overrides
    environments: {
      development: {
        enableAIAnalysis: true,
        auditLogging: false,
        cacheResults: false,
        maxFileSize: 10485760 // 10MB for dev
      },
      testing: {
        enableAIAnalysis: false,
        notificationEmail: false,
        maxFileSize: 5242880 // 5MB for testing
      },
      production: {
        enableAIAnalysis: true,
        auditLogging: true,
        cacheResults: true,
        maxFileSize: 104857600 // 100MB for production
      }
    },
    
    // Feature flags
    features: {
      // Core features
      tenderCRUD: { enabled: true, editable: false },
      documentUpload: { enabled: true, editable: false },
      userAssignment: { enabled: true, editable: false },
      
      // Advanced features (configurable)
      aiAnalysis: { 
        enabled: false, 
        editable: true,
        dependencies: ['openai'],
        description: 'AI-powered document analysis and insights'
      },
      bulkOperations: { 
        enabled: true, 
        editable: true,
        description: 'Bulk import/export and batch operations'
      },
      advancedSearch: { 
        enabled: true, 
        editable: true,
        description: 'Advanced search with filters and facets'
      },
      workflow: { 
        enabled: true, 
        editable: true,
        description: 'Customizable tender workflow management'
      },
      approvals: { 
        enabled: false, 
        editable: true,
        dependencies: ['finance'],
        description: 'Multi-level approval workflow'
      },
      integration: { 
        enabled: false, 
        editable: true,
        dependencies: ['external'],
        description: 'Third-party system integration'
      }
    },
    
    // User interface customization
    ui: {
      theme: 'default',
      layout: 'modern',
      components: {
        tenderCard: 'enhanced',
        listView: 'table',
        detailView: 'tabbed'
      },
      customization: {
        allowThemeChange: true,
        allowLayoutChange: true,
        customCSS: true,
        customTemplates: true
      }
    },
    
    // API configuration
    api: {
      endpoints: {
        base: '/api/tenders',
        version: 'v1',
        rateLimit: 100, // requests per minute
        timeout: 30000 // 30 seconds
      },
      authentication: 'jwt',
      permissions: {
        view: 'view_tenders',
        create: 'create_tender',
        edit: 'edit_tender',
        delete: 'delete_tender',
        assign: 'assign_tender',
        approve: 'approve_tender'
      }
    }
  },
  
  // Database Schema Definition
  database: {
    // Tables to create
    tables: [
      {
        name: 'tenders',
        schema: 'tender_module.sql',
        indexes: ['reference_no', 'status', 'deadline', 'authority'],
        constraints: ['unique_reference', 'future_deadline']
      },
      {
        name: 'tender_assignments',
        schema: 'tender_assignments.sql',
        indexes: ['tender_id', 'user_id'],
        constraints: ['valid_assignment']
      },
      {
        name: 'tender_documents',
        schema: 'tender_documents.sql',
        indexes: ['tender_id', 'uploaded_by'],
        constraints: ['valid_file_path']
      }
    ],
    
    // Migration files
    migrations: [
      '001_create_tender_tables.sql',
      '002_add_ai_analysis_fields.sql',
      '003_add_workflow_columns.sql'
    ],
    
    // Seed data
    seeds: [
      'default_tender_statuses.sql',
      'sample_authorities.sql',
      'workflow_templates.sql'
    ]
  },
  
  // File Structure Definition
  structure: {
    backend: {
      controllers: ['TenderController.js', 'TenderDocumentController.js'],
      services: ['TenderService.js', 'TenderValidationService.js', 'TenderWorkflowService.js'],
      models: ['Tender.js', 'TenderDocument.js', 'TenderAssignment.js'],
      middleware: ['tenderPermissions.js', 'fileUpload.js'],
      routes: ['tender.routes.js', 'tenderDocument.routes.js'],
      validators: ['tenderValidation.js', 'documentValidation.js']
    },
    
    frontend: {
      pages: ['TenderList.jsx', 'TenderForm.jsx', 'TenderDetails.jsx'],
      components: ['TenderCard.jsx', 'TenderSearch.jsx', 'TenderFilters.jsx'],
      hooks: ['useTenders.js', 'useTenderSearch.js'],
      services: ['tenderAPI.js', 'tenderValidation.js'],
      styles: ['tender.module.css', 'tender-responsive.css']
    }
  },
  
  // Installation & Deployment
  installation: {
    // Pre-installation checks
    requirements: {
      nodeVersion: '>=18.0.0',
      memoryMin: '512MB',
      diskSpace: '100MB',
      dependencies: ['postgresql', 'redis']
    },
    
    // Installation steps
    steps: [
      { type: 'database', action: 'migrate' },
      { type: 'database', action: 'seed' },
      { type: 'files', action: 'copy' },
      { type: 'dependencies', action: 'install' },
      { type: 'configuration', action: 'setup' },
      { type: 'permissions', action: 'configure' }
    ],
    
    // Post-installation validation
    validation: [
      { type: 'database', check: 'tables_exist' },
      { type: 'api', check: 'endpoints_respond' },
      { type: 'permissions', check: 'access_control' },
      { type: 'files', check: 'uploads_writable' }
    ]
  },
  
  // Health & Monitoring
  monitoring: {
    healthChecks: [
      { name: 'database_connection', endpoint: '/health/db' },
      { name: 'file_system', endpoint: '/health/fs' },
      { name: 'external_services', endpoint: '/health/external' }
    ],
    
    metrics: [
      { name: 'tender_creation_rate', type: 'counter' },
      { name: 'document_upload_size', type: 'histogram' },
      { name: 'search_query_time', type: 'histogram' },
      { name: 'active_tenders', type: 'gauge' }
    ],
    
    alerts: [
      { condition: 'tender_creation_rate > 100/min', severity: 'warning' },
      { condition: 'document_upload_failure > 5%', severity: 'error' },
      { condition: 'database_connection_failed', severity: 'critical' }
    ]
  }
};
```

### Module Registry Implementation
```javascript
// core/modules/ModuleRegistry.js
/**
 * Centralized Module Registry
 * Manages module discovery, loading, and lifecycle
 */
import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger.js';

export class ModuleRegistry extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.modules = new Map();
    this.loadOrder = [];
    this.dependencyGraph = new Map();
    this.featureFlags = new Map();
    this.configurations = new Map();
    
    this.logger = new Logger('ModuleRegistry');
    this.options = {
      autoLoad: true,
      validateDependencies: true,
      enableHotReload: false,
      ...options
    };
    
    this.state = 'initialized';
  }
  
  /**
   * Discover and register all available modules
   * @param {string} modulesPath - Path to modules directory
   */
  async discoverModules(modulesPath = './modules') {
    try {
      this.logger.info('Starting module discovery', { path: modulesPath });
      
      const moduleDirectories = await this.scanModuleDirectories(modulesPath);
      
      for (const moduleDir of moduleDirectories) {
        await this.registerModuleFromDirectory(moduleDir);
      }
      
      this.logger.info('Module discovery completed', { 
        found: this.modules.size,
        modules: Array.from(this.modules.keys())
      });
      
      this.emit('modules-discovered', { modules: this.modules });
      
    } catch (error) {
      this.logger.error('Module discovery failed', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Register a module from its directory
   * @param {string} moduleDir - Module directory path
   */
  async registerModuleFromDirectory(moduleDir) {
    try {
      // Load module configuration
      const configPath = `${moduleDir}/module.config.js`;
      const moduleConfig = await import(configPath);
      const config = moduleConfig.default || moduleConfig;
      
      // Validate configuration
      this.validateModuleConfig(config);
      
      // Register module
      await this.registerModule(config, moduleDir);
      
    } catch (error) {
      this.logger.warn('Failed to register module from directory', {
        directory: moduleDir,
        error: error.message
      });
    }
  }
  
  /**
   * Register a module with the registry
   * @param {Object} config - Module configuration
   * @param {string} modulePath - Module file path
   */
  async registerModule(config, modulePath) {
    const moduleName = config.meta.name;
    
    try {
      // Check if module already exists
      if (this.modules.has(moduleName)) {
        throw new Error(`Module ${moduleName} is already registered`);
      }
      
      // Validate dependencies
      if (this.options.validateDependencies) {
        await this.validateDependencies(config);
      }
      
      // Create module entry
      const moduleEntry = {
        config,
        path: modulePath,
        state: 'registered',
        instance: null,
        dependencies: this.extractDependencies(config),
        dependents: new Set(),
        loadedAt: null,
        error: null
      };
      
      // Register module
      this.modules.set(moduleName, moduleEntry);
      
      // Update dependency graph
      this.updateDependencyGraph(moduleName, moduleEntry.dependencies);
      
      // Register feature flags
      this.registerFeatureFlags(moduleName, config.configuration.features);
      
      // Store configuration
      this.configurations.set(moduleName, config.configuration);
      
      this.logger.info('Module registered successfully', {
        module: moduleName,
        version: config.meta.version,
        dependencies: moduleEntry.dependencies.length
      });
      
      this.emit('module-registered', { module: moduleName, config });
      
    } catch (error) {
      this.logger.error('Module registration failed', {
        module: moduleName,
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Load all registered modules in dependency order
   */
  async loadModules() {
    try {
      this.state = 'loading';
      this.logger.info('Starting module loading process');
      
      // Calculate load order
      this.calculateLoadOrder();
      
      // Load modules in order
      const loadResults = [];
      
      for (const moduleName of this.loadOrder) {
        try {
          const result = await this.loadModule(moduleName);
          loadResults.push({ module: moduleName, success: true, result });
          
        } catch (error) {
          this.logger.error('Module loading failed', {
            module: moduleName,
            error: error.message
          });
          
          loadResults.push({ 
            module: moduleName, 
            success: false, 
            error: error.message 
          });
          
          // Handle loading failure based on module criticality
          const moduleEntry = this.modules.get(moduleName);
          if (moduleEntry.config.meta.category === 'core') {
            throw new Error(`Critical module failed to load: ${moduleName}`);
          }
        }
      }
      
      this.state = 'loaded';
      this.logger.info('Module loading completed', {
        total: this.loadOrder.length,
        successful: loadResults.filter(r => r.success).length,
        failed: loadResults.filter(r => !r.success).length
      });
      
      this.emit('modules-loaded', { results: loadResults });
      
      return loadResults;
      
    } catch (error) {
      this.state = 'error';
      this.logger.error('Module loading process failed', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Load a specific module
   * @param {string} moduleName - Name of module to load
   */
  async loadModule(moduleName) {
    const moduleEntry = this.modules.get(moduleName);
    
    if (!moduleEntry) {
      throw new Error(`Module not found: ${moduleName}`);
    }
    
    if (moduleEntry.state === 'loaded') {
      return moduleEntry.instance;
    }
    
    if (moduleEntry.state === 'loading') {
      throw new Error(`Circular dependency detected: ${moduleName}`);
    }
    
    try {
      moduleEntry.state = 'loading';
      
      // Load dependencies first
      for (const depName of moduleEntry.dependencies) {
        await this.loadModule(depName);
      }
      
      // Import module main file
      const modulePath = `${moduleEntry.path}/index.js`;
      const ModuleClass = await import(modulePath);
      
      // Create module instance
      const moduleInstance = new (ModuleClass.default || ModuleClass)(
        moduleEntry.config,
        this
      );
      
      // Initialize module
      if (typeof moduleInstance.initialize === 'function') {
        await moduleInstance.initialize();
      }
      
      // Update module entry
      moduleEntry.instance = moduleInstance;
      moduleEntry.state = 'loaded';
      moduleEntry.loadedAt = new Date();
      
      this.logger.info('Module loaded successfully', {
        module: moduleName,
        version: moduleEntry.config.meta.version
      });
      
      this.emit('module-loaded', { module: moduleName, instance: moduleInstance });
      
      return moduleInstance;
      
    } catch (error) {
      moduleEntry.state = 'error';
      moduleEntry.error = error;
      
      this.logger.error('Module loading failed', {
        module: moduleName,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Unload a module and its dependents
   * @param {string} moduleName - Name of module to unload
   */
  async unloadModule(moduleName) {
    const moduleEntry = this.modules.get(moduleName);
    
    if (!moduleEntry || moduleEntry.state !== 'loaded') {
      return;
    }
    
    try {
      // Unload dependents first
      for (const dependent of moduleEntry.dependents) {
        await this.unloadModule(dependent);
      }
      
      // Call module cleanup
      if (moduleEntry.instance && typeof moduleEntry.instance.cleanup === 'function') {
        await moduleEntry.instance.cleanup();
      }
      
      // Update module state
      moduleEntry.state = 'registered';
      moduleEntry.instance = null;
      moduleEntry.loadedAt = null;
      
      this.logger.info('Module unloaded successfully', { module: moduleName });
      this.emit('module-unloaded', { module: moduleName });
      
    } catch (error) {
      this.logger.error('Module unloading failed', {
        module: moduleName,
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Get module information
   * @param {string} moduleName - Module name
   * @returns {Object} Module information
   */
  getModuleInfo(moduleName) {
    const moduleEntry = this.modules.get(moduleName);
    
    if (!moduleEntry) {
      return null;
    }
    
    return {
      name: moduleName,
      version: moduleEntry.config.meta.version,
      state: moduleEntry.state,
      dependencies: moduleEntry.dependencies,
      dependents: Array.from(moduleEntry.dependents),
      loadedAt: moduleEntry.loadedAt,
      error: moduleEntry.error,
      features: this.getModuleFeatures(moduleName)
    };
  }
  
  /**
   * Get all registered modules
   * @param {string} category - Filter by category
   * @returns {Array} List of modules
   */
  getModules(category = null) {
    const modules = [];
    
    for (const [name, entry] of this.modules) {
      if (!category || entry.config.meta.category === category) {
        modules.push(this.getModuleInfo(name));
      }
    }
    
    return modules;
  }
  
  /**
   * Enable/disable module feature
   * @param {string} moduleName - Module name
   * @param {string} featureName - Feature name
   * @param {boolean} enabled - Enable/disable state
   */
  setFeatureFlag(moduleName, featureName, enabled) {
    const flagKey = `${moduleName}.${featureName}`;
    const currentFlag = this.featureFlags.get(flagKey);
    
    if (!currentFlag) {
      throw new Error(`Feature flag not found: ${flagKey}`);
    }
    
    if (!currentFlag.editable) {
      throw new Error(`Feature flag is not editable: ${flagKey}`);
    }
    
    // Update flag
    this.featureFlags.set(flagKey, {
      ...currentFlag,
      enabled
    });
    
    this.logger.info('Feature flag updated', {
      module: moduleName,
      feature: featureName,
      enabled
    });
    
    this.emit('feature-flag-changed', { 
      module: moduleName, 
      feature: featureName, 
      enabled 
    });
  }
  
  /**
   * Check if feature is enabled
   * @param {string} moduleName - Module name
   * @param {string} featureName - Feature name
   * @returns {boolean} Feature enabled state
   */
  isFeatureEnabled(moduleName, featureName) {
    const flagKey = `${moduleName}.${featureName}`;
    const flag = this.featureFlags.get(flagKey);
    
    return flag ? flag.enabled : false;
  }
  
  /**
   * Get module configuration
   * @param {string} moduleName - Module name
   * @returns {Object} Module configuration
   */
  getModuleConfiguration(moduleName) {
    return this.configurations.get(moduleName);
  }
  
  /**
   * Update module configuration
   * @param {string} moduleName - Module name
   * @param {Object} updates - Configuration updates
   */
  updateModuleConfiguration(moduleName, updates) {
    const currentConfig = this.configurations.get(moduleName);
    
    if (!currentConfig) {
      throw new Error(`Module configuration not found: ${moduleName}`);
    }
    
    // Merge updates
    const updatedConfig = this.mergeConfiguration(currentConfig, updates);
    
    // Validate updated configuration
    this.validateConfiguration(moduleName, updatedConfig);
    
    // Store updated configuration
    this.configurations.set(moduleName, updatedConfig);
    
    this.logger.info('Module configuration updated', {
      module: moduleName,
      changes: Object.keys(updates)
    });
    
    this.emit('module-configuration-updated', { 
      module: moduleName, 
      configuration: updatedConfig 
    });
  }
  
  // Private helper methods...
  
  /**
   * Calculate module load order based on dependencies
   */
  calculateLoadOrder() {
    const visited = new Set();
    const visiting = new Set();
    const order = [];
    
    const visit = (moduleName) => {
      if (visiting.has(moduleName)) {
        throw new Error(`Circular dependency detected: ${moduleName}`);
      }
      
      if (visited.has(moduleName)) {
        return;
      }
      
      visiting.add(moduleName);
      
      const moduleEntry = this.modules.get(moduleName);
      if (moduleEntry) {
        for (const depName of moduleEntry.dependencies) {
          visit(depName);
        }
      }
      
      visiting.delete(moduleName);
      visited.add(moduleName);
      order.push(moduleName);
    };
    
    // Visit all modules
    for (const moduleName of this.modules.keys()) {
      visit(moduleName);
    }
    
    this.loadOrder = order;
  }
  
  /**
   * Extract dependencies from module configuration
   * @param {Object} config - Module configuration
   * @returns {Array} List of dependency names
   */
  extractDependencies(config) {
    const dependencies = [];
    
    // Add core dependencies
    if (config.dependencies.core) {
      dependencies.push(...config.dependencies.core.map(dep => dep.name));
    }
    
    // Add business dependencies
    if (config.dependencies.business) {
      dependencies.push(...config.dependencies.business.map(dep => dep.name));
    }
    
    // Add extension dependencies (if enabled)
    if (config.dependencies.extensions) {
      dependencies.push(...config.dependencies.extensions.map(dep => dep.name));
    }
    
    return dependencies;
  }
  
  /**
   * Register feature flags for a module
   * @param {string} moduleName - Module name
   * @param {Object} features - Feature configuration
   */
  registerFeatureFlags(moduleName, features) {
    Object.entries(features).forEach(([featureName, config]) => {
      const flagKey = `${moduleName}.${featureName}`;
      
      this.featureFlags.set(flagKey, {
        module: moduleName,
        feature: featureName,
        enabled: config.enabled,
        editable: config.editable,
        dependencies: config.dependencies || [],
        description: config.description || ''
      });
    });
  }
}

// Export singleton instance
export const moduleRegistry = new ModuleRegistry();
```

This comprehensive module configuration system provides enterprise-grade modularity with proper dependency management, feature flags, and runtime configuration capabilities, enabling the system to scale and adapt to different deployment scenarios.