-- SquidJob Tender Management System Database Schema
-- Auto-generated for installation wizard

SET FOREIGN_KEY_CHECKS = 0;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `role` enum('admin','manager','user') DEFAULT 'user',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `avatar` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tender categories table
CREATE TABLE IF NOT EXISTS `tender_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `color` varchar(7) DEFAULT '#7c3aed',
  `icon` varchar(50) DEFAULT 'folder',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tenders table
CREATE TABLE IF NOT EXISTS `tenders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `reference_number` varchar(100) NOT NULL,
  `description` longtext,
  `category_id` int(11) DEFAULT NULL,
  `authority` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `tender_value` decimal(15,2) DEFAULT NULL,
  `emd_amount` decimal(15,2) DEFAULT NULL,
  `document_fee` decimal(10,2) DEFAULT NULL,
  `submission_deadline` datetime NOT NULL,
  `opening_date` datetime DEFAULT NULL,
  `validity_period` int(11) DEFAULT NULL,
  `status` enum('draft','live','in_progress','submitted','awarded','rejected','completed','cancelled') DEFAULT 'draft',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `eligibility_criteria` longtext,
  `technical_specifications` longtext,
  `terms_conditions` longtext,
  `contact_person` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `source_url` varchar(500) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference_number` (`reference_number`),
  KEY `idx_category` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_deadline` (`submission_deadline`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_authority` (`authority`),
  CONSTRAINT `fk_tenders_category` FOREIGN KEY (`category_id`) REFERENCES `tender_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tenders_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tenders_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tender documents table
CREATE TABLE IF NOT EXISTS `tender_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tender_id` int(11) NOT NULL,
  `document_type` enum('tender_document','technical_specs','financial_bid','emd_receipt','other') DEFAULT 'tender_document',
  `title` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_hash` varchar(64) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `download_count` int(11) DEFAULT 0,
  `uploaded_by` int(11) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tender` (`tender_id`),
  KEY `idx_type` (`document_type`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  KEY `idx_public` (`is_public`),
  CONSTRAINT `fk_tender_documents_tender` FOREIGN KEY (`tender_id`) REFERENCES `tenders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tender_documents_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Companies table
CREATE TABLE IF NOT EXISTS `companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `registration_number` varchar(100) DEFAULT NULL,
  `type` enum('private','public','government','ngo','partnership') DEFAULT 'private',
  `industry` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'India',
  `postal_code` varchar(20) DEFAULT NULL,
  `gst_number` varchar(50) DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `established_year` int(4) DEFAULT NULL,
  `employee_count` int(11) DEFAULT NULL,
  `annual_turnover` decimal(15,2) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `description` text,
  `certifications` json DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registration_number` (`registration_number`),
  KEY `idx_name` (`name`),
  KEY `idx_type` (`type`),
  KEY `idx_verified` (`is_verified`),
  KEY `idx_active` (`is_active`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_companies_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bids table
CREATE TABLE IF NOT EXISTS `bids` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tender_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `bid_amount` decimal(15,2) NOT NULL,
  `technical_score` decimal(5,2) DEFAULT NULL,
  `financial_score` decimal(5,2) DEFAULT NULL,
  `total_score` decimal(5,2) DEFAULT NULL,
  `status` enum('draft','submitted','under_review','shortlisted','awarded','rejected') DEFAULT 'draft',
  `submission_date` datetime DEFAULT NULL,
  `validity_period` int(11) DEFAULT NULL,
  `compliance_status` enum('compliant','non_compliant','pending_review') DEFAULT 'pending_review',
  `notes` text,
  `evaluation_notes` text,
  `submitted_by` int(11) NOT NULL,
  `evaluated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tender_company` (`tender_id`, `company_id`),
  KEY `idx_tender` (`tender_id`),
  KEY `idx_company` (`company_id`),
  KEY `idx_status` (`status`),
  KEY `idx_submitted_by` (`submitted_by`),
  KEY `idx_evaluated_by` (`evaluated_by`),
  CONSTRAINT `fk_bids_tender` FOREIGN KEY (`tender_id`) REFERENCES `tenders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bids_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bids_submitted_by` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bids_evaluated_by` FOREIGN KEY (`evaluated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bid documents table
CREATE TABLE IF NOT EXISTS `bid_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bid_id` int(11) NOT NULL,
  `document_type` enum('technical_proposal','financial_proposal','compliance_docs','supporting_docs','other') DEFAULT 'technical_proposal',
  `title` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_hash` varchar(64) DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT 0,
  `uploaded_by` int(11) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bid` (`bid_id`),
  KEY `idx_type` (`document_type`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  KEY `idx_required` (`is_required`),
  CONSTRAINT `fk_bid_documents_bid` FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bid_documents_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tender assignments table
CREATE TABLE IF NOT EXISTS `tender_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tender_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('lead','member','reviewer','observer') DEFAULT 'member',
  `assigned_by` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tender_user` (`tender_id`, `user_id`),
  KEY `idx_tender` (`tender_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_assigned_by` (`assigned_by`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `fk_assignments_tender` FOREIGN KEY (`tender_id`) REFERENCES `tenders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity logs table
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `description` text,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_entity` (`entity_type`, `entity_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_activity_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` longtext,
  `type` enum('string','integer','boolean','json','text') DEFAULT 'string',
  `description` text,
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `idx_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default tender categories
INSERT INTO `tender_categories` (`name`, `description`, `color`, `icon`) VALUES
('Construction', 'Construction and infrastructure projects', '#f59e0b', 'building'),
('IT Services', 'Information technology and software services', '#3b82f6', 'monitor'),
('Consulting', 'Professional consulting services', '#10b981', 'users'),
('Supply', 'Goods and materials supply', '#8b5cf6', 'package'),
('Maintenance', 'Maintenance and support services', '#ef4444', 'tool'),
('Healthcare', 'Medical and healthcare services', '#06b6d4', 'heart'),
('Education', 'Educational services and training', '#f97316', 'book-open'),
('Transportation', 'Transport and logistics services', '#84cc16', 'truck'),
('Security', 'Security and surveillance services', '#6366f1', 'shield'),
('Other', 'Miscellaneous tenders', '#64748b', 'more-horizontal');

-- Insert default system settings
INSERT INTO `settings` (`key`, `value`, `type`, `description`, `is_public`) VALUES
('app_name', 'SquidJob', 'string', 'Application name', 1),
('app_version', '1.0.0', 'string', 'Application version', 1),
('app_description', 'Hassle-Free Tender Management System', 'string', 'Application description', 1),
('timezone', 'Asia/Kolkata', 'string', 'Default timezone', 0),
('date_format', 'Y-m-d', 'string', 'Default date format', 0),
('datetime_format', 'Y-m-d H:i:s', 'string', 'Default datetime format', 0),
('currency', 'INR', 'string', 'Default currency', 1),
('currency_symbol', '₹', 'string', 'Currency symbol', 1),
('max_file_size', '52428800', 'integer', 'Maximum file upload size in bytes (50MB)', 0),
('allowed_file_types', '["pdf","doc","docx","xls","xlsx","jpg","jpeg","png","gif"]', 'json', 'Allowed file types for upload', 0),
('email_notifications', 'true', 'boolean', 'Enable email notifications', 0),
('sms_notifications', 'false', 'boolean', 'Enable SMS notifications', 0),
('tender_auto_archive_days', '365', 'integer', 'Days after which tenders are auto-archived', 0),
('backup_retention_days', '30', 'integer', 'Days to retain database backups', 0);

-- Create indexes for better performance
CREATE INDEX idx_tenders_search ON tenders(title, authority, location);
CREATE INDEX idx_tenders_dates ON tenders(submission_deadline, opening_date);
CREATE INDEX idx_documents_search ON tender_documents(title, original_filename);
CREATE INDEX idx_companies_search ON companies(name, registration_number);
CREATE INDEX idx_bids_amounts ON bids(bid_amount, technical_score, financial_score);

-- Create views for common queries
CREATE VIEW tender_summary AS
SELECT 
    t.id,
    t.title,
    t.reference_number,
    t.authority,
    t.tender_value,
    t.submission_deadline,
    t.status,
    t.priority,
    tc.name as category_name,
    tc.color as category_color,
    u1.first_name as created_by_name,
    u2.first_name as assigned_to_name,
    COUNT(DISTINCT td.id) as document_count,
    COUNT(DISTINCT b.id) as bid_count,
    t.created_at,
    t.updated_at
FROM tenders t
LEFT JOIN tender_categories tc ON t.category_id = tc.id
LEFT JOIN users u1 ON t.created_by = u1.id
LEFT JOIN users u2 ON t.assigned_to = u2.id
LEFT JOIN tender_documents td ON t.id = td.tender_id
LEFT JOIN bids b ON t.id = b.tender_id
GROUP BY t.id;

-- Create triggers for activity logging
DELIMITER $$

CREATE TRIGGER tender_insert_log AFTER INSERT ON tenders
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, entity_type, entity_id, action, description, new_values)
    VALUES (NEW.created_by, 'tender', NEW.id, 'created', 
            CONCAT('Tender "', NEW.title, '" was created'), 
            JSON_OBJECT('title', NEW.title, 'status', NEW.status));
END$$

CREATE TRIGGER tender_update_log AFTER UPDATE ON tenders
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, entity_type, entity_id, action, description, old_values, new_values)
    VALUES (NEW.created_by, 'tender', NEW.id, 'updated', 
            CONCAT('Tender "', NEW.title, '" was updated'),
            JSON_OBJECT('status', OLD.status, 'title', OLD.title),
            JSON_OBJECT('status', NEW.status, 'title', NEW.title));
END$$

CREATE TRIGGER bid_insert_log AFTER INSERT ON bids
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, entity_type, entity_id, action, description, new_values)
    VALUES (NEW.submitted_by, 'bid', NEW.id, 'created', 
            CONCAT('Bid submitted for tender ID ', NEW.tender_id), 
            JSON_OBJECT('bid_amount', NEW.bid_amount, 'status', NEW.status));
END$$

DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;

-- Final message
SELECT 'SquidJob Tender Management System database schema installed successfully!' as message;