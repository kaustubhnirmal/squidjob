<?php
/**
 * AdminPro Theme - Dashboard Layout
 * SquidJob Tender Management System
 */

// Prevent direct access
if (!defined('APP_ROOT')) {
    exit('Direct access denied');
}

// Require authentication for dashboard
requireAuth();

$user = user();
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
    <title><?= isset($title) ? e($title) . ' - ' : '' ?><?= config('app.name') ?> Dashboard</title>
    <meta name="description" content="<?= isset($description) ? e($description) : 'Professional Tender Management Dashboard' ?>">
    
    <!-- Security Headers -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com;">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="<?= theme_asset('assets/images/favicon.ico') ?>">
    
    <!-- Preload Critical Resources -->
    <link rel="preload" href="<?= theme_asset('assets/fonts/inter/inter.woff2') ?>" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="<?= theme_asset('assets/css/dashboard.css') ?>" as="style">
    
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
            --sidebar-width: 280px;
            --sidebar-collapsed-width: 70px;
            --header-height: 70px;
            --border-radius: 8px;
            --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
    </style>
    
    <!-- CSRF Token -->
    <meta name="csrf-token" content="<?= csrfToken() ?>">
    
    <!-- Dashboard Configuration -->
    <script>
        window.DashboardConfig = {
            baseUrl: '<?= url() ?>',
            apiUrl: '<?= url('api/v1') ?>',
            csrfToken: '<?= csrfToken() ?>',
            user: {
                id: <?= $user['id'] ?>,
                name: '<?= e($user['first_name'] . ' ' . $user['last_name']) ?>',
                email: '<?= e($user['email']) ?>',
                avatar: '<?= $user['avatar_url'] ?? theme_asset('assets/images/avatar-placeholder.png') ?>',
                permissions: <?= json_encode(getUserPermissions($user['id'])) ?>
            },
            theme: {
                name: '<?= $current_scheme['name'] ?? 'default' ?>',
                colors: <?= json_encode($current_scheme) ?>,
                sidebarCollapsed: <?= theme_config('settings.layout_options.sidebar_collapsed', false) ? 'true' : 'false' ?>
            },
            widgets: {
                enableDragDrop: <?= theme_config('settings.dashboard_widgets.enable_drag_drop', true) ? 'true' : 'false' ?>,
                enableResize: <?= theme_config('settings.dashboard_widgets.enable_resize', true) ? 'true' : 'false' ?>,
                autoRefresh: <?= theme_config('settings.dashboard_widgets.auto_refresh', true) ? 'true' : 'false' ?>,
                refreshInterval: <?= theme_config('settings.dashboard_widgets.refresh_interval', 300) ?>
            }
        };
    </script>
