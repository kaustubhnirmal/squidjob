-- =====================================================
-- SquidJob Tender Management System - Complete Database Schema
-- =====================================================
-- This file contains the complete database schema with proper
-- indexing, foreign key relationships, and constraints
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- =====================================================
-- CORE SYSTEM TABLES
-- =====================================================

-- Users table (Core authentication)
CREATE TABLE IF NOT EXISTS `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL,
    `email` varchar(100) NOT NULL,
    `password_hash` varchar(255) NOT NULL,
    `first_name` varchar(50) DEFAULT NULL,
    `last_name` varchar(50) DEFAULT NULL,
    `phone` varchar(20) DEFAULT NULL,
    `company_name` varchar(100) DEFAULT NULL,
    `company_registration` varchar(50) DEFAULT NULL,
    `address` text DEFAULT NULL,
    `city` varchar(50) DEFAULT NULL,
    `state` varchar(50) DEFAULT NULL,
    `country` varchar(50) DEFAULT NULL,
    `postal_code` varchar(20) DEFAULT NULL,
    `role` enum('admin','tender_manager','bidder','viewer') NOT NULL DEFAULT 'bidder',
    `status` enum('active','inactive','suspended','pending_verification') NOT NULL DEFAULT 'pending_verification',
    `email_verified` tinyint(1) NOT NULL DEFAULT 0,
    `email_verification_token` varchar(255) DEFAULT NULL,
    `email_verification_expires` datetime DEFAULT NULL,
    `password_reset_token` varchar(255) DEFAULT NULL,
    `password_reset_expires` datetime DEFAULT NULL,
    `last_login` datetime DEFAULT NULL,
    `login_attempts` int(11) NOT NULL DEFAULT 0,
    `locked_until` datetime DEFAULT NULL,
    `two_factor_enabled` tinyint(1) NOT NULL DEFAULT 0,
    `two_factor_secret` varchar(255) DEFAULT NULL,
    `profile_image` varchar(255) DEFAULT NULL,
    `preferences` json DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_users_username` (`username`),
    UNIQUE KEY `idx_users_email` (`email`),
    KEY `idx_users_role` (`role`),
    KEY `idx_users_status` (`status`),
    KEY `idx_users_company` (`company_name`),
    KEY `idx_users_created` (`created_at`),
    KEY `idx_users_last_login` (`last_login`),
    KEY `idx_users_email_verification` (`email_verification_token`),
    KEY `idx_users_password_reset` (`password_reset_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User sessions table
CREATE TABLE IF NOT EXISTS `user_sessions` (
    `id` varchar(128) NOT NULL,
    `user_id` int(11) NOT NULL,
    `ip_address` varchar(45) NOT NULL,
    `user_agent` text NOT NULL,
    `payload` longtext NOT NULL,
    `last_activity` int(11) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` timestamp NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_sessions_user_id` (`user_id`),
    KEY `idx_sessions_last_activity` (`last_activity`),
    KEY `idx_sessions_expires` (`expires_at`),
    CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User permissions table
CREATE TABLE IF NOT EXISTS `user_permissions` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `permission` varchar(100) NOT NULL,
    `granted_by` int(11) NOT NULL,
    `granted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_user_permissions_unique` (`user_id`, `permission`),
    KEY `idx_user_permissions_permission` (`permission`),
    KEY `idx_user_permissions_granted_by` (`granted_by`),
    KEY `idx_user_permissions_expires` (`expires_at`),
    CONSTRAINT `fk_user_permissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_permissions_granted_by` FOREIGN KEY (`granted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TENDER MANAGEMENT TABLES
-- =====================================================

-- Tender categories table
CREATE TABLE IF NOT EXISTS `tender_categories` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `description` text DEFAULT NULL,
    `parent_id` int(11) DEFAULT NULL,
    `sort_order` int(11) NOT NULL DEFAULT 0,
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_categories_name` (`name`),
    KEY `idx_categories_parent` (`parent_id`),
    KEY `idx_categories_active` (`is_active`),
    KEY `idx_categories_sort` (`sort_order`),
    CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `tender_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tenders table (Main tender entity)
CREATE TABLE IF NOT EXISTS `tenders` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `tender_number` varchar(50) NOT NULL,
    `title` varchar(255) NOT NULL,
    `description` longtext NOT NULL,
    `category_id` int(11) NOT NULL,
    `created_by` int(11) NOT NULL,
    `organization` varchar(255) NOT NULL,
    `contact_person` varchar(100) DEFAULT NULL,
    `contact_email` varchar(100) DEFAULT NULL,
    `contact_phone` varchar(20) DEFAULT NULL,
    `estimated_value` decimal(15,2) DEFAULT NULL,
    `currency` varchar(3) NOT NULL DEFAULT 'USD',
    `location` varchar(255) DEFAULT NULL,
    `submission_deadline` datetime NOT NULL,
    `opening_date` datetime DEFAULT NULL,
    `project_duration` varchar(100) DEFAULT NULL,
    `eligibility_criteria` text DEFAULT NULL,
    `technical_specifications` longtext DEFAULT NULL,
    `terms_conditions` longtext DEFAULT NULL,
    `evaluation_criteria` text DEFAULT NULL,
    `status` enum('draft','published','closed','cancelled','awarded') NOT NULL DEFAULT 'draft',
    `visibility` enum('public','private','restricted') NOT NULL DEFAULT 'public',
    `requires_registration` tinyint(1) NOT NULL DEFAULT 0,
    `allow_consortium` tinyint(1) NOT NULL DEFAULT 0,
    `bond_required` tinyint(1) NOT NULL DEFAULT 0,
    `bond_amount` decimal(15,2) DEFAULT NULL,
    `pre_bid_meeting` datetime DEFAULT NULL,
    `pre_bid_location` varchar(255) DEFAULT NULL,
    `site_visit_required` tinyint(1) NOT NULL DEFAULT 0,
    `site_visit_date` datetime DEFAULT NULL,
    `amendment_count` int(11) NOT NULL DEFAULT 0,
    `view_count` int(11) NOT NULL DEFAULT 0,
    `download_count` int(11) NOT NULL DEFAULT 0,
    `featured` tinyint(1) NOT NULL DEFAULT 0,
    `priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
    `tags` json DEFAULT NULL,
    `metadata` json DEFAULT NULL,
    `published_at` timestamp NULL DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_tenders_number` (`tender_number`),
    KEY `idx_tenders_category` (`category_id`),
    KEY `idx_tenders_created_by` (`created_by`),
    KEY `idx_tenders_status` (`status`),
    KEY `idx_tenders_visibility` (`visibility`),
    KEY `idx_tenders_deadline` (`submission_deadline`),
    KEY `idx_tenders_opening` (`opening_date`),
    KEY `idx_tenders_published` (`published_at`),
    KEY `idx_tenders_featured` (`featured`),
    KEY `idx_tenders_priority` (`priority`),
    KEY `idx_tenders_organization` (`organization`),
    KEY `idx_tenders_location` (`location`),
    KEY `idx_tenders_value` (`estimated_value`),
    KEY `idx_tenders_created` (`created_at`),
    FULLTEXT KEY `idx_tenders_search` (`title`, `description`, `organization`),
    CONSTRAINT `fk_tenders_category` FOREIGN KEY (`category_id`) REFERENCES `tender_categories` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_tenders_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tender amendments table
CREATE TABLE IF NOT EXISTS `tender_amendments` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `tender_id` int(11) NOT NULL,
    `amendment_number` int(11) NOT NULL,
    `title` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `changes` json DEFAULT NULL,
    `created_by` int(11) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_amendments_tender_number` (`tender_id`, `amendment_number`),
    KEY `idx_amendments_tender` (`tender_id`),
    KEY `idx_amendments_created_by` (`created_by`),
    KEY `idx_amendments_created` (`created_at`),
    CONSTRAINT `fk_amendments_tender` FOREIGN KEY (`tender_id`) REFERENCES `tenders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_amendments_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- BIDDING SYSTEM TABLES
-- =====================================================

-- Bids table
CREATE TABLE IF NOT EXISTS `bids` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `tender_id` int(11) NOT NULL,
    `bidder_id` int(11) NOT NULL,
    `bid_number` varchar(50) NOT NULL,
    `company_name` varchar(255) NOT NULL,
    `contact_person` varchar(100) NOT NULL,
    `contact_email` varchar(100) NOT NULL,
    `contact_phone` varchar(20) DEFAULT NULL,
    `bid_amount` decimal(15,2) NOT NULL,
    `currency` varchar(3) NOT NULL DEFAULT 'USD',
    `technical_score` decimal(5,2) DEFAULT NULL,
    `financial_score` decimal(5,2) DEFAULT NULL,
    `total_score` decimal(5,2) DEFAULT NULL,
    `rank` int(11) DEFAULT NULL,
    `proposal_summary` text DEFAULT NULL,
    `technical_proposal` longtext DEFAULT NULL,
    `financial_proposal` longtext DEFAULT NULL,
    `delivery_timeline` varchar(255) DEFAULT NULL,
    `validity_period` int(11) DEFAULT NULL,
    `bond_submitted` tinyint(1) NOT NULL DEFAULT 0,
    `bond_amount` decimal(15,2) DEFAULT NULL,
    `bond_reference` varchar(100) DEFAULT NULL,
    `consortium_members` json DEFAULT NULL,
    `status` enum('draft','submitted','under_review','shortlisted','rejected','awarded','withdrawn') NOT NULL DEFAULT 'draft',
    `submission_method` enum('online','physical','email') NOT NULL DEFAULT 'online',
    `submitted_at` timestamp NULL DEFAULT NULL,
    `reviewed_at` timestamp NULL DEFAULT NULL,
    `reviewed_by` int(11) DEFAULT NULL,
    `review_notes` text DEFAULT NULL,
    `withdrawal_reason` text DEFAULT NULL,
    `metadata` json DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_bids_number` (`bid_number`),
    UNIQUE KEY `idx_bids_tender_bidder` (`tender_id`, `bidder_id`),
    KEY `idx_bids_tender` (`tender_id`),
    KEY `idx_bids_bidder` (`bidder_id`),
    KEY `idx_bids_status` (`status`),
    KEY `idx_bids_amount` (`bid_amount`),
    KEY `idx_bids_score` (`total_score`),
    KEY `idx_bids_rank` (`rank`),
    KEY `idx_bids_submitted` (`submitted_at`),
    KEY `idx_bids_reviewed_by` (`reviewed_by`),
    KEY `idx_bids_company` (`company_name`),
    CONSTRAINT `fk_bids_tender` FOREIGN KEY (`tender_id`) REFERENCES `tenders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_bids_bidder` FOREIGN KEY (`bidder_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_bids_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bid evaluations table
CREATE TABLE IF NOT EXISTS `bid_evaluations` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `bid_id` int(11) NOT NULL,
    `evaluator_id` int(11) NOT NULL,
    `evaluation_round` int(11) NOT NULL DEFAULT 1,
    `technical_score` decimal(5,2) DEFAULT NULL,
    `financial_score` decimal(5,2) DEFAULT NULL,
    `compliance_score` decimal(5,2) DEFAULT NULL,
    `total_score` decimal(5,2) DEFAULT NULL,
    `criteria_scores` json DEFAULT NULL,
    `comments` text DEFAULT NULL,
    `recommendation` enum('accept','reject','conditional','clarification_needed') DEFAULT NULL,
    `status` enum('pending','in_progress','completed','reviewed') NOT NULL DEFAULT 'pending',
    `started_at` timestamp NULL DEFAULT NULL,
    `completed_at` timestamp NULL DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_evaluations_bid_evaluator_round` (`bid_id`, `evaluator_id`, `evaluation_round`),
    KEY `idx_evaluations_bid` (`bid_id`),
    KEY `idx_evaluations_evaluator` (`evaluator_id`),
    KEY `idx_evaluations_round` (`evaluation_round`),
    KEY `idx_evaluations_status` (`status`),
    KEY `idx_evaluations_score` (`total_score`),
    CONSTRAINT `fk_evaluations_bid` FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_evaluations_evaluator` FOREIGN KEY (`evaluator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- FILE MANAGEMENT TABLES
-- =====================================================

-- File uploads table
CREATE TABLE IF NOT EXISTS `file_uploads` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `original_name` varchar(255) NOT NULL,
    `filename` varchar(255) NOT NULL,
    `file_path` varchar(500) NOT NULL,
    `file_size` bigint(20) NOT NULL,
    `mime_type` varchar(100) NOT NULL,
    `file_extension` varchar(10) NOT NULL,
    `file_hash` varchar(64) NOT NULL,
    `upload_type` enum('tender_document','bid_document','user_document','system_file','image','other') NOT NULL DEFAULT 'other',
    `uploaded_by` int(11) NOT NULL,
    `entity_type` varchar(50) DEFAULT NULL,
    `entity_id` int(11) DEFAULT NULL,
    `document_category` varchar(100) DEFAULT NULL,
    `is_public` tinyint(1) NOT NULL DEFAULT 0,
    `is_confidential` tinyint(1) NOT NULL DEFAULT 0,
    `download_count` int(11) NOT NULL DEFAULT 0,
    `virus_scan_status` enum('pending','clean','infected','error') DEFAULT 'pending',
    `virus_scan_result` text DEFAULT NULL,
    `metadata` json DEFAULT NULL,
    `thumbnails` json DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_files_hash` (`file_hash`),
    KEY `idx_files_filename` (`filename`),
    KEY `idx_files_uploaded_by` (`uploaded_by`),
    KEY `idx_files_type` (`upload_type`),
    KEY `idx_files_entity` (`entity_type`, `entity_id`),
    KEY `idx_files_category` (`document_category`),
    KEY `idx_files_public` (`is_public`),
    KEY `idx_files_confidential` (`is_confidential`),
    KEY `idx_files_virus_scan` (`virus_scan_status`),
    KEY `idx_files_created` (`created_at`),
    CONSTRAINT `fk_files_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tender documents table (linking tenders to files)
CREATE TABLE IF NOT EXISTS `tender_documents` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `tender_id` int(11) NOT NULL,
    `file_id` int(11) NOT NULL,
    `document_type` enum('specification','drawing','terms','amendment','clarification','other') NOT NULL DEFAULT 'other',
    `title` varchar(255) DEFAULT NULL,
    `description` text DEFAULT NULL,
    `is_mandatory` tinyint(1) NOT NULL DEFAULT 0,
    `sort_order` int(11) NOT NULL DEFAULT 0,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_tender_documents_unique` (`tender_id`, `file_id`),
    KEY `idx_tender_documents_tender` (`tender_id`),
    KEY `idx_tender_documents_file` (`file_id`),
    KEY `idx_tender_documents_type` (`document_type`),
    KEY `idx_tender_documents_mandatory` (`is_mandatory`),
    KEY `idx_tender_documents_sort` (`sort_order`),
    CONSTRAINT `fk_tender_documents_tender` FOREIGN KEY (`tender_id`) REFERENCES `tenders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tender_documents_file` FOREIGN KEY (`file_id`) REFERENCES `file_uploads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bid documents table (linking bids to files)
CREATE TABLE IF NOT EXISTS `bid_documents` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `bid_id` int(11) NOT NULL,
    `file_id` int(11) NOT NULL,
    `document_type` enum('technical_proposal','financial_proposal','company_profile','certificates','bond','other') NOT NULL DEFAULT 'other',
    `title` varchar(255) DEFAULT NULL,
    `description` text DEFAULT NULL,
    `is_required` tinyint(1) NOT NULL DEFAULT 0,
    `sort_order` int(11) NOT NULL DEFAULT 0,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_bid_documents_unique` (`bid_id`, `file_id`),
    KEY `idx_bid_documents_bid` (`bid_id`),
    KEY `idx_bid_documents_file` (`file_id`),
    KEY `idx_bid_documents_type` (`document_type`),
    KEY `idx_bid_documents_required` (`is_required`),
    KEY `idx_bid_documents_sort` (`sort_order`),
    CONSTRAINT `fk_bid_documents_bid` FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_bid_documents_file` FOREIGN KEY (`file_id`) REFERENCES `file_uploads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- COMMUNICATION & NOTIFICATIONS
-- =====================================================

-- Messages table (for tender-related communications)
CREATE TABLE IF NOT EXISTS `messages` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `tender_id` int(11) DEFAULT NULL,
    `bid_id` int(11) DEFAULT NULL,
    `sender_id` int(11) NOT NULL,
    `recipient_id` int(11) DEFAULT NULL,
    `recipient_type` enum('user','group','all_bidders','tender_managers') NOT NULL DEFAULT 'user',
    `subject` varchar(255) NOT NULL,
    `message` longtext NOT NULL,
    `message_type` enum('inquiry','clarification','notification','announcement','response') NOT NULL DEFAULT 'inquiry',
    `priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
    `is_public` tinyint(1) NOT NULL DEFAULT 0,
    `parent_id` int(11) DEFAULT NULL,
    `status` enum('draft','sent','delivered','read','archived') NOT NULL DEFAULT 'sent',
    `read_at` timestamp NULL DEFAULT NULL,
    `attachments` json DEFAULT NULL,
    `metadata` json DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_messages_tender` (`tender_id`),
    KEY `idx_messages_bid` (`bid_id`),
    KEY `idx_messages_sender` (`sender_id`),
    KEY `idx_messages_recipient` (`recipient_id`),
    KEY `idx_messages_type` (`message_type`),
    KEY `idx_messages_priority` (`priority`),
    KEY `idx_messages_public` (`is_public`),
    KEY `idx_messages_parent` (`parent_id`),
    KEY `idx_messages_status` (`status`),
    KEY `idx_messages_created` (`created_at`),
    CONSTRAINT `fk_messages_tender` FOREIGN KEY (`tender_id`) REFERENCES `tenders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_messages_bid` FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_messages_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_messages_parent` FOREIGN KEY (`parent_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `type` varchar(50) NOT NULL,
    `title` varchar(255) NOT NULL,
    `message` text NOT NULL,
    `data` json DEFAULT NULL,
    `entity_type` varchar(50) DEFAULT NULL,
    `entity_id` int(11) DEFAULT NULL,
    `priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
    `channel` enum('database','email','sms','push') NOT NULL DEFAULT 'database',
    `is_read` tinyint(1) NOT NULL DEFAULT 0,
    `read_at` timestamp NULL DEFAULT NULL,
    `sent_at` timestamp NULL DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_notifications_user` (`user_id`),
    KEY `idx_notifications_type` (`type`),
    KEY `idx_notifications_entity` (`entity_type`, `entity_id`),
    KEY `idx_notifications_priority` (`priority`),
    KEY `idx_notifications_channel` (`channel`),
    KEY `idx_notifications_read` (`is_read`),
    KEY `idx_notifications_created` (`created_at`),
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SECURITY & AUDIT TABLES
-- =====================================================

-- Security logs table
CREATE TABLE IF NOT EXISTS `security_logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) DEFAULT NULL,
    `event_type` varchar(50) NOT NULL,
    `event_description` text NOT NULL,
    `ip_address` varchar(45) NOT NULL,
    `user_agent` text DEFAULT NULL,
    `request_data` json DEFAULT NULL,
    `severity` enum('info','warning','error','critical') NOT NULL DEFAULT 'info',
    `status` enum('success','failure','blocked') NOT NULL DEFAULT 'success',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_security_logs_user` (`user_id`),
    KEY `idx_security_logs_event` (`event_type`),
    KEY `idx_security_logs_ip` (`ip_address`),
    KEY `idx_security_logs_severity` (`severity`),
    KEY `idx_security_logs_status` (`status`),
    KEY `idx_security_logs_created` (`created_at`),
    CONSTRAINT `fk_security_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit trail table
CREATE TABLE IF NOT EXISTS `audit_trail` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) DEFAULT NULL,
    `entity_type` varchar(50) NOT NULL,
    `entity_id` int(11) NOT NULL,
    `action` varchar(50) NOT NULL,
    `old_values` json DEFAULT NULL,
    `new_values` json DEFAULT NULL,
    `changes` json DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_audit_user` (`user_id`),
    KEY `idx_audit_entity` (`entity_type`, `entity_id`),
    KEY `idx_audit_action` (`action`),
    KEY `idx_audit_created` (`created_at`),
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rate limiting table
CREATE TABLE IF NOT EXISTS `rate_limits` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `identifier` varchar(255) NOT NULL,
    `action` varchar(50) NOT NULL,
    `attempts` int(11) NOT NULL DEFAULT 1,
    `reset_time` timestamp NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_rate_limits_unique` (`identifier`, `action`),
    KEY `idx_rate_limits_reset` (`reset_time`),
    KEY `idx_rate_limits_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SYSTEM CONFIGURATION TABLES
-- =====================================================

-- System settings table
CREATE TABLE IF NOT EXISTS `system_settings` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `setting_key` varchar(100) NOT NULL,
    `setting_value` longtext DEFAULT NULL,
    `setting_type` enum('string','integer','boolean','json','text') NOT NULL DEFAULT 'string',
    `category` varchar(50) NOT NULL DEFAULT 'general',
    `description` text DEFAULT NULL,
    `is_public` tinyint(1) NOT NULL DEFAULT 0,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_settings_key` (`setting_key`),
    KEY `idx_settings_category` (`category`),
    KEY `idx_settings_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email templates table
CREATE TABLE IF NOT EXISTS `email_templates` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `template_key` varchar(100) NOT NULL,
    `name` varchar(255) NOT NULL,
    `subject` varchar(255) NOT NULL,
    `body_html` longtext NOT NULL,
    `body_text` longtext DEFAULT NULL,
    `variables` json DEFAULT NULL,
    `category` varchar(50) NOT NULL DEFAULT 'general',
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_email_templates_key` (`template_key`),
    KEY `idx_email_templates_category` (`category`),
    KEY `idx_email
_templates_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- REPORTING & ANALYTICS TABLES
-- =====================================================

-- Tender statistics table
CREATE TABLE IF NOT EXISTS `tender_statistics` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `tender_id` int(11) NOT NULL,
    `total_views` int(11) NOT NULL DEFAULT 0,
    `total_downloads` int(11) NOT NULL DEFAULT 0,
    `total_bids` int(11) NOT NULL DEFAULT 0,
    `unique_bidders` int(11) NOT NULL DEFAULT 0,
    `average_bid_amount` decimal(15,2) DEFAULT NULL,
    `lowest_bid_amount` decimal(15,2) DEFAULT NULL,
    `highest_bid_amount` decimal(15,2) DEFAULT NULL,
    `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_tender_stats_tender` (`tender_id`),
    CONSTRAINT `fk_tender_stats_tender` FOREIGN KEY (`tender_id`) REFERENCES `tenders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User activity logs table
CREATE TABLE IF NOT EXISTS `user_activity_logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) DEFAULT NULL,
    `session_id` varchar(128) DEFAULT NULL,
    `activity_type` varchar(50) NOT NULL,
    `entity_type` varchar(50) DEFAULT NULL,
    `entity_id` int(11) DEFAULT NULL,
    `description` text DEFAULT NULL,
    `ip_address` varchar(45) NOT NULL,
    `user_agent` text DEFAULT NULL,
    `request_method` varchar(10) DEFAULT NULL,
    `request_uri` varchar(500) DEFAULT NULL,
    `response_code` int(11) DEFAULT NULL,
    `execution_time` decimal(8,3) DEFAULT NULL,
    `memory_usage` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_activity_user` (`user_id`),
    KEY `idx_activity_session` (`session_id`),
    KEY `idx_activity_type` (`activity_type`),
    KEY `idx_activity_entity` (`entity_type`, `entity_id`),
    KEY `idx_activity_ip` (`ip_address`),
    KEY `idx_activity_created` (`created_at`),
    CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CACHE TABLES (for database-backed caching)
-- =====================================================

-- Cache table
CREATE TABLE IF NOT EXISTS `cache` (
    `key` varchar(255) NOT NULL,
    `value` longtext NOT NULL,
    `expiration` int(11) NOT NULL,
    `tags` varchar(500) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`key`),
    KEY `idx_cache_expiration` (`expiration`),
    KEY `idx_cache_tags` (`tags`),
    KEY `idx_cache_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cache tags table
CREATE TABLE IF NOT EXISTS `cache_tags` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `tag` varchar(100) NOT NULL,
    `cache_key` varchar(255) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_cache_tags_unique` (`tag`, `cache_key`),
    KEY `idx_cache_tags_tag` (`tag`),
    KEY `idx_cache_tags_key` (`cache_key`),
    CONSTRAINT `fk_cache_tags_key` FOREIGN KEY (`cache_key`) REFERENCES `cache` (`key`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- WORKFLOW & APPROVAL TABLES
-- =====================================================

-- Approval workflows table
CREATE TABLE IF NOT EXISTS `approval_workflows` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `description` text DEFAULT NULL,
    `entity_type` varchar(50) NOT NULL,
    `workflow_steps` json NOT NULL,
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `created_by` int(11) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_workflows_entity` (`entity_type`),
    KEY `idx_workflows_active` (`is_active`),
    KEY `idx_workflows_created_by` (`created_by`),
    CONSTRAINT `fk_workflows_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Approval requests table
CREATE TABLE IF NOT EXISTS `approval_requests` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `workflow_id` int(11) NOT NULL,
    `entity_type` varchar(50) NOT NULL,
    `entity_id` int(11) NOT NULL,
    `requested_by` int(11) NOT NULL,
    `current_step` int(11) NOT NULL DEFAULT 1,
    `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
    `priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
    `request_data` json DEFAULT NULL,
    `approval_history` json DEFAULT NULL,
    `comments` text DEFAULT NULL,
    `approved_by` int(11) DEFAULT NULL,
    `approved_at` timestamp NULL DEFAULT NULL,
    `rejected_by` int(11) DEFAULT NULL,
    `rejected_at` timestamp NULL DEFAULT NULL,
    `rejection_reason` text DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_approvals_workflow` (`workflow_id`),
    KEY `idx_approvals_entity` (`entity_type`, `entity_id`),
    KEY `idx_approvals_requested_by` (`requested_by`),
    KEY `idx_approvals_status` (`status`),
    KEY `idx_approvals_priority` (`priority`),
    KEY `idx_approvals_approved_by` (`approved_by`),
    KEY `idx_approvals_rejected_by` (`rejected_by`),
    CONSTRAINT `fk_approvals_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `approval_workflows` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_approvals_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_approvals_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_approvals_rejected_by` FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INTEGRATION & API TABLES
-- =====================================================

-- API keys table
CREATE TABLE IF NOT EXISTS `api_keys` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `key_name` varchar(100) NOT NULL,
    `api_key` varchar(255) NOT NULL,
    `api_secret` varchar(255) DEFAULT NULL,
    `permissions` json DEFAULT NULL,
    `rate_limit` int(11) NOT NULL DEFAULT 1000,
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `last_used` timestamp NULL DEFAULT NULL,
    `usage_count` int(11) NOT NULL DEFAULT 0,
    `expires_at` timestamp NULL DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_api_keys_key` (`api_key`),
    KEY `idx_api_keys_user` (`user_id`),
    KEY `idx_api_keys_active` (`is_active`),
    KEY `idx_api_keys_expires` (`expires_at`),
    CONSTRAINT `fk_api_keys_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API request logs table
CREATE TABLE IF NOT EXISTS `api_request_logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `api_key_id` int(11) DEFAULT NULL,
    `user_id` int(11) DEFAULT NULL,
    `endpoint` varchar(255) NOT NULL,
    `method` varchar(10) NOT NULL,
    `request_headers` json DEFAULT NULL,
    `request_body` longtext DEFAULT NULL,
    `response_code` int(11) NOT NULL,
    `response_headers` json DEFAULT NULL,
    `response_body` longtext DEFAULT NULL,
    `execution_time` decimal(8,3) NOT NULL,
    `ip_address` varchar(45) NOT NULL,
    `user_agent` text DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_api_logs_key` (`api_key_id`),
    KEY `idx_api_logs_user` (`user_id`),
    KEY `idx_api_logs_endpoint` (`endpoint`),
    KEY `idx_api_logs_method` (`method`),
    KEY `idx_api_logs_response` (`response_code`),
    KEY `idx_api_logs_created` (`created_at`),
    CONSTRAINT `fk_api_logs_key` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_api_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- BACKUP & MAINTENANCE TABLES
-- =====================================================

-- Database backups table
CREATE TABLE IF NOT EXISTS `database_backups` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `backup_name` varchar(255) NOT NULL,
    `backup_type` enum('full','incremental','differential') NOT NULL DEFAULT 'full',
    `file_path` varchar(500) NOT NULL,
    `file_size` bigint(20) NOT NULL,
    `compression_type` varchar(20) DEFAULT NULL,
    `backup_status` enum('in_progress','completed','failed','corrupted') NOT NULL DEFAULT 'in_progress',
    `tables_included` json DEFAULT NULL,
    `error_message` text DEFAULT NULL,
    `created_by` int(11) DEFAULT NULL,
    `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `completed_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_backups_type` (`backup_type`),
    KEY `idx_backups_status` (`backup_status`),
    KEY `idx_backups_created_by` (`created_by`),
    KEY `idx_backups_started` (`started_at`),
    CONSTRAINT `fk_backups_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System maintenance table
CREATE TABLE IF NOT EXISTS `system_maintenance` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `maintenance_type` varchar(50) NOT NULL,
    `description` text NOT NULL,
    `scheduled_start` timestamp NOT NULL,
    `scheduled_end` timestamp NOT NULL,
    `actual_start` timestamp NULL DEFAULT NULL,
    `actual_end` timestamp NULL DEFAULT NULL,
    `status` enum('scheduled','in_progress','completed','cancelled','failed') NOT NULL DEFAULT 'scheduled',
    `affected_services` json DEFAULT NULL,
    `maintenance_notes` text DEFAULT NULL,
    `created_by` int(11) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_maintenance_type` (`maintenance_type`),
    KEY `idx_maintenance_status` (`status`),
    KEY `idx_maintenance_scheduled` (`scheduled_start`, `scheduled_end`),
    KEY `idx_maintenance_created_by` (`created_by`),
    CONSTRAINT `fk_maintenance_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INITIAL DATA INSERTS
-- =====================================================

-- Insert default tender categories
INSERT INTO `tender_categories` (`name`, `description`, `sort_order`) VALUES
('Construction', 'Construction and infrastructure projects', 1),
('IT Services', 'Information technology and software services', 2),
('Consulting', 'Professional consulting services', 3),
('Equipment', 'Equipment procurement and maintenance', 4),
('Supplies', 'General supplies and materials', 5),
('Transportation', 'Transportation and logistics services', 6),
('Healthcare', 'Healthcare and medical services', 7),
('Education', 'Educational services and training', 8),
('Security', 'Security and surveillance services', 9),
('Maintenance', 'Facility and equipment maintenance', 10);

-- Insert default system settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `category`, `description`, `is_public`) VALUES
('site_name', 'SquidJob Tender Management', 'string', 'general', 'Name of the tender management system', 1),
('site_description', 'Professional tender management and bidding platform', 'string', 'general', 'Site description for SEO', 1),
('default_currency', 'USD', 'string', 'general', 'Default currency for tenders', 1),
('max_file_upload_size', '52428800', 'integer', 'files', 'Maximum file upload size in bytes (50MB)', 0),
('allowed_file_types', '["pdf","doc","docx","xls","xlsx","jpg","jpeg","png","zip"]', 'json', 'files', 'Allowed file types for uploads', 0),
('session_timeout', '7200', 'integer', 'security', 'Session timeout in seconds (2 hours)', 0),
('max_login_attempts', '5', 'integer', 'security', 'Maximum login attempts before lockout', 0),
('lockout_duration', '900', 'integer', 'security', 'Account lockout duration in seconds (15 minutes)', 0),
('enable_email_notifications', 'true', 'boolean', 'notifications', 'Enable email notifications', 0),
('enable_sms_notifications', 'false', 'boolean', 'notifications', 'Enable SMS notifications', 0),
('tender_auto_close', 'true', 'boolean', 'tenders', 'Automatically close tenders after deadline', 0),
('bid_modification_allowed', 'true', 'boolean', 'bidding', 'Allow bid modifications before deadline', 0),
('require_bid_bond', 'false', 'boolean', 'bidding', 'Require bid bond for all tenders', 0),
('enable_public_tenders', 'true', 'boolean', 'tenders', 'Allow public tender listings', 1),
('cache_enabled', 'true', 'boolean', 'performance', 'Enable caching system', 0),
('cache_ttl', '3600', 'integer', 'performance', 'Default cache TTL in seconds (1 hour)', 0);

