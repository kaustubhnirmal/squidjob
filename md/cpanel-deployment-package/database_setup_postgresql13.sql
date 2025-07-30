-- PostgreSQL 13.20 Compatible Database Setup for Tender Management System
-- This file creates the complete database schema without using pg_dump format
-- 
-- Instructions for cPanel/Shared Hosting:
-- 1. Create a new PostgreSQL database in cPanel
-- 2. Copy and paste this SQL content into phpPGAdmin SQL tab or psql command line
-- 3. Execute the script to create all tables and initial data
-- 4. Update your .env file with the database credentials

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS checklist_settings CASCADE;
DROP TABLE IF EXISTS user_tender_interests CASCADE;
DROP TABLE IF EXISTS user_tender_stars CASCADE;
DROP TABLE IF EXISTS tender_assignments CASCADE;
DROP TABLE IF EXISTS tender_responses CASCADE;
DROP TABLE IF EXISTS task_allocations CASCADE;
DROP TABLE IF EXISTS reverse_auctions CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS request_to_finance CASCADE;
DROP TABLE IF EXISTS kick_off_calls CASCADE;
DROP TABLE IF EXISTS bid_participants CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS document_brief_case CASCADE;
DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS tender_documents CASCADE;
DROP TABLE IF EXISTS tenders CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS designations CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(255),
    designation VARCHAR(255),
    role VARCHAR(100) DEFAULT 'user',
    avatar TEXT,
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active',
    contact_no VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Designations table
