<?php
/**
 * Plugin Manager
 * SquidJob Tender Management System
 * 
 * Manages plugin loading, activation, deactivation, and hooks
 * Provides extensibility for custom requirements and features
 */

namespace App\Core;

class PluginManager {
    
    private static $instance = null;
    private $plugins = [];
    private $activePlugins = [];
    private $hooks = [];
    private $pluginData = [];
    
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
        $this->loadActivePlugins();
        $this->initializePlugins();
    }
    
    /**
     * Load all available plugins
     * 
     * @return void
     */
    public function loadPlugins() {
        $pluginsDir = APP_ROOT . '/plugins';
        
        if (!is_dir($pluginsDir)) {
            return;
        }
        
        $directories = scandir($pluginsDir);
        foreach ($directories as $dir) {
            if ($dir !== '.' && $dir !== '..' && is_dir($pluginsDir . '/' . $dir)) {
                $this->loadPlugin($dir);
            }
        }
    }
    
    /**
     * Load specific plugin
     * 
     * @param string $pluginName Plugin name
     * @return bool Success status
     */
    public function loadPlugin($pluginName) {
        $pluginPath = APP_ROOT . "/plugins/{$pluginName}";
        $configFile = $pluginPath . '/plugin.json';
        
        if (!file_exists($configFile)) {
            return false;
        }
        
        try {
            $config = json_decode(file_get_contents($configFile), true);
            
            // Validate plugin configuration
            if (!$this->validatePluginConfig($config)) {
                error_log("Invalid plugin configuration for: {$pluginName}");
                return false;
            }
            
            // Check compatibility
            if (!$this->checkCompatibility($config)) {
                error_log("Plugin {$pluginName} is not compatible with current version");
                return false;
            }
            
            $this->plugins[$pluginName] = [
                'path' => $pluginPath,
                'config' => $config,
                'loaded' => false,
                'active' => false
            ];
            
            return true;
        } catch (\Exception $e) {
            error_log("Failed to load plugin {$pluginName}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Activate plugin
     * 
     * @param string $pluginName Plugin name
     * @return bool Success status
     */
    public function activatePlugin($pluginName) {
        if (!isset($this->plugins[$pluginName])) {
            return false;
        }
        
        $plugin = $this->plugins[$pluginName];
        
        try {
            // Run activation hook
            $this->runPluginHook($pluginName, 'activate');
            
            // Load plugin main file
            $mainFile = $plugin['path'] . '/' . ($plugin['config']['main'] ?? 'main.php');
            if (file_exists($mainFile)) {
                include_once $mainFile;
            }
            
            // Register plugin hooks
            $this->registerPluginHooks($pluginName);
            
            // Mark as active
            $this->plugins[$pluginName]['active'] = true;
            $this->activePlugins[] = $pluginName;
            
            // Save to database
            $this->saveActivePlugins();
            
            // Execute post-activation hook
            $this->runPluginHook($pluginName, 'post_activate');
            
            return true;
        } catch (\Exception $e) {
            error_log("Failed to activate plugin {$pluginName}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Deactivate plugin
     * 
     * @param string $pluginName Plugin name
     * @return bool Success status
     */
    public function deactivatePlugin($pluginName) {
        if (!isset($this->plugins[$pluginName]) || !$this->plugins[$pluginName]['active']) {
            return false;
        }
        
        try {
            // Run deactivation hook
            $this->runPluginHook($pluginName, 'deactivate');
            
            // Unregister plugin hooks
            $this->unregisterPluginHooks($pluginName);
            
            // Mark as inactive
            $this->plugins[$pluginName]['active'] = false;
            $this->activePlugins = array_diff($this->activePlugins, [$pluginName]);
            
            // Save to database
            $this->saveActivePlugins();
            
            return true;
        } catch (\Exception $e) {
            error_log("Failed to deactivate plugin {$pluginName}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Install plugin
     * 
     * @param string $pluginName Plugin name
     * @return bool Success status
     */
    public function installPlugin($pluginName) {
        if (!isset($this->plugins[$pluginName])) {
            return false;
        }
        
        $plugin = $this->plugins[$pluginName];
        
        try {
            // Run installation script
            $installFile = $plugin['path'] . '/install.php';
            if (file_exists($installFile)) {
                include $installFile;
            }
            
            // Create database tables if needed
            $this->createPluginTables($pluginName);
            
            // Run install hook
            $this->runPluginHook($pluginName, 'install');
            
            return true;
        } catch (\Exception $e) {
            error_log("Failed to install plugin {$pluginName}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Uninstall plugin
     * 
     * @param string $pluginName Plugin name
     * @return bool Success status
     */
    public function uninstallPlugin($pluginName) {
        if (!isset($this->plugins[$pluginName])) {
            return false;
        }
        
        $plugin = $this->plugins[$pluginName];
        
        try {
            // Deactivate first
            if ($plugin['active']) {
                $this->deactivatePlugin($pluginName);
            }
            
            // Run uninstall hook
            $this->runPluginHook($pluginName, 'uninstall');
            
            // Run uninstallation script
            $uninstallFile = $plugin['path'] . '/uninstall.php';
            if (file_exists($uninstallFile)) {
                include $uninstallFile;
            }
            
            // Remove plugin data
            unset($this->plugins[$pluginName]);
            
            return true;
        } catch (\Exception $e) {
            error_log("Failed to uninstall plugin {$pluginName}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Register hook
     * 
     * @param string $hookName Hook name
     * @param callable $callback Callback function
     * @param int $priority Priority (lower = earlier)
     * @param string $pluginName Plugin name
     * @return void
     */
    public function addHook($hookName, $callback, $priority = 10, $pluginName = null) {
        if (!isset($this->hooks[$hookName])) {
            $this->hooks[$hookName] = [];
        }
        
        $this->hooks[$hookName][] = [
            'callback' => $callback,
            'priority' => $priority,
            'plugin' => $pluginName
        ];
        
        // Sort by priority
        usort($this->hooks[$hookName], function($a, $b) {
            return $a['priority'] <=> $b['priority'];
        });
    }
    
    /**
     * Execute hook
     * 
     * @param string $hookName Hook name
     * @param mixed $data Hook data
     * @return mixed Modified data
     */
    public function executeHook($hookName, $data = null) {
        if (!isset($this->hooks[$hookName])) {
            return $data;
        }
        
        foreach ($this->hooks[$hookName] as $hook) {
            try {
                if (is_callable($hook['callback'])) {
                    $data = call_user_func($hook['callback'], $data);
                }
            } catch (\Exception $e) {
                error_log("Hook execution failed for {$hookName}: " . $e->getMessage());
            }
        }
        
        return $data;
    }
    
    /**
     * Get plugin information
     * 
     * @param string $pluginName Plugin name
     * @return array|null Plugin info
     */
    public function getPluginInfo($pluginName) {
        return $this->plugins[$pluginName] ?? null;
    }
    
    /**
     * Get all plugins
     * 
     * @return array All plugins
     */
    public function getAllPlugins() {
        return $this->plugins;
    }
    
    /**
     * Get active plugins
     * 
     * @return array Active plugins
     */
    public function getActivePlugins() {
        return $this->activePlugins;
    }
    
    /**
     * Check if plugin is active
     * 
     * @param string $pluginName Plugin name
     * @return bool Is active
     */
    public function isPluginActive($pluginName) {
        return in_array($pluginName, $this->activePlugins);
    }
    
    /**
     * Get plugin setting
     * 
     * @param string $pluginName Plugin name
     * @param string $key Setting key
     * @param mixed $default Default value
     * @return mixed Setting value
     */
    public function getPluginSetting($pluginName, $key, $default = null) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("SELECT value FROM plugin_settings WHERE plugin_name = ? AND setting_key = ?");
            $stmt->execute([$pluginName, $key]);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($result) {
                return json_decode($result['value'], true);
            }
        } catch (\Exception $e) {
            error_log("Failed to get plugin setting: " . $e->getMessage());
        }
        
        return $default;
    }
    
    /**
     * Set plugin setting
     * 
     * @param string $pluginName Plugin name
     * @param string $key Setting key
     * @param mixed $value Setting value
     * @return bool Success status
     */
    public function setPluginSetting($pluginName, $key, $value) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO plugin_settings (plugin_name, setting_key, value, updated_at) 
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE 
                value = VALUES(value), updated_at = NOW()
            ");
            
            return $stmt->execute([$pluginName, $key, json_encode($value)]);
        } catch (\Exception $e) {
            error_log("Failed to set plugin setting: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Validate plugin configuration
     * 
     * @param array $config Plugin configuration
     * @return bool Is valid
     */
    private function validatePluginConfig($config) {
        $required = ['name', 'version', 'description'];
        
        foreach ($required as $field) {
            if (!isset($config[$field])) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check plugin compatibility
     * 
     * @param array $config Plugin configuration
     * @return bool Is compatible
     */
    private function checkCompatibility($config) {
        if (isset($config['compatibility']['min_version'])) {
            $appVersion = config('app.version', '1.0.0');
            if (version_compare($appVersion, $config['compatibility']['min_version'], '<')) {
                return false;
            }
        }
        
        if (isset($config['compatibility']['php_version'])) {
            if (version_compare(PHP_VERSION, $config['compatibility']['php_version'], '<')) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Load active plugins from database
     * 
     * @return void
     */
    private function loadActivePlugins() {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("SELECT value FROM settings WHERE key_name = ?");
            $stmt->execute(['active_plugins']);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($result) {
                $this->activePlugins = json_decode($result['value'], true) ?? [];
            }
        } catch (\Exception $e) {
            error_log("Failed to load active plugins: " . $e->getMessage());
        }
    }
    
    /**
     * Save active plugins to database
     * 
     * @return void
     */
    private function saveActivePlugins() {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO settings (key_name, value, type, description, updated_by, updated_at) 
                VALUES (?, ?, 'json', 'Active plugins list', ?, NOW())
                ON DUPLICATE KEY UPDATE 
                value = VALUES(value), updated_by = VALUES(updated_by), updated_at = NOW()
            ");
            
            $stmt->execute([
                'active_plugins',
                json_encode($this->activePlugins),
                auth() ? user()['id'] : 1
            ]);
        } catch (\Exception $e) {
            error_log("Failed to save active plugins: " . $e->getMessage());
        }
    }
    
    /**
     * Initialize active plugins
     * 
     * @return void
     */
    private function initializePlugins() {
        $this->loadPlugins();
        
        foreach ($this->activePlugins as $pluginName) {
            if (isset($this->plugins[$pluginName])) {
                $this->activatePlugin($pluginName);
            }
        }
    }
    
    /**
     * Register plugin hooks
     * 
     * @param string $pluginName Plugin name
     * @return void
     */
    private function registerPluginHooks($pluginName) {
        $plugin = $this->plugins[$pluginName];
        $hooksFile = $plugin['path'] . '/hooks.php';
        
        if (file_exists($hooksFile)) {
            include $hooksFile;
        }
    }
    
    /**
     * Unregister plugin hooks
     * 
     * @param string $pluginName Plugin name
     * @return void
     */
    private function unregisterPluginHooks($pluginName) {
        foreach ($this->hooks as $hookName => $hooks) {
            $this->hooks[$hookName] = array_filter($hooks, function($hook) use ($pluginName) {
                return $hook['plugin'] !== $pluginName;
            });
        }
    }
    
    /**
     * Run plugin-specific hook
     * 
     * @param string $pluginName Plugin name
     * @param string $hookName Hook name
     * @return mixed Hook result
     */
    private function runPluginHook($pluginName, $hookName) {
        $plugin = $this->plugins[$pluginName];
        $hookFile = $plugin['path'] . "/hooks/{$hookName}.php";
        
        if (file_exists($hookFile)) {
            return include $hookFile;
        }
        
        return null;
    }
    
    /**
     * Create plugin database tables
     * 
     * @param string $pluginName Plugin name
     * @return void
     */
    private function createPluginTables($pluginName) {
        $plugin = $this->plugins[$pluginName];
        $schemaFile = $plugin['path'] . '/database/schema.sql';
        
        if (file_exists($schemaFile)) {
            try {
                $pdo = getDbConnection();
                $sql = file_get_contents($schemaFile);
                $pdo->exec($sql);
            } catch (\Exception $e) {
                error_log("Failed to create plugin tables for {$pluginName}: " . $e->getMessage());
            }
        }
    }
}

/**
 * Global plugin helper functions
 */

/**
 * Get plugin manager instance
 * 
 * @return PluginManager
 */
function plugins() {
    return PluginManager::getInstance();
}

/**
 * Execute plugin hook
 * 
 * @param string $hookName Hook name
 * @param mixed $data Hook data
 * @return mixed Modified data
 */
function do_hook($hookName, $data = null) {
    return plugins()->executeHook($hookName, $data);
}

/**
 * Add plugin hook
 * 
 * @param string $hookName Hook name
 * @param callable $callback Callback function
 * @param int $priority Priority
 * @param string $pluginName Plugin name
 * @return void
 */
function add_hook($hookName, $callback, $priority = 10, $pluginName = null) {
    plugins()->addHook($hookName, $callback, $priority, $pluginName);
}

/**
 * Check if plugin is active
 * 
 * @param string $pluginName Plugin name
 * @return bool Is active
 */
function is_plugin_active($pluginName) {
    return plugins()->isPluginActive($pluginName);
}

/**
 * Get plugin setting
 * 
 * @param string $pluginName Plugin name
 * @param string $key Setting key
 * @param mixed $default Default value
 * @return mixed Setting value
 */
function get_plugin_setting($pluginName, $key, $default = null) {
    return plugins()->getPluginSetting($pluginName, $key, $default);
}

/**
 * Set plugin setting
 * 
 * @param string $pluginName Plugin name
 * @param string $key Setting key
 * @param mixed $value Setting value
 * @return bool Success status
 */
function set_plugin_setting($pluginName, $key, $value) {
    return plugins()->setPluginSetting($pluginName, $key, $value);
}