-- Insert default email templates
INSERT INTO `email_templates` (`template_key`, `name`, `subject`, `body_html`, `body_text`, `variables`, `category`) VALUES
('user_registration', 'User Registration', 'Welcome to {{site_name}}', '<h1>Welcome to {{site_name}}</h1><p>Dear {{user_name}},</p><p>Your account has been created successfully. Please verify your email address by clicking the link below:</p><p><a href="{{verification_link}}">Verify Email Address</a></p><p>Best regards,<br>{{site_name}} Team</p>', 'Welcome to {{site_name}}\n\nDear {{user_name}},\n\nYour account has been created successfully. Please verify your email address by visiting:\n{{verification_link}}\n\nBest regards,\n{{site_name}} Team', '["site_name","user_name","verification_link"]', 'authentication'),
('password_reset', 'Password Reset', 'Reset your password for {{site_name}}', '<h1>Password Reset Request</h1><p>Dear {{user_name}},</p><p>You have requested to reset your password. Click the link below to reset it:</p><p><a href="{{reset_link}}">Reset Password</a></p><p>This link will expire in 1 hour.</p><p>If you did not request this, please ignore this email.</p><p>Best regards,<br>{{site_name}} Team</p>', 'Password Reset Request\n\nDear {{user_name}},\n\nYou have requested to reset your password. Visit the link below to reset it:\n{{reset_link}}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\n{{site_name}} Team', '["site_name","user_name","reset_link"]', 'authentication'),
('tender_published', 'New Tender Published', 'New Tender: {{tender_title}}', '<h1>New Tender Published</h1><p>A new tender has been published that may interest you:</p><h2>{{tender_title}}</h2><p><strong>Organization:</strong> {{organization}}</p><p><strong>Deadline:</strong> {{deadline}}</p><p><strong>Estimated Value:</strong> {{estimated_value}}</p><p><a href="{{tender_link}}">View Tender Details</a></p><p>Best regards,<br>{{site_name}} Team</p>', 'New Tender Published\n\nA new tender has been published that may interest you:\n\n{{tender_title}}\n\nOrganization: {{organization}}\nDeadline: {{deadline}}\nEstimated Value: {{estimated_value}}\n\nView details: {{tender_link}}\n\nBest regards,\n{{site_name}} Team', '["site_name","tender_title","organization","deadline","estimated_value","tender_link"]', 'tenders'),
('bid_submitted', 'Bid Submission Confirmation', 'Bid submitted for {{tender_title}}', '<h1>Bid Submission Confirmation</h1><p>Dear {{bidder_name}},</p><p>Your bid has been successfully submitted for:</p><h2>{{tender_title}}</h2><p><strong>Bid Number:</strong> {{bid_number}}</p><p><strong>Bid Amount:</strong> {{bid_amount}}</p><p><strong>Submitted At:</strong> {{submitted_at}}</p><p>You will be notified of the evaluation results.</p><p>Best regards,<br>{{site_name}} Team</p>', 'Bid Submission Confirmation\n\nDear {{bidder_name}},\n\nYour bid has been successfully submitted for:\n{{tender_title}}\n\nBid Number: {{bid_number}}\nBid Amount: {{bid_amount}}\nSubmitted At: {{submitted_at}}\n\nYou will be notified of the evaluation results.\n\nBest regards,\n{{site_name}} Team', '["site_name","bidder_name","tender_title","bid_number","bid_amount","submitted_at"]', 'bidding');

