<?php
/**
 * AdminPro Theme - Login Page
 * SquidJob Tender Management System
 */

// Prevent direct access
if (!defined('APP_ROOT')) {
    exit('Direct access denied');
}

// Set layout
$layout = 'auth';
$title = 'Login';
$description = 'Sign in to your account to access the tender management system';
?>

<form class="auth-form" action="<?= url('login') ?>" method="POST" novalidate>
    <?= csrfField() ?>
    
    <div class="mb-4">
        <h2 class="h4 mb-1">Welcome Back</h2>
        <p class="text-muted">Please sign in to your account</p>
    </div>
    
    <!-- Email Field -->
    <div class="form-floating mb-3">
        <input type="email" 
               class="form-control" 
               id="email" 
               name="email" 
               placeholder="name@example.com" 
               value="<?= e(old('email')) ?>"
               required 
               autocomplete="email"
               autofocus>
        <label for="email">
            <i class="fas fa-envelope me-2"></i>Email Address
        </label>
    </div>
    
    <!-- Password Field -->
    <div class="form-floating mb-3">
        <input type="password" 
               class="form-control" 
               id="password" 
               name="password" 
               placeholder="Password" 
               required 
               autocomplete="current-password">
        <label for="password">
            <i class="fas fa-lock me-2"></i>Password
        </label>
        <button type="button" 
                class="btn btn-link position-absolute end-0 top-50 translate-middle-y me-3" 
                onclick="togglePassword(this)"
                tabindex="-1">
            <i class="fas fa-eye"></i>
        </button>
    </div>
    
    <!-- Remember Me & Forgot Password -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="form-check">
            <input class="form-check-input" type="checkbox" id="remember" name="remember">
            <label class="form-check-label" for="remember">
                Remember me
            </label>
        </div>
        <a href="<?= url('forgot-password') ?>" class="text-decoration-none">
            Forgot password?
        </a>
    </div>
    
    <!-- Login Button -->
    <button type="submit" class="btn btn-primary btn-auth">
        <i class="fas fa-sign-in-alt me-2"></i>
        Sign In
    </button>
    
    <!-- Additional Links -->
    <div class="auth-links">
        <?php if (config('app.allow_registration', true)): ?>
            <p class="mb-0">
                Don't have an account? 
                <a href="<?= url('register') ?>">Create one here</a>
            </p>
        <?php endif; ?>
    </div>
    
</form>

<!-- Demo Credentials (for development) -->
<?php if (config('app.env') === 'development'): ?>
    <div class="mt-4 p-3 bg-light rounded">
        <h6 class="mb-2">Demo Credentials</h6>
        <div class="row">
            <div class="col-6">
                <small class="text-muted d-block">Admin</small>
                <code class="small">admin@squidjob.com</code><br>
                <code class="small">Admin@123</code>
            </div>
            <div class="col-6">
                <small class="text-muted d-block">Manager</small>
                <code class="small">manager@squidjob.com</code><br>
                <code class="small">Manager@123</code>
            </div>
        </div>
        <button type="button" class="btn btn-sm btn-outline-primary mt-2" onclick="fillDemoCredentials('admin')">
            Use Admin Demo
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary mt-2" onclick="fillDemoCredentials('manager')">
            Use Manager Demo
        </button>
    </div>
    
    <script>
        function fillDemoCredentials(type) {
            const credentials = {
                admin: { email: 'admin@squidjob.com', password: 'Admin@123' },
                manager: { email: 'manager@squidjob.com', password: 'Manager@123' }
            };
            
            if (credentials[type]) {
                document.getElementById('email').value = credentials[type].email;
                document.getElementById('password').value = credentials[type].password;
            }
        }
    </script>
<?php endif; ?>

<!-- Additional Styles -->
<style>
    .form-floating {
        position: relative;
    }
    
    .form-floating .btn-link {
        border: none;
        background: none;
        color: var(--secondary-color);
        padding: 0;
        z-index: 4;
    }
    
    .form-floating .btn-link:hover {
        color: var(--primary-color);
    }
    
    .form-check-input:checked {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
    }
    
    .auth-form {
        animation: fadeInUp 0.5s ease-out;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .demo-credentials {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border: 1px solid #dee2e6;
    }
    
    code {
        background: rgba(0, 0, 0, 0.05);
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 0.875rem;
    }
</style>