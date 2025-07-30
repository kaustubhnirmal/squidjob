-- SquidJob Tender Management System
-- MySQL Database Schema
-- Compatible with XAMPP MySQL 8.0+

-- Create database (run this first)
-- CREATE DATABASE IF NOT EXISTS squidjob CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE squidjob;

-- Set SQL mode for strict compliance
SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    
    -- Organization
    department VARCHAR(100),
    designation VARCHAR(100),
    employee_id VARCHAR(50),
    
    -- Status and Security
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Security tokens
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    remember_token VARCHAR(100),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_department (department),
    INDEX idx_last_login (last_login),
    INDEX idx_email_verification (email_verification_token),
    INDEX idx_password_reset (password_reset_token),
    
    -- Foreign key constraints
    CONSTRAINT fk_user_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    level INT DEFAULT 1,
    is_system_role BOOLEAN DEFAULT FALSE,
    is_default_role BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_role_level CHECK (level > 0),
    
    -- Indexes
    INDEX idx_name (name),
    INDEX idx_level (level),
    INDEX idx_active (active),
    
    -- Foreign keys
    CONSTRAINT fk_role_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions table
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    module VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_system_permission BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    
    -- Indexes
    INDEX idx_name (name),
    INDEX idx_module (module),
    INDEX idx_category (category),
    INDEX idx_active (active),
    
    -- Foreign keys
    CONSTRAINT fk_permission_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User roles junction table
CREATE TABLE user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT NOT NULL,
    
    -- Constraints
    UNIQUE KEY uk_user_role (user_id, role_id),
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id),
    
    -- Foreign keys
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_assigner FOREIGN KEY (assigned_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role permissions junction table
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY uk_role_permission (role_id, permission_id),
    
    -- Indexes
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id),
    
    -- Foreign keys
    CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- BUSINESS TABLES
-- ============================================================================