-- =====================================================
-- INDEXES OPTIMIZATION
-- =====================================================

-- Additional composite indexes for better query performance
CREATE INDEX `idx_tenders_status_deadline` ON `tenders` (`status`, `submission_deadline`);
CREATE INDEX `idx_tenders_category_status` ON `tenders` (`category_id`, `status`);
CREATE INDEX `idx_tenders_featured_published` ON `tenders` (`featured`, `published_at`);
CREATE INDEX `idx_bids_tender_status` ON `bids` (`tender_id`, `status`);
CREATE INDEX `idx_bids_bidder_status` ON `bids` (`bidder_id`, `status`);
CREATE INDEX `idx_messages_tender_public` ON `messages` (`tender_id`, `is_public`);
CREATE INDEX `idx_notifications_user_read` ON `notifications` (`user_id`, `is_read`);
CREATE INDEX `idx_files_entity_type` ON `file_uploads` (`entity_type`, `entity_id`, `upload_type`);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active tenders view
CREATE VIEW `active_tenders` AS
SELECT 
    t.*,
    tc.name as category_name,
    u.username as created_by_username,
    u.first_name as created_by_first_name,
    u.last_name as created_by_last_name,
    (SELECT COUNT(*) FROM bids b WHERE b.tender_id = t.id AND b.status = 'submitted') as bid_count,
    DATEDIFF(t.submission_deadline, NOW()) as days_remaining
