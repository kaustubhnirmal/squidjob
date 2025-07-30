# Modular Architecture Documentation
# Comprehensive Module System Design

## Architecture Overview

### Core Principles
The Tender Management System follows a modular architecture that separates concerns into distinct, manageable modules. This approach ensures maintainability, scalability, and flexibility for different deployment scenarios.

```
System Architecture
├── Core Modules (Essential)
│   ├── Authentication & Authorization
│   ├── User Management
│   ├── Role & Permission System
│   └── System Configuration
├── Business Modules (Configurable)
│   ├── Tender Management
│   ├── Company & Vendor Management
│   ├── Bid Participation System
│   ├── Financial Management
│   ├── Document Management
│   └── Analytics & Reporting
└── Extension Modules (Optional)
    ├── AI/ML Insights
    ├── CRM Integration
    ├── Advanced Analytics
    └── Third-party Connectors
```

## Module Structure

### Standard Module Organization
```
modules/
├── [module-name]/
│   ├── backend/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── validators/
│   ├── frontend/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── styles/
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── schema.sql
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── docs/
│   └── module.config.js
```

### Module Configuration Schema
```javascript
// modules/tender-management/module.config.js
export default {
  // Module Identity
  meta: {
    name: 'tender-management',
    displayName: 'Tender Management',
    version: '1.0.0',
    description: 'Complete tender lifecycle management',
    category: 'business',
    author: 'Development Team'
  },

  // Dependencies
  dependencies: {
    core: ['auth', 'users', 'permissions'],
    business: ['companies', 'documents'],
    extensions: []
  },

  // Configuration Options
  configuration: {
    features: {
      aiAnalysis: { enabled: false, editable: true },
      bulkOperations: { enabled: true, editable: true },
      advancedSearch: { enabled: true, editable: true }
    },
    
    defaults: {
      maxFileSize: 52428800, // 50MB
      allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
      defaultStatus: 'draft'
    }
  },

  // Database Requirements
  database: {
    tables: ['tenders', 'tender_assignments', 'tender_documents'],
    migrations: ['001_create_tenders.sql'],
    seeds: ['default_statuses.sql']
  },

  // API Endpoints
  api: {
    prefix: '/api/tenders',
    routes: ['tender.routes.js'],
    permissions: ['view_tenders', 'create_tender', 'edit_tender']
  }
};
```

## Core Module Implementations

### 1. Authentication Module
```javascript
// modules/auth/backend/services/AuthService.js
export class AuthService {
  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} Authentication result
   */
  async authenticateUser(email, password) {
    // Input validation
    if (!email || !password) {
      throw new AuthenticationError('Email and password are required');
    }

    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      success: true,
      token,
      user: this.sanitizeUser(user)
    };
  }

  /**
   * Generate JWT token for user
   * @private
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });
  }
}
```

### 2. Tender Management Module
```javascript
// modules/tender-management/backend/services/TenderService.js
export class TenderService {
  /**
   * Create new tender with validation and processing
   * @param {Object} tenderData - Tender information
   * @param {number} userId - Creating user ID
   * @returns {Promise<Object>} Created tender
   */
  async createTender(tenderData, userId) {
    // Validate input data
    const validation = await this.validateTenderData(tenderData);
    if (!validation.isValid) {
      throw new ValidationError('Invalid tender data', validation.errors);
    }

    // Generate reference number
    const referenceNo = await this.generateReferenceNumber();

    // Prepare tender data
    const tender = {
      ...tenderData,
      referenceNo,
      status: 'draft',
      createdBy: userId,
      createdAt: new Date()
    };

    // Insert into database
    const createdTender = await this.db.tenders.create(tender);

    // Process documents if uploaded
    if (tenderData.documents) {
      await this.processDocuments(createdTender.id, tenderData.documents);
    }

    // Send notifications
    await this.notificationService.notifyTenderCreated(createdTender);

    return createdTender;
  }

  /**
   * Generate unique reference number
   * @private
   * @returns {Promise<string>} Reference number
   */
  async generateReferenceNumber() {
    const year = new Date().getFullYear();
    const prefix = `TNR${year}`;
    
    const latest = await this.db.tenders.findLatestByPrefix(prefix);
    const sequence = latest ? parseInt(latest.referenceNo.slice(7)) + 1 : 1;
    
    return `${prefix}${sequence.toString().padStart(3, '0')}`;
  }
}
```

