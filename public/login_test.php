<?php
/**
 * Login Test and Debug Script
 * SquidJob Tender Management System
 */

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Define application root
if (!defined('APP_ROOT')) {
    define('APP_ROOT', dirname(__DIR__));
}

// Include bootstrap
require_once APP_ROOT . '/bootstrap/app.php';

echo "<!DOCTYPE html>";
echo "<html lang='en'>";
echo "<head>";
echo "<meta charset='UTF-8'>";
echo "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
echo "<title>Login Test - SquidJob</title>";
echo "<style>";
echo "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }";
echo ".container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 2rem; }";
echo ".test-section { margin-bottom: 2rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.375rem; }";
echo ".success { background: #f0fdf4; border-color: #bbf7d0; }";
echo ".error { background: #fef2f2; border-color: #fecaca; }";
echo ".warning { background: #fffbeb; border-color: #fed7aa; }";
echo "h1, h2 { color: #374151; }";
echo "pre { background: #f9fafb; padding: 1rem; border-radius: 0.375rem; overflow-x: auto; }";
echo ".btn { display: inline-block; padding: 0.5rem 1rem; background: #7c3aed; color: white; text-decoration: none; border-radius: 0.375rem; margin: 0.5rem 0.5rem 0.5rem 0; }";
echo ".btn:hover { background: #6d28d9; }";
echo "</style>";
echo "</head>";
echo "<body>";
echo "<div class='container'>";
echo "<h1>🔍 SquidJob Login System Diagnostics</h1>";

// Test 1: Database Connection
echo "<div class='test-section'>";
echo "<h2>1. Database Connection Test</h2>";
try {
    $pdo = getDbConnection();
    echo "<div class='success'>";
    echo "<p>✅ Database connection successful!</p>";
    echo "<p>Database: " . $pdo->query("SELECT DATABASE()")->fetchColumn() . "</p>";
    echo "</div>";
} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<p>❌ Database connection failed!</p>";
    echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "</div>";
}
echo "</div>";

