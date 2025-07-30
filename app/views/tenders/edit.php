<?php
/**
 * Tender Edit Form
 * SquidJob Tender Management System
 * 
 * Comprehensive form for editing existing tenders with document management
 */

function getDocumentIcon($fileType) {
    $icons = [
        'pdf' => 'fa-file-pdf',
        'doc' => 'fa-file-word',
        'docx' => 'fa-file-word',
        'xls' => 'fa-file-excel',
        'xlsx' => 'fa-file-excel',
        'jpg' => 'fa-file-image',
        'jpeg' => 'fa-file-image',
        'png' => 'fa-file-image',
        'zip' => 'fa-file-archive'
    ];
    return $icons[strtolower($fileType)] ?? 'fa-file';
}

$page_title = 'Edit Tender: ' . $tender['title'];
$meta_description = 'Edit tender details and manage documents';
$css_files = ['squidjob-theme.css'];
$js_files = ['tender-edit.js'];

$breadcrumbs = [
    ['title' => 'Home', 'url' => url('/')],
    ['title' => 'Tenders', 'url' => url('/tenders')],
    ['title' => substr($tender['title'], 0, 30) . '...', 'url' => url('/tenders/' . $tender['id'])],
    ['title' => 'Edit', 'url' => null]
];

ob_start();
?>

