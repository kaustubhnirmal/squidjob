# Database Schema Documentation
# Complete Data Structure and Relationships

## Schema Overview

### Database Architecture
The Tender Management System uses PostgreSQL with a modular schema design that separates core functionality from business modules.

```
Database Structure
├── Core Schema (Always Required)
│   ├── users - User accounts and authentication
│   ├── roles - Role definitions and hierarchy
│   ├── permissions - Granular permission system
│   ├── user_roles - User-role assignments
│   ├── role_permissions - Role-permission mappings
│   └── system_settings - Application configuration
├── Business Schema (Module-Based)
│   ├── tenders - Core tender information
│   ├── tender_assignments - User-tender relationships
│   ├── tender_documents - Document attachments
│   ├── companies - Vendor/dealer database
│   ├── bid_participations - Bid tracking
│   └── financial_records - Financial transactions
└── Support Schema (Operational)
    ├── audit_logs - Change tracking
    ├── notifications - System notifications
    ├── file_uploads - File metadata
    └── search_indexes - Full-text search
```

## Core Tables

### 1. Users Table
```sql
-- User accounts and authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    
    -- Authentication
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    
    -- Organization
    department VARCHAR(100),
    designation VARCHAR(100),
    employee_id VARCHAR(50),
    
    -- Status and Security
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Security tokens
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    -- Foreign key constraints
    CONSTRAINT fk_user_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_last_login ON users(last_login);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with authentication and profile information';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hashed password with 12 salt rounds';
COMMENT ON COLUMN users.status IS 'User account status affecting login permissions';
```

### 2. Roles Table
```sql
-- Role-based access control roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    
    -- Role identification
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Role hierarchy and properties
    level INTEGER DEFAULT 1,
    is_system_role BOOLEAN DEFAULT false,
    is_default_role BOOLEAN DEFAULT false,
    
    -- Status
    active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_role_level CHECK (level > 0),
    CONSTRAINT fk_role_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Default roles data
INSERT INTO roles (name, display_name, description, level, is_system_role, created_by) VALUES
('admin', 'System Administrator', 'Complete system access and management', 1, true, 1),
('tender_manager', 'Tender Manager', 'Tender oversight and team management', 2, true, 1),
('sales_head', 'Sales Head', 'Business development and client relations', 3, true, 1),
('accountant', 'Accountant', 'Financial management and reporting', 4, true, 1),
('user', 'Team Member', 'Basic tender processing access', 5, true, 1);
```

### 3. Permissions Table
```sql
-- Granular permission system
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    
    -- Permission identification
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Permission grouping
    module VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    
    -- Permission properties
    is_system_permission BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    
    -- Status
    active BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    
    CONSTRAINT fk_permission_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Permission categories
INSERT INTO permissions (name, display_name, description, module, category, is_system_permission, created_by) VALUES
-- User management permissions
('view_users', 'View Users', 'View user profiles and lists', 'users', 'read', true, 1),
('create_user', 'Create User', 'Create new user accounts', 'users', 'write', true, 1),
('edit_user', 'Edit User', 'Modify user profiles and settings', 'users', 'write', true, 1),
('delete_user', 'Delete User', 'Remove user accounts from system', 'users', 'delete', true, 1),

-- Tender management permissions
('view_tenders', 'View Tenders', 'View tender information and lists', 'tenders', 'read', false, 1),
('create_tender', 'Create Tender', 'Create new tender entries', 'tenders', 'write', false, 1),
('edit_tender', 'Edit Tender', 'Modify tender information', 'tenders', 'write', false, 1),
('delete_tender', 'Delete Tender', 'Remove tenders from system', 'tenders', 'delete', false, 1),
('assign_tender', 'Assign Tender', 'Assign tenders to team members', 'tenders', 'manage', false, 1),
('approve_tender', 'Approve Tender', 'Approve tender submissions', 'tenders', 'approve', false, 1);
```

## Business Tables

