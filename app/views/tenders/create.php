<?php
/**
 * Tender Creation Form
 * SquidJob Tender Management System
 * 
 * Comprehensive form for creating new tenders with document upload
 */

$page_title = 'Create New Tender';
$meta_description = 'Create a new tender with comprehensive details and document management';
$css_files = ['squidjob-theme.css'];
$js_files = ['tender-form.js'];

$breadcrumbs = [
    ['title' => 'Home', 'url' => url('/')],
    ['title' => 'Tenders', 'url' => url('/tenders')],
    ['title' => 'Create New Tender', 'url' => null]
];

ob_start();
?>

<div class="container-fluid">
    <!-- Page Header -->
    <div class="card bg-gradient-primary text-white mb-4">
        <div class="card-body p-4">
            <h1 class="h2 mb-2"><i class="fas fa-plus-circle me-2"></i>Create New Tender</h1>
            <p class="mb-0 opacity-75">Fill in the details below to create a comprehensive tender listing</p>
        </div>
    </div>
    
    <!-- Multi-step Form -->
    <div class="card">
        <!-- Progress Bar -->
        <div class="card-header">
            <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-primary" id="progressBar" role="progressbar" style="width: 25%"></div>
            </div>
        </div>
        
        <!-- Step Navigation -->
        <div class="card-header bg-light">
            <ul class="nav nav-pills nav-justified" id="stepTabs">
                <li class="nav-item">
                    <a class="nav-link active" data-step="1" href="#step1">
                        <i class="fas fa-info-circle me-1"></i>Basic Info
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-step="2" href="#step2">
                        <i class="fas fa-file-alt me-1"></i>Details
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-step="3" href="#step3">
                        <i class="fas fa-upload me-1"></i>Documents
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-step="4" href="#step4">
                        <i class="fas fa-eye me-1"></i>Review
                    </a>
                </li>
            </ul>
        </div>
        
        <!-- Form Content -->
        <form id="tenderForm" method="POST" action="<?= url('/tenders') ?>" enctype="multipart/form-data">
            <input type="hidden" name="_token" value="<?= $csrf_token ?>">
            
            <div class="card-body">
                <!-- Step 1: Basic Information -->
                <div class="step-content" id="step1">
                    <h4 class="mb-3">Basic Information</h4>
                    
                    <div class="row">
                        <div class="col-12 mb-3">
                            <label for="title" class="form-label">Tender Title <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="title" name="title" 
                                   placeholder="Enter a descriptive title for the tender" 
                                   value="<?= e(old('title')) ?>" required>
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
                                            <?= old('category_id') == $category['id'] ? 'selected' : '' ?>>
                                        <?= e($category['name']) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="organization" class="form-label">Organization <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="organization" name="organization" 
                                   placeholder="Organization name" value="<?= e(old('organization')) ?>" required>
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label for="estimated_value" class="form-label">Estimated Value</label>
                            <input type="number" class="form-control" id="estimated_value" name="estimated_value" 
                                   placeholder="0.00" step="0.01" min="0" value="<?= e(old('estimated_value')) ?>">
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label for="currency" class="form-label">Currency</label>
                            <select class="form-select" id="currency" name="currency">
                                <?php foreach ($currencies as $code => $name): ?>
                                    <option value="<?= e($code) ?>" 
                                            <?= (old('currency') ?: 'USD') === $code ? 'selected' : '' ?>>
                                        <?= e($code) ?> - <?= e($name) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label for="location" class="form-label">Location</label>
                            <input type="text" class="form-control" id="location" name="location" 
                                   placeholder="Project location" value="<?= e(old('location')) ?>">
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="submission_deadline" class="form-label">Submission Deadline <span class="text-danger">*</span></label>
                            <input type="datetime-local" class="form-control" id="submission_deadline" 
                                   name="submission_deadline" value="<?= e(old('submission_deadline')) ?>" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="opening_date" class="form-label">Opening Date</label>
                            <input type="datetime-local" class="form-control" id="opening_date" 
                                   name="opening_date" value="<?= e(old('opening_date')) ?>">
                            <div class="form-text">When bids will be opened (optional)</div>
                        </div>
                        
                        <div class="col-12 mb-3">
                            <label for="description" class="form-label">Description <span class="text-danger">*</span></label>
                            <textarea class="form-control" id="description" name="description" rows="4" 
                                      placeholder="Provide a detailed description of the tender requirements" required><?= e(old('description')) ?></textarea>
                        </div>
                    </div>
                </div>
                
                <!-- Step 2: Details & Specifications -->
                <div class="step-content d-none" id="step2">
                    <h4 class="mb-3">Details & Specifications</h4>
                    
                    <div class="row">
                        <div class="col-12 mb-3">
                            <label for="technical_specifications" class="form-label">Technical Specifications <span class="text-danger">*</span></label>
                            <textarea class="form-control" id="technical_specifications" name="technical_specifications" 
                                      rows="5" placeholder="Detailed technical requirements and specifications" required><?= e(old('technical_specifications')) ?></textarea>
                        </div>
                        
                        <div class="col-12 mb-3">
                            <label for="eligibility_criteria" class="form-label">Eligibility Criteria <span class="text-danger">*</span></label>
                            <textarea class="form-control" id="eligibility_criteria" name="eligibility_criteria" 
                                      rows="4" placeholder="Who can participate in this tender" required><?= e(old('eligibility_criteria')) ?></textarea>
                        </div>
                        
                        <div class="col-12 mb-3">
                            <label for="terms_conditions" class="form-label">Terms & Conditions</label>
                            <textarea class="form-control" id="terms_conditions" name="terms_conditions" 
                                      rows="4" placeholder="Terms and conditions for participation"><?= e(old('terms_conditions')) ?></textarea>
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label for="contact_person" class="form-label">Contact Person</label>
                            <input type="text" class="form-control" id="contact_person" name="contact_person" 
                                   placeholder="Contact person name" value="<?= e(old('contact_person')) ?>">
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label for="contact_email" class="form-label">Contact Email</label>
                            <input type="email" class="form-control" id="contact_email" name="contact_email" 
                                   placeholder="contact@organization.com" value="<?= e(old('contact_email')) ?>">
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label for="contact_phone" class="form-label">Contact Phone</label>
                            <input type="tel" class="form-control" id="contact_phone" name="contact_phone" 
                                   placeholder="+1 (555) 123-4567" value="<?= e(old('contact_phone')) ?>">
                        </div>
                        
                        <div class="col-12">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="bond_required" 
                                               name="bond_required" value="1" <?= old('bond_required') ? 'checked' : '' ?>>
                                        <label class="form-check-label" for="bond_required">Bond Required</label>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="site_visit_required" 
                                               name="site_visit_required" value="1" <?= old('site_visit_required') ? 'checked' : '' ?>>
                                        <label class="form-check-label" for="site_visit_required">Site Visit Required</label>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="allow_consortium" 
                                               name="allow_consortium" value="1" <?= old('allow_consortium') ? 'checked' : '' ?>>
                                        <label class="form-check-label" for="allow_consortium">Allow Consortium Bids</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Step 3: Documents -->
                <div class="step-content d-none" id="step3">
                    <h4 class="mb-3">Document Upload</h4>
                    
                    <div class="border border-2 border-dashed rounded p-4 text-center mb-3" id="dropZone">
                        <i class="fas fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
                        <h5>Drag and drop files here or click to browse</h5>
                        <p class="text-muted">Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP (Max 50MB each)</p>
                        <input type="file" id="fileInput" name="documents[]" multiple 
                               accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip" class="d-none">
                        <button type="button" class="btn btn-primary" onclick="document.getElementById('fileInput').click()">
                            <i class="fas fa-plus me-1"></i>Select Files
                        </button>
                    </div>
                    
                    <div id="uploadedFiles"></div>
                </div>
                
                <!-- Step 4: Review & Submit -->
                <div class="step-content d-none" id="step4">
                    <h4 class="mb-3">Review & Submit</h4>
                    
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Please review all information before submitting the tender.
                    </div>
                    
                    <div id="reviewContent" class="row"></div>
                    
                    <div class="form-check mt-3">
                        <input class="form-check-input" type="checkbox" id="save_as_draft" name="save_as_draft" value="1">
                        <label class="form-check-label" for="save_as_draft">
                            Save as Draft (don't publish immediately)
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Form Actions -->
            <div class="card-footer d-flex justify-content-between">
                <button type="button" class="btn btn-outline-secondary" id="prevBtn" style="display: none;">
                    <i class="fas fa-chevron-left me-1"></i>Previous
                </button>
                <div>
                    <button type="button" class="btn btn-primary" id="nextBtn">
                        Next<i class="fas fa-chevron-right ms-1"></i>
                    </button>
                    <button type="submit" class="btn btn-success" id="submitBtn" style="display: none;">
                        <i class="fas fa-check me-1"></i>Create Tender
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>

<script>
let currentStep = 1;
const totalSteps = 4;
let uploadedFiles = [];

document.addEventListener('DOMContentLoaded', function() {
    updateStepDisplay();
    setupFileUpload();
    setupFormNavigation();
});

function setupFormNavigation() {
    document.getElementById('nextBtn').addEventListener('click', function() {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepDisplay();
            }
        }
    });
    
    document.getElementById('prevBtn').addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            updateStepDisplay();
        }
    });
    
    // Step tab navigation
    document.querySelectorAll('#stepTabs .nav-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const stepNumber = parseInt(this.dataset.step);
            if (stepNumber <= currentStep || validateStepsUpTo(stepNumber - 1)) {
                currentStep = stepNumber;
                updateStepDisplay();
            }
        });
    });
}

