<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    
    <title><?= isset($page_title) ? e($page_title) . ' - ' : '' ?><?= e($app_name ?? 'SquidJob') ?></title>
    
    <?php if (isset($meta_description)): ?>
    <meta name="description" content="<?= e($meta_description) ?>">
    <?php endif; ?>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="<?= asset('images/favicon.ico') ?>">
    
    <!-- CSS -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="<?= asset('css/squidjob-ui-framework.css') ?>" rel="stylesheet">
    <link href="<?= asset('css/squidjob-theme.css') ?>" rel="stylesheet">
    
    <?php if (isset($css_files)): ?>
        <?php foreach ($css_files as $css): ?>
        <link href="<?= asset('css/' . $css) ?>" rel="stylesheet">
        <?php endforeach; ?>
    <?php endif; ?>
    
    <!-- CSRF Token -->
    <meta name="csrf-token" content="<?= $csrf_token ?? '' ?>">
</head>
<body>
    <div class="app-container">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <a href="<?= url('/') ?>" class="sidebar-logo">
                    <i class="fas fa-briefcase"></i>
                    <span class="nav-text">SquidJob</span>
                </a>
            </div>
            
            <nav class="sidebar-nav">
                <!-- Dashboard Section -->
                <div class="nav-section">
                    <div class="nav-section-title">
                        <span>Dashboard</span>
                        <i class="fas fa-chevron-down nav-section-icon"></i>
                    </div>
                    <ul class="nav-items">
                        <li class="nav-item">
                            <a href="<?= url('/dashboard/sales') ?>" class="nav-link">
                                <i class="fas fa-chart-line nav-icon"></i>
                                <span class="nav-text">Sales Dashboard</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/dashboard/finance') ?>" class="nav-link">
                                <i class="fas fa-dollar-sign nav-icon"></i>
                                <span class="nav-text">Finance Dashboard</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Tender Section -->
                <div class="nav-section">
                    <div class="nav-section-title">
                        <span>Tender</span>
                        <i class="fas fa-chevron-down nav-section-icon"></i>
                    </div>
                    <ul class="nav-items">
                        <li class="nav-item">
                            <a href="<?= url('/tenders') ?>" class="nav-link <?= request()->getUri() === '/tenders' ? 'active' : '' ?>">
                                <i class="fas fa-list nav-icon"></i>
                                <span class="nav-text">All Tenders</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/tenders/import') ?>" class="nav-link">
                                <i class="fas fa-upload nav-icon"></i>
                                <span class="nav-text">Import Tender</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/tenders/create') ?>" class="nav-link">
                                <i class="fas fa-plus nav-icon"></i>
                                <span class="nav-text">Add/Modify Tender</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/tender-results') ?>" class="nav-link">
                                <i class="fas fa-trophy nav-icon"></i>
                                <span class="nav-text">Tender Results</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Tender Task Section -->
                <div class="nav-section">
                    <div class="nav-section-title">
                        <span>Tender Task</span>
                        <i class="fas fa-chevron-down nav-section-icon"></i>
                    </div>
                    <ul class="nav-items">
                        <li class="nav-item">
                            <a href="<?= url('/my-tenders') ?>" class="nav-link">
                                <i class="fas fa-user nav-icon"></i>
                                <span class="nav-text">My Tender</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/tenders/in-process') ?>" class="nav-link">
                                <i class="fas fa-clock nav-icon"></i>
                                <span class="nav-text">In-Process</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/tenders/assigned') ?>" class="nav-link">
                                <i class="fas fa-users nav-icon"></i>
                                <span class="nav-text">Assigned To Team</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/tenders/submitted') ?>" class="nav-link">
                                <i class="fas fa-paper-plane nav-icon"></i>
                                <span class="nav-text">Submitted Tender</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/tenders/dropped') ?>" class="nav-link">
                                <i class="fas fa-times-circle nav-icon"></i>
                                <span class="nav-text">Dropped Tender</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/tenders/rejected') ?>" class="nav-link">
                                <i class="fas fa-ban nav-icon"></i>
                                <span class="nav-text">Rejected</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Document Management Section -->
                <div class="nav-section">
                    <div class="nav-section-title">
                        <span>Document Management</span>
                        <i class="fas fa-chevron-down nav-section-icon"></i>
                    </div>
                    <ul class="nav-items">
                        <li class="nav-item">
                            <a href="<?= url('/folders') ?>" class="nav-link">
                                <i class="fas fa-folder nav-icon"></i>
                                <span class="nav-text">Folder Management</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/document-briefcase') ?>" class="nav-link">
                                <i class="fas fa-briefcase nav-icon"></i>
                                <span class="nav-text">Document Briefcase</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/checklist') ?>" class="nav-link">
                                <i class="fas fa-check-square nav-icon"></i>
                                <span class="nav-text">Checklist</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Finance Management Section -->
                <div class="nav-section">
                    <div class="nav-section-title">
                        <span>Finance Management</span>
                        <i class="fas fa-chevron-down nav-section-icon"></i>
                    </div>
                    <ul class="nav-items">
                        <li class="nav-item">
                            <a href="<?= url('/finance/new-request') ?>" class="nav-link">
                                <i class="fas fa-plus-circle nav-icon"></i>
                                <span class="nav-text">New Request</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/finance/approve-request') ?>" class="nav-link">
                                <i class="fas fa-check-circle nav-icon"></i>
                                <span class="nav-text">Approve Request</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/finance/denied-request') ?>" class="nav-link">
                                <i class="fas fa-times-circle nav-icon"></i>
                                <span class="nav-text">Denied Request</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/finance/complete-request') ?>" class="nav-link">
                                <i class="fas fa-check-double nav-icon"></i>
                                <span class="nav-text">Complete Request</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- MIS Section -->
                <div class="nav-section">
                    <div class="nav-section-title">
                        <span>MIS</span>
                        <i class="fas fa-chevron-down nav-section-icon"></i>
                    </div>
                    <ul class="nav-items">
                        <li class="nav-item">
                            <a href="<?= url('/mis/finance') ?>" class="nav-link">
                                <i class="fas fa-chart-bar nav-icon"></i>
                                <span class="nav-text">Finance MIS</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/mis/sales') ?>" class="nav-link">
                                <i class="fas fa-chart-pie nav-icon"></i>
                                <span class="nav-text">Sales MIS</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/mis/login') ?>" class="nav-link">
                                <i class="fas fa-sign-in-alt nav-icon"></i>
                                <span class="nav-text">Login MIS</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/mis/task') ?>" class="nav-link">
                                <i class="fas fa-tasks nav-icon"></i>
                                <span class="nav-text">Task</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/mis/approvals') ?>" class="nav-link">
                                <i class="fas fa-thumbs-up nav-icon"></i>
                                <span class="nav-text">Approvals</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Settings Section -->
                <div class="nav-section">
                    <div class="nav-section-title">
                        <span>Settings</span>
                        <i class="fas fa-chevron-down nav-section-icon"></i>
                    </div>
                    <ul class="nav-items">
                        <li class="nav-item">
                            <a href="<?= url('/settings/department') ?>" class="nav-link">
                                <i class="fas fa-building nav-icon"></i>
                                <span class="nav-text">Department</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/settings/designation') ?>" class="nav-link">
                                <i class="fas fa-id-badge nav-icon"></i>
                                <span class="nav-text">Designation</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/settings/role') ?>" class="nav-link">
                                <i class="fas fa-user-tag nav-icon"></i>
                                <span class="nav-text">Role</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/settings/users') ?>" class="nav-link">
                                <i class="fas fa-users-cog nav-icon"></i>
                                <span class="nav-text">User Management</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/settings/general') ?>" class="nav-link">
                                <i class="fas fa-cog nav-icon"></i>
                                <span class="nav-text">General Settings</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?= url('/settings/menu') ?>" class="nav-link">
                                <i class="fas fa-bars nav-icon"></i>
                                <span class="nav-text">Menu Management</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </aside>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Header -->
            <header class="header">
                <div class="header-content">
                    <div class="header-left">
                        <h1 class="header-title"><?= $page_title ?? 'Dashboard' ?></h1>
                    </div>
                    
                    <div class="header-right">
                        <!-- Help Icon -->
                        <button class="header-action" title="Help">
                            <i class="fas fa-question-circle"></i>
                        </button>
                        
                        <!-- Notifications -->
                        <button class="header-action" title="Notifications" id="notificationBtn">
                            <i class="fas fa-bell"></i>
                            <span class="notification-badge" style="display: none;"></span>
                        </button>
                        
                        <!-- Profile Dropdown -->
                        <div class="profile-dropdown">
                            <button class="profile-trigger" id="profileBtn">
                                <div class="profile-avatar">
                                    <?= strtoupper(substr(auth()->user()->name ?? 'U', 0, 1)) ?>
                                </div>
                                <div class="profile-info">
                                    <div class="profile-name"><?= e(auth()->user()->name ?? 'User') ?></div>
                                    <div class="profile-role"><?= e(auth()->user()->role ?? 'Member') ?></div>
                                </div>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            
                            <!-- Profile Dropdown Menu -->
                            <div class="dropdown-menu" id="profileMenu" style="display: none;">
                                <a href="<?= url('/profile') ?>" class="dropdown-item">
                                    <i class="fas fa-user"></i>
                                    <span>Profile</span>
                                </a>
                                <a href="<?= url('/settings') ?>" class="dropdown-item">
                                    <i class="fas fa-cog"></i>
                                    <span>Settings</span>
                                </a>
                                <div class="dropdown-divider"></div>
                                <form method="POST" action="<?= url('/logout') ?>" class="dropdown-form">
                                    <input type="hidden" name="_token" value="<?= $csrf_token ?? '' ?>">
                                    <button type="submit" class="dropdown-item">
                                        <i class="fas fa-sign-out-alt"></i>
                                        <span>Logout</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Flash Messages -->
            <?php if (!empty($flash)): ?>
                <div class="content-panel">
                    <?php foreach ($flash as $type => $message): ?>
                        <?php if ($message): ?>
                        <div class="alert alert-<?= $type === 'error' ? 'danger' : $type ?> alert-dismissible fade show" role="alert">
                            <?= e($message) ?>
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <!-- Main Content Panel -->
            <div class="content-panel">
                <?= $content ?? '' ?>
            </div>
        </div>
    </div>

    <!-- JavaScript -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="<?= asset('js/squidjob-ui.js') ?>"></script>
    
    <?php if (isset($js_files)): ?>
        <?php foreach ($js_files as $js): ?>
        <script src="<?= asset('js/' . $js) ?>"></script>
        <?php endforeach; ?>
    <?php endif; ?>
    
    <!-- CSRF Token for AJAX -->
    <script>
        window.csrfToken = '<?= $csrf_token ?? '' ?>';
        if (typeof $ !== 'undefined') {
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': window.csrfToken
                }
            });
        }
    </script>
</body>
</html>