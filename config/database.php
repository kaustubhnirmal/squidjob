<?php
/**
 * Database Configuration
 * SquidJob Tender Management System
 * 
 * Database connection settings for XAMPP MySQL
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Default Database Connection Name
    |--------------------------------------------------------------------------
    */
    'default' => env('DB_CONNECTION', 'mysql'),

    /*
    |--------------------------------------------------------------------------
    | Database Connections
    |--------------------------------------------------------------------------
    */
    'connections' => [
        'mysql' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', 'localhost'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'squidjob'),
            'username' => env('DB_USERNAME', 'squidj0b'),
            'password' => env('DB_PASSWORD', 'A1b2c3d4'),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'strict' => true,
            'engine' => 'InnoDB',
            'options' => [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET sql_mode='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'"
            ],
        ],

        'testing' => [
            'driver' => 'mysql',
            'host' => env('DB_TEST_HOST', 'localhost'),
            'port' => env('DB_TEST_PORT', '3306'),
            'database' => env('DB_TEST_DATABASE', 'squidjob_test'),
            'username' => env('DB_TEST_USERNAME', 'squidj0b'),
            'password' => env('DB_TEST_PASSWORD', 'A1b2c3d4'),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => 'InnoDB',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Repository Table
    |--------------------------------------------------------------------------
    */
    'migrations' => 'migrations',

    /*
    |--------------------------------------------------------------------------
    | Redis Databases (Optional)
    |--------------------------------------------------------------------------
    */
    'redis' => [
        'client' => env('REDIS_CLIENT', 'phpredis'),
        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', 'squidjob_database_'),
        ],
        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD', null),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],
        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD', null),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
        ],
    ],
];

/**
 * Database Connection Helper Functions
 */

/**
 * Get database connection instance
 */
function getDbConnection($connection = null) {
    static $connections = [];
    
    $connectionName = $connection ?: config('database.default');
    
    if (!isset($connections[$connectionName])) {
        $config = config("database.connections.{$connectionName}");
        
        if (!$config) {
            throw new InvalidArgumentException("Database connection [{$connectionName}] not configured.");
        }
        
        $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}";
        
        try {
            $pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);
            $connections[$connectionName] = $pdo;
        } catch (PDOException $e) {
            throw new PDOException("Could not connect to database: " . $e->getMessage());
        }
    }
    
    return $connections[$connectionName];
}

/**
 * Test database connection
 */
function testDbConnection() {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->query('SELECT 1');
        return $stmt !== false;
    } catch (Exception $e) {
        error_log("Database connection test failed: " . $e->getMessage());
        return false;
    }
}

/**
 * Get database configuration
 */
function getDatabaseConfig($key = null) {
    $config = include __DIR__ . '/database.php';
    
    if ($key) {
        return data_get($config, $key);
    }
    
    return $config;
}