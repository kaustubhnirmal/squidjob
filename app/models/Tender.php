<?php
/**
 * Tender Model
 * SquidJob Tender Management System
 * 
 * Handles all tender-related database operations
 */

namespace App\Models;

class Tender extends BaseModel {
    
    protected $table = 'tenders';
    protected $primaryKey = 'id';
    protected $timestamps = true;
    protected $softDeletes = false;
    
    protected $fillable = [
        'tender_number', 'title', 'description', 'category_id', 'created_by',
        'organization', 'contact_person', 'contact_email', 'contact_phone',
        'estimated_value', 'currency', 'location', 'submission_deadline',
        'opening_date', 'project_duration', 'eligibility_criteria',
        'technical_specifications', 'terms_conditions', 'evaluation_criteria',
        'status', 'visibility', 'requires_registration', 'allow_consortium',
        'bond_required', 'bond_amount', 'pre_bid_meeting', 'pre_bid_location',
        'site_visit_required', 'site_visit_date', 'priority', 'tags',
        'metadata', 'published_at'
    ];
    
    protected $guarded = [
        'id', 'tender_number', 'view_count', 'download_count', 'amendment_count',
        'featured', 'created_at', 'updated_at'
    ];
    
    /**
     * Get filtered tenders with pagination
     */
    public function getFilteredTenders($filters = [], $paginate = true) {
        try {
            $sql = "SELECT t.*, tc.name as category_name, 
                           u.first_name as created_by_first_name, 
                           u.last_name as created_by_last_name,
                           (SELECT COUNT(*) FROM bids b WHERE b.tender_id = t.id AND b.status = 'submitted') as bid_count,
                           DATEDIFF(t.submission_deadline, NOW()) as days_remaining
                    FROM {$this->table} t
                    LEFT JOIN tender_categories tc ON t.category_id = tc.id
                    LEFT JOIN users u ON t.created_by = u.id
                    WHERE 1=1";
            
            $params = [];
            
            // Apply filters
            if (!empty($filters['status'])) {
                $sql .= " AND t.status = ?";
                $params[] = $filters['status'];
            }
            
            if (!empty($filters['category'])) {
                $sql .= " AND t.category_id = ?";
                $params[] = $filters['category'];
            }
            
            if (!empty($filters['organization'])) {
                $sql .= " AND t.organization LIKE ?";
                $params[] = '%' . $filters['organization'] . '%';
            }
            
            if (!empty($filters['date_from'])) {
                $sql .= " AND t.submission_deadline >= ?";
                $params[] = $filters['date_from'];
            }
            
            if (!empty($filters['date_to'])) {
                $sql .= " AND t.submission_deadline <= ?";
                $params[] = $filters['date_to'];
            }
            
            if (!empty($filters['value_min'])) {
                $sql .= " AND t.estimated_value >= ?";
                $params[] = $filters['value_min'];
            }
            
            if (!empty($filters['value_max'])) {
                $sql .= " AND t.estimated_value <= ?";
                $params[] = $filters['value_max'];
            }
            
            if (!empty($filters['search'])) {
                $sql .= " AND (t.title LIKE ? OR t.description LIKE ? OR t.organization LIKE ?)";
                $searchTerm = '%' . $filters['search'] . '%';
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }
            
            // Apply sorting
            $sortColumn = $filters['sort'] ?? 'created_at';
            $sortOrder = $filters['order'] ?? 'desc';
            $sql .= " ORDER BY t.{$sortColumn} {$sortOrder}";
            
            if ($paginate) {
                $page = max(1, intval($filters['page'] ?? 1));
                $perPage = max(1, min(100, intval($filters['per_page'] ?? 20)));
                $offset = ($page - 1) * $perPage;
                
                // Get total count
                $countSql = str_replace('SELECT t.*, tc.name as category_name, u.first_name as created_by_first_name, u.last_name as created_by_last_name, (SELECT COUNT(*) FROM bids b WHERE b.tender_id = t.id AND b.status = \'submitted\') as bid_count, DATEDIFF(t.submission_deadline, NOW()) as days_remaining', 'SELECT COUNT(*)', $sql);
                $countSql = preg_replace('/ORDER BY.*$/', '', $countSql);
                
                $countStmt = $this->connection->prepare($countSql);
                $countStmt->execute($params);
                $total = $countStmt->fetchColumn();
                
                // Add pagination
                $sql .= " LIMIT {$perPage} OFFSET {$offset}";
                
                $stmt = $this->connection->prepare($sql);
                $stmt->execute($params);
                $data = $stmt->fetchAll(\PDO::FETCH_ASSOC);
                
                return [
                    'data' => $data,
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => ceil($total / $perPage),
                    'from' => $offset + 1,
                    'to' => min($offset + $perPage, $total)
                ];
            } else {
                $stmt = $this->connection->prepare($sql);
                $stmt->execute($params);
                return $stmt->fetchAll(\PDO::FETCH_ASSOC);
            }
            
        } catch (\PDOException $e) {
            $this->handleError($e);
            return $paginate ? [
                'data' => [],
                'current_page' => 1,
                'per_page' => 20,
                'total' => 0,
                'last_page' => 1,
                'from' => 0,
                'to' => 0
            ] : [];
        }
    }
    
