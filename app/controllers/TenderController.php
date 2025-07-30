<?php
/**
 * Tender Controller
 * SquidJob Tender Management System
 * 
 * Handles all tender-related operations including listing, creation, editing, and management
 */

namespace App\Controllers;

use App\Models\Tender;
use App\Models\TenderCategory;
use App\Models\TenderDocument;
use App\Models\Bid;
use App\Models\User;

class TenderController extends BaseController {
    
    protected $tenderModel;
    protected $categoryModel;
    protected $documentModel;
    protected $bidModel;
    
    public function __construct() {
        parent::__construct();
        $this->tenderModel = new Tender();
        $this->categoryModel = new TenderCategory();
        $this->documentModel = new TenderDocument();
        $this->bidModel = new Bid();
        
        // Set page-specific data
        $this->setTitle('Tender Management');
        $this->addBreadcrumb('Dashboard', '/dashboard');
        $this->addBreadcrumb('Tenders', '/tenders');
        
        // Add tender-specific CSS and JS
        $this->addCss('tenders.css');
        $this->addJs('tenders.js');
    }
    
    /**
     * Display tender listing page with advanced filtering
     */
    public function index() {
        $this->requireAuth();
        
        // Get filter parameters
        $filters = [
            'status' => $this->input('status'),
            'category' => $this->input('category'),
            'organization' => $this->input('organization'),
            'date_from' => $this->input('date_from'),
            'date_to' => $this->input('date_to'),
            'value_min' => $this->input('value_min'),
            'value_max' => $this->input('value_max'),
            'search' => $this->input('search'),
            'sort' => $this->input('sort', 'created_at'),
            'order' => $this->input('order', 'desc'),
            'per_page' => $this->input('per_page', 20),
            'page' => $this->input('page', 1)
        ];
        
        // Get filtered tenders
        $tenders = $this->tenderModel->getFilteredTenders($filters);
        
        // Get categories for filter dropdown
        $categories = $this->categoryModel->all('name', 'ASC');
        
        // Get tender statistics
        $stats = $this->getTenderStats();
        
        // Set page data
        $this->setTitle('All Tenders');
        $this->setMetaDescription('Browse and manage all tenders in the system');
        
        $this->view('tenders.index', [
            'tenders' => $tenders,
            'categories' => $categories,
            'filters' => $filters,
            'stats' => $stats,
            'statuses' => $this->getTenderStatuses()
        ]);
    }
    
    /**
     * Display tender details page
     */
    public function show($id) {
        $this->requireAuth();
        
        $tender = $this->tenderModel->findOrFail($id);
        
        // Check if user can view this tender
        if (!$this->canViewTender($tender)) {
            flash('error', 'You do not have permission to view this tender.');
            redirect('/tenders');
        }
        
        // Increment view count
        $this->tenderModel->incrementViewCount($id);
        
        // Get tender documents
        $documents = $this->documentModel->getTenderDocuments($id);
        
        // Get bids for this tender (if user has permission)
        $bids = [];
        if (can('view_bids')) {
            $bids = $this->bidModel->getTenderBids($id);
        }
        
        // Get tender amendments
        $amendments = $this->tenderModel->getTenderAmendments($id);
        
        // Get related tenders
        $relatedTenders = $this->tenderModel->getRelatedTenders($tender['category_id'], $id, 5);
        
        // Log activity
        $this->logActivity('view_tender', "Viewed tender: {$tender['title']}", $id, 'tender');
        
        // Set page data
        $this->setTitle($tender['title']);
        $this->setMetaDescription(substr($tender['description'], 0, 160));
        $this->addBreadcrumb($tender['title'], "/tenders/{$id}");
        
        $this->view('tenders.show', [
            'tender' => $tender,
            'documents' => $documents,
            'bids' => $bids,
            'amendments' => $amendments,
            'relatedTenders' => $relatedTenders,
            'canEdit' => $this->canEditTender($tender),
            'canDelete' => $this->canDeleteTender($tender),
            'canBid' => $this->canBidOnTender($tender)
        ]);
    }
    
    /**
     * Show tender creation form
     */
    public function create() {
        $this->requirePermission('create_tender');
        
        $categories = $this->categoryModel->all('name', 'ASC');
        
        $this->setTitle('Create New Tender');
        $this->addBreadcrumb('Create Tender', '/tenders/create');
        
        $this->view('tenders.create', [
            'categories' => $categories,
            'currencies' => $this->getCurrencies(),
            'priorities' => $this->getPriorities()
        ]);
    }
    
