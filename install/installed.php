<?php
/**
 * SquidJob Installation - Already Installed Page
 * 
 * This page is shown when the system is already installed
 * and provides system diagnostics and cleanup options.
 */

// Check if installation lock exists
$lockFile = '../config/installed.lock';
$isInstalled = file_exists($lockFile);

if ($isInstalled) {
    $installInfo = include $lockFile;
}

// Run system diagnostics
function runSystemDiagnostics() {
    $diagnostics = [
        'database_connection' => testDatabaseConnection(),
        'file_permissions' => checkFilePermissions(),
        'required_directories' => checkRequiredDirectories(),
        'configuration_files' => checkConfigurationFiles(),
        'security_status' => checkSecurityStatus()
    ];
    
    return $diagnostics;
}

function testDatabaseConnection() {
    try {
        $configFile = '../config/database.php';
        if (!file_exists($configFile)) {
            return ['status' => false, 'message' => 'Database configuration file not found'];
        }
        
        $config = include $configFile;
        $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);
        
        // Test a simple query
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch();
        
        return [
            'status' => true, 
            'message' => 'Database connection successful',
            'details' => "Connected to {$config['database']} with {$result['count']} users"
        ];
    } catch (Exception $e) {
        return ['status' => false, 'message' => 'Database connection failed: ' . $e->getMessage()];
    }
}

function checkFilePermissions() {
    $directories = [
        '../config' => 'Configuration directory',
        '../storage' => 'Storage directory',
        '../storage/uploads' => 'Uploads directory',
        '../storage/logs' => 'Logs directory',
        '../storage/cache' => 'Cache directory'
    ];
    
    $results = [];
    foreach ($directories as $dir => $description) {
        $results[] = [
            'path' => $dir,
            'description' => $description,
            'exists' => is_dir($dir),
            'writable' => is_writable($dir),
            'status' => is_dir($dir) && is_writable($dir)
        ];
    }
    
    return $results;
}

function checkRequiredDirectories() {
    $directories = [
        '../app',
        '../config',
        '../storage',
        '../storage/uploads',
        '../storage/logs',
        '../storage/cache',
        '../public',
        '../public/assets'
    ];
    
    $results = [];
    foreach ($directories as $dir) {
        $results[] = [
            'path' => $dir,
            'exists' => is_dir($dir),
            'status' => is_dir($dir)
        ];
    }
    
    return $results;
}

function checkConfigurationFiles() {
    $files = [
        '../config/database.php' => 'Database configuration',
        '../config/installed.lock' => 'Installation lock file',
        '../.htaccess' => 'Apache configuration',
        '../index.php' => 'Main application file'
    ];
    
    $results = [];
    foreach ($files as $file => $description) {
        $results[] = [
            'path' => $file,
            'description' => $description,
            'exists' => file_exists($file),
            'readable' => is_readable($file),
            'status' => file_exists($file) && is_readable($file)
        ];
    }
    
    return $results;
}

function checkSecurityStatus() {
    $checks = [
        'install_directory' => [
            'description' => 'Install directory should be removed',
            'status' => !is_dir(__DIR__),
            'recommendation' => 'Delete the /install directory for security'
        ],
        'debug_mode' => [
            'description' => 'Debug mode should be disabled in production',
            'status' => !ini_get('display_errors'),
            'recommendation' => 'Disable display_errors in PHP configuration'
        ],
        'https_enabled' => [
            'description' => 'HTTPS should be enabled',
            'status' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
            'recommendation' => 'Enable HTTPS for secure communication'
        ]
    ];
    
    return $checks;
}

