-- Sample Data for Tender Management System
-- Version: 1.0.0
-- Created: July 29, 2025
-- Description: Comprehensive sample data for testing and demonstration

-- Insert default roles
INSERT INTO roles (id, name, display_name, description, level, is_system_role, created_by) VALUES
(1, 'admin', 'System Administrator', 'Complete system access and management capabilities', 1, true, 1),
(2, 'tender_manager', 'Tender Manager', 'Tender oversight and team management', 2, true, 1),
(3, 'sales_head', 'Sales Head', 'Business development and client relations', 3, true, 1),
(4, 'accountant', 'Accountant', 'Financial management and reporting', 4, true, 1),
(5, 'user', 'Team Member', 'Basic tender processing access', 5, true, 1);

-- Insert permissions
INSERT INTO permissions (name, display_name, description, module, category, is_system_permission, created_by) VALUES
('view_users', 'View Users', 'View user profiles and lists', 'users', 'read', true, 1),
('create_user', 'Create User', 'Create new user accounts', 'users', 'write', true, 1),
('edit_user', 'Edit User', 'Modify user profiles and settings', 'users', 'write', true, 1),
('delete_user', 'Delete User', 'Remove user accounts', 'users', 'delete', true, 1),
('manage_roles', 'Manage Roles', 'Assign and modify user roles', 'users', 'manage', true, 1),
('view_tenders', 'View Tenders', 'View tender information', 'tenders', 'read', false, 1),
('view_all_tenders', 'View All Tenders', 'View all tenders regardless of assignment', 'tenders', 'read', false, 1),
('create_tender', 'Create Tender', 'Create new tender entries', 'tenders', 'write', false, 1),
('edit_tender', 'Edit Tender', 'Modify tender information', 'tenders', 'write', false, 1),
('delete_tender', 'Delete Tender', 'Remove tenders from system', 'tenders', 'delete', false, 1),
('assign_tender', 'Assign Tender', 'Assign tenders to team members', 'tenders', 'manage', false, 1),
('approve_tender', 'Approve Tender', 'Approve tender submissions', 'tenders', 'approve', false, 1),
('submit_tender', 'Submit Tender', 'Submit tender bids', 'tenders', 'submit', false, 1),
('view_companies', 'View Companies', 'View company information', 'companies', 'read', false, 1),
('create_company', 'Create Company', 'Add new company records', 'companies', 'write', false, 1),
('edit_company', 'Edit Company', 'Modify company information', 'companies', 'write', false, 1),
('delete_company', 'Delete Company', 'Remove company records', 'companies', 'delete', false, 1),
('verify_company', 'Verify Company', 'Verify company credentials', 'companies', 'verify', false, 1),
('view_documents', 'View Documents', 'View and download documents', 'documents', 'read', false, 1),
('upload_documents', 'Upload Documents', 'Upload new documents', 'documents', 'write', false, 1),
('delete_documents', 'Delete Documents', 'Remove documents', 'documents', 'delete', false, 1),
('manage_document_access', 'Manage Document Access', 'Control document access levels', 'documents', 'manage', false, 1),
('view_financial_data', 'View Financial Data', 'View financial information', 'financial', 'read', false, 1),
('edit_financial_data', 'Edit Financial Data', 'Modify financial information', 'financial', 'write', false, 1),
('approve_financial', 'Approve Financial', 'Approve financial transactions', 'financial', 'approve', false, 1),
('generate_reports', 'Generate Reports', 'Generate reports', 'reports', 'generate', false, 1),
('manage_system_settings', 'Manage System Settings', 'Configure system settings', 'system', 'manage', true, 1),
('view_audit_logs', 'View Audit Logs', 'View system audit trail', 'system', 'audit', true, 1),
('manage_notifications', 'Manage Notifications', 'Send and manage notifications', 'system', 'notify', false, 1),
('backup_system', 'Backup System', 'Perform system backups', 'system', 'backup', true, 1);

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id, granted_by) VALUES
-- Admin role (all permissions)
(1, 1, 1), (1, 2, 1), (1, 3, 1), (1, 4, 1), (1, 5, 1), (1, 6, 1), (1, 7, 1), (1, 8, 1), (1, 9, 1), (1, 10, 1),
(1, 11, 1), (1, 12, 1), (1, 13, 1), (1, 14, 1), (1, 15, 1), (1, 16, 1), (1, 17, 1), (1, 18, 1), (1, 19, 1), (1, 20, 1),
(1, 21, 1), (1, 22, 1), (1, 23, 1), (1, 24, 1), (1, 25, 1), (1, 26, 1), (1, 27, 1), (1, 28, 1), (1, 29, 1),
-- Tender Manager role
(2, 1, 1), (2, 6, 1), (2, 7, 1), (2, 8, 1), (2, 9, 1), (2, 11, 1), (2, 12, 1), (2, 13, 1), (2, 14, 1), (2, 15, 1),
(2, 16, 1), (2, 17, 1), (2, 18, 1), (2, 19, 1), (2, 21, 1), (2, 22, 1), (2, 23, 1), (2, 25, 1), (2, 26, 1), (2, 28, 1),
-- Sales Head role
(3, 1, 1), (3, 6, 1), (3, 7, 1), (3, 8, 1), (3, 9, 1), (3, 11, 1), (3, 12, 1), (3, 13, 1), (3, 14, 1), (3, 15, 1),
(3, 16, 1), (3, 17, 1), (3, 18, 1), (3, 19, 1), (3, 20, 1), (3, 21, 1), (3, 22, 1), (3, 23, 1), (3, 28, 1),
-- Accountant role
(4, 1, 1), (4, 6, 1), (4, 8, 1), (4, 15, 1), (4, 21, 1), (4, 24, 1), (4, 25, 1), (4, 26, 1), (4, 27, 1),
-- Basic User role
(5, 6, 1), (5, 8, 1), (5, 13, 1), (5, 15, 1), (5, 19, 1), (5, 20, 1);

