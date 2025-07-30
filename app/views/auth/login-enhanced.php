<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - SquidJob</title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <style>
        :root {
            --primary-purple: #7c3aed;
            --secondary-purple: #8b5cf6;
            --purple-light: #a78bfa;
            --purple-dark: #5b21b6;
            --white: #ffffff;
            --light-gray: #f8fafc;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
            --gray-900: #111827;
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
            --info: #3b82f6;
            --font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            --transition-fast: 150ms ease-in-out;
            --transition-normal: 250ms ease-in-out;
            --radius-lg: 0.5rem;
            --radius-xl: 0.75rem;
            --radius-2xl: 1rem;
            --radius-3xl: 1.5rem;
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-family);
            background: linear-gradient(135deg, var(--primary-purple) 0%, var(--secondary-purple) 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .login-container {
            background: var(--white);
            border-radius: var(--radius-3xl);
            box-shadow: var(--shadow-2xl);
            overflow: hidden;
            max-width: 1000px;
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 600px;
            animation: slideIn 0.6s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .login-banner {
            background: linear-gradient(135deg, var(--primary-purple) 0%, var(--secondary-purple) 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            position: relative;
            overflow: hidden;
        }

        .login-banner::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(1deg); }
        }

        .mascot-container {
            position: relative;
            z-index: 2;
            text-align: center;
            margin-bottom: 2rem;
        }

        .octopus-mascot {
            width: 200px;
            height: 200px;
            background: var(--white);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            margin: 0 auto 1rem;
            box-shadow: var(--shadow-xl);
            animation: bounce 2s ease-in-out infinite;
            position: relative;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }

        .octopus-mascot::before {
            content: '🦑';
            font-size: 5rem;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
        }

        .mascot-headset {
            position: absolute;
            top: 20px;
            right: 30px;
            font-size: 2rem;
            transform: rotate(15deg);
            animation: wiggle 3s ease-in-out infinite;
        }

        @keyframes wiggle {
            0%, 100% { transform: rotate(15deg); }
            50% { transform: rotate(25deg); }
        }

        .mascot-headset::before {
            content: '🎧';
        }

        .neon-signs {
            position: relative;
            z-index: 2;
        }

        .neon-text {
            display: block;
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--white);
            text-shadow: 0 0 10px rgba(255,255,255,0.5);
            margin: 0.5rem 0;
            animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
            from { text-shadow: 0 0 10px rgba(255,255,255,0.5); }
            to { text-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.6); }
        }

        .department-text {
            font-size: 1rem;
            opacity: 0.9;
        }

        .good-job-text {
            font-size: 1.2rem;
            color: #fbbf24;
        }

        .login-form-section {
            padding: 3rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .form-header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }

        .logo-icon {
            width: 40px;
            height: 40px;
            background: var(--primary-purple);
            color: var(--white);
            border-radius: var(--radius-xl);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .logo-text {
            font-size: 1.75rem;
            font-weight: 800;
            color: var(--gray-900);
        }

        .form-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--gray-900);
            margin-bottom: 0.5rem;
        }

        .form-subtitle {
            color: var(--gray-600);
            font-size: 0.95rem;
        }

        .login-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .form-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--gray-700);
        }

        .form-control {
            padding: 0.875rem 1rem;
            border: 1px solid var(--gray-300);
            border-radius: var(--radius-lg);
            font-size: 1rem;
            transition: all var(--transition-fast);
            background: var(--white);
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary-purple);
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .password-wrapper {
            position: relative;
        }

        .password-toggle {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--gray-400);
            cursor: pointer;
            padding: 0.25rem;
            transition: color var(--transition-fast);
        }

        .password-toggle:hover {
            color: var(--gray-600);
        }

        .checkbox-wrapper {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .checkbox-input {
            width: 1rem;
            height: 1rem;
            accent-color: var(--primary-purple);
        }

        .checkbox-label {
            font-size: 0.875rem;
            color: var(--gray-700);
            cursor: pointer;
        }

        .submit-button {
            background: linear-gradient(135deg, var(--primary-purple), var(--secondary-purple));
            color: var(--white);
            border: none;
            padding: 1rem 2rem;
            border-radius: var(--radius-xl);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all var(--transition-fast);
            position: relative;
            overflow: hidden;
        }

        .submit-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }

        .submit-button:hover::before {
            left: 100%;
        }

        .submit-button:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-xl);
        }

        .submit-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .form-footer {
            text-align: center;
            margin-top: 1.5rem;
        }

        .forgot-password {
            color: var(--primary-purple);
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 500;
            transition: color var(--transition-fast);
        }

        .forgot-password:hover {
            color: var(--purple-dark);
            text-decoration: underline;
        }

        .help-text {
            margin-top: 1.5rem;
            padding: 1rem;
            background: var(--gray-100);
            border-radius: var(--radius-lg);
            font-size: 0.875rem;
            color: var(--gray-600);
            text-align: center;
        }

        .help-text strong {
            color: var(--gray-800);
        }

        .alert {
            padding: 0.875rem 1rem;
            border-radius: var(--radius-lg);
            margin-bottom: 1rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .alert-error {
            background: rgba(239, 68, 68, 0.1);
            color: var(--error);
            border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .alert-info {
            background: rgba(59, 130, 246, 0.1);
            color: var(--info);
            border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .loading-spinner {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 0.5rem;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .login-container {
                grid-template-columns: 1fr;
                max-width: 400px;
                min-height: auto;
            }

            .login-banner {
                padding: 2rem;
                order: 2;
            }

            .octopus-mascot {
                width: 120px;
                height: 120px;
                font-size: 2.5rem;
            }

            .octopus-mascot::before {
                font-size: 3rem;
            }

            .neon-text {
                font-size: 1.2rem;
            }

            .login-form-section {
                padding: 2rem;
                order: 1;
            }

            .form-title {
                font-size: 1.25rem;
            }
        }

        @media (max-width: 480px) {
            body {
                padding: 0.5rem;
            }

            .login-form-section {
                padding: 1.5rem;
            }

            .login-banner {
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <!-- Left Banner with Mascot -->
        <div class="login-banner">
            <div class="mascot-container">
                <div class="octopus-mascot">
                    <div class="mascot-headset"></div>
                </div>
                <div class="neon-signs">
                    <span class="neon-text department-text">DEPARTMENT</span>
                    <span class="neon-text good-job-text">Good job! SquidJob</span>
                </div>
            </div>
        </div>

        <!-- Right Form Section -->
        <div class="login-form-section">
            <div class="form-header">
                <div class="logo-section">
                    <div class="logo-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <div class="logo-text">SquidJob</div>
                </div>
                <h1 class="form-title">Welcome Back</h1>
                <p class="form-subtitle">Sign in to your account to continue</p>
            </div>

            <!-- Flash Messages -->
            <?php if (isset($_SESSION['flash_message'])): ?>
                <div class="alert alert-<?= $_SESSION['flash_type'] ?? 'info' ?>">
                    <i class="fas fa-<?= $_SESSION['flash_type'] === 'error' ? 'exclamation-circle' : ($_SESSION['flash_type'] === 'success' ? 'check-circle' : 'info-circle') ?>"></i>
                    <?= htmlspecialchars($_SESSION['flash_message']) ?>
                </div>
                <?php 
                unset($_SESSION['flash_message']);
                unset($_SESSION['flash_type']);
                ?>
            <?php endif; ?>

            <form method="POST" action="<?= url('/login') ?>" class="login-form" id="loginForm">
                <input type="hidden" name="_token" value="<?= $csrf_token ?? '' ?>">
                
                <div class="form-group">
                    <label for="email" class="form-label">Email Address</label>
                    <input type="email" 
                           id="email" 
                           name="email" 
                           class="form-control" 
                           placeholder="Enter your email address"
                           value="<?= isset($_POST['email']) ? htmlspecialchars($_POST['email']) : '' ?>"
                           required 
                           autocomplete="email">
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">Password</label>
                    <div class="password-wrapper">
                        <input type="password" 
                               id="password" 
                               name="password" 
                               class="form-control" 
                               placeholder="Enter your password"
                               required 
                               autocomplete="current-password">
                        <button type="button" class="password-toggle" onclick="togglePassword()">
                            <i class="fas fa-eye" id="passwordIcon"></i>
                        </button>
                    </div>
                </div>

                <div class="checkbox-wrapper">
                    <input type="checkbox" id="remember" name="remember" class="checkbox-input">
                    <label for="remember" class="checkbox-label">Remember my password</label>
                </div>

                <button type="submit" class="submit-button" id="submitButton">
                    <span id="buttonText">Sign In</span>
                </button>

                <div class="form-footer">
                    <a href="<?= url('/forgot-password') ?>" class="forgot-password">
                        Forgot Password?
                    </a>
                </div>
            </form>

            <div class="help-text">
                <strong>Need help?</strong><br>
                Contact your administrator if you need login credentials or assistance accessing the system.
            </div>
        </div>
    </div>

    <script>
        // Password toggle functionality
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const passwordIcon = document.getElementById('passwordIcon');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                passwordIcon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                passwordIcon.className = 'fas fa-eye';
            }
        }

        // Form submission handling
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const submitButton = document.getElementById('submitButton');
            const buttonText = document.getElementById('buttonText');
            
            // Basic validation
            if (!email || !password) {
                e.preventDefault();
                showAlert('Please fill in all required fields.', 'error');
                return false;
            }
            
            if (!isValidEmail(email)) {
                e.preventDefault();
                showAlert('Please enter a valid email address.', 'error');
                return false;
            }
            
            // Show loading state
            submitButton.disabled = true;
            buttonText.innerHTML = '<span class="loading-spinner"></span>Signing In...';
            
            // Re-enable button after timeout (in case of server issues)
            setTimeout(() => {
                submitButton.disabled = false;
                buttonText.innerHTML = 'Sign In';
            }, 10000);
        });

        // Email validation
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // Show alert messages
        function showAlert(message, type) {
            // Remove existing alerts
            const existingAlerts = document.querySelectorAll('.alert');
            existingAlerts.forEach(alert => alert.remove());
            
            // Create new alert
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.innerHTML = `
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                ${message}
            `;
            
            // Insert before form
            const form = document.getElementById('loginForm');
            form.parentNode.insertBefore(alert, form);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
        }

        // Auto-focus email field when page loads
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('email').focus();
        });

        // Add shake animation on form error
        function shakeForm() {
            const form = document.getElementById('loginForm');
            form.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                form.style.animation = '';
            }, 500);
        }

        // Add shake keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);

        // Handle form errors
        <?php if (isset($_SESSION['flash_type']) && $_SESSION['flash_type'] === 'error'): ?>
            shakeForm();
        <?php endif; ?>
    </script>
</body>
</html>