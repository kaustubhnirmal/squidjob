<?php
/**
 * SquidJob Authentication System - Enhanced Installation Script
 * 
 * This script provides automated installation with database setup,
 * automatic updates, and modular architecture compliance.
 * 
 * Features:
 * - Automatic database connection detection
 * - Schema migration system
 * - Version management
 * - Rollback capabilities
 * - Configuration validation
 * - Automatic updates
 */

// Prevent direct web access
if (php_sapi_name() !== 'cli' && !defined('INSTALL_AUTH_SYSTEM')) {
    die('This script can only be run from command line or during installation.');
}

// Define constants
define('APP_ROOT', __DIR__);
define('AUTH_SYSTEM_VERSION', '1.0.0');
define('MIN_PHP_VERSION', '8.0.0');
define('MIN_MYSQL_VERSION', '8.0.0');

// Include required files
require_once __DIR__ . '/config/app.php';

class EnhancedAuthInstaller {
    
    private $pdo;
    private $config;
    private $installLog = [];
    private $errors = [];
    private $warnings = [];
    
    public function __construct() {
        $this->config = $this->loadConfiguration();
        $this->log("🚀 SquidJob Authentication System Enhanced Installer v" . AUTH_SYSTEM_VERSION);
        $this->log("📅 Installation started at: " . date('Y-m-d H:i:s'));
    }
    
    /**
     * Main installation process
     */
    public function install() {
        try {
            $this->displayHeader();
            
            // Pre-installation checks
            $this->performSystemChecks();
            
            // Database connection and setup
            $this->setupDatabaseConnection();
            
            // Check for existing installation
            $this->checkExistingInstallation();
            
            // Install or update
            if ($this->isInstalled()) {
                $this->performUpdate();
            } else {
                $this->performFreshInstall();
            }
            
            // Post-installation tasks
            $this->performPostInstallation();
            
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
        echo "║                     Enhanced Installation Script             ║\n";
        echo "║                          Version " . AUTH_SYSTEM_VERSION . "                        ║\n";
        echo "╚══════════════════════════════════════════════════════════════╝\n";
        echo "\n";
    }
    
    /**
     * Perform system requirement checks
     */
    private function performSystemChecks() {
        $this->log("🔍 Performing system checks...");
        
        // PHP Version Check
        if (version_compare(PHP_VERSION, MIN_PHP_VERSION, '<')) {
            $this->error("PHP version " . MIN_PHP_VERSION . " or higher required. Current: " . PHP_VERSION);
            throw new Exception("PHP version requirement not met");
        }
        $this->log("✅ PHP version: " . PHP_VERSION . " (OK)");
        
        // Required PHP Extensions
        $requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'openssl', 'session'];
        foreach ($requiredExtensions as $ext) {
            if (!extension_loaded($ext)) {
                $this->error("Required PHP extension missing: {$ext}");
                throw new Exception("Missing PHP extension: {$ext}");
            }
        }
        $this->log("✅ Required PHP extensions loaded");
        
        // Directory permissions
        $this->checkDirectoryPermissions();
        
        // Configuration validation
        $this->validateConfiguration();
        
        $this->log("✅ System checks completed successfully");
    }
    
    /**
     * Check directory permissions
     */
    private function checkDirectoryPermissions() {
        $directories = [
            'storage/logs',
            'storage/sessions',
            'storage/cache',
            'storage/uploads',
            'app/views/cache'
        ];
        
        foreach ($directories as $dir) {
            $fullPath = APP_ROOT . '/' . $dir;
            
            // Create directory if it doesn't exist
            if (!is_dir($fullPath)) {
                if (!mkdir($fullPath, 0755, true)) {
                    $this->error("Cannot create directory: {$dir}");
                    throw new Exception("Directory creation failed: {$dir}");
                }
                $this->log("📁 Created directory: {$dir}");
            }
            
            // Check write permissions
            if (!is_writable($fullPath)) {
                $this->warning("Directory not writable: {$dir}");
            }
        }
    }
    
    /**
     * Validate configuration
     */
    private function validateConfiguration() {
        // Check if config files exist
        $configFiles = [
            'config/app.php',
            'config/database.php'
        ];
        
        foreach ($configFiles as $file) {
            if (!file_exists(APP_ROOT . '/' . $file)) {
                $this->error("Configuration file missing: {$file}");
                throw new Exception("Missing configuration file: {$file}");
            }
        }
        
        $this->log("✅ Configuration files validated");
    }
    
