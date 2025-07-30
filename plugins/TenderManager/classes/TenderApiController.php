<?php
/**
 * Tender API Controller
 * TenderManager Module - SquidJob Tender Management System
 * 
 * RESTful API controller for tender operations
 */

// Prevent direct access
if (!defined('APP_ROOT')) {
    exit('Direct access denied');
}

class TenderApiController {
    
    private $tenderModel;
    
    public function __construct() {
        $this->tenderModel = new App\Models\Tender();
    }
    
    /**
     * Get all tenders with filtering and pagination
     * GET /api/v1/tenders
     */
    public function index() {
        try {
            // Check permissions
            if (!can('view_tenders')) {
                return $this->errorResponse('Insufficient permissions', 403);
            }
            
            // Get request parameters
            $page = (int) request('page', 1);
            $perPage = min((int) request('per_page', 20), 100);
            $status = request('status');
            $search = request('search');
            $sortBy = request('sort_by', 'created_at');
            $sortOrder = request('sort_order', 'desc');
            
            // Build query
            $query = $this->buildTenderQuery($status, $search, $sortBy, $sortOrder);
            
            // Get paginated results
            $result = $this->tenderModel->paginate($page, $perPage, $sortBy, $sortOrder);
            
            // Apply filters if needed
            if ($status || $search) {
                $result = $this->applyFilters($result, $status, $search);
            }
            
            // Transform data
            $result['data'] = array_map([$this, 'transformTender'], $result['data']);
            
            return $this->successResponse($result);
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to retrieve tenders: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Get specific tender by ID
     * GET /api/v1/tenders/{id}
     */
    public function show($id) {
        try {
            // Check permissions
            if (!can('view_tenders')) {
                return $this->errorResponse('Insufficient permissions', 403);
            }
            
            // Validate ID
            if (!is_numeric($id)) {
                return $this->errorResponse('Invalid tender ID', 400);
            }
            
            // Get tender
            $tender = $this->tenderModel->find($id);
            if (!$tender) {
                return $this->errorResponse('Tender not found', 404);
            }
            
            // Get additional data
            $tender = $this->enrichTenderData($tender);
            
            return $this->successResponse($this->transformTender($tender));
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to retrieve tender: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Create new tender
     * POST /api/v1/tenders
     */
    public function store() {
        try {
            // Check permissions
            if (!can('create_tender')) {
                return $this->errorResponse('Insufficient permissions', 403);
            }
            
            // Validate CSRF token
            if (!verifyCsrf(request('_token'))) {
                return $this->errorResponse('Invalid CSRF token', 403);
            }
            
            // Get and validate input
            $input = $this->getValidatedInput();
            if (isset($input['errors'])) {
                return $this->errorResponse('Validation failed', 422, $input['errors']);
            }
            
            // Add audit fields
            $input['created_by'] = user()['id'];
            $input['status'] = 'draft';
            
            // Create tender
            $tender = $this->tenderModel->create($input);
            if (!$tender) {
                return $this->errorResponse('Failed to create tender', 500);
            }
            
            // Execute hook
            $tender = do_hook('tender_created', $tender);
            
            return $this->successResponse($this->transformTender($tender), 'Tender created successfully', 201);
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to create tender: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Update existing tender
     * PUT /api/v1/tenders/{id}
     */
    public function update($id) {
        try {
            // Check permissions
            if (!can('edit_tender')) {
                return $this->errorResponse('Insufficient permissions', 403);
            }
            
            // Validate CSRF token
            if (!verifyCsrf(request('_token'))) {
                return $this->errorResponse('Invalid CSRF token', 403);
            }
            
            // Validate ID
            if (!is_numeric($id)) {
                return $this->errorResponse('Invalid tender ID', 400);
            }
            
            // Check if tender exists
            $existingTender = $this->tenderModel->find($id);
            if (!$existingTender) {
                return $this->errorResponse('Tender not found', 404);
            }
            
            // Get and validate input
            $input = $this->getValidatedInput(true);
            if (isset($input['errors'])) {
                return $this->errorResponse('Validation failed', 422, $input['errors']);
            }
            
            // Add audit fields
            $input['updated_by'] = user()['id'];
            
            // Update tender
            $tender = $this->tenderModel->update($id, $input);
            if (!$tender) {
                return $this->errorResponse('Failed to update tender', 500);
            }
            
            // Execute hook
            $tender = do_hook('tender_updated', $tender);
            
            return $this->successResponse($this->transformTender($tender), 'Tender updated successfully');
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to update tender: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Delete tender
     * DELETE /api/v1/tenders/{id}
     */
    public function destroy($id) {
        try {
            // Check permissions
            if (!can('delete_tender')) {
                return $this->errorResponse('Insufficient permissions', 403);
            }
            
            // Validate CSRF token
            if (!verifyCsrf(request('_token'))) {
                return $this->errorResponse('Invalid CSRF token', 403);
            }
            
            // Validate ID
            if (!is_numeric($id)) {
                return $this->errorResponse('Invalid tender ID', 400);
            }
            
            // Check if tender exists
            $tender = $this->tenderModel->find($id);
            if (!$tender) {
                return $this->errorResponse('Tender not found', 404);
            }
            
            // Check if tender can be deleted
            if (in_array($tender['status'], ['live', 'in_process', 'awarded'])) {
                return $this->errorResponse('Cannot delete tender in current status', 400);
            }
            
            // Delete tender (soft delete)
            $result = $this->tenderModel->delete($id);
            if (!$result) {
                return $this->errorResponse('Failed to delete tender', 500);
            }
            
            return $this->successResponse(null, 'Tender deleted successfully');
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to delete tender: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Publish tender
     * POST /api/v1/tenders/{id}/publish
     */
    public function publish($id) {
        try {
            // Check permissions
            if (!can('publish_tender')) {
                return $this->errorResponse('Insufficient permissions', 403);
            }
            
            // Validate CSRF token
            if (!verifyCsrf(request('_token'))) {
                return $this->errorResponse('Invalid CSRF token', 403);
            }
            
            // Validate ID
            if (!is_numeric($id)) {
                return $this->errorResponse('Invalid tender ID', 400);
            }
            
            // Get tender
            $tender = $this->tenderModel->find($id);
            if (!$tender) {
                return $this->errorResponse('Tender not found', 404);
            }
            
            // Check if tender can be published
            if ($tender['status'] !== 'draft') {
                return $this->errorResponse('Tender cannot be published in current status', 400);
            }
            
            // Validate tender data for publication
            $validationErrors = $this->validateForPublication($tender);
            if (!empty($validationErrors)) {
                return $this->errorResponse('Tender validation failed', 422, $validationErrors);
            }
            
            // Update status to live
            $publishData = [
                'status' => 'live',
                'published_date' => date('Y-m-d'),
                'updated_by' => user()['id']
            ];
            
            $tender = $this->tenderModel->update($id, $publishData);
            if (!$tender) {
                return $this->errorResponse('Failed to publish tender', 500);
            }
            
            // Execute hook
            $tender = do_hook('tender_published', $tender);
            
            return $this->successResponse($this->transformTender($tender), 'Tender published successfully');
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to publish tender: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Get validated input data
     */
    private function getValidatedInput($isUpdate = false) {
        $rules = [
            'title' => 'required|max:255',
            'description' => 'required',
            'authority' => 'required|max:255',
            'location' => 'max:255',
            'deadline' => 'required|date',
            'emd_amount' => 'numeric|min:0',
            'document_fee' => 'numeric|min:0',
            'estimated_value' => 'numeric|min:0',
            'eligibility_criteria' => '',
            'item_categories' => '',
            'required_documents' => ''
        ];
        
        // Make fields optional for updates
        if ($isUpdate) {
            foreach ($rules as $field => $rule) {
                $rules[$field] = str_replace('required|', '', $rule);
                $rules[$field] = str_replace('required', '', $rules[$field]);
                $rules[$field] = ltrim($rules[$field], '|');
            }
        }
        
        $data = request();
        $errors = validate($data, $rules);
        
        if (!empty($errors)) {
            return ['errors' => $errors];
        }
        
        // Process JSON fields
        if (isset($data['item_categories']) && is_string($data['item_categories'])) {
            $data['item_categories'] = json_decode($data['item_categories'], true);
        }
        
        if (isset($data['required_documents']) && is_string($data['required_documents'])) {
            $data['required_documents'] = json_decode($data['required_documents'], true);
        }
        
        return $data;
    }
    
    /**
     * Validate tender for publication
     */
    private function validateForPublication($tender) {
        $errors = [];
        
        if (empty($tender['title'])) {
            $errors['title'] = 'Title is required for publication';
        }
        
        if (empty($tender['description'])) {
            $errors['description'] = 'Description is required for publication';
        }
        
        if (empty($tender['authority'])) {
            $errors['authority'] = 'Authority is required for publication';
        }
        
        if (empty($tender['deadline']) || strtotime($tender['deadline']) <= time()) {
            $errors['deadline'] = 'Valid future deadline is required for publication';
        }
        
        return $errors;
    }
    
    /**
     * Build tender query with filters
     */
    private function buildTenderQuery($status, $search, $sortBy, $sortOrder) {
        // This would be implemented based on your specific query builder
        // For now, returning a placeholder
        return [];
    }
    
    /**
     * Apply filters to results
     */
    private function applyFilters($result, $status, $search) {
        // Filter implementation would go here
        return $result;
    }
    
    /**
     * Enrich tender data with additional information
     */
    private function enrichTenderData($tender) {
        try {
            $pdo = getDbConnection();
            
            // Get bid count
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM bids WHERE tender_id = ?");
            $stmt->execute([$tender['id']]);
            $tender['bid_count'] = $stmt->fetchColumn();
            
            // Get document count
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM tender_documents WHERE tender_id = ?");
            $stmt->execute([$tender['id']]);
            $tender['document_count'] = $stmt->fetchColumn();
            
            // Get assignments
            $stmt = $pdo->prepare("
                SELECT ta.*, u.first_name, u.last_name, u.email 
                FROM tender_assignments ta 
                JOIN users u ON ta.user_id = u.id 
                WHERE ta.tender_id = ?
            ");
            $stmt->execute([$tender['id']]);
            $tender['assignments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("Error enriching tender data: " . $e->getMessage());
        }
        
        return $tender;
    }
    
    /**
     * Transform tender data for API response
     */
    private function transformTender($tender) {
        return [
            'id' => (int) $tender['id'],
            'reference_no' => $tender['reference_no'],
            'title' => $tender['title'],
            'description' => $tender['description'],
            'authority' => $tender['authority'],
            'location' => $tender['location'],
            'deadline' => $tender['deadline'],
            'published_date' => $tender['published_date'],
            'emd_amount' => (float) $tender['emd_amount'],
            'document_fee' => (float) $tender['document_fee'],
            'estimated_value' => $tender['estimated_value'] ? (float) $tender['estimated_value'] : null,
            'bid_value' => $tender['bid_value'] ? (float) $tender['bid_value'] : null,
            'status' => $tender['status'],
            'item_categories' => $tender['item_categories'] ? json_decode($tender['item_categories'], true) : null,
            'eligibility_criteria' => $tender['eligibility_criteria'],
            'required_documents' => $tender['required_documents'] ? json_decode($tender['required_documents'], true) : null,
            'bid_count' => $tender['bid_count'] ?? 0,
            'document_count' => $tender['document_count'] ?? 0,
            'assignments' => $tender['assignments'] ?? [],
            'created_at' => $tender['created_at'],
            'updated_at' => $tender['updated_at'],
            'created_by' => (int) $tender['created_by']
        ];
    }
    
    /**
     * Return success response
     */
    private function successResponse($data, $message = 'Success', $statusCode = 200) {
        return jsonResponse([
            'success' => true,
            'data' => $data,
            'message' => $message,
            'meta' => [
                'timestamp' => date('c'),
                'version' => '1.0'
            ]
        ], $statusCode);
    }
    
    /**
     * Return error response
     */
    private function errorResponse($message, $statusCode = 400, $errors = null) {
        $response = [
            'success' => false,
            'message' => $message,
            'meta' => [
                'timestamp' => date('c'),
                'version' => '1.0'
            ]
        ];
        
        if ($errors) {
            $response['errors'] = $errors;
        }
        
        return jsonResponse($response, $statusCode);
    }
}