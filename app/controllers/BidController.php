<?php
/**
 * BidController
 * SquidJob Tender Management System
 *
 * Handles bid participation workflow including bid submission,
 * evaluation, and management functionality
 */

namespace App\Controllers;

use App\Models\Bid;
use App\Models\Tender;
use App\Models\BidDocument;

class BidController extends BaseController
{
    private $bidModel;
    private $tenderModel;
    private $bidDocumentModel;
    
    public function __construct()
    {
        parent::__construct();
        $this->bidModel = new Bid();
        $this->tenderModel = new Tender();
        $this->bidDocumentModel = new BidDocument();
    }
    
    /**
     * Display list of bids for current user
     */
    public function index()
    {
        try {
            // Check authentication
            if (!$this->isAuthenticated()) {
                return $this->redirectToLogin();
            }
            
            $userId = $this->getCurrentUserId();
            $page = (int)($_GET['page'] ?? 1);
            $limit = 20;
            $offset = ($page - 1) * $limit;
            
            // Get filters
            $filters = [
                'status' => $_GET['status'] ?? '',
                'tender_id' => $_GET['tender_id'] ?? '',
                'search' => $_GET['search'] ?? '',
                'date_from' => $_GET['date_from'] ?? '',
                'date_to' => $_GET['date_to'] ?? ''
            ];
            
            // Get user's bids with pagination
            $bids = $this->bidModel->getUserBids($userId, $filters, $limit, $offset);
            $totalBids = $this->bidModel->getUserBidsCount($userId, $filters);
            $totalPages = ceil($totalBids / $limit);
            
            // Get bid statistics
            $stats = $this->bidModel->getUserBidStats($userId);
            
            // Get tender titles for filter dropdown
            $userTenders = $this->bidModel->getUserTendersList($userId);
            
            $data = [
                'bids' => $bids,
                'stats' => $stats,
                'userTenders' => $userTenders,
                'filters' => $filters,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_items' => $totalBids,
                    'per_page' => $limit
                ],
                'statuses' => $this->bidModel->getStatusOptions(),
                'page_title' => 'My Bids',
                'breadcrumbs' => [
                    ['title' => 'Dashboard', 'url' => '/dashboard'],
                    ['title' => 'My Bids', 'url' => '/bids']
                ]
            ];
            
            return $this->render('bids/index', $data);
            
        } catch (Exception $e) {
            $this->logError('Error in BidController::index', $e);
            return $this->handleError('Failed to load bids', '/dashboard');
        }
    }
    
    /**
     * Show specific bid details
     */
    public function show($id)
    {
        try {
            if (!$this->isAuthenticated()) {
                return $this->redirectToLogin();
            }
            
            $userId = $this->getCurrentUserId();
            $bid = $this->bidModel->findById($id);
            
            if (!$bid) {
                return $this->handleError('Bid not found', '/bids');
            }
            
            // Check if user owns this bid or has permission to view
            if ($bid['bidder_id'] != $userId && !$this->hasPermission('view_all_bids')) {
                return $this->handleError('Access denied', '/bids');
            }
            
            // Get tender details
            $tender = $this->tenderModel->findById($bid['tender_id']);
            if (!$tender) {
                return $this->handleError('Associated tender not found', '/bids');
            }
            
            // Get bid documents
            $documents = $this->bidDocumentModel->getByBidId($id);
            
            // Get evaluation details if available
            $evaluation = null;
            if ($bid['status'] !== 'draft' && $bid['status'] !== 'submitted') {
                $evaluation = $this->bidModel->getEvaluationDetails($id);
            }
            
            // Get bid activity log
            $activities = $this->bidModel->getBidActivities($id);
            
            $data = [
                'bid' => $bid,
                'tender' => $tender,
                'documents' => $documents,
                'evaluation' => $evaluation,
                'activities' => $activities,
                'canEdit' => $this->canEditBid($bid, $userId),
                'canWithdraw' => $this->canWithdrawBid($bid, $userId),
                'page_title' => 'Bid Details',
                'breadcrumbs' => [
                    ['title' => 'Dashboard', 'url' => '/dashboard'],
                    ['title' => 'My Bids', 'url' => '/bids'],
                    ['title' => 'Bid #' . $bid['id'], 'url' => '/bids/' . $id]
                ]
            ];
            
            return $this->render('bids/show', $data);
            
        } catch (Exception $e) {
            $this->logError('Error in BidController::show', $e);
            return $this->handleError('Failed to load bid details', '/bids');
        }
    }
    
    /**
     * Show bid creation form
     */
    public function create($tenderId)
    {
        try {
            if (!$this->isAuthenticated()) {
                return $this->redirectToLogin();
            }
            
            $userId = $this->getCurrentUserId();
            $tender = $this->tenderModel->findById($tenderId);
            
            if (!$tender) {
                return $this->handleError('Tender not found', '/tenders');
            }
            
            // Check if tender is still open for bidding
            if (!$this->isTenderOpenForBidding($tender)) {
                return $this->handleError('This tender is no longer accepting bids', '/tenders/' . $tenderId);
            }
            
            // Check if user already has a bid for this tender
            $existingBid = $this->bidModel->getUserBidForTender($userId, $tenderId);
            if ($existingBid) {
                return $this->redirect('/bids/' . $existingBid['id'] . '/edit');
            }
            
            // Check eligibility
            if (!$this->checkBidderEligibility($tender, $userId)) {
                return $this->handleError('You are not eligible to bid on this tender', '/tenders/' . $tenderId);
            }
            
            // Get tender documents
            $tenderDocuments = $this->tenderModel->getDocuments($tenderId);
            
            // Get user profile for pre-filling
            $userProfile = $this->getUserProfile($userId);
            
            $data = [
                'tender' => $tender,
                'tenderDocuments' => $tenderDocuments,
                'userProfile' => $userProfile,
                'currencies' => $this->getCurrencyOptions(),
                'documentTypes' => $this->bidDocumentModel->getDocumentTypes(),
                'page_title' => 'Submit Bid',
                'breadcrumbs' => [
                    ['title' => 'Dashboard', 'url' => '/dashboard'],
                    ['title' => 'Tenders', 'url' => '/tenders'],
                    ['title' => $tender['title'], 'url' => '/tenders/' . $tenderId],
                    ['title' => 'Submit Bid', 'url' => '/tenders/' . $tenderId . '/bid']
                ]
            ];
            
            return $this->render('bids/create', $data);
            
        } catch (Exception $e) {
            $this->logError('Error in BidController::create', $e);
            return $this->handleError('Failed to load bid form', '/tenders');
        }
    }
    
    /**
     * Store new bid
     */
    public function store()
    {
        try {
            if (!$this->isAuthenticated()) {
                return $this->jsonResponse(['success' => false, 'message' => 'Authentication required']);
            }
            
            // Validate CSRF token
            if (!$this->validateCsrfToken()) {
                return $this->jsonResponse(['success' => false, 'message' => 'Invalid security token']);
            }
            
            $userId = $this->getCurrentUserId();
            $tenderId = (int)$_POST['tender_id'];
            
            // Validate tender
            $tender = $this->tenderModel->findById($tenderId);
            if (!$tender || !$this->isTenderOpenForBidding($tender)) {
                return $this->jsonResponse(['success' => false, 'message' => 'Tender is not available for bidding']);
            }
            
            // Check for existing bid
            $existingBid = $this->bidModel->getUserBidForTender($userId, $tenderId);
            if ($existingBid) {
                return $this->jsonResponse(['success' => false, 'message' => 'You have already submitted a bid for this tender']);
            }
            
            // Validate input data
            $validationResult = $this->validateBidData($_POST);
            if (!$validationResult['valid']) {
                return $this->jsonResponse(['success' => false, 'message' => 'Validation failed', 'errors' => $validationResult['errors']]);
            }
            
            // Prepare bid data
            $bidData = [
                'tender_id' => $tenderId,
                'bidder_id' => $userId,
                'bid_amount' => (float)$_POST['bid_amount'],
                'currency' => $_POST['currency'] ?? $tender['currency'],
                'completion_time' => !empty($_POST['completion_time']) ? (int)$_POST['completion_time'] : null,
                'technical_proposal' => $_POST['technical_proposal'],
                'financial_proposal' => $_POST['financial_proposal'] ?? '',
                'company_profile' => $_POST['company_profile'] ?? '',
                'status' => isset($_POST['save_as_draft']) ? 'draft' : 'submitted',
                'submitted_at' => isset($_POST['save_as_draft']) ? null : date('Y-m-d H:i:s')
            ];
            
            // Start transaction
            $this->bidModel->beginTransaction();
            
            try {
                // Create bid
                $bidId = $this->bidModel->create($bidData);
                
                // Handle document uploads
                if (!empty($_FILES['documents']['name'][0])) {
                    $uploadResult = $this->handleBidDocumentUploads($bidId, $_FILES['documents']);
                    if (!$uploadResult['success']) {
                        throw new Exception($uploadResult['message']);
                    }
                }
                
                // Log activity
                $this->logBidActivity($bidId, $userId, 'bid_created', 'Bid created', [
                    'status' => $bidData['status'],
                    'amount' => $bidData['bid_amount']
                ]);
                
                // Send notifications if submitted
                if ($bidData['status'] === 'submitted') {
                    $this->sendBidSubmissionNotifications($bidId, $tender);
                }
                
                $this->bidModel->commit();
                
                return $this->jsonResponse([
                    'success' => true,
                    'message' => $bidData['status'] === 'draft' ? 'Bid saved as draft' : 'Bid submitted successfully',
                    'redirect' => '/bids/' . $bidId
                ]);
                
            } catch (Exception $e) {
                $this->bidModel->rollback();
                throw $e;
            }
            
        } catch (Exception $e) {
            $this->logError('Error in BidController::store', $e);
            return $this->jsonResponse(['success' => false, 'message' => 'Failed to submit bid']);
        }
    }
    
    /**
     * Show bid edit form
     */
    public function edit($id)
    {
        try {
            if (!$this->isAuthenticated()) {
                return $this->redirectToLogin();
            }
            
            $userId = $this->getCurrentUserId();
            $bid = $this->bidModel->findById($id);
            
            if (!$bid) {
                return $this->handleError('Bid not found', '/bids');
            }
            
            // Check ownership and edit permissions
            if (!$this->canEditBid($bid, $userId)) {
                return $this->handleError('You cannot edit this bid', '/bids/' . $id);
            }
            
            // Get tender details
            $tender = $this->tenderModel->findById($bid['tender_id']);
            if (!$tender) {
                return $this->handleError('Associated tender not found', '/bids');
            }
            
            // Get bid documents
            $documents = $this->bidDocumentModel->getByBidId($id);
            
            // Get tender documents for reference
            $tenderDocuments = $this->tenderModel->getDocuments($bid['tender_id']);
            
            $data = [
                'bid' => $bid,
                'tender' => $tender,
                'documents' => $documents,
                'tenderDocuments' => $tenderDocuments,
                'currencies' => $this->getCurrencyOptions(),
                'documentTypes' => $this->bidDocumentModel->getDocumentTypes(),
                'page_title' => 'Edit Bid',
                'breadcrumbs' => [
                    ['title' => 'Dashboard', 'url' => '/dashboard'],
                    ['title' => 'My Bids', 'url' => '/bids'],
                    ['title' => 'Bid #' . $id, 'url' => '/bids/' . $id],
                    ['title' => 'Edit', 'url' => '/bids/' . $id . '/edit']
                ]
            ];
            
            return $this->render('bids/edit', $data);
            
        } catch (Exception $e) {
            $this->logError('Error in BidController::edit', $e);
            return $this->handleError('Failed to load bid edit form', '/bids');
        }
    }
    
    /**
     * Update existing bid
     */
    public function update($id)
    {
        try {
            if (!$this->isAuthenticated()) {
                return $this->jsonResponse(['success' => false, 'message' => 'Authentication required']);
            }
            
            // Validate CSRF token
            if (!$this->validateCsrfToken()) {
                return $this->jsonResponse(['success' => false, 'message' => 'Invalid security token']);
            }
            
            $userId = $this->getCurrentUserId();
            $bid = $this->bidModel->findById($id);
            
            if (!$bid || !$this->canEditBid($bid, $userId)) {
                return $this->jsonResponse(['success' => false, 'message' => 'Cannot edit this bid']);
            }
            
            // Validate input data
            $validationResult = $this->validateBidData($_POST);
            if (!$validationResult['valid']) {
                return $this->jsonResponse(['success' => false, 'message' => 'Validation failed', 'errors' => $validationResult['errors']]);
            }
            
            // Prepare update data
            $updateData = [
                'bid_amount' => (float)$_POST['bid_amount'],
                'currency' => $_POST['currency'] ?? $bid['currency'],
                'completion_time' => !empty($_POST['completion_time']) ? (int)$_POST['completion_time'] : null,
                'technical_proposal' => $_POST['technical_proposal'],
                'financial_proposal' => $_POST['financial_proposal'] ?? '',
                'company_profile' => $_POST['company_profile'] ?? ''
            ];
            
            // Handle status change
            $newStatus = isset($_POST['save_as_draft']) ? 'draft' : 'submitted';
            if ($bid['status'] === 'draft' && $newStatus === 'submitted') {
                $updateData['status'] = 'submitted';
                $updateData['submitted_at'] = date('Y-m-d H:i:s');
            }
            
            // Start transaction
            $this->bidModel->beginTransaction();
            
            try {
                // Update bid
                $this->bidModel->update($id, $updateData);
                
                // Handle new document uploads
                if (!empty($_FILES['documents']['name'][0])) {
                    $uploadResult = $this->handleBidDocumentUploads($id, $_FILES['documents']);
                    if (!$uploadResult['success']) {
                        throw new Exception($uploadResult['message']);
                    }
                }
                
                // Log activity
                $this->logBidActivity($id, $userId, 'bid_updated', 'Bid updated', [
                    'changes' => $updateData
                ]);
                
                // Send notifications if newly submitted
                if ($bid['status'] === 'draft' && $newStatus === 'submitted') {
                    $tender = $this->tenderModel->findById($bid['tender_id']);
                    $this->sendBidSubmissionNotifications($id, $tender);
                }
                
                $this->bidModel->commit();
                
                return $this->jsonResponse([
                    'success' => true,
                    'message' => 'Bid updated successfully',
                    'redirect' => '/bids/' . $id
                ]);
                
            } catch (Exception $e) {
                $this->bidModel->rollback();
                throw $e;
            }
            
        } catch (Exception $e) {
            $this->logError('Error in BidController::update', $e);
            return $this->jsonResponse(['success' => false, 'message' => 'Failed to update bid']);
        }
    }
    
    /**
     * Withdraw a bid
     */
    public function withdraw($id)
    {
        try {
            if (!$this->isAuthenticated()) {
                return $this->jsonResponse(['success' => false, 'message' => 'Authentication required']);
            }
            
            $userId = $this->getCurrentUserId();
            $bid = $this->bidModel->findById($id);
            
            if (!$bid || !$this->canWithdrawBid($bid, $userId)) {
                return $this->jsonResponse(['success' => false, 'message' => 'Cannot withdraw this bid']);
            }
            
            // Update bid status
            $this->bidModel->update($id, ['status' => 'withdrawn']);
            
            // Log activity
            $this->logBidActivity($id, $userId, 'bid_withdrawn', 'Bid withdrawn by bidder');
            
            // Send notifications
            $tender = $this->tenderModel->findById($bid['tender_id']);
            $this->sendBidWithdrawalNotifications($id, $tender);
            
            return $this->jsonResponse([
                'success' => true,
                'message' => 'Bid withdrawn successfully',
                'redirect' => '/bids/' . $id
            ]);
            
        } catch (Exception $e) {
            $this->logError('Error in BidController::withdraw', $e);
            return $this->jsonResponse(['success' => false, 'message' => 'Failed to withdraw bid']);
        }
    }
    
    /**
     * Delete a bid document
     */
    public function deleteDocument($bidId, $documentId)
    {
        try {
            if (!$this->isAuthenticated()) {
                return $this->jsonResponse(['success' => false, 'message' => 'Authentication required']);
            }
            
            $userId = $this->getCurrentUserId();
            $bid = $this->bidModel->findById($bidId);
            
            if (!$bid || !$this->canEditBid($bid, $userId)) {
                return $this->jsonResponse(['success' => false, 'message' => 'Access denied']);
            }
            
            $document = $this->bidDocumentModel->findById($documentId);
            if (!$document || $document['bid_id'] != $bidId) {
                return $this->jsonResponse(['success' => false, 'message' => 'Document not found']);
            }
            
            // Delete file from storage
            $this->deleteDocumentFile($document['file_path']);
            
            // Delete from database
            $this->bidDocumentModel->delete($documentId);
            
            // Log activity
            $this->logBidActivity($bidId, $userId, 'document_deleted', 'Document deleted', [
                'document_name' => $document['original_name']
            ]);
            
            return $this->jsonResponse(['success' => true, 'message' => 'Document deleted successfully']);
            
        } catch (Exception $e) {
            $this->logError('Error in BidController::deleteDocument', $e);
            return $this->jsonResponse(['success' => false, 'message' => 'Failed to delete document']);
        }
    }
    
    /**
     * Download bid document
     */
    public function downloadDocument($bidId, $documentId)
    {
        try {
            if (!$this->isAuthenticated()) {
                return $this->handleError('Authentication required', '/login');
            }
            
            $userId = $this->getCurrentUserId();
            $bid = $this->bidModel->findById($bidId);
            
            if (!$bid) {
                return $this->handleError('Bid not found', '/bids');
            }
            
            // Check access permissions
            if ($bid['bidder_id'] != $userId && !$this->hasPermission('view_all_bids')) {
                return $this->handleError('Access denied', '/bids');
            }
            
            $document = $this->bidDocumentModel->findById($documentId);
            if (!$document || $document['bid_id'] != $bidId) {
                return $this->handleError('Document not found', '/bids/' . $bidId);
            }
            
            // Serve file download
            $this->serveFileDownload($document);
            
        } catch (Exception $e) {
            $this->logError('Error in BidController::downloadDocument', $e);
            return $this->handleError('Failed to download document', '/bids');
        }
    }
    
    // Private helper methods
    
    private function validateBidData($data)
    {
        $errors = [];
        
        if (empty($data['bid_amount']) || !is_numeric($data['bid_amount']) || $data['bid_amount'] <= 0) {
            $errors['bid_amount'] = 'Valid bid amount is required';
        }
        
        if (empty($data['technical_proposal'])) {
            $errors['technical_proposal'] = 'Technical proposal is required';
        }
        
        if (!empty($data['completion_time']) && (!is_numeric($data['completion_time']) || $data['completion_time'] <= 0)) {
            $errors['completion_time'] = 'Valid completion time is required';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    private function canEditBid($bid, $userId)
    {
        // Can edit if user owns the bid and it's in draft or submitted status
        return $bid['bidder_id'] == $userId && in_array($bid['status'], ['draft', 'submitted']);
    }
    
    private function canWithdrawBid($bid, $userId)
    {
        // Can withdraw if user owns the bid and it's submitted but not yet evaluated
        return $bid['bidder_id'] == $userId && $bid['status'] === 'submitted';
    }
    
    private function isTenderOpenForBidding($tender)
    {
        return $tender['status'] === 'active' && 
               strtotime($tender['submission_deadline']) > time();
    }
    
    private function checkBidderEligibility($tender, $userId)
    {
        // Add your eligibility logic here
        // For now, return true for all authenticated users
        return true;
    }
    
    private function handleBidDocumentUploads($bidId, $files)
    {
        try {
            $uploadedCount = 0;
            $errors = [];
            
            for ($i = 0; $i < count($files['name']); $i++) {
                if ($files['error'][$i] === UPLOAD_ERR_OK) {
                    $uploadResult = $this->uploadBidDocument($bidId, [
                        'name' => $files['name'][$i],
                        'tmp_name' => $files['tmp_name'][$i],
                        'size' => $files['size'][$i],
                        'type' => $files['type'][$i]
                    ]);
                    
                    if ($uploadResult['success']) {
                        $uploadedCount++;
                    } else {
                        $errors[] = $uploadResult['message'];
                    }
                }
            }
            
            return [
                'success' => $uploadedCount > 0,
                'message' => $uploadedCount > 0 ? "$uploadedCount document(s) uploaded successfully" : 'No documents uploaded',
                'errors' => $errors
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Document upload failed: ' . $e->getMessage()];
        }
    }
    
    private function uploadBidDocument($bidId, $file)
    {
        // Implement document upload logic
        // This is a simplified version - add proper validation, virus scanning, etc.
        
        $allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'];
        $maxSize = 50 * 1024 * 1024; // 50MB
        
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($fileExtension, $allowedTypes)) {
            return ['success' => false, 'message' => 'File type not allowed'];
        }
        
        if ($file['size'] > $maxSize) {
            return ['success' => false, 'message' => 'File too large'];
        }
        
        $uploadDir = __DIR__ . '/../../uploads/bids/' . $bidId . '/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $storedName = uniqid() . '.' . $fileExtension;
        $filePath = $uploadDir . $storedName;
        
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            // Save to database
            $documentData = [
                'bid_id' => $bidId,
                'original_name' => $file['name'],
                'stored_name' => $storedName,
                'file_path' => $filePath,
                'file_size' => $file['size'],
                'file_type' => $fileExtension,
                'mime_type' => $file['type'],
                'uploaded_by' => $this->getCurrentUserId()
            ];
            
            $this->bidDocumentModel->create($documentData);
            
            return ['success' => true, 'message' => 'Document uploaded successfully'];
        }
        
        return ['success' => false, 'message' => 'Failed to upload document'];
    }
    
    private function logBidActivity($bidId, $userId, $activityType, $description, $metadata = [])
    {
        // Log bid activity for audit trail
        $activityData = [
            'bid_id' => $bidId,
            'user_id' => $userId,
            'activity_type' => $activityType,
            'description' => $description,
            'metadata' => json_encode($metadata),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ];
        
        // Implement activity logging
        // $this->bidModel->logActivity($activityData);
    }
    
    private function sendBidSubmissionNotifications($bidId, $tender)
    {
        // Send notifications to tender owner and watchers
        // Implement notification logic here
    }
    
    private function sendBidWithdrawalNotifications($bidId, $tender)
    {
        // Send notifications about bid withdrawal
        // Implement notification logic here
    }
    
    private function getCurrencyOptions()
    {
        return [
            'USD' => 'US Dollar',
            'EUR' => 'Euro',
            'GBP' => 'British Pound',
            'INR' => 'Indian Rupee',
            'CAD' => 'Canadian Dollar',
            'AUD' => 'Australian Dollar'
        ];
    }
    
    private function getUserProfile($userId)
    {
        // Get user profile information for pre-filling forms
        // Implement user profile retrieval
        return [];
    }
    
    private function serveFileDownload($document)
    {
        if (!file_exists($document['file_path'])) {
            throw new Exception('File not found');
        }
        
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $document['original_name'] . '"');
        header('Content-Length: ' . $document['file_size']);
        
        readfile($document['file_path']);
        exit;
    }
    
    private function deleteDocumentFile($filePath)
    {
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }
}