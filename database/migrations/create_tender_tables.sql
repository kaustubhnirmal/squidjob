-- SquidJob Tender Management System Database Schema
-- Complete database structure for tender management module
-- 
-- This migration creates all necessary tables for the tender management system
-- including tenders, categories, documents, bids, and related functionality

-- Create tender categories table
CREATE TABLE IF NOT EXISTS tender_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT NULL,
    icon VARCHAR(100) DEFAULT 'fas fa-folder',
    color VARCHAR(7) DEFAULT '#7c3aed',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_parent_id (parent_id),
    INDEX idx_slug (slug),
    INDEX idx_active_sort (is_active, sort_order),
    
    FOREIGN KEY (parent_id) REFERENCES tender_categories(id) ON DELETE SET NULL
);

-- Create tenders table
CREATE TABLE IF NOT EXISTS tenders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    technical_specifications TEXT NOT NULL,
    eligibility_criteria TEXT NOT NULL,
    terms_conditions TEXT,
    evaluation_criteria TEXT,
    
    -- Organization details
    organization VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- Category and classification
    category_id INT NOT NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    status ENUM('draft', 'active', 'closed', 'cancelled', 'awarded') DEFAULT 'draft',
    
    -- Financial details
    estimated_value DECIMAL(15,2) NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Location and dates
    location VARCHAR(255),
    submission_deadline DATETIME NOT NULL,
    opening_date DATETIME NULL,
    
    -- Requirements flags
    bond_required BOOLEAN DEFAULT FALSE,
    site_visit_required BOOLEAN DEFAULT FALSE,
    allow_consortium BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    reference_number VARCHAR(100) UNIQUE,
    views_count INT DEFAULT 0,
    bids_count INT DEFAULT 0,
    documents_count INT DEFAULT 0,
    
    -- Audit fields
    created_by INT NOT NULL,
    updated_by INT NULL,
    published_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_submission_deadline (submission_deadline),
    INDEX idx_created_by (created_by),
    INDEX idx_reference_number (reference_number),
    INDEX idx_published_status (published_at, status),
    INDEX idx_search (title, organization, location),
    
    -- Full-text search index
    FULLTEXT idx_fulltext_search (title, description, technical_specifications, organization),
    
    -- Foreign key constraints
    FOREIGN KEY (category_id) REFERENCES tender_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create tender documents table
CREATE TABLE IF NOT EXISTS tender_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tender_id INT NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    stored_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    
    -- Document metadata
    document_type ENUM('specification', 'drawing', 'terms', 'sample', 'other') DEFAULT 'other',
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    download_count INT DEFAULT 0,
    
    -- Security
    checksum VARCHAR(64),
    is_virus_scanned BOOLEAN DEFAULT FALSE,
    scan_result VARCHAR(50),
    
    -- Audit fields
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_tender_id (tender_id),
    INDEX idx_document_type (document_type),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_public (is_public),
    INDEX idx_file_type (file_type),
    
    -- Foreign key constraints
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tender_id INT NOT NULL,
    bidder_id INT NOT NULL,
    
    -- Bid details
    bid_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    completion_time INT, -- in days
    
    -- Bid content
    technical_proposal TEXT NOT NULL,
    financial_proposal TEXT,
    company_profile TEXT,
    
    -- Status and evaluation
    status ENUM('draft', 'submitted', 'under_review', 'shortlisted', 'rejected', 'awarded') DEFAULT 'draft',
    evaluation_score DECIMAL(5,2) DEFAULT 0.00,
    evaluation_notes TEXT,
    
    -- Compliance checks
    is_compliant BOOLEAN DEFAULT NULL,
    compliance_notes TEXT,
    
    -- Timestamps
    submitted_at DATETIME NULL,
    evaluated_at DATETIME NULL,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_tender_id (tender_id),
    INDEX idx_bidder_id (bidder_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at),
    INDEX idx_evaluation_score (evaluation_score),
    INDEX idx_tender_bidder (tender_id, bidder_id),
    
    -- Unique constraint to prevent duplicate bids
    UNIQUE KEY unique_tender_bidder (tender_id, bidder_id),
    
    -- Foreign key constraints
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create bid documents table
CREATE TABLE IF NOT EXISTS bid_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bid_id INT NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    stored_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    
    -- Document metadata
    document_type ENUM('technical', 'financial', 'legal', 'certificate', 'other') DEFAULT 'other',
    description TEXT,
    
    -- Security
    checksum VARCHAR(64),
    is_virus_scanned BOOLEAN DEFAULT FALSE,
    scan_result VARCHAR(50),
    
    -- Audit fields
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_bid_id (bid_id),
    INDEX idx_document_type (document_type),
    INDEX idx_uploaded_by (uploaded_by),
    
    -- Foreign key constraints
    FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Create tender watchers table (for notifications)
