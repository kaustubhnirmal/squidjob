<?php
/**
 * Authentication Routes
 * SquidJob Tender Management System
 * 
 * Handles all authentication-related routes with security middleware
 */

use App\Core\Router;
use App\Controllers\AuthController;

$router = new Router();

// Guest routes (require user to NOT be authenticated)
$router->group(['middleware' => ['guest']], function($router) {
    
    // Login routes
    $router->get('/login', [AuthController::class, 'showLogin']);
    $router->post('/auth/login', [AuthController::class, 'processLogin']);
    
    // Registration routes (if enabled)
    $router->get('/register', [AuthController::class, 'showRegister']);
    $router->post('/auth/register', [AuthController::class, 'processRegister']);
    
    // Password reset routes
    $router->get('/forgot-password', [AuthController::class, 'showForgotPassword']);
    $router->post('/auth/forgot-password', [AuthController::class, 'processForgotPassword']);
    $router->get('/reset-password', [AuthController::class, 'showResetPassword']);
    $router->post('/auth/reset-password', [AuthController::class, 'processResetPassword']);
    
    // Email verification routes
    $router->get('/verify-email', [AuthController::class, 'verifyEmail']);
    $router->post('/auth/resend-verification', [AuthController::class, 'resendVerification']);
});

// Authenticated routes (require user to be logged in)
$router->group(['middleware' => ['auth']], function($router) {
    
    // Logout route
    $router->post('/auth/logout', [AuthController::class, 'logout']);
    $router->get('/logout', [AuthController::class, 'logout']); // GET fallback for convenience
    
    // Profile and account management
    $router->get('/profile', [AuthController::class, 'showProfile']);
    $router->post('/auth/update-profile', [AuthController::class, 'updateProfile']);
    $router->post('/auth/change-password', [AuthController::class, 'changePassword']);
    
    // Two-factor authentication (if implemented)
    $router->get('/2fa/setup', [AuthController::class, 'show2FASetup']);
    $router->post('/auth/2fa/enable', [AuthController::class, 'enable2FA']);
    $router->post('/auth/2fa/disable', [AuthController::class, 'disable2FA']);
});

// API routes for AJAX requests
$router->group(['prefix' => '/api/auth'], function($router) {
    
    // CSRF token endpoint
    $router->get('/csrf-token', function() {
        header('Content-Type: application/json');
        echo json_encode(['token' => csrfToken()]);
    });
    
    // Check authentication status
    $router->get('/status', function() {
        header('Content-Type: application/json');
        echo json_encode([
            'authenticated' => auth(),
            'user' => auth() ? [
                'id' => user()['id'],
                'name' => user()['first_name'] . ' ' . user()['last_name'],
                'email' => user()['email']
            ] : null
        ]);
    });
    
    // Password strength checker
    $router->post('/check-password-strength', function() {
        if (!verifyCsrf(request('_token'))) {
            http_response_code(403);
            echo json_encode(['error' => 'Invalid CSRF token']);
            return;
        }
        
        $password = request('password');
        $authController = new AuthController();
        
        // Use reflection to access private method
        $reflection = new ReflectionClass($authController);
        $method = $reflection->getMethod('validatePasswordStrength');
        $method->setAccessible(true);
        
        $errors = $method->invoke($authController, $password);
        
        header('Content-Type: application/json');
        echo json_encode([
            'valid' => empty($errors),
            'errors' => $errors,
            'strength' => empty($errors) ? 'strong' : (count($errors) <= 2 ? 'medium' : 'weak')
        ]);
    });
    
    // Check email availability
    $router->post('/check-email', function() {
        if (!verifyCsrf(request('_token'))) {
            http_response_code(403);
            echo json_encode(['error' => 'Invalid CSRF token']);
            return;
        }
        
        $email = sanitize(request('email'));
        $userModel = new \App\Models\User();
        $exists = $userModel->where('email', $email) !== null;
        
        header('Content-Type: application/json');
        echo json_encode([
            'available' => !$exists,
            'message' => $exists ? 'Email address is already registered' : 'Email address is available'
        ]);
    });
});

// Admin routes for user management
$router->group(['prefix' => '/admin/auth', 'middleware' => ['auth', 'role:admin']], function($router) {
    
    // User management
    $router->get('/users', [AuthController::class, 'listUsers']);
    $router->get('/users/{id}', [AuthController::class, 'showUser']);
    $router->post('/users/{id}/activate', [AuthController::class, 'activateUser']);
    $router->post('/users/{id}/deactivate', [AuthController::class, 'deactivateUser']);
    $router->post('/users/{id}/reset-password', [AuthController::class, 'adminResetPassword']);
    
    // Role management
    $router->post('/users/{id}/assign-role', [AuthController::class, 'assignRole']);
    $router->post('/users/{id}/remove-role', [AuthController::class, 'removeRole']);
    
    // Security logs
    $router->get('/security-logs', [AuthController::class, 'securityLogs']);
    $router->get('/login-attempts', [AuthController::class, 'loginAttempts']);
    
    // System security settings
    $router->get('/security-settings', [AuthController::class, 'securitySettings']);
    $router->post('/security-settings', [AuthController::class, 'updateSecuritySettings']);
});

// Webhook routes for external integrations
$router->group(['prefix' => '/webhooks/auth'], function($router) {
    
    // Password breach notification (from services like HaveIBeenPwned)
    $router->post('/password-breach', [AuthController::class, 'handlePasswordBreach']);
    
    // Account security alerts
    $router->post('/security-alert', [AuthController::class, 'handleSecurityAlert']);
});

return $router;