function updateStepDisplay() {
    // Update progress bar
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Update step tabs
    document.querySelectorAll('#stepTabs .nav-link').forEach((tab, index) => {
        const stepNumber = index + 1;
        tab.classList.remove('active');
        if (stepNumber === currentStep) {
            tab.classList.add('active');
        }
    });
    
    // Update step content
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.add('d-none');
    });
    document.getElementById(`step${currentStep}`).classList.remove('d-none');
    
    // Update navigation buttons
    document.getElementById('prevBtn').style.display = currentStep > 1 ? 'block' : 'none';
    document.getElementById('nextBtn').style.display = currentStep < totalSteps ? 'block' : 'none';
    document.getElementById('submitBtn').style.display = currentStep === totalSteps ? 'block' : 'none';
    
    // Update review on final step
    if (currentStep === totalSteps) {
        updateReview();
    }
}

function validateCurrentStep() {
    const currentStepContent = document.getElementById(`step${currentStep}`);
    const requiredFields = currentStepContent.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

function validateStepsUpTo(stepNumber) {
    for (let i = 1; i <= stepNumber; i++) {
        const stepContent = document.getElementById(`step${i}`);
        const requiredFields = stepContent.querySelectorAll('[required]');
        
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                return false;
            }
        }
    }
    return true;
}

function setupFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-primary', 'bg-light');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-primary', 'bg-light');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-primary', 'bg-light');
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
                    <i class="fas fa-file text-primary me-2"></i>
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

function updateReview() {
    const form = document.getElementById('tenderForm');
    const formData = new FormData(form);
    const reviewContent = document.getElementById('reviewContent');
    
    const reviewItems = [
        { label: 'Title', value: formData.get('title') },
        { label: 'Organization', value: formData.get('organization') },
        { label: 'Category', value: document.querySelector('#category_id option:checked')?.textContent },
        { label: 'Estimated Value', value: formData.get('estimated_value') ? `${formData.get('currency')} ${formData.get('estimated_value')}` : 'Not specified' },
        { label: 'Location', value: formData.get('location') || 'Not specified' },
        { label: 'Submission Deadline', value: formatDateTime(formData.get('submission_deadline')) },
        { label: 'Contact Person', value: formData.get('contact_person') || 'Not specified' },
        { label: 'Documents', value: `${uploadedFiles.length} file(s) uploaded` }
    ];
    
    reviewContent.innerHTML = reviewItems.map(item => `
        <div class="col-md-6 mb-3">
            <div class="card">
                <div class="card-body py-2">
                    <small class="text-muted text-uppercase">${item.label}</small>
                    <div class="fw-semibold">${item.value || 'Not provided'}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString();
}

// Form submission
document.getElementById('tenderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validateStepsUpTo(totalSteps)) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Creating Tender...';
    
    // Submit the form normally for now
    this.submit();
});
</script>

<?php
$content = ob_get_clean();
include APP_ROOT . '/app/views/layouts/app.php';
?>