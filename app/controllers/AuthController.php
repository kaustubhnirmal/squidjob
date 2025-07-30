<?php
/**
 * Authentication Controller
 * SquidJob Tender Management System
 *
 * Handles user authentication with enhanced security features
 */

namespace App\Controllers;

use App\Models\User;
use App\Core\BaseController;
use App\Services\EmailService;

class AuthController {
    
    private $userModel;
    private $maxLoginAttempts = 5;
    private $lockoutDuration = 900; // 15 minutes
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    /**
     * Show login form
     */
    public function showLogin() {
        // Redirect if already authenticated
        if (auth()) {
            redirect(url('dashboard'));
        }
        
        // Check for account lockout
        $lockoutInfo = $this->checkAccountLockout();
        
        $data = [
            'title' => 'Login - ' . config('app.name'),
            'lockout_info' => $lockoutInfo,
            'csrf_token' => csrfToken()
        ];
        
        view('auth.login', $data);
    }
    
    /**
     * Process login attempt
     */
    public function processLogin() {
        try {
            // Verify CSRF token
            if (!verifyCsrf(request('_token'))) {
                flash('error', 'Invalid security token. Please try again.');
                redirect(url('login'));
            }
            
            // Get and validate input
            $email = sanitize(request('email'));
            $password = request('password');
            $remember = request('remember') === 'on';
            
            // Validate required fields
            $errors = validate([
                'email' => $email,
                'password' => $password
            ], [
                'email' => 'required|email',
                'password' => 'required|min:6'
            ]);
            
            if (!empty($errors)) {
                flash('error', 'Please correct the errors below.');
                $_SESSION['validation_errors'] = $errors;
                $_SESSION['old_input'] = ['email' => $email];
                redirect(url('login'));
            }
            
            // Check for account lockout
            if ($this->isAccountLocked($email)) {
                $lockoutInfo = $this->getAccountLockoutInfo($email);
                flash('error', "Account temporarily locked due to multiple failed login attempts. Try again in {$lockoutInfo['minutes_remaining']} minutes.");
                redirect(url('login'));
            }
            
            // Attempt authentication
            $user = $this->authenticateUser($email, $password);
            
            if (!$user) {
                // Record failed attempt
                $this->recordFailedAttempt($email);
                
                // Check if account should be locked
                $attemptCount = $this->getFailedAttemptCount($email);
                if ($attemptCount >= $this->maxLoginAttempts) {
                    $this->lockAccount($email);
                    flash('error', 'Account temporarily locked due to multiple failed login attempts.');
                } else {
                    $remainingAttempts = $this->maxLoginAttempts - $attemptCount;
                    flash('error', "Invalid credentials. {$remainingAttempts} attempts remaining.");
                }
                
                $_SESSION['old_input'] = ['email' => $email];
                redirect(url('login'));
            }
            
            // Check if user account is active
            if ($user['status'] !== 'active') {
                flash('error', 'Your account is not active. Please contact administrator.');
                $_SESSION['old_input'] = ['email' => $email];
                redirect(url('login'));
            }
            
            // Check if email is verified (if required)
            if (!$user['email_verified'] && config('app.require_email_verification', false)) {
                flash('error', 'Please verify your email address before logging in.');
                $_SESSION['old_input'] = ['email' => $email];
                redirect(url('login'));
            }
            
            // Clear failed attempts
            $this->clearFailedAttempts($email);
            
            // Create session
            $this->createUserSession($user, $remember);
            
            // Update last login
            $this->updateLastLogin($user['id']);
            
            // Execute login hook
            do_hook('user_login', $user);
            
            // Log successful login
            $this->logSecurityEvent('login_success', $user['id'], [
                'ip_address' => $this->getClientIp(),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
            ]);
            
            flash('success', 'Welcome back, ' . $user['first_name'] . '!');
            
            // Redirect to intended page or dashboard
            $redirectTo = $_SESSION['intended_url'] ?? url('dashboard');
            unset($_SESSION['intended_url']);
            
            redirect($redirectTo);
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Login error: ' . $e->getMessage());
            flash('error', 'An error occurred during login. Please try again.');
            redirect(url('login'));
        }
    }
    
