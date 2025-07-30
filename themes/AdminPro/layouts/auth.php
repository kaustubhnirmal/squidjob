<?php
/**
 * AdminPro Theme - Authentication Layout
 * SquidJob Tender Management System
 */

// Prevent direct access
if (!defined('APP_ROOT')) {
    exit('Direct access denied');
}

$theme_config = theme_config();
$current_scheme = theme()->getColorScheme();
?>
<!DOCTYPE html>
<html lang="<?= config('app.locale', 'en') ?>" data-theme="<?= $current_scheme['name'] ?? 'default' ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    
    <!-- Page Title -->
    <title><?= isset($title) ? e($title) . ' - ' : '' ?><?= config('app.name') ?></title>
    <meta name="description" content="<?= isset($description) ? e($description) : 'Secure access to professional tender management system' ?>">
    
    <!-- Security Headers -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com;">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="<?= theme_asset('assets/images/favicon.ico') ?>">
    
    <!-- Preload Critical Resources -->
    <link rel="preload" href="<?= theme_asset('assets/fonts/inter/inter.woff2') ?>" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="<?= theme_asset('assets/css/adminpro.css') ?>" as="style">
    
    <!-- CSS Assets -->
    <link rel="stylesheet" href="<?= theme_asset('assets/css/bootstrap.min.css') ?>">
    <link rel="stylesheet" href="<?= theme_asset('assets/css/fontawesome.min.css') ?>">
    <link rel="stylesheet" href="<?= theme_asset('assets/css/adminpro.css') ?>">
    <link rel="stylesheet" href="<?= theme_asset('assets/css/auth.css') ?>">
    
    <!-- Theme Variables -->
    <style>
        :root {
            --primary-color: <?= $current_scheme['primary'] ?? '#2563eb' ?>;
            --secondary-color: <?= $current_scheme['secondary'] ?? '#64748b' ?>;
            --success-color: <?= $current_scheme['success'] ?? '#10b981' ?>;
            --danger-color: <?= $current_scheme['danger'] ?? '#ef4444' ?>;
            --warning-color: <?= $current_scheme['warning'] ?? '#f59e0b' ?>;
            --info-color: <?= $current_scheme['info'] ?? '#06b6d4' ?>;
            --light-color: <?= $current_scheme['light'] ?? '#f8fafc' ?>;
            --dark-color: <?= $current_scheme['dark'] ?? '#1e293b' ?>;
            --font-family: <?= $theme_config['settings']['typography']['font_family'] ?? 'Inter, sans-serif' ?>;
            --border-radius: 12px;
            --box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .auth-layout {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--info-color) 100%);
            min-height: 100vh;
            font-family: var(--font-family);
        }
        
        .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
        }
        
        .auth-card {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            overflow: hidden;
            width: 100%;
            max-width: 400px;
        }
        
        .auth-header {
            background: var(--primary-color);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .auth-logo {
            max-width: 120px;
            height: auto;
            margin-bottom: 1rem;
        }
        
        .auth-body {
            padding: 2rem;
        }
        
        .auth-footer {
            background: var(--light-color);
            padding: 1.5rem 2rem;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .form-floating {
            margin-bottom: 1rem;
        }
        
        .btn-auth {
            width: 100%;
            padding: 0.75rem;
            font-weight: 600;
            border-radius: 8px;
            transition: all 0.2s ease;
        }
        
        .btn-auth:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .auth-links {
            margin-top: 1.5rem;
            text-align: center;
        }
        
        .auth-links a {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
        }
        
        .auth-links a:hover {
            text-decoration: underline;
        }
        
        .lockout-info {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .password-strength {
            margin-top: 0.5rem;
        }
        
        .strength-meter {
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
        }
        
        .strength-fill {
            height: 100%;
            transition: all 0.3s ease;
            border-radius: 2px;
        }
        
        .strength-weak { background: var(--danger-color); width: 25%; }
        .strength-fair { background: var(--warning-color); width: 50%; }
        .strength-good { background: var(--info-color); width: 75%; }
        .strength-strong { background: var(--success-color); width: 100%; }
        
        @media (max-width: 576px) {
            .auth-container {
                padding: 1rem;
            }
            
            .auth-header,
            .auth-body,
            .auth-footer {
                padding: 1.5rem;
            }
        }
    </style>
    
    <!-- CSRF Token -->
    <meta name="csrf-token" content="<?= csrfToken() ?>">
    
    <!-- Auth Configuration -->
    <script>
        window.AuthConfig = {
            baseUrl: '<?= url() ?>',
            csrfToken: '<?= csrfToken() ?>',
            passwordStrength: {
                minLength: <?= config('app.security.password_min_length', 8) ?>,
                requireUppercase: <?= config('app.security.password_require_uppercase', true) ? 'true' : 'false' ?>,
                requireLowercase: <?= config('app.security.password_require_lowercase', true) ? 'true' : 'false' ?>,
                requireNumbers: <?= config('app.security.password_require_numbers', true) ? 'true' : 'false' ?>,
                requireSymbols: <?= config('app.security.password_require_symbols', true) ? 'true' : 'false' ?>
            }
        };
    </script>
</head>
<body class="auth-layout">
    
    <!-- Skip to Content -->
    <a href="#main-content" class="skip-to-content">Skip to main content</a>
    
    <!-- Authentication Container -->
    <div class="auth-container">
        <div class="auth-card">
            
            <!-- Header -->
            <div class="auth-header">
                <img src="<?= theme_asset('assets/images/logo-adminpro-dark.svg') ?>" 
                     alt="<?= config('app.name') ?>" 
                     class="auth-logo">
                <h1 class="h4 mb-0"><?= config('app.name') ?></h1>
                <p class="mb-0 opacity-75">Professional Tender Management</p>
            </div>
            
            <!-- Body -->
            <div class="auth-body" id="main-content" role="main">
                
                <!-- Flash Messages -->
                <?php if (isset($_SESSION['flash'])): ?>
                    <div class="flash-messages">
                        <?php foreach ($_SESSION['flash'] as $type => $message): ?>
                            <div class="alert alert-<?= $type === 'error' ? 'danger' : $type ?> alert-dismissible fade show" role="alert">
                                <i class="fas fa-<?= getFlashIcon($type) ?> me-2"></i>
                                <?= e($message) ?>
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>
                            <?php unset($_SESSION['flash'][$type]); ?>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
                
                <!-- Lockout Information -->
                <?php if (isset($lockout_info) && $lockout_info['is_locked']): ?>
                    <div class="lockout-info">
                        <i class="fas fa-lock me-2"></i>
                        <strong>Account Temporarily Locked</strong>
                        <p class="mb-0 mt-1">
                            Too many failed login attempts. Please try again in 
                            <?= $lockout_info['minutes_remaining'] ?> minutes.
                        </p>
                    </div>
                <?php endif; ?>
                
                <!-- Validation Errors -->
                <?php if (isset($_SESSION['validation_errors'])): ?>
                    <div class="alert alert-danger">
                        <ul class="mb-0">
                            <?php foreach ($_SESSION['validation_errors'] as $field => $errors): ?>
                                <?php foreach ($errors as $error): ?>
                                    <li><?= e($error) ?></li>
                                <?php endforeach; ?>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                    <?php unset($_SESSION['validation_errors']); ?>
                <?php endif; ?>
                
                <!-- Page Content -->
                <?= $content ?? '' ?>
                
            </div>
            
            <!-- Footer -->
            <div class="auth-footer">
                <p class="text-muted mb-0">
                    &copy; <?= date('Y') ?> <?= config('app.name') ?>. All rights reserved.
                </p>
                <div class="mt-2">
                    <a href="<?= url('privacy') ?>" class="text-muted small me-3">Privacy Policy</a>
                    <a href="<?= url('terms') ?>" class="text-muted small">Terms of Service</a>
                </div>
            </div>
            
        </div>
    </div>
    
    <!-- JavaScript Assets -->
    <script src="<?= theme_asset('assets/js/bootstrap.bundle.min.js') ?>"></script>
    <script src="<?= theme_asset('assets/js/jquery.min.js') ?>"></script>
    
    <!-- Authentication JavaScript -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // CSRF token setup for AJAX requests
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            });
            
            // Password strength checker
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.addEventListener('input', function() {
                    checkPasswordStrength(this.value);
                });
            }
            
            // Form validation
            const authForm = document.querySelector('.auth-form');
            if (authForm) {
                authForm.addEventListener('submit', function(e) {
                    if (!validateForm(this)) {
                        e.preventDefault();
                    }
                });
            }
            
            // Auto-hide flash messages
            setTimeout(function() {
                $('.alert').fadeOut('slow');
            }, 5000);
            
            // Focus first input
            const firstInput = document.querySelector('input:not([type="hidden"])');
            if (firstInput) {
                firstInput.focus();
            }
        });
        
        // Password strength checker
        function checkPasswordStrength(password) {
            const strengthMeter = document.querySelector('.strength-meter');
            const strengthFill = document.querySelector('.strength-fill');
            const strengthText = document.querySelector('.strength-text');
            
            if (!strengthMeter || !strengthFill || !strengthText) return;
            
            let score = 0;
            let feedback = [];
            
            // Length check
            if (password.length >= 8) score++;
            else feedback.push('At least 8 characters');
            
            // Uppercase check
            if (/[A-Z]/.test(password)) score++;
            else feedback.push('One uppercase letter');
            
            // Lowercase check
            if (/[a-z]/.test(password)) score++;
            else feedback.push('One lowercase letter');
            
            // Number check
            if (/[0-9]/.test(password)) score++;
            else feedback.push('One number');
            
            // Special character check
            if (/[^A-Za-z0-9]/.test(password)) score++;
            else feedback.push('One special character');
            
            // Update strength meter
            strengthFill.className = 'strength-fill';
            if (score <= 1) {
                strengthFill.classList.add('strength-weak');
                strengthText.textContent = 'Weak';
                strengthText.className = 'strength-text text-danger';
            } else if (score <= 2) {
                strengthFill.classList.add('strength-fair');
                strengthText.textContent = 'Fair';
                strengthText.className = 'strength-text text-warning';
            } else if (score <= 3) {
                strengthFill.classList.add('strength-good');
                strengthText.textContent = 'Good';
                strengthText.className = 'strength-text text-info';
            } else {
                strengthFill.classList.add('strength-strong');
                strengthText.textContent = 'Strong';
                strengthText.className = 'strength-text text-success';
            }
            
            // Show feedback
            const feedbackElement = document.querySelector('.password-feedback');
            if (feedbackElement && feedback.length > 0) {
                feedbackElement.innerHTML = 'Missing: ' + feedback.join(', ');
                feedbackElement.style.display = 'block';
            } else if (feedbackElement) {
                feedbackElement.style.display = 'none';
            }
        }
        
        // Form validation
        function validateForm(form) {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required]');
            
            inputs.forEach(function(input) {
                if (!input.value.trim()) {
                    showFieldError(input, 'This field is required');
                    isValid = false;
                } else {
                    clearFieldError(input);
                }
                
                // Email validation
                if (input.type === 'email' && input.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        showFieldError(input, 'Please enter a valid email address');
                        isValid = false;
                    }
                }
                
                // Password confirmation
                if (input.name === 'password_confirmation') {
                    const passwordInput = form.querySelector('input[name="password"]');
                    if (passwordInput && input.value !== passwordInput.value) {
                        showFieldError(input, 'Passwords do not match');
                        isValid = false;
                    }
                }
            });
            
            return isValid;
        }
        
        // Show field error
        function showFieldError(input, message) {
            clearFieldError(input);
            input.classList.add('is-invalid');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = message;
            input.parentNode.appendChild(errorDiv);
        }
        
        // Clear field error
        function clearFieldError(input) {
            input.classList.remove('is-invalid');
            const errorDiv = input.parentNode.querySelector('.invalid-feedback');
            if (errorDiv) {
                errorDiv.remove();
            }
        }
        
        // Show/hide password toggle
        function togglePassword(button) {
            const input = button.parentNode.querySelector('input');
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        }
    </script>
    
    <!-- Additional Scripts -->
    <?php if (isset($scripts)): ?>
        <?= $scripts ?>
    <?php endif; ?>
    
</body>
</html>

<?php
/**
 * Helper function to get flash message icon
 */
function getFlashIcon($type) {
    $icons = [
        'success' => 'check-circle',
        'error' => 'exclamation-triangle',
        'warning' => 'exclamation-triangle',
        'info' => 'info-circle',
        'danger' => 'exclamation-triangle'
    ];
    return $icons[$type] ?? 'info-circle';
}
?>