### 3. Document Management Module
```javascript
// modules/document-management/backend/services/DocumentService.js
export class DocumentService {
  /**
   * Upload and process document
   * @param {Object} file - Uploaded file object
   * @param {number} tenderId - Associated tender ID
   * @param {number} userId - Uploading user ID
   * @returns {Promise<Object>} Document record
   */
  async uploadDocument(file, tenderId, userId) {
    // Validate file
    await this.validateFile(file);

    // Generate unique filename
    const filename = this.generateFilename(file);

    // Save file to storage
    const filePath = await this.saveFile(file, filename);

    // Extract metadata
    const metadata = await this.extractMetadata(file);

    // Create document record
    const document = await this.db.documents.create({
      tenderId,
      originalName: file.originalname,
      filename,
      filePath,
      mimeType: file.mimetype,
      size: file.size,
      metadata,
      uploadedBy: userId,
      uploadedAt: new Date()
    });

    // Process document (extract text, generate thumbnail)
    await this.processDocumentAsync(document.id);

    return document;
  }

  /**
   * Extract text content from document
   * @param {number} documentId - Document ID
   * @returns {Promise<string>} Extracted text
   */
  async extractTextContent(documentId) {
    const document = await this.db.documents.findById(documentId);
    
    switch (document.mimeType) {
      case 'application/pdf':
        return await this.extractPdfText(document.filePath);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await this.extractDocxText(document.filePath);
      default:
        throw new Error('Unsupported document type');
    }
  }
}
```

## Database Module Architecture

### Schema Design Pattern
```sql
-- Modular schema approach with prefixes
-- Core schema (always present)
CREATE SCHEMA core;

-- Module-specific schemas
CREATE SCHEMA tender_module;
CREATE SCHEMA company_module;
CREATE SCHEMA document_module;

-- Example: Tender module tables
CREATE TABLE tender_module.tenders (
    id SERIAL PRIMARY KEY,
    reference_no VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    authority VARCHAR(255) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    
    -- Financial information
    emd_amount DECIMAL(15,2) DEFAULT 0.00,
    document_fee DECIMAL(15,2) DEFAULT 0.00,
    estimated_value DECIMAL(15,2),
    
    -- Module configuration
    module_config JSONB,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    
    -- Foreign key to core schema
    CONSTRAINT fk_tender_creator 
        FOREIGN KEY (created_by) REFERENCES core.users(id)
);

-- Module-specific indexes
CREATE INDEX idx_tender_status ON tender_module.tenders(status);
CREATE INDEX idx_tender_deadline ON tender_module.tenders(deadline);
CREATE INDEX idx_tender_reference ON tender_module.tenders(reference_no);
```

### Migration Management
```javascript
// modules/tender-management/database/migrations/001_create_tenders.sql
/**
 * Migration: Create tenders table
 * Module: tender-management
 * Version: 1.0.0
 * Description: Initial tender management tables
 */

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS tender_module;

-- Create tenders table
CREATE TABLE tender_module.tenders (
    -- Primary key and reference
    id SERIAL PRIMARY KEY,
    reference_no VARCHAR(100) NOT NULL UNIQUE,
    
    -- Basic information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    authority VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    
    -- Timeline
    deadline TIMESTAMP NOT NULL,
    submitted_date TIMESTAMP,
    
    -- Financial
    emd_amount DECIMAL(15,2) DEFAULT 0.00,
    document_fee DECIMAL(15,2) DEFAULT 0.00,
    estimated_value DECIMAL(15,2),
    
    -- Status and workflow
    status VARCHAR(50) DEFAULT 'draft',
    
    -- Module configuration
    module_config JSONB DEFAULT '{}',
    
    -- Audit trail
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    updated_by INTEGER,
    
    -- Constraints
    CONSTRAINT chk_deadline_future 
        CHECK (deadline > created_at),
    CONSTRAINT chk_valid_status 
        CHECK (status IN ('draft', 'live', 'in_process', 'submitted', 'awarded', 'rejected')),
    CONSTRAINT fk_tender_creator 
        FOREIGN KEY (created_by) REFERENCES core.users(id)
);

-- Create indexes for performance
CREATE INDEX idx_tenders_status ON tender_module.tenders(status);
CREATE INDEX idx_tenders_deadline ON tender_module.tenders(deadline);
CREATE INDEX idx_tenders_authority ON tender_module.tenders(authority);
CREATE INDEX idx_tenders_created_by ON tender_module.tenders(created_by);

-- Create full-text search index
CREATE INDEX idx_tenders_search ON tender_module.tenders 
USING gin(to_tsvector('english', title || ' ' || description || ' ' || authority));
```

