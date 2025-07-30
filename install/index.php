<?php
/**
 * SquidJob Tender Management System - Installation Wizard
 * 
 * This file provides a step-by-step installation process for the SquidJob
 * tender management system, including server requirements check, database
 * setup, and admin user creation.
 */

session_start();

// Check if already installed
if (file_exists('../config/installed.lock')) {
    header('Location: installed.php');
    exit();
}

// Installation steps
$steps = [
    1 => 'Welcome',
    2 => 'Server Requirements',
    3 => 'Database Configuration',
    4 => 'Database Installation',
    5 => 'Admin User Setup',
    6 => 'Installation Complete'
];

$currentStep = isset($_GET['step']) ? (int)$_GET['step'] : 1;
$currentStep = max(1, min(6, $currentStep));

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    switch ($currentStep) {
        case 3:
            // Database configuration
            $_SESSION['db_config'] = [
                'host' => $_POST['db_host'] ?? 'localhost',
                'port' => $_POST['db_port'] ?? '3306',
                'database' => $_POST['db_name'] ?? 'squidjob',
                'username' => $_POST['db_user'] ?? '',
                'password' => $_POST['db_pass'] ?? ''
            ];
            
            // Test database connection
            $testResult = testDatabaseConnection($_SESSION['db_config']);
            if ($testResult['success']) {
                header('Location: ?step=4');
                exit();
            } else {
                $error = $testResult['error'];
            }
            break;
            
        case 4:
            // Database installation
            $installResult = installDatabase($_SESSION['db_config']);
            if ($installResult['success']) {
                header('Location: ?step=5');
                exit();
            } else {
                $error = $installResult['error'];
            }
            break;
            
        case 5:
            // Admin user setup
            $adminResult = createAdminUser($_POST, $_SESSION['db_config']);
            if ($adminResult['success']) {
                // Create installation lock file
                createInstallationLock();
                header('Location: ?step=6');
                exit();
            } else {
                $error = $adminResult['error'];
            }
            break;
    }
}

/**
 * Test database connection
 */
