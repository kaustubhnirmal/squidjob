-- Complete PostgreSQL Database Schema for Tender Management System
-- Version: 1.0.0
-- Compatible with PostgreSQL 12, 13, 14, 15, 16
-- Created: July 29, 2025

-- Drop existing database if it exists (for clean installation)
-- DROP DATABASE IF EXISTS tender247_db;

-- Create database
-- CREATE DATABASE tender247_db WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8';

-- Connect to the database
-- \c tender247_db;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    department VARCHAR(100),
    designation VARCHAR(100),
    employee_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER
);

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    level INTEGER DEFAULT 1,
    is_system_role BOOLEAN DEFAULT false,
    is_default_role BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL
);

-- Permissions table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    module VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_system_permission BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL
);

-- User roles junction table
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER NOT NULL,
    UNIQUE(user_id, role_id)
);

-- Role permissions junction table
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    granted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by INTEGER NOT NULL,
    UNIQUE(role_id, permission_id)
);

-- Tenders table
CREATE TABLE tenders (
    id SERIAL PRIMARY KEY,
    reference_no VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    authority VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    deadline TIMESTAMP NOT NULL,
    published_date DATE,
    submitted_date TIMESTAMP,
    emd_amount DECIMAL(15,2) DEFAULT 0.00,
    document_fee DECIMAL(15,2) DEFAULT 0.00,
    estimated_value DECIMAL(15,2),
    bid_value DECIMAL(15,2),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    bid_document_path TEXT,
    atc_document_path TEXT,
    tech_specs_document_path TEXT,
    parsed_data JSONB,
    item_categories TEXT[],
    submitted_by VARCHAR(255),
    submission_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    updated_by INTEGER,
    deleted_at TIMESTAMP NULL,
    deleted_by INTEGER NULL
);

-- Tender assignments table
CREATE TABLE tender_assignments (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(100) NOT NULL,
    responsibility TEXT,
    status VARCHAR(50) DEFAULT 'assigned',
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date TIMESTAMP,
    completion_date TIMESTAMP,
    progress_percentage INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER NOT NULL,
    UNIQUE(tender_id, user_id)
);

-- Companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_type VARCHAR(50) NOT NULL,
    registration_number VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    industry VARCHAR(100),
    business_category VARCHAR(100),
    gst_number VARCHAR(20),
    pan_number VARCHAR(15),
    capabilities TEXT[],
    certifications TEXT[],
    performance_rating DECIMAL(3,2) DEFAULT 0.00,
    completed_projects INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'active',
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_date TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    verified_by INTEGER
);

-- Documents table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    tender_id INTEGER,
    company_id INTEGER,
    metadata JSONB,
    extracted_text TEXT,
    thumbnail_path TEXT,
    access_level VARCHAR(50) DEFAULT 'private',
    password_protected BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    parent_document_id INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    processing_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER NOT NULL
);

-- Audit logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    metadata JSONB,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    user_id INTEGER,
    role_id INTEGER,
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'unread',
    read_at TIMESTAMP,
    related_object_type VARCHAR(100),
    related_object_id INTEGER,
    action_url TEXT,
    action_label VARCHAR(100),
    delivery_method VARCHAR(50) DEFAULT 'in_app',
    email_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    scheduled_for TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER
);

-- System settings table
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    data_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_editable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER
);

-- Session store table (for session management)
CREATE TABLE sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_last_login ON users(last_login);

CREATE INDEX idx_tenders_reference_no ON tenders(reference_no);
CREATE INDEX idx_tenders_status ON tenders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenders_deadline ON tenders(deadline) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenders_authority ON tenders(authority) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenders_status_deadline ON tenders(status, deadline) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenders_created_by ON tenders(created_by);

CREATE INDEX idx_assignments_tender_id ON tender_assignments(tender_id);
CREATE INDEX idx_assignments_user_id ON tender_assignments(user_id);
CREATE INDEX idx_assignments_status ON tender_assignments(status);
CREATE INDEX idx_assignments_assigned_date ON tender_assignments(assigned_date);

CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_type ON companies(company_type);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_city_state ON companies(city, state);
CREATE INDEX idx_companies_gst ON companies(gst_number);

