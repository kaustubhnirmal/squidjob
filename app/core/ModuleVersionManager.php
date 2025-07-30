<?php
/**
 * Module Version Manager
 * SquidJob Tender Management System
 * 
 * Handles module versioning and updates
 */

class ModuleVersionManager {
    private $db;
    private $moduleVersionTable = 'module_versions';
    
    public function __construct($database = null) {
        $this->db = $database ?: Database::getInstance();
        $this->ensureModuleVersionTable();
    }
    
    /**
     * Ensure module version tracking table exists
     */
    private function ensureModuleVersionTable() {
        $sql = "CREATE TABLE IF NOT EXISTS `{$this->moduleVersionTable}` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `module_name` varchar(100) NOT NULL,
            `version` varchar(20) NOT NULL,
            `previous_version` varchar(20) DEFAULT NULL,
            `update_type` enum('install','upgrade','downgrade','reinstall') NOT NULL DEFAULT 'install',
            `migration_files` json DEFAULT NULL,
            `update_notes` text DEFAULT NULL,
            `installed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_module_version` (`module_name`),
            KEY `idx_module_version_type` (`update_type`),
            KEY `idx_module_installed` (`installed_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $this->db->query($sql);
    }
    
    /**
     * Install a new module
     */
    public function installModule($moduleName, $version, $migrationFiles = []) {
        try {
            $this->db->beginTransaction();
            
            // Check if module already exists
            if ($this->isModuleInstalled($moduleName)) {
                throw new Exception("Module {$moduleName} is already installed");
            }
            
            // Run module installation migrations
            if (!empty($migrationFiles)) {
                foreach ($migrationFiles as $migrationFile) {
                    $this->runModuleMigration($moduleName, $migrationFile, 'up');
                }
            }
            
            // Record module installation
            $this->recordModuleVersion($moduleName, $version, null, 'install', $migrationFiles);
            
            $this->db->commit();
            echo "✓ Module {$moduleName} v{$version} installed successfully\n";
            return true;
            
        } catch (Exception $e) {
            $this->db->rollback();
            echo "✗ Failed to install module {$moduleName}: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    /**
     * Update an existing module
     */
    public function updateModule($moduleName, $newVersion, $migrationFiles = [], $updateNotes = '') {
        try {
            $this->db->beginTransaction();
            
            $currentVersion = $this->getModuleVersion($moduleName);
            if (!$currentVersion) {
                throw new Exception("Module {$moduleName} is not installed");
            }
            
            if (version_compare($newVersion, $currentVersion, '<=')) {
                throw new Exception("New version {$newVersion} must be greater than current version {$currentVersion}");
            }
            
            // Run update migrations
            if (!empty($migrationFiles)) {
                foreach ($migrationFiles as $migrationFile) {
                    $this->runModuleMigration($moduleName, $migrationFile, 'up');
                }
            }
            
            // Update module version record
            $this->recordModuleVersion($moduleName, $newVersion, $currentVersion, 'upgrade', $migrationFiles, $updateNotes);
            
            $this->db->commit();
            echo "✓ Module {$moduleName} updated from v{$currentVersion} to v{$newVersion}\n";
            return true;
            
        } catch (Exception $e) {
            $this->db->rollback();
            echo "✗ Failed to update module {$moduleName}: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    /**
     * Uninstall a module
     */
    public function uninstallModule($moduleName) {
        try {
            $this->db->beginTransaction();
            
            if (!$this->isModuleInstalled($moduleName)) {
                throw new Exception("Module {$moduleName} is not installed");
            }
            
            // Get module's migration files and run them in reverse
            $moduleRecord = $this->getModuleRecord($moduleName);
            if ($moduleRecord && !empty($moduleRecord['migration_files'])) {
                $migrationFiles = json_decode($moduleRecord['migration_files'], true);
                foreach (array_reverse($migrationFiles) as $migrationFile) {
                    $this->runModuleMigration($moduleName, $migrationFile, 'down');
                }
            }
            
            // Remove module version record
            $this->removeModuleRecord($moduleName);
            
            $this->db->commit();
            echo "✓ Module {$moduleName} uninstalled successfully\n";
            return true;
            
        } catch (Exception $e) {
            $this->db->rollback();
            echo "✗ Failed to uninstall module {$moduleName}: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    /**
     * List all installed modules
     */
    public function listModules() {
        $sql = "SELECT * FROM {$this->moduleVersionTable} ORDER BY module_name";
        $result = $this->db->query($sql);
        
        $modules = [];
        while ($row = $result->fetch_assoc()) {
            $modules[] = $row;
        }
        
        return $modules;
    }
    
    /**
     * Show module status
     */
    public function showModuleStatus() {
        $modules = $this->listModules();
        
        echo "Installed Modules:\n";
        echo str_repeat("-", 70) . "\n";
        echo sprintf("%-20s %-15s %-15s %-15s\n", "Module", "Version", "Update Type", "Installed");
        echo str_repeat("-", 70) . "\n";
        
        foreach ($modules as $module) {
            echo sprintf("%-20s %-15s %-15s %-15s\n", 
                $module['module_name'],
                $module['version'],
                $module['update_type'],
                date('Y-m-d H:i', strtotime($module['installed_at']))
            );
        }
        
        echo str_repeat("-", 70) . "\n";
        echo "Total modules: " . count($modules) . "\n";
    }
    
    /**
     * Check if module is installed
     */
    public function isModuleInstalled($moduleName) {
        $sql = "SELECT id FROM {$this->moduleVersionTable} WHERE module_name = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('s', $moduleName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->num_rows > 0;
    }
    
    /**
     * Get module version
     */
    public function getModuleVersion($moduleName) {
        $sql = "SELECT version FROM {$this->moduleVersionTable} WHERE module_name = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('s', $moduleName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            return $row['version'];
        }
        
        return null;
    }
    
    /**
     * Get module record
     */
    private function getModuleRecord($moduleName) {
        $sql = "SELECT * FROM {$this->moduleVersionTable} WHERE module_name = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('s', $moduleName);
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->fetch_assoc();
    }
    
    /**
     * Record module version
     */
    private function recordModuleVersion($moduleName, $version, $previousVersion, $updateType, $migrationFiles = [], $updateNotes = '') {
        $migrationFilesJson = !empty($migrationFiles) ? json_encode($migrationFiles) : null;
        
        if ($this->isModuleInstalled($moduleName)) {
            // Update existing record
            $sql = "UPDATE {$this->moduleVersionTable} 
                    SET version = ?, previous_version = ?, update_type = ?, 
                        migration_files = ?, update_notes = ?, updated_at = NOW()
                    WHERE module_name = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->bind_param('ssssss', $version, $previousVersion, $updateType, $migrationFilesJson, $updateNotes, $moduleName);
        } else {
            // Insert new record
            $sql = "INSERT INTO {$this->moduleVersionTable} 
                    (module_name, version, previous_version, update_type, migration_files, update_notes)
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->db->prepare($sql);
            $stmt->bind_param('ssssss', $moduleName, $version, $previousVersion, $updateType, $migrationFilesJson, $updateNotes);
        }
        
        return $stmt->execute();
    }
    
    /**
     * Remove module record
     */
    private function removeModuleRecord($moduleName) {
        $sql = "DELETE FROM {$this->moduleVersionTable} WHERE module_name = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('s', $moduleName);
        return $stmt->execute();
    }
    
    /**
     * Run module migration
     */
    private function runModuleMigration($moduleName, $migrationFile, $direction = 'up') {
        $modulePath = __DIR__ . "/../../plugins/{$moduleName}/migrations/";
        $filepath = $modulePath . $migrationFile;
        
        if (!file_exists($filepath)) {
            throw new Exception("Migration file not found: {$filepath}");
        }
        
        // Include the migration file
        require_once $filepath;
        
        // Extract class name from migration file
        $className = $this->getMigrationClassName($migrationFile);
        
        if (!class_exists($className)) {
            throw new Exception("Migration class not found: {$className}");
        }
        
        $migrationInstance = new $className($this->db);
        
        if (!method_exists($migrationInstance, $direction)) {
            throw new Exception("Method {$direction} not found in migration: {$className}");
        }
        
        echo "Running {$moduleName} migration: {$migrationFile} ({$direction})\n";
        
        try {
            $migrationInstance->$direction();
            return true;
        } catch (Exception $e) {
            throw new Exception("Error in migration {$migrationFile}: " . $e->getMessage());
        }
    }
    
    /**
     * Get migration class name from file
     */
    private function getMigrationClassName($migrationFile) {
        $filename = pathinfo($migrationFile, PATHINFO_FILENAME);
        $parts = explode('_', $filename);
        
        // Remove timestamp parts (first 4 parts: YYYY_MM_DD_HHMMSS)
        $nameParts = array_slice($parts, 4);
        
        // Convert to StudlyCase
        return str_replace(' ', '', ucwords(str_replace('_', ' ', implode('_', $nameParts))));
    }
    
    /**
     * Check for module updates
     */
    public function checkForUpdates($moduleName) {
        $moduleConfigPath = __DIR__ . "/../../plugins/{$moduleName}/module.json";
        
        if (!file_exists($moduleConfigPath)) {
            echo "Module configuration not found for {$moduleName}\n";
            return false;
        }
        
        $moduleConfig = json_decode(file_get_contents($moduleConfigPath), true);
        $latestVersion = $moduleConfig['version'] ?? '1.0.0';
        $currentVersion = $this->getModuleVersion($moduleName);
        
        if (!$currentVersion) {
            echo "Module {$moduleName} is not installed\n";
            return false;
        }
        
        if (version_compare($latestVersion, $currentVersion, '>')) {
            echo "Update available for {$moduleName}: {$currentVersion} → {$latestVersion}\n";
            return true;
        } else {
            echo "Module {$moduleName} is up to date (v{$currentVersion})\n";
            return false;
        }
    }
    
    /**
     * Auto-update all modules
     */
    public function autoUpdateModules() {
        $modules = $this->listModules();
        $updatedCount = 0;
        
        foreach ($modules as $module) {
            $moduleName = $module['module_name'];
            
            if ($this->checkForUpdates($moduleName)) {
                // Get module configuration
                $moduleConfigPath = __DIR__ . "/../../plugins/{$moduleName}/module.json";
                $moduleConfig = json_decode(file_get_contents($moduleConfigPath), true);
                
                $newVersion = $moduleConfig['version'];
                $migrationFiles = $moduleConfig['migrations'] ?? [];
                $updateNotes = $moduleConfig['update_notes'] ?? '';
                
                if ($this->updateModule($moduleName, $newVersion, $migrationFiles, $updateNotes)) {
                    $updatedCount++;
                }
            }
        }
        
        echo "\nAuto-update completed. Updated {$updatedCount} module(s).\n";
        return $updatedCount;
    }
}