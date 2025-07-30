<?php
/**
 * Login Test and Diagnostic Script
 * SquidJob Tender Management System
 * 
 * This script helps diagnose authentication issues and provides proper error handling
 */

// Start session
session_start();

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define application root
define('APP_ROOT', __DIR__);

// Include necessary files
require_once APP_ROOT . '/bootstrap/app.php';
require_once APP_ROOT . '/app/helpers/auth_helpers.php';
require_once APP_ROOT . '/app/helpers/functions.php';

// Test database connection
function testDatabaseConnection() {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->query('SELECT VERSION() as version');
        $result = $stmt->fetch();
        return [
            'status' => 'success',
            'message' => 'Database connection successful',
            'mysql_version' => $result['version']
        ];
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => 'Database connection failed',
            'error' => $e->getMessage()
        ];
    }
}

// Test authentication system
function testAuthenticationSystem() {
    try {
        // Test if User model exists
        if (!class_exists('App\Models\User')) {
            return [
                'status' => 'error',
                'message' => 'User model not found',
                'error' => 'App\Models\User class does not exist'
            ];
        }
        
        $userModel = new App\Models\User();
        
        // Test if users table exists
        $pdo = getDbConnection();
        $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
        if ($stmt->rowCount() === 0) {
            return [
                'status' => 'error',
                'message' => 'Users table not found',
                'error' => 'The users table does not exist in the database'
            ];
        }
        
        return [
            'status' => 'success',
            'message' => 'Authentication system is properly configured'
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => 'Authentication system test failed',
            'error' => $e->getMessage()
        ];
    }
}

// Test routing system
function testRoutingSystem() {
    try {
        if (!class_exists('App\Core\Router')) {
            return [
                'status' => 'error',
                'message' => 'Router class not found',
                'error' => 'App\Core\Router class does not exist'
            ];
        }
        
        return [
            'status' => 'success',
            'message' => 'Routing system is properly configured'
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => 'Routing system test failed',
            'error' => $e->getMessage()
        ];
    }
}

// Test view system
function testViewSystem() {
    $loginViewPath = APP_ROOT . '/app/views/auth/login.php';
    
    if (!file_exists($loginViewPath)) {
        return [
            'status' => 'error',
            'message' => 'Login view not found',
            'error' => "Login view file does not exist at: {$loginViewPath}"
        ];
    }
    
    return [
        'status' => 'success',
        'message' => 'View system is properly configured'
    ];
}

// Test helper functions
function testHelperFunctions() {
    $requiredFunctions = [
        'auth', 'user', 'url', 'redirect', 'flash', 'view', 'config'
    ];
    
    $missingFunctions = [];
    foreach ($requiredFunctions as $function) {
        if (!function_exists($function)) {
            $missingFunctions[] = $function;
        }
    }
    
    if (!empty($missingFunctions)) {
        return [
            'status' => 'error',
            'message' => 'Missing helper functions',
            'error' => 'Missing functions: ' . implode(', ', $missingFunctions)
        ];
    }
    
    return [
        'status' => 'success',
        'message' => 'Helper functions are properly loaded'
    ];
}

// Create admin user if needed
function createAdminUser() {
    try {
        $pdo = getDbConnection();
        
        // Check if admin user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute(['admin@squidjob.com']);
        
        if ($stmt->rowCount() > 0) {
            return [
                'status' => 'info',
                'message' => 'Admin user already exists'
            ];
        }
        
        // Create admin user
        $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, password, role, status, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ");
        $stmt->execute(['Admin User', 'admin@squidjob.com', $hashedPassword, 'admin', 'active']);
        
        return [
            'status' => 'success',
            'message' => 'Admin user created successfully',
            'credentials' => [
                'email' => 'admin@squidjob.com',
                'password' => 'admin123'
            ]
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => 'Failed to create admin user',
            'error' => $e->getMessage()
        ];
    }
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    switch ($action) {
        case 'create_admin':
            $result = createAdminUser();
            break;
        case 'test_login':
            // Test login functionality
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            
            try {
                $userModel = new App\Models\User();
                $user = $userModel->authenticate($email, $password);
                
                if ($user) {
                    $result = [
                        'status' => 'success',
                        'message' => 'Login successful',
                        'user' => [
                            'id' => $user['id'],
                            'name' => $user['name'],
                            'email' => $user['email'],
                            'role' => $user['role']
                        ]
                    ];
                } else {
                    $result = [
                        'status' => 'error',
                        'message' => 'Invalid credentials'
                    ];
                }
            } catch (Exception $e) {
                $result = [
                    'status' => 'error',
                    'message' => 'Login test failed',
                    'error' => $e->getMessage()
                ];
            }
            break;
    }
}

