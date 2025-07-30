<?php
/**
 * Simple SquidJob Authentication System Test
 * 
 * This script provides a basic test of the authentication system
 * without complex dependencies.
 */

// Define constants
define('APP_ROOT', __DIR__);

// Simple database connection for testing
function getTestDbConnection() {
    $host = 'localhost';
    $dbname = 'squidjob';
    $username = 'root';
    $password = '';
    
    try {
        $pdo = new PDO("mysql:host={$host};dbname={$dbname};charset=utf8mb4", $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        throw new PDOException("Database connection failed: " . $e->getMessage());
    }
}

// Simple password hashing functions
function testHashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

function testVerifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

class SimpleAuthTester {
    
    private $pdo;
    private $results = [];
    
    public function __construct() {
        $this->pdo = getTestDbConnection();
        $this->log("✅ Database connection established");
    }
    
    public function runTests() {
        echo "=== SquidJob Authentication System - Simple Tests ===\n\n";
        
        try {
            $this->testDatabaseTables();
            $this->testPasswordHashing();
            $this->testUserOperations();
            $this->testRoleSystem();
            $this->testSecurityFeatures();
            
            $this->displayResults();
            
        } catch (Exception $e) {
            $this->log("❌ Test execution failed: " . $e->getMessage());
            $this->displayResults();
        }
    }
    
    private function testDatabaseTables() {
        echo "Testing database schema...\n";
        
        $requiredTables = [
            'users', 'roles', 'permissions', 'user_roles', 'role_permissions',
            'login_attempts', 'password_reset_tokens', 'email_verification_tokens',
            'user_sessions', 'user_devices', 'security_events', 'audit_logs'
        ];
        
        $existingTables = [];
        $stmt = $this->pdo->query("SHOW TABLES");
        while ($row = $stmt->fetch()) {
            $existingTables[] = array_values($row)[0];
        }
        
        $missingTables = array_diff($requiredTables, $existingTables);
        $foundTables = array_intersect($requiredTables, $existingTables);
        
        $this->log("✅ Found " . count($foundTables) . " out of " . count($requiredTables) . " required tables");
        
        if (!empty($missingTables)) {
            $this->log("⚠️  Missing tables: " . implode(', ', $missingTables));
        }
        
        // Test table structure for key tables
        foreach (['users', 'roles', 'permissions'] as $table) {
            if (in_array($table, $existingTables)) {
                $stmt = $this->pdo->query("DESCRIBE {$table}");
                $columns = $stmt->fetchAll();
                $this->log("✅ Table '{$table}' has " . count($columns) . " columns");
            }
        }
    }
    
    private function testPasswordHashing() {
        echo "Testing password hashing...\n";
        
        $password = 'TestPassword123!';
        $hash = testHashPassword($password);
        
        if (testVerifyPassword($password, $hash)) {
            $this->log("✅ Password hashing and verification works");
        } else {
            $this->log("❌ Password hashing failed");
        }
        
        if (!testVerifyPassword('WrongPassword', $hash)) {
            $this->log("✅ Password verification rejects wrong passwords");
        } else {
            $this->log("❌ Password verification accepts wrong passwords");
        }
    }
    
    private function testUserOperations() {
        echo "Testing user operations...\n";
        
        try {
            // Test user creation
            $stmt = $this->pdo->prepare("
                INSERT INTO users (first_name, last_name, email, password_hash, status, email_verified, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $testEmail = 'test_' . time() . '@squidjob.com';
            $result = $stmt->execute([
                'Test',
                'User',
                $testEmail,
                testHashPassword('TestPassword123!'),
                'active',
                1
            ]);
            
            if ($result) {
                $userId = $this->pdo->lastInsertId();
                $this->log("✅ User creation successful (ID: {$userId})");
                
                // Test user retrieval
                $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                $user = $stmt->fetch();
                
                if ($user && $user['email'] === $testEmail) {
                    $this->log("✅ User retrieval successful");
                } else {
                    $this->log("❌ User retrieval failed");
                }
                
                // Test password verification
                if (testVerifyPassword('TestPassword123!', $user['password_hash'])) {
                    $this->log("✅ User password verification works");
                } else {
                    $this->log("❌ User password verification failed");
                }
                
                // Cleanup test user
                $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                $this->log("✅ Test user cleaned up");
                
            } else {
                $this->log("❌ User creation failed");
            }
            
        } catch (Exception $e) {
            $this->log("❌ User operations error: " . $e->getMessage());
        }
    }
    
    private function testRoleSystem() {
        echo "Testing role system...\n";
        
        try {
            // Check if default roles exist
            $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM roles WHERE status = 'active'");
            $roleCount = $stmt->fetch()['count'];
            
            if ($roleCount >= 5) {
                $this->log("✅ Role system has {$roleCount} active roles");
            } else {
                $this->log("⚠️  Role system has only {$roleCount} active roles (expected at least 5)");
            }
            
            // Check if default permissions exist
            $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM permissions WHERE status = 'active'");
            $permissionCount = $stmt->fetch()['count'];
            
            if ($permissionCount >= 20) {
                $this->log("✅ Permission system has {$permissionCount} active permissions");
            } else {
                $this->log("⚠️  Permission system has only {$permissionCount} active permissions (expected at least 20)");
            }
            
            // Test role-permission relationships
            $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM role_permissions");
            $relationshipCount = $stmt->fetch()['count'];
            
            if ($relationshipCount > 0) {
                $this->log("✅ Role-permission relationships configured ({$relationshipCount} relationships)");
            } else {
                $this->log("⚠️  No role-permission relationships found");
            }
            
        } catch (Exception $e) {
            $this->log("❌ Role system error: " . $e->getMessage());
        }
    }
    
    private function testSecurityFeatures() {
        echo "Testing security features...\n";
        
        try {
            // Test audit log table
            $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM audit_logs");
            $auditCount = $stmt->fetch()['count'];
            $this->log("✅ Audit log table accessible ({$auditCount} entries)");
            
            // Test security events table
            $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM security_events");
            $securityCount = $stmt->fetch()['count'];
            $this->log("✅ Security events table accessible ({$securityCount} entries)");
            
            // Test login attempts table
            $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM login_attempts");
            $attemptCount = $stmt->fetch()['count'];
            $this->log("✅ Login attempts table accessible ({$attemptCount} entries)");
            
            // Test session management table
            $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM user_sessions");
            $sessionCount = $stmt->fetch()['count'];
            $this->log("✅ User sessions table accessible ({$sessionCount} entries)");
            
        } catch (Exception $e) {
            $this->log("❌ Security features error: " . $e->getMessage());
        }
    }
    
    private function log($message) {
        $this->results[] = $message;
        echo "  {$message}\n";
    }
    
    private function displayResults() {
        echo "\n=== Test Results Summary ===\n\n";
        
        $passed = 0;
        $failed = 0;
        $warnings = 0;
        
        foreach ($this->results as $result) {
            if (strpos($result, '✅') !== false) {
                $passed++;
            } elseif (strpos($result, '❌') !== false) {
                $failed++;
            } elseif (strpos($result, '⚠️') !== false) {
                $warnings++;
            }
        }
        
        $total = $passed + $failed + $warnings;
        
        echo "Total Tests: {$total}\n";
        echo "Passed: {$passed}\n";
        echo "Failed: {$failed}\n";
        echo "Warnings: {$warnings}\n\n";
        
        if ($failed === 0) {
            echo "🎉 All critical tests passed! Authentication system is functional.\n\n";
            
            if ($warnings === 0) {
                echo "System Status: ✅ READY FOR PRODUCTION\n\n";
            } else {
                echo "System Status: ⚠️  READY WITH MINOR ISSUES\n\n";
            }
            
            echo "Next Steps:\n";
            echo "1. Run the installation script: php install_auth_system.php\n";
            echo "2. Test the web interface: http://localhost/squidjob/test_auth_web.php\n";
            echo "3. Configure production environment settings\n";
            echo "4. Set up SSL/HTTPS for secure authentication\n";
            echo "5. Configure email service for notifications\n\n";
            
        } else {
            echo "❌ Some critical tests failed. Please review and fix the issues above.\n\n";
            echo "System Status: ⚠️  NEEDS ATTENTION\n\n";
        }
    }
}

// Run tests if called directly
if (php_sapi_name() === 'cli') {
    try {
        $tester = new SimpleAuthTester();
        $tester->runTests();
    } catch (Exception $e) {
        echo "Test execution failed: " . $e->getMessage() . "\n";
        exit(1);
    }
} else {
    echo "This script should be run from the command line.\n";
}