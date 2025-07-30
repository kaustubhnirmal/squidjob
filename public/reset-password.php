<?php
/**
 * Reset Password Page
 * SquidJob Tender Management System
 * 
 * Standalone reset password functionality with proper error handling
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

// Get token from URL
$token = $_GET['token'] ?? '';

$message = '';
$messageType = '';
$showForm = false;
$email = '';

if (empty($token)) {
    $message = 'Invalid reset link. Please request a new password reset.';
    $messageType = 'error';
} else {
    try {
        $pdo = getDbConnection();
        
        if (!$pdo) {
            $message = 'Database connection failed. Please try again.';
            $messageType = 'error';
        } else {
            // Check if token exists and is valid
            $stmt = $pdo->prepare("
                SELECT email, expires_at 
                FROM password_resets 
                WHERE token = ? AND expires_at > NOW()
            ");
            $stmt->execute([$token]);
            $reset = $stmt->fetch();
            
            if ($reset) {
                $email = $reset['email'];
                $showForm = true;
            } else {
                $message = 'This reset link has expired or is invalid. Please request a new password reset.';
                $messageType = 'error';
            }
        }
        
    } catch (Exception $e) {
        error_log('Reset password error: ' . $e->getMessage());
        $message = 'An error occurred. Please try again later.';
        $messageType = 'error';
    }
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $showForm) {
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    // Validate password
    if (empty($password)) {
        $message = 'Please enter a new password.';
        $messageType = 'error';
    } elseif (strlen($password) < 6) {
        $message = 'Password must be at least 6 characters long.';
        $messageType = 'error';
    } elseif ($password !== $confirmPassword) {
        $message = 'Passwords do not match.';
        $messageType = 'error';
    } else {
        try {
            $pdo = getDbConnection();
            
            if (!$pdo) {
                $message = 'Database connection failed. Please try again.';
                $messageType = 'error';
            } else {
                // Update user password
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?");
                $stmt->execute([$hashedPassword, $email]);
                
                if ($stmt->rowCount() > 0) {
                    // Delete the reset token
                    $stmt = $pdo->prepare("DELETE FROM password_resets WHERE token = ?");
                    $stmt->execute([$token]);
                    
                    $message = 'Password has been reset successfully. You can now login with your new password.';
                    $messageType = 'success';
                    $showForm = false;
                    
                    // Log the password reset
                    error_log("Password reset completed for email: {$email}");
                    
                } else {
                    $message = 'Failed to update password. Please try again.';
                    $messageType = 'error';
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
    <title>Reset Password - SquidJob</title>
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
        
        .reset-container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            max-width: 400px;
            width: 100%;
        }
        
        .reset-header {
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .reset-header h2 {
            margin: 0;
            font-size: 1.8rem;
            font-weight: 600;
        }
        
        .reset-header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
            font-size: 0.9rem;
        }
        
        .reset-body {
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
        
        .password-strength {
            margin-top: 0.5rem;
            font-size: 0.875rem;
        }
        
        .strength-weak {
            color: #dc2626;
        }
        
        .strength-medium {
            color: #f59e0b;
        }
        
        .strength-strong {
            color: #059669;
        }
    </style>
</head>
<body>
    <div class="reset-container">
        <div class="reset-header">
            <h2>🔐 Reset Password</h2>
            <p>Enter your new password</p>
        </div>
        
        <div class="reset-body">
            <?php if ($message): ?>
                <div class="alert alert-<?= $messageType ?>">
                    <?= $message ?>
                </div>
            <?php endif; ?>
            
            <?php if ($showForm): ?>
                <form method="POST">
                    <div class="form-group">
                        <label for="password" class="form-label">New Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            class="form-control" 
                            placeholder="Enter new password"
                            required
                            minlength="6"
                        >
                        <div class="password-strength" id="password-strength"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirm_password" class="form-label">Confirm Password</label>
                        <input 
                            type="password" 
                            id="confirm_password" 
                            name="confirm_password" 
                            class="form-control" 
                            placeholder="Confirm new password"
                            required
                            minlength="6"
                        >
                    </div>
                    
                    <button type="submit" class="btn btn-primary">
                        Reset Password
                    </button>
                </form>
            <?php endif; ?>
            
            <div class="text-center mt-3">
                <a href="/squidjob/public/login.php" class="link">Back to Login</a>
            </div>
            
            <div class="text-center mt-3">
                <a href="/squidjob/public/" class="link">Go to Homepage</a>
            </div>
        </div>
    </div>
    
    <script>
        // Password strength indicator
        document.getElementById('password').addEventListener('input', function() {
            const password = this.value;
            const strengthDiv = document.getElementById('password-strength');
            
            let strength = 0;
            let message = '';
            
            if (password.length >= 6) strength++;
            if (password.match(/[a-z]/)) strength++;
            if (password.match(/[A-Z]/)) strength++;
            if (password.match(/[0-9]/)) strength++;
            if (password.match(/[^a-zA-Z0-9]/)) strength++;
            
            switch (strength) {
                case 0:
                case 1:
                    message = '<span class="strength-weak">Weak password</span>';
                    break;
                case 2:
                case 3:
                    message = '<span class="strength-medium">Medium strength password</span>';
                    break;
                case 4:
                case 5:
                    message = '<span class="strength-strong">Strong password</span>';
                    break;
            }
            
            strengthDiv.innerHTML = message;
        });
    </script>
</body>
</html>
