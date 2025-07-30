<?php
/**
 * Secure File Upload Handler
 * SquidJob Tender Management System
 * 
 * Advanced file upload with security validation, virus scanning, and processing
 */

namespace App\Core;

use Exception;

class SecureFileUpload {
    
    private $config = [];
    private $errors = [];
    private $uploadedFiles = [];
    
    // Default configuration
    private $defaultConfig = [
        'max_file_size' => 52428800, // 50MB
        'allowed_types' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'zip'],
        'allowed_mime_types' => [
            'pdf' => ['application/pdf'],
            'doc' => ['application/msword'],
            'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'xls' => ['application/vnd.ms-excel'],
            'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            'jpg' => ['image/jpeg'],
            'jpeg' => ['image/jpeg'],
            'png' => ['image/png'],
            'gif' => ['image/gif'],
            'zip' => ['application/zip', 'application/x-zip-compressed']
        ],
        'upload_path' => 'public/uploads',
        'temp_path' => 'storage/temp',
        'create_thumbnails' => true,
        'thumbnail_sizes' => [150, 300, 600],
        'enable_virus_scan' => false,
        'enable_compression' => true,
        'preserve_original' => true,
        'generate_unique_names' => true,
        'organize_by_date' => true,
        'enable_watermark' => false,
        'watermark_text' => 'SquidJob',
        'max_files_per_upload' => 10
    ];
    
    public function __construct($config = []) {
        $this->config = array_merge($this->defaultConfig, $config);
        $this->validateConfiguration();
        $this->createDirectories();
    }
    
    /**
     * Upload single file
     */
    public function uploadFile($fileInput, $options = []) {
        try {
            // Reset errors
            $this->errors = [];
            
            // Validate file input
            if (!isset($_FILES[$fileInput])) {
                throw new Exception("File input '{$fileInput}' not found");
            }
            
            $file = $_FILES[$fileInput];
            
            // Handle multiple files
            if (is_array($file['name'])) {
                return $this->uploadMultipleFiles($file, $options);
            }
            
            // Process single file
            return $this->processSingleFile($file, $options);
            
        } catch (Exception $e) {
            $this->errors[] = $e->getMessage();
            return false;
        }
    }
    
    /**
     * Upload multiple files
     */
    public function uploadMultipleFiles($files, $options = []) {
        $results = [];
        $fileCount = count($files['name']);
        
        // Check file count limit
        if ($fileCount > $this->config['max_files_per_upload']) {
            throw new Exception("Too many files. Maximum {$this->config['max_files_per_upload']} files allowed");
        }
        
        for ($i = 0; $i < $fileCount; $i++) {
            $file = [
                'name' => $files['name'][$i],
                'type' => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'error' => $files['error'][$i],
                'size' => $files['size'][$i]
            ];
            
            try {
                $result = $this->processSingleFile($file, $options);
                if ($result) {
                    $results[] = $result;
                }
            } catch (Exception $e) {
                $this->errors[] = "File {$file['name']}: " . $e->getMessage();
            }
        }
        
        return $results;
    }
    
    /**
     * Process single file upload
     */
    private function processSingleFile($file, $options = []) {
        // Check for upload errors
        $this->checkUploadErrors($file);
        
        // Validate file
        $this->validateFile($file);
        
        // Security checks
        $this->performSecurityChecks($file);
        
        // Generate file information
        $fileInfo = $this->generateFileInfo($file, $options);
        
        // Move file to destination
        $this->moveUploadedFile($file, $fileInfo);
        
        // Post-processing
        $this->postProcessFile($fileInfo);
        
        // Save to database
        $this->saveFileRecord($fileInfo);
        
        return $fileInfo;
    }
    
    /**
     * Check upload errors
     */
    private function checkUploadErrors($file) {
        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                throw new Exception('No file was uploaded');
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new Exception('File is too large');
            case UPLOAD_ERR_PARTIAL:
                throw new Exception('File was only partially uploaded');
            case UPLOAD_ERR_NO_TMP_DIR:
                throw new Exception('Missing temporary folder');
            case UPLOAD_ERR_CANT_WRITE:
                throw new Exception('Failed to write file to disk');
            case UPLOAD_ERR_EXTENSION:
                throw new Exception('File upload stopped by extension');
            default:
                throw new Exception('Unknown upload error');
        }
    }
    
    /**
     * Validate file
     */
    private function validateFile($file) {
        // Check file size
        if ($file['size'] > $this->config['max_file_size']) {
            throw new Exception('File size exceeds maximum allowed size of ' . $this->formatFileSize($this->config['max_file_size']));
        }
        
        if ($file['size'] == 0) {
            throw new Exception('File is empty');
        }
        
        // Get file extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        // Check allowed extensions
        if (!in_array($extension, $this->config['allowed_types'])) {
            throw new Exception('File type not allowed. Allowed types: ' . implode(', ', $this->config['allowed_types']));
        }
        
        // Check MIME type
        $mimeType = $this->getMimeType($file['tmp_name']);
        if (!$this->isValidMimeType($extension, $mimeType)) {
            throw new Exception('Invalid file type. MIME type does not match extension');
        }
        
        // Check file name
        if (!$this->isValidFileName($file['name'])) {
            throw new Exception('Invalid file name. File name contains illegal characters');
        }
    }
    
    /**
     * Perform security checks
     */
    private function performSecurityChecks($file) {
        // Check for executable files
        if ($this->isExecutableFile($file['tmp_name'])) {
            throw new Exception('Executable files are not allowed');
        }
        
        // Check for malicious content
        if ($this->containsMaliciousContent($file['tmp_name'])) {
            throw new Exception('File contains potentially malicious content');
        }
        
        // Virus scan (if enabled)
        if ($this->config['enable_virus_scan']) {
            if (!$this->virusScan($file['tmp_name'])) {
                throw new Exception('File failed virus scan');
            }
        }
        
        // Check file headers
        if (!$this->validateFileHeaders($file['tmp_name'])) {
            throw new Exception('Invalid file headers detected');
        }
    }
    
    /**
     * Generate file information
     */
    private function generateFileInfo($file, $options = []) {
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $originalName = pathinfo($file['name'], PATHINFO_FILENAME);
        
        // Generate unique filename if required
        if ($this->config['generate_unique_names']) {
            $filename = $this->generateUniqueFilename($originalName, $extension);
        } else {
            $filename = $this->sanitizeFilename($file['name']);
        }
        
        // Determine upload path
        $uploadPath = $this->getUploadPath($options);
        $relativePath = $this->getRelativePath($uploadPath, $filename);
        $fullPath = $uploadPath . '/' . $filename;
        
        return [
            'original_name' => $file['name'],
            'filename' => $filename,
            'extension' => $extension,
            'mime_type' => $this->getMimeType($file['tmp_name']),
            'size' => $file['size'],
            'tmp_name' => $file['tmp_name'],
            'upload_path' => $uploadPath,
            'relative_path' => $relativePath,
            'full_path' => $fullPath,
            'url' => $this->generateFileUrl($relativePath),
            'hash' => hash_file('sha256', $file['tmp_name']),
            'uploaded_at' => date('Y-m-d H:i:s'),
            'uploaded_by' => auth() ? user()['id'] : null,
            'options' => $options
        ];
    }
    
    /**
     * Move uploaded file
     */
    private function moveUploadedFile($file, &$fileInfo) {
        // Ensure directory exists
        if (!is_dir($fileInfo['upload_path'])) {
            if (!mkdir($fileInfo['upload_path'], 0755, true)) {
                throw new Exception('Failed to create upload directory');
            }
        }
        
        // Move file
        if (!move_uploaded_file($file['tmp_name'], $fileInfo['full_path'])) {
            throw new Exception('Failed to move uploaded file');
        }
        
        // Set file permissions
        chmod($fileInfo['full_path'], 0644);
        
        logMessage('INFO', "File uploaded: {$fileInfo['original_name']} -> {$fileInfo['relative_path']}");
    }
    
    /**
     * Post-process file
     */
    private function postProcessFile(&$fileInfo) {
        // Compress file if enabled
        if ($this->config['enable_compression'] && $this->isCompressibleFile($fileInfo['extension'])) {
            $this->compressFile($fileInfo);
        }
        
        // Generate thumbnails for images
        if ($this->config['create_thumbnails'] && $this->isImageFile($fileInfo['extension'])) {
            $fileInfo['thumbnails'] = $this->generateThumbnails($fileInfo);
        }
        
        // Add watermark if enabled
        if ($this->config['enable_watermark'] && $this->isImageFile($fileInfo['extension'])) {
            $this->addWatermark($fileInfo);
        }
        
        // Extract metadata
        $fileInfo['metadata'] = $this->extractMetadata($fileInfo);
        
        // Extract text content for searchable files
        if ($this->isTextExtractable($fileInfo['extension'])) {
            $fileInfo['extracted_text'] = $this->extractText($fileInfo);
        }
    }
    
    /**
     * Save file record to database
     */
    private function saveFileRecord($fileInfo) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO documents 
                (original_name, stored_name, file_path, file_size, mime_type, file_hash, 
                 document_type, metadata, uploaded_by, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $fileInfo['original_name'],
                $fileInfo['filename'],
                $fileInfo['relative_path'],
                $fileInfo['size'],
                $fileInfo['mime_type'],
                $fileInfo['hash'],
                $fileInfo['options']['document_type'] ?? 'general',
                json_encode($fileInfo['metadata'] ?? []),
                $fileInfo['uploaded_by']
            ]);
            
            $fileInfo['id'] = $pdo->lastInsertId();
            
        } catch (Exception $e) {
            logMessage('ERROR', 'Failed to save file record: ' . $e->getMessage());
            // Don't throw exception here to avoid breaking the upload process
        }
    }
    
    /**
     * Get MIME type
     */
    private function getMimeType($filePath) {
        if (function_exists('finfo_file')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $filePath);
            finfo_close($finfo);
            return $mimeType;
        } elseif (function_exists('mime_content_type')) {
            return mime_content_type($filePath);
        } else {
            return 'application/octet-stream';
        }
    }
    
    /**
     * Validate MIME type
     */
    private function isValidMimeType($extension, $mimeType) {
        if (!isset($this->config['allowed_mime_types'][$extension])) {
            return false;
        }
        
        return in_array($mimeType, $this->config['allowed_mime_types'][$extension]);
    }
    
    /**
     * Check if filename is valid
     */
    private function isValidFileName($filename) {
        // Check for dangerous characters
        $dangerousChars = ['<', '>', ':', '"', '|', '?', '*', '\\', '/'];
        foreach ($dangerousChars as $char) {
            if (strpos($filename, $char) !== false) {
                return false;
            }
        }
        
        // Check for reserved names (Windows)
        $reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
        $nameWithoutExt = pathinfo($filename, PATHINFO_FILENAME);
        if (in_array(strtoupper($nameWithoutExt), $reservedNames)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if file is executable
     */
    private function isExecutableFile($filePath) {
        $executableExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'sh', 'php', 'asp', 'aspx', 'jsp'];
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        
        if (in_array($extension, $executableExtensions)) {
            return true;
        }
        
        // Check file headers for executable signatures
        $handle = fopen($filePath, 'rb');
        if ($handle) {
            $header = fread($handle, 4);
            fclose($handle);
            
            // Check for common executable signatures
            $executableSignatures = [
                "\x4D\x5A", // PE executable
                "\x7F\x45\x4C\x46", // ELF executable
                "\xFE\xED\xFA\xCE", // Mach-O executable
                "\xFE\xED\xFA\xCF", // Mach-O executable
            ];
            
            foreach ($executableSignatures as $signature) {
                if (strpos($header, $signature) === 0) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Check for malicious content
     */
    private function containsMaliciousContent($filePath) {
        // Read first few KB of file
        $handle = fopen($filePath, 'rb');
        if (!$handle) {
            return false;
        }
        
        $content = fread($handle, 8192); // Read first 8KB
        fclose($handle);
        
        // Check for suspicious patterns
        $maliciousPatterns = [
            '/<script[^>]*>.*?<\/script>/is',
            '/javascript:/i',
            '/vbscript:/i',
            '/onload\s*=/i',
            '/onerror\s*=/i',
            '/eval\s*\(/i',
            '/base64_decode/i',
            '/shell_exec/i',
            '/system\s*\(/i',
            '/exec\s*\(/i'
        ];
        
        foreach ($maliciousPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Virus scan (placeholder - integrate with actual antivirus)
     */
    private function virusScan($filePath) {
        // This is a placeholder for virus scanning
        // In production, integrate with ClamAV or similar
        
        // Example ClamAV integration:
        // $output = shell_exec("clamscan --no-summary {$filePath}");
        // return strpos($output, 'FOUND') === false;
        
        return true; // Assume clean for now
    }
    
    /**
     * Validate file headers
     */
    private function validateFileHeaders($filePath) {
        $handle = fopen($filePath, 'rb');
        if (!$handle) {
            return false;
        }
        
        $header = fread($handle, 16);
        fclose($handle);
        
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        
        // Define expected file signatures
        $signatures = [
            'pdf' => ["\x25\x50\x44\x46"],
            'jpg' => ["\xFF\xD8\xFF"],
            'jpeg' => ["\xFF\xD8\xFF"],
            'png' => ["\x89\x50\x4E\x47\x0D\x0A\x1A\x0A"],
            'gif' => ["\x47\x49\x46\x38\x37\x61", "\x47\x49\x46\x38\x39\x61"],
            'zip' => ["\x50\x4B\x03\x04", "\x50\x4B\x05\x06", "\x50\x4B\x07\x08"],
            'doc' => ["\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1"],
            'docx' => ["\x50\x4B\x03\x04"],
            'xls' => ["\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1"],
            'xlsx' => ["\x50\x4B\x03\x04"]
        ];
        
        if (isset($signatures[$extension])) {
            foreach ($signatures[$extension] as $signature) {
                if (strpos($header, $signature) === 0) {
                    return true;
                }
            }
            return false;
        }
        
        return true; // Allow unknown types
    }
    
    /**
     * Generate unique filename
     */
    private function generateUniqueFilename($originalName, $extension) {
        $timestamp = time();
        $random = bin2hex(random_bytes(8));
        $sanitizedName = $this->sanitizeFilename($originalName);
        
        return "{$timestamp}_{$random}_{$sanitizedName}.{$extension}";
    }
    
    /**
     * Sanitize filename
     */
    private function sanitizeFilename($filename) {
        // Remove dangerous characters
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
        
        // Remove multiple underscores
        $filename = preg_replace('/_+/', '_', $filename);
        
        // Trim underscores from start and end
        $filename = trim($filename, '_');
        
        // Ensure filename is not empty
        if (empty($filename)) {
            $filename = 'file';
        }
        
        return $filename;
    }
    
    /**
     * Get upload path
     */
    private function getUploadPath($options = []) {
        $basePath = APP_ROOT . '/' . $this->config['upload_path'];
        
        // Organize by date if enabled
        if ($this->config['organize_by_date']) {
            $datePath = date('Y/m/d');
            $basePath .= '/' . $datePath;
        }
        
        // Add custom path if specified
        if (isset($options['path'])) {
            $basePath .= '/' . trim($options['path'], '/');
        }
        
        return $basePath;
    }
    
    /**
     * Get relative path
     */
    private function getRelativePath($uploadPath, $filename) {
        $relativePath = str_replace(APP_ROOT . '/', '', $uploadPath);
        return $relativePath . '/' . $filename;
    }
    
    /**
     * Generate file URL
     */
    private function generateFileUrl($relativePath) {
        return url($relativePath);
    }
    
    /**
     * Check if file is compressible
     */
    private function isCompressibleFile($extension) {
        $compressibleTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
        return in_array($extension, $compressibleTypes);
    }
    
    /**
     * Check if file is an image
     */
    private function isImageFile($extension) {
        $imageTypes = ['jpg', 'jpeg', 'png', 'gif'];
        return in_array($extension, $imageTypes);
    }
    
    /**
     * Check if text can be extracted
     */
    private function isTextExtractable($extension) {
        $extractableTypes = ['pdf', 'doc', 'docx', 'txt'];
        return in_array($extension, $extractableTypes);
    }
    
    /**
     * Compress file (placeholder)
     */
    private function compressFile(&$fileInfo) {
        // Implement file compression logic here
        // This could use libraries like Imagick for images or other compression tools
    }
    
    /**
     * Generate thumbnails (placeholder)
     */
    private function generateThumbnails($fileInfo) {
        // Implement thumbnail generation logic here
        return [];
    }
    
    /**
     * Add watermark (placeholder)
     */
    private function addWatermark(&$fileInfo) {
        // Implement watermark logic here
    }
    
    /**
     * Extract metadata
     */
    private function extractMetadata($fileInfo) {
        $metadata = [
            'file_size_human' => $this->formatFileSize($fileInfo['size']),
            'upload_date' => $fileInfo['uploaded_at']
        ];
        
        // Add image-specific metadata
        if ($this->isImageFile($fileInfo['extension'])) {
            $imageInfo = getimagesize($fileInfo['full_path']);
            if ($imageInfo) {
                $metadata['width'] = $imageInfo[0];
                $metadata['height'] = $imageInfo[1];
                $metadata['type'] = $imageInfo['mime'];
            }
        }
        
        return $metadata;
    }
    
    /**
     * Extract text content (placeholder)
     */
    private function extractText($fileInfo) {
        // Implement text extraction logic here
        return '';
    }
    
    /**
     * Format file size
     */
    private function formatFileSize($bytes) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
    
    /**
     * Validate configuration
     */
    private function validateConfiguration() {
        if ($this->config['max_file_size'] <= 0) {
            throw new Exception('Invalid max_file_size configuration');
        }
        
        if (empty($this->config['allowed_types'])) {
            throw new Exception('No allowed file types configured');
        }
        
        if (empty($this->config['upload_path'])) {
            throw new Exception('Upload path not configured');
        }
    }
    
    /**
     * Create necessary directories
     */
    private function createDirectories() {
        $directories = [
            APP_ROOT . '/' . $this->config['upload_path'],
            APP_ROOT . '/' . $this->config['temp_path']
        ];
        
        foreach ($directories as $dir) {
            if (!is_dir($dir)) {
                if (!mkdir($dir, 0755, true)) {
                    throw new Exception("Failed to create directory: {$dir}");
                }
            }
        }
    }
    
    /**
     * Get upload errors
     */
    public function getErrors() {
        return $this->errors;
    }
    
    /**
     * Get last uploaded files
     */
    public function getUploadedFiles() {
        return $this->uploadedFiles;
    }
    
    /**
     * Delete uploaded file
     */
    public function deleteFile($fileId) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("SELECT * FROM documents WHERE id = ?");
            $stmt->execute([$fileId]);
            $file = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$file) {
                throw new Exception('File not found');
            }
            
            $filePath = APP_ROOT . '/' . $file['file_path'];
            
            // Delete physical file
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            
            // Delete thumbnails if they exist
            // Implementation depends on thumbnail storage structure
            
            // Mark as deleted in database
            $stmt = $pdo->prepare("UPDATE documents SET status = 'deleted', deleted_at = NOW() WHERE id = ?");
            $stmt->execute([$fileId]);
            
            return true;
            
        } catch (Exception $e) {
            $this->errors[] = $e->getMessage();
            return false;
        }
    }
}

/**
 * Global file upload helper functions
 */

/**
 * Upload file with default configuration
 */
function uploadFile($fileInput, $options = []) {
    $uploader = new SecureFileUpload();
    return $uploader->uploadFile($fileInput, $options);
}

/**
 * Upload file with custom configuration
 */
function uploadFileWithConfig($fileInput, $config = [], $options = []) {
    $uploader = new SecureFileUpload($config);
    return $uploader->uploadFile($fileInput, $options);
}

/**
 * Get secure file upload instance
 */
function fileUploader($config = []) {
    return new SecureFileUpload($config);
}