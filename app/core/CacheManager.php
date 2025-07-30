<?php
/**
 * Cache Manager
 * SquidJob Tender Management System
 * 
 * Provides caching functionality for improved performance
 * Supports file-based caching with automatic expiration
 */

namespace App\Core;

class CacheManager {
    
    private static $instance = null;
    private $cacheDir;
    private $defaultTtl = 3600; // 1 hour default TTL
    
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
        $this->cacheDir = APP_ROOT . '/storage/cache';
        $this->ensureCacheDirectory();
    }
    
    /**
     * Store data in cache
     * 
     * @param string $key Cache key
     * @param mixed $data Data to cache
     * @param int $ttl Time to live in seconds
     * @return bool Success status
     */
    public function set($key, $data, $ttl = null) {
        try {
            $ttl = $ttl ?: $this->defaultTtl;
            $filename = $this->getCacheFilename($key);
            
            $cacheData = [
                'data' => $data,
                'expires' => time() + $ttl,
                'created' => time()
            ];
            
            $serialized = serialize($cacheData);
            $result = file_put_contents($filename, $serialized, LOCK_EX);
            
            return $result !== false;
        } catch (Exception $e) {
            error_log("Cache set error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Retrieve data from cache
     * 
     * @param string $key Cache key
     * @param mixed $default Default value if not found
     * @return mixed Cached data or default value
     */
    public function get($key, $default = null) {
        try {
            $filename = $this->getCacheFilename($key);
            
            if (!file_exists($filename)) {
                return $default;
            }
            
            $contents = file_get_contents($filename);
            if ($contents === false) {
                return $default;
            }
            
            $cacheData = unserialize($contents);
            if ($cacheData === false) {
                // Invalid cache data, remove file
                unlink($filename);
                return $default;
            }
            
            // Check if cache has expired
            if (time() > $cacheData['expires']) {
                unlink($filename);
                return $default;
            }
            
            return $cacheData['data'];
        } catch (Exception $e) {
            error_log("Cache get error: " . $e->getMessage());
            return $default;
        }
    }
    
    /**
     * Check if cache key exists and is valid
     * 
     * @param string $key Cache key
     * @return bool Key exists and is valid
     */
    public function has($key) {
        try {
            $filename = $this->getCacheFilename($key);
            
            if (!file_exists($filename)) {
                return false;
            }
            
            $contents = file_get_contents($filename);
            if ($contents === false) {
                return false;
            }
            
            $cacheData = unserialize($contents);
            if ($cacheData === false) {
                unlink($filename);
                return false;
            }
            
            // Check if cache has expired
            if (time() > $cacheData['expires']) {
                unlink($filename);
                return false;
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Cache has error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Delete cache entry
     * 
     * @param string $key Cache key
     * @return bool Success status
     */
    public function delete($key) {
        try {
            $filename = $this->getCacheFilename($key);
            
            if (file_exists($filename)) {
                return unlink($filename);
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Cache delete error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Clear all cache entries
     * 
     * @return bool Success status
     */
    public function clear() {
        try {
            $files = glob($this->cacheDir . '/*.cache');
            $success = true;
            
            foreach ($files as $file) {
                if (!unlink($file)) {
                    $success = false;
                }
            }
            
            return $success;
        } catch (Exception $e) {
            error_log("Cache clear error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get or set cache with callback
     * 
     * @param string $key Cache key
     * @param callable $callback Callback to generate data if not cached
     * @param int $ttl Time to live in seconds
     * @return mixed Cached or generated data
     */
    public function remember($key, $callback, $ttl = null) {
        $data = $this->get($key);
        
        if ($data !== null) {
            return $data;
        }
        
        $data = call_user_func($callback);
        $this->set($key, $data, $ttl);
        
        return $data;
    }
    
    /**
     * Clean expired cache entries
     * 
     * @return int Number of cleaned entries
     */
    public function cleanExpired() {
        try {
            $files = glob($this->cacheDir . '/*.cache');
            $cleaned = 0;
            
            foreach ($files as $file) {
                $contents = file_get_contents($file);
                if ($contents === false) {
                    continue;
                }
                
                $cacheData = unserialize($contents);
                if ($cacheData === false || time() > $cacheData['expires']) {
                    if (unlink($file)) {
                        $cleaned++;
                    }
                }
            }
            
            return $cleaned;
        } catch (Exception $e) {
            error_log("Cache clean error: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get cache statistics
     * 
     * @return array Cache statistics
     */
    public function getStats() {
        try {
            $files = glob($this->cacheDir . '/*.cache');
            $totalSize = 0;
            $validEntries = 0;
            $expiredEntries = 0;
            $oldestEntry = null;
            $newestEntry = null;
            
            foreach ($files as $file) {
                $size = filesize($file);
                $totalSize += $size;
                
                $contents = file_get_contents($file);
                if ($contents === false) {
                    continue;
                }
                
                $cacheData = unserialize($contents);
                if ($cacheData === false) {
                    continue;
                }
                
                if (time() > $cacheData['expires']) {
                    $expiredEntries++;
                } else {
                    $validEntries++;
                }
                
                if ($oldestEntry === null || $cacheData['created'] < $oldestEntry) {
                    $oldestEntry = $cacheData['created'];
                }
                
                if ($newestEntry === null || $cacheData['created'] > $newestEntry) {
                    $newestEntry = $cacheData['created'];
                }
            }
            
            return [
                'total_entries' => count($files),
                'valid_entries' => $validEntries,
                'expired_entries' => $expiredEntries,
                'total_size' => $totalSize,
                'total_size_formatted' => $this->formatBytes($totalSize),
                'oldest_entry' => $oldestEntry ? date('Y-m-d H:i:s', $oldestEntry) : null,
                'newest_entry' => $newestEntry ? date('Y-m-d H:i:s', $newestEntry) : null
            ];
        } catch (Exception $e) {
            error_log("Cache stats error: " . $e->getMessage());
            return [
                'total_entries' => 0,
                'valid_entries' => 0,
                'expired_entries' => 0,
                'total_size' => 0,
                'total_size_formatted' => '0 B',
                'oldest_entry' => null,
                'newest_entry' => null
            ];
        }
    }
    
    /**
     * Set default TTL
     * 
     * @param int $ttl Time to live in seconds
     */
    public function setDefaultTtl($ttl) {
        $this->defaultTtl = $ttl;
    }
    
    /**
     * Get cache filename for key
     * 
     * @param string $key Cache key
     * @return string Cache filename
     */
    private function getCacheFilename($key) {
        $hash = md5($key);
        return $this->cacheDir . '/' . $hash . '.cache';
    }
    
    /**
     * Ensure cache directory exists
     */
    private function ensureCacheDirectory() {
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
        
        // Create .htaccess to prevent direct access
        $htaccessFile = $this->cacheDir . '/.htaccess';
        if (!file_exists($htaccessFile)) {
            file_put_contents($htaccessFile, "Deny from all\n");
        }
    }
    
    /**
     * Format bytes to human readable format
     * 
     * @param int $bytes Bytes
     * @return string Formatted size
     */
    private function formatBytes($bytes) {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}

/**
 * Global cache helper functions
 */

/**
 * Get cache manager instance
 * 
 * @return CacheManager
 */
function cache() {
    return CacheManager::getInstance();
}

/**
 * Cache data with key
 * 
 * @param string $key Cache key
 * @param mixed $data Data to cache
 * @param int $ttl Time to live in seconds
 * @return bool Success status
 */
function cache_set($key, $data, $ttl = null) {
    return cache()->set($key, $data, $ttl);
}

/**
 * Get cached data
 * 
 * @param string $key Cache key
 * @param mixed $default Default value
 * @return mixed Cached data or default
 */
function cache_get($key, $default = null) {
    return cache()->get($key, $default);
}

/**
 * Remember cache with callback
 * 
 * @param string $key Cache key
 * @param callable $callback Callback to generate data
 * @param int $ttl Time to live in seconds
 * @return mixed Cached or generated data
 */
function cache_remember($key, $callback, $ttl = null) {
    return cache()->remember($key, $callback, $ttl);
}

/**
 * Delete cached data
 * 
 * @param string $key Cache key
 * @return bool Success status
 */
function cache_delete($key) {
    return cache()->delete($key);
}

/**
 * Clear all cache
 * 
 * @return bool Success status
 */
function cache_clear() {
    return cache()->clear();
}
?>