<?php
/**
 * BidDocument Model
 * SquidJob Tender Management System
 *
 * Handles bid document management including upload, storage,
 * and retrieval of documents associated with bids
 */

namespace App\Models;

class BidDocument extends BaseModel
{
    protected $table = 'bid_documents';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'bid_id',
        'original_name',
        'stored_name',
        'file_path',
        'file_size',
        'file_type',
        'mime_type',
        'document_type',
        'description',
        'checksum',
        'is_virus_scanned',
        'scan_result',
        'uploaded_by'
    ];
    
    protected $hidden = [
        'file_path',
        'stored_name',
        'checksum'
    ];
    
    /**
     * Get documents by bid ID
     */
    public function getByBidId($bidId)
    {
        try {
            $sql = "
                SELECT 
                    bd.*,
                    u.name as uploaded_by_name,
                    u.email as uploaded_by_email
                FROM {$this->table} bd
                LEFT JOIN users u ON bd.uploaded_by = u.id
                WHERE bd.bid_id = ?
                ORDER BY bd.created_at DESC
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$bidId]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            $this->logError('Error in BidDocument::getByBidId', $e);
            return [];
        }
    }
    
    /**
     * Get document by ID with security checks
     */
    public function findById($id)
    {
        try {
            $sql = "
                SELECT 
                    bd.*,
                    b.bidder_id,
                    b.tender_id,
                    u.name as uploaded_by_name
                FROM {$this->table} bd
                LEFT JOIN bids b ON bd.bid_id = b.id
                LEFT JOIN users u ON bd.uploaded_by = u.id
                WHERE bd.id = ?
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$id]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            $this->logError('Error in BidDocument::findById', $e);
            return null;
        }
    }
    
    /**
     * Create new bid document
     */
    public function create($data)
    {
        try {
            // Generate checksum if file path provided
            if (isset($data['file_path']) && file_exists($data['file_path'])) {
                $data['checksum'] = hash_file('sha256', $data['file_path']);
            }
            
            // Set default document type if not provided
            if (!isset($data['document_type'])) {
                $data['document_type'] = $this->determineDocumentType($data['original_name']);
            }
            
            $sql = "
                INSERT INTO {$this->table} (
                    bid_id, original_name, stored_name, file_path, file_size,
                    file_type, mime_type, document_type, description, checksum,
                    is_virus_scanned, scan_result, uploaded_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ";
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                $data['bid_id'],
                $data['original_name'],
                $data['stored_name'],
                $data['file_path'],
                $data['file_size'],
                $data['file_type'],
                $data['mime_type'],
                $data['document_type'],
                $data['description'] ?? null,
                $data['checksum'] ?? null,
                $data['is_virus_scanned'] ?? false,
                $data['scan_result'] ?? null,
                $data['uploaded_by']
            ]);
            
            if ($result) {
                return $this->db->lastInsertId();
            }
            
            return false;
            
        } catch (PDOException $e) {
            $this->logError('Error in BidDocument::create', $e);
            return false;
        }
    }
    
    /**
     * Update document information
     */
    public function update($id, $data)
    {
        try {
            $allowedFields = ['description', 'document_type', 'is_virus_scanned', 'scan_result'];
            $updateFields = [];
            $values = [];
            
            foreach ($data as $field => $value) {
                if (in_array($field, $allowedFields)) {
                    $updateFields[] = "{$field} = ?";
                    $values[] = $value;
                }
            }
            
            if (empty($updateFields)) {
                return false;
            }
            
            $values[] = $id;
            
            $sql = "
                UPDATE {$this->table} 
                SET " . implode(', ', $updateFields) . ", updated_at = NOW()
                WHERE id = ?
            ";
            
            $stmt = $this->db->prepare($sql);
            return $stmt->execute($values);
            
        } catch (PDOException $e) {
            $this->logError('Error in BidDocument::update', $e);
            return false;
        }
    }
    
    /**
     * Delete document
     */
    public function delete($id)
    {
        try {
            $sql = "DELETE FROM {$this->table} WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([$id]);
            
        } catch (PDOException $e) {
            $this->logError('Error in BidDocument::delete', $e);
            return false;
        }
    }
    
    /**
     * Get document statistics for a bid
     */
    public function getBidDocumentStats($bidId)
    {
        try {
            $sql = "
                SELECT 
                    COUNT(*) as total_documents,
                    SUM(file_size) as total_size,
                    COUNT(CASE WHEN document_type = 'technical' THEN 1 END) as technical_docs,
                    COUNT(CASE WHEN document_type = 'financial' THEN 1 END) as financial_docs,
                    COUNT(CASE WHEN document_type = 'legal' THEN 1 END) as legal_docs,
                    COUNT(CASE WHEN document_type = 'certificate' THEN 1 END) as certificate_docs,
                    COUNT(CASE WHEN is_virus_scanned = 1 THEN 1 END) as scanned_docs
                FROM {$this->table}
                WHERE bid_id = ?
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$bidId]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            $this->logError('Error in BidDocument::getBidDocumentStats', $e);
            return [];
        }
    }
    
    /**
     * Get documents by type for a bid
     */
    public function getDocumentsByType($bidId, $documentType)
    {
        try {
            $sql = "
                SELECT *
                FROM {$this->table}
                WHERE bid_id = ? AND document_type = ?
                ORDER BY created_at DESC
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$bidId, $documentType]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            $this->logError('Error in BidDocument::getDocumentsByType', $e);
            return [];
        }
    }
    
    /**
     * Check if document exists by checksum (duplicate detection)
     */
    public function findByChecksum($checksum, $bidId = null)
    {
        try {
            $sql = "
                SELECT *
                FROM {$this->table}
                WHERE checksum = ?
            ";
            
            $params = [$checksum];
            
            if ($bidId) {
                $sql .= " AND bid_id = ?";
                $params[] = $bidId;
            }
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            $this->logError('Error in BidDocument::findByChecksum', $e);
            return null;
        }
    }
    
    /**
     * Get documents requiring virus scan
     */
    public function getUnscannedDocuments($limit = 50)
    {
        try {
            $sql = "
                SELECT *
                FROM {$this->table}
                WHERE is_virus_scanned = 0
                ORDER BY created_at ASC
                LIMIT ?
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$limit]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            $this->logError('Error in BidDocument::getUnscannedDocuments', $e);
            return [];
        }
    }
    
    /**
     * Update virus scan result
     */
    public function updateScanResult($id, $scanResult, $isClean = true)
    {
        try {
            $sql = "
                UPDATE {$this->table}
                SET is_virus_scanned = 1, scan_result = ?, updated_at = NOW()
                WHERE id = ?
            ";
            
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([$scanResult, $id]);
            
        } catch (PDOException $e) {
            $this->logError('Error in BidDocument::updateScanResult', $e);
            return false;
        }
    }
    
    /**
     * Get total storage used by bid documents
     */
    public function getTotalStorageUsed()
    {
        try {
            $sql = "SELECT SUM(file_size) as total_size FROM {$this->table}";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['total_size'] ?? 0;
            
        } catch (PDOException $e) {
            $this->logError('Error in BidDocument::getTotalStorageUsed', $e);
            return 0;
        }
    }
    
    /**
     * Get storage used by specific bidder
     */
    public function getBidderStorageUsed($bidderId)
    {
        try {
            $sql = "
                SELECT SUM(bd.file_size) as total_size
                FROM {$this->table} bd
                JOIN bids b ON bd.bid_id = b.id
                WHERE b.bidder_id = ?
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$bidderId]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['total_size'] ?? 0;
            
        } catch (PDOException $e) {
            $this->logError('Error in BidDocument::getBidderStorageUsed', $e);
            return 0;
        }
    }
    
    /**
     * Clean up orphaned documents (documents without associated bids)
     */
    public function cleanupOrphanedDocuments()
    {
        try {
            $sql = "
                SELECT bd.*
                FROM {$this->table} bd
                LEFT JOIN bids b ON bd.bid_id = b.id
                WHERE b.id IS NULL
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            $orphanedDocs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $cleanedCount = 0;
            
            foreach ($orphanedDocs as $doc) {
                // Delete file from storage
                if (file_exists($doc['file_path'])) {
                    unlink($doc['file_path']);
                }
                
                // Delete from database
                $this->delete($doc['id']);
                $cleanedCount++;
            }
            
            return $cleanedCount;
            
        } catch (PDOException $e) {
            $this->logError('Error in BidDocument::cleanupOrphanedDocuments', $e);
            return 0;
        }
    }
    
    /**
     * Get document type options
     */
    public function getDocumentTypes()
    {
        return [
            'technical' => 'Technical Document',
            'financial' => 'Financial Document',
            'legal' => 'Legal Document',
            'certificate' => 'Certificate',
            'other' => 'Other'
        ];
    }
    
    /**
     * Get allowed file types
     */
    public function getAllowedFileTypes()
    {
        return [
            'pdf' => 'PDF Document',
            'doc' => 'Word Document',
            'docx' => 'Word Document (DOCX)',
            'xls' => 'Excel Spreadsheet',
            'xlsx' => 'Excel Spreadsheet (XLSX)',
            'jpg' => 'JPEG Image',
            'jpeg' => 'JPEG Image',
            'png' => 'PNG Image',
            'zip' => 'ZIP Archive'
        ];
    }
    
    /**
     * Validate file upload
     */
    public function validateFile($file, $maxSize = 52428800) // 50MB default
    {
        $errors = [];
        
        // Check file size
        if ($file['size'] > $maxSize) {
            $errors[] = 'File size exceeds maximum allowed size of ' . $this->formatFileSize($maxSize);
        }
        
        // Check file type
        $allowedTypes = array_keys($this->getAllowedFileTypes());
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($fileExtension, $allowedTypes)) {
            $errors[] = 'File type not allowed. Allowed types: ' . implode(', ', $allowedTypes);
        }
        
        // Check for malicious file names
        if (preg_match('/[<>:"|?*]/', $file['name'])) {
            $errors[] = 'File name contains invalid characters';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Format file size for display
     */
    public function formatFileSize($bytes)
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
    
    /**
     * Get file icon based on file type
     */
    public function getFileIcon($fileType)
    {
        $icons = [
            'pdf' => 'fa-file-pdf',
            'doc' => 'fa-file-word',
            'docx' => 'fa-file-word',
            'xls' => 'fa-file-excel',
            'xlsx' => 'fa-file-excel',
            'jpg' => 'fa-file-image',
            'jpeg' => 'fa-file-image',
            'png' => 'fa-file-image',
            'zip' => 'fa-file-archive'
        ];
        
        return $icons[$fileType] ?? 'fa-file';
    }
    
    /**
     * Determine document type based on filename
     */
    private function determineDocumentType($filename)
    {
        $filename = strtolower($filename);
        
        if (strpos($filename, 'technical') !== false || strpos($filename, 'spec') !== false) {
            return 'technical';
        } elseif (strpos($filename, 'financial') !== false || strpos($filename, 'price') !== false) {
            return 'financial';
        } elseif (strpos($filename, 'legal') !== false || strpos($filename, 'contract') !== false) {
            return 'legal';
        } elseif (strpos($filename, 'certificate') !== false || strpos($filename, 'cert') !== false) {
            return 'certificate';
        }
        
        return 'other';
    }
    
    /**
     * Generate secure filename
     */
    public function generateSecureFilename($originalName)
    {
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $timestamp = time();
        $random = bin2hex(random_bytes(8));
        
        return $timestamp . '_' . $random . '.' . $extension;
    }
    
    /**
     * Get MIME type from file extension
     */
    public function getMimeType($fileExtension)
    {
        $mimeTypes = [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'zip' => 'application/zip'
        ];
        
        return $mimeTypes[strtolower($fileExtension)] ?? 'application/octet-stream';
    }
}