<?php
/**
 * Enhanced All Tenders Page
 * SquidJob Tender Management System with new UI/UX
 */

$page_title = 'All Tenders';
$meta_description = 'Browse and manage all tenders with advanced filtering';
$css_files = ['tender-list.css'];
$js_files = ['tender-list.js'];

ob_start();
?>

<!-- Page Header -->
<div class="page-header">
    <div class="page-header-content">
        <h1 class="page-title">All Tenders</h1>
        <p class="page-subtitle">Browse, filter, and manage tenders efficiently</p>
    </div>
    <div class="page-actions">
        <div class="export-dropdown">
            <button class="btn btn-outline dropdown-trigger" data-dropdown="export-menu">
                <i class="fas fa-download"></i>
                Export
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="dropdown-menu" id="export-menu">
                <a href="<?= url('/tenders/export?format=excel') ?>" class="dropdown-item">
                    <i class="fas fa-file-excel"></i>
                    Excel
                </a>
                <a href="<?= url('/tenders/export?format=pdf') ?>" class="dropdown-item">
                    <i class="fas fa-file-pdf"></i>
                    PDF
                </a>
                <a href="<?= url('/tenders/export?format=csv') ?>" class="dropdown-item">
                    <i class="fas fa-file-csv"></i>
                    CSV
                </a>
            </div>
        </div>
        <a href="<?= url('/tenders/create') ?>" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Add Tender
        </a>
    </div>
</div>

<!-- Filter Panel -->
<div class="filter-panel card mb-6">
    <div class="card-header">
        <h3 class="card-title">Filter Tenders</h3>
        <button class="btn btn-ghost btn-sm" onclick="toggleFilters()">
            <i class="fas fa-chevron-down" id="filter-toggle-icon"></i>
        </button>
    </div>
    <div class="card-body filter-content" id="filterContent">
        <form method="GET" action="<?= url('/tenders') ?>" id="filterForm">
            <!-- Search and Quick Filters Row -->
            <div class="filter-row">
                <div class="filter-group search-group">
                    <div class="search-input-wrapper">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" 
                               name="search" 
                               class="form-control search-input" 
                               placeholder="Search by keyword, city, status..."
                               value="<?= e($filters['search'] ?? '') ?>">
                    </div>
                </div>
                
                <div class="filter-group">
                    <select name="city" class="form-control">
                        <option value="">All Cities</option>
                        <?php foreach ($cities ?? [] as $city): ?>
                            <option value="<?= e($city) ?>" <?= ($filters['city'] ?? '') === $city ? 'selected' : '' ?>>
                                <?= e($city) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <div class="filter-group">
                    <select name="status" class="form-control">
                        <option value="">All Status</option>
                        <option value="live" <?= ($filters['status'] ?? '') === 'live' ? 'selected' : '' ?>>Live</option>
                        <option value="draft" <?= ($filters['status'] ?? '') === 'draft' ? 'selected' : '' ?>>Draft</option>
                        <option value="closed" <?= ($filters['status'] ?? '') === 'closed' ? 'selected' : '' ?>>Closed</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <div class="date-picker-wrapper">
                        <i class="fas fa-calendar date-icon"></i>
                        <input type="date" 
                               name="date_range" 
                               class="form-control date-input" 
                               placeholder="Date Range"
                               value="<?= e($filters['date_range'] ?? '') ?>">
                    </div>
                </div>
                
                <div class="filter-group">
                    <input type="number" 
                           name="value_range" 
                           class="form-control" 
                           placeholder="Min Value"
                           value="<?= e($filters['value_range'] ?? '') ?>">
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="filter-actions">
                <button type="button" class="btn btn-secondary" onclick="clearFilters()">
                    <i class="fas fa-times"></i>
                    Clear
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-search"></i>
                    Search
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Tab Navigation -->
<div class="tender-tabs mb-6">
    <div class="tab-list">
        <button class="tab-button <?= ($current_tab ?? 'all') === 'all' ? 'active' : '' ?>" 
                data-tab="all" onclick="switchTab('all')">
            All
        </button>
        <button class="tab-button <?= ($current_tab ?? '') === 'live' ? 'active' : '' ?>" 
                data-tab="live" onclick="switchTab('live')">
            Live
        </button>
        <button class="tab-button <?= ($current_tab ?? '') === 'archive' ? 'active' : '' ?>" 
                data-tab="archive" onclick="switchTab('archive')">
            Archive
        </button>
        <button class="tab-button <?= ($current_tab ?? '') === 'starred' ? 'active' : '' ?>" 
                data-tab="starred" onclick="switchTab('starred')">
            <i class="fas fa-star"></i>
            Starred
        </button>
    </div>
</div>

