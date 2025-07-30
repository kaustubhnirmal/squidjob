<?php
/**
 * TenderManager Dashboard View
 * TenderManager Module - SquidJob Tender Management System
 */

// Prevent direct access
if (!defined('APP_ROOT')) {
    exit('Direct access denied');
}
?>

<div class="tender-manager-dashboard">
    <div class="row">
        <div class="col-12">
            <div class="page-header">
                <h1 class="page-title">
                    <i class="fas fa-clipboard-list"></i>
                    Tender Management Dashboard
                </h1>
                <div class="page-actions">
                    <?php if (can('create_tender')): ?>
                        <a href="<?= url('admin/tenders/create') ?>" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Create New Tender
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-md-3">
            <div class="card bg-primary text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="card-title"><?= $stats['total_tenders'] ?? 0 ?></h4>
                            <p class="card-text">Total Tenders</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-clipboard-list fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card bg-success text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="card-title"><?= $stats['active_tenders'] ?? 0 ?></h4>
                            <p class="card-text">Active Tenders</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-play-circle fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card bg-warning text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="card-title"><?= $stats['pending_evaluation'] ?? 0 ?></h4>
                            <p class="card-text">Pending Evaluation</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-clock fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card bg-info text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h4 class="card-title"><?= $stats['completed_tenders'] ?? 0 ?></h4>
                            <p class="card-text">Completed</p>
                        </div>
                        <div class="align-self-center">
                            <i class="fas fa-check-circle fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="row">
        <!-- Recent Tenders -->
        <div class="col-lg-8">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title">Recent Tenders</h5>
                    <div class="card-actions">
                        <a href="<?= url('admin/tenders') ?>" class="btn btn-sm btn-outline-primary">View All</a>
                    </div>
                </div>
                <div class="card-body">
                    <?php if (!empty($recent_tenders)): ?>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Authority</th>
                                        <th>Status</th>
                                        <th>Deadline</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($recent_tenders as $tender): ?>
                                        <tr>
                                            <td>
                                                <a href="<?= url('admin/tenders/' . $tender['id']) ?>">
                                                    <?= e($tender['title']) ?>
                                                </a>
                                            </td>
                                            <td><?= e($tender['authority']) ?></td>
                                            <td>
                                                <span class="badge badge-<?= getTenderStatusColor($tender['status']) ?>">
                                                    <?= ucfirst($tender['status']) ?>
                                                </span>
                                            </td>
                                            <td><?= formatDate($tender['deadline'], 'M j, Y') ?></td>
                                            <td>
                                                <div class="btn-group btn-group-sm">
                                                    <a href="<?= url('admin/tenders/' . $tender['id']) ?>" 
                                                       class="btn btn-outline-primary" title="View">
                                                        <i class="fas fa-eye"></i>
                                                    </a>
                                                    <?php if (can('edit_tender')): ?>
                                                        <a href="<?= url('admin/tenders/' . $tender['id'] . '/edit') ?>" 
                                                           class="btn btn-outline-secondary" title="Edit">
                                                            <i class="fas fa-edit"></i>
                                                        </a>
                                                    <?php endif; ?>
                                                </div>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php else: ?>
                        <div class="text-center py-4">
                            <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                            <p class="text-muted">No recent tenders found.</p>
                            <?php if (can('create_tender')): ?>
                                <a href="<?= url('admin/tenders/create') ?>" class="btn btn-primary">
                                    Create Your First Tender
                                </a>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
            <!-- Pending Evaluations -->
            <?php if (can('evaluate_bids') && !empty($pending_evaluations)): ?>
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title">Pending Evaluations</h5>
                        <span class="badge badge-warning"><?= count($pending_evaluations) ?></span>
                    </div>
                    <div class="card-body">
                        <div class="list-group list-group-flush">
                            <?php foreach (array_slice($pending_evaluations, 0, 5) as $evaluation): ?>
                                <div class="list-group-item px-0">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 class="mb-1"><?= e($evaluation['tender_title']) ?></h6>
                                            <small class="text-muted">
                                                Due: <?= formatDate($evaluation['due_date'], 'M j, Y') ?>
                                            </small>
                                        </div>
                                        <a href="<?= url('admin/evaluations/' . $evaluation['id']) ?>" 
                                           class="btn btn-sm btn-primary">Evaluate</a>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        <?php if (count($pending_evaluations) > 5): ?>
                            <div class="text-center mt-3">
                                <a href="<?= url('admin/evaluations') ?>" class="btn btn-sm btn-outline-primary">
                                    View All (<?= count($pending_evaluations) ?>)
                                </a>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Deadline Alerts -->
            <?php if (!empty($upcoming_deadlines)): ?>
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">Upcoming Deadlines</h5>
                        <span class="badge badge-danger"><?= count($upcoming_deadlines) ?></span>
                    </div>
                    <div class="card-body">
                        <div class="list-group list-group-flush">
                            <?php foreach ($upcoming_deadlines as $deadline): ?>
                                <?php 
                                    $daysLeft = ceil((strtotime($deadline['deadline']) - time()) / 86400);
                                    $urgencyClass = $daysLeft <= 1 ? 'text-danger' : ($daysLeft <= 3 ? 'text-warning' : 'text-info');
                                ?>
                                <div class="list-group-item px-0">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 class="mb-1"><?= e($deadline['title']) ?></h6>
                                            <small class="<?= $urgencyClass ?>">
                                                <?= $daysLeft <= 0 ? 'Overdue!' : $daysLeft . ' days left' ?>
                                            </small>
                                        </div>
                                        <a href="<?= url('admin/tenders/' . $deadline['id']) ?>" 
                                           class="btn btn-sm btn-outline-primary">View</a>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Quick Actions -->
            <div class="card mt-4">
                <div class="card-header">
                    <h5 class="card-title">Quick Actions</h5>
                </div>
                <div class="card-body">
                    <div class="d-grid gap-2">
                        <?php if (can('create_tender')): ?>
                            <a href="<?= url('admin/tenders/create') ?>" class="btn btn-primary">
                                <i class="fas fa-plus"></i> Create Tender
                            </a>
                        <?php endif; ?>
                        
                        <?php if (can('view_tenders')): ?>
                            <a href="<?= url('admin/tenders?status=live') ?>" class="btn btn-outline-success">
                                <i class="fas fa-list"></i> View Active Tenders
                            </a>
                        <?php endif; ?>
                        
                        <?php if (can('evaluate_bids')): ?>
                            <a href="<?= url('admin/bids?status=pending') ?>" class="btn btn-outline-warning">
                                <i class="fas fa-gavel"></i> Pending Evaluations
                            </a>
                        <?php endif; ?>
                        
                        <?php if (can('view_reports')): ?>
                            <a href="<?= url('admin/tenders/reports') ?>" class="btn btn-outline-info">
                                <i class="fas fa-chart-bar"></i> View Reports
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Auto-refresh dashboard every 5 minutes
    setInterval(function() {
        if (document.visibilityState === 'visible') {
            location.reload();
        }
    }, 300000);
});

// Helper function for status colors
function getTenderStatusColor(status) {
    const colors = {
        'draft': 'secondary',
        'live': 'primary',
        'in_process': 'warning',
        'submitted': 'info',
        'awarded': 'success',
        'rejected': 'danger',
        'cancelled': 'dark',
        'completed': 'success'
    };
    return colors[status] || 'secondary';
}
</script>