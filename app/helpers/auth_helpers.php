<?php
/**
 * Authentication Helper Functions
 * SquidJob Tender Management System
 * 
 * Global helper functions for authentication and authorization
 */

/**
 * Check if user is authenticated
 */
function auth() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Get current authenticated user
 */
function user() {
    if (!auth()) {
        return null;
    }
    
    static $user = null;
    
    if ($user === null) {
        try {
            $userModel = new \App\Models\User();
            $user = $userModel->find($_SESSION['user_id']);
        } catch (Exception $e) {
            logMessage('ERROR', 'Error fetching user: ' . $e->getMessage());
            return null;
        }
    }
    
    return $user;
}

/**
 * Get user ID
 */
function userId() {
    return $_SESSION['user_id'] ?? null;
}

/**
 * Get user email
 */
function userEmail() {
    return $_SESSION['user_email'] ?? null;
}

/**
 * Get user name
 */
function userName() {
    return $_SESSION['user_name'] ?? null;
}

/**
 * Check if user has specific permission
 */
function can($permission) {
    if (!auth()) {
        return false;
    }
    
    try {
        $userModel = new \App\Models\User();
        return $userModel->hasPermission(userId(), $permission);
    } catch (Exception $e) {
        logMessage('ERROR', 'Error checking permission: ' . $e->getMessage());
        return false;
    }
}

/**
 * Check if user has specific role
 */
function hasRole($role) {
    if (!auth()) {
        return false;
    }
    
    try {
        $userModel = new \App\Models\User();
        return $userModel->hasRole(userId(), $role);
    } catch (Exception $e) {
        logMessage('ERROR', 'Error checking role: ' . $e->getMessage());
        return false;
    }
}

/**
 * Check if user is admin
 */
function isAdmin() {
    return hasRole('admin');
}

/**
 * Check if user is manager
 */
function isManager() {
    return hasRole('tender_manager') || hasRole('sales_head');
}

/**
 * Hash password using bcrypt
 */
function hashPassword($password) {
    $rounds = config('app.security.bcrypt_rounds', 12);
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => $rounds]);
}

/**
 * Verify password against hash
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Generate CSRF token
 */
