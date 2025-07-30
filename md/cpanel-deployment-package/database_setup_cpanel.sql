-- PostgreSQL Database Setup for Tender Management System
-- Compatible with cPanel PostgreSQL (version 12+ recommended)
-- 
-- Instructions:
-- 1. Create a new PostgreSQL database in cPanel
-- 2. Run this script through phpPGAdmin or psql command line
-- 3. Update your Node.js environment variables with the database credentials

-- Create database extensions (if available)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Role permissions table
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tenders table
CREATE TABLE tenders (
    id SERIAL PRIMARY KEY,
    status VARCHAR(100) DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reference_no VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    brief TEXT,
    authority VARCHAR(255),
    location VARCHAR(255),
    deadline TIMESTAMP WITH TIME ZONE,
    emd_amount VARCHAR(100),
    estimate_value VARCHAR(100),
    published_date DATE,
    bid_start_date DATE,
    due_date DATE,
    tech_specs_document_path TEXT,
    parsed_data JSONB,
    item_categories TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Tender assignments table
CREATE TABLE tender_assignments (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assign_type VARCHAR(100) DEFAULT 'primary',
    comments TEXT
);

-- User tender preferences table
CREATE TABLE user_tender_preferences (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_starred BOOLEAN DEFAULT false,
    is_interested BOOLEAN DEFAULT false,
    UNIQUE(tender_id, user_id)
);

-- Tender reminders table
CREATE TABLE tender_reminders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    comments TEXT,
    reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Tender eligibility criteria table
CREATE TABLE tender_eligibility_criteria (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
    criteria TEXT NOT NULL,
    category VARCHAR(255),
    is_ai_generated BOOLEAN DEFAULT false
);

-- Files table
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
    category VARCHAR(255),
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Competitors table
CREATE TABLE competitors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(255),
    representative_name VARCHAR(255),
    contact VARCHAR(255),
    participated_tenders INTEGER DEFAULT 0,
    awarded_tenders INTEGER DEFAULT 0,
    lost_tenders INTEGER DEFAULT 0
);

-- Bid results table
CREATE TABLE bid_results (
    id SERIAL PRIMARY KEY,
    status VARCHAR(100) NOT NULL DEFAULT 'Published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
    winner_id INTEGER REFERENCES competitors(id) ON DELETE SET NULL,
    bid_amount VARCHAR(255),
    remarks TEXT
);

-- Bid participants table
CREATE TABLE bid_participants (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
    bid_amount VARCHAR(255) NOT NULL,
    remarks TEXT,
    participant_name VARCHAR(255) NOT NULL,
    bidder_status VARCHAR(50) NOT NULL
);

-- Reverse auctions table
CREATE TABLE reverse_auctions (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
    ra_no VARCHAR(255),
    start_amount VARCHAR(255),
    end_amount VARCHAR(255),
    start_date TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    document_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI insights table
CREATE TABLE ai_insights (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tender_id INTEGER,
    category VARCHAR(255) NOT NULL,
    insight_data JSONB NOT NULL
);

-- Activity logs table
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- Task allocations table
CREATE TABLE task_allocations (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    task_work TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(100) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tender responses table
CREATE TABLE tender_responses (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES tenders(id) ON DELETE CASCADE,
    response_name VARCHAR(255),
    response_type VARCHAR(100),
    file_path TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- General settings table
CREATE TABLE general_settings (
    id SERIAL PRIMARY KEY,
    color_theme VARCHAR(50) DEFAULT '#7a29a2',
    company_name VARCHAR(255) DEFAULT 'SquidJob',
    logo_path TEXT,
    smtp_host VARCHAR(255),
    smtp_port INTEGER,
    smtp_username VARCHAR(255),
    smtp_password TEXT,
    smtp_secure BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Database backups table
CREATE TABLE database_backups (
    id SERIAL PRIMARY KEY,
    backup_name VARCHAR(255) NOT NULL,
    backup_path TEXT NOT NULL,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Checklist settings table
CREATE TABLE checklist_settings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Folders table
CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Folder files table
CREATE TABLE folder_files (
    id SERIAL PRIMARY KEY,
    folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial admin user (password: admin123)
INSERT INTO users (username, password, name, email, role, department, designation, status)
VALUES (
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOuSVjTyL8LpOWl7VQb9HqJXhN.Jh5WKG',
    'System Admin',
    'admin@yourcompany.com',
    'Admin',
    'Admin',
    'Administrator',
    'Active'
);

-- Insert default role
INSERT INTO roles (name, description) VALUES ('Admin', 'Full system access');

-- Insert role permissions for admin
INSERT INTO role_permissions (role_id, permissions) VALUES (
    1,
    '{"dashboard": true, "tender": true, "tenderTask": true, "documentManagement": true, "finance": true, "mis": true, "settings": true, "salesDashboard": true, "financeDashboard": true}'
);

-- Insert general settings
INSERT INTO general_settings (company_name, color_theme) VALUES ('SquidJob', '#7c3aed');

-- Create indexes for better performance
CREATE INDEX idx_tenders_reference_no ON tenders(reference_no);
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tenders_deadline ON tenders(deadline);
CREATE INDEX idx_tender_assignments_tender_id ON tender_assignments(tender_id);
CREATE INDEX idx_tender_assignments_user_id ON tender_assignments(user_id);
CREATE INDEX idx_files_tender_id ON files(tender_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);