<?php
/**
 * SquidJob Application Entry Point
 * Handles all HTTP requests and routing with enhanced error handling
 */

// Start session
if (session_status() === PHP_SESSION_NONE) {
    if (session_status() === PHP_SESSION_NONE) { session_start(); }
}

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define application root
if (!defined('APP_ROOT')) {
    define('APP_ROOT', dirname(__DIR__));
}

// Set timezone
date_default_timezone_set('Asia/Calcutta');

// Custom error handler
function customErrorHandler($errno, $errstr, $errfile, $errline) {
    $errorType = [
        E_ERROR => 'Fatal Error',
        E_WARNING => 'Warning',
        E_PARSE => 'Parse Error',
        E_NOTICE => 'Notice',
        E_CORE_ERROR => 'Core Error',
        E_CORE_WARNING => 'Core Warning',
        E_COMPILE_ERROR => 'Compile Error',
        E_COMPILE_WARNING => 'Compile Warning',
        E_USER_ERROR => 'User Error',
        E_USER_WARNING => 'User Warning',
        E_USER_NOTICE => 'User Notice',
        E_STRICT => 'Strict',
        E_RECOVERABLE_ERROR => 'Recoverable Error',
        E_DEPRECATED => 'Deprecated',
        E_USER_DEPRECATED => 'User Deprecated',
    ];
    
    $type = $errorType[$errno] ?? 'Unknown Error';
    
    // Log the error
    error_log("PHP {$type}: {$errstr} in {$errfile} on line {$errline}");
    
    // Show error in development
    if (config('app.debug')) {
        echo "<div style='background: #fef2f2; border: 1px solid #fecaca; padding: 1rem; margin: 1rem; border-radius: 0.375rem;'>";
        echo "<h3 style='color: #dc2626; margin: 0 0 0.5rem 0;'>PHP {$type}</h3>";
        echo "<p style='margin: 0 0 0.5rem 0;'><strong>Message:</strong> " . htmlspecialchars($errstr) . "</p>";
        echo "<p style='margin: 0 0 0.5rem 0;'><strong>File:</strong> " . htmlspecialchars($errfile) . "</p>";
        echo "<p style='margin: 0;'><strong>Line:</strong> " . htmlspecialchars($errline) . "</p>";
        echo "</div>";
    }
    
    return true;
}

// Set custom error handler
set_error_handler('customErrorHandler');

// Custom exception handler
function customExceptionHandler($exception) {
    // Log the exception
    error_log("Uncaught Exception: " . $exception->getMessage() . " in " . $exception->getFile() . " on line " . $exception->getLine());
    
    // Show error page
    http_response_code(500);
    
    if (config('app.debug')) {
        echo "<!DOCTYPE html>";
        echo "<html lang='en'>";
        echo "<head>";
        echo "<meta charset='UTF-8'>";
        echo "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
        echo "<title>Application Error - SquidJob</title>";
        echo "<style>";
        echo "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }";
        echo ".error-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }";
        echo ".error-header { background: #dc2626; color: white; padding: 1.5rem; }";
        echo ".error-header h1 { margin: 0; font-size: 1.5rem; }";
        echo ".error-body { padding: 1.5rem; }";
        echo ".error-details { background: #fef2f2; border: 1px solid #fecaca; padding: 1rem; border-radius: 0.375rem; margin-top: 1rem; }";
        echo ".error-details pre { margin: 0; font-family: monospace; font-size: 0.875rem; overflow-x: auto; }";
        echo ".error-actions { margin-top: 1.5rem; }";
        echo ".btn { display: inline-block; padding: 0.5rem 1rem; background: #7c3aed; color: white; text-decoration: none; border-radius: 0.375rem; margin-right: 0.5rem; }";
        echo ".btn:hover { background: #6d28d9; }";
        echo "</style>";
        echo "</head>";
        echo "<body>";
        echo "<div class='error-container'>";
        echo "<div class='error-header'>";
        echo "<h1>🚨 Application Error</h1>";
        echo "</div>";
        echo "<div class='error-body'>";
        echo "<h2>An error occurred while processing your request</h2>";
        echo "<div class='error-details'>";
        echo "<p><strong>Error:</strong> " . htmlspecialchars($exception->getMessage()) . "</p>";
        echo "<p><strong>File:</strong> " . htmlspecialchars($exception->getFile()) . "</p>";
        echo "<p><strong>Line:</strong> " . htmlspecialchars($exception->getLine()) . "</p>";
        echo "<h3>Stack Trace:</h3>";
        echo "<pre>" . htmlspecialchars($exception->getTraceAsString()) . "</pre>";
        echo "</div>";
        echo "<div class='error-actions'>";
        echo "<a href='/squidjob/login_test.php' class='btn'>Run Diagnostics</a>";
        echo "<a href='/squidjob/public/' class='btn'>Go Home</a>";
        echo "</div>";
        echo "</div>";
        echo "</div>";
        echo "</body>";
        echo "</html>";
    } else {
        echo "<!DOCTYPE html>";
        echo "<html lang='en'>";
        echo "<head>";
        echo "<meta charset='UTF-8'>";
        echo "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
        echo "<title>Server Error - SquidJob</title>";
        echo "<style>";
        echo "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }";
        echo ".error-container { background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 2rem; text-align: center; max-width: 500px; }";
        echo ".error-icon { font-size: 4rem; margin-bottom: 1rem; }";
        echo ".error-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; color: #374151; }";
        echo ".error-message { color: #6b7280; margin-bottom: 1.5rem; }";
        echo ".btn { display: inline-block; padding: 0.75rem 1.5rem; background: #7c3aed; color: white; text-decoration: none; border-radius: 0.375rem; }";
        echo ".btn:hover { background: #6d28d9; }";
        echo "</style>";
        echo "</head>";
        echo "<body>";
        echo "<div class='error-container'>";
        echo "<div class='error-icon'>⚠️</div>";
        echo "<h1 class='error-title'>500 - Internal Server Error</h1>";
        echo "<p class='error-message'>Something went wrong on our end. Please try again later.</p>";
        echo "<a href='/squidjob/public/' class='btn'>Go Home</a>";
        echo "</div>";
        echo "</body>";
        echo "</html>";
    }
    
    exit;
}

// Set custom exception handler
set_exception_handler('customExceptionHandler');

// Bootstrap the application
try {
    $router = require_once APP_ROOT . '/bootstrap/app.php';
} catch (Exception $e) {
    // Handle bootstrap errors
    customExceptionHandler($e);
}

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove script name from URI if present
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
if ($scriptName !== '/') {
    $uri = substr($uri, strlen($scriptName));
}

// Ensure URI starts with /
$uri = '/' . ltrim($uri, '/');

// Handle the request
try {
    $router->dispatch($method, $uri);
} catch (Exception $e) {
    // Log the error
    error_log("Routing Error: " . $e->getMessage());
    
    // Show error page
    customExceptionHandler($e);
}