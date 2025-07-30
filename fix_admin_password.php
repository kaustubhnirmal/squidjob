<?php
/**
 * Fix Admin Password Script
 * SquidJob Tender Management System
 */

// Database configuration
$config = [
    'host' => 'localhost',
    'port' => '3306',
    'database' => 'squidjob',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4'
];

try {
    // Connect to database
    $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    echo "Connected to database successfully.\n";

    // Check current admin user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute(['admin@squidjob.com']);
    $adminUser = $stmt->fetch();

    if ($adminUser) {
        echo "Current admin user found:\n";
        echo "ID: " . $adminUser['id'] . "\n";
        echo "Email: " . $adminUser['email'] . "\n";
        echo "Name: " . $adminUser['first_name'] . " " . $adminUser['last_name'] . "\n";
        echo "Status: " . $adminUser['status'] . "\n";
        
        // Update password
        $newPasswordHash = password_hash('admin123', PASSWORD_BCRYPT, ['cost' => 12]);
        $updateStmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
        $updateStmt->execute([$newPasswordHash, 'admin@squidjob.com']);
        echo "✅ Password updated successfully!\n";
        
        // Test password verification
        if (password_verify('admin123', $newPasswordHash)) {
            echo "✅ Password verification test: PASSED\n";
        } else {
            echo "❌ Password verification test: FAILED\n";
        }
        
        // Show the hash for debugging
        echo "New password hash: " . $newPasswordHash . "\n";
        
    } else {
        echo "❌ Admin user not found!\n";
        
        // Create admin user
        echo "Creating admin user...\n";
        $passwordHash = password_hash('admin123', PASSWORD_BCRYPT, ['cost' => 12]);
        
        $insertStmt = $pdo->prepare("
            INSERT INTO users (
                first_name, last_name, email, password_hash, 
                phone, department, designation, status, email_verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $insertStmt->execute([
            'Admin',
            'User',
            'admin@squidjob.com',
            $passwordHash,
            '+91-9876543210',
            'Administration',
            'System Administrator',
            'active',
            1
        ]);
        
        echo "✅ Admin user created successfully!\n";
    }

    echo "\n=== Login Credentials ===\n";
    echo "Email: admin@squidjob.com\n";
    echo "Password: admin123\n";
    echo "========================\n";

} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}