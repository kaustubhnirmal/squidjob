<?php
/**
 * SquidJob Authentication System Installation Script
 * 
 * This script sets up the complete authentication system with:
 * - Enhanced database schema
 * - Default roles and permissions
 * - Security settings
 * - Admin user creation
 */

// Prevent direct access from web
if (php_sapi_name() !== 'cli' && !defined('INSTALL_AUTH_SYSTEM')) {
    die('This script can only be run from command line or during installation.');
}

// Include configuration
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/app/helpers/auth_helpers.php';

class AuthSystemInstaller {
    
    private $pdo;
    private $errors = [];
    private $success = [];
    
    public function __construct() {
        try {
            $this->pdo = getDbConnection();
            $this->success[] = "Database connection established successfully.";
        } catch (Exception $e) {
            $this->errors[] = "Database connection failed: " . $e->getMessage();
            throw $e;
        }
    }
    
    /**
     * Run the complete installation
     */
    public function install() {
        echo "=== SquidJob Authentication System Installation ===\n\n";
        
        try {
            // Step 1: Create database schema
            $this->createDatabaseSchema();
            
            // Step 2: Insert default data
            $this->insertDefaultData();
            
            // Step 3: Create admin user
            $this->createAdminUser();
            
            // Step 4: Set up security settings
            $this->setupSecuritySettings();
            
            // Step 5: Create necessary directories
            $this->createDirectories();
            
            // Step 6: Set permissions
            $this->setPermissions();
            
            // Display results
            $this->displayResults();
            
        } catch (Exception $e) {
            $this->errors[] = "Installation failed: " . $e->getMessage();
            $this->displayResults();
            throw $e;
        }
    }
    
    /**
     * Create database schema
     */
    private function createDatabaseSchema() {
        echo "Creating database schema...\n";
        
        try {
            $schemaFile = __DIR__ . '/database/enhanced_auth_schema.sql';
            
            if (!file_exists($schemaFile)) {
                throw new Exception("Schema file not found: {$schemaFile}");
            }
            
            $sql = file_get_contents($schemaFile);
            
            // Split SQL into individual statements
            $statements = array_filter(
                array_map('trim', explode(';', $sql)),
                function($stmt) {
                    return !empty($stmt) && 
                           !preg_match('/^(--|\/\*|\s*$)/', $stmt) &&
                           !preg_match('/^(SET|DELIMITER|START TRANSACTION|COMMIT)/', $stmt);
                }
            );
            
            foreach ($statements as $statement) {
                if (trim($statement)) {
                    $this->pdo->exec($statement);
                }
            }
            
            $this->success[] = "Database schema created successfully.";
            
        } catch (Exception $e) {
            $this->errors[] = "Failed to create database schema: " . $e->getMessage();
            throw $e;
        }
    }
    
    /**
     * Insert default data
     */
    private function insertDefaultData() {
        echo "Inserting default data...\n";
        
        try {
            // Insert default roles
            $this->insertDefaultRoles();
            
            // Insert default permissions
            $this->insertDefaultPermissions();
            
            // Assign permissions to roles
            $this->assignPermissionsToRoles();
            
            $this->success[] = "Default data inserted successfully.";
            
        } catch (Exception $e) {
            $this->errors[] = "Failed to insert default data: " . $e->getMessage();
            throw $e;
        }
    }
    
