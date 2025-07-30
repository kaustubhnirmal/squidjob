<?php
/**
 * Migration: CreateInitialSchema
 * Generated: 2024-01-01 00:00:01
 */

class CreateInitialSchema {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Run the migration
     */
    public function up() {
        // This migration creates the complete initial schema
        $schemaFile = __DIR__ . '/../complete_schema.sql';
        
        if (!file_exists($schemaFile)) {
            throw new Exception("Schema file not found: {$schemaFile}");
        }
        
        $sql = file_get_contents($schemaFile);
        
        // Split SQL into individual statements
        $statements = array_filter(
            array_map('trim', explode(';', $sql)),
            function($stmt) {
                return !empty($stmt) && 
                       !preg_match('/^(--|\/\*|\*|SET|START|COMMIT)/', $stmt);
            }
        );
        
        foreach ($statements as $statement) {
            if (!empty(trim($statement))) {
                $this->db->query($statement);
            }
        }
        
        return true;
    }
    
    /**
     * Reverse the migration
     */
    public function down() {
        // Get all tables and drop them
        $result = $this->db->query("SHOW TABLES");
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
            }
            
            // Re-enable foreign key checks
            $this->db->query("SET FOREIGN_KEY_CHECKS = 1");
        }
        
        return true;
    }
}