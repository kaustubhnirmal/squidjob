<?php
/**
 * Database Setup Script
 * SquidJob Tender Management System
 * 
 * Creates required database tables for authentication and core functionality
 */

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define application root
define('APP_ROOT', __DIR__);

// Include necessary files
require_once APP_ROOT . '/bootstrap/app.php';

// Database setup function
function setupDatabase() {
    try {
        $pdo = getDbConnection();
        
        // Create users table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'manager', 'user') DEFAULT 'user',
                status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                email_verified_at TIMESTAMP NULL,
                remember_token VARCHAR(100) NULL,
                last_login_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        // Create password_resets table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS password_resets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_token (token)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        // Create login_attempts table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS login_attempts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                ip_address VARCHAR(45) NOT NULL,
                user_agent TEXT,
                success BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_ip (ip_address),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        // Create account_lockouts table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS account_lockouts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                locked_until TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_locked_until (locked_until)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        // Create sessions table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS sessions (
                id VARCHAR(255) PRIMARY KEY,
                user_id INT NULL,
                ip_address VARCHAR(45) NULL,
                user_agent TEXT NULL,
                payload TEXT NOT NULL,
                last_activity INT NOT NULL,
                INDEX idx_user_id (user_id),
                INDEX idx_last_activity (last_activity)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        // Create default admin user if not exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute(['admin@squidjob.com']);
        
        if ($stmt->rowCount() === 0) {
            $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("
                INSERT INTO users (name, email, password, role, status, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            ");
            $stmt->execute(['Admin User', 'admin@squidjob.com', $hashedPassword, 'admin', 'active']);
        }
        
        return [
            'status' => 'success',
            'message' => 'Database setup completed successfully',
            'tables_created' => [
                'users',
                'password_resets', 
                'login_attempts',
                'account_lockouts',
                'sessions'
            ]
        ];
        
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => 'Database setup failed',
            'error' => $e->getMessage()
        ];
    }
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $result = setupDatabase();
}

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

$connectionTest = testDatabaseConnection();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Setup - SquidJob</title>
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
            max-width: 800px;
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
            background-color: #7c3aed;
            color: white;
        }
        
        .btn:hover {
            background-color: #6d28d9;
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
        
        .table-list {
            background: #f9fafb;
            padding: 1rem;
            border-radius: 0.375rem;
            margin-top: 1rem;
        }
        
        .table-list ul {
            margin: 0;
            padding-left: 1.5rem;
        }
        
        .table-list li {
            margin-bottom: 0.25rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗄️ Database Setup</h1>
            <p>SquidJob Tender Management System</p>
        </div>
        
        <div class="content">
            <?php if (isset($result)): ?>
                <div class="section">
                    <h2>Setup Result</h2>
                    <div class="status <?= $result['status'] ?>">
                        <strong><?= ucfirst($result['status']) ?>:</strong> <?= $result['message'] ?>
                        <?php if (isset($result['error'])): ?>
                            <div class="error-details"><?= htmlspecialchars($result['error']) ?></div>
                        <?php endif; ?>
                        <?php if (isset($result['tables_created'])): ?>
                            <div class="table-list">
                                <strong>Tables Created:</strong>
                                <ul>
                                    <?php foreach ($result['tables_created'] as $table): ?>
                                        <li><?= htmlspecialchars($table) ?></li>
                                    <?php endforeach; ?>
                                </ul>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>
            
            <div class="section">
                <h2>Database Connection Test</h2>
                <div class="status <?= $connectionTest['status'] ?>">
                    <strong><?= ucfirst($connectionTest['status']) ?>:</strong> <?= $connectionTest['message'] ?>
                    <?php if (isset($connectionTest['error'])): ?>
                        <div class="error-details"><?= htmlspecialchars($connectionTest['error']) ?></div>
                    <?php endif; ?>
                    <?php if (isset($connectionTest['mysql_version'])): ?>
                        <div style="margin-top: 0.5rem;">
                            <strong>MySQL Version:</strong> <?= htmlspecialchars($connectionTest['mysql_version']) ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="section">
                <h2>Setup Database</h2>
                <p>Click the button below to create all required database tables and set up the authentication system.</p>
                <form method="POST">
                    <button type="submit" class="btn">Setup Database</button>
                </form>
            </div>
            
            <div class="section">
                <h2>Quick Links</h2>
                <p><a href="/squidjob/login_test.php" class="btn">Run Diagnostics</a></p>
                <p><a href="/squidjob/public/" class="btn">Go to Application</a></p>
                <p><a href="/squidjob/public/login.php" class="btn">Login Page</a></p>
            </div>
        </div>
    </div>
</body>
</html> 