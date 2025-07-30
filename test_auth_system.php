<?php
/**
 * SquidJob Authentication System Test Script
 * 
 * This script tests all major components of the authentication system
 * to ensure everything is working correctly after installation.
 */

// Prevent direct web access
if (php_sapi_name() !== 'cli' && !defined('TEST_AUTH_SYSTEM')) {
    die('This script can only be run from command line or during testing.');
}

// Define constants
define('APP_ROOT', __DIR__);

// Include required files
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/app/helpers/auth_helpers.php';
require_once __DIR__ . '/app/models/BaseModel.php';
require_once __DIR__ . '/app/models/User.php';
require_once __DIR__ . '/app/models/Role.php';
require_once __DIR__ . '/app/models/Permission.php';

class AuthSystemTester {
    
    private $pdo;
    private $userModel;
    private $roleModel;
    private $permissionModel;
    private $testResults = [];
    private $testUser = null;
    
    public function __construct() {
        try {
            $this->pdo = getDbConnection();
            $this->userModel = new \App\Models\User();
            $this->roleModel = new \App\Models\Role();
            $this->permissionModel = new \App\Models\Permission();
            $this->log("✅ Database connection established");
        } catch (Exception $e) {
            $this->log("❌ Database connection failed: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Run all authentication system tests
     */
    public function runAllTests() {
        echo "=== SquidJob Authentication System Tests ===\n\n";
        
        try {
            // Database Tests
            $this->testDatabaseSchema();
            $this->testDefaultData();
            
            // Authentication Tests
            $this->testPasswordHashing();
            $this->testUserCreation();
            $this->testUserAuthentication();
            $this->testSessionManagement();
            
            // RBAC Tests
            $this->testRoleAssignment();
            $this->testPermissionChecks();
            
            // Security Tests
            $this->testCSRFProtection();
            $this->testRateLimiting();
            $this->testSecurityLogging();
            
            // Helper Function Tests
            $this->testHelperFunctions();
            
            // Cleanup
            $this->cleanup();
            
            // Display results
            $this->displayResults();
            
        } catch (Exception $e) {
            $this->log("❌ Test execution failed: " . $e->getMessage());
            $this->displayResults();
            throw $e;
        }
    }
    
    /**
     * Test database schema
     */
    private function testDatabaseSchema() {
        echo "Testing database schema...\n";
        
        $requiredTables = [
            'users', 'roles', 'permissions', 'user_roles', 'role_permissions',
            'login_attempts', 'password_reset_tokens', 'email_verification_tokens',
            'user_sessions', 'user_devices', 'security_events', 'security_settings',
            'audit_logs', 'ip_whitelist', 'ip_blacklist', 'two_factor_auth'
        ];
        
        foreach ($requiredTables as $table) {
            try {
                $stmt = $this->pdo->query("DESCRIBE {$table}");
                if ($stmt) {
                    $this->log("✅ Table '{$table}' exists");
                } else {
                    $this->log("❌ Table '{$table}' missing");
                }
            } catch (Exception $e) {
                $this->log("❌ Table '{$table}' error: " . $e->getMessage());
            }
        }
    }
    
    /**
     * Test default data insertion
     */
    private function testDefaultData() {
        echo "Testing default data...\n";
        
        // Test roles
        $roles = $this->roleModel->getActiveRoles();
        if (count($roles) >= 5) {
            $this->log("✅ Default roles created (" . count($roles) . " roles)");
        } else {
            $this->log("❌ Missing default roles");
        }
        
        // Test permissions
        $permissions = $this->permissionModel->getActivePermissions();
        if (count($permissions) >= 20) {
            $this->log("✅ Default permissions created (" . count($permissions) . " permissions)");
        } else {
            $this->log("❌ Missing default permissions");
        }
        
        // Test admin user
        $admin = $this->userModel->findByEmail('admin@squidjob.com');
        if ($admin) {
            $this->log("✅ Admin user exists");
        } else {
            $this->log("❌ Admin user missing");
        }
    }
    
    /**
     * Test password hashing
     */
    private function testPasswordHashing() {
        echo "Testing password hashing...\n";
        
        $password = 'TestPassword123!';
        $hash = hashPassword($password);
        
        if (password_verify($password, $hash)) {
            $this->log("✅ Password hashing works correctly");
        } else {
            $this->log("❌ Password hashing failed");
        }
        
        if (verifyPassword($password, $hash)) {
            $this->log("✅ Password verification works correctly");
        } else {
            $this->log("❌ Password verification failed");
        }
    }
    
    /**
     * Test user creation
     */
    private function testUserCreation() {
        echo "Testing user creation...\n";
        
        $userData = [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@squidjob.com',
            'password_hash' => hashPassword('TestPassword123!'),
            'status' => 'active',
            'email_verified' => 1
        ];
        
        try {
            $this->testUser = $this->userModel->create($userData);
            if ($this->testUser) {
                $this->log("✅ User creation successful");
            } else {
                $this->log("❌ User creation failed");
            }
        } catch (Exception $e) {
            $this->log("❌ User creation error: " . $e->getMessage());
        }
    }
    
    /**
     * Test user authentication
     */
    private function testUserAuthentication() {
        echo "Testing user authentication...\n";
        
        if (!$this->testUser) {
            $this->log("❌ No test user available for authentication test");
            return;
        }
        
        // Test valid credentials
        $user = $this->userModel->findByEmail('test@squidjob.com');
        if ($user && verifyPassword('TestPassword123!', $user['password_hash'])) {
            $this->log("✅ User authentication with valid credentials works");
        } else {
            $this->log("❌ User authentication with valid credentials failed");
        }
        
        // Test invalid credentials
        if (!verifyPassword('WrongPassword', $user['password_hash'])) {
            $this->log("✅ User authentication rejects invalid credentials");
        } else {
            $this->log("❌ User authentication accepts invalid credentials");
        }
    }
    
    /**
     * Test session management
     */
    private function testSessionManagement() {
        echo "Testing session management...\n";
        
        // Start session for testing
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Test CSRF token generation
        $token = csrfToken();
        if (!empty($token) && strlen($token) === 64) {
            $this->log("✅ CSRF token generation works");
        } else {
            $this->log("❌ CSRF token generation failed");
        }
        
        // Test CSRF token verification
        if (verifyCsrf($token)) {
            $this->log("✅ CSRF token verification works");
        } else {
            $this->log("❌ CSRF token verification failed");
        }
        
        // Test invalid CSRF token
        if (!verifyCsrf('invalid_token')) {
            $this->log("✅ CSRF token rejects invalid tokens");
        } else {
            $this->log("❌ CSRF token accepts invalid tokens");
        }
    }
    
    /**
     * Test role assignment
     */
    private function testRoleAssignment() {
        echo "Testing role assignment...\n";
        
        if (!$this->testUser) {
            $this->log("❌ No test user available for role assignment test");
            return;
        }
        
        // Get user role (should be default)
        $userRole = $this->roleModel->findByName('user');
        if (!$userRole) {
            $this->log("❌ Default user role not found");
            return;
        }
        
        // Assign role to test user
        $assigned = $this->userModel->assignRole($this->testUser['id'], $userRole['id'], 1);
        if ($assigned) {
            $this->log("✅ Role assignment successful");
        } else {
            $this->log("❌ Role assignment failed");
        }
        
        // Test role check
        $hasRole = $this->userModel->hasRole($this->testUser['id'], 'user');
        if ($hasRole) {
            $this->log("✅ Role checking works correctly");
        } else {
            $this->log("❌ Role checking failed");
        }
    }
    
    /**
     * Test permission checks
     */
    private function testPermissionChecks() {
        echo "Testing permission checks...\n";
        
        if (!$this->testUser) {
            $this->log("❌ No test user available for permission test");
            return;
        }
        
        // Test permission that user should have
        $hasPermission = $this->userModel->hasPermission($this->testUser['id'], 'view_tenders');
        if ($hasPermission) {
            $this->log("✅ Permission checking works for granted permissions");
        } else {
            $this->log("❌ Permission checking failed for granted permissions");
        }
        
        // Test permission that user should not have
        $hasAdminPermission = $this->userModel->hasPermission($this->testUser['id'], 'system_config');
        if (!$hasAdminPermission) {
            $this->log("✅ Permission checking works for denied permissions");
        } else {
            $this->log("❌ Permission checking failed for denied permissions");
        }
    }
    
    /**
     * Test CSRF protection
     */
    private function testCSRFProtection() {
        echo "Testing CSRF protection...\n";
        
        // Test CSRF field generation
        $csrfField = csrfField();
        if (strpos($csrfField, 'name="_token"') !== false) {
            $this->log("✅ CSRF field generation works");
        } else {
            $this->log("❌ CSRF field generation failed");
        }
    }
    
    /**
     * Test rate limiting
     */
    private function testRateLimiting() {
        echo "Testing rate limiting...\n";
        
        // Start session for rate limiting
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Test rate limiting allows initial requests
        $allowed = rateLimit('test_action', 2, 60);
        if ($allowed) {
            $this->log("✅ Rate limiting allows initial requests");
        } else {
            $this->log("❌ Rate limiting blocks initial requests");
        }
        
        // Test rate limiting blocks after limit
        rateLimit('test_action', 2, 60); // Second request
        $blocked = !rateLimit('test_action', 2, 60); // Third request should be blocked
        if ($blocked) {
            $this->log("✅ Rate limiting blocks requests after limit");
        } else {
            $this->log("❌ Rate limiting fails to block requests after limit");
        }
    }
    
    /**
     * Test security logging
     */
    private function testSecurityLogging() {
        echo "Testing security logging...\n";
        
        try {
            // Test audit log insertion
            $stmt = $this->pdo->prepare("
                INSERT INTO audit_logs (table_name, record_id, action, user_id, ip_address, created_at) 
                VALUES ('test_table', 1, 'TEST_ACTION', 1, '127.0.0.1', NOW())
            ");
            
            if ($stmt->execute()) {
                $this->log("✅ Audit logging works");
            } else {
                $this->log("❌ Audit logging failed");
            }
            
            // Test security event logging
            $stmt = $this->pdo->prepare("
                INSERT INTO security_events (event_type, user_id, ip_address, severity, created_at) 
                VALUES ('TEST_EVENT', 1, '127.0.0.1', 'low', NOW())
            ");
            
            if ($stmt->execute()) {
                $this->log("✅ Security event logging works");
            } else {
                $this->log("❌ Security event logging failed");
            }
            
        } catch (Exception $e) {
            $this->log("❌ Security logging error: " . $e->getMessage());
        }
    }
    
    /**
     * Test helper functions
     */
    private function testHelperFunctions() {
        echo "Testing helper functions...\n";
        
        // Test sanitization
        $dirty = '<script>alert("xss")</script>';
        $clean = sanitize($dirty);
        if ($clean !== $dirty && strpos($clean, '<script>') === false) {
            $this->log("✅ Input sanitization works");
        } else {
            $this->log("❌ Input sanitization failed");
        }
        
        // Test validation
        $data = ['email' => 'invalid-email', 'name' => ''];
        $rules = ['email' => 'required|email', 'name' => 'required'];
        $errors = validate($data, $rules);
        
        if (!empty($errors) && isset($errors['email']) && isset($errors['name'])) {
            $this->log("✅ Input validation works");
        } else {
            $this->log("❌ Input validation failed");
        }
        
        // Test password strength checker
        $strength = checkPasswordStrength('weak');
        if ($strength['strength'] === 'weak') {
            $this->log("✅ Password strength checker works");
        } else {
            $this->log("❌ Password strength checker failed");
        }
    }
    
    /**
     * Cleanup test data
     */
    private function cleanup() {
        echo "Cleaning up test data...\n";
        
        try {
            // Remove test user
            if ($this->testUser) {
                $this->userModel->delete($this->testUser['id']);
                $this->log("✅ Test user cleaned up");
            }
            
            // Remove test audit logs
            $this->pdo->exec("DELETE FROM audit_logs WHERE table_name = 'test_table'");
            $this->pdo->exec("DELETE FROM security_events WHERE event_type = 'TEST_EVENT'");
            $this->log("✅ Test logs cleaned up");
            
        } catch (Exception $e) {
            $this->log("❌ Cleanup error: " . $e->getMessage());
        }
    }
    
    /**
     * Log test result
     */
    private function log($message) {
        $this->testResults[] = $message;
        echo "  {$message}\n";
    }
    
    /**
     * Display test results summary
     */
    private function displayResults() {
        echo "\n=== Test Results Summary ===\n\n";
        
        $passed = 0;
        $failed = 0;
        
        foreach ($this->testResults as $result) {
            if (strpos($result, '✅') !== false) {
                $passed++;
            } elseif (strpos($result, '❌') !== false) {
                $failed++;
            }
        }
        
        $total = $passed + $failed;
        $passRate = $total > 0 ? round(($passed / $total) * 100, 1) : 0;
        
        echo "Total Tests: {$total}\n";
        echo "Passed: {$passed}\n";
        echo "Failed: {$failed}\n";
        echo "Pass Rate: {$passRate}%\n\n";
        
        if ($failed === 0) {
            echo "🎉 All tests passed! Authentication system is working correctly.\n\n";
            echo "System Status: ✅ READY FOR PRODUCTION\n\n";
            echo "Next Steps:\n";
            echo "1. Configure production environment settings\n";
            echo "2. Set up SSL/HTTPS for secure authentication\n";
            echo "3. Configure email service for notifications\n";
            echo "4. Review and adjust security settings\n";
            echo "5. Create additional user accounts\n";
            echo "6. Set up monitoring and alerting\n\n";
        } else {
            echo "❌ Some tests failed. Please review and fix the issues above.\n\n";
            echo "System Status: ⚠️  NEEDS ATTENTION\n\n";
        }
        
        echo "Detailed Results:\n";
        foreach ($this->testResults as $result) {
            echo "  {$result}\n";
        }
        echo "\n";
    }
}

// Run tests if called directly
if (php_sapi_name() === 'cli') {
    try {
        $tester = new AuthSystemTester();
        $tester->runAllTests();
    } catch (Exception $e) {
        echo "Test execution failed: " . $e->getMessage() . "\n";
        exit(1);
    }
}