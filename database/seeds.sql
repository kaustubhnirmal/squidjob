-- SquidJob Tender Management System
-- Database Seeder - Default Data
-- Run this after creating the schema

USE squidjob;

-- ============================================================================
-- DEFAULT ROLES
-- ============================================================================

INSERT INTO roles (id, name, display_name, description, level, is_system_role, created_by) VALUES
(17, 'admin', 'System Administrator', 'Complete system access and management', 1, TRUE, 1),
(18, 'tender_manager', 'Tender Manager', 'Tender oversight and team management', 2, TRUE, 1),
(19, 'sales_head', 'Sales Head', 'Business development and client relations', 3, TRUE, 1),
(20, 'accountant', 'Accountant', 'Financial management and reporting', 4, TRUE, 1),
(21, 'user', 'Team Member', 'Basic tender processing access', 5, TRUE, 1);

-- ============================================================================
-- DEFAULT PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, display_name, description, module, category, is_system_permission, created_by) VALUES
-- User management permissions
('view_users', 'View Users', 'View user profiles and lists', 'users', 'read', TRUE, 1),
('create_user', 'Create User', 'Create new user accounts', 'users', 'write', TRUE, 1),
('edit_user', 'Edit User', 'Modify user profiles and settings', 'users', 'write', TRUE, 1),
('delete_user', 'Delete User', 'Remove user accounts from system', 'users', 'delete', TRUE, 1),
('manage_users', 'Manage Users', 'Full user management access', 'users', 'manage', TRUE, 1),

-- Tender management permissions
('view_tenders', 'View Tenders', 'View tender information and lists', 'tenders', 'read', FALSE, 1),
('create_tender', 'Create Tender', 'Create new tender entries', 'tenders', 'write', FALSE, 1),
('edit_tender', 'Edit Tender', 'Modify tender information', 'tenders', 'write', FALSE, 1),
('delete_tender', 'Delete Tender', 'Remove tenders from system', 'tenders', 'delete', FALSE, 1),
('assign_tender', 'Assign Tender', 'Assign tenders to team members', 'tenders', 'manage', FALSE, 1),
('approve_tender', 'Approve Tender', 'Approve tender submissions', 'tenders', 'approve', FALSE, 1),

-- Document management permissions
('view_documents', 'View Documents', 'View document lists and details', 'documents', 'read', FALSE, 1),
('upload_document', 'Upload Document', 'Upload new documents', 'documents', 'write', FALSE, 1),
('delete_document', 'Delete Document', 'Remove documents from system', 'documents', 'delete', FALSE, 1),
('download_document', 'Download Document', 'Download document files', 'documents', 'read', FALSE, 1),
('manage_documents', 'Manage Documents', 'Full document management access', 'documents', 'manage', FALSE, 1),

-- Company management permissions
('view_companies', 'View Companies', 'View company profiles and lists', 'companies', 'read', FALSE, 1),
('create_company', 'Create Company', 'Create new company profiles', 'companies', 'write', FALSE, 1),
('edit_company', 'Edit Company', 'Modify company information', 'companies', 'write', FALSE, 1),
('delete_company', 'Delete Company', 'Remove companies from system', 'companies', 'delete', FALSE, 1),
('manage_companies', 'Manage Companies', 'Full company management access', 'companies', 'manage', FALSE, 1),

-- Financial management permissions
('view_financials', 'View Financials', 'View financial data and reports', 'finance', 'read', FALSE, 1),
('create_po', 'Create Purchase Order', 'Create new purchase orders', 'finance', 'write', FALSE, 1),
('approve_po', 'Approve Purchase Order', 'Approve purchase orders', 'finance', 'approve', FALSE, 1),
('manage_budget', 'Manage Budget', 'Budget planning and management', 'finance', 'manage', FALSE, 1),
('view_reports', 'View Reports', 'Access financial reports', 'finance', 'read', FALSE, 1),

-- System administration permissions
('system_config', 'System Configuration', 'Configure system settings', 'system', 'manage', TRUE, 1),
('view_logs', 'View System Logs', 'Access system and audit logs', 'system', 'read', TRUE, 1),
('manage_roles', 'Manage Roles', 'Create and modify user roles', 'system', 'manage', TRUE, 1),
('backup_system', 'System Backup', 'Create and restore system backups', 'system', 'manage', TRUE, 1),

-- Reporting permissions
('export_reports', 'Export Reports', 'Export reports in various formats', 'reports', 'read', FALSE, 1),
('create_reports', 'Create Reports', 'Create custom reports', 'reports', 'write', FALSE, 1),
('schedule_reports', 'Schedule Reports', 'Schedule automated reports', 'reports', 'manage', FALSE, 1);