CREATE INDEX idx_documents_tender_id ON documents(tender_id);
CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_status ON documents(status);

CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(notification_type);

CREATE INDEX idx_sessions_expire ON sessions(expire);

-- Full-text search indexes
CREATE INDEX idx_tenders_search ON tenders 
USING gin(to_tsvector('english', title || ' ' || description || ' ' || authority)) 
WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_search ON documents 
USING gin(to_tsvector('english', original_name || ' ' || COALESCE(extracted_text, '')));

CREATE INDEX idx_companies_search ON companies 
USING gin(to_tsvector('english', name || ' ' || COALESCE(industry, '') || ' ' || COALESCE(business_category, '')));

-- JSON indexes for better JSONB performance
CREATE INDEX idx_tenders_parsed_data ON tenders USING gin(parsed_data) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_metadata ON companies USING gin(metadata);
CREATE INDEX idx_documents_metadata ON documents USING gin(metadata);

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_user_creator FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE roles ADD CONSTRAINT fk_role_creator FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE permissions ADD CONSTRAINT fk_permission_creator FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE user_roles ADD CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT fk_user_role_assigner FOREIGN KEY (assigned_by) REFERENCES users(id);

ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permission_granter FOREIGN KEY (granted_by) REFERENCES users(id);

ALTER TABLE tenders ADD CONSTRAINT fk_tender_creator FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE tenders ADD CONSTRAINT fk_tender_updater FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE tenders ADD CONSTRAINT fk_tender_deleter FOREIGN KEY (deleted_by) REFERENCES users(id);

ALTER TABLE tender_assignments ADD CONSTRAINT fk_assignment_tender FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE;
ALTER TABLE tender_assignments ADD CONSTRAINT fk_assignment_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE tender_assignments ADD CONSTRAINT fk_assignment_assigner FOREIGN KEY (assigned_by) REFERENCES users(id);

ALTER TABLE companies ADD CONSTRAINT fk_company_creator FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE companies ADD CONSTRAINT fk_company_verifier FOREIGN KEY (verified_by) REFERENCES users(id);

ALTER TABLE documents ADD CONSTRAINT fk_document_tender FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE;
ALTER TABLE documents ADD CONSTRAINT fk_document_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE documents ADD CONSTRAINT fk_document_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id);
ALTER TABLE documents ADD CONSTRAINT fk_document_parent FOREIGN KEY (parent_document_id) REFERENCES documents(id);

ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE notifications ADD CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notification_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notification_creator FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE system_settings ADD CONSTRAINT fk_setting_updater FOREIGN KEY (updated_by) REFERENCES users(id);

-- Add check constraints
ALTER TABLE tenders ADD CONSTRAINT chk_deadline_future CHECK (deadline > created_at);
ALTER TABLE tenders ADD CONSTRAINT chk_valid_status CHECK (status IN ('draft', 'live', 'in_process', 'submitted', 'awarded', 'rejected', 'cancelled', 'completed'));
ALTER TABLE tenders ADD CONSTRAINT chk_emd_positive CHECK (emd_amount >= 0);
ALTER TABLE tenders ADD CONSTRAINT chk_doc_fee_positive CHECK (document_fee >= 0);
ALTER TABLE tenders ADD CONSTRAINT chk_estimated_value_positive CHECK (estimated_value IS NULL OR estimated_value > 0);

ALTER TABLE tender_assignments ADD CONSTRAINT chk_valid_assignment_status CHECK (status IN ('assigned', 'in_progress', 'completed', 'on_hold', 'cancelled'));
ALTER TABLE tender_assignments ADD CONSTRAINT chk_progress_range CHECK (progress_percentage BETWEEN 0 AND 100);