## Frontend Module Integration

### Component Architecture
```jsx
// modules/tender-management/frontend/components/TenderCard.jsx
import React from 'react';
import { useModuleConfig } from '../../../core/hooks/useModuleConfig';
import { Card, Badge, Button } from '../../../core/components';

/**
 * Tender Card Component
 * Displays tender information in card format
 * Configurable based on module settings
 */
export const TenderCard = ({ tender, onSelect, className }) => {
  const { config } = useModuleConfig('tender-management');
  
  return (
    <Card className={`tender-card ${className}`} onClick={() => onSelect(tender)}>
      {/* Card Header */}
      <Card.Header>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{tender.title}</h3>
            <p className="text-sm text-gray-600">{tender.referenceNo}</p>
          </div>
          <Badge variant={getStatusVariant(tender.status)}>
            {tender.status}
          </Badge>
        </div>
      </Card.Header>

      {/* Card Content */}
      <Card.Content>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <span className="font-medium">Authority:</span>
            <span className="ml-2">{tender.authority}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="font-medium">Deadline:</span>
            <span className="ml-2">{formatDate(tender.deadline)}</span>
          </div>
          {config.features.showEstimatedValue && tender.estimatedValue && (
            <div className="flex items-center text-sm">
              <span className="font-medium">Value:</span>
              <span className="ml-2">₹ {formatCurrency(tender.estimatedValue)}</span>
            </div>
          )}
        </div>
      </Card.Content>

      {/* Card Actions */}
      <Card.Footer>
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            {tender.assignments?.slice(0, 3).map((assignment) => (
              <Avatar
                key={assignment.id}
                src={assignment.user.avatar}
                name={assignment.user.name}
                size="sm"
              />
            ))}
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">View</Button>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
};
```

### Module Hook Pattern
```javascript
// modules/tender-management/frontend/hooks/useTenders.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useModuleConfig } from '../../../core/hooks/useModuleConfig';
import { tenderAPI } from '../services/tenderAPI';

/**
 * Custom hook for tender operations
 * Provides CRUD operations with caching and optimizations
 */
export const useTenders = (filters = {}) => {
  const queryClient = useQueryClient();
  const { config } = useModuleConfig('tender-management');

  // Query for fetching tenders
  const tendersQuery = useQuery({
    queryKey: ['tenders', filters],
    queryFn: () => tenderAPI.getTenders(filters),
    staleTime: config.caching?.tenderList || 5 * 60 * 1000,
    keepPreviousData: true
  });

  // Mutation for creating tenders
  const createTenderMutation = useMutation({
    mutationFn: tenderAPI.createTender,
    onSuccess: (newTender) => {
      // Update cache with new tender
      queryClient.setQueryData(['tenders', filters], (oldData) => {
        if (!oldData) return { tenders: [newTender], pagination: {} };
        return {
          ...oldData,
          tenders: [newTender, ...oldData.tenders]
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries(['tenders']);
      queryClient.invalidateQueries(['dashboard', 'stats']);
    }
  });

  // Mutation for updating tenders
  const updateTenderMutation = useMutation({
    mutationFn: ({ id, ...data }) => tenderAPI.updateTender(id, data),
    onSuccess: (updatedTender) => {
      // Update specific tender in cache
      queryClient.setQueryData(['tender', updatedTender.id], updatedTender);
      
      // Update tender in list cache
      queryClient.setQueryData(['tenders', filters], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          tenders: oldData.tenders.map(tender => 
            tender.id === updatedTender.id ? updatedTender : tender
          )
        };
      });
    }
  });

  return {
    // Data
    tenders: tendersQuery.data?.tenders || [],
    pagination: tendersQuery.data?.pagination || {},
    
    // States
    isLoading: tendersQuery.isLoading,
    isError: tendersQuery.isError,
    error: tendersQuery.error,
    
    // Actions
    createTender: createTenderMutation.mutate,
    updateTender: updateTenderMutation.mutate,
    isCreating: createTenderMutation.isPending,
    isUpdating: updateTenderMutation.isPending,
    
    // Utilities
    refetch: tendersQuery.refetch
  };
};
```

This modular architecture documentation provides the development team with a clear understanding of how to organize, implement, and maintain the system's modular structure.