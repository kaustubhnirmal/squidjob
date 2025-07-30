<?php
/**
 * SquidJob Authentication System - Standalone Installation Script
 * 
 * This script provides automated installation without dependency conflicts.
 */

// Prevent direct web access
if (php_sapi_name() !== 'cli' && !defined('INSTALL_AUTH_SYSTEM')) {
    die('This script can only be run from command line or during installation.');
}

// Define constants
define('APP_ROOT', __DIR__);
define('AUTH_SYSTEM_VERSION', '1.0.0');

class StandaloneAuthInstaller {
    
    private $pdo;
    private $installLog = [];
    private $errors = [];
    private $warnings = [];
    
    public function __construct() {
        $this->log("🚀 SquidJob Authentication System Installer v" . AUTH_SYSTEM_VERSION);
        $this->log("📅 Installation started at: " . date('Y-m-d H:i:s'));
    }
    
    /**
     * Main installation process
     */
    public function install() {
        try {
            $this->displayHeader();
            
            // System checks
            $this->performSystemChecks();
            
            // Database setup
            $this->setupDatabase();
            
            // Install authentication system
            $this->installAuthSystem();
            
            // Create admin user
            $this->createAdminUser();
            
            // Display results
            $this->displayResults();
            
        } catch (Exception $e) {
            $this->error("❌ Installation failed: " . $e->getMessage());
            $this->displayResults();
            throw $e;
        }
    }
    
    /**
     * Display installation header
     */
    private function displayHeader() {
        echo "\n";
        echo "╔══════════════════════════════════════════════════════════════╗\n";
        echo "║                    🐙 SquidJob Authentication System          ║\n";
        echo "║                     Standalone Installation                  ║\n";
        echo "║                          Version " . AUTH_SYSTEM_VERSION . "                        ║\n";
        echo "╚══════════════════════════════════════════════════════════════╝\n";
        echo "\n";
    }
    
    /**
     * Perform system checks
     */
    private function performSystemChecks() {
        $this->log("🔍 Performing system checks...");
        
        // PHP Version Check
        if (version_compare(PHP_VERSION, '8.0.0', '<')) {
            $this->error("PHP version 8.0.0 or higher required. Current: " . PHP_VERSION);
            throw new Exception("PHP version requirement not met");
        }
        $this->log("✅ PHP version: " . PHP_VERSION . " (OK)");
        
        // Required PHP Extensions
        $requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'openssl'];
        foreach ($requiredExtensions as $ext) {
            if (!extension_loaded($ext)) {
                $this->error("Required PHP extension missing: {$ext}");
                throw new Exception("Missing PHP extension: {$ext}");
            }
        }
        $this->log("✅ Required PHP extensions loaded");
        
        // Create directories
        $this->createDirectories();
        
