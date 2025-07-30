<?php
/**
 * AJAX Endpoint: Recent Tenders Widget
 * Returns HTML for recent tenders widget content
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
    // Get recent tenders
    $recentTenders = getRecentTenders(5);
    
    // Generate HTML
    ob_start();
    
    if (!empty($recentTenders)): ?>
        <div class="squidjob-tender-list">
            <?php foreach ($recentTenders as $tender): ?>
            <div class="squidjob-tender-item">
                <div class="squidjob-tender-info">
                    <h4 class="squidjob-tender-title">
                        <a href="/tenders/view.php?id=<?php echo $tender['id']; ?>">
                            <?php echo htmlspecialchars($tender['title']); ?>
                        </a>
                    </h4>
                    <p class="squidjob-tender-organization">
                        <?php echo htmlspecialchars($tender['organization']); ?>
                    </p>
                    <div class="squidjob-tender-meta">
                        <span class="squidjob-tender-value">
                            ₹<?php echo number_format($tender['estimated_value']); ?>
                        </span>
                        <span class="squidjob-tender-deadline" data-countdown="<?php echo $tender['submission_deadline']; ?>">
                            <?php echo date('M j, Y', strtotime($tender['submission_deadline'])); ?>
                        </span>
                    </div>
                </div>
                <div class="squidjob-tender-status">
                    <span class="squidjob-status squidjob-status-<?php echo getTenderStatusClass($tender['status']); ?>">
                        <span class="squidjob-status-dot"></span>
                        <?php echo htmlspecialchars($tender['status']); ?>
                    </span>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    <?php else: ?>
        <div class="squidjob-empty-state">
            <i class="fas fa-file-contract"></i>
            <p>No recent tenders found</p>
        </div>
    <?php endif;
    
    $html = ob_get_clean();
    
    // Return JSON response
    echo json_encode([
        'success' => true,
        'html' => $html,
        'count' => count($recentTenders),
        'timestamp' => date('c')
    ]);
    
} catch (Exception $e) {
    error_log("Recent tenders API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}

/**
 * Get recent tenders
 */
function getRecentTenders($limit = 5) {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            SELECT id, title, organization, estimated_value, submission_deadline, status 
            FROM tenders 
            ORDER BY created_at DESC 
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return [];
    }
}

/**
 * Get tender status CSS class
 */
function getTenderStatusClass($status) {
    $statusMap = [
        'active' => 'success',
        'pending' => 'warning',
        'closed' => 'error',
        'draft' => 'info'
    ];
    
    return $statusMap[strtolower($status)] ?? 'info';
}
?>