<?php
/**
 * SquidJob Authentication System Monitor
 * 
 * This script provides continuous monitoring and automatic updates
 * for the authentication system. It can be run as a background service
 * or scheduled via cron to ensure the system stays updated.
 */

// Prevent direct web access
if (php_sapi_name() !== 'cli' && !defined('AUTH_MONITOR_ENABLED')) {
    die('This script can only be run from command line or as a scheduled task.');
}

// Define constants
define('APP_ROOT', __DIR__);
define('MONITOR_VERSION', '1.0.0');
define('CHECK_INTERVAL', 3600); // 1 hour in seconds

// Include required files
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/install_auth_system_enhanced.php';

class AuthSystemMonitor {
    
    private $pdo;
    private $config;
    private $logFile;
    private $lockFile;
    
    public function __construct() {
        $this->config = $this->loadConfiguration();
        $this->logFile = APP_ROOT . '/storage/logs/auth_monitor.log';
        $this->lockFile = APP_ROOT . '/storage/cache/auth_monitor.lock';
        
        // Ensure log directory exists
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $this->log("🔍 Authentication System Monitor v" . MONITOR_VERSION . " started");
    }
    
    /**
     * Start monitoring
     */
    public function startMonitoring($daemon = false) {
        if ($this->isAlreadyRunning()) {
            $this->log("⚠️  Monitor is already running");
            return;
        }
        
        $this->createLockFile();
        
        try {
            if ($daemon) {
                $this->runAsDaemon();
            } else {
                $this->runOnce();
            }
        } finally {
            $this->removeLockFile();
        }
    }
    
    /**
     * Run as daemon (continuous monitoring)
     */
    private function runAsDaemon() {
        $this->log("🚀 Starting daemon mode (check interval: " . CHECK_INTERVAL . " seconds)");
        
        while (true) {
            try {
                $this->performChecks();
                sleep(CHECK_INTERVAL);
            } catch (Exception $e) {
                $this->log("❌ Error in daemon loop: " . $e->getMessage());
                sleep(60); // Wait 1 minute before retrying
            }
        }
    }
    
    /**
     * Run once (single check)
     */
    private function runOnce() {
        $this->log("🔄 Performing single system check");
        $this->performChecks();
    }
    
    /**
     * Perform all system checks
     */
    private function performChecks() {
        $this->log("🔍 Starting system checks at " . date('Y-m-d H:i:s'));
        
        try {
            // Establish database connection
            $this->connectToDatabase();
            
            // Check system health
            $this->checkSystemHealth();
            
            // Check for updates
            $this->checkForUpdates();
            
            // Check database integrity
            $this->checkDatabaseIntegrity();
            
            // Check security status
            $this->checkSecurityStatus();
            
            // Cleanup old data
            $this->performMaintenance();
            
            $this->log("✅ System checks completed successfully");
            
        } catch (Exception $e) {
            $this->log("❌ System check failed: " . $e->getMessage());
            $this->handleError($e);
        }
    }
    