### 1. Tenders Table
```sql
-- Core tender information
CREATE TABLE tenders (
    id SERIAL PRIMARY KEY,
    
    -- Identification
    reference_no VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Authority and location
    authority VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    
    -- Timeline information
    deadline TIMESTAMP NOT NULL,
    published_date DATE,
    submitted_date TIMESTAMP,
    
    -- Financial information (stored as DECIMAL for precision)
    emd_amount DECIMAL(15,2) DEFAULT 0.00,
    document_fee DECIMAL(15,2) DEFAULT 0.00,
    estimated_value DECIMAL(15,2),
    bid_value DECIMAL(15,2),
    
    -- Status workflow
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
    -- Document paths
    bid_document_path TEXT,
    atc_document_path TEXT,
    tech_specs_document_path TEXT,
    
    -- Additional data
    parsed_data JSONB,
    item_categories TEXT[],
    
    -- Submission information
    submitted_by VARCHAR(255),
    submission_method VARCHAR(50),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    updated_by INTEGER,
    
    -- Soft delete
    deleted_at TIMESTAMP NULL,
    deleted_by INTEGER NULL,
    
    -- Constraints
    CONSTRAINT chk_deadline_future CHECK (deadline > created_at),
    CONSTRAINT chk_valid_status CHECK (status IN (
        'draft', 'live', 'in_process', 'submitted', 
        'awarded', 'rejected', 'cancelled', 'completed'
    )),
    CONSTRAINT chk_emd_positive CHECK (emd_amount >= 0),
    CONSTRAINT chk_doc_fee_positive CHECK (document_fee >= 0),
    CONSTRAINT chk_estimated_value_positive CHECK (estimated_value IS NULL OR estimated_value > 0),
    
    -- Foreign keys
    CONSTRAINT fk_tender_creator FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_tender_updater FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT fk_tender_deleter FOREIGN KEY (deleted_by) REFERENCES users(id)
);

-- Performance indexes
CREATE INDEX idx_tenders_reference_no ON tenders(reference_no);
CREATE INDEX idx_tenders_status ON tenders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenders_deadline ON tenders(deadline) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenders_authority ON tenders(authority) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenders_status_deadline ON tenders(status, deadline) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenders_created_by ON tenders(created_by);

-- Full-text search index
CREATE INDEX idx_tenders_search ON tenders 
USING gin(to_tsvector('english', title || ' ' || description || ' ' || authority)) 
WHERE deleted_at IS NULL;

-- JSON indexes for parsed_data
CREATE INDEX idx_tenders_parsed_data ON tenders USING gin(parsed_data) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE tenders IS 'Core tender information with complete lifecycle management';
COMMENT ON COLUMN tenders.reference_no IS 'Unique auto-generated reference (TNR2025001 format)';
COMMENT ON COLUMN tenders.parsed_data IS 'AI-extracted data from tender documents in JSON format';
COMMENT ON COLUMN tenders.status IS 'Workflow status following predefined state machine';
```

### 2. Tender Assignments Table
```sql
-- User-tender assignments for team collaboration
CREATE TABLE tender_assignments (
    id SERIAL PRIMARY KEY,
    
    -- Assignment relationships
    tender_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    
    -- Assignment details
    role VARCHAR(100) NOT NULL,
    responsibility TEXT,
    
    -- Status and timeline
    status VARCHAR(50) DEFAULT 'assigned',
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date TIMESTAMP,
    completion_date TIMESTAMP,
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0,
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_valid_assignment_status CHECK (status IN (
        'assigned', 'in_progress', 'completed', 'on_hold', 'cancelled'
    )),
    CONSTRAINT chk_progress_range CHECK (progress_percentage BETWEEN 0 AND 100),
    CONSTRAINT uk_tender_user_assignment UNIQUE (tender_id, user_id),
    
    -- Foreign keys
    CONSTRAINT fk_assignment_tender FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_assignment_assigner FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_assignments_tender_id ON tender_assignments(tender_id);
CREATE INDEX idx_assignments_user_id ON tender_assignments(user_id);
CREATE INDEX idx_assignments_status ON tender_assignments(status);
CREATE INDEX idx_assignments_assigned_date ON tender_assignments(assigned_date);
```

### 3. Companies Table
```sql
-- Vendor and dealer company information
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    
    -- Basic information
    name VARCHAR(255) NOT NULL,
    company_type VARCHAR(50) NOT NULL,
    registration_number VARCHAR(100),
    
    -- Contact information
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    
    -- Business details
    industry VARCHAR(100),
    business_category VARCHAR(100),
    gst_number VARCHAR(20),
    pan_number VARCHAR(15),
    
    -- Capabilities and certifications
    capabilities TEXT[],
    certifications TEXT[],
    
    -- Performance metrics
    performance_rating DECIMAL(3,2) DEFAULT 0.00,
    completed_projects INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Status and verification
    status VARCHAR(50) DEFAULT 'active',
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_date TIMESTAMP,
    
    -- Additional data
    metadata JSONB,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    verified_by INTEGER,
    
    -- Constraints
    CONSTRAINT chk_company_type CHECK (company_type IN ('dealer', 'oem', 'vendor', 'contractor')),
    CONSTRAINT chk_company_status CHECK (status IN ('active', 'inactive', 'blacklisted', 'suspended')),
    CONSTRAINT chk_verification_status CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    CONSTRAINT chk_performance_rating CHECK (performance_rating BETWEEN 0.00 AND 5.00),
    
    -- Foreign keys
    CONSTRAINT fk_company_creator FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_company_verifier FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_type ON companies(company_type);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_city_state ON companies(city, state);
CREATE INDEX idx_companies_gst ON companies(gst_number);
```