-- Create default admin user
INSERT INTO users (id, email, password_hash, first_name, last_name, department, designation, status, email_verified, created_by) VALUES
(1, 'admin@tender247.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewUyh0yby1qmT.iu', 'System', 'Administrator', 'IT', 'System Administrator', 'active', true, 1);

-- Create sample users
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, department, designation, employee_id, status, email_verified, created_by) VALUES
(2, 'manager@tender247.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewUyh0yby1qmT.iu', 'John', 'Manager', '+91-9876543210', 'Operations', 'Tender Manager', 'EMP001', 'active', true, 1),
(3, 'sales@tender247.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewUyh0yby1qmT.iu', 'Sarah', 'Wilson', '+91-9876543211', 'Sales', 'Sales Head', 'EMP002', 'active', true, 1),
(4, 'accounts@tender247.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewUyh0yby1qmT.iu', 'Mike', 'Johnson', '+91-9876543212', 'Finance', 'Senior Accountant', 'EMP003', 'active', true, 1),
(5, 'user1@tender247.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewUyh0yby1qmT.iu', 'Alice', 'Smith', '+91-9876543213', 'Operations', 'Team Member', 'EMP004', 'active', true, 1),
(6, 'user2@tender247.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewUyh0yby1qmT.iu', 'David', 'Brown', '+91-9876543214', 'Technical', 'Technical Specialist', 'EMP005', 'active', true, 1);

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
(1, 1, 1), -- Admin role
(2, 2, 1), -- Tender Manager role
(3, 3, 1), -- Sales Head role
(4, 4, 1), -- Accountant role
(5, 5, 1), -- User role
(6, 5, 1); -- User role