<!-- Tender Cards Grid -->
<div class="tender-grid">
    <?php if (empty($tenders)): ?>
        <div class="empty-state">
            <i class="fas fa-file-contract fa-4x text-muted mb-4"></i>
            <h3 class="text-muted">No tenders found</h3>
            <p class="text-muted">Try adjusting your filters or create a new tender</p>
            <a href="<?= url('/tenders/create') ?>" class="btn btn-primary mt-4">
                <i class="fas fa-plus"></i>
                Create First Tender
            </a>
        </div>
    <?php else: ?>
        <?php foreach ($tenders as $tender): ?>
            <div class="tender-card" data-tender-id="<?= $tender['id'] ?>">
                <!-- Alert Badge for Deadline -->
                <?php if (isset($tender['days_remaining']) && $tender['days_remaining'] <= 3): ?>
                    <div class="alert-badge <?= $tender['days_remaining'] <= 1 ? 'urgent' : 'warning' ?>">
                        <?= $tender['days_remaining'] <= 0 ? 'Overdue' : $tender['days_remaining'] . ' days left' ?>
                    </div>
                <?php endif; ?>
                
                <div class="card-header">
                    <div class="tender-meta">
                        <span class="tender-id"><?= e($tender['tender_number'] ?? 'TND-' . $tender['id']) ?></span>
                        <div class="tender-actions">
                            <button class="action-btn" onclick="toggleStar(<?= $tender['id'] ?>)" 
                                    title="<?= $tender['is_starred'] ?? false ? 'Remove from favorites' : 'Add to favorites' ?>">
                                <i class="fas fa-star <?= $tender['is_starred'] ?? false ? 'starred' : '' ?>"></i>
                            </button>
                            <button class="action-btn" onclick="sharetender(<?= $tender['id'] ?>)" title="Share">
                                <i class="fas fa-share"></i>
                            </button>
                            <div class="dropdown">
                                <button class="action-btn dropdown-trigger" data-dropdown="tender-menu-<?= $tender['id'] ?>">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <div class="dropdown-menu" id="tender-menu-<?= $tender['id'] ?>">
                                    <a href="<?= url('/tenders/' . $tender['id']) ?>" class="dropdown-item">
                                        <i class="fas fa-eye"></i>
                                        View Details
                                    </a>
                                    <a href="<?= url('/tenders/' . $tender['id'] . '/edit') ?>" class="dropdown-item">
                                        <i class="fas fa-edit"></i>
                                        Edit
                                    </a>
                                    <a href="<?= url('/tenders/' . $tender['id'] . '/call') ?>" class="dropdown-item">
                                        <i class="fas fa-phone"></i>
                                        Call
                                    </a>
                                    <div class="dropdown-divider"></div>
                                    <button class="dropdown-item text-danger" onclick="deleteTender(<?= $tender['id'] ?>)">
                                        <i class="fas fa-trash"></i>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card-body">
                    <h3 class="tender-title">
                        <a href="<?= url('/tenders/' . $tender['id']) ?>">
                            <?= e($tender['title']) ?>
                        </a>
                    </h3>
                    
                    <div class="tender-info">
                        <div class="info-item">
                            <i class="fas fa-building"></i>
                            <span><?= e($tender['organization']) ?></span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><?= e($tender['location'] ?? 'Not specified') ?></span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <span>Due: <?= formatDate($tender['submission_deadline']) ?></span>
                        </div>
                        <?php if (!empty($tender['estimated_value'])): ?>
                            <div class="info-item">
                                <i class="fas fa-dollar-sign"></i>
                                <span><?= formatCurrency($tender['estimated_value']) ?></span>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <div class="tender-tags">
                        <span class="tag tag-<?= $tender['status'] ?>">
                            <?= ucfirst($tender['status']) ?>
                        </span>
                        <?php if (!empty($tender['emd_amount'])): ?>
                            <span class="tag tag-emd">
                                EMD: <?= formatCurrency($tender['emd_amount']) ?>
                            </span>
                        <?php endif; ?>
                        <?php if (!empty($tender['category_name'])): ?>
                            <span class="tag tag-category">
                                <?= e($tender['category_name']) ?>
                            </span>
                        <?php endif; ?>
                    </div>
                    
                    <div class="tender-documents">
                        <?php if (!empty($tender['documents'])): ?>
                            <div class="document-links">
                                <?php foreach (array_slice($tender['documents'], 0, 3) as $doc): ?>
                                    <a href="<?= url('/documents/' . $doc['id'] . '/download') ?>" 
                                       class="document-link" 
                                       title="<?= e($doc['filename']) ?>">
                                        <i class="fas fa-file-<?= getFileIcon($doc['type']) ?>"></i>
                                        <?= e(substr($doc['filename'], 0, 15)) ?><?= strlen($doc['filename']) > 15 ? '...' : '' ?>
                                    </a>
                                <?php endforeach; ?>
                                <?php if (count($tender['documents']) > 3): ?>
                                    <span class="document-count">+<?= count($tender['documents']) - 3 ?> more</span>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
                
                <div class="card-footer">
                    <div class="tender-stats">
                        <span class="stat-item">
                            <i class="fas fa-eye"></i>
                            <?= number_format($tender['view_count'] ?? 0) ?>
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-users"></i>
                            <?= number_format($tender['bid_count'] ?? 0) ?>
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-clock"></i>
                            <?= timeAgo($tender['created_at']) ?>
                        </span>
                    </div>
                    
                    <div class="tender-actions-footer">
                        <a href="<?= url('/tenders/' . $tender['id']) ?>" class="btn btn-primary btn-sm">
                            View Details
                        </a>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