    /**
     * Process logout
     */
    public function logout() {
        try {
            // Verify CSRF token for logout
            if (!verifyCsrf(request('_token'))) {
                flash('error', 'Invalid security token.');
                return back();
            }
            
            $userId = user()['id'] ?? null;
            
            // Log logout event
            if ($userId) {
                $this->logSecurityEvent('logout', $userId, [
                    'ip_address' => $this->getClientIp(),
                    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
                ]);
            }
            
            // Clear remember token if exists
            if (isset($_COOKIE['remember_token'])) {
                $this->clearRememberToken($_COOKIE['remember_token']);
                setcookie('remember_token', '', time() - 3600, '/', '', false, true);
            }
            
            // Destroy session
            $this->destroyUserSession();
            
            flash('success', 'You have been logged out successfully.');
            redirect(url('login'));
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Logout error: ' . $e->getMessage());
            flash('error', 'An error occurred during logout.');
            redirect(url('dashboard'));
        }
    }
    
    /**
     * Show registration form
     */
    public function showRegister() {
        // Redirect if already authenticated
        if (auth()) {
            redirect(url('dashboard'));
        }
        
        // Check if registration is enabled
        if (!config('app.allow_registration', true)) {
            flash('error', 'Registration is currently disabled.');
            redirect(url('login'));
        }
        
        $data = [
            'title' => 'Register - ' . config('app.name'),
            'csrf_token' => csrfToken()
        ];
        
        view('auth.register', $data);
    }
    
    /**
     * Process registration
     */
    public function processRegister() {
        try {
            // Check if registration is enabled
            if (!config('app.allow_registration', true)) {
                flash('error', 'Registration is currently disabled.');
                redirect(url('login'));
            }
            
            // Verify CSRF token
            if (!verifyCsrf(request('_token'))) {
                flash('error', 'Invalid security token. Please try again.');
                return back();
            }
            
            // Get and validate input
            $input = [
                'first_name' => sanitize(request('first_name')),
                'last_name' => sanitize(request('last_name')),
                'email' => sanitize(request('email')),
                'password' => request('password'),
                'password_confirmation' => request('password_confirmation'),
                'phone' => sanitize(request('phone')),
                'department' => sanitize(request('department')),
                'designation' => sanitize(request('designation'))
            ];
            
            // Validation rules
            $rules = [
                'first_name' => 'required|max:100',
                'last_name' => 'required|max:100',
                'email' => 'required|email|max:255',
                'password' => 'required|min:8',
                'password_confirmation' => 'required',
                'phone' => 'max:20',
                'department' => 'max:100',
                'designation' => 'max:100'
            ];
            
            $errors = validate($input, $rules);
            
            // Check password confirmation
            if ($input['password'] !== $input['password_confirmation']) {
                $errors['password_confirmation'] = ['Password confirmation does not match'];
            }
            
            // Check if email already exists
            if ($this->userModel->where('email', $input['email'])) {
                $errors['email'] = ['Email address is already registered'];
            }
            
            // Validate password strength
            $passwordErrors = $this->validatePasswordStrength($input['password']);
            if (!empty($passwordErrors)) {
                $errors['password'] = $passwordErrors;
            }
            
            if (!empty($errors)) {
                flash('error', 'Please correct the errors below.');
                $_SESSION['validation_errors'] = $errors;
                $_SESSION['old_input'] = $input;
                return back();
            }
            
            // Create user account
            $userData = [
                'first_name' => $input['first_name'],
                'last_name' => $input['last_name'],
                'email' => $input['email'],
                'password_hash' => hashPassword($input['password']),
                'phone' => $input['phone'],
                'department' => $input['department'],
                'designation' => $input['designation'],
                'status' => 'active',
                'email_verified' => !config('app.require_email_verification', false),
                'password_changed_at' => date('Y-m-d H:i:s')
            ];
            
            // Generate email verification token if required
            if (config('app.require_email_verification', false)) {
                $userData['email_verification_token'] = bin2hex(random_bytes(32));
                $userData['status'] = 'inactive';
            }
            
            $user = $this->userModel->create($userData);
            
            if (!$user) {
                flash('error', 'Failed to create account. Please try again.');
                return back();
            }
            
            // Assign default role
            $this->assignDefaultRole($user['id']);
            
            // Send email verification if required
            if (config('app.require_email_verification', false)) {
                $this->sendEmailVerification($user);
                flash('success', 'Account created successfully! Please check your email to verify your account.');
                redirect(url('login'));
            } else {
                // Auto-login if email verification not required
                $this->createUserSession($user, false);
                
                // Log registration
                $this->logSecurityEvent('registration', $user['id'], [
                    'ip_address' => $this->getClientIp(),
                    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
                ]);
                
                flash('success', 'Account created successfully! Welcome to ' . config('app.name') . '!');
                redirect(url('dashboard'));
            }
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Registration error: ' . $e->getMessage());
            flash('error', 'An error occurred during registration. Please try again.');
            return back();
        }
    }
    