-- Insert sample companies
INSERT INTO companies (id, name, company_type, registration_number, email, phone, website, address_line1, city, state, country, industry, business_category, gst_number, pan_number, capabilities, certifications, performance_rating, completed_projects, success_rate, status, verification_status, created_by, verified_by) VALUES
(1, 'TechCorp Solutions Pvt Ltd', 'oem', 'U72900KA2015PTC082156', 'contact@techcorp.com', '+91-8012345678', 'https://techcorp.com', 'Tech Park, Electronic City Phase 1', 'Bangalore', 'Karnataka', 'India', 'Information Technology', 'Software Development', '29AABCT1234L1Z5', 'AABCT1234L', ARRAY['Software Development', 'Cloud Solutions', 'Mobile Apps'], ARRAY['ISO 9001:2015', 'CMMI Level 3'], 4.2, 45, 87.50, 'active', 'verified', 1, 1),
(2, 'Industrial Equipment Suppliers', 'dealer', 'U29100MH2010PTC198765', 'sales@iesequipment.com', '+91-2267894561', 'https://iesequipment.com', 'Industrial Estate, Andheri East', 'Mumbai', 'Maharashtra', 'India', 'Manufacturing', 'Industrial Equipment', '27AABCI5678M1Z3', 'AABCI5678M', ARRAY['Heavy Machinery', 'Industrial Tools', 'Maintenance Services'], ARRAY['ISO 14001:2015'], 3.8, 32, 78.20, 'active', 'verified', 1, 1),
(3, 'Green Energy Contractors', 'contractor', 'U40108DL2018PTC123456', 'info@greenenergy.com', '+91-1123456789', 'https://greenenergy.com', 'Connaught Place', 'New Delhi', 'Delhi', 'India', 'Renewable Energy', 'Solar Installation', '07AABCG9876K1Z9', 'AABCG9876K', ARRAY['Solar Panel Installation', 'Wind Energy', 'Energy Consulting'], ARRAY['MNRE Certification', 'ISO 50001:2018'], 4.5, 68, 92.30, 'active', 'verified', 1, 1),
(4, 'Office Supplies Direct', 'vendor', 'U51909UP2012PTC054321', 'orders@officesupplies.com', '+91-5122334455', 'https://officesupplies.com', 'Sector 62, Noida', 'Noida', 'Uttar Pradesh', 'India', 'Office Supplies', 'Stationery & Equipment', '09AABCO4321N1Z7', 'AABCO4321N', ARRAY['Office Furniture', 'Stationery', 'IT Equipment'], ARRAY['ISO 9001:2015'], 3.9, 156, 85.60, 'active', 'pending', 1, NULL),
(5, 'Construction Materials Ltd', 'vendor', 'U26943GJ2016PTC087654', 'procurement@constructionmat.com', '+91-7923456781', 'https://constructionmat.com', 'GIDC Industrial Area', 'Ahmedabad', 'Gujarat', 'India', 'Construction', 'Building Materials', '24AABCC6789P1Z1', 'AABCC6789P', ARRAY['Cement', 'Steel', 'Building Hardware'], ARRAY['BIS Certification'], 4.1, 89, 88.90, 'active', 'verified', 1, 1);