<div class="container-fluid">
    <!-- Page Header -->
    <div class="card bg-gradient-warning text-white mb-4">
        <div class="card-body p-4">
            <div class="row align-items-center">
                <div class="col">
                    <h1 class="h2 mb-2"><i class="fas fa-edit me-2"></i>Edit Tender</h1>
                    <p class="mb-0 opacity-75">Update tender details and manage documents</p>
                </div>
                <div class="col-auto">
                    <span class="badge bg-light text-dark fs-6 px-3 py-2">
                        <i class="fas fa-circle me-1"></i><?= e(ucfirst($tender['status'])) ?>
                    </span>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Form Container -->
    <div class="card">
        <!-- Tab Navigation -->
        <div class="card-header">
            <ul class="nav nav-tabs card-header-tabs" id="editTabs">
                <li class="nav-item">
                    <a class="nav-link active" data-bs-toggle="tab" href="#basicInfo">
                        <i class="fas fa-info-circle me-1"></i>Basic Information
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-bs-toggle="tab" href="#details">
                        <i class="fas fa-file-alt me-1"></i>Details & Specifications
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-bs-toggle="tab" href="#documents">
                        <i class="fas fa-folder-open me-1"></i>Documents
                    </a>
                </li>
            </ul>
        </div>
        
        <!-- Form Content -->
        <form id="tenderEditForm" method="POST" action="<?= url('/tenders/' . $tender['id']) ?>" enctype="multipart/form-data">
            <input type="hidden" name="_token" value="<?= $csrf_token ?>">
            <input type="hidden" name="_method" value="PUT">
            
            <div class="card-body">
                <div class="tab-content">
                    <!-- Basic Information Tab -->
                    <div class="tab-pane fade show active" id="basicInfo">
                        <h4 class="mb-3">Basic Information</h4>
                        
                        <div class="row">
                            <div class="col-12 mb-3">
                                <label for="title" class="form-label">Tender Title <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="title" name="title" 
                                       placeholder="Enter a descriptive title for the tender" 
                                       value="<?= e($tender['title']) ?>" required>
                                <div class="form-text">This will be the main heading displayed to bidders</div>
                                <?php if (isset($errors['title'])): ?>
                                    <div class="text-danger small"><?= e($errors['title'][0]) ?></div>
                                <?php endif; ?>
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label for="category_id" class="form-label">Category <span class="text-danger">*</span></label>
                                <select class="form-select" id="category_id" name="category_id" required>
                                    <option value="">Select a category</option>
                                    <?php foreach ($categories as $category): ?>
                                        <option value="<?= e($category['id']) ?>" 
                                                <?= $tender['category_id'] == $category['id'] ? 'selected' : '' ?>>
                                            <?= e($category['name']) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label for="organization" class="form-label">Organization <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="organization" name="organization" 
                                       placeholder="Organization name" value="<?= e($tender['organization']) ?>" required>
                            </div>
                            
                            <div class="col-md-4 mb-3">
                                <label for="estimated_value" class="form-label">Estimated Value</label>
                                <input type="number" class="form-control" id="estimated_value" name="estimated_value" 
                                       placeholder="0.00" step="0.01" min="0" value="<?= e($tender['estimated_value']) ?>">
                            </div>
                            
                            <div class="col-md-4 mb-3">
                                <label for="currency" class="form-label">Currency</label>
                                <select class="form-select" id="currency" name="currency">
                                    <?php foreach ($currencies as $code => $name): ?>
                                        <option value="<?= e($code) ?>" 
                                                <?= $tender['currency'] === $code ? 'selected' : '' ?>>
                                            <?= e($code) ?> - <?= e($name) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            
                            <div class="col-md-4 mb-3">
                                <label for="location" class="form-label">Location</label>
                                <input type="text" class="form-control" id="location" name="location" 
                                       placeholder="Project location" value="<?= e($tender['location']) ?>">
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label for="submission_deadline" class="form-label">Submission Deadline <span class="text-danger">*</span></label>
                                <input type="datetime-local" class="form-control" id="submission_deadline" 
                                       name="submission_deadline" value="<?= e(date('Y-m-d\TH:i', strtotime($tender['submission_deadline']))) ?>" required>
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label for="opening_date" class="form-label">Opening Date</label>
                                <input type="datetime-local" class="form-control" id="opening_date" 
                                       name="opening_date" value="<?= $tender['opening_date'] ? e(date('Y-m-d\TH:i', strtotime($tender['opening_date']))) : '' ?>">
                                <div class="form-text">When bids will be opened (optional)</div>
                            </div>
                            
                            <div class="col-12 mb-3">
                                <label for="description" class="form-label">Description <span class="text-danger">*</span></label>
                                <textarea class="form-control" id="description" name="description" rows="4" 
                                          placeholder="Provide a detailed description of the tender requirements" required><?= e($tender['description']) ?></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Details & Specifications Tab -->
                    <div class="tab-pane fade" id="details">
                        <h4 class="mb-3">Details & Specifications</h4>
                        
                        <div class="row">
                            <div class="col-12 mb-3">
                                <label for="technical_specifications" class="form-label">Technical Specifications <span class="text-danger">*</span></label>
                                <textarea class="form-control" id="technical_specifications" name="technical_specifications" 
                                          rows="5" placeholder="Detailed technical requirements and specifications" required><?= e($tender['technical_specifications']) ?></textarea>
                            </div>
                            
                            <div class="col-12 mb-3">
                                <label for="eligibility_criteria" class="form-label">Eligibility Criteria <span class="text-danger">*</span></label>
                                <textarea class="form-control" id="eligibility_criteria" name="eligibility_criteria" 
                                          rows="4" placeholder="Who can participate in this tender" required><?= e($tender['eligibility_criteria']) ?></textarea>
                            </div>
                            
                            <div class="col-12 mb-3">
                                <label for="terms_conditions" class="form-label">Terms & Conditions</label>
                                <textarea class="form-control" id="terms_conditions" name="terms_conditions" 
                                          rows="4" placeholder="Terms and conditions for participation"><?= e($tender['terms_conditions']) ?></textarea>
                            </div>
                            
                            <div class="col-md-4 mb-3">
                                <label for="contact_person" class="form-label">Contact Person</label>
                                <input type="text" class="form-control" id="contact_person" name="contact_person" 
                                       placeholder="Contact person name" value="<?= e($tender['contact_person']) ?>">
                            </div>
                            
                            <div class="col-md-4 mb-3">
                                <label for="contact_email" class="form-label">Contact Email</label>
                                <input type="email" class="form-control" id="contact_email" name="contact_email" 
                                       placeholder="contact@organization.com" value="<?= e($tender['contact_email']) ?>">
                            </div>
                            
                            <div class="col-md-4 mb-3">
                                <label for="contact_phone" class="form-label">Contact Phone</label>
                                <input type="tel" class="form-control" id="contact_phone" name="contact_phone" 
                                       placeholder="+1 (555) 123-4567" value="<?= e($tender['contact_phone']) ?>">
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label for="priority" class="form-label">Priority</label>
                                <select class="form-select" id="priority" name="priority">
                                    <?php foreach ($priorities as $value => $label): ?>
                                        <option value="<?= e($value) ?>" 
                                                <?= $tender['priority'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label for="status" class="form-label">Status</label>
                                <select class="form-select" id="status" name="status">
                                    <?php foreach ($statuses as $value => $label): ?>
                                        <option value="<?= e($value) ?>" 
                                                <?= $tender['status'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            
                            <div class="col-12">
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="bond_required" 
                                                   name="bond_required" value="1" <?= $tender['bond_required'] ? 'checked' : '' ?>>
                                            <label class="form-check-label" for="bond_required">Bond Required</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="site_visit_required" 
                                                   name="site_visit_required" value="1" <?= $tender['site_visit_required'] ? 'checked' : '' ?>>
                                            <label class="form-check-label" for="site_visit_required">Site Visit Required</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="allow_consortium" 
                                                   name="allow_consortium" value="1" <?= $tender['allow_consortium'] ? 'checked' : '' ?>>
                                            <label class="form-check-label" for="allow_consortium">Allow Consortium Bids</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Documents Tab -->
                    <div class="tab-pane fade" id="documents">
                        <h4 class="mb-3">Document Management</h4>
                        
                        <!-- Existing Documents -->
                        <?php if (!empty($tender['documents'])): ?>
                            <div class="mb-4">
                                <h5><i class="fas fa-folder me-2"></i>Existing Documents</h5>
                                <div class="list-group">
                                    <?php foreach ($tender['documents'] as $document): ?>
                                        <div class="list-group-item d-flex justify-content-between align-items-center" data-document-id="<?= e($document['id']) ?>">
                                            <div class="d-flex align-items-center">
                                                <div class="bg-warning text-white rounded p-2 me-3">
                                                    <i class="fas <?= getDocumentIcon($document['file_type']) ?>"></i>
                                                </div>
                                                <div>
                                                    <h6 class="mb-1"><?= e($document['original_name']) ?></h6>
                                                    <small class="text-muted">
                                                        <?= formatFileSize($document['file_size']) ?> • 
                                                        <?= e($document['file_type']) ?> • 
                                                        Uploaded <?= timeAgo($document['created_at']) ?>
                                                    </small>
                                                </div>
                                            </div>
                                            <div class="d-flex gap-2">
                                                <a href="<?= url('/tenders/' . $tender['id'] . '/documents/' . $document['id'] . '/download') ?>" 
                                                   class="btn btn-outline-primary btn-sm" target="_blank">
                                                    <i class="fas fa-download"></i>
                                                </a>
                                                <button type="button" class="btn btn-outline-danger btn-sm" 
                                                        onclick="deleteDocument(<?= e($document['id']) ?>)">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        <?php endif; ?>
                        
                        <!-- Upload New Documents -->
                        <div class="border border-2 border-dashed rounded p-4 text-center mb-3" id="dropZone">
                            <i class="fas fa-cloud-upload-alt fa-3x text-warning mb-3"></i>
                            <h5>Drag and drop files here or click to browse</h5>
                            <p class="text-muted">Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP (Max 50MB each)</p>
                            <input type="file" id="fileInput" name="documents[]" multiple 
                                   accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip" class="d-none">
                            <button type="button" class="btn btn-warning" onclick="document.getElementById('fileInput').click()">
                                <i class="fas fa-plus me-1"></i>Select Files
                            </button>
                        </div>
                        
                        <div id="uploadedFiles"></div>
                    </div>
                </div>
            </div>
            
            <!-- Form Actions -->
            <div class="card-footer d-flex justify-content-between">
                <a href="<?= url('/tenders/' . $tender['id']) ?>" class="btn btn-outline-secondary">
                    <i class="fas fa-times me-1"></i>Cancel
                </a>
                <div class="d-flex gap-2">
                    <button type="submit" name="save_as_draft" value="1" class="btn btn-outline-warning">
                        <i class="fas fa-save me-1"></i>Save as Draft
                    </button>
                    <button type="submit" class="btn btn-warning">
                        <i class="fas fa-check me-1"></i>Update Tender
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>

<script>
let uploadedFiles = [];

document.addEventListener('DOMContentLoaded', function() {
    setupFileUpload();
    setupFormValidation();
});

function setupFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-warning', 'bg-light');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-warning', 'bg-light');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-warning', 'bg-light');
        handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (validateFile(file)) {
            uploadedFiles.push(file);
            displayUploadedFile(file);
        }
    });
}