function csrfToken() {
    if (!isset($_SESSION['_token'])) {
        $_SESSION['_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_token'];
}

/**
 * Verify CSRF token
 */
function verifyCsrf($token) {
    return isset($_SESSION['_token']) && hash_equals($_SESSION['_token'], $token);
}

/**
 * Generate CSRF field for forms
 */
function csrfField() {
    $token = csrfToken();
    return "<input type='hidden' name='_token' value='{$token}'>";
}

/**
 * Generate secure random token
 */
function generateSecureToken($length = 32) {
    return bin2hex(random_bytes($length));
}

/**
 * Generate API key
 */
function generateApiKey() {
    return 'sqj_' . bin2hex(random_bytes(32));
}

/**
 * Sanitize input data
 */
function sanitize($input) {
    if (is_array($input)) {
        return array_map('sanitize', $input);
    }
    
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate input data
 */
function validate($data, $rules) {
    $errors = [];
    
    foreach ($rules as $field => $rule) {
        $value = $data[$field] ?? null;
        $ruleList = explode('|', $rule);
        
        foreach ($ruleList as $singleRule) {
            $ruleParts = explode(':', $singleRule);
            $ruleName = $ruleParts[0];
            $ruleValue = $ruleParts[1] ?? null;
            
            switch ($ruleName) {
                case 'required':
                    if (empty($value)) {
                        $errors[$field][] = ucfirst($field) . ' is required';
                    }
                    break;
                    
                case 'email':
                    if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $errors[$field][] = ucfirst($field) . ' must be a valid email address';
                    }
                    break;
                    
                case 'min':
                    if (!empty($value) && strlen($value) < $ruleValue) {
                        $errors[$field][] = ucfirst($field) . " must be at least {$ruleValue} characters";
                    }
                    break;
                    
                case 'max':
                    if (!empty($value) && strlen($value) > $ruleValue) {
                        $errors[$field][] = ucfirst($field) . " must not exceed {$ruleValue} characters";
                    }
                    break;
                    
                case 'numeric':
                    if (!empty($value) && !is_numeric($value)) {
                        $errors[$field][] = ucfirst($field) . ' must be a number';
                    }
                    break;
                    
                case 'alpha':
                    if (!empty($value) && !ctype_alpha($value)) {
                        $errors[$field][] = ucfirst($field) . ' must contain only letters';
                    }
                    break;
                    
                case 'alphanumeric':
                    if (!empty($value) && !ctype_alnum($value)) {
                        $errors[$field][] = ucfirst($field) . ' must contain only letters and numbers';
                    }
                    break;
            }
        }
    }
    
    return $errors;
}

/**
 * Get request input
 */
function request($key = null, $default = null) {
    $input = array_merge($_GET, $_POST);
    
    if ($key === null) {
        return $input;
    }
    
    return $input[$key] ?? $default;
}

/**
 * Redirect to URL
 */
function redirect($url) {
    if (!headers_sent()) {
        header("Location: {$url}");
        exit;
    }
    
    echo "<script>window.location.href = '{$url}';</script>";
    exit;
}

/**
 * Redirect back to previous page
 */
function back() {
    $referer = $_SERVER['HTTP_REFERER'] ?? url('dashboard');
    redirect($referer);
}

/**
 * Generate URL
 */
function url($path = '') {
    $baseUrl = rtrim(config('app.url'), '/');
    $path = ltrim($path, '/');
    return $baseUrl . '/' . $path;
}

/**
 * Get current URL
 */
function currentUrl() {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $uri = $_SERVER['REQUEST_URI'];
    return $protocol . '://' . $host . $uri;
}

/**
 * Generate asset URL
 */
function asset($path) {
    return url('public/assets/' . ltrim($path, '/'));
}

/**
 * Set flash message
 */
function flash($type, $message) {
    $_SESSION['flash'][$type] = $message;
}

/**
 * Get flash message
 */
function getFlash($type) {
    $message = $_SESSION['flash'][$type] ?? null;
    unset($_SESSION['flash'][$type]);
    return $message;
}

/**
 * Check if flash message exists
 */
function hasFlash($type) {
    return isset($_SESSION['flash'][$type]);
}

/**
 * Escape HTML output
 */
function e($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * Log message to file
 */
function logMessage($level, $message, $context = []) {
    $logPath = config('app.log_path', 'storage/logs');
    $logFile = APP_ROOT . '/' . $logPath . '/app.log';
    
    // Create log directory if it doesn't exist
    $logDir = dirname($logFile);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? ' ' . json_encode($context) : '';
    $logEntry = "[{$timestamp}] {$level}: {$message}{$contextStr}" . PHP_EOL;
    
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

/**
 * Get user's IP address
 */
function getClientIp() {
    $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (!empty($_SERVER[$key])) {
            $ip = $_SERVER[$key];
            if (strpos($ip, ',') !== false) {
                $ip = trim(explode(',', $ip)[0]);
            }
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/**
 * Format file size
 */
function formatFileSize($bytes) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, 2) . ' ' . $units[$i];
}

/**
 * Generate pagination links
 */
function paginate($currentPage, $totalPages, $baseUrl) {
    $links = [];
    $range = 2; // Number of pages to show on each side of current page
    
    // Previous link
    if ($currentPage > 1) {
        $links[] = [
            'url' => $baseUrl . '?page=' . ($currentPage - 1),
            'label' => '&laquo; Previous',
            'active' => false
        ];
    }
    
    // Page numbers
    for ($i = max(1, $currentPage - $range); $i <= min($totalPages, $currentPage + $range); $i++) {
        $links[] = [
            'url' => $baseUrl . '?page=' . $i,
            'label' => $i,
            'active' => $i == $currentPage
        ];
    }
    
    // Next link
    if ($currentPage < $totalPages) {
        $links[] = [
            'url' => $baseUrl . '?page=' . ($currentPage + 1),
            'label' => 'Next &raquo;',
            'active' => false
        ];
    }
    
    return $links;
}

/**
 * Check if user can access resource
 */
function authorize($permission, $resource = null) {
    if (!auth()) {
        flash('error', 'Please log in to access this resource.');
        redirect(url('login'));
    }
    
    if (!can($permission)) {
        flash('error', 'You do not have permission to access this resource.');
        redirect(url('dashboard'));
    }
    
    return true;
}

/**
 * Require authentication
 */
function requireAuth($redirectTo = null) {
    if (!auth()) {
        $_SESSION['intended_url'] = currentUrl();
        flash('warning', 'Please log in to access this page.');
        redirect($redirectTo ?: url('login'));
    }
}

/**
 * Require specific role
 */
function requireRole($role, $redirectTo = null) {
    requireAuth($redirectTo);
    
    if (!hasRole($role)) {
        flash('error', 'You do not have the required role to access this page.');
        redirect($redirectTo ?: url('dashboard'));
    }
}

/**
 * Require specific permission
 */
function requirePermission($permission, $redirectTo = null) {
    requireAuth($redirectTo);
    
    if (!can($permission)) {
        flash('error', 'You do not have permission to access this page.');
        redirect($redirectTo ?: url('dashboard'));
    }
}

/**
 * Generate secure password
 */
function generateSecurePassword($length = 12) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    $password = '';
    
    for ($i = 0; $i < $length; $i++) {
        $password .= $chars[random_int(0, strlen($chars) - 1)];
    }
    
    return $password;
}

/**
 * Check password strength
 */
function checkPasswordStrength($password) {
    $score = 0;
    $feedback = [];
    
    // Length check
    if (strlen($password) >= 8) {
        $score += 1;
    } else {
        $feedback[] = 'Password should be at least 8 characters long';
    }
    
    // Uppercase check
    if (preg_match('/[A-Z]/', $password)) {
        $score += 1;
    } else {
        $feedback[] = 'Password should contain at least one uppercase letter';
    }
    
    // Lowercase check
    if (preg_match('/[a-z]/', $password)) {
        $score += 1;
    } else {
        $feedback[] = 'Password should contain at least one lowercase letter';
    }
    
    // Number check
    if (preg_match('/[0-9]/', $password)) {
        $score += 1;
    } else {
        $feedback[] = 'Password should contain at least one number';
    }
    
    // Special character check
    if (preg_match('/[^A-Za-z0-9]/', $password)) {
        $score += 1;
    } else {
        $feedback[] = 'Password should contain at least one special character';
    }
    
    // Determine strength
    $strength = 'weak';
    if ($score >= 4) {
        $strength = 'strong';
    } elseif ($score >= 3) {
        $strength = 'medium';
    }
    
    return [
        'score' => $score,
        'strength' => $strength,
        'feedback' => $feedback
    ];
}

/**
 * Rate limiting helper
 */
function rateLimit($action, $maxAttempts = 5, $timeWindow = 300) {
    return authMiddleware()->rateLimit($action, $maxAttempts, $timeWindow);
}

/**
 * Theme view helper
 */
function theme_view($view, $data = []) {
    $themePath = APP_ROOT . '/themes/' . config('app.theme', 'default') . '/pages/' . str_replace('.', '/', $view) . '.php';
    
    if (!file_exists($themePath)) {
        $themePath = APP_ROOT . '/app/views/' . str_replace('.', '/', $view) . '.php';
    }
    
    if (file_exists($themePath)) {
        extract($data);
        include $themePath;
    } else {
        throw new Exception("View not found: {$view}");
    }
}

/**
 * Regular view helper
 */
function view($view, $data = []) {
    $viewPath = APP_ROOT . '/app/views/' . str_replace('.', '/', $view) . '.php';
    
    if (file_exists($viewPath)) {
        extract($data);
        include $viewPath;
    } else {
        throw new Exception("View not found: {$view}");
    }
}

/**
 * Hook system for extensibility
 */
function do_hook($hook, $data = null) {
    // Simple hook system - can be extended
    $hookFile = APP_ROOT . "/hooks/{$hook}.php";
    if (file_exists($hookFile)) {
        include $hookFile;
    }
}

/**
 * Get user avatar URL
 */
function getUserAvatar($user = null) {
    $user = $user ?: user();
    
    if (!$user) {
        return asset('images/default-avatar.png');
    }
    
    if (!empty($user['profile_image'])) {
        return asset('uploads/avatars/' . $user['profile_image']);
    }
    
    // Generate Gravatar URL
    $email = $user['email'];
    $hash = md5(strtolower(trim($email)));
    $size = 80;
    $default = urlencode(asset('images/default-avatar.png'));
    
    return "https://www.gravatar.com/avatar/{$hash}?s={$size}&d={$default}";
}

/**
 * Format date for display
 */
function formatDate($date, $format = 'M j, Y') {
    if (!$date) return '';
    
    $timestamp = is_numeric($date) ? $date : strtotime($date);
    return date($format, $timestamp);
}

/**
 * Format datetime for display
 */
function formatDateTime($datetime, $format = 'M j, Y g:i A') {
    if (!$datetime) return '';
    
    $timestamp = is_numeric($datetime) ? $datetime : strtotime($datetime);
    return date($format, $timestamp);
}

/**
 * Time ago helper
 */
function timeAgo($datetime) {
    if (!$datetime) return '';
    
    $timestamp = is_numeric($datetime) ? $datetime : strtotime($datetime);
    $diff = time() - $timestamp;
    
    if ($diff < 60) {
        return 'just now';
    } elseif ($diff < 3600) {
        $minutes = floor($diff / 60);
        return $minutes . ' minute' . ($minutes > 1 ? 's' : '') . ' ago';
    } elseif ($diff < 86400) {
        $hours = floor($diff / 3600);
        return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
    } elseif ($diff < 2592000) {
        $days = floor($diff / 86400);
        return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
    } else {
        return formatDate($datetime);
    }
}