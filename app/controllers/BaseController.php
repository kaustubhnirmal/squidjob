<?php
/**
 * Base Controller
 * SquidJob Tender Management System
 * 
 * Base controller class that all other controllers extend
 */

namespace App\Controllers;

abstract class BaseController {
    
    protected $data = [];
    protected $user = null;
    protected $permissions = [];
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->initialize();
    }
    
    /**
     * Initialize controller
     */
    protected function initialize() {
        // Set current user if authenticated
        if (auth()) {
            $this->user = user();
            $this->data['user'] = $this->user;
            $this->data['permissions'] = $this->getUserPermissions();
        }
        
        // Set common data
        $this->data['app_name'] = config('app.name');
        $this->data['app_url'] = config('app.url');
        $this->data['csrf_token'] = csrfToken();
        
        // Set flash messages
        $this->data['flash'] = [
            'success' => getFlash('success'),
            'error' => getFlash('error'),
            'warning' => getFlash('warning'),
            'info' => getFlash('info')
        ];
    }
    
    /**
     * Render view
     */
    protected function view($view, $data = []) {
        $viewData = array_merge($this->data, $data);
        view($view, $viewData);
    }
    
    /**
     * Render JSON response
     */
    protected function json($data, $statusCode = 200) {
        jsonResponse($data, $statusCode);
    }
    
    /**
     * Redirect to URL
     */
    protected function redirect($url, $statusCode = 302) {
        redirect($url, $statusCode);
    }
    
    /**
     * Redirect back
     */
    protected function back() {
        back();
    }
    
    /**
     * Validate request data
     */
    protected function validate($data, $rules) {
        $errors = validate($data, $rules);
        
        if (!empty($errors)) {
            $_SESSION['validation_errors'] = $errors;
            $_SESSION['old_input'] = $data;
            
            if (isAjax()) {
                $this->json(['errors' => $errors], 422);
            } else {
                flash('error', 'Please correct the errors below.');
                $this->back();
            }
        }
        
        return $data;
    }
    
    /**
     * Check if user is authenticated
     */
    protected function requireAuth() {
        if (!auth()) {
            if (isAjax()) {
                $this->json(['error' => 'Authentication required'], 401);
            } else {
                flash('error', 'Please login to continue.');
                redirect('/login');
            }
        }
    }
    
    /**
     * Check if user has permission
     */
    protected function requirePermission($permission) {
        $this->requireAuth();
        
        if (!can($permission)) {
            if (isAjax()) {
                $this->json(['error' => 'Insufficient permissions'], 403);
            } else {
                flash('error', 'You do not have permission to perform this action.');
                redirect('/dashboard');
            }
        }
    }
    
    /**
     * Check if user has role
     */
    protected function requireRole($role) {
        $this->requireAuth();
        
        if (!hasRole($role)) {
            if (isAjax()) {
                $this->json(['error' => 'Insufficient role'], 403);
            } else {
                flash('error', 'You do not have the required role to access this resource.');
                redirect('/dashboard');
            }
        }
    }
    
    /**
     * Get user permissions
     */
    protected function getUserPermissions() {
        if (!$this->user) {
            return [];
        }
        
        // This would typically fetch from database
        // For now, return empty array
        return [];
    }
    
    /**
     * Handle file upload
     */
    protected function handleFileUpload($fileKey, $allowedTypes = null, $maxSize = null) {
        if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
            return null;
        }
        
        $file = $_FILES[$fileKey];
        $allowedTypes = $allowedTypes ?: config('app.upload.allowed_types');
        $maxSize = $maxSize ?: config('app.upload.max_size');
        
        // Validate file type
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $allowedTypes)) {
            throw new \Exception('File type not allowed');
        }
        
        // Validate file size
        if ($file['size'] > $maxSize) {
            throw new \Exception('File size exceeds limit');
        }
        
        // Generate unique filename
        $filename = time() . '_' . randomString(10) . '.' . $extension;
        $uploadPath = UPLOAD_PATH . '/' . date('Y/m');
        
        // Create directory if not exists
        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }
        
        $filePath = $uploadPath . '/' . $filename;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new \Exception('Failed to upload file');
        }
        
        return [
            'original_name' => $file['name'],
            'filename' => $filename,
            'file_path' => str_replace(APP_ROOT . '/public/', '', $filePath),
            'file_size' => $file['size'],
            'mime_type' => $file['type']
        ];
    }
    
    /**
     * Paginate results
     */
    protected function paginate($query, $page = 1, $perPage = 20) {
        $page = max(1, (int)$page);
        $offset = ($page - 1) * $perPage;
        
        // This is a simplified pagination
        // In a real application, you'd use a proper query builder
        return [
            'data' => array_slice($query, $offset, $perPage),
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => count($query),
            'last_page' => ceil(count($query) / $perPage)
        ];
    }
    
    /**
     * Log user activity
     */
    protected function logActivity($action, $description = '', $relatedId = null, $relatedType = null) {
        if (!$this->user) {
            return;
        }
        
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO audit_logs (
                    table_name, record_id, action, description, user_id, 
                    ip_address, user_agent, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $relatedType ?: 'general',
                $relatedId ?: 0,
                $action,
                $description,
                $this->user['id'],
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ]);
        } catch (\Exception $e) {
            // Log error but don't break the application
            error_log("Failed to log activity: " . $e->getMessage());
        }
    }
    
    /**
     * Send notification
     */
    protected function sendNotification($userId, $title, $message, $type = 'info', $relatedType = null, $relatedId = null) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO notifications (
                    user_id, title, message, notification_type, 
                    related_object_type, related_object_id, created_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $userId,
                $title,
                $message,
                $type,
                $relatedType,
                $relatedId,
                $this->user['id'] ?? 1
            ]);
        } catch (\Exception $e) {
            error_log("Failed to send notification: " . $e->getMessage());
        }
    }
    
    /**
     * Get request input
     */
    protected function input($key = null, $default = null) {
        return request($key, $default);
    }
    
    /**
     * Check CSRF token
     */
    protected function verifyCsrfToken() {
        $token = $this->input('_token');
        
        if (!$token || !verifyCsrf($token)) {
            if (isAjax()) {
                $this->json(['error' => 'CSRF token mismatch'], 419);
            } else {
                flash('error', 'Security token mismatch. Please try again.');
                $this->back();
            }
        }
    }
    
    /**
     * Set page title
     */
    protected function setTitle($title) {
        $this->data['page_title'] = $title;
    }
    
    /**
     * Add breadcrumb
     */
    protected function addBreadcrumb($title, $url = null) {
        if (!isset($this->data['breadcrumbs'])) {
            $this->data['breadcrumbs'] = [];
        }
        
        $this->data['breadcrumbs'][] = [
            'title' => $title,
            'url' => $url
        ];
    }
    
    /**
     * Set meta description
     */
    protected function setMetaDescription($description) {
        $this->data['meta_description'] = $description;
    }
    
    /**
     * Add CSS file
     */
    protected function addCss($file) {
        if (!isset($this->data['css_files'])) {
            $this->data['css_files'] = [];
        }
        
        $this->data['css_files'][] = $file;
    }
    
    /**
     * Add JavaScript file
     */
    protected function addJs($file) {
        if (!isset($this->data['js_files'])) {
            $this->data['js_files'] = [];
        }
        
        $this->data['js_files'][] = $file;
    }
}