    /**
     * Store new tender
     */
    public function store() {
        $this->requirePermission('create_tender');
        $this->verifyCsrfToken();
        
        $data = $this->validate($this->input(), [
            'title' => 'required|max:255',
            'description' => 'required',
            'category_id' => 'required|numeric',
            'organization' => 'required|max:255',
            'contact_email' => 'email',
            'estimated_value' => 'numeric',
            'submission_deadline' => 'required|date',
            'opening_date' => 'date',
            'eligibility_criteria' => 'required',
            'technical_specifications' => 'required'
        ]);
        
        // Add additional data
        $data['tender_number'] = $this->generateTenderNumber();
        $data['created_by'] = $this->user['id'];
        $data['status'] = $this->input('save_as_draft') ? 'draft' : 'published';
        $data['published_at'] = $data['status'] === 'published' ? date('Y-m-d H:i:s') : null;
        
        try {
            $this->tenderModel->beginTransaction();
            
            // Create tender
            $tender = $this->tenderModel->create($data);
            
            // Handle document uploads
            if (isset($_FILES['documents'])) {
                $this->handleDocumentUploads($tender['id'], $_FILES['documents']);
            }
            
            $this->tenderModel->commit();
            
            // Log activity
            $this->logActivity('create_tender', "Created tender: {$tender['title']}", $tender['id'], 'tender');
            
            // Send notifications
            if ($data['status'] === 'published') {
                $this->sendTenderPublishedNotifications($tender);
            }
            
            flash('success', 'Tender created successfully.');
            redirect("/tenders/{$tender['id']}");
            
        } catch (\Exception $e) {
            $this->tenderModel->rollback();
            logMessage('error', 'Failed to create tender: ' . $e->getMessage());
            flash('error', 'Failed to create tender. Please try again.');
            $this->back();
        }
    }
    
    /**
     * Show tender edit form
     */
    public function edit($id) {
        $this->requireAuth();
        
        $tender = $this->tenderModel->findOrFail($id);
        
        if (!$this->canEditTender($tender)) {
            flash('error', 'You do not have permission to edit this tender.');
            redirect("/tenders/{$id}");
        }
        
        $categories = $this->categoryModel->all('name', 'ASC');
        $documents = $this->documentModel->getTenderDocuments($id);
        
        $this->setTitle('Edit Tender: ' . $tender['title']);
        $this->addBreadcrumb($tender['title'], "/tenders/{$id}");
        $this->addBreadcrumb('Edit', "/tenders/{$id}/edit");
        
        $this->view('tenders.edit', [
            'tender' => $tender,
            'categories' => $categories,
            'documents' => $documents,
            'currencies' => $this->getCurrencies(),
            'priorities' => $this->getPriorities()
        ]);
    }
    
    /**
     * Update tender
     */
    public function update($id) {
        $this->requireAuth();
        $this->verifyCsrfToken();
        
        $tender = $this->tenderModel->findOrFail($id);
        
        if (!$this->canEditTender($tender)) {
            flash('error', 'You do not have permission to edit this tender.');
            redirect("/tenders/{$id}");
        }
        
        $data = $this->validate($this->input(), [
            'title' => 'required|max:255',
            'description' => 'required',
            'category_id' => 'required|numeric',
            'organization' => 'required|max:255',
            'contact_email' => 'email',
            'estimated_value' => 'numeric',
            'submission_deadline' => 'required|date',
            'opening_date' => 'date',
            'eligibility_criteria' => 'required',
            'technical_specifications' => 'required'
        ]);
        
        // Handle status change
        $oldStatus = $tender['status'];
        $newStatus = $this->input('status', $tender['status']);
        
        if ($newStatus !== $oldStatus && !$this->canChangeStatus($tender, $newStatus)) {
            flash('error', 'You cannot change the tender status to ' . $newStatus);
            $this->back();
        }
        
        $data['status'] = $newStatus;
        if ($newStatus === 'published' && $oldStatus !== 'published') {
            $data['published_at'] = date('Y-m-d H:i:s');
        }
        
        try {
            $this->tenderModel->beginTransaction();
            
            // Update tender
            $updatedTender = $this->tenderModel->update($id, $data);
            
            // Handle document uploads
            if (isset($_FILES['documents'])) {
                $this->handleDocumentUploads($id, $_FILES['documents']);
            }
            
            // Handle document deletions
            if ($this->input('delete_documents')) {
                $this->handleDocumentDeletions($id, $this->input('delete_documents'));
            }
            
            $this->tenderModel->commit();
            
            // Log activity
            $this->logActivity('update_tender', "Updated tender: {$updatedTender['title']}", $id, 'tender');
            
            // Send notifications for status changes
            if ($newStatus !== $oldStatus) {
                $this->sendStatusChangeNotifications($updatedTender, $oldStatus, $newStatus);
            }
            
            flash('success', 'Tender updated successfully.');
            redirect("/tenders/{$id}");
            
        } catch (\Exception $e) {
            $this->tenderModel->rollback();
            logMessage('error', 'Failed to update tender: ' . $e->getMessage());
            flash('error', 'Failed to update tender. Please try again.');
            $this->back();
        }
    }
    
