-- PostgreSQL 13.20 Compatible Database Import Script
-- Tender Management System - Clean Import for VPS Deployment
-- Generated: 2025-07-25
-- Compatible with PostgreSQL 13.x

-- Create database (run this separately if needed)
-- CREATE DATABASE squidjob_squidjobdb;

-- Connect to your database and run the following:

-- Enable extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_tenders CASCADE;
DROP TABLE IF EXISTS tender_results CASCADE;
DROP TABLE IF EXISTS tender_responses CASCADE;
DROP TABLE IF EXISTS tender_documents CASCADE;
DROP TABLE IF EXISTS tender_assignments CASCADE;
DROP TABLE IF EXISTS task_allocations CASCADE;
DROP TABLE IF EXISTS reverse_auctions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS oems CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS kick_off_calls CASCADE;
DROP TABLE IF EXISTS general_settings CASCADE;
DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS financial_approvals CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS eligibility_criteria CASCADE;
DROP TABLE IF EXISTS document_briefcase CASCADE;
DROP TABLE IF EXISTS designations CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS database_backups CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS configurations CASCADE;
DROP TABLE IF EXISTS compiled_pdfs CASCADE;
DROP TABLE IF EXISTS competitors CASCADE;
DROP TABLE IF EXISTS company_documents CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS checklists CASCADE;
DROP TABLE IF EXISTS checklist_documents CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS bid_participation_companies CASCADE;
DROP TABLE IF EXISTS bid_participants CASCADE;
DROP TABLE IF EXISTS bid_documents CASCADE;
DROP TABLE IF EXISTS approval_requests CASCADE;
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS tenders CASCADE;
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
    permissions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions table
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission VARCHAR(255) NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tenders table
CREATE TABLE tenders (
    id SERIAL PRIMARY KEY,
    reference_no VARCHAR(255) UNIQUE NOT NULL,
    brief TEXT,
    authority VARCHAR(255),
    work_description TEXT,
    location VARCHAR(255),
    pincode VARCHAR(10),
    state VARCHAR(255),
    district VARCHAR(255),
    tender_value DECIMAL(15,2),
    emd_amount DECIMAL(15,2),
    document_cost DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    opening_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'new',
    category VARCHAR(255),
    type VARCHAR(100),
    source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    imported_at TIMESTAMP WITH TIME ZONE,
    portal_link TEXT,
    is_live BOOLEAN DEFAULT true,
    product_category VARCHAR(255),
    mse_exemption BOOLEAN DEFAULT false,
    startup_exemption BOOLEAN DEFAULT false,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    eligibility_criteria TEXT,
    technical_specifications TEXT,
    commercial_criteria TEXT,
    special_conditions TEXT,
    submission_mode VARCHAR(100),
    language_preference VARCHAR(50) DEFAULT 'english',
    currency VARCHAR(10) DEFAULT 'INR'
);

-- Activities table
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    tender_id INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
);

-- User tenders (for starring and interest tracking)
CREATE TABLE user_tenders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    is_starred BOOLEAN DEFAULT false,
    is_interested BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tender_id)
);

-- Task allocations table
CREATE TABLE task_allocations (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    assigned_to INTEGER NOT NULL,
    assigned_by INTEGER NOT NULL,
    due_date DATE,
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users
INSERT INTO users (username, password, name, email, phone, department, designation, role, address, city, state, contact_no) VALUES
('admin', '$2b$12$hNAj/c/WNTJN1SAwSgX8IuEK.zNeKBaUTlkFYx2/FwbH3as4jvdE6', 'System Administrator', 'admin@tender247.com', '9876543210', 'Admin', 'Administrator', 'Admin', 'System Office', 'Bhopal', 'Madhya Pradesh', '9876543210'),
('kn@starinxs.com', '$2b$12$hNAj/c/WNTJN1SAwSgX8IuEK.zNeKBaUTlkFYx2/FwbH3as4jvdE6', 'Kaustubh Nirmal', 'kn@starinxs.com', '9811222446', 'Admin', 'CEO', 'Admin', 'Lnct bhopal', 'Bhopal', 'Madhya Pradesh', '9811222446'),
('poonam_amale', '$2b$12$trRSgYda8i6OV9vCzNj5T.KnI2VdmZu82Fx5X2Avgwp8rnRxQpyu2', 'Poonam Amale', 'poonam@starinxs.com', '9673701295', 'Admin', 'Manager', 'Admin', 'Kolar road bhopal', 'Bhopal', 'Madhya Pradesh', '9673701295'),
('simraan_quereshi', '$2b$12$Go73Kya2o80x/cnIb84PUO/RsIk1RRNX7vaIVtIrd/vk2k0gQx4d2', 'Simraan Quereshi', 'simraan@starinxs.com', '6265480703', 'Tender Manager', 'Manager', 'Tender manager', 'Lnct bhopal', 'Bhopal', 'Madhya Pradesh', '6265480703'),
('mayank_vishwakarma', '$2b$12$Go73Kya2o80x/cnIb84PUO/RsIk1RRNX7vaIVtIrd/vk2k0gQx4d2', 'Mayank Vishwakarma', 'mayank@starinxs.com', '8649964866', 'Sales', 'Finance Executive', 'Finance', 'LNCT bhopal', 'Bhopal', 'Madhya Pradesh', '8649964866');

-- Insert sample departments
INSERT INTO departments (name, description) VALUES
('Admin', 'Administrative Department'),
('Tender Manager', 'Tender Management Department'),
('Sales', 'Sales Department'),
('Finance', 'Finance Department'),
('Technical', 'Technical Department');

-- Insert sample designations
INSERT INTO designations (name, description) VALUES
('CEO', 'Chief Executive Officer'),
('Manager', 'Department Manager'),
('Executive', 'Department Executive'),
('Assistant', 'Department Assistant'),
('Administrator', 'System Administrator');

-- Insert sample roles
INSERT INTO roles (name, description, permissions) VALUES
('Admin', 'Full system access', 'all'),
('Tender manager', 'Tender management access', 'tender_management'),
('Finance', 'Finance related access', 'finance'),
('Sales Head', 'Sales management access', 'sales_management'),
('Accountant', 'Accounting access', 'accounting');

-- Create indexes for better performance
CREATE INDEX idx_tenders_reference_no ON tenders(reference_no);
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tenders_end_date ON tenders(end_date);
CREATE INDEX idx_user_tenders_user_id ON user_tenders(user_id);
CREATE INDEX idx_user_tenders_tender_id ON user_tenders(tender_id);
CREATE INDEX idx_activities_tender_id ON activities(tender_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_task_allocations_tender_id ON task_allocations(tender_id);

-- Set sequence values (adjust these numbers based on your data)
SELECT setval('users_id_seq', 10, false);
SELECT setval('tenders_id_seq', 100, false);
SELECT setval('activities_id_seq', 1000, false);

COMMIT;