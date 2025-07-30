<?php
/**
 * Test Login Handler
 * Quick test to verify login functionality
 */

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Generate CSRF token
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

echo "<!DOCTYPE html>";
echo "<html><head><title>Login Test</title></head><body>";
echo "<h1>Direct Login Test</h1>";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<h2>POST Request Received</h2>";
    echo "<pre>";
    print_r($_POST);
    echo "</pre>";
    
    // Test the login handler
    echo "<h2>Testing Login Handler...</h2>";
    
    // Capture output from login handler
    ob_start();
    
    // Set up $_POST data for the login handler
    $_POST['_token'] = $_POST['_token'];
    $_POST['email'] = $_POST['email'];
    $_POST['password'] = $_POST['password'];
    if (isset($_POST['remember'])) {
        $_POST['remember'] = $_POST['remember'];
    }
    
    // Set REQUEST_METHOD for the login handler
    $_SERVER['REQUEST_METHOD'] = 'POST';
    
    try {
        // Include the login handler directly
        include 'login_handler.php';
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage();
    }
    
    $result = ob_get_clean();
    
    echo "<h3>Login Handler Response:</h3>";
    echo "<pre>" . htmlspecialchars($result) . "</pre>";
    
} else {
    echo "<form method='POST'>";
    echo "<input type='hidden' name='_token' value='" . $_SESSION['csrf_token'] . "'>";
    echo "<p>Email: <input type='email' name='email' value='admin@squidjob.com' required></p>";
    echo "<p>Password: <input type='password' name='password' value='admin123' required></p>";
    echo "<p><label><input type='checkbox' name='remember'> Remember me</label></p>";
    echo "<p><button type='submit'>Test Login</button></p>";
    echo "</form>";
}

echo "</body></html>";