    /**
     * Get tender with full details including category and creator info
     */
    public function getTenderDetails($id) {
        try {
            $sql = "SELECT t.*, tc.name as category_name, tc.description as category_description,
                           u.first_name as created_by_first_name, u.last_name as created_by_last_name,
                           u.email as created_by_email,
                           (SELECT COUNT(*) FROM bids b WHERE b.tender_id = t.id AND b.status = 'submitted') as bid_count,
                           (SELECT COUNT(*) FROM tender_documents td WHERE td.tender_id = t.id) as document_count,
                           DATEDIFF(t.submission_deadline, NOW()) as days_remaining
                    FROM {$this->table} t
                    LEFT JOIN tender_categories tc ON t.category_id = tc.id
                    LEFT JOIN users u ON t.created_by = u.id
                    WHERE t.id = ?";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$id]);
            
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return null;
        }
    }
    
    /**
     * Get related tenders based on category
     */
    public function getRelatedTenders($categoryId, $excludeId, $limit = 5) {
        try {
            $sql = "SELECT t.*, tc.name as category_name,
                           (SELECT COUNT(*) FROM bids b WHERE b.tender_id = t.id AND b.status = 'submitted') as bid_count,
                           DATEDIFF(t.submission_deadline, NOW()) as days_remaining
                    FROM {$this->table} t
                    LEFT JOIN tender_categories tc ON t.category_id = tc.id
                    WHERE t.category_id = ? AND t.id != ? AND t.status = 'published'
                    ORDER BY t.created_at DESC
                    LIMIT ?";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$categoryId, $excludeId, $limit]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Search tenders by query
     */
    public function searchTenders($query, $limit = 10) {
        try {
            $sql = "SELECT t.id, t.tender_number, t.title, t.organization, t.status,
                           tc.name as category_name,
                           DATEDIFF(t.submission_deadline, NOW()) as days_remaining
                    FROM {$this->table} t
                    LEFT JOIN tender_categories tc ON t.category_id = tc.id
                    WHERE (t.title LIKE ? OR t.description LIKE ? OR t.organization LIKE ? OR t.tender_number LIKE ?)
                    AND t.status IN ('published', 'closed')
                    ORDER BY t.created_at DESC
                    LIMIT ?";
            
            $searchTerm = '%' . $query . '%';
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$searchTerm, $searchTerm, $searchTerm, $searchTerm, $limit]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get tender amendments
     */
    public function getTenderAmendments($tenderId) {
        try {
            $sql = "SELECT ta.*, u.first_name as created_by_first_name, u.last_name as created_by_last_name
                    FROM tender_amendments ta
                    LEFT JOIN users u ON ta.created_by = u.id
                    WHERE ta.tender_id = ?
                    ORDER BY ta.amendment_number ASC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$tenderId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Increment view count
     */
    public function incrementViewCount($id) {
        try {
            $sql = "UPDATE {$this->table} SET view_count = view_count + 1 WHERE id = ?";
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute([$id]);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Increment download count
     */
    public function incrementDownloadCount($id) {
        try {
            $sql = "UPDATE {$this->table} SET download_count = download_count + 1 WHERE id = ?";
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute([$id]);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Get last tender number for sequence generation
     */
    public function getLastTenderNumber($year, $month) {
        try {
            $sql = "SELECT tender_number FROM {$this->table} 
                    WHERE tender_number LIKE ? 
                    ORDER BY tender_number DESC 
                    LIMIT 1";
            
            $pattern = "TND{$year}{$month}%";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$pattern]);
            
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            return $result ? $result['tender_number'] : null;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return null;
        }
    }
    
    /**
     * Get count by date range
     */
    public function getCountByDateRange($startDate, $endDate) {
        try {
            $sql = "SELECT COUNT(*) as count FROM {$this->table} 
                    WHERE created_at BETWEEN ? AND ?";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$startDate, $endDate]);
            
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            return $result ? intval($result['count']) : 0;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return 0;
        }
    }
    
    /**
     * Get active tenders (published and not expired)
     */
    public function getActiveTenders($limit = null) {
        try {
            $sql = "SELECT t.*, tc.name as category_name,
                           (SELECT COUNT(*) FROM bids b WHERE b.tender_id = t.id AND b.status = 'submitted') as bid_count,
                           DATEDIFF(t.submission_deadline, NOW()) as days_remaining
                    FROM {$this->table} t
                    LEFT JOIN tender_categories tc ON t.category_id = tc.id
                    WHERE t.status = 'published' AND t.submission_deadline > NOW()
                    ORDER BY t.submission_deadline ASC";
            
            if ($limit) {
                $sql .= " LIMIT " . intval($limit);
            }
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get expired tenders that need to be closed
     */
    public function getExpiredTenders() {
        try {
            $sql = "SELECT * FROM {$this->table} 
                    WHERE status = 'published' AND submission_deadline < NOW()";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Close expired tenders
     */
    public function closeExpiredTenders() {
        try {
            $sql = "UPDATE {$this->table} 
                    SET status = 'closed' 
                    WHERE status = 'published' AND submission_deadline < NOW()";
            
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute();
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Get tender statistics by status
     */
    public function getStatusStatistics() {
        try {
            $sql = "SELECT status, COUNT(*) as count 
                    FROM {$this->table} 
                    GROUP BY status";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            $stats = [];
            
            foreach ($results as $result) {
                $stats[$result['status']] = intval($result['count']);
            }
            
            return $stats;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get tender statistics by category
     */
    public function getCategoryStatistics() {
        try {
            $sql = "SELECT tc.name as category, COUNT(t.id) as count 
                    FROM {$this->table} t
                    LEFT JOIN tender_categories tc ON t.category_id = tc.id
                    GROUP BY tc.id, tc.name
                    ORDER BY count DESC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get monthly tender statistics
     */
    public function getMonthlyStatistics($year = null) {
        $year = $year ?: date('Y');
        
        try {
            $sql = "SELECT MONTH(created_at) as month, COUNT(*) as count 
                    FROM {$this->table} 
                    WHERE YEAR(created_at) = ?
                    GROUP BY MONTH(created_at)
                    ORDER BY month";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$year]);
            
            $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            $stats = array_fill(1, 12, 0); // Initialize all months with 0
            
            foreach ($results as $result) {
                $stats[intval($result['month'])] = intval($result['count']);
            }
            
            return $stats;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return array_fill(1, 12, 0);
        }
    }
    
    /**
     * Get featured tenders
     */
    public function getFeaturedTenders($limit = 5) {
        try {
            $sql = "SELECT t.*, tc.name as category_name,
                           (SELECT COUNT(*) FROM bids b WHERE b.tender_id = t.id AND b.status = 'submitted') as bid_count,
                           DATEDIFF(t.submission_deadline, NOW()) as days_remaining
                    FROM {$this->table} t
                    LEFT JOIN tender_categories tc ON t.category_id = tc.id
                    WHERE t.featured = 1 AND t.status = 'published' AND t.submission_deadline > NOW()
                    ORDER BY t.created_at DESC
                    LIMIT ?";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$limit]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Set tender as featured
     */
    public function setFeatured($id, $featured = true) {
        try {
            $sql = "UPDATE {$this->table} SET featured = ? WHERE id = ?";
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute([$featured ? 1 : 0, $id]);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Get tenders by user (created by)
     */
    public function getUserTenders($userId, $limit = null) {
        try {
            $sql = "SELECT t.*, tc.name as category_name,
                           (SELECT COUNT(*) FROM bids b WHERE b.tender_id = t.id AND b.status = 'submitted') as bid_count,
                           DATEDIFF(t.submission_deadline, NOW()) as days_remaining
                    FROM {$this->table} t
                    LEFT JOIN tender_categories tc ON t.category_id = tc.id
                    WHERE t.created_by = ?
                    ORDER BY t.created_at DESC";
            
            if ($limit) {
                $sql .= " LIMIT " . intval($limit);
            }
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$userId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get tender value statistics
     */
    public function getValueStatistics() {
        try {
            $sql = "SELECT 
                        COUNT(*) as total_tenders,
                        SUM(estimated_value) as total_value,
                        AVG(estimated_value) as average_value,
                        MIN(estimated_value) as min_value,
                        MAX(estimated_value) as max_value
                    FROM {$this->table} 
                    WHERE estimated_value IS NOT NULL AND estimated_value > 0";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [
                'total_tenders' => 0,
                'total_value' => 0,
                'average_value' => 0,
                'min_value' => 0,
                'max_value' => 0
            ];
        }
    }
    
    /**
     * Update tender status
     */
    public function updateStatus($id, $status) {
        try {
            $data = ['status' => $status];
            
            // Set published_at when publishing
            if ($status === 'published') {
                $data['published_at'] = date('Y-m-d H:i:s');
            }
            
            return $this->update($id, $data);
        } catch (\Exception $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Check if tender is editable
     */
    public function isEditable($tender) {
        // Draft tenders are always editable
        if ($tender['status'] === 'draft') {
            return true;
        }
        
        // Published tenders can be edited if no bids are submitted
        if ($tender['status'] === 'published') {
            $bidCount = $this->getBidCount($tender['id']);
            return $bidCount === 0;
        }
        
        return false;
    }
    
    /**
     * Get bid count for tender
     */
    public function getBidCount($tenderId) {
        try {
            $sql = "SELECT COUNT(*) as count FROM bids WHERE tender_id = ? AND status = 'submitted'";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$tenderId]);
            
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            return $result ? intval($result['count']) : 0;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return 0;
        }
    }
}