CREATE TABLE IF NOT EXISTS tender_watchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tender_id INT NOT NULL,
    user_id INT NOT NULL,
    notification_preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_tender_id (tender_id),
    INDEX idx_user_id (user_id),
    
    -- Unique constraint
    UNIQUE KEY unique_tender_watcher (tender_id, user_id),
    
    -- Foreign key constraints
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create tender activities table (for audit trail)
CREATE TABLE IF NOT EXISTS tender_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tender_id INT NOT NULL,
    user_id INT NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    metadata JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_tender_id (tender_id),
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at),
    
    -- Foreign key constraints
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create tender evaluations table
CREATE TABLE IF NOT EXISTS tender_evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tender_id INT NOT NULL,
    evaluator_id INT NOT NULL,
    bid_id INT NOT NULL,
    
    -- Evaluation criteria scores
    technical_score DECIMAL(5,2) DEFAULT 0.00,
    financial_score DECIMAL(5,2) DEFAULT 0.00,
    experience_score DECIMAL(5,2) DEFAULT 0.00,
    compliance_score DECIMAL(5,2) DEFAULT 0.00,
    total_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- Evaluation details
    comments TEXT,
    recommendations TEXT,
    
    -- Status
    status ENUM('pending', 'completed', 'reviewed') DEFAULT 'pending',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_tender_id (tender_id),
    INDEX idx_evaluator_id (evaluator_id),
    INDEX idx_bid_id (bid_id),
    INDEX idx_total_score (total_score),
    
    -- Unique constraint
    UNIQUE KEY unique_tender_evaluator_bid (tender_id, evaluator_id, bid_id),
    
    -- Foreign key constraints
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE
);

-- Create tender notifications table
CREATE TABLE IF NOT EXISTS tender_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tender_id INT NOT NULL,
    user_id INT NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Notification data
    data JSON,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME NULL,
    
    -- Delivery
    sent_via ENUM('email', 'sms', 'push', 'in_app') DEFAULT 'in_app',
    sent_at DATETIME NULL,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_tender_id (tender_id),
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    
    -- Foreign key constraints
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default tender categories
INSERT INTO tender_categories (name, slug, description, icon, color, sort_order) VALUES
('Construction', 'construction', 'Building and infrastructure projects', 'fas fa-building', '#f59e0b', 1),
('IT Services', 'it-services', 'Information technology and software services', 'fas fa-laptop-code', '#3b82f6', 2),
('Consulting', 'consulting', 'Professional consulting services', 'fas fa-user-tie', '#8b5cf6', 3),
('Supply & Procurement', 'supply-procurement', 'Goods and materials procurement', 'fas fa-boxes', '#10b981', 4),
('Maintenance', 'maintenance', 'Maintenance and repair services', 'fas fa-tools', '#ef4444', 5),
('Transportation', 'transportation', 'Transportation and logistics services', 'fas fa-truck', '#f97316', 6),
('Healthcare', 'healthcare', 'Medical and healthcare services', 'fas fa-heartbeat', '#ec4899', 7),
('Education', 'education', 'Educational services and training', 'fas fa-graduation-cap', '#06b6d4', 8),
('Security', 'security', 'Security and surveillance services', 'fas fa-shield-alt', '#64748b', 9),
('Other', 'other', 'Other miscellaneous services', 'fas fa-ellipsis-h', '#6b7280', 10);

-- Create indexes for better performance
CREATE INDEX idx_tenders_search ON tenders(status, submission_deadline, category_id);
CREATE INDEX idx_tenders_location ON tenders(location);
CREATE INDEX idx_bids_amount ON bids(bid_amount);
CREATE INDEX idx_documents_size ON tender_documents(file_size);

-- Create views for common queries
CREATE VIEW tender_summary AS
SELECT 
    t.id,
    t.title,
    t.organization,
    t.status,
    t.priority,
    t.estimated_value,
    t.currency,
    t.submission_deadline,
    t.created_at,
    tc.name as category_name,
    tc.color as category_color,
    u.name as created_by_name,
    t.bids_count,
    t.documents_count,
    t.views_count