### 4. Documents Table
```sql
-- Document management and file tracking
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    
    -- File information
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Document classification
    document_type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    
    -- Relationships
    tender_id INTEGER,
    company_id INTEGER,
    
    -- Document metadata
    metadata JSONB,
    extracted_text TEXT,
    thumbnail_path TEXT,
    
    -- Access control
    access_level VARCHAR(50) DEFAULT 'private',
    password_protected BOOLEAN DEFAULT false,
    
    -- Version control
    version INTEGER DEFAULT 1,
    parent_document_id INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    processing_status VARCHAR(50) DEFAULT 'pending',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_file_size_positive CHECK (file_size > 0),
    CONSTRAINT chk_version_positive CHECK (version > 0),
    CONSTRAINT chk_access_level CHECK (access_level IN ('public', 'private', 'restricted')),
    CONSTRAINT chk_document_status CHECK (status IN ('active', 'archived', 'deleted')),
    CONSTRAINT chk_processing_status CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Foreign keys
    CONSTRAINT fk_document_tender FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    CONSTRAINT fk_document_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id),
    CONSTRAINT fk_document_parent FOREIGN KEY (parent_document_id) REFERENCES documents(id)
);

-- Indexes
CREATE INDEX idx_documents_tender_id ON documents(tender_id);
CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_status ON documents(status);

-- Full-text search on extracted content
CREATE INDEX idx_documents_search ON documents 
USING gin(to_tsvector('english', original_name || ' ' || COALESCE(extracted_text, '')));
```

## Support Tables

### 1. Audit Logs Table
```sql
-- Comprehensive audit trail for all system changes
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    
    -- Event information
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL,
    
    -- Change details
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Context
    user_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    
    -- Additional metadata
    metadata JSONB,
    description TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_audit_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    
    -- Foreign keys
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for audit queries
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

### 2. Notifications Table
```sql
-- System notifications and alerts
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    
    -- Recipients
    user_id INTEGER,
    role_id INTEGER,
    
    -- Categorization
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal',
    
    -- Status
    status VARCHAR(50) DEFAULT 'unread',
    read_at TIMESTAMP,
    
    -- Related objects
    related_object_type VARCHAR(100),
    related_object_id INTEGER,
    
    -- Actions
    action_url TEXT,
    action_label VARCHAR(100),
    
    -- Delivery
    delivery_method VARCHAR(50) DEFAULT 'in_app',
    email_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    
    -- Scheduling
    scheduled_for TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    -- Constraints
    CONSTRAINT chk_notification_type CHECK (notification_type IN (
        'info', 'warning', 'error', 'success', 'reminder'
    )),
    CONSTRAINT chk_notification_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT chk_notification_status CHECK (status IN ('unread', 'read', 'archived', 'dismissed')),
    
    -- Foreign keys
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
```

## Relationships and Constraints

### Primary Relationships
```sql
-- Core relationship diagram:
-- users (1) -> (many) tender_assignments (many) <- (1) tenders
-- users (1) -> (many) tenders (creator relationship)
-- tenders (1) -> (many) documents
-- companies (1) -> (many) documents
-- users (1) -> (many) user_roles (many) <- (1) roles
-- roles (1) -> (many) role_permissions (many) <- (1) permissions

-- Example foreign key relationships
ALTER TABLE tenders 
ADD CONSTRAINT fk_tender_creator 
FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE tender_assignments 
ADD CONSTRAINT fk_assignment_tender 
FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE;

ALTER TABLE documents 
ADD CONSTRAINT fk_document_tender 
FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE;
```

### Data Integrity Rules
```sql
-- Business rules implemented as constraints

-- Tender deadlines must be in the future
ALTER TABLE tenders 
ADD CONSTRAINT chk_deadline_future 
CHECK (deadline > created_at);

-- Financial amounts must be non-negative
ALTER TABLE tenders 
ADD CONSTRAINT chk_financial_positive 
CHECK (emd_amount >= 0 AND document_fee >= 0);

-- Progress percentage must be valid range
ALTER TABLE tender_assignments 
ADD CONSTRAINT chk_progress_range 
CHECK (progress_percentage BETWEEN 0 AND 100);

-- Performance rating must be valid
ALTER TABLE companies 
ADD CONSTRAINT chk_performance_rating 
CHECK (performance_rating BETWEEN 0.00 AND 5.00);
```

This comprehensive database schema documentation provides the development team with complete understanding of data structures, relationships, and business rules implemented at the database level.