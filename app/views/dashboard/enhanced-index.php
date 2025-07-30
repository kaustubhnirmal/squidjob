<?php
/**
 * Enhanced Dashboard View
 * SquidJob Tender Management System with new UI/UX
 */

$page_title = 'Dashboard';
$meta_description = 'SquidJob Dashboard - Manage your tenders efficiently';
$css_files = ['dashboard-enhanced.css'];
$js_files = ['dashboard-enhanced.js'];

ob_start();
?>

<!-- Page Header -->
<div class="page-header">
    <div class="page-header-content">
        <h1 class="page-title">Welcome back, <?= e($user['first_name'] ?? 'User') ?>!</h1>
        <p class="page-subtitle">Here's what's happening with your tenders today.</p>
    </div>
    <div class="page-actions">
        <button class="btn btn-outline btn-sm">
            <i class="fas fa-download"></i>
            Export Report
        </button>
        <a href="<?= url('/tenders/create') ?>" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Create Tender
        </a>
    </div>
</div>

<!-- Statistics Cards -->
<div class="grid grid-cols-4 mb-8">
    <div class="card stat-card">
        <div class="card-body">
            <div class="stat-content">
                <div class="stat-icon stat-blue">
                    <i class="fas fa-file-contract"></i>
                </div>
                <div class="stat-details">
                    <h3 class="stat-number"><?= number_format($stats['tenders']['total_tenders'] ?? 0) ?></h3>
                    <p class="stat-label">Active Tenders</p>
                    <span class="stat-trend stat-up">+<?= $stats['tenders']['growth'] ?? 0 ?>%</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="card stat-card">
        <div class="card-body">
            <div class="stat-content">
                <div class="stat-icon stat-green">
                    <i class="fas fa-paper-plane"></i>
                </div>
                <div class="stat-details">
                    <h3 class="stat-number"><?= number_format($stats['bids']['submitted_bids'] ?? 0) ?></h3>
                    <p class="stat-label">Submitted Bids</p>
                    <span class="stat-trend stat-up">+<?= $stats['bids']['growth'] ?? 0 ?>%</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="card stat-card">
        <div class="card-body">
            <div class="stat-content">
                <div class="stat-icon stat-yellow">
                    <i class="fas fa-trophy"></i>
                </div>
                <div class="stat-details">
                    <h3 class="stat-number"><?= number_format($stats['bids']['won_bids'] ?? 0) ?></h3>
                    <p class="stat-label">Won Bids</p>
                    <span class="stat-trend stat-neutral"><?= $stats['performance']['win_rate'] ?? 0 ?>%</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="card stat-card">
        <div class="card-body">
            <div class="stat-content">
                <div class="stat-icon stat-purple">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-details">
                    <h3 class="stat-number"><?= number_format($stats['tasks']['pending_approvals'] ?? 0) ?></h3>
                    <p class="stat-label">Pending Approvals</p>
                    <span class="stat-trend stat-down">-<?= $stats['tasks']['reduction'] ?? 0 ?>%</span>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Main Dashboard Grid -->