// Run diagnostics
$diagnostics = [
    'database' => testDatabaseConnection(),
    'authentication' => testAuthenticationSystem(),
    'routing' => testRoutingSystem(),
    'views' => testViewSystem(),
    'helpers' => testHelperFunctions()
];

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SquidJob - Login Test & Diagnostics</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .header h1 {
            margin: 0;
            font-size: 2rem;
            font-weight: 600;
        }
        
        .header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
        }
        
        .content {
            padding: 2rem;
        }
        
        .section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
        }
        
        .section h2 {
            margin-bottom: 1rem;
            color: #374151;
            font-size: 1.25rem;
        }
        
        .status {
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
        }
        
        .status.success {
            background-color: #d1e7dd;
            color: #0f5132;
            border: 1px solid #badbcc;
        }
        
        .status.error {
            background-color: #f8d7da;
            color: #842029;
            border: 1px solid #f5c2c7;
        }
        
        .status.info {
            background-color: #cff4fc;
            color: #055160;
            border: 1px solid #b6effb;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
        }
        
        .form-control {
            display: block;
            width: 100%;
            padding: 0.75rem;
            font-size: 1rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            background-color: #fff;
        }
        
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            font-weight: 500;
            text-align: center;
            text-decoration: none;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .btn-primary {
            background-color: #7c3aed;
            color: white;
        }
        
        .btn-primary:hover {
            background-color: #6d28d9;
        }
        
        .btn-success {
            background-color: #059669;
            color: white;
        }
        
        .btn-success:hover {
            background-color: #047857;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }
        
        .card {
            background: #f9fafb;
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid #e5e7eb;
        }
        
        .card h3 {
            margin-bottom: 0.5rem;
            color: #374151;
        }
        
        .error-details {
            background: #fef2f2;
            border: 1px solid #fecaca;
            padding: 1rem;
            border-radius: 0.375rem;
            margin-top: 0.5rem;
            font-family: monospace;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 SquidJob Login Test & Diagnostics</h1>
            <p>Comprehensive system diagnostics and authentication testing</p>
        </div>
        
        <div class="content">
            <?php if (isset($result)): ?>
                <div class="section">
                    <h2>Action Result</h2>
                    <div class="status <?= $result['status'] ?>">
                        <strong><?= ucfirst($result['status']) ?>:</strong> <?= $result['message'] ?>
                        <?php if (isset($result['error'])): ?>
                            <div class="error-details"><?= htmlspecialchars($result['error']) ?></div>
                        <?php endif; ?>
                        <?php if (isset($result['credentials'])): ?>
                            <div style="margin-top: 1rem;">
                                <strong>Login Credentials:</strong><br>
                                Email: <?= htmlspecialchars($result['credentials']['email']) ?><br>
                                Password: <?= htmlspecialchars($result['credentials']['password']) ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>
            
            <div class="section">
                <h2>System Diagnostics</h2>
                <div class="grid">
                    <?php foreach ($diagnostics as $name => $diagnostic): ?>
                        <div class="card">
                            <h3><?= ucfirst($name) ?> System</h3>
                            <div class="status <?= $diagnostic['status'] ?>">
                                <strong><?= ucfirst($diagnostic['status']) ?>:</strong> <?= $diagnostic['message'] ?>
                                <?php if (isset($diagnostic['error'])): ?>
                                    <div class="error-details"><?= htmlspecialchars($diagnostic['error']) ?></div>
                                <?php endif; ?>
                                <?php if (isset($diagnostic['mysql_version'])): ?>
                                    <div style="margin-top: 0.5rem;">
                                        <strong>MySQL Version:</strong> <?= htmlspecialchars($diagnostic['mysql_version']) ?>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
            
            <div class="section">
                <h2>Quick Actions</h2>
                <div class="grid">
                    <div class="card">
                        <h3>Create Admin User</h3>
                        <p>Create a default admin user for testing</p>
                        <form method="POST" style="margin-top: 1rem;">
                            <input type="hidden" name="action" value="create_admin">
                            <button type="submit" class="btn btn-primary">Create Admin User</button>
                        </form>
                    </div>
                    
                    <div class="card">
                        <h3>Test Login</h3>
                        <p>Test the authentication system</p>
                        <form method="POST" style="margin-top: 1rem;">
                            <input type="hidden" name="action" value="test_login">
                            <div class="form-group">
                                <label class="form-label">Email:</label>
                                <input type="email" name="email" class="form-control" value="admin@squidjob.com" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Password:</label>
                                <input type="password" name="password" class="form-control" value="admin123" required>
                            </div>
                            <button type="submit" class="btn btn-success">Test Login</button>
                        </form>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Quick Links</h2>
                <div class="grid">
                    <div class="card">
                        <h3>Application Links</h3>
                        <p><a href="/squidjob/public/" class="btn btn-primary">Main Application</a></p>
                        <p><a href="/squidjob/public/login.php" class="btn btn-primary">Direct Login Page</a></p>
                        <p><a href="/squidjob/public/landing.php" class="btn btn-primary">Landing Page</a></p>
                    </div>
                    
                    <div class="card">
                        <h3>System Information</h3>
                        <p><strong>PHP Version:</strong> <?= phpversion() ?></p>
                        <p><strong>Server Software:</strong> <?= $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown' ?></p>
                        <p><strong>Document Root:</strong> <?= $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown' ?></p>
                        <p><strong>Current Path:</strong> <?= __DIR__ ?></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html> 