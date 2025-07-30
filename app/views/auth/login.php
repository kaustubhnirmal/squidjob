<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - SquidJob</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .login-container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            max-width: 400px;
            width: 100%;
        }
        
        .login-header {
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .login-header h2 {
            margin: 0;
            font-size: 1.8rem;
            font-weight: 600;
        }
        
        .login-header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
            font-size: 0.9rem;
        }
        
        .login-body {
            padding: 2rem;
        }
        
        .alert {
            padding: 0.75rem 1rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 0.375rem;
        }
        
        .alert-success {
            color: #0f5132;
            background-color: #d1e7dd;
            border-color: #badbcc;
        }
        
        .alert-danger {
            color: #842029;
            background-color: #f8d7da;
            border-color: #f5c2c7;
        }
        
        .alert-info {
            color: #055160;
            background-color: #cff4fc;
            border-color: #b6effb;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
        }
        
        .form-control {
            display: block;
            width: 100%;
            padding: 0.75rem;
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
            color: #212529;
            background-color: #fff;
            background-image: none;
            border: 1px solid #ced4da;
            border-radius: 0.375rem;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .form-control:focus {
            color: #212529;
            background-color: #fff;
            border-color: #7c3aed;
            outline: 0;
            box-shadow: 0 0 0 0.2rem rgba(124, 58, 237, 0.25);
        }
        
        .form-check {
            display: block;
            min-height: 1.5rem;
            padding-left: 1.5em;
            margin-bottom: 0.125rem;
        }
        
        .form-check-input {
            width: 1em;
            height: 1em;
            margin-top: 0.25em;
            margin-left: -1.5em;
            vertical-align: top;
            background-color: #fff;
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
            border: 1px solid rgba(0, 0, 0, 0.25);
            border-radius: 0.25em;
        }
        
        .form-check-label {
            color: #212529;
            cursor: pointer;
        }
        
        .btn {
            display: inline-block;
            font-weight: 400;
            line-height: 1.5;
            color: #212529;
            text-align: center;
            text-decoration: none;
            vertical-align: middle;
            cursor: pointer;
            user-select: none;
            background-color: transparent;
            border: 1px solid transparent;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            border-radius: 0.375rem;
            transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .btn-primary {
            color: #fff;
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            border: none;
            border-radius: 25px;
            font-weight: 600;
            width: 100%;
            padding: 0.75rem 2rem;
        }
        
        .btn-primary:hover {
            background: linear-gradient(135deg, #6d28d9, #9333ea);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(124, 58, 237, 0.3);
        }
        
        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .text-center {
            text-align: center;
        }
        
        .forgot-password {
            color: #7c3aed;
            text-decoration: none;
            font-size: 0.9rem;
        }
        
        .forgot-password:hover {
            color: #6d28d9;
            text-decoration: underline;
        }
        
        .divider {
            margin: 1.5rem 0;
            border: 0;
            border-top: 1px solid #dee2e6;
        }
        
        .demo-credentials {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 0.375rem;
            padding: 1rem;
            margin-top: 1rem;
        }
        
        .demo-credentials p {
            margin: 0 0 0.5rem 0;
            color: #6c757d;
            font-size: 0.875rem;
        }
        
        .demo-credentials small {
            color: #495057;
            font-size: 0.8rem;
        }
        
        .demo-credentials strong {
            color: #212529;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <h2>🦑 SquidJob</h2>
            <p>Sign in to your account</p>
        </div>
        
        <div class="login-body">
            <?php if (isset($_SESSION['flash_message'])): ?>
                <div class="alert alert-<?php echo $_SESSION['flash_type'] ?? 'info'; ?>">
                    <?php echo htmlspecialchars($_SESSION['flash_message']); ?>
                </div>
                <?php 
                unset($_SESSION['flash_message']);
                unset($_SESSION['flash_type']);
                ?>
            <?php endif; ?>

            <form method="POST" action="/squidjob/public/login" id="loginForm">
                <div class="form-group">
                    <label for="email" class="form-label">📧 Email Address</label>
                    <input type="email" 
                           class="form-control" 
                           id="email" 
                           name="email" 
                           required 
                           placeholder="Enter your email"
                           autocomplete="email"
                           value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>">
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">🔒 Password</label>
                    <input type="password" 
                           class="form-control" 
                           id="password" 
                           name="password" 
                           required 
                           placeholder="Enter your password"
                           autocomplete="current-password">
                </div>

                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="remember" name="remember">
                    <label class="form-check-label" for="remember">
                        Remember me
                    </label>
                </div>

                <div class="form-group" style="margin-top: 1.5rem;">
                    <button type="submit" class="btn btn-primary" id="submitBtn">
                        🚀 Sign In
                    </button>
                </div>

                <div class="text-center" style="margin-top: 1rem;">
                    <a href="/squidjob/public/forgot-password" class="forgot-password">
                        🔑 Forgot your password?
                    </a>
                </div>
            </form>

            <hr class="divider">
            
            <div class="demo-credentials">
                <p><strong>Demo Credentials:</strong></p>
                <small>
                    <strong>Email:</strong> admin@squidjob.com<br>
                    <strong>Password:</strong> admin123
                </small>
                <div style="margin-top: 0.5rem;">
                    <button type="button" onclick="fillDemo()" style="background: #e9ecef; border: 1px solid #ced4da; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; cursor: pointer;">
                        Auto-fill Demo
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        function fillDemo() {
            document.getElementById('email').value = 'admin@squidjob.com';
            document.getElementById('password').value = 'admin123';
        }

        // Form submission handling
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                e.preventDefault();
                alert('Please fill in all required fields.');
                return false;
            }
            
            // Show loading state
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '⏳ Signing In...';
            submitBtn.disabled = true;
            
            // Re-enable button after 10 seconds in case of issues
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 10000);
        });

        // Auto-focus email field
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('email').focus();
        });
    </script>
</body>
</html>