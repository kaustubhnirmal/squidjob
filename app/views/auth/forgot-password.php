<?php
/**
 * Forgot Password Page
 * SquidJob Tender Management System
 * 
 * Password reset request form
 */

$page_title = 'Forgot Password';
$meta_description = 'Reset your SquidJob account password';
$css_files = ['squidjob-theme.css'];

$breadcrumbs = [
    ['title' => 'Home', 'url' => url('/')],
    ['title' => 'Login', 'url' => url('/auth/login')],
    ['title' => 'Forgot Password', 'url' => null]
];

ob_start();
?>

<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
            <div class="card shadow-lg border-0 rounded-lg mt-5">
                <div class="card-header bg-warning text-white text-center py-4">
                    <div class="d-flex align-items-center justify-content-center mb-2">
                        <i class="fas fa-key fa-2x me-3"></i>
                        <h3 class="fw-light mb-0">Reset Password</h3>
                    </div>
                    <p class="mb-0">Enter your email to reset your password</p>
                </div>
                <div class="card-body">
                    <!-- Flash Messages -->
                    <?php if (isset($flash['error'])): ?>
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            <?= e($flash['error']) ?>
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    <?php endif; ?>

                    <?php if (isset($flash['success'])): ?>
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            <i class="fas fa-check-circle me-2"></i>
                            <?= e($flash['success']) ?>
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    <?php endif; ?>

                    <div class="alert alert-info" role="alert">
                        <i class="fas fa-info-circle me-2"></i>
                        Enter your email address and we'll send you a link to reset your password.
                    </div>

                    <!-- Forgot Password Form -->
                    <form method="POST" action="<?= url('/auth/forgot-password') ?>" id="forgotPasswordForm">
                        <input type="hidden" name="_token" value="<?= $csrf_token ?>">
                        
                        <div class="form-floating mb-3">
                            <input 
                                type="email" 
                                class="form-control <?= isset($errors['email']) ? 'is-invalid' : '' ?>" 
                                id="email" 
                                name="email" 
                                placeholder="name@example.com"
                                value="<?= e(old('email') ?? '') ?>"
                                required
                                autofocus
                            >
                            <label for="email">
                                <i class="fas fa-envelope me-2"></i>Email address
                            </label>
                            <?php if (isset($errors['email'])): ?>
                                <div class="invalid-feedback">
                                    <?= e(implode(', ', $errors['email'])) ?>
                                </div>
                            <?php endif; ?>
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-warning btn-lg" id="resetBtn">
                                <span class="btn-text">
                                    <i class="fas fa-paper-plane me-2"></i>Send Reset Link
                                </span>
                                <span class="btn-spinner d-none">
                                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Sending...
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
                <div class="card-footer text-center py-3">
                    <div class="small">
                        <a href="<?= url('/auth/login') ?>" class="text-decoration-none">
                            <i class="fas fa-arrow-left me-1"></i>Back to Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.getElementById('forgotPasswordForm').addEventListener('submit', function() {
    const btn = document.getElementById('resetBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnSpinner = btn.querySelector('.btn-spinner');
    
    btn.disabled = true;
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');
});
</script>

<?php
$content = ob_get_clean();
include APP_ROOT . '/app/views/layouts/app.php';
?>