-- Insert sample tenders
INSERT INTO tenders (id, reference_no, title, description, authority, location, deadline, published_date, emd_amount, document_fee, estimated_value, status, created_by) VALUES
(1, 'TNR2025001', 'Supply of Computer Systems for Government Offices', 'Procurement of desktop computers, laptops, and peripheral equipment for various government departments. The tender includes installation, configuration, and 3-year warranty support.', 'Department of Information Technology, Karnataka', 'Bangalore, Karnataka', '2025-08-15 17:00:00', '2025-07-20', 250000.00, 5000.00, 12500000.00, 'live', 1),
(2, 'TNR2025002', 'Construction of Community Health Center', 'Design and construction of a 50-bed community health center including medical equipment installation and civil works as per approved architectural plans.', 'Public Health Department, Maharashtra', 'Pune, Maharashtra', '2025-08-22 15:30:00', '2025-07-22', 500000.00, 10000.00, 25000000.00, 'live', 2),
(3, 'TNR2025003', 'Solar Panel Installation for Educational Institutions', 'Installation of rooftop solar panels (500 KW capacity) across 15 government schools and colleges with grid connectivity and monitoring systems.', 'Ministry of New and Renewable Energy', 'Multiple locations, Delhi NCR', '2025-09-10 16:00:00', '2025-07-25', 750000.00, 15000.00, 37500000.00, 'in_process', 2),
(4, 'TNR2025004', 'Office Furniture and Equipment Supply', 'Supply of modular office furniture, conference room equipment, and ergonomic seating for newly constructed administrative building.', 'General Administration Department, UP', 'Lucknow, Uttar Pradesh', '2025-08-05 14:00:00', '2025-07-18', 150000.00, 3000.00, 7500000.00, 'submitted', 3),
(5, 'TNR2025005', 'Road Construction and Maintenance', 'Construction of 25 km rural road connectivity with bituminous surface and drainage systems including 2-year maintenance contract.', 'Rural Development Department, Gujarat', 'Ahmedabad District, Gujarat', '2025-09-15 17:30:00', '2025-07-28', 1000000.00, 20000.00, 50000000.00, 'draft', 2),
(6, 'TNR2025006', 'Medical Equipment Procurement', 'Procurement of advanced medical diagnostic equipment including MRI, CT Scan, and laboratory instruments for district hospital.', 'Health Department, Tamil Nadu', 'Chennai, Tamil Nadu', '2025-07-31 12:00:00', '2025-07-15', 2000000.00, 25000.00, 100000000.00, 'live', 1),
(7, 'TNR2025007', 'IT Infrastructure Upgrade', 'Upgrade of existing IT infrastructure including servers, networking equipment, and security systems for state data center.', 'Electronics and IT Department, Kerala', 'Thiruvananthapuram, Kerala', '2025-08-18 16:30:00', '2025-07-23', 800000.00, 12000.00, 40000000.00, 'live', 2);

-- Insert tender assignments
INSERT INTO tender_assignments (tender_id, user_id, role, responsibility, status, progress_percentage, assigned_by) VALUES
(1, 2, 'Project Manager', 'Overall project coordination and vendor management', 'in_progress', 75, 1),
(1, 5, 'Technical Reviewer', 'Technical specification review and evaluation', 'in_progress', 60, 2),
(2, 3, 'Business Lead', 'Commercial evaluation and negotiation', 'assigned', 25, 1),
(2, 6, 'Technical Specialist', 'Engineering and construction oversight', 'in_progress', 40, 2),
(3, 2, 'Project Manager', 'Solar project implementation management', 'in_progress', 85, 1),
(3, 6, 'Technical Lead', 'Solar panel installation supervision', 'in_progress', 80, 2),
(4, 3, 'Commercial Manager', 'Furniture procurement and logistics', 'completed', 100, 1),
(4, 5, 'Quality Coordinator', 'Quality inspection and acceptance', 'completed', 100, 3),
(5, 2, 'Project Coordinator', 'Road construction planning and execution', 'assigned', 15, 1),
(6, 4, 'Financial Advisor', 'Budget analysis and cost optimization', 'in_progress', 50, 1),
(7, 5, 'IT Coordinator', 'Infrastructure deployment coordination', 'assigned', 20, 2);

