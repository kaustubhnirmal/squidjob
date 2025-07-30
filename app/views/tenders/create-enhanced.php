<?php
/**
 * Enhanced Add/Modify Tender Page
 * SquidJob Tender Management System with new UI/UX
 */

$page_title = 'Add/Modify Tender';
$meta_description = 'Create or modify tender information';
$css_files = ['tender-form.css'];
$js_files = ['tender-form.js'];

$is_edit = isset($tender) && !empty($tender);
$form_action = $is_edit ? url('/tenders/' . $tender['id']) : url('/tenders');

ob_start();
?>

<!-- Page Header -->
<div class="page-header">
    <div class="page-header-content">
        <h1 class="page-title">Tender Management</h1>
        <p class="page-subtitle">Create or modify tender information</p>
    </div>
</div>

<!-- Toggle Buttons -->
<div class="tender-toggle-container mb-6">
    <div class="toggle-buttons">
        <button type="button" class="toggle-btn <?= !$is_edit ? 'active' : '' ?>" data-mode="create">
            <i class="fas fa-plus"></i>
            Add New Tender
        </button>
        <button type="button" class="toggle-btn <?= $is_edit ? 'active' : '' ?>" data-mode="modify">
            <i class="fas fa-edit"></i>
            Modify Existing Tender
        </button>
    </div>
</div>