FROM tenders t
LEFT JOIN tender_categories tc ON t.category_id = tc.id
LEFT JOIN users u ON t.created_by = u.id;

CREATE VIEW active_tenders AS
SELECT * FROM tender_summary 
WHERE status = 'active' 
AND submission_deadline > NOW()
ORDER BY submission_deadline ASC;

CREATE VIEW bid_summary AS
SELECT 
    b.id,
    b.tender_id,
    b.bidder_id,
    b.bid_amount,
    b.currency,
    b.status,
    b.evaluation_score,
    b.submitted_at,
    t.title as tender_title,
    u.name as bidder_name,
    u.email as bidder_email
FROM bids b
LEFT JOIN tenders t ON b.tender_id = t.id
LEFT JOIN users u ON b.bidder_id = u.id;

-- Add triggers for maintaining counts
DELIMITER //

CREATE TRIGGER update_tender_bids_count_insert
AFTER INSERT ON bids
FOR EACH ROW
BEGIN
    UPDATE tenders 
    SET bids_count = (SELECT COUNT(*) FROM bids WHERE tender_id = NEW.tender_id)
    WHERE id = NEW.tender_id;
END//

CREATE TRIGGER update_tender_bids_count_delete
AFTER DELETE ON bids
FOR EACH ROW
BEGIN
    UPDATE tenders 
    SET bids_count = (SELECT COUNT(*) FROM bids WHERE tender_id = OLD.tender_id)
    WHERE id = OLD.tender_id;
END//

CREATE TRIGGER update_tender_documents_count_insert
AFTER INSERT ON tender_documents
FOR EACH ROW
BEGIN
    UPDATE tenders 
    SET documents_count = (SELECT COUNT(*) FROM tender_documents WHERE tender_id = NEW.tender_id)
    WHERE id = NEW.tender_id;
END//

CREATE TRIGGER update_tender_documents_count_delete
AFTER DELETE ON tender_documents
FOR EACH ROW
BEGIN
    UPDATE tenders 
    SET documents_count = (SELECT COUNT(*) FROM tender_documents WHERE tender_id = OLD.tender_id)
    WHERE id = OLD.tender_id;
END//

CREATE TRIGGER generate_reference_number
BEFORE INSERT ON tenders
FOR EACH ROW
BEGIN
    IF NEW.reference_number IS NULL THEN
        SET NEW.reference_number = CONCAT('TND-', YEAR(NOW()), '-', LPAD(FLOOR(RAND() * 999999), 6, '0'));
    END IF;
END//

CREATE TRIGGER generate_tender_slug
BEFORE INSERT ON tenders
FOR EACH ROW
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        SET NEW.slug = CONCAT(
            LOWER(REPLACE(REPLACE(REPLACE(LEFT(NEW.title, 50), ' ', '-'), '.', ''), ',', '')),
            '-',
            UNIX_TIMESTAMP()
        );
    END IF;
END//

DELIMITER ;

-- Add some sample data for testing (optional)
-- INSERT INTO tenders (title, description, technical_specifications, eligibility_criteria, organization, category_id, submission_deadline, created_by, status) VALUES
-- ('Website Development Project', 'Development of a modern responsive website', 'PHP, MySQL, JavaScript, HTML5, CSS3', 'Minimum 2 years experience in web development', 'Tech Solutions Inc.', 2, '2024-03-15 17:00:00', 1, 'active'),
-- ('Office Building Construction', 'Construction of a 5-story office building', 'Concrete structure, modern architecture, HVAC systems', 'Licensed construction company with relevant experience', 'City Development Authority', 1, '2024-04-20 12:00:00', 1, 'active'),
-- ('IT Consulting Services', 'Strategic IT consulting for digital transformation', 'Cloud migration, system integration, security assessment', 'Certified IT consultants with enterprise experience', 'Global Corp Ltd.', 3, '2024-03-30 15:00:00', 1, 'active');

-- Performance optimization
ANALYZE TABLE tenders;
ANALYZE TABLE tender_categories;
ANALYZE TABLE tender_documents;
ANALYZE TABLE bids;
ANALYZE TABLE bid_documents;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON tender_categories TO 'squidjob_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON tenders TO 'squidjob_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON tender_documents TO 'squidjob_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON bids TO 'squidjob_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON bid_documents TO 'squidjob_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON tender_watchers TO 'squidjob_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON tender_activities TO 'squidjob_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON tender_evaluations TO 'squidjob_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON tender_notifications TO 'squidjob_user'@'localhost';

-- End of migration