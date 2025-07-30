<?php
/**
 * Tender Details Page
 * SquidJob Tender Management System
 * 
 * Comprehensive tender details with document management and bid information
 */

function getFileIcon($extension) {
    $icons = [
        'pdf' => 'file-pdf',
        'doc' => 'file-word',
        'docx' => 'file-word',
        'xls' => 'file-excel',
        'xlsx' => 'file-excel',
        'jpg' => 'file-image',
        'jpeg' => 'file-image',
        'png' => 'file-image',
        'gif' => 'file-image',
        'zip' => 'file-archive',
        'rar' => 'file-archive'
    ];
    return $icons[$extension] ?? 'file';
}

$page_title = $tender['title'];
$meta_description = substr($tender['description'], 0, 160);
$css_files = ['squidjob-theme.css'];
$js_files = ['tender-details.js'];

$breadcrumbs = [
    ['title' => 'Home', 'url' => url('/')],
    ['title' => 'Tenders', 'url' => url('/tenders')],
    ['title' => $tender['title'], 'url' => null]
];

ob_start();
?>

<div class="container-fluid">
    <!-- Tender Header -->
    <div class="card bg-gradient-primary text-white mb-4">
        <div class="card-body p-4">
            <div class="row align-items-start">
                <div class="col">
                    <h1 class="h2 mb-2"><?= e($tender['title']) ?></h1>
                    <p class="mb-0 opacity-75"><?= e($tender['tender_number']) ?></p>
                </div>
                <div class="col-auto">
                    <span class="badge bg-light text-dark fs-6 px-3 py-2">
                        <?= e(ucfirst($tender['status'])) ?>
                    </span>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-3">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-building fa-lg me-3 opacity-75"></i>
                        <div>
                            <small class="opacity-75">Organization</small>
                            <div class="fw-semibold"><?= e($tender['organization']) ?></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-tag fa-lg me-3 opacity-75"></i>
                        <div>
                            <small class="opacity-75">Category</small>
                            <div class="fw-semibold"><?= e($tender['category_name'] ?? 'Uncategorized') ?></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-calendar fa-lg me-3 opacity-75"></i>
                        <div>
                            <small class="opacity-75">Deadline</small>
                            <div class="fw-semibold"><?= formatDate($tender['submission_deadline'], 'M j, Y g:i A') ?></div>
                        </div>
                    </div>
                </div>
                <?php if ($tender['estimated_value']): ?>
                <div class="col-md-3">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-dollar-sign fa-lg me-3 opacity-75"></i>
                        <div>
                            <small class="opacity-75">Estimated Value</small>
                            <div class="fw-semibold"><?= formatCurrency($tender['estimated_value'], $tender['currency'] ?? '$') ?></div>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="d-flex flex-wrap gap-2 mb-4">
        <?php if ($canBid): ?>
            <a href="<?= url('/bids/create?tender_id=' . $tender['id']) ?>" class="btn btn-success">
                <i class="fas fa-hand-paper me-1"></i>Submit Bid
            </a>
        <?php endif; ?>
        
        <?php if ($canEdit): ?>
            <a href="<?= url('/tenders/' . $tender['id'] . '/edit') ?>" class="btn btn-primary">
                <i class="fas fa-edit me-1"></i>Edit Tender
            </a>
        <?php endif; ?>
        
        <button onclick="downloadDocuments()" class="btn btn-outline-primary">
            <i class="fas fa-download me-1"></i>Download All Documents
        </button>
        
        <button onclick="shareTender()" class="btn btn-outline-secondary">
            <i class="fas fa-share me-1"></i>Share
        </button>
        
        <?php if ($canDelete): ?>
            <button onclick="deleteTender(<?= e($tender['id']) ?>)" class="btn btn-outline-danger">
                <i class="fas fa-trash me-1"></i>Delete
            </button>
        <?php endif; ?>
    </div>
    
    <!-- Countdown Timer -->
    <?php if ($tender['status'] === 'published' && $tender['days_remaining'] !== null): ?>
        <div class="alert <?= $tender['days_remaining'] < 3 ? 'alert-danger' : ($tender['days_remaining'] < 7 ? 'alert-warning' : 'alert-info') ?> mb-4">
            <div class="d-flex align-items-center">
                <i class="fas fa-clock fa-2x me-3"></i>
                <div>
                    <?php if ($tender['days_remaining'] > 0): ?>
                        <h5 class="alert-heading mb-1"><?= $tender['days_remaining'] ?> Days Remaining</h5>
                        <p class="mb-0">Submission deadline: <?= formatDate($tender['submission_deadline'], 'l, F j, Y \a\t g:i A') ?></p>
                    <?php elseif ($tender['days_remaining'] === 0): ?>
                        <h5 class="alert-heading mb-1">Last Day to Submit</h5>
                        <p class="mb-0">Deadline: <?= formatDate($tender['submission_deadline'], 'g:i A \t\o\d\a\y') ?></p>
                    <?php else: ?>
                        <h5 class="alert-heading mb-1">Submission Deadline Passed</h5>
                        <p class="mb-0">This tender is no longer accepting bids</p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    <?php endif; ?>
    
    <div class="row">
        <!-- Main Content -->
        <div class="col-lg-8">
            <!-- Description -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-file-alt me-2"></i>Description
                    </h5>
                </div>
                <div class="card-body">
                    <div class="text-muted lh-lg">
                        <?= nl2br(e($tender['description'])) ?>
                    </div>
                </div>
            </div>
            
            <!-- Technical Specifications -->
            <?php if ($tender['technical_specifications']): ?>
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-cogs me-2"></i>Technical Specifications
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="text-muted lh-lg">
                            <?= nl2br(e($tender['technical_specifications'])) ?>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
            
            <!-- Eligibility Criteria -->
            <?php if ($tender['eligibility_criteria']): ?>
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-check-circle me-2"></i>Eligibility Criteria
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="text-muted lh-lg">
                            <?= nl2br(e($tender['eligibility_criteria'])) ?>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
            
            <!-- Documents -->
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-folder me-2"></i>Documents
                    </h5>
                    <span class="badge bg-primary"><?= count($documents) ?> files</span>
                </div>
                <div class="card-body">
                    <?php if (empty($documents)): ?>
                        <div class="text-center py-4">
                            <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                            <h6 class="text-muted">No Documents Available</h6>
                            <p class="text-muted mb-0">No documents have been uploaded for this tender yet.</p>
                        </div>
                    <?php else: ?>
                        <div class="list-group list-group-flush">
                            <?php foreach ($documents as $document): ?>
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <div class="d-flex align-items-center">
                                        <div class="bg-primary text-white rounded p-2 me-3">
                                            <i class="fas fa-<?= getFileIcon($document['file_extension']) ?>"></i>
                                        </div>
                                        <div>
                                            <h6 class="mb-1"><?= e($document['title'] ?: $document['original_name']) ?></h6>
                                            <div class="d-flex gap-3 text-muted small">
                                                <span><?= formatFileSize($document['file_size']) ?></span>
                                                <span><?= ucfirst($document['document_type']) ?></span>
                                                <span><?= formatDate($document['uploaded_at'], 'M j, Y') ?></span>
                                                <?php if ($document['is_mandatory']): ?>
                                                    <span class="badge bg-warning text-dark">Mandatory</span>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="d-flex gap-2">
                                        <a href="<?= url('/documents/' . $document['file_id'] . '/download') ?>" class="btn btn-primary btn-sm">
                                            <i class="fas fa-download"></i>
                                        </a>
                                        <button onclick="previewDocument('<?= e($document['file_id']) ?>')" class="btn btn-outline-secondary btn-sm">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        
        <!-- Sidebar -->
        <div class="col-lg-4">
            <!-- Quick Stats -->
            <div class="card mb-4">
                <div class="card-header">
                    <h6 class="card-title mb-0">
                        <i class="fas fa-chart-bar me-2"></i>Quick Stats
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row text-center">
                        <div class="col-6 mb-3">
                            <div class="h4 text-primary mb-1"><?= number_format($tender['view_count'] ?? 0) ?></div>
                            <small class="text-muted">Views</small>
                        </div>
                        <div class="col-6 mb-3">
                            <div class="h4 text-primary mb-1"><?= number_format($tender['bid_count'] ?? 0) ?></div>
                            <small class="text-muted">Bids</small>
                        </div>
                        <div class="col-6">
                            <div class="h4 text-primary mb-1"><?= number_format($tender['document_count'] ?? 0) ?></div>
                            <small class="text-muted">Documents</small>
                        </div>
                        <div class="col-6">
                            <div class="h4 text-primary mb-1"><?= number_format($tender['download_count'] ?? 0) ?></div>
                            <small class="text-muted">Downloads</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Additional Details -->
            <div class="card mb-4">
                <div class="card-header">
                    <h6 class="card-title mb-0">
                        <i class="fas fa-info-circle me-2"></i>Additional Details
                    </h6>
                </div>
                <div class="card-body">
                    <?php if ($tender['location']): ?>
                        <div class="d-flex align-items-center mb-3">
                            <i class="fas fa-map-marker-alt text-primary me-3"></i>
                            <div>
                                <small class="text-muted">Location</small>
                                <div><?= e($tender['location']) ?></div>
                            </div>
                        </div>
                    <?php endif; ?>
                    
                    <div class="d-flex align-items-center mb-3">
                        <i class="fas fa-user text-primary me-3"></i>
                        <div>
                            <small class="text-muted">Created By</small>
                            <div><?= e($tender['created_by_first_name'] . ' ' . $tender['created_by_last_name']) ?></div>
                        </div>
                    </div>
                    
                    <div class="d-flex align-items-center">
                        <i class="fas fa-calendar-plus text-primary me-3"></i>
                        <div>
                            <small class="text-muted">Created On</small>
                            <div><?= formatDate($tender['created_at'], 'M j, Y g:i A') ?></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Contact Information -->
            <?php if ($tender['contact_person'] || $tender['contact_email'] || $tender['contact_phone']): ?>
                <div class="card mb-4">
                    <div class="card-header">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-address-book me-2"></i>Contact Information
                        </h6>
                    </div>
                    <div class="card-body">
                        <?php if ($tender['contact_person']): ?>
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-user text-primary me-3"></i>
                                <div>
                                    <small class="text-muted">Contact Person</small>
                                    <div><?= e($tender['contact_person']) ?></div>
                                </div>
                            </div>
                        <?php endif; ?>
                        
                        <?php if ($tender['contact_email']): ?>
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-envelope text-primary me-3"></i>
                                <div>
                                    <small class="text-muted">Email</small>
                                    <div><a href="mailto:<?= e($tender['contact_email']) ?>"><?= e($tender['contact_email']) ?></a></div>
                                </div>
                            </div>
                        <?php endif; ?>
                        
                        <?php if ($tender['contact_phone']): ?>
                            <div class="d-flex align-items-center">
                                <i class="fas fa-phone text-primary me-3"></i>
                                <div>
                                    <small class="text-muted">Phone</small>
                                    <div><a href="tel:<?= e($tender['contact_phone']) ?>"><?= e($tender['contact_phone']) ?></a></div>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>
            
            <!-- Related Tenders -->
            <?php if (!empty($relatedTenders)): ?>
                <div class="card">
                    <div class="card-header">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-link me-2"></i>Related Tenders
                        </h6>
                    </div>
                    <div class="card-body">
                        <?php foreach ($relatedTenders as $related): ?>
                            <div class="border-bottom pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                                <h6 class="mb-1">
                                    <a href="<?= url('/tenders/' . $related['id']) ?>" class="text-decoration-none">
                                        <?= e($related['title']) ?>
                                    </a>
                                </h6>
                                <div class="d-flex justify-content-between text-muted small">
                                    <span><?= e($related['organization']) ?></span>
                                    <span><?= formatDate($related['submission_deadline'], 'M j, Y') ?></span>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
function downloadDocuments() {
    window.location.href = '<?= url('/tenders/' . $tender['id'] . '/documents/download-all') ?>';
}

function shareTender() {
    if (navigator.share) {
        navigator.share({
            title: '<?= e($tender['title']) ?>',
            text: '<?= e(substr($tender['description'], 0, 100)) ?>...',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Tender URL copied to clipboard!');
        });
    }
}

function deleteTender(id) {
    if (confirm('Are you sure you want to delete this tender? This action cannot be undone.')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '<?= url('/tenders/') ?>' + id + '/delete';
        
        const csrfToken = document.createElement('input');
        csrfToken.type = 'hidden';
        csrfToken.name = '_token';
        csrfToken.value = '<?= $csrf_token ?>';
        
        form.appendChild(csrfToken);
        document.body.appendChild(form);
        form.submit();
    }
}

function previewDocument(fileId) {
    window.open('<?= url('/documents/') ?>' + fileId + '/preview', '_blank');
}
</script>

<?php
$content = ob_get_clean();
include APP_ROOT . '/app/views/layouts/app.php';
?>