-- Insert sample documents
INSERT INTO documents (original_name, stored_name, file_path, file_size, mime_type, document_type, category, tender_id, status, uploaded_by) VALUES
('Computer_Systems_Tender_Document.pdf', 'doc_1_20250729_001.pdf', '/uploads/tenders/1/doc_1_20250729_001.pdf', 2048576, 'application/pdf', 'tender_document', 'main', 1, 'active', 1),
('Technical_Specifications_Computers.pdf', 'doc_1_20250729_002.pdf', '/uploads/tenders/1/doc_1_20250729_002.pdf', 1536000, 'application/pdf', 'tech_specs', 'technical', 1, 'active', 2),
('Health_Center_Construction_RFP.pdf', 'doc_2_20250729_001.pdf', '/uploads/tenders/2/doc_2_20250729_001.pdf', 3072000, 'application/pdf', 'tender_document', 'main', 2, 'active', 2),
('Architectural_Plans_Health_Center.pdf', 'doc_2_20250729_002.pdf', '/uploads/tenders/2/doc_2_20250729_002.pdf', 5120000, 'application/pdf', 'supporting_document', 'technical', 2, 'active', 2),
('Solar_Installation_Guidelines.pdf', 'doc_3_20250729_001.pdf', '/uploads/tenders/3/doc_3_20250729_001.pdf', 2560000, 'application/pdf', 'tender_document', 'main', 3, 'active', 2),
('MNRE_Solar_Standards.pdf', 'doc_3_20250729_002.pdf', '/uploads/tenders/3/doc_3_20250729_002.pdf', 1024000, 'application/pdf', 'compliance_certificate', 'regulatory', 3, 'active', 6),
('Office_Furniture_Catalog.pdf', 'doc_4_20250729_001.pdf', '/uploads/tenders/4/doc_4_20250729_001.pdf', 4096000, 'application/pdf', 'tender_document', 'main', 4, 'active', 3),
('Furniture_Quality_Standards.pdf', 'doc_4_20250729_002.pdf', '/uploads/tenders/4/doc_4_20250729_002.pdf', 1792000, 'application/pdf', 'tech_specs', 'quality', 4, 'active', 5);

-- Insert system settings
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
('company_verification_required', 'true', 'boolean', 'Require company verification before use', 'companies');

-- Insert sample notifications
INSERT INTO notifications (title, message, notification_type, user_id, category, priority, status, related_object_type, related_object_id, created_by) VALUES
('New Tender Created', 'A new tender "Supply of Computer Systems" has been created and assigned to your team.', 'info', 2, 'tender', 'normal', 'unread', 'tender', 1, 1),
('Tender Deadline Approaching', 'Reminder: Tender "Medical Equipment Procurement" deadline is in 2 days.', 'warning', 1, 'deadline', 'high', 'unread', 'tender', 6, 1),
('Assignment Completed', 'Office Furniture procurement has been successfully completed.', 'success', 3, 'assignment', 'normal', 'read', 'tender', 4, 3),
('Document Uploaded', 'New technical specifications document uploaded for Solar Panel tender.', 'info', 6, 'document', 'normal', 'unread', 'document', 6, 2),
('Company Verification Pending', 'Office Supplies Direct company verification is pending review.', 'warning', 1, 'company', 'normal', 'unread', 'company', 4, 1);

-- Insert sample audit logs
INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_fields, user_id, ip_address, description) VALUES
('tenders', 1, 'INSERT', NULL, '{"title": "Supply of Computer Systems for Government Offices", "status": "draft"}', ARRAY['title', 'status'], 1, '192.168.1.100', 'New tender created'),
('tenders', 1, 'UPDATE', '{"status": "draft"}', '{"status": "live"}', ARRAY['status'], 1, '192.168.1.100', 'Tender status updated to live'),
('tender_assignments', 1, 'INSERT', NULL, '{"tender_id": 1, "user_id": 2, "role": "Project Manager"}', ARRAY['tender_id', 'user_id', 'role'], 1, '192.168.1.100', 'User assigned to tender'),
('users', 2, 'UPDATE', '{"last_login": null}', '{"last_login": "2025-07-29 10:30:00"}', ARRAY['last_login'], 2, '192.168.1.101', 'User login recorded'),
('companies', 1, 'UPDATE', '{"verification_status": "pending"}', '{"verification_status": "verified"}', ARRAY['verification_status'], 1, '192.168.1.100', 'Company verification completed');

-- Update sequences to correct values
SELECT setval('users_id_seq', 6, true);
SELECT setval('roles_id_seq', 5, true);
SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions), true);
SELECT setval('tenders_id_seq', 7, true);
SELECT setval('companies_id_seq', 5, true);
SELECT setval('tender_assignments_id_seq', (SELECT MAX(id) FROM tender_assignments), true);
SELECT setval('documents_id_seq', (SELECT MAX(id) FROM documents), true);

