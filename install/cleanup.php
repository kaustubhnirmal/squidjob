<?php
/**
 * SquidJob Installation Cleanup Script
 * 
 * This script safely removes the installation directory and files
 * after successful installation for security purposes.
 */

session_start();

// Check if system is installed
$lockFile = '../config/installed.lock';
if (!file_exists($lockFile)) {
    header('Location: index.php');
    exit();
}

$cleanupComplete = false;
$errors = [];
$success = [];

// Handle cleanup request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['confirm_cleanup'])) {
    $cleanupResult = performCleanup();
    $cleanupComplete = $cleanupResult['success'];
    $errors = $cleanupResult['errors'];
    $success = $cleanupResult['success_messages'];
}

/**
 * Perform the cleanup operation
 */
function performCleanup() {
    $errors = [];
    $success = [];
    $installDir = __DIR__;
    
    try {
        // List of files to remove
        $filesToRemove = [
            'index.php',
            'schema.sql',
            'installed.php',
            'cleanup.php'
        ];
        
        // Remove individual files
        foreach ($filesToRemove as $file) {
            $filePath = $installDir . '/' . $file;
            if (file_exists($filePath)) {
                if (unlink($filePath)) {
                    $success[] = "Removed file: $file";
                } else {
                    $errors[] = "Failed to remove file: $file";
                }
            }
        }
        
        // Try to remove the install directory
        if (empty($errors)) {
            if (rmdir($installDir)) {
                $success[] = "Successfully removed install directory";
                return [
                    'success' => true,
                    'errors' => $errors,
                    'success_messages' => $success
                ];
            } else {
                $errors[] = "Failed to remove install directory (may not be empty)";
            }
        }
        
        return [
            'success' => empty($errors),
            'errors' => $errors,
            'success_messages' => $success
        ];
        
    } catch (Exception $e) {
        $errors[] = "Cleanup failed: " . $e->getMessage();
        return [
            'success' => false,
            'errors' => $errors,
            'success_messages' => $success
        ];
    }
}

/**
 * Get directory size for display
 */
function getDirectorySize($dir) {
    $size = 0;
    if (is_dir($dir)) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        foreach ($files as $file) {
            $size += $file->getSize();
        }
    }
    return $size;
}

/**
 * Format bytes to human readable format
 */