$diagnostics = runSystemDiagnostics();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SquidJob - System Status</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-purple: #7c3aed;
            --secondary-purple: #8b5cf6;
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
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem;
        }

        .header {
            text-align: center;
            margin-bottom: 3rem;
        }

        .logo h1 {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-purple);
            margin-bottom: 0.5rem;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .status-installed {
            background: #f0fdf4;
            color: #166534;
            border: 1px solid #bbf7d0;
        }

        .status-warning {
            background: #fffbeb;
            color: #92400e;
            border: 1px solid #fde68a;
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

        .diagnostic-section {
            margin-bottom: 2rem;
        }

        .diagnostic-section h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--dark-gray);
        }

        .diagnostic-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
        }

        .diagnostic-table th,
        .diagnostic-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--light-gray);
        }

        .diagnostic-table th {
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

        .status-warning {
            color: var(--warning);
            font-weight: 600;
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

        .btn-danger {
            background: var(--error);
            color: var(--white);
        }

        .btn-danger:hover {
            background: #dc2626;
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

        .actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }

        .warning-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .info-item {
            background: var(--light-gray);
            padding: 1rem;
            border-radius: 8px;
        }

        .info-item strong {
            display: block;
            color: var(--dark-gray);
            margin-bottom: 0.25rem;
        }

        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .actions {
                flex-direction: column;
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
            
            <?php if ($isInstalled): ?>
                <div class="status-badge status-installed">
                    ✅ System is installed and running
                </div>
            <?php else: ?>
                <div class="status-badge status-warning">
                    ⚠️ Installation not detected
                </div>
            <?php endif; ?>
        </div>

        <?php if ($isInstalled): ?>
            <!-- Installation Information -->
            <div class="card">
                <h2>Installation Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Installation Date</strong>
                        <?php echo $installInfo['installed_at'] ?? 'Unknown'; ?>
                    </div>
                    <div class="info-item">
                        <strong>Version</strong>
                        <?php echo $installInfo['version'] ?? '1.0.0'; ?>
                    </div>
                    <div class="info-item">
                        <strong>PHP Version</strong>
                        <?php echo PHP_VERSION; ?>
                    </div>
                    <div class="info-item">
                        <strong>Server Software</strong>
                        <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?>
                    </div>
                </div>
            </div>

            <!-- System Diagnostics -->
            <div class="card">
                <h2>System Diagnostics</h2>
                
                <!-- Database Connection -->
                <div class="diagnostic-section">
                    <h3>Database Connection</h3>
                    <?php $dbStatus = $diagnostics['database_connection']; ?>
                    <p class="<?php echo $dbStatus['status'] ? 'status-pass' : 'status-fail'; ?>">
                        <?php echo $dbStatus['message']; ?>
                        <?php if (isset($dbStatus['details'])): ?>
                            <br><small><?php echo $dbStatus['details']; ?></small>
                        <?php endif; ?>
                    </p>
                </div>

                <!-- File Permissions -->
                <div class="diagnostic-section">
                    <h3>File Permissions</h3>
                    <table class="diagnostic-table">
                        <thead>
                            <tr>
                                <th>Directory</th>
                                <th>Exists</th>
                                <th>Writable</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($diagnostics['file_permissions'] as $perm): ?>
                                <tr>
                                    <td><?php echo $perm['description']; ?></td>
                                    <td class="<?php echo $perm['exists'] ? 'status-pass' : 'status-fail'; ?>">
                                        <?php echo $perm['exists'] ? 'Yes' : 'No'; ?>
                                    </td>
                                    <td class="<?php echo $perm['writable'] ? 'status-pass' : 'status-fail'; ?>">
                                        <?php echo $perm['writable'] ? 'Yes' : 'No'; ?>
                                    </td>
                                    <td class="<?php echo $perm['status'] ? 'status-pass' : 'status-fail'; ?>">
                                        <?php echo $perm['status'] ? 'OK' : 'FAIL'; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>

                <!-- Configuration Files -->
                <div class="diagnostic-section">
                    <h3>Configuration Files</h3>
                    <table class="diagnostic-table">
                        <thead>
                            <tr>
                                <th>File</th>
                                <th>Exists</th>
                                <th>Readable</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($diagnostics['configuration_files'] as $file): ?>
                                <tr>
                                    <td><?php echo $file['description']; ?></td>
                                    <td class="<?php echo $file['exists'] ? 'status-pass' : 'status-fail'; ?>">
                                        <?php echo $file['exists'] ? 'Yes' : 'No'; ?>
                                    </td>
                                    <td class="<?php echo $file['readable'] ? 'status-pass' : 'status-fail'; ?>">
                                        <?php echo $file['readable'] ? 'Yes' : 'No'; ?>
                                    </td>
                                    <td class="<?php echo $file['status'] ? 'status-pass' : 'status-fail'; ?>">
                                        <?php echo $file['status'] ? 'OK' : 'FAIL'; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>

                <!-- Security Status -->
                <div class="diagnostic-section">
                    <h3>Security Status</h3>
                    <table class="diagnostic-table">
                        <thead>
                            <tr>
                                <th>Check</th>
                                <th>Status</th>
                                <th>Recommendation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($diagnostics['security_status'] as $check): ?>
                                <tr>
                                    <td><?php echo $check['description']; ?></td>
                                    <td class="<?php echo $check['status'] ? 'status-pass' : 'status-warning'; ?>">
                                        <?php echo $check['status'] ? 'PASS' : 'WARNING'; ?>
                                    </td>
                                    <td><?php echo $check['recommendation']; ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Security Warning -->
            <div class="warning-box">
                <strong>⚠️ Security Notice:</strong> For security reasons, it is recommended to delete the /install directory after successful installation. This prevents unauthorized access to the installation wizard.
            </div>

            <!-- Actions -->
            <div class="actions">
                <a href="../index.php" class="btn btn-primary">Go to Application</a>
                <a href="cleanup.php" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete the installation files? This action cannot be undone.')">Delete Install Files</a>
                <a href="?refresh=1" class="btn btn-secondary">Refresh Diagnostics</a>
            </div>

        <?php else: ?>
            <!-- Not Installed -->
            <div class="card">
                <h2>Installation Not Detected</h2>
                <p>The system does not appear to be installed. This could mean:</p>
                <ul style="margin: 1rem 0; padding-left: 2rem;">
                    <li>The installation was not completed successfully</li>
                    <li>The installation lock file was deleted</li>
                    <li>The system needs to be reinstalled</li>
                </ul>
                
                <div class="actions">
                    <a href="index.php" class="btn btn-primary">Run Installation Wizard</a>
                </div>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>