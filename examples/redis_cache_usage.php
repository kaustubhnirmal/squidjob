<?php
/**
 * Redis Cache Usage Examples
 * SquidJob Tender Management System
 * 
 * Demonstrates various caching patterns and use cases
 */

// Include the cache class
require_once __DIR__ . '/../app/core/RedisCache.php';

/**
 * Example 1: Basic Cache Operations
 */
function basicCacheExample() {
    echo "=== Basic Cache Operations ===\n";
    
    // Get cache instance
    $cache = cache();
    
    // Check connection
    if (!$cache->isConnected()) {
        echo "Redis not connected, using fallback\n";
        return;
    }
    
    // Set a simple value
    $cache->set('user:123', [
        'id' => 123,
        'name' => 'John Doe',
        'email' => 'john@example.com'
    ], 3600); // Cache for 1 hour
    
    // Get the value
    $user = $cache->get('user:123');
    echo "Cached user: " . json_encode($user) . "\n";
    
    // Check if key exists
    if ($cache->exists('user:123')) {
        echo "User cache exists\n";
    }
    
    // Delete the cache
    $cache->delete('user:123');
    echo "User cache deleted\n";
}

/**
 * Example 2: Tender Caching
 */
function tenderCachingExample() {
    echo "\n=== Tender Caching Example ===\n";
    
    // Cache tender data with tags
    $tenderId = 456;
    $tenderData = [
        'id' => $tenderId,
        'title' => 'Construction Project Tender',
        'authority' => 'Municipal Corporation',
        'deadline' => '2024-12-31',
        'status' => 'live'
    ];
    
    // Cache with tags for easy invalidation
    cache_tags(['tenders', 'tender:' . $tenderId])
        ->set("tender:{$tenderId}", $tenderData, 7200); // 2 hours
    
    // Retrieve cached tender
    $cachedTender = cache_get("tender:{$tenderId}");
    echo "Cached tender: " . json_encode($cachedTender) . "\n";
    
    // Cache tender list
    $tenderList = [
        ['id' => 456, 'title' => 'Construction Project'],
        ['id' => 457, 'title' => 'IT Equipment Purchase'],
        ['id' => 458, 'title' => 'Road Maintenance']
    ];
    
    cache_tags(['tenders', 'tender_list'])
        ->set('tenders:active', $tenderList, 1800); // 30 minutes
    
    echo "Tender list cached\n";
}

/**
 * Example 3: Remember Pattern
 */
function rememberPatternExample() {
    echo "\n=== Remember Pattern Example ===\n";
    
    // Simulate expensive database query
    $expensiveQuery = function() {
        echo "Executing expensive database query...\n";
        sleep(1); // Simulate delay
        return [
            'total_tenders' => 150,
            'active_tenders' => 45,
            'completed_tenders' => 105
        ];
    };
    
    // Use remember pattern - will execute query only once
    $stats = cache_remember('tender_stats', $expensiveQuery, 600); // 10 minutes
    echo "Stats (first call): " . json_encode($stats) . "\n";
    
    // Second call will use cached data
    $stats = cache_remember('tender_stats', $expensiveQuery, 600);
    echo "Stats (second call - cached): " . json_encode($stats) . "\n";
}

/**
 * Example 4: Counter and Rate Limiting
 */
function counterExample() {
    echo "\n=== Counter and Rate Limiting Example ===\n";
    
    $userId = 789;
    $cache = cache();
    
    // API rate limiting
    $apiKey = "api_calls:user:{$userId}";
    $currentCalls = $cache->get($apiKey, 0);
    
    if ($currentCalls >= 100) {
        echo "Rate limit exceeded for user {$userId}\n";
    } else {
        $cache->increment($apiKey);
        $cache->set($apiKey . ':ttl', time() + 3600, 3600); // Reset after 1 hour
        echo "API call recorded. Total calls: " . ($currentCalls + 1) . "\n";
    }
    
    // Page view counter
    $pageViews = $cache->increment('page_views:tender:456');
    echo "Tender page views: {$pageViews}\n";
}

/**
 * Example 5: Session Caching
 */
function sessionCachingExample() {
    echo "\n=== Session Caching Example ===\n";
    
    $sessionId = 'sess_' . uniqid();
    $sessionData = [
        'user_id' => 123,
        'login_time' => time(),
        'permissions' => ['view_tenders', 'create_tender'],
        'preferences' => [
            'theme' => 'dark',
            'language' => 'en'
        ]
    ];
    
    // Cache session data
    cache_set("session:{$sessionId}", $sessionData, 1440); // 24 minutes
    
    // Retrieve session
    $session = cache_get("session:{$sessionId}");
    echo "Session data: " . json_encode($session) . "\n";
    
    // Update session activity
    $session['last_activity'] = time();
    cache_set("session:{$sessionId}", $session, 1440);
    
    echo "Session updated\n";
}

/**
 * Example 6: Search Results Caching
 */
function searchCachingExample() {
    echo "\n=== Search Results Caching Example ===\n";
    
    $searchQuery = 'construction tender';
    $searchKey = 'search:' . md5($searchQuery);
    
    // Simulate search function
    $performSearch = function($query) {
        echo "Performing search for: {$query}\n";
        return [
            'query' => $query,
            'results' => [
                ['id' => 1, 'title' => 'Construction Project A'],
                ['id' => 2, 'title' => 'Building Construction Tender'],
                ['id' => 3, 'title' => 'Road Construction Project']
            ],
            'total' => 3,
            'search_time' => microtime(true)
        ];
    };
    
    // Cache search results
    $results = cache_remember($searchKey, function() use ($performSearch, $searchQuery) {
        return $performSearch($searchQuery);
    }, 900); // 15 minutes
    
    echo "Search results: " . json_encode($results) . "\n";
}

