<?php
/**
 * SecurityValidator
 * SquidJob Tender Management System
 * 
 * Comprehensive security validation and protection utility
 * Handles input validation, CSRF protection, XSS prevention, and access control
 */

class SecurityValidator
{
    private $csrfTokenName;
    private $csrfTokenExpiry;
    private $maxInputLength;
    private $allowedHtmlTags;
    private $rateLimitConfig;
    
    public function __construct($config = [])
    {
        $this->csrfTokenName = $config['csrf_token_name'] ?? '_token';
        $this->csrfTokenExpiry = $config['csrf_token_expiry'] ?? 3600; // 1 hour
        $this->maxInputLength = $config['max_input_length'] ?? 10000;
        $this->allowedHtmlTags = $config['allowed_html_tags'] ?? '<p><br><strong><em><ul><ol><li>';
        $this->rateLimitConfig = $config['rate_limit'] ?? [
            'max_requests' => 100,
            'time_window' => 3600 // 1 hour
        ];
        
        // Start session if not already started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
    
    /**
     * Generate CSRF token
     */
    public function generateCsrfToken()
    {
        $token = bin2hex(random_bytes(32));
        $expiry = time() + $this->csrfTokenExpiry;
        
        $_SESSION['csrf_tokens'][$token] = $expiry;
        
        // Clean up expired tokens
        $this->cleanupExpiredTokens();
        
        return $token;
    }
    
    /**
     * Validate CSRF token
     */
    public function validateCsrfToken($token = null)
    {
        if ($token === null) {
            $token = $_POST[$this->csrfTokenName] ?? $_GET[$this->csrfTokenName] ?? null;
        }
        
        if (!$token) {
            return false;
        }
        
        if (!isset($_SESSION['csrf_tokens'][$token])) {
            return false;
        }
        
        $expiry = $_SESSION['csrf_tokens'][$token];
        if (time() > $expiry) {
            unset($_SESSION['csrf_tokens'][$token]);
            return false;
        }
        
        // Token is valid, remove it (one-time use)
        unset($_SESSION['csrf_tokens'][$token]);
        return true;
    }
    
    /**
     * Generate CSRF field for forms
     */
    public function getCsrfField()
    {
        $token = $this->generateCsrfToken();
        return '<input type="hidden" name="' . $this->csrfTokenName . '" value="' . $token . '">';
    }
    
    /**
     * Sanitize input data
     */
    public function sanitizeInput($input, $options = [])
    {
        if (is_array($input)) {
            return array_map(function($item) use ($options) {
                return $this->sanitizeInput($item, $options);
            }, $input);
        }
        
        if (!is_string($input)) {
            return $input;
        }
        
        // Check input length
        if (strlen($input) > $this->maxInputLength) {
            throw new InvalidArgumentException('Input exceeds maximum allowed length');
        }
        
        // Remove null bytes
        $input = str_replace("\0", '', $input);
        
        // Sanitize based on type
        $type = $options['type'] ?? 'string';
        
        switch ($type) {
            case 'email':
                return filter_var($input, FILTER_SANITIZE_EMAIL);
                
            case 'url':
                return filter_var($input, FILTER_SANITIZE_URL);
                
            case 'int':
                return filter_var($input, FILTER_SANITIZE_NUMBER_INT);
                
            case 'float':
                return filter_var($input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
                
            case 'html':
                return strip_tags($input, $this->allowedHtmlTags);
                
            case 'plain':
                return strip_tags($input);
                
            case 'filename':
                return $this->sanitizeFilename($input);
                
            case 'sql':
                return $this->escapeSqlInput($input);
                
            default:
                return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
        }
    }
    
    /**
     * Validate input data
     */
    public function validateInput($input, $rules)
    {
        $errors = [];
        
        foreach ($rules as $field => $fieldRules) {
            $value = $input[$field] ?? null;
            $fieldErrors = [];
            
            foreach ($fieldRules as $rule => $ruleValue) {
                switch ($rule) {
                    case 'required':
                        if ($ruleValue && ($value === null || $value === '')) {
                            $fieldErrors[] = ucfirst($field) . ' is required';
                        }
                        break;
                        
                    case 'min_length':
                        if ($value !== null && strlen($value) < $ruleValue) {
                            $fieldErrors[] = ucfirst($field) . ' must be at least ' . $ruleValue . ' characters';
                        }
                        break;
                        
                    case 'max_length':
                        if ($value !== null && strlen($value) > $ruleValue) {
                            $fieldErrors[] = ucfirst($field) . ' must not exceed ' . $ruleValue . ' characters';
                        }
                        break;
                        
                    case 'email':
                        if ($value !== null && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            $fieldErrors[] = ucfirst($field) . ' must be a valid email address';
                        }
                        break;
                        
                    case 'url':
                        if ($value !== null && !filter_var($value, FILTER_VALIDATE_URL)) {
                            $fieldErrors[] = ucfirst($field) . ' must be a valid URL';
                        }
                        break;
                        
                    case 'numeric':
                        if ($value !== null && !is_numeric($value)) {
                            $fieldErrors[] = ucfirst($field) . ' must be numeric';
                        }
                        break;
                        
                    case 'integer':
                        if ($value !== null && !filter_var($value, FILTER_VALIDATE_INT)) {
                            $fieldErrors[] = ucfirst($field) . ' must be an integer';
                        }
                        break;
                        
                    case 'min_value':
                        if ($value !== null && is_numeric($value) && $value < $ruleValue) {
                            $fieldErrors[] = ucfirst($field) . ' must be at least ' . $ruleValue;
                        }
                        break;
                        
                    case 'max_value':
                        if ($value !== null && is_numeric($value) && $value > $ruleValue) {
                            $fieldErrors[] = ucfirst($field) . ' must not exceed ' . $ruleValue;
                        }
                        break;
                        
                    case 'regex':
                        if ($value !== null && !preg_match($ruleValue, $value)) {
                            $fieldErrors[] = ucfirst($field) . ' format is invalid';
                        }
                        break;
                        
                    case 'in':
                        if ($value !== null && !in_array($value, $ruleValue)) {
                            $fieldErrors[] = ucfirst($field) . ' must be one of: ' . implode(', ', $ruleValue);
                        }
                        break;
                        
                    case 'date':
                        if ($value !== null && !$this->validateDate($value)) {
                            $fieldErrors[] = ucfirst($field) . ' must be a valid date';
                        }
                        break;
                        
                    case 'datetime':
                        if ($value !== null && !$this->validateDateTime($value)) {
                            $fieldErrors[] = ucfirst($field) . ' must be a valid datetime';
                        }
                        break;
                        
                    case 'future_date':
                        if ($value !== null && strtotime($value) <= time()) {
                            $fieldErrors[] = ucfirst($field) . ' must be a future date';
                        }
                        break;
                        
                    case 'past_date':
                        if ($value !== null && strtotime($value) >= time()) {
                            $fieldErrors[] = ucfirst($field) . ' must be a past date';
                        }
                        break;
                }
            }
            
            if (!empty($fieldErrors)) {
                $errors[$field] = $fieldErrors;
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Check rate limiting
     */
    public function checkRateLimit($identifier, $action = 'default')
    {
        $key = 'rate_limit_' . $action . '_' . $identifier;
        $currentTime = time();
        $timeWindow = $this->rateLimitConfig['time_window'];
        $maxRequests = $this->rateLimitConfig['max_requests'];
        
        // Get current requests from session/cache
        $requests = $_SESSION[$key] ?? [];
        
        // Remove old requests outside time window
        $requests = array_filter($requests, function($timestamp) use ($currentTime, $timeWindow) {
            return ($currentTime - $timestamp) < $timeWindow;
        });
        
        // Check if limit exceeded
        if (count($requests) >= $maxRequests) {
            return [
                'allowed' => false,
                'remaining' => 0,
                'reset_time' => min($requests) + $timeWindow
            ];
        }
        
        // Add current request
        $requests[] = $currentTime;
        $_SESSION[$key] = $requests;
        
        return [
            'allowed' => true,
            'remaining' => $maxRequests - count($requests),
            'reset_time' => $currentTime + $timeWindow
        ];
    }
    
    /**
     * Validate user permissions
     */
    public function validatePermission($userId, $permission, $resourceId = null)
    {
        // This would integrate with your user permission system
        // For now, return a basic implementation
        
        if (!$userId) {
            return false;
        }
        
        // Check if user has the required permission
        // This should query your user_permissions or roles table
        return $this->userHasPermission($userId, $permission, $resourceId);
    }
    
    /**
     * Validate tender access permissions
     */
    public function validateTenderAccess($userId, $tenderId, $action = 'view')
    {
        // Check if user can perform the action on the tender
        switch ($action) {
            case 'view':
                return $this->canViewTender($userId, $tenderId);
            case 'edit':
                return $this->canEditTender($userId, $tenderId);
            case 'delete':
                return $this->canDeleteTender($userId, $tenderId);
            case 'bid':
                return $this->canBidOnTender($userId, $tenderId);
            default:
                return false;
        }
    }
    
    /**
     * Validate bid access permissions
     */
    public function validateBidAccess($userId, $bidId, $action = 'view')
    {
        // Check if user can perform the action on the bid
        switch ($action) {
            case 'view':
                return $this->canViewBid($userId, $bidId);
            case 'edit':
                return $this->canEditBid($userId, $bidId);
            case 'delete':
                return $this->canDeleteBid($userId, $bidId);
            case 'evaluate':
                return $this->canEvaluateBid($userId, $bidId);
            default:
                return false;
        }
    }
    
    /**
     * Prevent XSS attacks
     */
    public function preventXSS($input)
    {
        if (is_array($input)) {
            return array_map([$this, 'preventXSS'], $input);
        }
        
        if (!is_string($input)) {
            return $input;
        }
        
        // Remove dangerous HTML tags and attributes
        $input = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi', '', $input);
        $input = preg_replace('/javascript:/i', '', $input);
        $input = preg_replace('/on\w+\s*=/i', '', $input);
        
        return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Prevent SQL injection
     */
    public function preventSQLInjection($input)
    {
        if (is_array($input)) {
            return array_map([$this, 'preventSQLInjection'], $input);
        }
        
        if (!is_string($input)) {
            return $input;
        }
        
        // Remove SQL injection patterns
        $patterns = [
            '/(\s*(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+)/i',
            '/(\s*(or|and)\s+\d+\s*=\s*\d+)/i',
            '/(\s*;\s*)/i',
            '/(--|\#|\/\*|\*\/)/i'
        ];
        
        foreach ($patterns as $pattern) {
            $input = preg_replace($pattern, '', $input);
        }
        
        return $input;
    }
    
    /**
     * Validate file upload security
     */
    public function validateFileUpload($file)
    {
        $errors = [];
        
        // Check file size
        $maxSize = 50 * 1024 * 1024; // 50MB
        if ($file['size'] > $maxSize) {
            $errors[] = 'File size exceeds maximum allowed size';
        }
        
        // Check file type
        $allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'];
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($fileExtension, $allowedTypes)) {
            $errors[] = 'File type not allowed';
        }
        
        // Check for executable files
        $executableExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js'];
        if (in_array($fileExtension, $executableExtensions)) {
            $errors[] = 'Executable files are not allowed';
        }
        
        // Check filename for malicious patterns
        if (preg_match('/[<>:"|?*\\\\\/]/', $file['name'])) {
            $errors[] = 'Filename contains invalid characters';
        }
        
        // Validate MIME type
        if (isset($file['tmp_name']) && is_uploaded_file($file['tmp_name'])) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            
            $allowedMimeTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'image/jpeg',
                'image/png',
                'application/zip'
            ];
            
            if (!in_array($mimeType, $allowedMimeTypes)) {
                $errors[] = 'File content does not match allowed types';
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Log security events
     */
    public function logSecurityEvent($event, $details = [])
    {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'event' => $event,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'user_id' => $_SESSION['user_id'] ?? null,
            'details' => $details
        ];
        
        // Log to file or database
        $this->writeSecurityLog($logEntry);
    }
    
    /**
     * Generate secure password
     */
    public function generateSecurePassword($length = 12)
    {
        $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        $password = '';
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $characters[random_int(0, strlen($characters) - 1)];
        }
        
        return $password;
    }
    
    /**
     * Hash password securely
     */
    public function hashPassword($password)
    {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536, // 64 MB
            'time_cost' => 4,       // 4 iterations
            'threads' => 3,         // 3 threads
        ]);
    }
    
    /**
     * Verify password
     */
    public function verifyPassword($password, $hash)
    {
        return password_verify($password, $hash);
    }
    
    // Private helper methods
    
    private function cleanupExpiredTokens()
    {
        if (!isset($_SESSION['csrf_tokens'])) {
            return;
        }
        
        $currentTime = time();
        foreach ($_SESSION['csrf_tokens'] as $token => $expiry) {
            if ($currentTime > $expiry) {
                unset($_SESSION['csrf_tokens'][$token]);
            }
        }
    }
    
    private function sanitizeFilename($filename)
    {
        // Remove path traversal attempts
        $filename = basename($filename);
        
        // Remove dangerous characters
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
        
        // Limit length
        $filename = substr($filename, 0, 255);
        
        return $filename;
    }
    
    private function escapeSqlInput($input)
    {
        // This should use your database connection's escape method
        // For PDO, you should use prepared statements instead
        return addslashes($input);
    }
    
    private function validateDate($date)
    {
        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
    
    private function validateDateTime($datetime)
    {
        $d = DateTime::createFromFormat('Y-m-d H:i:s', $datetime);
        return $d && $d->format('Y-m-d H:i:s') === $datetime;
    }
    
    private function userHasPermission($userId, $permission, $resourceId = null)
    {
        // Implement your permission checking logic here
        // This should query your database for user permissions
        return true; // Placeholder
    }
    
    private function canViewTender($userId, $tenderId)
    {
        // Implement tender view permission logic
        return true; // Placeholder
    }
    
    private function canEditTender($userId, $tenderId)
    {
        // Implement tender edit permission logic
        return true; // Placeholder
    }
    
    private function canDeleteTender($userId, $tenderId)
    {
        // Implement tender delete permission logic
        return true; // Placeholder
    }
    
    private function canBidOnTender($userId, $tenderId)
    {
        // Implement bid permission logic
        return true; // Placeholder
    }
    
    private function canViewBid($userId, $bidId)
    {
        // Implement bid view permission logic
        return true; // Placeholder
    }
    
    private function canEditBid($userId, $bidId)
    {
        // Implement bid edit permission logic
        return true; // Placeholder
    }
    
    private function canDeleteBid($userId, $bidId)
    {
        // Implement bid delete permission logic
        return true; // Placeholder
    }
    
    private function canEvaluateBid($userId, $bidId)
    {
        // Implement bid evaluation permission logic
        return true; // Placeholder
    }
    
    private function writeSecurityLog($logEntry)
    {
        $logFile = __DIR__ . '/../../logs/security.log';
        $logDir = dirname($logFile);
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $logLine = json_encode($logEntry) . PHP_EOL;
        file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
    }
}