<!-- Form Container -->
<div class="form-container">
    <form method="POST" action="<?= $form_action ?>" enctype="multipart/form-data" id="tenderForm" class="tender-form">
        <?php if ($is_edit): ?>
            <input type="hidden" name="_method" value="PUT">
        <?php endif; ?>
        <input type="hidden" name="_token" value="<?= $csrf_token ?? '' ?>">
        
        <!-- Basic Information Section -->
        <div class="form-section">
            <div class="section-header">
                <h3 class="section-title">Basic Information</h3>
                <p class="section-description">Essential tender details and identification</p>
            </div>
            
            <div class="section-content">
                <div class="grid grid-cols-2 gap-6">
                    <div class="form-group">
                        <label for="title" class="form-label required">Tender Title</label>
                        <input type="text" 
                               id="title" 
                               name="title" 
                               class="form-control" 
                               placeholder="Enter tender title"
                               value="<?= e($tender['title'] ?? '') ?>"
                               required>
                        <div class="form-error" id="title-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="tender_number" class="form-label">Tender Number</label>
                        <input type="text" 
                               id="tender_number" 
                               name="tender_number" 
                               class="form-control" 
                               placeholder="Auto-generated if empty"
                               value="<?= e($tender['tender_number'] ?? '') ?>">
                        <div class="form-help">Leave empty for auto-generation</div>
                    </div>
                    
                    <div class="form-group">
                        <label for="organization" class="form-label required">Issuing Authority</label>
                        <input type="text" 
                               id="organization" 
                               name="organization" 
                               class="form-control" 
                               placeholder="Enter organization name"
                               value="<?= e($tender['organization'] ?? '') ?>"
                               required>
                        <div class="form-error" id="organization-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="location" class="form-label">Location</label>
                        <input type="text" 
                               id="location" 
                               name="location" 
                               class="form-control" 
                               placeholder="Enter location"
                               value="<?= e($tender['location'] ?? '') ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="category_id" class="form-label">Category</label>
                        <select id="category_id" name="category_id" class="form-control">
                            <option value="">Select Category</option>
                            <?php foreach ($categories ?? [] as $category): ?>
                                <option value="<?= $category['id'] ?>" 
                                        <?= ($tender['category_id'] ?? '') == $category['id'] ? 'selected' : '' ?>>
                                    <?= e($category['name']) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="status" class="form-label">Status</label>
                        <select id="status" name="status" class="form-control">
                            <option value="draft" <?= ($tender['status'] ?? 'draft') === 'draft' ? 'selected' : '' ?>>Draft</option>
                            <option value="published" <?= ($tender['status'] ?? '') === 'published' ? 'selected' : '' ?>>Published</option>
                            <option value="closed" <?= ($tender['status'] ?? '') === 'closed' ? 'selected' : '' ?>>Closed</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="description" class="form-label">Description</label>
                    <textarea id="description" 
                              name="description" 
                              class="form-control" 
                              rows="4" 
                              placeholder="Enter detailed description"
                              data-auto-resize><?= e($tender['description'] ?? '') ?></textarea>
                </div>
            </div>
        </div>
        
        <!-- Timeline Section -->
        <div class="form-section">
            <div class="section-header">
                <h3 class="section-title">Timeline & Deadlines</h3>
                <p class="section-description">Important dates and submission deadlines</p>
            </div>
            
            <div class="section-content">
                <div class="grid grid-cols-2 gap-6">
                    <div class="form-group">
                        <label for="publication_date" class="form-label">Publication Date</label>
                        <input type="date" 
                               id="publication_date" 
                               name="publication_date" 
                               class="form-control"
                               value="<?= $tender['publication_date'] ?? date('Y-m-d') ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="submission_deadline" class="form-label required">Submission Deadline</label>
                        <input type="datetime-local" 
                               id="submission_deadline" 
                               name="submission_deadline" 
                               class="form-control"
                               value="<?= isset($tender['submission_deadline']) ? date('Y-m-d\TH:i', strtotime($tender['submission_deadline'])) : '' ?>"
                               required>
                        <div class="form-error" id="submission_deadline-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="opening_date" class="form-label">Bid Opening Date</label>
                        <input type="datetime-local" 
                               id="opening_date" 
                               name="opening_date" 
                               class="form-control"
                               value="<?= isset($tender['opening_date']) ? date('Y-m-d\TH:i', strtotime($tender['opening_date'])) : '' ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="validity_period" class="form-label">Validity Period (Days)</label>
                        <input type="number" 
                               id="validity_period" 
                               name="validity_period" 
                               class="form-control" 
                               placeholder="90"
                               min="1"
                               value="<?= e($tender['validity_period'] ?? '') ?>">
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Financial Information Section -->
        <div class="form-section">
            <div class="section-header">
                <h3 class="section-title">Financial Information</h3>
                <p class="section-description">Costs, fees, and monetary details</p>
            </div>
            
            <div class="section-content">
                <div class="grid grid-cols-3 gap-6">
                    <div class="form-group">
                        <label for="estimated_value" class="form-label">Estimated Value (₹)</label>
                        <input type="number" 
                               id="estimated_value" 
                               name="estimated_value" 
                               class="form-control" 
                               placeholder="0.00"
                               step="0.01"
                               min="0"
                               value="<?= e($tender['estimated_value'] ?? '') ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="emd_amount" class="form-label">EMD Amount (₹)</label>
                        <input type="number" 
                               id="emd_amount" 
                               name="emd_amount" 
                               class="form-control" 
                               placeholder="0.00"
                               step="0.01"
                               min="0"
                               value="<?= e($tender['emd_amount'] ?? '') ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="document_fee" class="form-label">Document Fee (₹)</label>
                        <input type="number" 
                               id="document_fee" 
                               name="document_fee" 
                               class="form-control" 
                               placeholder="0.00"
                               step="0.01"
                               min="0"
                               value="<?= e($tender['document_fee'] ?? '') ?>">
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-6">
                    <div class="form-group">
                        <label for="currency" class="form-label">Currency</label>
                        <select id="currency" name="currency" class="form-control">
                            <option value="INR" <?= ($tender['currency'] ?? 'INR') === 'INR' ? 'selected' : '' ?>>Indian Rupee (₹)</option>
                            <option value="USD" <?= ($tender['currency'] ?? '') === 'USD' ? 'selected' : '' ?>>US Dollar ($)</option>
                            <option value="EUR" <?= ($tender['currency'] ?? '') === 'EUR' ? 'selected' : '' ?>>Euro (€)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="payment_terms" class="form-label">Payment Terms</label>
                        <input type="text" 
                               id="payment_terms" 
                               name="payment_terms" 
                               class="form-control" 
                               placeholder="e.g., 30 days from delivery"
                               value="<?= e($tender['payment_terms'] ?? '') ?>">
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Document Upload Section -->
        <div class="form-section">
            <div class="section-header">
                <h3 class="section-title">Document Upload</h3>
                <p class="section-description">Upload relevant tender documents</p>
            </div>
            
            <div class="section-content">
                <div class="upload-grid">
                    <div class="upload-item">
                        <label for="tender_document" class="upload-label">
                            <div class="upload-icon">
                                <i class="fas fa-file-pdf"></i>
                            </div>
                            <div class="upload-content">
                                <h4>Tender Document</h4>
                                <p>Main tender document (PDF, DOC, DOCX)</p>
                                <span class="upload-button">Choose File</span>
                            </div>
                        </label>
                        <input type="file" 
                               id="tender_document" 
                               name="tender_document" 
                               class="upload-input"
                               accept=".pdf,.doc,.docx"
                               onchange="previewFile(this, 'tender-preview')">
                        <div id="tender-preview" class="file-preview"></div>
                    </div>
                    
                    <div class="upload-item">
                        <label for="technical_specs" class="upload-label">
                            <div class="upload-icon">
                                <i class="fas fa-file-alt"></i>
                            </div>
                            <div class="upload-content">
                                <h4>Technical Specifications</h4>
                                <p>Technical requirements and specs</p>
                                <span class="upload-button">Choose File</span>
                            </div>
                        </label>
                        <input type="file" 
                               id="technical_specs" 
                               name="technical_specs" 
                               class="upload-input"
                               accept=".pdf,.doc,.docx"
                               onchange="previewFile(this, 'specs-preview')">
                        <div id="specs-preview" class="file-preview"></div>
                    </div>
                    
                    <div class="upload-item">
                        <label for="additional_docs" class="upload-label">
                            <div class="upload-icon">
                                <i class="fas fa-file-archive"></i>
                            </div>
                            <div class="upload-content">
                                <h4>Additional Documents</h4>
                                <p>Supporting documents (ZIP, RAR)</p>
                                <span class="upload-button">Choose File</span>
                            </div>
                        </label>
                        <input type="file" 
                               id="additional_docs" 
                               name="additional_docs" 
                               class="upload-input"
                               accept=".zip,.rar,.pdf"
                               onchange="previewFile(this, 'additional-preview')">
                        <div id="additional-preview" class="file-preview"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Form Actions -->
        <div class="form-actions">
            <div class="actions-left">
                <a href="<?= url('/tenders') ?>" class="btn btn-secondary">
                    <i class="fas fa-times"></i>
                    Cancel
                </a>
            </div>
            <div class="actions-right">
                <button type="button" class="btn btn-outline" onclick="saveDraft()">
                    <i class="fas fa-save"></i>
                    Save as Draft
                </button>
                <button type="submit" class="btn btn-primary" id="submitBtn">
                    <i class="fas fa-<?= $is_edit ? 'save' : 'plus' ?>"></i>
                    <?= $is_edit ? 'Update Tender' : 'Add Tender' ?>
                </button>
            </div>
        </div>
    </form>