    /**
     * Show forgot password form
     */
    public function showForgotPassword() {
        if (auth()) {
            redirect(url('dashboard'));
        }
        
        $data = [
            'title' => 'Forgot Password - ' . config('app.name'),
            'csrf_token' => csrfToken()
        ];
        
        view('auth.forgot-password', $data);
    }
    
    /**
     * Process forgot password request
     */
    public function processForgotPassword() {
        try {
            // Verify CSRF token
            if (!verifyCsrf(request('_token'))) {
                flash('error', 'Invalid security token. Please try again.');
                return back();
            }
            
            // Rate limiting for password reset requests
            if (!rateLimit('password_reset', 3, 900)) { // 3 attempts per 15 minutes
                flash('error', 'Too many password reset attempts. Please try again later.');
                return back();
            }
            
            $email = sanitize(request('email'));
            
            // Validate email
            $errors = validate(['email' => $email], ['email' => 'required|email']);
            if (!empty($errors)) {
                flash('error', 'Please enter a valid email address.');
                return back();
            }
            
            // Find user
            $user = $this->userModel->where('email', $email);
            
            // Always show success message for security (don't reveal if email exists)
            flash('success', 'If an account with that email exists, you will receive password reset instructions.');
            
            if ($user && $user['status'] === 'active') {
                // Generate reset token
                $resetToken = bin2hex(random_bytes(32));
                $resetExpires = date('Y-m-d H:i:s', strtotime('+1 hour'));
                
                // Update user with reset token
                $this->userModel->update($user['id'], [
                    'password_reset_token' => $resetToken,
                    'password_reset_expires' => $resetExpires
                ]);
                
                // Send reset email using EmailService
                $emailService = new EmailService();
                $emailService->sendPasswordResetEmail($user, $resetToken);
                
                // Log password reset request
                $this->logSecurityEvent('password_reset_request', $user['id'], [
                    'ip_address' => $this->getClientIp(),
                    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
                ]);
            }
            
            redirect(url('login'));
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Forgot password error: ' . $e->getMessage());
            flash('error', 'An error occurred. Please try again.');
            return back();
        }
    }
    
    /**
     * Show password reset form
     */
    public function showResetPassword() {
        $token = request('token');
        
        if (!$token) {
            flash('error', 'Invalid password reset link.');
            redirect(url('login'));
        }
        
        // Verify token exists and is not expired
        $user = $this->userModel->query(
            "SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW() AND status = 'active'",
            [$token]
        );
        
        if (empty($user)) {
            flash('error', 'Password reset link has expired or is invalid.');
            redirect(url('login'));
        }
        
        $data = [
            'title' => 'Reset Password - ' . config('app.name'),
            'token' => $token
        ];
        
        view('auth.reset-password', $data);
    }
    