<div class="grid grid-cols-3 gap-8">
    <!-- Recent Tenders -->
    <div class="card dashboard-card col-span-2">
        <div class="card-header">
            <h2 class="card-title">Recent Tenders</h2>
            <a href="<?= url('/tenders') ?>" class="btn btn-outline btn-sm">View All</a>
        </div>
        <div class="card-body">
            <?php if (empty($recent_tenders)): ?>
                <div class="empty-state">
                    <i class="fas fa-file-contract fa-3x text-muted mb-4"></i>
                    <h3 class="text-muted">No recent tenders found</h3>
                    <p class="text-muted">Start by creating your first tender</p>
                    <a href="<?= url('/tenders/create') ?>" class="btn btn-primary mt-4">
                        <i class="fas fa-plus"></i>
                        Create Tender
                    </a>
                </div>
            <?php else: ?>
                <div class="tender-list">
                    <?php foreach ($recent_tenders as $tender): ?>
                        <div class="tender-item">
                            <div class="tender-info">
                                <h4 class="tender-title">
                                    <a href="<?= url('/tenders/' . $tender['id']) ?>">
                                        <?= e($tender['title']) ?>
                                    </a>
                                </h4>
                                <p class="tender-meta">
                                    <span class="tender-org"><?= e($tender['organization']) ?></span>
                                    <span class="tender-separator">•</span>
                                    <span class="tender-deadline">Due: <?= formatDate($tender['deadline']) ?></span>
                                </p>
                                <div class="tender-status">
                                    <span class="badge badge-<?= $tender['status'] === 'active' ? 'success' : ($tender['status'] === 'draft' ? 'warning' : 'primary') ?>">
                                        <?= ucfirst($tender['status']) ?>
                                    </span>
                                </div>
                            </div>
                            <div class="tender-actions">
                                <a href="<?= url('/tenders/' . $tender['id']) ?>" class="btn btn-ghost btn-sm">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="<?= url('/tenders/' . $tender['id'] . '/edit') ?>" class="btn btn-ghost btn-sm">
                                    <i class="fas fa-edit"></i>
                                </a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
    
    <!-- Quick Actions & Recent Activities -->
    <div class="dashboard-sidebar">
        <!-- Quick Actions -->
        <div class="card dashboard-card mb-6">
            <div class="card-header">
                <h2 class="card-title">Quick Actions</h2>
            </div>
            <div class="card-body">
                <div class="quick-actions">
                    <a href="<?= url('/tenders') ?>" class="quick-action-item">
                        <div class="quick-action-icon">
                            <i class="fas fa-list"></i>
                        </div>
                        <div class="quick-action-content">
                            <h4>View All Tenders</h4>
                            <p>Browse and manage tenders</p>
                        </div>
                    </a>
                    
                    <a href="<?= url('/tenders/create') ?>" class="quick-action-item">
                        <div class="quick-action-icon">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div class="quick-action-content">
                            <h4>Create New Tender</h4>
                            <p>Add a new tender to the system</p>
                        </div>
                    </a>
                    
                    <a href="<?= url('/my-tenders') ?>" class="quick-action-item">
                        <div class="quick-action-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="quick-action-content">
                            <h4>My Tenders</h4>
                            <p>View your assigned tenders</p>
                        </div>
                    </a>
                    
                    <a href="<?= url('/tender-results') ?>" class="quick-action-item">
                        <div class="quick-action-icon">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <div class="quick-action-content">
                            <h4>Tender Results</h4>
                            <p>Check bid outcomes</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Recent Activities -->
        <div class="card dashboard-card">
            <div class="card-header">
                <h2 class="card-title">Recent Activities</h2>
            </div>
            <div class="card-body">
                <div class="activity-timeline">
                    <?php if (empty($recent_activities)): ?>
                        <div class="activity-empty">
                            <i class="fas fa-history fa-2x text-muted mb-3"></i>
                            <p class="text-muted">No recent activities</p>
                        </div>
                    <?php else: ?>
                        <?php foreach ($recent_activities as $activity): ?>
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-<?= $activity['icon'] ?? 'circle' ?>"></i>
                                </div>
                                <div class="activity-content">
                                    <p class="activity-description"><?= e($activity['description']) ?></p>
                                    <span class="activity-time"><?= timeAgo($activity['created_at']) ?></span>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Upcoming Deadlines -->
<div class="card dashboard-card mt-8">
    <div class="card-header">
        <h2 class="card-title">Upcoming Deadlines</h2>
        <button class="btn btn-outline btn-sm" onclick="refreshDeadlines()">
            <i class="fas fa-refresh"></i>
            Refresh
        </button>
    </div>
    <div class="card-body">
        <?php if (empty($upcoming_deadlines)): ?>
            <div class="empty-state">
                <i class="fas fa-check-circle fa-3x text-success mb-4"></i>
                <h3 class="text-muted">No upcoming deadlines</h3>
                <p class="text-muted">You're all caught up!</p>
            </div>
        <?php else: ?>
            <div class="deadline-grid">
                <?php foreach ($upcoming_deadlines as $deadline): ?>
                    <div class="deadline-item">
                        <div class="deadline-info">
                            <h4 class="deadline-title"><?= e($deadline['title']) ?></h4>
                            <p class="deadline-tender"><?= e($deadline['tender_title']) ?></p>
                        </div>
                        <div class="deadline-meta">
                            <span class="deadline-countdown <?= $deadline['urgency'] ?>">
                                <?= $deadline['days_left'] ?> days left
                            </span>
                            <a href="<?= url('/tenders/' . $deadline['tender_id']) ?>" class="btn btn-primary btn-sm">
                                View
                            </a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</div>

<style>
/* Dashboard Specific Styles */
.stat-card {
    transition: transform var(--transition-fast);
}

.stat-card:hover {
    transform: translateY(-2px);
}

