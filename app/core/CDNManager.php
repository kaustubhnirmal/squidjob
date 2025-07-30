<?php
/**
 * CDN Manager
 * SquidJob Tender Management System
 * 
 * Manages CDN integration, asset optimization, and delivery
 * Supports multiple CDN providers and local fallbacks
 */

namespace App\Core;

class CDNManager {
    
    private static $instance = null;
    private $config = [];
    private $providers = [];
    private $assetCache = [];
    
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
        $this->loadConfig();
        $this->initializeProviders();
    }
    
    /**
     * Load CDN configuration
     * 
     * @return void
     */
    private function loadConfig() {
        $this->config = [
            'enabled' => config('cdn.enabled', false),
            'default_provider' => config('cdn.default_provider', 'local'),
            'fallback_enabled' => config('cdn.fallback_enabled', true),
            'cache_enabled' => config('cdn.cache_enabled', true),
            'cache_ttl' => config('cdn.cache_ttl', 3600),
            'version_assets' => config('cdn.version_assets', true),
            'minify_enabled' => config('cdn.minify_enabled', true),
            'gzip_enabled' => config('cdn.gzip_enabled', true),
            'providers' => config('cdn.providers', [])
        ];
    }
    
    /**
     * Initialize CDN providers
     * 
     * @return void
     */
    private function initializeProviders() {
        // Local provider (always available)
        $this->providers['local'] = new LocalAssetProvider();
        
        // CloudFlare CDN
        if (isset($this->config['providers']['cloudflare'])) {
            $this->providers['cloudflare'] = new CloudFlareProvider($this->config['providers']['cloudflare']);
        }
        
        // AWS CloudFront
        if (isset($this->config['providers']['cloudfront'])) {
            $this->providers['cloudfront'] = new CloudFrontProvider($this->config['providers']['cloudfront']);
        }
        
        // MaxCDN/StackPath
        if (isset($this->config['providers']['maxcdn'])) {
            $this->providers['maxcdn'] = new MaxCDNProvider($this->config['providers']['maxcdn']);
        }
        
        // Custom CDN
        if (isset($this->config['providers']['custom'])) {
            $this->providers['custom'] = new CustomCDNProvider($this->config['providers']['custom']);
        }
    }
    
    /**
     * Get asset URL with CDN support
     * 
     * @param string $asset Asset path
     * @param string $type Asset type (css, js, image, etc.)
     * @param array $options Additional options
     * @return string Asset URL
     */
    public function asset($asset, $type = null, $options = []) {
        // Remove leading slash
        $asset = ltrim($asset, '/');
        
        // Auto-detect type if not provided
        if (!$type) {
            $type = $this->detectAssetType($asset);
        }
        
        // Check cache first
        $cacheKey = md5($asset . $type . serialize($options));
        if ($this->config['cache_enabled'] && isset($this->assetCache[$cacheKey])) {
            return $this->assetCache[$cacheKey];
        }
        
        $url = $this->buildAssetUrl($asset, $type, $options);
        
        // Cache the result
        if ($this->config['cache_enabled']) {
            $this->assetCache[$cacheKey] = $url;
        }
        
        return $url;
    }
    
    /**
     * Build asset URL
     * 
     * @param string $asset Asset path
     * @param string $type Asset type
     * @param array $options Options
     * @return string Asset URL
     */
    private function buildAssetUrl($asset, $type, $options = []) {
        if (!$this->config['enabled']) {
            return $this->getLocalAssetUrl($asset, $options);
        }
        
        $provider = $options['provider'] ?? $this->config['default_provider'];
        
        if (!isset($this->providers[$provider])) {
            $provider = 'local';
        }
        
        try {
            $url = $this->providers[$provider]->getAssetUrl($asset, $type, $options);
            
            // Add version parameter if enabled
            if ($this->config['version_assets']) {
                $version = $this->getAssetVersion($asset);
                $url .= (strpos($url, '?') !== false ? '&' : '?') . 'v=' . $version;
            }
            
            return $url;
            
        } catch (\Exception $e) {
            error_log("CDN asset failed for {$asset}: " . $e->getMessage());
            
            // Fallback to local if enabled
            if ($this->config['fallback_enabled'] && $provider !== 'local') {
                return $this->getLocalAssetUrl($asset, $options);
            }
            
            throw $e;
        }
    }
    
    /**
     * Get local asset URL
     * 
     * @param string $asset Asset path
     * @param array $options Options
     * @return string Local asset URL
     */
    private function getLocalAssetUrl($asset, $options = []) {
        $baseUrl = rtrim(config('app.url', ''), '/');
        $assetUrl = $baseUrl . '/assets/' . ltrim($asset, '/');
        
        // Add version parameter if enabled
        if ($this->config['version_assets']) {
            $version = $this->getAssetVersion($asset);
            $assetUrl .= (strpos($assetUrl, '?') !== false ? '&' : '?') . 'v=' . $version;
        }
        
        return $assetUrl;
    }
    
    /**
     * Detect asset type from file extension
     * 
     * @param string $asset Asset path
     * @return string Asset type
     */
    private function detectAssetType($asset) {
        $extension = strtolower(pathinfo($asset, PATHINFO_EXTENSION));
        
        $typeMap = [
            'css' => 'css',
            'js' => 'js',
            'jpg' => 'image',
            'jpeg' => 'image',
            'png' => 'image',
            'gif' => 'image',
            'svg' => 'image',
            'webp' => 'image',
            'ico' => 'image',
            'woff' => 'font',
            'woff2' => 'font',
            'ttf' => 'font',
            'eot' => 'font',
            'otf' => 'font',
            'mp4' => 'video',
            'webm' => 'video',
            'ogg' => 'video',
            'mp3' => 'audio',
            'wav' => 'audio',
            'pdf' => 'document',
            'doc' => 'document',
            'docx' => 'document',
            'xls' => 'document',
            'xlsx' => 'document'
        ];
        
        return $typeMap[$extension] ?? 'other';
    }
    
    /**
     * Get asset version for cache busting
     * 
     * @param string $asset Asset path
     * @return string Version string
     */
    private function getAssetVersion($asset) {
        $assetPath = APP_ROOT . '/public/assets/' . ltrim($asset, '/');
        
        if (file_exists($assetPath)) {
            return substr(md5_file($assetPath), 0, 8);
        }
        
        // Fallback to app version
        return substr(md5(config('app.version', '1.0.0')), 0, 8);
    }
    
    /**
     * Minify CSS content
     * 
     * @param string $css CSS content
     * @return string Minified CSS
     */
    public function minifyCSS($css) {
        if (!$this->config['minify_enabled']) {
            return $css;
        }
        
        // Remove comments
        $css = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $css);
        
        // Remove whitespace
        $css = str_replace(["\r\n", "\r", "\n", "\t", '  ', '    ', '    '], '', $css);
        
        // Remove unnecessary spaces
        $css = preg_replace('/\s+/', ' ', $css);
        $css = preg_replace('/;\s*}/', '}', $css);
        $css = preg_replace('/\s*{\s*/', '{', $css);
        $css = preg_replace('/;\s*/', ';', $css);
        $css = preg_replace('/:\s*/', ':', $css);
        
        return trim($css);
    }
    
    /**
     * Minify JavaScript content
     * 
     * @param string $js JavaScript content
     * @return string Minified JavaScript
     */
    public function minifyJS($js) {
        if (!$this->config['minify_enabled']) {
            return $js;
        }
        
        // Basic minification (for production, consider using a proper JS minifier)
        // Remove single-line comments
        $js = preg_replace('/\/\/.*$/m', '', $js);
        
        // Remove multi-line comments
        $js = preg_replace('/\/\*[\s\S]*?\*\//', '', $js);
        
        // Remove extra whitespace
        $js = preg_replace('/\s+/', ' ', $js);
        
        return trim($js);
    }
    
    /**
     * Combine multiple CSS files
     * 
     * @param array $files Array of CSS file paths
     * @param string $outputFile Output file name
     * @return string Combined CSS URL
     */
    public function combineCSS($files, $outputFile = null) {
        if (!$outputFile) {
            $outputFile = 'combined-' . md5(implode('|', $files)) . '.css';
        }
        
        $outputPath = APP_ROOT . '/public/assets/css/combined/' . $outputFile;
        $outputUrl = $this->asset('css/combined/' . $outputFile, 'css');
        
        // Check if combined file exists and is newer than source files
        if (file_exists($outputPath) && $this->isCombinedFileValid($outputPath, $files)) {
            return $outputUrl;
        }
        
        // Create output directory if it doesn't exist
        $outputDir = dirname($outputPath);
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }
        
        $combinedCSS = '';
        foreach ($files as $file) {
            $filePath = APP_ROOT . '/public/assets/' . ltrim($file, '/');
            if (file_exists($filePath)) {
                $css = file_get_contents($filePath);
                $css = $this->minifyCSS($css);
                $combinedCSS .= "/* {$file} */\n" . $css . "\n\n";
            }
        }
        
        file_put_contents($outputPath, $combinedCSS);
        
        return $outputUrl;
    }
    
    /**
     * Combine multiple JavaScript files
     * 
     * @param array $files Array of JS file paths
     * @param string $outputFile Output file name
     * @return string Combined JS URL
     */
    public function combineJS($files, $outputFile = null) {
        if (!$outputFile) {
            $outputFile = 'combined-' . md5(implode('|', $files)) . '.js';
        }
        
        $outputPath = APP_ROOT . '/public/assets/js/combined/' . $outputFile;
        $outputUrl = $this->asset('js/combined/' . $outputFile, 'js');
        
        // Check if combined file exists and is newer than source files
        if (file_exists($outputPath) && $this->isCombinedFileValid($outputPath, $files)) {
            return $outputUrl;
        }
        
        // Create output directory if it doesn't exist
        $outputDir = dirname($outputPath);
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }
        
        $combinedJS = '';
        foreach ($files as $file) {
            $filePath = APP_ROOT . '/public/assets/' . ltrim($file, '/');
            if (file_exists($filePath)) {
                $js = file_get_contents($filePath);
                $js = $this->minifyJS($js);
                $combinedJS .= "/* {$file} */\n" . $js . ";\n\n";
            }
        }
        
        file_put_contents($outputPath, $combinedJS);
        
        return $outputUrl;
    }
    
    /**
     * Check if combined file is valid (newer than source files)
     * 
     * @param string $combinedFile Combined file path
     * @param array $sourceFiles Source file paths
     * @return bool Is valid
     */
    private function isCombinedFileValid($combinedFile, $sourceFiles) {
        $combinedTime = filemtime($combinedFile);
        
        foreach ($sourceFiles as $file) {
            $filePath = APP_ROOT . '/public/assets/' . ltrim($file, '/');
            if (file_exists($filePath) && filemtime($filePath) > $combinedTime) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Purge CDN cache
     * 
     * @param string|array $assets Assets to purge (null for all)
     * @param string $provider CDN provider
     * @return bool Success status
     */
    public function purgeCache($assets = null, $provider = null) {
        if (!$provider) {
            $provider = $this->config['default_provider'];
        }
        
        if (!isset($this->providers[$provider])) {
            return false;
        }
        
        try {
            return $this->providers[$provider]->purgeCache($assets);
        } catch (\Exception $e) {
            error_log("CDN cache purge failed: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get CDN statistics
     * 
     * @param string $provider CDN provider
     * @return array Statistics
     */
    public function getStatistics($provider = null) {
        if (!$provider) {
            $provider = $this->config['default_provider'];
        }
        
        if (!isset($this->providers[$provider])) {
            return [];
        }
        
        try {
            return $this->providers[$provider]->getStatistics();
        } catch (\Exception $e) {
            error_log("CDN statistics failed: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Preload critical assets
     * 
     * @param array $assets Assets to preload
     * @return string Preload HTML tags
     */
    public function preloadAssets($assets) {
        $html = '';
        
        foreach ($assets as $asset) {
            $url = $this->asset($asset['path'], $asset['type'] ?? null);
            $type = $asset['type'] ?? $this->detectAssetType($asset['path']);
            
            switch ($type) {
                case 'css':
                    $html .= '<link rel="preload" href="' . $url . '" as="style">' . "\n";
                    break;
                case 'js':
                    $html .= '<link rel="preload" href="' . $url . '" as="script">' . "\n";
                    break;
                case 'font':
                    $html .= '<link rel="preload" href="' . $url . '" as="font" crossorigin>' . "\n";
                    break;
                case 'image':
                    $html .= '<link rel="preload" href="' . $url . '" as="image">' . "\n";
                    break;
            }
        }
        
        return $html;
    }
}

/**
 * Local Asset Provider
 */
class LocalAssetProvider {
    
    public function getAssetUrl($asset, $type, $options = []) {
        $baseUrl = rtrim(config('app.url', ''), '/');
        return $baseUrl . '/assets/' . ltrim($asset, '/');
    }
    
    public function purgeCache($assets = null) {
        // Local provider doesn't need cache purging
        return true;
    }
    
    public function getStatistics() {
        return [
            'provider' => 'local',
            'status' => 'active'
        ];
    }
}

/**
 * CloudFlare CDN Provider
 */
class CloudFlareProvider {
    
    private $config;
    
    public function __construct($config) {
        $this->config = $config;
    }
    
    public function getAssetUrl($asset, $type, $options = []) {
        $baseUrl = rtrim($this->config['base_url'], '/');
        return $baseUrl . '/' . ltrim($asset, '/');
    }
    
    public function purgeCache($assets = null) {
        // Implementation for CloudFlare cache purging
        // This would use CloudFlare API
        return true;
    }
    
    public function getStatistics() {
        // Implementation for CloudFlare statistics
        return [
            'provider' => 'cloudflare',
            'status' => 'active'
        ];
    }
}

/**
 * Custom CDN Provider
 */
class CustomCDNProvider {
    
    private $config;
    
    public function __construct($config) {
        $this->config = $config;
    }
    
    public function getAssetUrl($asset, $type, $options = []) {
        $baseUrl = rtrim($this->config['base_url'], '/');
        return $baseUrl . '/' . ltrim($asset, '/');
    }
    
    public function purgeCache($assets = null) {
        return true;
    }
    
    public function getStatistics() {
        return [
            'provider' => 'custom',
            'status' => 'active'
        ];
    }
}

/**
 * Global CDN helper functions
 */

/**
 * Get CDN manager instance
 * 
 * @return CDNManager
 */
function cdn() {
    return CDNManager::getInstance();
}

/**
 * Get asset URL with CDN support
 * 
 * @param string $asset Asset path
 * @param string $type Asset type
 * @param array $options Options
 * @return string Asset URL
 */
function asset($asset, $type = null, $options = []) {
    return cdn()->asset($asset, $type, $options);
}

/**
 * Combine CSS files
 * 
 * @param array $files CSS files
 * @param string $output Output filename
 * @return string Combined CSS URL
 */
function combine_css($files, $output = null) {
    return cdn()->combineCSS($files, $output);
}

/**
 * Combine JS files
 * 
 * @param array $files JS files
 * @param string $output Output filename
 * @return string Combined JS URL
 */
function combine_js($files, $output = null) {
    return cdn()->combineJS($files, $output);
}

/**
 * Preload critical assets
 * 
 * @param array $assets Assets to preload
 * @return string Preload HTML
 */
function preload_assets($assets) {
    return cdn()->preloadAssets($assets);
}