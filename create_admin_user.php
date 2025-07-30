<?php
/**
 * Create Admin User Script
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

    // Check if users table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() == 0) {
        echo "Users table doesn't exist. Creating it...\n";
        
        // Create users table
        $createTable = "
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            department VARCHAR(100),
            designation VARCHAR(100),
            status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
            email_verified BOOLEAN DEFAULT TRUE,
            profile_image VARCHAR(255),
            remember_token VARCHAR(255),
            password_reset_token VARCHAR(255),
            password_reset_expires DATETIME,
            email_verification_token VARCHAR(255),
            last_login DATETIME,
            password_changed_at DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $pdo->exec($createTable);
        echo "Users table created successfully.\n";
    }

    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute(['admin@squidjob.com']);
    $adminUser = $stmt->fetch();

    if ($adminUser) {
        echo "Admin user already exists.\n";
        echo "Email: " . $adminUser['email'] . "\n";
        echo "Name: " . $adminUser['first_name'] . " " . $adminUser['last_name'] . "\n";
        echo "Status: " . $adminUser['status'] . "\n";
        
        // Update password to ensure it's correct
        $newPasswordHash = password_hash('admin123', PASSWORD_BCRYPT, ['cost' => 12]);
        $updateStmt = $pdo->prepare("UPDATE users SET password_hash = ?, password_changed_at = NOW() WHERE email = ?");
        $updateStmt->execute([$newPasswordHash, 'admin@squidjob.com']);
        echo "Password updated for admin user.\n";
        
    } else {
        echo "Creating admin user...\n";
        
        // Create admin user
        $passwordHash = password_hash('admin123', PASSWORD_BCRYPT, ['cost' => 12]);
        
        $insertStmt = $pdo->prepare("
            INSERT INTO users (
                first_name, last_name, email, password_hash, 
                phone, department, designation, status, 
                email_verified, password_changed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
            true
        ]);
        
        echo "Admin user created successfully!\n";
        echo "Email: admin@squidjob.com\n";
        echo "Password: admin123\n";
    }

    // Test password verification
    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE email = ?");
    $stmt->execute(['admin@squidjob.com']);
    $user = $stmt->fetch();
    
    if ($user && password_verify('admin123', $user['password_hash'])) {
        echo "✅ Password verification test: PASSED\n";
    } else {
        echo "❌ Password verification test: FAILED\n";
    }

} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}