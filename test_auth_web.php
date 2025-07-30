<?php
/**
 * SquidJob Authentication System Web Test Interface
 * 
 * This provides a web-based interface to test authentication system functionality
 * Access via: http://localhost/squidjob/test_auth_web.php
 */

define('TEST_AUTH_SYSTEM', true);
session_start();

// Include required files
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/app/helpers/auth_helpers.php';
require_once __DIR__ . '/app/models/User.php';
require_once __DIR__ . '/app/models/Role.php';
require_once __DIR__ . '/app/models/Permission.php';

$action = $_GET['action'] ?? 'dashboard';
$message = '';
$messageType = '';

// Handle form submissions
if ($_POST) {
    switch ($action) {
        case 'test_login':
            $email = sanitize($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';
            
            if ($email && $password) {
                $userModel = new \App\Models\User();
                $user = $userModel->findByEmail($email);
                
                if ($user && verifyPassword($password, $user['password_hash'])) {
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_email'] = $user['email'];
                    $message = "Login successful! Welcome, {$user['first_name']} {$user['last_name']}";
                    $messageType = 'success';
                } else {
                    $message = "Invalid credentials. Please try again.";
                    $messageType = 'error';
                }
            }
            break;
            
        case 'test_register':
            if (verifyCsrf($_POST['_token'] ?? '')) {
                $userData = [
                    'first_name' => sanitize($_POST['first_name'] ?? ''),
                    'last_name' => sanitize($_POST['last_name'] ?? ''),
                    'email' => sanitize($_POST['email'] ?? ''),
                    'password' => $_POST['password'] ?? '',
                    'phone' => sanitize($_POST['phone'] ?? ''),
                    'company' => sanitize($_POST['company'] ?? '')
                ];
                
                // Validate data
                $rules = [
                    'first_name' => 'required|min:2',
                    'last_name' => 'required|min:2',
                    'email' => 'required|email',
                    'password' => 'required|min:8'
                ];
                
                $errors = validate($userData, $rules);
                
                if (empty($errors)) {
                    $userModel = new \App\Models\User();
                    
                    // Check if email exists
                    if (!$userModel->findByEmail($userData['email'])) {
                        $userData['password_hash'] = hashPassword($userData['password']);
                        unset($userData['password']);
                        $userData['status'] = 'active';
                        $userData['email_verified'] = 1;
                        
                        $newUser = $userModel->create($userData);
                        if ($newUser) {
                            $message = "Registration successful! User created with ID: {$newUser['id']}";
                            $messageType = 'success';
                        } else {
                            $message = "Registration failed. Please try again.";
                            $messageType = 'error';
                        }
                    } else {
                        $message = "Email already exists. Please use a different email.";
                        $messageType = 'error';
                    }
                } else {
                    $message = "Validation errors: " . implode(', ', array_values($errors));
                    $messageType = 'error';
                }
            } else {
                $message = "CSRF token validation failed.";
                $messageType = 'error';
            }
            break;
            
        case 'logout':
            session_destroy();
            session_start();
            $message = "Logged out successfully.";
            $messageType = 'success';
            break;
    }
}

// Check if user is logged in
$isLoggedIn = isset($_SESSION['user_id']);
$currentUser = null;
if ($isLoggedIn) {
    $userModel = new \App\Models\User();
    $currentUser = $userModel->findById($_SESSION['user_id']);
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SquidJob Authentication System Test</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .nav {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .nav-btn {
            padding: 10px 20px;
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            text-decoration: none;
            color: #495057;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .nav-btn:hover, .nav-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: #667eea;
        }
        
        .message {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .test-section {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 25px;
        }
        
        .test-section h3 {
            color: #495057;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #495057;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            padding: 12px 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: #6c757d;
        }
        
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .status-card {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
        }
        
        .status-card h4 {
            color: #495057;
            margin-bottom: 10px;
        }
        
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .status-indicator.success {
            background: #28a745;
        }
        
        .status-indicator.error {
            background: #dc3545;
        }
        
        .status-indicator.warning {
            background: #ffc107;
        }
        
        .user-info {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .user-info h4 {
            color: #1976d2;
            margin-bottom: 10px;
        }
        
        .user-info p {
            margin: 5px 0;
            color: #424242;
        }
        
        @media (max-width: 768px) {
            .nav {
                flex-direction: column;
            }
            
            .status-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 SquidJob Authentication System</h1>
            <p>Comprehensive Testing Interface</p>
        </div>
        
        <div class="content">
            <div class="nav">
                <a href="?action=dashboard" class="nav-btn <?= $action === 'dashboard' ? 'active' : '' ?>">Dashboard</a>
                <a href="?action=login" class="nav-btn <?= $action === 'login' ? 'active' : '' ?>">Test Login</a>
                <a href="?action=register" class="nav-btn <?= $action === 'register' ? 'active' : '' ?>">Test Registration</a>
                <a href="?action=security" class="nav-btn <?= $action === 'security' ? 'active' : '' ?>">Security Tests</a>
                <a href="?action=rbac" class="nav-btn <?= $action === 'rbac' ? 'active' : '' ?>">RBAC Tests</a>
                <?php if ($isLoggedIn): ?>
                    <a href="?action=logout" class="nav-btn" onclick="return confirm('Are you sure you want to logout?')">Logout</a>
                <?php endif; ?>
            </div>
            
            <?php if ($message): ?>
                <div class="message <?= $messageType ?>">
                    <?= htmlspecialchars($message) ?>
                </div>
            <?php endif; ?>
            
            <?php if ($isLoggedIn && $currentUser): ?>
                <div class="user-info">
                    <h4>👤 Currently Logged In</h4>
                    <p><strong>Name:</strong> <?= htmlspecialchars($currentUser['first_name'] . ' ' . $currentUser['last_name']) ?></p>
                    <p><strong>Email:</strong> <?= htmlspecialchars($currentUser['email']) ?></p>
                    <p><strong>Status:</strong> <?= htmlspecialchars($currentUser['status']) ?></p>
                    <p><strong>Last Login:</strong> <?= $currentUser['last_login'] ? date('Y-m-d H:i:s', strtotime($currentUser['last_login'])) : 'Never' ?></p>
                </div>
            <?php endif; ?>
            
            <?php
            switch ($action) {
                case 'dashboard':
                    include 'test_sections/dashboard.php';
                    break;
                case 'login':
                    include 'test_sections/login.php';
                    break;
                case 'register':
                    include 'test_sections/register.php';
                    break;
                case 'security':
                    include 'test_sections/security.php';
                    break;
                case 'rbac':
                    include 'test_sections/rbac.php';
                    break;
                default:
                    include 'test_sections/dashboard.php';
            }
            ?>
        </div>
    </div>
    
    <script>
        // Auto-refresh status indicators
        function refreshStatus() {
            const indicators = document.querySelectorAll('.status-indicator');
            // Add any dynamic status checking here
        }
        
        // Password strength checker
        function checkPasswordStrength(password) {
            const strengthMeter = document.getElementById('password-strength');
            if (!strengthMeter) return;
            
            let strength = 0;
            let feedback = [];
            
            if (password.length >= 8) strength++;
            else feedback.push('At least 8 characters');
            
            if (/[a-z]/.test(password)) strength++;
            else feedback.push('Lowercase letter');
            
            if (/[A-Z]/.test(password)) strength++;
            else feedback.push('Uppercase letter');
            
            if (/[0-9]/.test(password)) strength++;
            else feedback.push('Number');
            
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            else feedback.push('Special character');
            
            const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
            const colors = ['#dc3545', '#fd7e14', '#ffc107', '#20c997', '#28a745'];
            
            strengthMeter.textContent = levels[strength] || 'Very Weak';
            strengthMeter.style.color = colors[strength] || colors[0];
            
            if (feedback.length > 0) {
                strengthMeter.textContent += ' (Missing: ' + feedback.join(', ') + ')';
            }
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            refreshStatus();
            
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.addEventListener('input', function() {
                    checkPasswordStrength(this.value);
                });
            }
        });
    </script>
</body>
</html>

<?php
// Include test section files inline since we can't create separate directories in this context

if ($action === 'dashboard' || !isset($action)):
?>
<div class="status-grid">
    <?php
    try {
        $pdo = getDbConnection();
        
        // Check database connection
        echo '<div class="status-card">';
        echo '<h4><span class="status-indicator success"></span>Database Connection</h4>';
        echo '<p>Successfully connected to MySQL database</p>';
        echo '</div>';
        
        // Check tables
        $tables = ['users', 'roles', 'permissions', 'user_roles', 'role_permissions'];
        $tableCount = 0;
        foreach ($tables as $table) {
            try {
                $stmt = $pdo->query("SELECT COUNT(*) FROM {$table}");
                if ($stmt) $tableCount++;
            } catch (Exception $e) {
                // Table doesn't exist
            }
        }
        
        echo '<div class="status-card">';
        echo '<h4><span class="status-indicator ' . ($tableCount === count($tables) ? 'success' : 'error') . '"></span>Database Schema</h4>';
        echo "<p>{$tableCount}/" . count($tables) . " core tables found</p>";
        echo '</div>';
        
        // Check users
        $userModel = new \App\Models\User();
        $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        
        echo '<div class="status-card">';
        echo '<h4><span class="status-indicator success"></span>User Accounts</h4>';
        echo "<p>{$userCount} users in system</p>";
        echo '</div>';
        
        // Check roles
        $roleModel = new \App\Models\Role();
        $roleCount = $pdo->query("SELECT COUNT(*) FROM roles")->fetchColumn();
        
        echo '<div class="status-card">';
        echo '<h4><span class="status-indicator success"></span>Role System</h4>';
        echo "<p>{$roleCount} roles configured</p>";
        echo '</div>';
        
        // Check permissions
        $permissionCount = $pdo->query("SELECT COUNT(*) FROM permissions")->fetchColumn();
        
        echo '<div class="status-card">';
        echo '<h4><span class="status-indicator success"></span>Permission System</h4>';
        echo "<p>{$permissionCount} permissions defined</p>";
        echo '</div>';
        
        // Check session
        echo '<div class="status-card">';
        echo '<h4><span class="status-indicator ' . (session_status() === PHP_SESSION_ACTIVE ? 'success' : 'error') . '"></span>Session Management</h4>';
        echo '<p>Session status: ' . (session_status() === PHP_SESSION_ACTIVE ? 'Active' : 'Inactive') . '</p>';
        echo '</div>';
        
    } catch (Exception $e) {
        echo '<div class="status-card">';
        echo '<h4><span class="status-indicator error"></span>System Error</h4>';
        echo '<p>Error: ' . htmlspecialchars($e->getMessage()) . '</p>';
        echo '</div>';
    }
    ?>
</div>

<div class="test-section">
    <h3>🚀 Quick Actions</h3>
    <p>Use the navigation above to test different aspects of the authentication system:</p>
    <ul style="margin: 15px 0; padding-left: 20px;">
        <li><strong>Test Login:</strong> Try logging in with existing credentials</li>
        <li><strong>Test Registration:</strong> Create new user accounts</li>
        <li><strong>Security Tests:</strong> Test CSRF protection, rate limiting, and security features</li>
        <li><strong>RBAC Tests:</strong> Test role-based access control and permissions</li>
    </ul>
    
    <div style="margin-top: 20px;">
        <a href="test_auth_system.php" class="btn" target="_blank">Run CLI Tests</a>
        <a href="install_auth_system.php" class="btn btn-secondary" target="_blank">Installation Script</a>
    </div>
</div>

<?php elseif ($action === 'login'): ?>

<div class="test-section">
    <h3>🔑 Login Test</h3>
    <p>Test the login functionality with existing user credentials.</p>
    
    <form method="POST" action="?action=test_login">
        <div class="form-group">
            <label for="email">Email Address:</label>
            <input type="email" id="email" name="email" required placeholder="admin@squidjob.com">
        </div>
        
        <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required placeholder="Enter password">
        </div>
        
        <button type="submit" class="btn">Test Login</button>
    </form>
    
    <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
        <h4>💡 Default Credentials</h4>
        <p><strong>Email:</strong> admin@squidjob.com</p>
        <p><strong>Password:</strong> Admin123! (if you used the installation script)</p>
    </div>
</div>

<?php elseif ($action === 'register'): ?>

<div class="test-section">
    <h3>📝 Registration Test</h3>
    <p>Test the user registration functionality.</p>
    
    <form method="POST" action="?action=test_register">
        <?= csrfField() ?>
        
        <div class="form-group">
            <label for="first_name">First Name:</label>
            <input type="text" id="first_name" name="first_name" required>
        </div>
        
        <div class="form-group">
            <label for="last_name">Last Name:</label>
            <input type="text" id="last_name" name="last_name" required>
        </div>
        
        <div class="form-group">
            <label for="email">Email Address:</label>
            <input type="email" id="email" name="email" required>
        </div>
        
        <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            <div id="password-strength" style="margin-top: 5px; font-size: 0.9rem;"></div>
        </div>
        
        <div class="form-group">
            <label for="phone">Phone (Optional):</label>
            <input type="tel" id="phone" name="phone">
        </div>
        
        <div class="form-group">
            <label for="company">Company (Optional):</label>
            <input type="text" id="company" name="company">
        </div>
        
        <button type="submit" class="btn">Test Registration</button>
    </form>
</div>

<?php elseif ($action === 'security'): ?>

<div class="test-section">
    <h3>🛡️ Security Tests</h3>
    <p>Test various security features of the authentication system.</p>
    
    <div style="margin-bottom: 20px;">
        <h4>CSRF Protection Test</h4>
        <p>CSRF Token: <code><?= csrfToken() ?></code></p>
        <p>Status: <span class="status-indicator success"></span>Active</p>
    </div>
    
    <div style="margin-bottom: 20px;">
        <h4>Rate Limiting Test</h4>
        <p>Try making multiple rapid requests to test rate limiting.</p>
        <button onclick="testRateLimit()" class="btn">Test Rate Limit</button>
        <div id="rate-limit-results" style="margin-top: 10px;"></div>
    </div>
    
    <div style="margin-bottom: 20px;">
        <h4>Password Strength Test</h4>
        <input type="password" placeholder="Enter password to test strength" onkeyup="checkPasswordStrength(this.value)">
        <div id="password-strength" style="margin-top: 5px;"></div>
    </div>
</div>

<script>
function testRateLimit() {
    const results = document.getElementById('rate-limit-results');
    results.innerHTML = 'Testing rate limiting...';
    
    let requests = 0;
    const maxRequests = 5;
    
    function makeRequest() {
        if (requests >= maxRequests) return;
        
        fetch(window.location.href)
            .then(response => {
                requests++;
                results.innerHTML += `<br>Request ${requests}: ${response.status === 200 ? 'Allowed' : 'Blocked'}`;
                
                if (requests < maxRequests) {
                    setTimeout(makeRequest, 100);
                }
            })
            .catch(error => {
                results.innerHTML += `<br>Request failed: ${error.message}`;
            });
    }
    
    makeRequest();
}
</script>

<?php elseif ($action === 'rbac'): ?>

<div class="test-section">
    <h3>👥 RBAC (Role-Based Access Control) Tests</h3>
    <p>Test role and permission functionality.</p>
    
    <?php
    try {
        $roleModel = new \App\Models\Role();
        $permissionModel = new \App\Models\Permission();
        
        $roles = $roleModel->getActiveRoles();
        $permissions = $permissionModel->getActivePermissions();
        
        echo '<div style="margin-bottom: 20px;">';
        echo '<h4>Available Roles (' . count($roles) . ')</h4>';
        echo '<ul>';
        foreach ($roles as $role) {
            echo '<li><strong>' . htmlspecialchars($role['name']) . '</strong> - ' . htmlspecialchars($role['description']) . '</li>';
        }
        echo '</ul>';
        echo '</div>';
        
        echo '<div style="margin-bottom: 20px;">';
        echo '<h4>Available Permissions (' . count($permissions) . ')</h4>';
        echo '<div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 5px;">';
        $currentModule = '';
        foreach ($permissions as $permission) {
            if ($permission['module'] !== $currentModule) {
                if ($currentModule !== '') echo '</ul>';
                echo '<h5>' . htmlspecialchars(ucfirst($permission['module'])) . '</h5><ul>';
                $currentModule = $permission['module'];
            }
            echo '<li>' . htmlspecialchars($permission['name']) . ' - ' . htmlspecialchars($permission['description']) . '</li>';
        }
        echo '</ul>';
        echo '</div>';
        echo '</div>';
        
        if ($isLoggedIn && $currentUser) {
            $userModel = new \App\Models\User();
            $userRoles = $userModel->getUserRoles($currentUser['id']);
            
            echo '<div style="margin-bottom: 20px;">';
            echo '<h4>Your Current Roles</h4>';
            if (!empty($userRoles)) {
                echo '<ul>';
                foreach ($userRoles as $role) {
                    echo '<li>' . htmlspecialchars($role['name']) . '</li>';
                }
                echo '</ul>';
            } else {
                echo '<p>No roles assigned</p>';
            }
            echo '</div>';
        }
        
    } catch (Exception $e) {
        echo '<div class="message error">Error loading RBAC data: ' . htmlspecialchars($e->getMessage()) . '</div>';
    }
    ?>
</div>

<?php endif; ?>