    /**
     * Process password reset
     */
    public function processResetPassword() {
        try {
            // Verify CSRF token
            if (!verifyCsrf(request('_token'))) {
                flash('error', 'Invalid security token. Please try again.');
                return back();
            }
            
            $token = request('token');
            $password = request('password');
            $passwordConfirmation = request('password_confirmation');
            
            // Validate input
            $errors = validate([
                'password' => $password,
                'password_confirmation' => $passwordConfirmation
            ], [
                'password' => 'required|min:8',
                'password_confirmation' => 'required'
            ]);
            
            // Check password confirmation
            if ($password !== $passwordConfirmation) {
                $errors['password_confirmation'] = ['Password confirmation does not match'];
            }
            
            // Validate password strength
            $passwordErrors = $this->validatePasswordStrength($password);
            if (!empty($passwordErrors)) {
                $errors['password'] = $passwordErrors;
            }
            
            if (!empty($errors)) {
                flash('error', 'Please correct the errors below.');
                $_SESSION['validation_errors'] = $errors;
                return back();
            }
            
            // Find user with valid token
            $users = $this->userModel->query(
                "SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW() AND status = 'active'",
                [$token]
            );
            
            if (empty($users)) {
                flash('error', 'Password reset link has expired or is invalid.');
                redirect(url('login'));
            }
            
            $user = $users[0];
            
            // Update password
            $updated = $this->userModel->update($user['id'], [
                'password_hash' => hashPassword($password),
                'password_reset_token' => null,
                'password_reset_expires' => null,
                'password_changed_at' => date('Y-m-d H:i:s')
            ]);
            
            if ($updated) {
                // Log password reset success
                $this->logSecurityEvent('password_reset_success', $user['id'], [
                    'ip_address' => $this->getClientIp(),
                    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
                ]);
                
                flash('success', 'Your password has been reset successfully. You can now sign in with your new password.');
                redirect(url('login'));
            } else {
                flash('error', 'Failed to reset password. Please try again.');
                return back();
            }
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Password reset error: ' . $e->getMessage());
            flash('error', 'An error occurred while resetting your password. Please try again.');
            return back();
        }
    }
    
    /**
     * Authenticate user credentials
     */
    private function authenticateUser($email, $password) {
        $user = $this->userModel->where('email', $email);
        
        if (!$user) {
            return false;
        }
        
        if (!verifyPassword($password, $user['password_hash'])) {
            return false;
        }
        
        return $user;
    }
    
    /**
     * Create user session
     */
    private function createUserSession($user, $remember = false) {
        // Regenerate session ID for security
        session_regenerate_id(true);
        
        // Set session data
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();
        
        // Set remember me cookie if requested
        if ($remember) {
            $this->setRememberToken($user['id']);
        }
    }
    
    /**
     * Destroy user session
     */
    private function destroyUserSession() {
        // Clear session data
        $_SESSION = [];
        
        // Destroy session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        // Destroy session
        session_destroy();
        
        // Start new session
        session_start();
    }
    
    /**
     * Set remember me token
     */
    private function setRememberToken($userId) {
        $token = bin2hex(random_bytes(32));
        $expires = time() + (30 * 24 * 60 * 60); // 30 days
        
        // Store token in database
        $this->userModel->update($userId, [
            'remember_token' => hash('sha256', $token)
        ]);
        
        // Set cookie
        setcookie('remember_token', $token, $expires, '/', '', false, true);
    }
    
    /**
     * Clear remember token
     */
    private function clearRememberToken($token) {
        try {
            $hashedToken = hash('sha256', $token);
            $user = $this->userModel->where('remember_token', $hashedToken);
            
            if ($user) {
                $this->userModel->update($user['id'], [
                    'remember_token' => null
                ]);
            }
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error clearing remember token: ' . $e->getMessage());
        }
    }
    
