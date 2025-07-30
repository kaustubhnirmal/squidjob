<?php
/**
 * Authentication System Test Suite
 * SquidJob Tender Management System
 * 
 * Comprehensive tests for the authentication system functionality
 */

// Include the application bootstrap
require_once __DIR__ . '/../index.php';

class AuthenticationTest {
    
    private $testResults = [];
    private $userModel;
    private $emailService;
    
    public function __construct() {
        $this->userModel = new App\Models\User();
        $this->emailService = new App\Services\EmailService();
    }
    
    /**
     * Run all authentication tests
     */
    public function runAllTests() {
        echo "🧪 Starting SquidJob Authentication System Tests\n";
        echo "=" . str_repeat("=", 50) . "\n\n";
        
        // Database tests
        $this->testDatabaseTables();
        $this->testSecuritySettings();
        
        // Model tests
        $this->testUserModel();
        $this->testPasswordHashing();
        
        // Security tests
        $this->testCSRFProtection();
        $this->testRateLimiting();
        $this->testSessionSecurity();
        
        // Email tests
        $this->testEmailService();
        
        // UI tests
        $this->testAuthenticationViews();
        
        // Integration tests
        $this->testLoginFlow();
        $this->testPasswordResetFlow();
        
        $this->displayResults();
    }
    
    /**
     * Test database tables exist and have correct structure
     */
    private function testDatabaseTables() {
        echo "📊 Testing Database Tables...\n";
        
        $requiredTables = [
            'users',
            'login_attempts',
            'user_sessions',
            'password_history',
            'security_events',
            'trusted_devices',
            'email_verification_tokens',
            'security_settings'
        ];
        
        try {
            $pdo = getDbConnection();
            
            foreach ($requiredTables as $table) {
                $stmt = $pdo->query("SHOW TABLES LIKE '{$table}'");
                if ($stmt->rowCount() > 0) {
                    $this->addResult("✅ Table '{$table}' exists", true);
                } else {
                    $this->addResult("❌ Table '{$table}' missing", false);
                }
            }
            
            // Test enhanced users table columns
            $stmt = $pdo->query("DESCRIBE users");
            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $requiredColumns = [
                'two_factor_enabled',
                'login_attempts',
                'locked_until',
                'password_expires_at'
            ];
            
            foreach ($requiredColumns as $column) {
                if (in_array($column, $columns)) {
                    $this->addResult("✅ Users table has '{$column}' column", true);
                } else {
                    $this->addResult("❌ Users table missing '{$column}' column", false);
                }
            }
            
        } catch (Exception $e) {
            $this->addResult("❌ Database connection failed: " . $e->getMessage(), false);
        }
    }
    
