-- Migration: 002_seed_data.sql
-- Description: Initial seed data for Tender Management System
-- Version: 1.0.0
-- Created: 2025-07-29

-- Insert default roles
INSERT INTO roles (name, display_name, description, level, is_system_role, created_by) VALUES
(1, 'admin', 'System Administrator', 'Complete system access and management', 1, true, 1),
(2, 'tender_manager', 'Tender Manager', 'Tender oversight and team management', 2, true, 1),
(3, 'sales_head', 'Sales Head', 'Business development and client relations', 3, true, 1),
(4, 'accountant', 'Accountant', 'Financial management and reporting', 4, true, 1),
(5, 'user', 'Team Member', 'Basic tender processing access', 5, true, 1);

-- Insert default permissions
INSERT INTO permissions (name, display_name, description, module, category, is_system_permission, created_by) VALUES
-- User management permissions
('view_users', 'View Users', 'View user profiles and lists', 'users', 'read', true, 1),
('create_user', 'Create User', 'Create new user accounts', 'users', 'write', true, 1),
('edit_user', 'Edit User', 'Modify user profiles and settings', 'users', 'write', true, 1),
('delete_user', 'Delete User', 'Remove user accounts from system', 'users', 'delete', true, 1),
('manage_roles', 'Manage Roles', 'Assign and modify user roles', 'users', 'manage', true, 1),

-- Tender management permissions
('view_tenders', 'View Tenders', 'View tender information and lists', 'tenders', 'read', false, 1),
('view_all_tenders', 'View All Tenders', 'View all tenders regardless of assignment', 'tenders', 'read', false, 1),
('create_tender', 'Create Tender', 'Create new tender entries', 'tenders', 'write', false, 1),
('edit_tender', 'Edit Tender', 'Modify tender information', 'tenders', 'write', false, 1),
('delete_tender', 'Delete Tender', 'Remove tenders from system', 'tenders', 'delete', false, 1),
('assign_tender', 'Assign Tender', 'Assign tenders to team members', 'tenders', 'manage', false, 1),
('approve_tender', 'Approve Tender', 'Approve tender submissions', 'tenders', 'approve', false, 1),
('submit_tender', 'Submit Tender', 'Submit tender bids', 'tenders', 'submit', false, 1),

-- Company management permissions
('view_companies', 'View Companies', 'View company information', 'companies', 'read', false, 1),
('create_company', 'Create Company', 'Add new company records', 'companies', 'write', false, 1),
('edit_company', 'Edit Company', 'Modify company information', 'companies', 'write', false, 1),
('delete_company', 'Delete Company', 'Remove company records', 'companies', 'delete', false, 1),
('verify_company', 'Verify Company', 'Verify company credentials', 'companies', 'verify', false, 1),

-- Document management permissions
('view_documents', 'View Documents', 'View and download documents', 'documents', 'read', false, 1),
('upload_documents', 'Upload Documents', 'Upload new documents', 'documents', 'write', false, 1),
('delete_documents', 'Delete Documents', 'Remove documents from system', 'documents', 'delete', false, 1),
('manage_document_access', 'Manage Document Access', 'Control document access levels', 'documents', 'manage', false, 1),

-- Financial permissions
('view_financial_data', 'View Financial Data', 'View financial information', 'financial', 'read', false, 1),
('edit_financial_data', 'Edit Financial Data', 'Modify financial information', 'financial', 'write', false, 1),
('approve_financial', 'Approve Financial', 'Approve financial transactions', 'financial', 'approve', false, 1),
('generate_reports', 'Generate Reports', 'Generate financial and tender reports', 'reports', 'generate', false, 1),

