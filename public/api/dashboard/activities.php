<?php
/**
 * AJAX Endpoint: Recent Activities Widget
 * Returns HTML for recent activities widget content
 */

session_start();

// Include required files
require_once '../../../app/core/Database.php';
require_once '../../../app/core/AuthMiddleware.php';
require_once '../../../app/helpers/functions.php';

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
    
    // Get recent activities
    $recentActivities = getRecentActivities($user['id'], 10);
    
    // Generate HTML
    ob_start();
    
    if (!empty($recentActivities)): ?>
        <div class="squidjob-activity-timeline">
            <?php foreach ($recentActivities as $activity): ?>
            <div class="squidjob-activity-item">
                <div class="squidjob-activity-avatar">
                    <?php echo strtoupper(substr($activity['user_name'], 0, 1)); ?>
                </div>
                <div class="squidjob-activity-content">
                    <div class="squidjob-activity-text">
                        <strong><?php echo htmlspecialchars($activity['user_name']); ?></strong>
                        <?php echo htmlspecialchars($activity['description']); ?>
                    </div>
                    <div class="squidjob-activity-time">
                        <?php echo timeAgo($activity['created_at']); ?>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    <?php else: ?>
        <div class="squidjob-empty-state">
            <i class="fas fa-history"></i>
            <p>No recent activities</p>
        </div>
    <?php endif;
    
    $html = ob_get_clean();
    
    // Return JSON response
    echo json_encode([
        'success' => true,
        'html' => $html,
        'count' => count($recentActivities),
        'timestamp' => date('c')
    ]);
    
} catch (Exception $e) {
    error_log("Recent activities API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}

/**
 * Get recent activities
 */
function getRecentActivities($userId, $limit = 10) {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            SELECT a.*, u.first_name, u.last_name,
                   CONCAT(u.first_name, ' ', u.last_name) as user_name
            FROM activities a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return [];
    }
}

/**
 * Time ago helper function
 */
function timeAgo($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) return 'just now';
    if ($time < 3600) return floor($time/60) . ' minutes ago';
    if ($time < 86400) return floor($time/3600) . ' hours ago';
    if ($time < 2592000) return floor($time/86400) . ' days ago';
    if ($time < 31536000) return floor($time/2592000) . ' months ago';
    return floor($time/31536000) . ' years ago';
}
?>