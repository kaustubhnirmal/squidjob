<?php
/**
 * Application Bootstrap
 * SquidJob Tender Management System
 * 
 * Initialize the application framework
 */

// Define application root
if (!defined('APP_ROOT')) {
    define('APP_ROOT', dirname(__DIR__));
}

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set timezone
date_default_timezone_set('Asia/Calcutta');

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simple config function
if (!function_exists('config')) {
    function config($key = null, $default = null) {
        static $config = null;
        
        if ($config === null) {
            $config = [
                'app' => [
                    'name' => 'SquidJob Tender Management System',
                    'url' => 'http://localhost/squidjob',
                    'debug' => true,
                    'security' => [
                        'bcrypt_rounds' => 12
                    ]
                ],
                'database' => [
                    'default' => 'mysql',
                    'connections' => [
                        'mysql' => [
                            'driver' => 'mysql',
                            'host' => 'localhost',
                            'port' => '3306',
                            'database' => 'squidjob',
                            'username' => 'root',
                            'password' => '',
                            'charset' => 'utf8mb4',
                            'collation' => 'utf8mb4_unicode_ci',
                            'options' => [
                                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                                PDO::ATTR_EMULATE_PREPARES => false,
                            ]
                        ]
                    ]
                ]
            ];
        }
        
        if ($key === null) {
            return $config;
        }
        
        $keys = explode('.', $key);
        $value = $config;
        foreach ($keys as $k) {
            $value = $value[$k] ?? $default;
        }
        
        return $value;
    }
}

// Database connection function
if (!function_exists('getDbConnection')) {
    function getDbConnection() {
        static $connection = null;
        
        if ($connection === null) {
            $config = config('database.connections.mysql');
            $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}";
            
            try {
                $connection = new PDO($dsn, $config['username'], $config['password'], $config['options']);
            } catch (PDOException $e) {
                throw new PDOException("Could not connect to database: " . $e->getMessage());
            }
        }
        
        return $connection;
    }
}

// Load helper functions
require_once APP_ROOT . '/app/helpers/auth_helpers.php';
require_once APP_ROOT . '/app/helpers/functions.php';

// Autoloader for classes
spl_autoload_register(function ($class) {
    // Convert namespace to file path
    $file = APP_ROOT . '/' . str_replace(['\\', 'App/'], ['/', 'app/'], $class) . '.php';
    
    if (file_exists($file)) {
        require_once $file;
    }
});

// Initialize core services
try {
    // Test database connection
    $dbConnection = getDbConnection();
    
    // Initialize router
    $router = new App\Core\Router();
    
    // Load routes
    require_once APP_ROOT . '/routes/web.php';
    
    return $router;
    
} catch (Exception $e) {
    // Handle bootstrap errors
    error_log("Bootstrap Error: " . $e->getMessage());
    
    if (config('app.debug')) {
        die("Bootstrap Error: " . $e->getMessage());
    } else {
        die("Application initialization failed. Please check the logs.");
    }
}