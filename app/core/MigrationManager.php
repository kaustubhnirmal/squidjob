<?php
/**
 * Migration Manager
 * SquidJob Tender Management System
 * 
 * Handles database migrations and versioned updates
 */

class MigrationManager {
    private $db;
    private $migrationsPath;
    private $migrationTable = 'migrations';
    
    public function __construct($database = null) {
        $this->db = $database ?: Database::getInstance();
        $this->migrationsPath = __DIR__ . '/../../database/migrations/';
        $this->ensureMigrationTable();
    }
    
    /**
     * Ensure migration tracking table exists
     */
    private function ensureMigrationTable() {
        $sql = "CREATE TABLE IF NOT EXISTS `{$this->migrationTable}` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `migration` varchar(255) NOT NULL,
            `batch` int(11) NOT NULL,
            `executed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `idx_migration_name` (`migration`),
            KEY `idx_migration_batch` (`batch`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $this->db->query($sql);
    }
    
    /**
     * Run pending migrations
     */
    public function migrate($target = null) {
        $pendingMigrations = $this->getPendingMigrations();
        
        if (empty($pendingMigrations)) {
            echo "No pending migrations.\n";
            return true;
        }
        
        $batch = $this->getNextBatchNumber();
        $executed = [];
        
        try {
            $this->db->beginTransaction();
            
            foreach ($pendingMigrations as $migration) {
                if ($target && $migration > $target) {
                    break;
                }
                
                echo "Migrating: {$migration}\n";
                
                if ($this->executeMigration($migration, 'up')) {
                    $this->recordMigration($migration, $batch);
                    $executed[] = $migration;
                    echo "Migrated: {$migration}\n";
                } else {
                    throw new Exception("Failed to execute migration: {$migration}");
                }
            }
            
            $this->db->commit();
            echo "Migration completed successfully. Executed " . count($executed) . " migrations.\n";
            return true;
            
        } catch (Exception $e) {
            $this->db->rollback();
            echo "Migration failed: " . $e->getMessage() . "\n";
            
            // Rollback executed migrations in this batch
            foreach (array_reverse($executed) as $migration) {
                echo "Rolling back: {$migration}\n";
                $this->executeMigration($migration, 'down');
                $this->removeMigrationRecord($migration);
            }
            
            return false;
        }
    }
    
    /**
     * Rollback migrations
     */
    public function rollback($steps = 1) {
        $migrations = $this->getExecutedMigrations($steps);
        
        if (empty($migrations)) {
            echo "No migrations to rollback.\n";
            return true;
        }
        
        try {
            $this->db->beginTransaction();
            
            foreach ($migrations as $migration) {
                echo "Rolling back: {$migration['migration']}\n";
                
                if ($this->executeMigration($migration['migration'], 'down')) {
                    $this->removeMigrationRecord($migration['migration']);
                    echo "Rolled back: {$migration['migration']}\n";
                } else {
                    throw new Exception("Failed to rollback migration: {$migration['migration']}");
                }
            }
            
            $this->db->commit();
            echo "Rollback completed successfully.\n";
            return true;
            
        } catch (Exception $e) {
            $this->db->rollback();
            echo "Rollback failed: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    /**
     * Get migration status
     */
    public function status() {
        $allMigrations = $this->getAllMigrationFiles();
        $executedMigrations = $this->getExecutedMigrationNames();
        
        echo "Migration Status:\n";
        echo str_repeat("-", 50) . "\n";
        
        foreach ($allMigrations as $migration) {
            $status = in_array($migration, $executedMigrations) ? "✓ Executed" : "✗ Pending";
            echo sprintf("%-30s %s\n", $migration, $status);
        }
        
        echo str_repeat("-", 50) . "\n";
        echo "Total migrations: " . count($allMigrations) . "\n";
        echo "Executed: " . count($executedMigrations) . "\n";
        echo "Pending: " . (count($allMigrations) - count($executedMigrations)) . "\n";
    }
    
    /**
     * Create a new migration file
     */
    public function createMigration($name, $type = 'table') {
        $timestamp = date('Y_m_d_His');
        $className = $this->studlyCase($name);
        $filename = "{$timestamp}_{$name}.php";
        $filepath = $this->migrationsPath . $filename;
        
        // Ensure migrations directory exists
        if (!is_dir($this->migrationsPath)) {
            mkdir($this->migrationsPath, 0755, true);
        }
        
        $template = $this->getMigrationTemplate($className, $type);
        
        if (file_put_contents($filepath, $template)) {
            echo "Migration created: {$filename}\n";
            return $filename;
        } else {
            echo "Failed to create migration file.\n";
            return false;
        }
    }
    
    /**
     * Get pending migrations
     */
    private function getPendingMigrations() {
        $allMigrations = $this->getAllMigrationFiles();
        $executedMigrations = $this->getExecutedMigrationNames();
        
        return array_diff($allMigrations, $executedMigrations);
    }
    
    /**
     * Get all migration files
     */
    private function getAllMigrationFiles() {
        if (!is_dir($this->migrationsPath)) {
            return [];
        }
        
        $files = scandir($this->migrationsPath);
        $migrations = [];
        
        foreach ($files as $file) {
            if (preg_match('/^\d{4}_\d{2}_\d{2}_\d{6}_(.+)\.php$/', $file)) {
                $migrations[] = pathinfo($file, PATHINFO_FILENAME);
            }
        }
        
        sort($migrations);
        return $migrations;
    }
    
    /**
     * Get executed migration names
     */
    private function getExecutedMigrationNames() {
        $sql = "SELECT migration FROM {$this->migrationTable} ORDER BY id";
        $result = $this->db->query($sql);
        
        $migrations = [];
        while ($row = $result->fetch_assoc()) {
            $migrations[] = $row['migration'];
        }
        
        return $migrations;
    }
    
    /**
     * Get executed migrations for rollback
     */
    private function getExecutedMigrations($steps) {
        $sql = "SELECT migration, batch FROM {$this->migrationTable} 
                ORDER BY id DESC LIMIT ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('i', $steps);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $migrations = [];
        while ($row = $result->fetch_assoc()) {
            $migrations[] = $row;
        }
        
        return $migrations;
    }
    
    /**
     * Execute a migration
     */
    private function executeMigration($migration, $direction = 'up') {
        $filepath = $this->migrationsPath . $migration . '.php';
        
        if (!file_exists($filepath)) {
            throw new Exception("Migration file not found: {$filepath}");
        }
        
        // Include the migration file
        require_once $filepath;
        
        // Extract class name from migration name
        $parts = explode('_', $migration);
        $className = $this->studlyCase(implode('_', array_slice($parts, 4)));
        
        if (!class_exists($className)) {
            throw new Exception("Migration class not found: {$className}");
        }
        
        $migrationInstance = new $className($this->db);
        
        if (!method_exists($migrationInstance, $direction)) {
            throw new Exception("Method {$direction} not found in migration: {$className}");
        }
        
        try {
            $migrationInstance->$direction();
            return true;
        } catch (Exception $e) {
            echo "Error in migration {$migration}: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    /**
     * Record migration execution
     */
    private function recordMigration($migration, $batch) {
        $sql = "INSERT INTO {$this->migrationTable} (migration, batch) VALUES (?, ?)";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('si', $migration, $batch);
        return $stmt->execute();
    }
    
    /**
     * Remove migration record
     */
    private function removeMigrationRecord($migration) {
        $sql = "DELETE FROM {$this->migrationTable} WHERE migration = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param('s', $migration);
        return $stmt->execute();
    }
    
    /**
     * Get next batch number
     */
    private function getNextBatchNumber() {
        $sql = "SELECT MAX(batch) as max_batch FROM {$this->migrationTable}";
        $result = $this->db->query($sql);
        $row = $result->fetch_assoc();
        
        return ($row['max_batch'] ?? 0) + 1;
    }
    
    /**
     * Convert string to StudlyCase
     */
    private function studlyCase($string) {
        return str_replace(' ', '', ucwords(str_replace(['_', '-'], ' ', $string)));
    }
    
    /**
     * Get migration template
     */
    private function getMigrationTemplate($className, $type) {
        $template = "<?php\n/**\n * Migration: {$className}\n * Generated: " . date('Y-m-d H:i:s') . "\n */\n\n";
        
        switch ($type) {
            case 'table':
                $template .= $this->getTableMigrationTemplate($className);
                break;
            case 'alter':
                $template .= $this->getAlterMigrationTemplate($className);
                break;
            case 'data':
                $template .= $this->getDataMigrationTemplate($className);
                break;
            default:
                $template .= $this->getBasicMigrationTemplate($className);
        }
        
        return $template;
    }
    
    /**
     * Get table migration template
     */
    private function getTableMigrationTemplate($className) {
        return "class {$className} {
    private \$db;
    
    public function __construct(\$database) {
        \$this->db = \$database;
    }
    
    /**
     * Run the migration
     */
    public function up() {
        \$sql = \"CREATE TABLE IF NOT EXISTS `table_name` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `name` varchar(255) NOT NULL,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_name` (`name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci\";
        
        return \$this->db->query(\$sql);
    }
    
    /**
     * Reverse the migration
     */
    public function down() {
        \$sql = \"DROP TABLE IF EXISTS `table_name`\";
        return \$this->db->query(\$sql);
    }
}";
    }
    
    /**
     * Get alter migration template
     */
    private function getAlterMigrationTemplate($className) {
        return "class {$className} {
    private \$db;
    
    public function __construct(\$database) {
        \$this->db = \$database;
    }
    
    /**
     * Run the migration
     */
    public function up() {
        \$sql = \"ALTER TABLE `table_name` ADD COLUMN `new_column` varchar(255) DEFAULT NULL\";
        return \$this->db->query(\$sql);
    }
    
    /**
     * Reverse the migration
     */
    public function down() {
        \$sql = \"ALTER TABLE `table_name` DROP COLUMN `new_column`\";
        return \$this->db->query(\$sql);
    }
}";
    }
    
    /**
     * Get data migration template
     */
    private function getDataMigrationTemplate($className) {
        return "class {$className} {
    private \$db;
    
    public function __construct(\$database) {
        \$this->db = \$database;
    }
    
    /**
     * Run the migration
     */
    public function up() {
        \$sql = \"INSERT INTO `table_name` (`column1`, `column2`) VALUES (?, ?)\";
        \$stmt = \$this->db->prepare(\$sql);
        \$stmt->bind_param('ss', \$value1, \$value2);
        
        // Add your data here
        \$value1 = 'example_value1';
        \$value2 = 'example_value2';
        
        return \$stmt->execute();
    }
    
    /**
     * Reverse the migration
     */
    public function down() {
        \$sql = \"DELETE FROM `table_name` WHERE `column1` = ?\";
        \$stmt = \$this->db->prepare(\$sql);
        \$stmt->bind_param('s', \$value1);
        
        \$value1 = 'example_value1';
        
        return \$stmt->execute();
    }
}";
    }
    
    /**
     * Get basic migration template
     */
    private function getBasicMigrationTemplate($className) {
        return "class {$className} {
    private \$db;
    
    public function __construct(\$database) {
        \$this->db = \$database;
    }
    
    /**
     * Run the migration
     */
    public function up() {
        // Add your migration logic here
        return true;
    }
    
    /**
     * Reverse the migration
     */
    public function down() {
        // Add your rollback logic here
        return true;
    }
}";
    }
    
    /**
     * Fresh migration (drop all tables and re-run)
     */
    public function fresh() {
        echo "WARNING: This will drop all tables and re-run all migrations!\n";
        echo "Are you sure? (yes/no): ";
        
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        fclose($handle);
        
        if (trim($line) !== 'yes') {
            echo "Operation cancelled.\n";
            return false;
        }
        
        // Drop all tables
        $this->dropAllTables();
        
        // Re-run all migrations
        return $this->migrate();
    }
    
    /**
     * Drop all tables
     */
    private function dropAllTables() {
        // Get all tables
        $sql = "SHOW TABLES";
        $result = $this->db->query($sql);
        
        $tables = [];
        while ($row = $result->fetch_array()) {
            $tables[] = $row[0];
        }
        
        if (!empty($tables)) {
            // Disable foreign key checks
            $this->db->query("SET FOREIGN_KEY_CHECKS = 0");
            
            // Drop all tables
            foreach ($tables as $table) {
                $this->db->query("DROP TABLE IF EXISTS `{$table}`");
                echo "Dropped table: {$table}\n";
            }
            
            // Re-enable foreign key checks
            $this->db->query("SET FOREIGN_KEY_CHECKS = 1");
        }
    }
    
    /**
     * Seed database with initial data
     */
    public function seed($seeder = null) {
        $seedersPath = __DIR__ . '/../../database/seeders/';
        
        if ($seeder) {
            return $this->runSeeder($seedersPath . $seeder . '.php');
        }
        
        // Run all seeders
        if (!is_dir($seedersPath)) {
            echo "Seeders directory not found.\n";
            return false;
        }
        
        $files = scandir($seedersPath);
        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'php') {
                $this->runSeeder($seedersPath . $file);
            }
        }
        
        return true;
    }
    
    /**
     * Run a specific seeder
     */
    private function runSeeder($filepath) {
        if (!file_exists($filepath)) {
            echo "Seeder file not found: {$filepath}\n";
            return false;
        }
        
        echo "Running seeder: " . basename($filepath) . "\n";
        
        try {
            require_once $filepath;
            echo "Seeder completed: " . basename($filepath) . "\n";
            return true;
        } catch (Exception $e) {
            echo "Seeder failed: " . $e->getMessage() . "\n";
            return false;
        }
    }
}