function validateFile(file) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 50MB.`);
        return false;
    }
    return true;
}

function displayUploadedFile(file) {
    const container = document.getElementById('uploadedFiles');
    const fileDiv = document.createElement('div');
    fileDiv.className = 'card mb-2';
    fileDiv.innerHTML = `
        <div class="card-body py-2">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <i class="fas fa-file text-warning me-2"></i>
                    <div>
                        <div class="fw-semibold">${file.name}</div>
                        <small class="text-muted">${formatFileSize(file.size)}</small>
                    </div>
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeFile('${file.name}', this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(fileDiv);
}

function removeFile(fileName, button) {
    uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
    button.closest('.card').remove();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function deleteDocument(documentId) {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
        return;
    }
    
    fetch(`<?= url('/tenders/' . $tender['id'] . '/documents/') ?>${documentId}`, {
        method: 'DELETE',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').value
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.querySelector(`[data-document-id="${documentId}"]`).remove();
        } else {
            alert(data.message || 'Failed to delete document.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while deleting the document.');
    });
}

function setupFormValidation() {
    const form = document.getElementById('tenderEditForm');
    
    form.addEventListener('submit', function(e) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            alert('Please fill in all required fields.');
            return;
        }
        
        const submitter = e.submitter;
        const originalText = submitter.innerHTML;
        const isDraft = submitter.name === 'save_as_draft';
        
        submitter.disabled = true;
        submitter.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>${isDraft ? 'Saving Draft...' : 'Updating Tender...'}`;
    });
}
</script>

<?php
$content = ob_get_clean();
include APP_ROOT . '/app/views/layouts/app.php';
?>