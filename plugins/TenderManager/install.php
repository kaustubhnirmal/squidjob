<?php
/**
 * TenderManager Module Installation Script
 * SquidJob Tender Management System
 * 
 * Creates database tables and initial data for TenderManager module
 */

// Prevent direct access
if (!defined('APP_ROOT')) {
    exit('Direct access denied');
}

/**
 * Install TenderManager Module
 */
function install_tender_manager() {
    try {
        $pdo = getDbConnection();
        
        // Begin transaction
        $pdo->beginTransaction();
        
        // Create module-specific tables
        create_tender_workflows_table($pdo);
        create_tender_evaluations_table($pdo);
        create_tender_documents_table($pdo);
        create_tender_assignments_table($pdo);
        create_bid_evaluations_table($pdo);
        create_document_versions_table($pdo);
        
        // Insert default data
        insert_default_workflows($pdo);
        insert_default_permissions($pdo);
        
        // Commit transaction
        $pdo->commit();
        
        // Log successful installation
        logMessage('INFO', 'TenderManager module installed successfully');
        
        return true;
        
    } catch (Exception $e) {
        // Rollback on error
        if ($pdo->inTransaction()) {
            $pdo->rollback();
        }
        
        logMessage('ERROR', 'TenderManager module installation failed: ' . $e->getMessage());
        throw $e;
    }
}

/**
 * Create tender_workflows table
 */
