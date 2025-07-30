<?php
/**
 * Global Helper Functions
 * SquidJob Tender Management System
 * 
 * Common utility functions used throughout the application
 */

// Redirect function is defined in auth_helpers.php to avoid duplication

// Back function is defined in auth_helpers.php to avoid duplication

// currentUrl, url, and asset functions are defined in auth_helpers.php to avoid duplication

/**
 * Get uploaded file URL
 */
function uploadUrl($path) {
    return url('uploads/' . ltrim($path, '/'));
}

// e function is defined in auth_helpers.php to avoid duplication

/**
 * Get old input value (for form repopulation)
 */
function old($key, $default = '') {
    return $_SESSION['old_input'][$key] ?? $default;
}

// flash and getFlash functions are defined in auth_helpers.php to avoid duplication

// Authentication functions moved to auth_helpers.php to avoid duplication

// Validate function is defined in auth_helpers.php to avoid duplication

// Sanitize function is defined in auth_helpers.php to avoid duplication

// formatDate function is defined in auth_helpers.php to avoid duplication

/**
 * Format currency
 */
function formatCurrency($amount, $currency = '₹') {
    return $currency . ' ' . number_format($amount, 2);
}

// formatFileSize function is defined in auth_helpers.php to avoid duplication

/**
 * Generate random string
 */
function randomString($length = 10) {
    return bin2hex(random_bytes($length / 2));
}

// Password functions moved to auth_helpers.php to avoid duplication

// logMessage function is defined in auth_helpers.php to avoid duplication

/**
 * Debug dump and die
 */
function dd(...$vars) {
    echo '<pre>';
    foreach ($vars as $var) {
        var_dump($var);
    }
    echo '</pre>';
    die();
}

/**
 * Debug dump
 */
function dump(...$vars) {
    echo '<pre>';
    foreach ($vars as $var) {
        var_dump($var);
    }
    echo '</pre>';
}

/**
 * Get request method
 */
function requestMethod() {
    return $_SERVER['REQUEST_METHOD'];
}

/**
 * Check if request is POST
 */
function isPost() {
    return requestMethod() === 'POST';
}

/**
 * Check if request is GET
 */
function isGet() {
    return requestMethod() === 'GET';
}

/**
 * Check if request is AJAX
 */
function isAjax() {
    return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

/**
 * Return JSON response
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Request function is defined in auth_helpers.php to avoid duplication

// view function is defined in auth_helpers.php to avoid duplication

/**
 * Include partial view
 */
function partial($partial, $data = []) {
    $partialPath = APP_ROOT . '/app/views/partials/' . str_replace('.', '/', $partial) . '.php';
    
    if (!file_exists($partialPath)) {
        throw new Exception("Partial file not found: {$partialPath}");
    }
    
    extract($data);
    include $partialPath;
}

/**
 * Start output buffering and return content
 */
function capture($callback) {
    ob_start();
    $callback();
    return ob_get_clean();
}

/**
 * Abort with HTTP status code
 */
function abort($code = 404, $message = '') {
    http_response_code($code);
    
    if ($message) {
        echo $message;
    } else {
        switch ($code) {
            case 404:
                echo '404 - Page Not Found';
                break;
            case 403:
                echo '403 - Forbidden';
                break;
            case 500:
                echo '500 - Internal Server Error';
                break;
            default:
                echo "HTTP Error {$code}";
        }
    }
    
    exit;
}

/**
 * Get storage path
 */
function storage_path($path = '') {
    return APP_ROOT . '/storage/' . ltrim($path, '/');
}

/**
 * Get app path
 */
function app_path($path = '') {
    return APP_ROOT . '/app/' . ltrim($path, '/');
}

/**
 * Get base path
 */
function base_path($path = '') {
    return APP_ROOT . '/' . ltrim($path, '/');
}

/**
 * Get public path
 */
function public_path($path = '') {
    return APP_ROOT . '/public/' . ltrim($path, '/');
}