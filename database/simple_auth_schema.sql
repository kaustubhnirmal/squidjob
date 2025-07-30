-- SquidJob Authentication System - Simple Schema
-- Compatible with MySQL 5.7+ and MariaDB 10.2+

-- Drop existing tables if they exist (for clean installation)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `login_attempts`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `email_verification_tokens`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `user_devices`;
DROP TABLE IF EXISTS `security_events`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `ip_whitelist`;
DROP TABLE IF EXISTS `ip_blacklist`;
DROP TABLE IF EXISTS `two_factor_auth`;
DROP TABLE IF EXISTS `security_settings`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;

SET FOREIGN_KEY_CHECKS = 1;

-- Create roles table
CREATE TABLE `roles` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `display_name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `level` INT DEFAULT 1,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_roles_name` (`name`),
    INDEX `idx_roles_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create permissions table
CREATE TABLE `permissions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `display_name` VARCHAR(150) NOT NULL,
    `description` TEXT,
    `module` VARCHAR(50) NOT NULL,
    `category` VARCHAR(50) DEFAULT 'general',
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_permissions_name` (`name`),
    INDEX `idx_permissions_module` (`module`),
    INDEX `idx_permissions_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create users table
CREATE TABLE `users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20),
    `company` VARCHAR(200),
    `status` ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'pending',
    `email_verified` TINYINT(1) DEFAULT 0,
    `email_verified_at` TIMESTAMP NULL,
    `last_login` TIMESTAMP NULL,
    `login_count` INT DEFAULT 0,
    `failed_login_attempts` INT DEFAULT 0,
    `locked_until` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_status` (`status`),
    INDEX `idx_users_last_login` (`last_login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create role_permissions table
CREATE TABLE `role_permissions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `role_id` INT NOT NULL,
    `permission_id` INT NOT NULL,
    `granted` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_role_permission` (`role_id`, `permission_id`),
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE,
    INDEX `idx_role_permissions_role` (`role_id`),
    INDEX `idx_role_permissions_permission` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_roles table
CREATE TABLE `user_roles` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `role_id` INT NOT NULL,
    `assigned_by` INT NOT NULL,
    `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `expires_at` TIMESTAMP NULL,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    UNIQUE KEY `unique_user_role` (`user_id`, `role_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    INDEX `idx_user_roles_user` (`user_id`),
    INDEX `idx_user_roles_role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create login_attempts table
CREATE TABLE `login_attempts` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `email` VARCHAR(255),
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` TEXT,
    `success` TINYINT(1) DEFAULT 0,
    `failure_reason` VARCHAR(100),
    `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_login_attempts_email` (`email`),
    INDEX `idx_login_attempts_ip` (`ip_address`),
    INDEX `idx_login_attempts_attempted_at` (`attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create password_reset_tokens table
CREATE TABLE `password_reset_tokens` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `token` VARCHAR(255) NOT NULL UNIQUE,
    `expires_at` TIMESTAMP NOT NULL,
    `used` TINYINT(1) DEFAULT 0,
    `used_at` TIMESTAMP NULL,
    `ip_address` VARCHAR(45),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_password_reset_token` (`token`),
    INDEX `idx_password_reset_user` (`user_id`),
    INDEX `idx_password_reset_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create email_verification_tokens table
CREATE TABLE `email_verification_tokens` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `token` VARCHAR(255) NOT NULL UNIQUE,
    `expires_at` TIMESTAMP NOT NULL,
    `used` TINYINT(1) DEFAULT 0,
    `used_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_email_verification_token` (`token`),
    INDEX `idx_email_verification_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_sessions table
CREATE TABLE `user_sessions` (
    `id` VARCHAR(128) PRIMARY KEY,
    `user_id` INT,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `payload` LONGTEXT NOT NULL,
    `last_activity` INT NOT NULL,
    `expires_at` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_sessions_user` (`user_id`),
    INDEX `idx_user_sessions_last_activity` (`last_activity`),
    INDEX `idx_user_sessions_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_devices table
CREATE TABLE `user_devices` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `device_name` VARCHAR(200),
    `device_type` VARCHAR(50),
    `browser` VARCHAR(100),
    `platform` VARCHAR(100),
    `ip_address` VARCHAR(45),
    `fingerprint` VARCHAR(255) UNIQUE,
    `trusted` TINYINT(1) DEFAULT 0,
    `last_used` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_devices_user` (`user_id`),
    INDEX `idx_user_devices_fingerprint` (`fingerprint`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create security_events table
CREATE TABLE `security_events` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `event_type` VARCHAR(100) NOT NULL,
    `user_id` INT,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `severity` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    `description` TEXT,
    `metadata` JSON,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_security_events_type` (`event_type`),
    INDEX `idx_security_events_user` (`user_id`),
    INDEX `idx_security_events_severity` (`severity`),
    INDEX `idx_security_events_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create audit_logs table
CREATE TABLE `audit_logs` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `table_name` VARCHAR(100) NOT NULL,
    `record_id` INT,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW') NOT NULL,
    `old_values` JSON,
    `new_values` JSON,
    `user_id` INT,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_audit_logs_table` (`table_name`),
    INDEX `idx_audit_logs_record` (`record_id`),
    INDEX `idx_audit_logs_action` (`action`),
    INDEX `idx_audit_logs_user` (`user_id`),
    INDEX `idx_audit_logs_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ip_whitelist table
CREATE TABLE `ip_whitelist` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `ip_address` VARCHAR(45) NOT NULL UNIQUE,
    `description` VARCHAR(255),
    `created_by` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_ip_whitelist_ip` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ip_blacklist table
CREATE TABLE `ip_blacklist` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `ip_address` VARCHAR(45) NOT NULL UNIQUE,
    `reason` VARCHAR(255),
    `created_by` INT,
    `expires_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_ip_blacklist_ip` (`ip_address`),
    INDEX `idx_ip_blacklist_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create two_factor_auth table
CREATE TABLE `two_factor_auth` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL UNIQUE,
    `secret` VARCHAR(255) NOT NULL,
    `backup_codes` JSON,
    `enabled` TINYINT(1) DEFAULT 0,
    `enabled_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create security_settings table
CREATE TABLE `security_settings` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` TEXT,
    `description` TEXT,
    `updated_by` INT,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_security_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles
INSERT INTO `roles` (`name`, `display_name`, `description`, `level`) VALUES
('admin', 'Administrator', 'Full system access with all permissions', 100),
('tender_manager', 'Tender Manager', 'Manage tenders, bids, and related operations', 80),
('sales_head', 'Sales Head', 'Manage sales operations and client relationships', 70),
('accountant', 'Accountant', 'Manage financial operations and reporting', 60),
('user', 'User', 'Basic user with limited permissions', 10);

-- Insert default permissions
INSERT INTO `permissions` (`name`, `display_name`, `description`, `module`, `category`) VALUES
-- User Management
('users.create', 'Create Users', 'Create new user accounts', 'users', 'management'),
('users.view', 'View Users', 'View user information', 'users', 'management'),
('users.edit', 'Edit Users', 'Edit user information', 'users', 'management'),
('users.delete', 'Delete Users', 'Delete user accounts', 'users', 'management'),
('users.manage_roles', 'Manage User Roles', 'Assign and remove user roles', 'users', 'management'),

-- Tender Management
('tenders.create', 'Create Tenders', 'Create new tenders', 'tenders', 'management'),
('tenders.view', 'View Tenders', 'View tender information', 'tenders', 'management'),
('tenders.edit', 'Edit Tenders', 'Edit tender information', 'tenders', 'management'),
('tenders.delete', 'Delete Tenders', 'Delete tenders', 'tenders', 'management'),
('tenders.assign', 'Assign Tenders', 'Assign tenders to users', 'tenders', 'management'),

-- Bidding
('bidding.participate', 'Participate in Bidding', 'Participate in tender bidding', 'bidding', 'operations'),
('bidding.view', 'View Bids', 'View bidding information', 'bidding', 'operations'),
('bidding.manage', 'Manage Bids', 'Manage bidding process', 'bidding', 'operations'),

-- Documents
('documents.upload', 'Upload Documents', 'Upload documents to system', 'documents', 'management'),
('documents.view', 'View Documents', 'View documents', 'documents', 'management'),
('documents.download', 'Download Documents', 'Download documents', 'documents', 'management'),
('documents.delete', 'Delete Documents', 'Delete documents', 'documents', 'management'),

-- Finance
('finance.view', 'View Financial Data', 'View financial information', 'finance', 'reporting'),
('finance.manage', 'Manage Finance', 'Manage financial operations', 'finance', 'management'),
('finance.approve', 'Approve Financial Transactions', 'Approve financial transactions', 'finance', 'approval'),

-- Reports
('reports.view', 'View Reports', 'View system reports', 'reports', 'reporting'),
('reports.generate', 'Generate Reports', 'Generate custom reports', 'reports', 'reporting'),
('reports.export', 'Export Reports', 'Export reports to various formats', 'reports', 'reporting'),

-- System Administration
('system.config', 'System Configuration', 'Configure system settings', 'system', 'administration'),
('system.logs', 'View System Logs', 'View system and audit logs', 'system', 'administration'),
('system.backup', 'System Backup', 'Perform system backups', 'system', 'administration'),
('system.maintenance', 'System Maintenance', 'Perform system maintenance', 'system', 'administration');

-- Assign permissions to roles
-- Admin gets all permissions
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r, `permissions` p WHERE r.name = 'admin';

-- Tender Manager permissions
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r, `permissions` p 
WHERE r.name = 'tender_manager' AND p.name IN (
    'tenders.create', 'tenders.view', 'tenders.edit', 'tenders.assign',
    'bidding.participate', 'bidding.view', 'bidding.manage',
    'documents.upload', 'documents.view', 'documents.download',
    'reports.view', 'reports.generate'
);

-- Sales Head permissions
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r, `permissions` p 
WHERE r.name = 'sales_head' AND p.name IN (
    'tenders.view', 'bidding.participate', 'bidding.view',
    'documents.view', 'documents.download',
    'reports.view', 'reports.generate', 'reports.export'
);

-- Accountant permissions
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r, `permissions` p 
WHERE r.name = 'accountant' AND p.name IN (
    'tenders.view', 'finance.view', 'finance.manage', 'finance.approve',
    'reports.view', 'reports.generate', 'reports.export'
);

-- User permissions (basic)
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r, `permissions` p 
WHERE r.name = 'user' AND p.name IN (
    'tenders.view', 'bidding.participate', 'documents.view', 'documents.download'
);

-- Insert default security settings
INSERT INTO `security_settings` (`setting_key`, `setting_value`, `description`) VALUES
('password_min_length', '8', 'Minimum password length'),
('password_require_uppercase', '1', 'Require uppercase letters in passwords'),
('password_require_lowercase', '1', 'Require lowercase letters in passwords'),
('password_require_numbers', '1', 'Require numbers in passwords'),
('password_require_symbols', '1', 'Require symbols in passwords'),
('login_max_attempts', '5', 'Maximum login attempts before lockout'),
('login_lockout_duration', '900', 'Lockout duration in seconds (15 minutes)'),
('session_timeout', '3600', 'Session timeout in seconds (1 hour)'),
('password_reset_token_expiry', '3600', 'Password reset token expiry in seconds (1 hour)'),
('email_verification_token_expiry', '86400', 'Email verification token expiry in seconds (24 hours)');