</div>

<style>
/* Tender Form Specific Styles */
.tender-toggle-container {
    display: flex;
    justify-content: center;
}

.toggle-buttons {
    display: flex;
    background: var(--gray-100);
    border-radius: var(--radius-xl);
    padding: var(--space-1);
    gap: var(--space-1);
}

.toggle-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6);
    background: transparent;
    border: none;
    border-radius: var(--radius-lg);
    font-size: var(--font-size-sm);
    font-weight: var(--font-medium);
    color: var(--gray-600);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.toggle-btn.active {
    background: var(--primary-purple);
    color: var(--white);
    box-shadow: var(--shadow-md);
}

.toggle-btn:hover:not(.active) {
    background: var(--white);
    color: var(--gray-800);
}

.form-container {
    max-width: 1000px;
    margin: 0 auto;
}

.tender-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
}

.form-section {
    background: var(--white);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-md);
    overflow: hidden;
}

.section-header {
    background: var(--gray-50);
    padding: var(--space-6);
    border-bottom: 1px solid var(--gray-200);
}

.section-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-semibold);
    color: var(--gray-900);
    margin: 0 0 var(--space-2) 0;
}

.section-description {
    font-size: var(--font-size-sm);
    color: var(--gray-600);
    margin: 0;
}

.section-content {
    padding: var(--space-6);
}

