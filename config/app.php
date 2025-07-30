<?php
/**
 * Application Configuration
 * SquidJob Tender Management System
 * 
 * Core application settings and service providers
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Application Name
    |--------------------------------------------------------------------------
    */
    'name' => env('APP_NAME', 'SquidJob Tender Management System'),

    /*
    |--------------------------------------------------------------------------
    | Application Environment
    |--------------------------------------------------------------------------
    */
    'env' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Application Debug Mode
    |--------------------------------------------------------------------------
    */
    'debug' => env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Application URL
    |--------------------------------------------------------------------------
    */
    'url' => env('APP_URL', 'http://localhost/squidjob'),

    /*
    |--------------------------------------------------------------------------
    | Application Timezone
    |--------------------------------------------------------------------------
    */
    'timezone' => env('APP_TIMEZONE', 'Asia/Calcutta'),

    /*
    |--------------------------------------------------------------------------
    | Application Locale Configuration
    |--------------------------------------------------------------------------
    */
    'locale' => 'en',
    'fallback_locale' => 'en',
    'faker_locale' => 'en_US',

    /*
    |--------------------------------------------------------------------------
    | Encryption Key
    |--------------------------------------------------------------------------
    */
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',

    /*
    |--------------------------------------------------------------------------
    | Logging Configuration
    |--------------------------------------------------------------------------
    */
    'log_channel' => env('LOG_CHANNEL', 'file'),
    'log_level' => env('LOG_LEVEL', 'debug'),
    'log_path' => env('LOG_PATH', 'storage/logs'),

    /*
    |--------------------------------------------------------------------------
    | Session Configuration
    |--------------------------------------------------------------------------
    */
    'session' => [
        'driver' => env('SESSION_DRIVER', 'file'),
        'lifetime' => env('SESSION_LIFETIME', 1440),
        'expire_on_close' => false,
        'encrypt' => env('SESSION_ENCRYPT', false),
        'files' => storage_path('sessions'),
        'connection' => null,
        'table' => 'sessions',
        'store' => null,
        'lottery' => [2, 100],
        'cookie' => env('SESSION_COOKIE', 'squidjob_session'),
        'path' => env('SESSION_PATH', '/'),
        'domain' => env('SESSION_DOMAIN', null),
        'secure' => env('SESSION_SECURE_COOKIE', false),
        'http_only' => true,
        'same_site' => 'lax',
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    */
    'cache' => [
        'default' => env('CACHE_DRIVER', 'file'),
        'prefix' => env('CACHE_PREFIX', 'squidjob'),
        'stores' => [
            'file' => [
                'driver' => 'file',
                'path' => storage_path('cache'),
            ],
            'redis' => [
                'driver' => 'redis',
                'connection' => 'cache',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Mail Configuration
    |--------------------------------------------------------------------------
    */
    'mail' => [
        'driver' => env('MAIL_DRIVER', 'smtp'),
        'host' => env('MAIL_HOST', 'smtp.gmail.com'),
        'port' => env('MAIL_PORT', 587),
        'from' => [
            'address' => env('MAIL_FROM_ADDRESS', 'noreply@squidjob.com'),
            'name' => env('MAIL_FROM_NAME', 'SquidJob System'),
        ],
        'encryption' => env('MAIL_ENCRYPTION', 'tls'),
        'username' => env('MAIL_USERNAME'),
        'password' => env('MAIL_PASSWORD'),
        'sendmail' => '/usr/sbin/sendmail -bs',
        'markdown' => [
            'theme' => 'default',
            'paths' => [
                resource_path('views/vendor/mail'),
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Configuration
    |--------------------------------------------------------------------------
    */
    'upload' => [
        'max_size' => env('UPLOAD_MAX_SIZE', 52428800), // 50MB
        'allowed_types' => explode(',', env('ALLOWED_FILE_TYPES', 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif,zip')),
        'path' => 'public/uploads',
        'temp_path' => 'storage/temp',
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    */
    'security' => [
        'bcrypt_rounds' => env('BCRYPT_ROUNDS', 12),
        'jwt_secret' => env('JWT_SECRET'),
        'jwt_ttl' => 1440, // 24 hours in minutes
        'password_reset_expire' => 60, // minutes
        'max_login_attempts' => 5,
        'lockout_duration' => 900, // 15 minutes in seconds
    ],

    /*
    |--------------------------------------------------------------------------
    | Third-party Services
    |--------------------------------------------------------------------------
    */
    'services' => [
        'openai' => [
            'api_key' => env('OPENAI_API_KEY'),
            'organization' => env('OPENAI_ORGANIZATION'),
        ],
        'anthropic' => [
            'api_key' => env('ANTHROPIC_API_KEY'),
        ],
        'twilio' => [
            'sid' => env('TWILIO_SID'),
            'token' => env('TWILIO_TOKEN'),
            'from' => env('TWILIO_FROM'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Application Features
    |--------------------------------------------------------------------------
    */
    'features' => [
        'ai_analysis' => env('ENABLE_AI_ANALYSIS', false),
        'email_notifications' => env('ENABLE_EMAIL_NOTIFICATIONS', true),
        'sms_notifications' => env('ENABLE_SMS_NOTIFICATIONS', false),
        'file_compression' => env('ENABLE_FILE_COMPRESSION', true),
        'audit_logging' => env('ENABLE_AUDIT_LOGGING', true),
        'backup_automation' => env('ENABLE_BACKUP_AUTOMATION', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Performance Settings
    |--------------------------------------------------------------------------
    */
    'performance' => [
        'enable_query_log' => env('ENABLE_QUERY_LOG', false),
        'enable_profiling' => env('ENABLE_PROFILING', false),
        'cache_views' => env('CACHE_VIEWS', false),
        'optimize_autoloader' => env('OPTIMIZE_AUTOLOADER', true),
        'memory_limit' => '256M',
        'max_execution_time' => 300,
    ],

    /*
    |--------------------------------------------------------------------------
    | Default User Roles
    |--------------------------------------------------------------------------
    */
    'roles' => [
        'admin' => [
            'id' => 17,
            'name' => 'Admin',
            'description' => 'System Administrator with full access',
        ],
        'tender_manager' => [
            'id' => 18,
            'name' => 'Tender Manager',
            'description' => 'Tender management and oversight',
        ],
        'sales_head' => [
            'id' => 19,
            'name' => 'Sales Head',
            'description' => 'Business development and client relations',
        ],
        'accountant' => [
            'id' => 20,
            'name' => 'Accountant',
            'description' => 'Financial management and reporting',
        ],
        'user' => [
            'id' => 21,
            'name' => 'User',
            'description' => 'Basic tender processing access',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Permissions
    |--------------------------------------------------------------------------
    */
    'permissions' => [
        'users' => ['create_user', 'edit_user', 'delete_user', 'view_users'],
        'tenders' => ['create_tender', 'edit_tender', 'delete_tender', 'view_tenders', 'assign_tender'],
        'documents' => ['upload_document', 'delete_document', 'view_documents', 'download_document'],
        'finance' => ['create_po', 'approve_po', 'view_financials', 'manage_budget'],
        'reports' => ['view_reports', 'export_reports', 'create_reports'],
        'system' => ['system_config', 'view_logs', 'manage_roles', 'backup_system'],
    ],
];

/**
 * Helper function to get configuration values
 */
function config($key = null, $default = null) {
    static $config = null;
    
    if ($config === null) {
        $config = include __DIR__ . '/app.php';
    }
    
    if ($key === null) {
        return $config;
    }
    
    return data_get($config, $key, $default);
}

/**
 * Helper function to get environment values
 */
function env($key, $default = null) {
    $value = $_ENV[$key] ?? getenv($key) ?? $default;
    
    // Convert string booleans to actual booleans
    if (is_string($value)) {
        switch (strtolower($value)) {
            case 'true':
            case '(true)':
                return true;
            case 'false':
            case '(false)':
                return false;
            case 'null':
            case '(null)':
                return null;
            case 'empty':
            case '(empty)':
                return '';
        }
    }
    
    return $value;
}

/**
 * Helper function to get storage path
 */
function storage_path($path = '') {
    return APP_ROOT . '/storage' . ($path ? '/' . ltrim($path, '/') : '');
}

/**
 * Helper function to get resource path
 */
function resource_path($path = '') {
    return APP_ROOT . '/resources' . ($path ? '/' . ltrim($path, '/') : '');
}

/**
 * Helper function to get data from array using dot notation
 */
function data_get($target, $key, $default = null) {
    if (is_null($key)) {
        return $target;
    }
    
    $key = is_array($key) ? $key : explode('.', $key);
    
    foreach ($key as $segment) {
        if (is_array($target) && array_key_exists($segment, $target)) {
            $target = $target[$segment];
        } else {
            return $default;
        }
    }
    
    return $target;
}