FROM tenders t
LEFT JOIN tender_categories tc ON t.category_id = tc.id
LEFT JOIN users u ON t.created_by = u.id
WHERE t.status = 'published' 
AND t.submission_deadline > NOW();

-- Tender statistics view
CREATE VIEW `tender_stats_view` AS
SELECT 
    t.id,
    t.tender_number,
    t.title,
    t.status,
    COUNT(DISTINCT b.id) as total_bids,
    COUNT(DISTINCT b.bidder_id) as unique_bidders,
    MIN(b.bid_amount) as lowest_bid,
    MAX(b.bid_amount) as highest_bid,
    AVG(b.bid_amount) as average_bid,
    t.view_count,
    t.download_count
FROM tenders t
LEFT JOIN bids b ON t.id = b.tender_id AND b.status = 'submitted'
GROUP BY t.id;

-- User dashboard view
CREATE VIEW `user_dashboard_view` AS
SELECT 
    u.id as user_id,
    u.username,
    u.role,
    COUNT(DISTINCT CASE WHEN t.created_by = u.id THEN t.id END) as tenders_created,
    COUNT(DISTINCT CASE WHEN b.bidder_id = u.id THEN b.id END) as bids_submitted,
    COUNT(DISTINCT CASE WHEN b.bidder_id = u.id AND b.status = 'awarded' THEN b.id END) as bids_won,
    COUNT(DISTINCT CASE WHEN n.user_id = u.id AND n.is_read = 0 THEN n.id END) as unread_notifications