-- Tenders table
CREATE TABLE tenders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
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
    submitted_date TIMESTAMP NULL,
    
    -- Financial information
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
    parsed_data JSON,
    item_categories JSON,
    eligibility_criteria TEXT,
    required_documents JSON,
    
    -- Submission information
    submitted_by VARCHAR(255),
    submission_method VARCHAR(50),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_by INT,
    
    -- Soft delete
    deleted_at TIMESTAMP NULL,
    deleted_by INT NULL,
    
    -- Constraints
    CONSTRAINT chk_deadline_future CHECK (deadline > created_at),
    CONSTRAINT chk_valid_status CHECK (status IN (
        'draft', 'live', 'in_process', 'submitted', 
        'awarded', 'rejected', 'cancelled', 'completed'
    )),
    CONSTRAINT chk_emd_positive CHECK (emd_amount >= 0),
    CONSTRAINT chk_doc_fee_positive CHECK (document_fee >= 0),
    CONSTRAINT chk_estimated_value_positive CHECK (estimated_value IS NULL OR estimated_value > 0),
    
    -- Indexes
    INDEX idx_reference_no (reference_no),
    INDEX idx_status (status),
    INDEX idx_deadline (deadline),
    INDEX idx_authority (authority),
    INDEX idx_status_deadline (status, deadline),
    INDEX idx_created_by (created_by),
    INDEX idx_deleted_at (deleted_at),
    
    -- Full-text search index
    FULLTEXT idx_search (title, description, authority),
    
    -- Foreign keys
    CONSTRAINT fk_tender_creator FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_tender_updater FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT fk_tender_deleter FOREIGN KEY (deleted_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tender assignments table
CREATE TABLE tender_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tender_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(100) NOT NULL,
    responsibility TEXT,
    status VARCHAR(50) DEFAULT 'assigned',
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date TIMESTAMP NULL,
    completion_date TIMESTAMP NULL,
    progress_percentage INT DEFAULT 0,
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    assigned_by INT NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_valid_assignment_status CHECK (status IN (
        'assigned', 'in_progress', 'completed', 'on_hold', 'cancelled'
    )),
    CONSTRAINT chk_progress_range CHECK (progress_percentage BETWEEN 0 AND 100),
    CONSTRAINT uk_tender_user_assignment UNIQUE (tender_id, user_id),
    
    -- Indexes
    INDEX idx_tender_id (tender_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_assigned_date (assigned_date),
    
    -- Foreign keys
    CONSTRAINT fk_assignment_tender FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_assignment_assigner FOREIGN KEY (assigned_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Companies table
CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    company_type ENUM('dealer', 'oem', 'vendor', 'contractor') NOT NULL,
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
    capabilities JSON,
    certifications JSON,
    
    -- Performance metrics
    performance_rating DECIMAL(3,2) DEFAULT 0.00,
    completed_projects INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Status and verification
    status ENUM('active', 'inactive', 'blacklisted', 'suspended') DEFAULT 'active',
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verified_date TIMESTAMP NULL,
    
    -- Additional data
    metadata JSON,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    verified_by INT,
    
    -- Constraints
    CONSTRAINT chk_performance_rating CHECK (performance_rating BETWEEN 0.00 AND 5.00),
    
    -- Indexes
    INDEX idx_name (name),
    INDEX idx_company_type (company_type),
    INDEX idx_status (status),
    INDEX idx_city_state (city, state),
    INDEX idx_gst_number (gst_number),
    INDEX idx_verification_status (verification_status),
    
    -- Foreign keys
    CONSTRAINT fk_company_creator FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_company_verifier FOREIGN KEY (verified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documents table
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- File information
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Document classification
    document_type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    tags JSON,
    
    -- Relationships
    tender_id INT,
    company_id INT,
    
    -- Document metadata
    metadata JSON,
    extracted_text LONGTEXT,
    thumbnail_path TEXT,
    
    -- Access control
    access_level ENUM('public', 'private', 'restricted') DEFAULT 'private',
    password_protected BOOLEAN DEFAULT FALSE,
    
    -- Version control
    version INT DEFAULT 1,
    parent_document_id INT,
    
    -- Status
    status ENUM('active', 'archived', 'deleted') DEFAULT 'active',
    processing_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_file_size_positive CHECK (file_size > 0),
    CONSTRAINT chk_version_positive CHECK (version > 0),
    
    -- Indexes
    INDEX idx_tender_id (tender_id),
    INDEX idx_company_id (company_id),
    INDEX idx_document_type (document_type),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_status (status),
    INDEX idx_processing_status (processing_status),
    
    -- Full-text search on extracted content
    FULLTEXT idx_document_search (original_name, extracted_text),
    
    -- Foreign keys
    CONSTRAINT fk_document_tender FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    CONSTRAINT fk_document_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id),
    CONSTRAINT fk_document_parent FOREIGN KEY (parent_document_id) REFERENCES documents(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SUPPORT TABLES
-- ============================================================================

-- Audit logs table
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Event information
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE', 'SELECT') NOT NULL,
    
    -- Change details
    old_values JSON,
    new_values JSON,
    changed_fields JSON,
    
    -- Context
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(100),
    
    -- Additional metadata
    metadata JSON,
    description TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_action (action),
    
    -- Foreign keys
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('info', 'warning', 'error', 'success', 'reminder') DEFAULT 'info',
    
    -- Recipients
    user_id INT,
    role_id INT,
    
    -- Categorization
    category VARCHAR(100),
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    
    -- Status
    status ENUM('unread', 'read', 'archived', 'dismissed') DEFAULT 'unread',
    read_at TIMESTAMP NULL,
    
    -- Related objects
    related_object_type VARCHAR(100),
    related_object_id INT,
    
    -- Actions
    action_url TEXT,
    action_label VARCHAR(100),
    
    -- Delivery
    delivery_method ENUM('in_app', 'email', 'sms', 'push') DEFAULT 'in_app',
    email_sent BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    
    -- Scheduling
    scheduled_for TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_notification_type (notification_type),
    INDEX idx_priority (priority),
    
    -- Foreign keys
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table (for file-based sessions)
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload LONGTEXT NOT NULL,
    last_activity INT NOT NULL,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_last_activity (last_activity),
    
    -- Foreign keys
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(100) NOT NULL UNIQUE,
    value LONGTEXT,
    type ENUM('string', 'integer', 'boolean', 'json', 'text') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    
    -- Indexes
    INDEX idx_key_name (key_name),
    INDEX idx_is_public (is_public),
    
    -- Foreign keys
    CONSTRAINT fk_setting_updater FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;