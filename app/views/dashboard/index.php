<?php
/**
 * Dashboard View
 * SquidJob Tender Management System
 */

// Include layout header
include APP_ROOT . '/app/views/layouts/header.php';
?>

<div class="dashboard-container">
    <div class="container-fluid">
        <!-- Page Header -->
        <div class="page-header">
            <div class="row align-items-center">
                <div class="col">
                    <h1 class="page-title">Dashboard</h1>
                    <p class="page-subtitle">Welcome back, <?php echo e($user['first_name'] ?? 'User'); ?>!</p>
                </div>
                <div class="col-auto">
                    <div class="btn-list">
                        <a href="<?php echo url('tenders/create'); ?>" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Create Tender
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row mb-4">
            <div class="col-sm-6 col-lg-3">
                <div class="card card-stats">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-5">
                                <div class="icon-big text-center icon-warning">
                                    <i class="fas fa-file-contract text-primary"></i>
                                </div>
                            </div>
                            <div class="col-7">
                                <div class="numbers">
                                    <p class="card-category">Total Tenders</p>
                                    <h4 class="card-title"><?php echo number_format($stats['tenders']['total_tenders']); ?></h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <hr>
                        <div class="stats">
                            <i class="fas fa-calendar"></i> <?php echo $stats['tenders']['recent_tenders']; ?> this month
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-sm-6 col-lg-3">
                <div class="card card-stats">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-5">
                                <div class="icon-big text-center icon-warning">
                                    <i class="fas fa-check-circle text-success"></i>
                                </div>
                            </div>
                            <div class="col-7">
                                <div class="numbers">
                                    <p class="card-category">Active Tenders</p>
                                    <h4 class="card-title"><?php echo number_format($stats['tenders']['active_tenders']); ?></h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <hr>
                        <div class="stats">
                            <i class="fas fa-clock"></i> Currently open
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-sm-6 col-lg-3">
                <div class="card card-stats">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-5">
                                <div class="icon-big text-center icon-warning">
                                    <i class="fas fa-handshake text-info"></i>
                                </div>
                            </div>
                            <div class="col-7">
                                <div class="numbers">
                                    <p class="card-category">Total Bids</p>
                                    <h4 class="card-title"><?php echo number_format($stats['bids']['total_bids']); ?></h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <hr>
                        <div class="stats">
                            <i class="fas fa-trophy"></i> <?php echo $stats['bids']['won_bids']; ?> won
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-sm-6 col-lg-3">
                <div class="card card-stats">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-5">
                                <div class="icon-big text-center icon-warning">
                                    <i class="fas fa-paper-plane text-warning"></i>
                                </div>
                            </div>
                            <div class="col-7">
                                <div class="numbers">
                                    <p class="card-category">Submitted Bids</p>
                                    <h4 class="card-title"><?php echo number_format($stats['bids']['submitted_bids']); ?></h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <hr>
                        <div class="stats">
                            <i class="fas fa-calendar"></i> <?php echo $stats['bids']['recent_bids']; ?> this month
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">Quick Actions</h4>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <a href="<?php echo url('tenders'); ?>" class="btn btn-outline-primary btn-block">
                                    <i class="fas fa-list"></i> View All Tenders
                                </a>
                            </div>
                            <div class="col-md-6 mb-3">
                                <a href="<?php echo url('tenders/create'); ?>" class="btn btn-outline-success btn-block">
                                    <i class="fas fa-plus"></i> Create New Tender
                                </a>
                            </div>
                            <div class="col-md-6 mb-3">
                                <a href="<?php echo url('my-tenders'); ?>" class="btn btn-outline-info btn-block">
                                    <i class="fas fa-user"></i> My Tenders
                                </a>
                            </div>
                            <div class="col-md-6 mb-3">
                                <a href="<?php echo url('assigned-tenders'); ?>" class="btn btn-outline-warning btn-block">
                                    <i class="fas fa-tasks"></i> Assigned Tenders
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">System Status</h4>
                    </div>
                    <div class="card-body">
                        <div class="list-group list-group-flush">
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                Database
                                <span class="badge badge-success">Online</span>
                            </div>
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                File Storage
                                <span class="badge badge-success">Available</span>
                            </div>
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                Email Service
                                <span class="badge badge-success">Active</span>
                            </div>
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                Backup System
                                <span class="badge badge-info">Scheduled</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.dashboard-container {
    padding: 20px 0;
}

.card-stats {
    border: none;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.card-stats:hover {
    transform: translateY(-2px);
}

.icon-big {
    font-size: 3rem;
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.numbers {
    text-align: right;
}

.card-category {
    color: #9A9A9A;
    font-size: 14px;
    margin-bottom: 0;
}

.card-title {
    color: #3C4858;
    font-size: 2rem;
    font-weight: 300;
    margin-bottom: 0;
}

.stats {
    color: #999;
    font-size: 12px;
}

.page-header {
    margin-bottom: 2rem;
}

.page-title {
    color: #7c3aed;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.page-subtitle {
    color: #6c757d;
    margin-bottom: 0;
}

.btn-block {
    padding: 12px;
    text-align: left;
}

.btn-block i {
    margin-right: 8px;
    width: 16px;
}
</style>

<?php
// Include layout footer
include APP_ROOT . '/app/views/layouts/footer.php';
?>