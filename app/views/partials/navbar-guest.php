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
                        <i class="fas fa-home me-1"></i>Home
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= strpos(request()->getUri(), '/jobs') === 0 ? 'active' : '' ?>" href="<?= url('/jobs') ?>">
                        <i class="fas fa-briefcase me-1"></i>Browse Jobs
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= strpos(request()->getUri(), '/tenders') === 0 ? 'active' : '' ?>" href="<?= url('/tenders') ?>">
                        <i class="fas fa-file-contract me-1"></i>Public Tenders
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= strpos(request()->getUri(), '/about') === 0 ? 'active' : '' ?>" href="<?= url('/about') ?>">
                        <i class="fas fa-info-circle me-1"></i>About
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= strpos(request()->getUri(), '/contact') === 0 ? 'active' : '' ?>" href="<?= url('/contact') ?>">
                        <i class="fas fa-envelope me-1"></i>Contact
                    </a>
                </li>
            </ul>
            
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link <?= strpos(request()->getUri(), '/login') === 0 ? 'active' : '' ?>" href="<?= url('/login') ?>">
                        <i class="fas fa-sign-in-alt me-1"></i>Login
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= strpos(request()->getUri(), '/register') === 0 ? 'active' : '' ?>" href="<?= url('/register') ?>">
                        <i class="fas fa-user-plus me-1"></i>Register
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>