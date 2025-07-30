<?php
/**
 * Migration: AddTenderAnalyticsFields
 * Generated: 2024-02-01 12:00:00
 */

class AddTenderAnalyticsFields {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Run the migration
     */
    public function up() {
        // Add analytics fields to tenders table
        $sql = "ALTER TABLE `tenders` 
                ADD COLUMN `click_through_rate` decimal(5,2) DEFAULT NULL AFTER `download_count`,
                ADD COLUMN `conversion_rate` decimal(5,2) DEFAULT NULL AFTER `click_through_rate`,
                ADD COLUMN `engagement_score` decimal(5,2) DEFAULT NULL AFTER `conversion_rate`,
                ADD COLUMN `last_activity` timestamp NULL DEFAULT NULL AFTER `engagement_score`";
        
        $result1 = $this->db->query($sql);
        
        // Add indexes for new fields
        $sql2 = "ALTER TABLE `tenders` 
                 ADD INDEX `idx_tenders_ctr` (`click_through_rate`),
                 ADD INDEX `idx_tenders_conversion` (`conversion_rate`),
                 ADD INDEX `idx_tenders_engagement` (`engagement_score`),
                 ADD INDEX `idx_tenders_last_activity` (`last_activity`)";
        
        $result2 = $this->db->query($sql2);
        
        return $result1 && $result2;
    }
    
    /**
     * Reverse the migration
     */
    public function down() {
        // Remove indexes first
        $sql1 = "ALTER TABLE `tenders` 
                 DROP INDEX `idx_tenders_ctr`,
                 DROP INDEX `idx_tenders_conversion`,
                 DROP INDEX `idx_tenders_engagement`,
                 DROP INDEX `idx_tenders_last_activity`";
        
        $this->db->query($sql1); // Don't fail if indexes don't exist
        
        // Remove columns
        $sql2 = "ALTER TABLE `tenders` 
                 DROP COLUMN `click_through_rate`,
                 DROP COLUMN `conversion_rate`,
                 DROP COLUMN `engagement_score`,
                 DROP COLUMN `last_activity`";
        
        return $this->db->query($sql2);
    }
}