function testDatabaseConnection($config) {
    try {
        $dsn = "mysql:host={$config['host']};port={$config['port']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        
        // Test if database exists, create if not
        $stmt = $pdo->prepare("CREATE DATABASE IF NOT EXISTS `{$config['database']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $stmt->execute();
        
        return ['success' => true];
    } catch (PDOException $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Install database schema
 */
function installDatabase($config) {
    try {
        $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        
        // Read and execute SQL schema
        $sqlFile = __DIR__ . '/schema.sql';
        if (!file_exists($sqlFile)) {
            return ['success' => false, 'error' => 'Schema file not found'];
        }
        
        $sql = file_get_contents($sqlFile);
        $statements = explode(';', $sql);
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement)) {
                $pdo->exec($statement);
            }
        }
        
        // Create database config file
        createDatabaseConfig($config);
        
        return ['success' => true];
    } catch (PDOException $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Create admin user
 */
function createAdminUser($data, $config) {
    try {
        $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        
        // Validate input
        if (empty($data['admin_email']) || empty($data['admin_password'])) {
            return ['success' => false, 'error' => 'Email and password are required'];
        }
        
        if (!filter_var($data['admin_email'], FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'error' => 'Invalid email format'];
        }
        
        if (strlen($data['admin_password']) < 6) {
            return ['success' => false, 'error' => 'Password must be at least 6 characters'];
        }
        
        // Create admin user
        $hashedPassword = password_hash($data['admin_password'], PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("
            INSERT INTO users (email, password, first_name, last_name, role, status, created_at) 
            VALUES (?, ?, ?, ?, 'admin', 'active', NOW())
        ");
        
        $stmt->execute([
            $data['admin_email'],
            $hashedPassword,
            $data['admin_first_name'] ?? 'Admin',
            $data['admin_last_name'] ?? 'User'
        ]);
        
        return ['success' => true];
    } catch (PDOException $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Create database configuration file
 */
function createDatabaseConfig($config) {
    $configContent = "<?php
/**
 * Database Configuration - Auto-generated during installation
 */

return [
    'host' => '{$config['host']}',
    'port' => '{$config['port']}',
    'database' => '{$config['database']}',
    'username' => '{$config['username']}',
    'password' => '{$config['password']}',
    'charset' => 'utf8mb4',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
];
";
    
    file_put_contents('../config/database.php', $configContent);
}

/**
 * Create installation lock file
 */
function createInstallationLock() {
    $lockContent = "<?php
/**
 * Installation Lock File
 * This file indicates that SquidJob has been successfully installed.
 * Delete this file to run the installation wizard again.
 */

return [
    'installed' => true,
    'installed_at' => '" . date('Y-m-d H:i:s') . "',
    'version' => '1.0.0'
];
";
    
    if (!is_dir('../config')) {
        mkdir('../config', 0755, true);
    }
    
    file_put_contents('../config/installed.lock', $lockContent);
}

/**
 * Check server requirements
 */
function checkServerRequirements() {
    $requirements = [
        'PHP Version >= 8.0' => [
            'status' => version_compare(PHP_VERSION, '8.0.0', '>='),
            'current' => PHP_VERSION,
            'required' => '8.0.0+'
        ],
        'PDO Extension' => [
            'status' => extension_loaded('pdo'),
            'current' => extension_loaded('pdo') ? 'Enabled' : 'Disabled',
            'required' => 'Enabled'
        ],
        'PDO MySQL Extension' => [
            'status' => extension_loaded('pdo_mysql'),
            'current' => extension_loaded('pdo_mysql') ? 'Enabled' : 'Disabled',
            'required' => 'Enabled'
        ],
        'JSON Extension' => [
            'status' => extension_loaded('json'),
            'current' => extension_loaded('json') ? 'Enabled' : 'Disabled',
            'required' => 'Enabled'
        ],
        'cURL Extension' => [
            'status' => extension_loaded('curl'),
            'current' => extension_loaded('curl') ? 'Enabled' : 'Disabled',
            'required' => 'Enabled'
        ],
        'GD Extension' => [
            'status' => extension_loaded('gd'),
            'current' => extension_loaded('gd') ? 'Enabled' : 'Disabled',
            'required' => 'Enabled'
        ],
        'Config Directory Writable' => [
            'status' => is_writable('../config') || is_writable('..'),
            'current' => is_writable('../config') ? 'Writable' : 'Not Writable',
            'required' => 'Writable'
        ],
        'Storage Directory Writable' => [
            'status' => is_writable('../storage') || is_writable('..'),
            'current' => is_writable('../storage') ? 'Writable' : 'Not Writable',
            'required' => 'Writable'
        ]
    ];
    
    return $requirements;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SquidJob Installation Wizard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-purple: #7c3aed;
            --secondary-purple: #8b5cf6;
            --purple-light: #a78bfa;
            --purple-dark: #5b21b6;
            --white: #ffffff;
            --light-gray: #f8fafc;
            --gray: #64748b;
            --dark-gray: #334155;
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', system-ui, sans-serif;
            background: linear-gradient(135deg, var(--light-gray) 0%, var(--white) 100%);
            min-height: 100vh;
            color: var(--dark-gray);
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }

        .header {
            text-align: center;
            margin-bottom: 3rem;
        }

        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .logo h1 {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-purple);
        }

        .progress-bar {
            background: var(--white);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .progress-steps {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .step {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
        }

        .step-number {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .step.active .step-number {
            background: var(--primary-purple);
            color: var(--white);
        }

        .step.completed .step-number {
            background: var(--success);
            color: var(--white);
        }

        .step.inactive .step-number {
            background: var(--light-gray);
            color: var(--gray);
        }

        .progress-line {
            height: 2px;
            background: var(--light-gray);
            flex: 1;
            margin: 0 1rem;
        }

        .progress-line.completed {
            background: var(--success);
        }

        .card {
            background: var(--white);
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }

        .card h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--dark-gray);
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            font-weight: 500;
            margin-bottom: 0.5rem;
            color: var(--dark-gray);
        }

        .form-group input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--gray);
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--primary-purple);
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1rem;
        }

        .btn-primary {
            background: var(--primary-purple);
            color: var(--white);
        }

        .btn-primary:hover {
            background: var(--secondary-purple);
            transform: translateY(-2px);
        }

        .btn-secondary {
            background: transparent;
            color: var(--primary-purple);
            border: 2px solid var(--primary-purple);
        }

        .btn-secondary:hover {
            background: var(--primary-purple);
            color: var(--white);
        }

        .requirements-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }

        .requirements-table th,
        .requirements-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--light-gray);
        }

        .requirements-table th {
            background: var(--light-gray);
            font-weight: 600;
        }

        .status-pass {
            color: var(--success);
            font-weight: 600;
        }

        .status-fail {
            color: var(--error);
            font-weight: 600;
        }

        .error-message {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }

        .success-message {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #166534;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }

        .form-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 2rem;
        }

        .welcome-content {
            text-align: center;
            padding: 2rem 0;
        }

        .welcome-content h3 {
            font-size: 1.25rem;
            margin-bottom: 1rem;
            color: var(--dark-gray);
        }

        .welcome-content p {
            color: var(--gray);
            line-height: 1.6;
            margin-bottom: 1rem;
        }

        .feature-list {
            list-style: none;
            margin: 2rem 0;
        }

        .feature-list li {
            padding: 0.5rem 0;
            color: var(--gray);
        }

        .feature-list li:before {
            content: "✓";
            color: var(--success);
            font-weight: bold;
            margin-right: 0.5rem;
        }

        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .progress-steps {
                flex-direction: column;
                gap: 1rem;
            }
            
            .progress-line {
                display: none;
            }
            
            .form-actions {
                flex-direction: column;
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <h1>🦑 SquidJob</h1>
            </div>
            <p>Tender Management System Installation Wizard</p>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar">
            <div class="progress-steps">
                <?php foreach ($steps as $stepNum => $stepName): ?>
                    <div class="step <?php echo $stepNum < $currentStep ? 'completed' : ($stepNum == $currentStep ? 'active' : 'inactive'); ?>">
                        <div class="step-number"><?php echo $stepNum; ?></div>
                        <span><?php echo $stepName; ?></span>
                    </div>
                    <?php if ($stepNum < count($steps)): ?>
                        <div class="progress-line <?php echo $stepNum < $currentStep ? 'completed' : ''; ?>"></div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Step Content -->
        <?php if ($currentStep == 1): ?>
            <!-- Welcome Step -->
            <div class="card">
                <div class="welcome-content">
                    <h2>Welcome to SquidJob Installation</h2>
                    <h3>Hassle-Free Tender Management System</h3>
                    <p>This installation wizard will guide you through setting up your SquidJob tender management system. The process includes:</p>
                    
                    <ul class="feature-list">
                        <li>Server requirements verification</li>
                        <li>Database configuration and setup</li>
                        <li>Administrator account creation</li>
                        <li>System initialization</li>
                    </ul>
                    
                    <p>Before proceeding, please ensure you have:</p>
                    <ul class="feature-list">
                        <li>MySQL database credentials</li>
                        <li>Write permissions on the server</li>
                        <li>Administrator email and password ready</li>
                    </ul>
                </div>
                
                <div class="form-actions">
                    <div></div>
                    <a href="?step=2" class="btn btn-primary">Get Started →</a>
                </div>
            </div>

        <?php elseif ($currentStep == 2): ?>
            <!-- Server Requirements Step -->
            <div class="card">
                <h2>Server Requirements Check</h2>
                <p>Checking your server configuration for compatibility...</p>
                
                <?php $requirements = checkServerRequirements(); ?>
                <?php $allPassed = array_reduce($requirements, function($carry, $req) { return $carry && $req['status']; }, true); ?>
                
                <?php if ($allPassed): ?>
                    <div class="success-message">
                        ✅ All server requirements are met! You can proceed with the installation.
                    </div>
                <?php else: ?>
                    <div class="error-message">
                        ❌ Some server requirements are not met. Please fix the issues below before proceeding.
                    </div>
                <?php endif; ?>
                
                <table class="requirements-table">
                    <thead>
                        <tr>
                            <th>Requirement</th>
                            <th>Status</th>
                            <th>Current</th>
                            <th>Required</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($requirements as $name => $req): ?>
                            <tr>
                                <td><?php echo $name; ?></td>
                                <td class="<?php echo $req['status'] ? 'status-pass' : 'status-fail'; ?>">
                                    <?php echo $req['status'] ? 'PASS' : 'FAIL'; ?>
                                </td>
                                <td><?php echo $req['current']; ?></td>
                                <td><?php echo $req['required']; ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                
                <div class="form-actions">
                    <a href="?step=1" class="btn btn-secondary">← Back</a>
                    <?php if ($allPassed): ?>
                        <a href="?step=3" class="btn btn-primary">Continue →</a>
                    <?php else: ?>
                        <a href="?step=2" class="btn btn-primary">Recheck Requirements</a>
                    <?php endif; ?>
                </div>
            </div>

        <?php elseif ($currentStep == 3): ?>
            <!-- Database Configuration Step -->
            <div class="card">
                <h2>Database Configuration</h2>
                <p>Please provide your MySQL database connection details.</p>
                
                <?php if (isset($error)): ?>
                    <div class="error-message">
                        ❌ Database connection failed: <?php echo htmlspecialchars($error); ?>
                    </div>
                <?php endif; ?>
                
                <form method="POST">
                    <div class="form-group">
                        <label for="db_host">Database Host</label>
                        <input type="text" id="db_host" name="db_host" value="<?php echo $_POST['db_host'] ?? 'localhost'; ?>" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="db_port">Database Port</label>
                        <input type="text" id="db_port" name="db_port" value="<?php echo $_POST['db_port'] ?? '3306'; ?>" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="db_name">Database Name</label>
                        <input type="text" id="db_name" name="db_name" value="<?php echo $_POST['db_name'] ?? 'squidjob'; ?>" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="db_user">Database Username</label>
                        <input type="text" id="db_user" name="db_user" value="<?php echo $_POST['db_user'] ?? ''; ?>" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="db_pass">Database Password</label>
                        <input type="password" id="db_pass" name="db_pass" value="<?php echo $_POST['db_pass'] ?? ''; ?>">
                    </div>
                    
                    <div class="form-actions">
                        <a href="?step=2" class="btn btn-secondary">← Back</a>
                        <button type="submit" class="btn btn-primary">Test Connection →</button>
                    </div>
                </form>
            </div>

        <?php elseif ($currentStep == 4): ?>
            <!-- Database Installation Step -->
            <div class="card">
                <h2>Database Installation</h2>
                <p>Installing database schema and initial data...</p>
                
                <?php if (isset($error)): ?>
                    <div class="error-message">
                        ❌ Database installation failed: <?php echo htmlspecialchars($error); ?>
                    </div>
                    <div class="form-actions">
                        <a href="?step=3" class="btn btn-secondary">← Back to Database Config</a>
                        <form method="POST" style="display: inline;">
                            <button type="submit" class="btn btn-primary">Retry Installation</button>
                        </form>
                    </div>
                <?php else: ?>
                    <div class="success-message">
                        ✅ Database connection successful! Click continue to install the database schema.
                    </div>
                    <form method="POST">
                        <div class="form-actions">
                            <a href="?step=3" class="btn btn-secondary">← Back</a>
                            <button type="submit" class="btn btn-primary">Install Database →</button>
                        </div>
                    </form>
                <?php endif; ?>
            </div>

        <?php elseif ($currentStep == 5): ?>
            <!-- Admin User Setup Step -->
            <div class="card">
                <h2>Administrator Account Setup</h2>
                <p>Create your administrator account to manage the system.</p>
                
                <?php if (isset($error)): ?>
                    <div class="error-message">
                        ❌ <?php echo htmlspecialchars($error); ?>
                    </div>
                <?php endif; ?>
                
                <form method="POST">
                    <div class="form-group">
                        <label for="admin_first_name">First Name</label>
                        <input type="text" id="admin_first_name" name="admin_first_name" value="<?php echo $_POST['admin_first_name'] ?? 'Admin'; ?>" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin_last_name">Last Name</label>
                        <input type="text" id="admin_last_name" name="admin_last_name" value="<?php echo $_POST['admin_last_name'] ?? 'User'; ?>" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin_email">Email Address</label>
                        <input type="email" id="admin_email" name="admin_email" value="<?php echo $_POST['admin_email'] ?? ''; ?>" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin_password">Password</label>
                        <input type="password" id="admin_password" name="admin_password" required>
                        <small style="color: var(--gray);">Minimum 6 characters</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin_password_confirm">Confirm Password</label>
                        <input type="password" id="admin_password_confirm" name="admin_password_confirm" required>
                    </div>
                    
                    <div class="form-actions">
                        <a href="?step=4" class="btn btn-secondary">← Back</a>
                        <button type="submit" class="btn btn-primary">Create Admin Account →</button>
                    </div>
                </form>
            </div>

        <?php elseif ($currentStep == 6): ?>
            <!-- Installation Complete Step -->
            <div class="card">
                <div class="welcome-content">
                    <h2>🎉 Installation Complete!</h2>
                    <h3>SquidJob is now ready to use</h3>
                    
                    <div class="success-message">
                        ✅ Your SquidJob tender management system has been successfully installed and configured.
                    </div>
                    
                    <p>What's next?</p>
                    <ul class="feature-list">
                        <li>Delete the /install directory for security</li>
                        <li>Login with your administrator account</li>
                        <li>Configure system settings</li>
                        <li>Start managing your tenders</li>
                    </ul>
                    
                    <div style="margin-top: 2rem;">
                        <a href="../index.php" class="btn btn-primary" style="margin-right: 1rem;">Go to Dashboard</a>
                        <a href="cleanup.php" class="btn btn-secondary">Delete Install Files</a>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <script>
        // Password confirmation validation
        document.addEventListener('DOMContentLoaded', function() {
            const password = document.getElementById('admin_password');
            const confirmPassword = document.getElementById('admin_password_confirm');
            
            if (password && confirmPassword) {
                function validatePassword() {
                    if (password.value !== confirmPassword.value) {
                        confirmPassword.setCustomValidity('Passwords do not match');
                    } else {
                        confirmPassword.setCustomValidity('');
                    }
                }
                
                password.addEventListener('change', validatePassword);
                confirmPassword.addEventListener('keyup', validatePassword);
            }
        });
    </script>
</body>
</html>