    /**
     * Connect to database
     */
    private function connectToDatabase() {
        try {
            $this->pdo = getDbConnection();
            $this->log("✅ Database connection established");
        } catch (Exception $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    /**
     * Check system health
     */
    private function checkSystemHealth() {
        $this->log("🏥 Checking system health...");
        
        // Check critical tables
        $criticalTables = ['users', 'roles', 'permissions', 'user_roles', 'role_permissions'];
        
        foreach ($criticalTables as $table) {
            $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = '{$table}'");
            $result = $stmt->fetch();
            
            if ($result['count'] == 0) {
                throw new Exception("Critical table missing: {$table}");
            }
        }
        
        // Check admin user exists
        $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM users WHERE email = 'admin@squidjob.com'");
        $result = $stmt->fetch();
        
        if ($result['count'] == 0) {
            $this->log("⚠️  Admin user not found, creating...");
            $this->createEmergencyAdmin();
        }
        
        // Check session cleanup
        $this->cleanupExpiredSessions();
        
        $this->log("✅ System health check passed");
    }
    
    /**
     * Check for updates
     */
    private function checkForUpdates() {
        $this->log("🔄 Checking for authentication system updates...");
        
        try {
            $currentVersion = $this->getCurrentVersion();
            $latestVersion = AUTH_SYSTEM_VERSION;
            
            if (version_compare($currentVersion, $latestVersion, '<')) {
                $this->log("📈 Update available: v{$currentVersion} → v{$latestVersion}");
                $this->performAutomaticUpdate();
            } else {
                $this->log("✅ System is up to date (v{$currentVersion})");
            }
            
        } catch (Exception $e) {
            $this->log("⚠️  Update check failed: " . $e->getMessage());
        }
    }
    
    /**
     * Perform automatic update
     */
    private function performAutomaticUpdate() {
        $this->log("🔧 Performing automatic update...");
        
        try {
            // Create backup before update
            $this->createBackup();
            
            // Run update installer
            $installer = new EnhancedAuthInstaller();
            $installer->checkForUpdates();
            
            $this->log("✅ Automatic update completed successfully");
            
        } catch (Exception $e) {
            $this->log("❌ Automatic update failed: " . $e->getMessage());
            $this->restoreBackup();
        }
    }
    
    /**
     * Check database integrity
     */
    private function checkDatabaseIntegrity() {
        $this->log("🔍 Checking database integrity...");
        
        // Check for orphaned records
        $this->checkOrphanedRecords();
        
        // Check for data consistency
        $this->checkDataConsistency();
        
        // Check indexes
        $this->checkIndexes();
        
        $this->log("✅ Database integrity check passed");
    }
    
    /**
     * Check for orphaned records
     */
    private function checkOrphanedRecords() {
        // Check for user_roles without valid users
        $stmt = $this->pdo->query("
            SELECT COUNT(*) as count 
            FROM user_roles ur 
            LEFT JOIN users u ON ur.user_id = u.id 
            WHERE u.id IS NULL
        ");
        $orphanedUserRoles = $stmt->fetch()['count'];
        
        if ($orphanedUserRoles > 0) {
            $this->log("⚠️  Found {$orphanedUserRoles} orphaned user_roles records");
            $this->pdo->exec("DELETE ur FROM user_roles ur LEFT JOIN users u ON ur.user_id = u.id WHERE u.id IS NULL");
            $this->log("🧹 Cleaned up orphaned user_roles records");
        }
        
        // Check for role_permissions without valid roles
        $stmt = $this->pdo->query("
            SELECT COUNT(*) as count 
            FROM role_permissions rp 
            LEFT JOIN roles r ON rp.role_id = r.id 
            WHERE r.id IS NULL
        ");
        $orphanedRolePermissions = $stmt->fetch()['count'];
        
        if ($orphanedRolePermissions > 0) {
            $this->log("⚠️  Found {$orphanedRolePermissions} orphaned role_permissions records");
            $this->pdo->exec("DELETE rp FROM role_permissions rp LEFT JOIN roles r ON rp.role_id = r.id WHERE r.id IS NULL");
            $this->log("🧹 Cleaned up orphaned role_permissions records");
        }
    }
    
    /**
     * Check data consistency
     */
    private function checkDataConsistency() {
        // Check for users without roles
        $stmt = $this->pdo->query("
            SELECT COUNT(*) as count 
            FROM users u 
            LEFT JOIN user_roles ur ON u.id = ur.user_id 
            WHERE ur.user_id IS NULL AND u.status = 'active'
        ");
        $usersWithoutRoles = $stmt->fetch()['count'];
        
        if ($usersWithoutRoles > 0) {
            $this->log("⚠️  Found {$usersWithoutRoles} active users without roles");
            
            // Assign default user role
            $stmt = $this->pdo->query("SELECT id FROM roles WHERE name = 'user' LIMIT 1");
            $userRole = $stmt->fetch();
            
            if ($userRole) {
                $this->pdo->exec("
                    INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
                    SELECT u.id, {$userRole['id']}, 1, NOW()
                    FROM users u 
                    LEFT JOIN user_roles ur ON u.id = ur.user_id 
                    WHERE ur.user_id IS NULL AND u.status = 'active'
                ");
                $this->log("🔧 Assigned default roles to users without roles");
            }
        }
    }
    
    /**
     * Check indexes
     */
    private function checkIndexes() {
        $requiredIndexes = [
            'users' => ['email', 'status'],
            'user_sessions' => ['user_id', 'expires_at'],
            'login_attempts' => ['ip_address', 'attempted_at'],
            'audit_logs' => ['user_id', 'created_at'],
            'security_events' => ['user_id', 'created_at']
        ];
        
        foreach ($requiredIndexes as $table => $columns) {
            foreach ($columns as $column) {
                $stmt = $this->pdo->query("
                    SELECT COUNT(*) as count 
                    FROM information_schema.statistics 
                    WHERE table_schema = DATABASE() 
                    AND table_name = '{$table}' 
                    AND column_name = '{$column}'
                ");
                $indexExists = $stmt->fetch()['count'] > 0;
                
                if (!$indexExists) {
                    $this->log("⚠️  Missing index on {$table}.{$column}");
                    try {
                        $this->pdo->exec("CREATE INDEX idx_{$table}_{$column} ON {$table} ({$column})");
                        $this->log("🔧 Created index on {$table}.{$column}");
                    } catch (Exception $e) {
                        $this->log("❌ Failed to create index on {$table}.{$column}: " . $e->getMessage());
                    }
                }
            }
        }
    }
    
    /**
     * Check security status
     */
    private function checkSecurityStatus() {
        $this->log("🔒 Checking security status...");
        
        // Check for suspicious login attempts
        $stmt = $this->pdo->query("
            SELECT ip_address, COUNT(*) as attempts 
            FROM login_attempts 
            WHERE attempted_at > DATE_SUB(NOW(), INTERVAL 1 HOUR) 
            AND success = 0 
            GROUP BY ip_address 
            HAVING attempts > 10
        ");
        
        $suspiciousIPs = $stmt->fetchAll();
        
        foreach ($suspiciousIPs as $ip) {
            $this->log("⚠️  Suspicious activity from IP: {$ip['ip_address']} ({$ip['attempts']} failed attempts)");
            
            // Add to blacklist if not already there
            $stmt = $this->pdo->prepare("
                INSERT IGNORE INTO ip_blacklist (ip_address, reason, created_at) 
                VALUES (?, 'Automated: Excessive failed login attempts', NOW())
            ");
            $stmt->execute([$ip['ip_address']]);
        }
        
        // Check for old password reset tokens
        $stmt = $this->pdo->query("
            SELECT COUNT(*) as count 
            FROM password_reset_tokens 
            WHERE expires_at < NOW() AND used = 0
        ");
        $expiredTokens = $stmt->fetch()['count'];
        
        if ($expiredTokens > 0) {
            $this->pdo->exec("DELETE FROM password_reset_tokens WHERE expires_at < NOW()");
            $this->log("🧹 Cleaned up {$expiredTokens} expired password reset tokens");
        }
        
        $this->log("✅ Security status check completed");
    }
    
    /**
     * Perform maintenance tasks
     */
    private function performMaintenance() {
        $this->log("🧹 Performing maintenance tasks...");
        
        // Clean up old audit logs (keep last 90 days)
        $stmt = $this->pdo->exec("
            DELETE FROM audit_logs 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)
        ");
        if ($stmt > 0) {
            $this->log("🧹 Cleaned up {$stmt} old audit log entries");
        }
        
        // Clean up old security events (keep last 30 days)
        $stmt = $this->pdo->exec("
            DELETE FROM security_events 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
        ");
        if ($stmt > 0) {
            $this->log("🧹 Cleaned up {$stmt} old security event entries");
        }
        
        // Clean up old login attempts (keep last 7 days)
        $stmt = $this->pdo->exec("
            DELETE FROM login_attempts 
            WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
        ");
        if ($stmt > 0) {
            $this->log("🧹 Cleaned up {$stmt} old login attempt entries");
        }
        
        $this->log("✅ Maintenance tasks completed");
    }
    
    /**
     * Cleanup expired sessions
     */
    private function cleanupExpiredSessions() {
        $stmt = $this->pdo->exec("DELETE FROM user_sessions WHERE expires_at < NOW()");
        if ($stmt > 0) {
            $this->log("🧹 Cleaned up {$stmt} expired sessions");
        }
    }
    
    /**
     * Create emergency admin user
     */
    private function createEmergencyAdmin() {
        try {
            $adminPassword = bin2hex(random_bytes(8));
            $passwordHash = password_hash($adminPassword, PASSWORD_BCRYPT, ['cost' => 12]);
            
            // Get admin role
            $stmt = $this->pdo->query("SELECT id FROM roles WHERE name = 'admin' LIMIT 1");
            $adminRole = $stmt->fetch();
            
            if (!$adminRole) {
                throw new Exception("Admin role not found");
            }
            
            // Create admin user
            $stmt = $this->pdo->prepare("
                INSERT INTO users (first_name, last_name, email, password_hash, status, email_verified, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                'Emergency',
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
            
            $this->log("🚨 Emergency admin user created");
            $this->log("📧 Email: admin@squidjob.com");
            $this->log("🔑 Password: {$adminPassword}");
            
            // Log security event
            $stmt = $this->pdo->prepare("
                INSERT INTO security_events (event_type, user_id, ip_address, severity, description, created_at) 
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                'emergency_admin_created',
                $adminUserId,
                '127.0.0.1',
                'high',
                'Emergency admin user created by system monitor',
            ]);
            
        } catch (Exception $e) {
            throw new Exception("Failed to create emergency admin: " . $e->getMessage());
        }
    }
    
    /**
     * Create system backup
     */
    private function createBackup() {
        $backupDir = APP_ROOT . '/storage/backups';
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }
        
        $backupFile = $backupDir . '/auth_backup_' . date('Y-m-d_H-i-s') . '.sql';
        
        // Simple backup of critical tables
        $tables = ['users', 'roles', 'permissions', 'user_roles', 'role_permissions', 'auth_system_info'];
        
        $backup = "-- SquidJob Authentication System Backup\n";
        $backup .= "-- Created: " . date('Y-m-d H:i:s') . "\n\n";
        
        foreach ($tables as $table) {
            try {
                $stmt = $this->pdo->query("SELECT * FROM `{$table}`");
                $backup .= "-- Table: {$table}\n";
                $backup .= "DELETE FROM `{$table}`;\n";
                
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $values = array_map(function($value) {
                        return $value === null ? 'NULL' : "'" . addslashes($value) . "'";
                    }, $row);
                    
                    $backup .= "INSERT INTO `{$table}` VALUES (" . implode(', ', $values) . ");\n";
                }
                $backup .= "\n";
                
            } catch (Exception $e) {
                $this->log("⚠️  Failed to backup table {$table}: " . $e->getMessage());
            }
        }
        
        file_put_contents($backupFile, $backup);
        $this->log("💾 Backup created: " . basename($backupFile));
    }
    
    /**
     * Restore from backup (placeholder)
     */
    private function restoreBackup() {
        $this->log("🔄 Backup restore functionality would be implemented here");
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
     * Handle errors
     */
    private function handleError($exception) {
        // Log to security events if database is available
        if ($this->pdo) {
            try {
                $stmt = $this->pdo->prepare("
                    INSERT INTO security_events (event_type, ip_address, severity, description, created_at) 
                    VALUES (?, ?, ?, ?, NOW())
                ");
                $stmt->execute([
                    'monitor_error',
                    '127.0.0.1',
                    'high',
                    'Auth monitor error: ' . $exception->getMessage()
                ]);
            } catch (Exception $e) {
                // Ignore database errors when logging
            }
        }
    }
    
    /**
     * Check if monitor is already running
     */
    private function isAlreadyRunning() {
        if (!file_exists($this->lockFile)) {
            return false;
        }
        
        $pid = file_get_contents($this->lockFile);
        
        // Check if process is still running (Unix/Linux only)
        if (function_exists('posix_kill')) {
            return posix_kill($pid, 0);
        }
        
        // For Windows or when posix functions are not available
        return true;
    }
    
    /**
     * Create lock file
     */
    private function createLockFile() {
        $lockDir = dirname($this->lockFile);
        if (!is_dir($lockDir)) {
            mkdir($lockDir, 0755, true);
        }
        
        file_put_contents($this->lockFile, getmypid());
    }
    
    /**
     * Remove lock file
     */
    private function removeLockFile() {
        if (file_exists($this->lockFile)) {
            unlink($this->lockFile);
        }
    }
    
    /**
     * Load configuration
     */
    private function loadConfiguration() {
        return [
            'monitor_enabled' => true,
            'auto_update' => true,
            'backup_enabled' => true,
            'cleanup_enabled' => true
        ];
    }
    
    /**
     * Log message
     */
    private function log($message) {
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] {$message}";
        
        // Write to log file
        file_put_contents($this->logFile, $logEntry . "\n", FILE_APPEND | LOCK_EX);
        
        // Output to console if running in CLI
        if (php_sapi_name() === 'cli') {
            echo $logEntry . "\n";
        }
    }
}

// Command line interface
if (php_sapi_name() === 'cli') {
    $command = $argv[1] ?? 'once';
    
    try {
        $monitor = new AuthSystemMonitor();
        
        switch ($command) {
            case 'daemon':
                $monitor->startMonitoring(true);
                break;
            case 'once':
            default:
                $monitor->startMonitoring(false);
                break;
        }
        
    } catch (Exception $e) {
        echo "Monitor failed: " . $e->getMessage() . "\n";
        exit(1);
    }
}