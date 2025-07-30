<?php
/**
 * AdminPro Theme - Master Layout
 * SquidJob Tender Management System
 */

// Prevent direct access
if (!defined('APP_ROOT')) {
    exit('Direct access denied');
}

$theme_config = theme_config();
$user = user();
$current_scheme = theme()->getColorScheme();
?>
<!DOCTYPE html>
<html lang="<?= config('app.locale', 'en') ?>" data-theme="<?= $current_scheme['name'] ?? 'default' ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    
    <!-- SEO Meta Tags -->
    <title><?= isset($title) ? e($title) : config('app.name') ?></title>
    <meta name="description" content="<?= isset($description) ? e($description) : 'Professional Tender Management System' ?>">
    <meta name="keywords" content="tender, management, bids, procurement, government">
    <meta name="author" content="SquidJob Team">
    
    <!-- Security Headers -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="<?= theme_asset('assets/images/favicon.ico') ?>">
    <link rel="apple-touch-icon" href="<?= theme_asset('assets/images/apple-touch-icon.png') ?>">
    
    <!-- Preload Critical Resources -->
    <link rel="preload" href="<?= theme_asset('assets/fonts/inter/inter.woff2') ?>" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="<?= theme_asset('assets/css/adminpro.css') ?>" as="style">
    
    <!-- CSS Assets -->
    <?php foreach (theme()->getCssFiles() as $cssFile): ?>
        <link rel="stylesheet" href="<?= $cssFile ?>">
    <?php endforeach; ?>
    
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
        }
        
        <?php if (isset($custom_css)): ?>
            <?= $custom_css ?>
        <?php endif; ?>
    </style>
    
    <!-- Additional Head Content -->
    <?php if (isset($head_content)): ?>
        <?= $head_content ?>
    <?php endif; ?>
    
    <!-- CSRF Token -->
    <meta name="csrf-token" content="<?= csrfToken() ?>">
    
    <!-- App Configuration -->
    <script>
        window.AppConfig = {
            baseUrl: '<?= url() ?>',
            apiUrl: '<?= url('api/v1') ?>',
            csrfToken: '<?= csrfToken() ?>',
            user: <?= auth() ? json_encode([
                'id' => $user['id'],
                'name' => $user['first_name'] . ' ' . $user['last_name'],
                'email' => $user['email'],
                'avatar' => $user['avatar_url'] ?? null
            ]) : 'null' ?>,
            theme: {
                name: '<?= $current_scheme['name'] ?? 'default' ?>',
                colors: <?= json_encode($current_scheme) ?>
            },
            features: <?= json_encode($theme_config['features'] ?? []) ?>
        };
    </script>
</head>
<body class="adminpro-theme <?= isset($body_class) ? $body_class : '' ?>" data-sidebar-position="<?= theme_config('settings.layout_options.sidebar_position.0', 'left') ?>">
    
    <!-- Loading Spinner -->
    <div id="loading-spinner" class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
    
    <!-- Skip to Content (Accessibility) -->
    <a href="#main-content" class="skip-to-content">Skip to main content</a>
    
    <!-- Main Wrapper -->
    <div class="wrapper">
        
        <!-- Header -->
        <?php if (!isset($hide_header) || !$hide_header): ?>
            <?php theme_view('components.header'); ?>
        <?php endif; ?>
        
        <!-- Sidebar -->
        <?php if (auth() && (!isset($hide_sidebar) || !$hide_sidebar)): ?>
            <?php theme_view('components.sidebar'); ?>
        <?php endif; ?>
        
        <!-- Main Content Area -->
        <main id="main-content" class="main-content <?= auth() ? 'with-sidebar' : 'full-width' ?>" role="main">
            
            <!-- Breadcrumb -->
            <?php if (auth() && (!isset($hide_breadcrumb) || !$hide_breadcrumb)): ?>
                <?php theme_view('components.breadcrumb'); ?>
            <?php endif; ?>
            
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
            
            <!-- Page Content -->
            <div class="page-content">
                <?= $content ?? '' ?>
            </div>
            
        </main>
        
        <!-- Footer -->
        <?php if (!isset($hide_footer) || !$hide_footer): ?>
            <?php theme_view('components.footer'); ?>
        <?php endif; ?>
        
    </div>
    
    <!-- Notification Center -->
    <?php if (auth()): ?>
        <?php theme_view('components.notifications'); ?>
    <?php endif; ?>
    
    <!-- Theme Switcher -->
    <?php if (theme_config('features.theme_customizer', true)): ?>
        <?php theme_view('components.theme-switcher'); ?>
    <?php endif; ?>
    
    <!-- Back to Top Button -->
    <button id="back-to-top" class="btn btn-primary btn-floating" title="Back to top">
        <i class="fas fa-chevron-up"></i>
    </button>
    
    <!-- JavaScript Assets -->
    <?php foreach (theme()->getJsFiles() as $jsFile): ?>
        <script src="<?= $jsFile ?>"></script>
    <?php endforeach; ?>
    
    <!-- Additional Scripts -->
    <?php if (isset($scripts)): ?>
        <?= $scripts ?>
    <?php endif; ?>
    
    <!-- Global JavaScript -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize AdminPro theme
            if (typeof AdminPro !== 'undefined') {
                AdminPro.init();
            }
            
            // Initialize tooltips
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
            
            // Initialize popovers
            var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
            var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
                return new bootstrap.Popover(popoverTriggerEl);
            });
            
            // CSRF token setup for AJAX requests
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            });
            
            // Back to top button
            const backToTopButton = document.getElementById('back-to-top');
            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 300) {
                    backToTopButton.style.display = 'block';
                } else {
                    backToTopButton.style.display = 'none';
                }
            });
            
            backToTopButton.addEventListener('click', function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            // Hide loading spinner
            document.getElementById('loading-spinner').style.display = 'none';
            
            // Auto-hide flash messages after 5 seconds
            setTimeout(function() {
                $('.alert').fadeOut('slow');
            }, 5000);
        });
        
        // Global error handler
        window.addEventListener('error', function(e) {
            console.error('Global error:', e.error);
            // You can add error reporting here
        });
        
        // Service Worker registration (if enabled)
        <?php if (theme_config('config.enable_pwa', false)): ?>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('SW registered: ', registration);
                })
                .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                });
        }
        <?php endif; ?>
    </script>
    
    <!-- Analytics and Tracking -->
    <?php if (config('app.analytics_id')): ?>
        <!-- Google Analytics or other tracking code -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=<?= config('app.analytics_id') ?>"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '<?= config('app.analytics_id') ?>');
        </script>
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