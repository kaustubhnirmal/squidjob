<?php
/**
 * Login Modal View
 * SquidJob Tender Management System
 * 
 * Professional login modal with purple theme and security features
 */

// Get flash messages
$error = getFlash('error');
$success = getFlash('success');
$warning = getFlash('warning');
$validationErrors = $_SESSION['validation_errors'] ?? [];
$oldInput = $_SESSION['old_input'] ?? [];

// Clear old input and validation errors after displaying
unset($_SESSION['validation_errors'], $_SESSION['old_input']);
?>

<!-- Login Modal -->
<div id="loginModal" class="auth-modal" style="display: none;">
    <div class="auth-modal-overlay" onclick="closeLoginModal()"></div>
    <div class="auth-modal-container">
        <div class="auth-modal-content">
            <!-- Modal Header -->
            <div class="auth-modal-header">
                <div class="auth-logo">
                    <img src="<?php echo asset('images/squidjob-logo.svg'); ?>" alt="SquidJob Logo" width="32" height="32">
                    <span class="auth-title">Sign In to SquidJob</span>
                </div>
                <button type="button" class="auth-modal-close" onclick="closeLoginModal()" aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>

            <!-- Alert Messages -->
            <?php if ($error): ?>
                <div class="auth-alert auth-alert-error">
                    <svg class="auth-alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <?php echo e($error); ?>
                </div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="auth-alert auth-alert-success">
                    <svg class="auth-alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <?php echo e($success); ?>
                </div>
            <?php endif; ?>

            <?php if ($warning): ?>
                <div class="auth-alert auth-alert-warning">
                    <svg class="auth-alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                    <?php echo e($warning); ?>
                </div>
            <?php endif; ?>

            <!-- Login Form -->
            <form class="auth-form" id="loginForm" action="<?php echo url('auth/login'); ?>" method="POST">
                <?php echo csrfField(); ?>
                
                <!-- Email Field -->
                <div class="auth-form-group">
                    <label for="email" class="auth-form-label">
                        <svg class="auth-form-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        Email Address
                    </label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        class="auth-form-input <?php echo isset($validationErrors['email']) ? 'auth-form-input-error' : ''; ?>"
                        value="<?php echo e($oldInput['email'] ?? ''); ?>"
                        placeholder="Enter your email address"
                        required 
                        autocomplete="email"
                        autofocus
                    >
                    <?php if (isset($validationErrors['email'])): ?>
                        <div class="auth-form-error">
                            <?php echo e(implode(', ', $validationErrors['email'])); ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Password Field -->
                <div class="auth-form-group">
                    <label for="password" class="auth-form-label">
                        <svg class="auth-form-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                        Password
                    </label>
                    <div class="auth-password-wrapper">
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            class="auth-form-input <?php echo isset($validationErrors['password']) ? 'auth-form-input-error' : ''; ?>"
                            placeholder="Enter your password"
                            required 
                            autocomplete="current-password"
                        >
                        <button type="button" class="auth-password-toggle" onclick="togglePasswordVisibility('password')" aria-label="Toggle password visibility">
                            <svg class="auth-password-icon-show" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                            <svg class="auth-password-icon-hide" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                            </svg>
                        </button>
                    </div>
                    <?php if (isset($validationErrors['password'])): ?>
                        <div class="auth-form-error">
                            <?php echo e(implode(', ', $validationErrors['password'])); ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Remember Me -->
                <div class="auth-form-group">
                    <label class="auth-checkbox-label">
                        <input type="checkbox" name="remember" class="auth-checkbox" <?php echo ($oldInput['remember'] ?? false) ? 'checked' : ''; ?>>
                        <span class="auth-checkbox-custom"></span>
                        <span class="auth-checkbox-text">Remember me for 30 days</span>
                    </label>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="auth-btn auth-btn-primary" id="loginSubmitBtn">
                    <span class="auth-btn-text">Sign In</span>
                    <div class="auth-btn-spinner" style="display: none;">
                        <svg class="auth-spinner" width="20" height="20" viewBox="0 0 24 24">
                            <circle class="auth-spinner-path" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32">
                                <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                            </svg>
                        </div>
                    </button>
                </div>

                <!-- Form Footer -->
                <div class="auth-form-footer">
                    <div class="auth-links">
                        <a href="#" class="auth-link" onclick="showForgotPasswordModal(); return false;">
                            Forgot your password?
                        </a>
                    </div>
                    
                    <div class="auth-divider">
                        <span>Need an account?</span>
                    </div>
                    
                    <p class="auth-contact-info">
                        Contact your system administrator for account creation and access permissions.
                    </p>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Forgot Password Modal -->
