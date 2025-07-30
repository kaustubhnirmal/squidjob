<?php
/**
 * CDN Configuration
 * SquidJob Tender Management System
 * 
 * Configuration for Content Delivery Network integration
 * Supports multiple CDN providers and asset optimization
 */

return [
    
    /*
    |--------------------------------------------------------------------------
    | CDN Enabled
    |--------------------------------------------------------------------------
    |
    | Enable or disable CDN functionality globally
    |
    */
    'enabled' => env('CDN_ENABLED', false),
    
    /*
    |--------------------------------------------------------------------------
    | Default CDN Provider
    |--------------------------------------------------------------------------
    |
    | The default CDN provider to use for asset delivery
    | Supported: "local", "cloudflare", "cloudfront", "maxcdn", "custom"
    |
    */
    'default_provider' => env('CDN_DEFAULT_PROVIDER', 'local'),
    
    /*
    |--------------------------------------------------------------------------
    | Fallback Settings
    |--------------------------------------------------------------------------
    |
    | Enable fallback to local assets if CDN fails
    |
    */
    'fallback_enabled' => env('CDN_FALLBACK_ENABLED', true),
    
    /*
    |--------------------------------------------------------------------------
    | Cache Settings
    |--------------------------------------------------------------------------
    |
    | Asset URL caching configuration
    |
    */
    'cache_enabled' => env('CDN_CACHE_ENABLED', true),
    'cache_ttl' => env('CDN_CACHE_TTL', 3600), // 1 hour
    
    /*
    |--------------------------------------------------------------------------
    | Asset Versioning
    |--------------------------------------------------------------------------
    |
    | Add version parameters to assets for cache busting
    |
    */
    'version_assets' => env('CDN_VERSION_ASSETS', true),
    
    /*
    |--------------------------------------------------------------------------
    | Asset Optimization
    |--------------------------------------------------------------------------
    |
    | Enable minification and compression
    |
    */
    'minify_enabled' => env('CDN_MINIFY_ENABLED', true),
    'gzip_enabled' => env('CDN_GZIP_ENABLED', true),
    
    /*
    |--------------------------------------------------------------------------
    | CDN Providers Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for each CDN provider
    |
    */
    'providers' => [
        
        /*
        |--------------------------------------------------------------------------
        | CloudFlare CDN
        |--------------------------------------------------------------------------
        */
        'cloudflare' => [
            'enabled' => env('CLOUDFLARE_ENABLED', false),
            'base_url' => env('CLOUDFLARE_BASE_URL', ''),
            'zone_id' => env('CLOUDFLARE_ZONE_ID', ''),
            'api_token' => env('CLOUDFLARE_API_TOKEN', ''),
            'email' => env('CLOUDFLARE_EMAIL', ''),
            'api_key' => env('CLOUDFLARE_API_KEY', ''),
            'settings' => [
                'auto_minify' => true,
                'browser_cache_ttl' => 31536000, // 1 year
                'edge_cache_ttl' => 7776000, // 90 days
                'security_level' => 'medium',
                'ssl' => 'flexible'
            ]
        ],
        
        /*
        |--------------------------------------------------------------------------
        | AWS CloudFront CDN
        |--------------------------------------------------------------------------
        */
        'cloudfront' => [
            'enabled' => env('CLOUDFRONT_ENABLED', false),
            'base_url' => env('CLOUDFRONT_BASE_URL', ''),
            'distribution_id' => env('CLOUDFRONT_DISTRIBUTION_ID', ''),
            'access_key_id' => env('AWS_ACCESS_KEY_ID', ''),
            'secret_access_key' => env('AWS_SECRET_ACCESS_KEY', ''),
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'settings' => [
                'price_class' => 'PriceClass_All',
                'default_ttl' => 86400, // 1 day
                'max_ttl' => 31536000, // 1 year
                'compress' => true,
                'viewer_protocol_policy' => 'redirect-to-https'
            ]
        ],
        
        /*
        |--------------------------------------------------------------------------
        | MaxCDN/StackPath CDN
        |--------------------------------------------------------------------------
        */
        'maxcdn' => [
            'enabled' => env('MAXCDN_ENABLED', false),
            'base_url' => env('MAXCDN_BASE_URL', ''),
            'alias' => env('MAXCDN_ALIAS', ''),
            'key' => env('MAXCDN_KEY', ''),
            'secret' => env('MAXCDN_SECRET', ''),
            'zone_id' => env('MAXCDN_ZONE_ID', ''),
            'settings' => [
                'cache_control' => 'max-age=31536000',
                'compress' => true,
                'ignore_query_string' => false
            ]
        ],
        
        /*
        |--------------------------------------------------------------------------
        | Custom CDN Provider
        |--------------------------------------------------------------------------
        */
        'custom' => [
            'enabled' => env('CUSTOM_CDN_ENABLED', false),
            'base_url' => env('CUSTOM_CDN_BASE_URL', ''),
            'api_endpoint' => env('CUSTOM_CDN_API_ENDPOINT', ''),
            'api_key' => env('CUSTOM_CDN_API_KEY', ''),
            'settings' => [
                'cache_ttl' => 86400,
                'compress' => true,
                'ssl_enabled' => true
            ]
        ]
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Asset Types Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for different asset types
    |
    */
    'asset_types' => [
        'css' => [
            'minify' => true,
            'combine' => true,
            'cache_ttl' => 31536000, // 1 year
            'extensions' => ['css']
        ],
        'js' => [
            'minify' => true,
            'combine' => true,
            'cache_ttl' => 31536000, // 1 year
            'extensions' => ['js']
        ],
        'image' => [
            'optimize' => true,
            'cache_ttl' => 31536000, // 1 year
            'extensions' => ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico'],
            'quality' => 85,
            'progressive' => true
        ],
        'font' => [
            'cache_ttl' => 31536000, // 1 year
            'extensions' => ['woff', 'woff2', 'ttf', 'eot', 'otf'],
            'cors_enabled' => true
        ],
        'video' => [
            'cache_ttl' => 2592000, // 30 days
            'extensions' => ['mp4', 'webm', 'ogg'],
            'streaming' => false
        ],
        'audio' => [
            'cache_ttl' => 2592000, // 30 days
            'extensions' => ['mp3', 'wav', 'ogg'],
            'streaming' => false
        ],
        'document' => [
            'cache_ttl' => 86400, // 1 day
            'extensions' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
        ]
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Critical Assets
    |--------------------------------------------------------------------------
    |
    | Assets to preload for better performance
    |
    */
    'critical_assets' => [
        [
            'path' => 'css/app.css',
            'type' => 'css'
        ],
        [
            'path' => 'js/app.js',
            'type' => 'js'
        ],
        [
            'path' => 'fonts/inter-var.woff2',
            'type' => 'font'
        ]
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Asset Combinations
    |--------------------------------------------------------------------------
    |
    | Predefined asset combinations for better performance
    |
    */
    'combinations' => [
        'vendor_css' => [
            'css/bootstrap.min.css',
            'css/fontawesome.min.css',
            'css/datatables.min.css'
        ],
        'vendor_js' => [
            'js/jquery.min.js',
            'js/bootstrap.bundle.min.js',
            'js/datatables.min.js'
        ],
        'app_css' => [
            'css/variables.css',
            'css/components.css',
            'css/layouts.css',
            'css/pages.css'
        ],
        'app_js' => [
            'js/utils.js',
            'js/components.js',
            'js/app.js'
        ]
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Security Settings
    |--------------------------------------------------------------------------
    |
    | Security configuration for CDN assets
    |
    */
    'security' => [
        'hotlink_protection' => env('CDN_HOTLINK_PROTECTION', true),
        'allowed_domains' => [
            parse_url(env('APP_URL', 'http://localhost'), PHP_URL_HOST)
        ],
        'signed_urls' => env('CDN_SIGNED_URLS', false),
        'token_auth' => env('CDN_TOKEN_AUTH', false)
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Performance Settings
    |--------------------------------------------------------------------------
    |
    | Performance optimization settings
    |
    */
    'performance' => [
        'http2_push' => env('CDN_HTTP2_PUSH', false),
        'preconnect' => env('CDN_PRECONNECT', true),
        'dns_prefetch' => env('CDN_DNS_PREFETCH', true),
        'lazy_loading' => env('CDN_LAZY_LOADING', true),
        'webp_support' => env('CDN_WEBP_SUPPORT', true)
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Monitoring and Analytics
    |--------------------------------------------------------------------------
    |
    | CDN monitoring and analytics configuration
    |
    */
    'monitoring' => [
        'enabled' => env('CDN_MONITORING_ENABLED', false),
        'analytics_provider' => env('CDN_ANALYTICS_PROVIDER', 'cloudflare'),
        'real_user_monitoring' => env('CDN_RUM_ENABLED', false),
        'performance_budget' => [
            'max_load_time' => 3000, // 3 seconds
            'max_first_byte' => 500,  // 500ms
            'max_dom_ready' => 2000   // 2 seconds
        ]
    ]
];