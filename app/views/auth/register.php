<?php
/**
 * User Registration View
 * SquidJob Tender Management System
 * 
 * Professional registration form with SquidJob styling and validation
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

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e($title ?? 'Register - SquidJob'); ?></title>
    <link rel="icon" type="image/x-icon" href="<?php echo asset('images/favicon.ico'); ?>">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Styles -->
    <link rel="stylesheet" href="<?php echo asset('css/auth.css'); ?>">
    
    <style>
        /* SquidJob Registration Styles */
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
        
        .register-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            width: 100%;
            max-width: 800px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 600px;
        }
        
        .register-brand {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 60px 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .register-brand::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            animation: float 20s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .brand-logo {
            width: 80px;
            height: 80px;
            margin-bottom: 30px;
            position: relative;
            z-index: 2;
        }
        
        .brand-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 15px;
            position: relative;
            z-index: 2;
        }
        
        .brand-subtitle {
            font-size: 18px;
            font-weight: 400;
            opacity: 0.9;
            line-height: 1.6;
            position: relative;
            z-index: 2;
        }
        
        .register-form-container {
            padding: 60px 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .form-header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .form-title {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .form-subtitle {
            color: #6b7280;
            font-size: 16px;
        }
        
        /* Alert Styles */
        .alert {
            padding: 16px 20px;
            border-radius: 12px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
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
        
        .alert-warning {
            background: #fffbeb;
            color: #d97706;
            border: 1px solid #fed7aa;
        }
        
        .alert-icon {
            flex-shrink: 0;
        }
        
        /* Form Styles */
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 24px;
        }
        
        .form-group.full-width {
            grid-column: 1 / -1;
        }
        
        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }
        
        .form-input {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 16px;
            font-family: 'Inter', sans-serif;
            transition: all 0.2s ease;
            background: #fafafa;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .form-input.error {
            border-color: #dc2626;
            background: #fef2f2;
        }
        
        .form-input.error:focus {
            border-color: #dc2626;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
        
        .form-select {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 16px;
            font-family: 'Inter', sans-serif;
            background: #fafafa;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .form-select:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .form-error {
            margin-top: 6px;
            font-size: 14px;
            color: #dc2626;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .password-wrapper {
            position: relative;
        }
        
        .password-toggle {
            position: absolute;
            right: 16px;
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
        
        .password-strength {
            margin-top: 8px;
            padding: 12px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        
        .strength-label {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .strength-weak { color: #dc2626; }
        .strength-medium { color: #d97706; }
        .strength-strong { color: #16a34a; }
        
        .strength-bar {
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        
        .strength-fill {
            height: 100%;
            transition: all 0.3s ease;
            border-radius: 2px;
        }
        
        .strength-feedback {
            font-size: 12px;
            color: #6b7280;
        }
        
        .strength-feedback ul {
            margin: 0;
            padding-left: 16px;
        }
        
        .submit-btn {
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
        }
        
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
        
        .submit-btn:active {
            transform: translateY(0);
        }
        
        .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
        }
        
        .btn-spinner {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        
        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .form-footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
        }
        
        .login-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }
        
        .login-link:hover {
            color: #5a67d8;
            text-decoration: underline;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .register-container {
                grid-template-columns: 1fr;
                max-width: 500px;
            }
            
            .register-brand {
                padding: 40px 30px;
            }
            
            .register-form-container {
                padding: 40px 30px;
            }
            
            .form-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }
            
            .brand-title {
                font-size: 24px;
            }
            
            .form-title {
                font-size: 24px;
            }
        }
        
        @media (max-width: 480px) {
            body {
                padding: 10px;
            }
            
            .register-brand,
            .register-form-container {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="register-container">
        <!-- Brand Section -->
        <div class="register-brand">
            <img src="<?php echo asset('images/squidjob-logo-white.svg'); ?>" alt="SquidJob Logo" class="brand-logo">
            <h1 class="brand-title">SquidJob</h1>
            <p class="brand-subtitle">Join the most efficient tender management platform and streamline your bidding process.</p>
        </div>
        
        <!-- Registration Form -->
        <div class="register-form-container">
            <div class="form-header">
                <h2 class="form-title">Create Account</h2>
                <p class="form-subtitle">Fill in your details to get started</p>
            </div>
            
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

            <?php if ($warning): ?>
                <div class="alert alert-warning">
                    <svg class="alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                    <?php echo e($warning); ?>
                </div>
            <?php endif; ?>
            
            <!-- Registration Form -->
            <form id="registerForm" action="<?php echo url('auth/register'); ?>" method="POST">
                <?php echo csrfField(); ?>
                
                <div class="form-grid">
                    <!-- First Name -->
                    <div class="form-group">
                        <label for="first_name" class="form-label">First Name *</label>
                        <input 
                            type="text" 
                            id="first_name" 
                            name="first_name" 
                            class="form-input <?php echo isset($validationErrors['first_name']) ? 'error' : ''; ?>"
                            value="<?php echo e($oldInput['first_name'] ?? ''); ?>"
                            placeholder="Enter your first name"
                            required
                        >
                        <?php if (isset($validationErrors['first_name'])): ?>
                            <div class="form-error">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                <?php echo e(implode(', ', $validationErrors['first_name'])); ?>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Last Name -->
                    <div class="form-group">
                        <label for="last_name" class="form-label">Last Name *</label>
                        <input 
                            type="text" 
                            id="last_name" 
                            name="last_name" 
                            class="form-input <?php echo isset($validationErrors['last_name']) ? 'error' : ''; ?>"
                            value="<?php echo e($oldInput['last_name'] ?? ''); ?>"
                            placeholder="Enter your last name"
                            required
                        >
                        <?php if (isset($validationErrors['last_name'])): ?>
                            <div class="form-error">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                <?php echo e(implode(', ', $validationErrors['last_name'])); ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
                
                <!-- Email -->
                <div class="form-group">
                    <label for="email" class="form-label">Email Address *</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        class="form-input <?php echo isset($validationErrors['email']) ? 'error' : ''; ?>"
                        value="<?php echo e($oldInput['email'] ?? ''); ?>"
                        placeholder="Enter your email address"
                        required
                    >
                    <?php if (isset($validationErrors['email'])): ?>
                        <div class="form-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <?php echo e(implode(', ', $validationErrors['email'])); ?>
                        </div>
                    <?php endif; ?>
                </div>
                
                <div class="form-grid">
                    <!-- Phone -->
                    <div class="form-group">
                        <label for="phone" class="form-label">Phone Number</label>
                        <input 
                            type="tel" 
                            id="phone" 
                            name="phone" 
                            class="form-input <?php echo isset($validationErrors['phone']) ? 'error' : ''; ?>"
                            value="<?php echo e($oldInput['phone'] ?? ''); ?>"
                            placeholder="Enter your phone number"
                        >
                        <?php if (isset($validationErrors['phone'])): ?>
                            <div class="form-error">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                <?php echo e(implode(', ', $validationErrors['phone'])); ?>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Department -->
                    <div class="form-group">
                        <label for="department" class="form-label">Department</label>
                        <select 
                            id="department" 
                            name="department" 
                            class="form-select <?php echo isset($validationErrors['department']) ? 'error' : ''; ?>"
                        >
                            <option value="">Select Department</option>
                            <option value="Administration" <?php echo ($oldInput['department'] ?? '') === 'Administration' ? 'selected' : ''; ?>>Administration</option>
                            <option value="Sales & Marketing" <?php echo ($oldInput['department'] ?? '') === 'Sales & Marketing' ? 'selected' : ''; ?>>Sales & Marketing</option>
                            <option value="Finance & Accounts" <?php echo ($oldInput['department'] ?? '') === 'Finance & Accounts' ? 'selected' : ''; ?>>Finance & Accounts</option>
                            <option value="Operations" <?php echo ($oldInput['department'] ?? '') === 'Operations' ? 'selected' : ''; ?>>Operations</option>
                            <option value="Human Resources" <?php echo ($oldInput['department'] ?? '') === 'Human Resources' ? 'selected' : ''; ?>>Human Resources</option>
                            <option value="Information Technology" <?php echo ($oldInput['department'] ?? '') === 'Information Technology' ? 'selected' : ''; ?>>Information Technology</option>
                            <option value="Legal & Compliance" <?php echo ($oldInput['department'] ?? '') === 'Legal & Compliance' ? 'selected' : ''; ?>>Legal & Compliance</option>
                            <option value="Business Development" <?php echo ($oldInput['department'] ?? '') === 'Business Development' ? 'selected' : ''; ?>>Business Development</option>
                        </select>
                        <?php if (isset($validationErrors['department'])): ?>
                            <div class="form-error">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                <?php echo e(implode(', ', $validationErrors['department'])); ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
                
                <!-- Designation -->
                <div class="form-group">
                    <label for="designation" class="form-label">Designation</label>
                    <input 
                        type="text" 
                        id="designation" 
                        name="designation" 
                        class="form-input <?php echo isset($validationErrors['designation']) ? 'error' : ''; ?>"
                        value="<?php echo e($oldInput['designation'] ?? ''); ?>"
                        placeholder="Enter your designation"
                    >
                    <?php if (isset($validationErrors['designation'])): ?>
                        <div class="form-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <?php echo e(implode(', ', $validationErrors['designation'])); ?>
                        </div>
                    <?php endif; ?>
                </div>
                
                <!-- Password -->
                <div class="form-group">
                    <label for="password" class="form-label">Password *</label>
                    <div class="password-wrapper">
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            class="form-input <?php echo isset($validationErrors['password']) ? 'error' : ''; ?>"
                            placeholder="Create a strong password"
                            required
                        >
                        <button type="button" class="password-toggle" onclick="togglePassword('password')">
                            <svg class="show-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                            <svg class="hide-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Password Strength Indicator -->
                    <div class="password-strength" id="passwordStrength" style="display: none;">
                        <div class="strength-label" id="strengthLabel">Password Strength</div>
                        <div class="strength-bar">
                            <div class="strength-fill" id="strengthFill"></div>
                        </div>
                        <div class="strength-feedback" id="strengthFeedback"></div>
                    </div>
                    
                    <?php if (isset($validationErrors['password'])): ?>
                        <div class="form-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <?php echo e(implode(', ', $validationErrors['password'])); ?>
                        </div>
                    <?php endif; ?>
                </div>
                
                <!-- Confirm Password -->
                <div class="form-group">
                    <label for="password_confirmation" class="form-label">Confirm Password *</label>
                    <div class="password-wrapper">
                        <input 
                            type="password" 
                            id="password_confirmation" 
                            name="password_confirmation" 
                            class="form-input <?php echo isset($validationErrors['password_confirmation']) ? 'error' : ''; ?>"
                            placeholder="Confirm your password"
                            required
                        >
                        <button type="button" class="password-toggle" onclick="togglePassword('password_confirmation')">
                            <svg class="show-icon" width="20" height="20" viewBox="0 0 24 24" fill
<button type="button" class="password-toggle" onclick="togglePassword('password_confirmation')">
                            <svg class="show-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                            <svg class="hide-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                            </svg>
                        </button>
                    </div>
                    <?php if (isset($validationErrors['password_confirmation'])): ?>
                        <div class="form-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <?php echo e(implode(', ', $validationErrors['password_confirmation'])); ?>
                        </div>
                    <?php endif; ?>
                </div>
                
                <!-- Submit Button -->
                <button type="submit" class="submit-btn" id="submitBtn">
                    <span class="btn-text">Create Account</span>
                    <div class="btn-spinner">
                        <div class="spinner"></div>
                    </div>
                </button>
            </form>
            
            <!-- Form Footer -->
            <div class="form-footer">
                <p>Already have an account? <a href="<?php echo url('login'); ?>" class="login-link">Sign in here</a></p>
            </div>
        </div>
    </div>
    
    <script>
        // Password visibility toggle
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const button = input.nextElementSibling;
            const showIcon = button.querySelector('.show-icon');
            const hideIcon = button.querySelector('.hide-icon');
            
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
        
        // Password strength checker
        function checkPasswordStrength(password) {
            let score = 0;
            const feedback = [];
            
            // Length check
            if (password.length >= 8) {
                score += 1;
            } else {
                feedback.push('At least 8 characters');
            }
            
            // Uppercase check
            if (/[A-Z]/.test(password)) {
                score += 1;
            } else {
                feedback.push('One uppercase letter');
            }
            
            // Lowercase check
            if (/[a-z]/.test(password)) {
                score += 1;
            } else {
                feedback.push('One lowercase letter');
            }
            
            // Number check
            if (/[0-9]/.test(password)) {
                score += 1;
            } else {
                feedback.push('One number');
            }
            
            // Special character check
            if (/[^A-Za-z0-9]/.test(password)) {
                score += 1;
            } else {
                feedback.push('One special character');
            }
            
            // Determine strength
            let strength = 'weak';
            let color = '#dc2626';
            let width = '20%';
            
            if (score >= 4) {
                strength = 'strong';
                color = '#16a34a';
                width = '100%';
            } else if (score >= 3) {
                strength = 'medium';
                color = '#d97706';
                width = '60%';
            }
            
            return { score, strength, color, width, feedback };
        }
        
        // Password strength indicator
        document.getElementById('password').addEventListener('input', function() {
            const password = this.value;
            const strengthContainer = document.getElementById('passwordStrength');
            const strengthLabel = document.getElementById('strengthLabel');
            const strengthFill = document.getElementById('strengthFill');
            const strengthFeedback = document.getElementById('strengthFeedback');
            
            if (password.length > 0) {
                strengthContainer.style.display = 'block';
                
                const result = checkPasswordStrength(password);
                
                strengthLabel.textContent = `Password Strength: ${result.strength.toUpperCase()}`;
                strengthLabel.className = `strength-label strength-${result.strength}`;
                
                strengthFill.style.width = result.width;
                strengthFill.style.backgroundColor = result.color;
                
                if (result.feedback.length > 0) {
                    strengthFeedback.innerHTML = `<strong>Missing:</strong> ${result.feedback.join(', ')}`;
                } else {
                    strengthFeedback.innerHTML = '<strong>Great!</strong> Your password is strong.';
                }
            } else {
                strengthContainer.style.display = 'none';
            }
        });
        
        // Form submission handling
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            const submitBtn = document.getElementById('submitBtn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnSpinner = submitBtn.querySelector('.btn-spinner');
            
            // Show loading state
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'block';
            
            // Basic client-side validation
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('password_confirmation').value;
            
            if (password !== confirmPassword) {
                e.preventDefault();
                alert('Passwords do not match!');
                
                // Reset button state
                submitBtn.disabled = false;
                btnText.style.display = 'block';
                btnSpinner.style.display = 'none';
                return;
            }
            
            // Check password strength
            const strength = checkPasswordStrength(password);
            if (strength.strength === 'weak') {
                e.preventDefault();
                alert('Please choose a stronger password!');
                
                // Reset button state
                submitBtn.disabled = false;
                btnText.style.display = 'block';
                btnSpinner.style.display = 'none';
                return;
            }
        });
        
        // Auto-focus first input
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('first_name').focus();
        });
    </script>
</body>
</html>