    /**
     * Delete tender
     */
    public function destroy($id) {
        $this->requireAuth();
        $this->verifyCsrfToken();
        
        $tender = $this->tenderModel->findOrFail($id);
        
        if (!$this->canDeleteTender($tender)) {
            flash('error', 'You do not have permission to delete this tender.');
            redirect("/tenders/{$id}");
        }
        
        try {
            $this->tenderModel->beginTransaction();
            
            // Delete associated documents
            $this->documentModel->deleteTenderDocuments($id);
            
            // Delete tender
            $this->tenderModel->delete($id);
            
            $this->tenderModel->commit();
            
            // Log activity
            $this->logActivity('delete_tender', "Deleted tender: {$tender['title']}", $id, 'tender');
            
            flash('success', 'Tender deleted successfully.');
            redirect('/tenders');
            
        } catch (\Exception $e) {
            $this->tenderModel->rollback();
            logMessage('error', 'Failed to delete tender: ' . $e->getMessage());
            flash('error', 'Failed to delete tender. Please try again.');
            redirect("/tenders/{$id}");
        }
    }
    
    /**
     * Export tenders to various formats
     */
    public function export() {
        $this->requirePermission('export_tenders');
        
        $format = $this->input('format', 'csv');
        $filters = [
            'status' => $this->input('status'),
            'category' => $this->input('category'),
            'date_from' => $this->input('date_from'),
            'date_to' => $this->input('date_to')
        ];
        
        $tenders = $this->tenderModel->getFilteredTenders($filters, false); // No pagination
        
        switch ($format) {
            case 'pdf':
                $this->exportToPdf($tenders);
                break;
            case 'excel':
                $this->exportToExcel($tenders);
                break;
            default:
                $this->exportToCsv($tenders);
        }
    }
    
    // Private helper methods
    
    private function getTenderStats() {
        return [
            'total' => $this->tenderModel->count(),
            'published' => $this->tenderModel->count('status', 'published'),
            'draft' => $this->tenderModel->count('status', 'draft'),
            'closed' => $this->tenderModel->count('status', 'closed'),
            'this_month' => $this->tenderModel->getCountByDateRange(date('Y-m-01'), date('Y-m-t'))
        ];
    }
    
    private function getTenderStatuses() {
        return [
            'draft' => 'Draft',
            'published' => 'Published',
            'closed' => 'Closed',
            'cancelled' => 'Cancelled',
            'awarded' => 'Awarded'
        ];
    }
    
    private function getCurrencies() {
        return [
            'USD' => 'US Dollar',
            'EUR' => 'Euro',
            'INR' => 'Indian Rupee',
            'GBP' => 'British Pound'
        ];
    }
    
    private function getPriorities() {
        return [
            'low' => 'Low',
            'normal' => 'Normal',
            'high' => 'High',
            'urgent' => 'Urgent'
        ];
    }
    
