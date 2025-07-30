<?php
/**
 * DocumentUploadHandler
 * SquidJob Tender Management System
 * 
 * Comprehensive document upload and processing utility
 * Handles file uploads, validation, virus scanning, and storage management
 */

class DocumentUploadHandler
{
    private $uploadBasePath;
    private $maxFileSize;
    private $allowedTypes;
    private $virusScanEnabled;
    private $compressionEnabled;
    
    public function __construct($config = [])
    {
        $this->uploadBasePath = $config['upload_path'] ?? __DIR__ . '/../../uploads/';
        $this->maxFileSize = $config['max_file_size'] ?? 52428800; // 50MB
        $this->allowedTypes = $config['allowed_types'] ?? [
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'
        ];
        $this->virusScanEnabled = $config['virus_scan'] ?? false;
        $this->compressionEnabled = $config['compression'] ?? true;
        
        // Ensure upload directory exists
        $this->ensureDirectoryExists($this->uploadBasePath);
    }
    
    /**
     * Upload single file with comprehensive processing
     */
    public function uploadFile($file, $destinationFolder, $options = [])
    {
        try {
            // Validate file
            $validation = $this->validateFile($file);
            if (!$validation['valid']) {
                return [
                    'success' => false,
                    'message' => 'File validation failed',
                    'errors' => $validation['errors']
                ];
            }
            
            // Generate secure filename
            $secureFilename = $this->generateSecureFilename($file['name']);
            $uploadPath = $this->uploadBasePath . $destinationFolder . '/';
            $this->ensureDirectoryExists($uploadPath);
            
            $fullPath = $uploadPath . $secureFilename;
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
                return [
                    'success' => false,
                    'message' => 'Failed to move uploaded file'
                ];
            }
            
            // Set file permissions
            chmod($fullPath, 0644);
            
            // Generate file metadata
            $metadata = $this->generateFileMetadata($fullPath, $file);
            
            // Perform virus scan if enabled
            if ($this->virusScanEnabled) {
                $scanResult = $this->performVirusScan($fullPath);
                $metadata['virus_scan'] = $scanResult;
                
                if (!$scanResult['clean']) {
                    // Delete infected file
                    unlink($fullPath);
                    return [
                        'success' => false,
                        'message' => 'File failed virus scan: ' . $scanResult['result']
                    ];
                }
            }
            
            // Compress file if enabled and applicable
            if ($this->compressionEnabled && $this->isCompressible($metadata['file_type'])) {
                $compressionResult = $this->compressFile($fullPath, $metadata);
                if ($compressionResult['success']) {
                    $metadata = array_merge($metadata, $compressionResult['metadata']);
                }
            }
            
            // Generate thumbnail for images
            if ($this->isImage($metadata['file_type'])) {
                $thumbnailResult = $this->generateThumbnail($fullPath, $uploadPath);
                if ($thumbnailResult['success']) {
                    $metadata['thumbnail_path'] = $thumbnailResult['thumbnail_path'];
                }
            }
            
            return [
                'success' => true,
                'message' => 'File uploaded successfully',
                'file_data' => [
                    'original_name' => $file['name'],
                    'stored_name' => $secureFilename,
                    'file_path' => $fullPath,
                    'relative_path' => $destinationFolder . '/' . $secureFilename,
                    'file_size' => $metadata['file_size'],
                    'file_type' => $metadata['file_type'],
                    'mime_type' => $metadata['mime_type'],
                    'checksum' => $metadata['checksum'],
                    'metadata' => json_encode($metadata)
                ]
            ];
            
        } catch (Exception $e) {
            // Clean up on error
            if (isset($fullPath) && file_exists($fullPath)) {
                unlink($fullPath);
            }
            
            return [
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Upload multiple files
     */
    public function uploadMultipleFiles($files, $destinationFolder, $options = [])
    {
        $results = [];
        $successCount = 0;
        $errors = [];
        
        // Normalize files array structure
        $normalizedFiles = $this->normalizeFilesArray($files);
        
        foreach ($normalizedFiles as $index => $file) {
            if ($file['error'] === UPLOAD_ERR_OK) {
                $result = $this->uploadFile($file, $destinationFolder, $options);
                $results[$index] = $result;
                
                if ($result['success']) {
                    $successCount++;
                } else {
                    $errors[] = $file['name'] . ': ' . $result['message'];
                }
            } else {
                $errors[] = $file['name'] . ': ' . $this->getUploadErrorMessage($file['error']);
            }
        }
        
        return [
            'success' => $successCount > 0,
            'total_files' => count($normalizedFiles),
            'successful_uploads' => $successCount,
            'failed_uploads' => count($normalizedFiles) - $successCount,
            'results' => $results,
            'errors' => $errors
        ];
    }
    
    /**
     * Validate uploaded file
     */
    public function validateFile($file)
    {
        $errors = [];
        
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = $this->getUploadErrorMessage($file['error']);
        }
        
        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            $errors[] = 'File size (' . $this->formatFileSize($file['size']) . ') exceeds maximum allowed size (' . $this->formatFileSize($this->maxFileSize) . ')';
        }
        
        // Check file type
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($fileExtension, $this->allowedTypes)) {
            $errors[] = 'File type "' . $fileExtension . '" is not allowed. Allowed types: ' . implode(', ', $this->allowedTypes);
        }
        
