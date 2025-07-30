<?php
/**
 * Tender Category Model
 * SquidJob Tender Management System
 * 
 * Handles tender category operations
 */

namespace App\Models;

class TenderCategory extends BaseModel {
    
    protected $table = 'tender_categories';
    protected $primaryKey = 'id';
    protected $timestamps = true;
    protected $softDeletes = false;
    
    protected $fillable = [
        'name', 'description', 'parent_id', 'sort_order', 'is_active'
    ];
    
    protected $guarded = [
        'id', 'created_at', 'updated_at'
    ];
    
    /**
     * Get all active categories
     */
    public function getActiveCategories() {
        try {
            $sql = "SELECT * FROM {$this->table} 
                    WHERE is_active = 1 
                    ORDER BY sort_order ASC, name ASC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get category hierarchy
     */
    public function getCategoryHierarchy() {
        try {
            $sql = "SELECT c.*, p.name as parent_name,
                           (SELECT COUNT(*) FROM tenders t WHERE t.category_id = c.id) as tender_count
                    FROM {$this->table} c
                    LEFT JOIN {$this->table} p ON c.parent_id = p.id
                    WHERE c.is_active = 1
                    ORDER BY c.sort_order ASC, c.name ASC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get subcategories
     */
    public function getSubcategories($parentId) {
        try {
            $sql = "SELECT * FROM {$this->table} 
                    WHERE parent_id = ? AND is_active = 1 
                    ORDER BY sort_order ASC, name ASC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$parentId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get category with tender count
     */
    public function getCategoryWithStats($id) {
        try {
            $sql = "SELECT c.*,
                           (SELECT COUNT(*) FROM tenders t WHERE t.category_id = c.id) as tender_count,
                           (SELECT COUNT(*) FROM tenders t WHERE t.category_id = c.id AND t.status = 'published') as published_count
                    FROM {$this->table} c
                    WHERE c.id = ?";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$id]);
            
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return null;
        }
    }
}