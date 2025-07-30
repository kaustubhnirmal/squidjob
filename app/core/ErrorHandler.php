<?php
/**
 * Error Handler
 * SquidJob Tender Management System
 * 
 * Handles application errors and exceptions
 */

namespace App\Core;

class ErrorHandler {
    
    /**
     * Register error handlers
     */
    public static function register() {
        // Set error handler
        set_error_handler([self::class, 'handleError']);
        
        // Set exception handler
        set_exception_handler([self::class, 'handleException']);
        
        // Set shutdown handler for fatal errors
        register_shutdown_function([self::class, 'handleShutdown']);
        
        // Configure error reporting based on environment
        if (config('app.debug')) {
            error_reporting(E_ALL);
            ini_set('display_errors', 1);
        } else {
            error_reporting(0);
            ini_set('display_errors', 0);
        }
    }
    
    /**
     * Handle PHP errors
     */
    public static function handleError($severity, $message, $file, $line) {
        if (!(error_reporting() & $severity)) {
            return false;
        }
        
        $error = [
            'type' => 'PHP Error',
            'severity' => self::getSeverityName($severity),
            'message' => $message,
            'file' => $file,
            'line' => $line,
            'timestamp' => date('Y-m-d H:i:s'),
            'url' => $_SERVER['REQUEST_URI'] ?? 'CLI',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'CLI',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'CLI'
        ];
        
        self::logError($error);
        
        if (config('app.debug')) {
            self::displayError($error);
        }
        
        return true;
    }
    
    /**
     * Handle uncaught exceptions
     */
    public static function handleException($exception) {
        $error = [
            'type' => 'Uncaught Exception',
            'class' => get_class($exception),
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
            'timestamp' => date('Y-m-d H:i:s'),
            'url' => $_SERVER['REQUEST_URI'] ?? 'CLI',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'CLI',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'CLI'
        ];
        
        self::logError($error);
        
        if (config('app.debug')) {
            self::displayError($error);
        } else {
            self::displayGenericError();
        }
    }
    
    /**
     * Handle fatal errors
     */
    public static function handleShutdown() {
        $error = error_get_last();
        
        if ($error && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
            $errorData = [
                'type' => 'Fatal Error',
                'severity' => self::getSeverityName($error['type']),
                'message' => $error['message'],
                'file' => $error['file'],
                'line' => $error['line'],
                'timestamp' => date('Y-m-d H:i:s'),
                'url' => $_SERVER['REQUEST_URI'] ?? 'CLI',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'CLI',
                'ip' => $_SERVER['REMOTE_ADDR'] ?? 'CLI'
            ];
            
            self::logError($errorData);
            
            if (config('app.debug')) {
                self::displayError($errorData);
            } else {
                self::displayGenericError();
            }
        }
    }
    
    /**
     * Log error to file
     */
    private static function logError($error) {
        $logPath = storage_path('logs');
        if (!is_dir($logPath)) {
            mkdir($logPath, 0755, true);
        }
        
        $logFile = $logPath . '/error-' . date('Y-m-d') . '.log';
        
        $logEntry = sprintf(
            "[%s] %s: %s in %s:%d\n",
            $error['timestamp'],
            $error['type'],
            $error['message'],
            $error['file'],
            $error['line']
        );
        
        if (isset($error['trace'])) {
            $logEntry .= "Stack trace:\n" . $error['trace'] . "\n";
        }
        
        $logEntry .= "URL: " . $error['url'] . "\n";
        $logEntry .= "User Agent: " . $error['user_agent'] . "\n";
        $logEntry .= "IP: " . $error['ip'] . "\n";
        $logEntry .= str_repeat('-', 80) . "\n";
        
        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Display error for debugging
     */
    private static function displayError($error) {
        if (self::isAjaxRequest()) {
            header('Content-Type: application/json');
            echo json_encode([
                'error' => true,
                'message' => $error['message'],
                'file' => $error['file'],
                'line' => $error['line'],
                'type' => $error['type']
            ]);
        } else {
            http_response_code(500);
            include self::getErrorTemplate($error);
        }
        exit;
    }
    
    /**
     * Display generic error page
     */
    private static function displayGenericError() {
        if (self::isAjaxRequest()) {
            header('Content-Type: application/json');
            echo json_encode([
                'error' => true,
                'message' => 'An internal server error occurred'
            ]);
        } else {
            http_response_code(500);
            
            $errorPage = APP_ROOT . '/app/views/errors/500.php';
            if (file_exists($errorPage)) {
                include $errorPage;
            } else {
                echo '<h1>500 - Internal Server Error</h1>';
                echo '<p>Something went wrong. Please try again later.</p>';
            }
        }
        exit;
    }
    
    /**
     * Get error template
     */
    private static function getErrorTemplate($error) {
        ob_start();
        ?>
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error - SquidJob</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .error-container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .error-header { color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px; margin-bottom: 20px; }
                .error-message { background: #fdf2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 4px; margin: 15px 0; }
                .error-details { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 4px; margin: 15px 0; }
                .error-trace { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: monospace; font-size: 12px; line-height: 1.4; }
                .error-meta { color: #6c757d; font-size: 14px; margin-top: 20px; }
                pre { margin: 0; white-space: pre-wrap; }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-header">
                    <h1><?= htmlspecialchars($error['type']) ?></h1>
                </div>
                
                <div class="error-message">
                    <strong>Message:</strong> <?= htmlspecialchars($error['message']) ?>
                </div>
                
                <div class="error-details">
                    <strong>File:</strong> <?= htmlspecialchars($error['file']) ?><br>
                    <strong>Line:</strong> <?= htmlspecialchars($error['line']) ?>
                </div>
                
                <?php if (isset($error['trace'])): ?>
                <div class="error-trace">
                    <strong>Stack Trace:</strong><br>
                    <pre><?= htmlspecialchars($error['trace']) ?></pre>
                </div>
                <?php endif; ?>
                
                <div class="error-meta">
                    <strong>Time:</strong> <?= htmlspecialchars($error['timestamp']) ?><br>
                    <strong>URL:</strong> <?= htmlspecialchars($error['url']) ?><br>
                    <strong>IP:</strong> <?= htmlspecialchars($error['ip']) ?>
                </div>
            </div>
        </body>
        </html>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Get severity name
     */
    private static function getSeverityName($severity) {
        $severities = [
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
            E_STRICT => 'Strict Standards',
            E_RECOVERABLE_ERROR => 'Recoverable Error',
            E_DEPRECATED => 'Deprecated',
            E_USER_DEPRECATED => 'User Deprecated'
        ];
        
        return $severities[$severity] ?? 'Unknown Error';
    }
    
    /**
     * Check if request is AJAX
     */
    private static function isAjaxRequest() {
        return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
               strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }
}

// Register error handlers
ErrorHandler::register();