function formatBytes($bytes, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    
    for ($i = 0; $bytes > 1024; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}

$installDirSize = getDirectorySize(__DIR__);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SquidJob - Installation Cleanup</title>
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
            max-width: 600px;
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

        .warning-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }

        .warning-box h3 {
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .success-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #166534;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }

        .error-box {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }

        .file-list {
            background: var(--light-gray);
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
        }

        .file-list ul {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .file-list li {
            padding: 0.25rem 0;
            color: var(--gray);
        }

        .file-list li:before {
            content: "📄";
            margin-right: 0.5rem;
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

        .btn-primary {
            background: var(--primary-purple);
            color: var(--white);
        }

        .btn-primary:hover {
            background: var(--secondary-purple);
            transform: translateY(-2px);
        }

        .actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--light-gray);
        }

        .info-item:last-child {
            border-bottom: none;
        }

        .message-list {
            list-style: none;
            margin: 1rem 0;
        }

        .message-list li {
            padding: 0.5rem 0;
        }

        .message-list li:before {
            content: "✓";
            color: var(--success);
            font-weight: bold;
            margin-right: 0.5rem;
        }

        .error-list li:before {
            content: "✗";
            color: var(--error);
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
            <p>Installation Cleanup</p>
        </div>

        <?php if ($cleanupComplete): ?>
            <!-- Cleanup Complete -->
            <div class="success-box">
                <h3>✅ Cleanup Complete!</h3>
                <p>The installation files have been successfully removed from your server.</p>
            </div>

            <?php if (!empty($success)): ?>
                <div class="card">
                    <h2>Cleanup Summary</h2>
                    <ul class="message-list">
                        <?php foreach ($success as $message): ?>
                            <li><?php echo htmlspecialchars($message); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>

            <div class="card">
                <h2>What's Next?</h2>
                <p>Your SquidJob installation is now secure and ready for production use. Here are some recommended next steps:</p>
                <ul style="margin: 1rem 0; padding-left: 2rem;">
                    <li>Login to your admin account</li>
                    <li>Configure system settings</li>
                    <li>Set up user accounts and permissions</li>
                    <li>Start managing your tenders</li>
                    <li>Configure email notifications</li>
                </ul>
            </div>

            <div class="actions">
                <a href="../index.php" class="btn btn-primary">Go to Application</a>
            </div>

        <?php elseif (!empty($errors)): ?>
            <!-- Cleanup Failed -->
            <div class="error-box">
                <h3>❌ Cleanup Failed</h3>
                <p>Some errors occurred during the cleanup process:</p>
                <ul class="message-list error-list">
                    <?php foreach ($errors as $error): ?>
                        <li><?php echo htmlspecialchars($error); ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>

            <?php if (!empty($success)): ?>
                <div class="success-box">
                    <h3>Partial Success</h3>
                    <ul class="message-list">
                        <?php foreach ($success as $message): ?>
                            <li><?php echo htmlspecialchars($message); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>

            <div class="card">
                <h2>Manual Cleanup Required</h2>
                <p>You may need to manually remove the remaining installation files using your file manager or FTP client. Please delete the following directory:</p>
                <div class="file-list">
                    <code>/install/</code>
                </div>
            </div>

            <div class="actions">
                <form method="POST" style="display: inline;">
                    <input type="hidden" name="confirm_cleanup" value="1">
                    <button type="submit" class="btn btn-danger">Retry Cleanup</button>
                </form>
                <a href="../index.php" class="btn btn-primary">Continue to Application</a>
            </div>

        <?php else: ?>
            <!-- Cleanup Confirmation -->
            <div class="warning-box">
                <h3>⚠️ Security Cleanup</h3>
                <p>For security reasons, it's important to remove the installation files after successful installation. This prevents unauthorized access to the installation wizard and protects your system from potential security vulnerabilities.</p>
            </div>

            <div class="card">
                <h2>Files to be Removed</h2>
                <p>The following installation files will be permanently deleted:</p>
                
                <div class="file-list">
                    <ul>
                        <li>index.php (Installation wizard)</li>
                        <li>schema.sql (Database schema)</li>
                        <li>installed.php (System status page)</li>
                        <li>cleanup.php (This cleanup script)</li>
                    </ul>
                </div>

                <div class="info-item">
                    <span><strong>Total Size:</strong></span>
                    <span><?php echo formatBytes($installDirSize); ?></span>
                </div>
            </div>

            <div class="warning-box">
                <h3>⚠️ Important Notice</h3>
                <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                    <li>This action cannot be undone</li>
                    <li>Make sure your installation is working correctly</li>
                    <li>You can always re-upload the installation files if needed</li>
                    <li>Your application data and configuration will not be affected</li>
                </ul>
            </div>

            <div class="actions">
                <form method="POST" onsubmit="return confirm('Are you sure you want to delete all installation files? This action cannot be undone.')">
                    <input type="hidden" name="confirm_cleanup" value="1">
                    <button type="submit" class="btn btn-danger">🗑️ Delete Installation Files</button>
                </form>
                <a href="installed.php" class="btn btn-secondary">← Back to System Status</a>
            </div>
        <?php endif; ?>
    </div>

    <script>
        // Auto-redirect after successful cleanup
        <?php if ($cleanupComplete && empty($errors)): ?>
            setTimeout(function() {
                if (confirm('Cleanup completed successfully! Would you like to go to the application now?')) {
                    window.location.href = '../index.php';
                }
            }, 3000);
        <?php endif; ?>
    </script>
</body>
</html>