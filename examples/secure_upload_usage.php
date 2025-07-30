<?php
/**
 * Secure File Upload Usage Examples
 * SquidJob Tender Management System
 * 
 * Demonstrates secure file upload functionality and patterns
 */

// Include the upload class
require_once __DIR__ . '/../app/core/SecureFileUpload.php';

/**
 * Example 1: Basic File Upload
 */
function basicUploadExample() {
    echo "=== Basic File Upload Example ===\n";
    
    // Simulate file upload (in real scenario, this comes from $_FILES)
    $_FILES['document'] = [
        'name' => 'tender_document.pdf',
        'type' => 'application/pdf',
        'tmp_name' => '/tmp/uploaded_file',
        'error' => UPLOAD_ERR_OK,
        'size' => 1024000 // 1MB
    ];
    
    try {
        // Upload with default configuration
        $result = uploadFile('document');
        
        if ($result) {
            echo "File uploaded successfully!\n";
            echo "Original name: {$result['original_name']}\n";
            echo "Stored as: {$result['filename']}\n";
            echo "File size: {$result['metadata']['file_size_human']}\n";
            echo "File URL: {$result['url']}\n";
            echo "File hash: {$result['hash']}\n";
        } else {
            echo "Upload failed\n";
        }
    } catch (Exception $e) {
        echo "Upload error: " . $e->getMessage() . "\n";
    }
}

/**
 * Example 2: Custom Configuration Upload
 */
function customConfigUploadExample() {
    echo "\n=== Custom Configuration Upload Example ===\n";
    
    // Custom configuration for tender documents
    $config = [
        'max_file_size' => 10485760, // 10MB
        'allowed_types' => ['pdf', 'doc', 'docx'],
        'upload_path' => 'public/uploads/tenders',
        'generate_unique_names' => true,
        'organize_by_date' => true,
        'enable_compression' => true,
        'preserve_original' => true
    ];
    
    $options = [
        'document_type' => 'tender_document',
        'tender_id' => 123,
        'path' => 'tender_123'
    ];
    
    try {
        $result = uploadFileWithConfig('tender_doc', $config, $options);
        
        if ($result) {
            echo "Tender document uploaded with custom config!\n";
            echo "Stored in: {$result['relative_path']}\n";
            echo "Document type: {$options['document_type']}\n";
        }
    } catch (Exception $e) {
        echo "Upload error: " . $e->getMessage() . "\n";
    }
}

/**
 * Example 3: Multiple File Upload
 */
function multipleFileUploadExample() {
    echo "\n=== Multiple File Upload Example ===\n";
    
    // Simulate multiple file upload
    $_FILES['documents'] = [
        'name' => [
            'specification.pdf',
            'drawings.zip',
            'terms.doc'
        ],
        'type' => [
            'application/pdf',
            'application/zip',
            'application/msword'
        ],
        'tmp_name' => [
            '/tmp/file1',
            '/tmp/file2',
            '/tmp/file3'
        ],
        'error' => [
            UPLOAD_ERR_OK,
            UPLOAD_ERR_OK,
            UPLOAD_ERR_OK
        ],
        'size' => [
            2048000, // 2MB
            5120000, // 5MB
            1024000  // 1MB
        ]
    ];
    
    try {
        $uploader = fileUploader([
            'max_files_per_upload' => 5,
            'organize_by_date' => true
        ]);
        
        $results = $uploader->uploadFile('documents');
        
        if ($results) {
            echo "Uploaded " . count($results) . " files successfully!\n";
            foreach ($results as $index => $file) {
                echo "File " . ($index + 1) . ": {$file['original_name']} -> {$file['filename']}\n";
            }
        }
        
        $errors = $uploader->getErrors();
        if (!empty($errors)) {
            echo "Errors encountered:\n";
            foreach ($errors as $error) {
                echo "- {$error}\n";
            }
        }
    } catch (Exception $e) {
        echo "Upload error: " . $e->getMessage() . "\n";
    }
}

/**
 * Example 4: Image Upload with Thumbnails
 */