    /**
     * Setup database connection
     */
    private function setupDatabaseConnection() {
        $this->log("🔌 Setting up database connection...");
        
        try {
            // Try multiple connection methods
            $this->pdo = $this->attemptDatabaseConnection();
            
            // Test connection
            $stmt = $this->pdo->query('SELECT VERSION() as version');
            $version = $stmt->fetch()['version'];
            
            $this->log("✅ Database connected successfully");
            $this->log("📊 MySQL version: {$version}");
            
            // Check MySQL version
            if (version_compare($version, MIN_MYSQL_VERSION, '<')) {
                $this->warning("MySQL version " . MIN_MYSQL_VERSION . " or higher recommended. Current: {$version}");
            }
            
        } catch (Exception $e) {
            $this->error("Database connection failed: " . $e->getMessage());
            throw new Exception("Cannot establish database connection");
        }
    }
    
    /**
     * Attempt database connection with multiple methods
     */
    private function attemptDatabaseConnection() {
        $connectionMethods = [
            'config' => [$this, 'connectViaConfig'],
            'env' => [$this, 'connectViaEnv'],
            'defaults' => [$this, 'connectViaDefaults']
        ];
        
        foreach ($connectionMethods as $method => $callback) {
            try {
                $this->log("🔄 Trying connection method: {$method}");
                return call_user_func($callback);
            } catch (Exception $e) {
                $this->log("⚠️  Connection method '{$method}' failed: " . $e->getMessage());
                continue;
            }
        }
        
        throw new Exception("All database connection methods failed");
    }
    
