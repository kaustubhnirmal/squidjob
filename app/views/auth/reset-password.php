<?php
/**
 * Password Reset Page
 * SquidJob Tender Management System
 * 
 * Secure password reset form with validation
 */

// Get flash messages
$error = getFlash('error');
$success = getFlash('success');
$validationErrors = $_SESSION['validation_errors'] ?? [];
$token = request('token');

// Clear validation errors after displaying
unset($_SESSION['validation_errors']);

if (!$token) {
    redirect(url('login'));
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - <?php echo config('app.name'); ?></title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- CSRF Token -->
    <meta name="csrf-token" content="<?php echo csrfToken(); ?>">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .reset-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 480px;
            overflow: hidden;
        }

        .reset-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 32px;
            text-align: center;
        }

        .reset-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 16px;
        }

        .reset-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .reset-subtitle {
            font-size: 16px;
            opacity: 0.9;
        }

        .reset-content {
            padding: 32px;
        }

        .alert {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            font-size: 14px;
            font-weight: 500;
        }

        .alert-error {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }

        .alert-success {
            background: #f0fdf4;
            color: #16a34a;
            border: 1px solid #bbf7d0;
        }

        .alert-icon {
            flex-shrink: 0;
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 8px;
        }

        .form-icon {
            color: #6b7280;
        }

        .password-wrapper {
            position: relative;
        }

        .form-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
            font-family: 'Inter', sans-serif;
            transition: border-color 0.2s, box-shadow 0.2s;
            background: white;
        }

        .form-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input-error {
            border-color: #dc2626;
        }

        .form-input-error:focus {
            border-color: #dc2626;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }

        .form-error {
            margin-top: 6px;
            font-size: 14px;
            color: #dc2626;
        }

        .password-toggle {
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

        .password-toggle:hover {
            color: #374151;
        }

        .password-requirements {
            margin-top: 12px;
            padding: 16px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .requirements-title {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 8px;
        }

        .requirements-list {
            list-style: none;
            font-size: 13px;
        }

        .requirement-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
            color: #6b7280;
            transition: color 0.2s;
        }

        .requirement-item.valid {
            color: #16a34a;
        }

        .requirement-icon {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
        }

        .btn {
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

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:active {
            transform: translateY(0);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
        }

        .btn-spinner {
            animation: spin 1s linear infinite;
        }

        .form-footer {
            margin-top: 32px;
            text-align: center;
        }

        .back-link {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: color 0.2s;
        }

        .back-link:hover {
            color: #5a67d8;
            text-decoration: underline;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
            .reset-header,
            .reset-content {
                padding: 24px;
            }
            
            .reset-title {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="reset-container">
        <!-- Header -->
        <div class="reset-header">
            <div class="reset-logo">
                <img src="<?php echo asset('images/squidjob-logo.svg'); ?>" alt="SquidJob Logo" width="40" height="40">
                <span style="font-size: 24px; font-weight: 700;">SquidJob</span>
            </div>
            <h1 class="reset-title">Reset Your Password</h1>
            <p class="reset-subtitle">Create a new secure password for your account</p>
        </div>

        <!-- Content -->
        <div class="reset-content">
            <!-- Alert Messages -->
            <?php if ($error): ?>
                <div class="alert alert-error">
                    <svg class="alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <?php echo e($error); ?>
                </div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="alert alert-success">
                    <svg class="alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <?php echo e($success); ?>
                </div>
            <?php endif; ?>

            <!-- Reset Form -->
            <form id="resetForm" action="<?php echo url('auth/reset-password'); ?>" method="POST">
                <?php echo csrfField(); ?>
                <input type="hidden" name="token" value="<?php echo e($token); ?>">
                
                <!-- New Password -->
                <div class="form-group">
                    <label for="password" class="form-label">
                        <svg class="form-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                        New Password
                    </label>
                    <div class="password-wrapper">
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            class="form-input <?php echo isset($validationErrors['password']) ? 'form-input-error' : ''; ?>"
                            placeholder="Enter your new password"
                            required 
                            autocomplete="new-password"
                        >
                        <button type="button" class="password-toggle" onclick="togglePassword('password')" aria-label="Toggle password visibility">
                            <svg class="password-show" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                            <svg class="password-hide" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                            </svg>
                        </button>
                    </div>
                    <?php if (isset($validationErrors['password'])): ?>
                        <div class="form-error">
                            <?php echo e(implode(', ', $validationErrors['password'])); ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Confirm Password -->
                <div class="form-group">
                    <label for="password_confirmation" class="form-label">
                        <svg class="form-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                        Confirm New Password
                    </label>
                    <div class="password-wrapper">
                        <input 
                            type="password" 
                            id="password_confirmation" 
                            name="password_confirmation" 
                            class="form-input <?php echo isset($validationErrors['password_confirmation']) ? 'form-input-error' : ''; ?>"
                            placeholder="Confirm your new password"
                            required 
                            autocomplete="new-password"
                        >
                        <button type="button" class="password-toggle" onclick="togglePassword('password_confirmation')" aria-label="Toggle password visibility">
                            <svg class="password-show" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                            <svg class="password-hide" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                            </svg>
                        </button>
                    </div>
                    <?php if (isset($validationErrors['password_confirmation'])): ?>
                        <div class="form-error">
                            <?php echo e(implode(', ', $validationErrors['password_confirmation'])); ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Password Requirements -->
                <div class="password-requirements">
                    <div class="requirements-title">Password Requirements:</div>
                    <ul class="requirements-list">
                        <li class="requirement-item" id="req-length">
                            <svg class="requirement-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            At least 8 characters long
                        </li>
                        <li class="requirement-item" id="req-uppercase">
                            <svg class="requirement-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            One uppercase letter
                        </li>
                        <li class="requirement-item" id="req-lowercase">
                            <svg class="requirement-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            One lowercase letter
                        </li>
                        <li class="requirement-item" id="req-number">
                            <svg class="requirement-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            One number
                        </li>
                        <li class="requirement-item" id="req-special">
                            <svg class="requirement-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            One special character
                        </li>
                    </ul>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-primary" id="resetBtn">
                    <span class="btn-text">Reset Password</span>
                    <svg class="btn-spinner" width="20" height="20" viewBox="0 0 24 24" style="display: none;">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32">
                            <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                </button>

                <!-- Form Footer -->
                <div class="form-footer">
                    <a href="<?php echo url('login'); ?>" class="back-link">
                        ← Back to Sign In
                    </a>
                </div>
            </form>
        </div>
    </div>

    <script>
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const button = input.nextElementSibling;
            const showIcon = button.querySelector('.password-show');
            const hideIcon = button.querySelector('.password-hide');
            
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

        // Password validation
        function validatePassword(password) {
            const requirements = {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[^A-Za-z0-9]/.test(password)
            };

            // Update requirement indicators
            Object.keys(requirements).forEach(req => {
                const element = document.getElementById(`req-${req}`);
                if (requirements[req]) {
                    element.classList.add('valid');
                } else {
                    element.classList.remove('valid');
                }
            });

            return Object.values(requirements).every(req => req);
        }

        // Real-time password validation
        document.getElementById('password').addEventListener('input', function(e) {
            validatePassword(e.target.value);
        });

        // Form submission
        document.getElementById('resetForm').addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const confirmation = document.getElementById('password_confirmation').value;
            
            if (password !== confirmation) {
                e.preventDefault();
                alert('Passwords do not match. Please try again.');
                return;
            }
            
            if (!validatePassword(password)) {
                e.preventDefault();
                alert('Please ensure your password meets all requirements.');
                return;
            }
            
            const submitBtn = document.getElementById('resetBtn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnSpinner = submitBtn.querySelector('.btn-spinner');
            
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'block';
        });
    </script>
</body>
</html>