ALTER TABLE companies ADD CONSTRAINT chk_company_type CHECK (company_type IN ('dealer', 'oem', 'vendor', 'contractor', 'consultant'));
ALTER TABLE companies ADD CONSTRAINT chk_company_status CHECK (status IN ('active', 'inactive', 'blacklisted', 'suspended'));
ALTER TABLE companies ADD CONSTRAINT chk_verification_status CHECK (verification_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE companies ADD CONSTRAINT chk_performance_rating CHECK (performance_rating BETWEEN 0.00 AND 5.00);

ALTER TABLE documents ADD CONSTRAINT chk_file_size_positive CHECK (file_size > 0);
ALTER TABLE documents ADD CONSTRAINT chk_version_positive CHECK (version > 0);
ALTER TABLE documents ADD CONSTRAINT chk_access_level CHECK (access_level IN ('public', 'private', 'restricted'));
ALTER TABLE documents ADD CONSTRAINT chk_document_status CHECK (status IN ('active', 'archived', 'deleted'));
ALTER TABLE documents ADD CONSTRAINT chk_processing_status CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));

ALTER TABLE audit_logs ADD CONSTRAINT chk_audit_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT'));

ALTER TABLE notifications ADD CONSTRAINT chk_notification_type CHECK (notification_type IN ('info', 'warning', 'error', 'success', 'reminder'));
ALTER TABLE notifications ADD CONSTRAINT chk_notification_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE notifications ADD CONSTRAINT chk_notification_status CHECK (status IN ('unread', 'read', 'archived', 'dismissed'));

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON tenders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON tender_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for generating reference numbers
CREATE OR REPLACE FUNCTION generate_tender_reference()
RETURNS TEXT AS $$
DECLARE
    current_year INTEGER;
    sequence_num INTEGER;
    ref_number TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(reference_no FROM 8) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM tenders 
    WHERE reference_no LIKE 'TNR' || current_year || '%';
    
    -- Format: TNR2025001
    ref_number := 'TNR' || current_year || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN ref_number;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts with authentication and profile information';
COMMENT ON TABLE roles IS 'System roles for role-based access control';
COMMENT ON TABLE permissions IS 'Granular permissions for system features';
COMMENT ON TABLE tenders IS 'Core tender information with complete lifecycle management';
COMMENT ON TABLE tender_assignments IS 'User-tender assignments for team collaboration';
COMMENT ON TABLE companies IS 'Vendor and dealer company information';
COMMENT ON TABLE documents IS 'Document management and file tracking';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system changes';
COMMENT ON TABLE notifications IS 'System notifications and alerts';
COMMENT ON TABLE system_settings IS 'Configurable system-wide settings';
COMMENT ON TABLE sessions IS 'User session storage for authentication';

COMMENT ON COLUMN users.password_hash IS 'bcrypt hashed password with 12 salt rounds';
COMMENT ON COLUMN tenders.reference_no IS 'Unique auto-generated reference (TNR2025001 format)';
COMMENT ON COLUMN tenders.parsed_data IS 'AI-extracted data from tender documents in JSON format';
COMMENT ON COLUMN tenders.status IS 'Workflow status following predefined state machine';

-- Create view for user permissions
CREATE VIEW user_permissions AS
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    r.name as role_name,
    r.display_name as role_display_name,
    p.name as permission_name,
    p.display_name as permission_display_name,
    p.module,
    p.category
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.status = 'active' AND r.active = true AND p.active = true;

-- Create view for tender dashboard
CREATE VIEW tender_dashboard AS
SELECT 
    t.id,
    t.reference_no,
    t.title,
    t.authority,
    t.deadline,
    t.status,
    t.estimated_value,
    t.created_at,
    u.first_name || ' ' || u.last_name as created_by_name,
    COUNT(ta.id) as assignment_count,
    COUNT(d.id) as document_count,
    CASE 
        WHEN t.deadline < CURRENT_TIMESTAMP THEN 'expired'
        WHEN t.deadline < CURRENT_TIMESTAMP + INTERVAL '7 days' THEN 'urgent'
        WHEN t.deadline < CURRENT_TIMESTAMP + INTERVAL '30 days' THEN 'upcoming'
        ELSE 'normal'
    END as urgency_level
FROM tenders t
LEFT JOIN users u ON t.created_by = u.id
LEFT JOIN tender_assignments ta ON t.id = ta.tender_id
LEFT JOIN documents d ON t.id = d.tender_id
WHERE t.deleted_at IS NULL
GROUP BY t.id, u.first_name, u.last_name;

COMMENT ON VIEW user_permissions IS 'Consolidated view of user permissions through roles';
COMMENT ON VIEW tender_dashboard IS 'Dashboard view with tender summary and metrics';