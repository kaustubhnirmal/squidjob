<?php
/**
 * Bid Model
 * SquidJob Tender Management System
 * 
 * Handles bid operations and workflow
 */

namespace App\Models;

class Bid extends BaseModel {
    
    protected $table = 'bids';
    protected $primaryKey = 'id';
    protected $timestamps = true;
    protected $softDeletes = false;
    
    protected $fillable = [
        'tender_id', 'bidder_id', 'bid_number', 'company_name', 'contact_person',
        'contact_email', 'contact_phone', 'bid_amount', 'currency', 'technical_score',
        'financial_score', 'total_score', 'rank', 'proposal_summary', 'technical_proposal',
        'financial_proposal', 'delivery_timeline', 'validity_period', 'bond_submitted',
        'bond_amount', 'bond_reference', 'consortium_members', 'status', 'submission_method',
        'submitted_at', 'reviewed_at', 'reviewed_by', 'review_notes', 'withdrawal_reason',
        'metadata'
    ];
    
    protected $guarded = [
        'id', 'bid_number', 'created_at', 'updated_at'
    ];
    
    /**
     * Get bids for a tender
     */
    public function getTenderBids($tenderId, $status = null) {
        try {
            $sql = "SELECT b.*, u.first_name as bidder_first_name, u.last_name as bidder_last_name,
                           u.email as bidder_email, u.company_name as bidder_company,
                           reviewer.first_name as reviewed_by_first_name, 
                           reviewer.last_name as reviewed_by_last_name
                    FROM {$this->table} b
                    LEFT JOIN users u ON b.bidder_id = u.id
                    LEFT JOIN users reviewer ON b.reviewed_by = reviewer.id
                    WHERE b.tender_id = ?";
            
            $params = [$tenderId];
            
            if ($status) {
                $sql .= " AND b.status = ?";
                $params[] = $status;
            }
            
            $sql .= " ORDER BY b.total_score DESC, b.bid_amount ASC, b.submitted_at ASC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get user's bids
     */
    public function getUserBids($userId, $status = null) {
        try {
            $sql = "SELECT b.*, t.title as tender_title, t.organization, t.submission_deadline,
                           t.status as tender_status, tc.name as category_name
                    FROM {$this->table} b
                    LEFT JOIN tenders t ON b.tender_id = t.id
                    LEFT JOIN tender_categories tc ON t.category_id = tc.id
                    WHERE b.bidder_id = ?";
            
            $params = [$userId];
            
            if ($status) {
                $sql .= " AND b.status = ?";
                $params[] = $status;
            }
            
            $sql .= " ORDER BY b.created_at DESC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get bid details with tender info
     */
    public function getBidDetails($id) {
        try {
            $sql = "SELECT b.*, t.title as tender_title, t.organization, t.submission_deadline,
                           t.estimated_value as tender_value, t.currency as tender_currency,
                           u.first_name as bidder_first_name, u.last_name as bidder_last_name,
                           u.email as bidder_email, u.company_name as bidder_company,
                           reviewer.first_name as reviewed_by_first_name, 
                           reviewer.last_name as reviewed_by_last_name
                    FROM {$this->table} b
                    LEFT JOIN tenders t ON b.tender_id = t.id
                    LEFT JOIN users u ON b.bidder_id = u.id
                    LEFT JOIN users reviewer ON b.reviewed_by = reviewer.id
                    WHERE b.id = ?";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$id]);
            
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return null;
        }
    }
    
    /**
     * Check if user has already bid on tender
     */
    public function hasUserBid($tenderId, $userId) {
        try {
            $sql = "SELECT COUNT(*) as count FROM {$this->table} 
                    WHERE tender_id = ? AND bidder_id = ?";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$tenderId, $userId]);
            
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            return $result && $result['count'] > 0;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Generate bid number
     */
    public function generateBidNumber($tenderId) {
        try {
            $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE tender_id = ?";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$tenderId]);
            
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            $sequence = $result ? $result['count'] + 1 : 1;
            
            return 'BID' . str_pad($tenderId, 4, '0', STR_PAD_LEFT) . str_pad($sequence, 3, '0', STR_PAD_LEFT);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return 'BID' . time();
        }
    }
    
    /**
     * Submit bid
     */
    public function submitBid($id) {
        try {
            $data = [
                'status' => 'submitted',
                'submitted_at' => date('Y-m-d H:i:s')
            ];
            
            return $this->update($id, $data);
        } catch (\Exception $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Withdraw bid
     */
    public function withdrawBid($id, $reason = '') {
        try {
            $data = [
                'status' => 'withdrawn',
                'withdrawal_reason' => $reason
            ];
            
            return $this->update($id, $data);
        } catch (\Exception $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Update bid scores
     */
    public function updateScores($id, $technicalScore, $financialScore, $complianceScore = null) {
        try {
            $totalScore = $technicalScore + $financialScore;
            if ($complianceScore !== null) {
                $totalScore += $complianceScore;
            }
            
            $data = [
                'technical_score' => $technicalScore,
                'financial_score' => $financialScore,
                'total_score' => $totalScore
            ];
            
            return $this->update($id, $data);
        } catch (\Exception $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Update bid ranking
     */
    public function updateRanking($tenderId) {
        try {
            $sql = "SELECT id FROM {$this->table} 
                    WHERE tender_id = ? AND status = 'submitted'
                    ORDER BY total_score DESC, bid_amount ASC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$tenderId]);
            
            $bids = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            $rank = 1;
            foreach ($bids as $bid) {
                $updateSql = "UPDATE {$this->table} SET rank = ? WHERE id = ?";
                $updateStmt = $this->connection->prepare($updateSql);
                $updateStmt->execute([$rank, $bid['id']]);
                $rank++;
            }
            
            return true;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Award bid
     */
    public function awardBid($id, $reviewerId, $notes = '') {
        try {
            $data = [
                'status' => 'awarded',
                'reviewed_by' => $reviewerId,
                'reviewed_at' => date('Y-m-d H:i:s'),
                'review_notes' => $notes
            ];
            
            return $this->update($id, $data);
        } catch (\Exception $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Reject bid
     */
    public function rejectBid($id, $reviewerId, $reason = '') {
        try {
            $data = [
                'status' => 'rejected',
                'reviewed_by' => $reviewerId,
                'reviewed_at' => date('Y-m-d H:i:s'),
                'review_notes' => $reason
            ];
            
            return $this->update($id, $data);
        } catch (\Exception $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Get bid statistics
     */
    public function getBidStatistics($tenderId = null) {
        try {
            $sql = "SELECT 
                        COUNT(*) as total_bids,
                        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted_bids,
                        SUM(CASE WHEN status = 'awarded' THEN 1 ELSE 0 END) as awarded_bids,
                        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_bids,
                        AVG(bid_amount) as average_bid_amount,
                        MIN(bid_amount) as lowest_bid_amount,
                        MAX(bid_amount) as highest_bid_amount
                    FROM {$this->table}";
            
            $params = [];
            
            if ($tenderId) {
                $sql .= " WHERE tender_id = ?";
                $params[] = $tenderId;
            }
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [
                'total_bids' => 0,
                'submitted_bids' => 0,
                'awarded_bids' => 0,
                'rejected_bids' => 0,
                'average_bid_amount' => 0,
                'lowest_bid_amount' => 0,
                'highest_bid_amount' => 0
            ];
        }
    }
    
    /**
     * Get winning bids for user
     */
    public function getUserWinningBids($userId) {
        try {
            $sql = "SELECT b.*, t.title as tender_title, t.organization
                    FROM {$this->table} b
                    LEFT JOIN tenders t ON b.tender_id = t.id
                    WHERE b.bidder_id = ? AND b.status = 'awarded'
                    ORDER BY b.reviewed_at DESC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$userId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get bid documents
     */
    public function getBidDocuments($bidId) {
        try {
            $sql = "SELECT bd.*, fu.original_name, fu.filename, fu.file_path, 
                           fu.file_size, fu.mime_type
                    FROM bid_documents bd
                    LEFT JOIN file_uploads fu ON bd.file_id = fu.id
                    WHERE bd.bid_id = ?
                    ORDER BY bd.sort_order ASC, bd.created_at ASC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$bidId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Check if bid is editable
     */
    public function isEditable($bid) {
        // Only draft bids can be edited
        return $bid['status'] === 'draft';
    }
    
    /**
     * Check if bid can be submitted
     */
    public function canSubmit($bid) {
        // Must be in draft status and have required documents
        if ($bid['status'] !== 'draft') {
            return false;
        }
        
        // Check if tender is still open
        $tenderModel = new Tender();
        $tender = $tenderModel->find($bid['tender_id']);
        
        if (!$tender || $tender['status'] !== 'published') {
            return false;
        }
        
        if (strtotime($tender['submission_deadline']) < time()) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Get bid evaluation history
     */
    public function getBidEvaluations($bidId) {
        try {
            $sql = "SELECT be.*, u.first_name as evaluator_first_name, u.last_name as evaluator_last_name
                    FROM bid_evaluations be
                    LEFT JOIN users u ON be.evaluator_id = u.id
                    WHERE be.bid_id = ?
                    ORDER BY be.evaluation_round ASC, be.created_at ASC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$bidId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
}