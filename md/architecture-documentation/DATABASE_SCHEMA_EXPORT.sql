-- =====================================================
-- TENDER MANAGEMENT SYSTEM - DATABASE SCHEMA EXPORT
-- Source: PostgreSQL (Current System)
-- Target: MySQL (Migration Ready)
-- =====================================================

-- =====================================================
-- USER MANAGEMENT TABLES
-- =====================================================

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    department VARCHAR(100),
    designation VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    avatar TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions table
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id),
    permission_name VARCHAR(100) NOT NULL,
    granted BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    head_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Designations table
CREATE TABLE designations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    department_id INTEGER REFERENCES departments(id),
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TENDER MANAGEMENT TABLES
-- =====================================================

-- Tenders table
CREATE TABLE tenders (
    id SERIAL PRIMARY KEY,
    reference_no VARCHAR(100) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    brief TEXT NOT NULL,
    authority TEXT NOT NULL,
    location TEXT,
    deadline TIMESTAMP NOT NULL,
    emd_amount NUMERIC(15,2),
    document_fee NUMERIC(15,2),
    estimated_value NUMERIC(15,2),
    bid_value NUMERIC(15,2),
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    submitted_by TEXT,
    submitted_date TIMESTAMP,
    bid_document_path TEXT,
    atc_document_path TEXT,
    tech_specs_document_path TEXT,
    parsed_data JSONB,
    item_categories TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Tender assignments
CREATE TABLE tender_assignments (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES tenders(id),
    user_id INTEGER REFERENCES users(id),
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

-- Tender reminders
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES tenders(id),
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_date TIMESTAMP NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- COMPANY & VENDOR MANAGEMENT
-- =====================================================

-- Companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- 'dealer', 'oem', 'vendor'
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    gst_number VARCHAR(50),
    pan_number VARCHAR(20),
    contact_person VARCHAR(255),
    website VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company documents
CREATE TABLE company_documents (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    document_type VARCHAR(100), -- 'gst_certificate', 'pan_card', 'incorporation'
    filename VARCHAR(255),
    file_path TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dealers table (specific type of company)
CREATE TABLE dealers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    dealer_code VARCHAR(50),
    territory TEXT,
    product_categories TEXT[],
    commission_rate NUMERIC(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OEMs table (Original Equipment Manufacturers)
CREATE TABLE oems (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    manufacturer_code VARCHAR(50),
    product_lines TEXT[],
    certifications TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- BID PARTICIPATION SYSTEM
-- =====================================================

-- Bid participations
CREATE TABLE bid_participations (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES tenders(id),
    title VARCHAR(255),
    description TEXT,
    submission_deadline TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bid participation companies
CREATE TABLE bid_participation_companies (
    id SERIAL PRIMARY KEY,
    bid_participation_id INTEGER REFERENCES bid_participations(id),
    company_id INTEGER REFERENCES companies(id),
    role VARCHAR(50), -- 'prime', 'sub_contractor', 'dealer'
    contribution_percentage NUMERIC(5,2),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kickoff calls
CREATE TABLE kickoff_calls (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES tenders(id),
    scheduled_date TIMESTAMP,
    participants TEXT[],
    agenda TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FINANCIAL MANAGEMENT
-- =====================================================

-- Purchase orders
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(100) NOT NULL UNIQUE,
    tender_id INTEGER REFERENCES tenders(id),
    vendor_id INTEGER REFERENCES companies(id),
    amount NUMERIC(15,2) NOT NULL,
    description TEXT,
    terms_conditions TEXT,
    delivery_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial approvals
CREATE TABLE financial_approvals (
    id SERIAL PRIMARY KEY,
    po_id INTEGER REFERENCES purchase_orders(id),
    approver_id INTEGER REFERENCES users(id),
    approval_level INTEGER,
    status VARCHAR(20), -- 'pending', 'approved', 'rejected'
    comments TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DOCUMENT MANAGEMENT
-- =====================================================

-- Document briefcases
CREATE TABLE document_briefcases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Briefcase documents
CREATE TABLE briefcase_documents (
    id SERIAL PRIMARY KEY,
    briefcase_id INTEGER REFERENCES document_briefcases(id),
    filename VARCHAR(255),
    file_path TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANALYTICS & REPORTING
-- =====================================================

-- Tender responses
CREATE TABLE tender_responses (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES tenders(id),
    participant_name VARCHAR(255),
    bid_amount NUMERIC(15,2),
    submitted_at TIMESTAMP,
    status VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard layouts
CREATE TABLE dashboard_layouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    layout_config JSONB,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SYSTEM CONFIGURATION
-- =====================================================

-- General settings
CREATE TABLE general_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    setting_type VARCHAR(20) DEFAULT 'string',
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES menu_items(id),
    label VARCHAR(100) NOT NULL,
    url VARCHAR(255),
    icon VARCHAR(50),
    permission_required VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Database backups
CREATE TABLE database_backups (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT,
    file_size BIGINT,
    backup_type VARCHAR(20), -- 'full', 'incremental'
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reverse auctions
CREATE TABLE reverse_auctions (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES tenders(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    minimum_decrement NUMERIC(15,2),
    current_lowest_bid NUMERIC(15,2),
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Tender indexes
CREATE INDEX idx_tenders_reference_no ON tenders(reference_no);
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tenders_deadline ON tenders(deadline);
CREATE INDEX idx_tenders_authority ON tenders(authority);

-- Assignment indexes
CREATE INDEX idx_tender_assignments_tender_id ON tender_assignments(tender_id);
CREATE INDEX idx_tender_assignments_user_id ON tender_assignments(user_id);

-- Company indexes
CREATE INDEX idx_companies_type ON companies(type);
CREATE INDEX idx_companies_name ON companies(name);

-- Document indexes
CREATE INDEX idx_briefcase_documents_briefcase_id ON briefcase_documents(briefcase_id);

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert default roles
INSERT INTO roles (id, name, description) VALUES 
(17, 'Admin', 'System Administrator with full access'),
(18, 'Tender Manager', 'Manages tender processes and assignments'),
(19, 'Sales Head', 'Manages sales activities and client relationships'),
(20, 'Accountant', 'Handles financial processes and approvals');

-- Insert default admin user
INSERT INTO users (id, username, password, name, email, role) VALUES 
(5, 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmNqj1bBgLmOjZy', 'System Administrator', 'admin@tender247.com', 'admin');

-- Insert default departments
INSERT INTO departments (name, description) VALUES 
('Information Technology', 'IT Department'),
('Sales & Marketing', 'Sales and Marketing Department'),
('Finance & Accounts', 'Finance and Accounts Department'),
('Operations', 'Operations Department');

-- Insert default settings
INSERT INTO general_settings (setting_key, setting_value, description) VALUES 
('system_name', 'Tender247 Management System', 'Application name'),
('company_name', 'Your Company Name', 'Company name for branding'),
('timezone', 'Asia/Kolkata', 'Default system timezone'),
('currency', 'INR', 'Default currency'),
('date_format', 'DD/MM/YYYY', 'Default date format');

-- =====================================================
-- END OF SCHEMA
-- =====================================================