// Test 2: Users Table Check
echo "<div class='test-section'>";
echo "<h2>2. Users Table Check</h2>";
try {
    $pdo = getDbConnection();
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "<div class='success'>";
        echo "<p>✅ Users table exists!</p>";
        
        // Check table structure
        $stmt = $pdo->query("DESCRIBE users");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<h3>Table Structure:</h3>";
        echo "<pre>";
        foreach ($columns as $column) {
            echo $column['Field'] . " - " . $column['Type'] . " (" . $column['Null'] . ")\n";
        }
        echo "</pre>";
        
        // Check for demo user
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute(['admin@squidjob.com']);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo "<p>✅ Demo user exists!</p>";
            echo "<p>User ID: " . $user['id'] . "</p>";
            echo "<p>Status: " . $user['status'] . "</p>";
        } else {
            echo "<div class='warning'>";
            echo "<p>⚠️ Demo user does not exist!</p>";
            echo "<p>Creating demo user...</p>";
            
            // Create demo user
            $hashedPassword = hashPassword('admin123');
            $stmt = $pdo->prepare("
                INSERT INTO users (email, password_hash, first_name, last_name, status, email_verified, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            $result = $stmt->execute([
                'admin@squidjob.com',
                $hashedPassword,
                'Admin',
                'User',
                'active',
                1
            ]);
            
            if ($result) {
                echo "<p>✅ Demo user created successfully!</p>";
            } else {
                echo "<p>❌ Failed to create demo user!</p>";
            }
            echo "</div>";
        }
        echo "</div>";
    } else {
        echo "<div class='error'>";
        echo "<p>❌ Users table does not exist!</p>";
        echo "<p>Please run the database migration first.</p>";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<p>❌ Error checking users table!</p>";
    echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "</div>";
}
echo "</div>";

// Test 3: Authentication Functions
echo "<div class='test-section'>";
echo "<h2>3. Authentication Functions Test</h2>";
try {
    // Test password hashing
    $testPassword = 'admin123';
    $hashedPassword = hashPassword($testPassword);
    $isValid = verifyPassword($testPassword, $hashedPassword);
    
    if ($isValid) {
        echo "<div class='success'>";
        echo "<p>✅ Password hashing and verification working!</p>";
        echo "</div>";
    } else {
        echo "<div class='error'>";
        echo "<p>❌ Password hashing/verification failed!</p>";
        echo "</div>";
    }
    
    // Test User model
    $userModel = new \App\Models\User();
    $user = $userModel->findByEmail('admin@squidjob.com');
    
    if ($user) {
        echo "<div class='success'>";
        echo "<p>✅ User model working!</p>";
        echo "<p>Found user: " . htmlspecialchars($user['first_name'] . ' ' . $user['last_name']) . "</p>";
        echo "</div>";
    } else {
        echo "<div class='warning'>";
        echo "<p>⚠️ User model could not find demo user!</p>";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<p>❌ Authentication functions error!</p>";
    echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "</div>";
}
echo "</div>";

// Test 4: Route Testing
echo "<div class='test-section'>";
echo "<h2>4. Route Testing</h2>";
try {
    $router = new \App\Core\Router();
    require_once APP_ROOT . '/routes/web.php';
    
    $routes = $router->getRoutes();
    
    echo "<div class='success'>";
    echo "<p>✅ Router loaded successfully!</p>";
    echo "<p>Total routes loaded: " . count($routes['POST'] ?? []) . " POST routes</p>";
    
    if (isset($routes['POST']['/login'])) {
        echo "<p>✅ Login POST route exists!</p>";
    } else {
        echo "<p>❌ Login POST route missing!</p>";
    }
    echo "</div>";
} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<p>❌ Router error!</p>";
    echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "</div>";
}
echo "</div>";

// Test 5: Manual Login Test
if ($_POST) {
    echo "<div class='test-section'>";
    echo "<h2>5. Manual Login Test Result</h2>";
    
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    try {
        $userModel = new \App\Models\User();
        $user = $userModel->findByEmail($email);
        
        if ($user && verifyPassword($password, $user['password_hash'])) {
            echo "<div class='success'>";
            echo "<p>✅ Login successful!</p>";
            echo "<p>User: " . htmlspecialchars($user['first_name'] . ' ' . $user['last_name']) . "</p>";
            echo "<p>Email: " . htmlspecialchars($user['email']) . "</p>";
            echo "</div>";
        } else {
            echo "<div class='error'>";
            echo "<p>❌ Login failed!</p>";
            echo "<p>Invalid email or password.</p>";
            if ($user) {
                echo "<p>User found but password incorrect.</p>";
            } else {
                echo "<p>User not found.</p>";
            }
            echo "</div>";
        }
    } catch (Exception $e) {
        echo "<div class='error'>";
        echo "<p>❌ Login test error!</p>";
        echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
        echo "</div>";
    }
    echo "</div>";
}

// Manual login form
echo "<div class='test-section'>";
echo "<h2>6. Manual Login Test</h2>";
echo "<form method='POST'>";
echo "<p><label>Email: <input type='email' name='email' value='admin@squidjob.com' required style='margin-left: 10px; padding: 5px;'></label></p>";
echo "<p><label>Password: <input type='password' name='password' value='admin123' required style='margin-left: 10px; padding: 5px;'></label></p>";
echo "<p><button type='submit' class='btn'>Test Login</button></p>";
echo "</form>";
echo "</div>";

echo "<div class='test-section'>";
echo "<h2>7. Quick Actions</h2>";
echo "<a href='/squidjob/public/landing.php' class='btn'>Go to Landing Page</a>";
echo "<a href='/squidjob/public/' class='btn'>Go to Home</a>";
echo "<a href='/squidjob/public/login' class='btn'>Test Login Route</a>";
echo "</div>";

echo "</div>";
echo "</body>";
echo "</html>";