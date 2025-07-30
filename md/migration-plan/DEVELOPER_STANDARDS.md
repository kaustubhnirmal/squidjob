# Developer Guidelines & Best Practices
# Enterprise Tender Management System

## Table of Contents
1. [Code Standards](#code-standards)
2. [Documentation Requirements](#documentation-requirements)
3. [Module Development](#module-development)
4. [Testing Standards](#testing-standards)
5. [Security Guidelines](#security-guidelines)
6. [Performance Optimization](#performance-optimization)
7. [Git Workflow](#git-workflow)
8. [Code Review Process](#code-review-process)

## Code Standards

### File Naming Conventions
```
Files and Directories:
├── kebab-case for directories: user-management/
├── PascalCase for React components: UserProfile.jsx
├── camelCase for JavaScript files: userService.js
├── UPPER_CASE for constants: DATABASE_CONFIG.js
└── lowercase for utility files: utils.js

Database:
├── snake_case for tables: user_profiles
├── snake_case for columns: first_name
└── UPPER_CASE for constants: DEFAULT_STATUS
```

### JavaScript/TypeScript Standards
```javascript
/**
 * @fileoverview User authentication service
 * @module AuthService
 * @requires bcrypt
 * @requires jsonwebtoken
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Logger } from '../utils/logger.js';

/**
 * Authentication service class
 * Handles user login, registration, and token management
 */
export class AuthService {
  /**
   * Initialize AuthService with configuration
   * @param {Object} config - Service configuration
   * @param {string} config.jwtSecret - JWT signing secret
   * @param {number} config.tokenExpiry - Token expiry in seconds
   */
  constructor(config) {
    this.config = {
      jwtSecret: config.jwtSecret || process.env.JWT_SECRET,
      tokenExpiry: config.tokenExpiry || 86400, // 24 hours
      saltRounds: config.saltRounds || 12
    };
    
    this.logger = new Logger('AuthService');
    
    // Validate required configuration
    if (!this.config.jwtSecret) {
      throw new Error('JWT secret is required for AuthService');
    }
  }
  
  /**
   * Authenticate user with email and password
   * @param {string} email - User email address
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} Authentication result with token and user data
   * @throws {AuthenticationError} When credentials are invalid
   */
  async authenticateUser(email, password) {
    try {
      // Input validation
      if (!email || !password) {
        throw new AuthenticationError('Email and password are required');
      }
      
      // Find user by email
      const user = await User.findByEmail(email);
      
      if (!user) {
        this.logger.warn('Login attempt with non-existent email', { email });
        throw new AuthenticationError('Invalid credentials');
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValidPassword) {
        this.logger.warn('Login attempt with invalid password', { 
          email, 
          userId: user.id 
        });
        throw new AuthenticationError('Invalid credentials');
      }
      
      // Check if user is active
      if (user.status !== 'active') {
        this.logger.warn('Login attempt by inactive user', { 
          email, 
          userId: user.id,
          status: user.status 
        });
        throw new AuthenticationError('Account is not active');
      }
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      // Update last login
      await user.updateLastLogin();
      
      this.logger.info('User authenticated successfully', { 
        userId: user.id, 
        email 
      });
      
      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        }
      };
      
    } catch (error) {
      this.logger.error('Authentication failed', { 
        email, 
        error: error.message 
      });
      throw error;
    }
  }
  
  /**
   * Generate JWT token for authenticated user
   * @private
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.tokenExpiry
    });
  }
}

/**
 * Custom authentication error class
 */
export class AuthenticationError extends Error {
  constructor(message, code = 'AUTH_FAILED') {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.statusCode = 401;
  }
}
```

### React Component Standards
```jsx
/**
 * @fileoverview Tender list component with filtering and pagination
 * @component TenderList
 * @requires react
 * @requires react-query
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { TenderCard } from './TenderCard';
import { SearchFilter } from './SearchFilter';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';

/**
 * Tender list component with advanced filtering and pagination
 * 
 * Features:
 * - Real-time search with debouncing
 * - Multiple filter options (status, authority, date range)
 * - Pagination with configurable page size
 * - Responsive grid layout
 * - Loading and error states
 * - Empty state handling
 * 
 * @param {Object} props - Component props
 * @param {Array} props.initialFilters - Initial filter values
 * @param {number} props.pageSize - Items per page (default: 12)
 * @param {Function} props.onTenderSelect - Callback for tender selection
 * @param {boolean} props.showAssigned - Show only assigned tenders
 * @returns {JSX.Element} Rendered tender list component
 */
export const TenderList = ({
  initialFilters = {},
  pageSize = 12,
  onTenderSelect,
  showAssigned = false
}) => {
  // State management
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    authority: 'all',
    dateFrom: null,
    dateTo: null,
    ...initialFilters
  });
  
  // Debounce search input to reduce API calls
  const debouncedSearch = useDebounce(filters.search, 500);
  
  // Pagination management
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalItems
  } = usePagination(pageSize);
  
  // Query client for cache management
  const queryClient = useQueryClient();
  
  // Memoized query parameters to prevent unnecessary re-renders
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    status: filters.status !== 'all' ? filters.status : undefined,
    authority: filters.authority !== 'all' ? filters.authority : undefined,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    assigned: showAssigned
  }), [
    currentPage, 
    pageSize, 
    debouncedSearch, 
    filters.status, 
    filters.authority, 
    filters.dateFrom, 
    filters.dateTo, 
    showAssigned
  ]);
  
  // Fetch tenders with React Query
  const {
    data: tendersData,
    isLoading,
    isError,
    error,
    isFetching
  } = useQuery({
    queryKey: ['tenders', queryParams],
    queryFn: ({ queryKey }) => fetchTenders(queryKey[1]),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      setTotalItems(data.pagination.total);
    }
  });
  
  /**
   * Handle filter changes with automatic page reset
   * @param {Object} newFilters - Updated filter values
   */
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, [setCurrentPage]);
  
  /**
   * Handle tender selection with callback
   * @param {Object} tender - Selected tender object
   */
  const handleTenderSelect = useCallback((tender) => {
    if (onTenderSelect) {
      onTenderSelect(tender);
    }
  }, [onTenderSelect]);
  
  /**
   * Refresh tender list and invalidate cache
   */
  const refreshTenders = useCallback(async () => {
    await queryClient.invalidateQueries(['tenders']);
  }, [queryClient]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="tender-list-container">
        <LoadingSpinner 
          message="Loading tenders..." 
          size="large" 
        />
      </div>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <div className="tender-list-container">
        <ErrorMessage 
          title="Failed to load tenders"
          message={error.message}
          onRetry={refreshTenders}
        />
      </div>
    );
  }
  
  const { tenders, pagination } = tendersData || { tenders: [], pagination: {} };
  
  return (
    <div className="tender-list-container">
      {/* Search and filter controls */}
      <div className="tender-list-header">
        <SearchFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isLoading={isFetching}
        />
        
        <div className="tender-list-actions">
          <button
            type="button"
            onClick={refreshTenders}
            className="btn btn-outline btn-sm"
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {/* Results summary */}
      <div className="tender-list-summary">
        <p className="text-sm text-gray-600">
          Showing {pagination.from || 0} to {pagination.to || 0} of{' '}
          {pagination.total || 0} tenders
        </p>
      </div>
      
      {/* Tender grid */}
      {tenders.length > 0 ? (
        <>
          <div className="tender-grid">
            {tenders.map((tender) => (
              <TenderCard
                key={tender.id}
                tender={tender}
                onSelect={() => handleTenderSelect(tender)}
                className="tender-grid-item"
              />
            ))}
          </div>
          
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="tender-list-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showSizeSelector={true}
                pageSizes={[12, 24, 48]}
                onSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No tenders found"
          message="Try adjusting your search criteria or filters"
          action={{
            label: "Clear filters",
            onClick: () => handleFiltersChange({
              search: '',
              status: 'all',
              authority: 'all',
              dateFrom: null,
              dateTo: null
            })
          }}
        />
      )}
    </div>
  );
};

/**
 * Fetch tenders from API
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Tender data with pagination
 */
async function fetchTenders(params) {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, value]) => value != null)
  ).toString();
  
  const response = await fetch(`/api/tenders?${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tenders: ${response.statusText}`);
  }
  
  return response.json();
}
```

## Documentation Requirements

### API Documentation Template
```javascript
/**
 * @api {post} /api/tenders Create New Tender
 * @apiName CreateTender
 * @apiGroup Tenders
 * @apiVersion 1.0.0
 * 
 * @apiDescription
 * Creates a new tender in the system with validation and audit logging.
 * Requires appropriate permissions and valid tender data.
 * 
 * @apiPermission create_tender
 * 
 * @apiHeader {String} Authorization Bearer JWT token
 * @apiHeader {String} Content-Type application/json
 * 
 * @apiParam {String} title Tender title (required, max 255 chars)
 * @apiParam {String} description Detailed tender description
 * @apiParam {String} authority Issuing authority (required)
 * @apiParam {String} location Tender location/jurisdiction
 * @apiParam {Date} deadline Submission deadline (ISO format)
 * @apiParam {Number} [emdAmount] EMD amount in rupees
 * @apiParam {Number} [documentFee] Document fee in rupees
 * @apiParam {Number} [estimatedValue] Estimated tender value
 * 
 * @apiParamExample {json} Request Example:
 * {
 *   "title": "Supply of IT Equipment",
 *   "description": "Procurement of laptops and accessories for government offices",
 *   "authority": "Delhi Municipal Corporation",
 *   "location": "New Delhi",
 *   "deadline": "2025-12-31T18:30:00.000Z",
 *   "emdAmount": 50000,
 *   "documentFee": 5000,
 *   "estimatedValue": 2500000
 * }
 * 
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} tender Created tender object
 * @apiSuccess {Number} tender.id Unique tender ID
 * @apiSuccess {String} tender.referenceNo Auto-generated reference number
 * @apiSuccess {String} tender.title Tender title
 * @apiSuccess {String} tender.status Current tender status (default: 'draft')
 * @apiSuccess {Date} tender.createdAt Creation timestamp
 * @apiSuccess {Number} tender.createdBy Creator user ID
 * 
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 201 Created
 * {
 *   "success": true,
 *   "tender": {
 *     "id": 123,
 *     "referenceNo": "TNR2025001",
 *     "title": "Supply of IT Equipment",
 *     "description": "Procurement of laptops and accessories for government offices",
 *     "authority": "Delhi Municipal Corporation",
 *     "location": "New Delhi",
 *     "deadline": "2025-12-31T18:30:00.000Z",
 *     "emdAmount": "50000.00",
 *     "documentFee": "5000.00",
 *     "estimatedValue": "2500000.00",
 *     "status": "draft",
 *     "createdAt": "2025-07-29T10:30:00.000Z",
 *     "createdBy": 5
 *   }
 * }
 * 
 * @apiError {Boolean} success=false Operation failed
 * @apiError {String} error Error message
 * @apiError {Object} [details] Detailed error information
 * 
 * @apiErrorExample {json} Validation Error:
 * HTTP/1.1 400 Bad Request
 * {
 *   "success": false,
 *   "error": "Validation failed",
 *   "details": {
 *     "title": "Title is required",
 *     "deadline": "Deadline must be in the future"
 *   }
 * }
 * 
 * @apiErrorExample {json} Permission Error:
 * HTTP/1.1 403 Forbidden
 * {
 *   "success": false,
 *   "error": "Insufficient permissions",
 *   "details": {
 *     "required": "create_tender",
 *     "current": ["view_tenders"]
 *   }
 * }
 * 
 * @apiSampleRequest /api/tenders
 */
```

### Database Schema Documentation
```sql
-- =====================================================
-- TENDER MANAGEMENT SCHEMA DOCUMENTATION
-- =====================================================

/**
 * Tenders table - Core tender information storage
 * 
 * This table stores all tender-related information including:
 * - Basic tender details (title, description, authority)
 * - Financial information (EMD, document fee, estimated value)
 * - Timeline information (deadline, submission date)
 * - Status tracking and workflow management
 * - Document attachments and references
 * - Audit trail (created by, created at, updated at)
 * 
 * Business Rules:
 * - Reference number must be unique and auto-generated
 * - Deadline must be in the future for new tenders
 * - Status follows predefined workflow (draft -> live -> submitted -> awarded/rejected)
 * - Only authorized users can create/modify tenders
 * - Soft delete is implemented (deleted_at field)
 * 
 * Indexes:
 * - Primary key on id (clustered)
 * - Unique index on reference_no
 * - Index on status for filtering
 * - Index on deadline for date-based queries
 * - Index on authority for grouping
 * - Composite index on (status, deadline) for dashboard queries
 * 
 * Relationships:
 * - Many-to-Many with users (tender_assignments)
 * - One-to-Many with documents (tender_documents)
 * - One-to-Many with bid participations
 * - One-to-Many with reminders
 */
CREATE TABLE tenders (
    -- Primary identifier
    id SERIAL PRIMARY KEY,
    
    -- Unique reference number (auto-generated: TNR2025001)
    reference_no VARCHAR(100) NOT NULL UNIQUE
        CONSTRAINT chk_reference_format 
        CHECK (reference_no ~ '^TNR[0-9]{4}[0-9]{3}$'),
    
    -- Basic tender information
    title VARCHAR(255) NOT NULL
        CONSTRAINT chk_title_length 
        CHECK (LENGTH(TRIM(title)) >= 5),
    
    description TEXT,
    
    -- Issuing authority information
    authority VARCHAR(255) NOT NULL
        CONSTRAINT chk_authority_not_empty 
        CHECK (LENGTH(TRIM(authority)) > 0),
    
    location VARCHAR(255),
    
    -- Timeline information
    deadline TIMESTAMP NOT NULL
        CONSTRAINT chk_deadline_future 
        CHECK (deadline > CURRENT_TIMESTAMP),
    
    submitted_date TIMESTAMP,
    
    -- Financial information (stored as DECIMAL for precision)
    emd_amount DECIMAL(15,2) DEFAULT 0.00
        CONSTRAINT chk_emd_positive 
        CHECK (emd_amount >= 0),
    
    document_fee DECIMAL(15,2) DEFAULT 0.00
        CONSTRAINT chk_doc_fee_positive 
        CHECK (document_fee >= 0),
    
    estimated_value DECIMAL(15,2)
        CONSTRAINT chk_estimated_value_positive 
        CHECK (estimated_value IS NULL OR estimated_value > 0),
    
    bid_value DECIMAL(15,2)
        CONSTRAINT chk_bid_value_positive 
        CHECK (bid_value IS NULL OR bid_value > 0),
    
    -- Status workflow (enum-like constraint)
    status VARCHAR(50) NOT NULL DEFAULT 'draft'
        CONSTRAINT chk_valid_status 
        CHECK (status IN ('draft', 'live', 'in_process', 'submitted', 'awarded', 'rejected', 'cancelled', 'completed')),
    
    -- Submission information
    submitted_by VARCHAR(255),
    
    -- Document paths for file attachments
    bid_document_path TEXT,
    atc_document_path TEXT,
    tech_specs_document_path TEXT,
    
    -- JSON fields for flexible data storage
    parsed_data JSONB,  -- Extracted document data
    item_categories TEXT[],  -- Array of item categories
    
    -- Audit trail fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    updated_by INTEGER,
    
    -- Soft delete support
    deleted_at TIMESTAMP NULL,
    deleted_by INTEGER NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_tender_creator 
        FOREIGN KEY (created_by) REFERENCES users(id),
    
    CONSTRAINT fk_tender_updater 
        FOREIGN KEY (updated_by) REFERENCES users(id),
    
    CONSTRAINT fk_tender_deleter 
        FOREIGN KEY (deleted_by) REFERENCES users(id)
);

-- Performance indexes
CREATE INDEX idx_tenders_reference_no ON tenders(reference_no);
CREATE INDEX idx_tenders_status ON tenders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenders_deadline ON tenders(deadline) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenders_authority ON tenders(authority) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenders_status_deadline ON tenders(status, deadline) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenders_created_by ON tenders(created_by);

-- JSON indexes for parsed_data queries
CREATE INDEX idx_tenders_parsed_data_gin ON tenders USING GIN(parsed_data) WHERE deleted_at IS NULL;

-- Trigger for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenders_updated_at 
    BEFORE UPDATE ON tenders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE tenders IS 'Core tender information with full lifecycle management';
COMMENT ON COLUMN tenders.reference_no IS 'Unique auto-generated reference (TNR2025001 format)';
COMMENT ON COLUMN tenders.parsed_data IS 'AI-extracted data from tender documents in JSON format';
COMMENT ON COLUMN tenders.item_categories IS 'Array of categorized items from bid document';
COMMENT ON COLUMN tenders.status IS 'Workflow status: draft->live->in_process->submitted->awarded/rejected';
```

This enhanced documentation provides comprehensive guidelines for maintaining code quality, consistency, and readability across the entire development team. Each section includes practical examples and enforces industry best practices for enterprise-grade software development.