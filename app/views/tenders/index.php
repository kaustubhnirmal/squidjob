<?php
/**
 * Tender Listing Page
 * SquidJob Tender Management System
 * 
 * Advanced filtering and search interface with SquidJob purple theme
 */

$page_title = 'Tender Management';
$meta_description = 'Browse and manage tenders on SquidJob platform';
$css_files = ['squidjob-theme.css'];
$js_files = ['tender-management.js'];

$breadcrumbs = [
    ['title' => 'Home', 'url' => url('/')],
    ['title' => 'Tenders', 'url' => null]
];

ob_start();
?>

<div class="container-fluid">
    <!-- Page Header -->
    <div class="page-header bg-gradient-primary text-white p-4 rounded mb-4">
        <div class="row align-items-center">
            <div class="col">
                <h1 class="h2 mb-1"><i class="fas fa-file-contract me-2"></i>Tender Management</h1>
                <p class="mb-0 opacity-75">Browse, filter, and manage all tenders in the system</p>
            </div>
            <div class="col-auto">
                <?php if (can('create_tender')): ?>
                    <a href="<?= url('/tenders/create') ?>" class="btn btn-light">
                        <i class="fas fa-plus me-1"></i>Create Tender
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-md-3">
            <div class="card border-start border-primary border-4">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <h3 class="text-primary mb-1"><?= number_format($stats['total'] ?? 0) ?></h3>
                            <p class="text-muted mb-0">Total Tenders</p>
                        </div>
                        <div class="text-primary">
                            <i class="fas fa-file-contract fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-start border-success border-4">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <h3 class="text-success mb-1"><?= number_format($stats['published'] ?? 0) ?></h3>
                            <p class="text-muted mb-0">Published</p>
                        </div>
                        <div class="text-success">
                            <i class="fas fa-check-circle fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-start border-warning border-4">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <h3 class="text-warning mb-1"><?= number_format($stats['draft'] ?? 0) ?></h3>
                            <p class="text-muted mb-0">Draft</p>
                        </div>
                        <div class="text-warning">
                            <i class="fas fa-edit fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-start border-danger border-4">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <h3 class="text-danger mb-1"><?= number_format($stats['closed'] ?? 0) ?></h3>
                            <p class="text-muted mb-0">Closed</p>
                        </div>
                        <div class="text-danger">
                            <i class="fas fa-times-circle fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Advanced Filter Panel -->
    <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0"><i class="fas fa-filter me-2"></i>Advanced Filters</h5>
            <button class="btn btn-outline-primary btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#filterPanel">
                <i class="fas fa-chevron-down"></i> Toggle Filters
            </button>
        </div>
        <div class="collapse show" id="filterPanel">
            <div class="card-body">
                <form method="GET" action="<?= url('/tenders') ?>" id="filterForm">
                    <div class="row g-3">
                        <!-- Search Bar -->
                        <div class="col-12">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" name="search" class="form-control" 
                                       placeholder="Search tenders by title, organization, or description..."
                                       value="<?= e($filters['search'] ?? '') ?>">
                            </div>
                        </div>
                        
                        <!-- Status Filter -->
                        <div class="col-md-3">
                            <label for="status" class="form-label">Status</label>
                            <select name="status" id="status" class="form-select">
                                <option value="">All Statuses</option>
                                <?php foreach ($statuses as $value => $label): ?>
                                    <option value="<?= e($value) ?>" <?= ($filters['status'] ?? '') === $value ? 'selected' : '' ?>>
                                        <?= e($label) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <!-- Category Filter -->
                        <div class="col-md-3">
                            <label for="category" class="form-label">Category</label>
                            <select name="category" id="category" class="form-select">
                                <option value="">All Categories</option>
                                <?php foreach ($categories as $category): ?>
                                    <option value="<?= e($category['id']) ?>" <?= ($filters['category'] ?? '') == $category['id'] ? 'selected' : '' ?>>
                                        <?= e($category['name']) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <!-- Organization Filter -->
                        <div class="col-md-3">
                            <label for="organization" class="form-label">Organization</label>
                            <input type="text" name="organization" id="organization" class="form-control"
                                   placeholder="Filter by organization"
                                   value="<?= e($filters['organization'] ?? '') ?>">
                        </div>
                        
                        <!-- Sort Options -->
                        <div class="col-md-3">
                            <label for="sort" class="form-label">Sort By</label>
                            <select name="sort" id="sort" class="form-select">
                                <option value="created_at" <?= ($filters['sort'] ?? 'created_at') === 'created_at' ? 'selected' : '' ?>>Created Date</option>
                                <option value="submission_deadline" <?= ($filters['sort'] ?? '') === 'submission_deadline' ? 'selected' : '' ?>>Deadline</option>
                                <option value="estimated_value" <?= ($filters['sort'] ?? '') === 'estimated_value' ? 'selected' : '' ?>>Value</option>
                                <option value="title" <?= ($filters['sort'] ?? '') === 'title' ? 'selected' : '' ?>>Title</option>
                            </select>
                        </div>
                        
                        <!-- Date Range -->
                        <div class="col-md-3">
                            <label for="date_from" class="form-label">Deadline From</label>
                            <input type="date" name="date_from" id="date_from" class="form-control"
                                   value="<?= e($filters['date_from'] ?? '') ?>">
                        </div>
                        
                        <div class="col-md-3">
                            <label for="date_to" class="form-label">Deadline To</label>
                            <input type="date" name="date_to" id="date_to" class="form-control"
                                   value="<?= e($filters['date_to'] ?? '') ?>">
                        </div>
                        
                        <!-- Value Range -->
                        <div class="col-md-3">
                            <label for="value_min" class="form-label">Min Value</label>
                            <input type="number" name="value_min" id="value_min" class="form-control"
                                   placeholder="Minimum value"
                                   value="<?= e($filters['value_min'] ?? '') ?>">
                        </div>
                        
                        <div class="col-md-3">
                            <label for="value_max" class="form-label">Max Value</label>
                            <input type="number" name="value_max" id="value_max" class="form-control"
                                   placeholder="Maximum value"
                                   value="<?= e($filters['value_max'] ?? '') ?>">
                        </div>
                    </div>
                    
                    <div class="row mt-3">
                        <div class="col-12 d-flex justify-content-end gap-2">
                            <button type="button" class="btn btn-outline-secondary" onclick="clearFilters()">
                                <i class="fas fa-times me-1"></i>Clear Filters
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search me-1"></i>Apply Filters
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Results Info and Actions -->
    <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="text-muted">
            Showing <?= number_format($tenders['from'] ?? 0) ?> to <?= number_format($tenders['to'] ?? 0) ?> 
            of <?= number_format($tenders['total'] ?? 0) ?> results
        </div>
        <div class="d-flex gap-2">
            <?php if (can('export_tenders')): ?>
                <div class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-download me-1"></i>Export
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="<?= url('/tenders/export?format=csv') ?>">CSV</a></li>
                        <li><a class="dropdown-item" href="<?= url('/tenders/export?format=excel') ?>">Excel</a></li>
                        <li><a class="dropdown-item" href="<?= url('/tenders/export?format=pdf') ?>">PDF</a></li>
                    </ul>
                </div>
            <?php endif; ?>
        </div>
    </div>
    
    <!-- Tender Grid -->
    <?php if (empty($tenders['data'])): ?>
        <div class="text-center py-5">
            <i class="fas fa-file-contract fa-4x text-muted mb-3"></i>
            <h3 class="text-muted">No Tenders Found</h3>
            <p class="text-muted">No tenders match your current filters. Try adjusting your search criteria.</p>
            <?php if (can('create_tender')): ?>
                <a href="<?= url('/tenders/create') ?>" class="btn btn-primary">
                    <i class="fas fa-plus me-1"></i>Create First Tender
                </a>
            <?php endif; ?>
        </div>
    <?php else: ?>
        <div class="row">
            <?php foreach ($tenders['data'] as $tender): ?>
                <div class="col-12 mb-4">
                    <div class="card h-100 tender-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div class="flex-grow-1">
                                    <h5 class="card-title mb-1">
                                        <a href="<?= url('/tenders/' . $tender['id']) ?>" class="text-decoration-none">
                                            <?= e($tender['title']) ?>
                                        </a>
                                    </h5>
                                    <small class="text-muted"><?= e($tender['tender_number']) ?></small>
                                </div>
                                <span class="badge bg-<?= $tender['status'] === 'published' ? 'success' : ($tender['status'] === 'draft' ? 'warning' : 'danger') ?>">
                                    <?= e(ucfirst($tender['status'])) ?>
                                </span>
                            </div>
                            
                            <div class="row text-muted small mb-3">
                                <div class="col-md-3">
                                    <i class="fas fa-building me-1"></i>
                                    <?= e($tender['organization']) ?>
                                </div>
                                <div class="col-md-3">
                                    <i class="fas fa-tag me-1"></i>
                                    <?= e($tender['category_name'] ?? 'Uncategorized') ?>
                                </div>
                                <div class="col-md-3">
                                    <i class="fas fa-calendar me-1"></i>
                                    <?= formatDate($tender['submission_deadline'], 'M j, Y') ?>
                                </div>
                                <?php if ($tender['estimated_value']): ?>
                                    <div class="col-md-3">
                                        <i class="fas fa-dollar-sign me-1"></i>
                                        <?= formatCurrency($tender['estimated_value'], $tender['currency'] ?? '$') ?>
                                    </div>
                                <?php endif; ?>
                            </div>
                            
                            <p class="card-text text-muted">
                                <?= e(substr($tender['description'], 0, 200)) ?><?= strlen($tender['description']) > 200 ? '...' : '' ?>
                            </p>
                            
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="d-flex gap-3 text-muted small">
                                    <span><i class="fas fa-eye me-1"></i><?= number_format($tender['view_count'] ?? 0) ?> views</span>
                                    <span><i class="fas fa-file-alt me-1"></i><?= number_format($tender['bid_count'] ?? 0) ?> bids</span>
                                    <?php if ($tender['days_remaining'] !== null): ?>
                                        <span class="<?= $tender['days_remaining'] < 7 ? 'text-warning' : '' ?>">
                                            <i class="fas fa-clock me-1"></i>
                                            <?= $tender['days_remaining'] > 0 ? $tender['days_remaining'] . ' days left' : 'Expired' ?>
                                        </span>
                                    <?php endif; ?>
                                </div>
                                <div class="d-flex gap-2">
                                    <a href="<?= url('/tenders/' . $tender['id']) ?>" class="btn btn-primary btn-sm">
                                        <i class="fas fa-eye me-1"></i>View
                                    </a>
                                    <?php if (can('edit_tender') || $tender['created_by'] == ($user['id'] ?? 0)): ?>
                                        <a href="<?= url('/tenders/' . $tender['id'] . '/edit') ?>" class="btn btn-outline-secondary btn-sm">
                                            <i class="fas fa-edit me-1"></i>Edit
                                        </a>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    
    <!-- Pagination -->
    <?php if (!empty($tenders['data']) && $tenders['last_page'] > 1): ?>
        <nav aria-label="Tender pagination">
            <ul class="pagination justify-content-center">
                <?php if ($tenders['current_page'] > 1): ?>
                    <li class="page-item">
                        <a class="page-link" href="?<?= http_build_query(array_merge($filters, ['page' => $tenders['current_page'] - 1])) ?>">
                            <i class="fas fa-chevron-left"></i> Previous
                        </a>
                    </li>
                <?php endif; ?>
                
                <?php for ($i = max(1, $tenders['current_page'] - 2); $i <= min($tenders['last_page'], $tenders['current_page'] + 2); $i++): ?>
                    <li class="page-item <?= $i == $tenders['current_page'] ? 'active' : '' ?>">
                        <a class="page-link" href="?<?= http_build_query(array_merge($filters, ['page' => $i])) ?>"><?= $i ?></a>
                    </li>
                <?php endfor; ?>
                
                <?php if ($tenders['current_page'] < $tenders['last_page']): ?>
                    <li class="page-item">
                        <a class="page-link" href="?<?= http_build_query(array_merge($filters, ['page' => $tenders['current_page'] + 1])) ?>">
                            Next <i class="fas fa-chevron-right"></i>
                        </a>
                    </li>
                <?php endif; ?>
            </ul>
        </nav>
    <?php endif; ?>
</div>

<script>
function clearFilters() {
    const form = document.getElementById('filterForm');
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    form.submit();
}

// Auto-submit form on filter change
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('filterForm');
    const selects = form.querySelectorAll('select');
    
    selects.forEach(select => {
        select.addEventListener('change', function() {
            form.submit();
        });
    });
    
    // Search with debounce
    const searchInput = document.querySelector('input[name="search"]');
    let searchTimeout;
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                form.submit();
            }, 500);
        });
    }
});
</script>

<?php
$content = ob_get_clean();
include APP_ROOT . '/app/views/layouts/app.php';
?>