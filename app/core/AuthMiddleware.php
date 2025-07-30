<?php
/**
 * Authentication Middleware
 * SquidJob Tender Management System
 * 
 * Handles authentication checks and session management
 */

namespace App\Core;

class AuthMiddleware {
    
    private static $instance = null;
    private $sessionTimeout = 1440; // 24 minutes in seconds
    private $rememberTokenExpiry = 2592000; // 30 days
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Initialize authentication middleware
     */
    public function init() {
        // Start session if not already started
        if (session_status() === PHP_SESSION_NONE) {
            $this->startSecureSession();
        }
        
        // Check for remember me token
        $this->checkRememberToken();
        
        // Validate active session
        $this->validateSession();
        
        // Update last activity
        $this->updateLastActivity();
    }
    
    /**
     * Start secure session with proper configuration
     */
    private function startSecureSession() {
        // Configure session settings
        ini_set('session.cookie_httponly', 1);
        ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) ? 1 : 0);
        ini_set('session.cookie_samesite', 'Lax');
        ini_set('session.use_strict_mode', 1);
        ini_set('session.cookie_lifetime', 0); // Session cookie
        
        // Set session name
        session_name(config('app.session.cookie', 'squidjob_session'));
        
        // Start session
        session_start();
        
        // Regenerate session ID periodically for security
        if (!isset($_SESSION['last_regeneration'])) {
            $_SESSION['last_regeneration'] = time();
        } elseif (time() - $_SESSION['last_regeneration'] > 300) { // 5 minutes
            session_regenerate_id(true);
            $_SESSION['last_regeneration'] = time();
        }
    }
    
    /**
     * Check for remember me token and auto-login
     */
    private function checkRememberToken() {
        // Skip if already authenticated
        if (auth()) {
            return;
        }
        
        // Check for remember token cookie
        if (!isset($_COOKIE['remember_token'])) {
            return;
        }
        
        try {
            $token = $_COOKIE['remember_token'];
            $hashedToken = hash('sha256', $token);
            
            // Find user with matching token
            $userModel = new \App\Models\User();
            $user = $userModel->where('remember_token', $hashedToken);
            
            if (!$user || $user['status'] !== 'active') {
                // Invalid or inactive user, clear cookie
                setcookie('remember_token', '', time() - 3600, '/', '', false, true);
                return;
            }
            
            // Auto-login user
            $this->createUserSession($user);
            
            // Generate new remember token for security
            $this->rotateRememberToken($user['id']);
            
            // Log auto-login
            $this->logSecurityEvent('auto_login', $user['id']);
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Remember token check failed: ' . $e->getMessage());
            // Clear potentially corrupted cookie
            setcookie('remember_token', '', time() - 3600, '/', '', false, true);
        }
    }
    
    /**
     * Validate current session
     */
    private function validateSession() {
        if (!auth()) {
            return;
        }
        
        // Check session timeout
        if (isset($_SESSION['last_activity'])) {
            $inactiveTime = time() - $_SESSION['last_activity'];
            
            if ($inactiveTime > $this->sessionTimeout) {
                $this->destroySession();
                flash('warning', 'Your session has expired due to inactivity. Please log in again.');
                return;
            }
        }
        
        // Validate user still exists and is active
        try {
            $userModel = new \App\Models\User();
            $user = $userModel->find($_SESSION['user_id']);
            
            if (!$user || $user['status'] !== 'active') {
                $this->destroySession();
                flash('error', 'Your account is no longer active. Please contact administrator.');
                return;
            }
            
            // Update session with current user data
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Session validation failed: ' . $e->getMessage());
            $this->destroySession();
        }
    }
    
    /**
     * Update last activity timestamp
     */
    private function updateLastActivity() {
        if (auth()) {
            $_SESSION['last_activity'] = time();
        }
    }
    
    /**
     * Create user session
     */
    private function createUserSession($user) {
        // Regenerate session ID for security
        session_regenerate_id(true);
        
        // Set session data
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();
        $_SESSION['last_regeneration'] = time();
    }
    
    /**
     * Destroy user session
     */
    private function destroySession() {
        // Clear session data
        unset($_SESSION['user_id']);
        unset($_SESSION['user_email']);
        unset($_SESSION['user_name']);
        unset($_SESSION['login_time']);
        unset($_SESSION['last_activity']);
        unset($_SESSION['last_regeneration']);
    }
    
    /**
     * Rotate remember token for security
     */
    private function rotateRememberToken($userId) {
        try {
            $newToken = bin2hex(random_bytes(32));
            $hashedToken = hash('sha256', $newToken);
            
            // Update database
            $userModel = new \App\Models\User();
            $userModel->update($userId, ['remember_token' => $hashedToken]);
            
            // Update cookie
            $expires = time() + $this->rememberTokenExpiry;
            setcookie('remember_token', $newToken, $expires, '/', '', false, true);
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Failed to rotate remember token: ' . $e->getMessage());
        }
    }
    
    /**
     * Require authentication
     */
    public function requireAuth($redirectTo = null) {
        if (!auth()) {
            // Store intended URL for redirect after login
            if (!$redirectTo) {
                $_SESSION['intended_url'] = currentUrl();
            }
            
            flash('warning', 'Please log in to access this page.');
            redirect($redirectTo ?: url('login'));
        }
    }
    
    /**
     * Require specific permission
     */
    public function requirePermission($permission, $redirectTo = null) {
        $this->requireAuth($redirectTo);
        
        if (!can($permission)) {
            flash('error', 'You do not have permission to access this page.');
            redirect($redirectTo ?: url('dashboard'));
        }
    }
    
    /**
     * Require specific role
     */
    public function requireRole($role, $redirectTo = null) {
        $this->requireAuth($redirectTo);
        
        if (!hasRole($role)) {
            flash('error', 'You do not have the required role to access this page.');
            redirect($redirectTo ?: url('dashboard'));
        }
    }
    
    /**
     * Check if user is guest (not authenticated)
     */
    public function requireGuest($redirectTo = null) {
        if (auth()) {
            redirect($redirectTo ?: url('dashboard'));
        }
    }
    
    /**
     * Validate CSRF token for forms
     */
    public function validateCsrf($token = null) {
        $token = $token ?: request('_token');
        
        if (!verifyCsrf($token)) {
            flash('error', 'Invalid security token. Please try again.');
            return false;
        }
        
        return true;
    }
    
    /**
     * Rate limiting for sensitive operations
     */
    public function rateLimit($action, $maxAttempts = 5, $timeWindow = 300) {
        $key = $action . '_' . $this->getClientIp();
        $attempts = $_SESSION['rate_limits'][$key] ?? [];
        
        // Clean old attempts
        $cutoff = time() - $timeWindow;
        $attempts = array_filter($attempts, function($timestamp) use ($cutoff) {
            return $timestamp > $cutoff;
        });
        
        // Check if limit exceeded
        if (count($attempts) >= $maxAttempts) {
            return false;
        }
        
        // Record current attempt
        $attempts[] = time();
        $_SESSION['rate_limits'][$key] = $attempts;
        
        return true;
    }
    
    /**
     * Log security event
     */
    private function logSecurityEvent($event, $userId, $metadata = []) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO audit_logs (table_name, record_id, action, user_id, ip_address, user_agent, metadata, created_at) 
                VALUES ('users', ?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $userId,
                strtoupper($event),
                $userId,
                $this->getClientIp(),
                $_SERVER['HTTP_USER_AGENT'] ?? '',
                json_encode($metadata)
            ]);
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error logging security event: ' . $e->getMessage());
        }
    }
    
    /**
     * Get client IP address
     */
    private function getClientIp() {
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
     * Get session information
     */
    public function getSessionInfo() {
        if (!auth()) {
            return null;
        }
        
        return [
            'user_id' => $_SESSION['user_id'],
            'user_email' => $_SESSION['user_email'],
            'user_name' => $_SESSION['user_name'],
            'login_time' => $_SESSION['login_time'],
            'last_activity' => $_SESSION['last_activity'],
            'session_duration' => time() - $_SESSION['login_time'],
            'inactive_time' => time() - $_SESSION['last_activity'],
            'ip_address' => $this->getClientIp(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ];
    }
    
    /**
     * Force logout user
     */
    public function forceLogout($reason = 'Security logout') {
        if (auth()) {
            $userId = $_SESSION['user_id'];
            
            // Log forced logout
            $this->logSecurityEvent('forced_logout', $userId, ['reason' => $reason]);
            
            // Clear remember token
            if (isset($_COOKIE['remember_token'])) {
                $this->clearRememberToken($_COOKIE['remember_token']);
                setcookie('remember_token', '', time() - 3600, '/', '', false, true);
            }
            
            // Destroy session
            $this->destroySession();
            
            flash('warning', $reason);
        }
    }
    
    /**
     * Clear remember token
     */
    private function clearRememberToken($token) {
        try {
            $hashedToken = hash('sha256', $token);
            $userModel = new \App\Models\User();
            $user = $userModel->where('remember_token', $hashedToken);
            
            if ($user) {
                $userModel->update($user['id'], ['remember_token' => null]);
            }
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error clearing remember token: ' . $e->getMessage());
        }
    }
}

/**
 * Global authentication middleware helper functions
 */

/**
 * Get authentication middleware instance
 */
function authMiddleware() {
    return AuthMiddleware::getInstance();
}

/**
 * Require authentication
 */
function requireAuth($redirectTo = null) {
    authMiddleware()->requireAuth($redirectTo);
}

/**
 * Require permission
 */
function requirePermission($permission, $redirectTo = null) {
    authMiddleware()->requirePermission($permission, $redirectTo);
}

/**
 * Require role
 */
function requireRole($role, $redirectTo = null) {
    authMiddleware()->requireRole($role, $redirectTo);
}

/**
 * Require guest (not authenticated)
 */
function requireGuest($redirectTo = null) {
    authMiddleware()->requireGuest($redirectTo);
}

/**
 * Validate CSRF token
 */
function validateCsrf($token = null) {
    return authMiddleware()->validateCsrf($token);
}

/**
 * Rate limiting
 */
function rateLimit($action, $maxAttempts = 5, $timeWindow = 300) {
    return authMiddleware()->rateLimit($action, $maxAttempts, $timeWindow);
}

/**
 * Get session information
 */
function getSessionInfo() {
    return authMiddleware()->getSessionInfo();
}

/**
 * Force logout
 */
function forceLogout($reason = 'Security logout') {
    authMiddleware()->forceLogout($reason);
}