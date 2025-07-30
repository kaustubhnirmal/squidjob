<?php
/**
 * Bid API Controller
 * TenderManager Module - SquidJob Tender Management System
 * 
 * RESTful API controller for bid operations
 */

// Prevent direct access
if (!defined('APP_ROOT')) {
    exit('Direct access denied');
}

class BidApiController {
    
    private $bidModel;
    private $tenderModel;
    
    public function __construct() {
        // Initialize models (assuming they exist)
        $this->tenderModel = new App\Models\Tender();
        // $this->bidModel = new App\Models\Bid(); // Would need to be created
    }
    
    /**
     * Get all bids for a tender
     * GET /api/v1/tenders/{tender_id}/bids
     */
    public function index($tenderId) {
        try {
            // Check permissions
            if (!can('view_bids')) {
                return $this->errorResponse('Insufficient permissions', 403);
            }
            
            // Validate tender ID
            if (!is_numeric($tenderId)) {
                return $this->errorResponse('Invalid tender ID', 400);
            }
            
            // Check if tender exists
            $tender = $this->tenderModel->find($tenderId);
            if (!$tender) {
                return $this->errorResponse('Tender not found', 404);
            }
            
            // Get request parameters
            $page = (int) request('page', 1);
            $perPage = min((int) request('per_page', 20), 100);
            $status = request('status');
            $sortBy = request('sort_by', 'created_at');
            $sortOrder = request('sort_order', 'desc');
            
            // Get bids for tender
            $bids = $this->getBidsForTender($tenderId, $page, $perPage, $status, $sortBy, $sortOrder);
            
            // Transform data
            $bids['data'] = array_map([$this, 'transformBid'], $bids['data']);
            
            return $this->successResponse($bids);
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to retrieve bids: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Submit new bid for tender
     * POST /api/v1/tenders/{tender_id}/bids
     */
    public function store($tenderId) {
        try {
            // Check permissions
            if (!can('submit_bid')) {
                return $this->errorResponse('Insufficient permissions', 403);
            }
            
            // Validate CSRF token
            if (!verifyCsrf(request('_token'))) {
                return $this->errorResponse('Invalid CSRF token', 403);
            }
            
            // Validate tender ID
            if (!is_numeric($tenderId)) {
                return $this->errorResponse('Invalid tender ID', 400);
            }
            
            // Check if tender exists and is open for bidding
            $tender = $this->tenderModel->find($tenderId);
            if (!$tender) {
                return $this->errorResponse('Tender not found', 404);
            }
            
            if ($tender['status'] !== 'live') {
                return $this->errorResponse('Tender is not open for bidding', 400);
            }
            
            if (strtotime($tender['deadline']) <= time()) {
                return $this->errorResponse('Tender deadline has passed', 400);
            }
            
            // Check if user already submitted a bid
            if ($this->hasUserSubmittedBid($tenderId, user()['id'])) {
                return $this->errorResponse('You have already submitted a bid for this tender', 400);
            }
            
            // Get and validate input
            $input = $this->getValidatedBidInput();
            if (isset($input['errors'])) {
                return $this->errorResponse('Validation failed', 422, $input['errors']);
            }
            
            // Add audit fields
            $input['tender_id'] = $tenderId;
            $input['user_id'] = user()['id'];
            $input['status'] = 'submitted';
            $input['submitted_at'] = date('Y-m-d H:i:s');
            
            // Create bid
            $bid = $this->createBid($input);
            if (!$bid) {
                return $this->errorResponse('Failed to submit bid', 500);
            }
            
            // Execute hook
            $bid = do_hook('bid_submitted', $bid);
            
            return $this->successResponse($this->transformBid($bid), 'Bid submitted successfully', 201);
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to submit bid: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Get specific bid
     * GET /api/v1/bids/{id}
     */
    public function show($id) {
        try {
            // Check permissions
            if (!can('view_bids')) {
                return $this->errorResponse('Insufficient permissions', 403);
            }
            
            // Validate ID
            if (!is_numeric($id)) {
                return $this->errorResponse('Invalid bid ID', 400);
            }
            
            // Get bid
            $bid = $this->getBid($id);
            if (!$bid) {
                return $this->errorResponse('Bid not found', 404);
            }
            
            // Check if user can view this bid
            if (!$this->canUserViewBid($bid, user()['id'])) {
                return $this->errorResponse('Access denied', 403);
            }
            
            return $this->successResponse($this->transformBid($bid));
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to retrieve bid: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Update bid (if allowed)
     * PUT /api/v1/bids/{id}
     */
    public function update($id) {
        try {
            // Check permissions
            if (!can('edit_bid')) {
                return $this->errorResponse('Insufficient permissions', 403);
            }
            
            // Validate CSRF token
            if (!verifyCsrf(request('_token'))) {
                return $this->errorResponse('Invalid CSRF token', 403);
            }
            
            // Validate ID
            if (!is_numeric($id)) {
                return $this->errorResponse('Invalid bid ID', 400);
            }
            
            // Get existing bid
            $existingBid = $this->getBid($id);
            if (!$existingBid) {
                return $this->errorResponse('Bid not found', 404);
            }
            
            // Check if user can edit this bid
            if (!$this->canUserEditBid($existingBid, user()['id'])) {
                return $this->errorResponse('Access denied', 403);
            }
            
            // Check if bid can be edited
            if (!$this->canBidBeEdited($existingBid)) {
                return $this->errorResponse('Bid cannot be edited at this time', 400);
            }
            
            // Get and validate input
            $input = $this->getValidatedBidInput(true);
            if (isset($input['errors'])) {
                return $this->errorResponse('Validation failed', 422, $input['errors']);
            }
            
            // Add audit fields
            $input['updated_by'] = user()['id'];
            $input['updated_at'] = date('Y-m-d H:i:s');
            
            // Update bid
            $bid = $this->updateBid($id, $input);
            if (!$bid) {
                return $this->errorResponse('Failed to update bid', 500);
            }
            
            return $this->successResponse($this->transformBid($bid), 'Bid updated successfully');
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to update bid: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Withdraw bid
     * DELETE /api/v1/bids/{id}
     */
    public function destroy($id) {
        try {
            // Check permissions
            if (!can('withdraw_bid')) {
                return $this->errorResponse('Insufficient permissions', 403);
            }
            
            // Validate CSRF token
            if (!verifyCsrf(request('_token'))) {
                return $this->errorResponse('Invalid CSRF token', 403);
            }
            
            // Validate ID
            if (!is_numeric($id)) {
                return $this->errorResponse('Invalid bid ID', 400);
            }
            
            // Get bid
            $bid = $this->getBid($id);
            if (!$bid) {
                return $this->errorResponse('Bid not found', 404);
            }
            
            // Check if user can withdraw this bid
            if (!$this->canUserWithdrawBid($bid, user()['id'])) {
                return $this->errorResponse('Access denied', 403);
            }
            
            // Check if bid can be withdrawn
            if (!$this->canBidBeWithdrawn($bid)) {
                return $this->errorResponse('Bid cannot be withdrawn at this time', 400);
            }
            
            // Withdraw bid (soft delete or status change)
            $result = $this->withdrawBid($id);
            if (!$result) {
                return $this->errorResponse('Failed to withdraw bid', 500);
            }
            
            return $this->successResponse(null, 'Bid withdrawn successfully');
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to withdraw bid: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Get validated bid input data
     */
    private function getValidatedBidInput($isUpdate = false) {
        $rules = [
            'bid_amount' => 'required|numeric|min:0',
            'technical_proposal' => 'required',
            'financial_proposal' => 'required',
            'delivery_timeline' => 'required',
            'validity_period' => 'required|numeric|min:1',
            'comments' => '',
            'attachments' => ''
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
        if (isset($data['attachments']) && is_string($data['attachments'])) {
            $data['attachments'] = json_decode($data['attachments'], true);
        }
        
        return $data;
    }
    
    /**
     * Get bids for tender with pagination
     */
    private function getBidsForTender($tenderId, $page, $perPage, $status, $sortBy, $sortOrder) {
        try {
            $pdo = getDbConnection();
            
            // Build WHERE clause
            $whereClause = "WHERE tender_id = ?";
            $params = [$tenderId];
            
            if ($status) {
                $whereClause .= " AND status = ?";
                $params[] = $status;
            }
            
            // Get total count
            $countSql = "SELECT COUNT(*) FROM bids {$whereClause}";
            $stmt = $pdo->prepare($countSql);
            $stmt->execute($params);
            $total = $stmt->fetchColumn();
            
            // Get paginated data
            $offset = ($page - 1) * $perPage;
            $dataSql = "
                SELECT b.*, u.first_name, u.last_name, u.email, c.name as company_name
                FROM bids b
                LEFT JOIN users u ON b.user_id = u.id
                LEFT JOIN companies c ON b.company_id = c.id
                {$whereClause}
                ORDER BY {$sortBy} {$sortOrder}
                LIMIT {$perPage} OFFSET {$offset}
            ";
            
            $stmt = $pdo->prepare($dataSql);
            $stmt->execute($params);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'data' => $data,
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage),
                'from' => $offset + 1,
                'to' => min($offset + $perPage, $total)
            ];
            
        } catch (Exception $e) {
            throw new Exception('Database error: ' . $e->getMessage());
        }
    }
    
    /**
     * Check if user has already submitted a bid
     */
    private function hasUserSubmittedBid($tenderId, $userId) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM bids WHERE tender_id = ? AND user_id = ? AND status != 'withdrawn'");
            $stmt->execute([$tenderId, $userId]);
            return $stmt->fetchColumn() > 0;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Create bid record
     */
    private function createBid($data) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO bids (tender_id, user_id, bid_amount, technical_proposal, financial_proposal, 
                                 delivery_timeline, validity_period, comments, attachments, status, submitted_at, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $result = $stmt->execute([
                $data['tender_id'],
                $data['user_id'],
                $data['bid_amount'],
                $data['technical_proposal'],
                $data['financial_proposal'],
                $data['delivery_timeline'],
                $data['validity_period'],
                $data['comments'] ?? null,
                json_encode($data['attachments'] ?? []),
                $data['status'],
                $data['submitted_at']
            ]);
            
            if ($result) {
                return $this->getBid($pdo->lastInsertId());
            }
            
            return null;
        } catch (Exception $e) {
            throw new Exception('Failed to create bid: ' . $e->getMessage());
        }
    }
    
    /**
     * Get bid by ID
     */
    private function getBid($id) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                SELECT b.*, u.first_name, u.last_name, u.email, c.name as company_name
                FROM bids b
                LEFT JOIN users u ON b.user_id = u.id
                LEFT JOIN companies c ON b.company_id = c.id
                WHERE b.id = ?
            ");
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return null;
        }
    }
    
    /**
     * Transform bid data for API response
     */
    private function transformBid($bid) {
        return [
            'id' => (int) $bid['id'],
            'tender_id' => (int) $bid['tender_id'],
            'user_id' => (int) $bid['user_id'],
            'bidder_name' => $bid['first_name'] . ' ' . $bid['last_name'],
            'bidder_email' => $bid['email'],
            'company_name' => $bid['company_name'],
            'bid_amount' => (float) $bid['bid_amount'],
            'technical_proposal' => $bid['technical_proposal'],
            'financial_proposal' => $bid['financial_proposal'],
            'delivery_timeline' => $bid['delivery_timeline'],
            'validity_period' => (int) $bid['validity_period'],
            'comments' => $bid['comments'],
            'attachments' => $bid['attachments'] ? json_decode($bid['attachments'], true) : [],
            'status' => $bid['status'],
            'submitted_at' => $bid['submitted_at'],
            'created_at' => $bid['created_at'],
            'updated_at' => $bid['updated_at'] ?? null
        ];
    }
    
    /**
     * Check if user can view bid
     */
    private function canUserViewBid($bid, $userId) {
        // User can view their own bid or if they have view_all_bids permission
        return $bid['user_id'] == $userId || can('view_all_bids');
    }
    
    /**
     * Check if user can edit bid
     */
    private function canUserEditBid($bid, $userId) {
        // User can edit their own bid if it's in draft status
        return $bid['user_id'] == $userId && $bid['status'] === 'draft';
    }
    
    /**
     * Check if user can withdraw bid
     */
    private function canUserWithdrawBid($bid, $userId) {
        // User can withdraw their own bid if it's not already evaluated
        return $bid['user_id'] == $userId && !in_array($bid['status'], ['evaluated', 'awarded', 'rejected']);
    }
    
    /**
     * Check if bid can be edited
     */
    private function canBidBeEdited($bid) {
        return $bid['status'] === 'draft';
    }
    
    /**
     * Check if bid can be withdrawn
     */
    private function canBidBeWithdrawn($bid) {
        return !in_array($bid['status'], ['evaluated', 'awarded', 'rejected', 'withdrawn']);
    }
    
    /**
     * Update bid
     */
    private function updateBid($id, $data) {
        // Implementation would update the bid record
        return $this->getBid($id);
    }
    
    /**
     * Withdraw bid
     */
    private function withdrawBid($id) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("UPDATE bids SET status = 'withdrawn', withdrawn_at = NOW() WHERE id = ?");
            return $stmt->execute([$id]);
        } catch (Exception $e) {
            return false;
        }
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