    private function generateTenderNumber() {
        $prefix = 'TND';
        $year = date('Y');
        $month = date('m');
        
        // Get last tender number for this month
        $lastNumber = $this->tenderModel->getLastTenderNumber($year, $month);
        $sequence = $lastNumber ? intval(substr($lastNumber, -4)) + 1 : 1;
        
        return $prefix . $year . $month . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
    
    private function canViewTender($tender) {
        // Admin and tender managers can view all tenders
        if (hasRole('admin') || hasRole('tender_manager')) {
            return true;
        }
        
        // Users can view public tenders
        if ($tender['visibility'] === 'public') {
            return true;
        }
        
        // Users can view their own tenders
        if ($tender['created_by'] == $this->user['id']) {
            return true;
        }
        
        return false;
    }
    
    private function canEditTender($tender) {
        // Admin can edit all tenders
        if (hasRole('admin')) {
            return true;
        }
        
        // Tender managers can edit tenders in their department
        if (hasRole('tender_manager') && can('edit_tender')) {
            return true;
        }
        
        // Users can edit their own draft tenders
        if ($tender['created_by'] == $this->user['id'] && $tender['status'] === 'draft') {
            return true;
        }
        
        return false;
    }
    
    private function canDeleteTender($tender) {
        // Only admin can delete tenders
        if (hasRole('admin')) {
            return true;
        }
        
        // Users can delete their own draft tenders
        if ($tender['created_by'] == $this->user['id'] && $tender['status'] === 'draft') {
            return true;
        }
        
        return false;
    }
    
    private function canBidOnTender($tender) {
        // Check if tender is open for bidding
        if ($tender['status'] !== 'published') {
            return false;
        }
        
        // Check if deadline has passed
        if (strtotime($tender['submission_deadline']) < time()) {
            return false;
        }
        
        // Check if user has already bid
        $existingBid = $this->bidModel->where('tender_id', $tender['id'])
                                      ->where('bidder_id', $this->user['id']);
        if ($existingBid) {
            return false;
        }
        
        return true;
    }
    
    private function canChangeStatus($tender, $newStatus) {
        $currentStatus = $tender['status'];
        
        // Admin can change any status
        if (hasRole('admin')) {
            return true;
        }
        
        // Tender managers can publish drafts and close published tenders
        if (hasRole('tender_manager')) {
            if ($currentStatus === 'draft' && $newStatus === 'published') {
                return true;
            }
            if ($currentStatus === 'published' && $newStatus === 'closed') {
                return true;
            }
        }
        
        return false;
    }
    
    private function handleDocumentUploads($tenderId, $files) {
        foreach ($files['name'] as $key => $name) {
            if ($files['error'][$key] === UPLOAD_ERR_OK) {
                $fileData = [
                    'name' => $files['name'][$key],
                    'type' => $files['type'][$key],
                    'tmp_name' => $files['tmp_name'][$key],
                    'error' => $files['error'][$key],
                    'size' => $files['size'][$key]
                ];
                
                $uploadResult = $this->handleFileUpload('document', null, null);
                if ($uploadResult) {
                    $this->documentModel->create([
                        'tender_id' => $tenderId,
                        'file_id' => $uploadResult['file_id'],
                        'document_type' => 'specification',
                        'title' => $uploadResult['original_name']
                    ]);
                }
            }
        }
    }
    
    private function handleDocumentDeletions($tenderId, $documentIds) {
        foreach ($documentIds as $documentId) {
            $this->documentModel->deleteTenderDocument($tenderId, $documentId);
        }
    }
    
    private function sendTenderPublishedNotifications($tender) {
        // Send notifications to relevant users
        $users = $this->getNotificationUsers($tender);
        
        foreach ($users as $user) {
            $this->sendNotification(
                $user['id'],
                'New Tender Published',
                "A new tender '{$tender['title']}' has been published.",
                'info',
                'tender',
                $tender['id']
            );
        }
    }
    
    private function sendStatusChangeNotifications($tender, $oldStatus, $newStatus) {
        // Implementation for status change notifications
    }
    
    private function getNotificationUsers($tender) {
        // Get users who should be notified about new tenders
        $userModel = new User();
        return $userModel->whereAll('role', 'bidder');
    }
    
    private function exportToCsv($tenders) {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="tenders_' . date('Y-m-d') . '.csv"');
        
        $output = fopen('php://output', 'w');
        
        // CSV headers
        fputcsv($output, [
            'Tender Number', 'Title', 'Organization', 'Category', 'Status',
            'Estimated Value', 'Submission Deadline', 'Created At'
        ]);
        
        // CSV data
        foreach ($tenders['data'] as $tender) {
            fputcsv($output, [
                $tender['tender_number'],
                $tender['title'],
                $tender['organization'],
                $tender['category_name'] ?? '',
                $tender['status'],
                $tender['estimated_value'],
                $tender['submission_deadline'],
                $tender['created_at']
            ]);
        }
        
        fclose($output);
        exit;
    }
    
    private function exportToPdf($tenders) {
        // PDF export implementation would go here
        // Using a library like TCPDF or similar
    }
    
    private function exportToExcel($tenders) {
        // Excel export implementation would go here
        // Using a library like PhpSpreadsheet
    }
}