-- ============================================================================
-- ROLE PERMISSIONS MAPPING
-- ============================================================================

-- Admin role - all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 17, id FROM permissions;

-- Tender Manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 18, id FROM permissions WHERE name IN (
    'view_users', 'view_tenders', 'create_tender', 'edit_tender', 'assign_tender', 'approve_tender',
    'view_documents', 'upload_document', 'download_document', 'manage_documents',
    'view_companies', 'create_company', 'edit_company', 'manage_companies',
    'view_financials', 'create_po', 'view_reports', 'export_reports', 'create_reports'
);

-- Sales Head role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 19, id FROM permissions WHERE name IN (
    'view_users', 'view_tenders', 'create_tender', 'edit_tender',
    'view_documents', 'upload_document', 'download_document',
    'view_companies', 'create_company', 'edit_company', 'manage_companies',
    'view_financials', 'view_reports', 'export_reports'
);

-- Accountant role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 20, id FROM permissions WHERE name IN (
    'view_users', 'view_tenders', 'view_documents', 'download_document',
    'view_companies', 'view_financials', 'create_po', 'approve_po', 'manage_budget',
    'view_reports', 'export_reports', 'create_reports'
);

-- User role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 21, id FROM permissions WHERE name IN (
    'view_tenders', 'create_tender', 'edit_tender',
    'view_documents', 'upload_document', 'download_document',
    'view_companies', 'view_reports'
);

-- ============================================================================
-- DEFAULT ADMIN USER
-- ============================================================================