function imageUploadExample() {
    echo "\n=== Image Upload with Thumbnails Example ===\n";
    
    $config = [
        'allowed_types' => ['jpg', 'jpeg', 'png', 'gif'],
        'max_file_size' => 5242880, // 5MB
        'create_thumbnails' => true,
        'thumbnail_sizes' => [150, 300, 600],
        'enable_watermark' => true,
        'watermark_text' => 'SquidJob Confidential',
        'upload_path' => 'public/uploads/images'
    ];
    
    $_FILES['image'] = [
        'name' => 'project_photo.jpg',
        'type' => 'image/jpeg',
        'tmp_name' => '/tmp/image_file',
        'error' => UPLOAD_ERR_OK,
        'size' => 2048000
    ];
    
    try {
        $uploader = fileUploader($config);
        $result = $uploader->uploadFile('image');
        
        if ($result) {
            echo "Image uploaded successfully!\n";
            echo "Original: {$result['url']}\n";
            
            if (isset($result['thumbnails'])) {
                echo "Thumbnails generated:\n";
                foreach ($result['thumbnails'] as $size => $thumbnail) {
                    echo "- {$size}px: {$thumbnail['url']}\n";
                }
            }
            
            if (isset($result['metadata']['width'])) {
                echo "Dimensions: {$result['metadata']['width']}x{$result['metadata']['height']}\n";
            }
        }
    } catch (Exception $e) {
        echo "Upload error: " . $e->getMessage() . "\n";
    }
}

/**
 * Example 5: Secure Document Upload for Tenders
 */
function secureDocumentUploadExample() {
    echo "\n=== Secure Document Upload for Tenders Example ===\n";
    
    $config = [
        'max_file_size' => 52428800, // 50MB
        'allowed_types' => ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
        'upload_path' => 'storage/secure/tender_documents',
        'enable_virus_scan' => true, // Would need antivirus integration
        'generate_unique_names' => true,
        'organize_by_date' => true,
        'preserve_original' => true
    ];
    
    $options = [
        'document_type' => 'bid_document',
        'tender_id' => 456,
        'user_id' => 789,
        'confidential' => true,
        'path' => 'tender_456/bids'
    ];
    
    try {
        $uploader = fileUploader($config);
        
        // Simulate secure document upload
        $_FILES['bid_document'] = [
            'name' => 'company_bid_proposal.pdf',
            'type' => 'application/pdf',
            'tmp_name' => '/tmp/secure_doc',
            'error' => UPLOAD_ERR_OK,
            'size' => 10485760 // 10MB
        ];
        
        $result = $uploader->uploadFile('bid_document', $options);
        
        if ($result) {
            echo "Secure document uploaded!\n";
            echo "Document ID: {$result['id']}\n";
            echo "Security hash: {$result['hash']}\n";
            echo "Stored securely at: {$result['relative_path']}\n";
            
            // Log security event
            logSecurityEvent('document_upload', [
                'file_id' => $result['id'],
                'user_id' => $options['user_id'],
                'tender_id' => $options['tender_id'],
                'file_hash' => $result['hash']
            ]);
        }
    } catch (Exception $e) {
        echo "Secure upload error: " . $e->getMessage() . "\n";
    }
}

/**
 * Example 6: File Upload with Validation
 */
function validationExample() {
    echo "\n=== File Upload Validation Example ===\n";
    
    $uploader = fileUploader([
        'max_file_size' => 1048576, // 1MB - small limit for demo
        'allowed_types' => ['pdf'],
        'upload_path' => 'public/uploads/validated'
    ]);
    
    // Test various validation scenarios
    $testFiles = [
        [
            'name' => 'valid_document.pdf',
            'type' => 'application/pdf',
            'size' => 512000, // 512KB - within limit
            'error' => UPLOAD_ERR_OK,
            'description' => 'Valid PDF file'
        ],
        [
            'name' => 'too_large.pdf',
            'type' => 'application/pdf',
            'size' => 2097152, // 2MB - exceeds limit
            'error' => UPLOAD_ERR_OK,
            'description' => 'File too large'
        ],
        [
            'name' => 'wrong_type.txt',
            'type' => 'text/plain',
            'size' => 1024,
            'error' => UPLOAD_ERR_OK,
            'description' => 'Wrong file type'
        ],
        [
            'name' => 'upload_error.pdf',
            'type' => 'application/pdf',
            'size' => 0,
            'error' => UPLOAD_ERR_PARTIAL,
            'description' => 'Upload error'
        ]
    ];
    
    foreach ($testFiles as $index => $testFile) {
        echo "\nTesting: {$testFile['description']}\n";
        
        $_FILES['test_file'] = [
            'name' => $testFile['name'],
            'type' => $testFile['type'],
            'tmp_name' => "/tmp/test_file_{$index}",
            'error' => $testFile['error'],
            'size' => $testFile['size']
        ];
        
        try {
            $result = $uploader->uploadFile('test_file');
            if ($result) {
                echo "✓ Upload successful: {$result['filename']}\n";
            } else {
                echo "✗ Upload failed\n";
            }
        } catch (Exception $e) {
            echo "✗ Validation error: " . $e->getMessage() . "\n";
        }
        
        $errors = $uploader->getErrors();
        if (!empty($errors)) {
            foreach ($errors as $error) {
                echo "  Error: {$error}\n";
            }
        }
    }
}