        $this->log("✅ System checks completed successfully");
    }
    
    /**
     * Create required directories
     */
    private function createDirectories() {
        $directories = [
            'storage/logs',
            'storage/sessions',
            'storage/cache',
            'storage/uploads',
            'storage/backups',
            'app/views/cache'
        ];
        
        foreach ($directories as $dir) {
            $fullPath = APP_ROOT . '/' . $dir;
            
            if (!is_dir($fullPath)) {
                if (!mkdir($fullPath, 0755, true)) {
                    $this->error("Cannot create directory: {$dir}");
                    throw new Exception("Directory creation failed: {$dir}");
                }
                $this->log("📁 Created directory: {$dir}");
            }
        }
    }
    
    /**
     * Setup database connection
     */
    private function setupDatabase() {
        $this->log("🔌 Setting up database connection...");
        
        try {
            // Try default XAMPP settings first
            $dsn = "mysql:host=localhost;port=3306;dbname=squidjob;charset=utf8mb4";
            $this->pdo = new PDO($dsn, 'root', '', [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            
            // Test connection
            $stmt = $this->pdo->query('SELECT VERSION() as version');
            $version = $stmt->fetch()['version'];
            
            $this->log("✅ Database connected successfully");
            $this->log("📊 MySQL version: {$version}");
            
        } catch (Exception $e) {
            $this->error("Database connection failed: " . $e->getMessage());
            throw new Exception("Cannot establish database connection. Please ensure MySQL is running and 'squidjob' database exists.");
        }
    }
    
    /**
     * Install authentication system
     */
    private function installAuthSystem() {
        $this->log("🔧 Installing authentication system...");
        
        // Check if already installed
        if ($this->isAlreadyInstalled()) {
            $this->log("⚠️  Authentication system already installed");
            return;
        }
        
        // Run database migrations
        $this->runDatabaseMigrations();
        
        // Create system info table
        $this->createSystemInfoTable();
        
        // Record installation
        $this->recordInstallation();
        
        $this->log("✅ Authentication system installed successfully");
    }
    
    /**
     * Check if already installed
     */
    private function isAlreadyInstalled() {
        try {
            $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'");
            $result = $stmt->fetch();
            return $result['count'] > 0;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Run database migrations
     */
    private function runDatabaseMigrations() {
        $this->log("📊 Running database migrations...");
        
        $migrationFile = APP_ROOT . '/database/simple_auth_schema.sql';
        
        if (!file_exists($migrationFile)) {
            throw new Exception("Migration file not found: {$migrationFile}");
        }
        
        $sql = file_get_contents($migrationFile);
        
        // Execute SQL directly without splitting into statements
        try {
            $this->pdo->exec($sql);
            $this->log("✅ Database migrations completed successfully");
            
        } catch (Exception $e) {
            throw new Exception("Migration failed: " . $e->getMessage());
        }
    }
    
    /**
     * Create system info table
     */
    private function createSystemInfoTable() {
        $sql = "
            CREATE TABLE IF NOT EXISTS auth_system_info (
                id INT PRIMARY KEY AUTO_INCREMENT,
                version VARCHAR(20) NOT NULL,
                installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                installation_id VARCHAR(64) NOT NULL,
                config_hash VARCHAR(64) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ";
        
        $this->pdo->exec($sql);
        $this->log("✅ System info table created");
    }
    
    /**
     * Record installation
     */
    private function recordInstallation() {
        $installationId = bin2hex(random_bytes(32));
        $configHash = md5('squidjob_auth_' . AUTH_SYSTEM_VERSION);
        
        $stmt = $this->pdo->prepare("
            INSERT INTO auth_system_info (version, installation_id, config_hash) 
            VALUES (?, ?, ?)
        ");
        
        $stmt->execute([AUTH_SYSTEM_VERSION, $installationId, $configHash]);
        
        $this->log("📝 Installation recorded");
    }
    
    /**
     * Create admin user
     */
    private function createAdminUser() {
        $this->log("👤 Creating admin user...");
        
        // Check if admin user already exists
        $stmt = $this->pdo->prepare("SELECT COUNT(*) as count FROM users WHERE email = ?");
        $stmt->execute(['admin@squidjob.com']);
        $result = $stmt->fetch();
        
        if ($result['count'] > 0) {
            $this->log("⚠️  Admin user already exists");
            return;
        }
        
        // Get admin role ID
        $stmt = $this->pdo->prepare("SELECT id FROM roles WHERE name = 'admin' LIMIT 1");
        $stmt->execute();
        $adminRole = $stmt->fetch();
        
        if (!$adminRole) {
            throw new Exception("Admin role not found");
        }
        
        // Generate secure password
        $adminPassword = $this->generateSecurePassword();
        $passwordHash = password_hash($adminPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        
        // Create admin user
        $stmt = $this->pdo->prepare("
            INSERT INTO users (first_name, last_name, email, password_hash, status, email_verified, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            'System',
            'Administrator',
            'admin@squidjob.com',
            $passwordHash,
            'active',
            1
        ]);
        
        $adminUserId = $this->pdo->lastInsertId();
        
        // Assign admin role
        $stmt = $this->pdo->prepare("INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at) VALUES (?, ?, ?, NOW())");
        $stmt->execute([$adminUserId, $adminRole['id'], $adminUserId]);
        
        $this->log("✅ Admin user created successfully");
        $this->log("📧 Email: admin@squidjob.com");
        $this->log("🔑 Password: {$adminPassword}");
        $this->log("⚠️  Please change the admin password after first login!");
        
        // Save credentials to file for reference
        $credentialsFile = APP_ROOT . '/storage/admin_credentials.txt';
        file_put_contents($credentialsFile, "Admin Credentials\n================\nEmail: admin@squidjob.com\nPassword: {$adminPassword}\nCreated: " . date('Y-m-d H:i:s') . "\n\nIMPORTANT: Change this password after first login and delete this file!\n");
        $this->log("📄 Credentials saved to: storage/admin_credentials.txt");
    }
    
    /**
     * Generate secure password
     */
    private function generateSecurePassword($length = 12) {
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        return substr(str_shuffle($chars), 0, $length);
    }
    
    /**
     * Display installation results
     */
    private function displayResults() {
        echo "\n";
        echo "╔══════════════════════════════════════════════════════════════╗\n";
        echo "║                     Installation Results                    ║\n";
        echo "╚══════════════════════════════════════════════════════════════╝\n";
        echo "\n";
        
        if (empty($this->errors)) {
            echo "🎉 Installation completed successfully!\n\n";
            
            echo "📊 Summary:\n";
            echo "  • Authentication system version: " . AUTH_SYSTEM_VERSION . "\n";
            echo "  • Database tables created: 15+\n";
            echo "  • Default roles configured: 5\n";
            echo "  • Default permissions: 20+\n";
            echo "  • Admin user created: admin@squidjob.com\n\n";
            
            echo "🔗 Next Steps:\n";
            echo "  1. Access the system: http://localhost/squidjob/\n";
            echo "  2. Login with admin credentials (see storage/admin_credentials.txt)\n";
            echo "  3. Change the default admin password\n";
            echo "  4. Delete the credentials file: storage/admin_credentials.txt\n";
            echo "  5. Test the system: php simple_auth_test.php\n";
            echo "  6. Test web interface: http://localhost/squidjob/test_auth_web.php\n\n";
            
            echo "🛠️  Available Tools:\n";
            echo "  • Test system: php simple_auth_test.php\n";
            echo "  • Monitor system: php auth_system_monitor.php\n";
            echo "  • Web test interface: test_auth_web.php\n\n";
            
        } else {
            echo "❌ Installation failed with errors:\n\n";
            foreach ($this->errors as $error) {
                echo "  • {$error}\n";
            }
            echo "\n";
        }
        
        if (!empty($this->warnings)) {
            echo "⚠️  Warnings:\n";
            foreach ($this->warnings as $warning) {
                echo "  • {$warning}\n";
            }
            echo "\n";
        }
        
        echo "📝 Installation log:\n";
        foreach ($this->installLog as $entry) {
            echo "  {$entry}\n";
        }
        echo "\n";
    }
    
    /**
     * Log message
     */
    private function log($message) {
        $timestamp = date('H:i:s');
        $logEntry = "[{$timestamp}] {$message}";
        $this->installLog[] = $logEntry;
        echo "{$logEntry}\n";
    }
    
    /**
     * Log error
     */
    private function error($message) {
        $this->errors[] = $message;
        $this->log("❌ ERROR: {$message}");
    }
    
    /**
     * Log warning
     */
    private function warning($message) {
        $this->warnings[] = $message;
        $this->log("⚠️  WARNING: {$message}");
    }
}

// Run installation if called directly
if (php_sapi_name() === 'cli') {
    try {
        $installer = new StandaloneAuthInstaller();
        $installer->install();
    } catch (Exception $e) {
        echo "Installation failed: " . $e->getMessage() . "\n";
        exit(1);
    }
}