<?php
/**
 * Theme Manager
 * SquidJob Tender Management System
 * 
 * Manages theme loading, switching, and customization
 * Provides separation between core functionality and UI/UX templates
 */

namespace App\Core;

class ThemeManager {
    
    private static $instance = null;
    private $activeTheme = 'default';
    private $themeConfig = null;
    private $themePath = '';
    private $themeUrl = '';
    private $customSettings = [];
    
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
        $this->activeTheme = $this->getActiveThemeFromConfig();
        $this->loadTheme($this->activeTheme);
    }
    
    /**
     * Load theme configuration and assets
     * 
     * @param string $themeName Theme name to load
     * @return bool Success status
     */
    public function loadTheme($themeName) {
        $this->themePath = APP_ROOT . "/themes/{$themeName}";
        $this->themeUrl = url("themes/{$themeName}");
        
        // Check if theme exists
        if (!$this->themeExists($themeName)) {
            error_log("Theme '{$themeName}' not found, falling back to default");
            $themeName = 'default';
            $this->themePath = APP_ROOT . "/themes/default";
            $this->themeUrl = url("themes/default");
        }
        
        // Load theme configuration
        $configFile = $this->themePath . '/theme.json';
        if (file_exists($configFile)) {
            $this->themeConfig = json_decode(file_get_contents($configFile), true);
            $this->activeTheme = $themeName;
            
            // Load custom settings
            $this->loadCustomSettings();
            
            // Execute theme hooks
            $this->executeHook('theme_loaded');
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if theme exists
     * 
     * @param string $themeName Theme name
     * @return bool Theme exists
     */
    public function themeExists($themeName) {
        $themePath = APP_ROOT . "/themes/{$themeName}";
        return is_dir($themePath) && file_exists($themePath . '/theme.json');
    }
    
    /**
     * Get list of available themes
     * 
     * @return array Available themes
     */
    public function getAvailableThemes() {
        $themes = [];
        $themesDir = APP_ROOT . '/themes';
        
        if (is_dir($themesDir)) {
            $directories = scandir($themesDir);
            foreach ($directories as $dir) {
                if ($dir !== '.' && $dir !== '..' && is_dir($themesDir . '/' . $dir)) {
                    $configFile = $themesDir . '/' . $dir . '/theme.json';
                    if (file_exists($configFile)) {
                        $config = json_decode(file_get_contents($configFile), true);
                        $themes[$dir] = [
                            'name' => $dir,
                            'display_name' => $config['display_name'] ?? $dir,
                            'description' => $config['description'] ?? '',
                            'version' => $config['version'] ?? '1.0.0',
                            'author' => $config['author'] ?? 'Unknown',
                            'screenshot' => $this->getThemeUrl($dir) . '/' . ($config['screenshot'] ?? 'screenshot.png')
                        ];
                    }
                }
            }
        }
        
        return $themes;
    }
    
    /**
     * Switch to different theme
     * 
     * @param string $themeName Theme name
     * @return bool Success status
     */
    public function switchTheme($themeName) {
        if ($this->themeExists($themeName)) {
            $this->saveActiveTheme($themeName);
            return $this->loadTheme($themeName);
        }
        return false;
    }
    
    /**
     * Render theme view
     * 
     * @param string $view View name
     * @param array $data Data to pass to view
     * @return void
     */
    public function render($view, $data = []) {
        $this->executeHook('before_render', ['view' => $view, 'data' => $data]);
        
        // Get view file path
        $viewFile = $this->getViewPath($view);
        
        if (file_exists($viewFile)) {
            // Extract data for view
            extract($data);
            extract($this->getThemeData());
            
            // Include view file
            include $viewFile;
        } else {
            throw new \Exception("Theme view '{$view}' not found in theme '{$this->activeTheme}'");
        }
        
        $this->executeHook('after_render', ['view' => $view, 'data' => $data]);
    }
    
    /**
     * Get view file path
     * 
     * @param string $view View name
     * @return string View file path
     */
    public function getViewPath($view) {
        // Check if view is defined in theme config
        if (isset($this->themeConfig['pages'][$view])) {
            return $this->themePath . '/' . $this->themeConfig['pages'][$view];
        }
        
        // Check if view is a component
        if (isset($this->themeConfig['components'][$view])) {
            return $this->themePath . '/' . $this->themeConfig['components'][$view];
        }
        
        // Check if view is a layout
        if (isset($this->themeConfig['layout'][$view])) {
            return $this->themePath . '/' . $this->themeConfig['layout'][$view];
        }
        
        // Default view path
        return $this->themePath . '/views/' . str_replace('.', '/', $view) . '.php';
    }
    
    /**
     * Get theme asset URL
     * 
     * @param string $asset Asset path
     * @return string Asset URL
     */
    public function asset($asset) {
        return $this->themeUrl . '/' . ltrim($asset, '/');
    }
    
    /**
     * Get theme CSS files
     * 
     * @return array CSS file URLs
     */
    public function getCssFiles() {
        $cssFiles = [];
        if (isset($this->themeConfig['assets']['css'])) {
            foreach ($this->themeConfig['assets']['css'] as $css) {
                $cssFiles[] = $this->asset($css);
            }
        }
        return $cssFiles;
    }
    
    /**
     * Get theme JavaScript files
     * 
     * @return array JS file URLs
     */
    public function getJsFiles() {
        $jsFiles = [];
        if (isset($this->themeConfig['assets']['js'])) {
            foreach ($this->themeConfig['assets']['js'] as $js) {
                $jsFiles[] = $this->asset($js);
            }
        }
        return $jsFiles;
    }
    
    /**
     * Get theme configuration
     * 
     * @param string $key Configuration key
     * @return mixed Configuration value
     */
    public function getConfig($key = null) {
        if ($key === null) {
            return $this->themeConfig;
        }
        
        return data_get($this->themeConfig, $key);
    }
    
    /**
     * Get theme data for views
     * 
     * @return array Theme data
     */
    public function getThemeData() {
        return [
            'theme_name' => $this->activeTheme,
            'theme_config' => $this->themeConfig,
            'theme_url' => $this->themeUrl,
            'theme_path' => $this->themePath,
            'css_files' => $this->getCssFiles(),
            'js_files' => $this->getJsFiles(),
            'custom_settings' => $this->customSettings,
            'color_scheme' => $this->getColorScheme(),
            'typography' => $this->getTypography()
        ];
    }
    
    /**
     * Get current color scheme
     * 
     * @return array Color scheme
     */
    public function getColorScheme() {
        $schemes = $this->getConfig('settings.color_schemes') ?? [];
        $activeScheme = $this->customSettings['color_scheme'] ?? 'default';
        
        foreach ($schemes as $scheme) {
            if ($scheme['name'] === $activeScheme) {
                return $scheme;
            }
        }
        
        return $schemes[0] ?? [];
    }
    
    /**
     * Get typography settings
     * 
     * @return array Typography settings
     */
    public function getTypography() {
        return $this->getConfig('settings.typography') ?? [];
    }
    
    /**
     * Execute theme hook
     * 
     * @param string $hookName Hook name
     * @param array $data Hook data
     * @return mixed Hook result
     */
    public function executeHook($hookName, $data = []) {
        $hooks = $this->getConfig('hooks') ?? [];
        
        if (isset($hooks[$hookName])) {
            $hookFile = $this->themePath . '/' . $hooks[$hookName];
            if (file_exists($hookFile)) {
                return include $hookFile;
            }
        }
        
        return null;
    }
    
    /**
     * Customize theme setting
     * 
     * @param string $key Setting key
     * @param mixed $value Setting value
     * @return void
     */
    public function customize($key, $value) {
        $this->customSettings[$key] = $value;
        $this->saveCustomSettings();
    }
    
    /**
     * Get theme URL
     * 
     * @param string $themeName Theme name
     * @return string Theme URL
     */
    public function getThemeUrl($themeName = null) {
        $themeName = $themeName ?: $this->activeTheme;
        return url("themes/{$themeName}");
    }
    
    /**
     * Get active theme name
     * 
     * @return string Active theme name
     */
    public function getActiveTheme() {
        return $this->activeTheme;
    }
    
    /**
     * Load custom settings from database
     * 
     * @return void
     */
    private function loadCustomSettings() {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("SELECT value FROM settings WHERE key_name = ?");
            $stmt->execute(['theme_custom_settings']);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($result) {
                $this->customSettings = json_decode($result['value'], true) ?? [];
            }
        } catch (\Exception $e) {
            error_log("Failed to load theme custom settings: " . $e->getMessage());
        }
    }
    
    /**
     * Save custom settings to database
     * 
     * @return void
     */
    private function saveCustomSettings() {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO settings (key_name, value, type, description, updated_by, updated_at) 
                VALUES (?, ?, 'json', 'Theme custom settings', ?, NOW())
                ON DUPLICATE KEY UPDATE 
                value = VALUES(value), updated_by = VALUES(updated_by), updated_at = NOW()
            ");
            
            $stmt->execute([
                'theme_custom_settings',
                json_encode($this->customSettings),
                auth() ? user()['id'] : 1
            ]);
        } catch (\Exception $e) {
            error_log("Failed to save theme custom settings: " . $e->getMessage());
        }
    }
    
    /**
     * Get active theme from configuration
     * 
     * @return string Active theme name
     */
    private function getActiveThemeFromConfig() {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("SELECT value FROM settings WHERE key_name = ?");
            $stmt->execute(['active_theme']);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            return $result ? $result['value'] : 'default';
        } catch (\Exception $e) {
            return 'default';
        }
    }
    
    /**
     * Save active theme to configuration
     * 
     * @param string $themeName Theme name
     * @return void
     */
    private function saveActiveTheme($themeName) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO settings (key_name, value, type, description, updated_by, updated_at) 
                VALUES (?, ?, 'string', 'Active theme name', ?, NOW())
                ON DUPLICATE KEY UPDATE 
                value = VALUES(value), updated_by = VALUES(updated_by), updated_at = NOW()
            ");
            
            $stmt->execute([
                'active_theme',
                $themeName,
                auth() ? user()['id'] : 1
            ]);
        } catch (\Exception $e) {
            error_log("Failed to save active theme: " . $e->getMessage());
        }
    }
}

/**
 * Global theme helper functions
 */

/**
 * Get theme manager instance
 * 
 * @return ThemeManager
 */
function theme() {
    return ThemeManager::getInstance();
}

/**
 * Render theme view
 * 
 * @param string $view View name
 * @param array $data View data
 * @return void
 */
function theme_view($view, $data = []) {
    theme()->render($view, $data);
}

/**
 * Get theme asset URL
 * 
 * @param string $asset Asset path
 * @return string Asset URL
 */
function theme_asset($asset) {
    return theme()->asset($asset);
}

/**
 * Get theme configuration
 * 
 * @param string $key Configuration key
 * @return mixed Configuration value
 */
function theme_config($key = null) {
    return theme()->getConfig($key);
}