        // Check filename for security issues
        if (preg_match('/[<>:"|?*\\\\\/]/', $file['name'])) {
            $errors[] = 'Filename contains invalid characters';
        }
        
        // Check for executable files
        if ($this->isExecutableFile($file['name'])) {
            $errors[] = 'Executable files are not allowed';
        }
        
        // Validate MIME type
        if (isset($file['tmp_name']) && is_uploaded_file($file['tmp_name'])) {
            $detectedMimeType = mime_content_type($file['tmp_name']);
            if (!$this->isValidMimeType($detectedMimeType, $fileExtension)) {
                $errors[] = 'File content does not match file extension';
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Generate secure filename
     */
    public function generateSecureFilename($originalName)
    {
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $baseName = pathinfo($originalName, PATHINFO_FILENAME);
        
        // Sanitize base name
        $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $baseName);
        $baseName = substr($baseName, 0, 50); // Limit length
        
        // Add timestamp and random string
        $timestamp = time();
        $random = bin2hex(random_bytes(8));
        
        return $baseName . '_' . $timestamp . '_' . $random . '.' . $extension;
    }
    
    /**
     * Generate file metadata
     */
    private function generateFileMetadata($filePath, $originalFile)
    {
        $metadata = [
            'file_size' => filesize($filePath),
            'file_type' => strtolower(pathinfo($filePath, PATHINFO_EXTENSION)),
            'mime_type' => mime_content_type($filePath),
            'checksum' => hash_file('sha256', $filePath),
            'upload_time' => time(),
            'original_size' => $originalFile['size']
        ];
        
        // Add image-specific metadata
        if ($this->isImage($metadata['file_type'])) {
            $imageInfo = getimagesize($filePath);
            if ($imageInfo) {
                $metadata['image_width'] = $imageInfo[0];
                $metadata['image_height'] = $imageInfo[1];
                $metadata['image_type'] = $imageInfo[2];
            }
        }
        
        // Add document-specific metadata
        if ($this->isDocument($metadata['file_type'])) {
            $metadata['document_type'] = $this->getDocumentType($metadata['file_type']);
        }
        
        return $metadata;
    }
    
    /**
     * Perform virus scan on uploaded file
     */
    private function performVirusScan($filePath)
    {
        // This is a placeholder for virus scanning integration
        // You would integrate with ClamAV, VirusTotal API, or similar service
        
        try {
            // Example ClamAV integration (requires clamav-daemon)
            if (function_exists('exec') && $this->isClamAVAvailable()) {
                $output = [];
                $returnCode = 0;
                exec("clamscan --no-summary " . escapeshellarg($filePath), $output, $returnCode);
                
                return [
                    'scanned' => true,
                    'clean' => $returnCode === 0,
                    'result' => implode("\n", $output),
                    'scanner' => 'ClamAV'
                ];
            }
            
            // Fallback: Basic file signature check
            return $this->performBasicSecurityCheck($filePath);
            
        } catch (Exception $e) {
            return [
                'scanned' => false,
                'clean' => true, // Assume clean if scan fails
                'result' => 'Scan failed: ' . $e->getMessage(),
                'scanner' => 'none'
            ];
        }
    }
    
    /**
     * Basic security check for malicious file signatures
     */
    private function performBasicSecurityCheck($filePath)
    {
        $maliciousSignatures = [
            'MZ', // PE executable
            '<?php', // PHP code
            '<script', // JavaScript
            'eval(', // Eval function
            'exec(', // Exec function
        ];
        
        $fileContent = file_get_contents($filePath, false, null, 0, 1024); // Read first 1KB
        
        foreach ($maliciousSignatures as $signature) {
            if (stripos($fileContent, $signature) !== false) {
                return [
                    'scanned' => true,
                    'clean' => false,
                    'result' => 'Potentially malicious content detected',
                    'scanner' => 'basic'
                ];
            }
        }
        
        return [
            'scanned' => true,
            'clean' => true,
            'result' => 'No threats detected',
            'scanner' => 'basic'
        ];
    }
    
    /**
     * Compress file if applicable
     */
    private function compressFile($filePath, $metadata)
    {
        try {
            $originalSize = $metadata['file_size'];
            
            // Only compress large files
            if ($originalSize < 1048576) { // 1MB
                return ['success' => false, 'reason' => 'File too small for compression'];
            }
            
            // Compress based on file type
            if ($metadata['file_type'] === 'pdf') {
                return $this->compressPDF($filePath, $metadata);
            } elseif ($this->isImage($metadata['file_type'])) {
                return $this->compressImage($filePath, $metadata);
            }
            
            return ['success' => false, 'reason' => 'File type not suitable for compression'];
            
        } catch (Exception $e) {
            return ['success' => false, 'reason' => $e->getMessage()];
        }
    }
    
    /**
     * Generate thumbnail for images
     */
    private function generateThumbnail($imagePath, $uploadPath)
    {
        try {
            $thumbnailPath = $uploadPath . 'thumbnails/';
            $this->ensureDirectoryExists($thumbnailPath);
            
            $filename = pathinfo($imagePath, PATHINFO_FILENAME);
            $thumbnailFile = $thumbnailPath . $filename . '_thumb.jpg';
            
            // Create thumbnail using GD library
            $imageInfo = getimagesize($imagePath);
            if (!$imageInfo) {
                return ['success' => false, 'reason' => 'Invalid image file'];
            }
            
            $sourceImage = $this->createImageFromFile($imagePath, $imageInfo[2]);
            if (!$sourceImage) {
                return ['success' => false, 'reason' => 'Could not create image resource'];
            }
            
            // Calculate thumbnail dimensions
            $maxWidth = 300;
            $maxHeight = 300;
            $sourceWidth = imagesx($sourceImage);
            $sourceHeight = imagesy($sourceImage);
            
            $ratio = min($maxWidth / $sourceWidth, $maxHeight / $sourceHeight);
            $thumbWidth = intval($sourceWidth * $ratio);
            $thumbHeight = intval($sourceHeight * $ratio);
            
            // Create thumbnail
            $thumbnail = imagecreatetruecolor($thumbWidth, $thumbHeight);
            imagecopyresampled($thumbnail, $sourceImage, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $sourceWidth, $sourceHeight);
            
            // Save thumbnail
            $success = imagejpeg($thumbnail, $thumbnailFile, 85);
            
            // Clean up
            imagedestroy($sourceImage);
            imagedestroy($thumbnail);
            
            if ($success) {
                return [
                    'success' => true,
                    'thumbnail_path' => $thumbnailFile,
                    'thumbnail_size' => filesize($thumbnailFile)
                ];
            }
            
            return ['success' => false, 'reason' => 'Failed to save thumbnail'];
            
        } catch (Exception $e) {
            return ['success' => false, 'reason' => $e->getMessage()];
        }
    }
    
    /**
     * Delete uploaded file and associated files
     */
    public function deleteFile($filePath, $metadata = null)
    {
        try {
            $deleted = [];
            
            // Delete main file
            if (file_exists($filePath)) {
                unlink($filePath);
                $deleted[] = $filePath;
            }
            
            // Delete thumbnail if exists
            if ($metadata && isset($metadata['thumbnail_path'])) {
                if (file_exists($metadata['thumbnail_path'])) {
                    unlink($metadata['thumbnail_path']);
                    $deleted[] = $metadata['thumbnail_path'];
                }
            }
            
            return [
                'success' => true,
                'deleted_files' => $deleted
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Get storage statistics
     */
    public function getStorageStats($folder = null)
    {
        $path = $folder ? $this->uploadBasePath . $folder : $this->uploadBasePath;
        
        if (!is_dir($path)) {
            return [
                'total_size' => 0,
                'file_count' => 0,
                'folder_count' => 0
            ];
        }
        
        $totalSize = 0;
        $fileCount = 0;
        $folderCount = 0;
        
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $totalSize += $file->getSize();
                $fileCount++;
            } elseif ($file->isDir()) {
                $folderCount++;
            }
        }
        
        return [
            'total_size' => $totalSize,
            'total_size_formatted' => $this->formatFileSize($totalSize),
            'file_count' => $fileCount,
            'folder_count' => $folderCount
        ];
    }
    
    // Helper methods
    
    private function ensureDirectoryExists($path)
    {
        if (!is_dir($path)) {
            mkdir($path, 0755, true);
        }
    }
    
    private function normalizeFilesArray($files)
    {
        $normalized = [];
        
        if (isset($files['name']) && is_array($files['name'])) {
            // Multiple files
            for ($i = 0; $i < count($files['name']); $i++) {
                $normalized[] = [
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i]
                ];
            }
        } else {
            // Single file
            $normalized[] = $files;
        }
        
        return $normalized;
    }
    
    private function getUploadErrorMessage($errorCode)
    {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
        ];
        
        return $errors[$errorCode] ?? 'Unknown upload error';
    }
    
