<?php
/**
 * Redis Cache Manager
 * SquidJob Tender Management System
 * 
 * Advanced caching implementation using Redis with fallback support
 */

namespace App\Core;

use Redis;
use Exception;

class RedisCache {
    
    private static $instance = null;
    private $redis = null;
    private $connected = false;
    private $config = [];
    private $prefix = '';
    private $defaultTtl = 3600; // 1 hour
    
    /**
     * Singleton instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->config = config('database.redis.default', []);
        $this->prefix = config('database.redis.options.prefix', 'squidjob_');
        $this->defaultTtl = config('app.cache.default_ttl', 3600);
        
        $this->connect();
    }
    
    /**
     * Connect to Redis server
     */
    private function connect() {
        if (!extension_loaded('redis')) {
            logMessage('WARNING', 'Redis extension not loaded, caching disabled');
            return false;
        }
        
        try {
            $this->redis = new Redis();
            
            // Connection parameters
            $host = $this->config['host'] ?? '127.0.0.1';
            $port = $this->config['port'] ?? 6379;
            $timeout = $this->config['timeout'] ?? 2.5;
            $password = $this->config['password'] ?? null;
            $database = $this->config['database'] ?? 0;
            
            // Connect to Redis
            $connected = $this->redis->connect($host, $port, $timeout);
            
            if (!$connected) {
                throw new Exception('Failed to connect to Redis server');
            }
            
            // Authenticate if password is provided
            if ($password) {
                if (!$this->redis->auth($password)) {
                    throw new Exception('Redis authentication failed');
                }
            }
            
            // Select database
            if ($database > 0) {
                $this->redis->select($database);
            }
            
            // Set connection options
            $this->redis->setOption(Redis::OPT_SERIALIZER, Redis::SERIALIZER_JSON);
            $this->redis->setOption(Redis::OPT_PREFIX, $this->prefix);
            
            $this->connected = true;
            logMessage('INFO', 'Redis cache connected successfully');
            
            return true;
            
        } catch (Exception $e) {
            logMessage('ERROR', 'Redis connection failed: ' . $e->getMessage());
            $this->connected = false;
            return false;
        }
    }
    
    /**
     * Check if Redis is connected
     */
    public function isConnected() {
        if (!$this->connected || !$this->redis) {
            return false;
        }
        
        try {
            return $this->redis->ping() === '+PONG';
        } catch (Exception $e) {
            $this->connected = false;
            return false;
        }
    }
    
    /**
     * Get value from cache
     */
    public function get($key, $default = null) {
        if (!$this->isConnected()) {
            return $default;
        }
        
        try {
            $value = $this->redis->get($this->formatKey($key));
            return $value !== false ? $value : $default;
        } catch (Exception $e) {
            logMessage('ERROR', 'Redis get error: ' . $e->getMessage());
            return $default;
        }
    }
    
