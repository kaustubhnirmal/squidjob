<?php
/**
 * Direct Login Handler
 * SquidJob Tender Management System
 * 
 * Handles login requests directly without complex routing
 */

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Define application root
if (!defined('APP_ROOT')) {
    define('APP_ROOT', dirname(__DIR__));
}

// Include bootstrap for database and helper functions
require_once APP_ROOT . '/bootstrap/app.php';

// Set JSON response header
header('Content-Type: application/json');

try {
    // Only handle POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }
    
    // Verify CSRF token
    $token = $_POST['_token'] ?? '';
    if (!isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid security token. Please refresh the page and try again.']);
        exit;
    }
    
    // Get and validate input
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']);
    
    // Basic validation
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Please enter both email and password.']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Please enter a valid email address.']);
        exit;
    }
    
    // Rate limiting - simple IP-based check
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $rateLimitKey = 'login_attempts_' . md5($clientIp);
    
    if (!isset($_SESSION[$rateLimitKey])) {
        $_SESSION[$rateLimitKey] = ['count' => 0, 'last_attempt' => 0];
    }
    
    $now = time();
    $rateLimit = $_SESSION[$rateLimitKey];
    
    // Reset counter if more than 15 minutes have passed
    if ($now - $rateLimit['last_attempt'] > 900) {
        $_SESSION[$rateLimitKey] = ['count' => 0, 'last_attempt' => $now];
        $rateLimit = $_SESSION[$rateLimitKey];
    }
    
    // Check rate limit (5 attempts per 15 minutes)
    if ($rateLimit['count'] >= 5) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many login attempts. Please try again in 15 minutes.']);
        exit;
    }
    
    // Attempt authentication
    $userModel = new \App\Models\User();
    $user = $userModel->findByEmail($email);
    
    if (!$user || !verifyPassword($password, $user['password_hash'])) {
        // Record failed attempt
        $_SESSION[$rateLimitKey]['count']++;
        $_SESSION[$rateLimitKey]['last_attempt'] = $now;
        
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password.']);
        exit;
    }
    
    // Check if user account is active
    if ($user['status'] !== 'active') {
        http_response_code(403);
        echo json_encode(['error' => 'Your account is not active. Please contact administrator.']);
        exit;
    }
    
    // Clear failed attempts on successful login
    unset($_SESSION[$rateLimitKey]);
    
    // Create user session
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
    $_SESSION['login_time'] = time();
    $_SESSION['last_activity'] = time();
    
    // Set remember me cookie if requested
    if ($remember) {
        $rememberToken = bin2hex(random_bytes(32));
        $expires = time() + (30 * 24 * 60 * 60); // 30 days
        
        // Store hashed token in database
        $userModel->update($user['id'], [
            'remember_token' => hash('sha256', $rememberToken)
        ]);
        
        // Set cookie
        setcookie('remember_token', $rememberToken, $expires, '/', '', false, true);
    }
    
    // Update last login
    $userModel->update($user['id'], [
        'last_login' => date('Y-m-d H:i:s')
    ]);
    
    // Log successful login
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (table_name, record_id, action, user_id, ip_address, user_agent, metadata, created_at) 
            VALUES ('users', ?, 'LOGIN_SUCCESS', ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $user['id'],
            $user['id'],
            $clientIp,
            $_SERVER['HTTP_USER_AGENT'] ?? '',
            json_encode(['remember' => $remember])
        ]);
    } catch (Exception $e) {
        // Log error but don't fail login
        error_log("Failed to log login event: " . $e->getMessage());
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Login successful! Welcome back, ' . $user['first_name'] . '!',
        'redirect' => '/squidjob/public/index.php/dashboard',
        'user' => [
            'id' => $user['id'],
            'name' => $user['first_name'] . ' ' . $user['last_name'],
            'email' => $user['email']
        ]
    ]);
    
} catch (Exception $e) {
    // Log error
    error_log("Login handler error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode(['error' => 'An internal error occurred. Please try again later.']);
}