    /**
     * Insert default roles
     */
    private function insertDefaultRoles() {
        $roles = [
            [17, 'admin', 'System Administrator', 'Full system access with all permissions', 1, '#dc3545'],
            [18, 'tender_manager', 'Tender Manager', 'Manage tenders, bids, and evaluations', 2, '#007bff'],
            [19, 'sales_head', 'Sales Head', 'Business development and client relations', 3, '#28a745'],
            [20, 'accountant', 'Accountant', 'Financial management and reporting', 4, '#ffc107'],
            [21, 'user', 'Standard User', 'Basic tender processing access', 5, '#6c757d']
        ];
        
        $stmt = $this->pdo->prepare("
            INSERT IGNORE INTO roles (id, name, display_name, description, level, color, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, 1)
        ");
        
        foreach ($roles as $role) {
            $stmt->execute($role);
        }
    }
    
    /**
     * Insert default permissions
     */
    private function insertDefaultPermissions() {
        $permissions = [
            // User Management
            ['view_users', 'View Users', 'View user list and profiles', 'users', 'management'],
            ['create_user', 'Create User', 'Create new user accounts', 'users', 'management'],
            ['edit_user', 'Edit User', 'Edit user profiles and settings', 'users', 'management'],
            ['delete_user', 'Delete User', 'Delete user accounts', 'users', 'management'],
            ['manage_roles', 'Manage Roles', 'Assign and manage user roles', 'users', 'roles'],
            
            // Tender Management
            ['view_tenders', 'View Tenders', 'View tender listings and details', 'tenders', 'management'],
            ['create_tender', 'Create Tender', 'Create new tenders', 'tenders', 'management'],
            ['edit_tender', 'Edit Tender', 'Edit tender details and specifications', 'tenders', 'management'],
            ['delete_tender', 'Delete Tender', 'Delete tenders', 'tenders', 'management'],
            ['publish_tender', 'Publish Tender', 'Publish tenders for bidding', 'tenders', 'workflow'],
            ['assign_tender', 'Assign Tender', 'Assign tenders to team members', 'tenders', 'workflow'],
            
            // Bidding System
            ['view_bids', 'View Bids', 'View bid submissions and details', 'bidding', 'management'],
            ['submit_bid', 'Submit Bid', 'Submit bids for tenders', 'bidding', 'participation'],
            ['evaluate_bids', 'Evaluate Bids', 'Evaluate and score bid submissions', 'bidding', 'evaluation'],
            ['award_tender', 'Award Tender', 'Award tenders to winning bidders', 'bidding', 'workflow'],
            
            // Document Management
            ['view_documents', 'View Documents', 'View and download documents', 'documents', 'access'],
            ['upload_document', 'Upload Document', 'Upload documents and files', 'documents', 'management'],
            ['delete_document', 'Delete Document', 'Delete documents and files', 'documents', 'management'],
            ['manage_confidential', 'Manage Confidential Documents', 'Access and manage confidential documents', 'documents', 'security'],
            
            // Financial Management
            ['view_financials', 'View Financials', 'View financial reports and data', 'finance', 'reporting'],
            ['create_po', 'Create Purchase Order', 'Create purchase orders', 'finance', 'procurement'],
            ['approve_po', 'Approve Purchase Order', 'Approve purchase orders', 'finance', 'approval'],
            ['manage_budget', 'Manage Budget', 'Manage project budgets and allocations', 'finance', 'planning'],
            
            // Reporting
            ['view_reports', 'View Reports', 'View system reports and analytics', 'reports', 'access'],
            ['create_reports', 'Create Reports', 'Create custom reports', 'reports', 'management'],
            ['export_reports', 'Export Reports', 'Export reports in various formats', 'reports', 'export'],
            
            // System Administration
            ['system_config', 'System Configuration', 'Configure system settings', 'system', 'administration'],
            ['view_logs', 'View System Logs', 'View system and audit logs', 'system', 'monitoring'],
            ['backup_system', 'Backup System', 'Create and manage system backups', 'system', 'maintenance'],
            ['manage_permissions', 'Manage Permissions', 'Manage roles and permissions', 'system', 'security']
        ];
        
        $stmt = $this->pdo->prepare("
            INSERT IGNORE INTO permissions (name, display_name, description, module, category, is_active) 
            VALUES (?, ?, ?, ?, ?, 1)
        ");
        
        foreach ($permissions as $permission) {
            $stmt->execute($permission);
        }
    }
    
    /**
     * Assign permissions to roles
     */
    private function assignPermissionsToRoles() {
        // Admin gets all permissions
        $this->pdo->exec("
            INSERT IGNORE INTO role_permissions (role_id, permission_id, assigned_by, assigned_at)
            SELECT 17, p.id, 1, NOW()
            FROM permissions p
            WHERE p.is_active = 1
        ");
        
        // Tender Manager permissions
        $tenderManagerPerms = [
            'view_users', 'view_tenders', 'create_tender', 'edit_tender', 'publish_tender', 
            'assign_tender', 'view_bids', 'evaluate_bids', 'award_tender', 'view_documents', 
            'upload_document', 'view_reports', 'create_reports'
        ];
        
        $this->assignPermissionsToRole(18, $tenderManagerPerms);
        
        // Sales Head permissions
        $salesHeadPerms = [
            'view_users', 'view_tenders', 'create_tender', 'edit_tender', 'view_bids', 
            'submit_bid', 'view_documents', 'upload_document', 'view_financials', 'view_reports'
        ];
        
        $this->assignPermissionsToRole(19, $salesHeadPerms);
        
        // Accountant permissions
        $accountantPerms = [
            'view_users', 'view_tenders', 'view_bids', 'view_documents', 'view_financials', 
            'create_po', 'approve_po', 'manage_budget', 'view_reports', 'export_reports'
        ];
        
        $this->assignPermissionsToRole(20, $accountantPerms);
        
        // Standard User permissions
        $userPerms = [
            'view_tenders', 'submit_bid', 'view_documents', 'upload_document', 'view_reports'
        ];
        
        $this->assignPermissionsToRole(21, $userPerms);
    }
    
    /**
     * Assign specific permissions to a role
     */
    private function assignPermissionsToRole($roleId, $permissions) {
        $placeholders = str_repeat('?,', count($permissions) - 1) . '?';
        
        $stmt = $this->pdo->prepare("
            INSERT IGNORE INTO role_permissions (role_id, permission_id, assigned_by, assigned_at)
            SELECT ?, p.id, 1, NOW()
            FROM permissions p
            WHERE p.name IN ({$placeholders}) AND p.is_active = 1
        ");
        
        $stmt->execute(array_merge([$roleId], $permissions));
    }
    
    /**
     * Create admin user
     */
    private function createAdminUser() {
        echo "Creating admin user...\n";
        
        try {
            // Check if admin user already exists
            $stmt = $this->pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute(['admin@squidjob.com']);
            
            if ($stmt->fetch()) {
                $this->success[] = "Admin user already exists.";
                return;
            }
            
            // Generate secure password
            $password = $this->generateSecurePassword();
            
            // Create admin user
            $stmt = $this->pdo->prepare("
                INSERT INTO users (
                    first_name, last_name, email, password_hash, 
                    status, email_verified, password_changed_at, created_at
                ) VALUES (?, ?, ?, ?, 'active', 1, NOW(), NOW())
            ");
            
            $stmt->execute([
                'System',
                'Administrator',
                'admin@squidjob.com',
                hashPassword($password)
            ]);
            
            $adminId = $this->pdo->lastInsertId();
            
            // Assign admin role
            $stmt = $this->pdo->prepare("
                INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at) 
                VALUES (?, 17, 1, NOW())
            ");
            $stmt->execute([$adminId]);
            
            $this->success[] = "Admin user created successfully.";
            $this->success[] = "Admin Email: admin@squidjob.com";
            $this->success[] = "Admin Password: {$password}";
            $this->success[] = "*** IMPORTANT: Change the admin password after first login! ***";
            
        } catch (Exception $e) {
            $this->errors[] = "Failed to create admin user: " . $e->getMessage();
            throw $e;
        }
    }
    
    /**
     * Setup security settings
     */
    private function setupSecuritySettings() {
        echo "Setting up security configuration...\n";
        
        try {
            $settings = [
                ['max_login_attempts', '5', 'integer', 'Maximum failed login attempts before account lockout'],
                ['lockout_duration', '900', 'integer', 'Account lockout duration in seconds (15 minutes)'],
                ['session_timeout', '1440', 'integer', 'Session timeout in minutes (24 hours)'],
                ['password_min_length', '8', 'integer', 'Minimum password length'],
                ['password_require_uppercase', '1', 'boolean', 'Require uppercase letters in password'],
                ['password_require_lowercase', '1', 'boolean', 'Require lowercase letters in password'],
                ['password_require_numbers', '1', 'boolean', 'Require numbers in password'],
                ['password_require_symbols', '1', 'boolean', 'Require special characters in password'],
                ['enable_remember_me', '1', 'boolean', 'Allow remember me functionality'],
                ['remember_me_duration', '2592000', 'integer', 'Remember me duration in seconds (30 days)'],
                ['enable_rate_limiting', '1', 'boolean', 'Enable rate limiting for sensitive operations'],
                ['enable_device_tracking', '1', 'boolean', 'Track user devices for security'],
                ['max_concurrent_sessions', '3', 'integer', 'Maximum concurrent sessions per user'],
                ['enable_security_notifications', '1', 'boolean', 'Send security-related notifications']
            ];
            
            $stmt = $this->pdo->prepare("
                INSERT IGNORE INTO security_settings (setting_key, setting_value, setting_type, description, is_active) 
                VALUES (?, ?, ?, ?, 1)
            ");
            
            foreach ($settings as $setting) {
                $stmt->execute($setting);
            }
            
            $this->success[] = "Security settings configured successfully.";
            
        } catch (Exception $e) {
            $this->errors[] = "Failed to setup security settings: " . $e->getMessage();
            throw $e;
        }
    }
    
    /**
     * Create necessary directories
     */
    private function createDirectories() {
        echo "Creating directories...\n";
        
        $directories = [
            'storage/logs',
            'storage/sessions',
            'storage/cache',
            'storage/backups',
            'public/uploads/avatars',
            'public/uploads/documents',
            'app/views/emails'
        ];
        
        foreach ($directories as $dir) {
            $fullPath = __DIR__ . '/' . $dir;
            
            if (!is_dir($fullPath)) {
                if (mkdir($fullPath, 0755, true)) {
                    $this->success[] = "Created directory: {$dir}";
                } else {
                    $this->errors[] = "Failed to create directory: {$dir}";
                }
            }
        }
    }
    
    /**
     * Set file permissions
     */
    private function setPermissions() {
        echo "Setting file permissions...\n";
        
        $writableDirectories = [
            'storage',
            'public/uploads'
        ];
        
        foreach ($writableDirectories as $dir) {
            $fullPath = __DIR__ . '/' . $dir;
            
            if (is_dir($fullPath)) {
                if (chmod($fullPath, 0755)) {
                    $this->success[] = "Set permissions for: {$dir}";
                } else {
                    $this->errors[] = "Failed to set permissions for: {$dir}";
                }
            }
        }
    }
    
    /**
     * Generate secure password
     */
    private function generateSecurePassword($length = 12) {
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        $password = '';
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[random_int(0, strlen($chars) - 1)];
        }
        
        return $password;
    }
    
    /**
     * Display installation results
     */
    private function displayResults() {
        echo "\n=== Installation Results ===\n\n";
        
        if (!empty($this->success)) {
            echo "✅ SUCCESS:\n";
            foreach ($this->success as $message) {
                echo "   • {$message}\n";
            }
            echo "\n";
        }
        
        if (!empty($this->errors)) {
            echo "❌ ERRORS:\n";
            foreach ($this->errors as $message) {
                echo "   • {$message}\n";
            }
            echo "\n";
        }
        
        if (empty($this->errors)) {
            echo "🎉 SquidJob Authentication System installed successfully!\n\n";
            echo "Next Steps:\n";
            echo "1. Update your .env file with proper configuration\n";
            echo "2. Configure email settings for notifications\n";
            echo "3. Login with admin credentials and change the password\n";
            echo "4. Create additional users and assign roles\n";
            echo "5. Review security settings in the admin panel\n\n";
        } else {
            echo "❌ Installation completed with errors. Please review and fix the issues above.\n\n";
        }
    }
}

// Run installation if called directly
if (php_sapi_name() === 'cli') {
    try {
        $installer = new AuthSystemInstaller();
        $installer->install();
    } catch (Exception $e) {
        echo "Installation failed: " . $e->getMessage() . "\n";
        exit(1);
    }
}