.stat-content {
    display: flex;
    align-items: center;
    gap: var(--space-4);
}

.stat-icon {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-2xl);
    color: var(--white);
}

.stat-icon.stat-blue { background: var(--info); }
.stat-icon.stat-green { background: var(--success); }
.stat-icon.stat-yellow { background: var(--warning); }
.stat-icon.stat-purple { background: var(--primary-purple); }

.stat-details {
    flex: 1;
}

.stat-number {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-bold);
    color: var(--gray-900);
    margin: 0 0 var(--space-1) 0;
}

.stat-label {
    font-size: var(--font-size-sm);
    color: var(--gray-600);
    margin: 0 0 var(--space-2) 0;
}

.stat-trend {
    font-size: var(--font-size-xs);
    font-weight: var(--font-medium);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
}

.stat-trend.stat-up {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-dark);
}

.stat-trend.stat-down {
    background: rgba(239, 68, 68, 0.1);
    color: var(--error-dark);
}

.stat-trend.stat-neutral {
    background: var(--gray-100);
    color: var(--gray-600);
}

.dashboard-card {
    height: fit-content;
}

.col-span-2 {
    grid-column: span 2;
}

.tender-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.tender-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    transition: all var(--transition-fast);
}

.tender-item:hover {
    border-color: var(--primary-purple);
    box-shadow: var(--shadow-md);
}

.tender-title {
    font-size: var(--font-size-base);
    font-weight: var(--font-semibold);
    margin: 0 0 var(--space-1) 0;
}

.tender-title a {
    color: var(--gray-900);
    text-decoration: none;
}

.tender-title a:hover {
    color: var(--primary-purple);
}

.tender-meta {
    font-size: var(--font-size-sm);
    color: var(--gray-600);
    margin: 0 0 var(--space-2) 0;
}

.tender-separator {
    margin: 0 var(--space-2);
}

.tender-actions {
    display: flex;
    gap: var(--space-2);
}

.quick-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.quick-action-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border-radius: var(--radius-lg);
    text-decoration: none;
    color: var(--gray-700);
    transition: all var(--transition-fast);
}

.quick-action-item:hover {
    background: var(--gray-50);
    color: var(--primary-purple);
    transform: translateX(4px);
}

.quick-action-icon {
    width: 40px;
    height: 40px;
    background: var(--primary-purple);
    color: var(--white);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-lg);
}

.quick-action-content h4 {
    font-size: var(--font-size-sm);
    font-weight: var(--font-semibold);
    margin: 0 0 var(--space-1) 0;
}

.quick-action-content p {
    font-size: var(--font-size-xs);
    color: var(--gray-500);
    margin: 0;
}

.activity-timeline {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.activity-item {
    display: flex;
    gap: var(--space-3);
}

.activity-icon {
    width: 32px;
    height: 32px;
    background: var(--gray-100);
    color: var(--gray-600);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-sm);
    flex-shrink: 0;
}

.activity-description {
    font-size: var(--font-size-sm);
    color: var(--gray-700);
    margin: 0 0 var(--space-1) 0;
}

.activity-time {
    font-size: var(--font-size-xs);
    color: var(--gray-500);
}

.deadline-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.deadline-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
}

.deadline-title {
    font-size: var(--font-size-base);
    font-weight: var(--font-semibold);
    margin: 0 0 var(--space-1) 0;
}

.deadline-tender {
    font-size: var(--font-size-sm);
    color: var(--gray-600);
    margin: 0;
}

.deadline-meta {
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.deadline-countdown {
    font-size: var(--font-size-sm);
    font-weight: var(--font-medium);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
}

.deadline-countdown.urgent {
    background: rgba(239, 68, 68, 0.1);
    color: var(--error-dark);
}

.deadline-countdown.warning {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning-dark);
}

.deadline-countdown.normal {
    background: var(--gray-100);
    color: var(--gray-600);
}

.empty-state {
    text-align: center;
    padding: var(--space-8);
}

.empty-state h3 {
    margin-bottom: var(--space-2);
}

.empty-state p {
    margin-bottom: var(--space-4);
}

@media (max-width: 768px) {
    .grid-cols-4 {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .grid-cols-3 {
        grid-template-columns: 1fr;
    }
    
    .col-span-2 {
        grid-column: span 1;
    }
    
    .tender-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-3);
    }
    
    .deadline-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-3);
    }
}
</style>

<?php
$content = ob_get_clean();
include APP_ROOT . '/app/views/layouts/app-with-sidebar.php';
?>