</div>

<!-- Pagination -->
<?php if (!empty($pagination) && $pagination['total_pages'] > 1): ?>
    <div class="pagination-wrapper">
        <nav class="pagination">
            <?php if ($pagination['current_page'] > 1): ?>
                <a href="?<?= http_build_query(array_merge($filters, ['page' => $pagination['current_page'] - 1])) ?>" 
                   class="page-link">
                    <i class="fas fa-chevron-left"></i>
                    Previous
                </a>
            <?php endif; ?>
            
            <?php for ($i = max(1, $pagination['current_page'] - 2); $i <= min($pagination['total_pages'], $pagination['current_page'] + 2); $i++): ?>
                <a href="?<?= http_build_query(array_merge($filters, ['page' => $i])) ?>" 
                   class="page-link <?= $i == $pagination['current_page'] ? 'active' : '' ?>">
                    <?= $i ?>
                </a>
            <?php endfor; ?>
            
            <?php if ($pagination['current_page'] < $pagination['total_pages']): ?>
                <a href="?<?= http_build_query(array_merge($filters, ['page' => $pagination['current_page'] + 1])) ?>" 
                   class="page-link">
                    Next
                    <i class="fas fa-chevron-right"></i>
                </a>
            <?php endif; ?>
        </nav>
        
        <div class="pagination-info">
            Showing <?= number_format($pagination['from']) ?> to <?= number_format($pagination['to']) ?> 
            of <?= number_format($pagination['total']) ?> results
        </div>
    </div>
<?php endif; ?>

<style>
/* Tender List Specific Styles */
.filter-panel {
    transition: all var(--transition-normal);
}

.filter-content {
    transition: max-height var(--transition-normal);
    overflow: hidden;
}

.filter-content.collapsed {
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
}

.filter-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
}

.search-group {
    position: relative;
}

.search-input-wrapper {
    position: relative;
}

.search-icon {
    position: absolute;
    left: var(--space-3);
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-400);
    z-index: 1;
}

.search-input {
    padding-left: var(--space-10);
}

.date-picker-wrapper {
    position: relative;
}

.date-icon {
    position: absolute;
    right: var(--space-3);
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-400);
    pointer-events: none;
    z-index: 1;
}

.filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
}

.tender-tabs {
    border-bottom: 1px solid var(--gray-200);
}

.tab-list {
    display: flex;
    gap: var(--space-2);
}

.tab-button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-size: var(--font-size-sm);
    font-weight: var(--font-medium);
    color: var(--gray-600);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.tab-button:hover {
    color: var(--primary-purple);
    background: var(--gray-50);
}

.tab-button.active {
    color: var(--primary-purple);
    border-bottom-color: var(--primary-purple);
    background: rgba(124, 58, 237, 0.05);
}

.tender-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: var(--space-6);
}

.tender-card {
    background: var(--white);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--gray-200);
    overflow: hidden;
    transition: all var(--transition-normal);
    position: relative;
}

.tender-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
    border-color: var(--primary-purple);
}

.alert-badge {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-semibold);
    z-index: 10;
}

.alert-badge.urgent {
    background: var(--error);
    color: var(--white);
}

.alert-badge.warning {
    background: var(--warning);
    color: var(--white);
}

.tender-card .card-header {
    padding: var(--space-4);
    border-bottom: 1px solid var(--gray-200);
    background: var(--gray-50);
}

.tender-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tender-id {
    font-size: var(--font-size-sm);
    font-weight: var(--font-medium);
    color: var(--gray-600);
}

.tender-actions {
    display: flex;
    gap: var(--space-2);
}

.action-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-lg);
    background: transparent;
    border: none;
    color: var(--gray-500);
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-btn:hover {
    background: var(--gray-200);
    color: var(--gray-700);
}

.action-btn .fa-star.starred {
    color: var(--warning);
}

.tender-card .card-body {
    padding: var(--space-6);
}

.tender-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-semibold);
    margin: 0 0 var(--space-4) 0;
    line-height: 1.3;
}

