<?php
/**
 * Forgot Password Page
 * SquidJob Tender Management System
 * 
 * Standalone forgot password functionality with proper error handling
 */

// Start session (only if not already active)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define application root
define('APP_ROOT', dirname(__DIR__));

// Simple config
$config = [
    'app' => [
        'name' => 'SquidJob Tender Management System',
        'url' => 'http://localhost/squidjob'
    ],
    'database' => [
        'host' => 'localhost',
        'port' => '3306',
        'database' => 'squidjob',
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8mb4'
    ]
];

// Database connection
function getDbConnection() {
    global $config;
    $dsn = "mysql:host={$config['database']['host']};port={$config['database']['port']};dbname={$config['database']['database']};charset={$config['database']['charset']}";
    
    try {
        return new PDO($dsn, $config['database']['username'], $config['database']['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}

// Sanitize input
function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

// Generate URL
function url($path = '') {
    $baseUrl = rtrim($config['app']['url'], '/');
    return $baseUrl . '/public/' . ltrim($path, '/');
}

// Handle form submission
$message = '';
$messageType = '';
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitize($_POST['email'] ?? '');
    
    // Validate email
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = 'Please enter a valid email address.';
        $messageType = 'error';
    } else {
        try {
            $pdo = getDbConnection();
            
            if (!$pdo) {
                $message = 'Database connection failed. Please try again.';
                $messageType = 'error';
            } else {
                // Check if user exists
                $stmt = $pdo->prepare("SELECT id, first_name, last_name, email FROM users WHERE email = ? AND status = 'active'");
                $stmt->execute([$email]);
                $user = $stmt->fetch();
                
                if ($user) {
                    // Generate reset token
                    $token = bin2hex(random_bytes(32));
                    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
                    
                    // Store reset token
                    $stmt = $pdo->prepare("
                        INSERT INTO password_resets (email, token, expires_at, created_at) 
                        VALUES (?, ?, ?, NOW())
                        ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at), created_at = NOW()
                    ");
                    $stmt->execute([$email, $token, $expires]);
                    
                    // For testing purposes, show the reset link
                    $resetLink = url("reset-password.php?token={$token}");
                    
                    $message = "Password reset link has been generated. For testing purposes, use this link: <a href='{$resetLink}'>{$resetLink}</a>";
                    $messageType = 'success';
                    
                    // Log the reset request
                    error_log("Password reset requested for email: {$email}");
                    
                } else {
                    $message = 'If an account with that email exists, a password reset link has been sent.';
                    $messageType = 'info';
                }
            }
            
        } catch (Exception $e) {
            error_log('Password reset error: ' . $e->getMessage());
            $message = 'An error occurred. Please try again later.';
            $messageType = 'error';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password - SquidJob</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .forgot-container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            max-width: 400px;
            width: 100%;
        }
        
        .forgot-header {
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .forgot-header h2 {
            margin: 0;
            font-size: 1.8rem;
            font-weight: 600;
        }
        
        .forgot-header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
            font-size: 0.9rem;
        }
        
        .forgot-body {
            padding: 2rem;
        }
        
        .alert {
            padding: 0.75rem 1rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 0.375rem;
        }
        
        .alert-success {
            color: #0f5132;
            background-color: #d1e7dd;
            border-color: #badbcc;
        }
        
        .alert-danger {
            color: #842029;
            background-color: #f8d7da;
            border-color: #f5c2c7;
        }
        
        .alert-info {
            color: #055160;
            background-color: #cff4fc;
            border-color: #b6effb;
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
            font-weight: 400;
            line-height: 1.5;
            color: #212529;
            background-color: #fff;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .form-control:focus {
            border-color: #7c3aed;
            outline: 0;
            box-shadow: 0 0 0 0.2rem rgba(124, 58, 237, 0.25);
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
            width: 100%;
        }
        
        .btn-primary {
            background-color: #7c3aed;
            color: white;
        }
        
        .btn-primary:hover {
            background-color: #6d28d9;
        }
        
        .text-center {
            text-align: center;
        }
        
        .mt-3 {
            margin-top: 1rem;
        }
        
        .link {
            color: #7c3aed;
            text-decoration: none;
        }
        
        .link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="forgot-container">
        <div class="forgot-header">
            <h2>🔐 Forgot Password</h2>
            <p>Enter your email to reset your password</p>
        </div>
        
        <div class="forgot-body">
            <?php if ($message): ?>
                <div class="alert alert-<?= $messageType ?>">
                    <?= $message ?>
                </div>
            <?php endif; ?>
            
            <form method="POST">
                <div class="form-group">
                    <label for="email" class="form-label">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        class="form-control" 
                        value="<?= htmlspecialchars($email) ?>"
                        placeholder="Enter your email address"
                        required
                    >
                </div>
                
                <button type="submit" class="btn btn-primary">
                    Send Reset Link
                </button>
            </form>
            
            <div class="text-center mt-3">
                <a href="/squidjob/public/login.php" class="link">Back to Login</a>
            </div>
            
            <div class="text-center mt-3">
                <a href="/squidjob/public/" class="link">Go to Homepage</a>
            </div>
        </div>
    </div>
</body>
</html>
