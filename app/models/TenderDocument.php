<?php
/**
 * Tender Document Model
 * SquidJob Tender Management System
 * 
 * Handles tender document operations
 */

namespace App\Models;

class TenderDocument extends BaseModel {
    
    protected $table = 'tender_documents';
    protected $primaryKey = 'id';
    protected $timestamps = true;
    protected $softDeletes = false;
    
    protected $fillable = [
        'tender_id', 'file_id', 'document_type', 'title', 'description',
        'is_mandatory', 'sort_order'
    ];
    
    protected $guarded = [
        'id', 'created_at'
    ];
    
    /**
     * Get documents for a tender
     */
    public function getTenderDocuments($tenderId) {
        try {
            $sql = "SELECT td.*, fu.original_name, fu.filename, fu.file_path, 
                           fu.file_size, fu.mime_type, fu.file_extension,
                           fu.download_count, fu.created_at as uploaded_at,
                           u.first_name as uploaded_by_first_name, u.last_name as uploaded_by_last_name
                    FROM {$this->table} td
                    LEFT JOIN file_uploads fu ON td.file_id = fu.id
                    LEFT JOIN users u ON fu.uploaded_by = u.id
                    WHERE td.tender_id = ?
                    ORDER BY td.sort_order ASC, td.created_at ASC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$tenderId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get documents by type
     */
    public function getDocumentsByType($tenderId, $type) {
        try {
            $sql = "SELECT td.*, fu.original_name, fu.filename, fu.file_path, 
                           fu.file_size, fu.mime_type
                    FROM {$this->table} td
                    LEFT JOIN file_uploads fu ON td.file_id = fu.id
                    WHERE td.tender_id = ? AND td.document_type = ?
                    ORDER BY td.sort_order ASC, td.created_at ASC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$tenderId, $type]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get mandatory documents
     */
    public function getMandatoryDocuments($tenderId) {
        try {
            $sql = "SELECT td.*, fu.original_name, fu.filename, fu.file_path
                    FROM {$this->table} td
                    LEFT JOIN file_uploads fu ON td.file_id = fu.id
                    WHERE td.tender_id = ? AND td.is_mandatory = 1
                    ORDER BY td.sort_order ASC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$tenderId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Delete tender document
     */
    public function deleteTenderDocument($tenderId, $documentId) {
        try {
            $this->connection->beginTransaction();
            
            // Get file info first
            $sql = "SELECT fu.file_path FROM {$this->table} td
                    LEFT JOIN file_uploads fu ON td.file_id = fu.id
                    WHERE td.tender_id = ? AND td.id = ?";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$tenderId, $documentId]);
            $document = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($document) {
                // Delete from tender_documents
                $this->delete($documentId);
                
                // Delete physical file
                $filePath = APP_ROOT . '/public/' . $document['file_path'];
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
                
                $this->connection->commit();
                return true;
            }
            
            $this->connection->rollback();
            return false;
            
        } catch (\PDOException $e) {
            $this->connection->rollback();
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Delete all tender documents
     */
    public function deleteTenderDocuments($tenderId) {
        try {
            $this->connection->beginTransaction();
            
            // Get all documents for this tender
            $documents = $this->getTenderDocuments($tenderId);
            
            foreach ($documents as $document) {
                // Delete physical file
                $filePath = APP_ROOT . '/public/' . $document['file_path'];
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
            
            // Delete all records
            $sql = "DELETE FROM {$this->table} WHERE tender_id = ?";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$tenderId]);
            
            $this->connection->commit();
            return true;
            
        } catch (\PDOException $e) {
            $this->connection->rollback();
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Update document sort order
     */
    public function updateSortOrder($documentId, $sortOrder) {
        try {
            $sql = "UPDATE {$this->table} SET sort_order = ? WHERE id = ?";
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute([$sortOrder, $documentId]);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Get document statistics
     */
    public function getDocumentStats($tenderId) {
        try {
            $sql = "SELECT 
                        COUNT(*) as total_documents,
                        SUM(CASE WHEN td.is_mandatory = 1 THEN 1 ELSE 0 END) as mandatory_documents,
                        SUM(fu.file_size) as total_size,
                        SUM(fu.download_count) as total_downloads
                    FROM {$this->table} td
                    LEFT JOIN file_uploads fu ON td.file_id = fu.id
                    WHERE td.tender_id = ?";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$tenderId]);
            
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [
                'total_documents' => 0,
                'mandatory_documents' => 0,
                'total_size' => 0,
                'total_downloads' => 0
            ];
        }
    }
}