CREATE TABLE designations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User roles junction table
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- Permissions table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions junction table
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User specific permissions (overrides)
CREATE TABLE user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tenders table
CREATE TABLE tenders (
    id SERIAL PRIMARY KEY,
    reference_number VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    department_name VARCHAR(255),
    client_department VARCHAR(255),
    authority VARCHAR(255),
    tender_type VARCHAR(100),
    tender_category VARCHAR(100),
    tender_sub_category VARCHAR(100),
    form_of_contract VARCHAR(100),
    location TEXT,
    pincode VARCHAR(10),
    pre_qualification_details TEXT,
    product_category VARCHAR(255),
    sub_category VARCHAR(255),
    contract_value DECIMAL(15,2),
    estimated_value DECIMAL(15,2),
    emd_amount DECIMAL(15,2),
    emd_exemption BOOLEAN DEFAULT FALSE,
    emd_percentage DECIMAL(5,2),
    document_cost DECIMAL(10,2),
    seek_clarification_start_date TIMESTAMP WITH TIME ZONE,
    seek_clarification_end_date TIMESTAMP WITH TIME ZONE,
    pre_bid_meeting_date TIMESTAMP WITH TIME ZONE,
    pre_bid_meeting_venue TEXT,
    document_download_start_date TIMESTAMP WITH TIME ZONE,
    document_download_end_date TIMESTAMP WITH TIME ZONE,
    bid_submission_start_date TIMESTAMP WITH TIME ZONE,
    bid_submission_end_date TIMESTAMP WITH TIME ZONE,
    technical_bid_opening_date TIMESTAMP WITH TIME ZONE,
    published_date TIMESTAMP WITH TIME ZONE,
    document_purchase_start_date TIMESTAMP WITH TIME ZONE,
    document_purchase_end_date TIMESTAMP WITH TIME ZONE,
    clarification_start_date TIMESTAMP WITH TIME ZONE,
    clarification_end_date TIMESTAMP WITH TIME ZONE,
    period_of_work VARCHAR(255),
    location_of_work TEXT,
    completion_period VARCHAR(255),
    tender_fee DECIMAL(10,2),
    processing_fee DECIMAL(10,2),
    bid_validity_period VARCHAR(100),
    earnest_money_deposit DECIMAL(15,2),
    performance_security VARCHAR(255),
    bid_opening_place TEXT,
    contact_person VARCHAR(255),
    contact_designation VARCHAR(255),
    contact_address TEXT,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    contact_fax VARCHAR(20),
    website_url TEXT,
    tender_document_cost DECIMAL(10,2),
    status VARCHAR(100) DEFAULT 'Published',
    source VARCHAR(255),
    cpv_code VARCHAR(100),
    tender_value_min DECIMAL(15,2),
    tender_value_max DECIMAL(15,2),
    industry_sector VARCHAR(255),
    tender_documents TEXT,
    additional_information TEXT,
    external_reference_id VARCHAR(255),
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tender documents table
CREATE TABLE tender_documents (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(255),
    uploaded_by INTEGER REFERENCES users(id),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Folders table
CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Document brief case table
CREATE TABLE document_brief_case (
    id SERIAL PRIMARY KEY,
    folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(255),
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Files table (general file storage)
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(255),
    uploaded_by INTEGER REFERENCES users(id),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(100),
    description TEXT
);

-- Activities table (for audit trail and logs)
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bid participants table
CREATE TABLE bid_participants (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    participant_name VARCHAR(255) NOT NULL,
    bid_amount DECIMAL(15,2),
    status VARCHAR(100),
    location VARCHAR(255),
    representative_name VARCHAR(255),
    contact_info VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kick off calls table
CREATE TABLE kick_off_calls (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    call_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    agenda TEXT,
    participants TEXT,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Request to finance table
CREATE TABLE request_to_finance (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    request_type VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2),
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    reminder_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(100) DEFAULT 'Pending',
    requested_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reminders table
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_time TIME,
    status VARCHAR(100) DEFAULT 'Active',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reverse auctions table
CREATE TABLE reverse_auctions (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    ra_no VARCHAR(255),
    start_amount DECIMAL(15,2),
    end_amount DECIMAL(15,2),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(100) DEFAULT 'Active',
    document_path TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Task allocations table
CREATE TABLE task_allocations (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    task_work TEXT NOT NULL,
    assigned_to INTEGER REFERENCES users(id),
    assigned_by INTEGER REFERENCES users(id),
    deadline TIMESTAMP WITH TIME ZONE,
    reminder_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(100) DEFAULT 'Pending',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tender responses table
CREATE TABLE tender_responses (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    response_type VARCHAR(100),
    document_path TEXT,
    document_name VARCHAR(255),
    file_size BIGINT,
    compressed_path TEXT,
    compressed_size BIGINT,
    compression_ratio DECIMAL(5,2),
    submitted_by INTEGER REFERENCES users(id),
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tender assignments table
CREATE TABLE tender_assignments (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    assigned_to INTEGER NOT NULL REFERENCES users(id),
    assigned_by INTEGER NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    status VARCHAR(100) DEFAULT 'Active'
);

-- User tender stars table
CREATE TABLE user_tender_stars (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    starred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tender_id)
);

-- User tender interests table
CREATE TABLE user_tender_interests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    interested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tender_id)
);

-- Checklist settings table
CREATE TABLE checklist_settings (
    id SERIAL PRIMARY KEY,
    checklist_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial users
INSERT INTO users (username, password, name, email, phone, department, designation, role, status) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LEfMpFoJhFjd8.k3G', 'System Administrator', 'admin@squidjob.com', '9999999999', 'IT', 'Administrator', 'Admin', 'Active'),
('kn@starinxs.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LEfMpFoJhFjd8.k3G', 'Kaustubh Nirmal', 'kn@starinxs.com', '9876543210', 'Management', 'Director', 'Admin', 'Active'),
('poonam.amale', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LEfMpFoJhFjd8.k3G', 'Poonam Amale', 'poonam.amale@squidjob.com', '9876543211', 'Operations', 'Manager', 'Admin', 'Active'),
('simraan_quereshi', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LEfMpFoJhFjd8.k3G', 'Simraan Quereshi', 'simraan@starinxs.com', '6265480703', 'Tender Manager', 'Manager', 'Tender manager', 'Active'),
('mayank_pathak', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LEfMpFoJhFjd8.k3G', 'Mayank Pathak', 'mayank@starinxs.com', '9876543212', 'Sales', 'Executive', 'Sales head', 'Active');

-- Insert initial departments
INSERT INTO departments (name, description) VALUES
('IT', 'Information Technology Department'),
('Management', 'Management and Administration'),
('Operations', 'Operations and Project Management'),
('Sales', 'Sales and Business Development'),
('Finance', 'Finance and Accounting'),
('Tender Manager', 'Tender Management and Coordination');

-- Insert initial designations
INSERT INTO designations (name, description) VALUES
('Administrator', 'System Administrator'),
('Director', 'Company Director'),
('Manager', 'Department Manager'),
('Executive', 'Executive Level Position'),
('Accountant', 'Finance and Accounting Professional');

-- Insert initial roles
INSERT INTO roles (name, description) VALUES
('Admin', 'Full system administrator access'),
('Tender manager', 'Tender management and coordination'),
('Sales head', 'Sales and business development lead'),
('Accountant', 'Finance and accounting professional'),
('User', 'Standard user access');

-- Insert initial permissions setup
INSERT INTO role_permissions (role_id, permissions) VALUES
(1, '{"admin": true, "dashboard": true, "salesDashboard": true, "financeDashboard": true, "tender": true, "settings": true, "documentManagement": {"folder": true, "documentBriefCase": true}, "mis": {"financeMis": true, "salesMis": true, "loginMis": true, "task": true, "approvals": true}, "tenderTask": {"myTender": true, "inProcess": true, "assignedToTeam": true, "submittedTender": true, "droppedTender": true, "rejected": true}, "allTenders": true, "myTenders": true, "tenderResults": true}'),
(2, '{"dashboard": true, "salesDashboard": true, "tender": true, "documentManagement": {"folder": true, "documentBriefCase": true}, "mis": {"task": true}, "tenderTask": {"myTender": true, "inProcess": true, "assignedToTeam": true, "submittedTender": true}, "allTenders": true, "myTenders": true, "tenderResults": true}'),
(3, '{"dashboard": true, "salesDashboard": true, "tender": true, "documentManagement": {"folder": true, "documentBriefCase": true}, "mis": {"salesMis": true, "task": true}, "tenderTask": {"myTender": true, "inProcess": true, "assignedToTeam": true, "submittedTender": true}, "allTenders": true, "myTenders": true, "tenderResults": true}'),
(4, '{"dashboard": true, "financeDashboard": true, "tender": true, "documentManagement": {"folder": true, "documentBriefCase": true}, "mis": {"financeMis": true, "approvals": true}, "tenderTask": {"myTender": true}, "allTenders": true, "myTenders": true}'),
(5, '{"dashboard": true, "salesDashboard": true, "tender": true, "allTenders": true, "myTenders": true}');

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- admin -> Admin role
(2, 1), -- kn@starinxs.com -> Admin role  
(3, 1), -- poonam.amale -> Admin role
(4, 2), -- simraan_quereshi -> Tender manager role
(5, 3); -- mayank_pathak -> Sales head role

-- Insert sample checklist settings
INSERT INTO checklist_settings (checklist_type, name, description, is_required, sort_order) VALUES
('Technical', 'Company Registration Certificate', 'Valid company registration document', true, 1),
('Technical', 'GST Registration', 'GST registration certificate', true, 2),
('Technical', 'PAN Card', 'Company PAN card copy', true, 3),
('Financial', 'Bank Guarantee', 'Bank guarantee for EMD', true, 1),
('Financial', 'Financial Statements', 'Last 3 years audited financial statements', true, 2),
('Commercial', 'Price Bid', 'Commercial price quotation', true, 1),
('Commercial', 'Terms and Conditions', 'Acceptance of tender terms', true, 2);

-- Create indexes for better performance
CREATE INDEX idx_tenders_reference_number ON tenders(reference_number);
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tenders_published_date ON tenders(published_date);
CREATE INDEX idx_tender_assignments_tender_id ON tender_assignments(tender_id);
CREATE INDEX idx_tender_assignments_assigned_to ON tender_assignments(assigned_to);
CREATE INDEX idx_user_tender_stars_user_id ON user_tender_stars(user_id);
CREATE INDEX idx_user_tender_interests_user_id ON user_tender_interests(user_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- Grant necessary permissions (adjust as needed for your database user)
-- Note: Replace 'your_db_user' with your actual database username
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;

-- Database setup completed successfully
-- Default admin password is: admin123 (please change after first login)