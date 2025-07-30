<?php
/**
 * Default Data Seeder
 * SquidJob Tender Management System
 * 
 * Seeds the database with default system data
 */

require_once __DIR__ . '/../../bootstrap.php';

try {
    $db = Database::getInstance();
    
    echo "Seeding default system data...\n";
    
    // Create default admin user
    echo "Creating default admin user...\n";
    
    $adminExists = $db->query("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
    if ($adminExists->num_rows == 0) {
        $passwordHash = password_hash('admin123', PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (
            username, email, password_hash, first_name, last_name, 
            role, status, email_verified, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $db->prepare($sql);
        $username = 'admin';
        $email = 'admin@squidjob.com';
        $firstName = 'System';
        $lastName = 'Administrator';
        $role = 'admin';
        $status = 'active';
        $emailVerified = 1;
        
        $stmt->bind_param('sssssssi', 
            $username, $email, $passwordHash, $firstName, $lastName, 
            $role, $status, $emailVerified
        );
        
        if ($stmt->execute()) {
            echo "✓ Default admin user created (username: admin, password: admin123)\n";
        } else {
            echo "✗ Failed to create admin user\n";
        }
    } else {
        echo "✓ Admin user already exists\n";
    }
    
    // Create sample tender manager user
    echo "Creating sample tender manager...\n";
    
    $managerExists = $db->query("SELECT id FROM users WHERE username = 'tender_manager' LIMIT 1");
    if ($managerExists->num_rows == 0) {
        $passwordHash = password_hash('manager123', PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (
            username, email, password_hash, first_name, last_name, 
            company_name, role, status, email_verified, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $db->prepare($sql);
        $username = 'tender_manager';
        $email = 'manager@squidjob.com';
        $firstName = 'John';
        $lastName = 'Manager';
        $companyName = 'SquidJob Corporation';
        $role = 'tender_manager';
        $status = 'active';
        $emailVerified = 1;
        
        $stmt->bind_param('ssssssssi', 
            $username, $email, $passwordHash, $firstName, $lastName, 
            $companyName, $role, $status, $emailVerified
        );
        
        if ($stmt->execute()) {
            echo "✓ Sample tender manager created (username: tender_manager, password: manager123)\n";
        } else {
            echo "✗ Failed to create tender manager\n";
        }
    } else {
        echo "✓ Tender manager already exists\n";
    }
    
    // Create sample bidder user
    echo "Creating sample bidder...\n";
    
    $bidderExists = $db->query("SELECT id FROM users WHERE username = 'bidder_demo' LIMIT 1");
    if ($bidderExists->num_rows == 0) {
        $passwordHash = password_hash('bidder123', PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (
            username, email, password_hash, first_name, last_name, 
            company_name, company_registration, role, status, email_verified, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $db->prepare($sql);
        $username = 'bidder_demo';
        $email = 'bidder@example.com';
        $firstName = 'Jane';
        $lastName = 'Bidder';
        $companyName = 'Demo Construction Ltd';
        $companyRegistration = 'REG123456789';
        $role = 'bidder';
        $status = 'active';
        $emailVerified = 1;
        
        $stmt->bind_param('sssssssssi', 
            $username, $email, $passwordHash, $firstName, $lastName, 
            $companyName, $companyRegistration, $role, $status, $emailVerified
        );
        
        if ($stmt->execute()) {
            echo "✓ Sample bidder created (username: bidder_demo, password: bidder123)\n";
        } else {
            echo "✗ Failed to create bidder\n";
        }
    } else {
        echo "✓ Sample bidder already exists\n";
    }
    
    // Create sample tender
    echo "Creating sample tender...\n";
    
    $tenderExists = $db->query("SELECT id FROM tenders WHERE tender_number = 'DEMO-2024-001' LIMIT 1");
    if ($tenderExists->num_rows == 0) {
        // Get admin user ID for created_by
        $adminResult = $db->query("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
        $adminRow = $adminResult->fetch_assoc();
        $adminId = $adminRow['id'];
        
        // Get construction category ID
        $categoryResult = $db->query("SELECT id FROM tender_categories WHERE name = 'Construction' LIMIT 1");
        $categoryRow = $categoryResult->fetch_assoc();
        $categoryId = $categoryRow['id'];
        
        $sql = "INSERT INTO tenders (
            tender_number, title, description, category_id, created_by, organization,
            contact_person, contact_email, contact_phone, estimated_value, currency,
            location, submission_deadline, opening_date, project_duration,
            eligibility_criteria, technical_specifications, terms_conditions,
            evaluation_criteria, status, visibility, published_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $stmt = $db->prepare($sql);
        $tenderNumber = 'DEMO-2024-001';
        $title = 'Construction of Office Building';
        $description = 'This is a demonstration tender for the construction of a modern office building with sustainable features and advanced technology integration.';
        $organization = 'SquidJob Corporation';
        $contactPerson = 'John Manager';
        $contactEmail = 'manager@squidjob.com';
        $contactPhone = '+1-555-0123';
        $estimatedValue = 2500000.00;
        $currency = 'USD';
        $location = 'New York, NY';
        $submissionDeadline = date('Y-m-d H:i:s', strtotime('+30 days'));
        $openingDate = date('Y-m-d H:i:s', strtotime('+32 days'));
        $projectDuration = '18 months';
        $eligibilityCriteria = 'Minimum 5 years experience in commercial construction, valid contractor license, financial capacity of $3M+';
        $technicalSpecs = 'LEED Gold certification required, steel frame construction, 50,000 sq ft total area, parking for 200 vehicles';
        $termsConditions = 'Standard construction contract terms apply. Performance bond required. Payment terms: 30 days net.';
        $evaluationCriteria = 'Technical proposal (60%), Financial proposal (30%), Company experience (10%)';
        $status = 'published';
        $visibility = 'public';
        
        $stmt->bind_param('ssssissssdssssssssss', 
            $tenderNumber, $title, $description, $categoryId, $adminId, $organization,
            $contactPerson, $contactEmail, $contactPhone, $estimatedValue, $currency,
            $location, $submissionDeadline, $openingDate, $projectDuration,
            $eligibilityCriteria, $technicalSpecs, $termsConditions,
            $evaluationCriteria, $status, $visibility
        );
        
        if ($stmt->execute()) {
            echo "✓ Sample tender created (DEMO-2024-001)\n";
        } else {
            echo "✗ Failed to create sample tender\n";
        }
    } else {
        echo "✓ Sample tender already exists\n";
    }
    
    // Update system settings with realistic values
    echo "Updating system settings...\n";
    
    $settings = [
        'site_name' => 'SquidJob Tender Management System',
        'site_description' => 'Professional tender management and bidding platform for modern businesses',
        'admin_email' => 'admin@squidjob.com',
        'timezone' => 'America/New_York',
        'date_format' => 'Y-m-d',
        'time_format' => 'H:i:s',
        'items_per_page' => '25',
        'enable_registration' => 'true',
        'require_email_verification' => 'true',
        'maintenance_mode' => 'false'
    ];
    
    foreach ($settings as $key => $value) {
        $checkSql = "SELECT id FROM system_settings WHERE setting_key = ? LIMIT 1";
        $checkStmt = $db->prepare($checkSql);
        $checkStmt->bind_param('s', $key);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        
        if ($result->num_rows == 0) {
            $insertSql = "INSERT INTO system_settings (setting_key, setting_value, setting_type, category, is_public) 
                         VALUES (?, ?, 'string', 'general', 1)";
            $insertStmt = $db->prepare($insertSql);
            $insertStmt->bind_param('ss', $key, $value);
            $insertStmt->execute();
        } else {
            $updateSql = "UPDATE system_settings SET setting_value = ? WHERE setting_key = ?";
            $updateStmt = $db->prepare($updateSql);
            $updateStmt->bind_param('ss', $value, $key);
            $updateStmt->execute();
        }
    }
    
    echo "✓ System settings updated\n";
    
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "Default data seeding completed successfully!\n";
    echo str_repeat("=", 50) . "\n";
    echo "Default Login Credentials:\n";
    echo "Admin: admin / admin123\n";
    echo "Tender Manager: tender_manager / manager123\n";
    echo "Bidder: bidder_demo / bidder123\n";
    echo str_repeat("=", 50) . "\n";
    
} catch (Exception $e) {
    echo "Error seeding database: " . $e->getMessage() . "\n";
    exit(1);
}