-- System administration permissions
('manage_system_settings', 'Manage System Settings', 'Configure system settings', 'system', 'manage', true, 1),
('view_audit_logs', 'View Audit Logs', 'View system audit trail', 'system', 'audit', true, 1),
('manage_notifications', 'Manage Notifications', 'Send and manage notifications', 'system', 'notify', false, 1),
('backup_system', 'Backup System', 'Perform system backups', 'system', 'backup', true, 1);

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id, granted_by) VALUES
-- Admin role (all permissions)
(1, 1, 1), (1, 2, 1), (1, 3, 1), (1, 4, 1), (1, 5, 1),
(1, 6, 1), (1, 7, 1), (1, 8, 1), (1, 9, 1), (1, 10, 1),
(1, 11, 1), (1, 12, 1), (1, 13, 1), (1, 14, 1), (1, 15, 1),
(1, 16, 1), (1, 17, 1), (1, 18, 1), (1, 19, 1), (1, 20, 1),
(1, 21, 1), (1, 22, 1), (1, 23, 1), (1, 24, 1), (1, 25, 1),
(1, 26, 1), (1, 27, 1), (1, 28, 1), (1, 29, 1), (1, 30, 1),
(1, 31, 1), (1, 32, 1), (1, 33, 1), (1, 34, 1),

-- Tender Manager role
(2, 1, 1), (2, 6, 1), (2, 7, 1), (2, 8, 1), (2, 9, 1), (2, 11, 1), (2, 12, 1), (2, 13, 1),
(2, 14, 1), (2, 15, 1), (2, 16, 1), (2, 17, 1), (2, 18, 1), (2, 19, 1), (2, 21, 1), (2, 22, 1),
(2, 23, 1), (2, 25, 1), (2, 26, 1), (2, 28, 1), (2, 33, 1),

-- Sales Head role
(3, 1, 1), (3, 6, 1), (3, 7, 1), (3, 8, 1), (3, 9, 1), (3, 11, 1), (3, 12, 1), (3, 13, 1),
(3, 14, 1), (3, 15, 1), (3, 16, 1), (3, 17, 1), (3, 18, 1), (3, 19, 1), (3, 20, 1), (3, 21, 1),
(3, 22, 1), (3, 23, 1), (3, 28, 1), (3, 33, 1),

-- Accountant role
(4, 1, 1), (4, 6, 1), (4, 8, 1), (4, 15, 1), (4, 21, 1), (4, 25, 1), (4, 26, 1), (4, 27, 1), (4, 28, 1),

-- Basic User role
(5, 6, 1), (5, 8, 1), (5, 13, 1), (5, 15, 1), (5, 21, 1), (5, 22, 1);

-- Create default admin user
INSERT INTO users (id, email, password_hash, first_name, last_name, department, designation, status, email_verified, created_by) VALUES
(1, 'admin@tender247.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewUyh0yby1qmT.iu', 'System', 'Administrator', 'IT', 'System Administrator', 'active', true, 1);

-- Assign admin role to default user
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES (1, 1, 1);

-- Insert sample tender statuses and categories
CREATE TABLE IF NOT EXISTS tender_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

INSERT INTO tender_statuses (name, display_name, description, color, sort_order) VALUES
('draft', 'Draft', 'Tender is being prepared', '#6B7280', 1),
('live', 'Live', 'Tender is active and accepting bids', '#10B981', 2),
('in_process', 'In Process', 'Tender is being worked on', '#3B82F6', 3),
('submitted', 'Submitted', 'Bid has been submitted', '#F59E0B', 4),
('awarded', 'Awarded', 'Tender has been won', '#8B5CF6', 5),
('rejected', 'Rejected', 'Bid was not successful', '#EF4444', 6),
('cancelled', 'Cancelled', 'Tender was cancelled', '#6B7280', 7),
('completed', 'Completed', 'Project completed successfully', '#059669', 8);

-- Insert sample company types
CREATE TABLE IF NOT EXISTS company_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

INSERT INTO company_types (name, display_name, description) VALUES
('dealer', 'Dealer', 'Authorized dealers and distributors'),
('oem', 'OEM', 'Original Equipment Manufacturers'),
('vendor', 'Vendor', 'Service and product vendors'),
('contractor', 'Contractor', 'Construction and service contractors'),
('consultant', 'Consultant', 'Technical and business consultants');