/**
 * Example 7: Cache Invalidation
 */
function cacheInvalidationExample() {
    echo "\n=== Cache Invalidation Example ===\n";
    
    // Set up some cached data with tags
    cache_tags(['tenders'])->set('tender:100', ['id' => 100, 'title' => 'Test Tender'], 3600);
    cache_tags(['tenders'])->set('tender:101', ['id' => 101, 'title' => 'Another Tender'], 3600);
    cache_tags(['users'])->set('user:200', ['id' => 200, 'name' => 'Test User'], 3600);
    
    echo "Cached tender and user data\n";
    
    // Verify data exists
    echo "Tender 100 exists: " . (cache()->exists('tender:100') ? 'Yes' : 'No') . "\n";
    echo "User 200 exists: " . (cache()->exists('user:200') ? 'Yes' : 'No') . "\n";
    
    // Invalidate all tender caches
    cache_flush_tags(['tenders']);
    echo "Flushed tender caches\n";
    
    // Check again
    echo "Tender 100 exists after flush: " . (cache()->exists('tender:100') ? 'Yes' : 'No') . "\n";
    echo "User 200 exists after flush: " . (cache()->exists('user:200') ? 'Yes' : 'No') . "\n";
}

/**
 * Example 8: Batch Operations
 */
function batchOperationsExample() {
    echo "\n=== Batch Operations Example ===\n";
    
    $cache = cache();
    
    // Set multiple values at once
    $userData = [
        'user:301' => ['id' => 301, 'name' => 'Alice'],
        'user:302' => ['id' => 302, 'name' => 'Bob'],
        'user:303' => ['id' => 303, 'name' => 'Charlie']
    ];
    
    $cache->setMultiple($userData, 1800); // 30 minutes
    echo "Set multiple users\n";
    
    // Get multiple values at once
    $userKeys = ['user:301', 'user:302', 'user:303'];
    $users = $cache->getMultiple($userKeys);
    
    foreach ($users as $key => $user) {
        echo "{$key}: " . json_encode($user) . "\n";
    }
    
    // Delete multiple keys
    $cache->deleteMultiple($userKeys);
    echo "Deleted multiple users\n";
}

/**
 * Example 9: Cache Statistics
 */
function cacheStatsExample() {
    echo "\n=== Cache Statistics Example ===\n";
    
    $cache = cache();
    $stats = $cache->getStats();
    
    if ($stats) {
        echo "Cache Statistics:\n";
        echo "- Connected clients: " . $stats['connected_clients'] . "\n";
        echo "- Memory used: " . $stats['used_memory_human'] . "\n";
        echo "- Cache hits: " . $stats['keyspace_hits'] . "\n";
        echo "- Cache misses: " . $stats['keyspace_misses'] . "\n";
        echo "- Total commands: " . $stats['total_commands_processed'] . "\n";
        echo "- Uptime: " . $stats['uptime_in_seconds'] . " seconds\n";
        
        if ($stats['keyspace_hits'] + $stats['keyspace_misses'] > 0) {
            $hitRate = $stats['keyspace_hits'] / ($stats['keyspace_hits'] + $stats['keyspace_misses']) * 100;
            echo "- Hit rate: " . number_format($hitRate, 2) . "%\n";
        }
    } else {
        echo "Cache statistics not available\n";
    }
}

/**
 * Example 10: Advanced Caching Patterns
 */
function advancedPatternsExample() {
    echo "\n=== Advanced Caching Patterns Example ===\n";
    
    // Cache-aside pattern for tender data
    function getTender($id) {
        $cacheKey = "tender:{$id}";
        
        // Try to get from cache first
        $tender = cache_get($cacheKey);
        
        if ($tender === null) {
            // Not in cache, fetch from database
            echo "Fetching tender {$id} from database\n";
            $tender = [
                'id' => $id,
                'title' => "Tender {$id}",
                'status' => 'active',
                'fetched_at' => time()
            ];
            
            // Store in cache
            cache_set($cacheKey, $tender, 3600);
        } else {
            echo "Retrieved tender {$id} from cache\n";
        }
        
        return $tender;
    }
    
    // Write-through pattern for user updates
    function updateUser($id, $data) {
        echo "Updating user {$id} in database\n";
        
        // Update database (simulated)
        $userData = array_merge(['id' => $id], $data, ['updated_at' => time()]);
        
        // Update cache immediately
        cache_set("user:{$id}", $userData, 1800);
        
        echo "User {$id} updated in both database and cache\n";
        return $userData;
    }
    
    // Demonstrate patterns
    $tender1 = getTender(501);
    $tender1Again = getTender(501); // Should come from cache
    
    $updatedUser = updateUser(401, ['name' => 'Updated Name', 'email' => 'new@example.com']);
}

// Run examples
if (php_sapi_name() === 'cli') {
    echo "Redis Cache Usage Examples\n";
    echo "==========================\n";
    
    basicCacheExample();
    tenderCachingExample();
    rememberPatternExample();
    counterExample();
    sessionCachingExample();
    searchCachingExample();
    cacheInvalidationExample();
    batchOperationsExample();
    cacheStatsExample();
    advancedPatternsExample();
    
    echo "\n=== Examples completed ===\n";
} else {
    echo "<pre>";
    echo "Redis Cache Usage Examples\n";
    echo "==========================\n";
    echo "Run this script from command line to see examples in action.\n";
    echo "php " . __FILE__ . "\n";
    echo "</pre>";
}