<div id="forgotPasswordModal" class="auth-modal" style="display: none;">
    <div class="auth-modal-overlay" onclick="closeForgotPasswordModal()"></div>
    <div class="auth-modal-container">
        <div class="auth-modal-content">
            <!-- Modal Header -->
            <div class="auth-modal-header">
                <div class="auth-logo">
                    <img src="<?php echo asset('images/squidjob-logo.svg'); ?>" alt="SquidJob Logo" width="32" height="32">
                    <span class="auth-title">Reset Password</span>
                </div>
                <button type="button" class="auth-modal-close" onclick="closeForgotPasswordModal()" aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>

            <!-- Forgot Password Form -->
            <form class="auth-form" id="forgotPasswordForm" action="<?php echo url('auth/forgot-password'); ?>" method="POST">
                <?php echo csrfField(); ?>
                
                <div class="auth-form-description">
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                </div>
                
                <!-- Email Field -->
                <div class="auth-form-group">
                    <label for="forgot_email" class="auth-form-label">
                        <svg class="auth-form-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        Email Address
                    </label>
                    <input 
                        type="email" 
                        id="forgot_email" 
                        name="email" 
                        class="auth-form-input"
                        placeholder="Enter your email address"
                        required 
                        autocomplete="email"
                    >
                </div>

                <!-- Submit Button -->
                <button type="submit" class="auth-btn auth-btn-primary" id="forgotPasswordSubmitBtn">
                    <span class="auth-btn-text">Send Reset Link</span>
                    <div class="auth-btn-spinner" style="display: none;">
                        <svg class="auth-spinner" width="20" height="20" viewBox="0 0 24 24">
                            <circle class="auth-spinner-path" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32">
                                <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                            </svg>
                        </div>
                    </button>
                </div>

                <!-- Form Footer -->
                <div class="auth-form-footer">
                    <div class="auth-links">
                        <a href="#" class="auth-link" onclick="showLoginModal(); return false;">
                            Back to Sign In
                        </a>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
/* Authentication Modal Styles */
.auth-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: authModalFadeIn 0.3s ease-out;
}

.auth-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
}

.auth-modal-container {
    position: relative;
    width: 100%;
    max-width: 440px;
    margin: 20px;
    animation: authModalSlideIn 0.3s ease-out;
}

.auth-modal-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.auth-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.auth-logo {
    display: flex;
    align-items: center;
    gap: 12px;
}

.auth-title {
    font-size: 20px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
}

.auth-modal-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.auth-modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
}

/* Alert Styles */
.auth-alert {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 32px;
    font-size: 14px;
    font-weight: 500;
}

.auth-alert-error {
    background: #fef2f2;
    color: #dc2626;
    border-left: 4px solid #dc2626;
}

.auth-alert-success {
    background: #f0fdf4;
    color: #16a34a;
    border-left: 4px solid #16a34a;
}

.auth-alert-warning {
    background: #fffbeb;
    color: #d97706;
    border-left: 4px solid #d97706;
}

.auth-alert-icon {
    flex-shrink: 0;
}

/* Form Styles */
.auth-form {
    padding: 32px;
}

.auth-form-description {
    margin-bottom: 24px;
    color: #6b7280;
    text-align: center;
}

.auth-form-group {
    margin-bottom: 24px;
}

