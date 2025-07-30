<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
        <a class="navbar-brand" href="<?= url('/') ?>">
            <i class="fas fa-briefcase me-2"></i>
            SquidJob
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link <?= request()->getUri() === '/' ? 'active' : '' ?>" href="<?= url('/') ?>">
                        <i class="fas fa-home me-1"></i>Dashboard
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= strpos(request()->getUri(), '/jobs') === 0 ? 'active' : '' ?>" href="<?= url('/jobs') ?>">
                        <i class="fas fa-briefcase me-1"></i>Jobs
                    </a>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle <?= strpos(request()->getUri(), '/tenders') === 0 ? 'active' : '' ?>" 
                       href="#" id="tendersDropdown" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-file-contract me-1"></i>Tenders
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="<?= url('/tenders') ?>">
                            <i class="fas fa-list me-2"></i>All Tenders
                        </a></li>
                        <li><a class="dropdown-item" href="<?= url('/tenders/create') ?>">
                            <i class="fas fa-plus me-2"></i>Create Tender
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="<?= url('/bids') ?>">
                            <i class="fas fa-hand-paper me-2"></i>My Bids
                        </a></li>
                        <li><a class="dropdown-item" href="<?= url('/tenders?status=active') ?>">
                            <i class="fas fa-clock me-2"></i>Active Tenders
                        </a></li>
                    </ul>
                </li>
                <?php if (auth()->hasRole('admin')): ?>
                <li class="nav-item">
                    <a class="nav-link <?= strpos(request()->getUri(), '/admin') === 0 ? 'active' : '' ?>" href="<?= url('/admin') ?>">
                        <i class="fas fa-cog me-1"></i>Admin
                    </a>
                </li>
                <?php endif; ?>
            </ul>
            
            <ul class="navbar-nav">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="notificationsDropdown" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-bell"></i>
                        <span class="badge bg-danger notification-count" style="display: none;">0</span>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end notification-dropdown" style="width: 300px;">
                        <li><h6 class="dropdown-header">Notifications</h6></li>
                        <li><div class="notification-list">
                            <div class="text-center p-3 text-muted">No new notifications</div>
                        </div></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-center" href="<?= url('/notifications') ?>">View All</a></li>
                    </ul>
                </li>
                
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle me-1"></i>
                        <?= e(auth()->user()->name ?? 'User') ?>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="<?= url('/profile') ?>">
                            <i class="fas fa-user me-2"></i>Profile
                        </a></li>
                        <li><a class="dropdown-item" href="<?= url('/settings') ?>">
                            <i class="fas fa-cog me-2"></i>Settings
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <form method="POST" action="<?= url('/logout') ?>" class="d-inline">
                                <input type="hidden" name="_token" value="<?= $csrf_token ?>">
                                <button type="submit" class="dropdown-item">
                                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                                </button>
                            </form>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>