    private function isExecutableFile($filename)
    {
        $executableExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'sh'];
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        return in_array($extension, $executableExtensions);
    }
    
    private function isValidMimeType($mimeType, $extension)
    {
        $validMimeTypes = [
            'pdf' => ['application/pdf'],
            'doc' => ['application/msword'],
            'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'xls' => ['application/vnd.ms-excel'],
            'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            'jpg' => ['image/jpeg'],
            'jpeg' => ['image/jpeg'],
            'png' => ['image/png'],
            'zip' => ['application/zip']
        ];
        
        return isset($validMimeTypes[$extension]) && in_array($mimeType, $validMimeTypes[$extension]);
    }
    
    private function isImage($fileType)
    {
        return in_array($fileType, ['jpg', 'jpeg', 'png', 'gif']);
    }
    
    private function isDocument($fileType)
    {
        return in_array($fileType, ['pdf', 'doc', 'docx', 'xls', 'xlsx']);
    }
    
    private function isCompressible($fileType)
    {
        return in_array($fileType, ['pdf', 'jpg', 'jpeg', 'png']);
    }
    
    private function getDocumentType($fileType)
    {
        $types = [
            'pdf' => 'PDF Document',
            'doc' => 'Word Document',
            'docx' => 'Word Document',
            'xls' => 'Excel Spreadsheet',
            'xlsx' => 'Excel Spreadsheet'
        ];
        
        return $types[$fileType] ?? 'Document';
    }
    
    private function createImageFromFile($filePath, $imageType)
    {
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                return imagecreatefromjpeg($filePath);
            case IMAGETYPE_PNG:
                return imagecreatefrompng($filePath);
            case IMAGETYPE_GIF:
                return imagecreatefromgif($filePath);
            default:
                return false;
        }
    }
    
    private function compressPDF($filePath, $metadata)
    {
        // PDF compression would require external tools like Ghostscript
        // This is a placeholder for PDF compression logic
        return ['success' => false, 'reason' => 'PDF compression not implemented'];
    }
    
    private function compressImage($filePath, $metadata)
    {
        // Image compression logic
        try {
            $imageInfo = getimagesize($filePath);
            $sourceImage = $this->createImageFromFile($filePath, $imageInfo[2]);
            
            if (!$sourceImage) {
                return ['success' => false, 'reason' => 'Could not create image resource'];
            }
            
            // Compress and save
            $quality = 85; // JPEG quality
            $success = imagejpeg($sourceImage, $filePath, $quality);
            imagedestroy($sourceImage);
            
            if ($success) {
                $newSize = filesize($filePath);
                return [
                    'success' => true,
                    'metadata' => [
                        'compressed' => true,
                        'original_size' => $metadata['file_size'],
                        'compressed_size' => $newSize,
                        'compression_ratio' => round((1 - $newSize / $metadata['file_size']) * 100, 2)
                    ]
                ];
            }
            
            return ['success' => false, 'reason' => 'Failed to compress image'];
            
        } catch (Exception $e) {
            return ['success' => false, 'reason' => $e->getMessage()];
        }
    }
    
    private function isClamAVAvailable()
    {
        $output = [];
        $returnCode = 0;
        exec('which clamscan', $output, $returnCode);
        return $returnCode === 0;
    }
    
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
}