.form-help {
    font-size: var(--font-size-xs);
    color: var(--gray-500);
    margin-top: var(--space-1);
}

.form-error {
    font-size: var(--font-size-xs);
    color: var(--error);
    margin-top: var(--space-1);
    display: none;
}

.form-error.show {
    display: block;
}

.upload-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
}

.upload-item {
    position: relative;
}

.upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-6);
    border: 2px dashed var(--gray-300);
    border-radius: var(--radius-xl);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: center;
}

.upload-label:hover {
    border-color: var(--primary-purple);
    background: rgba(124, 58, 237, 0.05);
}

.upload-icon {
    width: 48px;
    height: 48px;
    background: var(--primary-purple);
    color: var(--white);
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xl);
    margin-bottom: var(--space-4);
}

.upload-content h4 {
    font-size: var(--font-size-base);
    font-weight: var(--font-semibold);
    color: var(--gray-900);
    margin: 0 0 var(--space-2) 0;
}

.upload-content p {
    font-size: var(--font-size-sm);
    color: var(--gray-600);
    margin: 0 0 var(--space-4) 0;
}

.upload-button {
    display: inline-flex;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    background: var(--primary-purple);
    color: var(--white);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-sm);
    font-weight: var(--font-medium);
}

.upload-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.file-preview {
    margin-top: var(--space-3);
    padding: var(--space-3);
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-sm);
    color: var(--gray-700);
    display: none;
}

.file-preview.show {
    display: block;
}

.form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-6);
    background: var(--white);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-md);
    margin-top: var(--space-8);
}

.actions-right {
    display: flex;
    gap: var(--space-3);
}

@media (max-width: 768px) {
    .toggle-buttons {
        flex-direction: column;
        width: 100%;
    }
    
    .toggle-btn {
        justify-content: center;
    }
    
    .upload-grid {
        grid-template-columns: 1fr;
    }
    
    .form-actions {
        flex-direction: column;
        gap: var(--space-4);
    }
    
    .actions-right {
        width: 100%;
        flex-direction: column;
    }
    
    .actions-right .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>

<script>
// Toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            
            // Update active state
            toggleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Handle mode change
            if (mode === 'modify') {
                // Show tender selection modal or redirect to tender list
                showTenderSelectionModal();
            }
        });
    });
    
    // Form validation
    const form = document.getElementById('tenderForm');
    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
        } else {
            // Show loading state
            const submitBtn = document.getElementById('submitBtn');
            window.SquidJobUI.showButtonLoading(submitBtn, 'Saving...');
        }
    });
});

function validateForm() {
    let isValid = true;
    const requiredFields = ['title', 'organization', 'submission_deadline'];
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        const errorDiv = document.getElementById(fieldName + '-error');
        
        if (!field.value.trim()) {
            errorDiv.textContent = 'This field is required';
            errorDiv.classList.add('show');
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            errorDiv.classList.remove('show');
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

function saveDraft() {
    const form = document.getElementById('tenderForm');
    const formData = new FormData(form);
    formData.append('status', 'draft');
    
    // Show loading
    const draftBtn = event.target;
    window.SquidJobUI.showButtonLoading(draftBtn, 'Saving Draft...');
    
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRF-TOKEN': window.csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.SquidJobUI.showToast('Draft saved successfully!', 'success');
        } else {
            window.SquidJobUI.showToast('Error saving draft', 'error');
        }
    })
    .catch(error => {
        window.SquidJobUI.showToast('Error saving draft', 'error');
    })
    .finally(() => {
        window.SquidJobUI.hideButtonLoading(draftBtn);
    });
}

function showTenderSelectionModal() {
    // This would show a modal to select existing tender for modification
    window.SquidJobUI.showToast('Tender selection modal would appear here', 'info');
}
</script>

<?php
$content = ob_get_clean();
include APP_ROOT . '/app/views/layouts/app-with-sidebar.php';
?>