-- Insert sample document types
CREATE TABLE IF NOT EXISTS document_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    allowed_mime_types TEXT[],
    max_file_size BIGINT DEFAULT 52428800,
    is_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

INSERT INTO document_types (name, display_name, description, allowed_mime_types, is_required) VALUES
('tender_document', 'Tender Document', 'Main tender notification document', ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], true),
('tech_specs', 'Technical Specifications', 'Technical specification documents', ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], false),
('atc_document', 'ATC Document', 'Annexure to Contract document', ARRAY['application/pdf', 'application/msword'], false),
('bid_document', 'Bid Document', 'Compiled bid submission document', ARRAY['application/pdf'], false),
('financial_document', 'Financial Document', 'Financial and commercial documents', ARRAY['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], false),
('compliance_certificate', 'Compliance Certificate', 'Compliance and certification documents', ARRAY['application/pdf'], false),
('supporting_document', 'Supporting Document', 'Additional supporting documents', ARRAY['application/pdf', 'image/jpeg', 'image/png'], false);

-- Insert system settings
CREATE TABLE IF NOT EXISTS system_settings (
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

INSERT INTO system_settings (key, value, data_type, description, category) VALUES
('app_name', 'Tender247', 'string', 'Application name', 'general'),
('app_version', '1.0.0', 'string', 'Application version', 'general'),
('max_file_upload_size', '52428800', 'integer', 'Maximum file upload size in bytes (50MB)', 'files'),
('allowed_file_types', 'pdf,doc,docx,xls,xlsx,png,jpg,jpeg', 'string', 'Allowed file types for upload', 'files'),
('session_timeout', '86400', 'integer', 'User session timeout in seconds (24 hours)', 'security'),
('password_min_length', '8', 'integer', 'Minimum password length', 'security'),
('enable_email_notifications', 'true', 'boolean', 'Enable email notifications', 'notifications'),
('default_tender_deadline_days', '30', 'integer', 'Default tender deadline in days from creation', 'tenders'),
('enable_ai_analysis', 'true', 'boolean', 'Enable AI-powered document analysis', 'features'),
('company_verification_required', 'true', 'boolean', 'Require company verification before use', 'companies'),
('audit_log_retention_days', '365', 'integer', 'Number of days to retain audit logs', 'system'),
('backup_retention_days', '30', 'integer', 'Number of days to retain backups', 'system');

-- Insert notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO notification_templates (name, title, message_template, notification_type, category) VALUES
('tender_created', 'New Tender Created', 'A new tender "{{tender_title}}" has been created by {{creator_name}}.', 'info', 'tender'),
('tender_assigned', 'Tender Assigned', 'You have been assigned to tender "{{tender_title}}" as {{role}}.', 'info', 'assignment'),
('tender_deadline_reminder', 'Tender Deadline Reminder', 'Reminder: Tender "{{tender_title}}" deadline is in {{days_remaining}} days.', 'warning', 'deadline'),
('tender_submitted', 'Tender Submitted', 'Tender "{{tender_title}}" has been successfully submitted.', 'success', 'submission'),
('user_created', 'Welcome to Tender247', 'Welcome {{user_name}}! Your account has been created successfully.', 'success', 'user'),
('password_reset', 'Password Reset Request', 'A password reset has been requested for your account. Click the link to reset your password.', 'info', 'security'),
('company_verification', 'Company Verification Status', 'Company "{{company_name}}" verification status has been updated to {{status}}.', 'info', 'company');

-- Update sequences to ensure they start from the correct value
SELECT setval('users_id_seq', 1, true);
SELECT setval('roles_id_seq', 5, true);
SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions), true);

COMMENT ON TABLE tender_statuses IS 'Predefined tender status configurations';
COMMENT ON TABLE company_types IS 'Available company type classifications';
COMMENT ON TABLE document_types IS 'Document type definitions with validation rules';
COMMENT ON TABLE system_settings IS 'Configurable system-wide settings';
COMMENT ON TABLE notification_templates IS 'Email and notification message templates';