/**
 * Example 7: File Management Operations
 */
function fileManagementExample() {
    echo "\n=== File Management Operations Example ===\n";
    
    $uploader = fileUploader();
    
    // Simulate file upload first
    $_FILES['management_test'] = [
        'name' => 'test_document.pdf',
        'type' => 'application/pdf',
        'tmp_name' => '/tmp/mgmt_test',
        'error' => UPLOAD_ERR_OK,
        'size' => 1024000
    ];
    
    try {
        $result = $uploader->uploadFile('management_test');
        
        if ($result) {
            $fileId = $result['id'];
            echo "File uploaded with ID: {$fileId}\n";
            
            // Demonstrate file deletion
            echo "Attempting to delete file...\n";
            if ($uploader->deleteFile($fileId)) {
                echo "✓ File deleted successfully\n";
            } else {
                echo "✗ File deletion failed\n";
                foreach ($uploader->getErrors() as $error) {
                    echo "  Error: {$error}\n";
                }
            }
        }
    } catch (Exception $e) {
        echo "Management error: " . $e->getMessage() . "\n";
    }
}

/**
 * Example 8: Upload Progress and Chunked Upload Simulation
 */
function uploadProgressExample() {
    echo "\n=== Upload Progress Simulation Example ===\n";
    
    // Simulate large file upload with progress tracking
    $largeFileSize = 50 * 1024 * 1024; // 50MB
    $chunkSize = 1024 * 1024; // 1MB chunks
    $totalChunks = ceil($largeFileSize / $chunkSize);
    
    echo "Simulating upload of {$largeFileSize} byte file in {$totalChunks} chunks...\n";
    
    for ($chunk = 1; $chunk <= $totalChunks; $chunk++) {
        $progress = ($chunk / $totalChunks) * 100;
        $progressBar = str_repeat('█', floor($progress / 5)) . str_repeat('░', 20 - floor($progress / 5));
        
        echo "\rProgress: [{$progressBar}] " . number_format($progress, 1) . "% (Chunk {$chunk}/{$totalChunks})";
        usleep(100000); // Simulate upload delay
    }
    
    echo "\n✓ Large file upload simulation completed!\n";
}

/**
 * Helper function to log security events
 */
function logSecurityEvent($event, $data) {
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'event' => $event,
        'data' => $data,
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
    
    // In real implementation, this would log to database or security log file
    echo "Security event logged: {$event}\n";
}

// Run examples
if (php_sapi_name() === 'cli') {
    echo "Secure File Upload Usage Examples\n";
    echo "==================================\n";
    
    basicUploadExample();
    customConfigUploadExample();
    multipleFileUploadExample();
    imageUploadExample();
    secureDocumentUploadExample();
    validationExample();
    fileManagementExample();
    uploadProgressExample();
    
    echo "\n=== All examples completed ===\n";
    echo "\nNote: These examples use simulated file data.\n";
    echo "In a real application, files would come from actual HTTP uploads.\n";
} else {
    echo "<pre>";
    echo "Secure File Upload Usage Examples\n";
    echo "==================================\n";
    echo "Run this script from command line to see examples in action.\n";
    echo "php " . __FILE__ . "\n";
    echo "\nNote: These examples demonstrate the API but use simulated file data.\n";
    echo "In a web application, integrate with actual file upload forms.\n";
    echo "</pre>";
}