    /**
     * Check account lockout status
     */
    private function checkAccountLockout() {
        $ip = $this->getClientIp();
        
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                SELECT locked_until 
                FROM login_attempts 
                WHERE ip_address = ? AND locked_until > NOW()
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $stmt->execute([$ip]);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($result) {
                $minutesRemaining = ceil((strtotime($result['locked_until']) - time()) / 60);
                return [
                    'is_locked' => true,
                    'minutes_remaining' => $minutesRemaining
                ];
            }
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error checking account lockout: ' . $e->getMessage());
        }
        
        return ['is_locked' => false];
    }
    
    /**
     * Check if account is locked
     */
    private function isAccountLocked($email) {
        $lockoutInfo = $this->checkAccountLockout();
        return $lockoutInfo['is_locked'];
    }
    
    /**
     * Get account lockout info
     */
    private function getAccountLockoutInfo($email) {
        return $this->checkAccountLockout();
    }
    
    /**
     * Record failed login attempt
     */
    private function recordFailedAttempt($email) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO login_attempts (email, ip_address, user_agent, success, created_at) 
                VALUES (?, ?, ?, 0, NOW())
            ");
            $stmt->execute([
                $email,
                $this->getClientIp(),
                $_SERVER['HTTP_USER_AGENT'] ?? ''
            ]);
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error recording failed attempt: ' . $e->getMessage());
        }
    }
    
    /**
     * Get failed attempt count
     */
    private function getFailedAttemptCount($email) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                SELECT COUNT(*) 
                FROM login_attempts 
                WHERE email = ? AND success = 0 AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            ");
            $stmt->execute([$email]);
            return $stmt->fetchColumn();
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error getting failed attempt count: ' . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Lock account
     */
    private function lockAccount($email) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                UPDATE login_attempts 
                SET locked_until = DATE_ADD(NOW(), INTERVAL ? SECOND) 
                WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            ");
            $stmt->execute([$this->lockoutDuration, $email]);
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error locking account: ' . $e->getMessage());
        }
    }
    
    /**
     * Clear failed attempts
     */
    private function clearFailedAttempts($email) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                DELETE FROM login_attempts 
                WHERE email = ? AND success = 0
            ");
            $stmt->execute([$email]);
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error clearing failed attempts: ' . $e->getMessage());
        }
    }
    
    /**
     * Update last login timestamp
     */
    private function updateLastLogin($userId) {
        try {
            $this->userModel->update($userId, [
                'last_login' => date('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error updating last login: ' . $e->getMessage());
        }
    }
    
    /**
     * Validate password strength
     */
    private function validatePasswordStrength($password) {
        $errors = [];
        
        if (strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters long';
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter';
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter';
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number';
        }
        
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $errors[] = 'Password must contain at least one special character';
        }
        
        return $errors;
    }
    
    /**
     * Assign default role to new user
     */
    private function assignDefaultRole($userId) {
        try {
            $defaultRoleId = config('app.roles.user.id', 21);
            
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at) 
                VALUES (?, ?, 1, NOW())
            ");
            $stmt->execute([$userId, $defaultRoleId]);
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error assigning default role: ' . $e->getMessage());
        }
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
                $metadata['ip_address'] ?? $this->getClientIp(),
                $metadata['user_agent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? '',
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
     * Send email verification
     */
    private function sendEmailVerification($user) {
        try {
            $emailService = new EmailService();
            return $emailService->sendEmailVerificationEmail($user, $user['email_verification_token']);
        } catch (\Exception $e) {
            logMessage('ERROR', 'Failed to send email verification: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send welcome email for new users
     */
    private function sendWelcomeEmail($user) {
        try {
            $emailService = new EmailService();
            return $emailService->sendWelcomeEmail($user);
        } catch (\Exception $e) {
            logMessage('ERROR', 'Failed to send welcome email: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send account lockout notification
     */
    private function sendLockoutNotification($user, $lockoutDuration) {
        try {
            $emailService = new EmailService();
            return $emailService->sendAccountLockoutNotification($user, $lockoutDuration);
        } catch (\Exception $e) {
            logMessage('ERROR', 'Failed to send lockout notification: ' . $e->getMessage());
            return false;
        }
    }
}