function create_tender_workflows_table($pdo) {
    $sql = "
        CREATE TABLE IF NOT EXISTS tender_workflows (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            steps JSON NOT NULL,
            is_default BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            
            -- Configuration
            auto_advance BOOLEAN DEFAULT FALSE,
            require_approval BOOLEAN DEFAULT TRUE,
            notification_enabled BOOLEAN DEFAULT TRUE,
            
            -- Audit fields
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_by INT NOT NULL,
            
            -- Indexes
            INDEX idx_name (name),
            INDEX idx_is_default (is_default),
            INDEX idx_is_active (is_active),
            INDEX idx_created_by (created_by),
            
            -- Foreign keys
            CONSTRAINT fk_workflow_creator FOREIGN KEY (created_by) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($sql);
}

/**
 * Create tender_evaluations table
 */
function create_tender_evaluations_table($pdo) {
    $sql = "
        CREATE TABLE IF NOT EXISTS tender_evaluations (
            id INT PRIMARY KEY AUTO_INCREMENT,
            tender_id INT NOT NULL,
            evaluator_id INT NOT NULL,
            
            -- Evaluation criteria
            criteria JSON NOT NULL,
            scores JSON NOT NULL,
            total_score DECIMAL(5,2) NOT NULL,
            max_score DECIMAL(5,2) NOT NULL,
            percentage DECIMAL(5,2) NOT NULL,
            
            -- Evaluation details
            comments TEXT,
            recommendations TEXT,
            status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
            
            -- Timeline
            started_at TIMESTAMP NULL,
            completed_at TIMESTAMP NULL,
            submitted_at TIMESTAMP NULL,
            
            -- Audit fields
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            -- Constraints
            CONSTRAINT chk_evaluation_percentage CHECK (percentage BETWEEN 0 AND 100),
            CONSTRAINT chk_evaluation_scores CHECK (total_score <= max_score),
            
            -- Indexes
            INDEX idx_tender_id (tender_id),
            INDEX idx_evaluator_id (evaluator_id),
            INDEX idx_status (status),
            INDEX idx_percentage (percentage),
            INDEX idx_completed_at (completed_at),
            
            -- Foreign keys
            CONSTRAINT fk_evaluation_tender FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
            CONSTRAINT fk_evaluation_evaluator FOREIGN KEY (evaluator_id) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($sql);
}

/**
 * Create tender_documents table (enhanced version)
 */
function create_tender_documents_table($pdo) {
    $sql = "
        CREATE TABLE IF NOT EXISTS tender_documents (
            id INT PRIMARY KEY AUTO_INCREMENT,
            tender_id INT NOT NULL,
            
            -- File information
            original_name VARCHAR(255) NOT NULL,
            stored_name VARCHAR(255) NOT NULL,
            file_path TEXT NOT NULL,
            file_size BIGINT NOT NULL,
            mime_type VARCHAR(100) NOT NULL,
            file_hash VARCHAR(64) NOT NULL,
            
            -- Document classification
            document_type ENUM('tender_document', 'specification', 'drawing', 'terms', 'addendum', 'clarification') NOT NULL,
            category VARCHAR(100),
            tags JSON,
            
            -- Processing status
            processing_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
            extracted_text LONGTEXT,
            metadata JSON,
            
            -- Version control
            version INT DEFAULT 1,
            parent_document_id INT NULL,
            is_latest BOOLEAN DEFAULT TRUE,
            
            -- Access control
            access_level ENUM('public', 'restricted', 'confidential') DEFAULT 'public',
            password_protected BOOLEAN DEFAULT FALSE,
            download_count INT DEFAULT 0,
            
            -- Audit fields
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            uploaded_by INT NOT NULL,
            
            -- Constraints
            CONSTRAINT chk_file_size_positive CHECK (file_size > 0),
            CONSTRAINT chk_version_positive CHECK (version > 0),
            
            -- Indexes
            INDEX idx_tender_id (tender_id),
            INDEX idx_document_type (document_type),
            INDEX idx_uploaded_by (uploaded_by),
            INDEX idx_processing_status (processing_status),
            INDEX idx_file_hash (file_hash),
            INDEX idx_is_latest (is_latest),
            INDEX idx_access_level (access_level),
            
            -- Full-text search
            FULLTEXT idx_document_search (original_name, extracted_text),
            
            -- Foreign keys
            CONSTRAINT fk_tender_doc_tender FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
            CONSTRAINT fk_tender_doc_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id),
            CONSTRAINT fk_tender_doc_parent FOREIGN KEY (parent_document_id) REFERENCES tender_documents(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($sql);
}

/**
 * Create tender_assignments table (enhanced version)
 */
function create_tender_assignments_table($pdo) {
    $sql = "
        CREATE TABLE IF NOT EXISTS tender_assignments (
            id INT PRIMARY KEY AUTO_INCREMENT,
            tender_id INT NOT NULL,
            user_id INT NOT NULL,
            
            -- Assignment details
            role ENUM('manager', 'evaluator', 'reviewer', 'approver', 'observer') NOT NULL,
            responsibility TEXT,
            priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
            
            -- Status and progress
            status ENUM('assigned', 'accepted', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'assigned',
            progress_percentage INT DEFAULT 0,
            
            -- Timeline
            assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            accepted_date TIMESTAMP NULL,
            start_date TIMESTAMP NULL,
            due_date TIMESTAMP NULL,
            completion_date TIMESTAMP NULL,
            
            -- Communication
            notes TEXT,
            last_activity TIMESTAMP NULL,
            reminder_sent BOOLEAN DEFAULT FALSE,
            
            -- Audit fields
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            assigned_by INT NOT NULL,
            
            -- Constraints
            CONSTRAINT chk_assignment_progress CHECK (progress_percentage BETWEEN 0 AND 100),
            CONSTRAINT uk_tender_user_role UNIQUE (tender_id, user_id, role),
            
            -- Indexes
            INDEX idx_tender_id (tender_id),
            INDEX idx_user_id (user_id),
            INDEX idx_role (role),
            INDEX idx_status (status),
            INDEX idx_priority (priority),
            INDEX idx_due_date (due_date),
            INDEX idx_assigned_by (assigned_by),
            
            -- Foreign keys
            CONSTRAINT fk_tender_assignment_tender FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
            CONSTRAINT fk_tender_assignment_user FOREIGN KEY (user_id) REFERENCES users(id),
            CONSTRAINT fk_tender_assignment_assigner FOREIGN KEY (assigned_by) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($sql);
}

/**
 * Create bid_evaluations table
 */
function create_bid_evaluations_table($pdo) {
    $sql = "
        CREATE TABLE IF NOT EXISTS bid_evaluations (
            id INT PRIMARY KEY AUTO_INCREMENT,
            bid_id INT NOT NULL,
            evaluator_id INT NOT NULL,
            
            -- Technical evaluation
            technical_score DECIMAL(5,2) DEFAULT 0.00,
            technical_max_score DECIMAL(5,2) DEFAULT 100.00,
            technical_comments TEXT,
            
            -- Financial evaluation
            financial_score DECIMAL(5,2) DEFAULT 0.00,
            financial_max_score DECIMAL(5,2) DEFAULT 100.00,
            financial_comments TEXT,
            
            -- Overall evaluation
            overall_score DECIMAL(5,2) DEFAULT 0.00,
            overall_max_score DECIMAL(5,2) DEFAULT 100.00,
            overall_percentage DECIMAL(5,2) DEFAULT 0.00,
            
            -- Evaluation criteria
            criteria_scores JSON,
            evaluation_matrix JSON,
            
            -- Recommendation
            recommendation ENUM('accept', 'reject', 'conditional', 'clarification_needed') NULL,
            recommendation_reason TEXT,
            conditions TEXT,
            
            -- Status and timeline
            status ENUM('pending', 'in_progress', 'completed', 'reviewed', 'approved') DEFAULT 'pending',
            started_at TIMESTAMP NULL,
            completed_at TIMESTAMP NULL,
            
            -- Audit fields
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            -- Constraints
            CONSTRAINT chk_bid_eval_technical_score CHECK (technical_score <= technical_max_score),
            CONSTRAINT chk_bid_eval_financial_score CHECK (financial_score <= financial_max_score),
            CONSTRAINT chk_bid_eval_overall_score CHECK (overall_score <= overall_max_score),
            CONSTRAINT chk_bid_eval_percentage CHECK (overall_percentage BETWEEN 0 AND 100),
            
            -- Indexes
            INDEX idx_bid_id (bid_id),
            INDEX idx_evaluator_id (evaluator_id),
            INDEX idx_status (status),
            INDEX idx_overall_percentage (overall_percentage),
            INDEX idx_recommendation (recommendation),
            INDEX idx_completed_at (completed_at),
            
            -- Foreign keys
            CONSTRAINT fk_bid_evaluation_evaluator FOREIGN KEY (evaluator_id) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($sql);
}

/**
 * Create document_versions table
 */
function create_document_versions_table($pdo) {
    $sql = "
        CREATE TABLE IF NOT EXISTS document_versions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            document_id INT NOT NULL,
            
            -- Version information
            version_number INT NOT NULL,
            version_name VARCHAR(100),
            change_description TEXT,
            
            -- File information
            file_path TEXT NOT NULL,
            file_size BIGINT NOT NULL,
            file_hash VARCHAR(64) NOT NULL,
            
            -- Status
            is_current BOOLEAN DEFAULT FALSE,
            status ENUM('draft', 'review', 'approved', 'archived') DEFAULT 'draft',
            
            -- Audit fields
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by INT NOT NULL,
            approved_by INT NULL,
            approved_at TIMESTAMP NULL,
            
            -- Constraints
            CONSTRAINT chk_version_number_positive CHECK (version_number > 0),
            CONSTRAINT uk_document_version UNIQUE (document_id, version_number),
            
            -- Indexes
            INDEX idx_document_id (document_id),
            INDEX idx_version_number (version_number),
            INDEX idx_is_current (is_current),
            INDEX idx_status (status),
            INDEX idx_created_by (created_by),
            INDEX idx_file_hash (file_hash),
            
            -- Foreign keys
            CONSTRAINT fk_doc_version_document FOREIGN KEY (document_id) REFERENCES tender_documents(id) ON DELETE CASCADE,
            CONSTRAINT fk_doc_version_creator FOREIGN KEY (created_by) REFERENCES users(id),
            CONSTRAINT fk_doc_version_approver FOREIGN KEY (approved_by) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($sql);
}

/**
 * Insert default workflows
 */
function insert_default_workflows($pdo) {
    $workflows = [
        [
            'name' => 'Standard Tender Workflow',
            'description' => 'Default workflow for standard tender processing',
            'steps' => json_encode([
                ['step' => 'draft', 'name' => 'Draft Creation', 'required' => true],
                ['step' => 'review', 'name' => 'Internal Review', 'required' => true],
                ['step' => 'approval', 'name' => 'Management Approval', 'required' => true],
                ['step' => 'publish', 'name' => 'Publication', 'required' => true],
                ['step' => 'bidding', 'name' => 'Bidding Period', 'required' => true],
                ['step' => 'evaluation', 'name' => 'Bid Evaluation', 'required' => true],
                ['step' => 'award', 'name' => 'Award Decision', 'required' => true],
                ['step' => 'contract', 'name' => 'Contract Finalization', 'required' => false]
            ]),
            'is_default' => true,
            'auto_advance' => false,
            'require_approval' => true,
            'notification_enabled' => true
        ],
        [
            'name' => 'Express Tender Workflow',
            'description' => 'Simplified workflow for urgent tenders',
            'steps' => json_encode([
                ['step' => 'draft', 'name' => 'Draft Creation', 'required' => true],
                ['step' => 'approval', 'name' => 'Quick Approval', 'required' => true],
                ['step' => 'publish', 'name' => 'Immediate Publication', 'required' => true],
                ['step' => 'bidding', 'name' => 'Short Bidding Period', 'required' => true],
                ['step' => 'evaluation', 'name' => 'Fast Evaluation', 'required' => true],
                ['step' => 'award', 'name' => 'Quick Award', 'required' => true]
            ]),
            'is_default' => false,
            'auto_advance' => true,
            'require_approval' => true,
            'notification_enabled' => true
        ]
    ];
    
    $stmt = $pdo->prepare("
        INSERT INTO tender_workflows 
        (name, description, steps, is_default, auto_advance, require_approval, notification_enabled, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    ");
    
    foreach ($workflows as $workflow) {
        $stmt->execute([
            $workflow['name'],
            $workflow['description'],
            $workflow['steps'],
            $workflow['is_default'],
            $workflow['auto_advance'],
            $workflow['require_approval'],
            $workflow['notification_enabled']
        ]);
    }
}

/**
 * Insert default permissions for TenderManager module
 */
function insert_default_permissions($pdo) {
    $permissions = [
        ['name' => 'manage_tenders', 'display_name' => 'Manage Tenders', 'description' => 'Full tender management access', 'module' => 'TenderManager', 'category' => 'tender'],
        ['name' => 'create_tender', 'display_name' => 'Create Tender', 'description' => 'Create new tenders', 'module' => 'TenderManager', 'category' => 'tender'],
        ['name' => 'edit_tender', 'display_name' => 'Edit Tender', 'description' => 'Edit existing tenders', 'module' => 'TenderManager', 'category' => 'tender'],
        ['name' => 'delete_tender', 'display_name' => 'Delete Tender', 'description' => 'Delete tenders', 'module' => 'TenderManager', 'category' => 'tender'],
        ['name' => 'publish_tender', 'display_name' => 'Publish Tender', 'description' => 'Publish tenders for bidding', 'module' => 'TenderManager', 'category' => 'tender'],
        ['name' => 'evaluate_bids', 'display_name' => 'Evaluate Bids', 'description' => 'Evaluate submitted bids', 'module' => 'TenderManager', 'category' => 'bid'],
        ['name' => 'award_tender', 'display_name' => 'Award Tender', 'description' => 'Award tenders to bidders', 'module' => 'TenderManager', 'category' => 'tender'],
        ['name' => 'manage_documents', 'display_name' => 'Manage Documents', 'description' => 'Upload and manage tender documents', 'module' => 'TenderManager', 'category' => 'document'],
        ['name' => 'view_reports', 'display_name' => 'View Reports', 'description' => 'Access tender reports and analytics', 'module' => 'TenderManager', 'category' => 'report'],
        ['name' => 'export_data', 'display_name' => 'Export Data', 'description' => 'Export tender and bid data', 'module' => 'TenderManager', 'category' => 'data']
    ];
    
    $stmt = $pdo->prepare("
        INSERT IGNORE INTO permissions 
        (name, display_name, description, module, category, created_by) 
        VALUES (?, ?, ?, ?, ?, 1)
    ");
    
    foreach ($permissions as $permission) {
        $stmt->execute([
            $permission['name'],
            $permission['display_name'],
            $permission['description'],
            $permission['module'],
            $permission['category']
        ]);
    }
}

// Run installation if called directly
if (basename(__FILE__) == basename($_SERVER['SCRIPT_NAME'])) {
    try {
        install_tender_manager();
        echo "TenderManager module installed successfully!\n";
    } catch (Exception $e) {
        echo "Installation failed: " . $e->getMessage() . "\n";
        exit(1);
    }
}