-- Create a function to generate more sample data if needed
CREATE OR REPLACE FUNCTION generate_additional_sample_data(num_tenders INTEGER DEFAULT 10, num_users INTEGER DEFAULT 5)
RETURNS TEXT AS $$
DECLARE
    i INTEGER;
    user_count INTEGER;
    tender_count INTEGER;
    sample_authorities TEXT[] := ARRAY[
        'Department of Public Works',
        'Ministry of Health and Family Welfare',
        'Railway Board',
        'Defense Research and Development Organization',
        'Indian Space Research Organization',
        'National Highway Authority of India',
        'Central Public Works Department',
        'Posts and Telegraphs Department'
    ];
    sample_locations TEXT[] := ARRAY[
        'Mumbai, Maharashtra',
        'Delhi, NCR',
        'Bangalore, Karnataka',
        'Chennai, Tamil Nadu',
        'Kolkata, West Bengal',
        'Hyderabad, Telangana',
        'Pune, Maharashtra',
        'Ahmedabad, Gujarat'
    ];
BEGIN
    -- Get current counts
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO tender_count FROM tenders;
    
    -- Generate additional users
    FOR i IN 1..num_users LOOP
        INSERT INTO users (
            email, password_hash, first_name, last_name, phone, 
            department, designation, employee_id, status, email_verified, created_by
        ) VALUES (
            'testuser' || (user_count + i) || '@tender247.com',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewUyh0yby1qmT.iu',
            'Test' || (user_count + i),
            'User',
            '+91-98765432' || LPAD((user_count + i)::text, 2, '0'),
            'Operations',
            'Team Member',
            'EMP' || LPAD((user_count + i)::text, 3, '0'),
            'active',
            true,
            1
        );
        
        -- Assign user role
        INSERT INTO user_roles (user_id, role_id, assigned_by) 
        VALUES (user_count + i, 5, 1);
    END LOOP;
    
    -- Generate additional tenders
    FOR i IN 1..num_tenders LOOP
        INSERT INTO tenders (
            reference_no, title, description, authority, location,
            deadline, published_date, emd_amount, document_fee, estimated_value,
            status, created_by
        ) VALUES (
            'TNR2025' || LPAD((tender_count + i)::text, 3, '0'),
            'Sample Tender ' || (tender_count + i) || ' - Equipment Procurement',
            'This is a sample tender for testing and demonstration purposes. It includes procurement of various equipment and services.',
            sample_authorities[1 + ((tender_count + i - 1) % array_length(sample_authorities, 1))],
            sample_locations[1 + ((tender_count + i - 1) % array_length(sample_locations, 1))],
            CURRENT_TIMESTAMP + INTERVAL '30 days' + (i || ' days')::INTERVAL,
            CURRENT_DATE - INTERVAL '5 days',
            (100000 + (i * 50000))::DECIMAL,
            (2000 + (i * 1000))::DECIMAL,
            (5000000 + (i * 2500000))::DECIMAL,
            CASE 
                WHEN i % 4 = 0 THEN 'live'
                WHEN i % 4 = 1 THEN 'draft'
                WHEN i % 4 = 2 THEN 'in_process'
                ELSE 'submitted'
            END,
            1 + (i % 3)
        );
    END LOOP;
    
    RETURN 'Successfully generated ' || num_users || ' users and ' || num_tenders || ' tenders';
END;
$$ LANGUAGE plpgsql;

-- Insert sample session for testing
INSERT INTO sessions (sid, sess, expire) VALUES 
('sample-session-id-for-testing', '{"userId": 1, "email": "admin@tender247.com"}', CURRENT_TIMESTAMP + INTERVAL '1 day');

COMMENT ON FUNCTION generate_additional_sample_data IS 'Utility function to generate additional sample data for testing';