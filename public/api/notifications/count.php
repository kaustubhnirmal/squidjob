<?php
/**
 * AJAX Endpoint: Notification Count
 * Returns unread notification count for current user
 */

session_start();

// Include required files
require_once '../../../app/core/Database.php';
require_once '../../../app/core/AuthMiddleware.php';

// Set JSON header
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// Check authentication
$auth = new App\Core\AuthMiddleware();
if (!$auth->isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Verify CSRF token
if (!isset($_SERVER['HTTP_X_CSRF_TOKEN']) || $_SERVER['HTTP_X_CSRF_TOKEN'] !== $_SESSION['csrf_token']) {
    http_response_code(403);
    echo json_encode(['error' => 'CSRF token mismatch']);
    exit;
}

try {
    $user = $auth->getCurrentUser();
    
    // Get notification count
    $count = getNotificationCount($user['id']);
    
    // Return JSON response
    echo json_encode([
        'success' => true,
        'count' => $count,
        'timestamp' => date('c')
    ]);
    
} catch (Exception $e) {
    error_log("Notification count API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}

/**
 * Get notification count for user
 */
function getNotificationCount($userId) {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn();
    } catch (Exception $e) {
        return 0;
    }
}
?>