FROM users u
LEFT JOIN tenders t ON u.id = t.created_by
LEFT JOIN bids b ON u.id = b.bidder_id
LEFT JOIN notifications n ON u.id = n.user_id
GROUP BY u.id;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure to close expired tenders
CREATE PROCEDURE CloseExpiredTenders()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE tender_id INT;
    DECLARE cur CURSOR FOR 
        SELECT id FROM tenders 
        WHERE status = 'published' 
        AND submission_deadline < NOW();
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO tender_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        UPDATE tenders SET status = 'closed' WHERE id = tender_id;
        
        INSERT INTO audit_trail (entity_type, entity_id, action, new_values, created_at)
        VALUES ('tender', tender_id, 'auto_closed', JSON_OBJECT('status', 'closed'), NOW());
    END LOOP;
    CLOSE cur;
END //

-- Procedure to calculate bid rankings
CREATE PROCEDURE CalculateBidRankings(IN tender_id INT)
BEGIN
    SET @rank = 0;
    UPDATE bids 
    SET rank = (@rank := @rank + 1)
    WHERE tender_id = tender_id 
    AND status = 'submitted'
    ORDER BY total_score DESC, bid_amount ASC;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

DELIMITER //

-- Trigger to update tender statistics when bid is inserted
CREATE TRIGGER update_tender_stats_on_bid_insert
AFTER INSERT ON bids
FOR EACH ROW
BEGIN
    INSERT INTO tender_statistics (tender_id, total_bids, unique_bidders, last_updated)
    VALUES (NEW.tender_id, 1, 1, NOW())
    ON DUPLICATE KEY UPDATE
        total_bids = total_bids + 1,
        unique_bidders = (SELECT COUNT(DISTINCT bidder_id) FROM bids WHERE tender_id = NEW.tender_id),
        last_updated = NOW();
END //

-- Trigger to log user activity
CREATE TRIGGER log_user_login
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.last_login != OLD.last_login THEN
        INSERT INTO user_activity_logs (user_id, activity_type, description, ip_address, created_at)
        VALUES (NEW.id, 'login', 'User logged in', COALESCE(@user_ip, '0.0.0.0'), NOW());
    END IF;
END //

DELIMITER ;

-- =====================================================
-- FINAL SETUP
-- =====================================================

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- =====================================================
-- SCHEMA INFORMATION
-- =====================================================
-- Total Tables: 25+
-- Total Indexes: 100+
-- Total Foreign Keys: 30+
-- Total Views: 3
-- Total Procedures: 2
-- Total Triggers: 2
-- 
-- This schema supports:
-- - Complete tender management workflow
-- - Secure user authentication and authorization
-- - File upload and document management
-- - Bidding and evaluation system
-- - Audit trail and security logging
-- - Caching and performance optimization
-- - API management and rate limiting
-- - Notification and communication system
-- - Reporting and analytics
-- - Backup and maintenance tracking
-- =====================================================