    /**
     * Set value in cache
     */
    public function set($key, $value, $ttl = null) {
        if (!$this->isConnected()) {
            return false;
        }
        
        try {
            $ttl = $ttl ?? $this->defaultTtl;
            $key = $this->formatKey($key);
            
            if ($ttl > 0) {
                return $this->redis->setex($key, $ttl, $value);
            } else {
                return $this->redis->set($key, $value);
            }
        } catch (Exception $e) {
            logMessage('ERROR', 'Redis set error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Delete key from cache
     */
    public function delete($key) {
        if (!$this->isConnected()) {
            return false;
        }
        
        try {
            return $this->redis->del($this->formatKey($key)) > 0;
        } catch (Exception $e) {
            logMessage('ERROR', 'Redis delete error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Check if key exists in cache
     */
    public function exists($key) {
        if (!$this->isConnected()) {
            return false;
        }
        
        try {
            return $this->redis->exists($this->formatKey($key)) > 0;
        } catch (Exception $e) {
            logMessage('ERROR', 'Redis exists error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Increment value
     */
    public function increment($key, $value = 1) {
        if (!$this->isConnected()) {
            return false;
        }
        
        try {
            return $this->redis->incrBy($this->formatKey($key), $value);
        } catch (Exception $e) {
            logMessage('ERROR', 'Redis increment error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Decrement value
     */
    public function decrement($key, $value = 1) {
        if (!$this->isConnected()) {
            return false;
        }
        
        try {
            return $this->redis->decrBy($this->formatKey($key), $value);
        } catch (Exception $e) {
            logMessage('ERROR', 'Redis decrement error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get multiple values
     */
    public function getMultiple($keys, $default = null) {
        if (!$this->isConnected() || empty($keys)) {
            return array_fill_keys($keys, $default);
        }
        
        try {
            $formattedKeys = array_map([$this, 'formatKey'], $keys);
            $values = $this->redis->mget($formattedKeys);
            
            $result = [];
            foreach ($keys as $index => $key) {
                $result[$key] = $values[$index] !== false ? $values[$index] : $default;
            }
            
            return $result;
        } catch (Exception $e) {
            logMessage('ERROR', 'Redis getMultiple error: ' . $e->getMessage());
            return array_fill_keys($keys, $default);
        }
    }
    
    /**
     * Set multiple values
     */
    public function setMultiple($values, $ttl = null) {
        if (!$this->isConnected() || empty($values)) {
            return false;
        }
        
        try {
            $ttl = $ttl ?? $this->defaultTtl;
            $formattedValues = [];
            
            foreach ($values as $key => $value) {
                $formattedValues[$this->formatKey($key)] = $value;
            }
            
            if ($ttl > 0) {
                // Use pipeline for better performance
                $pipe = $this->redis->pipeline();
                foreach ($formattedValues as $key => $value) {
                    $pipe->setex($key, $ttl, $value);
                }
                $results = $pipe->exec();
                return !in_array(false, $results, true);
            } else {
                return $this->redis->mset($formattedValues);
            }
        } catch (Exception $e) {
            logMessage('ERROR', 'Redis setMultiple error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Delete multiple keys
     */
    public function deleteMultiple($keys) {
        if (!$this->isConnected() || empty($keys)) {
            return false;
        }
        
        try {
            $formattedKeys = array_map([$this, 'formatKey'], $keys);
            return $this->redis->del($formattedKeys) > 0;
        } catch (Exception $e) {
            logMessage('ERROR', 'Redis deleteMultiple error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Clear all cache (use with caution)
     */
    public function clear() {
        if (!$this->isConnected()) {
            return false;
        }
        
        try {
            return $this->redis->flushDB();
        } catch (Exception $e) {
            logMessage('ERROR', 'Redis clear error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get cache statistics
     */
    public function getStats() {
        if (!$this->isConnected()) {
            return null;
        }
        
        try {
            $info = $this->redis->info();
            return [
                'connected_clients' => $info['connected_clients'] ?? 0,
                'used_memory' => $info['used_memory'] ?? 0,
                'used_memory_human' => $info['used_memory_human'] ?? '0B',
                'keyspace_hits' => $info['keyspace_hits'] ?? 0,
                'keyspace_misses' => $info['keyspace_misses'] ?? 0,
                'total_commands_processed' => $info['total_commands_processed'] ?? 0,
                'uptime_in_seconds' => $info['uptime_in_seconds'] ?? 0
            ];
        } catch (Exception $e) {
            logMessage('ERROR', 'Redis stats error: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Remember (get or set) pattern
     */
    public function remember($key, $callback, $ttl = null) {
        $value = $this->get($key);
        
        if ($value !== null) {
            return $value;
        }
        
        $value = $callback();
        $this->set($key, $value, $ttl);
        
        return $value;
    }
    
    /**
     * Cache tags functionality
     */
    public function tags($tags) {
        return new RedisCacheTaggedCache($this, $tags);
    }
    
    /**
     * Set cache with tags
     */
    public function setWithTags($key, $value, $tags, $ttl = null) {
        if (!is_array($tags)) {
            $tags = [$tags];
        }
        
        // Set the main cache entry
        $result = $this->set($key, $value, $ttl);
        
        if ($result) {
            // Add key to each tag set
            foreach ($tags as $tag) {
                $this->redis->sAdd($this->formatKey("tag:{$tag}"), $this->formatKey($key));
            }
        }
        
        return $result;
    }
    
    /**
     * Flush cache by tags
     */
    public function flushTags($tags) {
        if (!$this->isConnected()) {
            return false;
        }
        
        if (!is_array($tags)) {
            $tags = [$tags];
        }
        
        try {
            foreach ($tags as $tag) {
                $tagKey = $this->formatKey("tag:{$tag}");
                $keys = $this->redis->sMembers($tagKey);
                
                if (!empty($keys)) {
                    $this->redis->del($keys);
                    $this->redis->del($tagKey);
                }
            }
            
            return true;
        } catch (Exception $e) {
            logMessage('ERROR', 'Redis flushTags error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Format cache key
     */
    private function formatKey($key) {
        return str_replace([':', ' '], ['_', '_'], $key);
    }
    
    /**
     * Get Redis instance (for advanced operations)
     */
    public function getRedis() {
        return $this->redis;
    }
    
    /**
     * Close Redis connection
     */
    public function close() {
        if ($this->redis) {
            try {
                $this->redis->close();
            } catch (Exception $e) {
                logMessage('ERROR', 'Redis close error: ' . $e->getMessage());
            }
            $this->connected = false;
        }
    }
    
    /**
     * Destructor
     */
    public function __destruct() {
        $this->close();
    }
}

/**
 * Tagged Cache Implementation
 */
class RedisCacheTaggedCache {
    
    private $cache;
    private $tags;
    
    public function __construct(RedisCache $cache, $tags) {
        $this->cache = $cache;
        $this->tags = is_array($tags) ? $tags : [$tags];
    }
    
    public function get($key, $default = null) {
        return $this->cache->get($key, $default);
    }
    
    public function set($key, $value, $ttl = null) {
        return $this->cache->setWithTags($key, $value, $this->tags, $ttl);
    }
    
    public function delete($key) {
        return $this->cache->delete($key);
    }
    
    public function flush() {
        return $this->cache->flushTags($this->tags);
    }
    
    public function remember($key, $callback, $ttl = null) {
        $value = $this->get($key);
        
        if ($value !== null) {
            return $value;
        }
        
        $value = $callback();
        $this->set($key, $value, $ttl);
        
        return $value;
    }
}

/**
 * Global cache helper functions
 */

/**
 * Get cache instance
 */
function cache() {
    return RedisCache::getInstance();
}

/**
 * Get value from cache
 */
function cache_get($key, $default = null) {
    return cache()->get($key, $default);
}

/**
 * Set value in cache
 */
function cache_set($key, $value, $ttl = null) {
    return cache()->set($key, $value, $ttl);
}

/**
 * Delete from cache
 */
function cache_delete($key) {
    return cache()->delete($key);
}

/**
 * Remember pattern
 */
function cache_remember($key, $callback, $ttl = null) {
    return cache()->remember($key, $callback, $ttl);
}

/**
 * Cache with tags
 */
function cache_tags($tags) {
    return cache()->tags($tags);
}

/**
 * Flush cache by tags
 */
function cache_flush_tags($tags) {
    return cache()->flushTags($tags);
}