INSERT INTO users (id, email, password_hash, first_name, last_name, status, email_verified, created_by) VALUES
(1, 'admin@squidjob.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 'active', TRUE, 1);

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES (1, 17, 1);

-- ============================================================================
-- SAMPLE USERS
-- ============================================================================

INSERT INTO users (email, password_hash, first_name, last_name, department, designation, status, email_verified, created_by) VALUES
('manager@squidjob.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Manager', 'Operations', 'Tender Manager', 'active', TRUE, 1),
('sales@squidjob.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Wilson', 'Sales', 'Sales Head', 'active', TRUE, 1),
('accounts@squidjob.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael', 'Brown', 'Finance', 'Senior Accountant', 'active', TRUE, 1),
('user@squidjob.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emily', 'Davis', 'Operations', 'Team Member', 'active', TRUE, 1);

-- Assign roles to sample users
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
(2, 18, 1), -- Manager
(3, 19, 1), -- Sales Head
(4, 20, 1), -- Accountant
(5, 21, 1); -- User

-- ============================================================================
-- SAMPLE COMPANIES
-- ============================================================================

INSERT INTO companies (name, company_type, email, phone, city, state, country, industry, status, verification_status, created_by) VALUES
('Tech Solutions Pvt Ltd', 'vendor', 'contact@techsolutions.com', '+91-9876543210', 'Mumbai', 'Maharashtra', 'India', 'Information Technology', 'active', 'verified', 1),
('Global Manufacturing Co', 'oem', 'info@globalmanufacturing.com', '+91-9876543211', 'Chennai', 'Tamil Nadu', 'India', 'Manufacturing', 'active', 'verified', 1),
('Prime Contractors Ltd', 'contractor', 'admin@primecontractors.com', '+91-9876543212', 'Delhi', 'Delhi', 'India', 'Construction', 'active', 'pending', 1),
('Elite Dealers Network', 'dealer', 'sales@elitedealers.com', '+91-9876543213', 'Bangalore', 'Karnataka', 'India', 'Trading', 'active', 'verified', 1);

-- ============================================================================
-- SAMPLE TENDERS
-- ============================================================================

INSERT INTO tenders (reference_no, title, description, authority, location, deadline, status, emd_amount, document_fee, estimated_value, created_by) VALUES
('TNR2025001', 'Supply of Computer Hardware', 'Procurement of desktop computers, laptops and accessories for government offices', 'Department of Information Technology', 'Mumbai, Maharashtra', '2025-02-15 17:00:00', 'live', 50000.00, 5000.00, 2500000.00, 1),
('TNR2025002', 'Construction of Office Building', 'Construction of 5-story office building with modern amenities', 'Public Works Department', 'Delhi, Delhi', '2025-03-01 15:00:00', 'live', 200000.00, 10000.00, 10000000.00, 1),
('TNR2025003', 'Software Development Services', 'Development of web-based tender management system', 'E-Governance Department', 'Bangalore, Karnataka', '2025-02-28 16:00:00', 'draft', 25000.00, 2500.00, 1500000.00, 2),
('TNR2025004', 'Medical Equipment Supply', 'Supply of medical equipment for district hospital', 'Health Department', 'Chennai, Tamil Nadu', '2025-03-15 14:00:00', 'live', 75000.00, 7500.00, 3500000.00, 1);

-- ============================================================================
-- SAMPLE TENDER ASSIGNMENTS
-- ============================================================================

INSERT INTO tender_assignments (tender_id, user_id, role, responsibility, status, assigned_by) VALUES
(1, 2, 'Project Manager', 'Overall project coordination and management', 'assigned', 1),
(1, 5, 'Technical Analyst', 'Technical specification review and analysis', 'assigned', 1),
(2, 2, 'Project Manager', 'Construction project oversight', 'in_progress', 1),
(3, 3, 'Business Analyst', 'Requirements gathering and client coordination', 'assigned', 1),
(4, 4, 'Financial Analyst', 'Budget analysis and financial planning', 'assigned', 1);

-- ============================================================================
-- SYSTEM SETTINGS
-- ============================================================================

INSERT INTO settings (key_name, value, type, description, is_public) VALUES
('app_name', 'SquidJob Tender Management System', 'string', 'Application name displayed in UI', TRUE),
('app_version', '1.0.0', 'string', 'Current application version', TRUE),
('max_file_upload_size', '52428800', 'integer', 'Maximum file upload size in bytes (50MB)', FALSE),
('allowed_file_types', '["pdf","doc","docx","xls","xlsx","jpg","jpeg","png","gif","zip"]', 'json', 'Allowed file types for upload', FALSE),
('email_notifications_enabled', 'true', 'boolean', 'Enable email notifications', FALSE),
('sms_notifications_enabled', 'false', 'boolean', 'Enable SMS notifications', FALSE),
('backup_retention_days', '30', 'integer', 'Number of days to retain backups', FALSE),
('session_timeout', '1440', 'integer', 'Session timeout in minutes', FALSE),
('password_min_length', '8', 'integer', 'Minimum password length', FALSE),
('max_login_attempts', '5', 'integer', 'Maximum login attempts before lockout', FALSE),
('lockout_duration', '900', 'integer', 'Account lockout duration in seconds', FALSE),
('timezone', 'Asia/Calcutta', 'string', 'Default application timezone', TRUE),
('date_format', 'Y-m-d', 'string', 'Default date format', TRUE),
('currency_symbol', '₹', 'string', 'Default currency symbol', TRUE),
('company_name', 'SquidJob Technologies', 'string', 'Company name for branding', TRUE),
('support_email', 'support@squidjob.com', 'string', 'Support contact email', TRUE),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', FALSE);

-- ============================================================================
-- SAMPLE NOTIFICATIONS
-- ============================================================================

INSERT INTO notifications (title, message, notification_type, user_id, category, priority, related_object_type, related_object_id, created_by) VALUES
('Welcome to SquidJob', 'Welcome to the SquidJob Tender Management System. Your account has been created successfully.', 'success', 2, 'account', 'normal', 'user', 2, 1),
('New Tender Assignment', 'You have been assigned to tender TNR2025001 - Supply of Computer Hardware', 'info', 2, 'tender', 'high', 'tender', 1, 1),
('Tender Deadline Reminder', 'Tender TNR2025002 deadline is approaching in 7 days', 'warning', 2, 'deadline', 'high', 'tender', 2, 1),
('Document Upload Required', 'Please upload required documents for tender TNR2025003', 'info', 3, 'document', 'normal', 'tender', 3, 1);

-- ============================================================================
-- INDEXES AND OPTIMIZATIONS
-- ============================================================================

-- Additional indexes for better performance
CREATE INDEX idx_users_email_status ON users(email, status);
CREATE INDEX idx_tenders_status_deadline ON tenders(status, deadline);
CREATE INDEX idx_tender_assignments_user_status ON tender_assignments(user_id, status);
CREATE INDEX idx_companies_type_status ON companies(company_type, status);
CREATE INDEX idx_documents_tender_type ON documents(tender_id, document_type);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_audit_logs_table_date ON audit_logs(table_name, created_at);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT 'Database seeding completed successfully!' as message,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM roles) as total_roles,
       (SELECT COUNT(*) FROM permissions) as total_permissions,
       (SELECT COUNT(*) FROM tenders) as total_tenders,
       (SELECT COUNT(*) FROM companies) as total_companies;