.auth-form-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
}

.auth-form-icon {
    color: #6b7280;
}

.auth-form-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s, box-shadow 0.2s;
    background: white;
}

.auth-form-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.auth-form-input-error {
    border-color: #dc2626;
}

.auth-form-input-error:focus {
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.auth-form-error {
    margin-top: 6px;
    font-size: 14px;
    color: #dc2626;
}

.auth-password-wrapper {
    position: relative;
}

.auth-password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: color 0.2s;
}

.auth-password-toggle:hover {
    color: #374151;
}

/* Checkbox Styles */
.auth-checkbox-label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font-size: 14px;
    color: #374151;
}

.auth-checkbox {
    display: none;
}

.auth-checkbox-custom {
    width: 20px;
    height: 20px;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    position: relative;
    transition: all 0.2s;
}

.auth-checkbox:checked + .auth-checkbox-custom {
    background: #667eea;
    border-color: #667eea;
}

.auth-checkbox:checked + .auth-checkbox-custom::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

/* Button Styles */
.auth-btn {
    width: 100%;
    padding: 14px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
}

.auth-btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.auth-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.auth-btn-primary:active {
    transform: translateY(0);
}

.auth-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

.auth-spinner {
    animation: authSpin 1s linear infinite;
}

/* Form Footer */
.auth-form-footer {
    margin-top: 32px;
    text-align: center;
}

.auth-links {
    margin-bottom: 24px;
}

.auth-link {
    color: #667eea;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
}

.auth-link:hover {
    color: #5a67d8;
    text-decoration: underline;
}

.auth-divider {
    margin: 24px 0;
    position: relative;
    color: #6b7280;
    font-size: 14px;
}

.auth-divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e5e7eb;
    z-index: 1;
}

.auth-divider span {
    background: white;
    padding: 0 16px;
    position: relative;
    z-index: 2;
}

.auth-contact-info {
    color: #6b7280;
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
}

/* Animations */
@keyframes authModalFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes authModalSlideIn {
    from { 
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to { 
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes authSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 480px) {
    .auth-modal-container {
        margin: 10px;
    }
    
    .auth-modal-header,
    .auth-form {
        padding: 24px;
    }
    
    .auth-title {
        font-size: 18px;
    }
}
</style>

<script>
// Authentication Modal JavaScript
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        document.getElementById('email').focus();
    }, 300);
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.body.style.overflow = '';
}

function showForgotPasswordModal() {
    closeLoginModal();
    document.getElementById('forgotPasswordModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        document.getElementById('forgot_email').focus();
    }, 300);
}

function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
    document.body.style.overflow = '';
}

function showLoginModal() {
    closeForgotPasswordModal();
    openLoginModal();
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const showIcon = button.querySelector('.auth-password-icon-show');
    const hideIcon = button.querySelector('.auth-password-icon-hide');
    
    if (input.type === 'password') {
        input.type = 'text';
        showIcon.style.display = 'none';
        hideIcon.style.display = 'block';
    } else {
        input.type = 'password';
        showIcon.style.display = 'block';
        hideIcon.style.display = 'none';
    }
}

// Form submission handling
document.getElementById('loginForm').addEventListener('submit', function(e) {
    const submitBtn = document.getElementById('loginSubmitBtn');
    const btnText = submitBtn.querySelector('.auth-btn-text');
    const btnSpinner = submitBtn.querySelector('.auth-btn-spinner');
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'block';
});

document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
    const submitBtn = document.getElementById('forgotPasswordSubmitBtn');
    const btnText = submitBtn.querySelector('.auth-btn-text');
    const btnSpinner = submitBtn.querySelector('.auth-btn-spinner');
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'block';
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeLoginModal();
        closeForgotPasswordModal();
    }
});

// Auto-open modal if there are validation errors
<?php if (!empty($validationErrors) || $error): ?>
    document.addEventListener('DOMContentLoaded', function() {
        openLoginModal();
    });
<?php endif; ?>
</script>