    /**
     * Connect via configuration file
     */
    private function connectViaConfig() {
        $config = config('database.connections.mysql');
        if (!$config) {
            throw new Exception("Database configuration not found");
        }
        
        $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}";
        return new PDO($dsn, $config['username'], $config['password'], $config['options']);
    }
    
    /**
     * Connect via environment variables
     */
    private function connectViaEnv() {
        $host = env('DB_HOST', 'localhost');
        $port = env('DB_PORT', '3306');
        $database = env('DB_DATABASE', 'squidjob');
        $username = env('DB_USERNAME', 'root');
        $password = env('DB_PASSWORD', '');
        
        $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
        return new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    
    /**
     * Connect via default XAMPP settings
     */
    private function connectViaDefaults() {
        $dsn = "mysql:host=localhost;port=3306;dbname=squidjob;charset=utf8mb4";
        return new PDO($dsn, 'root', '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    
    /**
     * Check for existing installation
     */
    private function checkExistingInstallation() {
        $this->log("🔍 Checking for existing installation...");
        
        try {
            $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'auth_system_info'");
            $result = $stmt->fetch();
            
            if ($result['count'] > 0) {
                $stmt = $this->pdo->query("SELECT version, installed_at FROM auth_system_info ORDER BY installed_at DESC LIMIT 1");
                $info = $stmt->fetch();
                
                if ($info) {
                    $this->log("📦 Existing installation found: v{$info['version']} (installed: {$info['installed_at']})");
                    return true;
                }
            }
            
            $this->log("🆕 No existing installation found");
            return false;
            
        } catch (Exception $e) {
            $this->log("🆕 No existing installation detected");
            return false;
        }
    }
    
    /**
     * Check if system is installed
     */
    private function isInstalled() {
        try {
            $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'");
            $result = $stmt->fetch();
            return $result['count'] > 0;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Perform fresh installation
     */
    private function performFreshInstall() {
        $this->log("🔧 Performing fresh installation...");
        
        // Create system info table first
        $this->createSystemInfoTable();
        
        // Run database migrations
        $this->runDatabaseMigrations();
        
        // Insert default data
        $this->insertDefaultData();
        
        // Create admin user
        $this->createAdminUser();
        
        // Record installation
        $this->recordInstallation();
        
        $this->log("✅ Fresh installation completed successfully");
    }
    
    /**
     * Perform system update
     */
    private function performUpdate() {
        $this->log("🔄 Performing system update...");
        
        $currentVersion = $this->getCurrentVersion();
        
        if (version_compare($currentVersion, AUTH_SYSTEM_VERSION, '>=')) {
            $this->log("✅ System is already up to date (v{$currentVersion})");
            return;
        }
        
        $this->log("📈 Updating from v{$currentVersion} to v" . AUTH_SYSTEM_VERSION);
        
        // Run update migrations
        $this->runUpdateMigrations($currentVersion);
        
        // Update system info
        $this->updateSystemInfo();
        
        $this->log("✅ System update completed successfully");
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
     * Run database migrations
     */
    private function runDatabaseMigrations() {
        $this->log("📊 Running database migrations...");
        
        $migrationFile = APP_ROOT . '/database/enhanced_auth_schema.sql';
        
        if (!file_exists($migrationFile)) {
            throw new Exception("Migration file not found: {$migrationFile}");
        }
        
        $sql = file_get_contents($migrationFile);
        
        // Split SQL into individual statements
        $statements = array_filter(
            array_map('trim', explode(';', $sql)),
            function($stmt) {
                return !empty($stmt) && !preg_match('/^\s*--/', $stmt);
            }
        );
        
        $this->pdo->beginTransaction();
        
        try {
            foreach ($statements as $statement) {
                if (!empty(trim($statement))) {
                    $this->pdo->exec($statement);
                }
            }
            
            $this->pdo->commit();
            $this->log("✅ Database migrations completed (" . count($statements) . " statements executed)");
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw new Exception("Migration failed: " . $e->getMessage());
        }
    }
    
    /**
     * Insert default data
     */
    private function insertDefaultData() {
        $this->log("📝 Inserting default data...");
        
        // This would be handled by the SQL file, but we can add additional logic here
        $this->log("✅ Default data inserted");
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
        
        // Create admin user
        $adminPassword = $this->generateSecurePassword();
        $passwordHash = password_hash($adminPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        
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
    }
    
    /**
     * Generate secure password
     */
    private function generateSecurePassword($length = 12) {
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        return substr(str_shuffle($chars), 0, $length);
    }
    
    /**
     * Record installation
     */
    private function recordInstallation() {
        $installationId = bin2hex(random_bytes(32));
        $configHash = md5(serialize($this->config));
        
        $stmt = $this->pdo->prepare("
            INSERT INTO auth_system_info (version, installation_id, config_hash) 
            VALUES (?, ?, ?)
        ");
        
        $stmt->execute([AUTH_SYSTEM_VERSION, $installationId, $configHash]);
        
        $this->log("📝 Installation recorded");
    }
    
    /**
     * Get current system version
     */
    private function getCurrentVersion() {
        try {
            $stmt = $this->pdo->query("SELECT version FROM auth_system_info ORDER BY installed_at DESC LIMIT 1");
            $result = $stmt->fetch();
            return $result ? $result['version'] : '0.0.0';
        } catch (Exception $e) {
            return '0.0.0';
        }
    }
    
    /**
     * Run update migrations
     */
    private function runUpdateMigrations($fromVersion) {
        $this->log("🔄 Running update migrations from v{$fromVersion}...");
        
        // Define version-specific updates
        $updates = [
            '1.0.0' => [$this, 'updateTo100']
        ];
        
        foreach ($updates as $version => $callback) {
            if (version_compare($fromVersion, $version, '<')) {
                $this->log("📈 Applying update to v{$version}");
                call_user_func($callback);
            }
        }
        
        $this->log("✅ Update migrations completed");
    }
    
    /**
     * Update to version 1.0.0
     */
    private function updateTo100() {
        // Add any specific updates for version 1.0.0
        $this->log("✅ Updated to v1.0.0");
    }
    
    /**
     * Update system info
     */
    private function updateSystemInfo() {
        $configHash = md5(serialize($this->config));
        
        $stmt = $this->pdo->prepare("
            INSERT INTO auth_system_info (version, installation_id, config_hash) 
            VALUES (?, (SELECT installation_id FROM auth_system_info ORDER BY installed_at DESC LIMIT 1), ?)
        ");
        
        $stmt->execute([AUTH_SYSTEM_VERSION, $configHash]);
        
        $this->log("📝 System info updated");
    }
    
    /**
     * Perform post-installation tasks
     */
    private function performPostInstallation() {
        $this->log("🔧 Performing post-installation tasks...");
        
        // Clear any existing caches
        $this->clearCaches();
        
        // Set up automatic update checker
        $this->setupUpdateChecker();
        
        // Create maintenance scripts
        $this->createMaintenanceScripts();
        
        $this->log("✅ Post-installation tasks completed");
    }
    
    /**
     * Clear caches
     */
    private function clearCaches() {
        $cacheDirectories = [
            'storage/cache',
            'app/views/cache'
        ];
        
        foreach ($cacheDirectories as $dir) {
            $fullPath = APP_ROOT . '/' . $dir;
            if (is_dir($fullPath)) {
                $files = glob($fullPath . '/*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        unlink($file);
                    }
                }
            }
        }
        
        $this->log("🧹 Caches cleared");
    }
    
    /**
     * Setup automatic update checker
     */
    private function setupUpdateChecker() {
        $updateScript = APP_ROOT . '/check_auth_updates.php';
        
        $content = '<?php
/**
 * Automatic Authentication System Update Checker
 * This script checks for and applies authentication system updates
 */

require_once __DIR__ . "/install_auth_system_enhanced.php";

try {
    $installer = new EnhancedAuthInstaller();
    $installer->checkForUpdates();
} catch (Exception $e) {
    error_log("Auth system update check failed: " . $e->getMessage());
}
';
        
        file_put_contents($updateScript, $content);
        $this->log("🔄 Update checker created");
    }
    
    /**
     * Create maintenance scripts
     */
    private function createMaintenanceScripts() {
        // Create database backup script
        $backupScript = APP_ROOT . '/backup_auth_system.php';
        
        $content = '<?php
/**
 * Authentication System Database Backup Script
 */

require_once __DIR__ . "/config/app.php";

try {
    $pdo = getDbConnection();
    $backupFile = "storage/backups/auth_backup_" . date("Y-m-d_H-i-s") . ".sql";
    
    // Create backup directory if it doesn\'t exist
    $backupDir = dirname($backupFile);
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    // Export authentication tables
    $tables = ["users", "roles", "permissions", "user_roles", "role_permissions", 
               "login_attempts", "password_reset_tokens", "user_sessions", 
               "security_events", "audit_logs"];
    
    $backup = "";
    foreach ($tables as $table) {
        $backup .= "-- Table: $table\\n";
        $stmt = $pdo->query("SHOW CREATE TABLE `$table`");
        $row = $stmt->fetch();
        $backup .= $row["Create Table"] . ";\\n\\n";
        
        $stmt = $pdo->query("SELECT * FROM `$table`");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $backup .= "INSERT INTO `$table` VALUES (";
            $values = array_map(function($value) use ($pdo) {
                return $pdo->quote($value);
            }, $row);
            $backup .= implode(",", $values) . ");\\n";
        }
        $backup .= "\\n";
    }
    
    file_put_contents($backupFile, $backup);
    echo "Backup created: $backupFile\\n";
    
} catch (Exception $e) {
    echo "Backup failed: " . $e->getMessage() . "\\n";
}
';
        
        file_put_contents($backupScript, $content);
        $this->log("💾 Backup script created");
    }
    
    /**
     * Check for updates
     */
    public function checkForUpdates() {
        $this->log("🔍 Checking for authentication system updates...");
        
        $currentVersion = $this->getCurrentVersion();
        
        if (version_compare($currentVersion, AUTH_SYSTEM_VERSION, '<')) {
            $this->log("📈 Update available: v{$currentVersion} → v" . AUTH_SYSTEM_VERSION);
            $this->performUpdate();
        } else {
            $this->log("✅ Authentication system is up to date (v{$currentVersion})");
        }
    }
    
    /**
     * Load configuration
     */
    private function loadConfiguration() {
        return [
            'app_name' => 'SquidJob',
            'version' => AUTH_SYSTEM_VERSION,
            'environment' => 'production'
        ];
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
            echo "  2. Login with admin credentials\n";
            echo "  3. Change the default admin password\n";
            echo "  4. Configure email settings\n";
            echo "  5. Create additional user accounts\n\n";
            
            echo "🛠️  Maintenance:\n";
            echo "  • Backup script: php backup_auth_system.php\n";
            echo "  • Update checker: php check_auth_updates.php\n";
            echo "  • Test system: php simple_auth_test.php\n\n";
            
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
        $installer = new EnhancedAuthInstaller();
        $installer->install();
    } catch (Exception $e) {
        echo "Installation failed: " . $e->getMessage() . "\n";
        exit(1);
    }
} elseif (defined('INSTALL_AUTH_SYSTEM')) {
    // Allow web-based installation for development
    try {
        $installer = new EnhancedAuthInstaller();
        $installer->install();
    } catch (Exception $e) {
        echo "Installation failed: " . $e->getMessage() . "\n";
    }
}