</head>
<body class="dashboard-layout adminpro-theme" data-sidebar-collapsed="<?= theme_config('settings.layout_options.sidebar_collapsed', false) ? 'true' : 'false' ?>">
    
    <!-- Loading Overlay -->
    <div id="loading-overlay" class="loading-overlay">
        <div class="loading-content">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading Dashboard...</p>
        </div>
    </div>
    
    <!-- Skip to Content -->
    <a href="#main-content" class="skip-to-content">Skip to main content</a>
    
    <!-- Dashboard Wrapper -->
    <div class="dashboard-wrapper">
        
        <!-- Top Header -->
        <header class="dashboard-header">
            <div class="header-content">
                
                <!-- Left Section -->
                <div class="header-left">
                    <!-- Sidebar Toggle -->
                    <button type="button" class="btn btn-link sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar">
                        <i class="fas fa-bars"></i>
                    </button>
                    
                    <!-- Breadcrumb -->
                    <nav aria-label="breadcrumb" class="d-none d-md-block">
                        <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item">
                                <a href="<?= url('dashboard') ?>">
                                    <i class="fas fa-home"></i> Dashboard
                                </a>
                            </li>
                            <?php if (isset($breadcrumbs) && is_array($breadcrumbs)): ?>
                                <?php foreach ($breadcrumbs as $breadcrumb): ?>
                                    <li class="breadcrumb-item <?= isset($breadcrumb['active']) && $breadcrumb['active'] ? 'active' : '' ?>">
                                        <?php if (isset($breadcrumb['url']) && !isset($breadcrumb['active'])): ?>
                                            <a href="<?= $breadcrumb['url'] ?>"><?= e($breadcrumb['title']) ?></a>
                                        <?php else: ?>
                                            <?= e($breadcrumb['title']) ?>
                                        <?php endif; ?>
                                    </li>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </ol>
                    </nav>
                </div>
                
                <!-- Right Section -->
                <div class="header-right">
                    
                    <!-- Global Search -->
                    <div class="global-search d-none d-lg-block">
                        <form class="search-form" action="<?= url('search') ?>" method="GET">
                            <div class="input-group">
                                <input type="text" class="form-control" name="q" placeholder="Search tenders, bids..." value="<?= e(request('q')) ?>">
                                <button class="btn btn-outline-secondary" type="submit">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <?php if (can('create_tender')): ?>
                            <a href="<?= url('admin/tenders/create') ?>" class="btn btn-primary btn-sm" title="Create New Tender">
                                <i class="fas fa-plus"></i>
                                <span class="d-none d-md-inline">New Tender</span>
                            </a>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Notifications -->
                    <div class="notifications-dropdown dropdown">
                        <button class="btn btn-link position-relative" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Notifications">
                            <i class="fas fa-bell"></i>
                            <?php if (isset($_SESSION['notification_count']) && $_SESSION['notification_count'] > 0): ?>
                                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    <?= $_SESSION['notification_count'] ?>
                                </span>
                            <?php endif; ?>
                        </button>
                        <div class="dropdown-menu dropdown-menu-end notifications-menu">
                            <div class="dropdown-header">
                                <h6 class="mb-0">Notifications</h6>
                                <a href="<?= url('notifications') ?>" class="small">View all</a>
                            </div>
                            <div class="notifications-list">
                                <!-- Notifications will be loaded via AJAX -->
                                <div class="text-center py-3">
                                    <div class="spinner-border spinner-border-sm" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- User Menu -->
                    <div class="user-menu dropdown">
                        <button class="btn btn-link user-menu-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="<?= $user['avatar_url'] ?? theme_asset('assets/images/avatar-placeholder.png') ?>" 
                                 alt="<?= e($user['first_name'] . ' ' . $user['last_name']) ?>" 
                                 class="user-avatar">
                            <span class="user-name d-none d-md-inline"><?= e($user['first_name']) ?></span>
                            <i class="fas fa-chevron-down ms-1"></i>
                        </button>
                        <div class="dropdown-menu dropdown-menu-end user-menu-dropdown">
                            <div class="dropdown-header">
                                <strong><?= e($user['first_name'] . ' ' . $user['last_name']) ?></strong>
                                <small class="text-muted d-block"><?= e($user['email']) ?></small>
                            </div>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item" href="<?= url('profile') ?>">
                                <i class="fas fa-user me-2"></i> Profile
                            </a>
                            <a class="dropdown-item" href="<?= url('settings') ?>">
                                <i class="fas fa-cog me-2"></i> Settings
                            </a>
                            <div class="dropdown-divider"></div>
                            <form action="<?= url('logout') ?>" method="POST" class="d-inline">
                                <?= csrfField() ?>
                                <button type="submit" class="dropdown-item text-danger">
                                    <i class="fas fa-sign-out-alt me-2"></i> Logout
                                </button>
                            </form>
                        </div>
                    </div>
                    
                </div>
            </div>
        </header>
        
        <!-- Sidebar -->
        <aside class="dashboard-sidebar" id="dashboardSidebar">
            <div class="sidebar-content">
                
                <!-- Logo -->
                <div class="sidebar-logo">
                    <a href="<?= url('dashboard') ?>" class="logo-link">
                        <img src="<?= theme_asset('assets/images/logo-adminpro.svg') ?>" alt="<?= config('app.name') ?>" class="logo-full">
                        <img src="<?= theme_asset('assets/images/logo-mini.svg') ?>" alt="<?= config('app.name') ?>" class="logo-mini">
                    </a>
                </div>
                
                <!-- Navigation Menu -->
                <nav class="sidebar-nav">
                    <?php 
                    $menuItems = do_hook('menu_items', []);
                    if (!empty($menuItems)): 
                    ?>
                        <ul class="nav nav-pills nav-sidebar flex-column">
                            <?php foreach ($menuItems as $item): ?>
                                <?php if (isset($item['capability']) && !can($item['capability'])) continue; ?>
                                
                                <li class="nav-item <?= isset($item['children']) && !empty($item['children']) ? 'has-children' : '' ?>">
                                    <?php if (isset($item['children']) && !empty($item['children'])): ?>
                                        <!-- Parent Menu Item -->
                                        <a class="nav-link collapsed" data-bs-toggle="collapse" href="#menu-<?= $item['slug'] ?>" role="button" aria-expanded="false">
                                            <i class="<?= $item['icon'] ?? 'fas fa-circle' ?>"></i>
                                            <span class="nav-text"><?= e($item['title']) ?></span>
                                            <i class="fas fa-chevron-right nav-arrow"></i>
                                        </a>
                                        
                                        <!-- Submenu -->
                                        <div class="collapse" id="menu-<?= $item['slug'] ?>">
                                            <ul class="nav nav-submenu">
                                                <?php foreach ($item['children'] as $child): ?>
                                                    <?php if (isset($child['capability']) && !can($child['capability'])) continue; ?>
                                                    <li class="nav-item">
                                                        <a class="nav-link" href="<?= $child['url'] ?? '#' ?>">
                                                            <i class="<?= $child['icon'] ?? 'fas fa-dot-circle' ?>"></i>
                                                            <span class="nav-text"><?= e($child['title']) ?></span>
                                                        </a>
                                                    </li>
                                                <?php endforeach; ?>
                                            </ul>
                                        </div>
                                    <?php else: ?>
                                        <!-- Single Menu Item -->
                                        <a class="nav-link" href="<?= $item['url'] ?? '#' ?>">
                                            <i class="<?= $item['icon'] ?? 'fas fa-circle' ?>"></i>
                                            <span class="nav-text"><?= e($item['title']) ?></span>
                                        </a>
                                    <?php endif; ?>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                </nav>
                
                <!-- Sidebar Footer -->
                <div class="sidebar-footer">
                    <div class="user-info">
                        <img src="<?= $user['avatar_url'] ?? theme_asset('assets/images/avatar-placeholder.png') ?>" 
                             alt="<?= e($user['first_name']) ?>" class="user-avatar-small">
                        <div class="user-details">
                            <div class="user-name"><?= e($user['first_name']) ?></div>
                            <div class="user-role"><?= e($user['department'] ?? 'User') ?></div>
                        </div>
                    </div>
                </div>
                
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="dashboard-main" id="main-content" role="main">
            
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
        
    </div>
    
    <!-- Theme Switcher -->
    <?php if (theme_config('features.theme_customizer', true)): ?>
        <div class="theme-switcher">
            <button class="btn btn-primary theme-switcher-toggle" type="button" data-bs-toggle="offcanvas" data-bs-target="#themeSwitcher">
                <i class="fas fa-palette"></i>
            </button>
            
            <div class="offcanvas offcanvas-end" tabindex="-1" id="themeSwitcher">
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title">Theme Customizer</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
                </div>
                <div class="offcanvas-body">
                    <!-- Theme customization options -->
                    <div class="theme-options">
                        <h6>Color Schemes</h6>
                        <div class="color-schemes">
                            <?php foreach (theme_config('settings.color_schemes', []) as $scheme): ?>
                                <button class="color-scheme-btn <?= $scheme['name'] === ($current_scheme['name'] ?? 'default') ? 'active' : '' ?>" 
                                        data-scheme="<?= $scheme['name'] ?>" 
                                        style="background: <?= $scheme['primary'] ?>">
                                    <?= e($scheme['display_name']) ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>
    
    <!-- JavaScript Assets -->
    <?php foreach (theme()->getJsFiles() as $jsFile): ?>
        <script src="<?= $jsFile ?>"></script>
    <?php endforeach; ?>
    
    <!-- Dashboard JavaScript -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize dashboard
            if (typeof Dashboard !== 'undefined') {
                Dashboard.init();
            }
            
            // Sidebar toggle functionality
            const sidebarToggle = document.getElementById('sidebarToggle');
            const dashboardSidebar = document.getElementById('dashboardSidebar');
            
            if (sidebarToggle && dashboardSidebar) {
                sidebarToggle.addEventListener('click', function() {
                    document.body.classList.toggle('sidebar-collapsed');
                    localStorage.setItem('sidebarCollapsed', document.body.classList.contains('sidebar-collapsed'));
                });
            }
            
            // Load sidebar state from localStorage
            if (localStorage.getItem('sidebarCollapsed') === 'true') {
                document.body.classList.add('sidebar-collapsed');
            }
            
            // Load notifications
            loadNotifications();
            
            // Auto-refresh notifications every 5 minutes
            setInterval(loadNotifications, 300000);
            
            // Hide loading overlay
            document.getElementById('loading-overlay').style.display = 'none';
        });
        
        // Load notifications function
        function loadNotifications() {
            fetch('<?= url('api/notifications') ?>')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateNotificationsList(data.data);
                    }
                })
                .catch(error => console.error('Error loading notifications:', error));
        }
        
        // Update notifications list
        function updateNotificationsList(notifications) {
            const notificationsList = document.querySelector('.notifications-list');
            if (!notificationsList) return;
            
            if (notifications.length === 0) {
                notificationsList.innerHTML = '<div class="text-center py-3 text-muted">No new notifications</div>';
                return;
            }
            
            let html = '';
            notifications.forEach(notification => {
                html += `
                    <a href="${notification.action_url || '#'}" class="dropdown-item notification-item ${notification.read ? '' : 'unread'}">
                        <div class="notification-content">
                            <div class="notification-title">${notification.title}</div>
                            <div class="notification-message">${notification.message}</div>
                            <div class="notification-time">${notification.created_at}</div>
                        </div>
                    </a>
                `;
            });
            
            notificationsList.innerHTML = html;
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
 * Helper function to get user permissions
 */
function getUserPermissions($userId) {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            SELECT DISTINCT p.name 
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN user_roles ur ON rp.role_id = ur.role_id
            WHERE ur.user_id = ?
        ");
        $stmt->execute([$userId]);
        return array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'name');
    } catch (Exception $e) {
        return [];
    }
}

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