.tender-title a {
    color: var(--gray-900);
    text-decoration: none;
    transition: color var(--transition-fast);
}

.tender-title a:hover {
    color: var(--primary-purple);
}

.tender-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
}

.info-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    color: var(--gray-600);
}

.info-item i {
    width: 16px;
    color: var(--gray-400);
}

.tender-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
}

.tag {
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-medium);
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.tag-live {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-dark);
}

.tag-draft {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning-dark);
}

.tag-closed {
    background: rgba(107, 114, 128, 0.1);
    color: var(--gray-600);
}

.tag-emd {
    background: rgba(59, 130, 246, 0.1);
    color: var(--info-dark);
}

.tag-category {
    background: rgba(124, 58, 237, 0.1);
    color: var(--primary-purple);
}

.tender-documents {
    margin-bottom: var(--space-4);
}

.document-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
}

.document-link {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    background: var(--gray-100);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    color: var(--gray-700);
    text-decoration: none;
    transition: all var(--transition-fast);
}

.document-link:hover {
    background: var(--primary-purple);
    color: var(--white);
}

.document-count {
    font-size: var(--font-size-xs);
    color: var(--gray-500);
    padding: var(--space-1) var(--space-2);
}

.tender-card .card-footer {
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--gray-200);
    background: var(--gray-50);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tender-stats {
    display: flex;
    gap: var(--space-4);
}

.stat-item {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--font-size-xs);
    color: var(--gray-500);
}

.pagination-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-8);
    padding: var(--space-6);
    background: var(--white);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-md);
}

.pagination {
    display: flex;
    gap: var(--space-2);
}

.page-link {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-lg);
    color: var(--gray-700);
    text-decoration: none;
    font-size: var(--font-size-sm);
    transition: all var(--transition-fast);
}

.page-link:hover {
    background: var(--primary-purple);
    border-color: var(--primary-purple);
    color: var(--white);
}

.page-link.active {
    background: var(--primary-purple);
    border-color: var(--primary-purple);
    color: var(--white);
}

.pagination-info {
    font-size: var(--font-size-sm);
    color: var(--gray-600);
}

.empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--space-16);
}

.export-dropdown {
    position: relative;
}

@media (max-width: 768px) {
    .filter-row {
        grid-template-columns: 1fr;
        gap: var(--space-3);
    }
    
    .tender-grid {
        grid-template-columns: 1fr;
    }
    
    .pagination-wrapper {
        flex-direction: column;
        gap: var(--space-4);
    }
    
    .tab-list {
        flex-wrap: wrap;
    }
    
    .tender-card .card-footer {
        flex-direction: column;
        gap: var(--space-3);
        align-items: stretch;
    }
    
    .tender-actions-footer .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>

<script>
// Filter and interaction functionality
let filtersCollapsed = false;

function toggleFilters() {
    const content = document.getElementById('filterContent');
    const icon = document.getElementById('filter-toggle-icon');
    
    filtersCollapsed = !filtersCollapsed;
    
    if (filtersCollapsed) {
        content.classList.add('collapsed');
        icon.style.transform = 'rotate(-90deg)';
    } else {
        content.classList.remove('collapsed');
        icon.style.transform = 'rotate(0deg)';
    }
}

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

function switchTab(tab) {
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Update URL and reload content
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.location.href = url.toString();
}

function toggleStar(tenderId) {
    const starBtn = document.querySelector(`[data-tender-id="${tenderId}"] .fa-star`);
    const isStarred = starBtn.classList.contains('starred');
    
    fetch(`/api/tenders/${tenderId}/star`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': window.csrfToken
        },
        body: JSON.stringify({ starred: !isStarred })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            starBtn.classList.toggle('starred');
            window.SquidJobUI.showToast(
                isStarred ? 'Removed from favorites' : 'Added to favorites',
                'success'
            );
        }
    })
    .catch(error => {
        window.SquidJobUI.showToast('Error updating favorite status', 'error');
    });
}

function sharetender(tenderId) {
    const url = `${window.location.origin}/tenders/${tenderId}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Tender Details',
            url: url
        });
    } else {
        copyToClipboard(url, 'Tender link copied to clipboard!');
    }
}

function deleteTender(tenderId) {
    window.SquidJobUI.confirm('Are you sure you want to delete this tender?', () => {
        fetch(`/api/tenders/${tenderId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': window.csrfToken
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.querySelector(`[data-tender-id="${tenderId}"]`).remove();
                window.SquidJobUI.showToast('Tender deleted successfully', 'success');
            } else {
                window.SquidJobUI.showToast('Error deleting tender', 'error');
            }
        })
        .catch(error => {
            window.SquidJobUI.showToast('Error deleting tender', 'error');
        });
    });
}

// Auto-submit search with debounce
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    let searchTimeout;
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                document.getElementById('filterForm').submit();
            }, 500);
        });