    /**
     * Test security settings are properly configured
     */
    private function testSecuritySettings() {
        echo "🔒 Testing Security Settings...\n";
        
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->query("SELECT COUNT(*) FROM security_settings");
            $count = $stmt->fetchColumn();
            
            if ($count > 0) {
                $this->addResult("✅ Security settings table populated", true);
                
                // Test specific settings
                $requiredSettings = [
                    'max_login_attempts',
                    'lockout_duration',
                    'password_min_length',
                    'session_timeout'
                ];
                
                foreach ($requiredSettings as $setting) {
                    $stmt = $pdo->prepare("SELECT setting_value FROM security_settings WHERE setting_key = ?");
                    $stmt->execute([$setting]);
                    $value = $stmt->fetchColumn();
                    
                    if ($value !== false) {
                        $this->addResult("✅ Setting '{$setting}' configured: {$value}", true);
                    } else {
                        $this->addResult("❌ Setting '{$setting}' missing", false);
                    }
                }
            } else {
                $this->addResult("❌ Security settings table empty", false);
            }
            
        } catch (Exception $e) {
            $this->addResult("❌ Security settings test failed: " . $e->getMessage(), false);
        }
    }
    
    /**
     * Test User model functionality
     */
    private function testUserModel() {
        echo "👤 Testing User Model...\n";
        
        try {
            // Test model instantiation
            $user = new App\Models\User();
            $this->addResult("✅ User model instantiated", true);
            
            // Test database connection
            if ($user->getTable() === 'users') {
                $this->addResult("✅ User model table configured", true);
            } else {
                $this->addResult("❌ User model table misconfigured", false);
            }
            
            // Test methods exist
            $requiredMethods = [
                'findByEmail',
                'createUser',
                'updatePassword',
                'verifyPassword',
                'hasPermission',
                'hasRole'
            ];
            
            foreach ($requiredMethods as $method) {
                if (method_exists($user, $method)) {
                    $this->addResult("✅ User model has '{$method}' method", true);
                } else {
                    $this->addResult("❌ User model missing '{$method}' method", false);
                }
            }
            
        } catch (Exception $e) {
            $this->addResult("❌ User model test failed: " . $e->getMessage(), false);
        }
    }
    
    /**
     * Test password hashing functionality
     */
    private function testPasswordHashing() {
        echo "🔐 Testing Password Hashing...\n";
        
        try {
            $password = 'TestPassword123!';
            
            // Test hashing
            $hash = hashPassword($password);
            if ($hash && strlen($hash) > 50) {
                $this->addResult("✅ Password hashing works", true);
            } else {
                $this->addResult("❌ Password hashing failed", false);
            }
            
            // Test verification
            if (verifyPassword($password, $hash)) {
                $this->addResult("✅ Password verification works", true);
            } else {
                $this->addResult("❌ Password verification failed", false);
            }
            
            // Test wrong password
            if (!verifyPassword('WrongPassword', $hash)) {
                $this->addResult("✅ Password verification rejects wrong password", true);
            } else {
                $this->addResult("❌ Password verification accepts wrong password", false);
            }
            
        } catch (Exception $e) {
            $this->addResult("❌ Password hashing test failed: " . $e->getMessage(), false);
        }
    }
    
    /**
     * Test CSRF protection
     */
    private function testCSRFProtection() {
        echo "🛡️ Testing CSRF Protection...\n";
        
        try {
            // Start session for CSRF
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            // Test token generation
            $token = csrfToken();
            if ($token && strlen($token) === 64) {
                $this->addResult("✅ CSRF token generation works", true);
            } else {
                $this->addResult("❌ CSRF token generation failed", false);
            }
            
            // Test token verification
            if (verifyCsrf($token)) {
                $this->addResult("✅ CSRF token verification works", true);
            } else {
                $this->addResult("❌ CSRF token verification failed", false);
            }
            
            // Test invalid token
            if (!verifyCsrf('invalid_token')) {
                $this->addResult("✅ CSRF rejects invalid tokens", true);
            } else {
                $this->addResult("❌ CSRF accepts invalid tokens", false);
            }
            
        } catch (Exception $e) {
            $this->addResult("❌ CSRF protection test failed: " . $e->getMessage(), false);
        }
    }
    
    /**
     * Test rate limiting functionality
     */
    private function testRateLimiting() {
        echo "⏱️ Testing Rate Limiting...\n";
        
        try {
            // Test rate limiting function exists
            if (function_exists('rateLimit')) {
                $this->addResult("✅ Rate limiting function exists", true);
                
                // Test rate limiting logic
                $allowed = rateLimit('test_action', 2, 60); // 2 attempts per minute
                if ($allowed) {
                    $this->addResult("✅ Rate limiting allows first attempt", true);
                } else {
                    $this->addResult("❌ Rate limiting blocks first attempt", false);
                }
                
            } else {
                $this->addResult("❌ Rate limiting function missing", false);
            }
            
        } catch (Exception $e) {
            $this->addResult("❌ Rate limiting test failed: " . $e->getMessage(), false);
        }
    }
    
    /**
     * Test session security
     */
    private function testSessionSecurity() {
        echo "🔐 Testing Session Security...\n";
        
        try {
            // Test session configuration
            $httpOnly = ini_get('session.cookie_httponly');
            if ($httpOnly) {
                $this->addResult("✅ Session cookies are HTTPOnly", true);
            } else {
                $this->addResult("⚠️ Session cookies not HTTPOnly", false);
            }
            
            // Test session name
            $sessionName = session_name();
            if ($sessionName !== 'PHPSESSID') {
                $this->addResult("✅ Custom session name configured", true);
            } else {
                $this->addResult("⚠️ Using default session name", false);
            }
            
        } catch (Exception $e) {
            $this->addResult("❌ Session security test failed: " . $e->getMessage(), false);
        }
    }
    
    /**
     * Test email service functionality
     */
    private function testEmailService() {
        echo "📧 Testing Email Service...\n";
        
        try {
            // Test service instantiation
            $emailService = new App\Services\EmailService();
            $this->addResult("✅ Email service instantiated", true);
            
            // Test required methods exist
            $requiredMethods = [
                'sendPasswordResetEmail',
                'sendEmailVerificationEmail',
                'sendAccountLockoutNotification',
                'sendWelcomeEmail'
            ];
            
            foreach ($requiredMethods as $method) {
                if (method_exists($emailService, $method)) {
                    $this->addResult("✅ Email service has '{$method}' method", true);
                } else {
                    $this->addResult("❌ Email service missing '{$method}' method", false);
                }
            }
            
        } catch (Exception $e) {
            $this->addResult("❌ Email service test failed: " . $e->getMessage(), false);
        }
    }
    
    /**
     * Test authentication views exist
     */
    private function testAuthenticationViews() {
        echo "🎨 Testing Authentication Views...\n";
        
        $requiredViews = [
            'app/views/auth/login-modal.php',
            'app/views/auth/reset-password.php',
            'app/views/emails/password-reset.php'
        ];
        
        foreach ($requiredViews as $view) {
            if (file_exists($view)) {
                $this->addResult("✅ View '{$view}' exists", true);
            } else {
                $this->addResult("❌ View '{$view}' missing", false);
            }
        }
    }
    
    /**
     * Test login flow components
     */
    private function testLoginFlow() {
        echo "🔑 Testing Login Flow...\n";
        
        try {
            // Test AuthController exists
            if (class_exists('App\Controllers\AuthController')) {
                $this->addResult("✅ AuthController exists", true);
                
                $controller = new App\Controllers\AuthController();
                
                // Test required methods
                $requiredMethods = [
                    'showLogin',
                    'processLogin',
                    'logout',
                    'showForgotPassword',
                    'processForgotPassword'
                ];
                
                foreach ($requiredMethods as $method) {
                    if (method_exists($controller, $method)) {
                        $this->addResult("✅ AuthController has '{$method}' method", true);
                    } else {
                        $this->addResult("❌ AuthController missing '{$method}' method", false);
                    }
                }
                
            } else {
                $this->addResult("❌ AuthController missing", false);
            }
            
        } catch (Exception $e) {
            $this->addResult("❌ Login flow test failed: " . $e->getMessage(), false);
        }
    }
    
    /**
     * Test password reset flow
     */
    private function testPasswordResetFlow() {
        echo "🔄 Testing Password Reset Flow...\n";
        
        try {
            // Test routes file exists
            if (file_exists('routes/auth.php')) {
                $this->addResult("✅ Authentication routes file exists", true);
            } else {
                $this->addResult("❌ Authentication routes file missing", false);
            }
            
            // Test helper functions exist
            $requiredFunctions = [
                'auth',
                'user',
                'can',
                'hasRole',
                'csrfToken',
                'verifyCsrf'
            ];
            
            foreach ($requiredFunctions as $function) {
                if (function_exists($function)) {
                    $this->addResult("✅ Helper function '{$function}' exists", true);
                } else {
                    $this->addResult("❌ Helper function '{$function}' missing", false);
                }
            }
            
        } catch (Exception $e) {
            $this->addResult("❌ Password reset flow test failed: " . $e->getMessage(), false);
        }
    }
    
    /**
     * Add test result
     */
    private function addResult($message, $success) {
        $this->testResults[] = [
            'message' => $message,
            'success' => $success
        ];
        echo "  {$message}\n";
    }
    
    /**
     * Display final test results
     */
    private function displayResults() {
        echo "\n" . str_repeat("=", 60) . "\n";
        echo "📊 TEST RESULTS SUMMARY\n";
        echo str_repeat("=", 60) . "\n";
        
        $passed = 0;
        $failed = 0;
        
        foreach ($this->testResults as $result) {
            if ($result['success']) {
                $passed++;
            } else {
                $failed++;
            }
        }
        
        $total = $passed + $failed;
        $percentage = $total > 0 ? round(($passed / $total) * 100, 1) : 0;
        
        echo "✅ Passed: {$passed}\n";
        echo "❌ Failed: {$failed}\n";
        echo "📈 Success Rate: {$percentage}%\n";
        
        if ($failed === 0) {
            echo "\n🎉 ALL TESTS PASSED! Authentication system is ready for use.\n";
        } else {
            echo "\n⚠️  Some tests failed. Please review the issues above.\n";
        }
        
        echo "\n📚 For setup instructions, see: docs/AUTHENTICATION_SETUP_GUIDE.md\n";
    }
}

// Run tests if called directly
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    $tester = new AuthenticationTest();
    $tester->runAllTests();
}